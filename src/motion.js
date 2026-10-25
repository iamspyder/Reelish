(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CliporaMotion=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // All keyframe times are seconds from the beginning of the trimmed clip.
  // x/y are fractions of the output width/height; rotation is degrees.
  const defaults={zoom:1,x:0,y:0,rotation:0,opacity:1};
  const limits={zoom:[.1,10],x:[-2,2],y:[-2,2],rotation:[-3600,3600],opacity:[0,1]};
  function value(v,key,fallback){return Number.isFinite(v)?Math.max(limits[key][0],Math.min(limits[key][1],v)):fallback;}
  function sample(clip={},localTime=0){
    const base=Object.fromEntries(Object.keys(defaults).map(k=>[k,value(clip[k],k,defaults[k])]));
    const frames=Array.isArray(clip.keyframes)?clip.keyframes.filter(f=>f&&Number.isFinite(f.time)&&f.time>=0).slice(0,10000).map((f,i)=>({...f,_i:i})).sort((a,b)=>a.time-b.time||a._i-b._i):[];
    const t=Number.isFinite(localTime)?Math.max(0,localTime):0;
    for(const key of Object.keys(defaults)){
      const points=[{time:0,[key]:base[key],easing:'linear'},...frames.filter(f=>Number.isFinite(f[key]))];
      let left=points[0],right=null;
      for(const point of points){if(point.time<=t)left=point;else{right=point;break;}}
      if(!right){base[key]=value(left[key],key,base[key]);continue;}
      let u=Math.max(0,Math.min(1,(t-left.time)/(right.time-left.time)));
      const easing=left.easing||'linear';
      if(easing==='hold')u=0;
      else if(easing==='ease-in-out'||easing==='cubic')u=u*u*(3-2*u);
      else if(easing==='ease-in')u=u*u*u;
      else if(easing==='ease-out')u=1-Math.pow(1-u,3);
      base[key]=value(left[key],key,base[key])+(value(right[key],key,base[key])-value(left[key],key,base[key]))*u;
    }
    return base;
  }
  return {sample,defaults,timeBasis:'trimmed-clip-seconds'};
});
