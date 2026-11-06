export type RoomTransform = { rotation?: number; scale?: number; flipped?: boolean };
export function roomTransform(value: RoomTransform): Required<RoomTransform> {
  return {
    rotation: Number.isFinite(value.rotation) ? ((Number(value.rotation) % 360) + 360) % 360 : 0,
    scale: Number.isFinite(value.scale) ? Math.max(0.4, Math.min(2.5, Number(value.scale))) : 1,
    flipped: value.flipped === true,
  };
}