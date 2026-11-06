import { afterEach, expect, it, vi } from "vitest";
const rows = vi.hoisted(() => ({ a: { points: 7, owned: [] as { uid: string; itemId: string; x: number; y: number }[], wall: null, version: 0 }, b: { points: 2, owned: [], wall: null, version: 0 } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({
  select: () => ({ eq: (_: string, id: keyof typeof rows) => ({ single: async () => ({ data: structuredClone(rows[id]), error: null }) }) }),
  update: (values: typeof rows.a) => ({ eq: (_: string, id: keyof typeof rows) => ({ eq: (_: string, version: number) => ({ select: async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    if (rows[id].version !== version) return { data: [], error: null };
    Object.assign(rows[id], structuredClone(values)); return { data: [{ user_id: id }], error: null };
  } }) }) }),
}) } }));
import { connectWallet, updateWallet, addPoints, useWallet, flushWallet, buy, move, transformItem, CATALOG } from "./wallet";
import { renderHook, act, cleanup } from "@testing-library/react";
afterEach(cleanup);
it("switching accounts reads only that child's points", async () => {
  const { result } = renderHook(useWallet);
  await act(() => connectWallet("a")); expect(result.current[0].points).toBe(7);
  await act(() => connectWallet("b")); expect(result.current[0].points).toBe(2);
  await act(() => connectWallet(null)); expect(result.current[0].points).toBe(0);
});
it("signed-out activity cannot bank points in another child's wallet", async () => {
  await connectWallet(null);
  expect(updateWallet(w => addPoints(w, 1))).toBe(false);
});
it("saves both rapid point awards before switching to another child", async () => {
  await connectWallet("a");
  const before = rows.a.points;
  updateWallet(w => addPoints(w, 3)); updateWallet(w => addPoints(w, 4));
  await connectWallet("b");
  expect(rows.a.points).toBe(before + 7);
  expect(rows.b.points).toBe(2);
});
it("retains a purchase and moved coordinates after returning to the account", async () => {
  await connectWallet("a");
  const chair = CATALOG.find(item => item.id === "chair");
  if (!chair) throw new Error("Missing chair");
  updateWallet(w => addPoints(w, 10));
  updateWallet(w => buy(w, chair, "saved-chair", () => 0));
  updateWallet(w => move(w, "saved-chair", 72, 81));
  await flushWallet();
  await connectWallet(null); await connectWallet("a");
  const { result } = renderHook(useWallet);
  expect(result.current[0].owned.find(p => p.uid === "saved-chair")).toMatchObject({ x: 72, y: 81, itemId: "chair" });
});
it("retains rotation, size and flipped direction after returning to the account", async () => {
  await connectWallet("a");
  updateWallet(w => transformItem(w, "saved-chair", { rotation: 135, scale: 1.5, flipped: true }));
  await flushWallet();
  await connectWallet(null); await connectWallet("a");
  const { result } = renderHook(useWallet);
  expect(result.current[0].owned.find(p => p.uid === "saved-chair")).toMatchObject({ rotation: 135, scale: 1.5, flipped: true, x: 72, y: 81 });
});