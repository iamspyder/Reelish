/* Independently authored data-driven compositions; no Captik renderer code. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.ReelishGraphicFamilies=api;api.extend(root.ReelishLayers);}})(typeof globalThis==='undefined'?this:globalThis,function(){
const definitions=[
 ['bars','Animated bar chart','Growth\n2024: 35\n2025: 65\n2026: 90'],['donut','Donut ratio','Completion\n75'],['chat','Chat conversation','You: Ready to start?\nMe: Let’s make something.'],['notification','Notification toast','A new milestone\nYour story reached 1,000 people.'],['calendar','Calendar date','Launch day\n27\nOCTOBER 2026'],['browser','Browser search','reelish.app\nTell your next story\nMake every frame count.'],['review','Star review','A story worth sharing\n5\nYour audience'],['receipt','Itemized receipt','Your project\nDesign: 25\nEditing: 40\nSound: 15']
];
const kinds=Object.fromEntries(definitions.map(([id,name])=>[id,name]));
function extend(layers){if(!layers||layers.kinds.bars)return;Object.assign(layers.kinds,kinds);for(const [kind,name,text] of definitions)layers.presets.push({id:kind+'-original',kind,name,text,theme:'gold',accent:'#f6bd45',background:'#17171c',color:'#ffffff'});}
function data(lines){return lines.slice(1,9).map((line,i)=>{const match=line.match(/^(.*?):\s*(-?\d+(?:\.\d+)?)\s*$/);return {label:match?match[1]:'Item '+(i+1),value:match?Math.max(0,Math.min(1e9,Number(match[2]))):0};});}
function render(el,l,progress,add){
 if(!kinds[l.kind])return false;const lines=l.text.split('\n').filter(Boolean),title=lines[0]||'Your story',rows=data(lines),eased=1-Math.pow(1-Math.min(1,progress*3),3);
 if(l.kind==='bars'){add('strong',title);const max=Math.max(1,...rows.map(x=>x.value)),chart=add('div','','data-bars');for(const row of rows){const col=document.createElement('div');col.className='data-bar-column';const value=document.createElement('b');value.textContent=String(Math.round(row.value*eased));const bar=document.createElement('i');bar.style.height=(row.value/max*3*eased)+'em';const label=document.createElement('small');label.textContent=row.label;col.append(value,bar,label);chart.append(col);}}
 else if(l.kind==='donut'){const value=Math.max(0,Math.min(100,Number(lines[1])||0));add('strong',title);const ring=add('div',Math.round(value*eased)+'%','data-donut');ring.style.background=`radial-gradient(circle,${l.background} 0 48%,transparent 49%),conic-gradient(var(--graphic-accent) ${value*eased}%,#ffffff18 0)`;}
 else if(l.kind==='chat'){add('small','CONVERSATION');lines.slice(0,6).forEach((line,i)=>{const bubble=add('p',line,'data-chat-bubble');bubble.style.alignSelf=i%2?'flex-end':'flex-start';bubble.style.opacity=String(Math.min(1,Math.max(0,progress*lines.length*2-i)));});}
 else if(l.kind==='notification'){add('small','● NEW NOTIFICATION');add('strong',title);add('p',lines.slice(1).join(' ')||'Something worth sharing.');const bar=add('div','','data-notification-timer');bar.style.width=(1-progress)*100+'%';}
 else if(l.kind==='calendar'){add('small',lines[2]||'SAVE THE DATE');add('strong',lines[1]||'27','data-date');add('p',title);}
 else if(l.kind==='browser'){add('small','● ● ●  '+title,'data-browser-chrome');add('strong',lines[1]||'Your headline');add('p',lines.slice(2).join(' ')||'Find your next idea.');}
 else if(l.kind==='review'){const stars=Math.max(0,Math.min(5,Math.round(Number(lines[1])||0)));add('span','★'.repeat(stars)+'☆'.repeat(5-stars),'data-review-stars');add('strong','“'+title+'”');add('small',lines[2]||'YOUR AUDIENCE');}
 else if(l.kind==='receipt'){add('strong',title);add('small','PROJECT RECEIPT');for(const row of rows){const item=add('p','','data-receipt-row'),label=document.createElement('span'),value=document.createElement('b');label.textContent=row.label;value.textContent=row.value.toFixed(2);item.append(label,value);}add('strong','TOTAL  '+rows.reduce((sum,row)=>sum+row.value,0).toFixed(2),'data-receipt-total');}
 return true;
}
return {kinds,definitions,extend,data,render};
});
