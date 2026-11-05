import { CONFUSABLE, LETTERS } from "./letters";

export type Item = { text: string; say: string };
export type Level = { id: string; label: string; unit: string; items: Item[] };

const w = (s: string): Item[] => s.split(" ").map((t) => ({ text: t, say: t }));

const VOWELS = ["ָ", "ַ", "ֵ", "ִ", "ֹ", "ֻ"];
const SYL_LETTERS = ["בּ", "ב", "ג", "ד", "ה", "ל", "מ", "נ", "ס", "פּ", "פ", "ר", "שׁ", "שׂ", "תּ", "כּ", "כ", "ק", "ט", "ז"];
const SYLLABLES: Item[] = SYL_LETTERS.flatMap((l) => VOWELS.map((v) => ({ text: l + v, say: l + v })));

export const LEVELS: Level[] = [
  { id: "letters", label: "אוֹתִיּוֹת", unit: "אוֹתִיּוֹת", items: LETTERS.map((l) => ({ text: l.char, say: l.name })) },
  { id: "syl", label: "הֲבָרוֹת", unit: "הֲבָרוֹת", items: SYLLABLES },
  { id: "w2", label: "מִלִּים – 2 אוֹתִיּוֹת", unit: "מִלִּים", items: w("דָּג יָד גַּן עֵץ צָב לֵב הַר נֵר אַף פֶּה כַּף קַו חַם אֵם אָב בַּד שַׁר גַּג מַס פַּח") },
  { id: "w3", label: "מִלִּים – 3 אוֹתִיּוֹת", unit: "מִלִּים", items: w("סוּס בַּיִת שֶׁמֶשׁ כֶּלֶב דֶּלֶת יֶלֶד סֵפֶר חָלָב גָּמָל פִּיל שׁוּק דֹּב יָרֵחַ מֶלֶךְ גֶּשֶׁם עָנָן כִּסֵּא לֶחֶם") },
  { id: "w4", label: "מִלִּים – 4 אוֹתִיּוֹת", unit: "מִלִּים", items: w("חָתוּל כַּדּוּר תַּפּוּז פַּרְפַּר אַרְיֵה שָׁעוֹן חַלּוֹן מִכְתָּב עִפָּרוֹן מַגָּשׁ סַבְתָּא גַּמָּד") },
  { id: "w5", label: "מִלִּים – 5 אוֹתִיּוֹת", unit: "מִלִּים", items: w("שֻׁלְחָן צִפּוֹרִים גְּלִידָה טֶלֶפוֹן מְכוֹנִית מַחְבֶּרֶת שְׂמִיכָה תַּפּוּחִים מִטְרִיָּה") },
  { id: "long", label: "מִלִּים אֲרֻכּוֹת", unit: "מִלִּים", items: w("תַּרְנְגוֹלֶת אוֹפַנַּיִם הִיפּוֹפּוֹטָם טֶלֶוִיזְיָה פַּרְפָּרִים מַחְשֵׁבוֹת יוֹם־הֻלֶּדֶת קַרְנַף־הַמִּדְבָּר אֲוִירוֹנִים") },
];

export function textSize(t: string) {
  const n = t.replace(/[\u0591-\u05C7]/g, "").length;
  if (n <= 1) return "text-[8rem]";
  if (n <= 2) return "text-8xl";
  if (n <= 4) return "text-7xl";
  if (n <= 6) return "text-6xl";
  return "text-5xl";
}

export function pickPair(level: Level): Item[] {
  if (level.id === "letters" && Math.random() < 0.5) {
    const [a, b] = CONFUSABLE[Math.floor(Math.random() * CONFUSABLE.length)]!;
    const items = [a, b].map((c) => level.items.find((i) => i.text === c)!);
    return Math.random() < 0.5 ? items : items.reverse();
  }
  return [...level.items].sort(() => Math.random() - 0.5).slice(0, 2);
}
