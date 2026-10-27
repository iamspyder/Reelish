const {test}=require('node:test'),assert=require('node:assert/strict'),color=require('../src/color-tools.js');
test('source crop stays inside media and curves have deterministic identity',()=>{
 assert.deepEqual(color.cropRect({x:.2,y:.1,width:.5,height:.6},1000,500),{x:200,y:50,width:500,height:300});
 const edge=color.cropRect({x:2,width:2},100,100);assert.equal(edge.x,95);assert.ok(Math.abs(edge.width-5)<1e-8);assert.equal(edge.height,100);
 assert.deepEqual([...color.table()],Array.from({length:256},(_,i)=>i));assert.equal(color.changed(color.normalized({})),false);
});
test('RGB curves affect pixels without changing alpha and vignette darkens edges',()=>{
 const data=new Uint8ClampedArray([128,128,128,180]);color.pixels(data,1,1,{curves:{red:[0,.5,.75,.9,1],blue:[0,.1,.2,.5,1]}});assert.ok(data[0]>128);assert.ok(data[2]<128);assert.equal(data[3],180);
 const image=new Uint8ClampedArray(100*100*4).fill(255);color.pixels(image,100,100,{vignette:1});assert.ok(image[0]<image[(50*100+50)*4]);assert.equal(image[3],255);
});
