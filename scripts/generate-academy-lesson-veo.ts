#!/usr/bin/env tsx
/**
 * Isınma B-roll — otomatik Veo API iptal (PEDAGOJI §E.4).
 * Yalnız `public/media/academy/micro/*-warmup.mp4` yerel kaset reuse.
 * Ofis istemi Gemini arayüzünde elle kullanılır; bu betik çağrı açmaz.
 *   npx tsx scripts/generate-academy-lesson-veo.ts --dry-run
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  ACADEMY_OFF201_WARMUP_VEO_ASSET_KEY,
  ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY,
  ACADEMY_WARMUP_OFFICE_PROMPT,
  academyWarmupCassetteFileName,
  assertAcademyVeoApiCancelled,
} from "@/lib/academy/lesson-veo";

const ROOT = process.cwd();
const MICRO_DIR = join(ROOT, "public", "media", "academy", "micro");
const WARMUP_KEYS = [ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY, ACADEMY_OFF201_WARMUP_VEO_ASSET_KEY] as const;

function refuseApiFlags(argv: readonly string[]): void {
  if (
    argv.includes("--seal") ||
    argv.includes("--confirm-gemini-spend") ||
    argv.includes("--force")
  ) {
    process.stderr.write(
      "Otomatik Veo 3.1 API iptal. --seal, --confirm-gemini-spend ve --force video çağrısı açmaz. Yerel -warmup.mp4 reuse.\n",
    );
    process.exit(1);
  }
}

function main(): void {
  assertAcademyVeoApiCancelled();
  const argv = process.argv.slice(2);
  refuseApiFlags(argv);
  const dryRun = argv.includes("--dry-run") || argv.includes("--sample-only");
  let missing = 0;
  for (const key of WARMUP_KEYS) {
    const fileName = academyWarmupCassetteFileName(key);
    const dest = join(MICRO_DIR, fileName);
    if (existsSync(dest)) {
      process.stdout.write(`reuse ${dest} (yerel -warmup.mp4; Veo API iptal)\n`);
      continue;
    }
    missing += 1;
    process.stderr.write(`eksik yerel kaset ${dest}\n`);
  }
  if (dryRun) {
    process.stdout.write(`dry-run ofis istemi (API yok): ${ACADEMY_WARMUP_OFFICE_PROMPT}\n`);
  }
  if (missing > 0) {
    process.stderr.write(
      "Eksik kaset Gemini arayüzünden manuel üretilip public/media/academy/micro/ altına -warmup.mp4 olarak konur.\n",
    );
    process.exit(1);
  }
}

main();
