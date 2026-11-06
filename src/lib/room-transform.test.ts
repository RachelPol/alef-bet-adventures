import { describe, expect, it } from "vitest";
import { roomTransform } from "./room-transform";
describe("room adjustments", () => {
  it("supports full rotation in either direction", () => {
    expect(roomTransform({ rotation: 375 }).rotation).toBe(15);
    expect(roomTransform({ rotation: -15 }).rotation).toBe(345);
  });
  it("supports enlarging, shrinking and flipping", () => {
    expect(roomTransform({ scale: 2, flipped: true })).toEqual({ rotation: 0, scale: 2, flipped: true });
    expect(roomTransform({ scale: .5 }).scale).toBe(.5);
  });
  it("preserves the original appearance of previously purchased objects", () => {
    expect(roomTransform({})).toEqual({ rotation: 0, scale: 1, flipped: false });
  });
});