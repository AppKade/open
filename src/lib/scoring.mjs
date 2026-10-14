export const WEIGHTS = Object.freeze({feature:10, fix:8, docs:5, test:5, other:3});
export function category(labels = []) {
  const names = labels.map(x => (typeof x === 'string' ? x : x.name).toLowerCase());
  for(const [name, value] of [['type:feature','feature'],['type:fix','fix'],['type:docs','docs'],['type:test','test']]) {
    if(names.includes(name)) return value;
  }
  return 'other';
}
export function aggregateContributions(prs, optouts = []) {
  const skip = new Set(optouts.map(Number));
  const unique = new Map();
  for(const p of prs){
    if(!p.mergedAt || !Number.isSafeInteger(p.repoId) || !Number.isSafeInteger(p.githubId) ||
       !p.login || skip.has(p.githubId) || p.isBot) continue;
    const key = `${p.repoId}:${p.number}`;
    if(!unique.has(key)) unique.set(key,p);
  }
  const ordered = [...unique.values()].sort((a,b)=>a.mergedAt.localeCompare(b.mergedAt)||a.number-b.number);
  const people = new Map();
  for(const p of ordered){
    const type = category(p.labels);
    const first = !people.has(p.githubId);
    const points = WEIGHTS[type] + (first ? 5 : 0);
    const c = people.get(p.githubId) ?? {githubId:p.githubId,login:p.login,avatarUrl:p.avatarUrl ?? '',points:0,monthlyPoints:0,firstMergedAt:p.mergedAt,prs:[]};
    c.login=p.login; c.avatarUrl=p.avatarUrl ?? c.avatarUrl;
    c.points += points;
    // Snapshots update from real GitHub merge timestamps, never the publication date.
    const month = new Date().toISOString().slice(0,7);
    if(p.mergedAt.slice(0,7)===month) c.monthlyPoints+=points;
    c.prs.push({repoId:p.repoId, repo:p.repo,number:p.number,url:p.url,title:p.title,category:type,points,mergedAt:p.mergedAt});
    people.set(p.githubId,c);
  }
  return [...people.values()].map(c=>({...c,badges:[
    'First Contributor',...(c.prs.length>=3?['Active Builder']:[]),...(c.prs.length>=10?['Core Contributor']:[])
  ]})).sort((a,b)=>b.points-a.points||a.login.localeCompare(b.login));
}
export function newcomerContributors(contributors, now = new Date()) {
  const cutoff = new Date(now.getTime() - 30*24*60*60*1000).toISOString();
  return contributors.filter(c=>c.firstMergedAt>=cutoff);
}
