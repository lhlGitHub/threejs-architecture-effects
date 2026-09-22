import { useCallback, useEffect, useRef, useState } from 'react';
import PagodaThreeScene, { type DetailView } from './PagodaThreeScene';

const DURATION=12.4;
const stages=[['础石落位',.06],['梁柱榫接',.11],['砖墙逐层砌筑',.28],['斗拱与首层飞檐',.412],['木构廊层',.606],['墙心逐层砌筑',.785],['望楼装配',.905],['屋瓦与屋脊',.995],['落成',1]] as const;

export default function App(){
  const [progress,setProgress]=useState(0),[playing,setPlaying]=useState(true);
  const [ready,setReady]=useState(false),[view,setView]=useState<DetailView>('overview');
  const started=useRef(0);
  const onReady=useCallback(()=>{started.current=performance.now();setReady(true);},[]);
  useEffect(()=>{
    if(!ready || !playing)return;
    let frame=0;
    const tick=(now:number)=>{
      const next=Math.min(1,(now-started.current)/(DURATION*1000));setProgress(next);
      if(next===1)setPlaying(false);else frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[ready,playing]);
  const seek=useCallback((p:number)=>{const next=Math.max(0,Math.min(1,p));started.current=performance.now()-next*DURATION*1000;setProgress(next);},[]);
  const replay=()=>{setView('overview');seek(0);setPlaying(true);};
  const toggle=()=>{seek(progress===1?0:progress);setPlaying(progress===1 || !playing);};
  const detail=(v:DetailView)=>{setView(v);if(v!=='overview'){seek(1);setPlaying(false);}};
  const stage=stages.find(([,end])=>progress<end)?.[0]??'落成';
  return <main className="poster">
    <header><span className="wordmark"><i>营</i>营造<em>HERITAGE ATELIER</em></span><small>ANATOMY OF CONSTRUCTION · 3D</small><div className="header-actions"><button disabled={!ready} onClick={replay}>重新建造 ↺</button></div></header>
    <section className="scene">
      <aside className="brief"><p className="micro">THE ART OF ASSEMBLY<br/>藏品 〇一 / 砖木楼阁</p><h2>一木一石，<br/>自有千年。</h2><p className="accent">在方寸之间，重见营造之美。</p><blockquote>砖石垒砌，梁柱相承。<br/>斗拱托举，重檐舒展。</blockquote><div className="index"><b>01</b><i/><span>真实三维建造演示</span></div></aside>
      <div className="tower-stage">
        <PagodaThreeScene progress={progress} view={view} onReady={onReady}/>
        {!ready&&<div className="scene-loading">展卷 · 营造中</div>}
        <div className="stage-label"><i/>{stage}<span>{Math.round(progress*100)}%</span></div>
        <div className="view-selector" role="group" aria-label="观赏视角">{([['overview','全景'],['roof','飞檐细赏'],['guardian','石狮近观']] as const).map(([id,label])=><button key={id} disabled={!ready} aria-pressed={view===id} onClick={()=>detail(id)}>{label}</button>)}</div>
        <div className="orbit-hint">拖动环视 · 滚轮近观</div>
      </div>
      <aside className="title-block"><span className="symbols">中国建筑 · 时间的形状</span><h1>建<br/>生</h1><p>BRICK · TIMBER · TIME</p><div className="original-mark"><b>榫卯相承</b></div></aside>
    </section>
    <footer><button className="play" disabled={!ready} onClick={toggle} aria-label={playing?'暂停':'播放'}>{playing?'Ⅱ':'▶'}</button><div className="timeline"><span style={{width:`${progress*100}%`}}/><input aria-label="施工进度" disabled={!ready} type="range" min="0" max="1000" value={Math.round(progress*1000)} onChange={e=>seek(Number(e.target.value)/1000)}/></div><time>{(progress*DURATION).toFixed(1)} / {DURATION} S</time></footer>
  </main>;
}
