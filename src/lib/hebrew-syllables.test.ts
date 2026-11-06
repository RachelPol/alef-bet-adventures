import { describe, expect, it } from "vitest";
import { syllableSound } from "./hebrew-syllables";
import { LEVELS } from "./levels";
describe("isolated Hebrew syllables", () => {
  it.each([["בָּ", "bo"], ["בָ", "vo"], ["שָׁ", "sho"], ["תָ", "so"], ["כׇּ", "ko"]])("pronounces every Ashkenazi kamatz as o in %s", (text,sound)=>expect(syllableSound(text,"litvish")).toBe(sound));
  it("distinguishes bet-tsere from bet-patach", () => { expect(syllableSound("בֵּ", "litvish")).toBe("bey"); expect(syllableSound("בַּ", "litvish")).toBe("ba"); });
  it("reads standalone shuruk as u without a v consonant", () => { expect(syllableSound("וּ", "litvish")).toBe("u"); expect(syllableSound("וּ", "israeli")).toBe("u"); });
  it("reads the photographed shin-patach as sha, not so, in Litvish", () => {
    expect(syllableSound("שַׁ", "litvish")).toBe("sha");
    expect(syllableSound("שַׁ", "litvish")).toBe("sha");
  });
  it.each([["בַּ", "ba"], ["בַ", "va"], ["כַּ", "ka"], ["כַ", "kha"], ["פַּ", "pa"], ["פַ", "fa"], ["תַּ", "ta"], ["תַ", "sa"], ["שַׂ", "sa"]])("preserves the written consonant in %s", (text, sound) => {
    expect(syllableSound(text, "litvish")).toBe(sound);
    expect(syllableSound(text.normalize("NFD"), "litvish")).toBe(sound);
  });
  it.each([["לַ", "la"], ["לָ", "lo"], ["לֵ", "ley"], ["לִ", "li"], ["לֹ", "ley"], ["לֻ", "lu"]])("maps the Litvish vowel in %s", (text, sound) => expect(syllableSound(text, "litvish")).toBe(sound));
  it("keeps Israeli vowels and tav unchanged", () => {
    expect(syllableSound("תַ", "israeli")).toBe("ta");
    expect(syllableSound("לָ", "israeli")).toBe("la");
    expect(syllableSound("לֹ", "israeli")).toBe("lo");
  });
  it("does not guess pronunciation for whole words or unvowelled letters", () => {
    expect(syllableSound("פִּיל", "litvish")).toBeNull();
    expect(syllableSound("שׁ", "litvish")).toBeNull();
  });
  it("resolves every dealt syllable in both dialects, including soft tav", () => {
    const level = LEVELS.find(level => level.id === "syl");
    if (!level) throw new Error("Missing syllables level");
    expect(level.items.some(item => item.text === "תַ")).toBe(true);
    for (const item of level.items) {
      expect(syllableSound(item.say, "litvish")).toMatch(/^[a-z]+$/);
      expect(syllableSound(item.say, "israeli")).toMatch(/^[a-z]+$/);
    }
  });
});