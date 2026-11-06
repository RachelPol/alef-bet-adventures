import { z } from "zod";
export const parentPointsSchema = z.object({ code: z.string().min(8).max(200), points: z.number().int().min(1).max(10000) });
export async function parentCodeMatches(supplied: string, expected: string | undefined) {
  if (!expected || expected.length < 8) return false;
  const encode = new TextEncoder();
  const [a, b] = await Promise.all([supplied, expected].map(s => crypto.subtle.digest("SHA-256", encode.encode(s))));
  const first = new Uint8Array(a); const second = new Uint8Array(b);
  let difference = 0; for (let i = 0; i < first.length; i++) difference |= (first[i] ?? 0) ^ (second[i] ?? 0);
  return difference === 0;
}