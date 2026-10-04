/**
 * Beş medya katmanının disk okuyucusu. İstemci bileşenleri bu dosyayı import etmez.
 * Kayıt `instrumentation.ts` ve Vitest kurulumunda yapılır; satış yolu da aynı modülü yükler.
 *
 * Üretim okuması `production-seal-manifest.ts` anlığıdır. `join(process.cwd(), göreli)`
 * Turbopack'in tüm depoyu `_middleware` izine almasına yol açar (1016 MB, tavan 250 MB).
 * Geliştirme ve test `turbopackIgnore` ile yalnız istenen dosyaya bakar.
 */

import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { ACADEMY_PRODUCTION_SEAL_MANIFEST } from "@/lib/academy/production-seal-manifest";
import { registerAcademyProductionDiskProbe } from "@/lib/academy/production-standard";

const SEAL_RELATIVE_PREFIXES = [
  "lib/academy/spoken-scripts/",
  "public/media/academy/audio/",
  "public/media/academy/micro/",
  "public/academy/cinema/",
] as const;

function isSafeSealRelative(relativePath: string): boolean {
  if (!relativePath || relativePath.startsWith("/") || relativePath.includes("..")) {
    return false;
  }
  return SEAL_RELATIVE_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function academyProductionFileOnDisk(relativePath: string): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  if (!isSafeSealRelative(normalized)) {
    return false;
  }
  if (process.env.NODE_ENV === "production") {
    return ACADEMY_PRODUCTION_SEAL_MANIFEST[normalized] === true;
  }
  const absolute = join(/*turbopackIgnore: true*/ process.cwd(), normalized);
  try {
    return existsSync(absolute) && statSync(absolute).size > 0;
  } catch {
    return false;
  }
}

registerAcademyProductionDiskProbe(academyProductionFileOnDisk);
