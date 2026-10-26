(()=>{
 const ui=document.createElement('div');ui.innerHTML='<h3>Voiceover</h3><p class="muted">Record from your microphone and place the audio at the playhead.</p><div class="feature-actions"><button id="voiceRecord">● Record voiceover</button><button id="voiceStop" disabled>Stop recording</button></div><p id="voiceStatus" class="muted" role="status"></p>';$('panel-audio').prepend(ui);
 let recorder=null,stream=null,timer=null,chunks=[],size=0,start=0,started=0,project=null;
 const cleanup=()=>{clearInterval(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null;$('voiceRecord').disabled=false;$('voiceStop').disabled=true;};
 $('voiceRecord').onclick=()=>safe(async()=>{
  if(!p.clips.length)return toast('Import a video first');
  stream=await navigator.mediaDevices.getUserMedia({audio:true});project=p;start=playTime;started=Date.now();chunks=[];size=0;
  try{recorder=new MediaRecorder(stream,{mimeType:'audio/webm;codecs=opus'});}catch(error){cleanup();throw error;}
  recorder.ondataavailable=e=>{if(e.data.size){chunks.push(e.data);size+=e.data.size;}if(size>20*1024*1024&&recorder?.state==='recording')recorder.stop();};
  recorder.onstop=()=>safe(async()=>{
   const blob=new Blob(chunks,{type:'audio/webm'});cleanup();if(!blob.size)return toast('No microphone audio recorded');
   const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=()=>reject(Error('Cannot read microphone recording'));r.readAsDataURL(blob);});
   const audio=await api.call('voiceover-save',data);if(p!==project)return toast('Voiceover saved; reopen the previous project to add it.');
   update(()=>{p.sounds||=[];p.sounds.push({...audio,id:crypto.randomUUID(),start:Math.min(start,length()),in:0,volume:1});});$('voiceStatus').textContent='Voiceover added to the audio track.';
  });
  recorder.onerror=()=>{cleanup();toast('Microphone recording failed');};recorder.start(500);$('voiceRecord').disabled=true;$('voiceStop').disabled=false;
  timer=setInterval(()=>{const seconds=Math.floor((Date.now()-started)/1000);$('voiceStatus').textContent='Recording · '+seconds+'s';if(seconds>=600&&recorder?.state==='recording')recorder.stop();},500);
 });
 $('voiceStop').onclick=()=>{if(recorder?.state==='recording')recorder.stop();};
 window.addEventListener('beforeunload',()=>{if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(t=>t.stop());});
})();
