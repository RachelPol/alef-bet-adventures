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
// Each leg traces the bitmap path and ends at its illustrated landmark.
type Point = readonly [number, number];
const TRAIL: readonly (readonly Point[])[] = [
  [[53,99],[50,96],[51,93],[55,89],[54,86],[45,83]], // Trailhead
  [[45,83],[36,80],[31,77],[27,77],[24,78]], // Bridge
  [[24,78],[29,76],[31,73],[27,69],[24,66],[25,64]], // Waterfall overlook
  [[25,64],[29,68],[32,72],[41,70],[51,68],[63,66],[71,63],[73,61],[79,60]], // Cave
  [[79,60],[73,61],[71,60],[67,58],[53,56],[42,55],[34,53],[32,52],[36,49],[47,45],[60,42],[67,39]], // Lookout junction
  [[67,39],[63,37],[53,35],[46,34],[39,33]], // Forest
  [[39,33],[34,32],[34,30],[40,27],[43,26]], // Rocky switchback
  [[43,26],[50,24],[55,22],[55,21],[51,19],[47,18]], // Summit camp junction
  [[47,18],[45,17],[48,15],[51,14],[50,13],[48,12],[50,10],[50,8]], // Summit
];
export function mountainPosition(streak: number) {
  const steps = Math.max(0, Math.min(90, streak));
  const legIndex = Math.min(8, Math.floor(steps / 10));
  const leg = TRAIL[legIndex] ?? [];
  const segments = leg.slice(1).map((to, i) => {
    const from = leg[i] ?? to;
    return { from, to, length: Math.hypot((to[0] - from[0]) * 1.5, to[1] - from[1]) };
  });
  let distance = segments.reduce((sum, segment) => sum + segment.length, 0) * (steps - legIndex * 10) / 10;
  for (const {from, to, length} of segments) {
    if (distance <= length) {
      const t = distance / length;
      return { x: from[0] + (to[0] - from[0]) * t, y: from[1] + (to[1] - from[1]) * t };
    }
    distance -= length;
  }
  const [x, y] = leg.at(-1) ?? [50, 8];
  return { x, y };
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