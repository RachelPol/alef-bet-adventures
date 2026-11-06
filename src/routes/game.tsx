import { GameSetup } from "@/components/GameSetup";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, SpeedBar, SpeedResult } from "@/components/Extras";
import { pick, shuffle, speak } from "@/lib/letters";
import { draw, type Item, type Level } from "@/lib/levels";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "פוצצים בלונים – אָלֶף בֵּית" },
      { name: "description", content: "משחק: פוצצו את הבלון עם מה ששמעתם" },
      { property: "og:title", content: "פוצצים בלונים – אָלֶף בֵּית" },
      { property: "og:description", content: "משחק: פוצצו את הבלון עם מה ששמעתם" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

const COLORS = ["bg-primary text-primary-foreground", "bg-secondary text-secondary-foreground", "bg-accent text-accent-foreground", "bg-success text-success-foreground"];

function make(level: Level) {
  const target = draw(level);
  return { target, balloons: shuffle([target, ...pick(level.items, 5, [target])]) };
}

function Game() {
  const [level, setLevel] = useLevel();
  const [r, setR] = useState<{ target: Item; balloons: Item[] } | null>(null);
  const [popped, setPopped] = useState<string | null>(null);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const speed = useSpeedTest();
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);
  const [playing, setPlaying] = useState(false);
  const [timed, setTimed] = useState(false);
  const start = () => { if (pending.current) clearTimeout(pending.current); setPlaying(true); setFb(null); speed.close(); if (timed) speed.start(); else speed.stop(); };
  const settings = () => { if (pending.current) clearTimeout(pending.current); setPlaying(false); speed.stop(); speed.close(); };
  const blocked = !playing || speed.result !== null || (timed && !speed.active);

  useEffect(() => { setR(make(level)); setFb(null); }, [level]);

  const hit = (l: Item) => {
    if (blocked || !r || fb === "ok") return;
    if (l === r.target) {
      setPopped(l.text); setFb("ok"); setScore((s) => s + 1); celebrate();
      if (speed.active) speed.record();
      const next = make(level);
      setR(next); setPopped(null); setFb(null); speak(next.target.say);
    } else { setFb("bad"); speak(r.target.say); }
  };

  return (
    <Shell title="בַּלּוֹנִים" score={score}>
      <Celebration trigger={cel} />
      {!playing ? <GameSetup level={level} onLevel={setLevel} timed={timed} onTimed={setTimed} onStart={start} /> : <>
      <Button variant="ghost" size="icon" onClick={settings} title="בחירת משחק" aria-label="בחירת משחק"><Settings2 /></Button>
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>
      {r && (
        <>
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => speak(r.target.say)} className="h-auto rounded-full bg-primary px-10 py-5 font-display text-3xl text-primary-foreground shadow-pop">🔊 מָה שָׁמַעְתָּ?</Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {r.balloons.map((l, i) => (
              <Button disabled={blocked} variant="ghost" key={l.text} onClick={() => hit(l)} style={{ animationDelay: `${i * 0.3}s` }}
                className={`balloon mx-auto flex h-36 w-full min-w-0 whitespace-normal break-words items-center justify-center px-5 font-display ${l.text.length > 4 ? "text-3xl" : "text-5xl"} ${COLORS[i % 4]} ${popped === l.text ? "scale-150 opacity-0" : ""}`}>
                {l.text}
              </Button>
            ))}
          </div>
        </>
      )}
      <div className="mt-8"><Feedback state={fb === "bad" ? "bad" : null} /></div>
      </>}
      <SpeedResult speed={speed} unit={level.unit} onRestart={start} />
    </Shell>
  );
}
