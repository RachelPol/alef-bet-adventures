export type ReadingDialect = "israeli" | "litvish";
export function readingDialect(value: unknown): ReadingDialect { return value === "litvish" ? "litvish" : "israeli"; }
export function tavSound(cluster: string, dialect: ReadingDialect): "t" | "s" {
  return dialect === "litvish" && !cluster.includes("\u05bc") ? "s" : "t";
}
export function dialectGuide(dialect: ReadingDialect): string {
  return dialect === "litvish"
    ? "Use Lithuanian Ashkenazi Hebrew (Litvish lashon hakodesh), not Israeli Hebrew. Kamatz gadol and kamatz katan are o; patach is a; tzere is ey; cholam is ey in the Lithuanian tradition; chirik is i; shuruk and kubutz are u. Tav with dagesh is t; tav without dagesh is s. Preserve bet/vet, kaf/khaf, pe/fe and shin/sin. Read naturally, without chanting or exaggeration."
    : "Use natural Israeli Hebrew. Kamatz katan is o; ordinary kamatz is a; cholam is o. Tav is t with or without dagesh.";
}