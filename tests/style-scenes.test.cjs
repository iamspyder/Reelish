const {test}=require('node:test');
const assert=require('node:assert/strict');
const scenes=require('../src/style-scenes.js');
const looks=require('../src/look-presets.json');
require('../src/templates.js');
test('every reference catalog entry has an explicit composition recipe',()=>{
 for(const p of [...looks,...global.CliporaPresets.templates])assert.ok(scenes.recipes[p.id],p.id);
 assert.ok(new Set(Object.values(scenes.recipes).map(r=>r.scene)).size>=20);
 for(const p of looks)assert.ok(p.family,'missing extracted family '+p.id);
 for(const p of scenes.originals)assert.ok(scenes.recipes[p.id],p.id);
 assert.equal(new Set(scenes.originals.map(p=>p.id)).size,scenes.originals.length);
});
test('scene metadata preserves colors, font pairing and layout intent',()=>{
 const s=scenes.sceneStyle('look_beacon',{color:'#fff',size:78},{font:'Montserrat, sans-serif',accentFont:'KaushanScript, cursive'});
 assert.equal(s.scene,'signature');assert.equal(s.heroFont,'Kaushan Script');assert.equal(s.supportFont,'Montserrat');assert.equal(s.color,'#fff');assert.equal(s.sceneApproximation,true);
});
test('composition uses supplied word timing and hides out-of-cue scenes',()=>{
 const cue={start:0,end:2,text:'one two',words:[{text:'one',start:0,end:.5},{text:'two',start:.5,end:2}]};
 assert.equal(scenes.composition(cue,{animation:'highlight'},1).hero,1);
 assert.equal(scenes.composition(cue,{},3).shown.length,0);
});
test('all composition renderers emit safe text nodes at deterministic video time',()=>{
 class Element{constructor(doc){this.ownerDocument=doc;this.style={opacity:''};this.dataset={};this.children=[];}appendChild(n){this.children.push(n);return n;}replaceChildren(){this.children=[];}}
 const doc={createElement(){return new Element(doc);},createTextNode(text){return {textContent:text};}};
 const cue={start:0,end:3,text:'Safe <script> text'};
 for(const scene of scenes.families.filter(s=>s!=='words')){
  const container=new Element(doc);
  assert.equal(scenes.decorate(container,cue,{scene,size:78,animation:'highlight',heroFont:'Inter',gradient:['#fff','#f00'],motion:'flip'},1,{height:1920}),true,scene);
  assert.equal(container.dataset.scene,scene);assert.equal(container.children.length,1);
  assert.equal(container.children[0].className,'caption-scene scene-'+scene);
 }
});

function fixture(){
 class Element{constructor(doc){this.ownerDocument=doc;this.style={opacity:''};this.dataset={};this.children=[];}appendChild(n){this.children.push(n);return n;}replaceChildren(){this.children=[];}}
 const doc={createElement(){return new Element(doc);},createTextNode(text){return {textContent:text};}};
 return {doc,container:()=>new Element(doc)};
}
function renderLook(id,time=1.1){
 const m=looks.find(p=>p.id===id),style=scenes.sceneStyle(id,{...global.CliporaPresets.base,size:m.sizePx*4,color:m.color,highlight:m.accent,position:m.positionYPct},m),f=fixture(),container=f.container();
 const cue={start:0,end:3,text:'Make every word count',words:[{text:'Make',start:0,end:.6},{text:'every',start:.6,end:1},{text:'word',start:1,end:2},{text:'count',start:2,end:3}]};
 scenes.decorate(container,cue,style,time,{width:1080,height:1920});return {container,style,group:container.children[0]};
}
function walk(node){return [node,...(node.children||[]).flatMap(walk)];}
test('catalog looks retain their full composition data and do not fall through generic scenes',()=>{
 for(const m of looks){
  const {container,style,group}=renderLook(m.id);
  assert.equal(container.dataset.scene,'look-'+m.family,m.id);
  assert.deepEqual(style.lookLayout,m);assert.notEqual(style.lookLayout,m);
  assert.ok(group.children.length,m.id);
  assert.equal(style.supportFont,global.CliporaPresets.aliasFont(m.font),m.id);
 }
});
test('behind looks draw measured hero face above support rather than a generic outlined poster',()=>{
 const {group}=renderLook('look_beacon'),impact=group.children.find(el=>el.className==='look-impact');
 assert.ok(impact);assert.equal(impact.style.fontFamily,'Kaushan Script');assert.ok(Math.abs(parseFloat(impact.style.top)+971.52)<.001);
 assert.equal(group.children[0].children[0].style.fontFamily,'Montserrat');
 assert.notEqual(renderLook('look_cove').group.children.at(-1).style.fontFamily,impact.style.fontFamily);
});
test('stack and emphasis layouts preserve row scale, curved context and hero ratio',()=>{
 const rows=renderLook('look_yawl').group.children;
 assert.equal(rows[0].style.fontSize,'1em');assert.equal(rows[1].style.fontSize,'1.9em');
 const emphasis=renderLook('look_vang').group.children[0];assert.equal(emphasis.dataset.layout,'curve');
 assert.equal(emphasis.children[2].style.fontSize,'1em');assert.ok(parseFloat(emphasis.children[0].style.fontSize)<.5);
});
test('story and spatial themes produce different ink, geometry and deterministic motion',()=>{
 const hollow=walk(renderLook('look_casement').group).find(x=>x.className?.includes('look-story-hero'));
 assert.equal(hollow.style.color,'transparent');assert.ok(hollow.style.WebkitTextStroke.includes('#9BE7FF'));
 const gradient=walk(renderLook('look_foyer').group).find(x=>x.className?.includes('look-story-hero'));
 assert.ok(gradient.style.backgroundImage.includes('#E8A0B4'));assert.ok(gradient.style.clipPath);
 const stair=renderLook('look_tread').group,stack=renderLook('look_terrazzo').group;
 assert.equal(stair.dataset.layout,'stair');assert.equal(stack.dataset.layout,'stack');
 assert.equal(stair.children[0].style.alignSelf,'flex-start');assert.equal(stair.children[1].style.alignSelf,'flex-end');
 assert.notEqual(renderLook('look_fanlight',1.02).group.children[2].style.transform,renderLook('look_fanlight',1.15).group.children[2].style.transform);
});
test('changing the font and weight still affects paired caption and impact faces',()=>{
 const m=looks.find(p=>p.id==='look_beacon'),f=fixture(),container=f.container();
 const style={...scenes.sceneStyle(m.id,{size:92,color:'#fff',highlight:'#abc',position:78},m),font:'Noto Sans',weight:600};
 scenes.decorate(container,{start:0,end:2,text:'one two'},style,1,{height:1920,width:1080});
 const text=walk(container).filter(x=>x.className==='scene-hero'||x.className==='scene-support'||x.className==='look-impact');
 assert.ok(text.length>=3);for(const el of text){assert.equal(el.style.fontFamily,'Noto Sans');assert.equal(el.style.fontWeight,'600');}
});
test('row entrance fades become visible with actual CSS empty opacity defaults',()=>{
 for(const id of ['look_mizzen','look_windlass','look_outhaul','look_underway']){
  const {group}=renderLook(id,1.1),rows=group.children.filter(x=>x.className==='look-row');
  assert.ok(rows.length,id);assert.ok(rows.some(row=>Number(row.style.opacity||1)>.9),id+' invisible row');
 }
});
