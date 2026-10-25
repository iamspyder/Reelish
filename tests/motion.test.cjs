const test=require('node:test'),assert=require('node:assert/strict'),motion=require('../src/motion.js');
test('keyframes interpolate clip-relative transforms and hold boundaries',()=>{
 const clip={zoom:1,keyframes:[{time:0,zoom:1,x:0,easing:'linear'},{time:2,zoom:3,x:1,opacity:0}]};
 assert.equal(motion.sample(clip,1).zoom,2);assert.equal(motion.sample(clip,1).x,.5);assert.equal(motion.sample(clip,-1).zoom,1);assert.equal(motion.sample(clip,5).zoom,3);assert.equal(motion.sample(clip,2).opacity,0);
});
test('easing, sparse properties, duplicate times and unsafe values',()=>{
 assert.equal(motion.sample({keyframes:[{time:0,zoom:1,easing:'hold'},{time:1,zoom:2}]},.9).zoom,1);
 assert.equal(motion.sample({keyframes:[{time:0,zoom:1,easing:'cubic'},{time:2,zoom:3}]},.5).zoom,1.3125);
 const value=motion.sample({keyframes:[{time:0,zoom:2},{time:0,zoom:3},{time:1,x:Infinity},{time:NaN,zoom:8}]},0);
 assert.equal(value.zoom,3);assert.equal(value.x,0);assert.equal(motion.sample({opacity:50},NaN).opacity,1);
});
