(()=>{
 const generate=$('transcribe').onclick;
 $('transcribe').onclick=()=>safe(async()=>{
  if(!p.clips.length)return toast('Import a video first');
  const saved=await api.call('settings-get'),choice=CaptionLanguages.normalize(saved);
  modal(`<h2>Add or generate captions</h2><p class="statusnote">Online speech is disabled in this free-only build. An OpenRouter text key does not enable audio transcription. Import subtitles or type captions. The included offline engine runs only if you explicitly choose it.</p><button id="captionImportSubtitles">Import SRT / VTT</button><label>Spoken language<select id="captionLanguage">${CaptionLanguages.languages.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Caption writing<select id="captionWriting"><option value="native">Original language / native script</option><option value="hinglish" disabled>Hinglish — convert existing captions in AI tools</option></select></label><p id="captionExample" class="statusnote"></p><label>Speech engine<select id="captionEngine"><option value="online" disabled>Online speech — unavailable</option><option value="bundled">Included offline AI — no separate setup</option><option value="cloud" disabled>Paid speech — disabled</option><option value="local">Custom local engine — requires setup</option></select></label><p id="captionAvailability" class="muted" role="status"></p><div class="actions"><button id="captionCancel">Cancel</button><button class="primary" id="captionGenerate">Generate captions</button></div>`);
  $('captionLanguage').value=choice.language;$('captionWriting').value='native';$('captionEngine').value=saved.engine;
  function sync(){
   const roman=$('captionWriting').value==='hinglish';
   if(roman){$('captionLanguage').value='hi';$('captionEngine').value='online';}
   $('captionLanguage').disabled=roman;$('captionEngine').disabled=roman;
   $('captionExample').textContent=roman?'Example: “Aaj hum video banayenge.” Hindi words use Roman letters; English stays English. Word timing is preserved.':'Keep the spoken language and its script. Mixed-language recognition depends on the recording; review names and unusual words.';
   const engine=$('captionEngine').value,blocked=['online','cloud'].includes(engine),missing=engine==='local'&&(!saved.whisperExe||!saved.whisperModel);
   $('captionAvailability').textContent=blocked?'No speech request will run in this mode. Import timed subtitles or type captions. Choose another engine only if you want to use it.':missing?'The custom engine is not configured. Configure it in Settings or import subtitles.':engine==='bundled'?'This explicitly selected engine processes audio on this computer using the included model. Review the transcription before exporting.':'This uses your configured local speech engine.';
   $('captionGenerate').disabled=blocked||missing||roman;
  }
  $('captionWriting').onchange=sync;$('captionEngine').onchange=sync;sync();
  $('captionCancel').onclick=closeModal;
  $('captionImportSubtitles').onclick=()=>safe(async()=>{closeModal();await $('importSrt').onclick();if(p.cues.length){if(!playing)seek(ReelishCaptionWorkflow.previewTime(p.cues,playTime,CliporaCaptions.timedWords));toast(p.cues.length+' timed caption lines imported');}});
  $('captionGenerate').onclick=()=>safe(async()=>{
   const selection=CaptionLanguages.normalize({language:$('captionLanguage').value,outputScript:$('captionWriting').value}),engine=$('captionEngine').value;
   if(['online','cloud'].includes(engine))return toast('Online speech is disabled. Import subtitles or choose another source.');
   await api.call('settings-save',{...saved,...selection,engine,hinglish:false});closeModal();
   await generate();
  });
 });
})();
