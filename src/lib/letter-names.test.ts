import { expect, it } from "vitest";
import { letterNameSound, letterNameHints } from "./letter-names";
it("uses tsere in bet/beis, never the house-word patach", () => {
  expect(letterNameSound("בֵּית", "litvish")).toBe("beys");
  expect(letterNameSound("בֵּית", "israeli")).toBe("bet");
  expect(letterNameSound("בֵית", "litvish")).toBe("veys");
  expect(letterNameSound("בַּיִת", "litvish")).toBeNull();
});
it.each([["יוֹד", "yud"], ["קוֹף", "kuf"], ["כַּף", "kof"], ["תָו", "sov"]])("resolves familiar Litvish name %s", (name, sound) => expect(letterNameSound(name, "litvish")).toBe(sound));
it("retains names in combined letter and example utterances", () => expect(letterNameHints("בֵּית. בַּיִת", "litvish")).toContain('say only "beys"'));