import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { speechText } from "@/lib/reading-speech";

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
        if (!token) return new Response("נדרשת כניסה לחשבון", { status: 401 });
        const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!url || !key || !apiKey) return new Response("הקול אינו מוגדר", { status: 503 });
        const client = createClient(url, key, { auth: { persistSession: false } });
        const { data: { user } } = await client.auth.getUser(token);
        if (!user) return new Response("נדרשת כניסה לחשבון", { status: 401 });
        const body = await request.json().catch(() => null);
        if (!body || typeof body.text !== "string" || body.text.length > 200 || !body.text.trim()) return new Response("טקסט לא תקין", { status: 400 });
        try {
          const { requestSpeech } = await import("@/lib/speech-request.server");
          const res = await requestSpeech({ baseURL: "https://ai.gateway.lovable.dev", apiKey, model: "google/gemini-3.1-flash-tts-preview", format: "gemini", voice: "Kore" }, `Read only the following Hebrew in a warm natural Israeli voice, clearly and gently for a beginning reader. Respect niqqud, kamatz katan is o, ordinary kamatz is a. Do not say the instructions: ${speechText(body.text)}`, false, request.signal);
          return new Response(res.body, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/event-stream", "Cache-Control": "no-store" } });
        } catch (error) { if (request.signal.aborted) return new Response(null, { status: 499 }); throw error; }
      },
    },
  },
});
