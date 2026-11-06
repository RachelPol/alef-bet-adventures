import { describe, expect, it } from "vitest";
import { childLoginSchema, childNameKey } from "./child-login";

describe("child account entry", () => {
  it("requires a child's name", () => {
    expect(childLoginSchema.safeParse({ name: " ", pin: "123" }).success).toBe(false);
  });
  it("requires exactly three numeric digits, including leading zeroes", () => {
    expect(childLoginSchema.parse({ name: "יוני", pin: "007" }).pin).toBe("007");
    for (const pin of ["", "12", "1234", "abc", "1 2", "١٢٣"]) {
      expect(childLoginSchema.safeParse({ name: "יוני", pin }).success).toBe(false);
    }
  });
  it("allows entry without email or password", () => {
    expect(childLoginSchema.parse({ name: "יוני", pin: "123" })).toEqual({ name: "יוני", pin: "123", email: "" });
  });
  it("validates email only when supplied", () => {
    expect(childLoginSchema.safeParse({ name: "יוני", pin: "123", email: "parent@example.com" }).success).toBe(true);
    expect(childLoginSchema.safeParse({ name: "יוני", pin: "123", email: "invalid" }).success).toBe(false);
  });
  it("normalizes the same child name for returning entry", () => {
    expect(childNameKey("  יוֹנִי   לוי ")).toBe(childNameKey("יוני לוי"));
    expect(childNameKey("יוני לוי")).not.toBe(childNameKey("יוני כהן"));
  });
});