import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { LETTERS, pick, shuffle, speak, type Letter } from "@/lib/letters";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: "פוצצים בלונים – אָלֶף בֵּית" },
      { name: "description", content: "משחק: פוצצו את הבלון עם האות ששמעתם" },
      { property: "og:title", content: "פוצצים בלונים – אָלֶף בֵּית" },
      { property: "og:description", content: "משחק: פוצצו את הבלון עם האות ששמעתם" },
    ],
  }),
  component: Game,
});

const COLORS = ["bg-primary text-primary-foreground", "bg-secondary text-secondary-foreground", "bg-accent text-accent-foreground", "bg-success text-success-foreground"];

function make() {
  const target = pick(LETTERS, 1)[0];
  return { target, balloons: shuffle([target, ...pick(LETTERS, 5, [target])]) };
}

function Game() {
  const [r, setR] = useState<{ target: Letter; balloons: Letter[] } | null>(null);
  const [popped, setPopped] = useState<string | null>(null);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);
  useEffect(() => setR(make()), []);
  if (!r) return <Shell title="בַּלּוֹנִים">{null}</Shell>;

  const hit = (l: Letter) => {
    if (fb === "ok") return;
    if (l === r.target) {
      setPopped(l.char); setFb("ok"); setScore((s) => s + 1);
      setTimeout(() => { const n = make(); setR(n); setPopped(null); setFb(null); speak(n.target.name); }, 1200);
    } else { setFb("bad"); speak(r.target.name); }
  };

  return (
    <Shell title="בַּלּוֹנִים" score={score}>
      <div className="text-center">
        <button onClick={() => speak(r.target.name)} className="rounded-full bg-primary px-10 py-5 font-display text-3xl text-primary-foreground shadow-pop">🔊 אֵיזוֹ אוֹת?</button>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-6">
        {r.balloons.map((l, i) => (
          <button key={l.char} onClick={() => hit(l)} style={{ animationDelay: `${i * 0.3}s` }}
            className={`balloon mx-auto flex h-32 w-28 items-center justify-center font-display text-6xl ${COLORS[i % 4]} ${popped === l.char ? "scale-150 opacity-0" : ""}`}>
            {l.char}
          </button>
        ))}
      </div>
      <div className="mt-8"><Feedback state={fb} /></div>
    </Shell>
  );
}
