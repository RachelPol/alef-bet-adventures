import { describe, it, expect } from "vitest";
import { cloudRequestHeaders } from "./cloud-bridge-rules";
describe("Cloud request bridge", () => {
  it("preserves single-row profile and wallet response negotiation", () => {
    const h = cloudRequestHeaders(new Headers({ accept: "application/vnd.pgrst.object+json", "accept-profile": "public", prefer: "return=representation", authorization: "Bearer test-user-token" }), "test-publishable");
    expect(h.get("accept")).toBe("application/vnd.pgrst.object+json");
    expect(h.get("accept-profile")).toBe("public");
    expect(h.get("prefer")).toBe("return=representation");
    expect(h.get("authorization")).toBe("Bearer test-user-token");
  });
  it("does not forward privileged keys or caller cookies", () => {
    const h = cloudRequestHeaders(new Headers({ authorization: "Bearer sb_secret_test", cookie: "test-cookie", apikey: "attacker-key" }), "test-publishable");
    expect(h.get("authorization")).toBeNull(); expect(h.get("cookie")).toBeNull(); expect(h.get("apikey")).toBe("test-publishable");
  });
});