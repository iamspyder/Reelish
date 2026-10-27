const path=require('node:path');
const model=require('./audio-tools.js');
const bundled=require('./assets/sounds/kenney-interface/catalog.json');
function assets(){return Object.fromEntries(bundled.map(e=>[e.id,{...e,file:path.join(__dirname,'assets','sounds','kenney-interface',e.file),source:'Kenney · CC0'}]));}
function catalog(effects){return Object.entries(effects).map(([id,e])=>({id,name:e.name||id.replace(/(^|\s)\w/g,c=>c.toUpperCase()),duration:e.duration,category:e.category||model.category(id),source:e.source||'Reelish procedural'}));}
module.exports={...model,assets,catalog};
