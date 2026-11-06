import { expect, it } from "vitest";
import { LEVELS } from "./levels";
import { dealMemory } from "./memory-game";
for (const level of LEVELS) it(`memory uses selected ${level.id} level with six valid pairs`, () => {
  const cards = dealMemory(level);
  expect(cards).toHaveLength(12);
  for (const pair of new Set(cards.map(c => c.pair))) {
    const matches = cards.filter(c => c.pair === pair);
    expect(matches).toHaveLength(2);
    expect(level.items.some(i => i.text === matches.find(c => c.kind === "word")?.text)).toBe(true);
  }
});