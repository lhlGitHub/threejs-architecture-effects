import * as THREE from "three";
import { HeritageBuilder, type Point } from "./builder";

const TAU=Math.PI*2;
const variation=(n:number)=>{const v=Math.sin(n*127.1+31.7)*43758.5453;return v-Math.floor(v);};
function surfaceGrid(nx:number,ny:number,point:(u:number,v:number)=>Point,uvMap?:(u:number,v:number)=>[number,number]){
  const p:number[]=[],uv:number[]=[],idx:number[]=[];
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    const u=i/nx,v=j/ny;p.push(...point(u,v));uv.push(...(uvMap?uvMap(u,v):[u,v]));
  }
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);
  }
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(p,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
const facePoint=(x:number,y:number,z:number,angle:number):Point=>[x*Math.cos(angle)+z*Math.sin(angle),y,z*Math.cos(angle)-x*Math.sin(angle)];

export function roof(b:HeritageBuilder,y:number,outer:number,inner:number,height:number,start:number){
  const profile=(x:number,z:number)=>{
    const t=(z-inner)/(outer-inner);
    return height*Math.pow(1-t,1.75)+.2*Math.pow(t,5)+.85*Math.pow(Math.abs(x)/outer,8)*Math.pow(t,3);
  };
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    // Continuous roof boards: no intersecting flat slabs at the hips.
    const deck=surfaceGrid(28,18,(u,v)=>{const z=inner+v*(outer-inner),x=(u*2-1)*z;return facePoint(x,y+profile(x,z)-.045,z,a);});
    b.add(deck,"tile",start,{duration:.025,lift:.35});deck.dispose();
    // Closed, shaded soffit and fascia give the eave physical thickness.
    const soffit=surfaceGrid(20,10,(u,v)=>{const z=inner+v*(outer-inner),x=(u*2-1)*z;return facePoint(x,y+profile(x,z)-.24,z,a);});
    const si=soffit.index!;for(let n=0;n<si.count;n+=3){const tmp=si.getX(n+1);si.setX(n+1,si.getX(n+2));si.setX(n+2,tmp);}soffit.computeVertexNormals();
    b.add(soffit,"wood",start,{shade:.79,lift:.35});soffit.dispose();
    const fascia=surfaceGrid(32,1,(u,v)=>{const x=(u*2-1)*outer;return facePoint(x,y+profile(x,outer)-.24+v*.23,outer,a);});
    b.add(fascia,"jade",start+.005,{shade:.8,lift:.35});fascia.dispose();
    for(let j=0;j<22;j++){
      const x=(j/21-.5)*outer*1.87,z0=Math.max(inner,Math.abs(x)+.1);
      if(z0>=outer-.2)continue;
      const pts:Point[]=[];
      for(let k=0;k<6;k++){const z=z0+(outer-z0)*k/5;pts.push(facePoint(x,y+profile(x,z)-.32,z,a));}
      b.tube(pts,.075,"wood",start,{shade:.9,duration:.022},8);
    }
    for(const t of [.24,.57,.88]){
      const z=inner+(outer-inner)*t,pts:Point[]=[];
      for(let k=0;k<12;k++){const x=(k/11*2-1)*z;pts.push(facePoint(x,y+profile(x,z)-.43,z,a));}
      b.tube(pts,.105,"wood",start,{shade:.83},12);
    }
    // Actual overlapping curved ceramic shells, parallel from eave to ridge.
    const spacing=.29;
    for(let i=0;i<=Math.floor(outer*2/spacing);i++){
      const x=-outer+i*spacing;
      const z0=Math.max(inner,Math.abs(x)+.055);
      const count=Math.max(1,Math.ceil((outer-z0)/.52));
      for(let row=0;row<count;row++){
        const seed=i*13+row*47+side*109+y*7;
        const front=outer-row*.52,back=Math.max(z0,front-.56-(variation(seed)-.5)*.024);
        if(back>=front-.035)continue;
        const tile=surfaceGrid(5,2,(u,v)=>{
          const theta=(1-u)*Math.PI,z=back+(front-back)*v;
          const xx=x+Math.cos(theta)*(.145+(variation(seed+4)-.5)*.006)+(v-.5)*(variation(seed+8)-.5)*.014;
          return facePoint(xx,y+profile(xx,z)+Math.sin(theta)*(.12+(variation(seed+2)-.5)*.008)+.025,z,a);
        });
        b.add(tile,"tile",start+.014+row*.003+i*.00012,{shade:.9+variation(seed)*.16,tint:[.96+variation(seed+1)*.08,.98+variation(seed+2)*.04,.96+variation(seed+3)*.09],duration:.016,lift:.22});tile.dispose();
      }
      if(Math.abs(x)<outer-.12){
        const yy=y+profile(x,outer);
        const disk=new THREE.CylinderGeometry(.139,.139,.06,12);disk.rotateX(Math.PI/2);
        b.add(disk,"tile",start+.049,{p:facePoint(x,yy+.045,outer+.025,a),r:[0,a,0],shade:1.1});disk.dispose();
        // A shallow raised central boss on each circular tile end.
        b.sphere(facePoint(x,yy+.045,outer+.068,a),[.043,.043,.022],"stone",start+.052,{r:[0,a,0],shade:.73});
        const lip=new THREE.TorusGeometry(.105,.012,4,12);
        b.add(lip,"jade",start+.052,{p:facePoint(x,yy+.045,outer+.062,a),r:[0,a,0],shade:.88});lip.dispose();
        if(i%2===0){
          const drop=new THREE.Shape();drop.moveTo(-.1,0);drop.lineTo(.1,0);drop.quadraticCurveTo(.095,-.13,0,-.18);drop.quadraticCurveTo(-.095,-.13,-.1,0);
          const dg=new THREE.ExtrudeGeometry(drop,{depth:.035,bevelEnabled:false,curveSegments:3});
          b.add(dg,"jade",start+.053,{p:facePoint(x+.145,yy-.035,outer,a),r:[0,a,0],shade:.86});dg.dispose();
        }
      }
    }
    // Three nested fascia courses follow the rising eave exactly.
    for(let layer=0;layer<3;layer++){
      const points:Point[]=[];
      for(let i=0;i<=32;i++){const x=-outer+2*outer*i/32;points.push(facePoint(x,y+profile(x,outer)-.15-layer*.12,outer-.07*layer,a));}
      b.tube(points,layer===1?.043:.092,layer===1?"bronze":"jade",start+.043,{lift:.3},40);
    }
    // Carved rafter ends, set back beneath the tile ends.
    for(let i=0;i<38;i++){
      const x=(i/37-.5)*outer*1.92;
      b.box([.14,.15,.85],facePoint(x,y+profile(x,outer)-.36,outer-.42,a),"wood",start+.01,{r:[0,a,0],shade:i%2?.96:1.08});
      b.box([.11,.11,.035],facePoint(x,y+profile(x,outer)-.36,outer+.02,a),"stone",start+.032,{r:[0,a,0],shade:.85});
    }
    // Swept hip ridges and strongly lifted terminal beasts.
    const ridge:Point[]=[];
    for(let i=0;i<=18;i++){const z=inner+(outer-inner)*i/18;ridge.push(facePoint(z,y+profile(z,z)+.13,z,a));}
    b.tube(ridge,.15,"tile",start+.065,{lift:.3},28);
    // Overlapping saddle tiles interrupt the otherwise pipe-like hip ridge.
    for(let j=1;j<Math.floor((outer-inner)/.55);j++){
      const z=inner+j*.55,points:Point[]=[];
      for(let k=0;k<=8;k++){
        const t=k/8*Math.PI,dx=Math.cos(t)*.153;
        points.push(facePoint(z+dx,y+profile(z,z)+.13+Math.sin(t)*.155,z-dx,a));
      }
      b.tube(points,.021,"jade",start+.066,{shade:.82+variation(j)*.12},8);
    }
    const corner=facePoint(outer,y+1.16,outer,a);
    const flourish:Point[]=[facePoint(outer-.65,y+.64,outer-.65,a),corner,facePoint(outer+.22,y+1.78,outer+.22,a),facePoint(outer-.04,y+1.86,outer-.04,a)];
    b.tube(flourish,.115,"jade",start+.071,{lift:.25},18);
    for(let beast=0;beast<3;beast++){
      const z=outer-.75-beast*.48,yy=y+profile(z,z)+.26;
      b.sphere(facePoint(z,yy,z,a),[.11,.21,.14],"tile",start+.069+beast*.002);
      b.sphere(facePoint(z,yy+.22,z+.05,a),[.105,.09,.12],"tile",start+.07+beast*.002);
    }
    const bellPos=facePoint(outer-.12,y+.38,outer-.12,a);
    b.cylinder(.018,.018,.54,bellPos,"bronze",start+.077);
    b.cylinder(.095,.19,.25,[bellPos[0],bellPos[1]-.35,bellPos[2]],"bronze",start+.079);
    b.sphere([bellPos[0],bellPos[1]-.49,bellPos[2]],[.045,.065,.045],"bronze",start+.08);
    const rim=new THREE.TorusGeometry(.183,.017,4,12);rim.rotateX(Math.PI/2);
    b.add(rim,"bronze",start+.08,{p:[bellPos[0],bellPos[1]-.475,bellPos[2]]});rim.dispose();
  }
  // Closed ridge cap, never exposed scaffolding on the finished roof.
  b.box([inner*2+.12,.15,inner*2+.12],[0,y+height+.01,0],"tile",start+.068);
}

