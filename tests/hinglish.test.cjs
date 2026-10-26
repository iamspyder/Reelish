const {test}=require('node:test'),assert=require('node:assert/strict');
const languages=require('../src/caption-languages.js'),online=require('../src/online-speech.cjs');
test('language choices distinguish Hindi-English Roman captions from native scripts',()=>{
 assert.ok(languages.languages.length>20);assert.deepEqual(languages.normalize({language:'ta',outputScript:'native'}),{language:'ta',outputScript:'native'});
 assert.deepEqual(languages.normalize({language:'ta',outputScript:'hinglish'}),{language:'hi',outputScript:'hinglish'});
 assert.equal(languages.normalize({language:'invalid'}).language,'auto');
});
test('Hinglish converts Hindi tokens while protecting English and exact timestamps',async()=>{
 const {romanizeHinglish}=await import('../services/captions/hinglish.mjs');
 const words=['आज','हम','video','बनाएंगे'].map((word,i)=>({word,start:i*.5,end:i*.5+.4}));
 const result=await romanizeHinglish({words,segments:[{text:'native'}]},'test',async(url,options)=>{
  assert.match(url,/chat\/completions$/);const body=JSON.parse(options.body);assert.equal(body.response_format.type,'json_object');
  return Response.json({choices:[{message:{content:JSON.stringify({words:['Aaj','hum','film','banayenge']})}}]});
 });
 assert.equal(result.text,'Aaj hum video banayenge');assert.deepEqual(result.words.map(w=>[w.start,w.end]),words.map(w=>[w.start,w.end]));assert.deepEqual(result.segments,[]);
 assert.equal(online.fromResponse(result,2)[0].text,'Aaj hum video banayenge');
});
test('already Roman speech needs no conversion request',async()=>{
 const {romanizeHinglish}=await import('../services/captions/hinglish.mjs');let called=false;
 const result=await romanizeHinglish({words:[{word:'Hello',start:0,end:1}]},'test',()=>{called=true;});assert.equal(called,false);assert.equal(result.text,'Hello');
});
test('Hinglish rejects missing, expanded, and untranslated tokens',async()=>{
 const {romanizeHinglish}=await import('../services/captions/hinglish.mjs');const result={words:[{word:'आज',start:0,end:1}]};
 for(const words of [[],['aaj','today'],['आज'],['aaj today'],['']])await assert.rejects(romanizeHinglish(result,'test',async()=>Response.json({choices:[{message:{content:JSON.stringify({words})}}]})),/Hinglish conversion/);
 await assert.rejects(romanizeHinglish({segments:[]},'test'),/word timestamps/);
});
test('Hinglish worker completes both stages using only the server credential',async()=>{
 const {handle}=await import('../services/captions/worker.mjs');let count=0;
 const response=await online.upload(Buffer.from('fLaC-demo'),'hi',{url:'https://captions.example',outputScript:'hinglish',request:async(url,options)=>{
  assert.equal(options.body.get('output_script'),'hinglish');
  return handle(new Request(url,options),{OPENROUTER_API_KEY:'test-only',CAPTION_LIMITER:{limit:async()=>({success:true})}},async(url,options)=>{
   count++;assert.equal(options.headers.Authorization,'Bearer test-only');
   if(url.endsWith('/transcriptions')){assert.equal(options.body.get('model'),'openai/whisper-large-v3');assert.equal(options.body.get('language'),'hi');return Response.json({words:[{word:'नमस्ते',start:.2,end:.8},{word:'friends',start:1,end:1.5}]});}
   return Response.json({choices:[{message:{content:'{"words":["namaste","friends"]}'}}]});
  });
 }});assert.equal(count,2);assert.equal(response.words[0].word,'namaste');assert.equal(response.words[0].start,.2);
});
test('conversion quota failure reports failure instead of returning native script',async()=>{
 const {romanizeHinglish}=await import('../services/captions/hinglish.mjs');await assert.rejects(romanizeHinglish({words:[{word:'आज',start:0,end:1}]},'test',async()=>Response.json({}, {status:429})),/quota/);
});
