// Audit factual identifiers/descriptors only; captured target JavaScript is never evaluated.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const original=JSON.parse(read('evidence/templates-v2-findings.json'));
const looks=JSON.parse(read('src/look-presets.json'));
const context={window:{}};vm.createContext(context);vm.runInContext(read('src/templates.js'),context); // Reelish-owned code only.
const classics=context.window.CliporaPresets.templates;
const shippedIds=new Set([...looks,...classics].map(x=>x.id));
const sourceFiles=['evidence/reference-editor','evidence/captik-editor-bundles'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(f=>/\.js(?:\.txt)?$/.test(f)).map(f=>path.posix.join(dir,f)));
const candidates=new Set(),sources=[];
for(const file of sourceFiles){const text=read(file);for(const match of text.matchAll(/\bid\s*:\s*["'](look_[a-z_]+)["']/g))candidates.add(match[1]);sources.push({path:file,sha256:crypto.createHash('sha256').update(text).digest('hex'),bytes:Buffer.byteLength(text)});}
const countBy=(list,key)=>list.reduce((out,item)=>(out[item[key]||'unspecified']=(out[item[key]||'unspecified']||0)+1,out),{});
const fonts=new Set();
function collect(value,key){if(Array.isArray(value))value.forEach(x=>collect(x));else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>collect(v,k));else if(typeof value==='string'&&/font$/i.test(key||''))fonts.add(value);}
looks.forEach(x=>collect(x));
const aliases=[...fonts].map(font=>({declared:font,rendered:context.window.CliporaPresets.aliasFont(font)}));
const exactDistinctAliasLoss=aliases.filter(x=>x.declared.split(',')[0].replace(/["']/g,'').replace(/\s/g,'').toLowerCase()!==x.rendered.replace(/\s/g,'').toLowerCase());
const report={date:'2026-10-28',boundary:'Captured Captik caption catalog; excludes graphics, arbitrary future server styles and unobserved colour variants',evidenceIds:{catalog:original.catalogEvidence,editorAssets:original.editorAssetsEvidence,editorReference:original.editorReferenceEvidence},observedCatalog:{total:original.catalog.length,classics:original.catalog.filter(x=>!x.look).length,looks:original.catalog.filter(x=>x.look).length,categories:countBy(original.catalog,'category')},reelish:{referenceClassics:classics.length,referenceLooks:looks.length,lookFamilies:countBy(looks,'family'),missingObservedIds:original.catalog.filter(x=>!shippedIds.has(x.id)).map(x=>x.id),missingCapturedLookIds:[...candidates].filter(id=>!shippedIds.has(id)).sort(),duplicateLookIds:looks.filter((x,i)=>looks.findIndex(y=>y.id===x.id)!==i).map(x=>x.id)},fonts:{declared:fonts.size,aliases,distinctNameSubstitutions:exactDistinctAliasLoss},sources,limitations:['Inventory equality is not rendered or behavioral equality.','The captured original preview was black; every style cannot be claimed visually matched.','Captured descriptors may contain unresolved runtime constants, dynamic spreads or aliases.','Font name alias differences include both internal family aliases and genuine substitutes; inspect each entry.','No captured JavaScript was evaluated or incorporated as implementation code.']};
const out=path.join(root,'test-output','caption-catalog-audit.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,sources:report.sources.map(x=>({path:x.path,sha256:x.sha256})),fonts:{declared:report.fonts.declared,distinctNameSubstitutions:report.fonts.distinctNameSubstitutions}},null,2));
if(report.reelish.missingObservedIds.length||report.reelish.missingCapturedLookIds.length||report.reelish.duplicateLookIds.length)process.exitCode=1;