export function bracketBand(b:HeritageBuilder,y:number,r:number,start:number){
  // A cloud-shaped arm with a concave underside and slightly raised tips.
  const outline=new THREE.Shape();
  outline.moveTo(-.65,.13);outline.lineTo(.65,.13);outline.lineTo(.59,-.02);
  outline.bezierCurveTo(.36,-.03,.33,-.22,.12,-.23);outline.lineTo(-.12,-.23);
  outline.bezierCurveTo(-.33,-.22,-.36,-.03,-.59,-.02);outline.closePath();
  const arm=new THREE.ExtrudeGeometry(outline,{depth:.22,bevelEnabled:true,bevelThickness:.018,bevelSize:.02,bevelSegments:1,steps:1,curveSegments:6});arm.translate(0,0,-.11);
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    b.box([r*2+.45,.3,.45],facePoint(0,y,r,a),"wood",start,{r:[0,a,0]});
    for(let i=-4;i<=4;i++){
      const along=i*r/4.4;
      b.box([.33,.3,.42],facePoint(along,y-.64,r,a),"brick",start+.002,{r:[0,a,0]});
      for(let level=0;level<3;level++){
        const z=r+.12+level*.2,yy=y-.46+level*.22;
        b.add(arm,"jade",start+.005+level*.005,{p:facePoint(along,yy,z,a),r:[0,a,0],s:[.7+level*.22,1,1]});
        b.add(arm,"jade",start+.006+level*.005,{p:facePoint(along,yy+.1,z,a),r:[0,a+Math.PI/2,0],s:[.75+level*.2,1,1]});
        for(const sign of [-1,1])b.box([.17,.16,.19],facePoint(along+sign*(.28+level*.1),yy+.17,z,a),"brick",start+.009+level*.005,{r:[0,a,0],shade:.85});
      }
    }
    // Painted continuous beam under the rafters.
    b.box([r*2+.7,.2,.25],facePoint(0,y+.3,r+.55,a),"jade",start+.025,{r:[0,a,0]});
    b.box([r*2+.6,.034,.025],facePoint(0,y+.32,r+.69,a),"bronze",start+.028,{r:[0,a,0]});
    for(let i=-6;i<=6;i++){
      b.box([.39,.105,.03],facePoint(i*r/6.6,y+.04,r+.245,a),"jade",start+.023,{r:[0,a,0],shade:1.07});
    }
  }arm.dispose();
}

