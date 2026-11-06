import { Button } from "@/components/ui/button";
import { LEVELS, type Level } from "@/lib/levels";
import { useEffect, useState } from "react";
import { readingDialect, type ReadingDialect } from "@/lib/reading-dialect";
export function GameSetup({ level, onLevel, timed, onTimed, onStart }: { level: Level; onLevel: (id: string) => void; timed: boolean; onTimed: (value: boolean) => void; onStart: () => void }) {
  const [dialect, setDialect] = useState<ReadingDialect>("israeli");
  useEffect(() => setDialect(readingDialect(localStorage.getItem("reading-dialect"))), []);
  const choose = (value: ReadingDialect) => { setDialect(value); localStorage.setItem("reading-dialect", value); };
  return <section className="mx-auto max-w-2xl py-6 text-center">
    <h2 className="mb-5 text-3xl font-bold">בְּחִירַת רָמָה</h2>
    <div className="grid gap-3 sm:grid-cols-2">{LEVELS.map(option => <Button key={option.id} variant={level.id === option.id ? "default" : "outline"} aria-pressed={level.id === option.id} onClick={() => onLevel(option.id)} className="h-auto min-h-14 whitespace-normal px-4 py-3 text-xl">{option.label}</Button>)}</div>
    <fieldset className="mt-6"><legend className="mb-3 text-xl font-bold">הֲבָרַת הַקְּרִיאָה</legend><div className="grid gap-2 sm:grid-cols-2"><Button variant={dialect === "israeli" ? "default" : "outline"} aria-pressed={dialect === "israeli"} onClick={() => choose("israeli")} className="h-auto min-h-12 whitespace-normal">עברית ישראלית</Button><Button variant={dialect === "litvish" ? "default" : "outline"} aria-pressed={dialect === "litvish"} onClick={() => choose("litvish")} className="h-auto min-h-12 whitespace-normal">לשון הקודש · אשכנזית ליטאית</Button></div></fieldset>
    <label className="my-6 flex items-center justify-center gap-3 text-xl"><input type="checkbox" className="size-5 accent-primary" checked={timed} onChange={e => onTimed(e.target.checked)} />בְּדִיקַת מְהִירוּת – דַּקָּה אַחַת</label>
    <Button onClick={onStart} className="h-auto px-10 py-4 text-2xl">מַתְחִילִים!</Button>
  </section>;
}