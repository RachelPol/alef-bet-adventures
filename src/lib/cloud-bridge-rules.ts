export const CLOUD_REQUEST_HEADERS = ["authorization", "accept", "accept-profile", "content-profile", "content-type", "prefer", "range", "x-client-info", "x-supabase-api-version", "x-upsert"] as const;
export function cloudRequestHeaders(incoming: Headers, key: string) {
  const output = new Headers();
  for (const name of CLOUD_REQUEST_HEADERS) { const value = incoming.get(name); if (value) output.set(name, value); }
  output.set("apikey", key);
  const bearer = output.get("authorization");
  if (bearer?.includes("sb_secret_") || bearer === `Bearer ${key}`) output.delete("authorization");
  return output;
}
// Content filters (e.g. Etrog/NetFree) may block URLs containing "wallet"; use a neutral alias on our origin.
const ALIASES: [string, string][] = [["rest/v1/wallets", "rest/v1/kupa"]];
export function aliasCloudPath(path: string) {
  for (const [real, alias] of ALIASES) if (path === real || path.startsWith(`${real}?`)) return alias + path.slice(real.length);
  return path;
}
export function unaliasCloudPath(path: string) {
  for (const [real, alias] of ALIASES) if (path === alias) return real;
  return path;
}
