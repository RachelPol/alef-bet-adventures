import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feedback, Shell } from "@/components/Shell";
import { Celebration, LevelPicker, SpeedBar, SpeedResult } from "@/components/Extras";
import { speak } from "@/lib/letters";
import { draw, textSize, type Item } from "@/lib/levels";
import { useCelebrate, useLevel, useSpeedTest } from "@/lib/hooks";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "קרא בקול – אָלֶף בֵּית" },
      { name: "description", content: "הילד קורא בקול והמבוגר שלידו מאשר" },
      { property: "og:title", content: "קרא בקול – אָלֶף בֵּית" },
      { property: "og:description", content: "הילד קורא בקול והמבוגר שלידו מאשר" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Read,
});

function Read() {
  const [level, setLevel] = useLevel();
  const [item, setItem] = useState<Item | null>(null);
  const [fb, setFb] = useState<"ok" | "bad" | null>(null);
  const [score, setScore] = useState(0);
  const [cel, celebrate] = useCelebrate();
  const speed = useSpeedTest();

  const next = () => {
    setFb(null);
    setItem(draw(level));
  };
  useEffect(next, [level]);

  const ok = () => {
    setScore((s) => s + 1);
    celebrate();
    if (speed.active) speed.record();
    setTimeout(next, speed.active ? 300 : 1200);
  };

  return (
    <Shell title="קְרָא בְּקוֹל" score={score}>
      <LevelPicker level={level} onChange={setLevel} />
      <div className="mt-4"><SpeedBar speed={speed} unit={level.unit} /></div>
      {item && (
        <div key={item.text} className="letter-tile mx-auto mt-6 flex aspect-[4/3] max-w-md items-center justify-center p-6 animate-in zoom-in">
          <span className={`${textSize(item.text)} leading-none`}>{item.text}</span>
        </div>
      )}
      <p className="mt-6 text-center text-xl text-muted-foreground">👦 קְרָא בְּקוֹל · 👩 הַמְּבֻגָּר מְאַשֵּׁר</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <button onClick={ok} className="rounded-2xl bg-success px-8 py-4 text-2xl font-bold text-success-foreground shadow-soft active:scale-95">✔ קָרָא נָכוֹן</button>
        <button onClick={() => { setFb("bad"); if (item) speak(item.say); }} className="rounded-2xl bg-destructive px-8 py-4 text-2xl font-bold text-destructive-foreground shadow-soft">✘ עוֹד פַּעַם</button>
        <button onClick={() => item && speak(item.say)} className="rounded-2xl bg-card px-8 py-4 text-2xl font-bold text-foreground shadow-soft">🔊 אֵיךְ קוֹרְאִים?</button>
      </div>
      <div className="mt-6"><Feedback state={fb} /></div>
      <Celebration trigger={cel} />
      <SpeedResult speed={speed} unit={level.unit} />
    </Shell>
  );
}
