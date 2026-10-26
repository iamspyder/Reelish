const {test}=require('node:test'),assert=require('node:assert/strict'),layers=require('../src/layers.js'),core=require('../src/core.cjs');
test('graphics cover twelve compositions with 36 editable designs',()=>{assert.equal(Object.keys(layers.kinds).length,12);assert.equal(layers.presets.length,36);assert.equal(new Set(layers.presets.map(p=>p.id)).size,36);});
test('graphic normalization and visibility have deterministic timing boundaries',()=>{const l=layers.normalize({kind:'quote',text:'Hello',start:1,end:2,positionX:999,color:'url(invalid)',opacity:NaN});assert.equal(l.positionX,100);assert.equal(l.opacity,1);assert.match(l.color,/^#/);assert.equal(layers.active([l],.99).length,0);assert.equal(layers.active([l],1).length,1);assert.equal(layers.active([l],2).length,0);});
test('trim and pause removal preserve timed graphics and adjustments',()=>{
 const p={version:1,clips:[{path:'a',in:0,out:5}],cues:[],style:{},layers:[{id:'l',start:2,end:4,text:'Title'}],adjustments:[{id:'g',start:1,end:4,grade:{saturation:0}}]};
 const trimmed=core.trimClip(p,0,1,5);assert.equal(trimmed.layers[0].start,1);assert.equal(trimmed.adjustments[0].start,0);
 const cut=core.removeRanges(p,[{path:'a',start:0,end:1}]);assert.equal(cut.layers[0].end,3);assert.equal(cut.adjustments[0].end,3);
});
