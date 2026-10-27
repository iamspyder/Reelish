/* Caption editing and animation additions shared by editor and video export. */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function merge(cues,id,direction,timedWords){
 const list=cues.slice().sort((a,b)=>a.start-b.start),i=list.findIndex(c=>c.id===id),j=i+direction;
 if(i<0||j<0||j>=list.length)return null;
 const pair=[list[i],list[j]].sort((a,b)=>a.start-b.start);
 if(pair[1].start<pair[0].end-.001)throw new Error('Overlapping captions must be retimed before merging.');
 const words=pair.flatMap(c=>timedWords(c).map((w,index)=>({...c.words?.[index],...w,...(c.emphasisIndices?{emphasis:c.emphasisIndices.includes(index)}:{})})));
 const cue={...list[i],start:pair[0].start,end:pair[1].end,text:words.map(w=>w.text).join(' '),words};delete cue.emphasisIndices;
 return {remove:pair.map(c=>c.id),cue};
}
function motion(name,amount){
 const u=clamp(amount,0,1);
 if(name==='fade')return {opacity:1-u,transform:''};
 if(name==='rise')return {opacity:1-u,transform:`translateY(${u*.7}em)`};
 if(name==='slide')return {opacity:1-u,transform:`translateX(${-u*.8}em)`};
 if(name==='pop')return {opacity:1-u,transform:`scale(${1-u*.6})`};
 return {opacity:1,transform:''};
}
function decorate(container,cue,style,time,frame){
 const s={...style,...cue.style},duration=clamp(Number(s.motionDuration)||.25,.04,2);
 const a=motion(s.entranceMotion,1-(time-cue.start)/duration),b=motion(s.exitMotion,1-(cue.end-time)/duration);
 // The outer position transform belongs to the shared scene renderer.
 container.style.opacity=String(Number(container.style.opacity||1)*a.opacity*b.opacity*clamp(Number(s.captionOpacity??1),0,1));
 container.style.rotate=clamp(Number(s.captionTilt)||0,-180,180)+'deg';
 container.style.translate='0px';
 const visible=frame.words.filter(w=>w.visible);
 [...container.querySelectorAll('.word')].forEach((el,i)=>{
  const w=visible[i];if(!w)return;
  const enter=motion(s.wordMotion,1-(time-w.start)/duration);
  el.style.transform=(el.style.transform||'')+' '+a.transform+' '+b.transform+' '+enter.transform;
  let opacity=Number(el.style.opacity||1)*enter.opacity;
  if(!w.past&&!w.active&&s.futureOpacity!==undefined)opacity*=clamp(Number(s.futureOpacity),0,1);
  if(!w.past&&!w.active&&s.futureWords==='dim')opacity*=.35;
  if(!w.past&&!w.active&&s.futureWords==='hide')el.style.visibility='hidden';
  if(w.past&&s.pastOpacity!==undefined)opacity*=clamp(Number(s.pastOpacity),0,1);
  el.style.opacity=String(opacity);
  if(w.active&&s.activeWordColor)el.style.color=s.activeWordColor;
  if(w.active&&s.activeUnderline)el.style.textDecoration='underline';
  if(w.active&&s.activeGrow)el.style.transform+=' scale('+(clamp(Number(s.activeScale)||1.12,1,2)/(w.scale||1))+')';
  if(w.active&&s.activeGlow)el.style.textShadow='0 0 .12em currentColor,0 0 .3em currentColor';
  if(!w.past&&!w.active&&s.futureWordColor)el.style.color=s.futureWordColor;
 });
}
const api={merge,motion,decorate};root.ReelishCaptionParity=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(typeof document==='undefined'||typeof p==='undefined')return;
const captionActions=document.createElement('div');captionActions.className='caption-parity-actions';
captionActions.innerHTML='<button id="mergeCaptionUp">Merge ↑</button><button id="mergeCaptionDown">Merge ↓</button><label>Selected caption depth<select id="cueDepth"><option value="inherit">Use style</option><option value="behind">Behind speaker</option><option value="front">In front</option></select></label>';
$('panel-captions').querySelector('.captiontoolbar').after(captionActions);
function mergeSelected(direction){try{const result=merge(p.cues,selectedCue,direction,CliporaCaptions.timedWords);if(!result)return toast('Select a caption with a neighboring line');update(()=>{p.cues=p.cues.filter(c=>!result.remove.includes(c.id));p.cues.push(result.cue);p.cues.sort((a,b)=>a.start-b.start);selectedCue=result.cue.id;});}catch(e){toast(e.message);}}
$('mergeCaptionUp').onclick=()=>mergeSelected(-1);$('mergeCaptionDown').onclick=()=>mergeSelected(1);
$('cueDepth').onchange=()=>{const cue=p.cues.find(c=>c.id===selectedCue);if(!cue)return toast('Select a caption first');const value=$('cueDepth').value;update(()=>{cue.style={...cue.style};if(value==='inherit')delete cue.style.behindSubject;else cue.style.behindSubject=value==='behind';});};
const controls=document.createElement('details');controls.className='caption-parity-controls';controls.innerHTML='<summary>Caption motion & word appearance</summary><p class="muted">Independent motions combine with the selected look. Applies to all captions.</p>';
const choices='<option value="none">None</option><option value="fade">Fade</option><option value="rise">Rise</option><option value="slide">Slide</option><option value="pop">Pop</option>';
for(const [key,label] of [['entranceMotion','Entrance'],['exitMotion','Exit'],['wordMotion','Each word']])controls.innerHTML+=`<label>${label}<select data-parity-style="${key}">${choices}</select></label>`;
controls.innerHTML+='<label>Motion duration (seconds)<input data-parity-style="motionDuration" type="number" min=".04" max="2" step=".01" value=".25"></label><label>Future word opacity<input data-parity-style="futureOpacity" type="range" min="0" max="1" step=".05" value="1"></label><label>Past word opacity<input data-parity-style="pastOpacity" type="range" min="0" max="1" step=".05" value="1"></label><label>Active word color<input data-parity-style="activeWordColor" type="color" value="#ffe600"></label><label>Future word color<input data-parity-style="futureWordColor" type="color" value="#ffffff"></label><button id="clearParityMotion">Reset motion & word overrides</button>';
controls.innerHTML+='<label>Future words<select data-parity-style="futureWords"><option value="show">Show</option><option value="dim">Dim</option><option value="hide">Hide</option></select></label><label class="check"><input data-parity-style="activeUnderline" type="checkbox"> Underline active word</label><label class="check"><input data-parity-style="activeGrow" type="checkbox"> Grow active word</label><label class="check"><input data-parity-style="activeGlow" type="checkbox"> Glow active word</label><label>Caption opacity<input data-parity-style="captionOpacity" type="range" min="0" max="1" step=".05" value="1"></label><label>Caption tilt (degrees)<input data-parity-style="captionTilt" type="number" min="-180" max="180" step="1" value="0"></label>';
$('textPane').append(controls);
controls.onchange=e=>{const key=e.target.dataset.parityStyle;if(!key)return;const value=e.target.type==='checkbox'?e.target.checked:['range','number'].includes(e.target.type)?Number(e.target.value):e.target.value;if(typeof value==='number'&&!Number.isFinite(value))return;update(()=>p.style[key]=value);};
$('clearParityMotion').onclick=()=>update(()=>{for(const key of ['entranceMotion','exitMotion','wordMotion','motionDuration','futureOpacity','pastOpacity','activeWordColor','futureWordColor','futureWords','activeUnderline','activeGrow','activeGlow','captionOpacity','captionTilt'])delete p.style[key];});
const grid=document.createElement('button');grid.id='previewGrid';grid.textContent='Grid';grid.title='Rule of thirds preview guide';document.querySelector('.previewtools').append(grid);
const guides=document.createElement('div');guides.className='preview-grid hidden';$('frame').append(guides);grid.onclick=()=>{guides.classList.toggle('hidden');grid.classList.toggle('active',!guides.classList.contains('hidden'));};
const zoom=document.createElement('select');zoom.id='previewMagnification';zoom.setAttribute('aria-label','Preview magnification');zoom.innerHTML='<option value="1">Fit</option><option value="1.25">125%</option><option value="1.5">150%</option><option value="2">200%</option>';document.querySelector('.previewtools').append(zoom);zoom.onchange=()=>{$('frame').style.scale=zoom.value;document.querySelector('.stage').style.overflow='auto';};
const prior=renderCaptions;renderCaptions=function(){prior();const c=p.cues.find(c=>c.id===selectedCue);$('cueDepth').value=c?.style?.behindSubject===undefined?'inherit':c.style.behindSubject?'behind':'front';for(const el of controls.querySelectorAll('[data-parity-style]')){const key=el.dataset.parityStyle;if(el.type==='checkbox')el.checked=!!p.style[key];else el.value=p.style[key]??({motionDuration:.25,futureOpacity:1,pastOpacity:1,activeWordColor:'#ffe600',futureWordColor:'#ffffff',captionOpacity:1,captionTilt:0,futureWords:'show'}[key]??'none');}};
})(typeof globalThis==='undefined'?this:globalThis);
