import { streamSpeech } from "./stream-speech";
import { toast } from "sonner";
import { shuffled } from "./random";
import { stopEncouragement } from "./encouragement-audio";
export type Letter = { char: string; name: string; word: string; emoji: string };

export const LETTERS: Letter[] = [
  { char: "א", name: "אָלֶף", word: "אַרְיֵה", emoji: "🦁" },
  { char: "בּ", name: "בֵּית", word: "בַּיִת", emoji: "🏠" },
  { char: "ב", name: "בֵית", word: "כּוֹבַע", emoji: "🎩" },
  { char: "ג", name: "גִּימֶל", word: "גָּמָל", emoji: "🐪" },
  { char: "ד", name: "דָּלֶת", word: "דָּג", emoji: "🐟" },
  { char: "ה", name: "הֵא", word: "הַר", emoji: "⛰️" },
  { char: "ו", name: "וָו", word: "וֶרֶד", emoji: "🌹" },
  { char: "ז", name: "זַיִן", word: "זֶבְּרָה", emoji: "🦓" },
  { char: "ח", name: "חֵית", word: "חָתוּל", emoji: "🐱" },
  { char: "ט", name: "טֵית", word: "טַוָּס", emoji: "🦚" },
  { char: "י", name: "יוֹד", word: "יָד", emoji: "✋" },
  { char: "כּ", name: "כַּף", word: "כַּדּוּר", emoji: "⚽" },
  { char: "כ", name: "חָף", word: "דְּרָכִים", emoji: "🛣️" },
  { char: "ל", name: "לָמֶד", word: "לֵב", emoji: "❤️" },
  { char: "מ", name: "מֵם", word: "מַיִם", emoji: "💧" },
  { char: "נ", name: "נוּן", word: "נֵר", emoji: "🕯️" },
  { char: "ס", name: "סָמֶךְ", word: "סוּס", emoji: "🐴" },
  { char: "ע", name: "עַיִן", word: "עֵץ", emoji: "🌳" },
  { char: "פּ", name: "פֵּא", word: "פִּיל", emoji: "🐘" },
  { char: "פ", name: "פֵא", word: "סוּפָה", emoji: "🌪️" },
  { char: "צ", name: "צָדִי", word: "צָב", emoji: "🐢" },
  { char: "ק", name: "קוֹף", word: "קוֹף", emoji: "🐒" },
  { char: "ר", name: "רֵישׁ", word: "רַכֶּבֶת", emoji: "🚂" },
  { char: "שׁ", name: "שִׁין", word: "שֶׁמֶשׁ", emoji: "☀️" },
  { char: "שׂ", name: "שִׂין", word: "שָׂעִיר", emoji: "🐐" },
  { char: "תּ", name: "תָּו", word: "תַּפּוּחַ", emoji: "🍎" },
  { char: "ת", name: "תָו", word: "בַּיִת", emoji: "🏡" },
];

let current: AbortController | null = null;

export function speak(text: string) {
  if (typeof window === "undefined") return;
  stopEncouragement();
  current?.abort();
  const controller = new AbortController();
  current = controller;
  window.speechSynthesis?.cancel();
  void streamSpeech("/api/public/tts", text, controller.signal).catch(error => {
    if (controller.signal.aborted || current !== controller) return;
    toast.error(error instanceof Error ? error.message : "הקול אינו זמין כרגע");
  });
}

export function pick<T>(arr: T[], n: number, exclude: T[] = []): T[] {
  const pool = arr.filter((x) => !exclude.includes(x));
  return shuffled(pool).slice(0, n);
}

export function shuffle<T>(arr: T[]): T[] {
  return shuffled(arr);
}

// Pairs that look alike and children often confuse
export const CONFUSABLE: [string, string][] = [
  ["שׁ", "שׂ"], ["בּ", "ב"], ["כּ", "כ"], ["פּ", "פ"],
  ["ב", "כ"], ["ד", "ר"], ["ה", "ח"], ["ו", "ז"], ["ס", "ם"],
];
