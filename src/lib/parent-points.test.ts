import { describe, it, expect } from "vitest";
import { parentPointsSchema, parentCodeMatches } from "./parent-points";
describe("parent recovery authorization", () => {
  it("rejects missing or wrong parent credentials", async () => {
    expect(await parentCodeMatches("test-only-parent", undefined)).toBe(false);
    expect(await parentCodeMatches("wrong-parent-code", "test-only-parent")).toBe(false);
    expect(await parentCodeMatches("test-only-parent", "test-only-parent")).toBe(true);
  });
  it("only allows positive integer point credits", () => {
    for (const points of [-1, 0, 1.5, 10001]) expect(parentPointsSchema.safeParse({ code: "test-only-parent", points }).success).toBe(false);
    expect(parentPointsSchema.parse({ code: "test-only-parent", points: 100 }).points).toBe(100);
  });
});