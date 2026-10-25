const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const audio=require('../src/audio-render.cjs'),media=require('../src/media.cjs');
test('all procedural effects render, and timeline mix preserves silence and timing',async()=>{
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'clipora-audio-test-'));
 try{
  for(const id of Object.keys(audio.effects)){const file=path.join(tmp,id+'.wav');await audio.generateEffect(id,file);const info=await media.probe(file);assert.equal(info.audio,true);assert.ok(Math.abs(info.duration-audio.effects[id].duration)<.03);}
  const video=path.join(tmp,'silent.mp4');await media.run(media.ffmpeg,['-y','-f','lavfi','-i','color=black:s=32x32:r=10:d=1','-an','-c:v','libx264',video]);
  const mixed=path.join(tmp,'mix.wav');await audio.renderAudio({clips:[{path:video,in:0,out:.5},{path:path.join(tmp,'chime.wav'),in:.1,out:.6}],music:{path:path.join(tmp,'riser.wav'),volume:.1},sounds:[{path:path.join(tmp,'pop.wav'),start:.3,volume:.5}]},mixed);const result=await media.probe(mixed);assert.ok(Math.abs(result.duration-1)<.03);assert.equal(result.audio,true);
  await assert.rejects(audio.generateEffect('unknown',path.join(tmp,'no.wav')),/Unknown/);
  await assert.rejects(audio.renderAudio({clips:[{path:video,in:1,out:0}]},mixed),/Invalid/);
 }finally{await fs.rm(tmp,{recursive:true,force:true});}
});
