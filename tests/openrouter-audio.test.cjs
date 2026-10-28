const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),audio=require('../src/openrouter-audio.cjs');
const model=(id='nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',pricing={prompt:'0',completion:'0',audio:'0'})=>({id,pricing,architecture:{input_modalities:['audio','text'],output_modalities:['text']}});
const project={version:1,style:{},clips:[{path:'test-only.mp4',in:1,out:26}],cues:[]};
const fakeMedia={ffmpeg:'test-only-ffmpeg',probe:async()=>({audio:true}),run:async(exe,args)=>{assert.equal(exe,'test-only-ffmpeg');await fs.writeFile(args.at(-1),Buffer.from('test-audio'));},cancel(){}};
test('audio model selection requires explicit free identity, audio input and all-zero catalog prices',()=>{
 assert.equal(audio.selectModel({data:[model('thinkingmachines/inkling-small:free'),model()]}).id,model().id);
 for(const item of [model('paid/audio'),model(undefined,{prompt:0,completion:0,audio:.01}),model(undefined,{prompt:0,completion:0,audio:null}),{...model(),architecture:{input_modalities:['text'],output_modalities:['text']}}])assert.throws(()=>audio.selectModel({data:[item]}),/zero-price/);
});
test('model text becomes explicitly estimated captions bounded to its chunk, never measured timestamps',()=>{
 const cues=audio.estimatedCues('```json\n{"segments":[{"start":0.5,"end":3,"text":"Hello world from audio"}]}\n```',12,4,model().id);
 assert.equal(cues[0].start,12.5);assert.equal(cues.at(-1).end,15);assert.equal(cues.map(c=>c.text).join(' '),'Hello world from audio');
 for(const cue of cues){assert.equal(cue.timingSource,'ai-estimated');assert.match(cue.timingNotice,/review/i);for(const word of cue.words)assert.equal(word.timingSource,'ai-estimated');}
 assert.deepEqual(audio.textSegments('{"segments":[]}',3),[]);
 assert.throws(()=>audio.textSegments('{"segments":[{"start":2,"end":1,"text":"bad"}]}',3),/invalid estimated/);
});
test('pipeline checks live prices before upload, uses trimmed audio chunks and preserves zero-cost limits',async()=>{
 let calls=0;const progress=[];const cues=await audio.transcribe(project,{language:'hi',outputScript:'hinglish'},p=>progress.push(p),{mode:'personal',key:'test-only-key'},{media:fakeMedia,request:async(url,options)=>{
  assert.equal(options.redirect,'error');calls++;
  if(url===audio.CATALOG){assert.equal(options.headers,undefined);return Response.json({data:[model()]});}
  assert.equal(url,audio.COMPLETIONS);assert.equal(options.headers.Authorization,'Bearer test-only-key');
  const body=JSON.parse(options.body);assert.equal(body.model,model().id);assert.equal(body.provider.allow_fallbacks,false);assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});assert.match(body.messages[0].content,/Roman-letter Hinglish/);assert.equal(body.messages[1].content[0].input_audio.format,'flac');
  return Response.json({choices:[{message:{content:JSON.stringify({text:'Hello actual speech words'})}}]});
 }});
 assert.equal(calls,4,'one public catalog read plus three bounded chunks');assert.ok(cues.length>=3);assert.equal(cues[0].start,0);assert.equal(cues.at(-1).end,25);assert.equal(progress.at(-1).percent,100);assert.ok(cues.every(c=>c.audioModel===model().id&&c.timingSource==='ai-estimated'));
});
test('missing key, nonzero live pricing and provider rejection fail without a paid fallback',async()=>{
 await assert.rejects(audio.transcribe(project,{},null,{}),/Add your OpenRouter key/);
 let calls=0;await assert.rejects(audio.transcribe(project,{},null,{key:'test-only'},{media:fakeMedia,request:async()=>{calls++;return Response.json({data:[model(undefined,{prompt:.01,completion:0})]});}}),/zero-price/);assert.equal(calls,1);
 calls=0;await assert.rejects(audio.transcribe(project,{},null,{key:'test-only'},{media:fakeMedia,request:async url=>{calls++;return url===audio.CATALOG?Response.json({data:[model()]}):Response.json({}, {status:401});}}),/rejected the saved API key/);assert.equal(calls,2);
});
test('cancellation aborts the active request and never applies partial captions',async()=>{
 const pending=audio.transcribe(project,{},null,{key:'test-only'},{media:fakeMedia,request:async(url,options)=>{audio.cancel();throw Object.assign(Error('cancelled'),{name:'AbortError'});}});
 await assert.rejects(pending,/cancelled/);
});
test('audio access rejection tries at most three verified free candidates and reports the active model',async()=>{
 const ids=[model().id,'thinkingmachines/inkling-small:free','thinkingmachines/inkling:free'],seen=[],updates=[];
 const cues=await audio.transcribe({...project,clips:[{path:'test-only.mp4',in:0,out:3}]},{},value=>updates.push(value.message),{key:'test-key'},{media:fakeMedia,request:async(url,options)=>{
  if(url===audio.CATALOG)return Response.json({data:[...ids.map(id=>model(id)),model('paid/audio',{prompt:.1,completion:0})]});
  const body=JSON.parse(options.body);seen.push(body.model);assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});assert.equal(body.provider.allow_fallbacks,false);
  if(seen.length<3)return Response.json({error:{message:'Account access unavailable'}},{status:seen.length===1?402:429});
  return Response.json({choices:[{message:{content:'{"text":"Actual speech"}'}}]});
 }});
 assert.deepEqual(seen,ids);assert.equal(cues[0].audioModel,ids[2]);for(const id of ids)assert.ok(updates.some(text=>text.includes(id)));
});
test('account balance errors describe catalog/access difference and redact provider secrets',async()=>{
 const key='sk-or-v1-test-secret-redact-this',ids=[model().id,'thinkingmachines/inkling-small:free','thinkingmachines/inkling:free'];let calls=0;
 await assert.rejects(audio.transcribe({...project,clips:[{path:'test-only.mp4',in:0,out:3}]},{},null,{key},{media:fakeMedia,request:async url=>{
  if(url===audio.CATALOG)return Response.json({data:ids.map(id=>model(id))});calls++;return Response.json({error:{message:'Insufficient account balance. Key '+key}},{status:402});
 }}),error=>{assert.equal(calls,3);assert.match(error.message,/account credit or access/);assert.match(error.message,/Insufficient account balance/);assert.match(error.message,/HTTP 402/);assert.ok(!error.message.includes(key));return true;});
});
test('model-specific access restrictions try the third free model without spoofing identity and preserve all reasons',async()=>{
 const ids=[model().id,'thinkingmachines/inkling-small:free','thinkingmachines/inkling:free'],seen=[];
 await assert.rejects(audio.transcribe({...project,clips:[{path:'test-only.mp4',in:0,out:3}]},{},null,{key:'test-only'},{media:fakeMedia,request:async(url,options)=>{
  if(url===audio.CATALOG)return Response.json({data:ids.map(id=>model(id))});
  const body=JSON.parse(options.body);seen.push(body.model);assert.equal(options.headers['X-OpenRouter-Title'],'Reelish');assert.equal(options.headers['HTTP-Referer'],undefined);
  return Response.json({error:{message:seen.length===1?'Insufficient credits.':'Only available in approved agentic harnesses.'}},{status:seen.length===1?402:403});
 }}),error=>{assert.deepEqual(seen,ids);assert.equal(error.attempts.length,3);assert.match(error.message,/Insufficient credits/);assert.match(error.message,/approved agentic harnesses/);for(const id of ids)assert.ok(error.message.includes(id));return true;});
});
