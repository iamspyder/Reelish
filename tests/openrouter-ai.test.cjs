const {test}=require('node:test'),assert=require('node:assert/strict');
const captions=[{id:'one',start:0,end:1,text:'आज हम video बनाएंगे'}];
const reply=value=>async(url,options)=>{assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');assert.equal(options.headers.Authorization,'Bearer test-secret');assert.equal(JSON.parse(options.body).model,'openrouter/free');return Response.json({choices:[{message:{content:JSON.stringify(value)}}]});};
const env={OPENROUTER_API_KEY:'test-secret'};
test('OpenRouter hooks return three reviewable results',async()=>{
 const {aiTask}=await import('../services/captions/ai.mjs');const hooks=Array.from({length:3},(_,i)=>({title:'Hook '+i,screenText:'Make your video',shots:['Show the process']}));
 assert.equal((await aiTask({task:'hooks',captions},env,reply({hooks}))).hooks.length,3);
});
test('translation preserves caption IDs and rejects omitted lines',async()=>{
 const {aiTask}=await import('../services/captions/ai.mjs');const result=await aiTask({task:'translate',captions,targetLanguage:'en'},env,reply({captions:[{id:'one',text:'Today we will make a video'}]}));assert.equal(result.captions[0].id,'one');
 await assert.rejects(aiTask({task:'translate',captions,targetLanguage:'en'},env,reply({captions:[]})),/omitted/);
});
test('edit plans cannot reference missing cues or arbitrary effects',async()=>{
 const {aiTask}=await import('../services/captions/ai.mjs');const plan={title:'Make a video',steps:[{cueId:'one',zoom:1.2,graphic:'title',text:'Start here',sound:'pop'}]};assert.equal((await aiTask({task:'edit',captions},env,reply(plan))).steps.length,1);
 plan.steps[0].cueId='invented';await assert.rejects(aiTask({task:'edit',captions},env,reply(plan)),/invalid edit/);
});
test('OpenRouter activation, credits, rate limits and malformed replies are explicit',async()=>{
 const {completion}=await import('../services/captions/openrouter.mjs');await assert.rejects(completion({},[]),/activated/);
 await assert.rejects(completion(env,[],async()=>Response.json({}, {status:402})),/Free model access/);
 await assert.rejects(completion(env,[],async()=>Response.json({}, {status:429})),/limit/);
 await assert.rejects(completion(env,[],async()=>Response.json({choices:[]})),/invalid JSON/);
});
test('AI endpoint enforces transcript size and uses publisher credential',async()=>{
 const {handle}=await import('../services/captions/worker.mjs');const ready=await (await handle(new Request('https://example.com/health'),env)).json();assert.equal(ready.provider,'OpenRouter');
 const response=await handle(new Request('https://example.com/v1/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task:'translate',captions,targetLanguage:'en'})}),{...env,CAPTION_LIMITER:{limit:async()=>({success:true})}},reply({captions:[{id:'one',text:'Today we will make a video'}]}));assert.equal(response.status,200);
 const large=await handle(new Request('https://example.com/v1/ai',{method:'POST',body:'x'.repeat(300000)}),{...env,CAPTION_LIMITER:{limit:async()=>({success:true})}});assert.equal(large.status,413);
});

test('free-only routing cannot be overridden by publisher model configuration',async()=>{
 const {completion}=await import('../services/captions/openrouter.mjs');let calls=0;
 await completion({...env,OPENROUTER_TEXT_MODEL:'paid-model'},[],async(url,options)=>{
  calls++;const body=JSON.parse(options.body);assert.equal(body.model,'openrouter/free');assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});assert.equal(body.models,undefined);
  return Response.json({choices:[{message:{content:'{}'}}]});
 });assert.equal(calls,1);
});

test('free Hinglish converts existing caption text without calling speech',async()=>{
 const {aiTask}=await import('../services/captions/ai.mjs');let calls=0;
 const result=await aiTask({task:'hinglish',captions},env,async(url,options)=>{
  calls++;assert.match(url,/chat\/completions$/);const body=JSON.parse(options.body);
  assert.equal(body.model,'openrouter/free');assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});
  return Response.json({choices:[{message:{content:JSON.stringify({words:['Aaj','hum','film','banayenge']})}}]});
 });
 assert.equal(calls,1);assert.deepEqual(result.captions,[{id:'one',text:'Aaj hum video banayenge',words:['Aaj','hum','video','banayenge']}]);
 const roman=await aiTask({task:'hinglish',captions:[{id:'a',start:0,end:1,text:'Hello friends'}]},env,()=>{throw Error('No AI call needed');});assert.equal(roman.captions[0].text,'Hello friends');
});
