import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { glyphs, activation, smooth, storyState } from './storyModel';
import { motionState, qualityProfile } from './motionModel';

const RED = '#ff466b', BLUE = '#48b9ff', VIOLET = '#bd79ff';
const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `
varying vec2 vUv;
uniform float uTime; uniform float uPower;
void main(){
 vec2 p=(vUv-.5)*2.; float r=length(p); float a=atan(p.y,p.x);
 float warp=sin(a*9.+r*23.-uTime*1.7)*.025+sin(a*17.-uTime)*.012;
 float ring=exp(-abs(r-.74+warp)*38.);
 float halo=exp(-abs(r-.73)*9.)*.35;
 float spiral=pow(max(0.,sin(a*6.+r*38.-uTime*2.)),14.)*.2*smoothstep(.18,.65,r)*(1.-smoothstep(.72,1.,r));
 float tunnel=(1.-smoothstep(.0,.65,r))*.12*(.6+.4*sin(r*65.-uTime));
 vec3 color=mix(vec3(.23,.025,.65),vec3(.86,.54,1.),ring);
 float alpha=(ring+halo+spiral+tunnel)*uPower*(1.-smoothstep(.92,1.,r));
 gl_FragColor=vec4(color*(1.+ring*1.2),alpha);
}`;

function makeWorld(quality) {
  const world = new THREE.Group();
  const dummy = new THREE.Object3D();
  const basic = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, opacity, toneMapped: false });
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const octa = new THREE.OctahedronGeometry(1);
  const sphere = new THREE.IcosahedronGeometry(1, 1);
  const network = new THREE.Group(); world.add(network);
  const floor = new THREE.GridHelper(36, 36, '#34254a', '#171329');
  floor.position.y = -2.5; network.add(floor);
  const cityCount = quality.city;
  const city = new THREE.InstancedMesh(cube, new THREE.MeshStandardMaterial({color:'#34344f',metalness:.55,roughness:.45,transparent:true}),cityCount);
  for(let i=0;i<cityCount;i++){
    const side=i%2 ? 1:-1; const n=Math.floor(i/2);
    const h=.3+(Math.sin(i*41.7)+1)*.7;
    dummy.position.set(side*(2.7+(n%8)*1.1),-2.5+h/2,-6+Math.floor(n/8)*1.5);
    dummy.scale.set(.55,h,.7); dummy.updateMatrix(); city.setMatrixAt(i,dummy.matrix);
  } network.add(city);
  const nodes = [], edges = [];
  const edgeShape=new THREE.EdgesGeometry(cube), haloShape=new THREE.TorusGeometry(.65,.016,5,40);
  const nodeMaterials=[RED,BLUE].map((color,i)=>new THREE.MeshStandardMaterial({color:i?'#153c60':'#511b36',emissive:color,emissiveIntensity:.32,metalness:.75,roughness:.3,transparent:true}));
  const wireMaterials=[RED,BLUE].map(color=>new THREE.LineBasicMaterial({color,transparent:true}));
  for(let i=0;i<24;i++){
    const side=i<12?-1:1, j=i%12;
    const base=new THREE.Vector3(side*(2.2+(j%4)*1.65),-1.8+((j*7)%3)*.35,-4+Math.floor(j/4)*3.3);
    const graph=new THREE.Vector3(side*(2.4+(j%3)*1.45),-1+(Math.floor(j/3)%4)*1.25,Math.sin(j)*1.2);
    const group=new THREE.Group();
    const material=nodeMaterials[side<0?0:1];
    const body=new THREE.Mesh(cube,material); body.scale.set(.48,.75,.48); group.add(body);
    const wire=new THREE.LineSegments(edgeShape,wireMaterials[side<0?0:1]); wire.scale.set(.55,.82,.55); group.add(wire);
    const beacon=new THREE.Mesh(sphere,basic(VIOLET)); beacon.position.y=.72; beacon.scale.setScalar(.12); group.add(beacon);
    const halo=new THREE.Mesh(haloShape,basic(side<0?RED:BLUE,.6));halo.rotation.x=Math.PI/2;halo.position.y=-.42;group.add(halo);
    body.material.transparent=true;wire.material.transparent=true;
    network.add(group); nodes.push({group,base,graph,body,wire,beacon,halo,side});
  }
  const points=new Float32Array(72*6); const colors=new Float32Array(72*6);
  for(let i=0;i<24;i++){
    if(i%12<11)edges.push([i,i+1]);
    if(i%12<8)edges.push([i,i+4]);
  }
  const lineGeometry=new THREE.BufferGeometry(); lineGeometry.setAttribute('position',new THREE.BufferAttribute(points,3)); lineGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  lineGeometry.setDrawRange(0,edges.length*2);
  const paths=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.65})); paths.frustumCulled=false; network.add(paths);
  const streams=new THREE.InstancedMesh(sphere,basic('#ffffff'),quality.pulses);
  streams.instanceMatrix.setUsage(THREE.DynamicDrawUsage);streams.frustumCulled=false;
  for(let i=0;i<quality.pulses;i++)streams.setColorAt(i,new THREE.Color(i%2?BLUE:RED));
  network.add(streams);
  const bridgeGeometry=new THREE.BufferGeometry();bridgeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12*6),3));
  const bridges=new THREE.LineSegments(bridgeGeometry,new THREE.LineBasicMaterial({color:VIOLET,transparent:true,opacity:.7}));bridges.frustumCulled=false;network.add(bridges);
  const core = new THREE.Group(); world.add(core);
  const heart=new THREE.Mesh(octa,new THREE.MeshStandardMaterial({color:'#bfa1ff',emissive:'#8a30ff',emissiveIntensity:1.5,metalness:.65,roughness:.18}));heart.scale.set(.65,1.4,.65);core.add(heart);
  const inner=new THREE.Mesh(new THREE.TorusKnotGeometry(.58,.035,96,6,3,5),basic('#eee3ff'));core.add(inner);
  const shells=[];
  for(let i=0;i<3;i++){
    const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35+i*.25,0),new THREE.MeshBasicMaterial({color:i%2?'#cbb6ff':'#7842d6',wireframe:true,transparent:true,opacity:.4,toneMapped:false}));core.add(shell);shells.push(shell);
  }
  const blades=[];
  const bladeMaterial=new THREE.MeshStandardMaterial({color:'#44365e',emissive:'#8944e0',emissiveIntensity:.35,metalness:.85,roughness:.25});
  for(let i=0;i<12;i++){
    const blade=new THREE.Mesh(octa,bladeMaterial);core.add(blade);blades.push(blade);
  }
  const coreLight=new THREE.PointLight('#af59ff',24,14,2);core.add(coreLight);
  const portal=new THREE.Group();world.add(portal);
  const portalMat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{uTime:{value:0},uPower:{value:1}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const disc=new THREE.Mesh(new THREE.PlaneGeometry(10,10),portalMat);portal.add(disc);
  const rings=[];
  for(let i=0;i<8;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.35-i*.18,.018+(i%2)*.016,6,quality.segments,Math.PI*(1.5+i*.03)),basic(i%2?'#9041ff':'#dba4ff',.75-i*.065));
    ring.position.z=-i*.4;portal.add(ring);rings.push(ring);
  }
  const flecks=new THREE.InstancedMesh(octa,basic('#ffffff',.9),quality.fragments);
  flecks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);flecks.frustumCulled=false;world.add(flecks);
  const fragmentOrigins=Array.from({length:quality.fragments},(_,i)=>({a:i*2.39996,sin:Math.sin(i*2.39996),cos:Math.cos(i*2.39996)}));
  let fragmentPalette=-1;
  const components=glyphs.map((glyph,index)=>{
    const destinations=[];
    glyph.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')destinations.push(new THREE.Vector3((x-2)*.26,(3-y)*.26,0));}));
    const mesh=new THREE.InstancedMesh(cube,basic('#baa4d8'),destinations.length);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;world.add(mesh);
    const origins=destinations.map((_,j)=>{const theta=j*2.39996,r=.16+Math.sqrt(j)*.08;return {theta,point:new THREE.Vector3(Math.cos(theta)*r,Math.sin(theta)*r,Math.cos(theta*2)*.3)};});
    return {mesh,destinations,origins,index};
  });
  const node=new THREE.Mesh(sphere,basic('#ddbcff'));world.add(node);
  const selection=new THREE.Mesh(new THREE.TorusGeometry(.9,.03,6,64),basic('#f8bf76'));world.add(selection);
  const redColor=new THREE.Color(RED),blueColor=new THREE.Color(BLUE),violetColor=new THREE.Color(VIOLET);
  const center=new THREE.Vector3(), temp=new THREE.Vector3();
  const dimColor=new THREE.Color('#5e4c78'),litColor=new THREE.Color('#ddc0ff');
  const materials=new Set();core.traverse(o=>{if(o.material){o.material.transparent=true;materials.add(o.material);o.material.userData.baseOpacity=o.material.opacity;}});
  blades.forEach((b,i)=>{const a=i*Math.PI/6;b.position.set(Math.cos(a)*1.45,Math.sin(a)*1.8,Math.sin(a*2)*.55);b.scale.set(.12,.65,.2);b.rotation.z=-a;});
  edges.forEach(([a],i)=>{const c=a<12?redColor:blueColor;c.toArray(colors,i*6);c.toArray(colors,i*6+3);});
  lineGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  bridgeGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  let lastPosition=NaN;
  function update(p,time,selected,outcome) {
    const s=storyState(p), motion=motionState(p,s), departure=smooth(7.65,8.25,p), end=s.handoff;
    network.visible=motion.network>.001;
    network.scale.setScalar((1-s.darkness*.4)*(1-smooth(8.4,9,p)*(1-end)*.99));
    city.scale.y=1-s.evidence*.85;city.material.opacity=motion.network;
    floor.material.opacity=.28*motion.network;floor.material.transparent=true;
    nodes.forEach((n,i)=>{
      n.group.position.copy(n.base).lerp(n.graph,s.evidence);
      n.group.position.x+=n.side*s.fragment*(1.6+Math.sin(i*2)*.6);
      n.group.position.y+=s.fragment*Math.sin(i*3)*1.3;
      n.group.rotation.z=s.fragment*Math.sin(i)*.4;
      n.body.scale.y=.75-s.evidence*.3;
      n.body.material.opacity=motion.network;n.wire.material.opacity=motion.network;n.halo.material.opacity=.6*motion.network;
      n.beacon.visible=i%3===0;n.beacon.material.opacity=motion.beacon*motion.network;
      n.halo.scale.setScalar(1+Math.sin(time*1.8+i)*.06);
      n.beacon.material.color.set(outcome==='Verified Resolved' && i===(selected===1?15:3)?'#80edc1':VIOLET);
      if(p>9){n.group.position.multiplyScalar(.45+end*.55);n.group.position.y-=1;}
    });
    if(p!==lastPosition){edges.forEach(([a,b],i)=>{
      const pa=nodes[a].group.position,pb=nodes[b].group.position;
      temp.copy(pb).lerp(pa,s.fragment*.65);
      pa.toArray(points,i*6);temp.toArray(points,i*6+3);
    });
    lineGeometry.attributes.position.needsUpdate=true;}
    paths.material.opacity=motion.network*(.45+s.evidence*.3);
    streams.visible=motion.signals>.001;streams.material.opacity=motion.signals*motion.network;
    if(network.visible&&streams.visible){for(let i=0;i<quality.pulses;i++){
      const [a,b]=edges[(i*3)%edges.length], t=(time*(i%2?-.15:.22)+i*.17+100)%1;
      dummy.position.copy(nodes[a].group.position).lerp(nodes[b].group.position,t*(1-s.fragment*.65));
      dummy.rotation.set(0,0,0);dummy.scale.setScalar((i%2?.075:.055)*Math.sin(Math.PI*t));
      dummy.updateMatrix();streams.setMatrixAt(i,dummy.matrix);
    }streams.instanceMatrix.needsUpdate=true;}
    bridges.visible=motion.bridge>.001;bridges.material.opacity=.7*motion.bridge*motion.network;
    const bp=bridgeGeometry.attributes.position;
    if(p!==lastPosition){for(let i=0;i<12;i++){
      const target=nodes[i*2].group.position;
      bp.setXYZ(i*2,0,1.4,0);bp.setXYZ(i*2+1,target.x*s.approved,target.y*s.approved,target.z*s.approved);
    }bp.needsUpdate=true;}
    core.visible=s.core>.005;core.position.set(0,1.65+Math.sin(time*.55)*.07*s.core,departure*-5);
    core.scale.setScalar(s.core);core.rotation.y=p*.65+time*.08;
    heart.rotation.y=time*.25;inner.rotation.set(time*.17,p,time*.12);
    shells.forEach((sh,i)=>sh.rotation.set(p*.25+i,time*.1*(i%2?1:-1),i+p*.14));
    materials.forEach(m=>{m.opacity=m.userData.baseOpacity*s.core;});
    coreLight.intensity=(23+Math.sin(time*.7))*s.core;
    portal.visible=s.portal>.002;portal.position.set(0,1.7,-2.3);portal.scale.setScalar(Math.max(.001,s.portal));portal.rotation.y=Math.sin(p)*.12;
    portalMat.uniforms.uTime.value=time+p*3;portalMat.uniforms.uPower.value=Math.min(1,s.portal*2);
    rings.forEach((r,i)=>{r.rotation.z=time*(i%2?.12:-.13)+i*.8+p*.35;r.rotation.y=Math.sin(i+p)*.08;});
    flecks.visible=motion.fragments>.001;flecks.material.opacity=.9*Math.min(1,motion.fragments);
    const palette=p<3?0:1;
    if(fragmentPalette!==palette){for(let i=0;i<quality.fragments;i++)flecks.setColorAt(i,palette?(i%3===0?redColor:i%3===1?blueColor:violetColor):(i%2?redColor:blueColor));flecks.instanceColor.needsUpdate=true;fragmentPalette=palette;}
    if(flecks.visible){for(let i=0;i<quality.fragments;i++){
      const {a,sin,cos}=fragmentOrigins[i],travel=(time*.12+i*.018)%1,radius=8-travel*6;
      if(p>=3){dummy.position.set(cos*radius,1.7+sin*radius*.65,3-travel*5);dummy.scale.setScalar((.03+s.portal*.05)*Math.sin(Math.PI*travel));}
      else{dummy.position.set((i%2?1:-1)*(1.1+(i%5)*.3+s.fragment),sin*2.4,(i%7)-3);dummy.scale.set(.06,.15,.04);}
      dummy.rotation.set(a+time*.1,a,0);dummy.updateMatrix();flecks.setMatrixAt(i,dummy.matrix);
    }flecks.instanceMatrix.needsUpdate=true;}
    components.forEach(({mesh,destinations,origins,index})=>{
      const presence=smooth(3.45,3.85,p)*(1-end);mesh.visible=presence>.001;mesh.material.opacity=presence;
      if(!mesh.visible)return;
      const a=index*Math.PI/3+p*.28;
      center.set(Math.cos(a)*2.8,1.65+Math.sin(a)*2.4,Math.sin(a)*.7);
      temp.set((index-2.5)*1.65,1.5,0);center.lerp(temp,s.word);
      center.multiplyScalar(1-end*.85);
      mesh.material.color.copy(dimColor).lerp(litColor,smooth(activation[index]-.06,activation[index]+.16,p));
      destinations.forEach((dest,j)=>{
        const {theta,point}=origins[j];
        dummy.position.copy(point).lerp(dest,s.word).add(center);
        dummy.rotation.set((1-s.word)*theta,(1-s.word)*(time*.15+theta),0);
        dummy.scale.setScalar((.1+(s.word*.12))*(1-end)*smooth(3.45,3.85,p));dummy.updateMatrix();mesh.setMatrixAt(j,dummy.matrix);
      });mesh.instanceMatrix.needsUpdate=true;
    });
    node.visible=motion.seed>.001;node.material.opacity=motion.seed;node.position.set(0,1.4-2*s.word*(1-end),0);node.scale.setScalar(p<4?.035+smooth(3,3.5,p)*.12:.075+end*.25);
    selection.visible=motion.selection>.001;selection.material.opacity=motion.selection;
    selection.position.copy(nodes[selected===1?15:3].group.position);selection.rotation.set(0,0,time*.15);
    selection.material.color.set(outcome==='Verified Resolved'?'#80edc1':outcome==='Inconclusive'?'#e1c3ff':'#ffb56f');
    lastPosition=p;return s;
  }
  function dispose(){const geos=new Set(),mats=new Set();world.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material){for(const material of (Array.isArray(o.material)?o.material:[o.material]))mats.add(material);}if(o.isInstancedMesh)o.dispose();});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
  return {world,update,dispose};
}

