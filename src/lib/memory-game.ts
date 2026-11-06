import { shuffled } from "./random";
import { MEMORY_VOCABULARY } from "./memory-vocabulary";
import type { Level } from "./levels";
export type MemoryCard = { id: string; pair: string; kind: "word" | "pic"; text: string };
export function dealMemory(level: Level, random = Math.random): MemoryCard[] {
  const source = MEMORY_VOCABULARY[level.id] ?? MEMORY_VOCABULARY["w2"] ?? [];
  const items = shuffled(source, random).slice(0, 6);
  return shuffled(items.flatMap((item, i) => [
    { id: `${i}-a`, pair: `${i}`, kind: "word" as const, text: item.text },
    { id: `${i}-b`, pair: `${i}`, kind: "pic" as const, text: item.picture },
  ]), random);
}