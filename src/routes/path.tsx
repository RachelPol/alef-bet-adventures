import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, LevelPicker, SpeedBar, SpeedResult } from "@/components/Extras";
import { pick, shuffle, speak } from "@/lib/letters";
import { draw, type Item, type Level } from "@/lib/levels";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";

export const Route = createFileRoute("/path")({
  head: () => ({
    meta: [
      { title: "שְׁבִיל הַמִּלִּים – אָלֶף בֵּית" },
      { name: "description", content: "משחק: מצאו את המילה ששמעתם והתקדמו על השביל" },
      { property: "og:title", content: "שְׁבִיל הַמִּלִּים – אָלֶף בֵּית" },
      { property: "og:description", content: "משחק: מצאו את המילה ששמעתם והתקדמו על השביל" },
    ],
  }),
  component: PathGame,
});

const STEPS = 10;
const BOARD = 12;
const HEROES = ["🐢", "🐰", "🐌", "🦔"];

function make(level: Level) {
  const target = draw(level);
  return { target, cards: shuffle([target, ...pick(level.items, BOARD - 1, [target])]) };
}

function PathGame() {
  const [level, setLevel] = useLevel();
  const [r, setR] = useState<{ target: Item; cards: Item[] } | null>(null);
  const [step, setStep] = useState(0);
  const [hero] = useState(() => HEROES[Math.floor(Math.random() * HEROES.length)]!);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const speed = useSpeedTest();
  useEffect(() => { setR(make(level)); setFb(null); setStep(0); setWon(false); }, [level]);

  const next = (lvl: Level) => {
    const n = make(lvl);
    setR(n);
    setFb(null);
    speak(n.target.say);
  };

  const hit = (l: Item) => {
    if (!r || fb === "ok" || won) return;
    if (l === r.target) {
      setFb("ok");
      setScore((s) => s + 1);
      celebrate();
      if (speed.active) speed.record();
      const s = step + 1;
      setStep(s);
      if (s >= STEPS) {
        setWon(true);
        speak("כָּל הַכָּבוֹד! הִגַּעְתָּ לַסּוֹף!");
      } else {
        setTimeout(() => next(level), speed.active ? 600 : 1400);
      }
    } else {
      setFb("bad");
      speak(r.target.say);
    }
  };

  const restart = () => {
    setStep(0);
    setWon(false);
    next(level);
  };

  return (
    <Shell title="שְׁבִיל הַמִּלִּים" score={score} wide>
      <LevelPicker level={level} onChange={setLevel} />
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>

      {/* השביל */}
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-3 shadow-soft" dir="ltr">
        {Array.from({ length: STEPS + 1 }, (_, i) => (
          <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl transition ${i <= step ? "bg-success/30" : "bg-muted"}`}>
            {i === step ? hero : i < step ? "⭐" : i === STEPS ? "🏆" : ""}
          </div>
        ))}
      </div>

      {won ? (
        <div className="mt-10 text-center animate-in zoom-in">
          <div className="text-8xl animate-bounce">🏆</div>
          <p className="mt-4 font-display text-5xl text-primary">הִגַּעְתָּ לַסּוֹף!</p>
          <p className="mt-2 text-2xl">עָנִיתָ נָכוֹן {STEPS} פְּעָמִים!</p>
          <button onClick={restart} className="mt-6 rounded-full bg-primary px-8 py-4 font-display text-2xl text-primary-foreground shadow-pop">
            🔁 מִשְׂחָק חָדָשׁ
          </button>
        </div>
      ) : r && (
        <>
          <div className="mt-6 text-center">
            <button onClick={() => speak(r.target.say)} className="rounded-full bg-primary px-10 py-5 font-display text-3xl text-primary-foreground shadow-pop">
              🔊 מָה שָׁמַעְתָּ?
            </button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-5 sm:grid-cols-4">
            {r.cards.map((l) => (
              <button key={l.text} onClick={() => hit(l)}
                className={`rounded-3xl bg-card px-4 py-10 font-display shadow-soft transition hover:-translate-y-1 hover:shadow-pop ${l.text.replace(/[֑-ׇ]/g, "").length > 5 ? "text-3xl" : "text-5xl"}`}>
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