function railing(b:HeritageBuilder,y:number,r:number,start:number){
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    for(const h of [0,.37,.95])b.box([r*2+.18,.1,.16],facePoint(0,y+h,r,a),"wood",start+h*.004,{r:[0,a,0]});
    for(let i=-6;i<=6;i++){
      const x=i*r/6;
      b.box([.13,1.08,.14],facePoint(x,y+.47,r,a),"wood",start+.008,{r:[0,a,0]});
      for(const h of [.05,.9]){
        b.box([.19,.12,.2],facePoint(x,y+h,r,a),"wood",start+.009,{r:[0,a,0],shade:.88});
        b.sphere(facePoint(x,y+h,r+.105,a),[.021,.021,.009],"wood",start+.01,{r:[0,a,0],shade:.66});
      }
      b.cylinder(.09,.1,.065,facePoint(x,y+1.04,r,a),"bronze",start+.012);
      if(i<6){
        const cx=x+r/12;
        for(const sign of [-1,1])b.box([.052,.58,.065],facePoint(cx,y+.64,r,a),"wood",start+.013,{r:[0,a,sign*.69]});
        b.box([r/6-.18,.065,.065],facePoint(cx,y+.21,r,a),"jade",start+.014,{r:[0,a,0]});
      }
    }
  }
}

