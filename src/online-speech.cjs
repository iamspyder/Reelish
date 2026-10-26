const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const core=require('./core.cjs'),configuration=require('./caption-service.json');
let active=null,generation=0;
function serviceUrl(value=configuration.url){
 if(!value)return null;
 const u=new URL(value);
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('Caption service must be an HTTPS origin without credentials or a path');
 return u.origin;
}
function status(){return {configured:!!serviceUrl(),url:serviceUrl()};}
function fromResponse(data,duration){
 const valid=(w)=>Number.isFinite(w.start)&&Number.isFinite(w.end)&&w.end>w.start&&w.end>0&&w.start<duration;
 if(Array.isArray(data.words)&&data.words.length){
  const words=data.words.slice(0,50000).filter(valid).map(w=>({text:String(w.word??w.text??'').trim().slice(0,500),start:Math.max(0,w.start),end:Math.min(duration,w.end)})).filter(w=>w.text).sort((a,b)=>a.start-b.start);
  const cues=[];let group=[];
  const flush=()=>{if(group.length)cues.push({id:crypto.randomUUID(),start:group[0].start,end:Math.max(...group.map(w=>w.end)),text:group.map(w=>w.text).join(' '),words:group});group=[];};
  for(const w of words){if(group.length&&(group.length>=5||w.start-group.at(-1).end>.65))flush();group.push(w);}flush();return cues;
 }
 return (Array.isArray(data.segments)?data.segments:[]).slice(0,10000).filter(valid).map(s=>({id:crypto.randomUUID(),start:Math.max(0,s.start),end:Math.min(duration,s.end),text:String(s.text??'').trim().slice(0,10000)})).filter(c=>c.text).sort((a,b)=>a.start-b.start);
}
async function upload(audio,language,{url=serviceUrl(),request=fetch,signal}={}){
 if(!url)throw Error('Online captions have not been activated by the Reelish publisher. A hosted caption service must be deployed first.');
 const base=serviceUrl(url),form=new FormData();
 if(audio.byteLength>24*1024*1024)throw Error('This audio exceeds the online service’s 24 MB limit. Split the project into shorter parts.');
 form.set('file',new Blob([audio],{type:'audio/flac'}),'speech.flac');form.set('language',language||'auto');
 let response;try{response=await request(base+'/v1/transcribe',{method:'POST',body:form,redirect:'error',signal});}catch(e){if(signal?.aborted)throw Error('Online captions cancelled or timed out');throw Error('Cannot reach the online caption service. Check your connection and try again.');}
 if(Number(response.headers.get('content-length'))>4*1024*1024)throw Error('Caption service returned too much data');
 const reader=response.body?.getReader();if(!reader)throw Error('Caption service returned an empty response');const chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4*1024*1024){await reader.cancel();throw Error('Caption service returned too much data');}chunks.push(value);}
 let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('Caption service returned an invalid response');}
 if(!response.ok)throw Error(response.status===429?'The shared online caption quota is busy or exhausted. Try again later.':String(data.error||'Online transcription failed').slice(0,300));
 return data;
}
async function transcribe(project,settings,notify){
 core.validate(project);if(!project.clips.length)throw Error('Import a video first');
 if(!serviceUrl())throw Error('Online captions have not been activated by the Reelish publisher. Deploy the caption service before distributing an online build.');
 const media=require('./media.cjs'),token=generation,tmp=await fs.mkdtemp(path.join(os.tmpdir(),'reelish-online-'));
 const check=()=>{if(token!==generation)throw Error('Online captions cancelled');};
 try{
  const list=[];
  for(let i=0;i<project.clips.length;i++){
   check();const clip=project.clips[i],file=path.join(tmp,`clip-${i}.flac`),info=await media.probe(clip.path);check();
   const input=info.audio?['-ss',String(clip.in),'-t',String(clip.out-clip.in),'-i',clip.path,'-vn']:['-f','lavfi','-i','anullsrc=r=16000:cl=mono','-t',String(clip.out-clip.in)];
   await media.run(media.ffmpeg,['-y',...input,'-ac','1','-ar','16000','-c:a','flac',file]);check();list.push(`file '${file.replace(/\\/g,'/')}'`);
   notify?.({percent:Math.round((i+1)/project.clips.length*45),message:'Preparing audio for online captions…'});
  }
  await fs.writeFile(path.join(tmp,'clips.txt'),list.join('\n'));const file=path.join(tmp,'speech.flac');
  await media.run(media.ffmpeg,['-y','-f','concat','-safe','0','-i',path.join(tmp,'clips.txt'),'-c:a','flac',file]);check();
  active=new AbortController();notify?.({percent:50,message:'Uploading audio to the online caption service…'});
  const data=await upload(await fs.readFile(file),settings.language,{signal:AbortSignal.any([active.signal,AbortSignal.timeout(240000)])});check();
  const cues=fromResponse(data,core.duration(project));notify?.({percent:100,message:`${cues.length} caption lines generated online`});return cues;
 }finally{active=null;await fs.rm(tmp,{recursive:true,force:true});}
}
module.exports={serviceUrl,status,fromResponse,upload,transcribe,cancel(){generation++;active?.abort();}};
