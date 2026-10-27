const quality={draft:28,standard:23,high:18,best:14};
function resolve(p={}){return {fps:[24,30,60].includes(p.exportFps)?p.exportFps:30,crf:quality[p.exportQuality]??18,preset:p.exportEncoding==='quality'?'medium':'fast'};}
module.exports={resolve,quality};
