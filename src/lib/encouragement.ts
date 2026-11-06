// "כל הכבוד" is the most common praise, voiced by a woman, man, child and baby.
export const PRAISE = [
  { id: "kol-woman", text: "כָּל הַכָּבוֹד!", weight: 3 },
  { id: "kol-man", text: "כָּל הַכָּבוֹד!", weight: 3 },
  { id: "kol-child", text: "כָּל הַכָּבוֹד!", weight: 3 },
  { id: "kol-baby", text: "כָּל הַכָּבוֹד!", weight: 3 },
  { id: "yasher", text: "יִישַׁר כֹּחַ! אַתָּה אַלּוּף!", weight: 1 },
  { id: "success", text: "עֲלֵה וְהַצְלַח! אֵיזֶה כֹּחַ!", weight: 1 },
  { id: "bravo", text: "כָּל הַכָּבוֹד! אַתָּה כּוֹכָב!", weight: 1 },
] as const;
/** Weighted random clip, never the same clip twice in a row. */
export function praiseIndex(previous: number, random = Math.random): number {
  const options = PRAISE.map((_, index) => index).filter(index => index !== previous);
  const total = options.reduce((sum, i) => sum + (PRAISE[i]?.weight ?? 0), 0);
  let r = random() * total;
  for (const i of options) { r -= PRAISE[i]?.weight ?? 0; if (r < 0) return i; }
  return options[options.length - 1] ?? 0;
}
export function progressMilestone(count: number, interval = 5) {
  return count > 0 && count % interval === 0;
}
