/**
 * Yapay zekâ eğitimi üretim ve doygunluk standardı — PEDAGOJI.md §D.1 ve §E.
 * Belgede §F yoktur. Mühür tabanı buradadır: ders en az 5 dakika, kurs en az 6 ders.
 * Konuşma tabanı 600 kelimedir. 600 kelime, 5 dakikalık sakin konuşmadır.
 * Üst dakika dayatması yoktur. TTS bütçe tavanı vardır: kurs 100 istek, ders 10–12 istek.
 * spokenScript taşıyan section dosyası bu alanı düz metin olarak taşır. BOM, uyumsuz bayt ve U+FFFD fail-closed.
 * Vitrin kartındaki dakika yuvarlaması `lesson-meta.ts` içindedir; bu dosya mühür tabanıdır.
 * Beş katman disk okuyucusu `production-seal-disk.ts` kaydeder. Bu dosya `node:fs` import etmez.
 */

import {
  ACADEMY_OFF201_WARMUP_VEO_ASSET_KEY,
  ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY,
  academyLessonWarmupVeoAssetKey,
} from "@/lib/academy/lesson-veo";
import { ACADEMY_PRODUCTION_SEAL_MANIFEST } from "@/lib/academy/production-seal-manifest";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";

export const ACADEMY_AI_COURSE_DURATION_MIN_MINUTES = 45;
/** Mühür tabanı. Spot kaset kurs sayılmaz. Ders adedi TTS bütçesine (100 istek) sığar. */
export const ACADEMY_AI_LESSON_COUNT_MIN = 6;
/** Taban süre. 12, 15, 18 dk serbesttir. Ders başına istek bandı 10–12’dir. */
export const ACADEMY_AI_LESSON_DURATION_MIN_MINUTES = 5;
/** 5 dk × 60 — mühürlü kaset alt tabanı (saniye). */
export const ACADEMY_AI_LESSON_DURATION_MIN_SEC = ACADEMY_AI_LESSON_DURATION_MIN_MINUTES * 60;
/**
 * Sakin konuşma tabanı. Her dersin konuşma metni en az bu kadar kelimedir.
 * 600 kelime, 5 dakikadır. Dakika hesabı bu iki sabitten türer.
 */
export const ACADEMY_AI_LESSON_SPOKEN_WORD_MIN = 600;

/**
 * 1 Maç = MAX 100 Düdük.
 * Bir kursun Gemini TTS isteği, uzatma ve duraklama dahil bu tavanı aşmaz.
 */
export const ACADEMY_MATCH_WHISTLE_MAX = 100;
/** Normal süre. Temel anlatım bu bantta planlanır. */
export const ACADEMY_MATCH_WHISTLE_REGULATION_MIN = 70;
export const ACADEMY_MATCH_WHISTLE_REGULATION_MAX = 80;
/** Yedek. Yalnız zorunlu uzatma ve duraklama bu payı kullanır. */
export const ACADEMY_MATCH_WHISTLE_RESERVE_MIN = 15;
export const ACADEMY_MATCH_WHISTLE_RESERVE_MAX = 20;

export type AcademyMatchWhistlePlan = {
  requests: number;
  withinCap: boolean;
  inRegulationBand: boolean;
  /** Maç tavanına kalan ham pay. 70 istekte 30’dur. */
  reserveRemaining: number;
  /**
   * Uzatma düdüğü. Yedek tavanı 20’dir.
   * Normal süre tavanı + yedek tavanı = maç tavanı (80 + 20 = 100).
   */
  extensionReserve: number;
};

/** 80 + 20 = 100. Normal süre tabanı bu toplamın içinde kalır. */
export function academyMatchWhistlePartitionHolds(): boolean {
  return (
    ACADEMY_MATCH_WHISTLE_REGULATION_MAX + ACADEMY_MATCH_WHISTLE_RESERVE_MAX ===
    ACADEMY_MATCH_WHISTLE_MAX
  );
}

export function academyMatchWhistlePlan(requests: number): AcademyMatchWhistlePlan {
  const reserveRemaining = ACADEMY_MATCH_WHISTLE_MAX - requests;
  return {
    requests,
    withinCap: requests <= ACADEMY_MATCH_WHISTLE_MAX,
    inRegulationBand:
      requests >= ACADEMY_MATCH_WHISTLE_REGULATION_MIN &&
      requests <= ACADEMY_MATCH_WHISTLE_REGULATION_MAX,
    reserveRemaining,
    extensionReserve: Math.min(Math.max(0, reserveRemaining), ACADEMY_MATCH_WHISTLE_RESERVE_MAX),
  };
}