export function guardian(b:HeritageBuilder,center:Point,rotation:number,start:number,scale=1.3){
  const point=(x:number,y:number,z:number):Point=>{const p=facePoint(x*scale,y*scale,z*scale,rotation);return[p[0]+center[0],p[1]+center[1],p[2]+center[2]];};
  const ell=(p:Point,s:Point,m:"stone"|"recess"="stone",shade=1)=>b.sphere(point(...p),s.map(v=>v*scale)as Point,m,start,{r:[0,rotation,0],shade});
  // Sumeru pedestal, inset waist, lotus mouldings and relief medallion.
  for(const [w,h,d,y]of[[1.4,.16,1.25,.08],[1.24,.1,1.12,.21],[1.02,.3,.93,.4],[1.27,.1,1.14,.6]])b.box([w*scale,h*scale,d*scale],point(0,y,0),"stone",start,{r:[0,rotation,0],shade:.92});
  for(let j=-3;j<=3;j++){
    ell([j*.15,.24,.555],[.065,.035,.02],"stone",.83);
    ell([j*.15,.56,.575],[.055,.026,.018],"stone",1.03);
  }
  ell([0,1.2,-.14],[.45,.63,.38]);ell([0,1.35,.17],[.43,.6,.31]);
  ell([0,1.97,.08],[.51,.48,.42]);
  // Sculpted spirals on cheeks, crown and shoulders, not a single doughnut mane.
  for(let ring=0;ring<3;ring++)for(let i=0;i<11;i++){
    const a=(i/11)*TAU+ring*.24;
    const x=Math.cos(a)*(.43+ring*.015),yy=1.99+Math.sin(a)*.43,z=.04-ring*.12;
    const pts:Point[]=[];
    for(let k=0;k<=13;k++){const t=k/13,rr=.105*(1-t*.83),th=t*TAU*1.38;pts.push(point(x+Math.cos(th)*rr,yy+Math.sin(th)*rr,z+.31));}
    b.tube(pts,.028*scale,"stone",start,{shade:.92},14);
  }
  ell([0,1.78,.45],[.3,.19,.22]);ell([0,1.69,.52],[.22,.075,.12],"recess");
  ell([0,1.59,.44],[.26,.08,.18]);ell([0,1.89,.58],[.15,.09,.095],"stone",.69);
  for(const sign of [-1,1]){
    ell([sign*.39,2.24,-.03],[.17,.23,.095]);ell([sign*.39,2.25,.04],[.09,.13,.032],"stone",.72);
    ell([sign*.195,2.03,.432],[.112,.081,.035],"recess");ell([sign*.193,2.038,.46],[.045,.047,.026],"stone",.8);
    b.tube([point(sign*.065,2.09,.47),point(sign*.16,2.16,.49),point(sign*.31,2.18,.4)],.052*scale,"stone",start,{},12);
    ell([sign*.32,1.89,.37],[.16,.19,.13]);
    ell([sign*.29,1.02,.27],[.14,.5,.16]);ell([sign*.3,.7,.44],[.25,.125,.29]);
    ell([sign*.37,.92,-.28],[.28,.32,.29]);
    for(let toe=0;toe<3;toe++){
      ell([sign*.3+(toe-1)*.12,.69,.65],[.061,.062,.1]);
      b.tube([point(sign*.3+(toe-1)*.12-.037,.76,.48),point(sign*.3+(toe-1)*.12-.037,.75,.64)],.009*scale,"recess",start,{},3);
    }
    b.cylinder(.035,.009,.16*scale,point(sign*.13,1.72,.62),"stone",start);
    for(let j=0;j<3;j++)b.tube([point(sign*.14,1.84-j*.055,.54),point(sign*.32,1.83-j*.065,.53),point(sign*.39,1.92-j*.055,.44)],.014*scale,"stone",start,{shade:.72},10);
  }
  b.tube([point(.1,1.03,-.43),point(.55,1.19,-.38),point(.62,1.52,-.25),point(.46,1.62,-.2),point(.43,1.46,-.19)],.085*scale,"stone",start,{},18);
  // Collar, bell and embroidered ball distinguish a ceremonial guardian.
  const collar:Point[]=[];for(let i=0;i<=18;i++){const a=i/18*Math.PI;collar.push(point(Math.cos(a)*.35,1.44-Math.sin(a)*.17,.4));}
  b.tube(collar,.025*scale,"stone",start);ell([0,1.16,.43],[.085,.11,.06]);
  ell([-.33,.75,.65],[.16,.16,.16]);
}

