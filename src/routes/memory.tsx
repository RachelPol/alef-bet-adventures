import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { Celebration } from "@/components/Extras";
import { LETTERS, pick, shuffle, speak } from "@/lib/letters";
import { useCelebrate } from "@/lib/hooks";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "מִשְׂחַק זִכָּרוֹן – אָלֶף בֵּית" },
      { name: "description", content: "משחק זיכרון: מצאו זוג של מילה ותמונה" },
      { property: "og:title", content: "מִשְׂחַק זִכָּרוֹן – אָלֶף בֵּית" },
      { property: "og:description", content: "משחק זיכרון: מצאו זוג של מילה ותמונה" },
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
  const [cel, celebrate] = useCelebrate();
  useEffect(() => { setCards(deal()); }, []);

  const won = cards.length > 0 && done.length === cards.length;

  const flip = (c: Card) => {
    if (busy || won || open.includes(c.id) || done.includes(c.id)) return;
    const now = [...open, c.id];
    setOpen(now);
    if (now.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = now.map((id) => cards.find((x) => x.id === id)!) as [Card, Card];
    if (a.pair === b.pair) {
      setDone((d) => [...d, a.id, b.id]);
      setOpen([]);
      celebrate();
      if (done.length + 2 === cards.length) speak("כָּל הַכָּבוֹד! מָצָאתָ אֶת כָּל הַזּוּגוֹת!");
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
  };

  return (
    <Shell title="מִשְׂחַק זִכָּרוֹן" score={done.length / 2} wide>
      <p className="text-center text-xl text-muted-foreground">מָצֵא זוּג: מִלָּה וְתַמּוּנָה 🖼️</p>

      {won ? (
        <div className="mt-10 text-center animate-in zoom-in">
          <div className="text-8xl animate-bounce">🏆</div>
          <p className="mt-4 font-display text-5xl text-primary">מָצָאתָ אֶת כָּל הַזּוּגוֹת!</p>
          <p className="mt-2 text-2xl">בְּ {moves} נִסְיוֹנוֹת</p>
          <button onClick={restart} className="mt-6 rounded-full bg-primary px-8 py-4 font-display text-2xl text-primary-foreground shadow-pop">
            🔁 מִשְׂחָק חָדָשׁ
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {cards.map((c) => {
            const shown = open.includes(c.id) || done.includes(c.id);
            return (
              <button key={c.id} onClick={() => flip(c)}
                className={`flex h-32 items-center justify-center rounded-3xl px-2 font-display shadow-soft transition sm:h-40 ${shown ? (done.includes(c.id) ? "bg-success/30" : "bg-card") : "bg-primary text-primary-foreground hover:scale-105"} ${c.kind === "pic" ? "text-6xl" : "text-3xl sm:text-4xl"}`}>
                {shown ? c.text : "❓"}
              </button>
            );
          })}
        </div>
      )}
      <Celebration trigger={cel} />
    </Shell>
  );
}
