import { describe, expect, it } from "vitest";
import { praiseIndex, progressMilestone } from "./encouragement";
describe("encouragement progression", () => {
  it("varies voices without consecutive repeats", () => {
    for (let last = 0; last < 3; last++) for (const random of [0, .5, .99]) expect(praiseIndex(last, () => random)).not.toBe(last);
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