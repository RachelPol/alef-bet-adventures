import { expect, it } from "vitest";
import { ALL_PRACTICE, filterPractice, matchesPractice, normalizePractice } from "./practice-settings";

it("restricts every written letter, including final forms", () => {
  const settings = { letters: ["מ", "ל", "כ"], vowels: null };
  expect(matchesPractice("מֶלֶךְ", settings)).toBe(true);
  expect(matchesPractice("מַיִם", settings)).toBe(false);
});
it("distinguishes dagesh and shin/sin regardless of mark order", () => {
  const settings = { letters: ["בּ", "שׁ"], vowels: null };
  expect(matchesPractice("בַּ", settings)).toBe(true);
  expect(matchesPractice("בַ", settings)).toBe(false);
  expect(matchesPractice("שַׁ", settings)).toBe(true);
  expect(matchesPractice("שַׂ", settings)).toBe(false);
});
it("restricts vowels without excluding isolated letters", () => {
  const settings = { letters: null, vowels: ["patach"] };
  expect(matchesPractice("בַּ", settings)).toBe(true);
  expect(matchesPractice("בָּ", settings)).toBe(false);
  expect(matchesPractice("בּ", settings)).toBe(true);
});
it("handles shuruk, kamatz katan and holam variants", () => {
  expect(matchesPractice("וּ", { letters: null, vowels: ["shuruk"] })).toBe(true);
  expect(matchesPractice("וּ", { letters: null, vowels: ["kubutz"] })).toBe(false);
  expect(matchesPractice("כׇּ", { letters: null, vowels: ["kamatz"] })).toBe(true);
  expect(matchesPractice("וֺ", { letters: null, vowels: ["holam"] })).toBe(true);
});
it("never falls back to unrelated items for an empty selection", () => {
  expect(filterPractice([{ text: "א" }, { text: "ב" }], { letters: ["ג"], vowels: null })).toEqual([]);
  expect(filterPractice([{ text: "א" }], ALL_PRACTICE)).toEqual([{ text: "א" }]);
  expect(normalizePractice({ letters: ["א", "א", "invalid"], vowels: ["patach"] })).toEqual({ letters: ["א"], vowels: ["patach"] });
});