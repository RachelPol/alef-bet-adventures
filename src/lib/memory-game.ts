import { shuffled } from "./random";
import { MEMORY_VOCABULARY } from "./memory-vocabulary";
import type { Level } from "./levels";
import { ALL_PRACTICE, filterPractice, type PracticeSettings } from "./practice-settings";
export type MemoryMode = "words" | "pictures";
export type MemoryCard = { id: string; pair: string; kind: "word" | "pic" | "letter"; text: string };
/** words: word+picture (letters level: same letter twice); pictures: classic picture+picture. */
export function dealMemory(level: Level, random = Math.random, mode: MemoryMode = "words", practice: PracticeSettings = ALL_PRACTICE): MemoryCard[] {
  if (mode === "words" && level.id === "letters") {
    const letters = shuffled([...new Set(filterPractice(level.items, practice).map(i => i.text))], random).slice(0, 6);
    return shuffled(letters.flatMap((text, i) => [
      { id: `${i}-a`, pair: `${i}`, kind: "letter" as const, text },
      { id: `${i}-b`, pair: `${i}`, kind: "letter" as const, text },
    ]), random);
  }
  const source = MEMORY_VOCABULARY[level.id] ?? MEMORY_VOCABULARY["w2"] ?? [];
  const items = shuffled(filterPractice(source, practice), random).slice(0, 6);
  return shuffled(items.flatMap((item, i) => [
    { id: `${i}-a`, pair: `${i}`, kind: mode === "pictures" ? "pic" as const : "word" as const, text: mode === "pictures" ? item.picture : item.text },
    { id: `${i}-b`, pair: `${i}`, kind: "pic" as const, text: item.picture },
  ]), random);
}
