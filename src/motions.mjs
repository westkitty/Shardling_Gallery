/**
 * Shardling body performance library. Axes in the source keyframes are model
 * axes (Y up, +Z forward); numbers in r are degrees relative to the rest pose.
 * No display materials, mask tracks, or shared/global actor state.
 */
const frame = (t, r = {}, shift = [0, 0], air = 0) => ({ t, r, shift, air });
const blendPose = (a, b) => ({ ...a, ...b });
const data = {
  rest: {
    label: 'Rest idle', collection: 'Neutral', loop: true,
    description: 'Small, asynchronous-looking shifts across the ribs, shoulders, and head.',
    keys: [
      frame(0), frame(.67, { Spine:[1,0,0], Chest:[-1,-1,0], 'Clavicle.L':[0,0,1], Head:[-1,1,0] }),
      frame(1.4, { Spine:[2,0,-1], Chest:[-2,-2,0], Head:[-2,3,2], 'UpperArm.R':[-2,0,1] }),
      frame(2.3, { Chest:[1,1,0], Head:[1,-2,-1], 'Clavicle.R':[0,0,-1], 'UpperArm.L':[1,0,-1] }),
      frame(3.7),
    ],
  },
  'stand-ready': {
    label: 'Stand ready', collection: 'Neutral', loop: true,
    description: 'An alert hold with softened knees and a tiny balance correction.',
    keys: [
      frame(0,{Pelvis:[-3,0,0], Spine:[4,0,0], Chest:[-3,0,0], Head:[-2,1,0], 'Thigh.L':[-8,0,1], 'Thigh.R':[-8,0,-1], 'Shin.L':[12,0,0], 'Shin.R':[12,0,0], 'Foot.L':[-4,0,0], 'Foot.R':[-4,0,0], 'Forearm.L':[-10,0,2], 'Forearm.R':[-10,0,-2]}),
      frame(.8,{Pelvis:[-3,0,1], Spine:[4,0,-1], Chest:[-4,-1,0], Head:[-3,-2,0], 'Thigh.L':[-9,0,1], 'Thigh.R':[-7,0,-1], 'Shin.L':[13,0,0], 'Shin.R':[11,0,0], 'Foot.L':[-4,0,0], 'Foot.R':[-4,0,0], 'Forearm.L':[-12,0,2], 'Forearm.R':[-10,0,-2]}),
      frame(1.5,{Pelvis:[-3,0,-1], Spine:[4,0,1], Chest:[-3,1,0], Head:[-1,2,0], 'Thigh.L':[-8,0,1], 'Thigh.R':[-9,0,-1], 'Shin.L':[12,0,0], 'Shin.R':[13,0,0], 'Foot.L':[-4,0,0], 'Foot.R':[-4,0,0], 'Forearm.L':[-10,0,2], 'Forearm.R':[-12,0,-2]}),
      frame(2.75,{Pelvis:[-3,0,0], Spine:[4,0,0], Chest:[-3,0,0], Head:[-2,1,0], 'Thigh.L':[-8,0,1], 'Thigh.R':[-8,0,-1], 'Shin.L':[12,0,0], 'Shin.R':[12,0,0], 'Foot.L':[-4,0,0], 'Foot.R':[-4,0,0], 'Forearm.L':[-10,0,2], 'Forearm.R':[-10,0,-2]}),
    ],
  },
  'helpful-offer': {
    label: 'Helpful offer', collection: 'Connection', loop: false,
    description: 'An open palm settles into the space between two actors.',
    keys: [
      frame(0), frame(.26, {Chest:[0,-6,0], Head:[-3,5,1], 'Clavicle.L':[3,0,-4], 'UpperArm.L':[-12,5,-8], 'Forearm.L':[-16,0,0]}),
      frame(.66, { Spine:[4,-4,-1],Chest:[1,-6,0], Head:[-6,8,3], 'UpperArm.L':[-40,-10,-7], 'Forearm.L':[-46,5,8], 'Hand.L':[-8,56,5], 'UpperArm.R':[4,0,2] }, [0,.014]),
      frame(1.19, { Spine:[3,-3,-1],Chest:[0,-5,1], Head:[-4,6,3], 'UpperArm.L':[-37,-8,-8], 'Forearm.L':[-43,5,8], 'Hand.L':[-7,54,5], 'UpperArm.R':[3,0,2] }, [0,.012]),
      frame(1.51, { Head:[-1,3,1], 'UpperArm.L':[-17,-3,-3], 'Forearm.L':[-20,2,3], 'Hand.L':[-2,19,2] }), frame(1.96),
    ],
  },
  'helpful-reach': {
    label: 'Careful reach', collection: 'Connection', loop: false,
    description: 'A clear forward reach interrupted by a check for permission.',
    keys: [
      frame(0), frame(.25,{ Spine:[4,4,0], Chest:[2,5,0], Head:[1,-3,0], 'UpperArm.R':[-24,1,5], 'Forearm.R':[-16,0,0] }),
      frame(.64,{ Pelvis:[-2,0,0], Spine:[9,4,-1], Chest:[4,7,-1], Head:[-6,-7,1], 'UpperArm.R':[-62,0,4], 'Forearm.R':[-8,0,2], 'Hand.R':[4,-10,0], 'UpperArm.L':[8,0,1] }, [-.015,.02]),
      frame(.89,{ Spine:[6,4,0], Chest:[2,7,0], Head:[2,-7,-1], 'UpperArm.R':[-57,0,3], 'Forearm.R':[-12,0,2], 'Hand.R':[5,-10,0], 'UpperArm.L':[5,0,1] }, [-.01,.015]),
      frame(1.27,{ Spine:[3,2,0], Chest:[1,3,0], Head:[-2,-2,0], 'UpperArm.R':[-29,0,2], 'Forearm.R':[-22,0,1], 'Hand.R':[4,-6,0] }), frame(1.75),
    ],
  },
  'attention-wave': {
    label: 'Attention wave', collection: 'Connection', loop: false,
    description: 'A raised, gentle two-beat wave with a shoulder follow-through.',
    keys: [
      frame(0), frame(.32,{ Chest:[-2,3,1], Head:[-4,-2,-2], 'UpperArm.R':[-26,0,-26], 'Forearm.R':[-54,0,-29] }),
      frame(.62,{ Spine:[-4,4,3], Chest:[-2,4,0], Head:[-4,-6,-2], 'UpperArm.R':[-45,0,-44], 'Forearm.R':[-62,0,-35], 'Hand.R':[3,0,21] }),
      frame(.82,{ Spine:[-3,4,3], Chest:[-2,4,1], Head:[-3,-6,-2], 'UpperArm.R':[-44,0,-43], 'Forearm.R':[-64,0,-33], 'Hand.R':[4,0,-18] }),
      frame(1.02,{ Spine:[-4,4,3], Chest:[-2,4,1], Head:[-2,-5,-3], 'UpperArm.R':[-45,0,-44], 'Forearm.R':[-63,0,-35], 'Hand.R':[3,0,20] }),
      frame(1.24,{ Spine:[-3,3,2], Chest:[-2,3,0], Head:[-2,-4,-2], 'UpperArm.R':[-41,0,-40], 'Forearm.R':[-60,0,-30], 'Hand.R':[3,0,-12] }),
      frame(1.55,{ Chest:[-1,1,0], Head:[-1,-1,0], 'UpperArm.R':[-20,0,-14], 'Forearm.R':[-40,0,-11], 'Hand.R':[1,0,1] }), frame(2),
    ],
  },
  'curious-lean': {
    label: 'Curious lean', collection: 'Discovery', loop: false,
    description: 'The head tips first; the ribs and counterweighted hips follow.',
    keys: [
      frame(0), frame(.28,{ Neck:[0,-3,0], Head:[1,-5,9], Chest:[1,0,2], 'Clavicle.L':[0,0,-2] }),
      frame(.64,{ Pelvis:[-5,0,3], Spine:[7,-3,-9], Chest:[5,-3,1], Neck:[8,3,0], Head:[-10,2,15], 'UpperArm.L':[1,0,-5], 'Forearm.R':[-13,2,7] }, [.013,.008]),
      frame(1.09,{ Pelvis:[-4,0,3], Spine:[7,-3,-8], Chest:[4,-3,2], Neck:[7,3,0], Head:[-8,-3,11], 'UpperArm.L':[1,0,-5], 'Forearm.R':[-12,2,7] }, [.011,.006]),
      frame(1.42,{Pelvis:[-2,0,1], Spine:[3,-1,-3],Chest:[2,-1,1], Neck:[3,0,0], Head:[-4,2,6], 'Forearm.R':[-6,1,2]}), frame(1.96),
    ],
  },
  'worry-retreat': {
    label: 'Worried recoil', collection: 'Discovery', loop: false,
    description: 'A protective half-step in place, quick recoil, then tentative recovery.',
    keys: [
      frame(0), frame(.15,{ Chest:[-7,1,0], Neck:[-9,0,0], Head:[-9,2,0], 'UpperArm.L':[-23,0,7], 'UpperArm.R':[-20,0,-6], 'Forearm.L':[-28,0,8], 'Forearm.R':[-32,0,-7] }, [0,-.026]),
      frame(.43,{ Pelvis:[2,0,0], Spine:[-8,-4,1], Chest:[-9,2,-1], Neck:[4,2,0], Head:[3,-6,-4], 'Thigh.L':[-14,0,2], 'Thigh.R':[7,0,-1], 'Shin.L':[20,0,0], 'Shin.R':[4,0,0], 'Foot.L':[-8,0,0], 'Foot.R':[-9,0,0], 'UpperArm.L':[-31,10,4], 'UpperArm.R':[-26,-10,-4], 'Forearm.L':[-54,0,6], 'Forearm.R':[-57,0,-7] }, [-.015,-.046]),
      frame(.93,{ Spine:[-5,-3,0], Chest:[-4,2,0], Neck:[3,1,0], Head:[7,1,-3], 'Thigh.L':[-8,0,1], 'Thigh.R':[3,0,-1], 'Shin.L':[13,0,0], 'Shin.R':[3,0,0], 'Foot.L':[-5,0,0], 'Foot.R':[-6,0,0], 'UpperArm.L':[-25,7,2], 'UpperArm.R':[-22,-7,-2], 'Forearm.L':[-38,0,5], 'Forearm.R':[-42,0,-6] }, [-.009,-.023]),
      frame(1.37,{ Spine:[-1,-1,0], Chest:[-1,1,0], Head:[2,1,1], 'UpperArm.L':[-12,2,1], 'UpperArm.R':[-10,-2,-1], 'Forearm.L':[-18,0,2], 'Forearm.R':[-20,0,-2] }), frame(2.11),
    ],
  },
  'joy-bounce': {
    label: 'Joy bounce', collection: 'Discovery', loop: true,
    description: 'Two buoyant hops with a squat windup and absorbing landing.',
    keys: [
      frame(0),
      frame(.18,{ Spine:[7,0,0], Chest:[4,0,0], Head:[3,0,0], 'Thigh.L':[-21,0,2], 'Thigh.R':[-21,0,-2], 'Shin.L':[36,0,0], 'Shin.R':[36,0,0], 'Foot.L':[-15,0,0], 'Foot.R':[-15,0,0], 'UpperArm.L':[12,0,3], 'UpperArm.R':[12,0,-3], 'Forearm.L':[-10,0,0], 'Forearm.R':[-10,0,0] }),
      frame(.36,{ Pelvis:[-1,0,0], Spine:[-6,0,0], Chest:[-5,0,0], Head:[-7,2,-1], 'Thigh.L':[-8,0,4], 'Thigh.R':[-10,0,-4], 'Shin.L':[14,0,0], 'Shin.R':[14,0,0], 'Foot.L':[6,0,0], 'Foot.R':[6,0,0], 'UpperArm.L':[-24,0,15], 'UpperArm.R':[-26,0,-17], 'Forearm.L':[-66,0,14], 'Forearm.R':[-62,0,-14] }, [0,0], .065),
      frame(.54,{ Spine:[6,0,0], Chest:[3,0,1], Head:[4,-1,1], 'Thigh.L':[-17,0,2], 'Thigh.R':[-17,0,-2], 'Shin.L':[28,0,0], 'Shin.R':[28,0,0], 'Foot.L':[-11,0,0], 'Foot.R':[-11,0,0], 'UpperArm.L':[-18,0,9], 'UpperArm.R':[-20,0,-11], 'Forearm.L':[-34,0,7], 'Forearm.R':[-36,0,-9] }),
      frame(.71,{ Spine:[-4,0,0], Chest:[-3,0,-1], Head:[-5,1,-2], 'Thigh.L':[-6,0,3], 'Thigh.R':[-7,0,-3], 'Shin.L':[10,0,0], 'Shin.R':[11,0,0], 'Foot.L':[4,0,0], 'Foot.R':[4,0,0], 'UpperArm.L':[-26,0,12], 'UpperArm.R':[-22,0,-14], 'Forearm.L':[-58,0,10], 'Forearm.R':[-63,0,-12] }, [0,0], .035),
      frame(.89,{ Spine:[4,0,0], Chest:[3,0,0], Head:[3,0,1], 'Thigh.L':[-10,0,1], 'Thigh.R':[-10,0,-1], 'Shin.L':[17,0,0], 'Shin.R':[17,0,0], 'Foot.L':[-7,0,0], 'Foot.R':[-7,0,0], 'UpperArm.L':[-13,0,7], 'UpperArm.R':[-13,0,-7], 'Forearm.L':[-32,0,4], 'Forearm.R':[-30,0,-4] }),
      frame(1.16,{ Spine:[0,0,0], Head:[-1,0,0], 'Forearm.L':[-6,0,0], 'Forearm.R':[-6,0,0] }), frame(1.65),
    ],
  },
};
const shy = {
  Pelvis:[-3,0,0], Spine:[9,4,2], Chest:[8,-7,3], Neck:[5,7,-1], Head:[12,-15,-6],
  'Clavicle.L':[7,0,5], 'Clavicle.R':[8,0,-6], 'UpperArm.L':[-14,0,-31], 'UpperArm.R':[-17,0,31],
  'Forearm.L':[-45,1,-31], 'Forearm.R':[-58,-2,35], 'Hand.L':[-4,13,8], 'Hand.R':[0,-14,-8],
  'Thigh.L':[-5,3,0], 'Thigh.R':[-7,-5,4], 'Shin.L':[9,0,0], 'Shin.R':[10,0,0], 'Foot.L':[-3,0,0], 'Foot.R':[-3,0,0],
};
data['bashful-fold'] = {
  label: 'Bashful fold', collection: 'Feeling', loop: true,
  description: 'Shoulders curl and hands find each other as the head sneaks an upward glance.',
  keys: [
    frame(0,shy,[-.016,-.006]),
    frame(.51,blendPose(shy,{Chest:[7,-6,3], Neck:[4,6,-1], Head:[10,-11,-8], 'Forearm.L':[-47,1,-32], 'Forearm.R':[-61,-2,36]}),[-.017,-.006]),
    frame(1.07,blendPose(shy,{Spine:[8,4,2], Chest:[5,-5,3], Neck:[2,6,-1], Head:[2,-5,-6], 'Forearm.L':[-46,1,-30], 'Hand.R':[0,-18,-8]}),[-.015,-.006]),
    frame(1.51,blendPose(shy,{Chest:[6,-6,3], Neck:[4,6,-1], Head:[10,-12,-7], 'Forearm.R':[-58,-2,37]}),[-.016,-.006]),
    frame(2.4,shy,[-.016,-.006]),
  ],
};
const down = {
  Pelvis:[-6,-1,-2], Spine:[13,0,3], Chest:[13,0,-1], Neck:[8,0,2], Head:[13,4,1],
  'Clavicle.L':[8,0,-5], 'Clavicle.R':[9,0,6], 'UpperArm.L':[4,0,-10], 'UpperArm.R':[6,0,11],
  'Forearm.L':[-6,0,-2], 'Forearm.R':[-6,0,2], 'Hand.L':[8,0,0], 'Hand.R':[10,0,0],
  'Thigh.L':[-7,0,0], 'Thigh.R':[-12,0,1], 'Shin.L':[14,0,0], 'Shin.R':[16,0,0], 'Foot.L':[-4,0,0], 'Foot.R':[-2,0,0],
};
data.downtrodden = {
  label: 'Downtrodden', collection: 'Feeling', loop: true,
  description: 'A heavy asymmetrical slump, slow exhale, limp hands, and downcast head.',
  keys: [
    frame(0,down,[-.018,-.012]),
    frame(.72,blendPose(down,{Chest:[12,0,-1], Neck:[7,0,2], Head:[11,3,2], 'Clavicle.L':[6,0,-5], 'Clavicle.R':[7,0,6]}),[-.018,-.012]),
    frame(1.47,blendPose(down,{Pelvis:[-6,-1,-2], Spine:[15,0,3], Chest:[17,0,-1], Neck:[9,0,2], Head:[16,7,0], 'Hand.R':[12,0,0]}),[-.022,-.014]),
    frame(2.66,blendPose(down,{Spine:[14,0,3], Chest:[15,0,-1], Head:[14,6,0]}),[-.02,-.013]),
    frame(4.1,down,[-.018,-.012]),
  ],
};
const laugh = {
  Pelvis:[-4,0,1], Spine:[6,4,0], Chest:[7,3,1], Neck:[-3,0,0], Head:[-5,-5,-4],
  'Clavicle.R':[0,-2,-3], 'UpperArm.R':[-74,-3,-5], 'Forearm.R':[-9,0,6], 'Hand.R':[6,0,-3],
  'Index.R':[-5,0,0], 'Fingers.R':[54,0,0],
  'UpperArm.L':[-4,0,-18], 'Forearm.L':[-67,0,-34], 'Hand.L':[5,21,2],
  'Thigh.L':[-7,0,0], 'Thigh.R':[-9,0,1], 'Shin.L':[12,0,0], 'Shin.R':[13,0,0], 'Foot.L':[-2,0,0], 'Foot.R':[-1,0,0],
};
const laughPulse = (power) => blendPose(laugh,{
  Spine:[6+power*.42,4,0], Chest:[7+power*.77,3,1], Neck:[-3-power*.61,0,0], Head:[-5-power,-5,-4+power*.19],
  'Clavicle.L':[0,0,power*.72], 'Clavicle.R':[0,-2,-3-power*.45],
  'UpperArm.R':[-74-power*1.35,-3,-5+power*.45], 'Forearm.R':[-9-power*.2,0,6], 'Hand.R':[6+power*.2,0,-3],
});
data['point-and-laugh'] = {
  label: 'Point and laugh', collection: 'Feeling', loop: true,
  description: 'Right index points forward while the left guards the ribs and three staggered shoulder pulses sell a laugh.',
  keys: [
    frame(0,laugh), frame(.14,laughPulse(8)), frame(.28,laughPulse(-1)),
    frame(.45,laughPulse(10)), frame(.65,laughPulse(0)), frame(.83,laughPulse(6)),
    frame(1.05,laughPulse(-2)), frame(1.43,laugh),
  ],
};
data['quiet-withdraw'] = {
  label: 'Quiet withdrawal', collection: 'Feeling', loop: false,
  description: 'Looks aside, folds inward, and settles in the downtrodden position.',
  keys: [
    frame(0), frame(.32,{ Spine:[2,-1,0], Neck:[1,6,1], Head:[3,12,3], 'Clavicle.L':[1,0,-1], 'Clavicle.R':[2,0,1] }),
    frame(.82,blendPose(down,{Spine:[8,-2,2], Chest:[8,2,-1], Neck:[5,3,2], Head:[10,10,2]}),[-.008,-.006]),
    frame(1.45,down,[-.018,-.012]), frame(1.89,down,[-.018,-.012]),
  ],
};