/** Plan 100 düdüğü aşarsa fırın açılmaz. */
export function assertAcademyMatchWhistleBudget(requests: number): void {
  if (!Number.isInteger(requests) || requests < 0) {
    throw new Error("Maç düdük sayısı geçersiz.");
  }
  if (requests > ACADEMY_MATCH_WHISTLE_MAX) {
    throw new Error(
      `1 Maç = MAX 100 Düdük. Plan ${requests} istek, tavan ${ACADEMY_MATCH_WHISTLE_MAX}. API çağrısı yok.`,
    );
  }
}

export const ACADEMY_TTS_VOICE_GENDERS = ["female", "male"] as const;

export type AcademyTtsVoiceGender = (typeof ACADEMY_TTS_VOICE_GENDERS)[number];

export const ACADEMY_LESSON_SATURATION_BEATS = [
  {
    id: "warmup_problem",
    order: 1,
    label: "Isınma / İş Problemi",
    targetMinutes: 1.5,
    purpose: "Gerçek iş hayatı karşılığı ve problemin nedeni",
  },
  {
    id: "scenario_core",
    order: 2,
    label: "Birinci Senaryo / Temel Yöntem",
    targetMinutes: 3.5,
    purpose: "İlk istem ve çözüm — ekranda çalışan işlem",
  },
  {
    id: "scenario_edge",
    order: 3,
    label: "İkinci Senaryo / İstisna veya Kritik Durum",
    targetMinutes: 3.5,
    purpose: "Edge-case, yanlış vs doğru, kritik durum (ÖNCE / SONRA split)",
  },
  {
    id: "summary_field",
    order: 4,
    label: "Özet & Saha Görevi",
    targetMinutes: 1.5,
    purpose: "Cebine koyacakların ve aksiyon görevi",
  },
] as const;

export type AcademyLessonSaturationBeatId = (typeof ACADEMY_LESSON_SATURATION_BEATS)[number]["id"];

export const ACADEMY_SEALED_MEDIA_LAYERS = [
  "full_text",
  "timed_cues",
  "diagrams",
  "cinematic_media",
  "veo_video",
  "lyria_music",
] as const;

export type AcademySealedMediaLayer = (typeof ACADEMY_SEALED_MEDIA_LAYERS)[number];

/**
 * Zorunlu üretim sırası. Biri eksikken fırın açılmaz ve `--seal` basılmaz.
 * Kimlik dizesi `lib/kernel/ai/model-roles.ts` içindedir.
 */
export const ACADEMY_PRODUCTION_MEDIA_LAYERS = [
  "text",
  "voice",
  "video",
  "visual",
  "music",
] as const;

export type AcademyProductionMediaLayer = (typeof ACADEMY_PRODUCTION_MEDIA_LAYERS)[number];

/** 3 aşamalı kontrol kapısı. Son kapı beş katmanı teyit etmeden mühür basmaz. */
export const ACADEMY_QUALITY_GATES = [
  "draft_script",
  "pedagogy_review",
  "final_layer_check",
] as const;

export type AcademyQualityGate = (typeof ACADEMY_QUALITY_GATES)[number];

export type AcademyProductionSealPresence = Record<AcademyProductionMediaLayer, boolean>;

const ACADEMY_PRODUCTION_LAYER_LABEL: Record<AcademyProductionMediaLayer, string> = {
  text: "Metin",
  voice: "Ses",
  video: "Isınma MP4",
  visual: "Görsel JPG",
  music: "Müzik BED",
};

export type AcademyProductionDiskProbe = (relativePath: string) => boolean;

/**
 * Okuyucu yuvası. Next sunucusu `production-standard` dosyasını birden fazla pakette
 * kopyalayabilir. Modül değişkeni kopyalar arasında paylaşılmaz; satış o zaman fail-closed
 * kalır ve kart «Kayıt Kapalı / Fiyat Bekleniyor» der. `Symbol.for` süreçte tektir.
 */
const ACADEMY_PRODUCTION_DISK_PROBE = Symbol.for("yetkin.academy.productionDiskProbe");

type AcademyProductionDiskProbeBox = {
  current: AcademyProductionDiskProbe | null;
};

