import type { ReadingDialect } from "./reading-dialect";

// Traditional teaching names are lexicalized, not ordinary pointed words.
// Sources: YIVO alphabet; Chabad Hebrew alphabet. Taf/saf retains this app's tav/sav convention.
const NAMES: [string, string, string][] = [
  ["אָלֶף", "alef", "alef"], ["בֵּית", "bet", "beys"], ["בֵית", "vet", "veys"],
  ["גִּימֶל", "gimel", "gimel"], ["דָּלֶת", "dalet", "daled"], ["הֵא", "he", "hey"],
  ["וָו", "vav", "vov"], ["זַיִן", "zayin", "zayin"], ["חֵית", "khet", "khes"],
  ["טֵית", "tet", "tes"], ["יוֹד", "yod", "yud"], ["כַּף", "kaf", "kof"],
  ["חָף", "khaf", "khof"], ["לָמֶד", "lamed", "lamed"], ["מֵם", "mem", "mem"],
  ["נוּן", "nun", "nun"], ["סָמֶךְ", "samekh", "samekh"], ["עַיִן", "ayin", "ayin"],
  ["פֵּא", "pe", "pey"], ["פֵא", "fe", "fey"], ["צָדִי", "tsadi", "tsadik"],
  ["קוֹף", "kof", "kuf"], ["רֵישׁ", "resh", "reysh"], ["שִׁין", "shin", "shin"],
  ["שִׂין", "sin", "sin"], ["תָּו", "tav", "tov"], ["תָו", "tav", "sov"],
];
export function letterNameSound(text: string, dialect: ReadingDialect): string | null {
  const name = NAMES.find(([written]) => written.normalize("NFD") === text.trim().normalize("NFD"));
  return name ? name[dialect === "litvish" ? 2 : 1] : null;
}
/** Isolated names need lexical pronunciation, not a model's spelling correction. */
export function letterNamePrompt(text: string, dialect: ReadingDialect): string | null {
  const sound = letterNameSound(text, dialect);
  if (!sound) return null;
  const initial = sound.startsWith("b") ? "Start with a clear voiced b stop, lips closed then released; NEVER v."
    : sound.startsWith("v") ? "Start with a continuous voiced v, upper teeth touching lower lip; NEVER b."
    : sound.startsWith("f") ? "Start with f, NEVER p."
    : sound.startsWith("p") ? "Start with p, NEVER f." : "Preserve the exact initial consonant.";
  const respellings: Record<string, string> = { bet: "בֵּט", vet: "וֵט", beys: "בֵּייס", veys: "וֵייס", pe: "פֵּה", fe: "פֶה", pey: "פֵּיי", fey: "פֶיי" };
  return `Say exactly one traditional Hebrew letter name in ${dialect === "litvish" ? "Lithuanian Ashkenazi" : "Israeli Hebrew"} pronunciation. EXACT sound: "${sound}". ${initial} e = eh; ey = the vowel in say. The written name ${text} is a pronunciation label, NOT an ordinary word to correct. Do not pronounce house/bayit/bayis. Never say dagesh, instructions, or spell the phonetic letters. Output ONLY the name "${sound}". TEXT: ${respellings[sound] ?? text}`;
}
export function letterNameHints(text: string, dialect: ReadingDialect): string {
  return text.split(/[.!?]/u).flatMap(part => {
    const sound = letterNameSound(part, dialect);
    return sound ? [`${part.trim()} is a letter NAME: say only "${sound}". For beys/bet keep tsere (ey/e), never patach (a); do not say the word bayis/bayit for house.`] : [];
  }).join(" ");
}