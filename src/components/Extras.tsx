import { useEffect, useState } from "react";
import { LEVELS, type Level } from "@/lib/levels";
import { Button } from "@/components/ui/button";
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
  if (!speed.active) return null;
  const pct = (speed.left / TEST_SECONDS) * 100;
  return (
    <div className="rounded-2xl bg-card p-3 shadow-soft">
      <div className="mb-2 flex items-center justify-between font-bold">
        <span>⏱️ {Math.ceil(speed.left)} שְׁנִיּוֹת</span>
        <span className="text-primary">{speed.count} {unit}</span>
        <Button variant="ghost" onClick={speed.stop} className="text-sm text-muted-foreground underline">עֲצִירָה</Button>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-l from-success to-accent transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SpeedResult({ speed, unit, onRestart }: { speed: Speed; unit: string; onRestart?: () => void }) {
  if (speed.result === null) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-pop animate-in zoom-in">
        <div className="text-6xl animate-bounce">🏆</div>
        <p className="mt-3 text-xl">בְּדַקָּה אַחַת הִסְפַּקְתָּ</p>
        <p className="font-display text-7xl text-primary">{speed.result}</p>
        <p className="text-2xl font-bold">{unit}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={onRestart ?? speed.start} className="rounded-full bg-secondary px-5 py-2 font-bold text-secondary-foreground">שׁוּב</button>
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
export function Celebration({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(timer);
  }, [trigger]);
  const cheer = CHEERS[trigger % CHEERS.length] ?? "כָּל הַכָּבוֹד!";
  const motion = ["elidushi-flip", "elidushi-jump", "elidushi-five"][trigger % 3];
  const animal = ["🐰", "🐢", "🦁", "🐼", "🦊", "🐥", "🐬"][trigger % 7] ?? "🐰";
  return <div className="companion-stage" aria-label="חגיגת הצלחה">
    <span key={trigger} aria-hidden="true" className={`celebration-emoji ${show ? motion : ""}`}>{show ? animal : ""}</span>
    <p className="companion-cheer" aria-live="polite">{show ? cheer : ""}</p>
  </div>;
}
