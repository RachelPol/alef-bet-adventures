import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ShopId = "furniture" | "toys" | "music" | "paint" | "plants";
export type ShopItem = { id: string; name: string; emoji: string; price: number; shop: ShopId; color?: string };
export type Placed = { uid: string; itemId: string; x: number; y: number };
export type Wallet = { points: number; owned: Placed[]; wall: string | null };

export const SHOPS: { id: ShopId; name: string; emoji: string; tone: string }[] = [
  { id: "furniture", name: "רָהִיטִים", emoji: "🛋️", tone: "text-primary" },
  { id: "toys", name: "צַעֲצוּעִים", emoji: "🧸", tone: "text-secondary" },
  { id: "music", name: "כְּלֵי נְגִינָה", emoji: "🎸", tone: "text-accent" },
  { id: "paint", name: "צְבָעִים", emoji: "🎨", tone: "text-success" },
  { id: "plants", name: "צְמָחִים וְקִשּׁוּט", emoji: "🪴", tone: "text-destructive" },
];

export const CATALOG: ShopItem[] = [
  { id: "chair", name: "כִּסֵּא", emoji: "🪑", price: 10, shop: "furniture" },
  { id: "bed", name: "מִטָּה", emoji: "🛏️", price: 40, shop: "furniture" },
  { id: "sofa", name: "סַפָּה", emoji: "🛋️", price: 35, shop: "furniture" },
  { id: "lamp", name: "מְנוֹרָה", emoji: "🪔", price: 12, shop: "furniture" },
  { id: "tv", name: "טֶלֶוִיזְיָה", emoji: "📺", price: 50, shop: "furniture" },
  { id: "window", name: "חַלּוֹן", emoji: "🪟", price: 20, shop: "furniture" },
  { id: "bear", name: "דֻּבִּי", emoji: "🧸", price: 8, shop: "toys" },
  { id: "ball", name: "כַּדּוּר", emoji: "⚽", price: 5, shop: "toys" },
  { id: "kite", name: "עֲפִיפוֹן", emoji: "🪁", price: 9, shop: "toys" },
  { id: "car", name: "מְכוֹנִית", emoji: "🚗", price: 15, shop: "toys" },
  { id: "robot", name: "רוֹבּוֹט", emoji: "🤖", price: 25, shop: "toys" },
  { id: "train", name: "רַכֶּבֶת", emoji: "🚂", price: 30, shop: "toys" },
  { id: "guitar", name: "גִּיטָרָה", emoji: "🎸", price: 30, shop: "music" },
  { id: "drum", name: "תֹּף", emoji: "🥁", price: 20, shop: "music" },
  { id: "piano", name: "פְּסַנְתֵּר", emoji: "🎹", price: 45, shop: "music" },
  { id: "violin", name: "כִּנּוֹר", emoji: "🎻", price: 35, shop: "music" },
  { id: "trumpet", name: "חֲצוֹצְרָה", emoji: "🎺", price: 25, shop: "music" },
  { id: "pink", name: "וָרֹד", emoji: "🩷", price: 15, shop: "paint", color: "#f9c6d8" },
  { id: "blue", name: "תְּכֵלֶת", emoji: "🩵", price: 15, shop: "paint", color: "#bfe3f7" },
  { id: "green", name: "יָרֹק", emoji: "💚", price: 15, shop: "paint", color: "#c8ecc4" },
  { id: "yellow", name: "צָהֹב", emoji: "💛", price: 15, shop: "paint", color: "#fbeaa5" },
  { id: "purple", name: "סָגֹל", emoji: "💜", price: 20, shop: "paint", color: "#ddd0f5" },
  { id: "plant", name: "עָצִיץ", emoji: "🪴", price: 7, shop: "plants" },
  { id: "flowers", name: "פְּרָחִים", emoji: "💐", price: 10, shop: "plants" },
  { id: "cactus", name: "קַקְטוּס", emoji: "🌵", price: 6, shop: "plants" },
  { id: "picture", name: "תְּמוּנָה", emoji: "🖼️", price: 18, shop: "plants" },
  { id: "fish", name: "אַקְוַרְיוּם", emoji: "🐠", price: 28, shop: "plants" },
  { id: "clock", name: "שָׁעוֹן", emoji: "🕰️", price: 14, shop: "plants" },
];

export const EMPTY: Wallet = { points: 0, owned: [], wall: null };

export function addPoints(w: Wallet, n: number): Wallet {
  return n > 0 ? { ...w, points: w.points + n } : w;
}

/** Returns the new wallet, or null when the child can't afford the item. */
export function buy(w: Wallet, item: ShopItem, uid: string, random = Math.random): Wallet | null {
  if (w.points < item.price) return null;
  const points = w.points - item.price;
  if (item.shop === "paint") return { ...w, points, wall: item.color ?? null };
  const placed = { uid, itemId: item.id, x: 20 + random() * 60, y: 65 + random() * 20 };
  return { ...w, points, owned: [...w.owned, placed] };
}

export function move(w: Wallet, uid: string, x: number, y: number): Wallet {
  const c = (v: number) => Math.min(95, Math.max(5, v));
  return { ...w, owned: w.owned.map((p) => (p.uid === uid ? { ...p, x: c(x), y: c(y) } : p)) };
}

const KEY = "wallet";
const EVT = "wallet-change";
let owner: string | null = null;
let snapshot: Wallet = EMPTY;
let loaded = false;
let queue = Promise.resolve();
const notify = () => window.dispatchEvent(new Event(EVT));

export async function connectWallet(userId: string | null) {
  if (owner === userId && loaded) return;
  owner = userId; loaded = false; snapshot = EMPTY; notify();
  if (!userId) { loaded = true; notify(); return; }
  const { data, error } = await supabase.from("wallets").select("points,owned,wall").eq("user_id", userId).single();
  if (owner !== userId) return;
  if (error) { toast.error("לא הצלחנו לטעון את הנקודות; נסו שוב"); return; }
  snapshot = { points: data.points, owned: data.owned as Placed[], wall: data.wall };
  loaded = true; notify();
}

function load(): Wallet {
  return snapshot;
}

export function updateWallet(f: (w: Wallet) => Wallet | null): boolean {
  if (!owner || !loaded) return false;
  const next = f(load());
  if (!next) return false;
  snapshot = next; notify();
  const userId = owner;
  queue = queue.then(async () => {
    if (owner !== userId) return;
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, error } = await supabase.from("wallets").select("points,owned,wall,version").eq("user_id", userId).single();
      if (error || owner !== userId) throw new Error("wallet read failed");
      const remote = f({ points: data.points, owned: data.owned as Placed[], wall: data.wall });
      if (!remote) throw new Error("wallet purchase unavailable");
      const { data: saved, error: saveError } = await supabase.from("wallets").update({ ...remote, version: data.version + 1 }).eq("user_id", userId).eq("version", data.version).select("user_id");
      if (saveError) throw saveError;
      if (saved?.length) return;
    }
    throw new Error("wallet conflict");
  }).catch(async () => {
    if (owner !== userId) return;
    toast.error("השמירה לא הצליחה; הנקודות נטענות מחדש");
    loaded = false; await connectWallet(userId);
  });
  return true;
}

export function useWallet() {
  const [w, setW] = useState<Wallet>(EMPTY);
  useEffect(() => {
    const sync = () => setW(load());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const update = useCallback(updateWallet, []);
  return [w, update] as const;
}
