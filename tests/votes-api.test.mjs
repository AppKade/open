import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const source=readFileSync(new URL('../functions/api/votes/[id].ts',import.meta.url),'utf8');
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText).toString('base64'));

test('voting validates bounded JSON and binds challenges to the deployment and action', async () => {
  let writes=0, verification={success:true,hostname:'open.example',action:'vote'};
  const env={VOTE_COOKIE_SECRET:'test-cookie-secret',TURNSTILE_SECRET:'test-turnstile-secret',DB:{prepare(sql){return {bind(){return {
    async first(){return sql.includes('published_projects')?{repo_id:1}:sql.includes('COUNT')?{count:writes}:sql.includes('SELECT 1')?{found:1}:null;},
    async run(){writes++;}
  };}};}}};
  const request=(body,headers={}) => new Request('https://open.example/api/votes/1',{method:'POST',headers:{origin:'https://open.example','content-type':'application/json',...headers},body});
  const call=(body,headers) => onRequest({request:request(body,headers),env,params:{id:'1'}});
  const saved=globalThis.fetch;
  let verifies=0;
  globalThis.fetch=async()=>{verifies++;return Response.json(verification);};
  try {
    for(const body of ['null','[]','"token"','{','{}','{"token":3}']) assert.equal((await call(body)).status,400);
    assert.equal(verifies,0);
    assert.equal((await call(JSON.stringify({token:'ok',padding:'x'.repeat(5000)}))).status,413,'enforces cap without Content-Length');
    const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('x'.repeat(5000)));controller.close();}});
    const streamed=new Request('https://open.example/api/votes/1',{method:'POST',headers:{origin:'https://open.example','content-type':'application/json'},body:stream,duplex:'half'});
    assert.equal((await onRequest({request:streamed,env,params:{id:'1'}})).status,413);
    assert.equal((await call('{"token":"ok"}',{origin:'https://other.example'})).status,403);
    verification={success:true,hostname:'other.example',action:'vote'};
    assert.equal((await call('{"token":"ok"}')).status,403);
    verification={success:true,hostname:'open.example',action:'login'};
    assert.equal((await call('{"token":"ok"}')).status,403);
    assert.equal(writes,0);
    verification={success:true,hostname:'open.example',action:'vote'};
    const accepted=await call('{"token":"ok"}');
    assert.equal(accepted.status,200);
    assert.equal(writes,1);
    assert.match(accepted.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
    const cookie=accepted.headers.get('set-cookie').split(';')[0];
    const get=async cookie=>await (await onRequest({request:new Request('https://open.example/api/votes/1',{headers:{cookie}}),env,params:{id:'1'}})).json();
    assert.equal((await get('other=1;'+cookie)).voted,true,'signed cookie works without whitespace after the separator');
    assert.equal((await get(cookie.replace(/.$/,'x'))).voted,false,'forged visitor cookie is ignored');
  } finally {globalThis.fetch=saved;}
});
