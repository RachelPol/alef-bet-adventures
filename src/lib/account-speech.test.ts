import { expect, it } from "vitest";
import { getAccountDialect, setAccountDialect } from "./account-speech";
it("loads the selected child's dialect and resets for the next account", () => {
  setAccountDialect("litvish"); expect(getAccountDialect()).toBe("litvish");
  setAccountDialect(null); expect(getAccountDialect()).toBe("israeli");
});