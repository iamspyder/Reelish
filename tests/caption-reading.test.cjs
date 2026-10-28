const {test}=require('node:test'),assert=require('node:assert/strict'),engine=require('../src/caption-engine.js'),speech=require('../src/speech.cjs'),scenes=require('../src/style-scenes.js'),looks=require('../src/look-presets.json');
require('../src/templates.js');
const rapid=Array.from({length:24},(_,i)=>({text:'word'+i,start:i*.15,end:(i+1)*.15,confidence:.9}));

test('readable paging keeps a short phrase visible while exact pages follow the word clock',()=>{
 const cue={start:0,end:1.2,text:'one two three four five six',words:Array.from({length:6},(_,i)=>({text:['one','two','three','four','five','six'][i],start:i*.2,end:(i+1)*.2}))};
 const readable={wordsPerLine:2,lines:1,captionPacing:'readable'},exact={...readable,captionPacing:'exact'};
 assert.equal(engine.frame(cue,readable,1.1).page,0);assert.equal(engine.frame(cue,readable,1.1).words.filter(w=>w.visible).length,6);
 assert.equal(engine.frame(cue,exact,1.1).page,2);assert.equal(engine.frame(cue,exact,1.1).words.find(w=>w.active).text,'six');
 const rebuilt=engine.regroupCues([{...cue,timingSource:'ai-estimated'}]);assert.ok(rebuilt.every(c=>c.timingSource==='ai-estimated'));
});
test('readable phrases reduce rapid five-word fragments without moving measured word timing',()=>{
 const cues=engine.groupTimedWords(rapid);
 assert.equal(cues.length,3);for(const c of cues)assert.ok(c.end-c.start>=1.19);
 assert.deepEqual(cues.flatMap(c=>c.words),rapid);assert.equal(cues[0].text,'word0 word1 word2 word3 word4 word5 word6 word7');
});
test('a real speech pause remains a gap, including a genuinely short utterance',()=>{
 const words=[{text:'Yes.',start:0,end:.3},{text:'After',start:2,end:2.4},{text:'a',start:2.4,end:2.5},{text:'pause.',start:2.5,end:3.2}],cues=engine.groupTimedWords(words);
 assert.equal(cues.length,2);assert.equal(cues[0].end,.3);assert.equal(cues[1].start,2);assert.deepEqual(cues.flatMap(c=>c.words),words);
});
test('rebuilding fragments preserves per-line styles, measured words and emphasis',()=>{
 const cues=Array.from({length:4},(_,i)=>({id:String(i),start:i*.6,end:(i+1)*.6,text:'one two',words:[{text:'one',start:i*.6,end:i*.6+.3,confidence:.8},{text:'two',start:i*.6+.3,end:(i+1)*.6}],emphasisIndices:[1],...(i>=2?{style:{color:'#f00'}}:{})}));
 const result=engine.regroupCues(cues,{maxWords:6,minDuration:1.2});assert.equal(result.length,2);assert.equal(result[1].style.color,'#f00');assert.equal(result[0].words[0].confidence,.8);assert.equal(result[0].words[0].emphasis,false);assert.equal(result[0].words[1].emphasis,true);
 assert.deepEqual(result.flatMap(c=>c.words).map(w=>[w.start,w.end]),cues.flatMap(c=>c.words).map(w=>[w.start,w.end]));assert.equal(cues[0].words[0].emphasis,undefined);
});
test('new speech grouping uses readable duration; explicit exact word counts remain available',()=>{
 const json={transcription:rapid.map(w=>({text:w.text,offsets:{from:w.start*1000,to:w.end*1000}}))};
 assert.equal(speech.fromWhisper(json,4).length,3);assert.equal(speech.fromWhisper(json,4,4).length,6);
});
test('a measured word gap holds the previous hero instead of flashing a future word',()=>{
 const cue={start:0,end:3,text:'one two three',words:[{text:'one',start:0,end:.4},{text:'two',start:.8,end:1.2},{text:'three',start:2,end:3}]};
 const scene=scenes.composition(cue,{animation:'highlight'},.6);assert.equal(scene.hero,0);assert.equal(scene.shown.some(w=>w.active),false);
 assert.equal(scenes.composition(cue,{animation:'highlight'},1.6).hero,1);
});
function render(metadata,patch={}){
 class E{constructor(doc){this.ownerDocument=doc;this.children=[];this.style={opacity:''};this.dataset={};}appendChild(n){this.children.push(n);return n;}replaceChildren(){this.children=[];}}
 const doc={createElement(){return new E(doc);}},container=new E(doc),style={...scenes.sceneStyle(metadata.id,{size:metadata.sizePx*4,position:metadata.positionYPct,outline:0},metadata),...patch};
 scenes.decorate(container,{start:0,end:3,text:'Make words count'},style,1.1,{height:1920,width:1080});return {container,style,group:container.children[0]};
}
test('moving a two-layer look moves impact and support together; resizing scales both',()=>{
 const m=looks.find(x=>x.id==='look_beacon'),a=render(m),b=render(m,{position:58,size:m.sizePx*2}),impact=x=>x.group.children.find(el=>el.className==='look-impact');
 assert.equal(impact(a).style.top,impact(b).style.top,'relative offset must not cancel the new overall position');assert.equal(parseFloat(impact(b).style.fontSize),parseFloat(impact(a).style.fontSize)/2);assert.equal(parseFloat(b.container.style.fontSize),parseFloat(a.container.style.fontSize)/2);
});
test('detailed look text honors customized line height, outline and emphasis scale',()=>{
 const m=looks.find(x=>x.id==='look_anchorage'),{group}=render(m,{lineHeight:1.6,outline:7,outlineColor:'#123456',activeScale:1.8}),words=group.children[0].children;
 assert.ok(words.every(w=>w.style.lineHeight==='1.6'));assert.ok(words.every(w=>w.style.WebkitTextStroke==='7px #123456'));assert.ok(words.some(w=>w.style.fontSize==='1.8em'));
});
