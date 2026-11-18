export type MountainActivity = 'listen' | 'read';
export type MountainEvent = 'success' | 'mistake' | 'restart';
export type MountainState = { streak: number; completions: number; version: number };
export const INITIAL_MOUNTAIN: MountainState = { streak: 0, completions: 0, version: 0 };
export const STATIONS = [
  { name: 'תחילת הטיפוס', icon: '🎒', reward: 'תרמיל טיולים' },
  { name: 'גשר העץ', icon: '🌉', reward: 'סמל הגשר' },
  { name: 'מפל המים', icon: '💧', reward: 'טיפת כסף' },
  { name: 'מערת המטיילים', icon: '🔦', reward: 'פנס מטיילים' },
  { name: 'נקודת התצפית', icon: '🔭', reward: 'משקפת' },
  { name: 'יער הפסגה', icon: '🌲', reward: 'סמל היער' },
  { name: 'הדרך הסלעית', icon: '🧗', reward: 'סמל המטפס' },
  { name: 'מחנה הפסגה', icon: '⛺', reward: 'אוהל פסגה' },
  { name: 'פסגת ההר', icon: '🏆', reward: 'מדליית זהב' },
] as const;
// Each ten-step leg follows the painted trail through its bend.
export const TRAIL = [
  [50,96],[59,86],[73,79],[50,76],[28,72],[47,66],[69,63],
  [52,58],[33,55],[48,50],[68,47],[51,43],[37,39],
  [48,35],[62,32],[48,28],[40,24],[51,20],[57,17],[53,11],[50,6],
] as const;
export function mountainPosition(streak: number) {
  const distance = Math.max(0, Math.min(90, streak)) / 90 * (TRAIL.length - 1);
  const index = Math.min(TRAIL.length - 2, Math.floor(distance));
  const from = TRAIL[index] ?? TRAIL[0]; const to = TRAIL[index + 1] ?? from;
  const t = distance - index;
  return { x: from[0] + (to[0] - from[0]) * t, y: from[1] + (to[1] - from[1]) * t };
}
export function advanceMountain(state: MountainState, kind: MountainEvent): MountainState {
  if (kind === 'restart') return { ...state, streak: 0, version: state.version + 1 };
  if (state.streak === 90) return { ...state, version: state.version + 1 };
  if (kind === 'mistake') return { ...state, streak: 0, version: state.version + 1 };
  const streak = state.streak + 1;
  return { streak, completions: state.completions + (streak === 90 ? 1 : 0), version: state.version + 1 };
}
export function mountainMilestone(before: number, after: number) {
  return after > before && after % 10 === 0 ? STATIONS[after / 10 - 1] ?? null : null;
}