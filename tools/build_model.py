import bpy, math, os, random, sys
from mathutils import Vector
from math import sin,cos,pi
bpy.ops.wm.read_factory_settings(use_empty=True)
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
random.seed(71)
def mat(n,c,rough=.4,metal=.12,glow=0):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*c,1);b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
 b.inputs['Emission Color'].default_value=(*c,1);b.inputs['Emission Strength'].default_value=glow
 return m
obs=mat('Black matter | deep obsidian',(.012,.015,.023),.49,.11)
satin=mat('Black matter | lit facets',(.021,.027,.046),.48,.14)
edge=mat('Black matter | slate facets',(.038,.050,.082),.44,.17)
black=mat('LED housing | unlit glass',(.006,.009,.017),.29,.20)
rim=mat('Shield | polished black rim',(.023,.034,.058),.31,.22)
az=mat('Azure crystal | ice',(.075,.49,.89),.25,.27,.21)
azd=mat('Azure crystal | deep facets',(.025,.18,.40),.30,.3,.11)
azl=mat('Azure crystal | cleaved facets',(.24,.67,.93),.28,.12,.42)
arm=bpy.data.armatures.new('ShardlingArmature'); rig=bpy.data.objects.new('ShardlingRig',arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
segments={}
def b(n,h,t,p=None):
 k=arm.edit_bones.new(n);k.head=h;k.tail=t
 if p:k.parent=arm.edit_bones[p]
 segments[n]=(Vector(h),Vector(t))
b('Root',(0,0,0),(0,0,.28))
b('Pelvis',(0,0,1.06),(0,0,1.27),'Root');b('Spine',(0,0,1.27),(0,0,1.54),'Pelvis');b('Chest',(0,0,1.54),(0,0,1.83),'Spine')
b('Neck',(0,0,1.83),(0,-.01,1.98),'Chest');b('Head',(0,-.01,1.98),(0,-.012,2.20),'Neck')
for side,s in [('L',1),('R',-1)]:
 def v(x,y,z):return (x*s,y,z)
 def bit(n,h,t,p):b(n+'.'+side,v(*h),v(*t),p if p in ('Chest','Pelvis') else p+'.'+side)
 bit('Clavicle',(.08,0,1.77),(.253,0,1.745),'Chest')
 bit('UpperArm',(.253,0,1.745),(.354,.004,1.438),'Clavicle')
 bit('Forearm',(.354,.004,1.438),(.428,-.012,1.168),'UpperArm')
 bit('Hand',(.428,-.012,1.168),(.455,-.026,1.025),'Forearm')
 bit('Index',(.422,-.035,1.075),(.434,-.063,1.002),'Hand')
 bit('Fingers',(.462,-.02,1.075),(.474,-.055,.998),'Hand')
 bit('Thigh',(.118,0,1.13),(.164,-.035,.625),'Pelvis')
 bit('Shin',(.164,-.035,.625),(.173,.016,.152),'Thigh')
 bit('Foot',(.173,.016,.152),(.177,-.151,.074),'Shin')
bpy.ops.object.mode_set(mode='OBJECT')
BODY={}
FORM='Base'
def mesh(n,V,F,M,idx,bone):
 # Merge independent faceted pieces into one skinned draw per material.
 for j,f in enumerate(F):
  m=M[idx[j] if idx else 0]; vv,weights=BODY.setdefault((FORM,m.name),([],[]))
  for k in range(1,len(f)-1):
   for a in (f[0],f[k],f[k+1]):vv.append(V[a]);weights.append(bone[a] if isinstance(bone,list) else bone)
def obj(n,V,F,M):
 me=bpy.data.meshes.new(n);me.from_pydata(V,[],F);me.update()
 o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o)
 for m in M:me.materials.append(m)
 return o
def bind(o,weights):
 o.parent=rig
 groups={n:o.vertex_groups.new(name=n) for n in dict.fromkeys(weights)}
 for i,n in enumerate(weights): groups[n].add([i],1,'REPLACE')
 o.modifiers.new('Rig deformation','ARMATURE').object=rig
def tube(n,bone,rings,N=16,center=None):
 h,t=segments[bone] if center is None else map(Vector,center)
 w=(t-h).normalized(); a=Vector((1,0,0));a=(a-a.dot(w)*w).normalized();v=w.cross(a)
 V=[]; F=[]; ids=[]
 for k,(f,rx,ry) in enumerate(rings):
  for i in range(N):
   th=2*pi*i/N; q=1+.055*cos(i*2.85+k*.58)
   V.append(h+(t-h)*f+q*(a*(rx*cos(th))+v*(ry*sin(th))))
 F.append(tuple(range(N-1,-1,-1)));ids.append(0)
 for k in range(len(rings)-1):
  for i in range(N):
   j=(i+1)%N;a0=k*N+i;b0=k*N+j;c0=(k+1)*N+j; d0=(k+1)*N+i
   F.extend([(a0,b0,c0),(a0,c0,d0)]); ch=[0,0,1,0,1,0,0,1,0,0,0,1,0,0,1,0][(i+int(i/4)+int(k/3))%16];ids.extend([ch,ch if random.random()<.82 else 0])
 F.append(tuple(range(len(V)-N,len(V))));ids.append(0)
 mesh(n,V,F,[obs,satin,edge],ids,bone)
