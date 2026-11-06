import { CONFUSABLE, LETTERS } from "./letters";
import { shuffled } from "./random";

export type Item = { text: string; say: string };
export type Level = { id: string; label: string; unit: string; items: Item[] };

const w = (s: string): Item[] => s.split(" ").map((t) => ({ text: t, say: t }));

const VOWELS = ["ָ", "ַ", "ֵ", "ִ", "ֹ", "ֻ"];
const SYL_LETTERS = ["בּ", "ב", "ג", "ד", "ה", "ל", "מ", "נ", "ס", "פּ", "פ", "ר", "שׁ", "שׂ", "תּ", "ת", "כּ", "כ", "ק", "ט", "ז"];
const SYLLABLES: Item[] = SYL_LETTERS.flatMap((l) => VOWELS.map((v) => ({ text: l + v, say: l + v })));

export const LEVELS: Level[] = [
  { id: "letters", label: "אוֹתִיּוֹת", unit: "אוֹתִיּוֹת", items: LETTERS.map((l) => ({ text: l.char, say: l.name })) },
  { id: "syl", label: "הֲבָרוֹת", unit: "הֲבָרוֹת", items: SYLLABLES },
  { id: "w2", label: "מִלִּים – 2 אוֹתִיּוֹת", unit: "מִלִּים", items: w("דָּג יָד גַּן עֵץ צָב לֵב הַר נֵר אַף פֶּה כַּף קַו חַם אֵם אָב בַּד שַׁר גַּג פַּח חַג עַם גַּל דַּף זָר חֹם כֹּחַ לַח מַר נָס סַל עַל קַר רַךְ שָׁם תָּם אַל בַּר גַּם דַּק זַן חָם טַל מַס נַח פַּז צַד קָם רַב שָׁר תָּו") },
  { id: "w3", label: "מִלִּים – 3 אוֹתִיּוֹת", unit: "מִלִּים", items: w("סוּס בַּיִת שֶׁמֶשׁ כֶּלֶב דֶּלֶת יֶלֶד סֵפֶר חָלָב גָּמָל פִּיל שׁוּק דֹּב יָרֵחַ מֶלֶךְ גֶּשֶׁם עָנָן כִּסֵּא לֶחֶם יָם עִיר כּוֹס כּוֹבַע פֶּרַח גֶּזֶר תּוֹף חוֹף נָמֵר זָהָב כֶּסֶף שָׁלוֹם בֹּקֶר עֶרֶב גָּדוֹל קָטָן אַבָּא אִמָּא דֶּשֶׁא קֶשֶׁת מַיִם שִׁיר לַיְלָה בּוּל") },
  { id: "w4", label: "מִלִּים – 4 אוֹתִיּוֹת", unit: "מִלִּים", items: w("חָתוּל כַּדּוּר תַּפּוּז פַּרְפַּר אַרְיֵה שָׁעוֹן חַלּוֹן מִכְתָּב מַגָּשׁ סַבְתָּא גַּמָּד צִפּוֹר שׁוֹקוֹ מִטְבָּח סַבָּא אַרְנָב כַּרְטִיס תַּלְמִיד מַפְתֵּחַ שֻׁלְחָן מַזְלֵג עֲגָבָנִיָּה גַּרְבַּיִם דְּבוֹרָה מְנוֹרָה קוֹמְקוּם צַלַּחַת מִגְדָּל תִּינוֹק גִּבּוֹר") },
  { id: "w5", label: "מִלִּים – 5 אוֹתִיּוֹת", unit: "מִלִּים", items: w("צִפּוֹרִים גְּלִידָה טֶלֶפוֹן מְכוֹנִית מַחְבֶּרֶת שְׂמִיכָה תַּפּוּחִים מִטְרִיָּה מִשְׁקָפַיִם סְפָרִים מַטְבֵּעַ כַּדּוּרִים פַּרְפָּרִים חֲתוּלִים מִסְפָּרַיִם שׁוֹקוֹלָד אֲרוּחָה תַּלְמִידִים מְנוֹרוֹת שְׁעוֹנִים גַּמָּדִים קִשְׁקוּשׁ") },
  { id: "long", label: "מִלִּים אֲרֻכּוֹת – תְּהִלִּים", unit: "מִלִּים", items: w("רְשָׁעִים וּבְדֶרֶךְ חַטָּאִים וּבְמוֹשַׁב וּבְתוֹרָתוֹ יֶהְגֶּה שָׁתוּל פַּלְגֵי בְּעִתּוֹ יַצְלִיחַ תִּדְּפֶנּוּ מִזְמוֹר אֶחְסָר בִּנְאוֹת יַרְבִּיצֵנִי מְנֻחוֹת יְנַהֲלֵנִי יְשׁוֹבֵב בְּמַעְגְּלֵי צַלְמָוֶת שִׁבְטְךָ וּמִשְׁעַנְתֶּךָ יְנַחֲמֻנִי תַּעֲרֹךְ צֹרְרָי דִּשַּׁנְתָּ יִרְדְּפוּנִי וְשַׁבְתִּי הֶהָרִים מֵאַיִן עֶזְרִי רַגְלֶךָ שֹׁמְרֶךָ יִשְׁמָרְךָ נַפְשֶׁךָ וּבוֹאֶךָ") },
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
    const selected = CONFUSABLE[Math.floor(Math.random() * CONFUSABLE.length)];
    const [a, b] = selected ?? ["א", "ג"];
    const items = [a, b].map((c) => level.items.find((i) => i.text === c));
    if (items[0] && items[1]) {
      const pair = items as Item[];
      return Math.random() < 0.5 ? pair : pair.reverse();
    }
  }
  const a = draw(level);
  let b = draw(level);
  if (b === a) b = draw(level);
  return [a, b];
}

// Shuffled deck per level: every item appears once before any repeats.
const decks = new Map<string, Item[]>();
const previous = new Map<string, Item>();
export function draw(level: Level): Item {
  let deck = decks.get(level.id);
  if (!deck || deck.length === 0) {
    deck = shuffled(level.items);
    if (deck[deck.length - 1] === previous.get(level.id) && deck.length > 1) {
      const last = deck.pop(); if (last) deck.unshift(last);
    }
    decks.set(level.id, deck);
  }
  const item = deck.pop();
  if (!item) throw new Error("הרמה אינה כוללת מילים");
  previous.set(level.id, item);
  return item;
}
