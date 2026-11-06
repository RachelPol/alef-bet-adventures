import { expect, it } from "vitest";
import { parentRevealMatches } from "./parent-reveal";
it("reveals the parent form only for the requested shared code 555", () => {
  expect(parentRevealMatches("555")).toBe(true);
  for (const value of ["", "55", "556", "5555"]) expect(parentRevealMatches(value)).toBe(false);
});