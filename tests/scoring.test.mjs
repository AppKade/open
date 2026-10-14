import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateContributions,category,newcomerContributors} from '../src/lib/scoring.mjs';
test('verified scoring: deduplicated, categories, first PR bonus, opt-out and bots',()=>{
 const base={repoId:100,repo:'AppKade/tool',githubId:10,login:'alice',avatarUrl:'',mergedAt:'2026-10-10T10:00:00Z',url:'https://github.com/AppKade/tool/pull/1'};
 const prs=[{...base,number:1,title:'Docs',labels:['type:docs']},{...base,number:1,title:'Duplicate',labels:[]},{...base,number:2,title:'Fix',mergedAt:'2026-10-11T10:00:00Z',labels:['type:fix']},{...base,number:3,githubId:13,login:'evil',isBot:true,title:'spam',labels:[]},{...base,number:4,githubId:12,login:'skip',title:'skip',labels:[]}];
 const people=aggregateContributions(prs,[12]);
 assert.equal(people.length,1);
 assert.equal(people[0].points,5+5+8);
 assert.equal(people[0].prs.length,2);
 assert.equal(category([{name:'type:feature'}]),'feature');
 assert.equal(newcomerContributors(people,new Date('2026-10-14')).length,1);
});
