import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CATALOG, move, useWallet } from "@/lib/wallet";
import { useAccount } from "@/lib/account";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/room")({
  head: () => ({
    meta: [
      { title: "החדר שלי – אָלֶף בֵּית" },
      { name: "description", content: "החדר האישי של הילד: מסדרים רהיטים וצעצועים שקנינו בנקודות" },
      { property: "og:title", content: "החדר שלי – אָלֶף בֵּית" },
      { property: "og:description", content: "מסדרים את החדר עם פריטים שקנינו בנקודות" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Room,
});

function Room() {
  const [w, update] = useWallet();
  const box = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const { user, ready, profile } = useAccount();

  const onMove = (e: React.PointerEvent) => {
    if (!drag || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    update((cur) => move(cur, drag, x, y));
  };

  if (!ready) return <p className="p-8 text-center">טוענים…</p>;
  if (!user || !profile?.name.trim()) return <div className="p-12 text-center"><Button asChild><Link to="/auth">כְּנִיסָה לַחֶשְׁבּוֹן</Link></Button></div>;
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/" className="rounded-full bg-card px-5 py-2 text-lg font-bold shadow-soft">🏠 בית</Link>
        <h1 className="font-display text-4xl text-primary">הַחֶדֶר שֶׁלִּי</h1>
        <span className="rounded-full bg-accent px-5 py-2 text-lg font-bold text-accent-foreground">🪙 {w.points}</span>
      </header>
      <div ref={box} onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}
        className="relative mx-auto mt-6 aspect-[16/10] max-w-5xl touch-none select-none overflow-hidden rounded-3xl shadow-pop">
        <div className="absolute inset-x-0 top-0 h-[60%] bg-muted transition-colors duration-700" style={w.wall ? { backgroundColor: w.wall } : undefined} />
        <div className="floor-boards absolute inset-x-0 bottom-0 h-[40%]" />
        <Link to="/street" className="absolute bottom-[40%] left-[4%] flex h-[42%] w-[12%] flex-col items-center justify-center rounded-t-2xl bg-floor text-center font-bold shadow-soft transition hover:brightness-110">
          <span className="text-4xl">🚪</span><span className="text-sm sm:text-lg">לָרְחוֹב</span>
        </Link>
        {w.owned.map((p) => {
          const item = CATALOG.find((i) => i.id === p.itemId);
          if (!item) return null;
          return (
            <button key={p.uid} title={item.name}
              onPointerDown={(e) => { e.preventDefault(); setDrag(p.uid); }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 text-5xl leading-none drop-shadow-lg sm:text-7xl ${drag === p.uid ? "scale-125 cursor-grabbing" : "cursor-grab"} transition-transform`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: Math.round(p.y) }}>
              {item.emoji}
            </button>
          );
        })}
        {w.owned.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="rounded-2xl bg-glass px-6 py-4 text-center text-xl font-bold backdrop-blur">הַחֶדֶר רֵיק! צְאוּ לָרְחוֹב 🚪 וְקִנּוּ דְּבָרִים בַּנְּקֻדּוֹת שֶׁצְּבַרְתֶּם</p>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-lg text-muted-foreground">גּוֹרְרִים פְּרִיט כְּדֵי לְהָזִיז אוֹתוֹ בַּחֶדֶר</p>
    </div>
  );
}
