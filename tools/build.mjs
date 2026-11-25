import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
const asset=await readFile('assets/Shardling-Body.glb');
const bundle=await build({entryPoints:['src/main.mjs'],bundle:true,format:'esm',target:'es2022',minify:true,write:false,legalComments:'inline',
plugins:[{name:'embed-local-model',setup(b){b.onResolve({filter:/model\.b64\.js$/},()=>({path:'model',namespace:'model'}));b.onLoad({filter:/.*/,namespace:'model'},()=>({contents:'export default '+JSON.stringify(asset.toString('base64'))+';',loader:'js'}));}}]});
const html=await readFile('src/index.template.html','utf8'), css=await readFile('src/gallery.css','utf8');
const script=bundle.outputFiles[0].text.replaceAll(/<\/script/gi,'<\\/script');
const license=await readFile('node_modules/three/LICENSE','utf8').catch(()=> '');
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html.replace('/*__STYLE__*/',()=>css).replace('/*__SCRIPT__*/',()=>script)+'\n<!-- Third-party notice\n'+license+'\n-->\n');
await writeFile('dist/.nojekyll','');
