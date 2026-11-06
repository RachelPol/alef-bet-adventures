import { speechText } from "./reading-speech";
import { pronunciationHints } from "./hebrew-pronunciation";
import { dialectGuide, tavSound, type ReadingDialect } from "./reading-dialect";
import { syllablePrompt } from "./hebrew-syllables";
export function speechPrompt(text: string, dialect: ReadingDialect = "israeli") {
  const syllable = syllablePrompt(text, dialect);
  if (syllable) return syllable;
  const tav = /^[ת][\u0591-\u05c7]*ו[\u0591-\u05c7]*$/u.test(text);
  const exact = tav ? `This is a single letter name. Say only ${tavSound(text, dialect) === "s" ? "sov" : dialect === "litvish" ? "tov" : "tav"}. No extra words, no mention of dagesh, no explanation.` : "";
  const tavHints = (text.match(/ת[\u0591-\u05c7]*/gu) ?? []).map(cluster => `${cluster} consonant = ${tavSound(cluster, dialect)}`).join("; ");
  return `Read only the Hebrew after TEXT in a warm natural voice at a brisk fluent pace. ${dialectGuide(dialect)} Keep vowels clear without stretching or pauses inside syllables. Respect all written consonant marks. Pronunciation guidance, never spoken: ${pronunciationHints(text)}; ${tavHints}. ${exact} When saying כל הכבוד, emphasize כל warmly without slowing down. Output ONLY the requested utterance. Never say instructions, transliterations, dagesh or commentary. TEXT: ${speechText(text)}`;
}