import {validateAuthoring} from './authoring-validator.js';
const fail=message=>{throw new Error(message)};
const nonempty=v=>typeof v==='string'&&v.trim().length>0;
const unique=(values,label)=>{if(new Set(values).size!==values.length) fail(`${label}が重複しています`)};
export function validateChapter(m,{reviewOnly=false}={}) {
  const report=validateAuthoring(m);
  if(report.structuralStatus==='FAIL'&&(!reviewOnly||report.runtimeStructureStatus==='FAIL')) {
    const error=new Error(report.findings.filter(f=>f.severity==='ERROR').map(f=>`${f.code} ${f.location}: ${f.message}`).join('\n'));
    error.report=report;throw error;
  }
  return m;
}
export function validateCatalog(c) {
  if(!c||c.schemaVersion!=='1.0'||!Array.isArray(c.chapters)||!c.chapters.length) fail('章一覧が不正です');
  unique(c.chapters.map(x=>x.chapterId),'章ID');
  for(const x of c.chapters) if(!nonempty(x.chapterId)||!nonempty(x.chapterName)||!nonempty(x.contentVersion)||typeof x.path!=='string'||!/^data\/[a-zA-Z0-9_-]+\.json$/.test(x.path)||x.reviewOnly!==undefined&&typeof x.reviewOnly!=='boolean'||x.approvalStatus!==undefined&&!['APPROVAL_PENDING','APPROVED'].includes(x.approvalStatus)) fail('章情報が不正です');
  return c;
}
export function validateSession(s) {
  if(!s||!nonempty(s.id)||!nonempty(s.chapterId)||!nonempty(s.chapterName)||!nonempty(s.contentVersion)||!['first','second'].includes(s.half)||!Number.isInteger(s.round)||s.round<1||!['active','completed','interrupted'].includes(s.status)||!['passage','review','complete'].includes(s.phase)||!Number.isInteger(s.position)||s.position<0||!nonempty(s.startedAt)||!Number.isFinite(Date.parse(s.startedAt))||!(s.endedAt===null||(nonempty(s.endedAt)&&Number.isFinite(Date.parse(s.endedAt))))||!s.inputs||typeof s.inputs!=='object'||Array.isArray(s.inputs)||!Object.values(s.inputs).every(v=>typeof v==='string')) fail('履歴の基本構造が不正です');
  for(const key of ['initialResults','reviewAttempts']) if(!Array.isArray(s[key])||!s[key].every(r=>r&&nonempty(r.sourceId)&&typeof r.answer==='string'&&typeof r.correct==='boolean')) fail('採点履歴が不正です');
  for(const key of ['reviewTargets','reviewQueue']) {if(!Array.isArray(s[key])||!s[key].every(nonempty)) fail('復習履歴が不正です');unique(s[key],key);}
  unique(s.initialResults.map(r=>r.sourceId),'初回採点');
  if(s.reviewTargets.some(id=>!s.initialResults.some(r=>r.sourceId===id&&!r.correct))||s.initialResults.filter(r=>!r.correct).some(r=>!s.reviewTargets.includes(r.sourceId))||s.reviewQueue.some(id=>!s.reviewTargets.includes(id))) fail('復習対象が不整合です');
  if(s.status==='completed'&&(s.phase!=='complete'||s.reviewQueue.length||!s.endedAt)||s.status==='active'&&(s.phase==='complete'||s.endedAt!==null)||s.status==='interrupted'&&!s.endedAt) fail('履歴状態が不整合です');
  if(s.feedback!==null&&(!s.feedback||!Array.isArray(s.feedback.results)||!s.feedback.results.length||!s.feedback.results.every(r=>nonempty(r.sourceId)&&typeof r.answer==='string'&&typeof r.correct==='boolean'))) fail('採点結果が不正です');
  return s;
}
export function validateBackup(b) {
  if(!b||b.schemaVersion!=='1.0'||!Array.isArray(b.sessions)||!nonempty(b.exportedAt)||!Number.isFinite(Date.parse(b.exportedAt))) fail('履歴ファイルの形式が不正です');
  b.sessions.forEach(validateSession);unique(b.sessions.map(s=>s.id),'セッションID');
  const active=b.sessions.filter(s=>s.status==='active');unique(active.map(s=>s.chapterId),'途中セッションの章');return b;
}
export function validateSessionForMaster(s,m) {
  validateSession(s);
  if(s.chapterId!==m.chapterId||s.contentVersion!==m.contentVersion) fail('履歴と教材の版が一致しません');
  const passages=m.passages.filter(p=>p.half===s.half).sort((a,b)=>a.order-b.order);
  const sourceIds=new Set(passages.flatMap(p=>p.blanks.map(b=>b.sourceId)));
  if(s.initialResults.some(r=>!sourceIds.has(r.sourceId))||s.reviewAttempts.some(r=>!sourceIds.has(r.sourceId))) fail('履歴の設問が教材にありません');
  if(s.phase==='passage'&&s.position>=passages.length||s.phase!=='passage'&&s.position!==passages.length) fail('履歴の現在位置が不正です');
  const expected=passages.slice(0,s.phase==='passage'?s.position+(s.feedback?1:0):passages.length).flatMap(p=>p.blanks.map(b=>b.sourceId));
  if(expected.length!==s.initialResults.length||expected.some((id,i)=>s.initialResults[i].sourceId!==id)) fail('履歴の初回採点と進捗が一致しません');
  if(s.phase==='review'&&!s.feedback&&!s.reviewQueue.length) fail('復習対象がありません');
  return s;
}
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export function mergeSessions(existing,incoming,mode) {
  if(!['merge','overwrite'].includes(mode)) fail('取込方式が不正です');
  incoming.forEach(validateSession);unique(incoming.map(s=>s.id),'セッションID');
  const map=new Map((mode==='overwrite'?[]:existing).map(s=>[s.id,s]));
  for(const s of incoming) {if(map.has(s.id)&&JSON.stringify(canonical(map.get(s.id)))!==JSON.stringify(canonical(s))) fail(`セッションID ${s.id} の内容が異なるため、統合を中止しました`);map.set(s.id,s);}
  const result=[...map.values()];unique(result.filter(s=>s.status==='active').map(s=>s.chapterId),'途中セッションの章');return result;
}