function shaft(b:HeritageBuilder){
  const base=13.52,h=8.5,rows=34;
  for(let row=0;row<rows;row++){
    const v0=row/rows,v1=(row+1)/rows;
    for(let side=0;side<4;side++){
      const a=side*Math.PI/2;
      // The exact same slope and UVs on adjacent courses eliminate striping.
      const g=surfaceGrid(1,1,(u,v)=>{
        const t=THREE.MathUtils.lerp(v0,v1,v),r=4.25-t*.97;
        return facePoint((u*2-1)*r,base+t*h,r,a);
      },(u,v)=>[side%2?1-u:u,THREE.MathUtils.lerp(v0,v1,v)]);
      const indices=g.index!;
      for(let i=0;i<indices.count;i+=3){const v=indices.getX(i+1);indices.setX(i+1,indices.getX(i+2));indices.setX(i+2,v);}
      g.computeVertexNormals();
      b.add(g,"plaster",.606+row*.0048,{duration:.012,lift:.28});g.dispose();
    }
  }
  // Fine recessed vents, built after the wall courses reach them.
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2,r=3.72;
    b.box([.39,.57,.025],facePoint(0,18.25,r,a),"recess",.72,{r:[0,a,0]});
    for(const sign of [-1,1])b.box([.045,.66,.08],facePoint(sign*.23,18.25,r+.03,a),"stone",.724,{r:[0,a,0]});
    for(const h of [-.33,.33])b.box([.5,.055,.09],facePoint(0,18.25+h,r+.03,a),"stone",.724,{r:[0,a,0]});
  }
}

