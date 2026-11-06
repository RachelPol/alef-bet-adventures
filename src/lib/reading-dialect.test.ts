import { it, expect } from "vitest";
import { readingDialect, tavSound } from "./reading-dialect";
it("Lithuanian Ashkenazi distinguishes tav and sav", () => { expect(tavSound("תּ", "litvish")).toBe("t"); expect(tavSound("ת", "litvish")).toBe("s"); });
it("Israeli tav remains t", () => { expect(tavSound("ת", "israeli")).toBe("t"); expect(tavSound("תּ", "israeli")).toBe("t"); });
it("defaults unknown settings to Israeli", () => { expect(readingDialect(undefined)).toBe("israeli"); expect(readingDialect("litvish")).toBe("litvish"); });