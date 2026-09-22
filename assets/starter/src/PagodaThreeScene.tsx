import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createHeritageMaterials } from "./heritage/materials";
import { HeritageBuilder } from "./heritage/builder";
import { buildArchitecture, courtyard } from "./heritage/architecture";

export type DetailView="overview"|"roof"|"guardian";
type Props={progress:number;view?:DetailView;onReady?:()=>void};

export default function PagodaThreeScene({progress,view="overview",onReady}:Props){
  const mountRef=useRef<HTMLDivElement>(null);
  const progressRef=useRef(progress),viewRef=useRef(view),readyRef=useRef(onReady);
  useEffect(()=>{progressRef.current=progress;},[progress]);
  useEffect(()=>{viewRef.current=view;},[view]);
  useEffect(()=>{readyRef.current=onReady;},[onReady]);
  useEffect(()=>{
    const mount=mountRef.current;if(!mount)return;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,180);
    camera.position.set(38,22.5,57);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,window.innerWidth<700?1.5:2));
    renderer.setClearColor(0xf4f1e9,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    // Camera movement does not change a directional light's shadow map.
    renderer.shadowMap.autoUpdate=false;
    mount.appendChild(renderer.domElement);
    const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
    const environment=pmrem.fromScene(room,.06);scene.environment=environment.texture;scene.environmentIntensity=.32;
    room.dispose();pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xfaf7ef,0x706a5c,.72));
    const key=new THREE.DirectionalLight(0xfff2e2,2.4);key.position.set(-22,38,30);key.castShadow=true;
    key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-22;key.shadow.camera.right=22;
    key.shadow.camera.top=25;key.shadow.camera.bottom=-20;key.shadow.camera.near=.5;key.shadow.camera.far=100;
    key.target.position.set(0,12,0);key.shadow.normalBias=.025;key.shadow.bias=-.00015;key.shadow.radius=3;
    scene.add(key,key.target);
    const fill=new THREE.DirectionalLight(0xe5eced,.55);fill.position.set(25,18,-10);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xfff4de,.7);rim.position.set(-12,30,-24);scene.add(rim);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.target.set(0,15.35,0);controls.enableDamping=true;controls.dampingFactor=.075;
    controls.enablePan=true;controls.minDistance=12;controls.maxDistance=110;
    controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI*.51;
    const materialKit=createHeritageMaterials(renderer),builder=new HeritageBuilder(materialKit.materials);
    courtyard(builder);buildArchitecture(builder);builder.finish(scene);
    const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const presets={
      overview:{position:new THREE.Vector3(38,22.5,57),target:new THREE.Vector3(0,15.35,0)},
      roof:{position:new THREE.Vector3(16,30.3,22),target:new THREE.Vector3(0,26.9,0)},
      guardian:{position:new THREE.Vector3(8.5,12.7,17),target:new THREE.Vector3(.4,11,4.5)},
    };
    let lastView:DetailView="overview",transition=false,raf=0,lastNow=performance.now(),frames=0,elapsed=0;
    let needsFrame=true,lastProgress=-2,lastShadowProgress=-2,lastShadowTime=-Infinity;
    let renderedFrames=0,shadowUpdates=0;
    const interrupt=()=>{transition=false;};controls.addEventListener("start",interrupt);
    const resize=()=>{
      const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight);
      renderer.setSize(w,h,false);camera.aspect=w/h;
      camera.fov=camera.aspect<.58?39:34;camera.updateProjectionMatrix();
      needsFrame=true;
    };
    const ro=new ResizeObserver(resize);ro.observe(mount);resize();
    builder.progress.value=progressRef.current;
    renderer.compile(scene,camera);
    const render=(now:number)=>{
      const frameSeconds=(now-lastNow)/1000;
      const dt=Math.min(frameSeconds,.1);lastNow=now;
      builder.progress.value=progressRef.current;
      if(lastView!==viewRef.current){lastView=viewRef.current;transition=true;}
      if(transition){
        const preset=presets[lastView],amount=reducedMotion?1:1-Math.exp(-dt*5);
        camera.position.lerp(preset.position,amount);controls.target.lerp(preset.target,amount);
        if(camera.position.distanceTo(preset.position)<.02)transition=false;
      }
      const cameraChanged=controls.update();
      const progressChanged=lastProgress!==progressRef.current;
      // Limit construction shadow work to 30 Hz. Final/rewound poses flush
      // immediately, and a paused intermediate pose flushes on the next tick.
      const shadowChanged=lastShadowProgress!==progressRef.current &&
        (now-lastShadowTime>=1000/30 || progressRef.current===0 || progressRef.current===1);
      if(!document.hidden && (needsFrame || cameraChanged || transition || progressChanged || shadowChanged)){
        if(shadowChanged){
          renderer.shadowMap.needsUpdate=true;
          lastShadowProgress=progressRef.current;lastShadowTime=now;shadowUpdates++;
        }
        renderer.render(scene,camera);renderedFrames++;
        needsFrame=false;lastProgress=progressRef.current;
      }
      frames++;elapsed+=frameSeconds;
      if(elapsed>.6){
        mount.dataset.renderStats=JSON.stringify({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,pieces:builder.pieces,fps:Math.round(frames/elapsed),renderFps:Math.round(renderedFrames/elapsed),shadowUpdatesPerSecond:Math.round(shadowUpdates/elapsed),idle:renderedFrames===0,dpr:renderer.getPixelRatio(),shadowLights:1,postPasses:0});
        frames=0;elapsed=0;renderedFrames=0;shadowUpdates=0;
      }
      raf=requestAnimationFrame(render);
    };
    raf=requestAnimationFrame(render);readyRef.current?.();
    return()=>{
      cancelAnimationFrame(raf);ro.disconnect();controls.removeEventListener("start",interrupt);controls.dispose();
      builder.dispose();materialKit.dispose();environment.dispose();
      key.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();
    };
  },[]);
  return <div ref={mountRef} className="three-scene" aria-label="可旋转的三维中国古塔施工动画" />;
}
