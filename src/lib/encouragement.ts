export const PRAISE = [
  { id: "yasher", text: "יִישַׁר כֹּחַ! אַתָּה אַלּוּף!" },
  { id: "success", text: "עֲלֵה וְהַצְלַח! אֵיזֶה כֹּחַ!" },
  { id: "bravo", text: "כָּל הַכָּבוֹד! אַתָּה כּוֹכָב!" },
] as const;
export function praiseIndex(previous: number, random = Math.random): number {
  const options = PRAISE.map((_, index) => index).filter(index => index !== previous);
  return options[Math.min(options.length - 1, Math.floor(random() * options.length))] ?? 0;
}
export function progressMilestone(count: number, interval = 5) {
  return count > 0 && count % interval === 0;
}