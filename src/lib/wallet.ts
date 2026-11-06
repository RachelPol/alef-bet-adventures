import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { roomTransform, type RoomTransform } from "./room-transform";

export type ShopId = "furniture" | "toys" | "music" | "paint" | "plants" | "books" | "sports" | "crafts";
export type ShopItem = { id: string; name: string; emoji: string; price: number; shop: ShopId; color?: string };
export type Placed = { uid: string; itemId: string; x: number; y: number } & RoomTransform;
export type Wallet = { points: number; owned: Placed[]; wall: string | null };

export const SHOPS: { id: ShopId; name: string; emoji: string; tone: string }[] = [
  { id: "furniture", name: "רָהִיטִים", emoji: "🛋️", tone: "text-primary" },
  { id: "toys", name: "צַעֲצוּעִים", emoji: "🧸", tone: "text-secondary" },
  { id: "music", name: "כְּלֵי נְגִינָה", emoji: "🎸", tone: "text-accent" },
  { id: "paint", name: "צְבָעִים", emoji: "🎨", tone: "text-success" },
  { id: "plants", name: "צְמָחִים וְקִשּׁוּט", emoji: "🪴", tone: "text-destructive" },
  { id: "sports", name: "סְפּוֹרְט", emoji: "🏀", tone: "text-secondary" },
  { id: "crafts", name: "יְצִירָה", emoji: "🖍️", tone: "text-success" },
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
  { id: "desk", name: "שֻׁלְחַן כְּתִיבָה", emoji: "🪑", price: 32, shop: "furniture" },
  { id: "armchair", name: "כֻּרְסָה", emoji: "🛋️", price: 24, shop: "furniture" },
  { id: "stool", name: "שְׁרַפְרַף", emoji: "🪑", price: 9, shop: "furniture" },
  { id: "bookshelf", name: "מַדַּף סְפָרִים", emoji: "📚", price: 28, shop: "furniture" },
  { id: "rug", name: "שָׁטִיחַ", emoji: "🟦", price: 18, shop: "furniture" },
  { id: "pillow", name: "כָּרִית", emoji: "🛏️", price: 6, shop: "furniture" },
  { id: "wardrobe", name: "אָרוֹן", emoji: "🚪", price: 38, shop: "furniture" },
  { id: "nightstand", name: "שִׁדָּה", emoji: "🗄️", price: 22, shop: "furniture" },
  { id: "rocking-chair", name: "כִּסֵּא נַדְנֵדָה", emoji: "🪑", price: 26, shop: "furniture" },
  { id: "doll", name: "בֻּבָּה", emoji: "🪆", price: 12, shop: "toys" },
  { id: "blocks", name: "קֻבִּיּוֹת", emoji: "🧱", price: 16, shop: "toys" },
  { id: "puzzle", name: "פָּאזֶל", emoji: "🧩", price: 10, shop: "toys" },
  { id: "rocket", name: "טִיל צַעֲצוּעַ", emoji: "🚀", price: 22, shop: "toys" },
  { id: "horse", name: "סוּס צַעֲצוּעַ", emoji: "🐴", price: 18, shop: "toys" },
  { id: "duck", name: "בַּרְוָז", emoji: "🦆", price: 6, shop: "toys" },
  { id: "yo-yo", name: "יוֹ־יוֹ", emoji: "🪀", price: 7, shop: "toys" },
  { id: "helicopter", name: "מַסּוֹק צַעֲצוּעַ", emoji: "🚁", price: 24, shop: "toys" },
  { id: "sailboat", name: "סִירַת מִפְרָשׂ", emoji: "⛵", price: 14, shop: "toys" },
  { id: "saxophone", name: "סַקְסוֹפוֹן", emoji: "🎷", price: 32, shop: "music" },
  { id: "accordion", name: "אַקוֹרְדְּיוֹן", emoji: "🪗", price: 36, shop: "music" },
  { id: "flute", name: "חָלִיל", emoji: "🪈", price: 12, shop: "music" },
  { id: "banjo", name: "בַּנְג'וֹ", emoji: "🪕", price: 28, shop: "music" },
  { id: "maracas", name: "רַעֲשָׁנִים", emoji: "🪇", price: 8, shop: "music" },
  { id: "microphone", name: "מִיקְרוֹפוֹן", emoji: "🎤", price: 18, shop: "music" },
  { id: "headphones", name: "אָזְנִיּוֹת", emoji: "🎧", price: 20, shop: "music" },
  { id: "bell", name: "פַּעֲמוֹן", emoji: "🔔", price: 7, shop: "music" },
  { id: "bongo", name: "תֻּפֵּי בּוֹנְגּוֹ", emoji: "🥁", price: 16, shop: "music" },
  { id: "ukulele", name: "יוּקַלֵלֵי", emoji: "🎸", price: 22, shop: "music" },
  { id: "mint", name: "מֶנְטָה", emoji: "💚", price: 15, shop: "paint", color: "#bce7d9" },
  { id: "peach", name: "אֲפַרְסֵק", emoji: "🧡", price: 15, shop: "paint", color: "#f7c9b1" },
  { id: "white", name: "לָבָן", emoji: "🤍", price: 10, shop: "paint", color: "#f5f7f7" },
  { id: "turquoise", name: "טוּרְקִיז", emoji: "🩵", price: 18, shop: "paint", color: "#a5dedc" },
  { id: "coral", name: "אַלְמֹג", emoji: "🧡", price: 18, shop: "paint", color: "#f2aea1" },
  { id: "lavender", name: "לָבֶנְדֶּר", emoji: "💜", price: 18, shop: "paint", color: "#d7d7f5" },
  { id: "gray", name: "אָפֹר בָּהִיר", emoji: "🩶", price: 12, shop: "paint", color: "#d7dfe4" },
  { id: "red", name: "אָדֹם", emoji: "❤️", price: 20, shop: "paint", color: "#ed9397" },
  { id: "sky", name: "כְּחֹל שָׁמַיִם", emoji: "🩵", price: 18, shop: "paint", color: "#a9caef" },
  { id: "lime", name: "יָרֹק לִימוֹן", emoji: "💚", price: 18, shop: "paint", color: "#d6e7a8" },
  { id: "sunflower", name: "חַמָּנִיָּה", emoji: "🌻", price: 8, shop: "plants" },
  { id: "bonsai", name: "עֵץ זָעִיר", emoji: "🌳", price: 20, shop: "plants" },
  { id: "tulip", name: "צִבְעוֹנִי", emoji: "🌷", price: 7, shop: "plants" },
  { id: "mirror", name: "מַרְאָה", emoji: "🪞", price: 18, shop: "plants" },
  { id: "globe", name: "גְּלוֹבּוּס", emoji: "🌍", price: 22, shop: "plants" },
  { id: "shell", name: "צְדָף", emoji: "🐚", price: 5, shop: "plants" },
  { id: "stars", name: "כּוֹכָבִים לַקִּיר", emoji: "⭐", price: 9, shop: "plants" },
  { id: "rainbow", name: "קֶשֶׁת לַקִּיר", emoji: "🌈", price: 12, shop: "plants" },
  { id: "vase", name: "אֲגַרְטָל", emoji: "🏺", price: 14, shop: "plants" },
  { id: "storybook", name: "סֵפֶר סִפּוּרִים", emoji: "📕", price: 10, shop: "books" },
  { id: "animal-book", name: "סֵפֶר חַיּוֹת", emoji: "📗", price: 12, shop: "books" },
  { id: "space-book", name: "סֵפֶר חָלָל", emoji: "📘", price: 14, shop: "books" },
  { id: "tehillim", name: "תְּהִלִּים", emoji: "📖", price: 12, shop: "books" },
  { id: "siddur", name: "סִדּוּר", emoji: "📙", price: 12, shop: "books" },
  { id: "atlas", name: "אַטְלָס", emoji: "🗺️", price: 16, shop: "books" },
  { id: "poems", name: "סֵפֶר שִׁירִים", emoji: "📔", price: 9, shop: "books" },
  { id: "encyclopedia", name: "אֶנְצִיקְלוֹפֶּדְיָה", emoji: "📚", price: 24, shop: "books" },
  { id: "coloring-book", name: "סֵפֶר צְבִיעָה", emoji: "📒", price: 7, shop: "books" },
  { id: "nature-book", name: "סֵפֶר טֶבַע", emoji: "📗", price: 11, shop: "books" },
  { id: "riddle-book", name: "סֵפֶר חִידוֹת", emoji: "📕", price: 10, shop: "books" },
  { id: "book-set", name: "מַאֲרַז סְפָרִים", emoji: "📚", price: 30, shop: "books" },
  { id: "basketball", name: "כַּדּוּר סַל", emoji: "🏀", price: 12, shop: "sports" },
  { id: "tennis", name: "מַחְבֵּט טֶנִיס", emoji: "🎾", price: 18, shop: "sports" },
  { id: "badminton", name: "בַּדְמִינְטוֹן", emoji: "🏸", price: 14, shop: "sports" },
  { id: "ping-pong", name: "טֶנִיס שֻׁלְחָן", emoji: "🏓", price: 16, shop: "sports" },
  { id: "skateboard", name: "גַּלְגֶּשֶׁת", emoji: "🛹", price: 28, shop: "sports" },
  { id: "skates", name: "גַּלְגִּלִּיּוֹת", emoji: "🛼", price: 25, shop: "sports" },
  { id: "bicycle", name: "אוֹפַנַּיִם", emoji: "🚲", price: 50, shop: "sports" },
  { id: "scooter", name: "קוֹרְקִינֵט", emoji: "🛴", price: 35, shop: "sports" },
  { id: "bowling", name: "בָּאוּלִינְג", emoji: "🎳", price: 20, shop: "sports" },
  { id: "volleyball", name: "כַּדּוּר עָף", emoji: "🏐", price: 12, shop: "sports" },
  { id: "trophy", name: "גָּבִיעַ", emoji: "🏆", price: 22, shop: "sports" },
  { id: "medal", name: "מֵדַלְיָה", emoji: "🏅", price: 8, shop: "sports" },
  { id: "crayons", name: "צִבְעֵי שַׁעֲוָה", emoji: "🖍️", price: 6, shop: "crafts" },
  { id: "brush", name: "מִכְחוֹל", emoji: "🖌️", price: 5, shop: "crafts" },
  { id: "palette", name: "עֶרְכַּת צְבָעִים", emoji: "🎨", price: 14, shop: "crafts" },
  { id: "pencils", name: "עֶפְרוֹנוֹת", emoji: "✏️", price: 5, shop: "crafts" },
  { id: "notebook", name: "מַחְבֶּרֶת צִיּוּר", emoji: "📓", price: 7, shop: "crafts" },
  { id: "scissors", name: "מִסְפָּרַיִם", emoji: "✂️", price: 6, shop: "crafts" },
  { id: "yarn", name: "צֶמֶר", emoji: "🧶", price: 8, shop: "crafts" },
  { id: "thread", name: "חוּטֵי רִקְמָה", emoji: "🧵", price: 7, shop: "crafts" },
  { id: "easel", name: "כַּן צִיּוּר", emoji: "🖼️", price: 24, shop: "crafts" },
  { id: "origami", name: "נְיָרוֹת קִפּוּל", emoji: "📃", price: 6, shop: "crafts" },
  { id: "beads", name: "חֲרוּזִים", emoji: "📿", price: 10, shop: "crafts" },
  { id: "clay", name: "חֵמָר", emoji: "🏺", price: 9, shop: "crafts" },
  { id: "bunk-bed", name: "מִטַּת קוֹמָתַיִם", emoji: "🛏️", price: 65, shop: "furniture" },
  { id: "toy-cabinet", name: "אָרוֹן מִשְׂחָקִים פָּתוּחַ", emoji: "🧸", price: 42, shop: "furniture" },
  { id: "beanbag", name: "כֻּרְסַת פּוּף", emoji: "🛋️", price: 20, shop: "furniture" },
  { id: "kids-table", name: "שֻׁלְחָן יְלָדִים", emoji: "🪑", price: 30, shop: "furniture" },
  { id: "play-kitchen", name: "מִטְבַּח צַעֲצוּעַ", emoji: "🍳", price: 38, shop: "toys" },
  { id: "dollhouse", name: "בֵּית בֻּבּוֹת", emoji: "🏠", price: 35, shop: "toys" },
  { id: "abacus", name: "חֶשְׁבּוֹנִיָּה", emoji: "🧮", price: 14, shop: "toys" },
  { id: "fire-truck", name: "כַּבָּאִית צַעֲצוּעַ", emoji: "🚒", price: 24, shop: "toys" },
  { id: "cello", name: "צֶ׳לוֹ", emoji: "🎻", price: 42, shop: "music" },
  { id: "xylophone", name: "קְסִילוֹפוֹן", emoji: "🎵", price: 18, shop: "music" },
  { id: "harp", name: "נֵבֶל", emoji: "🎶", price: 48, shop: "music" },
  { id: "music-stand", name: "עַמּוּד תָּוִים", emoji: "🎼", price: 12, shop: "music" },
  { id: "hanging-plant", name: "עָצִיץ תָּלוּי", emoji: "🪴", price: 16, shop: "plants" },
  { id: "fountain", name: "מִזְרָקָה לַחֶדֶר", emoji: "⛲", price: 32, shop: "plants" },
  { id: "butterflies", name: "פַּרְפָּרִים לַקִּיר", emoji: "🦋", price: 10, shop: "plants" },
  { id: "lantern", name: "פָּנָס קִשּׁוּט", emoji: "🏮", price: 14, shop: "plants" },
  { id: "gym-mat", name: "מִזְרַן הִתְעַמְּלוּת", emoji: "🤸", price: 22, shop: "sports" },
  { id: "football", name: "כַּדּוּר רַגְלִי", emoji: "🏈", price: 14, shop: "sports" },
  { id: "jump-rope", name: "חֶבֶל קְפִיצָה", emoji: "➰", price: 8, shop: "sports" },
  { id: "frisbee", name: "צַלַּחַת מְעוֹפֶפֶת", emoji: "🥏", price: 9, shop: "sports" },
  { id: "watercolors", name: "צִבְעֵי מַיִם", emoji: "🎨", price: 12, shop: "crafts" },
  { id: "stamps", name: "עֶרְכַּת חוֹתָמוֹת", emoji: "🔖", price: 10, shop: "crafts" },
  { id: "knitting", name: "עֶרְכַּת סְרִיגָה", emoji: "🧶", price: 14, shop: "crafts" },
  { id: "mosaic", name: "עֶרְכַּת פְּסֵיפָס", emoji: "🧩", price: 16, shop: "crafts" },
  { id: "alphabet-book", name: "סֵפֶר אָלֶף בֵּית", emoji: "📘", price: 10, shop: "books" },
  { id: "adventure-book", name: "סֵפֶר הַרְפַּתְקָאוֹת", emoji: "📕", price: 14, shop: "books" },
  { id: "garden-book", name: "סֵפֶר הַגִּנָּה", emoji: "📗", price: 11, shop: "books" },
  { id: "cookbook", name: "סֵפֶר מַתְכּוֹנִים", emoji: "📙", price: 13, shop: "books" },
  { id: "lemon", name: "צְהַב לִימוֹן", emoji: "💛", price: 16, shop: "paint", color: "#f4eb88" },
  { id: "rose", name: "וָרֹד עָדִין", emoji: "🩷", price: 16, shop: "paint", color: "#f3d9e8" },
  { id: "sea", name: "כְּחֹל יָם", emoji: "💙", price: 20, shop: "paint", color: "#7abacb" },
  { id: "pistachio", name: "יָרֹק פִּסְטוּק", emoji: "💚", price: 16, shop: "paint", color: "#bfdbb4" },
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

export function transformItem(w: Wallet, uid: string, change: RoomTransform): Wallet {
  return { ...w, owned: w.owned.map(p => p.uid === uid ? { ...p, ...roomTransform({ ...p, ...change }) } : p) };
}

const EVT = "wallet-change";
let owner: string | null = null;
let snapshot: Wallet = EMPTY;
let loaded = false;
let queue = Promise.resolve();
let connectionRevision = 0;
const pending: { userId: string; apply: (w: Wallet) => Wallet | null }[] = [];
const notify = () => window.dispatchEvent(new Event(EVT));

export async function flushWallet() { await queue; }

// Warn before a full-page departure while accepted changes are still saving.
if (typeof window !== "undefined") window.addEventListener("beforeunload", event => {
  if (pending.length) { event.preventDefault(); event.returnValue = ""; }
});

export async function connectWallet(userId: string | null) {
  const revision = ++connectionRevision;
  if (owner !== userId) await flushWallet();
  if (revision !== connectionRevision) return;
  if (owner === userId && loaded) return;
  owner = userId; loaded = false; snapshot = EMPTY; notify();
  if (!userId) { loaded = true; notify(); return; }
  for (let attempt = 0; ; attempt++) {
    const { data, error } = await supabase.from("wallets").select("points,owned,wall").eq("user_id", userId).single();
    if (owner !== userId || revision !== connectionRevision) return;
    if (!error && data) {
      snapshot = { points: data.points, owned: data.owned as Placed[], wall: data.wall };
      loaded = true; notify();
      // Changes earned while the account was still loading are applied now instead of being lost.
      const waiting = deferred.splice(0).filter(d => d.userId === userId);
      for (const d of waiting) updateWallet(d.f);
      return;
    }
    if (attempt === 1) toast.error("טוענים את הנקודות מחדש…");
    // Keep retrying transient load failures (e.g. network filters) rather than leaving the wallet unusable.
    await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempt, 8000)));
    if (owner !== userId || revision !== connectionRevision) return;
  }
}
const deferred: { userId: string; f: (w: Wallet) => Wallet | null }[] = [];