function productionDiskProbeBox(): AcademyProductionDiskProbeBox {
  const host = globalThis as typeof globalThis & {
    [ACADEMY_PRODUCTION_DISK_PROBE]?: AcademyProductionDiskProbeBox;
  };
  const existing = host[ACADEMY_PRODUCTION_DISK_PROBE];
  if (existing) return existing;
  const created: AcademyProductionDiskProbeBox = { current: null };
  host[ACADEMY_PRODUCTION_DISK_PROBE] = created;
  return created;
}

/** Lambda medya baytını taşımaz. Üretim okuyucusu mühür anlığıdır. */
function academyProductionManifestProbe(relativePath: string): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  return ACADEMY_PRODUCTION_SEAL_MANIFEST[normalized] === true;
}

function readProductionDiskProbe(): AcademyProductionDiskProbe | null {
  const installed = productionDiskProbeBox().current;
  // Üretimde anlık hükmeder. Yuva boşsa da, kurulu okuyucu lambda’da bayt
  // olmadığı için false dese de, anlık true ise katman durur.
  // Testte boş yuva ve sahte false okuyucu fail-closed kalır.
  if (process.env.NODE_ENV === "production") {
    return (relativePath: string) => {
      if (academyProductionManifestProbe(relativePath)) return true;
      const current = productionDiskProbeBox().current;
      if (!current) return false;
      return current(relativePath) === true;
    };
  }
  return installed;
}

/**
 * Fırın anlığını derleme paketine taşır.
 * Diskte duran yol yazılır. `dropMissing` yoksa, vitrin katmanı önceki anlıkta
 * mühürlüyse bayt bu makinede olmasa da yol düşmez. Lambda ses baytını taşımaz.
 */
export function mergeAcademyProductionSealPaths(input: {
  onDisk: readonly string[];
  previous: readonly string[];
  required: readonly string[];
  dropMissing?: boolean;
}): { paths: string[]; missingRequired: string[] } {
  const present = new Set<string>();
  for (const relative of input.onDisk) {
    const normalized = relative.replaceAll("\\", "/").trim();
    if (!normalized || normalized.includes("..") || normalized.startsWith("/")) continue;
    present.add(normalized);
  }
  if (!input.dropMissing) {
    const required = new Set(
      input.required.map((relative) => relative.replaceAll("\\", "/").trim()).filter((relative) => relative.length > 0),
    );
    for (const relative of input.previous) {
      const normalized = relative.replaceAll("\\", "/").trim();
      if (required.has(normalized)) present.add(normalized);
    }
  }
  const missingRequired = [
    ...new Set(
      input.required
        .map((relative) => relative.replaceAll("\\", "/").trim())
        .filter((relative) => relative.length > 0 && !present.has(relative)),
    ),
  ].sort();
  return {
    paths: [...present].sort(),
    missingRequired,
  };
}

/** Sunucu ve test disk okuyucusunu kaydeder. İstemci paketi `node:fs` taşımaz. */
export function registerAcademyProductionDiskProbe(next: AcademyProductionDiskProbe | null): void {
  productionDiskProbeBox().current = next;
}

/** Test sahte okuyucuyu koyduysa satış yolu onu ezmez. Boş yuva fail-closed kalır. */
export function academyProductionDiskProbeIsSet(): boolean {
  return readProductionDiskProbe() !== null;
}

/**
 * Beş katmanın repo köküne göre yolu.
 * Görsel katman dersin ilk sinema karesidir: `public/academy/cinema/{ders}-cue-1.jpg`.
 * Isınma kaseti dersin bağlı `-warmup.mp4` dosyasıdır. Bağ yoksa video yolu boştur.
 */
/**
 * Dersin ısınma dosyası. Oynatıcı bağlamı yoksa kurs kaseti aranır.
 * `01_office_ai-3` PowerPoint dersidir; kaset `01_office_ai-1-warmup.mp4` diskte durur.
 */
function academyProductionWarmupAssetKey(lessonKey: string): string | null {
  const bound = academyLessonWarmupVeoAssetKey(lessonKey);
  if (bound) return bound;
  if (lessonKey.startsWith("01_office_ai_ileri-")) return ACADEMY_OFF201_WARMUP_VEO_ASSET_KEY;
  if (lessonKey.startsWith("01_office_ai-")) return ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY;
  return null;
}

