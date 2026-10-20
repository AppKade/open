import registry from '../../data/projects.json';
import people from '../../data/contributors.json';
import activitySnapshot from '../../data/activity.json';
import statsSnapshot from '../../data/project-stats.json';

export interface Project {
  repoId:number; repo:string; slug:string; name:string; description:string;
  category:string; status:'planned'|'experimental'|'active'|'archived'; featured:boolean;
  homepage:string; installation:string; language:string; tags:string[]; license:string;
}
export interface Contribution {repoId:number;repo:string;number:number;url:string;title:string;category:string;points:number;mergedAt:string}
export interface Contributor {githubId:number;login:string;avatarUrl:string;points:number;monthlyPoints:number;firstMergedAt:string;badges:string[];prs:Contribution[]}
export interface ProjectStats {stars:number;forks:number;contributors:number;mergedPrs:number;pushedAt:string}
export interface Activity {login:string;repo:string;title:string;url:string;mergedAt:string}
export const projects:Project[] = registry as Project[];
export const contributors:Contributor[] = people as Contributor[];
export const activity:{generatedAt:string|null;syncStatus:string;items:Activity[]} = activitySnapshot as {generatedAt:string|null;syncStatus:string;items:Activity[]};
export const projectStats:{generatedAt:string|null;projects:Record<string,ProjectStats>} = statsSnapshot as {generatedAt:string|null;projects:Record<string,ProjectStats>};
