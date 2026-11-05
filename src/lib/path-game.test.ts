import { describe, expect, it } from "vitest";
import { gateIsOpen, nextPathMove, PATH_GOAL, replaceDepartedCard } from "./path-game";

describe("Word path rules", () => {
  it("opens the gate after 25 correct answers, not before", () => {
    expect(PATH_GOAL).toBe(25);
    expect(gateIsOpen(24)).toBe(false);
    expect(gateIsOpen(25)).toBe(true);
  });
  it("offers up, down, left and right rather than a row-by-row route", () => {
    const moves = [0, .26, .51, .76].map((random) => nextPathMove(7, 5, null, () => random));
    expect(moves).toEqual([
      { index: 2, direction: "up" }, { index: 12, direction: "down" },
      { index: 6, direction: "left" }, { index: 8, direction: "right" },
    ]);
    expect(nextPathMove(7, 5, "left", () => .5).direction).not.toBe("left");
  });
  it("keeps every move adjacent and inside desktop and mobile boards", () => {
    for (const columns of [3, 5]) for (let cell = 0; cell < 15; cell++) for (const random of [0, .3, .6, .99]) {
      const move = nextPathMove(cell, columns, null, () => random);
      expect(move.index).toBeGreaterThanOrEqual(0);
      expect(move.index).toBeLessThan(15);
      const distance = Math.abs(Math.floor(cell / columns) - Math.floor(move.index / columns)) + Math.abs(cell % columns - move.index % columns);
      expect(distance).toBe(1);
    }
  });
  it("refreshes a departed card without duplicating any visible word", () => {
    const items = ["א", "ב", "ג", "ד"].map((text) => ({ text, say: text }));
    const cards = replaceDepartedCard(items.slice(0, 3), 0, { id: "test", label: "", unit: "", items }, () => 0);
    expect(cards.map((card) => card.text)).toEqual(["ד", "ב", "ג"]);
  });
});