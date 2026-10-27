const {_electron:electron}=require('playwright'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),media=require('../src/media.cjs');
(async()=>{
 const dir=path.resolve('test-output/caption-layout-export');await fs.mkdir(dir,{recursive:true});
 const input=path.join(dir,'source.mp4'),output=path.join(dir,'six-layouts.mp4');
 execFileSync(media.ffmpeg,['-y','-f','lavfi','-i','color=navy:s=180x320:r=12:d=6','-c:v','libx264','-pix_fmt','yuv420p',input],{stdio:'ignore',windowsHide:true});
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const exe=process.env.CLIPORA_EXECUTABLE;
 const app=await electron.launch({executablePath:exe||undefined,args:[...(exe?[]:[path.resolve('.')]),'--clipora-test-data='+path.join(dir,'user')],env});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForSelector('.templatecard');
  await app.evaluate(({dialog},file)=>dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]}),input);await page.click('#welcomeImport');await page.waitForFunction(()=>video.readyState>=2);
  const names=['Beacon','Hawser','Mizzen','Abbey','Iron','Oriel'];
  await page.evaluate(names=>{
   p.depth=false;p.exportFps=12;p.cues=names.map((name,i)=>{const template=templates.find(t=>t.name===name);if(!template)throw Error(name+' missing');return {id:'layout-'+i,start:i,end:i+1,text:'Make words count',style:{...template.style,behindSubject:false}};});renderAll();
  },names);
  await app.evaluate(({dialog},file)=>dialog.showSaveDialog=async()=>({canceled:false,filePath:file}),output);
  await page.evaluate(()=>clipora.call('export-video',p,720));
  for(let i=0;i<names.length;i++){
   const pixels=execFileSync(media.ffmpeg,['-v','error','-ss',String(i+.52),'-i',output,'-frames:v','1','-vf','scale=180:320','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{windowsHide:true});
   let visible=0;for(let j=0;j<pixels.length;j+=3)if(pixels[j]>40||pixels[j+1]>40)visible++;
   assert.ok(visible>10,names[i]+' must render caption pixels in actual MP4');
   execFileSync(media.ffmpeg,['-y','-v','error','-ss',String(i+.52),'-i',output,'-frames:v','1',path.join(dir,names[i]+'.png')],{windowsHide:true});
  }
  assert.deepEqual(errors,[]);console.log('Six caption layout families produce visible text in an actual exported MP4.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
