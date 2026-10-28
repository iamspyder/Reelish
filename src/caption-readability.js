(()=>{
 const button=document.createElement('button');button.id='readableCaptions';button.textContent='Fix fast captions · readable phrases';button.style.width='100%';
 $('captionList').before(button);
 const timing=document.createElement('p');timing.id='captionTimingNotice';timing.className='statusnote';timing.textContent='AI-estimated timing · review by playing the clip. Double-click a word to adjust its time.';button.after(timing);
 const priorRender=renderCaptions;renderCaptions=function(){priorRender();timing.classList.toggle('hidden',!p.cues.some(c=>c.timingSource==='ai-estimated'));};renderCaptions();
 function regroup(){
  if(!p.cues.length)return toast('Add captions first');
  const before=p.cues.length;update(()=>{
   p.cues=CliporaCaptions.regroupCues(p.cues,{maxWords:6,minDuration:1.2,maxDuration:3.5,pauseGap:.65}).map(c=>({...c,id:crypto.randomUUID(),...(c.style?{style:{...c.style,captionPacing:'readable',wordsPerLine:4,lines:2}}:{})}));
   p.style={...p.style,captionPacing:'readable',wordsPerLine:4,lines:2};selectedCue=p.cues[0]?.id||null;
  });
  if(!playing)seek(ReelishCaptionWorkflow.previewTime(p.cues,playTime,CliporaCaptions.timedWords));
  toast(before+' fragments → '+p.cues.length+' readable phrases. Speech timing kept; Undo restores the old grouping.');
 }
 button.onclick=regroup;$('rebalance').onclick=regroup;
 const prior=$('captionPacing').onchange;$('captionPacing').onchange=e=>{const value=e.target.value;prior?.(e);if(value==='readable'&&p.cues.length)regroup();else updatePreview();};
})();
