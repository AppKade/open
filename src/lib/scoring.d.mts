import type {Contributor} from './data';
export const WEIGHTS:Readonly<Record<string,number>>;
export function category(labels?:Array<string|{name:string}>):string;
export function aggregateContributions(prs:Array<{repoId:number;repo:string;number:number;githubId:number;login:string;avatarUrl:string;mergedAt:string;url:string;title:string;labels:Array<string|{name:string}>;isBot?:boolean}>,optouts?:number[]):Contributor[];
export function newcomerContributors(contributors:Contributor[],now?:Date):Contributor[];
