/**
 * Junior ipucu kutusu sesi.
 * Harita `JUNIOR_HINT_EFFECTS` içindedir. Çalma yereldir. Dış API yoktur.
 */

import {
  juniorHintEffectForMoment,
  type JuniorHintMoment,
} from "@/lib/junior/voice";

let shared: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    return null;
  }
  if (!shared || shared.state === "closed") {
    shared = new Ctx();
  }
  return shared;
}

/** Tıklama anında bağlamı açar. Sonraki efekt, aynı bağlamda çalar. */
export function primeJuniorHintAudio(): void {
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  void ctx.resume();
}

function playChime(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + index * 0.08;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}

function playApplause(ctx: AudioContext): void {
  const now = ctx.currentTime;
  for (let index = 0; index < 8; index += 1) {
    const duration = 0.08;
    const start = now + index * 0.07;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let sample = 0; sample < data.length; sample += 1) {
      data[sample] = (Math.random() * 2 - 1) * (1 - sample / data.length);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.1, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(start);
    source.stop(start + duration);
  }
}

export function playJuniorHintEffect(moment: JuniorHintMoment): void {
  const effect = juniorHintEffectForMoment(moment);
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  const sound = effect.kind === "applause" ? playApplause : playChime;
  void ctx.resume().then(() => sound(ctx)).catch(() => undefined);
}
