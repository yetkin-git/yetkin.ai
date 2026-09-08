/**
 * yetkin.ai — Akademi Ses Kazancı & Yazılımsal Ses Yükseltme (Audio Gain Boost)
 * Web Audio API GainNode entegrasyonu.
 * Varsayılan ses kazancı: %130 (1.30)
 * TTS çıktısının tok, dolgun ve net duyulmasını sağlar (sistem sesi %60 iken bile).
 */

export const ACADEMY_AUDIO_DEFAULT_GAIN = 1.3;

export type AcademyAudioBoost = {
  audioContext: AudioContext;
  gainNode: GainNode;
  setGain: (volume: number, muted?: boolean) => void;
  resume: () => Promise<void>;
  dispose: () => void;
};

const BOOSTED_ELEMENTS = new WeakMap<HTMLAudioElement, AcademyAudioBoost>();

export function getOrCreateAcademyAudioGainBoost(
  audio: HTMLAudioElement | null,
  gainMultiplier = ACADEMY_AUDIO_DEFAULT_GAIN,
): AcademyAudioBoost | null {
  if (!audio || typeof window === "undefined") {
    return null;
  }

  const existing = BOOSTED_ELEMENTS.get(audio);
  if (existing) {
    return existing;
  }

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) {
    return null;
  }

  try {
    const audioContext = new AudioCtx();
    const sourceNode = audioContext.createMediaElementSource(audio);
    const gainNode = audioContext.createGain();

    gainNode.gain.setValueAtTime(gainMultiplier, audioContext.currentTime);

    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const boost: AcademyAudioBoost = {
      audioContext,
      gainNode,
      setGain: (volume: number, muted = false) => {
        try {
          const val = muted ? 0 : Math.max(0, volume * gainMultiplier);
          gainNode.gain.setValueAtTime(val, audioContext.currentTime);
        } catch {
          // Fallback ignore
        }
      },
      resume: async () => {
        try {
          if (audioContext.state === "suspended") {
            await audioContext.resume();
          }
        } catch {
          // Ignore resume errors
        }
      },
      dispose: () => {
        try {
          sourceNode.disconnect();
          gainNode.disconnect();
          BOOSTED_ELEMENTS.delete(audio);
          void audioContext.close();
        } catch {
          // Ignore cleanup errors
        }
      },
    };

    BOOSTED_ELEMENTS.set(audio, boost);
    return boost;
  } catch {
    // Tarayıcı güvenliği veya izin kısıtlamasında sessizce fallback'e dön
    return null;
  }
}
