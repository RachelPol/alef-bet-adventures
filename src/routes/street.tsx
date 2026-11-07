import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { CATALOG, SHOPS, buy, useWallet, type ShopId } from "@/lib/wallet";
import { useAccount } from "@/lib/account";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ITEM_ART } from "@/lib/room-art";
import { Home, Coins, ShoppingBag, ArrowLeft, ArrowRight, Check } from "lucide-react";
const WorldScene = lazy(() => import("@/components/WorldScene"));
const STREET_SHOPS: ShopId[] = ["toys", "furniture", "music", "paint", "plants"];
const SHOP_ORDER = [...STREET_SHOPS, "sports", "crafts"] as const;
const EAST_SHOPS: ShopId[] = ["sports", "crafts"];
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
 const [streetPart, setStreetPart] = useState<"west" | "east">("west");
 const [wallet, update] = useWallet(); const [shop, setShop] = useState<ShopId | null>(null); const [bought,setBought] = useState<string|null>(null);
 const current=SHOPS.find(s=>s.id===shop); const { user,ready,profile }=useAccount();
 const purchase=(id:string)=>{ const item=CATALOG.find(i=>i.id===id); if (!item) return; const uid=crypto.randomUUID(); const ok=update(w=>buy(w,item,uid)); if(ok){setBought(id);toast.success(item.shop==='paint' ? 'הקירות נצבעו!' : `${item.name} מחכה לך בחדר!`);}else toast.error('אין מספיק נקודות לפריט הזה'); };
 if(!ready)return <p className="p-8 text-center">טוענים…</p>;
 if(!user||!profile?.name?.trim())return <div className="p-12 text-center"><Button asChild><Link to="/auth">כְּנִיסָה לַחֶשְׁבּוֹן</Link></Button></div>;
 return <main className="world-page">
  <header className="world-header"><Button asChild variant="outline" className="h-14 px-6 text-xl"><Link to="/room"><Home />לחדר שלי</Link></Button><div className="text-center"><p className="text-sm text-muted-foreground">מסע הקניות של {profile.name}</p><h1 className="text-3xl font-bold">רְחוֹב הַחֲנֻיּוֹת</h1></div><span className="world-balance"><Coins />{wallet.points}</span></header>
  <div className="street-scroll" dir="ltr">{[streetPart].map(section => <section key={section} className={`world-street street-${section}`} aria-label={section === "west" ? "רחוב החנויות" : "רחוב הספורט היצירה והגן"}><ClientOnly><Suspense fallback={<div className="world-loading">מכינים את הרחוב…</div>}><WorldScene kind="street" streetSection={section} wallet={wallet} /></Suspense></ClientOnly>
    <div className="street-buildings">{(section === "west" ? STREET_SHOPS : EAST_SHOPS).map(id=>{const s=SHOPS.find(s=>s.id===id);if(!s)return null;return <Button key={id} variant="ghost" className="street-building" aria-label={`כניסה לחנות ${s.name}`} onClick={()=>{setShop(id);setBought(null);}}><span className="street-building-sign" dir="rtl"><span aria-hidden="true">{s.emoji}</span><span>{s.name}</span></span></Button>;})}</div>
  </section>)}</div>
  <nav className="street-travel" aria-label="טיול ברחוב"><Button variant="outline" className="h-14 gap-2 px-5 text-lg" disabled={streetPart==="west"} aria-label="לתחילת הרחוב" onClick={()=>setStreetPart("west")}><ArrowLeft />לתחילת הרחוב</Button><Button variant="outline" className="h-14 gap-2 px-5 text-lg" disabled={streetPart==="east"} aria-label="להמשך הרחוב" onClick={()=>setStreetPart("east")}>להמשך הרחוב<ArrowRight /></Button></nav>
  <Dialog open={Boolean(current)} onOpenChange={open=>{if(!open)setShop(null);}}><DialogContent className="shop-dialog"><DialogHeader><DialogTitle className="text-3xl">{current?.emoji} {current?.name}</DialogTitle><DialogDescription className="text-lg">🪙 {wallet.points} נקודות בארנק</DialogDescription></DialogHeader>
   <div className="shop-products">{CATALOG.filter(i=>i.shop===shop).map(item=>{const afford=wallet.points>=item.price; return <article className="shop-product" key={item.id}>
     <div className={`shop-item-image ${item.color ? `paint-${item.id}` : ''}`}>{ITEM_ART[item.id]?<img src={ITEM_ART[item.id]} alt={item.name} className="h-full w-full object-contain" />:<span className="text-6xl">{item.emoji}</span>}</div>
     <h3 className="mt-3 text-xl font-bold">{item.name}</h3><p className="my-2 flex items-center justify-center gap-1 text-lg"><Coins className="size-4" />{item.price} נקודות</p>
     <Button className="h-14 w-full gap-2 text-lg" disabled={!afford} onClick={()=>purchase(item.id)} aria-label={`קניית ${item.name} ב-${item.price} נקודות`}>{bought===item.id?<Check />:<ShoppingBag className="size-4" />}{afford?'קנייה':`חסרות ${item.price-wallet.points}`}</Button>
   </article>;})}</div>
   <div className="flex flex-wrap justify-between gap-2"><Button variant="outline" onClick={()=>{const index=SHOP_ORDER.indexOf(shop??'toys');setShop(SHOP_ORDER[(index+1)%SHOP_ORDER.length]??'toys');setBought(null);}}><ArrowLeft />לחנות הבאה</Button><Button asChild><Link to="/room"><Home />לחדר שלי</Link></Button><Button variant="ghost" onClick={()=>setShop(null)}>לרחוב<ArrowRight /></Button></div>
  </DialogContent></Dialog>
 </main>;
}
