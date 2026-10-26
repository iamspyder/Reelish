(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ReelishLayers=api;})(typeof globalThis==='undefined'?this:globalThis,function(){
 const kinds={title:'Title card',quote:'Pull quote',stat:'Big number',list:'Checklist',callout:'Call to action',lowerthird:'Lower third',comparison:'Comparison',progress:'Progress bar',countdown:'Countdown',chapter:'Chapter card',badge:'Badge',steps:'Steps'};
 const themes={gold:{accent:'#f6bd45',background:'#17171c',color:'#ffffff'},paper:{accent:'#d34b36',background:'#f6f1e6',color:'#17171c'},neon:{accent:'#94ff70',background:'#10231c',color:'#ffffff'}};
 const presets=Object.entries(kinds).flatMap(([kind,name])=>Object.entries(themes).map(([theme,palette])=>({id:kind+'-'+theme,kind,name:name+' · '+theme,theme,...palette})));
 const clamp=(v,min,max,fallback)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
 function normalize(layer={}){
  const kind=Object.hasOwn(kinds,layer.kind)?layer.kind:'title',palette=themes[layer.theme]||themes.gold;
  const color=(v,fallback)=>/^#[a-f\d]{6}$/i.test(v||'')?v:fallback;
  return {...layer,id:String(layer.id||''),kind,text:String(layer.text||'Your story starts here').slice(0,2000),start:clamp(layer.start,0,86400,0),end:clamp(layer.end,0,86400,3),positionX:clamp(layer.positionX,0,100,50),positionY:clamp(layer.positionY,0,100,65),scale:clamp(layer.scale,.1,4,1),rotation:clamp(layer.rotation,-360,360,0),opacity:clamp(layer.opacity,0,1,1),size:clamp(layer.size,20,200,70),accent:color(layer.accent,palette.accent),background:color(layer.background,palette.background),color:color(layer.color,palette.color),font:String(layer.font||'Inter').slice(0,100),animation:['pop','fade','slide','none'].includes(layer.animation)?layer.animation:'pop'};
 }
 function active(layers,time){return (layers||[]).map(normalize).filter(l=>!l.hidden&&l.end>l.start&&time>=l.start&&time<l.end).slice(0,100);}
 function retime(layers,map){return (layers||[]).map(l=>({...l,start:map(l.start),end:map(l.end)})).filter(l=>l.end-l.start>.03);}
 function render(parent,layers,time,height,{interactive=false}={}){
  let host=parent.querySelector('.reelish-layers');if(!host){host=document.createElement('div');host.className='reelish-layers';parent.append(host);}
  host.replaceChildren();
  for(const l of active(layers,time)){
   const el=document.createElement('div');el.className='graphic graphic-'+l.kind;el.dataset.layer=l.id;
   const local=time-l.start,duration=l.end-l.start,progress=Math.min(1,Math.max(0,local/duration)),entrance=Math.min(1,local/.22),exit=Math.min(1,(l.end-time)/.15);
   const motion=typeof CliporaMotion!=='undefined'?CliporaMotion.sample({keyframes:l.keyframes},local):{zoom:1,x:0,y:0,rotation:0,opacity:1};
   const scale=l.scale*motion.zoom*(l.animation==='pop'?.85+.15*(1-Math.pow(1-entrance,3)):1),dy=l.animation==='slide'?(1-entrance)*30:0;
   Object.assign(el.style,{left:(l.positionX+motion.x*100)+'%',top:(l.positionY+motion.y*100)+'%',fontSize:l.size*height/1920+'px',fontFamily:l.font,color:l.color,background:l.background,opacity:String(l.opacity*motion.opacity*(l.animation==='none'?1:entrance*exit)),transform:`translate(-50%,-50%) translateY(${dy}px) scale(${scale}) rotate(${l.rotation+motion.rotation}deg)`,pointerEvents:interactive?'auto':'none'});el.style.setProperty('--graphic-accent',l.accent);
   const lines=l.text.split('\n').filter(Boolean),add=(tag,text,className)=>{const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;el.append(node);return node;};
   if(l.kind==='title'){add('small','THE STORY');add('strong',lines[0]);if(lines[1])add('p',lines.slice(1).join(' '));}
   else if(l.kind==='quote'){add('span','“','quote-mark');add('strong',lines[0]);if(lines[1])add('small','— '+lines[1]);}
   else if(l.kind==='stat'){add('strong',lines[0],'stat-value');add('p',lines[1]||'BY THE NUMBERS');}
   else if(l.kind==='list'||l.kind==='steps'){add('small',l.kind==='steps'?'STEP BY STEP':'THE CHECKLIST');lines.slice(0,6).forEach((line,i)=>{const row=add('p','','graphic-row');const mark=document.createElement('b');mark.textContent=l.kind==='steps'?String(i+1):'✓';const value=document.createElement('span');value.textContent=line;row.append(mark,value);});}
   else if(l.kind==='callout'){add('strong',lines[0]);add('small',lines[1]||'TAKE THE NEXT STEP →');}
   else if(l.kind==='lowerthird'){add('strong',lines[0]);add('small',lines[1]||'YOUR STORY');}
   else if(l.kind==='comparison'){add('small','SIDE BY SIDE');const row=add('div','','graphic-columns');lines.slice(0,2).forEach((line,i)=>{const part=document.createElement('strong');part.textContent=(i?'B · ':'A · ')+line;row.append(part);});}
   else if(l.kind==='progress'){add('strong',lines[0]);const bar=add('div','','graphic-bar'),fill=document.createElement('i');fill.style.width=Math.round(progress*100)+'%';bar.append(fill);add('small',Math.round(progress*100)+'%');}
   else if(l.kind==='countdown'){add('strong',String(Math.ceil(l.end-time)),'stat-value');add('small',lines[0]);}
   else if(l.kind==='chapter'){add('small','CHAPTER '+(lines[1]||'01'));add('strong',lines[0]);}
   else if(l.kind==='badge'){add('span','✦');add('strong',lines[0]);}
   host.append(el);
  }
  return host;
 }
 return {kinds,themes,presets,normalize,active,retime,render};
});
