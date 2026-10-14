type D1Database = {prepare(sql:string):{bind(...args:Array<string|number>):{first<T=Record<string,unknown>>():Promise<T|null>;run():Promise<unknown>}}};
interface Env { DB: D1Database; TURNSTILE_SECRET?: string; VOTE_COOKIE_SECRET?: string }
type Ctx = {request: Request; env: Env; params: {id?: string|string[]}};
const cookieName = 'ak_open_visitor';
function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
function cookieValue(request:Request){return (request.headers.get('cookie')??'').split('; ').find(c=>c.startsWith(cookieName+'='))?.slice(cookieName.length+1)??'';}
function bytes(input:string){return new TextEncoder().encode(input);}
async function hmac(key:string,message:string){
 const cryptoKey=await crypto.subtle.importKey('raw',bytes(key),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
 const result=await crypto.subtle.sign('HMAC',cryptoKey,bytes(message));
 return [...new Uint8Array(result)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function visitor(request:Request,secret:string){
 const c=cookieValue(request);const match=/^([0-9a-f-]{36})\.([0-9a-f]{64})$/.exec(c);
 if(!match)return null;
 // Constant-time verify using WebCrypto rather than JS string equality.
 const key=await crypto.subtle.importKey('raw',bytes(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const valid=await crypto.subtle.verify('HMAC',key,Uint8Array.from(match[2].match(/.{2}/g)!.map(x=>parseInt(x,16))),bytes(match[1]));
 return valid ? match[1] : null;
}
async function hashId(id:string,secret:string){return hmac(secret,`db:${id}`);}
async function verifyTurnstile(token:string,secret:string){
 const body=new FormData();body.set('secret',secret);body.set('response',token);
 const abort=AbortSignal.timeout(6000);
 const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body,signal:abort});
 if(!response.ok)return false;
 const data: {success?:boolean;hostname?:string;action?:string}=await response.json();
 // Production and Pages preview deployments may have different hostnames; originating request is checked separately.
 return data.success===true;
}
export const onRequest = async ({request,env,params}:Ctx):Promise<Response>=>{
 try{
  const raw=Array.isArray(params.id)?params.id[0]:params.id;
  const id=Number(raw);
  if(!raw||!/^\d+$/.test(raw)||!Number.isSafeInteger(id)||id<=0)return json({error:'Invalid repository ID'},400);
  const project=await env.DB.prepare('SELECT repo_id FROM published_projects WHERE repo_id=? AND active=1').bind(id).first();
  if(!project)return json({error:'Project not published'},404);
  const secret=env.VOTE_COOKIE_SECRET;
  const existing=secret?await visitor(request,secret):null;
  if(request.method==='GET'){
    const result=await env.DB.prepare('SELECT COUNT(*) AS count FROM project_votes WHERE repo_id=?').bind(id).first<{count:number}>();
    const mine=existing?await env.DB.prepare('SELECT 1 AS found FROM project_votes WHERE repo_id=? AND voter_hash=?').bind(id,await hashId(existing,secret!)).first():null;
    return json({count:result?.count??0,voted:!!mine});
  }
  if(request.method!=='POST'&&request.method!=='DELETE')return json({error:'Method not allowed'},405);
  // Cookie-authenticated mutations require CSRF origin validation.
  const origin=request.headers.get('origin');
  if(origin!==new URL(request.url).origin)return json({error:'Origin mismatch'},403);
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'Expected JSON'},415);
  if(!secret||!env.TURNSTILE_SECRET)return json({error:'Voting unavailable'},503);
  if(Number(request.headers.get('content-length')??'0')>4096)return json({error:'Request too large'},413);
  let payload:{token?:unknown};
  try{payload=await request.json();}catch{return json({error:'Invalid JSON'},400);}
  if(typeof payload.token!=='string'||!payload.token||payload.token.length>2048)return json({error:'Verification required'},400);
  const allowed=await verifyTurnstile(payload.token,env.TURNSTILE_SECRET);
  if(!allowed)return json({error:'Verification unsuccessful'},403);
  if(request.method==='DELETE' && !existing)return json({error:'Nothing to remove'},400);
  const idString=existing ?? crypto.randomUUID();
  const voterHash=await hashId(idString,secret);
  if(request.method==='POST'){
    await env.DB.prepare('INSERT OR IGNORE INTO project_votes (repo_id,voter_hash) VALUES (?,?)').bind(id,voterHash).run();
  }else{
    await env.DB.prepare('DELETE FROM project_votes WHERE repo_id=? AND voter_hash=?').bind(id,voterHash).run();
  }
  const rec=await env.DB.prepare('SELECT COUNT(*) AS count FROM project_votes WHERE repo_id=?').bind(id).first<{count:number}>();
  const response=json({count:rec?.count??0,voted:request.method==='POST'});
  if(!existing){response.headers.append('Set-Cookie',`${cookieName}=${idString}.${await hmac(secret,idString)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=15552000`);}
  return response;
 }catch(e){console.error('Voting API failure',e instanceof Error?e.message:'unknown');return json({error:'Temporarily unavailable'},503);}
};
