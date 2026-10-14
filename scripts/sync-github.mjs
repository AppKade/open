import fs from 'node:fs/promises';
import {aggregateContributions} from '../src/lib/scoring.mjs';
const projects=JSON.parse(await fs.readFile('data/projects.json','utf8'));
const optouts=JSON.parse(await fs.readFile('data/contributor-optouts.json','utf8'));
const token=process.env.GITHUB_TOKEN;
async function get(url){
  const r=await fetch(url,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(token?{Authorization:`Bearer ${token}`}:{})}});
  if(!r.ok) throw new Error(`GitHub API ${r.status} for ${url}`);
  return await r.json();
}
const prs=[];
for(const project of projects){
  if(!/^AppKade\/[a-zA-Z0-9._-]+$/.test(project.repo)||!Number.isSafeInteger(project.repoId))throw new Error(`Invalid curated repository ${project.repo}`);
  const repo=await get(`https://api.github.com/repos/${project.repo}`);
  if(repo.id!==project.repoId || repo.private || repo.owner.login.toLowerCase()!=='appkade')throw new Error(`Repository not eligible: ${project.repo}`);
  // Keep paginating rather than silently truncating all-time rankings.
  for(let page=1;page<=100;page++){
    const batch=await get(`https://api.github.com/repos/${project.repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`);
    for(const p of batch){
      if(!p.merged_at || !p.user)continue;
      prs.push({repoId:repo.id,repo:project.repo,number:p.number,githubId:p.user.id,login:p.user.login,avatarUrl:p.user.avatar_url,url:p.html_url,title:p.title,mergedAt:p.merged_at,labels:p.labels,isBot:p.user.type==='Bot'||p.user.login.endsWith('[bot]')});
    }
    if(batch.length<100)break;
    if(page===100)throw new Error('GitHub PR history exceeds configured page safety limit; refusing incomplete all-time ranking');
  }
}
const contributors=aggregateContributions(prs,optouts);
const activity=prs.filter(p=>!p.isBot&&!optouts.includes(p.githubId))
  .sort((a,b)=>b.mergedAt.localeCompare(a.mergedAt))
  .slice(0,10).map(p=>({login:p.login,repo:p.repo,title:p.title,url:p.url,mergedAt:p.mergedAt}));
await fs.writeFile('data/contributors.json',JSON.stringify(contributors,null,2)+'\n');
await fs.writeFile('data/activity.json',JSON.stringify({generatedAt:new Date().toISOString(),syncStatus:'ok',items:activity},null,2)+'\n');
console.log(`Synced ${projects.length} projects, ${prs.length} merged PRs, ${contributors.length} contributors`);
