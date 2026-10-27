(()=>{
 const button=document.createElement('button');button.id='aiConnection';button.textContent='AI connection & key';$('panel-ai').querySelector('.panelheading').after(button);
 async function showAiConnection(){
  const s=await api.call('ai-settings-get');
  modal(`<h2>AI connection</h2><p class="muted">Use your own OpenRouter key for Hinglish, translations, hooks and edit plans. Only caption text and timing are sent to OpenRouter when you run a tool. Your key stays on this computer, encrypted by the system.</p><label>Connection<select id="aiMode"><option value="personal">My OpenRouter key</option><option value="hosted">Publisher service</option></select></label><p id="aiHostedNote" class="statusnote">${s.hostedConfigured?'Publisher endpoint is configured. Access depends on its sharing settings.':'The publisher service is private and is not connected to this installation.'}</p><label>OpenRouter API key ${s.hasKey?'· saved securely':''}<input id="openrouterKey" type="password" autocomplete="off" spellcheck="false" placeholder="${s.hasKey?'Leave blank to keep the saved key':'sk-or-v1-…'}"></label><label class="check"><input type="checkbox" id="removeOpenrouterKey">Remove saved OpenRouter key</label><p class="statusnote">Free models only, with zero-price limits and no paid fallback. Provider quotas apply. Adding a key does not enable audio transcription.</p><div class="actions"><button id="aiConnectionCancel">Cancel</button><button id="aiConnectionSave" class="primary">Save connection</button></div>`);
  $('aiMode').value=s.mode;
  const toggle=()=>{const personal=$('aiMode').value==='personal';$('openrouterKey').closest('label').style.display=personal?'':'none';$('removeOpenrouterKey').closest('label').style.display=personal?'':'none';$('aiHostedNote').style.display=personal?'none':'';};$('aiMode').onchange=toggle;toggle();
  const clearField=()=>{$('openrouterKey').value='';};$('aiConnectionCancel').onclick=()=>{clearField();closeModal();};
  $('aiConnectionSave').onclick=()=>safe(async()=>{await api.call('ai-settings-save',{mode:$('aiMode').value,key:$('openrouterKey').value.trim(),clearKey:$('removeOpenrouterKey').checked});clearField();closeModal();toast('AI connection saved');});
 }
 button.onclick=()=>safe(showAiConnection);
 $('modal').addEventListener('close',()=>{const field=$('openrouterKey');if(field)field.value='';});
})();
