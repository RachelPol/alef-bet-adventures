import { createFileRoute } from "@tanstack/react-router";
import { cloudRequestHeaders } from "@/lib/cloud-bridge-rules";

async function forward(request: Request, path: string) {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return new Response("Service unavailable", { status: 503 });
  if (!/^(auth|rest|storage)\/v1\//.test(path) || path.includes("..") || path.includes("%")) return new Response(null, { status: 404 });
  if (path.startsWith("auth/v1/admin")) return new Response(null, { status: 403 });
  const source = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== source.origin) return new Response(null, { status: 403 });
  const headers = cloudRequestHeaders(request.headers, key);
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/${path}${source.search}`, {
      method: request.method, headers, body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer(), redirect: "manual",
    });
    const output = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "content-range", "range-unit", "preference-applied"]) {
      const value = response.headers.get(name); if (value) output.set(name, value);
    }
    return new Response(response.body, { status: response.status, headers: output });
  } catch { return new Response("Connection unavailable", { status: 503 }); }
}
export const Route = createFileRoute("/api/cloud/$")({ server: { handlers: {
  GET: ({ request, params }) => forward(request, params._splat ?? ""),
  POST: ({ request, params }) => forward(request, params._splat ?? ""),
  PUT: ({ request, params }) => forward(request, params._splat ?? ""),
  PATCH: ({ request, params }) => forward(request, params._splat ?? ""),
  DELETE: ({ request, params }) => forward(request, params._splat ?? ""),
} } });