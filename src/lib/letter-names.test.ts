import { expect, it } from "vitest";
import { letterNameSound, letterNameHints, letterNamePrompt } from "./letter-names";
import { speechPrompt, speechFallbackPrompt } from "./speech-pacing";
import { LEVELS } from "./levels";
it.each(["israeli", "litvish"] as const)("keeps hard and soft bet distinct through the real letter activity and fallback in %s", dialect => {
  const level = LEVELS.find(l => l.id === "letters");
  const hard = level?.items.find(i => i.text === "בּ");
  const soft = level?.items.find(i => i.text === "ב");
  if (!hard || !soft) throw new Error("Missing bet variants");
  for (const prompt of [speechPrompt, speechFallbackPrompt]) {
    expect(prompt(hard.say, dialect)).toContain(dialect === "litvish" ? 'EXACT sound: "beys"' : 'EXACT sound: "bet"');
    expect(prompt(hard.say, dialect)).toContain("NEVER v");
    expect(prompt(soft.say, dialect)).toContain(dialect === "litvish" ? 'EXACT sound: "veys"' : 'EXACT sound: "vet"');
    expect(prompt(soft.say, dialect)).toContain("NEVER b");
    expect(prompt(soft.say, dialect).endsWith(dialect === "litvish" ? "וֵייס" : "וֵט")).toBe(true);
  }
  expect(letterNamePrompt("בַּיִת", dialect)).toBeNull();
});
it("uses tsere in bet/beis, never the house-word patach", () => {
  expect(letterNameSound("בֵּית", "litvish")).toBe("beys");
  expect(letterNameSound("בֵּית", "israeli")).toBe("bet");
  expect(letterNameSound("בֵית", "litvish")).toBe("veys");
  expect(letterNameSound("בַּיִת", "litvish")).toBeNull();
});
it.each([["יוֹד", "yud"], ["קוֹף", "kuf"], ["כַּף", "kof"], ["תָו", "sov"]])("resolves familiar Litvish name %s", (name, sound) => expect(letterNameSound(name, "litvish")).toBe(sound));
it("retains names in combined letter and example utterances", () => expect(letterNameHints("בֵּית. בַּיִת", "litvish")).toContain('say only "beys"'));