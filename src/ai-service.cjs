const {serviceUrl}=require('./online-speech.cjs');
let active=null;
async function request(task,project,targetLanguage,connection={},upstream=fetch){
 const personal=connection.mode==='personal',url=personal?null:serviceUrl();
 if(personal&&!connection.key)throw Error('Add your OpenRouter key in AI tools → AI connection & key.');
 if(!personal&&!url)throw Error('The publisher service is private and is not connected to this installation. Use your own OpenRouter key in AI tools → AI connection & key.');
 const captions=project.cues.map(({id,text,start,end})=>({id,text,start,end}));
 if(!captions.length||captions.length>300)throw Error('AI tools support 1–300 caption lines. Generate captions or use a shorter project.');
 active=new AbortController();
 try{
  if(personal){
   const {aiTask}=await import('../services/captions/ai.mjs');
   return await aiTask({task,captions,targetLanguage},{OPENROUTER_API_KEY:connection.key},async(url,options)=>{
    if(url!=='https://openrouter.ai/api/v1/chat/completions')throw Error('Unsupported AI endpoint.');
    const response=await upstream(url,{...options,redirect:'error',signal:AbortSignal.any([active.signal,options.signal].filter(Boolean))});
    return response;
   });
  }
  const response=await fetch(url+'/v1/ai',{method:'POST',headers:{'Content-Type':'application/json'},redirect:'error',body:JSON.stringify({task,captions,targetLanguage}),signal:AbortSignal.any([active.signal,AbortSignal.timeout(120000)])});
  if(Number(response.headers.get('content-length'))>2*1024*1024)throw Error('AI response is too large');
  const reader=response.body.getReader(),chunks=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2*1024*1024){await reader.cancel();throw Error('AI response is too large');}chunks.push(value);}
  let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('Invalid AI service response');}
  if(!response.ok)throw Error(String(data.error||'OpenRouter request failed').slice(0,300));return data;
 }finally{active=null;}
}
async function testConnection(connection={},upstream=fetch){
 if(connection.mode!=='personal')throw Error('The publisher service is private. Choose My OpenRouter key to test your own connection.');
 if(!connection.key)throw Error('Enter your OpenRouter key or save one before testing.');
 if(connection.key.length>220)throw Error('Enter a valid OpenRouter API key.');
 const {completion}=await import('../services/captions/openrouter.mjs');
 const result=await completion({OPENROUTER_API_KEY:connection.key},[{role:'system',content:'Reply only with JSON {"ok":true}. This is a connection test.'},{role:'user',content:'Test the free text connection.'}],async(url,options)=>{
  if(url!=='https://openrouter.ai/api/v1/chat/completions')throw Error('Unsupported AI endpoint.');
  return upstream(url,{...options,redirect:'error'});
 },{maxTokens:64});
 if(result.ok!==true)throw Error('The free model replied, but the connection test response was invalid. Try again.');
 return {ok:true,freeOnly:true,speechEnabled:false,message:'Free text AI connected. Translation, Hinglish, hooks and edit plans are ready. Check Auto captions for available audio-caption sources.'};
}
module.exports={request,testConnection,cancel(){active?.abort();}};
