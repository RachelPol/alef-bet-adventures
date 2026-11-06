import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { CATALOG, move, useWallet } from "@/lib/wallet";
import { useAccount } from "@/lib/account";
import { Button } from "@/components/ui/button";
import { ParentPoints } from "@/components/ParentPoints";
import { ITEM_ART } from "@/lib/room-art";
import { Home, ShoppingBag, Coins } from "lucide-react";
const WorldScene = lazy(() => import("@/components/WorldScene"));
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
 const [parentOpen,setParentOpen] = useState(false);
 const [wallet, update] = useWallet(); const { user, ready, profile } = useAccount();
 if (!ready) return <p className="p-8 text-center">טוענים…</p>;
 if (!user || !profile?.name?.trim()) return <div className="p-12 text-center"><Button asChild><Link to="/auth">כְּנִיסָה לַחֶשְׁבּוֹן</Link></Button></div>;
 return <main className="world-page">
   <header className="world-header">
     <Button asChild variant="outline" className="h-14 px-6 text-xl"><Link to="/"><Home />בית</Link></Button>
     <div className="text-center"><p className="text-sm text-muted-foreground">העולם של {profile.name}</p><h1 className="text-3xl font-bold">הַחֶדֶר שֶׁלִּי</h1></div>
     <Button variant="secondary" className="world-balance h-14" aria-label="הנקודות שלי" onClick={()=>setParentOpen(true)}><Coins />{wallet.points}</Button>
   </header>
   <section className="world-room" aria-label="החדר שלי">
     <ClientOnly><Suspense fallback={<div className="world-loading">מכינים את החדר…</div>}><WorldScene kind="room" wallet={wallet} onMove={(uid,x,y) => update(w => move(w,uid,x,y))} /></Suspense></ClientOnly>
     <div className="world-shopping"><Button asChild className="h-14 gap-3 px-6 text-xl"><Link to="/street"><ShoppingBag />יוצאים למסע קניות</Link></Button></div>
   </section>
   <section className="world-inventory"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">הפריטים שלי <span className="text-muted-foreground">({wallet.owned.length})</span></h2><Button asChild variant="outline"><Link to="/street"><ShoppingBag />קניות</Link></Button></div>
     <div className="flex gap-3 overflow-x-auto pb-4">{wallet.owned.map(p => { const item=CATALOG.find(i => i.id===p.itemId); if (!item) return null; return <Button key={p.uid} variant="outline" className="h-28 w-28 shrink-0 flex-col gap-2" onClick={() => update(w => move(w,p.uid,50,78))} title="מרכוז הפריט בחדר">{ITEM_ART[item.id] ? <img src={ITEM_ART[item.id]} alt="" className="h-16 w-20 object-contain" /> : <span className="text-4xl">{item.emoji}</span>}<span className="text-base">{item.name}</span></Button>; })}</div>
   </section>
   <ParentPoints open={parentOpen} onOpenChange={setParentOpen} />
 </main>;
}
