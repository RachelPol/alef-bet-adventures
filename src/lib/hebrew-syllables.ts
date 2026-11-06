import { consonantSound } from "./hebrew-pronunciation";
import { tavSound, type ReadingDialect } from "./reading-dialect";

const PLAIN: Record<string, string> = { א: "", ע: "", ג: "g", ד: "d", ה: "h", ו: "v", ז: "z", ח: "kh", ט: "t", י: "y", ל: "l", מ: "m", נ: "n", ס: "s", ק: "k", ר: "r", צ: "ts" };
const VOWELS: Record<string, [string, string]> = {
  "ַ": ["a", "a"], "ָ": ["a", "o"], "ֵ": ["e", "ey"], "ֶ": ["e", "e"],
  "ִ": ["i", "i"], "ֹ": ["o", "ey"], "ֻ": ["u", "u"], "ׇ": ["o", "o"],
};

/** Only isolated consonant + vowel clusters: never guess sheva or whole-word phonology. */
export function syllableSound(text: string, dialect: ReadingDialect): string | null {
  const cluster = text.trim().normalize("NFD");
  if (cluster === "וּ") return "u";
  if (!/^[א-ת][\u0591-\u05c7]+$/u.test(cluster)) return null;
  const vowels = [...cluster].filter(mark => VOWELS[mark]);
  if (vowels.length !== 1) return null;
  const mark = vowels[0];
  if (!mark) return null;
  const pair = VOWELS[mark];
  if (!pair) return null;
  const base = cluster[0];
  if (!base) return null;
  const consonant = base === "ת" ? tavSound(cluster, dialect) : consonantSound(cluster) ?? PLAIN[base];
  if (consonant === undefined) return null;
  return consonant + pair[dialect === "litvish" ? 1 : 0];
}

export function syllablePrompt(text: string, dialect: ReadingDialect): string | null {
  const sound = syllableSound(text, dialect);
  if (sound === null) return null;
  const kamatz = dialect === "litvish" && /[ָׇ]/u.test(text) ? "KAMATZ must be rounded o, like kamatz katan, NEVER ah/a. " : "";
  return `${kamatz}Say exactly one short Hebrew learning syllable, not a letter name or a word. The written syllable is ${text}. Its EXACT spoken sound is "${sound}". The phonetic spelling is pronunciation guidance, never spell its letters aloud. a = ah, o = pure rounded o without an English oh glide, e = eh, ey = the vowel in say, i = ee, u = oo, kh = Hebrew ח, sh = English sh. Preserve the initial consonant exactly. Patach is always a, never o, even in Litvish. Shin with a right dot is sh, never s; sin with a left dot is s. Do not add a final consonant, a vowel, an explanation or a letter name. Use a clear natural voice without stretching. Output ONLY the sound "${sound}". TEXT: ${text}`;
}