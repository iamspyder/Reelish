const {test}=require('node:test'),assert=require('node:assert/strict');
const online=require('../src/online-speech.cjs');
test('online captions require an explicit HTTPS publisher origin',()=>{
 assert.equal(online.serviceUrl(null),null);
 assert.equal(online.serviceUrl('https://captions.example'), 'https://captions.example');
 for(const url of ['http://localhost','https://key@example.com','https://example.com/path','https://example.com/?key=x'])assert.throws(()=>online.serviceUrl(url));
});
test('online word timing survives grouping, gaps and duration bounds',()=>{
 const cues=online.fromResponse({words:[{word:'hello',start:-.1,end:.4},{word:'there',start:.5,end:.9},{word:'next',start:2,end:4},{word:'bad',start:NaN,end:3},{word:'outside',start:8,end:9}]},3);
 assert.equal(cues.length,2);assert.equal(cues[0].start,0);assert.equal(cues[0].text,'hello there');assert.equal(cues[1].end,3);assert.equal(cues[0].words[1].start,.5);
 assert.equal(online.fromResponse({segments:[{start:0,end:1,text:'fallback'}]},2)[0].text,'fallback');
});
test('publisher service forwards audio with a server-only credential',async()=>{
 const {handle}=await import('../services/captions/worker.mjs');let called=false;
 const data=await online.upload(Buffer.from('fLaC-demo'),'en',{url:'https://captions.example',request:async(url,options)=>{
  assert.equal(url,'https://captions.example/v1/transcribe');assert.equal(options.headers,undefined,'no provider key in desktop request');
  return handle(new Request(url,options),{GROQ_API_KEY:'server-only-test-secret',CAPTION_LIMITER:{limit:async()=>({success:true})}},async(url,options)=>{
   called=true;assert.equal(url,'https://api.groq.com/openai/v1/audio/transcriptions');assert.equal(options.headers.Authorization,'Bearer server-only-test-secret');
   assert.equal(options.body.get('model'),'whisper-large-v3-turbo');assert.equal(options.body.get('language'),'en');assert.equal(await options.body.get('file').text(),'fLaC-demo');
   return Response.json({words:[{word:'hello',start:0,end:.5}]});
  });
 }});
 assert.ok(called);assert.equal(data.words[0].word,'hello');
});
test('quota failures, inactive services and invalid responses are explicit',async()=>{
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:null}),/not been activated/);
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:'https://captions.example',request:async()=>Response.json({error:'quota'}, {status:429})}),/quota/);
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:'https://captions.example',request:async()=>new Response('broken')}),/invalid response/);
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:'https://captions.example',request:async()=>{throw Error('offline');}}),/Cannot reach/);
});
test('worker refuses missing configuration and invalid uploads',async()=>{
 const {handle}=await import('../services/captions/worker.mjs');
 assert.equal((await (await handle(new Request('https://captions.example/health'),{})).json()).ready,false);
 assert.equal((await handle(new Request('https://captions.example/v1/transcribe',{method:'POST'}),{})).status,503);
 const env={GROQ_API_KEY:'test',CAPTION_LIMITER:{limit:async()=>({success:true})}};
 assert.equal((await handle(new Request('https://captions.example/v1/transcribe',{method:'POST',body:'bad'}),env)).status,415);
 const form=new FormData();form.set('file',new Blob(['video'],{type:'video/mp4'}),'video.mp4');
 assert.equal((await handle(new Request('https://captions.example/v1/transcribe',{method:'POST',body:form}),env)).status,415);
 env.CAPTION_LIMITER.limit=async()=>({success:false});
 assert.equal((await handle(new Request('https://captions.example/v1/transcribe',{method:'POST'}),env)).status,429);
});
test('online pipeline extracts and concatenates trimmed audio without rendering video',async()=>{
 const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),media=require('../src/media.cjs');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'reelish-online-test-')),config=require('../src/caption-service.json'),oldUrl=config.url,oldFetch=global.fetch;
 try{
  const file=path.join(dir,'source.mp4');await media.run(media.ffmpeg,['-y','-f','lavfi','-i','color=c=blue:s=64x64:r=10:d=2','-f','lavfi','-i','sine=frequency=440:sample_rate=16000:duration=2','-c:v','libx264','-c:a','aac','-shortest',file]);
  config.url='https://captions.example';let captured=false;
  global.fetch=async(url,options)=>{captured=true;const audio=Buffer.from(await options.body.get('file').arrayBuffer());assert.equal(audio.subarray(0,4).toString(),'fLaC');assert.ok(audio.length>1000);const audioFile=path.join(dir,'actual.flac');await fs.writeFile(audioFile,audio);const info=await media.probe(audioFile);assert.ok(Math.abs(info.duration-1.5)<.1,'trimmed clips concatenate in project order');return Response.json({words:[{word:'working',start:.1,end:.8}]});};
  const project={version:1,name:'Online test',clips:[{path:file,in:.2,out:1.2},{path:file,in:1.3,out:1.8}],cues:[],style:{},aspect:'9:16'};
  const cues=await online.transcribe(project,{language:'en'});assert.ok(captured);assert.equal(cues[0].text,'working');assert.equal(cues[0].words[0].start,.1);
 }finally{config.url=oldUrl;global.fetch=oldFetch;await fs.rm(dir,{recursive:true,force:true});}
});
