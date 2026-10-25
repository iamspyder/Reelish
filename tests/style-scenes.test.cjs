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
 class Element{constructor(doc){this.ownerDocument=doc;this.style={};this.dataset={};this.children=[];}appendChild(n){this.children.push(n);return n;}replaceChildren(){this.children=[];}}
 const doc={createElement(){return new Element(doc);},createTextNode(text){return {textContent:text};}};
 const cue={start:0,end:3,text:'Safe <script> text'};
 for(const scene of scenes.families.filter(s=>s!=='words')){
  const container=new Element(doc);
  assert.equal(scenes.decorate(container,cue,{scene,size:78,animation:'highlight',heroFont:'Inter',gradient:['#fff','#f00'],motion:'flip'},1,{height:1920}),true,scene);
  assert.equal(container.dataset.scene,scene);assert.equal(container.children.length,1);
  assert.equal(container.children[0].className,'caption-scene scene-'+scene);
 }
});
