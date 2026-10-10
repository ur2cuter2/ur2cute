import {grade, gradePassage} from './grader.js';
import {advanceQueue} from './review.js';
export const passagesFor=(master,half)=>master.passages.filter(p=>p.half===half).sort((a,b)=>a.order-b.order);
export function nextRange(history, chapterId, {excludeSamples=false}={}) {
  const done=history.filter(s=>s.chapterId===chapterId && s.status==='completed' && (!excludeSamples||!s.contentVersion.startsWith('sample-')));
  let round=1;
  while(done.some(s=>s.round===round&&s.half==='first') && done.some(s=>s.round===round&&s.half==='second')) round++;
  return {round, half:done.some(s=>s.round===round&&s.half==='first')?'second':'first'};
}
export function createSession(master, range, id=crypto.randomUUID(), now=new Date().toISOString()) {
  return {id,chapterId:master.chapterId,chapterName:master.chapterName,contentVersion:master.contentVersion,...range,status:'active',phase:'passage',startedAt:now,endedAt:null,position:0,inputs:{},initialResults:[],reviewTargets:[],reviewQueue:[],reviewAttempts:[],feedback:null};
}
export function score(session, master) {
  if(session.status!=='active'||session.feedback) throw new Error('採点済みの回答は変更できません');
  const s=structuredClone(session);
  if(s.phase==='passage') {
    const p=passagesFor(master,s.half)[s.position];
    s.feedback={results:gradePassage(master,p,s.inputs)};
    s.initialResults.push(...s.feedback.results);
    for(const r of s.feedback.results) if(!r.correct) {s.reviewTargets.push(r.sourceId);s.reviewQueue.push(r.sourceId);}
  } else if(s.phase==='review') {
    const sourceId=s.reviewQueue[0];
    const result={sourceId,...grade(master.sourceQuestions.find(q=>q.id===sourceId),s.inputs.review)};
    s.feedback={results:[result]};s.reviewAttempts.push({...result,at:new Date().toISOString()});
    s.reviewQueue=advanceQueue(s.reviewQueue,result.correct);
  } else throw new Error('不正な状態です');
  return s;
}
export function next(session, master, now=new Date().toISOString()) {
  if(!session.feedback) throw new Error('先に採点してください');
  const s=structuredClone(session);s.feedback=null;s.inputs={};
  if(s.phase==='passage') {
    s.position++;
    if(s.position>=passagesFor(master,s.half).length) s.phase='review';
  }
  if(s.phase==='review'&&!s.reviewQueue.length) {s.phase='complete';s.status='completed';s.endedAt=now;}
  return s;
}
export function interrupt(session,reason,now=new Date().toISOString()) {
  return {...structuredClone(session),status:'interrupted',endedAt:now,interruptionReason:reason};
}
