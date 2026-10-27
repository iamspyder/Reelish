/* The same DOM renderer is used by the editor and the frame exporter. */
(function(root){
const model=root.CliporaCaptions;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rgba=(hex,alpha)=>/^#[a-f\d]{6}$/i.test(hex)?`rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${alpha})`:hex;
function paint(container,cue,style,time,height,width){
 const f=model.frame(cue,style,time),st=f.style,unit=height/1920;
 Object.assign(container.style,{fontFamily:st.font,fontWeight:String(st.weight),fontStyle:st.italic?'italic':'normal',fontSize:Math.max(1,st.size*unit)+'px',letterSpacing:st.letterSpacing*unit+'px',lineHeight:String(st.lineHeight),color:st.color,webkitTextStroke:'0',textShadow:'none',opacity:'1',scale:'1'});
 const groups=new Map();for(const word of f.words.filter(w=>w.visible)){if(!groups.has(word.line))groups.set(word.line,[]);groups.get(word.line).push(word);}
 container.innerHTML=[...groups.values()].map(words=>'<span class="captionline">'+words.map(w=>{const translate=st.animation==='bounce'&&w.active?-Math.sin(w.progress*Math.PI)*.12:st.animation==='slide'?Math.max(0,1-(time-cue.start)/.18)*.4:0;const shadow=w.glow?`0 0 ${8*unit}px ${st.highlight},0 0 ${28*unit}px ${st.highlight}`:st.shadow?`0 ${2*unit}px ${5*unit}px #000`:'none';const box=w.box?`<span class="wordbox" style="background:${rgba(st.boxColor,st.boxOpacity)}"></span>`:'';return `<span class="word" style="color:${esc(w.color)};transform:translateY(${translate}em);font-size:${w.scale}em;opacity:${w.opacity};text-shadow:${shadow};-webkit-text-stroke:${st.outline*unit}px #151515;paint-order:stroke fill">${box}<span class="wordink">${esc(w.text)}</span></span>`;}).join(' ')+'</span>').join('');
 root.CliporaScenes?.decorate(container,cue,style,time,{width:width||container.parentElement.clientWidth,height});root.ReelishCaptionParity?.decorate(container,cue,style,time,f);return f;
}
root.CliporaView={paint};
})(typeof window==='undefined'?globalThis:window);