def shard(bone,o,d,l,w,mats,depth=.67):
 o=Vector(o); d=Vector(d).normalized(); a=d.cross(Vector((0,1,0)))
 if a.length<.02:a=d.cross(Vector((1,0,0)))
 a.normalize(); c=d.cross(a).normalized()
 V=[o+a*w*cos(i*pi/3)+c*w*depth*sin(i*pi/3) for i in range(6)]
 V.extend([o+d*(l*.33)+a*w*.71*cos(i*pi/3)+c*w*depth*.7*sin(i*pi/3) for i in range(6)])
 V.append(o+d*l+a*w*.48);F=[]; ids=[]
 for i in range(6):
  j=(i+1)%6;F.extend([(i,j,j+6,i+6),(i+6,j+6,12)]);ids.extend([i%3,(i+2)%3])
 F.append(tuple(reversed(range(6))));ids.append(1)
 mesh('facet',V,F,mats,ids,bone)
tube('hips','Pelvis',[(-.51,.073,.089),(-.21,.175,.114),(.24,.182,.112),(.68,.144,.091),(1.2,.122,.081)])
tube('waist','Spine',[(-.26,.121,.088),(.16,.127,.091),(.5,.151,.107),(.81,.169,.119),(1.27,.187,.131)])
tube('thorax','Chest',[(-.22,.174,.123),(.12,.196,.134),(.5,.235,.147),(.72,.247,.121),(.89,.200,.105),(1.01,.129,.082),(1.12,.076,.069)])
tube('neck','Neck',[(-.27,.109,.079),(.15,.085,.068),(.57,.073,.064),(1.05,.089,.077)])
tube('skull','Head',[(-.12,.056,.065),(.16,.101,.086),(.52,.112,.101),(.85,.111,.092),(1.06,.076,.07)])
for side,s in [('L',1),('R',-1)]:
 for limb,r in {
  'UpperArm':[(-.26,.038,.06),(-.12,.09,.083),(.15,.088,.087),(.52,.066,.066),(.91,.052,.056),(1.15,.051,.051)],
  'Forearm':[(-.12,.051,.05),(.2,.061,.056),(.48,.05,.049),(.91,.035,.031),(1.10,.035,.032)],
  'Hand':[(-.04,.034,.030),(.33,.048,.029),(.64,.043,.025),(.83,.027,.019)],
  'Thigh':[(-.21,.081,.082),(-.035,.114,.102),(.26,.107,.107),(.61,.084,.085),(.92,.058,.062),(1.12,.052,.054)],
  'Shin':[(-.12,.054,.055),(.10,.065,.073),(.35,.073,.081),(.61,.06,.059),(.86,.046,.043),(1.08,.038,.042)],
  'Foot':[(-.28,.035,.045),(-.08,.051,.06),(.33,.054,.051),(.78,.065,.034),(1.02,.057,.026),(1.12,.031,.017)]
 }.items():tube(limb,limb+'.'+side,r)
 # Integrated fingers, not claws or separate shell gloves.
 for i in range(4):
  x=s*(.422+i*.022); y=-.023+(i-1.5)*.008
  tube('finger',('Index.' if i==0 else 'Fingers.')+side,[(0,.0115,.013),(.44,.011,.011),(.76,.009,.009),(1,.005,.006)],7,((x,y,1.075),(x+s*.012,y-.028,1.009-((i+1)%4)*.008)))
 tube('thumb','Hand.'+side,[(0,.016,.014),(.6,.012,.011),(1,.007,.007)],8,((s*.405,-.027,1.12),(s*.39,-.062,1.05)))
 for i in range(3):
  shard('UpperArm.'+side,(s*(.22+i*.028),.026*i,1.79-i*.021),(s*.72,.13,-.51),.12-i*.013,.04,[satin,obs,edge])
 for limb,base,length in [('Forearm',(.408,.01,1.31),.15),('Shin',(.196,-.025,.475),.26),('Thigh',(.184,-.044,.993),.25)]:
  shard(limb+'.'+side,(s*base[0],base[1],base[2]),(-s*.10,-.12,-1),length,.031,[satin,obs,edge])
 for i in range(7):
  z=1.28+i*.071;x=.10+i*.009
  for front in [True,False]:
   y=(-1 if front else 1)*(.081+i*.006)
   shard('Chest' if z>=1.53 else 'Spine',(s*x,y,z),(s*-.86,(-.24 if front else .23),-.55),.124+i*.010,.033,[satin,obs,edge if i%3==0 else satin],.38)
