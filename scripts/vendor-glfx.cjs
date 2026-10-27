const {execFileSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const commit='86ae72acfffcd50774507eb7b69887ba2493dc35',base='repos/evanw/glfx.js',dir=path.resolve('src/vendor/glfx');
const tree=JSON.parse(execFileSync('gh',['api',`${base}/git/trees/${commit}?recursive=1`],{encoding:'utf8'}));
const selected=tree.tree.filter(x=>x.type==='blob'&&(x.path.startsWith('src/')&&x.path.endsWith('.js')||x.path==='LICENSE')).sort((a,b)=>a.path.localeCompare(b.path));
fs.mkdirSync(dir,{recursive:true});const sources=[];for(const entry of selected){const blob=JSON.parse(execFileSync('gh',['api',`${base}/git/blobs/${entry.sha}`],{encoding:'utf8'}));const source=Buffer.from(blob.content,'base64').toString('utf8');if(entry.path==='LICENSE')fs.writeFileSync(path.join(dir,'LICENSE'),source);else sources.push('// '+entry.path+'\n'+source);}
fs.writeFileSync(path.join(dir,'glfx.js'),'/* glfx.js - Copyright 2011 Evan Wallace - MIT license, see LICENSE. Pinned '+commit+' */\nvar fx=(function(){var exports={};\n'+sources.join('\n')+'\nreturn exports;})();\n');
fs.writeFileSync(path.join(dir,'SOURCE.json'),JSON.stringify({repository:'https://github.com/evanw/glfx.js',commit,paths:selected.map(x=>x.path)},null,2)+'\n');console.log('Vendored',selected.length,'pinned source files');
