import { expect, it } from "vitest";
import { speechText } from "./reading-speech";
it("reads kamatz katan in kol but keeps ordinary kamatz in kavod", () => {
  expect(speechText("כָּל הַכָּבוֹד!")).toBe("כֹּל הַכָּבוֹד!");
});
it("keeps ordinary kamatz in syllables", () => expect(speechText("בָּ גָ" )).toBe("בָּ גָ"));