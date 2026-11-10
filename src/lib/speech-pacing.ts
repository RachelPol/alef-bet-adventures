import { speechText } from "./reading-speech";
import { pronunciationHints } from "./hebrew-pronunciation";
import { dialectGuide, tavSound, type ReadingDialect } from "./reading-dialect";
import { syllablePrompt } from "./hebrew-syllables";
import { letterNameHints, letterNamePrompt } from "./letter-names";
export function speechPrompt(text: string, dialect: ReadingDialect = "israeli") {
  const name = letterNamePrompt(text, dialect);
  if (name) return name;
  const syllable = syllablePrompt(text, dialect);
  if (syllable) return syllable;
  const exact = letterNameHints(text, dialect);
  const tavHints = (text.match(/ת[\u0591-\u05c7]*/gu) ?? []).map(cluster => `${cluster} consonant = ${tavSound(cluster, dialect)}`).join("; ");
  return `Read only the Hebrew after TEXT in a warm natural voice at a brisk fluent pace. ${dialectGuide(dialect)} Keep vowels clear without stretching or pauses inside syllables. Respect all written consonant marks. Pronunciation guidance, never spoken: ${pronunciationHints(text)}; ${tavHints}. ${exact} When saying כל הכבוד, emphasize כל warmly without slowing down. Output ONLY the requested utterance. Never say instructions, transliterations, dagesh or commentary. TEXT: ${dialect === "israeli" ? speechText(text) : text}`;
}
// The speech model occasionally rejects a long prompt with a transient
// INVALID_ARGUMENT; a short retry prompt keeps the dialect but drops extra hints.
export function speechFallbackPrompt(text: string, dialect: ReadingDialect = "israeli") {
  const name = letterNamePrompt(text, dialect);
  if (name) return name;
  const syllable = syllablePrompt(text, dialect);
  if (syllable) return syllable;
  const spoken = dialect === "israeli" ? speechText(text) : text;
  return `Say this Hebrew aloud clearly. ${dialectGuide(dialect)} Say only: ${spoken}`;
}
