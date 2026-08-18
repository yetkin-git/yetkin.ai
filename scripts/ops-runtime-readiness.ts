#!/usr/bin/env tsx
/**
 * Üretim Inngest / PayTR webhook 503-kör kalmasın diye env sicili.
 * Sır basmaz. Prebuild zincirinde yoktur (yerel boş anahtar yeşil kalır).
 *
 *   npm run ops:runtime-readiness
 *
 * Üretimde (NODE_ENV=production) Inngest çifti, PayTR üçlüsü veya
 * DATABASE_URL boşsa çıkış 1. Geliştirmede tablo basılır, çıkış 0.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import {
  evaluateRuntimeReadiness,
  formatRuntimeReadiness,
  runtimeReadinessExitCode,
} from "@/lib/kernel/jobs/runtime-readiness";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

const report = evaluateRuntimeReadiness(process.env);
const body = formatRuntimeReadiness(report);
const code = runtimeReadinessExitCode(report);

if (code !== 0) {
  console.error(`ops:runtime-readiness BAŞARISIZ:\n${body}`);
  console.error("Runbook: .system_docs/OPS_RUNBOOK.md §5.1 503 çıkış");
  process.exit(1);
}

console.log(`ops:runtime-readiness:\n${body}`);
