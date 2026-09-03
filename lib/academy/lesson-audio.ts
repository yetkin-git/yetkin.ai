/**
 * Ders ses medyası — Zero-Cost Streaming bağlayıcısı.
 * İzleme anında canlı TTS tetiklenmez; mühürlü WAV kamu yolundan okunur.
 */

import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

/**
 * Mühürlü WAV süreleri (saniye, yuvarlanmış).
 * Diskteki dosya ile `tests/academy/media-release-seal.test.ts` senkronlar.
 * Bake sonrası süre değişirse bu tabloyu güncelle.
 */
export const ACADEMY_SEALED_AUDIO_DURATION_SEC = {
  "ai-agent-temel-1": 337,
  "ai-agent-temel-2": 290,
  "ai-agent-temel-3": 180,
  "ai-agent-temel-4": 161,
  "ai-agent-temel-5": 154,
  "ai-agent-temel-6": 169,
  "ai-agent-orta-1": 185,
  "ai-agent-orta-2": 207,
  "ai-agent-orta-3": 286,
  // ai-agent-orta-4: yeniden bake sonrası süre yazılır (eski 239 sn damgası temizlendi).
  // ai-agent-orta-5 / ai-agent-orta-6: mühürlü WAV yok — süre damgası yok.
  "ai-agent-ileri-1": 373,
  "ai-agent-ileri-2": 101,
  "ai-agent-ileri-3": 378,
  "ai-agent-ileri-4": 104,
} as const;

type AcademySealedLessonKey = keyof typeof ACADEMY_SEALED_AUDIO_DURATION_SEC;

/**
 * Tarayıcı `Cache-Control: immutable` kırıcı. WAV yenilenince damgayı yükselt.
 * Ders 2: 2026-09-02 13:50 UTC bake — `prompt-muhendisligi-ve-yapisandirilmis-cikti`.
 * Ders 3: 2026-09-02 19:20 UTC bake — `arac-kullanimi-tool-calling-mantigi`.
 * Ders 4: 2026-09-02 20:26 UTC bake — `hafiza-mimarisi-context-window-vector-storage`.
 * Ders 5: 2026-09-02 20:46 UTC bake — `karar-verme-donguleri-react-deseni`.
 * Ders 6: 2026-09-02 21:37 UTC bake — `mini-proje-hava-durumu-ve-not-alma-araclarini-kullanan-basit-bir-python-ai-agent`.
 * ai-agent-orta-1: 2026-09-02 22:33 UTC bake — SQL & Fail-Closed.
 * ai-agent-orta-2: 2026-09-02 22:58 UTC bake — Text-to-SQL ve Parametre Yönetimi.
 * ai-agent-orta-3: 2026-09-02 23:15 UTC bake — REST API ve Webhook Kullanımı.
 * ai-agent-orta-4: eski 1788392869 damgası temizlendi; yeniden bake sonrası yazılır.
 * ai-agent-orta-5 / ai-agent-orta-6: mühür/önbellek damgası yok.
 */
export const ACADEMY_SEALED_AUDIO_CACHE_V: Partial<Record<AcademySealedLessonKey, number>> = {
  "ai-agent-orta-1": 1788388429,
  "ai-agent-orta-2": 1788389930,
  "ai-agent-orta-3": 1788391046,
  "ai-agent-temel-2": 1788357023,
  "ai-agent-temel-3": 1788376798,
  "ai-agent-temel-4": 1788380780,
  "ai-agent-temel-5": 1788392804,
  "ai-agent-temel-6": 1788385053,
};

export function academyLessonAudioPublicPath(courseSlug: string, lessonKey: string): string {
  const slug = courseSlug.trim();
  const key = lessonKey.trim();
  return `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/${slug}/${key}.wav`;
}

export function academySealedAudioCacheVersion(lessonKey: string): number {
  const key = lessonKey.trim() as AcademySealedLessonKey;
  const revision = ACADEMY_SEALED_AUDIO_CACHE_V[key];
  if (typeof revision === "number" && revision > 0) {
    return revision;
  }
  const duration = ACADEMY_SEALED_AUDIO_DURATION_SEC[key];
  return typeof duration === "number" && duration > 0 ? duration : 0;
}

/** Oynatıcı adresi — kanonik yola `?v=` damgası; disk/DB yolu değişmez. */
export function academyLessonAudioPlaybackSrc(courseSlug: string, lessonKey: string): string {
  const path = academyLessonAudioPublicPath(courseSlug, lessonKey);
  const version = academySealedAudioCacheVersion(lessonKey);
  return version > 0 ? `${path}?v=${version}` : path;
}

export function academySealedAudioDurationSec(courseSlug: string, lessonKey: string): number {
  if (!isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
    return 0;
  }
  const sec = ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonKey as keyof typeof ACADEMY_SEALED_AUDIO_DURATION_SEC];
  return typeof sec === "number" && sec > 0 ? sec : 0;
}

function finitePositiveSec(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Oynatıcı süresi — Chrome 24 kHz WAV ~1:47 (107 sn) uydurma duration basar.
 * Mühürlü / kelime saati daha uzunsa o damga kullanılır.
 */
export function academyPlayerClockDurationSec(input: {
  audioDuration: number;
  sealedDuration: number;
  spokenDuration: number;
}): number {
  const audio = finitePositiveSec(input.audioDuration);
  const sealed = finitePositiveSec(input.sealedDuration);
  const spoken = finitePositiveSec(input.spokenDuration);
  const trusted = sealed || spoken;
  if (audio > 0 && trusted > 0 && audio <= 120 && trusted > 150) {
    return trusted;
  }
  return audio || trusted;
}

export { isAcademyLessonAudioSealed };
