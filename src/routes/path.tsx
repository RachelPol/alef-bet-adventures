import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, LevelPicker, SpeedBar, SpeedResult } from "@/components/Extras";
import { pick, speak } from "@/lib/letters";
import { type Item, type Level } from "@/lib/levels";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";

export const Route = createFileRoute("/path")({
  head: () => ({
    meta: [
      { title: "שְׁבִיל הַמִּלִּים – אָלֶף בֵּית" },
      { name: "description", content: "משחק: מצאו את המילה ששמעתם ועזרו לדמות לחצות את הלוח" },
      { property: "og:title", content: "שְׁבִיל הַמִּלִּים – אָלֶף בֵּית" },
      { property: "og:description", content: "משחק: מצאו את המילה ששמעתם ועזרו לדמות לחצות את הלוח" },
    ],
  }),
  component: PathGame,
});

const COLS = 5;
const ROWS = 3;
const CELLS = COLS * ROWS;
const STEPS = 10; // כמה קלפים הדמות עוברת עד שהיא יוצאת מהצד השני
const HEROES = ["🐢", "🐰", "🦔", "🐥"];

// שביל נחש: מתחיל מימין למעלה, שורה אחר שורה, עד שמאל למטה
function pathPos(i: number) {
  const row = Math.floor(i / COLS);
  const col = row % 2 === 0 ? COLS - 1 - (i % COLS) : i % COLS;
  return { row, col };
}

function deal(level: Level): Item[] {
  return pick(level.items, CELLS);
}

function PathGame() {
  const [level, setLevel] = useLevel();
  const [cards, setCards] = useState<Item[]>([]);
  const [step, setStep] = useState(-1); // -1 = הדמות עוד מחוץ ללוח, מימין
  const [hero] = useState(() => HEROES[Math.floor(Math.random() * HEROES.length)]!);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const speed = useSpeedTest();

  const start = (lvl: Level) => {
    const c = deal(lvl);
    setCards(c);
    setStep(-1);
    setWon(false);
    setFb(null);
    speak(c[pathPos(0).row * COLS + pathPos(0).col]!.say);
  };
  useEffect(() => { start(level); }, [level]);

  const targetIndex = step + 1;
  const target = targetIndex < CELLS ? cards[pathPos(targetIndex).row * COLS + pathPos(targetIndex).col] : undefined;

  const hit = (l: Item) => {
    if (!target || fb === "ok" || won) return;
    if (l === target) {
      setFb("ok");
      setScore((s) => s + 1);
      celebrate();
      if (speed.active) speed.record();
      const s = step + 1;
      setStep(s);
      if (s >= STEPS) {
        setWon(true);
        speak("כָּל הַכָּבוֹד! חָצִיתָ אֶת כָּל הַלּוּחַ!");
      } else {
        const nxt = cards[pathPos(s + 1).row * COLS + pathPos(s + 1).col];
        setTimeout(() => { setFb(null); if (nxt) speak(nxt.say); }, speed.active ? 600 : 1400);
      }
    } else {
      setFb("bad");
      speak(target.say);
    }
  };

  // מיקום הדמות באחוזים על הלוח
  const heroPos = () => {
    if (won || step >= STEPS) return { x: -12, y: 50 }; // יצאה משמאל
    if (step < 0) return { x: 106, y: (0.5 / ROWS) * 100 }; // בפתח הלוח, מימין
    const { row, col } = pathPos(step);
    return { x: ((col + 0.5) / COLS) * 100, y: ((row + 0.5) / ROWS) * 100 };
  };
  const hp = heroPos();

  return (
    <Shell title="שְׁבִיל הַמִּלִּים" score={score} wide>
      <LevelPicker level={level} onChange={setLevel} />
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>

      {won ? (
        <div className="mt-10 text-center animate-in zoom-in">
          <div className="text-8xl animate-bounce">🏆</div>
          <p className="mt-4 font-display text-5xl text-primary">חָצִיתָ אֶת כָּל הַלּוּחַ!</p>
          <p className="mt-2 text-2xl">עָנִיתָ נָכוֹן {STEPS} פְּעָמִים!</p>
          <button onClick={() => start(level)} className="mt-6 rounded-full bg-primary px-8 py-4 font-display text-2xl text-primary-foreground shadow-pop">
            🔁 מִשְׂחָק חָדָשׁ
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 text-center">
            <button onClick={() => target && speak(target.say)} className="rounded-full bg-primary px-10 py-5 font-display text-3xl text-primary-foreground shadow-pop">
              🔊 מָה שָׁמַעְתָּ?
            </button>
          </div>
          <div className="relative mt-8" dir="ltr">
            <div className="grid grid-cols-5 gap-4">
              {cards.map((l, i) => (
                <button key={i} onClick={() => hit(l)}
                  className={`flex h-28 items-center justify-center rounded-3xl bg-card px-2 font-display shadow-soft transition hover:-translate-y-1 hover:shadow-pop sm:h-36 ${l.text.replace(/[֑-ׇ]/g, "").length > 5 ? "text-3xl" : "text-5xl sm:text-6xl"}`}>
                  {l.text}
                </button>
              ))}
            </div>
            {/* הדמות מהלכת על הקלפים */}
            <div className="pointer-events-none absolute z-10 text-6xl transition-all duration-700 ease-in-out sm:text-7xl"
              style={{ left: `${hp.x}%`, top: `${hp.y}%`, transform: "translate(-50%, -115%)" }}>
              {hero}
            </div>
          </div>
        </>
      )}
      <div className="mt-8"><Feedback state={fb === "bad" ? "bad" : null} /></div>
      <Celebration trigger={cel} />
      <SpeedResult speed={speed} unit={level.unit} />
    </Shell>
  );
}
