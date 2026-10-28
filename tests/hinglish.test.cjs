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
test('conversion quota failure reports failure instead of returning native script',async()=>{
 const {romanizeHinglish}=await import('../services/captions/hinglish.mjs');await assert.rejects(romanizeHinglish({words:[{word:'आज',start:0,end:1}]},'test',async()=>Response.json({}, {status:429})),/quota/);
});
test('Hinglish accepts fenced JSON through the shared free-only provider parser',async()=>{
 const {romanizeHinglish}=await import('../services/captions/hinglish.mjs');
 const result=await romanizeHinglish({words:[{word:'आज',start:0,end:.8}]},'test',async(url,options)=>{
  const body=JSON.parse(options.body);assert.equal(body.model,'openrouter/free');assert.deepEqual(body.provider.max_price,{prompt:0,completion:0});
  return Response.json({choices:[{message:{content:'```json\n{"words":["aaj"]}\n```'}}]});
 });assert.equal(result.words[0].word,'aaj');assert.equal(result.words[0].end,.8);
});
