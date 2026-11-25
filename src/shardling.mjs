import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {MASK_SIZE,EXPRESSIONS,drawMask} from './masks.mjs';
import {createMotionClips,MOTIONS} from './motions.mjs';
export {EXPRESSIONS,EXPRESSION_COLLECTIONS} from './masks.mjs';
export {MOTIONS,MOTION_COLLECTIONS} from './motions.mjs';
export const GROWTHS=['Crown','Comet','Fault'];
export const PRESETS=[
 ['First hello','happy','helpful-offer','Crown',.68],
 ['Don’t look','bashful','bashful-fold','Comet',1.0],
 ['Point and laugh','giddy','point-and-laugh','Fault',1.15],
 ['Left behind','tearful','downtrodden','Crown',1.4],
 ['What is that?','puzzled','curious-lean','Fault',1.05],
 ['Coming through','focused','helpful-reach','Comet',.67],
 ['Back away','alarmed','worry-retreat','Fault',.75],
 ['Over here','delighted','attention-wave','Crown',.64],
 ['Too much','weary','quiet-withdraw','Comet',.94],
 ['No signal','blank','stand-ready','Fault',.8],
].map(([title,emotion,motion,growth,time])=>({title,emotion,motion,growth,time,wisps:true}));
const norm=(n,min,max)=>Math.min(max,Math.max(min,n));
export async function loadShardling(source){
 if(source instanceof ArrayBuffer || ArrayBuffer.isView(source)){
  const data=ArrayBuffer.isView(source)?source.buffer.slice(source.byteOffset,source.byteOffset+source.byteLength):source;
  return new GLTFLoader().parseAsync(data,'');
 }
 return new GLTFLoader().loadAsync(source);
}
function makeWisps(){
 const g=new T.Group(); const n=25;
 const strips=Array.from({length:3},()=>{
  const geom=new T.BufferGeometry(), pos=new Float32Array(n*6);geom.setAttribute('position',new T.BufferAttribute(pos,3).setUsage(T.DynamicDrawUsage));
  const colors=new Float32Array(n*8);
  for(let i=0;i<n;i++)for(let j=0;j<2;j++){
    const k=i*8+j*4;colors[k]=.06;colors[k+1]=.077;colors[k+2]=.103;colors[k+3]=Math.pow(Math.sin(Math.PI*i/(n-1)),.9)*(j?.23:.69);
  }
  geom.setAttribute('color',new T.BufferAttribute(colors,4));
  geom.setIndex(Array.from({length:n-1},(_,i)=>[2*i,2*i+1,2*i+2,2*i+1,2*i+3,2*i+2]).flat());
  const mat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
  const mesh=new T.Mesh(geom,mat);mesh.frustumCulled=false;g.add(mesh);return {mesh,pos};
 });
 return {group:g, update(t,seed,enabled){
  g.visible=enabled;if(!enabled)return;
  strips.forEach(({mesh,pos},j)=>{
    const phase=((t+seed*.73+j*2.2)%(6.2+j*.91))/(6.2+j*.91);
    mesh.visible=phase<.54;if(!mesh.visible)return;
    const p=phase/.54,s=j===1?1:-1;mesh.material.opacity=.69*Math.sin(Math.PI*p);
    for(let i=0;i<n;i++){
      const u=i/(n-1),a=i*6;
      const x=s*(.18+(j*.04)+u*(.53+j*.03)+p*.27)+.059*Math.sin(u*8-p*7+j);
      const y=1.63-j*.16+u*.48+p*.19+.062*Math.sin(u*9+p*3+j);
      const z=.038-u*.22+.085*Math.sin(u*6-p*6+j);
      const width=(.017+j*.002)*Math.sin(Math.PI*u)*(.70+.40*Math.sin(u*5+p));
      pos.set([x,y-width,z-width*.38,x,y+width,z+width*.38],a);
    }
    mesh.geometry.attributes.position.needsUpdate=true;
  });
 },dispose(){for(const {mesh} of strips){mesh.geometry.dispose();mesh.material.dispose();}}};
}
export function createShardling(asset,{seed=1}={}){
 const object=new T.Group(), body=clone(asset.scene??asset);object.add(body);
 const display=body.getObjectByName('LED_Surface');
 if(!display)throw Error('LED_Surface missing from Shardling GLB');
 const canvas=document.createElement('canvas');canvas.width=canvas.height=MASK_SIZE;
 const texture=new T.CanvasTexture(canvas);texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;
 display.material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,alphaTest:.015,side:T.FrontSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 display.renderOrder=3;
 const forms=Object.fromEntries(GROWTHS.map(g=>[g,[]]));
 body.traverse(o=>{for(const g of GROWTHS)if(o.isMesh&&o.name.startsWith(g+'_'))forms[g].push(o);});
 const wisps=makeWisps();object.add(wisps.group);
 const clips=createMotionClips(T,body), mixer=new T.AnimationMixer(body);
 const actions=Object.fromEntries(clips.map(c=>[c.name,mixer.clipAction(c)]));
 let state={}, frame=0, clock=0, visualClock=seed*1.21, action, draws=0;
 function paint(){drawMask(canvas,state.emotion,frame);texture.needsUpdate=true;draws++;}
 function offsets(f){const d=EXPRESSIONS[state.emotion].frameDurationsMs[f];return (d/1000)*(.88+((seed*13+f*7)%19)/73)/state.maskSpeed;}
 function play(offset=0){
  mixer.stopAllAction();action=actions[state.motion];if(!action)return;
  action.reset();const loop=MOTIONS[state.motion].loop||state.repeat;
  action.setLoop(loop?T.LoopRepeat:T.LoopOnce,loop?Infinity:1);
  action.clampWhenFinished=true;action.timeScale=state.motionSpeed;action.play();action.time=offset; mixer.update(0);
 }
 function apply(spec={},opts={}){
  const prev=state;
  const e=spec.emotion??prev.emotion??'happy', m=spec.motion??prev.motion??'rest', g=spec.growth??prev.growth??'Crown';
  const num=(value,fallback)=>Number.isFinite(+value)?norm(+value,.25,3):fallback;
  state={emotion:Object.hasOwn(EXPRESSIONS,e)?e:'blank',motion:Object.hasOwn(MOTIONS,m)?m:'rest',
    growth:GROWTHS.includes(g)?g:'Crown', wisps:spec.wisps??prev.wisps??true,
    repeat:spec.repeat??prev.repeat??true, animateMask:spec.animateMask??prev.animateMask??true,
    maskSpeed:num(spec.maskSpeed??prev.maskSpeed,1),motionSpeed:num(spec.motionSpeed??prev.motionSpeed,1)};
  for(const g of GROWTHS)for(const o of forms[g])o.visible=g===state.growth;
  if(prev.emotion!==state.emotion||opts.fresh){frame=state.emotion==='blank'?0:(seed%6);clock=0;paint();}
  if(!action||prev.motion!==state.motion||prev.repeat!==state.repeat||opts.fresh){play(opts.offset??0);}
  else action.timeScale=state.motionSpeed;
  wisps.update(visualClock,seed,state.wisps);
 }
 function update(dt){
  mixer.update(dt);
  if(state.emotion!=='blank'&&state.animateMask){
    clock+=dt;let d=offsets(frame), changed=false;
    while(clock>=d){clock-=d; frame=(frame+((seed%2)?1:5))%6;d=offsets(frame);changed=true;}
    if(changed)paint();
  }
  visualClock+=dt;wisps.update(visualClock,seed,state.wisps);
 }
 function seek(t,f=frame){action.paused=false;action.enabled=true;action.time=norm(t,0,action.getClip().duration-.0001);mixer.update(0);frame=f;paint();}
 apply({}, {fresh:true});
 return {object,body,display,clips,seed,apply,update,seek,replay:()=>play(),snapshot:()=>({...state}),
         inspect:()=>({...state,frame,draws,time:action?.time,duration:action?.getClip().duration,forms:Object.fromEntries(GROWTHS.map(g=>[g,forms[g].filter(o=>o.visible).length]))}),
         dispose(){mixer.stopAllAction();mixer.uncacheRoot(body);texture.dispose();display.material.dispose();wisps.dispose();}};
}
