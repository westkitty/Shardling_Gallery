import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {drawMask,EXPRESSION_IDS} from './masks.mjs';
import {createMotionClips} from './motions.mjs';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {loadShardling,createShardling,PRESETS,GROWTHS,EXPRESSIONS,MOTIONS,EXPRESSION_COLLECTIONS,MOTION_COLLECTIONS} from './shardling.mjs';
import model64 from '../assets/model.b64.js';
const $=id=>document.getElementById(id);
const lights={
 blue:{name:'Azure studio',bg:'#121c2b',key:'#d2eaff',rim:'#52a9ff',fill:2.15,power:4,az:36},
 white:{name:'Neutral inspection',bg:'#242833',key:'#ffffff',rim:'#a9b9e7',fill:3.2,power:4.8,az:28},
 amber:{name:'Amber eclipse',bg:'#231b26',key:'#ffd1a4',rim:'#63a8ff',fill:1.35,power:4.7,az:-45},
 red:{name:'Red corridor',bg:'#27161d',key:'#ffadc1',rim:'#f2596c',fill:1.85,power:3.3,az:64},
 silhouette:{name:'Cold backlight',bg:'#1a2638',key:'#9ebcef',rim:'#55c0ff',fill:1.04,power:1.4,az:-72},
};
let light={...lights.blue}, presetLight='blue', selected=0, playing=!matchMedia('(prefers-reduced-motion: reduce)').matches, pair=true;
const view=$('viewport'), renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));view.append(renderer.domElement); renderer.domElement.setAttribute('aria-label','Interactive Three.js Shardling stage');
const scene=new T.Scene(), camera=new T.PerspectiveCamera(38,1,.05,40);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2.15;controls.maxDistance=10;controls.maxPolarAngle=Math.PI/2+.19;
const sky=new T.HemisphereLight('#c0dbff','#3e4154'),key=new T.DirectionalLight(),rim=new T.DirectionalLight(),bounce=new T.DirectionalLight('#8daaca',.72);
scene.add(sky,key,rim,bounce);rim.position.set(-3,3,-4);bounce.position.set(-2,1,3);
const floor=new T.Mesh(new T.CircleGeometry(8,80),new T.MeshStandardMaterial({color:0x1e2a3a,roughness:.84}));floor.rotation.x=-Math.PI/2;floor.position.y=-.047;scene.add(floor);
const discmat=new T.MeshBasicMaterial({color:0x0d1727,transparent:true,opacity:.65,depthWrite:false});
for(const x of [-.82,.82]){
 const deck=new T.Mesh(new T.CircleGeometry(.59,64),discmat);deck.rotation.x=-Math.PI/2;deck.position.set(x,-.039,0);scene.add(deck);
 const curve=new T.EllipseCurve(x,0,.59,.59).getPoints(100);
 const ring=new T.LineLoop(new T.BufferGeometry().setFromPoints(curve.map(p=>new T.Vector3(p.x,-.037,p.y))),new T.LineBasicMaterial({color:0x475d7c,transparent:true,opacity:.72}));scene.add(ring);
}
function updateLight(){
 scene.background=new T.Color(light.bg);sky.intensity=+light.fill;
 key.color.set(light.key);key.intensity=+light.power;
 key.position.set(5*Math.sin(light.az*Math.PI/180),4,5*Math.cos(light.az*Math.PI/180));rim.color.set(light.rim);rim.intensity=3.2;floor.material.color.set(light.bg).multiplyScalar(1.16);
}
function viewAt(k){
 const pts={front:[0,1.54,4.94],angle:[1.86,1.62,4.69],profile:[4.94,1.55,0],back:[0,1.60,-4.94],detail:[.62,2.14,2.2]};
 if(!pts[k])return; camera.position.set(...pts[k]);controls.target.set(0,k==='detail'?1.89:1.19,0);controls.update();
}
updateLight();viewAt('front');
const binary=atob(model64), bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
const gltf=tfguard(await loadShardling(bytes));
function tfguard(v){if(!v.scene.getObjectByName('LED_Surface'))throw Error('Incomplete model');return v;}
const actors=[createShardling(gltf,{seed:1}),createShardling(gltf,{seed:8})];
actors[0].object.position.x=-.82;actors[1].object.position.x=.82;scene.add(...actors.map(a=>a.object));
actors[0].apply(PRESETS[0],{fresh:true});actors[1].apply(PRESETS[1],{fresh:true,offset:.63});
const size=new ResizeObserver(()=>{let r=view.getBoundingClientRect();if(!r.width||!r.height)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false)});size.observe(view);
const face=$('emotion'),pose=$('motion'),growth=$('growth');
function option(el,value,label){let o=new Option(label,value);el.add(o);return o;}
function groups(el,dict,meta){for(const [name,ids] of Object.entries(dict)){const g=document.createElement('optgroup');g.label=name[0].toUpperCase()+name.slice(1);for(const id of ids)g.append(new Option(meta[id].label,id));el.append(g);}}
option(face,'blank','Blank / LEDs off');groups(face,EXPRESSION_COLLECTIONS,EXPRESSIONS);groups(pose,MOTION_COLLECTIONS,MOTIONS);
for(const g of GROWTHS)option(growth,g,g);
for(const [id,v] of Object.entries(lights))option($('light-look'),id,v.name);
const active=()=>actors[selected];
function sync(){
 const s=active().snapshot();face.value=s.emotion;pose.value=s.motion;growth.value=s.growth;
 $('wisps').checked=s.wisps;$('animate-mask').checked=s.animateMask;$('repeat').checked=s.repeat;
 $('mask-rate').value=s.maskSpeed;$('motion-rate').value=s.motionSpeed;
 $('pose-desc').textContent=MOTIONS[s.motion].description;
 for(let i=0;i<2;i++){$('actor-'+i).setAttribute('aria-pressed',String(selected===i)); const a=actors[i].snapshot();$('stage-tag-'+i).textContent=EXPRESSIONS[a.emotion].label+' / '+a.growth;}
 $('play').textContent=playing?'Pause stage':'Play stage';
}
function patch(p){active().apply(p);sync();}
face.onchange=()=>patch({emotion:face.value});pose.onchange=()=>patch({motion:pose.value});growth.onchange=()=>patch({growth:growth.value});
for(const [a,b] of [['wisps','wisps'],['animate-mask','animateMask'],['repeat','repeat']])$(a).onchange=()=>patch({[b]:$(a).checked});
for(const [a,b] of [['mask-rate','maskSpeed'],['motion-rate','motionSpeed']])$(a).oninput=()=>patch({[b]:+$(a).value});
$('actor-0').onclick=()=>{selected=0;sync();};$('actor-1').onclick=()=>{selected=1;sync();};
$('scrub').oninput=e=>{const a=active();playing=false;a.seek(+e.target.value*a.inspect().duration);sync();};
$('replay').onclick=()=>{active().replay();if(!playing)playing=true;sync();};
$('play').onclick=()=>{playing=!playing;sync()};
function setPair(on){
 pair=on;$('pair').checked=on;actors[1].object.visible=on;actors[0].object.position.x=on?-.82:0;
 $('actor-1').disabled=!on;$('stage-labels').classList.toggle('solo',!on);if(!on)selected=0;sync();
}
$('pair').onchange=e=>setPair(e.target.checked);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>viewAt(b.dataset.view));
function syncLight(){
 for(const k of ['key','rim','fill','power','az','bg'])$('light-'+k).value=light[k];
 $('light-look').value=presetLight;updateLight();
}
$('light-look').onchange=(e)=>{if(e.target.value){presetLight=e.target.value;light={...lights[presetLight]};syncLight();}};
for(const k of ['key','rim','fill','power','az','bg'])$('light-'+k).oninput=e=>{light[k]=e.target.value;presetLight='';syncLight();};
function payload(){return {schema:'shardling-gallery/v1',actors:actors.map(a=>({...a.snapshot(),seed:a.seed})),lighting:{...light,look:presetLight},compare:pair,ledAtlas:{tile:256,columns:6,rows:EXPRESSION_IDS.map(id=>({id,frameDurationsMs:EXPRESSIONS[id].frameDurationsMs}))},view:{camera:camera.position.toArray(),target:controls.target.toArray()}};}
function download(name,obj,type){
 const url=URL.createObjectURL(new Blob([obj],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
}
function restore(d){
 if(d?.schema!=='shardling-gallery/v1'||!Array.isArray(d.actors)||d.actors.length!==2||d.actors.some(x=>!x||typeof x!=='object'))throw Error('Not a Shardling Gallery preset');
 d.actors.forEach((s,i)=>actors[i].apply(s,{fresh:true,offset:i*.31}));
 const l=d.lighting??{}; presetLight=Object.hasOwn(lights,l.look)?l.look:'';
 light={...lights[presetLight||'blue']};
 for(const k of ['key','rim','bg'])if(/^#[\da-f]{6}$/i.test(l[k]))light[k]=l[k];
 for(const [k,min,max] of [['az',-180,180],['power',0,8],['fill',0,6]])if(Number.isFinite(+l[k]))light[k]=Math.min(max,Math.max(min,+l[k]));
 if([d.view?.camera,d.view?.target].every(v=>Array.isArray(v)&&v.length===3&&v.every(x=>Number.isFinite(x)&&Math.abs(x)<40))){
  camera.position.fromArray(d.view.camera);controls.target.fromArray(d.view.target);controls.update();
 }
 setPair(d.compare!==false);syncLight();sync();
}
$('export').onclick=()=>download('shardling-gallery-preset.json',JSON.stringify(payload(),null,2),'application/json');
$('export-glb').onclick=async()=>{
 const button=$('export-glb');button.disabled=true;
 try{
  const growth=active().snapshot().growth, source=clone(gltf.scene);
  const unused=[];source.traverse(o=>{if(GROWTHS.some(g=>g!==growth&&o.name.startsWith(g+'_')))unused.push(o);});unused.forEach(o=>o.removeFromParent());
  const clips=createMotionClips(T,source);
  const out=await new GLTFExporter().parseAsync(source,{binary:true,animations:clips,onlyVisible:false});
  download('Shardling-'+growth+'-Rig.glb',out,'model/gltf-binary');$('status').textContent='Exported '+growth+' with '+clips.length+' skeletal clips. LED art remains a separate layer.';
 }catch(e){$('status').textContent='GLB export failed: '+e.message;}finally{button.disabled=false;}
};
$('import').onchange=async e=>{try{const file=e.target.files[0];if(file){if(file.size>100000)throw Error('This preset file is too large');restore(JSON.parse(await file.text()));$('status').textContent='Preset loaded locally.';}}catch(err){$('status').textContent=err.message;}finally{e.target.value='';}};
$('export-atlas').onclick=()=>{
 const atlas=document.createElement('canvas'), tile=document.createElement('canvas');tile.width=tile.height=256;
 atlas.width=1536;atlas.height=3072;const c=atlas.getContext('2d');
 EXPRESSION_IDS.forEach((id,row)=>{for(let f=0;f<6;f++){drawMask(tile,id,f);c.drawImage(tile,f*256,row*256);}});
 atlas.toBlob(b=>download('Shardling-LED-Atlas.png',b,'image/png'),'image/png');
};
$('export-png').onclick=()=>{renderer.render(scene,camera);const a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='shardling-stage.png';a.click();};
const cards=PRESETS.map((p,i)=>{
 const b=document.createElement('button');b.className='preset';b.type='button';b.dataset.preset=i;
 const pic=document.createElement('canvas');pic.width=192;pic.height=193;
 const cap=document.createElement('span');const name=document.createElement('b');name.textContent=p.title;const small=document.createElement('small');small.textContent=EXPRESSIONS[p.emotion].label+' · '+p.growth;cap.append(name,small);
 b.append(pic,cap);b.onclick=()=>{active().apply(p,{fresh:true});if(!playing)active().seek(p.time,0);sync();$('status').textContent='Loaded '+p.title+' on '+(selected?'B':'A')+'.';};$('presets').append(b);return {pic,p};
});
const thumb=new T.PerspectiveCamera(36,192/193,.05,40);thumb.position.set(.74,1.44,4.0);thumb.lookAt(0,1.2,0);
const thumbScene=new T.Scene();thumbScene.background=new T.Color('#1d2b40');const ts=new T.HemisphereLight('#d4edff','#576985',2.4),tk=new T.DirectionalLight('#e9f5ff',4.15),tr=new T.DirectionalLight('#68b7ff',3);tk.position.set(2,4,3);tr.position.set(-2,4,-4);
const ta=createShardling(gltf,{seed:2});thumbScene.add(ts,tk,tr,ta.object);
const rt=new T.WebGLRenderTarget(192,193,{samples:4});rt.texture.colorSpace=T.SRGBColorSpace;
function thumbnail(c){
 ta.apply({...c.p,wisps:false},{fresh:true});ta.seek(c.p.time,0);
 renderer.setRenderTarget(rt);renderer.render(thumbScene,thumb);const b=new Uint8Array(192*193*4);
 renderer.readRenderTargetPixels(rt,0,0,192,193,b);renderer.setRenderTarget(null);
 const ctx=c.pic.getContext('2d'),d=ctx.createImageData(192,193);
 for(let y=0;y<193;y++)d.data.set(b.subarray((192-y)*768,(193-y)*768),y*768);ctx.putImageData(d,0,0);c.pic.dataset.ready='1';
}
let nextThumb=0,last=performance.now();
sync();syncLight();$('status').textContent='Ready. Presets apply to the selected actor.';
window.__gallery={actors,payload,restore,get ready(){return nextThumb===cards.length},scene};
function loop(now){
 requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.08);last=now;
 if(document.hidden)return;
 if(nextThumb<cards.length){thumbnail(cards[nextThumb++]);if(nextThumb===cards.length){rt.dispose();ta.dispose();}}
 if(playing){actors[0].update(dt);if(pair)actors[1].update(dt);const p=active().inspect();$('scrub').value=p.time/p.duration;}
 controls.update();renderer.render(scene,camera);
}
requestAnimationFrame(loop);
