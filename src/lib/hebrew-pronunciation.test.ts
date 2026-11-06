import { describe, it, expect } from "vitest";
import { consonantSound, pronunciationHints } from "./hebrew-pronunciation";
describe("written Hebrew consonants control pronunciation", () => {
  it("pronounces the dotted pe in פיל as p, not f", () => {
    expect(consonantSound("פִּ")).toBe("p");
    expect(consonantSound("פִּ")).toBe("p");
    expect(pronunciationHints("פִּיל")).toContain("never fil");
  });
  it("distinguishes bet and vet", () => { expect(consonantSound("בַּ")).toBe("b"); expect(consonantSound("בַ")).toBe("v"); });
  it("distinguishes kaf and khaf including final khaf", () => { expect(consonantSound("כָּ")).toBe("k"); expect(consonantSound("כָ")).toBe("kh"); expect(consonantSound("ךָ")).toBe("kh"); });
  it("distinguishes pe and fe including final fe", () => { expect(consonantSound("פֵּ")).toBe("p"); expect(consonantSound("פֵ")).toBe("f"); expect(consonantSound("ף")).toBe("f"); });
  it("distinguishes shin and sin", () => { expect(consonantSound("שִׁ")).toBe("sh"); expect(consonantSound("שִׂ")).toBe("s"); });
});