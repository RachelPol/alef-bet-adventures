import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { Celebration, SpeedBar, SpeedResult } from "@/components/Extras";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";
import { GameSetup } from "@/components/GameSetup";
import { dealMemory, type MemoryCard as Card, type MemoryMode } from "@/lib/memory-game";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completionTimeLabel, useCompletionTime } from "@/lib/completion-time";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "מִשְׂחַק זִכָּרוֹן – אָלֶף בֵּית" },
      { name: "description", content: "משחק זיכרון: מצאו זוג של מילה ותמונה" },
      { property: "og:title", content: "מִשְׂחַק זִכָּרוֹן – אָלֶף בֵּית" },
      { property: "og:description", content: "משחק זיכרון: מצאו זוג של מילה ותמונה" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemoryGame,
});

function MemoryGame() {
  const [level, setLevel] = useLevel();
  const [playing, setPlaying] = useState(false);
  const [timed, setTimed] = useState(false);
  const [mode, setMode] = useState<MemoryMode>("words");
  const speed = useSpeedTest();
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const { seconds, start: startTime, finish: finishTime } = useCompletionTime();

  const won = cards.length > 0 && done.length === cards.length;

  const flip = (c: Card) => {
    if (!playing || (timed && !speed.active) || speed.result !== null || busy || won || open.includes(c.id) || done.includes(c.id)) return;
    const now = [...open, c.id];
    setOpen(now);
    if (now.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = now.map((id) => cards.find((x) => x.id === id));
    if (!a || !b) return;
    if (a.pair === b.pair) {
      setDone((d) => [...d, a.id, b.id]);
      setOpen([]);
      celebrate();
      setScore(s => s + 1);
      if (speed.active) speed.record();
      if (done.length + 2 === cards.length) {
        finishTime();
        if (!timed) speed.stop();
      }
    } else {
      setBusy(true);
      setTimeout(() => { setOpen([]); setBusy(false); }, 1100);
    }
  };

  const restart = () => {
    setCards(dealMemory(level, Math.random, mode));
    setPlaying(true);
    setOpen([]);
    setDone([]);
    setMoves(0);
    setBusy(false);
    startTime();
    speed.close(); if (timed) speed.start(); else speed.stop();
  };

  return (
    <Shell title="מִשְׂחַק זִכָּרוֹן" score={score} wide>
      <Celebration trigger={cel} count={score} interval={3} voiced complete={won} />
      {!playing ? <>
        <div className="mb-4 flex flex-wrap justify-center gap-3" role="group" aria-label="סוג המשחק">
          <Button variant={mode === "words" ? "default" : "outline"} aria-pressed={mode === "words"} onClick={() => setMode("words")} className="h-auto px-6 py-3 text-xl">📖 קְרִיאָה וּתְמוּנָה</Button>
          <Button variant={mode === "pictures" ? "default" : "outline"} aria-pressed={mode === "pictures"} onClick={() => setMode("pictures")} className="h-auto px-6 py-3 text-xl">🖼️ רַק תְּמוּנוֹת</Button>
        </div>
        <GameSetup level={level} onLevel={setLevel} timed={timed} onTimed={setTimed} onStart={restart} /></> : <>
      <Button variant="ghost" size="icon" title="בחירת משחק" aria-label="בחירת משחק" onClick={() => { setPlaying(false); speed.stop(); speed.close(); }}><Settings2 /></Button>
      <SpeedBar speed={speed} unit="זוּגוֹת" />

      {won ? (
        <div className="mt-10 text-center animate-in zoom-in">
          <div className="text-8xl animate-bounce">🏆</div>
          <p className="mt-4 font-display text-5xl text-primary">מָצָאתָ אֶת כָּל הַזּוּגוֹת!</p>
          <p className="mt-2 text-2xl">בְּ {moves} נִסְיוֹנוֹת</p>
          {seconds !== null && <p className="mt-3 text-xl" aria-label="זמן סיום">⏱️ מָצָאתָ אֶת כָּל הַזּוּגוֹת בְּ־{completionTimeLabel(seconds)}</p>}
          <Button onClick={() => timed && speed.active ? (setCards(dealMemory(level, Math.random, mode)), setDone([]), setOpen([]), setMoves(0), startTime()) : restart()} className="mt-6 h-auto rounded-full bg-primary px-8 py-4 font-display text-2xl text-primary-foreground shadow-pop">
            🔁 מִשְׂחָק חָדָשׁ
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {cards.map((c) => {
            const shown = open.includes(c.id) || done.includes(c.id);
            return (
              <Button variant="ghost" key={c.id} onClick={() => flip(c)} aria-label={shown ? c.text : "קלף הפוך"}
                className={`flex h-32 min-w-0 items-center justify-center whitespace-normal break-words rounded-3xl px-2 font-display shadow-soft transition sm:h-40 ${shown ? (done.includes(c.id) ? "bg-success/30" : "bg-card") : "bg-primary text-primary-foreground hover:scale-105"} ${c.kind === "pic" ? "text-6xl" : c.kind === "letter" ? "text-7xl" : "text-2xl sm:text-4xl"}`}>
                {shown ? c.text : "❓"}
              </Button>
            );
          })}
        </div>
      )}
      </>}
      <SpeedResult speed={speed} unit="זוּגוֹת" onRestart={restart} />
    </Shell>
  );
}
