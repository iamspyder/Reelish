export async function completion(env,messages,upstream=fetch,options={}){
 if(!env.OPENROUTER_API_KEY)throw Object.assign(Error('OpenRouter has not been activated by the publisher.'),{status:503});
 const body={model:'openrouter/free',temperature:.2,max_tokens:Math.max(32,Math.min(6000,Number(options.maxTokens)||6000)),response_format:{type:'json_object'},provider:{require_parameters:true,max_price:{prompt:0,completion:0}},messages};
 const send=async payload=>upstream('https://openrouter.ai/api/v1/chat/completions',{
  method:'POST',headers:{Authorization:`Bearer ${env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','X-OpenRouter-Title':'Reelish'},
  signal:AbortSignal.timeout(90000),body:JSON.stringify(payload)
 });
 let response;
 try{response=await send(body);
  // Some free endpoints do not support JSON mode. Retry without that optional
  // constraint, retaining the same zero-price router and strict local parsing.
  if([400,404].includes(response.status)){await response.body?.cancel();const plain={...body};delete plain.response_format;response=await send(plain);}
 }catch(error){throw Error(error.name==='TimeoutError'?'OpenRouter timed out. Try again with fewer captions.':'Cannot reach OpenRouter. Check your internet connection and try again.');}
 const failures={401:'OpenRouter rejected this API key. Update it in AI connection & key.',402:'Free model access is unavailable. Paid fallback is disabled.',403:'This key or account cannot access the selected free models. Check OpenRouter permissions.',404:'No compatible free model is available right now. Paid fallback is disabled.',429:'OpenRouter usage limit reached. Try again later.'};
 if(!response.ok)throw Object.assign(Error(failures[response.status]||'OpenRouter could not complete this request. Try again.'),{status:failures[response.status]?response.status:502});
 if(Number(response.headers.get('content-length'))>1024*1024)throw Error('AI response is too large');
 const reader=response.body.getReader(),chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024){await reader.cancel();throw Error('AI response is too large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let position=0;for(const chunk of chunks){bytes.set(chunk,position);position+=chunk.byteLength;}
 let result;try{const content=JSON.parse(new TextDecoder().decode(bytes)).choices[0].message.content;const text=(Array.isArray(content)?content.filter(item=>item.type==='text').map(item=>item.text).join(''):content).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');result=JSON.parse(text);if(!result||typeof result!=='object'||Array.isArray(result))throw Error();}catch{throw Error('OpenRouter returned invalid JSON. Try again.');}
 return result;
}
