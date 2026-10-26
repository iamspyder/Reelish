const MAX_BYTES=24*1024*1024;
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
export async function handle(request,env,upstream=fetch){
 const url=new URL(request.url);
 if(url.pathname==='/health'&&request.method==='GET')return json({service:'Reelish captions',ready:!!env.GROQ_API_KEY});
 if(url.pathname!=='/v1/transcribe')return json({error:'Not found'},404);
 if(request.method!=='POST')return json({error:'Use POST'},405);
 if(!env.GROQ_API_KEY)return json({error:'Caption service has not been activated by the publisher.'},503);
 if(!env.CAPTION_LIMITER)return json({error:'Caption service rate limiter is unavailable.'},503);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 if(!(await env.CAPTION_LIMITER.limit({key:ip})).success)return json({error:'Too many caption requests. Try again shortly.'},429,{'Retry-After':'60'});
 if(!request.headers.get('Content-Type')?.startsWith('multipart/form-data'))return json({error:'Expected an audio upload'},415);
 const length=Number(request.headers.get('Content-Length'));if(length>MAX_BYTES)return json({error:'Audio upload is too large'},413);
 // Enforce a real streamed limit as well as Content-Length; no audio is persisted.
 const reader=request.body?.getReader();if(!reader)return json({error:'Missing audio'},400);let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();return json({error:'Audio upload is too large'},413);}chunks.push(value);}}catch{return json({error:'Audio upload was interrupted'},400);}
 let form;try{form=await new Response(new Blob(chunks),{headers:{'Content-Type':request.headers.get('Content-Type')}}).formData();}catch{return json({error:'Invalid audio upload'},400);}
 const audio=form.get('file'),language=String(form.get('language')||'auto');
 if(!audio||typeof audio==='string'||!audio.size||audio.size>MAX_BYTES)return json({error:'Missing or oversized audio'},400);
 if(!['audio/flac','audio/wav','audio/x-wav'].includes(audio.type))return json({error:'Upload WAV or FLAC audio'},415);
 if(!/^(auto|[a-z]{2,3})$/.test(language))return json({error:'Invalid language'},400);
 const body=new FormData();body.set('file',audio,audio.type==='audio/flac'?'speech.flac':'speech.wav');body.set('model','whisper-large-v3-turbo');body.set('response_format','verbose_json');body.append('timestamp_granularities[]','word');body.append('timestamp_granularities[]','segment');if(language!=='auto')body.set('language',language);
 try{const response=await upstream('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`},body,signal:AbortSignal.timeout(180000)});
 if(!response.ok)return json({error:response.status===429?'The shared free caption quota is busy or exhausted. Please try later.':'The caption provider could not process this audio.'},response.status===429?429:502);
 const result=await response.json();return json({text:result.text||'',language:result.language,words:result.words||[],segments:result.segments||[]});
 }catch{return json({error:'The caption provider is temporarily unavailable. Try again.'},502);}
}
export default {fetch:handle};

