export type Letter = { char: string; name: string; word: string; emoji: string };

export const LETTERS: Letter[] = [
  { char: "א", name: "אָלֶף", word: "אַרְיֵה", emoji: "🦁" },
  { char: "ב", name: "בֵּית", word: "בַּיִת", emoji: "🏠" },
  { char: "ג", name: "גִּימֶל", word: "גָּמָל", emoji: "🐪" },
  { char: "ד", name: "דָּלֶת", word: "דָּג", emoji: "🐟" },
  { char: "ה", name: "הֵא", word: "הַר", emoji: "⛰️" },
  { char: "ו", name: "וָו", word: "וֶרֶד", emoji: "🌹" },
  { char: "ז", name: "זַיִן", word: "זֶבְּרָה", emoji: "🦓" },
  { char: "ח", name: "חֵית", word: "חָתוּל", emoji: "🐱" },
  { char: "ט", name: "טֵית", word: "טַוָּס", emoji: "🦚" },
  { char: "י", name: "יוֹד", word: "יָד", emoji: "✋" },
  { char: "כ", name: "כַּף", word: "כַּדּוּר", emoji: "⚽" },
  { char: "ל", name: "לָמֶד", word: "לֵב", emoji: "❤️" },
  { char: "מ", name: "מֵם", word: "מַיִם", emoji: "💧" },
  { char: "נ", name: "נוּן", word: "נֵר", emoji: "🕯️" },
  { char: "ס", name: "סָמֶךְ", word: "סוּס", emoji: "🐴" },
  { char: "ע", name: "עַיִן", word: "עֵץ", emoji: "🌳" },
  { char: "פ", name: "פֵּא", word: "פִּיל", emoji: "🐘" },
  { char: "צ", name: "צָדִי", word: "צָב", emoji: "🐢" },
  { char: "ק", name: "קוֹף", word: "קוֹף", emoji: "🐒" },
  { char: "ר", name: "רֵישׁ", word: "רַכֶּבֶת", emoji: "🚂" },
  { char: "ש", name: "שִׁין", word: "שֶׁמֶשׁ", emoji: "☀️" },
  { char: "ת", name: "תָּו", word: "תַּפּוּחַ", emoji: "🍎" },
];

let current: HTMLAudioElement | null = null;

export function speak(text: string) {
  if (typeof window === "undefined") return;
  current?.pause();
  const audio = new Audio(`/api/public/tts?q=${encodeURIComponent(text)}`);
  current = audio;
  audio.play().catch(() => speakBrowser(text));
}

function speakBrowser(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "he-IL";
  u.rate = 0.8;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("he"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function pick<T>(arr: T[], n: number, exclude: T[] = []): T[] {
  const pool = arr.filter((x) => !exclude.includes(x));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n);
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
