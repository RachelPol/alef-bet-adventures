import { it, expect } from "vitest";
import { speechPrompt } from "./speech-pacing";
it("keeps kamatz katan in the emphasized praise phrase", () => {
  expect(speechPrompt("כָּל הַכָּבוֹד!").endsWith("כֹּל הַכָּבוֹד!")).toBe(true);
});