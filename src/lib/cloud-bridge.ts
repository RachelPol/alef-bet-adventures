import { aliasCloudPath } from "./cloud-bridge-rules";
/** Keep the generated client/storage; route its network traffic through our origin. */
export function installCloudBridge() {
  const backend = import.meta.env['VITE_SUPABASE_URL'];
  if (!backend || typeof window === "undefined") return;
  const origin = new URL(backend).origin;
  const original = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, window.location.origin);
    if (url.origin !== origin || !/^\/(auth|rest|storage)\/v1\//.test(url.pathname)) return original(input, init);
    const target = `${window.location.origin}/api/cloud/${aliasCloudPath(url.pathname.slice(1))}${url.search}`;
    return original(input instanceof Request ? new Request(target, input) : target, init);
  };
  return () => { window.fetch = original; };
}