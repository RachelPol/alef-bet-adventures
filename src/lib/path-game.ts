import type { Item, Level } from "./levels";

export const PATH_CELLS = 15;
export const PATH_GOAL = 25;
export type Direction = "up" | "down" | "left" | "right";
export type PathMove = { index: number; direction: Direction };

export function nextPathMove(current: number, columns: number, previous: Direction | null, random = Math.random): PathMove {
  const row = Math.floor(current / columns);
  const col = current % columns;
  const choices: PathMove[] = [];
  if (row > 0) choices.push({ index: current - columns, direction: "up" });
  if (current + columns < PATH_CELLS) choices.push({ index: current + columns, direction: "down" });
  if (col > 0) choices.push({ index: current - 1, direction: "left" });
  if (col < columns - 1 && current + 1 < PATH_CELLS) choices.push({ index: current + 1, direction: "right" });
  const opposite: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
  const varied = choices.filter((choice) => choice.direction !== previous && (previous === null || choice.direction !== opposite[previous]));
  const pool = varied.length ? varied : choices;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))] ?? { index: current, direction: "up" };
}

export function gateIsOpen(correctAnswers: number) {
  return correctAnswers >= PATH_GOAL;
}

export function replaceDepartedCard(cards: Item[], departed: number, level: Level, random = Math.random): Item[] {
  const available = level.items.filter((item) => !cards.some((card) => card.text === item.text));
  const replacement = available[Math.floor(random() * available.length)];
  return cards.map((card, index) => index === departed && replacement ? replacement : card);
}