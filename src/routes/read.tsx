import { GameSetup } from "@/components/GameSetup";
import { ReadingTrial } from "@/components/ReadingTrial";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, SpeedBar, SpeedResult } from "@/components/Extras";
import { speak } from "@/lib/letters";
import { draw, textSize, type Item } from "@/lib/levels";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";

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
  const [micConsent, setMicConsent] = useState(false);
  const [cel, celebrate] = useCelebrate();
  const speed = useSpeedTest();
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);
  const [playing, setPlaying] = useState(false);
  const [timed, setTimed] = useState(false);
  const start = () => { if (pending.current) clearTimeout(pending.current); setPlaying(true); setFb(null); speed.close(); if (timed) speed.start(); else speed.stop(); };
  const settings = () => { if (pending.current) clearTimeout(pending.current); setPlaying(false); speed.stop(); speed.close(); };
  const blocked = !playing || speed.result !== null || (timed && !speed.active);


  const next = () => {
    setFb(null);
    setItem(draw(level));
  };
  useEffect(next, [level]);

  const ok = () => {
    if (blocked || fb === "ok") return;
    setFb("ok");
    setScore((s) => s + 1);
    celebrate();
    if (speed.active) speed.record();
    pending.current = setTimeout(next, speed.active ? 300 : 1200);
  };

  return (
    <Shell title="קְרָא בְּקוֹל" score={score}>
      <Celebration trigger={cel} />
      {!playing ? <GameSetup level={level} onLevel={setLevel} timed={timed} onTimed={setTimed} onStart={start} /> : <>
      <Button variant="ghost" size="icon" onClick={settings} title="בחירת משחק" aria-label="בחירת משחק"><Settings2 /></Button>
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>
      {item && (
        <div key={item.text} className="letter-tile mx-auto mt-6 flex aspect-[4/3] max-w-md items-center justify-center p-6 animate-in zoom-in">
          <span className={`${textSize(item.text)} leading-none`}>{item.text}</span>
        </div>
      )}
      <p className="mt-6 text-center text-xl text-muted-foreground">👦 קְרָא בְּקוֹל · 👩 הַמְּבֻגָּר מְאַשֵּׁר</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <Button disabled={blocked || fb === "ok"} variant="ghost" onClick={ok} className="h-auto rounded-2xl bg-success px-8 py-4 text-2xl font-bold text-success-foreground shadow-soft active:scale-95">✔ קָרָא נָכוֹן</Button>
        <Button variant="ghost" onClick={() => { setFb("bad"); if (item) speak(item.say); }} className="h-auto rounded-2xl bg-destructive px-8 py-4 text-2xl font-bold text-destructive-foreground shadow-soft">✘ עוֹד פַּעַם</Button>
        <Button variant="ghost" onClick={() => item && speak(item.say)} className="h-auto rounded-2xl bg-card px-8 py-4 text-2xl font-bold text-foreground shadow-soft">🔊 אֵיךְ קוֹרְאִים?</Button>
      </div>
      <div className="mt-6"><Feedback state={fb} /></div>
      {item && <ReadingTrial key={`${level.id}-${item.text}`} text={item.text} disabled={blocked || fb === "ok"} consent={micConsent} onConsent={setMicConsent} onCorrect={ok} />}
      </>}
      <SpeedResult speed={speed} unit={level.unit} onRestart={start} />
    </Shell>
  );
}
