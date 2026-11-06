import { describe, expect, it } from "vitest";
import { PRAISE, praiseIndex, progressMilestone } from "./encouragement";
describe("encouragement progression", () => {
  it("varies voices without consecutive repeats", () => {
    for (let last = 0; last < 7; last++) for (const random of [0, .5, .99]) expect(praiseIndex(last, () => random)).not.toBe(last);
  });
  it("makes כל הכבוד the most common praise", () => {
    let kol = 0; for (let i = 0; i < 100; i++) if (PRAISE[praiseIndex(-1, () => i / 100)]?.text === "כָּל הַכָּבוֹד!") kol++;
    expect(kol).toBeGreaterThan(70);
  });
  it("celebrates every five answers, not before any progress", () => {
    expect(progressMilestone(0)).toBe(false);
    expect(progressMilestone(4)).toBe(false);
    expect(progressMilestone(5)).toBe(true);
    expect(progressMilestone(10)).toBe(true);
  });
  it("celebrates memory progress after three pairs", () => {
    expect(progressMilestone(2, 3)).toBe(false);
    expect(progressMilestone(3, 3)).toBe(true);
  });
});