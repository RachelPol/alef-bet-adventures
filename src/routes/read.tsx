import { GameSetup } from "@/components/GameSetup";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { SpeedBar, SpeedResult } from "@/components/Extras";
import { MountainTrail } from "@/components/MountainTrail";
import { useMountain } from "@/lib/use-mountain";
import { speak } from "@/lib/letters";
import { draw, textSize, type Item } from "@/lib/levels";
import { useLevel, useSpeedTest } from "@/lib/hooks";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "קרא בקול – אָלֶף בֵּית" },
      { name: "description", content: "הילד קורא בקול והמבוגר שלידו מאשר" },
      { property: "og:title", content: "קרא בקול – אָלֶף בֵּית" },
      { property: "og:description", content: "הילד קורא בקול והמבוגר שלידו מאשר" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Read,
});

function Read() {
  const [level, setLevel] = useLevel();
  const [item, setItem] = useState<Item | null>(null);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);
  const mountain = useMountain('read');
  const question = useRef('');
  const answered = useRef(false);
  const speed = useSpeedTest();
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);
  const [playing, setPlaying] = useState(false);
  const [timed, setTimed] = useState(false);
  const start = () => { if (!level.items.length) return; if (pending.current) clearTimeout(pending.current); if (answered.current) next(); setPlaying(true); setFb(null); speed.close(); if (timed) speed.start(); else speed.stop(); };
  const settings = () => { if (pending.current) clearTimeout(pending.current); setPlaying(false); speed.stop(); speed.close(); };
  const blocked = !playing || !mountain.loaded || mountain.error || speed.result !== null || (timed && !speed.active);


  const next = () => {
    question.current=crypto.randomUUID(); answered.current=false;
    setFb(null);
    setItem(level.items.length ? draw(level) : null);
  };
  useEffect(() => { if (pending.current) clearTimeout(pending.current); next(); setPlaying(false); }, [level]);

  const ok = () => {
    if (blocked || answered.current || !item || fb === "ok") return;
    if(!mountain.record(question.current,'success'))return;
    answered.current=true;
    setFb("ok");
    setScore((s) => s + 1);
    if (speed.active) speed.record();
    pending.current = setTimeout(next, speed.active ? 300 : 1200);
  };

  return (
    <Shell title="קְרָא בְּקוֹל" score={score} wide>
      {!playing ? <GameSetup level={level} onLevel={setLevel} timed={timed} onTimed={setTimed} onStart={start} /> : <>
      <Button variant="ghost" size="icon" onClick={settings} title="בחירת משחק" aria-label="בחירת משחק"><Settings2 /></Button>
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>
      <div className="mountain-activity-layout"><MountainTrail mountain={mountain}/><div className="mountain-exercise">
      {item && (
        <div key={item.text} className="letter-tile mx-auto mt-6 flex aspect-[4/3] max-w-md items-center justify-center p-6 animate-in zoom-in">
          <span className={`${textSize(item.text)} leading-none`}>{item.text}</span>
        </div>
      )}
      <p className="mt-6 text-center text-xl text-muted-foreground">👦 קְרָא בְּקוֹל · 👩 הַמְּבֻגָּר מְאַשֵּׁר</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <Button disabled={blocked || fb === "ok"} variant="ghost" onClick={ok} className="h-auto rounded-2xl bg-success px-8 py-4 text-2xl font-bold text-success-foreground shadow-soft active:scale-95">✔ קָרָא נָכוֹן</Button>
        <Button disabled={blocked || answered.current} variant="ghost" onClick={() => { if(blocked || answered.current)return; mountain.record(question.current,'mistake'); setFb("bad"); if (item) speak(item.say); }} className="h-auto rounded-2xl bg-destructive px-8 py-4 text-2xl font-bold text-destructive-foreground shadow-soft">✘ עוֹד פַּעַם</Button>
        <Button variant="ghost" onClick={() => item && speak(item.say)} className="h-auto rounded-2xl bg-card px-8 py-4 text-2xl font-bold text-foreground shadow-soft">🔊 אֵיךְ קוֹרְאִים?</Button>
      </div>
      </div></div>
      </>}
      <SpeedResult speed={speed} unit={level.unit} onRestart={start} />
    </Shell>
  );
}
