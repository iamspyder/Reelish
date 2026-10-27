const fs=require('node:fs/promises');
async function read(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return {};throw Error('Cannot read AI settings.');}}
async function load(file,storage){const s=await read(file);let key='';if(s.aiKeyEncrypted){try{key=storage.decryptString(Buffer.from(s.aiKeyEncrypted,'base64'));}catch{throw Error('Cannot unlock the saved OpenRouter key on this system. Remove it and save a new key.');}}return {mode:s.aiMode||'personal',key};}
async function save(file,storage,value){
 if(!['personal','hosted'].includes(value?.mode))throw Error('Choose an AI connection.');
 const key=String(value.key||'').trim();if(key&&!/^sk-or-v1-[a-zA-Z0-9_-]{16,200}$/.test(key))throw Error('Enter a valid OpenRouter API key.');
 const s=await read(file);s.aiMode=value.mode;
 if(value.clearKey)delete s.aiKeyEncrypted;
 else if(key){if(!storage.isEncryptionAvailable()||storage.getSelectedStorageBackend?.()==='basic_text')throw Error('System credential encryption is unavailable. The key was not saved.');s.aiKeyEncrypted=storage.encryptString(key).toString('base64');}
 await fs.writeFile(file,JSON.stringify(s));return {mode:s.aiMode,hasKey:!!s.aiKeyEncrypted};
}
async function status(file){const s=await read(file);return {mode:s.aiMode||'personal',hasKey:!!s.aiKeyEncrypted};}
module.exports={load,save,status};
