import { describe, it, expect } from "vitest";
import { CATALOG, SHOPS, EMPTY, buy } from "./wallet";
describe("expanded shops", () => {
  it("expands every shop beyond its previous selection", () => { for (const shop of SHOPS) expect(CATALOG.filter(i => i.shop === shop.id).length).toBeGreaterThanOrEqual(16); });
  it.each(["bunk-bed", "toy-cabinet"])("offers requested furniture %s for purchase", id => {
    const item = CATALOG.find(item => item.id === id);
    expect(item?.shop).toBe("furniture");
    if (!item) throw new Error("Requested furniture absent");
    expect(buy({ ...EMPTY, points: item.price }, item, id)?.owned[0]?.itemId).toBe(id);
  });
  it("keeps ids unique and prices positive", () => { expect(new Set(CATALOG.map(i => i.id)).size).toBe(CATALOG.length); for (const item of CATALOG) expect(item.price).toBeGreaterThan(0); });
  it("new shop purchases cost their displayed price and enter the room", () => {
    for (const shop of ["books", "sports", "crafts"]) {
      const item = CATALOG.find(i => i.shop === shop); if (!item) throw new Error("Shop missing");
      expect(buy({ ...EMPTY, points: item.price - 1 }, item, "test")).toBeNull();
      const result = buy({ ...EMPTY, points: item.price }, item, "test");
      expect(result?.points).toBe(0); expect(result?.owned[0]?.itemId).toBe(item.id);
    }
  });
});