import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@/lib/academy/lesson-json-disk";
import "@/lib/academy/production-seal-disk";

/** Vitest `.env.local` yüklemez. Yalnız dinleme bayrağı okunur; anahtar taşınmaz. */
function academyMediaReadFromLocalEnv(): string | null {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const row of raw.split(/\r?\n/u)) {
      const line = row.trim();
      if (!line.startsWith("ACADEMY_MEDIA_READ=")) {
        continue;
      }
      const value = line.slice("ACADEMY_MEDIA_READ=".length).trim().replace(/^["']|["']$/gu, "");
      return value || null;
    }
  } catch {
    return null;
  }
  return null;
}

if (!process.env.ACADEMY_MEDIA_READ?.trim()) {
  const value = academyMediaReadFromLocalEnv();
  if (value) {
    process.env.ACADEMY_MEDIA_READ = value;
  }
}