export function buildArchitecture(b:HeritageBuilder){
  // Ashlar footing and true masonry courses with a continuous arched opening.
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    for(let row=0;row<3;row++)for(let col=0;col<11;col++){
      const x=-5.05+col*1.01;
      if(Math.abs(x)<1.35)continue;
      b.box([.992,.29,.64],facePoint(x,.2+row*.3,5.25,a),"stone",.009+row*.012+col*.0007,{r:[0,a,0],shade:.91+(col%4)*.02});
    }
    for(let row=0;row<24;row++){
      const y=1.03+row*.274;
      const opening=y<4.7?1.82:y<6.48?Math.sqrt(Math.max(0,1.78**2-(y-4.7)**2))+.15:0;
      for(const sign of [-1,1]){
        const width=5.35-opening;
        b.box([width,.274,.5],facePoint(sign*(opening+width/2),y,5.2,a),"brick",.11+row*.0062,{r:[0,a,0],shade:.65,lift:.3,duration:.009});
      }
      for(let col=0;col<16;col++){
        const x=-5.1+col*.675+(row%2)*.31;
        if(x>5.23)continue;
        const gap=y<4.7?1.42:y<6.12?Math.sqrt(Math.max(0,1.42**2-(y-4.7)**2)):0;
        if(Math.abs(x)<gap+.21)continue;
        b.box([.657,.265,.56],facePoint(x,y,5.23,a),"brick",.11+row*.0062+col*.00023,{r:[0,a,0],shade:.94+((row*7+col*3)%11)*.009,lift:.3,duration:.009});
      }
    }
    // Dress stone arch and jambs: wedge-shaped voussoirs follow the opening.
    for(const sign of [-1,1])for(let row=0;row<14;row++)b.box([.35,.275,.7],facePoint(sign*1.55,.92+row*.277,5.3,a),"jade",.13+row*.009,{r:[0,a,0],shade:.94+(row%3)*.035});
    for(let i=0;i<17;i++){
      const shape=new THREE.Shape(),t0=i*Math.PI/17+.012,t1=(i+1)*Math.PI/17-.012;
      shape.absarc(0,0,1.76,t0,t1,false);shape.absarc(0,0,1.39,t1,t0,true);shape.closePath();
      const g=new THREE.ExtrudeGeometry(shape,{depth:.72,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:1,steps:1,curveSegments:4});g.translate(0,0,-.36);
      b.add(g,"jade",.26+i*.001,{p:facePoint(0,4.7,5.3,a),r:[0,a,0],shade:.93+(i%4)*.025});g.dispose();
    }
  }
  // Interior column grid stays behind the actual exterior wall thickness.
  for(const x of [-4.1,0,4.1])for(const z of [-4.1,4.1]){
    b.cylinder(.15,.21,6.7,[x,4.05,z],"wood",.062,{duration:.035,lift:3});
    b.cylinder(.25,.32,.28,[x,.88,z],"stone",.047);
  }
  for(const y of [3.15,6.95])for(const side of [0,1])for(const sign of [-1,1])b.box([8.5,.24,.28],side?[sign*4.1,y,0]:[0,y,sign*4.1],"wood",.085,{r:[0,side*Math.PI/2,0]});
  bracketBand(b,7.57,5.15,.285);
  roof(b,8.0,7.2,4.12,1.5,.32);

  // Open gallery: substantial footings, round posts, pierced lattice and plaques.
  b.box([10.25,.25,10.25],[0,9.24,0],"wood",.412);
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    for(const x of [-4.72,-2.36,0,2.36,4.72]){
      b.cylinder(.26,.3,.26,facePoint(x,9.47,4.72,a),"stone",.42);
      b.cylinder(.15,.19,3.0,facePoint(x,11.05,4.72,a),"wood",.435,{duration:.03,lift:1.5});
      b.cylinder(.22,.22,.12,facePoint(x,12.45,4.72,a),"jade",.467);
      for(const sign of [-1,1]){
        b.tube([facePoint(x+sign*.58,12.42,4.72,a),facePoint(x+sign*.31,12.18,4.72,a),facePoint(x,12.02,4.72,a)],.065,"wood",.47,{shade:.9},6);
      }
    }
    b.box([9.8,.35,.38],facePoint(0,12.55,4.72,a),"wood",.475,{r:[0,a,0]});
    for(let i=-6;i<=6;i++){
      const x=i*.68;
      b.box([.56,.3,.07],facePoint(x,12.28,4.76,a),"jade",.48,{r:[0,a,0]});
      b.tube([facePoint(x-.24,12.34,4.81,a),facePoint(x,12.16,4.81,a),facePoint(x+.24,12.34,4.81,a)],.021,"bronze",.484,{},6);
    }
  }
  railing(b,9.55,4.82,.49);
  for(const [i,[x,z,a]]of[[-4.55,4.98,0],[0,4.98,0],[4.55,4.98,0],[4.98,0,Math.PI/2],[-4.98,0,-Math.PI/2]].entries())guardian(b,[x,9.35,z],a+(i-2)*.025,.532,1.16+variation(i)*.035);
  for(const x of [-2.35,2.35])lantern(b,[x,11.64,4.95],.51);
  bracketBand(b,12.87,4.78,.545);
  roof(b,13.18,6.35,4.02,1.24,.568);
  shaft(b);
  // Heavy corbels gather the narrow shaft into the upper balcony.
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    for(let level=0;level<3;level++)b.box([6.7+level*.32,.16,.28],facePoint(0,21.84+level*.19,3.3+level*.16,a),level===1?"brick":"stone",.775+level*.003,{r:[0,a,0],shade:.87});
    b.box([8.8,.28,.38],facePoint(0,22.62,4.18,a),"wood",.809,{r:[0,a,0]});
  }
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    for(const sign of [-1,1])b.tube([facePoint(sign*1.3,20.45,3.48,a),facePoint(sign*1.65,21.15,3.68,a),facePoint(sign*2.22,21.9,4.03,a),facePoint(sign*2.4,22.65,4.5,a)],.15,"jade",.78,{},18);
  }
  bracketBand(b,22.58,4.45,.785);
  b.box([10.4,.26,10.4],[0,22.94,0],"wood",.814);
  railing(b,23.1,5.1,.852);

  // The belfry walls are separate masonry strips, cut around a true circular aperture.
  for(let side=0;side<4;side++){
    const a=side*Math.PI/2;
    for(let row=0;row<14;row++){
      const y0=23.03+row*.246,y1=y0+.241;
      const minY=Math.max(-1.16,Math.min(1.16,y0-24.83)),maxY=Math.max(-1.16,Math.min(1.16,y1-24.83));
      const inHole=y1>23.67&&y0<25.99;
      for(const sign of [-1,1]){
        const s=new THREE.Shape();s.moveTo(sign*4.06,y0);s.lineTo(sign*4.06,y1);
        if(inHole){for(let j=0;j<=8;j++){const yy=y1+(y0-y1)*j/8,dy=THREE.MathUtils.clamp(yy-24.83,minY,maxY);s.lineTo(sign*Math.sqrt(Math.max(0,1.16**2-dy**2)),yy);}}
        else{s.lineTo(0,y1);s.lineTo(0,y0);}s.closePath();
        const g=new THREE.ExtrudeGeometry(s,{depth:.42,bevelEnabled:false,steps:1,curveSegments:4});g.translate(0,0,-.21);
        b.add(g,"brick",.824+row*.002,{p:facePoint(0,0,4.02,a),r:[0,a,0],shade:.97+row%3*.012});g.dispose();
      }
    }
    const ring=new THREE.TorusGeometry(1.26,.14,7,64);
    b.add(ring,"stone",.868,{p:facePoint(0,24.83,4.27,a),r:[0,a,0]});ring.dispose();
    const surround=new THREE.Shape();surround.absarc(0,0,1.185,0,TAU,false);
    const hole=new THREE.Path();hole.absarc(0,0,1.105,0,TAU,true);surround.holes.push(hole);
    const sleeve=new THREE.ExtrudeGeometry(surround,{depth:.31,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,curveSegments:32});
    b.add(sleeve,"bronze",.87,{p:facePoint(0,24.83,4.0,a),r:[0,a,0],shade:.78});sleeve.dispose();
    const face=new THREE.CylinderGeometry(1.13,1.13,.055,48);face.rotateX(Math.PI/2);
    b.add(face,"recess",.873,{p:facePoint(0,24.83,4.05,a),r:[0,a,0]});face.dispose();
    for(let i=0;i<60;i++){
      const t=i/60*TAU;
      b.box([i%5?.018:.045,i%5?.065:.16,.024],facePoint(Math.sin(t)*.98,24.83+Math.cos(t)*.98,4.105,a),"stone",.88,{r:[0,a,-t]});
    }
    for(const r of [.82,1.05]){const ring=new THREE.TorusGeometry(r,.009,4,48);b.add(ring,"bronze",.882,{p:facePoint(0,24.83,4.11,a),r:[0,a,0]});ring.dispose();}
    b.tube([facePoint(-.05,24.76,4.13,a),facePoint(.49,25.39,4.13,a)],.035,"stone",.887,{},2);
    b.tube([facePoint(.03,24.79,4.15,a),facePoint(-.45,25.07,4.15,a)],.045,"stone",.887,{},2);
    b.sphere(facePoint(0,24.83,4.17,a),[.075,.075,.035],"bronze",.89,{r:[0,a,0]});
    const glazing=new THREE.CircleGeometry(1.095,48);
    b.add(glazing,"glass",.892,{p:facePoint(0,24.83,4.29,a),r:[0,a,0],lift:.1});glazing.dispose();
  }
  bracketBand(b,26.55,4.08,.895);
  roof(b,26.9,6.6,.2,3.24,.905);
  // Lotus finial, fully finished from ridge to pearl.
  for(let i=0;i<5;i++)b.cylinder(.34-i*.041,.45-i*.055,.18,[0,30.3+i*.23,0],"bronze",.989+i*.001);
  b.sphere([0,31.5,0],[.21,.32,.21],"bronze",.997,{duration:.003,lift:.22});
}