export const MOTIONS = Object.freeze(Object.fromEntries(Object.entries(data).map(([id, spec]) => [
  id, Object.freeze({ id, label:spec.label, collection:spec.collection, loop:spec.loop, duration:spec.keys.at(-1).t, description:spec.description }),
])));
export const MOTION_COLLECTIONS = Object.freeze(Object.fromEntries(
  ['Neutral','Connection','Discovery','Feeling'].map(collection => [collection, Object.freeze(
    Object.values(MOTIONS).filter(spec => spec.collection === collection).map(spec => spec.id),
  )]),
));
const mandatory = ['Root','Pelvis','Spine','Chest','Neck','Head',
  ...['L','R'].flatMap(s => ['Clavicle','UpperArm','Forearm','Hand','Thigh','Shin','Foot'].map(b => b+'.'+s))];
const options = ['Index.L','Index.R','Fingers.L','Fingers.R'];
const normalize = value => value.toLowerCase().replace(/[\s_.-]/g, '');
const degree = Math.PI / 180;
const zero = [0,0,0];

function sampleKeys(keys) {
  let samples = [];
  for (let k = 1; k < keys.length; ++k) {
    const a = keys[k-1], b = keys[k];
    const n = Math.max(3, Math.ceil((b.t-a.t)*18));
    const bones = new Set([...Object.keys(a.r), ...Object.keys(b.r)]);
    for(let j=0;j<n;++j) {
      const x = j/n;
      // Smooth lead-in/out while preserving rhythm of short authored beats.
      const u = x*x*(3-2*x);
      const mix = (p,q) => p + (q-p)*u;
      const r = {};
      for (const name of bones) {
        const v = a.r[name] ?? zero, w = b.r[name] ?? zero;
        r[name] = [0,1,2].map(i => mix(v[i],w[i]));
      }
      samples.push(frame(a.t+(b.t-a.t)*x,r,a.shift.map((v,i)=>mix(v,b.shift[i])),mix(a.air,b.air)));
    }
  }
  samples.push(keys.at(-1));
  return samples;
}