export function academyProductionLayerRelativePaths(
  courseSlug: string,
  lessonKey: string,
): Record<AcademyProductionMediaLayer, string | null> {
  const slug = courseSlug.trim();
  const key = lessonKey.trim();
  const warmup = academyProductionWarmupAssetKey(key);
  return {
    text: `lib/academy/spoken-scripts/${key}.md`,
    voice: `public/media/academy/audio/${slug}/${key}.mp3`,
    video: warmup ? `public/media/academy/micro/${warmup}.mp4` : null,
    visual: `public/academy/cinema/${key}-cue-1.jpg`,
    music: `public/media/academy/audio/${slug}/${key}.bed.mp3`,
  };
}

export function academyProductionLayerPresence(
  courseSlug: string,
  lessonKey: string,
): AcademyProductionSealPresence {
  const paths = academyProductionLayerRelativePaths(courseSlug, lessonKey);
  const read = readProductionDiskProbe();
  const present = (layer: AcademyProductionMediaLayer): boolean => {
    if (!read) return false;
    const relative = paths[layer];
    if (!relative) return false;
    return read(relative) === true;
  };
  return {
    text: present("text"),
    voice: present("voice"),
    video: present("video"),
    visual: present("visual"),
    music: present("music"),
  };
}

function academyProductionMissingLayers(
  courseSlug: string,
  lessonKey: string,
): AcademyProductionMediaLayer[] {
  const presence = academyProductionLayerPresence(courseSlug, lessonKey);
  return ACADEMY_PRODUCTION_MEDIA_LAYERS.filter((layer) => presence[layer] !== true);
}

/**
 * Son kontrol. Metin, Ses, Isınma MP4, Görsel JPG ve Müzik BED diskte yoksa `--seal` basılamaz.
 * Çağıran boolean doldurmaz. Okuyucu yoksa fail-closed.
 */
export function assertAcademyProductionSeal(target: {
  courseSlug: string;
  lessonKey: string;
}): void {
  if (!readProductionDiskProbe()) {
    throw new Error("5 medya katmanı diskten okunamadı. Fail-closed. Mühür basılmaz.");
  }
  const missing = academyProductionMissingLayers(target.courseSlug, target.lessonKey);
  if (missing.length === 0) return;
  const labels = missing.map((layer) => ACADEMY_PRODUCTION_LAYER_LABEL[layer]).join(", ");
  throw new Error(
    `5 medya katmanı eksik: ${labels}. Metin, Ses, Isınma MP4, Görsel JPG ve Müzik BED diskte birebir durmadan --seal basılamaz.`,
  );
}

/** Sınav yolundaki her dersin beş katmanı diskte duruyorsa true. Okuyucu yoksa false. */
export function academyCourseProductionDiskSealed(
  courseSlug: string,
  lessonKeys: readonly string[],
): boolean {
  if (!readProductionDiskProbe() || lessonKeys.length === 0) return false;
  return lessonKeys.every((lessonKey) => academyProductionMissingLayers(courseSlug, lessonKey).length === 0);
}

export const ACADEMY_OPTIONAL_LEVEL_PACKAGES = ["Temel", "Orta", "İleri"] as const;

export type AcademyOptionalLevelPackage = (typeof ACADEMY_OPTIONAL_LEVEL_PACKAGES)[number];

export function isAcademyTtsVoiceGender(value: string): value is AcademyTtsVoiceGender {
  return (ACADEMY_TTS_VOICE_GENDERS as readonly string[]).includes(value.trim());
}

export function academyTtsVoiceGenderFromLabel(raw: string | null | undefined): AcademyTtsVoiceGender | null {
  const folded = raw?.trim().toLowerCase() ?? "";
  if (folded === "female" || folded === "kadin" || folded === "kadın") {
    return "female";
  }
  if (folded === "male" || folded === "erkek") {
    return "male";
  }
  return null;
}

export function isAcademyAiCourseDurationMinutes(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= ACADEMY_AI_COURSE_DURATION_MIN_MINUTES;
}

export function isAcademyAiLessonCount(count: number): boolean {
  return Number.isInteger(count) && count >= ACADEMY_AI_LESSON_COUNT_MIN;
}

export function isAcademyAiLessonDurationMinutes(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= ACADEMY_AI_LESSON_DURATION_MIN_MINUTES;
}

export function isAcademyAiLessonDurationSec(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds >= ACADEMY_AI_LESSON_DURATION_MIN_SEC;
}

/** Sakin konuşma. 600 kelime / 5 dakika. Tempo katsayısı bu oran değildir. */
export function academyCalmSpeechWordsPerMinute(): number {
  return ACADEMY_AI_LESSON_SPOKEN_WORD_MIN / ACADEMY_AI_LESSON_DURATION_MIN_MINUTES;
}

