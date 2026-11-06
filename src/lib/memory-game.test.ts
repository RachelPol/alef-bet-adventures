import { expect, it } from "vitest";
import { LEVELS } from "./levels";
import { dealMemory } from "./memory-game";
import { MEMORY_VOCABULARY } from "./memory-vocabulary";
for (const level of LEVELS.filter(l => l.id !== "letters")) it(`memory uses selected ${level.id} level with six valid pairs`, () => {
  const cards = dealMemory(level);
  expect(cards).toHaveLength(12);
  for (const pair of new Set(cards.map(c => c.pair))) {
    const matches = cards.filter(c => c.pair === pair);
    expect(matches).toHaveLength(2);
    const word = matches.find(c => c.kind === "word");
    const picture = matches.find(c => c.kind === "pic");
    expect(word).toBeDefined(); expect(picture).toBeDefined();
    expect(MEMORY_VOCABULARY[level.id]?.some(i => i.text === word?.text && i.picture === picture?.text)).toBe(true);
  }
});
it("does not lock matching cards into symmetric positions", () => {
  let seed = 99;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const level = LEVELS.find(l => l.id === "w3"); if (!level) throw new Error("Missing word level");
  const layouts = Array.from({length:20},()=>dealMemory(level,random));
  expect(new Set(layouts.map(cards=>cards.map(c=>c.id).join())).size).toBe(20);
  expect(layouts.some(cards=>cards.some((card,index)=>cards[11-index]?.pair !== card.pair))).toBe(true);
});it("letters level pairs the same letter twice", () => {
  const level = LEVELS.find(l => l.id === "letters")!; const cards = dealMemory(level);
  expect(cards).toHaveLength(12);
  for (const pair of new Set(cards.map(c => c.pair))) {
    const m = cards.filter(c => c.pair === pair);
    expect(m.map(c => c.kind)).toEqual(["letter", "letter"]); expect(m[0].text).toBe(m[1].text);
    expect(level.items.some(i => i.text === m[0].text)).toBe(true);
  }
});
it("pictures-only mode shows the same picture on both cards", () => {
  for (const level of LEVELS) { const cards = dealMemory(level, Math.random, "pictures");
    for (const pair of new Set(cards.map(c => c.pair))) { const m = cards.filter(c => c.pair === pair);
      expect(m.every(c => c.kind === "pic")).toBe(true); expect(m[0].text).toBe(m[1].text); } }
});
