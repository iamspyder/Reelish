(function(root){
 const clamp=(v,a,b,f)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):f;
 function settings(value={}){const threshold=clamp(value.threshold,.02,.98,.5),softness=clamp(value.softness,.01,1,.5);return {low:Math.max(0,threshold-softness/2),high:Math.min(1,threshold+softness/2),feather:clamp(value.feather,0,12,0)};}
 function alpha(value,options){const {low,high}=settings(options),t=Math.max(0,Math.min(1,(value-low)/(high-low)));return Math.round(255*t*t*(3-2*t));}
 const api={settings,alpha};if(typeof module==='object'&&module.exports)module.exports=api;else root.ReelishCutout=api;
 if(typeof document==='undefined'||typeof p==='undefined')return;
 const panel=document.createElement('details');panel.id='cutoutTools';panel.innerHTML='<summary>Person cutout edges</summary><p class="muted">Adjust confidence and feathering for behind-person captions. These controls refine segmentation; they do not provide frame-by-frame brush correction.</p><label>Confidence threshold<input id="cutoutThreshold" type="range" min=".02" max=".98" step=".01" value=".5"></label><label>Edge softness<input id="cutoutSoftness" type="range" min=".01" max="1" step=".01" value=".5"></label><label>Feather (mask pixels)<input id="cutoutFeather" type="range" min="0" max="12" step=".5" value="0"></label><button id="cutoutReset">Reset cutout edges</button>';$('panel-edit').append(panel);
 for(const [id,key]of [['cutoutThreshold','threshold'],['cutoutSoftness','softness'],['cutoutFeather','feather']])$(id).onchange=()=>update(()=>{p.cutout||={};p.cutout[key]=Number($(id).value);});$('cutoutReset').onclick=()=>update(()=>delete p.cutout);
 const prior=renderAll;renderAll=function(){prior();$('cutoutThreshold').value=p.cutout?.threshold??.5;$('cutoutSoftness').value=p.cutout?.softness??.5;$('cutoutFeather').value=p.cutout?.feather??0;};
})(globalThis);
