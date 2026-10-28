/* Pure caption model shared by the preview and ASS export. Times are seconds. */
(function(root){
'use strict';
const animated = new Set(['karaoke','pop','fade','word','highlight','glow','typewriter','bounce','slide']);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const num=(v,d)=>Number.isFinite(Number(v))?Number(v):d;
function normalize(style={}) {return {...style,font:String(style.font||'Inter').replace(/[,\r\n]/g,''),weight:num(style.weight,style.bold?800:700),size:clamp(num(style.size,64),10,300),color:style.color||'#ffffff',highlight:style.highlight||'#ffe600',animation:animated.has(style.animation)?style.animation:'none',position:clamp(num(style.position,78),0,100),xPosition:clamp(num(style.xPosition,50),0,100),outline:clamp(num(style.outline,3),0,20),shadow:style.shadow?2:0,letterSpacing:clamp(num(style.letterSpacing,0),-5,30),lineHeight:clamp(num(style.lineHeight,1.15),.7,3),activeScale:clamp(num(style.activeScale,1.12),1,2),activeBox:!!style.activeBox,boxColor:style.boxColor||(style.box?'#000000':'#ffe600'),boxOpacity:clamp(num(style.boxOpacity,.95),0,1),wordsPerLine:clamp(Math.round(num(style.wordsPerLine,6)),1,50),lines:clamp(Math.round(num(style.lines,2)),1,10)};}
function timedWords(cue) {
 const text=String(cue.text||'').trim().split(/\s+/u).filter(Boolean).slice(0,1000),start=num(cue.start,0),end=Math.max(start,num(cue.end,start));
 const supplied=cue.words;
 const valid=Array.isArray(supplied)&&supplied.length===text.length&&supplied.every((w,i)=>Number.isFinite(w.start)&&Number.isFinite(w.end)&&w.start>=start-.001&&w.end>w.start&&w.end<=end+.001&&(!i||w.start>=supplied[i-1].end-.001)&&String(w.text??w.word??text[i]).trim()===text[i]);
 const total=text.reduce((n,w)=>n+Array.from(w).length,0)||1;let consumed=0;
 return text.map((word,i)=>{const a=consumed;consumed+=Array.from(word).length;return {text:word,start:valid?supplied[i].start:start+(end-start)*a/total,end:valid?supplied[i].end:start+(end-start)*consumed/total};});
}
// Group by reading time as well as word count. Fast speech may need a slightly
// longer phrase; word timestamps stay untouched, and real pauses remain gaps.
function groupTimedWords(input,options={}){
 const maxWords=clamp(Math.round(num(options.maxWords,6)),1,24),minDuration=clamp(num(options.minDuration,1.2),0,4),maxDuration=Math.max(minDuration,clamp(num(options.maxDuration,3.5),.3,10)),pauseGap=clamp(num(options.pauseGap,.65),.1,3),hardMax=Math.min(30,Math.max(maxWords,maxWords*2));
 const words=(input||[]).filter(w=>w&&Number.isFinite(w.start)&&Number.isFinite(w.end)&&w.start>=0&&w.end>w.start&&String(w.text??w.word??'').trim()).map(w=>({...w,text:String(w.text??w.word).trim()})).sort((a,b)=>a.start-b.start);
 const cues=[];let pending=[];
 const flush=()=>{if(!pending.length)return;cues.push({start:pending[0].start,end:Math.max(...pending.map(w=>w.end)),text:pending.map(w=>w.text).join(' '),words:pending});pending=[];};
 for(const word of words){
  const span=pending.length?pending.at(-1).end-pending[0].start:0;
  if(pending.length&&(word.start-pending.at(-1).end>pauseGap||pending.length>=hardMax||span>=maxDuration||(pending.length>=maxWords&&span>=minDuration)))flush();
  pending.push(word);
  if(/[.!?।]$/u.test(word.text)&&word.end-pending[0].start>=minDuration)flush();
 }
 flush();
 // Avoid a one-word flicker at a phrase's tail when it fits the preceding cue.
 if(cues.length>1){const last=cues.at(-1),before=cues.at(-2);if(last.end-last.start<minDuration&&last.start-before.end<=pauseGap&&last.end-before.start<=maxDuration&&last.words.length+before.words.length<=hardMax){before.end=last.end;before.text+=' '+last.text;before.words.push(...last.words);cues.pop();}}
 return cues;
}
function regroupCues(cues,options={}){
 const output=[];let run=[],signature=null;
 const flush=()=>{if(!run.length)return;const words=run.flatMap(c=>timedWords(c).map((w,i)=>({...c.words?.[i],...w,...(c.emphasisIndices?{emphasis:c.emphasisIndices.includes(i)}:{})}))),style=run[0].style,estimated=run.some(c=>c.timingSource==='ai-estimated');for(const cue of groupTimedWords(words,options))output.push({...cue,...(style?{style:JSON.parse(JSON.stringify(style))}:{}),...(estimated?{timingSource:'ai-estimated',timingNotice:'AI-estimated timing: review and adjust before export.'}:{})});run=[];};
 for(const cue of [...cues].sort((a,b)=>a.start-b.start)){const next=JSON.stringify(cue.style||null);if(run.length&&next!==signature)flush();signature=next;run.push(cue);}flush();return output;
}
function frame(cue,style,time) {
 const s=normalize({...style,...cue.style}),all=timedWords(cue),capacity=s.wordsPerLine*s.lines,chunk=s.captionPacing==='readable'?Math.max(capacity,Math.min(12,all.length)):capacity;
 const index=all.findIndex(w=>time>=w.start&&time<w.end),last=all.reduce((n,w,i)=>w.start<=time?i:n,0),page=Math.floor((index<0?last:index)/chunk);
 return {style:s,page,visible:time>=cue.start&&time<cue.end,words:all.map((w,i)=>{const emphasis=cue.words?.[i]?.emphasis??cue.emphasisIndices?.includes(i)??true,active=time>=w.start&&time<w.end,past=time>=w.end,inPage=Math.floor(i/chunk)===page,visible=inPage&&time>=cue.start&&time<cue.end&&(s.animation!=='word'||active)&&(s.animation!=='typewriter'||time>=w.start);return {...w,progress:clamp((time-w.start)/(w.end-w.start),0,1),emphasis,text:s.uppercase?w.text.toUpperCase():w.text,active,past,visible,line:Math.floor((i%chunk)/s.wordsPerLine),color:active&&emphasis&&['karaoke','highlight','glow','bounce','pop'].includes(s.animation)?s.highlight:s.color,scale:active&&emphasis&&['pop','bounce','highlight','glow','karaoke'].includes(s.animation)?s.activeScale:1,box:!!s.box||(active&&emphasis&&s.activeBox),glow:active&&emphasis&&s.animation==='glow',opacity:(active?1:clamp(num(s.mutedOpacity,1),0,1))*(s.animation==='fade'?clamp(Math.min((time-cue.start)/.12,(cue.end-time)/.12),0,1):1)};})};
}
function escapeAss(text){return String(text).replace(/\\/g,'\\\\').replace(/{/g,'\\{').replace(/}/g,'\\}').replace(/\r?\n/g,'\\N');}
function color(hex){const h=/^#[a-f\d]{6}$/i.test(hex)?hex.slice(1):'FFFFFF';return '&H'+h.slice(4,6)+h.slice(2,4)+h.slice(0,2)+'&';}
function stamp(t){const c=Math.max(0,Math.round(t*100));return `${Math.floor(c/360000)}:${String(Math.floor(c/6000)%60).padStart(2,'0')}:${String(Math.floor(c/100)%60).padStart(2,'0')}.${String(c%100).padStart(2,'0')}`;}
function makeAss(project,width=1080,height=1920){
 const s=normalize(project.style),w=Math.max(16,Math.round(width)),h=Math.max(16,Math.round(height)),scale=h/1920,size=s.size*scale;
 const duration=Array.isArray(project.clips)?project.clips.reduce((n,c)=>n+Math.max(0,c.out-c.in),0):num(project.duration,Infinity);
 let result=`[Script Info]\nScriptType: v4.00+\nPlayResX: ${w}\nPlayResY: ${h}\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,${s.font},${size},${color(s.color)},${color(s.highlight)},&H00151515,&H99000000,${s.weight>=600?-1:0},${s.italic?-1:0},0,0,100,100,${s.letterSpacing*scale},0,1,${s.outline*scale},${s.shadow*scale},5,0,0,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
 for(const cue of (project.cues||[])){
  const s=normalize({...project.style,...cue.style});
  const start=Math.max(0,cue.start),end=Math.min(duration,cue.end);if(!(end>start))continue;
  const words=timedWords(cue),dynamic=s.animation!=='none'||s.activeBox||s.mutedOpacity!==undefined||words.length>s.wordsPerLine*s.lines;
  const boundaries=dynamic?[...new Set([start,end,...(s.animation==='fade'?[start+.12,end-.12]:[]).filter(x=>x>start&&x<end),...words.flatMap(x=>[x.start,x.end]).filter(x=>x>start&&x<end)])].sort((a,b)=>a-b):[start,end];
  for(let j=0;j<boundaries.length-1;j++){
   const a=boundaries[j],b=boundaries[j+1];if(stamp(a)===stamp(b))continue;
   const f=frame(cue,s,(a+b)/2),shown=f.words.filter(x=>x.visible);if(!shown.length)continue;
   let previousLine=shown[0].line;
   const text=shown.map((word,i)=>{
    const separator=i?(word.line!==previousLine?'\\N':' '):'';previousLine=word.line;const pct=Math.round(word.scale*100);
    const context=word.active?1:clamp(num(s.mutedOpacity,1),0,1);
    const alphaAt=t=>Math.round((1-context*(s.animation==='fade'?clamp(Math.min((t-start)/.12,(end-t)/.12),0,1):1))*255).toString(16).padStart(2,'0');
    const opacity=`\\alpha&H${alphaAt(a)}&`+(s.animation==='fade'?`\\t(0,${Math.round((b-a)*1000)},\\alpha&H${alphaAt(b)}&)`:'');
    return separator+`{${opacity}\\1c${color(word.color)}\\fscx${pct}\\fscy${pct}\\bord${s.outline*scale}\\3c&H151515&\\blur0${word.box?`\\3c${color(s.boxColor)}\\bord${8*scale}\\3a&H${Math.round((1-s.boxOpacity*context)*255).toString(16).padStart(2,'0')}&`:''}}`+escapeAss(word.text);
   }).join('');
   const motion=s.animation==='slide'?`\\move(${w*s.xPosition/100},${h*s.position/100+Math.max(0,1-(a-start)/.18)*30*scale},${w*s.xPosition/100},${h*s.position/100},0,${Math.round(Math.min(.18,b-a)*1000)})`:`\\pos(${w*s.xPosition/100},${h*s.position/100})`;
   const prefix=`{\\an5\\fn${s.font}\\fs${s.size*scale}\\b${s.weight>=600?1:0}\\i${s.italic?1:0}\\fsp${s.letterSpacing*scale}${motion}}`;
   if(s.animation==='glow')result+=`Dialogue: 0,${stamp(a)},${stamp(b)},Default,,0,0,0,,${prefix}{\\blur12\\bord8\\3c${color(s.highlight)}}${shown.map(x=>'{\\1a&H'+(x.glow?'00':'FF')+'&\\3a&H'+(x.glow?'66':'FF')+'&}'+escapeAss(x.text)).join(' ')}\n`;
   result+=`Dialogue: 1,${stamp(a)},${stamp(b)},Default,,0,0,0,,${prefix}${text}\n`;
  }
 }
 return result;
}
const api={normalize,timedWords,groupTimedWords,regroupCues,frame,makeAss,escapeAss};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CliporaCaptions=api;
})(typeof globalThis!=='undefined'?globalThis:this);
