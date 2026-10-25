/* Offline person cutouts, powered by the bundled Apache-2.0 MediaPipe Selfie Segmenter. */
(function(root){
'use strict';
const base = typeof document !== 'undefined' && document.currentScript ? new URL('assets/vision/', document.currentScript.src).href : '';
let segmenter, pending, scratch, alphaCanvas, foregroundIndex = 0;
const canvas = () => document.createElement('canvas');
async function initialize(options={}) {
  if(segmenter) return true;
  if(pending) return pending;
  pending=(async()=>{
    const assetBase=options.assetBase || base;
    const {FilesetResolver, ImageSegmenter}=await import(new URL('vision_bundle.mjs',assetBase).href);
    const files=await FilesetResolver.forVisionTasks(new URL('wasm/',assetBase).href);
    segmenter=await ImageSegmenter.createFromOptions(files,{
      baseOptions:{modelAssetPath:new URL('selfie_segmenter.tflite',assetBase).href,delegate:'CPU'},
      runningMode:'IMAGE',outputConfidenceMasks:true,outputCategoryMask:false
    });
    const labels=segmenter.getLabels();
    const person=labels.findIndex(label=>/person|human|selfie|foreground/i.test(label));
    // The official binary selfie model emits one confidence plane: foreground probability.
    foregroundIndex=person>=0?person:0;
    scratch=canvas();alphaCanvas=canvas();return true;
  })();
  try{return await pending;}catch(error){pending=null;throw new Error('Offline person segmentation could not start: '+error.message);}
}
async function mask(source,width,height,options={}) {
  await initialize(options);
  const w=Math.max(1,Math.round(width||source.videoWidth||source.naturalWidth||source.width));
  const h=Math.max(1,Math.round(height||source.videoHeight||source.naturalHeight||source.height));
  // Inference remains bounded for 4K output; the confidence map scales smoothly to output size.
  const scale=Math.min(1,512/Math.max(w,h));scratch.width=Math.max(1,Math.round(w*scale));scratch.height=Math.max(1,Math.round(h*scale));
  scratch.getContext('2d').drawImage(source,0,0,scratch.width,scratch.height);
  let result;
  try {
    result=segmenter.segment(scratch);
    const confidence=result.confidenceMasks[foregroundIndex]||result.confidenceMasks[0];
    const values=confidence.getAsFloat32Array();
    const small=canvas();small.width=confidence.width;small.height=confidence.height;
    const context=small.getContext('2d');const pixels=context.createImageData(small.width,small.height);
    const low=options.low ?? .25, high=options.high ?? .75;
    for(let i=0;i<values.length;i++){
      const t=Math.min(1,Math.max(0,(values[i]-low)/(high-low)));
      const offset=i*4;pixels.data[offset]=pixels.data[offset+1]=pixels.data[offset+2]=255;
      pixels.data[offset+3]=Math.round(255*t*t*(3-2*t));
    }
    context.putImageData(pixels,0,0);alphaCanvas.width=w;alphaCanvas.height=h;
    const out=alphaCanvas.getContext('2d');out.imageSmoothingEnabled=true;out.imageSmoothingQuality='high';out.drawImage(small,0,0,w,h);
    return alphaCanvas;
  } finally {result?.close();}
}
async function render(source,target,options={}) {
  if(!target){target=canvas();target.width=source.videoWidth||source.naturalWidth||source.width;target.height=source.videoHeight||source.naturalHeight||source.height;}const width=target.width;const height=target.height;
  const alpha=await mask(source,width,height,options);const context=target.getContext('2d');
  context.clearRect(0,0,width,height);context.globalCompositeOperation='source-over';context.drawImage(source,0,0,width,height);
  context.globalCompositeOperation='destination-in';context.drawImage(alpha,0,0,width,height);context.globalCompositeOperation='source-over';return target;
}
function release(){segmenter?.close();segmenter=null;pending=null;scratch=null;alphaCanvas=null;}
root.CliporaDepth={initialize,mask,render,release,get ready(){return !!segmenter;}};
})(typeof window!=='undefined'?window:globalThis);

