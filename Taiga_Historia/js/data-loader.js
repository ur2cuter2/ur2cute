import {validateCatalog,validateChapter} from './validation.js';
import {getMasters,installMasters} from './storage.js';
import {parseStrictJSON} from './strict-json.js';
export function normalizeCachedMaster(master){
 if(!master?.contentVersion?.startsWith('sample-')||!Array.isArray(master.passages))return {master,changes:[]};
 const sorted=[...master.passages].sort((a,b)=>a.order-b.order);
 if(!sorted.every((p,i)=>p.order===i+1)||new Set(sorted.map(p=>p.order)).size!==sorted.length)return {master,changes:[]};
 const converted=structuredClone(master),changes=[];
 for(const half of ['first','second'])converted.passages.filter(p=>p.half===half).sort((a,b)=>a.order-b.order).forEach((p,i)=>{if(p.order!==i+1){changes.push({passageId:p.id,field:'order',before:p.order,after:i+1,reason:'legacy sample global order to per-half'});p.order=i+1;}});
 return {master:changes.length?converted:master,changes};
}
export async function fetchJSON(path){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);try{const r=await fetch(path,{cache:'no-store',signal:controller.signal});if(!r.ok) throw new Error(`教材の取得に失敗しました (${r.status})`);const parsed=parseStrictJSON(new TextDecoder('utf-8',{fatal:true}).decode(await r.arrayBuffer()));if(parsed.duplicates.length)throw new Error(`V1_JSON_PARSE: JSONキー重複 (${parsed.duplicates[0].location})`);return parsed.value;}finally{clearTimeout(timer);}}
export async function loadMasters(io={fetchJSON,getMasters,installMasters}) {
  try {
    const catalog=validateCatalog(await io.fetchJSON('data/chapters.json'));const masters={};
    const list=await Promise.all(catalog.chapters.map(async c=>{const m=validateChapter(await io.fetchJSON(c.path),{reviewOnly:c.reviewOnly===true});if(m.chapterId!==c.chapterId||m.chapterName!==c.chapterName||m.contentVersion!==c.contentVersion) throw new Error('章一覧と教材の版が一致しません');return m;}));
    list.forEach(m=>{masters[m.chapterId]=m;});const bundle={catalog,masters};await io.installMasters(bundle);return {...bundle,offline:false};
  } catch(error) {
    const existing=await io.getMasters();if(!existing) throw error;const cached=structuredClone(existing),migrations=[];for(const [id,master] of Object.entries(cached.masters)){const converted=normalizeCachedMaster(master);cached.masters[id]=converted.master;migrations.push(...converted.changes);}
    validateCatalog(cached.catalog);for(const c of cached.catalog.chapters){const m=validateChapter(cached.masters[c.chapterId],{reviewOnly:c.reviewOnly===true});if(m.contentVersion!==c.contentVersion||m.chapterId!==c.chapterId||m.chapterName!==c.chapterName) throw error;}
    return {...cached,offline:true,warning:error.message,migrations};
  }
}
