import { describe, expect, it } from "vitest";
import { parseRememberedChildren } from "./remembered-children";

describe("returning child accounts", () => {
  it("keeps only account identity, never the three-digit code", () => {
    expect(parseRememberedChildren(JSON.stringify([{ id: "child-1", name: "איתמר", pin: "123" }]))).toEqual([{ id: "child-1", name: "איתמר" }]);
  });
  it("ignores malformed saved entries", () => {
    expect(parseRememberedChildren('[null,{"id":"x"},{"id":"y","name":" "}]')).toEqual([]);
    expect(parseRememberedChildren("broken")).toEqual([]);
  });
});