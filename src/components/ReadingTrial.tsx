import { useEffect, useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";
import { createParser } from "eventsource-parser";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { recordWav } from "@/lib/record-wav";
import { readingMatch, shouldApproveReading } from "@/lib/reading-trial";

export function ReadingTrial({ text, disabled, consent, onConsent, onCorrect }: { text: string; disabled: boolean; consent: boolean; onConsent: (value: boolean) => void; onCorrect: () => void }) {
  const [state, setState] = useState<"idle" | "opening" | "recording" | "checking">("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState("");
  const recorder = useRef<Awaited<ReturnType<typeof recordWav>> | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    generation.current += 1; controller.current?.abort();
    if (timer.current) clearTimeout(timer.current);
    const active = recorder.current; recorder.current = null;
    if (active) void active.stop().catch(() => {});
    setState("idle");
  };
  useEffect(() => { if (disabled) cancel(); }, [disabled]);
  useEffect(() => () => {
    generation.current += 1; controller.current?.abort();
    if (timer.current) clearTimeout(timer.current);
    if (recorder.current) void recorder.current.stop().catch(() => {});
  }, []);
  const stop = async () => {
    const active = recorder.current; if (!active) return;
    recorder.current = null; if (timer.current) clearTimeout(timer.current);
    const version = generation.current; setState("checking");
    try {
      const file = await active.stop();
      if (version !== generation.current) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("יש להיכנס לחשבון כדי לנסות הקראה");
      const abort = new AbortController(); controller.current = abort;
      const form = new FormData(); form.append("file", file); form.append("consent", "true");
      const res = await fetch("/api/public/reading-trial", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` }, body: form, signal: abort.signal });
      if (!res.ok) throw new Error(await res.text());
      const reader = res.body?.getReader(); if (!reader) throw new Error("לא התקבלה תשובה");
      let final = false; let failed = ""; let partial = ""; let finalText = "";
      const parser = createParser({ onEvent(event) {
        if (event.data === "[DONE]") return;
        const data = JSON.parse(event.data);
        const type = data.type ?? event.event;
        if (type === "transcript.text.delta") { partial += data.delta ?? ""; setTranscript(partial); }
        if (type === "transcript.text.done") { final = true; finalText = data.text ?? partial; setTranscript(finalText); }
        if (type === "error" || data.error) failed = data.message ?? data.error?.message ?? "זיהוי הדיבור הופסק";
      } });
      const decoder = new TextDecoder();
      while (true) { const { done, value } = await reader.read(); if (done) break; if (version !== generation.current) { await reader.cancel(); return; } parser.feed(decoder.decode(value, { stream: true })); }
      parser.feed(decoder.decode());
      if (failed) throw new Error(failed);
      if (!final) throw new Error("זיהוי הדיבור לא הושלם; אפשר לנסות שוב");
      if (shouldApproveReading(text, finalText, final, Boolean(failed), version === generation.current && !disabled)) onCorrect();
    } catch (e) { if (version === generation.current) { setTranscript(null); setError(e instanceof Error ? e.message : "לא הצלחנו לזהות דיבור"); } }
    finally { if (version === generation.current) setState("idle"); }
  };
  const start = async () => {
    if (!consent || disabled || state !== "idle") return;
    setError(""); setTranscript(null); setState("opening");
    const version = ++generation.current;
    try {
      const active = await recordWav();
      if (version !== generation.current) { await active.stop().catch(() => {}); return; }
      recorder.current = active; setState("recording"); timer.current = setTimeout(() => { void stop(); }, 12000);
    } catch { if (version === generation.current) { setState("idle"); setError("לא ניתן לפתוח מיקרופון; בדקו את הרשאת המיקרופון בדפדפן"); } }
  };
  return <section className="mx-auto mt-6 max-w-lg border-t border-border pt-5 text-center">
    <h2 className="text-xl font-bold">ניסיון קריאה במיקרופון</h2>
    <label className="mt-3 flex items-start justify-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={consent} disabled={state !== "idle"} onChange={e => onConsent(e.target.checked)} className="mt-1 accent-primary" />אני ההורה ומסכימ/ה לשליחת הקלטה קצרה לזיהוי דיבור ולאישור אוטומטי של מילה תואמת. ההקלטה לא נשמרת בחשבון.</label>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {state === "recording" ? <Button onClick={() => void stop()} variant="destructive"><Square />סיום הקלטה</Button> : <Button disabled={!consent || disabled || state !== "idle"} onClick={() => void start()}><Mic />{state === "checking" ? "מזהה דיבור…" : state === "opening" ? "פותח מיקרופון…" : "הקלטת הקריאה"}</Button>}
      {state !== "idle" && <Button variant="outline" onClick={cancel}><X />ביטול</Button>}
    </div>
    <div aria-live="polite" className="mt-3 min-h-12 text-base">
      {state === "recording" && <p className="font-bold text-destructive">● מקשיב לקריאה…</p>}
      {transcript !== null && <><p>זוהה: <strong>{transcript || "לא זוהה דיבור"}</strong></p>{state === "idle" && <p className="text-muted-foreground">{readingMatch(text, transcript) ? "המילה אושרה אוטומטית!" : "לא נמצאה התאמה; אפשר להקליט שוב או לבקש אישור מההורה."}</p>}</>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
    </div>
    <p className="text-sm text-muted-foreground">הזיהוי ניסיוני: מילה תואמת מאושרת אוטומטית, אך ניקוד ודגושות ורפות אינם נבדקים.</p>
  </section>;
}