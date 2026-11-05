import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { DoorOpen, RotateCcw, Settings2, Volume2 } from "lucide-react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, SpeedBar, SpeedResult } from "@/components/Extras";
import { Button } from "@/components/ui/button";
import { pick, speak } from "@/lib/letters";
import { LEVELS, type Item } from "@/lib/levels";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";
import { gateIsOpen, nextPathMove, PATH_CELLS, PATH_GOAL, replaceDepartedCard, type Direction } from "@/lib/path-game";
import { completionTimeLabel, useCompletionTime } from "@/lib/completion-time";

export const Route = createFileRoute("/path")({
  head: () => ({
    meta: [
      { title: "שְׁבִיל הַמִּלִּים – אָלֶף בֵּית" },
      { name: "description", content: "משחק: מצאו את המילה ששמעתם ועזרו לדמות לחצות את הלוח" },
      { property: "og:title", content: "שְׁבִיל הַמִּלִּים – אָלֶף בֵּית" },
      { property: "og:description", content: "משחק: מצאו את המילה ששמעתם ועזרו לדמות לחצות את הלוח" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PathGame,
});

function PathGame() {
  const [level, setLevel] = useLevel();
  const [cards, setCards] = useState<Item[]>([]);
  const [phase, setPhase] = useState<"setup" | "playing" | "gate" | "exiting" | "won">("setup");
  const [columns, setColumns] = useState(5);
  const [position, setPosition] = useState(7);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [timed, setTimed] = useState(false);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const speed = useSpeedTest();
  const completion = useCompletionTime();
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setColumns(media.matches ? 5 : 3);
    update();
    media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); if (pending.current) clearTimeout(pending.current); };
  }, []);
  const clearPending = () => { if (pending.current) clearTimeout(pending.current); locked.current = false; };
  const start = () => {
    clearPending();
    const board = pick(level.items, PATH_CELLS);
    const move = nextPathMove(7, columns, null);
    setCards(board);
    setPosition(7);
    setDirection(move.direction);
    setTargetIndex(move.index);
    setScore(0);
    setFb(null);
    setPhase("playing");
    completion.start();
    speed.close();
    if (timed) speed.start(); else speed.stop();
    const target = board[move.index];
    if (target) speak(target.say);
  };
  const settings = () => {
    clearPending();
    speed.stop();
    speed.close();
    setPhase("setup");
    setFb(null);
  };
  const target = targetIndex === null ? undefined : cards[targetIndex];
  const hit = (index: number) => {
    if (!target || targetIndex === null || locked.current || phase !== "playing" || speed.result !== null || (timed && !speed.active)) return;
    if (index === targetIndex) {
      locked.current = true;
      setFb("ok");
      const count = score + 1;
      setScore(count);
      setPosition(index);
      celebrate();
      if (speed.active) speed.record();
      if (gateIsOpen(count)) {
        completion.finish();
        setPhase("gate");
        setTargetIndex(null);
        setFb(null);
      } else {
        const board = replaceDepartedCard(cards, position, level);
        const move = nextPathMove(index, columns, direction);
        pending.current = setTimeout(() => {
          setCards(board);
          setDirection(move.direction);
          setTargetIndex(move.index);
          setFb(null);
          locked.current = false;
          const next = board[move.index];
          if (next) speak(next.say);
        }, speed.active ? 600 : 2600);
      }
    } else {
      setFb("bad");
      speak(target.say);
    }
  };

  const exit = () => {
    clearPending();
    setPhase("exiting");
    pending.current = setTimeout(() => setPhase("won"), 1000);
  };
  const heroStyle = { "--hero-x": `${((position % columns + .5) / columns) * 100}%`, "--hero-y": `${((Math.floor(position / columns) + .5) / (PATH_CELLS / columns)) * 100}%` } as CSSProperties;

  return (
    <Shell title="שְׁבִיל הַמִּלִּים" score={score} wide>
      {phase === "setup" ? (
        <section className="mx-auto max-w-2xl py-6 text-center">
          <div className="mb-5 text-7xl">🐥</div>
          <h2 className="mb-5 font-display text-3xl">בְּחִירַת רָמָה</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {LEVELS.map((option) => <Button key={option.id} variant={level.id === option.id ? "default" : "outline"} aria-pressed={level.id === option.id} onClick={() => setLevel(option.id)} className="h-auto min-h-14 whitespace-normal px-4 py-3 text-lg">{option.label}</Button>)}
          </div>
          <label className="my-7 flex cursor-pointer items-center justify-center gap-3 text-xl">
            <input type="checkbox" checked={timed} onChange={(event) => setTimed(event.target.checked)} className="size-5 accent-primary" />
            בְּדִיקַת מְהִירוּת – דַּקָּה אַחַת
          </label>
          <Button onClick={start} className="h-auto px-10 py-4 font-display text-2xl">מַתְחִילִים! 🐥</Button>
        </section>
      ) : phase === "won" ? (
        <div className="mt-10 text-center animate-in zoom-in">
          <div className="text-8xl animate-bounce">🏆</div>
          <p className="mt-4 font-display text-5xl text-primary">חָצִיתָ אֶת כָּל הַלּוּחַ!</p>
          <p className="mt-2 text-2xl">עָנִיתָ נָכוֹן {PATH_GOAL} פְּעָמִים!</p>
          {completion.seconds !== null && <p className="mt-3 text-xl" aria-label="זמן סיום">⏱️ קָרָאתָ 25 מִלִּים בְּ־{completionTimeLabel(completion.seconds)}</p>}
          {speed.active && <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>}
          <Button onClick={start} className="mt-6 h-auto px-8 py-4 font-display text-2xl"><RotateCcw /> מִשְׂחָק חָדָשׁ</Button>
          <Button variant="ghost" onClick={settings} className="mt-4 ms-3"><Settings2 /> בְּחִירַת מִשְׂחָק</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="icon" onClick={settings} title="בְּחִירַת מִשְׂחָק" aria-label="בְּחִירַת מִשְׂחָק"><Settings2 /></Button>
            {phase === "gate" ? <Button onClick={exit} className="h-auto px-6 py-3 text-xl"><DoorOpen /> הַשַּׁעַר נִפְתַּח! יוֹצְאִים!</Button> : <Button disabled={phase === "exiting"} onClick={() => target && speak(target.say)} className="h-auto px-6 py-3 font-display text-2xl"><Volume2 /> מָה שָׁמַעְתָּ?</Button>}
            <span className="text-lg font-bold" aria-label="התקדמות לשער">🐥 {score} / {PATH_GOAL} 🚪</span>
          </div>
          {speed.active && <div className="mt-3"><SpeedBar speed={speed} unit={level.unit} /></div>}
          <div className="path-board relative mt-5 overflow-hidden" dir="ltr" style={heroStyle}>
            <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-5 sm:gap-4 sm:p-3">
              {cards.map((l, i) => (
                <Button key={i} variant="ghost" disabled={phase !== "playing" || fb === "ok" || speed.result !== null || (timed && !speed.active)} onClick={() => hit(i)} dir="rtl"
                  className={`path-word flex h-28 min-w-0 items-end justify-center whitespace-normal rounded-3xl bg-card px-1 pb-5 pt-10 font-display shadow-soft transition hover:bg-accent disabled:opacity-100 sm:h-36 sm:pb-6 ${i === position ? "ring-2 ring-secondary" : ""} ${l.text.replace(/[֑-ׇ]/g, "").length > 5 ? "text-xl sm:text-3xl" : "text-3xl sm:text-5xl"}`}>
                  {l.text}
                </Button>
              ))}
            </div>
            {/* הדמות מהלכת על הקלפים */}
            <div className={`path-chick pointer-events-none absolute z-10 text-4xl sm:text-5xl ${phase === "exiting" ? "path-chick-exiting" : ""}`} aria-label="האפרוח">🐥</div>
            <div className={`path-gate pointer-events-none absolute left-0 z-20 text-3xl ${phase === "gate" || phase === "exiting" ? "text-success" : "text-muted-foreground"}`} aria-label={phase === "gate" || phase === "exiting" ? "שער פתוח" : "שער סגור"}>{phase === "gate" || phase === "exiting" ? "🚪✨" : "🔒"}</div>
          </div>
        </>
      )}
      {phase !== "setup" && <div className="mt-3"><Feedback state={fb === "bad" ? "bad" : null} /></div>}
      <Celebration trigger={cel} />
      <SpeedResult speed={speed} unit={level.unit} onRestart={start} />
    </Shell>
  );
}
