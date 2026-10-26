const fs=require('node:fs/promises'),path=require('node:path');
const {serviceUrl}=require('../src/online-speech.cjs');
(async()=>{
 const url=serviceUrl(process.argv[2]);if(!url)throw Error('Pass the deployed HTTPS service origin');
 const response=await fetch(url+'/health',{redirect:'error',signal:AbortSignal.timeout(15000)});
 const status=await response.json();if(!response.ok||status.service!=='Reelish captions'||status.ready!==true)throw Error('The caption service is not activated. Deploy it and store its provider secret first.');
 await fs.writeFile(path.resolve(__dirname,'../src/caption-service.json'),JSON.stringify({url},null,2)+'\n');
 console.log('Configured verified public caption service:',url);
})().catch(error=>{console.error(error.message);process.exitCode=1;});
