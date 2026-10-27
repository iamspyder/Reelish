(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ReelishColor=api;})(globalThis,function(){
 const clamp=(n,a,b,f)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):f;
 const identity=[0,.25,.5,.75,1];
 function cropRect(crop={},width,height){const x=clamp(crop.x,0,.95,0),y=clamp(crop.y,0,.95,0),w=clamp(crop.width,.05,1-x,1-x),h=clamp(crop.height,.05,1-y,1-y);return {x:x*width,y:y*height,width:w*width,height:h*height};}
 function values(v){return identity.map((n,i)=>clamp(v?.[i],0,1,n));}
 function points(v){return values(v).map((n,i)=>[i/4,n]);}
 function interpolate(v,x){const n=Math.max(0,Math.min(1,x))*4,i=Math.min(3,Math.floor(n));return v[i]+(v[i+1]-v[i])*(n-i);}
 function table(master,channel){const m=values(master),c=values(channel);return Uint8ClampedArray.from({length:256},(_,i)=>Math.round(interpolate(c,interpolate(m,i/255))*255));}
 function normalized(grade={}){return {curves:Object.fromEntries(['rgb','red','green','blue'].map(k=>[k,values(grade.curves?.[k])])),vignette:clamp(grade.vignette,0,1,0)};}
 function changed(g){return g.vignette>0||Object.values(g.curves).some(c=>c.some((v,i)=>Math.abs(v-identity[i])>.00001));}
 function pixels(data,width,height,grade){const g=normalized(grade),r=table(g.curves.rgb,g.curves.red),green=table(g.curves.rgb,g.curves.green),b=table(g.curves.rgb,g.curves.blue);for(let i=0;i<data.length;i+=4){let gain=1;if(g.vignette){const x=(i/4%width)/width-.5,y=Math.floor(i/4/width)/height-.5;gain=1-g.vignette*Math.min(1,Math.max(0,(Math.hypot(x,y)-.15)/.55));}data[i]=r[data[i]]*gain;data[i+1]=green[data[i+1]]*gain;data[i+2]=b[data[i+2]]*gain;}return data;}
 const states=new WeakMap();
 function render(source,grade={}){
  const g=normalized(grade);if(!changed(g))return source;
  let s=states.get(source);if(!s){s={};states.set(source,s);try{if(typeof fx!=='undefined'){s.gpu=fx.canvas();s.texture=s.gpu.texture(source);}}catch{s.gpu=null;}s.cpu=document.createElement('canvas');}
  if(s.gpu)try{s.texture.loadContentsOf(source);s.gpu.draw(s.texture).curves(points(g.curves.rgb)).curves(points(g.curves.red),points(g.curves.green),points(g.curves.blue));if(g.vignette)s.gpu.vignette(.45,g.vignette);s.gpu.update();return s.gpu;}catch{s.gpu=null;}
  const w=source.videoWidth||source.naturalWidth||source.width,h=source.videoHeight||source.naturalHeight||source.height;s.cpu.width=w;s.cpu.height=h;const ctx=s.cpu.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0,w,h);const image=ctx.getImageData(0,0,w,h);pixels(image.data,w,h,g);ctx.putImageData(image,0,0);return s.cpu;
 }
 return {identity,cropRect,values,points,table,normalized,changed,pixels,render};
});
