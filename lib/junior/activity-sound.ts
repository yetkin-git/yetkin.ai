/**
 * Etkinlik Stüdyosu + simülasyon işitsel geri bildirimi.
 * Web Audio sentezi; dış dosya / API yok.
 */

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

/** İlk tıklamada bağlamı açar; sonraki efekt aynı oturumda çalar. */
export function primeActivityAudio(): void {
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  void ctx.resume();
}

function synthesizeApplause(ctx: AudioContext): void {
  const now = ctx.currentTime;
  for (let index = 0; index < 10; index += 1) {
    const duration = 0.07 + (index % 3) * 0.01;
    const start = now + index * 0.055;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let sample = 0; sample < data.length; sample += 1) {
      data[sample] = (Math.random() * 2 - 1) * (1 - sample / data.length);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1600 + (index % 4) * 220;
    filter.Q.value = 0.85;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.11, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(start);
    source.stop(start + duration);
  }
  // Neşeli üst ton — alkışın üzerine kısa «bravo» çanı
  const cheerNotes = [523.25, 659.25, 783.99] as const;
  cheerNotes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + 0.05 + index * 0.07;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.06, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.35);
  });
}

/**
 * Sevimli «Ooooo!» — yumuşak ünlü kayması + hafif formant.
 * Yanlış hamle / kalan / sallanma için.
 */
function synthesizeOops(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const duration = 0.72;

  const carrier = ctx.createOscillator();
  const body = ctx.createOscillator();
  const formant = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  carrier.type = "triangle";
  body.type = "sine";
  carrier.frequency.setValueAtTime(420, now);
  carrier.frequency.exponentialRampToValueAtTime(190, now + duration);
  body.frequency.setValueAtTime(210, now);
  body.frequency.exponentialRampToValueAtTime(95, now + duration);

  formant.type = "bandpass";
  formant.frequency.setValueAtTime(620, now);
  formant.frequency.exponentialRampToValueAtTime(380, now + duration);
  formant.Q.value = 2.2;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.05);
  gain.gain.setValueAtTime(0.08, now + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  carrier.connect(formant);
  body.connect(formant);
  formant.connect(gain);
  gain.connect(ctx.destination);

  carrier.start(now);
  body.start(now);
  carrier.stop(now + duration + 0.02);
  body.stop(now + duration + 0.02);

  // Kısa «şaşkınlık» tıkırtısı başta
  const tick = ctx.createOscillator();
  const tickGain = ctx.createGain();
  tick.type = "sine";
  tick.frequency.value = 880;
  tickGain.gain.setValueAtTime(0.0001, now);
  tickGain.gain.exponentialRampToValueAtTime(0.04, now + 0.01);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  tick.connect(tickGain);
  tickGain.connect(ctx.destination);
  tick.start(now);
  tick.stop(now + 0.1);
}

/** 👏 Doğru hamle, tam bölünme, başarılı soru / eşleştirme. */
export function playApplauseSound(): void {
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  void ctx
    .resume()
    .then(() => synthesizeApplause(ctx))
    .catch(() => undefined);
}

/** 😮 Yanlış hamle, açıkta kalan, hatalı seçim — sevimli «Ooooo!». */
export function playOopsSound(): void {
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  void ctx
    .resume()
    .then(() => synthesizeOops(ctx))
    .catch(() => undefined);
}
