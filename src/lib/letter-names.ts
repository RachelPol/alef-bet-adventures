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
export function letterNameHints(text: string, dialect: ReadingDialect): string {
  return text.split(/[.!?]/u).flatMap(part => {
    const sound = letterNameSound(part, dialect);
    return sound ? [`${part.trim()} is a letter NAME: say only "${sound}". For beys/bet keep tsere (ey/e), never patach (a); do not say the word bayis/bayit for house.`] : [];
  }).join(" ");
}