/* Editor layout preferences belong to this device, independently of projects. */
(()=>{
  const main=document.querySelector('main'),key='reelish.layout.v1';
  const defaults={rail:65,left:275,right:325,timeline:219};
  let sizes={...defaults},pending=false;
  try{const saved=JSON.parse(localStorage.getItem(key));for(const k in sizes)if(Number.isFinite(saved?.[k]))sizes[k]=saved[k];}catch{}
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const limits=()=>({rail:[56,110],left:[180,Math.max(180,main.clientWidth-sizes.rail-sizes.right-260)],right:[220,Math.max(220,main.clientWidth-sizes.rail-sizes.left-260)],timeline:[150,Math.max(150,main.clientHeight-238)]});
  const handles={};
  function apply(){
    sizes.rail=clamp(sizes.rail,56,110);
    sizes.right=clamp(sizes.right,220,Math.max(220,main.clientWidth-sizes.rail-440));
    for(const k of ['left','timeline'])sizes[k]=clamp(sizes[k],...limits()[k]);
    for(const k in sizes)main.style.setProperty(`--${k==='timeline'?'timeline-height':k+'-width'}`,sizes[k]+'px');
    const top=main.clientHeight-sizes.timeline;
    for(const [k,h] of Object.entries(handles)){
      const [min,max]=limits()[k];h.setAttribute('aria-valuemin',min);h.setAttribute('aria-valuemax',Math.round(max));h.setAttribute('aria-valuenow',Math.round(sizes[k]));
      if(k==='timeline')h.style.top=top+'px';
      else{h.style.left=(k==='rail'?sizes.rail:k==='left'?sizes.rail+sizes.left:main.clientWidth-sizes.right)+'px';h.style.height=top+'px';}
    }
    if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;updatePreview();});}
  }
  function save(){try{localStorage.setItem(key,JSON.stringify(sizes));}catch{}}
  for(const [k,label] of Object.entries({rail:'Navigation width',left:'Transcript and tools width',right:'Styles and settings width',timeline:'Timeline height'})){
    const h=document.createElement('div'),horizontal=k==='timeline';handles[k]=h;
    h.className='layout-divider '+(horizontal?'horizontal':'vertical');h.dataset.resize=k;h.tabIndex=0;h.role='separator';
    h.setAttribute('aria-label',label);h.setAttribute('aria-orientation',horizontal?'horizontal':'vertical');h.title=label+' — drag to resize; double-click to reset';main.append(h);
    let drag=null;
    h.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();drag={id:e.pointerId,start:horizontal?e.clientY:e.clientX,value:sizes[k]};h.setPointerCapture(e.pointerId);h.classList.add('dragging');document.body.classList.add('resizing-layout');document.body.style.cursor=horizontal?'row-resize':'col-resize';});
    h.addEventListener('pointermove',e=>{if(!drag)return;const delta=(horizontal?e.clientY:e.clientX)-drag.start;sizes[k]=clamp(drag.value+delta*(k==='right'||horizontal?-1:1),...limits()[k]);apply();});
    const finish=()=>{if(!drag)return;drag=null;h.classList.remove('dragging');document.body.classList.remove('resizing-layout');document.body.style.cursor='';save();};
    h.addEventListener('pointerup',finish);h.addEventListener('pointercancel',finish);h.addEventListener('lostpointercapture',finish);
    h.addEventListener('dblclick',()=>{sizes[k]=defaults[k];apply();save();});
    h.addEventListener('keydown',e=>{const keys=horizontal?['ArrowUp','ArrowDown']:['ArrowLeft','ArrowRight'];if(!keys.includes(e.key)&&e.key!=='Home')return;e.preventDefault();e.stopPropagation();sizes[k]=e.key==='Home'?defaults[k]:clamp(sizes[k]+(e.key===keys[0]?-1:1)*(e.shiftKey?30:10)*(k==='right'||horizontal?-1:1),...limits()[k]);apply();save();});
  }
  const reset=document.createElement('button');reset.id='resetLayout';reset.textContent='Reset layout';reset.title='Restore default panel sizes';reset.onclick=()=>{sizes={...defaults};apply();save();};document.querySelector('.timelineheading>div').prepend(reset);
  new ResizeObserver(apply).observe(main);
  new ResizeObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;updatePreview();});}}).observe(document.querySelector('.stage'));
  apply();
})();
