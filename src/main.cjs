const localMedia=require('./local-media.cjs');
const speech=require('./speech.cjs');
const onlineSpeech=require('./online-speech.cjs');
const {app,BrowserWindow,ipcMain,dialog,protocol,net,shell,safeStorage}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url');
const core=require('./core.cjs'),media=require('./media.cjs');
const fonts=require('./fonts.cjs'),mediaTools=require('./media-tools.cjs'),frames=require('./frame-export.cjs'),audio=require('./audio-render.cjs');
const testData=process.argv.find(a=>a.startsWith('--clipora-test-data='));
if(testData)app.setPath('userData',testData.split('=').slice(1).join('='));
protocol.registerSchemesAsPrivileged([{scheme:'clipora-media',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
let win,busy=false;const allowed=new Set();
const settingsPath=()=>path.join(app.getPath('userData'),'settings.json');
const recoveryPath=()=>path.join(app.getPath('userData'),'recovery.clipora');
async function settings(){try{const j=JSON.parse(await fs.readFile(settingsPath(),'utf8'));if(j.keyEncrypted)j.apiKey=safeStorage.decryptString(Buffer.from(j.keyEncrypted,'base64'));return speech.normalizeSettings(j);}catch{return speech.normalizeSettings({});}}
function authorize(p){core.validate(p);for(const c of p.clips)if(!allowed.has(c.path))throw Error('Reopen the project to grant access to its media');if(p.music?.path&&!allowed.has(p.music.path))throw Error('Import the audio file first');for(const f of p.userFonts||[])if(!allowed.has(f.path))throw Error('Import the font or reopen the project first');for(const sound of p.sounds||[])if(!allowed.has(sound.path))throw Error('Import the sound effect or reopen the project first');return p;}
async function allowProject(p){core.validate(p);for(const c of p.clips)allowed.add(c.path);if(p.music?.path)allowed.add(p.music.path);for(const f of p.userFonts||[])allowed.add(f.path);for(const sound of p.sounds||[])allowed.add(sound.path);return p;}
const importedFontDir=()=>path.join(app.getPath('userData'),'imported-fonts');
handle('font-list',async()=>{const imported=fonts.listImportedFonts(importedFontDir());for(const f of imported)allowed.add(f.path);return {families:fonts.manifest.families,imported};});
handle('font-import',async()=>{const r=await dialog.showOpenDialog(win,{filters:[{name:'Font file',extensions:['ttf','otf']}]});if(r.canceled)return null;const font=fonts.importFont(r.filePaths[0],importedFontDir());allowed.add(font.path);return font;});
handle('media-thumbnail',async file=>{if(!allowed.has(file))throw Error('Select media first');return mediaTools.thumbnail(file);});
handle('media-waveform',async file=>{if(!allowed.has(file))throw Error('Select media first');return mediaTools.waveform(file);});
handle('effects-list',async()=>Object.entries(audio.effects).map(([id,effect])=>({id,name:id.replace(/(^|\s)\w/g,s=>s.toUpperCase()),duration:effect.duration})));
handle('effect-create',async id=>{if(!Object.hasOwn(audio.effects,id))throw Error('Unknown effect');const dir=path.join(app.getPath('userData'),'sound-effects');await fs.mkdir(dir,{recursive:true});const file=path.join(dir,id+'.wav');try{await fs.access(file);}catch{await audio.generateEffect(id,file);}allowed.add(file);return {id:crypto.randomUUID(),name:id,path:file,duration:audio.effects[id].duration,volume:.7,in:0};});
function handle(name,fn){ipcMain.handle(name,async(event,...args)=>{if(event.sender!==win.webContents)throw Error('Invalid sender');return fn(...args);});}
async function job(fn){if(busy)throw Error('Another operation is running');busy=true;try{return await fn();}finally{busy=false;}}
const progress=data=>win?.webContents.send('progress',data);
app.whenReady().then(async()=>{protocol.handle('clipora-media',request=>localMedia.serve(request,allowed));
win=new BrowserWindow({width:1500,height:960,minWidth:1100,minHeight:720,backgroundColor:'#0b0d12',title:'Reelish',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,autoplayPolicy:'no-user-gesture-required'}});win.on('closed',()=>{speech.cancel();onlineSpeech.cancel();frames.cancel();media.cancel();app.quit();});win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());await win.loadFile(path.join(__dirname,'index.html'));if(process.env.CLIPORA_TEST)win.webContents.openDevTools({mode:'detach'});
});
handle('import-media',async(kind='video')=>{const r=await dialog.showOpenDialog(win,{properties:['openFile',...(kind==='video'?['multiSelections']:[])],filters:[{name:kind==='audio'?'Audio':'Video',extensions:kind==='audio'?['mp3','wav','m4a','ogg','flac']:['mp4','mov','webm','mkv','avi','m4v']}]});if(r.canceled)return [];const items=[];for(const file of r.filePaths){allowed.add(file);const info=await media.probe(file);if(kind==='video'&&!info.width)throw Error('Selected file has no video stream');items.push(info);}return items;});
handle('save-project',async(p,saveAs)=>{authorize(p);const r=await dialog.showSaveDialog(win,{defaultPath:`${p.name||'Untitled'}.reelish`,filters:[{name:'Reelish project',extensions:['reelish','clipora']}]});if(r.canceled)return null;await fs.writeFile(r.filePath,JSON.stringify(p,null,2));return r.filePath;});
handle('open-project',async()=>{const r=await dialog.showOpenDialog(win,{filters:[{name:'Reelish project',extensions:['reelish','clipora']}]});if(r.canceled)return null;const p=await allowProject(JSON.parse(await fs.readFile(r.filePaths[0],'utf8')));const missing=[];for(const c of p.clips)try{await fs.access(c.path);}catch{missing.push(c.path);}return {project:p,missing};});
handle('autosave',async p=>{authorize(p);await fs.writeFile(recoveryPath(),JSON.stringify(p));return true;});
handle('recover',async()=>{try{return await allowProject(JSON.parse(await fs.readFile(recoveryPath(),'utf8')));}catch{return null;}});
handle('import-subtitles',async()=>{const r=await dialog.showOpenDialog(win,{filters:[{name:'Subtitles',extensions:['srt','vtt']}]});if(r.canceled)return null;const cues=core.parseSubtitles(await fs.readFile(r.filePaths[0],'utf8'));if(!cues.length)throw Error('No valid timed captions found');return cues;});
handle('export-subtitles',async(p,format)=>{authorize(p);if(!['srt','vtt','ass'].includes(format))throw Error('Unsupported subtitle format');const r=await dialog.showSaveDialog(win,{defaultPath:`${p.name||'Captions'}.${format}`,filters:[{name:'Subtitles',extensions:[format]}]});if(r.canceled)return null;const output=format==='srt'?core.srt(p.cues):format==='vtt'?core.vtt(p.cues):core.makeAss(p,...media.dimensions(p,1080));await fs.writeFile(r.filePath,output);return r.filePath;});
handle('export-video',async(p,res)=>job(async()=>{authorize(p);if(![720,1080,2160].includes(Number(res)))throw Error('Unsupported resolution');const r=await dialog.showSaveDialog(win,{defaultPath:`${p.name||'Reelish export'}.mp4`,filters:[{name:'MP4 video',extensions:['mp4']}]});if(r.canceled)return null;if(p.clips.some(c=>path.resolve(c.path).toLowerCase()===path.resolve(r.filePath).toLowerCase()))throw Error('Choose a different path from your source video');const partial=r.filePath+'.clipora-render.mp4';try{await frames.render(p,partial,res,progress,{allowFile:file=>allowed.add(file),removeFile:file=>allowed.delete(file)});await fs.rename(partial,r.filePath);return r.filePath;}catch(e){await fs.rm(partial,{force:true});throw e;}}));
handle('silences',async(p,mode)=>job(async()=>{authorize(p);return media.silences(p,mode);}));
handle('apply-silences',async(p,ranges)=>{authorize(p);return core.removeRanges(p,ranges);});
handle('trim-clip',async(p,index,start,end)=>{authorize(p);return core.trimClip(p,index,start,end);});
handle('transcribe',async p=>job(async()=>(async()=>{const s=await settings();return s.engine==='online'?onlineSpeech.transcribe(authorize(p),s,progress):s.engine==='bundled'?speech.transcribe(authorize(p),s,progress):media.transcribe(authorize(p),s,progress);})()));
handle('settings-get',async()=>{const s=await settings();return {...s,apiKey:undefined,keyEncrypted:undefined,hasKey:!!s.apiKey,online:onlineSpeech.status()};});
handle('settings-save',async value=>{const old=await settings();const next={engine:value.engine,language:value.language,hinglish:!!value.hinglish,whisperExe:value.whisperExe||'',whisperModel:value.whisperModel||''};const key=value.clearKey?'':value.apiKey||old.apiKey;if(key){if(!safeStorage.isEncryptionAvailable())throw Error('Windows credential encryption is unavailable');next.keyEncrypted=safeStorage.encryptString(key).toString('base64');}await fs.writeFile(settingsPath(),JSON.stringify(next));return true;});
handle('choose-engine-file',async kind=>{const r=await dialog.showOpenDialog(win,{filters:[{name:kind==='exe'?'whisper.cpp executable':'Whisper model',extensions:[kind==='exe'?'exe':'bin']}]});return r.canceled?null:r.filePaths[0];});
handle('cancel',()=>{speech.cancel();onlineSpeech.cancel();frames.cancel();audio.cancel();media.cancel();return true;});
handle('reveal',async file=>{if(typeof file==='string')shell.showItemInFolder(file);});
app.on('window-all-closed',()=>{speech.cancel();onlineSpeech.cancel();media.cancel();app.quit();});
