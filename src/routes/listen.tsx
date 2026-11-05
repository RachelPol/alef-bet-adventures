import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { LETTERS, pick, speak, type Letter } from "@/lib/letters";

export const Route = createFileRoute("/listen")({
  head: () => ({
    meta: [
      { title: "שמע ובחר – אָלֶף בֵּית" },
      { name: "description", content: "שומעים אות ובוחרים את האות הנכונה" },
      { property: "og:title", content: "שמע ובחר – אָלֶף בֵּית" },
      { property: "og:description", content: "שומעים אות ובוחרים את האות הנכונה" },
    ],
  }),
  component: Listen,
});

function newRound() {
  const pair = pick(LETTERS, 2);
  return { pair, target: pair[Math.floor(Math.random() * 2)]! };
}

function Listen() {
  const [round, setRound] = useState<{ pair: Letter[]; target: Letter } | null>(null);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => setRound(newRound()), []);

  const choose = useCallback(
    (l: Letter) => {
      if (!round || fb === "ok") return;
      if (l === round.target) {
        setFb("ok");
        setScore((s) => s + 1);
        speak("כל הכבוד");
        setTimeout(() => {
          const r = newRound();
          setRound(r);
          setFb(null);
          setTimeout(() => speak(r.target.name), 300);
        }, 1300);
      } else {
        setFb("bad");
        speak(round.target.name);
      }
    },
    [round, fb],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!round) return;
      // In RTL the first item is on the right
      if (e.key === "ArrowRight") choose(round.pair[0]!);
      else if (e.key === "ArrowLeft") choose(round.pair[1]!);
      else {
        const hit = round.pair.find((l) => l.char === e.key);
        if (hit) choose(hit);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [round, choose]);

  if (!round) return <Shell title="שְׁמַע וּבְחַר">{null}</Shell>;

  return (
    <Shell title="שְׁמַע וּבְחַר" score={score}>
      <div className="text-center">
        <button onClick={() => speak(round.target.name)} className="rounded-full bg-primary px-10 py-5 font-display text-3xl text-primary-foreground shadow-pop transition hover:scale-105 active:scale-95">
          🔊 הַקְשֵׁב
        </button>
        <p className="mt-3 text-muted-foreground">לחצו על האות, או על החץ ימינה / שמאלה במקלדת</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-6">
        {round.pair.map((l) => (
          <button key={l.char} onClick={() => choose(l)} className="letter-tile aspect-square text-[9rem]">
            {l.char}
          </button>
        ))}
      </div>
      <div className="mt-6"><Feedback state={fb} /></div>
    </Shell>
  );
}