# Three separate swappable growth profiles, all bound to the same armature.
for FORM,count,sweep,height,back in [('Crown',28,.38,1.0,5),('Comet',23,1.55,.79,7),('Fault',34,.27,1.04,4)]:
 random.seed(71+count)
 for i in range(count):
  th=2*pi*i/count
  x=.095*cos(th); yy=.022+.079*sin(th); z=2.176+.033*sin(th)+random.uniform(-.020,.027)
  split=FORM=='Fault'
  if split and abs(cos(th))<.44 and sin(th)<.45:continue
  l=random.uniform(.115,.190)*height*(1.22 if split and cos(th)>.45 else 1)
  d=(cos(th)*(.96 if split else .69), sweep+.45*sin(th), .94+random.uniform(-.22,.38))
  shard('Head',(x,yy,z),d,l*.72,random.uniform(.020,.036),[obs,satin,edge])
  if i%2==0 or sin(th)>.60:
   shard('Head',(x*.92,yy+.011,z+.014),d,l*1.16,random.uniform(.013,.025),[azd,az,azl])
 for i in range(back):
  z=1.764-i*(.043 if FORM!='Fault' else .061)
  x=(.063 if FORM=='Fault' else .014)*(-1 if i%2 else 1)
  shard('Chest',(x,.097+(.029 if i>0 else 0),z),(x*4,.85,.73),(.157-i*.013)*(.83 if FORM=='Crown' else 1.10),.033-i*.002,[azd,az,azl])
  shard('Chest',(x,.106,z-.027),(x*4,.79,.31),.098-i*.005,.026,[obs,satin,edge])
for (shape,mn),(V,W) in BODY.items():
 o=obj(shape+'_'+mn,V,[(j,j+1,j+2) for j in range(0,len(V),3)],[bpy.data.materials[mn]]);bind(o,W)
# Sculpted shield as 2D UV domain on a shallow convex surface, with a physical bevel.
# q increasing upward, width tapering toward chin, textures never wrapping around back.
def front(u,q,off=0):
 s=(u-.5)*2; q2=q*2-1
 taper=.69+.30*q+.10*sin(pi*q)
 return (s*.116*taper, -.125 + .024*s*s + .016*q2*q2-off, 1.955+.244*q)
def plate(n,matn,offset,overlay=False):
 N=24;R=24; V=[front(x/N,y/R,offset) for y in range(R+1) for x in range(N+1)]
 F=[(y*(N+1)+x,y*(N+1)+x+1,(y+1)*(N+1)+x+1,(y+1)*(N+1)+x) for y in range(R) for x in range(N)]
 # Rounded shield silhouette. The material on LED_Surface is replaced by transparent runtime shader.
 if not overlay:
  outline=[(.05,1),(.95,1),(1,.90),(.985,.59),(.915,.37),(.82,.20),(.69,.075),(.56,0),(.44,0),(.31,.075),(.18,.20),(.085,.37),(.015,.59),(0,.90)]
  V=[front(.5,.53,offset)]
  for k in [.49,.81,1]:
   V.extend(front(.5+(u-.5)*k,.53+(q-.53)*k,offset if k<1 else offset-.004) for u,q in outline)
  V.extend(front(u,q,offset-.018) for u,q in outline)
  F=[(0,1+(i+1)%14,1+i) for i in range(14)]
  for k in range(3):
   F+= [(1+k*14+i,1+k*14+(i+1)%14,1+(k+1)*14+(i+1)%14,1+(k+1)*14+i) for i in range(14)]
 o=obj(n,V,F,[matn] if overlay else [matn,rim])
 if overlay:
  uv=o.data.uv_layers.new()
  for p in o.data.polygons:
   for li in p.loop_indices:
    i=o.data.loops[li].vertex_index;uv.data[li].uv=((i%(N+1))/N,(i//(N+1))/R)
 else:
  for p in o.data.polygons:
   if p.index>=42:p.material_index=1
 bind(o,['Head']*len(V))
plate('Mask_Housing',black,.003)
m=mat('Placeholder LED | transparent',(.001,.002,.004));bb=m.node_tree.nodes.get('Principled BSDF');bb.inputs['Alpha'].default_value=0
plate('LED_Surface',m,.008,True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.export_scene.gltf(filepath=D+'/assets/Shardling-Body.glb',export_format='GLB',export_animations=False,export_skins=True,export_apply=False)
# All forms remain editable; Blender opens showing only the Crown variant.
for o in bpy.data.objects:
 if o.name.startswith(('Comet_','Fault_','LED_Surface')):o.hide_set(True)
bpy.ops.wm.save_as_mainfile(filepath=D+'/assets/Shardling-Body.blend')
