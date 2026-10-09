/**
 * Junior öğretmen sesi ve pedagojik fon müziği.
 * Kimlik `ACADEMY_SEALED_MEDIA_MODEL` içindedir. Bu dosya o dizeyi ikinci kez yazmaz.
 * Dinleme anında dış TTS veya müzik çağrısı yoktur.
 */

import { startsWithJuniorWarmOpening } from "@/lib/junior/content-rules";
import { JUNIOR_ELECTIVE_SLUGS, JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import { ACADEMY_SEALED_MEDIA_MODEL } from "@/lib/kernel/ai/model-roles";
import { resolvePublicMediaUrl } from "@/lib/media/public-url";

export const JUNIOR_TTS_MODEL_ID = ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS;
export const JUNIOR_BED_MODEL_ID = ACADEMY_SEALED_MEDIA_MODEL.MUSIC_GEN;

/** Dinleme anında dış müzik veya TTS çağrısı yok. Katman kimliği mühürlüdür. */
export const JUNIOR_MEDIA_CALLS_EXTERNAL_API = false as const;

/** Pedagojik odak yatağı. Vokalsiz, 44.1 kHz stereo. Kimlik `MUSIC_GEN`. */
export const JUNIOR_BED_SAMPLE_RATE_HZ = 44_100 as const;
export const JUNIOR_BED_CHANNELS = 2 as const;

/**
 * Lyria fırın istemi. Model dizesi burada ikinci kez yazılmaz.
 * Sinüs üreticisi bu istemi çalmaz.
 */
export const JUNIOR_BED_PROMPT =
  "Instrumental only, no vocals, no lyrics, no humming, no choir. Calm pedagogical focus bed for a child lesson. Soft piano, warm pad, a very light pulse kept far back. About sixty seconds, loop-friendly, gentle edges so it can repeat under a spoken lesson. Stays quiet under the teacher. No bright melody that fights speech. 44.1 kHz stereo." as const;

export const JUNIOR_BED_LAYER = {
  role: "MUSIC_GEN",
  model: JUNIOR_BED_MODEL_ID,
  vocal: false,
  sampleRateHz: JUNIOR_BED_SAMPLE_RATE_HZ,
  channels: JUNIOR_BED_CHANNELS,
  callsExternalApi: JUNIOR_MEDIA_CALLS_EXTERNAL_API,
  producer: "scripts/bake-junior-bgm-light-learning.ts",
} as const;

export type JuniorHintMoment = "box-open" | "grasped";

/**
 * Gelişimsel ipucu kutusu sesi.
 * Chime kutu açılınca, alkış çocuk noktayı kavrayınca çalar.
 * İkisi de yerel sentezdir. Öğretmen TTS ve fon müziğinin yerine geçmez.
 */
export const JUNIOR_HINT_EFFECTS = {
  chime: {
    id: "junior-hint-chime",
    kind: "chime",
    moment: "box-open",
    label: "İpucu kutusu chime",
    callsExternalApi: JUNIOR_MEDIA_CALLS_EXTERNAL_API,
  },
  applause: {
    id: "junior-hint-applause",
    kind: "applause",
    moment: "grasped",
    label: "Kavrayış alkışı",
    callsExternalApi: JUNIOR_MEDIA_CALLS_EXTERNAL_API,
  },
} as const;

export type JuniorHintEffect = (typeof JUNIOR_HINT_EFFECTS)[keyof typeof JUNIOR_HINT_EFFECTS];

export function juniorHintEffectForMoment(moment: JuniorHintMoment): JuniorHintEffect {
  return moment === "grasped" ? JUNIOR_HINT_EFFECTS.applause : JUNIOR_HINT_EFFECTS.chime;
}

export type JuniorBranchTeacher = {
  slug: (typeof JUNIOR_PILOT_SLUGS)[number];
  subject: string;
  name: string;
  voice: string;
  tone: string;
};

/**
 * 11 yaş ritmik odağı. Fırın konuşmayı ffmpeg WSOLA ile bu katsayıya çeker.
 * Dinleme anında dış TTS çağrısı yoktur.
 */
export const JUNIOR_BAKE_ATEMPO = 0.94 as const;

/** Yayın MP3 kökü. Dinleme anında dış TTS çağrısı yoktur. */
export const JUNIOR_AUDIO_PUBLIC_DIR = "/media/junior/audio" as const;

/**
 * Paylaşılan odak yatağının yayın yolu.
 * Üretim `JUNIOR_BED_LAYER.producer` üzerinden `MUSIC_GEN` okur.
 * Dinleme anında dış müzik API’si yoktur.
 */
export const JUNIOR_BGM_PUBLIC_PATH = `${JUNIOR_AUDIO_PUBLIC_DIR}/bgm-light-learning.mp3` as const;

/** Anlatıcı konuşurken duck — anlatımı bastırmaz (%15–%20 bandı). */
export const JUNIOR_BGM_SPEECH_VOLUME = 0.18 as const;

/** Kaset durunca / karar anında ortam — tam sessizlik yok (%10–%15 bandı). */
export const JUNIOR_BGM_AMBIENT_VOLUME = 0.12 as const;

export function juniorBgmSrc(): string {
  return resolvePublicMediaUrl(JUNIOR_BGM_PUBLIC_PATH);
}

/** Mühürlü çekirdek kaset yoksa robot sese düşülmez. */
export const JUNIOR_VOICE_PREPARING_LABEL = "Ses hazırlanıyor." as const;

/**
 * Diskte fırınlanmış yayın MP3 anahtarları.
 * Oynatıcı bu listedeki derslerde HTML5 audio çalar.
 * Dosya yoksa veya açılmazsa robot sese düşmez; «Ses hazırlanıyor.» kalır.
 * Listede olmayan seçmeli konuda tarayıcı konuşması yedek kalır.
 */
export const JUNIOR_BAKED_AUDIO_KEYS = [
  "jr_06_mat-1",
  "jr_06_mat-2",
  "jr_06_mat-3",
  "jr_06_mat-4",
  "jr_06_mat-5",
  "jr_06_mat-6",
  "jr_06_mat-7",
  "jr_06_mat-8",
  "jr_06_mat-9",
  "jr_06_mat-10",
  "jr_06_mat-11",
  "jr_06_mat-12",
  "jr_06_mat-13",
  "jr_06_mat-14",
  "jr_06_mat-15",
  "jr_06_mat-16",
  "jr_06_mat-17",
  "jr_06_mat-18",
  "jr_06_mat-19",
  "jr_06_mat-20",
  "jr_06_mat-21",
  "jr_06_mat-22",
  "jr_06_mat-23",
  "jr_06_mat-24",
  "jr_06_mat-25",
  "jr_06_fen-1",
  "jr_06_fen-2",
  "jr_06_fen-3",
  "jr_06_fen-4",
  "jr_06_fen-5",
  "jr_06_fen-6",
  "jr_06_fen-7",
  "jr_06_fen-8",
  "jr_06_fen-9",
  "jr_06_fen-10",
  "jr_06_fen-11",
  "jr_06_fen-12",
  "jr_06_fen-13",
  "jr_06_fen-14",
  "jr_06_fen-15",
  "jr_06_fen-16",
  "jr_06_fen-17",
  "jr_06_fen-18",
  "jr_06_fen-19",
  "jr_06_fen-20",
  "jr_06_turkce-1",
  "jr_06_turkce-2",
  "jr_06_turkce-3",
  "jr_06_turkce-4",
  "jr_06_turkce-5",
  "jr_06_turkce-6",
  "jr_06_turkce-7",
  "jr_06_turkce-8",
  "jr_06_turkce-9",
  "jr_06_turkce-10",
  "jr_06_turkce-11",
  "jr_06_turkce-12",
  "jr_06_turkce-13",
  "jr_06_turkce-14",
  "jr_06_turkce-15",
  "jr_06_turkce-16",
  "jr_06_turkce-17",
  "jr_06_turkce-18",
  "jr_06_turkce-19",
  "jr_06_turkce-20",
  "jr_06_sosyal-1",
  "jr_06_sosyal-2",
  "jr_06_sosyal-3",
  "jr_06_sosyal-4",
  "jr_06_sosyal-5",
  "jr_06_sosyal-6",
  "jr_06_sosyal-7",
  "jr_06_sosyal-8",
  "jr_06_sosyal-9",
  "jr_06_sosyal-10",
  "jr_06_sosyal-11",
  "jr_06_sosyal-12",
  "jr_06_sosyal-13",
  "jr_06_sosyal-14",
  "jr_06_sosyal-15",
  "jr_06_sosyal-16",
  "jr_06_sosyal-17",
  "jr_06_sosyal-18",
  "jr_06_sosyal-19",
  "jr_06_sosyal-20",
  "jr_06_ing_main-1",
  "jr_06_ing_main-2",
  "jr_06_ing_main-3",
  "jr_06_ing_main-4",
  "jr_06_ing_main-5",
  "jr_06_ing_main-6",
  "jr_06_ing_main-7",
  "jr_06_ing_main-8",
  "jr_06_ing_main-9",
  "jr_06_ing_main-10",
  "jr_06_ing_main-11",
  "jr_06_ing_main-12",
  "jr_06_ing_main-13",
  "jr_06_ing_main-14",
  "jr_06_ing_main-15",
  "jr_06_ing_main-16",
  "jr_06_ing_main-17",
  "jr_06_ing_main-18",
  "jr_06_ing_main-19",
  "jr_06_ing_main-20",
] as const;

export type JuniorBakedAudioKey = (typeof JUNIOR_BAKED_AUDIO_KEYS)[number];

export function juniorLessonAudioPublicPath(lessonKey: string): string {
  const key = lessonKey.trim();
  if (!key) {
    throw new Error("Junior ses yolu: ders anahtarı boş.");
  }
  return `${JUNIOR_AUDIO_PUBLIC_DIR}/${key}.mp3`;
}

/** Fırınlanmış kaset varsa yayın yolu; yoksa null. Mühürlü anahtar robot sese düşmez. */
export function juniorLessonAudioSrc(lessonKey: string): string | null {
  const key = lessonKey.trim();
  if (!(JUNIOR_BAKED_AUDIO_KEYS as readonly string[]).includes(key)) {
    return null;
  }
  return resolvePublicMediaUrl(juniorLessonAudioPublicPath(key));
}

/** Çekirdek ders branşına göre öğretmen. Yetişkin kurs sesinin yerine yazılmaz. */
export const JUNIOR_BRANCH_TEACHERS = [
  { slug: "jr_06_mat", subject: "Matematik", name: "Selim", voice: "Charon", tone: "Erkek / Sıcak ve güven veren" },
  { slug: "jr_06_fen", subject: "Fen Bilimleri", name: "Deniz", voice: "Leda", tone: "Kadın / Neşeli ve meraklı" },
  { slug: "jr_06_turkce", subject: "Türkçe", name: "Elif", voice: "Aoede", tone: "Kadın / Duru ve anlaşılır" },
  { slug: "jr_06_ing_main", subject: "İngilizce", name: "Selin", voice: "Kore", tone: "Kadın / Dinamik ve çift dilli" },
  { slug: "jr_06_sosyal", subject: "Sosyal Bilgiler", name: "Murat", voice: "Achird", tone: "Erkek / Samimi hikâye anlatıcısı" },
] as const satisfies readonly JuniorBranchTeacher[];

export const JUNIOR_ELECTIVE_TEACHER = {
  name: "Ada",
  voice: "Enceladus",
  tone: "Seçmeli ders",
} as const;

function juniorLessonSlug(lessonKey: string): string {
  return lessonKey.replace(/-\d+$/u, "");
}

export function juniorTeacherForLesson(lessonKey: string): {
  name: string;
  voice: string;
  subject: string;
  tone: string;
  model: typeof JUNIOR_TTS_MODEL_ID;
} {
  const slug = juniorLessonSlug(lessonKey);
  const branch = JUNIOR_BRANCH_TEACHERS.find((row) => row.slug === slug);
  if (branch) {
    return {
      name: branch.name,
      voice: branch.voice,
      subject: branch.subject,
      tone: branch.tone,
      model: JUNIOR_TTS_MODEL_ID,
    };
  }
  const elective = (JUNIOR_ELECTIVE_SLUGS as readonly string[]).includes(slug);
  return {
    name: JUNIOR_ELECTIVE_TEACHER.name,
    voice: JUNIOR_ELECTIVE_TEACHER.voice,
    subject: elective ? "Seçmeli Ders" : "Junior",
    tone: JUNIOR_ELECTIVE_TEACHER.tone,
    model: JUNIOR_TTS_MODEL_ID,
  };
}

/**
 * Açılışta öğretmen kendini tanıtır.
 * SEN mührü: «öğretmenin» (siz hitabı ve «öğretmeniniz» yasaktır).
 */
export function juniorTeacherSelfIntro(lessonKey: string): string {
  const teacher = juniorTeacherForLesson(lessonKey);
  return `ben ${teacher.subject} öğretmenin ${teacher.name}.`;
}

/**
 * Sıcak açılışın hemen ardına branş öğretmeni tanıtımını bağlar.
 * Zaten mühürlüyse ikinci kez yazılmaz.
 */
export function sealJuniorTeacherIntro(welcome: string, lessonKey: string): string {
  const trimmed = welcome.replace(/\s+/g, " ").trim();
  const intro = juniorTeacherSelfIntro(lessonKey);
  const teacher = juniorTeacherForLesson(lessonKey);
  if (!trimmed || trimmed.includes(intro) || trimmed.includes(`öğretmenin ${teacher.name}`)) {
    return trimmed;
  }
  if (!startsWithJuniorWarmOpening(trimmed)) {
    return `${intro} ${trimmed}`.replace(/\s+/g, " ").trim();
  }
  /** İlk hitap vuruşunun (virgül veya ünlem) hemen ardına bağlanır. */
  const beat = trimmed.match(/^(.+?[!,])\s*/u);
  if (!beat) {
    return `${intro} ${trimmed}`.replace(/\s+/g, " ").trim();
  }
  const head = beat[1]!;
  const restRaw = trimmed.slice(beat[0].length).trim();
  const rest = restRaw
    ? `${restRaw.charAt(0).toLocaleUpperCase("tr-TR")}${restRaw.slice(1)}`
    : "";
  return `${head} ${intro} ${rest}`.replace(/\s+/g, " ").trim();
}
