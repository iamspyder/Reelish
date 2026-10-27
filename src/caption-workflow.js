(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ReelishCaptionWorkflow=api;})(globalThis,function(){
 function applyStyle(project,style,scope='all',selectedId){
  const cues=project.cues.map(c=>({...c})),next={...project,cues};
  if(scope==='selected'){
   const selected=cues.find(c=>c.id===selectedId);if(!selected)throw Error('Select a caption line first. No caption style was changed.');
   selected.style=JSON.parse(JSON.stringify(style));return {project:next,count:1,empty:false};
  }
  next.style=JSON.parse(JSON.stringify(style));for(const c of cues)delete c.style;
  return {project:next,count:cues.length,empty:cues.length===0};
 }
 function previewTime(cues,time,timedWords){
  if(!cues.length)return time;
  const current=cues.find(c=>time>=c.start&&time<c.end);
  const cue=current||cues.reduce((best,c)=>Math.min(Math.abs(c.start-time),Math.abs(c.end-time))<Math.min(Math.abs(best.start-time),Math.abs(best.end-time))?c:best,cues[0]);
  const words=timedWords(cue),active=words.find(w=>time>=w.start&&time<w.end);
  if(current&&active&&time-cue.start>.12&&time-active.start>.02)return time;
  const word=active||words.find(w=>w.start>=time)||words[0];return word?word.start+Math.min(.15,(word.end-word.start)/2):cue.start+(cue.end-cue.start)/2;
 }
 return {applyStyle,previewTime};
});
