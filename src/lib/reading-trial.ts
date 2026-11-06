/** Transcription is lexical evidence, never proof of vowels or dagesh. */
export function readingMatch(expected: string, transcript: string): boolean {
  const clean = (s: string) => s.normalize("NFD").replace(/[\u0591-\u05c7]/g, "").replace(/[^א-ת]/g, "");
  const target = clean(expected);
  return target.length > 0 && target === clean(transcript);
}