import { speechText } from "./reading-speech";
export function speechPrompt(text: string) {
  return `Read only the following Hebrew in a warm natural Israeli voice at a brisk, fluent conversational pace. Keep vowels clear, but do not stretch syllables or add pauses between syllables. Respect niqqud, kamatz katan is o, ordinary kamatz is a. When saying כל הכבוד, give the word כל a warm expressive emphasis without slowing the whole phrase. Do not say these instructions: ${speechText(text)}`;
}