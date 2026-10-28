(()=>{
 const generate=$('transcribe').onclick;
 $('transcribe').onclick=()=>safe(async()=>{
  if(!p.clips.length)return toast('Import a video first');
  const saved=await api.call('settings-get'),choice=CaptionLanguages.normalize(saved),ai=await api.call('ai-settings-get');
  modal(`<h2>Add or generate captions</h2><p class="statusnote">Free OpenRouter audio sends your clip's audio to OpenRouter and its model provider. It returns transcript text with <strong>AI-estimated timing</strong>; review timing before export. Free model quotas apply. Paid fallback stays blocked.</p><button id="captionImportSubtitles">Import SRT / VTT</button><label>Spoken language<select id="captionLanguage">${CaptionLanguages.languages.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Caption writing<select id="captionWriting"><option value="native">Original language / native script</option><option value="hinglish">Hinglish / Roman Hindi</option><option value="english">English</option></select></label><p id="captionExample" class="statusnote"></p><label>Speech source<select id="captionEngine"><option value="openrouter">OpenRouter free audio · estimated timing</option><option value="online" disabled>Publisher speech · unavailable</option><option value="bundled">Included offline AI · only when selected</option><option value="cloud" disabled>Paid speech · disabled</option><option value="local">Custom local engine · requires setup</option></select></label><button id="captionConnectAi">AI connection &amp; key</button><p id="captionAvailability" class="muted" role="status"></p><div class="actions"><button id="captionCancel">Cancel</button><button class="primary" id="captionGenerate">Generate captions</button></div>`);
  $('captionLanguage').value=choice.language;$('captionWriting').value=choice.outputScript||'native';$('captionEngine').value=ai.hasKey?'openrouter':saved.engine==='local'?'local':'openrouter';
  function sync(){
   const engine=$('captionEngine').value,online=engine==='openrouter',writing=$('captionWriting').value;
   if(!online&&writing!=='native')$('captionWriting').value='native';
   $('captionWriting').querySelectorAll('option:not([value="native"])').forEach(option=>option.disabled=!online);
   $('captionExample').textContent=$('captionWriting').value==='hinglish'?'Hindi speech in Roman letters, keeping English words. Example: Aaj hum video banayenge.':$('captionWriting').value==='english'?'Request English caption text. Translation and timing need review.':'Keep the spoken language and its native script. Review names and unusual words.';
   const blocked=['online','cloud'].includes(engine),missing=engine==='local'&&(!saved.whisperExe||!saved.whisperModel),keyMissing=online&&(!ai.hasKey||ai.mode!=='personal');
   $('captionAvailability').textContent=keyMissing?'Save your OpenRouter key with AI connection & key first. No audio has been uploaded.':online?'Audio will be sent to a currently zero-price audio model. Timings are estimated, not measured word recognition.':blocked?'No speech request will run in this mode.':missing?'The custom engine is not configured.':'This explicitly selected engine processes audio on this computer.';
   $('captionGenerate').disabled=blocked||missing||keyMissing;
  }
  $('captionWriting').onchange=sync;$('captionEngine').onchange=sync;sync();
  $('captionCancel').onclick=closeModal;$('captionConnectAi').onclick=()=>{closeModal();$('aiConnection').click();};
  $('captionImportSubtitles').onclick=()=>safe(async()=>{closeModal();await $('importSrt').onclick();if(p.cues.length){if(!playing)seek(ReelishCaptionWorkflow.previewTime(p.cues,playTime,CliporaCaptions.timedWords));toast(p.cues.length+' timed caption lines imported');}});
  $('captionGenerate').onclick=()=>safe(async()=>{
   const selection=CaptionLanguages.normalize({language:$('captionLanguage').value,outputScript:$('captionWriting').value}),engine=$('captionEngine').value;
   if(['online','cloud'].includes(engine))return toast('Choose an available caption source.');
   await api.call('settings-save',{...saved,...selection,engine,hinglish:false});closeModal();const previousCues=p.cues;await generate();
   if(p.cues!==previousCues&&p.cues.some(c=>c.timingSource==='ai-estimated'))toast('Free online captions added · AI-estimated timing. Review and edit before export.');
  });
 });
})();
