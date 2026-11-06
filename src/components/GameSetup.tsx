import { Button } from "@/components/ui/button";
import { LEVELS, type Level } from "@/lib/levels";
export function GameSetup({ level, onLevel, timed, onTimed, onStart }: { level: Level; onLevel: (id: string) => void; timed: boolean; onTimed: (value: boolean) => void; onStart: () => void }) {
  return <section className="mx-auto max-w-2xl py-6 text-center">
    <h2 className="mb-5 text-3xl font-bold">בְּחִירַת רָמָה</h2>
    <div className="grid gap-3 sm:grid-cols-2">{LEVELS.map(option => <Button key={option.id} variant={level.id === option.id ? "default" : "outline"} aria-pressed={level.id === option.id} onClick={() => onLevel(option.id)} className="h-auto min-h-14 whitespace-normal px-4 py-3 text-xl">{option.label}</Button>)}</div>
    <label className="my-6 flex items-center justify-center gap-3 text-xl"><input type="checkbox" className="size-5 accent-primary" checked={timed} onChange={e => onTimed(e.target.checked)} />בְּדִיקַת מְהִירוּת – דַּקָּה אַחַת</label>
    <Button onClick={onStart} className="h-auto px-10 py-4 text-2xl">מַתְחִילִים!</Button>
  </section>;
}