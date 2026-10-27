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
test('speech is blocked before reading audio or contacting any provider',async()=>{
 const {handle}=await import('../services/captions/worker.mjs');let called=false;
 for(const env of [{},{OPENROUTER_API_KEY:'test',OPENROUTER_SPEECH_MODEL:'paid-model',ALLOW_PAID_SPEECH:'true'}]){
  const response=await handle(new Request('https://captions.example/v1/transcribe',{method:'POST',body:'audio'}),env,()=>{called=true;});
  assert.equal(response.status,403);assert.match((await response.json()).error,/free models only/);
 }
 assert.equal(called,false);
});
test('quota failures, inactive services and invalid responses are explicit',async()=>{
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:null}),/not been activated/);
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:'https://captions.example',request:async()=>Response.json({error:'quota'}, {status:429})}),/quota/);
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:'https://captions.example',request:async()=>new Response('broken')}),/invalid response/);
 await assert.rejects(online.upload(Buffer.alloc(1),'en',{url:'https://captions.example',request:async()=>{throw Error('offline');}}),/Cannot reach/);
});
test('health exposes free-only policy and separate speech capability',async()=>{
 const {handle}=await import('../services/captions/worker.mjs');
 const health=await (await handle(new Request('https://captions.example/health'),{})).json();
 assert.equal(health.ready,false);assert.equal(health.freeOnly,true);assert.equal(health.speechEnabled,false);
 assert.equal(online.status().speechEnabled,false);
});
test('desktop refuses speech without processing or uploading media',async()=>{
 const oldFetch=global.fetch;let called=false;
 try{global.fetch=()=>{called=true;};await assert.rejects(online.transcribe({},{}),/free models only/);assert.equal(called,false);}finally{global.fetch=oldFetch;}
});
