import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, LevelPicker, SpeedBar, SpeedResult } from "@/components/Extras";
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
  useEffect(() => { setR(make(level)); setFb(null); }, [level]);

  const hit = (l: Item) => {
    if (!r || fb === "ok") return;
    if (l === r.target) {
      setPopped(l.text); setFb("ok"); setScore((s) => s + 1); celebrate();
      if (speed.active) speed.record();
      setTimeout(() => { const n = make(level); setR(n); setPopped(null); setFb(null); speak(n.target.say); }, speed.active ? 600 : 1200);
    } else { setFb("bad"); speak(r.target.say); }
  };

  return (
    <Shell title="בַּלּוֹנִים" score={score}>
      <LevelPicker level={level} onChange={setLevel} />
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>
      {r && (
        <>
          <div className="mt-6 text-center">
            <button onClick={() => speak(r.target.say)} className="rounded-full bg-primary px-10 py-5 font-display text-3xl text-primary-foreground shadow-pop">🔊 מָה שָׁמַעְתָּ?</button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {r.balloons.map((l, i) => (
              <button key={l.text} onClick={() => hit(l)} style={{ animationDelay: `${i * 0.3}s` }}
                className={`balloon mx-auto flex h-36 min-w-32 items-center justify-center px-5 font-display ${l.text.length > 4 ? "text-3xl" : "text-5xl"} ${COLORS[i % 4]} ${popped === l.text ? "scale-150 opacity-0" : ""}`}>
                {l.text}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="mt-8"><Feedback state={fb === "bad" ? "bad" : null} /></div>
      <Celebration trigger={cel} />
      <SpeedResult speed={speed} unit={level.unit} />
    </Shell>
  );
}
