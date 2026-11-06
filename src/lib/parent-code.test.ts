import { expect,it,vi } from "vitest";
vi.mock("@/integrations/supabase/client.server",()=>({supabaseAdmin:{}}));
import { parentCodeHash } from "./parent-code.server";
it("stores salted verifiers, never the original parent code",async()=>{
  const first=await parentCodeHash("test-only-parent","first-salt");
  expect(first).toMatch(/^[a-f0-9]{64}$/);
  expect(first).not.toBe("test-only-parent");
  expect(await parentCodeHash("test-only-parent","first-salt")).toBe(first);
  expect(await parentCodeHash("wrong-parent-code","first-salt")).not.toBe(first);
  expect(await parentCodeHash("test-only-parent","second-salt")).not.toBe(first);
});