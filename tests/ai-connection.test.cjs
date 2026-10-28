const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const settings=require('../src/ai-settings.cjs'),ai=require('../src/ai-service.cjs');
const key='sk-or-v1-test-only-not-a-real-key';
const storage={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from('cipher:'+s.split('').reverse().join('')),decryptString:b=>b.toString().slice(7).split('').reverse().join('')};
test('personal AI credentials are encrypted, retained on blank save, and removable',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'reelish-key-')),file=path.join(dir,'settings.json');
 try{
  await fs.writeFile(file,JSON.stringify({engine:'online',language:'hi'}));
  assert.deepEqual(await settings.save(file,storage,{mode:'personal',key}),{mode:'personal',hasKey:true});
  const raw=await fs.readFile(file,'utf8');assert.ok(!raw.includes(key));assert.equal(JSON.parse(raw).language,'hi');
  assert.equal((await settings.load(file,storage)).key,key);
  assert.deepEqual(await settings.status(file),{mode:'personal',hasKey:true});
  await settings.save(file,storage,{mode:'hosted',key:''});assert.equal((await settings.load(file,storage)).key,key);
  await settings.save(file,storage,{mode:'personal',clearKey:true});assert.equal((await settings.load(file,storage)).key,'');
  await assert.rejects(settings.save(file,storage,{mode:'personal',key:'invalid'}),/valid OpenRouter/);
  await assert.rejects(settings.save(file,{...storage,isEncryptionAvailable:()=>false},{mode:'personal',key}),/not saved/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('personal key uses only OpenRouter with no redirects, no paid model and validated output',async()=>{
 let calls=0;const result=await ai.request('translate',{cues:[{id:'a',text:'Hello',start:0,end:1}]},'hi',{mode:'personal',key},async(url,options)=>{
  calls++;assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer '+key);
  const body=JSON.parse(options.body);assert.equal(body.model,'openrouter/free');assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});
  return Response.json({choices:[{message:{content:JSON.stringify({captions:[{id:'a',text:'नमस्ते'}]})}}]});
 });assert.equal(calls,1);assert.equal(result.captions[0].text,'नमस्ते');
 await assert.rejects(ai.request('hooks',{cues:[]},'en',{mode:'personal'}),/Add your OpenRouter key/);
 await assert.rejects(ai.request('hooks',{cues:[]},'en',{mode:'hosted'}),/private/);
 await assert.rejects(ai.request('translate',{cues:[{id:'a',text:'Hello',start:0,end:1}]},'hi',{mode:'personal',key},async()=>Response.json({}, {status:401})),/rejected this API key/);
});

test('connection test reaches a free model without sending project content or returning secrets',async()=>{
 let calls=0;const result=await ai.testConnection({mode:'personal',key},async(url,options)=>{
  calls++;assert.equal(url,'https://openrouter.ai/api/v1/chat/completions');assert.equal(options.redirect,'error');
  const body=JSON.parse(options.body);assert.equal(body.model,'openrouter/free');assert.equal(body.max_tokens,64);assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});
  assert.equal(body.messages[1].content,'Test the free text connection.');return Response.json({choices:[{message:{content:'```json\n{"ok":true}\n```'}}]});
 });assert.equal(calls,1);assert.equal(result.ok,true);assert.equal(result.freeOnly,true);assert.ok(!JSON.stringify(result).includes(key));
 await assert.rejects(ai.testConnection({mode:'personal'}),/Enter your OpenRouter key/);
 await assert.rejects(ai.testConnection({mode:'hosted',key}),/publisher service is private/);
 await assert.rejects(ai.testConnection({mode:'personal',key},async()=>Response.json({choices:[{message:{content:'{"ok":false}'}}]})),/test response was invalid/);
});

test('JSON-mode fallback remains free-only and distinguishes provider rejection from a network failure',async()=>{
 const {completion}=await import('../services/captions/openrouter.mjs');let calls=0;
 const result=await completion({OPENROUTER_API_KEY:key},[],async(url,options)=>{
  const body=JSON.parse(options.body);calls++;assert.equal(body.model,'openrouter/free');assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});
  if(calls===1){assert.ok(body.response_format);return Response.json({error:{message:'Unsupported parameter'}},{status:400});}
  assert.equal(body.response_format,undefined);return Response.json({choices:[{message:{content:'{"ok":true}'}}]});
 });assert.equal(calls,2);assert.equal(result.ok,true);
 await assert.rejects(completion({OPENROUTER_API_KEY:key},[],async()=>Response.json({}, {status:401})),/rejected this API key/);
 await assert.rejects(completion({OPENROUTER_API_KEY:key},[],async()=>{throw new TypeError('fetch failed');}),/Cannot reach OpenRouter/);
});
