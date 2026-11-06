export const CLOUD_REQUEST_HEADERS = ["authorization", "accept", "accept-profile", "content-profile", "content-type", "prefer", "range", "x-client-info", "x-supabase-api-version", "x-upsert"] as const;
export function cloudRequestHeaders(incoming: Headers, key: string) {
  const output = new Headers();
  for (const name of CLOUD_REQUEST_HEADERS) { const value = incoming.get(name); if (value) output.set(name, value); }
  output.set("apikey", key);
  const bearer = output.get("authorization");
  if (bearer?.includes("sb_secret_") || bearer === `Bearer ${key}`) output.delete("authorization");
  return output;
}