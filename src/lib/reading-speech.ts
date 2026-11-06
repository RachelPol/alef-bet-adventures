/** Explicit reviewed exceptions; never infer kamatz katan from silent-shva alone. */
export function speechText(text: string): string {
  return text.replace(/כָּל(?=[\s!.,?]|$)/g, "כֹּל").replace(/חָכְמָה/g, "חֹכְמָה");
}