function load(): Wallet {
  return snapshot;
}

export async function reloadWallet() {
  await queue;
  loaded = false; connectionRevision++;
  await connectWallet(owner);
}

export function updateWallet(f: (w: Wallet) => Wallet | null): boolean {
  if (!owner) return false;
  if (!loaded) { deferred.push({ userId: owner, f }); return true; }
  const next = f(load());
  if (!next) return false;
  // Fix the randomly placed coordinates at acceptance, rather than dealing them again on save.
  const added = next.owned.filter(item => !snapshot.owned.some(old => old.uid === item.uid));
  const operation = { userId: owner, apply: (w: Wallet) => {
    const result = f(w);
    return result ? { ...result, owned: result.owned.map(item => added.find(p => p.uid === item.uid) ?? item) } : null;
  } };
  pending.push(operation);
  snapshot = next; notify();
  const userId = owner;
  queue = queue.then(async () => {
    if (owner !== userId) return;
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data, error } = await supabase.from("wallets").select("points,owned,wall,version").eq("user_id", userId).single();
      if (error || owner !== userId) throw new Error("wallet read failed");
      const remote = operation.apply({ points: data.points, owned: data.owned as Placed[], wall: data.wall });
      if (!remote) throw new Error("wallet purchase unavailable");
      const { data: saved, error: saveError } = await supabase.from("wallets").update({ ...remote, version: data.version + 1 }).eq("user_id", userId).eq("version", data.version).select("user_id");
      if (saveError) throw saveError;
      if (saved?.length) {
        pending.splice(pending.indexOf(operation), 1);
        // Read back the committed account state and retain any later optimistic changes.
        snapshot = pending.filter(p => p.userId === userId).reduce((w, p) => p.apply(w) ?? w, remote);
        notify();
        return;
      }
    }
    throw new Error("wallet conflict");
  }).catch(async () => {
    pending.splice(pending.indexOf(operation), 1);
    if (owner !== userId) return;
    toast.error("השמירה לא הצליחה; הנקודות נטענות מחדש");
    const { data } = await supabase.from("wallets").select("points,owned,wall").eq("user_id", userId).single();
    if (data && owner === userId) {
      snapshot = pending.filter(p => p.userId === userId).reduce((w, p) => p.apply(w) ?? w, { points: data.points, owned: data.owned as Placed[], wall: data.wall });
      notify();
    }
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
