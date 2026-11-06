import { z } from "zod";

export const childLoginSchema = z.object({
  name: z.string().trim().min(1, "נא להזין את שם הילד").max(80, "השם ארוך מדי"),
  pin: z.string().regex(/^[0-9]{3}$/, "הקוד חייב להכיל בדיוק 3 ספרות"),
  email: z.union([z.literal(""), z.string().trim().email("כתובת המייל אינה תקינה").max(254)]).optional().default(""),
});

export type ChildLoginInput = z.input<typeof childLoginSchema>;
export const childSignupSchema = childLoginSchema.extend({ parentCode: z.union([z.literal(""),z.string().min(8,"קוד ההורה חייב להכיל לפחות 8 תווים").max(200)]).optional() });
export type ChildSignupInput = z.input<typeof childSignupSchema>;
export function childNameKey(name: string) {
  return name.normalize("NFKC").replace(/[\u0591-\u05bd\u05bf-\u05c7]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("he");
}