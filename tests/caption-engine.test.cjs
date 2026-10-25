const {test}=require('node:test');
const assert=require('node:assert/strict');
const engine=require('../src/caption-engine.js');
const cue={start:1,end:3,text:'Hello world',words:[{text:'Hello',start:1,end:1.4},{text:'world',start:1.6,end:3}]};
test('word metadata drives active highlights and preserves gaps',()=>{
 assert.equal(engine.frame(cue,{animation:'highlight'},1.2).words[0].color,'#ffe600');
 assert.equal(engine.frame(cue,{animation:'highlight'},1.5).words.some(w=>w.active),false);
 assert.equal(engine.frame(cue,{animation:'word'},1.7).words.filter(w=>w.visible)[0].text,'world');
 assert.equal(engine.frame(cue,{},3).visible,false);
});
test('invalid word metadata falls back to proportional Unicode safe timing',()=>{
 const words=engine.timedWords({start:0,end:4,text:'😀 abc',words:[{start:100,end:101}]});
 assert.deepEqual(words.map(w=>[w.start,w.end]),[[0,1],[1,4]]);
});
test('ASS uses precise boundaries, font, explicit position and duration clipping',()=>{
 const ass=engine.makeAss({clips:[{in:0,out:2}],style:{font:'Poppins',animation:'highlight',xPosition:42,position:70},cues:[cue,{start:4,end:5,text:'excluded'}]},1080,1920);
 assert.match(ass,/Style: Default,Poppins/);assert.match(ass,/0:00:01.00,0:00:01.40/);assert.match(ass,/0:00:01.60,0:00:02.00/);assert.match(ass,/\\pos\(453.6,1344\)/);assert.doesNotMatch(ass,/excluded/);assert.match(ass,/\\1c&H00e6ff&/i);
});
test('paging bounds displayed lines and typewriter reveals only started words',()=>{
 const c={start:0,end:8,text:'one two three four five six seven eight'};
 assert.equal(engine.frame(c,{wordsPerLine:2,lines:1},7).words.filter(w=>w.visible).length,2);
 assert.equal(engine.frame(c,{animation:'typewriter'},0).words.filter(w=>w.visible).length,1);
 assert.equal(engine.escapeAss('{x}\\a\nhi'),'\\{x\\}\\\\a\\Nhi');
});
test('cue style and word emphasis override global styling consistently',()=>{
 const c={...cue,style:{font:'Anton',highlight:'#00ff00'},emphasisIndices:[1]};
 const first=engine.frame(c,{animation:'highlight'},1.2);
 assert.equal(first.style.font,'Anton');assert.equal(first.words[0].color,'#ffffff');
 assert.equal(first.words[0].progress,.5);
 assert.equal(engine.frame(c,{animation:'highlight'},2).words[1].color,'#00ff00');
 const ass=engine.makeAss({duration:4,style:{animation:'highlight'},cues:[c]});
 assert.match(ass,/\\fnAnton/);assert.match(ass,/\\1c&H00ff00&/);
});
test('hero highlight scales active words and mutes context in preview and export',()=>{
 const style={animation:'highlight',activeScale:1.3,mutedOpacity:.32,box:true};
 const f=engine.frame(cue,style,1.2);
 assert.equal(f.words[0].scale,1.3);assert.equal(f.words[1].scale,1);
 assert.equal(f.words[0].opacity,1);assert.equal(f.words[1].opacity,.32);
 assert.ok(f.words.every(w=>w.box));assert.equal(f.style.boxColor,'#000000');
 const ass=engine.makeAss({duration:4,style,cues:[cue]});
 assert.match(ass,/\\fscx130/);assert.match(ass,/\\alpha&Had&/i);assert.match(ass,/\\3c&H000000&/);
 const fade=engine.makeAss({duration:4,style:{animation:'fade',mutedOpacity:.32},cues:[cue]});
 assert.match(fade,/\\t\(0,120,\\alpha&Had&\)/i);
});
