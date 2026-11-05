import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { LETTERS, speak, type Letter } from "@/lib/letters";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "קרא בקול – אָלֶף בֵּית" },
      { name: "description", content: "הילד קורא בקול והמבוגר שלידו מאשר" },
      { property: "og:title", content: "קרא בקול – אָלֶף בֵּית" },
      { property: "og:description", content: "הילד קורא בקול והמבוגר שלידו מאשר" },
    ],
  }),
  component: Read,
});

function Read() {
  const [item, setItem] = useState<Letter | null>(null);
  const [asWord, setAsWord] = useState(false);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);

  const next = () => {
    setFb(null);
    setItem(LETTERS[Math.floor(Math.random() * LETTERS.length)]!);
  };
  useEffect(next, []);
  if (!item) return <Shell title="קְרָא בְּקוֹל">{null}</Shell>;

  const text = asWord ? item.word : item.char;
  const sound = asWord ? item.word : item.name;

  return (
    <Shell title="קְרָא בְּקוֹל" score={score}>
      <div className="flex justify-center gap-2">
        {[false, true].map((w) => (
          <button key={String(w)} onClick={() => { setAsWord(w); next(); }} className={`rounded-full px-5 py-2 font-bold ${asWord === w ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}>
            {w ? "מִלִּים" : "אוֹתִיּוֹת"}
          </button>
        ))}
      </div>
      <div className="letter-tile mx-auto mt-8 flex aspect-[4/3] max-w-md flex-col items-center justify-center">
        <span className={asWord ? "text-8xl" : "text-[10rem] leading-none"}>{text}</span>
        {asWord && <span className="mt-2 text-6xl">{item.emoji}</span>}
      </div>
      <p className="mt-6 text-center text-xl text-muted-foreground">👦 קְרָא בְּקוֹל · 👩 הַמְּבֻגָּר מְאַשֵּׁר</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <button onClick={() => { setFb("ok"); setScore((s) => s + 1); setTimeout(next, 1200); }} className="rounded-2xl bg-success px-8 py-4 text-2xl font-bold text-success-foreground shadow-soft">✔ קָרָא נָכוֹן</button>
        <button onClick={() => { setFb("bad"); speak(sound); }} className="rounded-2xl bg-destructive px-8 py-4 text-2xl font-bold text-destructive-foreground shadow-soft">✘ עוֹד פַּעַם</button>
        <button onClick={() => speak(sound)} className="rounded-2xl bg-card px-8 py-4 text-2xl font-bold text-foreground shadow-soft">🔊 אֵיךְ קוֹרְאִים?</button>
      </div>
      <div className="mt-6"><Feedback state={fb} /></div>
    </Shell>
  );
}
