import { it, expect } from "vitest";
import { readingMatch, shouldApproveReading } from "./reading-trial";
it("compares the spoken word without awarding marks for niqqud", () => expect(readingMatch("פִּיל", "פיל.")).toBe(true));
it("does not accept a different word", () => expect(readingMatch("פִּיל", "דג")).toBe(false));
it("does not accept extra words or silence", () => { expect(readingMatch("פִּיל", "פיל גדול")).toBe(false); expect(readingMatch("פִּיל", "")).toBe(false); });
it("automatically approves a completed matching reading", () => expect(shouldApproveReading("פִּיל", "פיל", true, false, true)).toBe(true));
it("never approves partial, failed, cancelled or mismatching readings", () => {
  expect(shouldApproveReading("פִּיל", "פיל", false, false, true)).toBe(false);
  expect(shouldApproveReading("פִּיל", "פיל", true, true, true)).toBe(false);
  expect(shouldApproveReading("פִּיל", "פיל", true, false, false)).toBe(false);
  expect(shouldApproveReading("פִּיל", "דג", true, false, true)).toBe(false);
});