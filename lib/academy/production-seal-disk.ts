/**
 * Beş medya katmanının disk okuyucusu. İstemci bileşenleri bu dosyayı import etmez.
 * Kayıt `instrumentation.ts` ve Vitest kurulumunda yapılır; satış yolu da aynı modülü yükler.
 *
 * Üretim okuması `production-seal-manifest.ts` anlığıdır. `join(process.cwd(), göreli)`
 * Turbopack'in tüm depoyu `_middleware` izine almasına yol açar (1016 MB, tavan 250 MB).
 * Geliştirme ve test `turbopackIgnore` ile yalnız istenen dosyaya bakar.
 * `ACADEMY_MEDIA_READ=storage` iken ses ve fon yatağı diskte aranmaz.
 * Manifestodaki yol, ya da mühürlü hazırlık şeridi, kovadaki kopya sayılır.
 */

import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ACADEMY_PRODUCTION_SEAL_MANIFEST } from "@/lib/academy/production-seal-manifest";
import {
  ACADEMY_PREP_STRIP_AUDIO_SEALED,
  academyPrepStripForSlug,
} from "@/lib/academy/prep-strip";
import { registerAcademyProductionDiskProbe } from "@/lib/academy/production-standard";

const SEAL_RELATIVE_PREFIXES = [
  "lib/academy/spoken-scripts/",
  "public/media/academy/audio/",
  "public/media/academy/micro/",
  "public/academy/cinema/",
] as const;

const AUDIO_RELATIVE_PREFIX = "public/media/academy/audio/";

function isSafeSealRelative(relativePath: string): boolean {
  if (!relativePath || relativePath.startsWith("/") || relativePath.includes("..")) {
    return false;
  }
  return SEAL_RELATIVE_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

/** Hazırlık şeridi beş katman anlığında yoktur. Mührü ayrı bayraktır; kova onu da taşır. */
function sealedPrepAudioRelative(normalized: string): boolean {
  if (!normalized.startsWith(AUDIO_RELATIVE_PREFIX) || !normalized.endsWith(".mp3")) {
    return false;
  }
  for (const slug of Object.keys(ACADEMY_PREP_STRIP_AUDIO_SEALED)) {
    if (ACADEMY_PREP_STRIP_AUDIO_SEALED[slug] !== true) {
      continue;
    }
    const strip = academyPrepStripForSlug(slug);
    if (!strip) {
      continue;
    }
    if (normalized === `${AUDIO_RELATIVE_PREFIX}${strip.slug}/${strip.key}.mp3`) {
      return true;
    }
  }
  return false;
}

/**
 * Ses kovada ise manifesto (ve mühürlü hazırlık şeridi) yeter.
 * Diğer katmanlar ve `local` okuma diske bakar.
 */
function mediaReadIsStorage(): boolean {
  return process.env.ACADEMY_MEDIA_READ?.trim().toLowerCase() === "storage";
}

function storageAudioCounts(normalized: string): boolean {
  if (!mediaReadIsStorage()) {
    return false;
  }
  if (!normalized.startsWith(AUDIO_RELATIVE_PREFIX)) {
    return false;
  }
  return ACADEMY_PRODUCTION_SEAL_MANIFEST[normalized] === true || sealedPrepAudioRelative(normalized);
}

/** Test ve satış kapısı aynı hükmü okur. Dosya yoksa false. */
export function academyProductionFilePresent(relativePath: string): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  if (!isSafeSealRelative(normalized)) {
    return false;
  }
  if (process.env.NODE_ENV === "production") {
    return ACADEMY_PRODUCTION_SEAL_MANIFEST[normalized] === true;
  }
  if (storageAudioCounts(normalized)) {
    return true;
  }
  const absolute = join(/*turbopackIgnore: true*/ process.cwd(), normalized);
  try {
    return existsSync(absolute) && statSync(absolute).size > 0;
  } catch {
    return false;
  }
}

registerAcademyProductionDiskProbe(academyProductionFilePresent);
