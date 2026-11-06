export type ParentShortcutKey = { code: string; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; metaKey: boolean; repeat: boolean; editing: boolean };
export function parentShortcutStep(previous: number | null, now: number, key: ParentShortcutKey): { previous: number | null; open: boolean } {
  if (/^(Control|Shift)(Left|Right)$/.test(key.code) && !key.editing) return { previous, open: false };
  if (key.editing || key.repeat || key.altKey || key.metaKey || !key.ctrlKey || !key.shiftKey || key.code !== "KeyY") return { previous: null, open: false };
  const open = previous !== null && now - previous >= 0 && now - previous <= 1200;
  return { previous: open ? null : now, open };
}