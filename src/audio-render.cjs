const {spawn}=require('node:child_process');
const media=require('./media.cjs');
let current=null,cancellationVersion=0;
function run(args){return new Promise((resolve,reject)=>{let err='';const child=spawn(media.ffmpeg,args,{windowsHide:true});current=child;child.stderr.on('data',b=>err=(err+b).slice(-6000));child.on('error',reject);child.on('close',code=>{if(current===child)current=null;code===0?resolve():reject(Error(code===null?'Audio operation cancelled':err));});});}
const finite=(n,min,max,fallback)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
const effects={
 whoosh:{duration:.65,expr:'0.32*sin(2*PI*(900*t+1800*t*t))*sin(PI*t/0.65)*exp(-3*t)'},
 pop:{duration:.18,expr:'0.65*sin(2*PI*(180*t-320*t*t))*exp(-28*t)'},
 click:{duration:.06,expr:'0.6*sin(2*PI*2200*t)*exp(-130*t)'},
 basshit:{duration:.8,expr:'0.8*sin(2*PI*(75*t-25*t*t))*exp(-7*t)'},
 shutter:{duration:.28,expr:'0.4*(sin(2*PI*3100*t)+sin(2*PI*4700*t))*exp(-40*mod(t\,0.09))'},
 chime:{duration:1.3,expr:'0.24*(sin(2*PI*880*t)+0.6*sin(2*PI*1320*t)+0.3*sin(2*PI*1760*t))*exp(-4*t)'},
 typing:{duration:.7,expr:'0.35*sin(2*PI*1800*t)*exp(-150*mod(t\,0.1))'},
 swipe:{duration:.35,expr:'0.4*sin(2*PI*(2000*t-2400*t*t))*sin(PI*t/0.35)'},
 tap:{duration:.15,expr:'0.6*sin(2*PI*420*t)*exp(-45*t)'},
 transition:{duration:.85,expr:'0.28*(sin(2*PI*(240*t+900*t*t))+sin(2*PI*(360*t+1400*t*t)))*sin(PI*t/0.85)'},
 riser:{duration:1.8,expr:'0.28*sin(2*PI*(140*t+1000*t*t))*t/1.8'},
 glitch:{duration:.55,expr:'0.3*sin(2*PI*(400+1200*floor(t*30))*t)*sin(2*PI*37*t)'}
};
async function generateEffect(id,outputPath){const effect=effects[id];if(!effect)throw Error('Unknown sound effect');if(typeof outputPath!=='string'||!outputPath)throw Error('Choose an output path');await run(['-y','-f','lavfi','-i',`aevalsrc=${effect.expr.replace(/,/g,'\\,')}:s=48000:d=${effect.duration}`,'-ac','2','-c:a','pcm_s16le',outputPath]);return outputPath;}
async function renderAudio(p,outputPath,notify){
 const version=cancellationVersion;
 if(typeof outputPath!=='string'||!outputPath)throw Error('Choose an output path');
 if(!p||!Array.isArray(p.clips)||!p.clips.length)throw Error('Import a clip before rendering audio');
 if(p.clips.length>500||!Array.isArray(p.sounds||[])||(p.sounds||[]).length>500)throw Error('Too many audio tracks');
 const args=['-y'],filters=[],pieces=[];let input=0,total=0;
 for(const c of p.clips){
  if(typeof c.path!=='string'||!Number.isFinite(c.in)||!Number.isFinite(c.out)||c.in<0||c.out<=c.in)throw Error('Invalid clip range');
  const duration=c.out-c.in;total+=duration;const info=await media.probe(c.path),idx=input++;if(version!==cancellationVersion)throw Error('Audio operation cancelled');
  if(info.audio){args.push('-ss',String(c.in),'-t',String(duration),'-i',c.path);filters.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=${duration},asetpts=PTS-STARTPTS,volume=${finite(p.volume,0,4,1)*finite(c.volume,0,4,1)}[c${idx}]`);}
  else{args.push('-f','lavfi','-t',String(duration),'-i','anullsrc=r=48000:cl=stereo');filters.push(`[${idx}:a]atrim=duration=${duration},asetpts=PTS-STARTPTS[c${idx}]`);}
  pieces.push(`[c${idx}]`);
 }
 filters.push(`${pieces.join('')}concat=n=${pieces.length}:v=0:a=1[base]`);const mixes=['[base]'];
 if(p.music?.path){const idx=input++;args.push('-stream_loop','-1','-i',p.music.path);filters.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration=${total},asetpts=PTS-STARTPTS,volume=${finite(p.music.volume,0,4,.12)}[music]`);mixes.push('[music]');}
 for(const s of p.sounds||[]){if(typeof s.path!=='string'||!Number.isFinite(s.start)||s.start<0)throw Error('Invalid sound effect');if(s.start>=total)continue;const idx=input++,duration=finite(s.duration,.01,total,total-s.start);args.push('-ss',String(finite(s.in,0,86400,0)),'-t',String(duration),'-i',s.path);filters.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,asetpts=PTS-STARTPTS,volume=${finite(s.volume,0,4,1)},adelay=${Math.round(s.start*1000)}:all=1[s${idx}]`);mixes.push(`[s${idx}]`);}
 filters.push(`${mixes.join('')}amix=inputs=${mixes.length}:duration=first:normalize=0,alimiter=limit=0.98:latency=1,atrim=duration=${total}[out]`);
 notify?.({message:'Mixing clip audio, music and sound effects…',percent:5});
 args.push('-filter_complex',filters.join(';'),'-map','[out]','-t',String(total),'-ar','48000','-ac','2','-c:a',/\.wav$/i.test(outputPath)?'pcm_s16le':'aac',outputPath);await run(args);notify?.({message:'Audio mix ready',percent:100});return outputPath;
}
module.exports={effects,generateEffect,renderAudio,cancel:()=>{cancellationVersion++;current?.kill();}};


