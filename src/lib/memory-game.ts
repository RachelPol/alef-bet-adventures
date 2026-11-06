import { LETTERS, pick, shuffle } from "./letters";
import type { Level } from "./levels";
export type MemoryCard = { id: string; pair: string; kind: "word" | "pic"; text: string };
export function dealMemory(level: Level): MemoryCard[] {
  return shuffle(pick(level.items, 6).flatMap((item, i) => {
    const picture = level.id.startsWith("w") ? LETTERS.find(l => l.word === item.text)?.emoji : undefined;
    return [{ id: `${i}-a`, pair: `${i}`, kind: "word" as const, text: item.text }, { id: `${i}-b`, pair: `${i}`, kind: picture ? "pic" as const : "word" as const, text: picture ?? item.text }];
  }));
}