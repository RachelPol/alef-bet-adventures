import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import trail from '@/assets/mountain/trail.asset.json';
import climber from '@/assets/mountain/climber.asset.json';
import { mountainPosition, STATIONS } from '@/lib/mountain';
import type { useMountain } from '@/lib/use-mountain';

const STATION_EFFECTS = [
  ['🎒','🥾','🧭'], ['🌉','💦','🍃'], ['💧','🌈','🫧'],
  ['🔦','💎','✨'], ['🔭','☁️','🦅'], ['🌲','🍃','🦋'],
  ['🧗','🪨','⭐'], ['⛺','🔦','🌟'], ['🎆','🎉','🏅','⭐','🎊','🚩'],
];

export function MountainTrail({ mountain }: { mountain: ReturnType<typeof useMountain> }) {
  const {state,notice}=mountain;
  const position=mountainPosition(state.streak);
  const [volume,setVolume]=useState(.45);
  const audio=useRef<AudioContext|null>(null);
  const previous=useRef(state.version);
  const previousStreak=useRef(state.streak);
  const loaded=useRef(false);
  useEffect(()=>{
    if(!mountain.loaded)return;
    if(!loaded.current){loaded.current=true;previous.current=state.version;previousStreak.current=state.streak;return;}
    if(state.version===previous.current)return;
    const success=state.streak>previousStreak.current;
    previous.current=state.version;previousStreak.current=state.streak;
    if(!volume)return;
    try {
      const ctx=audio.current ?? new AudioContext();audio.current=ctx;void ctx.resume().catch(()=>undefined);
      const notes=success?(state.streak%10===0?[523,659,784,1047]:[659,880]):[392,330];
      notes.forEach((frequency,i)=>{const oscillator=ctx.createOscillator();const gain=ctx.createGain();const at=ctx.currentTime+i*.065;
        oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.08*volume,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.12);
        oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(at);oscillator.stop(at+.13);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});
    } catch { /* Optional sounds never block answers. */ }
  },[state.version,state.streak,mountain.loaded,volume]);
  useEffect(()=>()=>{const ctx=audio.current;audio.current=null;void ctx?.close().catch(()=>undefined);},[]);
  const station=notice?.kind==='station'?STATIONS[notice.streak/10-1]:null;
  const effectPosition=station && notice ? mountainPosition(notice.streak) : null;
  return <section className="mountain-section" aria-label="מסלול הטיפוס">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
      <div><h2 className="font-display text-2xl text-primary">הדרך לפסגה</h2><p className="font-bold" aria-live="polite"><b dir="ltr" className="text-2xl">{state.streak}/90</b> הצלחות ברצף</p></div>
      <div className="flex items-center gap-3">
        {state.completions>0 && <span title="פסגות שכבר נכבשו" aria-label={`${state.completions} פסגות שנכבשו`}>🏆 {state.completions}</span>}
        <Button variant="ghost" size="icon" aria-label={volume?'השתקת צלילי המסלול':'הפעלת צלילי המסלול'} title={volume?'השתקת צלילי המסלול':'הפעלת צלילי המסלול'} onClick={()=>setVolume(v=>v?0:.45)}>{volume?<Volume2/>:<VolumeX/>}</Button>
        <Slider className="w-20" aria-label="עוצמת צלילי המסלול" value={[volume]} min={0} max={1} step={.05} onValueChange={values=>setVolume(values[0]??0)}/>
      </div>
    </div>
    <div className="mountain-scene">
      <img className="mountain-background" src={trail.url} alt="הר עם מסלול מפותל, גשר עץ, מפל ומחנה עד לדגל הפסגה"/>
      {STATIONS.map((s,i)=>{const at=mountainPosition((i+1)*10);const done=state.streak>=(i+1)*10;const next=!done&&Math.floor(state.streak/10)===i;
        return <span key={s.name} className={`mountain-station ${done?'is-done':''} ${next?'is-next':''}`} style={{left:`${at.x}%`,top:`${at.y}%`}} title={`${s.name} — ${(i+1)*10} הצלחות — ${s.reward}`} aria-label={`${s.name}, ${(i+1)*10} הצלחות${done?', הושלמה':next?', התחנה הבאה':''}`}><span aria-hidden="true">{done?'✓':s.icon}</span><b>{(i+1)*10}</b></span>;})}
      <div className="mountain-climber" style={{left:`${position.x}%`,top:`${position.y}%`,'--climber-height':`${Math.min(19,position.y-.5)}%`} as CSSProperties}>
        <img src={climber.url} alt="ילד מטייל עם תרמיל"/>{state.streak===90&&<span className={`summit-flag ${station && notice?.streak===90?'is-waving':''}`} aria-label="דגל ניצחון">🚩</span>}
      </div>
      {station && notice && effectPosition && <div key={notice.serial} className={`mountain-sparkles station-effect-${notice.streak}`} aria-hidden="true" style={{'--station-x':`${effectPosition.x}%`,'--station-y':`${effectPosition.y}%`} as CSSProperties}>{[...(STATION_EFFECTS[notice.streak/10-1]??[]),'✨','⭐'].map((icon,i)=><span key={i} style={{'--spark-index':i} as CSSProperties}>{icon}</span>)}</div>}
    </div>
    <div role="progressbar" aria-label="התקדמות לפסגה" aria-valuemin={0} aria-valuemax={90} aria-valuenow={state.streak} aria-valuetext={`${state.streak} מתוך 90 הצלחות`} className="mt-3 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-success transition-[width] duration-300 motion-reduce:transition-none" style={{width:`${state.streak/90*100}%`}}/></div>
    <div className="mountain-notice" aria-live="polite">
      {!mountain.loaded ? <p>טוענים את המסלול…</p> : mountain.error ? <div><p>המסלול לא נשמר כרגע. ננסה שוב לפני שממשיכים.</p><Button variant="outline" onClick={mountain.retry}>נסה שוב</Button></div> : notice?.kind==='reset'?<p>לא נורא, מתחילים מסלול חדש! 🌱</p>:station?<div className={notice?.streak===90?'summit-message':''}><p className="font-bold">{notice?.streak===90?'הצלחת! 90 הצלחות ברצף! כבשת את הפסגה!':`הגעת ל${station.name}! ${notice?.streak} הצלחות ברצף!`}</p><span>{station.icon} קיבלת {station.reward}</span></div>:state.streak<90?<p className="text-muted-foreground">התחנה הבאה: {STATIONS[Math.floor(state.streak/10)]?.name} · {(Math.floor(state.streak/10)+1)*10}</p>:<p>🏆 הפסגה שלך!</p>}
    </div>
    {state.streak===90&&<div className="flex flex-wrap justify-center gap-2"><Button variant="outline" onClick={mountain.dismiss}>ממשיכים בפעילות</Button><Button onClick={mountain.restart}><RotateCcw className="size-4"/> אתגר חדש</Button></div>}
  </section>;
}