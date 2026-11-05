import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { Celebration } from "@/components/Extras";
import { LETTERS, pick, shuffle, speak } from "@/lib/letters";
import { useCelebrate } from "@/lib/hooks";
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

const PAIRS = 6;

type Card = { id: string; pair: string; kind: "word" | "pic"; text: string };

function deal(): Card[] {
  const words = pick(LETTERS, PAIRS);
  const cards: Card[] = words.flatMap((l) => [
    { id: l.char + "w", pair: l.char, kind: "word" as const, text: l.word },
    { id: l.char + "p", pair: l.char, kind: "pic" as const, text: l.emoji },
  ]);
  return shuffle(cards);
}

function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);
  const [focus, setFocus] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const { seconds, start: startTime, finish: finishTime } = useCompletionTime();
  useEffect(() => { setCards(deal()); setFocus(0); startTime(); }, [startTime]);

  const won = cards.length > 0 && done.length === cards.length;

  // Grid columns match the CSS breakpoints: 3 on mobile, 4 from sm up.
  const gridCols = () => (typeof window !== "undefined" && window.innerWidth >= 640 ? 4 : 3);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (won || cards.length === 0) return;
      const c = gridCols();
      let next: number | null = null;
      if (e.key === "ArrowRight" && focus % c !== 0) next = focus - 1;
      else if (e.key === "ArrowLeft" && focus % c !== c - 1) next = focus + 1;
      else if (e.key === "ArrowUp" && focus - c >= 0) next = focus - c;
      else if (e.key === "ArrowDown" && focus + c < cards.length) next = focus + c;
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const card = cards[focus];
        if (card) flip(card);
        return;
      }
      if (next !== null && next >= 0 && next < cards.length) {
        e.preventDefault();
        setFocus(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const flip = (c: Card) => {
    if (busy || won || open.includes(c.id) || done.includes(c.id)) return;
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
      if (done.length + 2 === cards.length) {
        finishTime();
        speak("כָּל הַכָּבוֹד! מָצָאתָ אֶת כָּל הַזּוּגוֹת!");
      }
    } else {
      setBusy(true);
      setTimeout(() => { setOpen([]); setBusy(false); }, 1100);
    }
  };

  const restart = () => {
    setCards(deal());
    setOpen([]);
    setDone([]);
    setMoves(0);
    setBusy(false);
    startTime();
  };

  return (
    <Shell title="מִשְׂחַק זִכָּרוֹן" score={done.length / 2} wide>
      <p className="text-center text-xl text-muted-foreground">מָצֵא זוּג: מִלָּה וְתַמּוּנָה 🖼️</p>

      {won ? (
        <div className="mt-10 text-center animate-in zoom-in">
          <div className="text-8xl animate-bounce">🏆</div>
          <p className="mt-4 font-display text-5xl text-primary">מָצָאתָ אֶת כָּל הַזּוּגוֹת!</p>
          <p className="mt-2 text-2xl">בְּ {moves} נִסְיוֹנוֹת</p>
          {seconds !== null && <p className="mt-3 text-xl" aria-label="זמן סיום">⏱️ מָצָאתָ אֶת כָּל הַזּוּגוֹת בְּ־{completionTimeLabel(seconds)}</p>}
          <Button onClick={restart} className="mt-6 h-auto rounded-full bg-primary px-8 py-4 font-display text-2xl text-primary-foreground shadow-pop">
            🔁 מִשְׂחָק חָדָשׁ
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {cards.map((c) => {
            const shown = open.includes(c.id) || done.includes(c.id);
            return (
              <Button variant="ghost" key={c.id} onClick={() => flip(c)} aria-label={shown ? c.text : "קלף הפוך"}
                className={`flex h-32 items-center justify-center rounded-3xl px-2 font-display shadow-soft transition sm:h-40 ${shown ? (done.includes(c.id) ? "bg-success/30" : "bg-card") : "bg-primary text-primary-foreground hover:scale-105"} ${c.kind === "pic" ? "text-6xl" : "text-3xl sm:text-4xl"}`}>
                {shown ? c.text : "❓"}
              </Button>
            );
          })}
        </div>
      )}
      <Celebration trigger={cel} />
    </Shell>
  );
}
