const {_electron:electron}=require('playwright'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict');
(async()=>{
 const dir=path.resolve('test-output/caption-parity');await fs.mkdir(dir,{recursive:true});const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const exe=process.env.CLIPORA_EXECUTABLE;const app=await electron.launch({executablePath:exe||undefined,args:[...(exe?[]:[path.resolve('.')]),'--clipora-test-data='+path.join(dir,'user')],env});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForSelector('#mergeCaptionUp');
  const initial=[{id:'a',start:0,end:1,text:'One two',words:[{text:'One',start:.1,end:.4,emphasis:false},{text:'two',start:.5,end:.9,emphasis:true}]},{id:'b',start:1.2,end:2,text:'Three',words:[{text:'Three',start:1.3,end:1.9,emphasis:false}]}];
  await page.evaluate(cues=>{p.cues=cues;selectedCue='b';renderAll();},initial);
  await page.click('#mergeCaptionUp');let cues=await page.evaluate(()=>p.cues);assert.equal(cues.length,1);assert.deepEqual(cues[0].words,initial.flatMap(c=>c.words));assert.equal(cues[0].text,'One two Three');
  await page.click('#undo');assert.deepEqual(await page.evaluate(()=>p.cues),initial);
  await page.evaluate(()=>{selectedCue='a';renderCaptions();});await page.click('#mergeCaptionDown');assert.deepEqual(await page.evaluate(()=>p.cues[0].words),initial.flatMap(c=>c.words));await page.click('#undo');
  await page.evaluate(()=>{selectedCue='a';renderCaptions();});await page.selectOption('#cueDepth','behind');assert.equal(await page.evaluate(()=>p.cues[0].style.behindSubject),true);await page.selectOption('#cueDepth','front');assert.equal(await page.evaluate(()=>p.cues[0].style.behindSubject),false);await page.selectOption('#cueDepth','inherit');assert.equal(await page.evaluate(()=>p.cues[0].style.behindSubject),undefined);
  await page.click('[data-inspector="text"]');await page.locator('.caption-parity-controls summary').click();
  await page.selectOption('[data-parity-style="entranceMotion"]','rise');await page.selectOption('[data-parity-style="exitMotion"]','slide');await page.selectOption('[data-parity-style="wordMotion"]','pop');
  await page.locator('[data-parity-style="activeWordColor"]').evaluate(el=>{el.value='#12ab34';el.dispatchEvent(new Event('change',{bubbles:true}));});
  for(const key of ['activeUnderline','activeGrow','activeGlow'])await page.check(`[data-parity-style="${key}"]`);
  await page.selectOption('[data-parity-style="futureWords"]','hide');await page.fill('[data-parity-style="captionTilt"]','-12');await page.locator('[data-parity-style="captionTilt"]').press('Tab');await page.locator('[data-parity-style="captionOpacity"]').evaluate(el=>{el.value='.5';el.dispatchEvent(new Event('change',{bubbles:true}));});
  const appearance=await page.evaluate(()=>{const el=$('captionOverlay');CliporaView.paint(el,p.cues[0],p.style,.2,1920,1080);return {tilt:el.style.rotate,underline:el.querySelector('.word').style.textDecoration,glow:el.querySelector('.word').style.textShadow,future:el.querySelectorAll('.word')[1].style.visibility};});assert.equal(appearance.tilt,'-12deg');assert.equal(appearance.underline,'underline');assert.match(appearance.glow,/currentcolor/i);assert.equal(appearance.future,'hidden');
  const preview=await page.evaluate(()=>{const el=$('captionOverlay');CliporaView.paint(el,p.cues[0],p.style,.2,1920,1080);return {opacity:el.style.opacity,transform:el.querySelector('.word').style.transform,color:el.querySelector('.word').style.color};});assert.ok(Number(preview.opacity)<1);assert.match(preview.transform,/translateY/);assert.match(preview.transform,/scale/);assert.equal(preview.color,'rgb(18, 171, 52)');
  const before=await page.evaluate(()=>JSON.stringify(p));await page.click('#previewGrid');await page.selectOption('#previewMagnification','1.5');assert.equal(await page.evaluate(()=>JSON.stringify(p)),before);assert.equal(await page.locator('.preview-grid').evaluate(el=>el.classList.contains('hidden')),false);assert.equal(await page.locator('#frame').evaluate(el=>el.style.scale),'1.5');
  await page.screenshot({path:path.join(dir,'controls.png')});
  // Load the actual exporter document in another Electron window and compare shared paint.
  const exportPageReady=app.waitForEvent('window');
  const exportWindow=await app.evaluate(async({app:electronApp,BrowserWindow},input)=>{const file=input.packaged?electronApp.getAppPath()+'/src/export.html':input.file;const win=new BrowserWindow({show:false,webPreferences:{nodeIntegration:false,contextIsolation:true}});await win.loadFile(file);return win.id;},{file:path.resolve('src/export.html'),packaged:!!exe});
  const exportPage=await exportPageReady;await exportPage.waitForFunction(()=>typeof CliporaView!=='undefined'&&typeof ReelishCaptionParity!=='undefined');
  const payload=await page.evaluate(()=>({cue:p.cues[0],style:p.style}));const exported=await exportPage.evaluate(({cue,style})=>{const el=document.getElementById('caption');CliporaView.paint(el,cue,style,.2,1920,1080);return {opacity:el.style.opacity,transform:el.querySelector('.word').style.transform,color:el.querySelector('.word').style.color,guide:!!document.querySelector('.preview-grid'),scale:document.getElementById('frame').style.scale};},payload);
  assert.deepEqual({opacity:exported.opacity,transform:exported.transform,color:exported.color},preview);assert.equal(exported.guide,false);assert.equal(exported.scale,'');
  await app.evaluate(({BrowserWindow},id)=>BrowserWindow.fromId(id).close(),exportWindow);assert.deepEqual(errors,[]);
  console.log('Caption merge timing/emphasis, undo, per-cue depth, independent motion UI, shared export paint, and preview-only guides/magnification passed.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
