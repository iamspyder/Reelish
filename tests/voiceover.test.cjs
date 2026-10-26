const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),media=require('../src/media.cjs'),voice=require('../src/voiceover.cjs');
test('voiceover recordings are bounded, validated and saved as playable audio',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'reelish-voice-test-'));try{
  await assert.rejects(voice.save('bad',dir,media),/format/);await assert.rejects(voice.save('<script>',dir,media),/Invalid/);
  const file=path.join(dir,'microphone-fixture.webm');await media.run(media.ffmpeg,['-y','-f','lavfi','-i','sine=frequency=500:duration=0.3','-c:a','libopus',file]);
  const result=await voice.save((await fs.readFile(file)).toString('base64'),path.join(dir,'saved'),media);assert.ok(result.audio);assert.ok(result.duration>.2);assert.equal(result.name,'Voiceover');assert.ok((await fs.stat(result.path)).size>100);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
