import { useEffect, useMemo, useState } from "react";
import { LEVELS, type Level } from "@/lib/levels";
import { TEST_SECONDS, type useSpeedTest } from "@/lib/hooks";

export function LevelPicker({ level, onChange }: { level: Level; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {LEVELS.map((l, i) => (
        <button key={l.id} onClick={() => onChange(l.id)}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${level.id === l.id ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-foreground hover:bg-accent"}`}>
          {i + 1}. {l.label}
        </button>
      ))}
    </div>
  );
}

type Speed = ReturnType<typeof useSpeedTest>;

export function SpeedBar({ speed, unit }: { speed: Speed; unit: string }) {
  if (!speed.active)
    return (
      <div className="text-center">
        <button onClick={speed.start} className="rounded-full bg-secondary px-6 py-2 text-lg font-bold text-secondary-foreground shadow-soft hover:scale-105 transition">
          ⏱️ בְּדִיקַת מְהִירוּת – דַּקָּה אַחַת
        </button>
      </div>
    );
  const pct = (speed.left / TEST_SECONDS) * 100;
  return (
    <div className="rounded-2xl bg-card p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between font-bold">
        <span>⏱️ {Math.ceil(speed.left)} שְׁנִיּוֹת</span>
        <span className="text-primary">{speed.count} {unit}</span>
        <button onClick={speed.stop} className="text-sm text-muted-foreground underline">עֲצִירָה</button>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-l from-success to-accent transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SpeedResult({ speed, unit }: { speed: Speed; unit: string }) {
  if (speed.result === null) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-pop animate-in zoom-in">
        <div className="text-6xl animate-bounce">🏆</div>
        <p className="mt-3 text-xl">בְּדַקָּה אַחַת הִסְפַּקְתָּ</p>
        <p className="font-display text-7xl text-primary">{speed.result}</p>
        <p className="text-2xl font-bold">{unit}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={speed.start} className="rounded-full bg-secondary px-5 py-2 font-bold text-secondary-foreground">שׁוּב</button>
          <button onClick={speed.close} className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground">סְגִירָה</button>
        </div>
      </div>
    </div>
  );
}

const CHEERS = [
  "כָּל הַכָּבוֹד!", "מְעֻלֶּה!", "אַלּוּף!", "יוֹפִי!", "וָאוּ!", "מַדְהִים!", "גָּאוֹן!",
  "אַתָּה מִתְקַדֵּם נִפְלָא!", "אֵיזֶה כֹּחַ רָצוֹן!", "אֵיךְ אַתָּה קוֹרֵא יָפֶה!",
  "אֵין עָלֶיךָ!", "אַתָּה כּוֹכָב!", "בֶּאֱמֶת מַפְתִּיעַ!", "אֲנִי גַּאָה בְּךָ!",
  "הוֹלֵךְ לְךָ מְצֻיָּן!", "אַתָּה תַּלְמִיד חָרוּץ!", "מְדַיֵּק בְּדִיּוּק!",
  "כָּכָה מְמַשְׁכִים!", "אַתָּה עוֹשֶׂה אֶת זֶה בְּגָדוֹל!", "נֶהֱדָר מִבֵּין יָפֶה!",
];
const HEROES = ["🦁", "🐶", "🐱", "🐵", "🦄", "🐸", "🐼", "🐰", "🦊", "🐥"];
const BITS = ["⭐", "🎉", "✨", "🌟", "🎈", "💖", "🍭", "🌈"];

export function Celebration({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(t);
  }, [trigger]);
  const data = useMemo(() => ({
    cheer: CHEERS[Math.floor(Math.random() * CHEERS.length)] ?? CHEERS[0]!,
    hero: HEROES[Math.floor(Math.random() * HEROES.length)],
    bits: Array.from({ length: 16 }, (_, i) => ({
      e: BITS[i % BITS.length],
      x: Math.cos((i / 16) * Math.PI * 2) * (140 + Math.random() * 120),
      y: Math.sin((i / 16) * Math.PI * 2) * (140 + Math.random() * 120),
    })),
  }), [trigger]);
  if (!show) return null;
  return (
    <div key={trigger} className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      {data.bits.map((b, i) => (
        <span key={i} className="burst absolute text-4xl" style={{ "--x": `${b.x}px`, "--y": `${b.y}px` } as React.CSSProperties}>{b.e}</span>
      ))}
      <div className="hero-pop flex flex-col items-center">
        <span className="text-9xl">{data.hero}</span>
        <span className={`font-display text-success drop-shadow ${data.cheer.length > 14 ? "text-4xl" : "text-5xl"}`}>{data.cheer}</span>
      </div>
    </div>
  );
}