/** Konuşma dakikası. Kelime tabanı ve dakika tabanı dışında bir hız burada durmaz. */
export function academySpokenMinutesFromWordCount(wordCount: number): number {
  if (!Number.isFinite(wordCount) || wordCount < 1) {
    throw new Error("Konuşma kelime sayısı boş.");
  }
  const perMinute = academyCalmSpeechWordsPerMinute();
  return Math.round((wordCount / perMinute) * 10) / 10;
}

export function isAcademyAiLessonSpokenWordCount(count: number): boolean {
  return Number.isInteger(count) && count >= ACADEMY_AI_LESSON_SPOKEN_WORD_MIN;
}

/** 600 kelimenin altı fail-closed. Fırın açılmaz. */
export function assertAcademyAiLessonSpokenWordCount(count: number, lessonLabel: string): void {
  const label = lessonLabel.trim() || "ders";
  if (isAcademyAiLessonSpokenWordCount(count)) return;
  const shown = Number.isFinite(count) ? String(count) : "geçersiz";
  throw new Error(
    `${label} konuşma metni ${shown} kelime. Taban ${ACADEMY_AI_LESSON_SPOKEN_WORD_MIN} kelime. Fail-closed. Fırın açılmaz.`,
  );
}

/** 6 dersten azı fail-closed. Fırın açılmaz. */
export function assertAcademyAiLessonCount(count: number, courseLabel: string): void {
  const label = courseLabel.trim() || "eğitim";
  if (isAcademyAiLessonCount(count)) return;
  const shown = Number.isFinite(count) ? String(count) : "geçersiz";
  throw new Error(
    `${label} ders sayısı ${shown}. Taban ${ACADEMY_AI_LESSON_COUNT_MIN} ders. Fail-closed. Fırın açılmaz.`,
  );
}

const ACADEMY_SECTION_SPOKEN_SCRIPT =
  /(?:^|[\r\n])[ \t]*(?:export[ \t]+)?const[ \t]+spokenScript[ \t]*=[ \t]*`([\s\S]*?)`[ \t]*;/u;

/** Dosya gövdesindeki düz `spokenScript` metni. Dolaylı `${...}` fail-closed. */
export function academySpokenScriptFromSectionSource(source: string, lessonLabel: string): string {
  const label = lessonLabel.trim() || "ders";
  const body = source.match(ACADEMY_SECTION_SPOKEN_SCRIPT)?.[1];
  if (body === undefined) {
    throw new Error(`${label} spokenScript alanı yok. Fail-closed. Fırın açılmaz.`);
  }
  if (body.includes("${")) {
    throw new Error(`${label} spokenScript dolaylı ifade taşıyor. Fail-closed. Fırın açılmaz.`);
  }
  return body;
}

/** `spokenScript` en az 600 kelimedir. Altı fail-closed. */
export function assertAcademySectionSpokenScriptSource(source: string, lessonLabel: string): number {
  const words = countAcademyMarkdownWords(academySpokenScriptFromSectionSource(source, lessonLabel));
  assertAcademyAiLessonSpokenWordCount(words, lessonLabel);
  return words;
}

/** Metindeki U+FFFD fail-closed. Bayt denetimi `assertAcademyUtf8SourceBytes`. */
export function assertAcademyUtf8Text(text: string, label: string): void {
  const name = label.trim() || "dosya";
  if (text.includes("\uFFFD")) {
    throw new Error(`${name} bozuk karakter taşıyor. Fail-closed. Fırın açılmaz.`);
  }
}

/**
 * UTF-8, BOM'suz. Uyumsuz bayt veya bozuk karakter fail-closed.
 * Bu fonksiyon diski okumaz. Baytı çağıran verir.
 */
export function assertAcademyUtf8SourceBytes(bytes: Uint8Array, label: string): void {
  const name = label.trim() || "dosya";
  const b0 = bytes[0];
  const b1 = bytes[1];
  const b2 = bytes[2];
  if (b0 === 0xef && b1 === 0xbb && b2 === 0xbf) {
    throw new Error(`${name} UTF-8 BOM taşıyor. Fail-closed. Fırın açılmaz.`);
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${name} UTF-8 uyumsuz bayt taşıyor. Fail-closed. Fırın açılmaz.`);
  }
  assertAcademyUtf8Text(text, name);
}

export function academyLessonSaturationTotalMinutes(): number {
  return ACADEMY_LESSON_SATURATION_BEATS.reduce((sum, beat) => sum + beat.targetMinutes, 0);
}
