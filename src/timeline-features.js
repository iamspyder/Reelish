(()=>{
 let words=false,wordDrag=null;
 const tools=document.createElement('div');tools.className='feature-actions';tools.innerHTML='<button id="captionLinesMode" class="active">Lines</button><button id="captionWordsMode">Words</button><button id="shiftCaptionTimes">Shift captions</button><button id="mirrorVideo">Mirror clip</button><button id="rotateVideo">Rotate clip</button>';
 document.querySelector('.timelineheading').after(tools);
 const baseTimeline=renderTimeline;renderTimeline=function(){baseTimeline();if(!words)return;const duration=length()||1;$('captionTrack').innerHTML=p.cues.flatMap(c=>CliporaCaptions.timedWords(c).map((w,i)=>`<div class="captionblock word-timeline" data-word-cue="${esc(c.id)}" data-word-index="${i}" style="left:${w.start/duration*100}%;width:${Math.max(.15,(w.end-w.start)/duration*100)}%" title="${esc(w.text)} · drag to retime, drag right edge to resize">${esc(w.text)}</div>`)).join('');};
 function mode(value){words=value;$('captionWordsMode').classList.toggle('active',words);$('captionLinesMode').classList.toggle('active',!words);renderTimeline();}
 $('captionWordsMode').onclick=()=>mode(true);$('captionLinesMode').onclick=()=>mode(false);
 $('shiftCaptionTimes').onclick=()=>{modal('<h2>Shift all caption timing</h2><label>Seconds (negative = earlier)<input id="captionShiftSeconds" type="number" step=".01" value="0"></label><div class="actions"><button id="shiftCancel">Cancel</button><button id="shiftApply" class="primary">Apply</button></div>');$('shiftCancel').onclick=closeModal;$('shiftApply').onclick=()=>{const delta=Number($('captionShiftSeconds').value),duration=length();if(!Number.isFinite(delta))return;update(()=>{p.cues=p.cues.map(c=>({...c,start:Math.max(0,c.start+delta),end:Math.min(duration,c.end+delta),...(c.words?{words:c.words.map(w=>({...w,start:Math.max(0,w.start+delta),end:Math.min(duration,w.end+delta)})).filter(w=>w.end>w.start)}:{})})).filter(c=>c.end>c.start);});closeModal();};};
 $('mirrorVideo').onclick=()=>{const c=p.clips[selectedClip];if(c)update(()=>c.flipX=!c.flipX);};
 $('rotateVideo').onclick=()=>{const c=p.clips[selectedClip];if(c)update(()=>c.rotation=((c.rotation||0)+90)%360);};
 const track=$('captionTrack'),oldDown=track.onpointerdown,oldMove=track.onpointermove,oldUp=track.onpointerup;
 track.onpointerdown=e=>{
  if(!words)return oldDown(e);const el=e.target.closest('[data-word-cue]');if(!el)return;
  const cue=p.cues.find(c=>c.id===el.dataset.wordCue),index=Number(el.dataset.wordIndex),original=clone(p),timed=CliporaCaptions.timedWords(cue);cue.words=timed;
  wordDrag={cue,index,original,start:timed[index].start,end:timed[index].end,x:e.clientX,width:$('tracks').clientWidth,resize:e.clientX>el.getBoundingClientRect().right-8,el};el.setPointerCapture(e.pointerId);e.preventDefault();
 };
 track.onpointermove=e=>{
  if(!words)return oldMove(e);if(!wordDrag)return;const d=wordDrag,w=d.cue.words[d.index],delta=(e.clientX-d.x)/d.width*length(),min=d.index?d.cue.words[d.index-1].end:d.cue.start,max=d.cue.words[d.index+1]?.start??d.cue.end;
  if(d.resize)w.end=Math.max(w.start+.02,Math.min(max,d.end+delta));else{w.start=Math.max(min,Math.min(max-(d.end-d.start),d.start+delta));w.end=w.start+d.end-d.start;}
  d.el.style.left=w.start/(length()||1)*100+'%';d.el.style.width=(w.end-w.start)/(length()||1)*100+'%';updatePreview();
 };
 track.onpointerup=()=>{
  if(!words){if(drag?.moved){const c=p.cues.find(c=>c.id===drag.id),old=drag.old.cues.find(c=>c.id===drag.id);if(old.words){const ratio=(c.end-c.start)/(old.end-old.start);c.words=old.words.map(w=>({...w,start:c.start+(w.start-old.start)*ratio,end:c.start+(w.end-old.start)*ratio}));}}return oldUp();}
  if(!wordDrag)return;history.push(wordDrag.original);future=[];dirty=true;selectedCue=wordDrag.cue.id;wordDrag=null;renderAll();
 };
 track.onpointercancel=()=>{if(wordDrag){p=wordDrag.original;wordDrag=null;renderAll();}};
 track.addEventListener('click',e=>{if(!words)return;const el=e.target.closest('[data-word-cue]');if(el){const c=p.cues.find(c=>c.id===el.dataset.wordCue);selectedCue=c.id;seek(c.words?.[Number(el.dataset.wordIndex)]?.start??c.start);e.stopPropagation();}});
 const presets={Brighten:{brightness:.1,contrast:1.05,saturation:1},Punchy:{brightness:0,contrast:1.25,saturation:1.2},Warm:{brightness:.03,contrast:1.05,saturation:1.2},Cool:{brightness:-.02,contrast:1.1,saturation:.8},Soft:{brightness:.06,contrast:.85,saturation:.85},Moody:{brightness:-.12,contrast:1.25,saturation:.7},Matte:{brightness:.04,contrast:.8,saturation:.8},Vivid:{brightness:0,contrast:1.12,saturation:1.5},'Black and white':{brightness:0,contrast:1.15,saturation:0},Film:{brightness:.02,contrast:1.1,saturation:.75},Night:{brightness:-.2,contrast:1.15,saturation:.6}};
 const section=document.createElement('div');section.innerHTML='<h3>Adjustment layers</h3><p class="muted">A timed look over the clips below it. Add one at the playhead.</p><div id="adjustmentPresets" class="feature-grid"></div><div id="adjustmentLayers"></div>';$('panel-edit').append(section);
 $('adjustmentPresets').innerHTML=Object.keys(presets).map(name=>`<button data-adjustment="${esc(name)}">${esc(name)}</button>`).join('');
 $('adjustmentPresets').onclick=e=>{const grade=presets[e.target.dataset.adjustment];if(!grade||!p.clips.length)return;update(()=>{p.adjustments||=[];p.adjustments.push({id:crypto.randomUUID(),name:e.target.dataset.adjustment,start:playTime,end:Math.min(length(),playTime+3),grade});});};
 const previousAll=renderAll;renderAll=function(){previousAll();$('adjustmentLayers').innerHTML=(p.adjustments||[]).map((l,i)=>`<div class="layer-entry"><strong>${esc(l.name)}</strong><div class="dual"><label>Start<input type="number" step=".01" min="0" data-adjustment-field="start" data-adjustment-index="${i}" value="${l.start}"></label><label>End<input type="number" step=".01" data-adjustment-field="end" data-adjustment-index="${i}" value="${l.end}"></label></div><button data-delete-adjustment="${i}">Delete layer</button></div>`).join('');};
 $('adjustmentLayers').onchange=e=>{const i=Number(e.target.dataset.adjustmentIndex),key=e.target.dataset.adjustmentField,v=Number(e.target.value),l=p.adjustments?.[i];if(!l||!key||!Number.isFinite(v)||v<0||(key==='start'?v>=l.end:v<=l.start||v>length()))return;update(()=>l[key]=v);};$('adjustmentLayers').onclick=e=>{if(e.target.dataset.deleteAdjustment!==undefined)update(()=>p.adjustments.splice(Number(e.target.dataset.deleteAdjustment),1));};
 renderAll();
})();
