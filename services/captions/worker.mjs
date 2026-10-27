import {handleAi} from './ai.mjs';
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
export async function handle(request,env,upstream=fetch){
 const url=new URL(request.url);
 if(url.pathname==='/health'&&request.method==='GET')return json({service:'Reelish captions',ready:!!env.OPENROUTER_API_KEY,provider:'OpenRouter',freeOnly:true,speechEnabled:false});
 if(!['/v1/transcribe','/v1/ai'].includes(url.pathname))return json({error:'Not found'},404);
 if(request.method!=='POST')return json({error:'Use POST'},405);
 // Enforce publisher policy even for stale clients and environment variables.
 if(url.pathname==='/v1/transcribe')return json({error:'Online speech transcription is disabled: Reelish uses free models only. Import timed captions or add captions manually.'},403);
 if(!env.OPENROUTER_API_KEY)return json({error:'AI service has not been activated by the publisher.'},503);
 if(!env.CAPTION_LIMITER)return json({error:'AI service rate limiter is unavailable.'},503);
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 if(!(await env.CAPTION_LIMITER.limit({key:ip})).success)return json({error:'Too many AI requests. Try again shortly.'},429,{'Retry-After':'60'});
 return handleAi(request,env,upstream);
}
export default {fetch:handle};
