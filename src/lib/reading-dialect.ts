export type ReadingDialect = "israeli" | "litvish";
export function readingDialect(value: unknown): ReadingDialect { return value === "litvish" ? "litvish" : "israeli"; }
export function tavSound(cluster: string, dialect: ReadingDialect): "t" | "s" {
  return dialect === "litvish" && !cluster.includes("\u05bc") ? "s" : "t";
}
export function dialectGuide(dialect: ReadingDialect): string {
  return dialect === "litvish"
    ? "Use Lithuanian Ashkenazi Hebrew (Litvish lashon hakodesh), NOT Israeli Hebrew. EVERY kamatz, both gadol U+05B8 and katan U+05C7, is rounded o; NEVER pronounce any kamatz as patach a, even in unstressed syllables. בָּ = bo, שָׁ = sho, תָ = so. Patach alone is a: בַּ = ba, שַׁ = sha. Tzere is ey; cholam is ey in the historical Lithuanian tradition; chirik is i; shuruk and kubutz are u. Tav with dagesh is t; tav without dagesh is s. Preserve bet/vet, kaf/khaf, pe/fe and shin/sin. Read naturally, without chanting or exaggeration."
    : "Use natural Israeli Hebrew. Kamatz katan is o; ordinary kamatz is a; cholam is o. Tav is t with or without dagesh.";
}