import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CATALOG, SHOPS, buy, useWallet, type ShopId } from "@/lib/wallet";

export const Route = createFileRoute("/street")({
  head: () => ({
    meta: [
      { title: "רחוב החנויות – אָלֶף בֵּית" },
      { name: "description", content: "משוטטים בין חנויות רהיטים, צעצועים, כלי נגינה וצבעים וקונים בנקודות" },
      { property: "og:title", content: "רחוב החנויות – אָלֶף בֵּית" },
      { property: "og:description", content: "קונים פריטים לחדר עם הנקודות שצברנו בקריאה" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Street,
});

function Street() {
  const [w, update] = useWallet();
  const [shop, setShop] = useState<ShopId | null>(null);
  const [bought, setBought] = useState<string | null>(null);
  const current = SHOPS.find((s) => s.id === shop);

  const purchase = (id: string) => {
    const item = CATALOG.find((i) => i.id === id)!;
    const ok = update((cur) => buy(cur, item, `${id}-${Date.now()}`));
    if (ok) { setBought(id); setTimeout(() => setBought(null), 900); toast.success(`קָנִיתָ ${item.name}! הוּא מְחַכֶּה בַּחֶדֶר 🏡`); }
    else toast.error(`חָסְרוֹת ${item.price - w.points} נְקֻדּוֹת – מַמְשִׁיכִים לִקְרֹא! 📖`);
  };

  return (
    <div className="street-sky relative min-h-screen overflow-hidden">
      <div className="cloud pointer-events-none absolute top-10 text-7xl opacity-80">☁️</div>
      <div className="cloud pointer-events-none absolute top-32 text-5xl opacity-70" style={{ animationDelay: "-18s" }}>☁️</div>
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link to="/room" className="rounded-full bg-glass px-5 py-2 text-lg font-bold shadow-soft backdrop-blur">🏡 לַחֶדֶר</Link>
        <h1 className="font-display text-4xl text-primary-foreground drop-shadow">רְחוֹב הַחֲנֻיּוֹת</h1>
        <span className="rounded-full bg-accent px-5 py-2 text-xl font-bold text-accent-foreground shadow-pop">🪙 {w.points}</span>
      </header>

      <div className="relative z-10 mt-6 flex snap-x gap-6 overflow-x-auto px-6 pb-4 pt-6">
        {SHOPS.map((s) => (
          <button key={s.id} onClick={() => setShop(s.id)} className="shop-front w-56 shrink-0 snap-center text-right">
            <div className={`awning h-10 rounded-t-2xl ${s.tone}`} />
            <div className="rounded-b-2xl bg-card p-4 shadow-pop">
              <div className="font-display text-2xl">{s.name}</div>
              <div className="mt-3 flex h-28 items-center justify-center rounded-xl bg-sky/40 text-6xl">{s.emoji}</div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-sm text-muted-foreground">{CATALOG.filter((i) => i.shop === s.id).length} פְּרִיטִים</span>
                <span className="rounded-lg bg-floor px-3 py-4 text-2xl">🚪</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="bg-pavement absolute inset-x-0 bottom-0 h-40" />
      <div className="pointer-events-none absolute bottom-10 z-10 w-full text-center text-5xl">🌳 🚲 🌳 🐕 🌳</div>

      {current && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center" onClick={() => setShop(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-background shadow-pop animate-in slide-in-from-bottom sm:rounded-3xl">
            <div className={`awning h-8 ${current.tone}`} />
            <div className="flex items-center justify-between p-5">
              <h2 className="font-display text-3xl">{current.emoji} חֲנוּת {current.name}</h2>
              <button onClick={() => setShop(null)} className="rounded-full bg-card px-4 py-2 font-bold shadow-soft">יוֹצְאִים ✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5 pt-0 sm:grid-cols-3">
              {CATALOG.filter((i) => i.shop === current.id).map((i) => {
                const afford = w.points >= i.price;
                return (
                  <div key={i.id} className={`rounded-2xl bg-card p-4 text-center shadow-soft transition ${bought === i.id ? "scale-110" : ""}`}>
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-6xl" style={i.color ? { backgroundColor: i.color } : undefined}>{i.emoji}</div>
                    <div className="mt-2 font-display text-2xl">{i.name}</div>
                    <button onClick={() => purchase(i.id)}
                      className={`mt-3 w-full rounded-xl px-3 py-2 text-lg font-bold ${afford ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      🪙 {i.price} · {afford ? "קְנִיָּה" : "🔒"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
