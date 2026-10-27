export async function completion(env,messages,upstream=fetch){
 if(!env.OPENROUTER_API_KEY)throw Object.assign(Error('OpenRouter has not been activated by the publisher.'),{status:503});
 const response=await upstream('https://openrouter.ai/api/v1/chat/completions',{
  method:'POST',headers:{Authorization:`Bearer ${env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','X-OpenRouter-Title':'Reelish'},
  signal:AbortSignal.timeout(90000),body:JSON.stringify({model:'openrouter/free',temperature:.2,max_tokens:6000,response_format:{type:'json_object'},provider:{require_parameters:true,max_price:{prompt:0,completion:0}},messages})
 });
 if(!response.ok)throw Object.assign(Error(response.status===429?'OpenRouter usage limit reached. Try again later.':response.status===402?'Free model access is unavailable. Paid fallback is disabled.':'OpenRouter could not complete this request.'),{status:[402,429].includes(response.status)?response.status:502});
 if(Number(response.headers.get('content-length'))>1024*1024)throw Error('AI response is too large');
 const reader=response.body.getReader(),chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024){await reader.cancel();throw Error('AI response is too large');}chunks.push(value);}
 const bytes=new Uint8Array(size);let position=0;for(const chunk of chunks){bytes.set(chunk,position);position+=chunk.byteLength;}
 let result;try{result=JSON.parse(JSON.parse(new TextDecoder().decode(bytes)).choices[0].message.content);}catch{throw Error('OpenRouter returned invalid JSON. Try again.');}
 return result;
}
