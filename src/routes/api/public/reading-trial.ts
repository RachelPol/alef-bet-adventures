import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const LIMIT = 2 * 1024 * 1024;
export const Route = createFileRoute("/api/public/reading-trial")({
  server: { handlers: { POST: async ({ request }) => {
    const token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token) return new Response("נדרשת כניסה לחשבון", { status: 401 });
    const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY']; const apiKey = process.env['LOVABLE_API_KEY'];
    if (!url || !key || !apiKey) return new Response("זיהוי הדיבור אינו מוגדר", { status: 503 });
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user } } = await client.auth.getUser(token);
    if (!user) return new Response("נדרשת כניסה לחשבון", { status: 401 });
    // Privileged access is restricted to the server-held feature circuit breaker.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: block, error: blockError } = await supabaseAdmin.from("ai_feature_blocks").select("status,message").eq("feature", "reading-trial").maybeSingle();
    if (blockError) return new Response("לא ניתן לבדוק זמינות זיהוי דיבור", { status: 503 });
    if (block) return new Response(block.message, { status: block.status });
    if (Number(request.headers.get("Content-Length")) > LIMIT) return new Response("ההקלטה גדולה מדי", { status: 413 });
    try {
      const reader = request.body?.getReader();
      if (!reader) return new Response("הקלטה חסרה", { status: 400 });
      const chunks: Uint8Array[] = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > LIMIT) { await reader.cancel(); return new Response("ההקלטה גדולה מדי", { status: 413 }); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const form = await new Response(bytes, { headers: { "Content-Type": request.headers.get("Content-Type") ?? "" } }).formData();
      if (form.get("consent") !== "true") return new Response("נדרשת הסכמה להקלטה", { status: 400 });
      const file = form.get("file");
      if (!(file instanceof File) || file.type !== "audio/wav" || file.size < 2048 || file.size > LIMIT - 4096) return new Response("הקלטה לא תקינה", { status: 400 });
      const { transcribe } = await import("@/lib/transcribe.server");
      const upstream = await transcribe({ baseURL: "https://ai.gateway.lovable.dev", apiKey, model: "openai/gpt-transcribe", maxFileBytes: LIMIT - 4096, audioOnly: true }, file, { signal: request.signal });
      if (!upstream.ok) {
        const raw = await upstream.text(); let message = "זיהוי הדיבור אינו זמין";
        try { const body = JSON.parse(raw); message = body.message ?? body.error?.message ?? message; } catch { /* No private provider details in UI. */ }
        if ([401, 402, 403, 404].includes(upstream.status)) {
          const { error } = await supabaseAdmin.from("ai_feature_blocks").upsert({ feature: "reading-trial", status: upstream.status, message });
          if (error) return new Response("לא ניתן לשמור את השהיית זיהוי הדיבור", { status: 503 });
        }
        return new Response(message, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
      }
      return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream", "Cache-Control": "no-store" } });
    } catch (error) {
      if (request.signal.aborted) return new Response(null, { status: 499 });
      return new Response(error instanceof TypeError ? "הקלטה לא תקינה או חיבור לא זמין" : "לא ניתן לזהות את ההקלטה", { status: 400 });
    }
  } } },
});