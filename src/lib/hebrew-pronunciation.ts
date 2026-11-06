export type ConsonantSound = "b" | "v" | "k" | "kh" | "p" | "f" | "sh" | "s";
/** Read the marks attached to each consonant, independent of Unicode mark order. */
export function consonantSound(cluster: string): ConsonantSound | null {
  const base = cluster[0];
  const dagesh = cluster.includes("\u05bc");
  if (base === "ב") return dagesh ? "b" : "v";
  if (base === "כ" || base === "ך") return dagesh ? "k" : "kh";
  if (base === "פ" || base === "ף") return dagesh ? "p" : "f";
  if (base === "ש") {
    if (cluster.includes("\u05c2")) return "s";
    if (cluster.includes("\u05c1")) return "sh";
  }
  return null;
}

export function pronunciationHints(text: string): string {
  const hints = new Set<string>();
  for (const cluster of text.match(/[בכפךףש][\u0591-\u05c7]*/gu) ?? []) {
    const sound = consonantSound(cluster);
    if (sound) hints.add(`${cluster} has the consonant sound ${sound}`);
  }
  if (/פ[\u0591-\u05c7]*יל/u.test(text) && /פ[\u0591-\u05c7]*\u05bc[\u0591-\u05c7]*יל/u.test(text)) {
    hints.add("פִּיל is pronounced pil (peel with a clear initial p), never fil");
  }
  return [...hints].join("; ");
}