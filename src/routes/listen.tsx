import { GameSetup } from "@/components/GameSetup";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, SpeedBar, SpeedResult } from "@/components/Extras";
import { speak } from "@/lib/letters";
import { pickPair, textSize, type Item, type Level } from "@/lib/levels";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";

export const Route = createFileRoute("/listen")({
  head: () => ({
    meta: [
      { title: "שמע ובחר – אָלֶף בֵּית" },
      { name: "description", content: "שומעים ובוחרים את האות, ההברה או המילה הנכונה" },
      { property: "og:title", content: "שמע ובחר – אָלֶף בֵּית" },
      { property: "og:description", content: "שומעים ובוחרים את האות, ההברה או המילה הנכונה" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Listen,
});

function newRound(level: Level) {
  const pair = pickPair(level);
  return { pair, target: pair[Math.floor(Math.random() * 2)]! };
}

function Listen() {
  const [level, setLevel] = useLevel();
  const [round, setRound] = useState<{ pair: Item[]; target: Item } | null>(null);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const speed = useSpeedTest();
  const [playing, setPlaying] = useState(false);
  const [timed, setTimed] = useState(false);
  const start = () => { setPlaying(true); setFb(null); speed.close(); if (timed) speed.start(); else speed.stop(); };
  const settings = () => { setPlaying(false); speed.stop(); speed.close(); };
  const blocked = !playing || speed.result !== null || (timed && !speed.active);


  useEffect(() => { setRound(newRound(level)); setFb(null); }, [level]);

  const choose = useCallback(
    (l: Item) => {
      if (blocked || !round || fb === "ok") return;
      if (l === round.target) {
        setFb("ok");
        setScore((s) => s + 1);
        celebrate();
        if (speed.active) speed.record();
        setTimeout(() => {
          const r = newRound(level);
          setRound(r);
          setFb(null);
          setTimeout(() => speak(r.target.say), 200);
        }, speed.active ? 600 : 1300);
      } else {
        setFb("bad");
        speak(round.target.say);
      }
    },
    [round, fb, level, speed, celebrate, blocked],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!round || blocked) return;
      if (e.key === "ArrowRight") choose(round.pair[0]!);
      else if (e.key === "ArrowLeft") choose(round.pair[1]!);
      else {
        const hit = round.pair.find((l) => l.text === e.key);
        if (hit) choose(hit);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [round, choose]);

  return (
    <Shell title="שְׁמַע וּבְחַר" score={score}>
      <Celebration trigger={cel} />
      {!playing ? <GameSetup level={level} onLevel={setLevel} timed={timed} onTimed={setTimed} onStart={start} /> : <>
      <Button variant="ghost" size="icon" onClick={settings} title="בחירת משחק" aria-label="בחירת משחק"><Settings2 /></Button>
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>
      {round && (
        <>
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => speak(round.target.say)} className="rounded-full bg-primary px-10 py-5 font-display text-3xl text-primary-foreground shadow-pop transition hover:scale-105 active:scale-95">
              🔊 הַקְשֵׁב
            </Button>
            <p className="mt-3 text-muted-foreground">לחצו על התשובה, או על החץ ימינה / שמאלה במקלדת</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6">
            {round.pair.map((l) => (
              <Button variant="ghost" key={l.text} onClick={() => choose(l)} className={`letter-tile flex aspect-square items-center justify-center p-4 ${textSize(l.text)}`}>
                {l.text}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="mt-6"><Feedback state={fb === "bad" ? "bad" : null} /></div>
      </>}
      <SpeedResult speed={speed} unit={level.unit} onRestart={start} />
    </Shell>
  );
}
