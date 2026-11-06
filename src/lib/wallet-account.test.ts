import { afterEach, expect, it, vi } from "vitest";
const rows = { a: { points: 7, owned: [], wall: null }, b: { points: 2, owned: [], wall: null } };
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ select: () => ({ eq: (_: string, id: keyof typeof rows) => ({ single: async () => ({ data: rows[id], error: null }) }) }) }) } }));
import { connectWallet, updateWallet, addPoints, useWallet } from "./wallet";
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