function lantern(b:HeritageBuilder,p:Point,start:number){
  b.sphere(p,[.28,.43,.28],"paper",start);
  for(const sign of [-1,1])b.cylinder(.2,.2,.065,[p[0],p[1]+sign*.37,p[2]],"bronze",start);
  for(let i=0;i<8;i++){
    const a=i/8*TAU;
    b.tube([[p[0]+Math.sin(a)*.15,p[1]-.37,p[2]+Math.cos(a)*.15],[p[0]+Math.sin(a)*.29,p[1],p[2]+Math.cos(a)*.29],[p[0]+Math.sin(a)*.15,p[1]+.37,p[2]+Math.cos(a)*.15]],.009,"wood",start,{},10);
  }
  b.cylinder(.01,.01,.65,[p[0],p[1]+.7,p[2]],"bronze",start);
  b.cylinder(.03,.055,.38,[p[0],p[1]-.58,p[2]],"brick",start);
}

export function courtyard(b:HeritageBuilder){
  b.box([23.6,.45,23.6],[0,-.45,0],"stone",-1,{lift:0,shade:.92});
  b.box([23.9,.12,23.9],[0,-.18,0],"stone",-1,{lift:0});
  for(let x=-8;x<=8;x++)for(let z=-8;z<=8;z++){
    if(Math.abs(x)<4&&Math.abs(z)<4)continue;
    b.box([1.344,.08,1.344],[x*1.37,-.085+(variation(x*71+z*13)-.5)*.012,z*1.37],"stone",-1,{lift:0,shade:.86+variation(x*3+z*7)*.13});
  }
  for(let i=0;i<5;i++)b.box([4.4,.17,1.02],[0,i*.17,9.3-i*.85],"stone",-1,{lift:0});
  for(const sign of [-1,1]){
    b.box([.36,.3,4.8],[sign*2.46,.44,7.65],"stone",-1,{r:[-.14,0,0],lift:0});
    for(const z of [5.45,9.85]){
      const y=z<6?1.05:.28;
      b.box([.48,.78,.48],[sign*2.46,y,z],"stone",-1,{lift:0});
      b.sphere([sign*2.46,y+.5,z],[.24,.25,.24],"stone",-1,{lift:0});
    }
    // Quiet stone garden, botanically shaped needles rather than stacked blobs.
    const px=sign*9.3,pz=-7.8;
    b.box([3.1,.23,3.1],[px,.02,pz],"stone",-1,{lift:0});
    b.tube([[px,0,pz],[px+.25,1.5,pz],[px-.25,3.1,pz-.1],[px+.12,4.7,pz]],.15,"wood",-1,{lift:0},16);
    for(let branch=0;branch<7;branch++){
      const a=branch*2.3,h=1.9+branch*.39,x=px+Math.cos(a)*1.25,z=pz+Math.sin(a)*1.2;
      b.tube([[px,h-.25,pz],[x-.2,h,z],[x,h+.18,z]],.05,"wood",-1,{lift:0},8);
      for(let n=0;n<28;n++){
        const an=n*2.4,r=Math.sqrt(n/28)*.75,seed=branch*41+n;
        const px=x+Math.cos(an)*r,py=h+.22+Math.sin(n)*.16,pz=z+Math.sin(an)*r;
        b.sphere([px,py,pz],[.17+variation(seed)*.13,.065+variation(seed+1)*.05,.13+variation(seed+2)*.09],"moss",-1,{r:[variation(seed)*.5,an,variation(seed+3)*.5],lift:0,shade:.75+variation(seed+4)*.25});
        if(n%3===0)b.tube([[x,h,z],[px,py-.08,pz]],.012,"wood",-1,{lift:0},2);
      }
    }
    // Architectural lantern: open frame with warm paper at its heart.
    const lx=sign*7.5,lz=7.2;
    b.box([.92,.2,.92],[lx,.1,lz],"stone",-1,{lift:0});
    b.cylinder(.12,.2,1.3,[lx,.8,lz],"stone",-1,{lift:0});
    b.box([.72,.12,.72],[lx,1.47,lz],"stone",-1,{lift:0});
    for(const dx of [-.27,.27])for(const dz of [-.27,.27])b.box([.075,.65,.075],[lx+dx,1.8,lz+dz],"stone",-1,{lift:0});
    b.sphere([lx,1.8,lz],[.2,.26,.2],"paper",-1,{lift:0});
    b.cylinder(.07,.64,.34,[lx,2.27,lz],"tile",-1,{lift:0});
    b.sphere([lx,2.5,lz],[.09,.13,.09],"stone",-1,{lift:0});
  }
  // One scale figure with a pleated scholar's robe and crossed collar.
  const x=-7.1,z=5.4;
  const robe=new THREE.LatheGeometry(Array.from({length:15},(_,i)=>new THREE.Vector2(.24+.28*Math.pow(1-i/14,1.6),i/14*1.85)),32);
  b.add(robe,"cloth",.005,{p:[x,.05,z],duration:.018,lift:.05});robe.dispose();
  for(let i=0;i<18;i++){
    const a=i/18*TAU;
    b.tube([[x+Math.sin(a)*.5,.08,z+Math.cos(a)*.5],[x+Math.sin(a)*.34,1.02,z+Math.cos(a)*.34],[x+Math.sin(a)*.25,1.84,z+Math.cos(a)*.25]],.012,"cloth",.005,{shade:i%2?.8:1.1,lift:.05},8);
  }
  b.cylinder(.25,.31,.55,[x,1.94,z],"cloth",.005,{lift:.05});
  b.sphere([x,2.47,z],[.16,.21,.17],"stone",.005,{lift:.05});
  b.sphere([x,2.66,z-.045],[.11,.1,.12],"recess",.005,{lift:.05});
  b.box([.33,.045,.29],[x,2.62,z],"recess",.005,{lift:.05});
  b.box([.065,.25,.07],[x,2.76,z],"recess",.005,{lift:.05});
  for(const sign of [-1,1]){
    b.cylinder(.16,.23,.71,[x+sign*.33,1.84,z+.04],"cloth",.005,{r:[0,0,sign*.5],lift:.05});
    b.box([.055,.48,.045],[x+sign*.08,2.05,z+.25],"stone",.005,{r:[0,0,sign*.4],lift:.05});
  }
}
