import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { speechFallbackPrompt, speechPrompt } from "@/lib/speech-pacing";
import { readingDialect } from "@/lib/reading-dialect";

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
          const dialect = readingDialect(body.dialect);
          const config = { baseURL: "https://ai.gateway.lovable.dev", apiKey, model: "google/gemini-3.1-flash-tts-preview", format: "gemini" as const, voice: "Kore" };
          // The preview speech model intermittently answers 400/429/5xx for a
          // valid prompt; retry a few times (last with a short prompt) before failing.
          const prompts = [speechPrompt(body.text, dialect), speechPrompt(body.text, dialect), speechFallbackPrompt(body.text, dialect)];
          let res: Response | null = null;
          for (let i = 0; i < prompts.length; i++) {
            res = await requestSpeech(config, prompts[i] ?? prompts[0]!, false, request.signal);
            if (res.ok && res.body) break;
            const retryable = res.status === 400 || res.status === 429 || res.status >= 500;
            if (!retryable || i === prompts.length - 1) break;
            await res.body?.cancel().catch(() => undefined);
            await new Promise(resolve => setTimeout(resolve, 250 * (i + 1)));
          }
          if (!res) return new Response("הקול אינו זמין כרגע", { status: 503 });
          return new Response(res.body, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/event-stream", "Cache-Control": "no-store" } });
        } catch (error) {
          // Client cancelled (e.g. child tapped the next letter): not a failure.
          if (request.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
            return new Response(null, { status: 499 });
          }
          throw error;
        }
      },
    },
  },
});
