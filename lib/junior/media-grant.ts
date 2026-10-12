import "server-only";

import { RAIL_V1_JUNIOR_MEDIA_UNAVAILABLE } from "@/lib/kernel/http/v1-contract";
import { readR2SigningConfig, type R2MediaEnv } from "@/lib/media/r2-config";
import { presignR2GetUrl } from "@/lib/media/r2-s3";
import { juniorLessonAccess, juniorLessonByKey } from "@/lib/junior/catalog";
import { juniorCoverSrc } from "@/lib/junior/covers";
import { juniorLessonAudioSrc, juniorLessonHasBakedAudio } from "@/lib/junior/voice";
import { juniorCourseSlugFromLessonKey } from "@/lib/junior/human-titles";
import {
  JUNIOR_LOCKED_MEDIA_PREFIX,
  juniorLockedMediaObjectKey,
} from "@/lib/junior/media-visibility";
import { JUNIOR_CORE_WARMUP_SRC, juniorWarmupSrc, type JuniorWarmupSlug } from "@/lib/junior/warmup";

export { JUNIOR_LOCKED_MEDIA_PREFIX };

/**
 * Kilitli Junior medyası kamu `/media/junior/...` yolunda teslim edilmez.
 * Nesne `private/junior/` önekindedir. Adres, paket kararı geçtikten sonra sorgu imzası ile üretilir.
 * Ücretsiz ilk konu kamu adresinde kalır. İmza üretilemezse kamu yola düşülmez.
 */

/** Kısa ömür. Alt sınır 60, üst sınır 900 saniye (`presignR2GetUrl`). */
export const JUNIOR_MEDIA_GRANT_TTL_SEC = 600;

export const JUNIOR_MEDIA_UNAVAILABLE = RAIL_V1_JUNIOR_MEDIA_UNAVAILABLE;

export type JuniorMediaUrls = {
  audioUrl: string | null;
  warmupUrl: string | null;
  coverUrl: string | null;
  expiresAt: string | null;
};

export type JuniorMediaGrant =
  | { kind: "public"; urls: JuniorMediaUrls }
  | { kind: "signed"; urls: JuniorMediaUrls }
  | { kind: "denied" }
  | { kind: "unavailable" }
  | { kind: "missing" };

function lockedObjectKey(kind: "audio" | "warmup" | "covers", fileName: string): string {
  return juniorLockedMediaObjectKey(kind, fileName);
}

function publicUrls(lessonKey: string): JuniorMediaUrls {
  return {
    audioUrl: juniorLessonAudioSrc(lessonKey),
    warmupUrl: juniorWarmupSrc(lessonKey),
    coverUrl: juniorCoverSrc(lessonKey),
    expiresAt: null,
  };
}

/** Süreç ortamı ile R2 ayar tipi arasında açık köprü. Yalnız R2 ve medya kökü anahtarları okunur. */
function r2EnvFrom(env: R2MediaEnv | NodeJS.ProcessEnv): R2MediaEnv {
  return {
    R2_BUCKET_NAME: env.R2_BUCKET_NAME,
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
    R2_ENDPOINT: env.R2_ENDPOINT,
    R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
    NEXT_PUBLIC_MEDIA_BASE_URL: env.NEXT_PUBLIC_MEDIA_BASE_URL,
  };
}

function signedUrls(lessonKey: string, env: R2MediaEnv, now: Date): JuniorMediaUrls | null {
  let signing;
  try {
    signing = readR2SigningConfig(env);
  } catch {
    return null;
  }
  const expiresAt = new Date(now.getTime() + JUNIOR_MEDIA_GRANT_TTL_SEC * 1000).toISOString();
  const audioName = juniorLessonHasBakedAudio(lessonKey) ? `${lessonKey}.mp3` : null;
  const slug = juniorCourseSlugFromLessonKey(lessonKey);
  const warmupName =
    slug && Object.prototype.hasOwnProperty.call(JUNIOR_CORE_WARMUP_SRC, slug)
      ? `${slug as JuniorWarmupSlug}-warmup.mp4`
      : null;
  const sign = (objectKey: string) =>
    presignR2GetUrl({
      endpoint: signing.endpoint,
      bucket: signing.bucket,
      objectKey,
      accessKeyId: signing.accessKeyId,
      secretAccessKey: signing.secretAccessKey,
      expiresSec: JUNIOR_MEDIA_GRANT_TTL_SEC,
      now,
    });
  return {
    audioUrl: audioName ? sign(lockedObjectKey("audio", audioName)) : null,
    warmupUrl: warmupName ? sign(lockedObjectKey("warmup", warmupName)) : null,
    coverUrl: sign(lockedObjectKey("covers", `${lessonKey}.jpg`)),
    expiresAt,
  };
}

/**
 * `entitled` yalnız kilitli ders içindir. Ücretsiz konu her zaman kamu adresidir.
 * Yetkisiz kilitli ders adres taşımaz. İmza üretilemezse kamu yola düşülmez.
 */
export function issueJuniorLessonMedia(input: {
  lessonKey: string;
  entitled: boolean;
  now?: Date;
  env?: R2MediaEnv | NodeJS.ProcessEnv;
}): JuniorMediaGrant {
  const lessonKey = input.lessonKey.trim();
  if (!juniorLessonByKey(lessonKey)) {
    return { kind: "missing" };
  }
  const access = juniorLessonAccess(lessonKey);
  if (access === "missing") {
    return { kind: "missing" };
  }
  if (access === "free") {
    return { kind: "public", urls: publicUrls(lessonKey) };
  }
  if (!input.entitled) {
    return { kind: "denied" };
  }
  const urls = signedUrls(lessonKey, r2EnvFrom(input.env ?? process.env), input.now ?? new Date());
  if (!urls) {
    return { kind: "unavailable" };
  }
  return { kind: "signed", urls };
}

/**
 * Web oynatıcı. Kilitli ve açılmış derste üretim ortamı imza yoksa kamu yola düşmez.
 * Geliştirme ortamında kova yoksa yerel kamu dosyası kalır; API bu düşüşü yapmaz.
 */
export function juniorWebPlaybackMedia(input: {
  lessonKey: string;
  catalogLocked: boolean;
  opened: boolean;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}): { lockPublicMedia: boolean; audioUrl: string | null; warmupUrl: string | null } {
  if (!input.opened || !input.catalogLocked) {
    return { lockPublicMedia: false, audioUrl: null, warmupUrl: null };
  }
  const grant = issueJuniorLessonMedia({
    lessonKey: input.lessonKey,
    entitled: true,
    env: input.env,
    now: input.now,
  });
  if (grant.kind === "signed") {
    return {
      lockPublicMedia: true,
      audioUrl: grant.urls.audioUrl,
      warmupUrl: grant.urls.warmupUrl,
    };
  }
  if ((input.env ?? process.env).NODE_ENV === "production") {
    return { lockPublicMedia: true, audioUrl: null, warmupUrl: null };
  }
  return { lockPublicMedia: false, audioUrl: null, warmupUrl: null };
}
