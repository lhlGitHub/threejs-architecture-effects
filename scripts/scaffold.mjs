#!/usr/bin/env node
import { cp, lstat, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args=process.argv.slice(2);
if(args.length!==1 || args[0].startsWith('-')){
  console.error('Usage: node scaffold.mjs <new-project-directory>');
  process.exit(1);
}
const destination=resolve(args[0]);
try { await lstat(destination); console.error('Refusing to overwrite an existing destination: '+destination); process.exit(1); }
catch(error){ if(error.code!=='ENOENT')throw error; }
const source=resolve(dirname(fileURLToPath(import.meta.url)),'../assets/starter');
await mkdir(dirname(destination),{recursive:true});
await cp(source,destination,{recursive:true,errorOnExist:true,force:false});
console.log('Created: '+destination);
console.log('Next: open that directory, run npm ci, then npm run dev.');
