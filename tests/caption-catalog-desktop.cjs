// Render every catalog entry through the real desktop preview/export painter.
const {_electron:electron}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
(async()=>{
 const dir=path.resolve('test-output/caption-catalog');await fs.mkdir(dir,{recursive:true});
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const exe=process.env.CLIPORA_EXECUTABLE;
 const app=await electron.launch({executablePath:exe||undefined,args:[...(exe?[]:[path.resolve('.')]),'--clipora-test-data='+path.join(dir,'user')],env});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.waitForSelector('.templatecard');
  const entries=await page.evaluate(()=>templates.map((t,index)=>({id:t.id,name:t.name,index})));
  assert.ok(entries.length>=136);
  await page.evaluate(async()=>{
   const host=document.createElement('section');host.id='catalog-proof';Object.assign(host.style,{position:'fixed',inset:'0',background:'#182131',zIndex:'9999',overflow:'auto'});
   host.innerHTML='<div id="catalog-paint" style="position:relative;width:270px;height:480px;overflow:hidden;background:#182131"><div id="catalog-caption" style="position:absolute;left:50%;width:88%;transform:translate(-50%,-50%);text-align:center"></div></div>';
   document.body.appendChild(host);
   window.catalogCue={start:0,end:4,text:'Make every word count today',words:[{text:'Make',start:0,end:.5},{text:'every',start:.5,end:1},{text:'word',start:1,end:1.8},{text:'count',start:1.8,end:2.8},{text:'today',start:2.8,end:4}]};
   for(const t of templates)for(const font of [t.style.font,t.style.heroFont,t.style.supportFont])if(font)await document.fonts.load('400 24px "'+font+'"');await document.fonts.ready;
  });
  const blankHash=crypto.createHash('sha256').update(await page.locator('#catalog-paint').screenshot()).digest('hex');
  const rows=[];
  for(let i=0;i<entries.length;i++){
   const frames=[];
   for(const time of [.32,1.42,3.24]){
    const result=await page.evaluate(({i,time})=>{
     const t=templates[i],el=document.getElementById('catalog-caption');el.removeAttribute('style');Object.assign(el.style,{position:'absolute',left:'50%',width:'88%',transform:'translate(-50%,-50%)',textAlign:'center',top:t.style.position+'%'});
     CliporaView.paint(el,window.catalogCue,t.style,time,480,270);
     return {text:el.textContent,scene:el.dataset.scene||'words',font:getComputedStyle(el).fontFamily};
    },{i,time});
    assert.ok(result.text.trim(),entries[i].name+' is empty at '+time);
    const bytes=await page.locator('#catalog-paint').screenshot({animations:'disabled'});
    frames.push(crypto.createHash('sha256').update(bytes).digest('hex'));
    if(time===1.42)await fs.writeFile(path.join(dir,entries[i].id+'.png'),bytes);
   }
   rows.push({...entries[i],frames});
  }
  const duplicates=[];for(let i=0;i<rows.length;i++)for(let j=0;j<i;j++)if(rows[i].frames.join()===rows[j].frames.join())duplicates.push([rows[j].name,rows[i].name]);
  await fs.writeFile(path.join(dir,'report.json'),JSON.stringify({count:rows.length,duplicates,rows},null,2));
  // Contact sheets use the rendered desktop frames, with names outside the image.
  for(let offset=0;offset<entries.length;offset+=24){
   const selected=entries.slice(offset,offset+24),items=[];
   for(const e of selected)items.push({name:e.name,data:(await fs.readFile(path.join(dir,e.id+'.png'))).toString('base64')});
   await page.evaluate(items=>{const host=document.getElementById('catalog-proof');host.style.overflow='visible';host.innerHTML='';const sheet=document.createElement('div');sheet.id='catalog-sheet';Object.assign(sheet.style,{display:'grid',gridTemplateColumns:'repeat(6,180px)',gap:'8px',padding:'12px',background:'#0c1019',width:'1144px'});for(const item of items){const box=document.createElement('div');box.style.color='#fff';box.style.font='12px sans-serif';const image=document.createElement('img');image.src='data:image/png;base64,'+item.data;image.style.width='180px';image.style.display='block';box.append(image,document.createTextNode(item.name));sheet.append(box);}host.append(sheet);},items);
   await page.locator('#catalog-sheet img').evaluateAll(imgs=>Promise.all(imgs.map(im=>im.decode())));
   await page.locator('#catalog-sheet').screenshot({path:path.join(dir,'sheet-'+(offset/24+1)+'.png')});
  }
  assert.deepEqual(rows.filter(row=>row.frames.every(hash=>hash===blankHash)).map(row=>row.name),[],'each caption style must produce visible pixels');
  assert.deepEqual(duplicates,[],'different names must not produce identical frames across all sampled word times');
  assert.deepEqual(errors,[]);
  console.log(rows.length+' caption styles render at three word times with no identical sequences; desktop contact sheets saved.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
