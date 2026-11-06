import { createParser } from "eventsource-parser";
import { supabase } from "@/integrations/supabase/client";
import { getAccountDialect } from "./account-speech";

export function decodePCM(pending: Uint8Array, incoming: Uint8Array) {
  const bytes = new Uint8Array(pending.length + incoming.length);
  bytes.set(pending);
  bytes.set(incoming, pending.length);
  const usable = bytes.length - (bytes.length % 2);
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(usable / 2);
  for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
  return { samples, pending: bytes.slice(usable) };
}

// One shared AudioContext for the whole app. Creating a new context per word
// hits the browser's context limit after rapid clicks and leaves later words
// silent; a shared context also survives calls made outside a direct tap.
let sharedContext: AudioContext | null = null;
let resumeListenerAttached = false;

function speechContext(): AudioContext {
  if (!sharedContext) sharedContext = new AudioContext({ sampleRate: 24000 });
  if (!resumeListenerAttached) {
    resumeListenerAttached = true;
    const resume = () => void sharedContext?.resume().catch(() => undefined);
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
  }
  return sharedContext;
}

// resume() called outside a user gesture can stay pending until the next tap;
// never block the whole utterance on it.
async function ensureRunning(context: AudioContext) {
  if (context.state !== "suspended") return;
  await Promise.race([
    context.resume().catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, 300)),
  ]);
}

async function fetchSpeech(endpoint: string, text: string, token: string, signal: AbortSignal): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    signal.throwIfAborted();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text, dialect: getAccountDialect() }),
      signal,
    });
    if (response.ok && response.body) return response;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= 1) {
      throw new Error(`TTS failed: ${response.status} ${await response.text()}`);
    }
    // Transient gateway hiccup: one bounded retry, honoring Retry-After.
    const retryAfter = Number(response.headers.get("Retry-After"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 800;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export async function streamSpeech(endpoint: string, text: string, signal?: AbortSignal): Promise<void> {
  signal?.throwIfAborted();
  const context = speechContext();
  const sources = new Set<AudioBufferSourceNode>();
  let playhead = 0;
  let pending = new Uint8Array(0);
  let completed = false;
  let samplesPlayed = 0;
  const controller = new AbortController();
  const stopAll = () => {
    for (const source of sources) {
      try {
        source.stop();
      } catch {
        // Already stopped or finished; nothing to do.
      }
    }
    sources.clear();
  };
  const abort = () => {
    controller.abort(signal?.reason);
    stopAll();
  };
  signal?.addEventListener("abort", abort, { once: true });
  let playback: Promise<void> = Promise.resolve();
  try {
    await ensureRunning(context);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("נדרשת כניסה לחשבון להשמעת הקול");
    const response = await fetchSpeech(endpoint, text, session.access_token, controller.signal);
    const parser = createParser({
      onEvent(event) {
        const payload = JSON.parse(event.data) as { type: string; audio?: string; error?: unknown };
        if (payload.type === "error" || payload.error) throw new Error(`Speech failed: ${event.data}`);
        if (payload.type === "speech.audio.done") {
          completed = true;
          return;
        }
        if (payload.type !== "speech.audio.delta") return;
        if (completed || !payload.audio) throw new Error("Invalid speech audio event");
        const decoded = decodePCM(
          pending,
          Uint8Array.from(atob(payload.audio), (c) => c.charCodeAt(0)),
        );
        pending = new Uint8Array(decoded.pending);
        if (!decoded.samples.length) return;
        samplesPlayed += decoded.samples.length;
        const buffer = context.createBuffer(1, decoded.samples.length, 24000);
        buffer.copyToChannel(decoded.samples, 0);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        sources.add(source);
        playback = new Promise<void>((resolve) => {
          source.onended = () => {
            sources.delete(source);
            resolve();
          };
        });
        // Device startup can clip audio scheduled exactly at currentTime.
        playhead = Math.max(playhead, context.currentTime + 0.05);
        source.start(playhead);
        playhead += buffer.duration;
      },
    });
    const stream = response.body;
    if (!stream) throw new Error("TTS failed: empty response");
    const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        parser.feed(next.value);
      }
      parser.reset({ consume: true });
    } finally {
      reader.releaseLock();
    }
    if (!completed || !samplesPlayed || pending.length) throw new Error("Incomplete speech stream");
    await playback;
    signal?.throwIfAborted();
  } finally {
    signal?.removeEventListener("abort", abort);
    controller.abort();
    stopAll();
  }
}
