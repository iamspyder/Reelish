(()=>{
 const generate=$('transcribe').onclick;
 $('transcribe').onclick=()=>safe(async()=>{
  if(!p.clips.length)return toast('Import a video first');
  const saved=await api.call('settings-get'),choice=CaptionLanguages.normalize(saved);
  modal(`<h2>Generate captions</h2><label>Spoken language<select id="captionLanguage">${CaptionLanguages.languages.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Caption writing<select id="captionWriting"><option value="native">Original language / native script</option><option value="hinglish">Hinglish — Hindi + English in Roman letters</option></select></label><p id="captionExample" class="statusnote"></p><label>Speech engine<select id="captionEngine"><option value="online">Online captions</option><option value="bundled">Included offline AI</option><option value="cloud">Your OpenAI API key</option><option value="local">Custom local engine</option></select></label><p id="captionAvailability" class="muted"></p><div class="actions"><button id="captionCancel">Cancel</button><button class="primary" id="captionGenerate">Generate captions</button></div>`);
  $('captionLanguage').value=choice.language;$('captionWriting').value=choice.outputScript;$('captionEngine').value=saved.engine;
  function sync(){
   const roman=$('captionWriting').value==='hinglish';
   if(roman){$('captionLanguage').value='hi';$('captionEngine').value='online';}
   $('captionLanguage').disabled=roman;$('captionEngine').disabled=roman;
   $('captionExample').textContent=roman?'Example: “Aaj hum video banayenge.” Hindi words use Roman letters; English stays English. Word timing is preserved.':'Keep the spoken language and its script. Mixed-language recognition depends on the recording; review names and unusual words.';
   const online=$('captionEngine').value==='online',ready=saved.online?.configured;
   $('captionAvailability').textContent=online?(ready?'Audio will be uploaded to the caption service. Provider quotas apply.':'Online captions are awaiting service activation. You can save these language choices now.'):'Captions use the selected speech engine. Hinglish requires the online service.';
   $('captionGenerate').textContent=online&&!ready?'Save choices':'Generate captions';
  }
  $('captionWriting').onchange=sync;$('captionEngine').onchange=sync;sync();
  $('captionCancel').onclick=closeModal;
  $('captionGenerate').onclick=()=>safe(async()=>{
   const selection=CaptionLanguages.normalize({language:$('captionLanguage').value,outputScript:$('captionWriting').value}),engine=$('captionEngine').value;
   await api.call('settings-save',{...saved,...selection,engine,hinglish:false});closeModal();
   if(engine==='online'&&!saved.online?.configured)return toast('Caption choices saved. Online service activation is still required.');
   await generate();
  });
 });
})();
