const {_electron:electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs/promises');
(async()=>{
 const dir=path.resolve('test-output/ai-connection');await fs.mkdir(dir,{recursive:true});const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const exe=process.env.CLIPORA_EXECUTABLE,app=await electron.launch({executablePath:exe||undefined,args:[...(exe?[]:[path.resolve('.')]),'--clipora-test-data='+path.join(dir,'user')],env});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForSelector('#aiConnection',{state:'attached'});
  await page.click('[data-tab="ai"]');await page.click('#aiConnection');await page.selectOption('#aiMode','personal');
  const key='sk-or-v1-desktop-test-not-a-real-key';await page.fill('#openrouterKey',key);await page.click('#aiConnectionSave');
  const status=await page.evaluate(()=>clipora.call('ai-settings-get'));assert.equal(status.hasKey,true);assert.equal(status.mode,'personal');assert.equal(status.key,undefined);
  let raw=await fs.readFile(path.join(dir,'user/settings.json'),'utf8');assert.ok(!raw.includes(key));assert.ok(JSON.parse(raw).aiKeyEncrypted);
  const publicSettings=await page.evaluate(()=>clipora.call('settings-get'));assert.equal(publicSettings.aiKeyEncrypted,undefined);
  await page.evaluate(()=>clipora.call('settings-save',{engine:'online',language:'hi'}));assert.equal((await page.evaluate(()=>clipora.call('ai-settings-get'))).hasKey,true,'speech settings retain AI key');
  await page.click('#aiConnection');assert.equal(await page.inputValue('#openrouterKey'),'');await page.click('#aiConnectionSave');assert.equal((await page.evaluate(()=>clipora.call('ai-settings-get'))).hasKey,true);
  await app.evaluate(()=>{globalThis.fetch=async(url,options)=>{
   if(url!=='https://openrouter.ai/api/v1/chat/completions'||options.headers.Authorization!=='Bearer sk-or-v1-desktop-test-not-a-real-key')throw Error('Unexpected destination or credential');
   const body=JSON.parse(options.body);if(body.model!=='openrouter/free'||body.provider.max_price.prompt!==0||body.provider.max_price.completion!==0||options.redirect!=='error')throw Error('Free-only routing failed');
   return Response.json({choices:[{message:{content:'{"captions":[{"id":"one","text":"नमस्ते दुनिया"}]}'}}]});
  };});
  const result=await page.evaluate(async()=>{p.cues=[{id:'one',text:'Hello world',start:0,end:1}];return clipora.call('ai-task','translate',p,'hi');});assert.equal(result.captions[0].text,'नमस्ते दुनिया');
  await page.click('#aiConnection');await page.screenshot({path:path.join(dir,'connection.png')});await page.check('#removeOpenrouterKey');await page.click('#aiConnectionSave');assert.equal((await page.evaluate(()=>clipora.call('ai-settings-get'))).hasKey,false);raw=await fs.readFile(path.join(dir,'user/settings.json'),'utf8');assert.equal(JSON.parse(raw).aiKeyEncrypted,undefined);
  assert.deepEqual(errors,[]);console.log('Desktop key entry, OS encryption, secret redaction, preservation, direct free AI request, blank save and removal passed.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
