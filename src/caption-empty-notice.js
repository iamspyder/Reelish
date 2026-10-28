(()=>{
 const notice=document.createElement('p');notice.id='captionEmptyNotice';notice.className='statusnote';notice.setAttribute('role','status');notice.textContent='No caption text yet. Templates do not transcribe audio. Generate captions, import SRT/VTT or type text before a style can appear on the video.';
 $('panel-captions').querySelector('.panelheading').after(notice);
 const prior=renderCaptions;renderCaptions=function(){prior();notice.classList.toggle('hidden',!p.clips.length||p.cues.length>0);};renderCaptions();
})();
