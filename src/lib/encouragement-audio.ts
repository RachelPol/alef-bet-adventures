import israeliYasher from "@/assets/praise/israeli-yasher.wav.asset.json";
import israeliSuccess from "@/assets/praise/israli-success.wav.asset.json";
import israeliBravo from "@/assets/praise/israeli-bravo.wav.asset.json";
import litvishYasher from "@/assets/praise/litvish-yasher.wav.asset.json";
import litvishSuccess from "@/assets/praise/litvish-success.wav.asset.json";
import litvishBravo from "@/assets/praise/litvish-bravo.wav.asset.json";
import { getAccountDialect } from "./account-speech";
import { PRAISE, praiseIndex } from "./encouragement";

const clips = { israeli: [israeliYasher, israeliSuccess, israeliBravo], litvish: [litvishYasher, litvishSuccess, litvishBravo] };
let previous = -1;
let audio: HTMLAudioElement | null = null;
export function stopEncouragement() { audio?.pause(); audio = null; }
export function preloadEncouragement() {
  for (const clip of clips[getAccountDialect()]) { const player = new Audio(clip.url); player.preload = "auto"; player.load(); }
}
export function playEncouragement() {
  const index = praiseIndex(previous); previous = index;
  const clip = clips[getAccountDialect()][index];
  stopEncouragement();
  if (clip) { audio = new Audio(clip.url); audio.volume = .75; void audio.play().catch(() => undefined); }
  return PRAISE[index]?.text ?? PRAISE[0].text;
}
let context: AudioContext | null = null;
export function successSound(milestone = false) {
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => undefined);
    const start = context.currentTime;
    const notes = milestone ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880, 1046.5];
    notes.forEach((frequency, i) => {
      if (!context) return;
      const oscillator = context.createOscillator(); const gain = context.createGain();
      oscillator.type = "sine"; oscillator.frequency.setValueAtTime(frequency, start + i * .07);
      gain.gain.setValueAtTime(0, start + i * .07);
      gain.gain.linearRampToValueAtTime(.045, start + i * .07 + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + i * .07 + .12);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(start + i * .07); oscillator.stop(start + i * .07 + .13);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch { /* Optional effects must never interrupt the game. */ }
}