import { expect, it } from "vitest";
import { parentShortcutStep } from "./parent-shortcut";
const key = { code: "KeyY", ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, repeat: false, editing: false };
it("requires two deliberate Ctrl+Shift+Y presses", () => {
  expect(parentShortcutStep(null, 100, key)).toEqual({previous:100,open:false});
  expect(parentShortcutStep(100, 500, key).open).toBe(true);
  expect(parentShortcutStep(100, 1401, key).open).toBe(false);
});
it("does not open for the rejected shortcut or while typing", () => {
  expect(parentShortcutStep(100, 500, {...key,code:"KeyP"}).open).toBe(false);
  expect(parentShortcutStep(100, 500, {...key,editing:true}).open).toBe(false);
  expect(parentShortcutStep(100, 500, {...key,repeat:true}).open).toBe(false);
});