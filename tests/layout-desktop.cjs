const {_electron:electron}=require('playwright'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({executablePath:process.env.CLIPORA_EXECUTABLE||undefined,args:[...(process.env.CLIPORA_EXECUTABLE?[]:[path.resolve('.')]),'--clipora-test-data='+path.resolve('test-output/layout')],env});
 try{
  const page=await app.firstWindow();await page.waitForSelector('#resetLayout');await page.click('#resetLayout');
  const width=selector=>page.locator(selector).evaluate(el=>el.getBoundingClientRect().width);
  for(const [key,selector,dx,dy] of [['rail','.rail',20,0],['left','.left',65,0],['right','.inspector',-60,0],['timeline','.timeline',0,-65]]){
   const before=await page.locator(selector).boundingBox(),h=await page.locator(`[data-resize="${key}"]`).boundingBox();
   await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();await page.mouse.move(h.x+h.width/2+dx,h.y+h.height/2+dy,{steps:8});await page.mouse.up();
   const after=await page.locator(selector).boundingBox();assert.ok((dy?after.height-before.height:after.width-before.width)>15,key+' resized');
  }
  const saved=await width('.left');await page.reload();await page.waitForSelector('#resetLayout');assert.ok(Math.abs(await width('.left')-saved)<1,'layout persists');
  await page.locator('[data-resize="left"]').focus();await page.keyboard.press('ArrowRight');assert.ok(await width('.left')>saved,'keyboard resizing');
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1100,720));await page.waitForTimeout(200);
  const stage=await page.locator('.stage').boundingBox();assert.ok(stage.width>=259&&stage.height>=159,'minimum usable preview');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await page.click('#resetLayout');assert.equal(Math.round(await width('.left')),275);
  console.log('Panel dragging, keyboard controls, persistence, narrow-window limits and reset passed.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
