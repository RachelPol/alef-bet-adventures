import { it, expect } from "vitest";
import { speechPrompt } from "./speech-pacing";
it("keeps kamatz katan in the emphasized praise phrase", () => {
  expect(speechPrompt("כָּל הַכָּבוֹד!").endsWith("כֹּל הַכָּבוֹד!")).toBe(true);
});
it("preserves Litvish kamatz instead of replacing it with cholam-ey", () => {
  expect(speechPrompt("כָּל הַכָּבוֹד!", "litvish").endsWith("כָּל הַכָּבוֹד!")).toBe(true);
  expect(speechPrompt("חָכְמָה", "litvish").endsWith("חָכְמָה")).toBe(true);
});
import { speechFallbackPrompt } from "./speech-pacing";
describe("speech fallback prompt", () => {
  it("keeps the Litvish kamatz rule and the exact text", () => {
    const prompt = speechFallbackPrompt("אָב", "litvish");
    expect(prompt).toContain("NOT Israeli");
    expect(prompt.endsWith("אָב")).toBe(true);
  });
});
