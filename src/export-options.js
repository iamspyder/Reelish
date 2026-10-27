(()=>{
 const previous=$('export').onclick;$('export').onclick=()=>{previous();const resolution=$('resolution');if(!resolution)return;
  const settings=document.createElement('div');settings.innerHTML='<label>Frame rate<select id="exportFrameRate"><option value="24">24 fps</option><option value="30">30 fps</option><option value="60">60 fps</option></select></label><label>Encoding quality<select id="exportQuality"><option value="draft">Draft · smaller file</option><option value="standard">Standard</option><option value="high">High</option><option value="best">Best · larger file</option></select></label><label>Encoding effort<select id="exportEncoding"><option value="fast">Faster export</option><option value="quality">More compression · slower</option></select></label>';
  resolution.closest('label').after(settings);$('exportFrameRate').value=String(p.exportFps||30);$('exportQuality').value=p.exportQuality||'high';$('exportEncoding').value=p.exportEncoding||'fast';
  const start=$('exportStart').onclick;$('exportStart').onclick=()=>{p.exportFps=Number($('exportFrameRate').value);p.exportQuality=$('exportQuality').value;p.exportEncoding=$('exportEncoding').value;return start();};
 };
})();