/**
 * Compile local bone tracks on this private actor instance. Do this after
 * cloning and before starting pose playback (the compile samples the bind pose).
 * Runtime callers select whether to loop via MOTIONS[id].loop.
 */
export function createMotionClips(THREE, root) {
  if (!root?.traverse) throw new TypeError('createMotionClips needs the GLTF actor scene');
  root.updateWorldMatrix(true,true);
  const invRoot = root.matrixWorld.clone().invert();
  const modelQ = new THREE.Quaternion();
  const byName = new Map();
  root.traverse(o => {
    if (!o.name) return;
    const key = normalize(o.name);
    if (!byName.has(key) || o.isBone) byName.set(key, o);
  });
  const rig = new Map();
  const names = new Map();
  for(const name of [...mandatory,...options]) {
    const bone = byName.get(normalize(name));
    if(!bone) continue;
    const m = new THREE.Matrix4().multiplyMatrices(invRoot,bone.matrixWorld);
    m.decompose(new THREE.Vector3(),modelQ,new THREE.Vector3());
    const parentM = bone.parent ? new THREE.Matrix4().multiplyMatrices(invRoot,bone.parent.matrixWorld) : new THREE.Matrix4();
    rig.set(bone,{
      name, position:bone.position.clone(), scale:bone.scale.clone(), rest:bone.quaternion.clone(),
      orient:modelQ.clone(), invOrient:modelQ.clone().invert(),
      parentInverseLinear:new THREE.Matrix3().setFromMatrix4(parentM).invert(),
    });
    names.set(name,bone);
  }
  const missing = mandatory.filter(name=>!names.has(name));
  if (missing.length) throw new Error('Shardling motion rig is missing bones: '+missing.join(', '));
  const origin = names.get('Root');
  const feet = [names.get('Foot.L'),names.get('Foot.R')];
  const modelPos = bone => new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld).applyMatrix4(invRoot);
  const restAnkleY = Math.min(...feet.map(b => modelPos(b).y));
  const h = Math.max(.1, Math.abs(modelPos(names.get('Head')).y-restAnkleY));
  return Object.entries(data).map(([id,spec])=>{
    const changed = [...new Set(spec.keys.flatMap(k=>Object.keys(k.r)))].map(n=>names.get(n)).filter(Boolean);
    const samples = sampleKeys(spec.keys);
    const times = samples.map(k=>k.t);
    const rotations = new Map(changed.map(b=>[b,[]]));
    const prior = new Map();
    const positions = [];
    const composeQuat = (entry, angles = zero) => {
      const delta = new THREE.Quaternion().setFromEuler(new THREE.Euler(...angles.map(n=>n*degree),'YXZ'));
      return entry.rest.clone().multiply(entry.invOrient).multiply(delta).multiply(entry.orient).normalize();
    };
    for (const k of samples) {
      const qk=new Map();
      for (const b of changed) {
        const entry = rig.get(b);
        const q = composeQuat(entry,k.r[entry.name]);
        if(prior.has(b) && prior.get(b).dot(q)<0) q.set(-q.x,-q.y,-q.z,-q.w);
        prior.set(b,q);
        qk.set(b,q);
        rotations.get(b).push(q.x,q.y,q.z,q.w);
      }
      const restToLocal = new Map();
      function currentModel(b) {
        if (!b) return new THREE.Matrix4();
        if(restToLocal.has(b)) return restToLocal.get(b);
        const restData = rig.get(b);
        const m = restData ?
          currentModel(b.parent).clone().multiply(new THREE.Matrix4().compose(restData.position,qk.get(b) ?? restData.rest,restData.scale)) :
          new THREE.Matrix4().multiplyMatrices(invRoot,b.matrixWorld);
        restToLocal.set(b,m);
        return m;
      }
      const poseAnkleY = Math.min(...feet.map(b=>new THREE.Vector3().setFromMatrixPosition(currentModel(b)).y));
      // Preserve planted ankle height when the knees compress. The optional
      // explicit air curve is only used by the two hops in Joy Bounce.
      const dy = restAnkleY-poseAnkleY + k.air*h;
      const originData = rig.get(origin);
      const offset = new THREE.Vector3(k.shift[0]*h,dy,k.shift[1]*h).applyMatrix3(originData.parentInverseLinear);
      const p = originData.position.clone().add(offset);
      positions.push(p.x,p.y,p.z);
    }
    const tracks = changed.map(b=>new THREE.QuaternionKeyframeTrack(b.uuid+'.quaternion',times,rotations.get(b)));
    if(positions.some((v,i)=>Math.abs(v-positions[i%3])>1e-5) || positions.some((v,i)=>Math.abs(v-rig.get(origin).position.getComponent(i%3))>1e-5)) {
      tracks.push(new THREE.VectorKeyframeTrack(origin.uuid+'.position',times,positions));
    }
    const clip = new THREE.AnimationClip(id,MOTIONS[id].duration,tracks);
    // Keep the plain authoring contract available without any Three internals.
    clip.userData = MOTIONS[id];
    return clip.optimize();
  });
}
