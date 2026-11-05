import { describe, expect, it } from "vitest";
import { CATALOG, EMPTY, addPoints, buy, move } from "./wallet";

const bed = CATALOG.find((i) => i.id === "bed")!;
const pink = CATALOG.find((i) => i.id === "pink")!;

describe("wallet", () => {
  it("accumulates points", () => expect(addPoints(addPoints(EMPTY, 3), 4).points).toBe(7));
  it("refuses a purchase the child can't afford", () => expect(buy(addPoints(EMPTY, 39), bed, "a")).toBeNull());
  it("deducts the price and places the item in the room", () => {
    const w = buy(addPoints(EMPTY, 50), bed, "a")!;
    expect(w.points).toBe(10);
    expect(w.owned.map((p) => p.itemId)).toEqual(["bed"]);
  });
  it("paint changes the wall instead of adding an item", () => {
    const w = buy(addPoints(EMPTY, 15), pink, "a")!;
    expect(w.wall).toBe(pink.color);
    expect(w.owned).toHaveLength(0);
  });
  it("moving keeps items inside the room", () => {
    const w = move(buy(addPoints(EMPTY, 50), bed, "a")!, "a", 150, -10);
    expect(w.owned[0]).toMatchObject({ x: 95, y: 5 });
  });
});
