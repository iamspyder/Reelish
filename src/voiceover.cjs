const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
async function save(base64,directory,media){
 if(typeof base64!=='string'||!base64.length||base64.length>28*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))throw Error('Invalid or oversized voice recording');
 const bytes=Buffer.from(base64,'base64');if(bytes.length>20*1024*1024||bytes.subarray(0,4).toString('hex')!=='1a45dfa3')throw Error('Invalid microphone recording format');
 await fs.mkdir(directory,{recursive:true});const file=path.join(directory,crypto.randomUUID()+'.webm'),wav=file.replace(/\.webm$/,'.wav');await fs.writeFile(file,bytes);
 // MediaRecorder WebM often has no duration header. Decode it to a seekable file.
 try{await media.run(media.ffmpeg,['-y','-i',file,'-vn','-t','601','-ac','2','-ar','48000','-c:a','pcm_s16le',wav]);const info=await media.probe(wav);if(!info.audio||info.duration<=0||info.duration>600.5)throw Error('Invalid voice recording duration');return {...info,name:'Voiceover',path:wav};}catch(error){await fs.rm(wav,{force:true});throw error;}finally{await fs.rm(file,{force:true});}
}
module.exports={save};
