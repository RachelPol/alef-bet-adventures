import { it, expect } from "vitest";
import { readingMatch } from "./reading-trial";
it("compares the spoken word without awarding marks for niqqud", () => expect(readingMatch("פִּיל", "פיל.")).toBe(true));
it("does not accept a different word", () => expect(readingMatch("פִּיל", "דג")).toBe(false));
it("does not accept extra words or silence", () => { expect(readingMatch("פִּיל", "פיל גדול")).toBe(false); expect(readingMatch("פִּיל", "")).toBe(false); });