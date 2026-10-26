const {serviceUrl}=require('./online-speech.cjs');
let active=null;
async function request(task,project,targetLanguage){
 const url=serviceUrl();if(!url)throw Error('OpenRouter AI needs service activation. The publisher must configure the hosted service.');
 const captions=project.cues.map(({id,text,start,end})=>({id,text,start,end}));
 if(!captions.length||captions.length>300)throw Error('AI tools support 1–300 caption lines. Generate captions or use a shorter project.');
 active=new AbortController();
 try{
  const response=await fetch(url+'/v1/ai',{method:'POST',headers:{'Content-Type':'application/json'},redirect:'error',body:JSON.stringify({task,captions,targetLanguage}),signal:AbortSignal.any([active.signal,AbortSignal.timeout(120000)])});
  if(Number(response.headers.get('content-length'))>2*1024*1024)throw Error('AI response is too large');
  const reader=response.body.getReader(),chunks=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2*1024*1024){await reader.cancel();throw Error('AI response is too large');}chunks.push(value);}
  let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('Invalid AI service response');}
  if(!response.ok)throw Error(String(data.error||'OpenRouter request failed').slice(0,300));return data;
 }finally{active=null;}
}
module.exports={request,cancel(){active?.abort();}};
