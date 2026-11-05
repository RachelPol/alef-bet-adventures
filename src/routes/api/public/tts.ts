import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const q = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 100);
        if (!q) return new Response("missing", { status: 400 });
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=iw&client=tw-ob&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) return new Response("tts failed", { status: 502 });
        return new Response(res.body, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
        });
      },
    },
  },
});
