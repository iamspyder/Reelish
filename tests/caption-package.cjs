const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),asar=require('@electron/asar');
const archive=path.resolve(process.argv[2]||'dist/win-unpacked/resources/app.asar');
const read=file=>asar.extractFile(archive,path.normalize(file));
const same=file=>assert.ok(read(file).equals(fs.readFileSync(file)),file+' differs in packaged app');
for(const file of ['src/style-scenes.js','src/templates.js','src/studio.js','src/assets/fonts/fonts.css','src/assets/fonts/NOTICE.txt','src/assets/fonts/manifest.json'])same(file);
const manifest=JSON.parse(read('src/assets/fonts/manifest.json'));
assert.equal(manifest.families.length,44);
for(const family of manifest.families){same('src/assets/fonts/'+family.license);for(const face of family.faces)same('src/assets/fonts/'+face.file);}
assert.equal(JSON.parse(read('package.json')).version,require('../package.json').version);
console.log('Packaged caption renderer, 44 font families and licenses match the tested source.');
