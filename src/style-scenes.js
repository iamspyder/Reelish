/* Independently authored compositions. Public font/color metadata is evidence;
 * composition and motion are Reelish interpretations, not verified target parity. */
(function(root){
'use strict';
const recipes={};
function add(ids,scene,options={}){for(const id of ids.split(' '))recipes[id]={scene,...options};}
add('captik_glow captik_shadow captik hormozi mrbeast mr_beast_2 highlighted_word clean_glow captik_clean black_punch captik_word tabahi deep_glow seedha_saadha clean_motion ali_abdaal bubble boxed iman_gadzhi prism','words');
add('pixelated look_cove look_patio','pixel',{motion:'step'});
add('liquid_glass','glass');
add('thora_cinematic look_yawl look_shingle','cinema',{letterSpacing:5});
add('delhi aura big_red look_jetty look_keel look_quay look_eave look_stucco','serif',{heroRatio:1.6});
add('illusion editor_masala aura_helvetica big_reveal blockbuster look_hawser look_lanyard look_rudder look_underway look_gazebo look_dome','poster',{heroRatio:1.7});
add('scribble journal look_outhaul look_dovecote look_effigy look_sash look_tread look_thatch look_lath','scribble',{decoration:'underline',rotation:-3});
add('archives look_baluster look_adobe','typewriter',{letterSpacing:1.5});
add('interlock look_anchorage look_ellis look_ferrier look_garnet look_abbey','stack',{heroRatio:1.35});
add('look_beacon look_belfry look_foyer look_parquet','signature',{heroRatio:1.7});
add('look_driftwood look_ibis look_netting look_lantern look_atrium look_terrazzo','outline',{heroRatio:1.5});
add('look_mizzen look_painter look_scupper look_taffrail look_vang look_windlass look_cloister look_newel look_soffit look_casement look_muntin look_louver look_shutter look_awning look_sill look_joist look_loft look_attic look_chimney look_oriel look_oculus look_clerestory look_riser','editorial',{heroRatio:1.8});
add('look_porch look_mural look_tile look_mullion look_fanlight','comic',{heroRatio:1.45,rotation:-4});
add('look_banister look_fresco','paint',{heroRatio:1.6,rotation:-5});
add('look_iron','reel',{heroRatio:2.3,gradient:['#FFFFFF','#EC00B5','#A6007D']});
add('look_jamb','editorial',{heroRatio:2.6,motion:'rise'});
add('look_oriel look_lantern look_atrium','orbit',{heroRatio:2});
// Original styles deliberately add composition choices rather than recolors.
add('clipora_0','marker');add('clipora_1','poster');add('clipora_2','editorial');add('clipora_3','orbit');add('clipora_4 clipora_5','words');
add('clipora_editorial','editorial');add('clipora_orbit','orbit');add('clipora_glitch','glitch');add('clipora_property','property');add('clipora_reel','reel');add('clipora_gradient','gradient');add('clipora_circle','scribble',{decoration:'circle'});add('clipora_depth','depth');
const originals=[['editorial','Editorial'],['orbit','Orbit'],['glitch','Glitch'],['property','Property'],['reel','Reel'],['gradient','Gradient'],['circle','Circle'],['depth','Depth'],['lowerthird','Lower Third'],['splitpill','Split Pill'],['spine','Vertical Spine'],['barcode','Kinetic Barcode'],['satellite','Satellite'],['terminal','Terminal Progress'],['notebook','Ruled Notebook'],['circular','Circular Caption'],['marquee','Marquee'],['ticket','Ticket'],['spotlight','Spotlight'],['brackets','Focus Brackets'],['stagger','Stagger Steps'],['ribbon','Ribbon'],['countdown','Word Counter'],['wave','Wave']].map(([id,name])=>({id:'clipora_'+id,name:'Reelish '+name,category:'Reelish originals',source:'Reelish original',style:{scene:id==='circle'?'scribble':id,templateId:'clipora_'+id}}));
for(const p of originals)if(!recipes[p.id])recipes[p.id]={scene:p.style.scene};
const families=['words','pixel','glass','cinema','serif','poster','scribble','typewriter','stack','signature','outline','editorial','comic','paint','marker','orbit','glitch','property','reel','gradient','depth',...originals.slice(8).map(p=>p.style.scene)];
function sceneStyle(id,base={},metadata={}){
 const recipe=recipes[id];if(!recipe)return {...base,scene:base.scene||'words'};
 const alias=root.CliporaPresets?.aliasFont||((font)=>String(font||'Inter').split(',')[0].trim());
 const theme=metadata.reelTheme||metadata.spatialTheme||{};
 // Keep the measured descriptors. Reducing every look to a generic poster or
 // editorial recipe erased its row sizing, support face, chips and hero layer.
 if(id.startsWith('look_')&&metadata.family)return {...base,scene:'look-'+metadata.family,templateId:id,lookLayout:JSON.parse(JSON.stringify(metadata)),heroFont:alias(metadata.accentFont||metadata.font||base.font),supportFont:alias(metadata.font||base.font),font:alias(metadata.font||base.font),weight:metadata.weight??base.weight,heroWeight:metadata.accentWeight??metadata.weight??base.weight,uppercase:metadata.transform==='uppercase'||!!metadata.reelTheme?.heroUpper,letterSpacing:(metadata.letterSpacingEm||0)*(base.size||78),lineHeight:metadata.lineHeight||1.05,wordsPerLine:metadata.maxWords||base.wordsPerLine,lines:1,sceneTheme:theme,sceneApproximation:true};
 return {...base,...recipe,...(metadata.family==='spatial'?{scene:'orbit'}:{}),...(metadata.family==='story'?{scene:metadata.reel==='magenta-estate'?'reel':'editorial'}:{}),templateId:id,heroFont:alias(metadata.accentFont||base.heroFont||metadata.font||base.font),supportFont:alias(metadata.font||base.supportFont||base.font),heroRatio:metadata.contextSizePx?Math.min(4,(metadata.sizePx||52)/metadata.contextSizePx):recipe.heroRatio,sceneTheme:theme,gradient:theme.gradient||recipe.gradient,motion:theme.heroMotion||recipe.motion,rotation:theme.heroRotate??recipe.rotation,sceneApproximation:true};
}
function composition(cue,style,time){
 const engine=root.CliporaCaptions||(typeof require==='function'?require('./caption-engine.js'):null);
 const frame=engine.frame(cue,style,time),shown=frame.words.filter(w=>w.visible);
 let hero=shown.findIndex(w=>w.active);
 // During a measured speech gap, hold the last spoken word. Jumping to the
 // final future word caused a distracting flash before the next spoken word.
 if(hero<0){for(let i=shown.length-1;i>=0;i--)if(shown[i].past){hero=i;break;}if(hero<0&&shown.length)hero=0;}
 return {frame,shown,hero,progress:Math.max(0,Math.min(1,(time-cue.start)/Math.max(.01,cue.end-cue.start)))};
}
const limit=(value,min,max)=>Math.max(min,Math.min(max,value));
function lookMotion(element,kind,elapsed,ms=220,amount=.4){
 const p=limit(elapsed/Math.max(.001,ms/1000),0,1),r=1-p;
 const transforms={fadeUp:`translateY(${r*amount}em)`,rise:`translateY(${r*amount}em)`,fadeDown:`translateY(${-r*amount}em)`,drop:`translateY(${-r*amount}em)`,slide:`translateX(${r*amount}em)`,glide:`translateX(${r*amount}em)`,zoom:`scale(${1-r*.45})`,pop:`scale(${1-r*.6+Math.sin(p*Math.PI)*.16})`,spring:`scale(${1-r*.6+Math.sin(p*Math.PI*2)*r*.25})`,stamp:`scale(${1+r*.45})`,stretch:`scaleX(${1+r*.65})`,flip:`perspective(500px) rotateX(${r*85}deg)`,skid:`translateX(${r*.7}em) skewX(${-r*20}deg)`,land:`translateY(${-r*.5}em)`,burst:`scale(${1+r*.5}) rotate(${r*15}deg)`,snap:`scale(${p<.65?.75:1})`,bounce:`translateY(${-Math.sin(p*Math.PI)*.2}em)`};
 if(transforms[kind])element.style.transform=(element.style.transform||'')+' '+transforms[kind];
 if(kind==='fadeLeft')element.style.transform=(element.style.transform||'')+` translateX(${r*amount}em)`;
 // CSSStyleDeclaration returns an empty string for an unset property. Number('')
 // is zero, which made every row with an entrance fade permanently invisible.
 if(['fade','fadeUp','fadeDown','fadeLeft','rise','drop','glide'].includes(kind))element.style.opacity=String((element.style.opacity===''||element.style.opacity===undefined?1:Number(element.style.opacity))*p);
 if(['wipe','paint','type'].includes(kind))element.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;
 if(kind==='blur')element.style.filter=`blur(${r*.15}em)`;
 if(kind==='flicker'&&p<1)element.style.opacity=Math.sin(elapsed*75)>0?'.35':'1';
}
function decorateLook(container,cue,style,time,dimensions={}){
 const s={...style,...cue.style},m=s.lookLayout,theme=m.reelTheme||m.spatialTheme||{},doc=container.ownerDocument;
 const {shown,hero}=composition(cue,s,time),height=dimensions.height||1920,unit=height/1920,size=(s.size||78)*unit;
 const alias=root.CliporaPresets?.aliasFont||((font)=>String(font||'Inter').split(',')[0].replace(/["']/g,'').trim());
 const customFont=s.font&&alias(s.font)!==alias(m.font),customWeight=Number(s.weight)!==Number(m.weight||s.weight);
 const referenceUnit=size/Math.max(1,m.sizePx||size/4),family=m.family;
 container.replaceChildren();container.dataset.scene='look-'+family;
 Object.assign(container.style,{fontFamily:s.supportFont||s.font,fontSize:size+'px',fontWeight:String(s.weight||m.weight||400),lineHeight:String(s.lineHeight||1.05),textAlign:'center',whiteSpace:'normal',overflow:'visible',letterSpacing:(s.letterSpacing||0)*unit+'px'});
 if(!shown.length)return true;
 const group=doc.createElement('div');group.className='caption-scene scene-look-'+family;group.dataset.look=m.id||s.templateId;
 Object.assign(group.style,{display:'flex',position:'relative',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'100%',gap:(m.stack?.rowGapEm??.08)+'em',isolation:'isolate'});
 const shadow=m.shadow&&s.shadow!==false?`0 ${(m.shadow.offsetY||0)*referenceUnit}px ${(m.shadow.blurPx||0)*referenceUnit}px ${m.shadow.color||'#0008'}`:'none';
 const accent=s.highlight||m.accent||'#fff',color=s.color||m.color||'#fff';
 function node(word,isHero,index,options={}){
  const el=doc.createElement('span');el.className=isHero?'scene-hero':'scene-support';el.textContent=word.text;el.dataset.word=String(index);
  const role=options.role||{},font=customFont?s.font:options.font||role.font||(isHero?(s.heroFont||s.font):(s.supportFont||s.font));
  Object.assign(el.style,{display:'inline-block',position:'relative',fontFamily:alias(font),fontWeight:String(options.weight??role.weight??(isHero?(s.heroWeight||m.accentWeight||s.weight):(s.weight||m.weight||400))),color:options.color||role.color||(isHero?accent:color),fontStyle:isHero&&m.accentItalic?'italic':'normal',fontSize:(options.ratio??(isHero?s.activeScale??m.accentScale:1)??1)+'em',letterSpacing:(role.letterSpacingEm??(isHero?m.accentLetterSpacingEm:m.letterSpacingEm)??0)+'em',lineHeight:String(s.lineHeight||1.05),opacity:String(isHero?1:(m.restOpacity??1)),textTransform:role.transform||(isHero&&m.accentUppercase?'uppercase':m.transform||'none'),textShadow:shadow,WebkitTextStroke:(s.outline??(m.stroke?.px||0)*4)*unit+'px '+(s.outlineColor||m.stroke?.color||'#111'),paintOrder:'stroke fill',transformOrigin:'center',whiteSpace:'pre'});
  if((m.reveal||m.inception)&&!word.past&&!word.active)el.style.opacity='0';
  if(customWeight)el.style.fontWeight=String(s.weight);
  if(!s.uppercase&&m.transform==='uppercase')el.style.textTransform='none';
  if(isHero&&m.chip){Object.assign(el.style,{background:m.chip.bg,padding:'.04em .15em',borderRadius:'.13em'});}
  if(isHero&&m.glow)el.style.textShadow+=`,0 0 ${m.glow.blurPx*referenceUnit}px ${accent}`;
  if(m.jitter)el.style.transform=`rotate(${Math.sin(index*2.7+1)*m.jitter.rotateDeg}deg) translateY(${Math.cos(index*3)*(m.jitter.yEm||0)}em)`;
  if(isHero&&m.markColor){const mark=doc.createElement('i');Object.assign(mark.style,{position:'absolute',left:'-7%',bottom:'-.09em',width:'114%',height:'.16em',borderBottom:'.04em solid '+m.markColor,borderRadius:'40%',transform:'rotate(-4deg)',pointerEvents:'none'});el.appendChild(mark);}
  if(m.animIn)lookMotion(el,m.animIn,time-(isHero?word.start:cue.start),m.animInMs||200);
  if(isHero&&m.heroEnter)lookMotion(el,m.heroEnter.kind,time-word.start,m.heroEnter.ms,m.heroEnter.em);
  if(m.animOutMs)el.style.opacity=String(Number(el.style.opacity||1)*limit((cue.end-time)/(m.animOutMs/1000),0,1));
  return el;
 }
 function row(words,ratio=1,options={}){
  const line=doc.createElement('div');line.className='look-row';Object.assign(line.style,{display:'flex',alignItems:'baseline',justifyContent:'center',flexWrap:'wrap',columnGap:(m.wordGapEm??.28)+'em',maxWidth:'100%',fontSize:ratio+'em'});
  for(const word of words){const i=shown.indexOf(word);line.appendChild(node(word,i===hero,i,options));}
  if(m.rowEnter)lookMotion(line,m.rowEnter.kind,time-(words[0]?.start??cue.start)-(m.rowEnter.delayMs||0)/1000,m.rowEnter.ms);
  group.appendChild(line);return line;
 }
 if(family==='story'){
  // Separate support copy and large hero, preserving the theme's face, ink,
  // motion and alignment rather than adding the same border to every story.
  const contextRatio=(m.contextSizePx||14)/Math.max(1,m.sizePx||52),active=shown[hero],align=theme.heroAlign||'center';
  if(hero>0){const line=row(shown.slice(0,hero),contextRatio,{color:theme.supportColor||color,weight:theme.supportWeight});line.style.justifyContent=align==='left'?'flex-start':align==='right'?'flex-end':'center';}
  if(active){
   const el=node(active,true,hero,{ratio:1,weight:theme.heroWeight,color:theme.accents?.[hero%theme.accents.length]||accent});el.className+=' look-story-hero';
   Object.assign(el.style,{alignSelf:align==='left'?'flex-start':align==='right'?'flex-end':'center',maxWidth:'100%',whiteSpace:'normal',overflowWrap:'anywhere',fontStyle:theme.heroItalic==='always'||(theme.heroItalic==='scene'&&hero%2)?'italic':'normal',fontWeight:String(customWeight?s.weight:theme.heroWeight||s.heroWeight||700),letterSpacing:(theme.heroTrackingEm||0)+'em',textTransform:s.uppercase?'uppercase':'none',transform:`rotate(${theme.heroRotate||0}deg)`});
   if(theme.gradient){Object.assign(el.style,{backgroundImage:`linear-gradient(180deg,${theme.gradient.join(',')})`,backgroundClip:'text',WebkitBackgroundClip:'text',color:'transparent',textShadow:'none'});}
   if(theme.heroInk==='hollow'){Object.assign(el.style,{backgroundImage:'none',color:'transparent',WebkitTextStroke:'.022em '+accent});}
   if(theme.heroInk==='inception'){el.style.WebkitTextStroke='.018em '+(theme.stroke?.[1]||accent);el.style.filter=`drop-shadow(.06em .08em 0 ${theme.twin||'#111'})`;}
   if(theme.heroStroke)el.style.WebkitTextStroke=(theme.heroStroke.em||.03)+'em '+theme.heroStroke.color;
   if(theme.heroGlow)el.style.filter=`drop-shadow(0 0 .08em ${theme.heroGlow==='accent'?accent:theme.heroGlow})`;
   if(theme.shade)el.style.textShadow=`.018em .025em 0 ${theme.shade}`;
   lookMotion(el,theme.heroMotion||'rise',time-active.start,260);group.appendChild(el);
  }
  if(hero<shown.length-1)row(shown.slice(hero+1),contextRatio,{color:theme.supportColor||color,weight:theme.supportWeight});
  for(const line of group.children){if(line.className==='look-row'){for(const el of line.children){el.style.letterSpacing=(theme.supportTrackingEm||0)+'em';el.style.textTransform=theme.supportUpper?'uppercase':'none';el.style.fontStyle=theme.supportItalic==='always'?'italic':'normal';lookMotion(el,theme.supportMotion||'fade',time-cue.start,250);}}}
 }else if(family==='emphasis'){
  const contextRatio=(m.contextSizePx||14)/Math.max(1,m.sizePx||34),line=row(shown,1);
  line.style.alignItems='center';
  for(let i=0;i<line.children.length;i++){
   const el=line.children[i],active=i===hero;el.style.fontSize=(active?1:contextRatio)+'em';
   if(m.curve){const angle=(i-(shown.length-1)/2)*15;el.style.transform=`rotate(${angle}deg) translateY(${Math.abs(angle)*.009}em)`;line.dataset.layout='curve';}
   if(active&&m.pop?.chip){el.style.background=m.pop.chip.bg;el.style.borderRadius=(m.pop.chip.radiusEm||.12)+'em';el.style.padding=(m.pop.chip.padEm||[.02,.22]).map(x=>x+'em').join(' ');}
  }
 }else if(family==='stack'){
  const stack=m.stack||{},perRow=Math.max(1,Math.min(stack.maxPerRow||2,Math.ceil(shown.length/Math.max(1,stack.rowScale?.length||2))));
  for(let i=0,rowIndex=0;i<shown.length;i+=perRow,rowIndex++){
   const words=shown.slice(i,i+perRow),ratio=stack.rowScale?.[Math.min(rowIndex,stack.rowScale.length-1)]||1;
   const line=row(words,ratio);for(let j=0;j<words.length;j++)if(shown.indexOf(words[j])===hero){const el=line.children[j],role=stack.roles?.pop;if(role){if(role.font)el.style.fontFamily=alias(role.font);if(role.color)el.style.color=role.color;if(role.weight)el.style.fontWeight=String(role.weight);if(role.transform)el.style.textTransform=role.transform;}if(m.accentFontVariants?.length)el.style.fontFamily=alias(m.accentFontVariants[hero%m.accentFontVariants.length]);el.style.fontSize=(s.activeScale??m.accentScale??1)+'em';}
  }
 }else if(family==='spatial'){
  const spatial=m.spatial||'red',layout=theme.layout||(spatial==='red'?'orbit':spatial==='yellow'?'pairs':'poster'),texture=theme.texture||(spatial==='red'?'extruded':'flat');
  group.dataset.layout=layout;group.dataset.texture=texture;
  Object.assign(group.style,{display:'flex',flexDirection:['stack','stair','poster'].includes(layout)?'column':'row',flexWrap:'wrap',gap:layout==='pairs'?'.14em .34em':'.12em .22em',perspective:'800px'});
  shown.forEach((word,i)=>{const isHero=i===hero,ratio=spatial==='white'?1:(isHero?2.25:.7),el=node(word,isHero,i,{ratio});
   if(layout==='stair')el.style.alignSelf=i%2?'flex-end':'flex-start';
   if(layout==='poster'&&isHero)el.style.letterSpacing='-.055em';
   if(layout==='orbit')el.style.transform=`rotate(${(i-hero)*-9}deg) translateY(${i%2?'.18em':'-.1em'})`;
   if(!theme.keepCase&&spatial!=='white')el.style.textTransform=isHero?'uppercase':m.transform||'none';
   if(texture==='extruded'&&isHero)el.style.textShadow=Array.from({length:6},(_,n)=>`${(n+1)*.015}em ${(n+1)*.02}em 0 ${theme.puffy||accent}`).join(',');
   if(texture==='puffy'&&isHero){el.style.WebkitTextStroke='.045em '+(theme.puffy||accent);el.style.textShadow=`0 .06em .04em #1118,0 0 .025em ${theme.puffy||accent}`;}
   if(theme.caption?.heroOutline&&isHero)el.style.WebkitTextStroke=theme.caption.heroOutline+'em #111';
   const glow=theme.caption?.glow;if(glow&&isHero)el.style.textShadow=`0 0 .025em ${glow.light},0 0 .09em ${glow.deep},.025em .045em 0 ${glow.sand}`;
   if(theme.caption?.neon)el.style.textShadow=`0 0 .04em ${theme.caption.neon},0 0 .14em ${theme.caption.neon}`;
   if(theme.caption?.rowTrackingEm!==undefined)el.style.letterSpacing=theme.caption.rowTrackingEm+'em';
   if(theme.motion==='swing')el.style.transform=`rotate(${Math.sin((time-word.start)*3)*10}deg)`;
   else lookMotion(el,theme.motion||(spatial==='red'?'land':spatial==='yellow'?'zoom':'fade'),time-word.start,300);
   group.appendChild(el);
  });
 }else{
  const perRow=s.wordsPerLine||m.wordsPerLine||Math.ceil(shown.length/(m.wrapRows||1));
  for(let i=0;i<shown.length;i+=perRow)row(shown.slice(i,i+perRow),1);
 }
 // Impact and echo are distinct layers above the support captions; their
 // vertical offset is measured in the video coordinate system.
 for(const [kind,detail] of [['impact',m.impact],['echo',m.echo]])if(detail){
  const index=detail.select==='leading'?0:detail.select==='trailing'?shown.length-1:hero,word=shown[index];
  if(word&&(!detail.maxChars||word.text.length<=detail.maxChars)){
   const el=node(word,true,index,{font:detail.font,ratio:1,weight:detail.weight||s.heroWeight,color:detail.color||accent});el.className='look-'+kind;
   Object.assign(el.style,{position:'absolute',left:'50%',top:((detail.yPct??25)-(m.positionYPct??75))*height/100+'px',transform:'translate(-50%,-50%)',fontSize:(detail.sizePx||70)*referenceUnit+'px',fontFamily:alias(customFont?s.font:detail.font||s.heroFont),fontWeight:String(customWeight?s.weight:detail.weight||s.heroWeight||400),fontStyle:detail.italic?'italic':'normal',letterSpacing:(detail.letterSpacingEm||0)+'em',textTransform:detail.uppercase?'uppercase':'none',whiteSpace:'normal',width:((dimensions.width||height*9/16)*(detail.widthPct||92)/100)+'px',lineHeight:'.95',color:detail.color||accent,opacity:'1'});
   if(detail.chip||detail.chipPad){const pad=detail.chipPad||{};Object.assign(el.style,{background:detail.chip?.bg||detail.litColor||accent,padding:`${pad.top||.05}em ${pad.right||.1}em ${pad.bottom||.05}em ${pad.left||.1}em`,borderRadius:(pad.radiusEm||.1)+'em',width:'auto',maxWidth:'100%'});}
   group.appendChild(el);
  }
 }
 container.appendChild(group);
 // Fit long words after insertion, using the same DOM dimensions for preview
 // and export. A long name must not disappear outside the video bounds.
 if(group.querySelectorAll){
  for(const el of group.querySelectorAll('.look-impact,.look-echo,.look-story-hero,.look-row')){
   const available=el.className==='look-row'?group.clientWidth:Math.min(group.clientWidth||Infinity,(dimensions.width||height*9/16)*.92);
   if(available>0&&el.scrollWidth>available+1){
    const pixels=parseFloat(doc.defaultView?.getComputedStyle(el).fontSize||'0');
    if(pixels>0)el.style.fontSize=Math.max(pixels*.2,pixels*available/el.scrollWidth)+'px';
   }
  }
 }
 return true;
}
function decorate(container,cue,style,time,dimensions={}){
 if(style.lookLayout?.family)return decorateLook(container,cue,style,time,dimensions);
 const scene=style.scene||recipes[style.templateId]?.scene||'words';if(scene==='words')return false;
 const {shown,hero,progress}=composition(cue,style,time),doc=container.ownerDocument,theme=style.sceneTheme||{};
 container.replaceChildren();container.dataset.scene=scene;if(!shown.length)return true;
 const scale=(dimensions.height||1920)/1920,size=(style.size||78)*scale;
 Object.assign(container.style,{fontSize:size+'px',fontFamily:style.supportFont||style.font,color:style.color||'#fff',lineHeight:String(style.lineHeight||1.05),textAlign:'center',whiteSpace:'normal',overflow:'visible'});
 const group=doc.createElement('div');group.className='caption-scene scene-'+scene;
 Object.assign(group.style,{display:'flex',position:'relative',justifyContent:'center',alignItems:'center',flexWrap:'wrap',gap:'.18em .28em',transformOrigin:'center',isolation:'isolate'});
 const vertical=['editorial','poster','signature','stack','property','reel'].includes(scene);
 if(vertical)Object.assign(group.style,{flexDirection:'column',gap:'.08em'});
 if(['comic','paint','scribble'].includes(scene))group.style.transform=`rotate(${style.rotation||-3}deg)`;
 if(scene==='glass')Object.assign(group.style,{padding:'.3em .55em',background:'linear-gradient(135deg,#ffffff66,#77889944)',border:'1px solid #ffffff88',borderRadius:'.45em',boxShadow:'inset 0 1px 2px #fff8,0 10px 25px #0005',backdropFilter:'blur(12px)'});
 if(scene==='cinema')Object.assign(group.style,{letterSpacing:'.15em',borderTop:'.015em solid currentColor',borderBottom:'.015em solid currentColor',padding:'.3em .5em'});
 if(scene==='property'||scene==='reel')Object.assign(group.style,{borderLeft:'.09em solid '+(style.highlight||'#ffd700'),padding:'.15em .4em',alignItems:'flex-start',textAlign:'left',background:'#0008'});
 if(scene==='depth')group.style.transform=`perspective(600px) rotateY(${-15+progress*30}deg) rotateX(8deg)`;
 if(scene==='orbit'&&theme.layout==='stack')Object.assign(group.style,{flexDirection:'column',gap:'.1em'});
 if(scene==='lowerthird')Object.assign(group.style,{justifyContent:'flex-start',padding:'.25em .4em',borderLeft:'.13em solid '+(style.highlight||'#ffc34d'),background:'linear-gradient(90deg,#111e,#1110)',textAlign:'left'});
 if(scene==='spine')Object.assign(group.style,{flexDirection:'column',alignItems:'flex-start',borderLeft:'.025em solid currentColor',paddingLeft:'.4em',transform:'rotate(-6deg)'});
 if(scene==='terminal')Object.assign(group.style,{fontFamily:'"Space Mono"',padding:'.4em',background:'#07110ded',border:'.02em solid #48f5aa',color:'#48f5aa',justifyContent:'flex-start'});
 if(scene==='notebook')Object.assign(group.style,{fontFamily:'Caveat',padding:'.25em .45em',background:'repeating-linear-gradient(transparent 0,transparent .95em,#b8d5f266 1em,#b8d5f266 1.02em)',borderLeft:'.025em solid #f8848466',alignItems:'baseline'});
 if(scene==='circular')Object.assign(group.style,{width:'5em',height:'5em',margin:'auto',border:'.025em solid currentColor',borderRadius:'50%',display:'block'});
 if(scene==='marquee')Object.assign(group.style,{flexWrap:'nowrap',borderTop:'.06em solid currentColor',borderBottom:'.06em solid currentColor',padding:'.15em 0',transform:`translateX(${(0.5-progress)*1.2}em)`});
 if(scene==='ticket')Object.assign(group.style,{background:style.highlight||'#ffd45b',color:'#151515',padding:'.4em',border:'.025em dashed #111',boxShadow:'.12em .12em 0 #0008',transform:'rotate(-4deg)'});
 if(scene==='brackets')Object.assign(group.style,{borderLeft:'.08em solid currentColor',borderRight:'.08em solid currentColor',padding:'.2em .5em',background:'linear-gradient(90deg,#fff1,transparent,#fff1)'});
 if(scene==='ribbon')Object.assign(group.style,{background:style.highlight||'#b5ef77',padding:'.2em .6em',clipPath:'polygon(0 0,100% 0,95% 50%,100% 100%,0 100%,5% 50%)',transform:'rotate(-3deg)'});
 if(scene==='terminal'||scene==='barcode'||scene==='countdown'){
  const indicator=doc.createElement('span');indicator.textContent=scene==='terminal'?'>':scene==='countdown'?`${hero+1}/${shown.length}`:'';
  Object.assign(indicator.style,{position:scene==='barcode'?'absolute':'relative',fontFamily:'"Space Mono"',fontSize:'.4em',width:scene==='barcode'?'100%':'auto',height:scene==='barcode'?'.18em':'auto',bottom:'-.25em',background:scene==='barcode'?'repeating-linear-gradient(90deg,currentColor 0,currentColor 2px,transparent 2px,transparent 5px)':'none',transform:scene==='barcode'?`scaleX(${.3+progress*.7})`:'none'});group.appendChild(indicator);
 }
 if(scene==='terminal'){const bar=doc.createElement('i');Object.assign(bar.style,{position:'absolute',left:'0',bottom:'0',height:'.04em',width:progress*100+'%',background:'#48f5aa'});group.appendChild(bar);}
 const contextBefore=shown.slice(0,hero),contextAfter=shown.slice(hero+1);
 function wordNode(word,isHero,index){
  const el=doc.createElement('span');el.textContent=word.text;el.className=isHero?'scene-hero':'scene-support';
  Object.assign(el.style,{position:'relative',display:'inline-block',fontFamily:isHero?(style.heroFont||style.font):(style.supportFont||style.font),fontWeight:String(isHero?(style.weight||800):Math.min(style.weight||600,600)),color:isHero?(style.highlight||word.color):word.color,opacity:String(word.opacity),WebkitTextStroke:(style.outline||0)*scale+'px '+(style.outlineColor||'#151515'),paintOrder:'stroke fill',textShadow:style.shadow?'0 .04em .09em #0009':'none',transformOrigin:'center'});
  if(isHero&&['editorial','poster','signature','serif','comic','paint','outline','reel'].includes(scene))el.style.fontSize=(style.heroRatio||1.5)+'em';
  if(isHero){
   if(theme.heroWeight)el.style.fontWeight=String(theme.heroWeight);
   if(theme.heroUpper)el.style.textTransform='uppercase';
   if(theme.heroTrackingEm!==undefined)el.style.letterSpacing=theme.heroTrackingEm+'em';
   if(theme.heroItalic==='always')el.style.fontStyle='italic';
   if(style.rotation)el.style.transform=`rotate(${style.rotation}deg)`;
   if(theme.heroInk==='hollow')Object.assign(el.style,{color:'transparent',WebkitTextStroke:'.025em '+(style.highlight||'#fff')});
   if(style.gradient)Object.assign(el.style,{backgroundImage:`linear-gradient(180deg,${style.gradient.join(',')})`,backgroundClip:'text',WebkitBackgroundClip:'text',color:'transparent',WebkitTextStroke:'0'});
   const enter=Math.min(1,Math.max(0,(time-word.start)/.22)),rest=1-enter;
   const motions={rise:`translateY(${rest*.6}em)`,drop:`translateY(${-rest*.7}em)`,zoom:`scale(${1-rest*.4})`,stretch:`scaleX(${1+rest*.6})`,flip:`perspective(500px) rotateX(${rest*85}deg)`,skid:`translateX(${rest*.7}em) skewX(${-rest*20}deg)`,stamp:`scale(${1+rest*.5})`,pop:`scale(${1-rest*.5})`};
   if(motions[style.motion])el.style.transform=(el.style.transform||'')+' '+motions[style.motion];
   if(style.motion==='wipe')el.style.clipPath=`inset(0 ${(1-enter)*100}% 0 0)`;
   if(style.motion==='blur')el.style.filter=`blur(${rest*.12}em)`;
   if(style.motion==='flicker')el.style.opacity=enter<1&&Math.sin(time*75)>0?'.3':'1';
  }else{
   if(theme.supportWeight)el.style.fontWeight=String(theme.supportWeight);
   if(theme.supportUpper)el.style.textTransform='uppercase';
   if(theme.supportTrackingEm!==undefined)el.style.letterSpacing=theme.supportTrackingEm+'em';
  }
  if(isHero&&scene==='signature')Object.assign(el.style,{fontStyle:'italic',transform:'rotate(-5deg)',marginTop:'-.1em'});
  if(scene==='poster')Object.assign(el.style,{textTransform:'uppercase',letterSpacing:isHero?'-.04em':'.12em',lineHeight:'.9'});
  if(scene==='stack')el.style.transform=`translateX(${index%2?'.22em':'-.22em'})`;
  if(scene==='outline'&&!isHero)Object.assign(el.style,{color:'transparent',WebkitTextStroke:Math.max(1,size*.018)+'px '+(style.color||'#fff')});
  if(scene==='outline'&&isHero)el.style.transform='scale(1.16)';
  if(scene==='pixel')Object.assign(el.style,{fontFamily:'"Press Start 2P"',fontSize:'.72em',textShadow:`.06em .06em 0 ${style.highlight||'#f0f'}`,transform:word.active?'translateY(-.08em)':'none'});
  if(scene==='typewriter')Object.assign(el.style,{fontFamily:'"Space Mono"',borderBottom:isHero?'.04em solid currentColor':'none',opacity:word.past||word.active?'1':'.35'});
  if(scene==='marker'||(scene==='paint'&&isHero))Object.assign(el.style,{background:style.highlight||'#ffe600',color:style.boxColor||'#111',padding:'0 .15em',boxShadow:'.06em .08em 0 #0004',borderRadius:scene==='paint'?'40% 9% 30% 10%':'.04em'});
  if(scene==='comic')Object.assign(el.style,{textShadow:'.05em .05em 0 #111',WebkitTextStroke:Math.max(1,size*.03)+'px #111',transform:word.active?'rotate(3deg) scale(1.12)':'rotate(-2deg)'});
  if(scene==='gradient')Object.assign(el.style,{backgroundImage:`linear-gradient(120deg,${style.color||'#fff'},${style.highlight||'#f0f'},#59e7ff)`,backgroundClip:'text',WebkitBackgroundClip:'text',color:'transparent',WebkitTextStroke:'0'});
  if(scene==='depth')el.style.textShadow=Array.from({length:8},(_,n)=>`${n+1}px ${n+1}px 0 #252535`).join(',');
  if(scene==='orbit'){
   el.style.transform=`perspective(500px) translate(${Math.sin(progress*4+index)*.2}em,${Math.cos(progress*4+index)*.18}em) rotateY(${Math.sin(progress*3+index)*20}deg) rotate(${(index-hero)*4}deg)`;
   if(theme.motion==='swing')el.style.transform=`rotate(${Math.sin(time*3+index)*12}deg)`;
   if(theme.texture==='flat')el.style.textShadow='none';
   if(theme.puffy&&isHero)el.style.textShadow=`.025em .025em 0 ${theme.puffy},.05em .05em 0 #1118`;
  }
  if(scene==='glitch'&&isHero){el.style.textShadow='-.04em 0 #00ffff,.04em 0 #ff286e';el.style.transform=`translateX(${Math.sin(time*55)>.8?'.04em':'0'})`;}
  if(scene==='splitpill')Object.assign(el.style,{padding:'.12em .25em',borderRadius:'.7em',background:isHero?(style.highlight||'#ffd45b'):'#111c',color:isHero?'#111':'#fff',transform:isHero?'translateY(-.12em)':'none'});
  if(scene==='barcode')Object.assign(el.style,{transform:`scaleY(${word.active?1.25:1})`,fontWeight:'900',letterSpacing:'-.06em'});
  if(scene==='satellite')Object.assign(el.style,{border:isHero?'0':'.02em solid currentColor',borderRadius:'50%',padding:'.15em',fontSize:isHero?'1.5em':'.6em',transform:`translateY(${Math.sin(progress*6+index)*.4}em)`});
  if(scene==='terminal')Object.assign(el.style,{fontFamily:'"Space Mono"',color:word.active?'#c9ffe4':'#48f5aa',opacity:word.past||word.active?'1':'.3'});
  if(scene==='notebook')Object.assign(el.style,{fontFamily:'Caveat',textDecoration:isHero?'underline':'none',textDecorationColor:style.highlight||'#ffc34d',transform:`rotate(${index%2?2:-2}deg)`});
  if(scene==='circular'){const angle=(index/shown.length)*Math.PI*2-Math.PI/2;Object.assign(el.style,{position:'absolute',left:(50+Math.cos(angle)*40)+'%',top:(50+Math.sin(angle)*40)+'%',fontSize:'.55em',transform:`translate(-50%,-50%) rotate(${angle*180/Math.PI+90}deg)`});}
  if(scene==='spotlight')Object.assign(el.style,{filter:isHero?'none':'blur(.025em)',opacity:isHero?'1':'.25',transform:isHero?'scale(1.22)':'scale(.95)',textShadow:isHero?'0 0 .3em currentColor':'none'});
  if(scene==='stagger')el.style.transform=`translateY(${index*.13}em) rotate(-3deg)`;
  if(scene==='wave')el.style.transform=`translateY(${Math.sin(time*5+index*.9)*.15}em) rotate(${Math.sin(time*5+index*.9)*5}deg)`;
  if(scene==='ribbon'||scene==='ticket')Object.assign(el.style,{color:'#151515',textShadow:'none',WebkitTextStroke:'0'});
  if(scene==='scribble'&&isHero){const mark=doc.createElement('i');Object.assign(mark.style,{position:'absolute',pointerEvents:'none',left:'-6%',width:'112%',height:style.decoration==='circle'?'105%':'.17em',bottom:style.decoration==='circle'?'-5%':'-.07em',border:'.035em solid '+(style.highlight||'#ffe600'),borderRadius:style.decoration==='circle'?'50%':'40%',transform:'rotate(-4deg)',borderTop:style.decoration==='circle'?undefined:'0'});el.appendChild(mark);}
  return el;
 }
 // Context stays in reading order: hero is the currently spoken word.
 if(vertical){for(const [words,isHero] of [[contextBefore,false],[shown[hero]?[shown[hero]]:[],true],[contextAfter,false]]){if(!words.length)continue;const line=doc.createElement('div');line.style.maxWidth='100%';words.forEach((w,i)=>{if(i)line.appendChild(doc.createTextNode(' '));line.appendChild(wordNode(w,isHero,i));});group.appendChild(line);}}
 else shown.forEach((w,i)=>group.appendChild(wordNode(w,i===hero,i)));
 container.appendChild(group);return true;
}
const api={sceneStyle,decorate,composition,recipes,families,originals,supportedNames:Object.keys(recipes)};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.CliporaScenes=api;
})(typeof window==='undefined'?globalThis:window);
