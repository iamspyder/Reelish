const {execFileSync}=require('node:child_process');
for(const file of ['ai-connection','caption-parity','clip-tools','media-layers','audio-tools','color-tools','final-controls']){console.log('Checking',file);execFileSync(process.execPath,[`tests/${file}-desktop.cjs`],{stdio:'inherit',windowsHide:true,env:process.env});}
