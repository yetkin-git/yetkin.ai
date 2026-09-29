/**
 * Beş medya katmanının disk okuyucusu. İstemci bileşenleri bu dosyayı import etmez.
 * Kayıt `instrumentation.ts` ve Vitest kurulumunda yapılır; satış yolu da aynı modülü yükler.
 */

import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { registerAcademyProductionDiskProbe } from "@/lib/academy/production-standard";

function academyProductionFileOnDisk(relativePath: string): boolean {
  const absolute = join(process.cwd(), relativePath);
  try {
    return existsSync(absolute) && statSync(absolute).size > 0;
  } catch {
    return false;
  }
}

registerAcademyProductionDiskProbe(academyProductionFileOnDisk);
