const {_electron:electron}=require('playwright'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),media=require('../src/media.cjs');
(async()=>{
 const dir=path.resolve('test-output/openrouter-audio-desktop');await fs.mkdir(dir,{recursive:true});const input=path.join(dir,'source.mp4');execFileSync(media.ffmpeg,['-y','-f','lavfi','-i','color=navy:s=180x320:r=12:d=3','-f','lavfi','-i','sine=frequency=440:duration=3','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',input],{stdio:'ignore',windowsHide:true});
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const exe=process.env.CLIPORA_EXECUTABLE,app=await electron.launch({executablePath:exe||undefined,args:[...(exe?[]:[path.resolve('.')]),'--clipora-test-data='+path.join(dir,'user')],env});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForSelector('.templatecard');await app.evaluate(({dialog},file)=>dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]}),input);await page.click('#welcomeImport');await page.waitForFunction(()=>video.readyState>=2);
  await page.evaluate(()=>clipora.call('ai-settings-save',{mode:'personal',key:'sk-or-v1-desktop-test-not-a-real-key'}));
  await app.evaluate(()=>{globalThis.audioFailure=false;globalThis.audioCalls=0;globalThis.fetch=async(url,options)=>{
   if(url==='https://openrouter.ai/api/v1/models')return Response.json({data:[{id:'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',architecture:{input_modalities:['audio'],output_modalities:['text']},pricing:{prompt:'0',completion:'0'}}]});
   if(url!=='https://openrouter.ai/api/v1/chat/completions')throw Error('Unexpected endpoint');globalThis.audioCalls++;
   const body=JSON.parse(options.body);if(body.provider.max_price.prompt!==0||body.provider.max_price.completion!==0||!body.model.endsWith(':free')||body.messages[1].content[0].input_audio.format!=='flac')throw Error('Unexpected audio request');
   if(globalThis.audioFailure)return Response.json({error:{message:'This request requires at least $0.50 in balance for audio'}},{status:402});
   if(!body.messages[0].content.includes('Roman-letter Hinglish'))throw Error('Writing choice lost');
   return Response.json({choices:[{message:{content:'{"segments":[{"start":0,"end":3,"text":"Aaj hum video banayenge"}]}'}}]});
  };});
  await page.click('#transcribe');assert.equal(await page.inputValue('#captionEngine'),'openrouter');assert.equal(await page.locator('#captionGenerate').isDisabled(),false);await page.selectOption('#captionWriting','hinglish');await page.click('#captionGenerate');await page.waitForFunction(()=>p.cues.length>0&&p.cues[0].timingSource==='ai-estimated');
  assert.match(await page.locator('#captionTimingNotice').innerText(),/AI-estimated/);assert.equal(await page.locator('#captionTimingNotice').isVisible(),true);assert.equal(await page.evaluate(()=>p.cues.map(c=>c.text).join(' ')),'Aaj hum video banayenge');assert.equal(await page.evaluate(()=>p.style.captionPacing),'readable');assert.equal(await app.evaluate(()=>globalThis.audioCalls),1);
  const before=await page.evaluate(()=>JSON.stringify(p.cues));await app.evaluate(()=>globalThis.audioFailure=true);await page.click('#transcribe');await page.selectOption('#captionWriting','hinglish');await page.click('#captionGenerate');await page.waitForFunction(()=>document.getElementById('toast').textContent.includes('$0.50'));assert.equal(await page.evaluate(()=>JSON.stringify(p.cues)),before,'provider failure preserves previous captions');assert.deepEqual(errors,[]);
  console.log('Auto captions uses encrypted personal key, free audio and selected writing; estimated timing stays visible, and account failure preserves existing captions. Provider replies are fixtures.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