function World({ timeline, paused, mobile, quality, selection, outcome, onReady, onFailure }) {
  const { gl, camera, invalidate, size, setDpr }=useThree();
  const scene=useMemo(()=>makeWorld(quality),[quality]);
  const time=useRef(0),previous=useRef({p:NaN,width:0,height:0,chapter:-1,active:-1,portal:null,core:null});
  const budget=useRef({frames:0,total:0,slow:0,steps:0});
  const ambient=useRef(),redLight=useRef(),blueLight=useRef();
  useEffect(()=>{onReady();const lost=e=>{e.preventDefault();onFailure();};gl.domElement.addEventListener('webglcontextlost',lost);return()=>{gl.domElement.removeEventListener('webglcontextlost',lost);scene.dispose();};},[scene,gl,onReady,onFailure]);
  useEffect(()=>{ timeline.current.invalidate=invalidate;invalidate();return()=>{timeline.current.invalidate=null;};},[invalidate,timeline]);
  useEffect(()=>{invalidate();},[paused,selection,outcome,invalidate]);
  useFrame((_,delta)=>{
    const p=timeline.current.p,active=!paused&&!document.hidden;
    // Ease ambient velocity into silence without changing scroll-driven transforms.
    const quiet=smooth(1.8,2.2,p)*(1-smooth(2.85,3.2,p));
    if(active)time.current+=Math.min(delta,.05)*(1-quiet);
    const s=scene.update(p,time.current,selection,outcome),last=previous.current;
    if(last.p!==p||last.width!==size.width||last.height!==size.height){
      const portalView=smooth(2.9,3.65,p)*(1-smooth(4.05,4.85,p));
      const graph=s.evidence,word=s.word*(1-s.handoff);
      const height=8-portalView*5-graph*4.5-word*6.5+s.darkness*7;
      const depth=18-portalView*4-graph*1.5+word*2+s.darkness*9;
      camera.position.set(Math.sin(p*.65)*1.5*(1-word),height,mobile?depth*1.2:depth);
      camera.zoom=1+(mobile?portalView*.3+word*.65:0);
      // Reframe optically; never resize the WebGL drawing buffer while scrolling.
      const offset=mobile?0:.145*(1-smooth(7.9,8.5,p))+.21*s.handoff;
      camera.setViewOffset(size.width,size.height,-offset*size.width,0,size.width,size.height);
      camera.lookAt(0,1.1+portalView*.7,0);camera.updateMatrixWorld();
      ambient.current.intensity=.15+.5*(1-s.darkness);
      redLight.current.intensity=blueLight.current.intensity=30*(1-s.darkness);
      last.p=p;last.width=size.width;last.height=size.height;
      gl.domElement.dataset.progress=p.toFixed(4);
    }
    for(const key of ['chapter','active','portal','core']){
      const value=key==='portal'||key==='core'?s[key]>.1:s[key];
      if(last[key]!==value){gl.domElement.dataset[key==='chapter'?'scene':key]=String(value);last[key]=value;}
    }
    // Sustained slow frames reduce only pixel density, never essential scene content.
    const b=budget.current;
    if(active&&delta>0&&delta<.25&&quiet<1){
      b.frames++;b.total+=delta;if(delta>.034)b.slow++;
      if(b.frames===120){
        if(b.total/120>.029&&b.slow>40&&b.steps<2){const dpr=Math.max(.75,gl.getPixelRatio()-.25);setDpr(dpr);b.steps++;}
        b.frames=b.total=b.slow=0;
        gl.domElement.dataset.dpr=String(gl.getPixelRatio());
      }
    }
    if(active&&quiet<1)invalidate();
  });
  return <><PerspectiveCamera makeDefault fov={mobile?52:46} position={[0,8,18]} /><ambientLight ref={ambient} intensity={.65}/><directionalLight position={[2,9,6]} intensity={2} color="#bdcaff"/><pointLight ref={redLight} position={[-7,2,0]} color={RED} intensity={30}/><pointLight ref={blueLight} position={[7,2,0]} color={BLUE} intensity={30}/><primitive object={scene.world} dispose={null}/></>;
}
export default function StoryWorld(props) {
  const width=useThreeWidth();
  const name=qualityProfile(width,{cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory,saveData:navigator.connection?.saveData}).name;
  const quality=useMemo(()=>qualityProfile(width,{cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory,saveData:navigator.connection?.saveData}),[name]);
  return <Canvas frameloop="demand" dpr={Math.min(devicePixelRatio,quality.dpr)} gl={{antialias:!props.mobile&&quality.name!=='economy',alpha:true,powerPreference:'high-performance'}} fallback={<p>3D unavailable. The complete text experience is below.</p>} onCreated={({gl})=>{gl.setClearColor('#070610',0);gl.domElement.dataset.quality=quality.name;}}><World {...props} quality={quality}/></Canvas>;
}
function useThreeWidth(){
  // Geometry profiles change only at actual device-layout boundaries.
  const [width,setWidth]=React.useState(innerWidth);
  useEffect(()=>{let frame;const resize=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>setWidth(innerWidth));};addEventListener('resize',resize);return()=>{removeEventListener('resize',resize);cancelAnimationFrame(frame);};},[]);
  return width;
}
