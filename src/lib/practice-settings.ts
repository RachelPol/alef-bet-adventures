export const PRACTICE_LETTERS = ["א", "בּ", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כּ", "כ", "ל", "מ", "נ", "ס", "ע", "פּ", "פ", "צ", "ק", "ר", "שׁ", "שׂ", "תּ", "ת"];
export const PRACTICE_VOWELS = [
  { id: "kamatz", label: "קמץ", sample: "אָ" }, { id: "patach", label: "פתח", sample: "אַ" },
  { id: "tsere", label: "צירה", sample: "אֵ" }, { id: "segol", label: "סגול", sample: "אֶ" },
  { id: "hiriq", label: "חיריק", sample: "אִ" }, { id: "holam", label: "חולם", sample: "אֹ" },
  { id: "kubutz", label: "קובוץ", sample: "אֻ" }, { id: "shuruk", label: "שורוק", sample: "וּ" },
  { id: "sheva", label: "שווא", sample: "אְ" }, { id: "hataf-patach", label: "חטף פתח", sample: "אֲ" },
  { id: "hataf-segol", label: "חטף סגול", sample: "אֱ" }, { id: "hataf-kamatz", label: "חטף קמץ", sample: "אֳ" },
];
export type PracticeSettings = { letters: string[] | null; vowels: string[] | null };
export const ALL_PRACTICE: PracticeSettings = { letters: null, vowels: null };
export function normalizePractice(value: unknown): PracticeSettings {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const clean = (v: unknown, allowed: string[]) => Array.isArray(v) ? [...new Set(v.filter((s): s is string => typeof s === "string" && allowed.includes(s)))] : null;
  return { letters: clean(raw['letters'], PRACTICE_LETTERS), vowels: clean(raw['vowels'], PRACTICE_VOWELS.map(v => v.id)) };
}
const FINALS: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
const MARKS: Record<string, string> = { "ָ": "kamatz", "ׇ": "kamatz", "ַ": "patach", "ֵ": "tsere", "ֶ": "segol", "ִ": "hiriq", "ֹ": "holam", "ֺ": "holam", "ֻ": "kubutz", "ְ": "sheva", "ֲ": "hataf-patach", "ֱ": "hataf-segol", "ֳ": "hataf-kamatz" };
export function matchesPractice(text: string, settings: PracticeSettings): boolean {
  const clusters = text.normalize("NFD").match(/[א-ת][\u0591-\u05C7]*/g) ?? [];
  return clusters.every(cluster => {
    const base = FINALS[cluster[0] ?? ""] ?? cluster[0] ?? "";
    const letter = base === "ש" ? base + (cluster.includes("ׂ") ? "ׂ" : "ׁ") : ["ב", "כ", "פ", "ת"].includes(base) && cluster.includes("ּ") ? base + "ּ" : base;
    if (settings.letters !== null && !settings.letters.includes(letter)) return false;
    if (settings.vowels === null) return true;
    if (base === "ו" && cluster.includes("ּ") && !settings.vowels.includes("shuruk")) return false;
    return [...cluster].every(mark => !MARKS[mark] || settings.vowels?.includes(MARKS[mark] ?? ""));
  });
}
export function filterPractice<T extends { text: string }>(items: T[], settings: PracticeSettings): T[] {
  return items.filter(item => matchesPractice(item.text, settings));
}