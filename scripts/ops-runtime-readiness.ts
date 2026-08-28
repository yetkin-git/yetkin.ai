#!/usr/bin/env tsx
/**
 * Üretim Inngest / PayTR webhook 503-kör kalmasın diye env sicili.
 * Sır basmaz. Prebuild zincirinde yoktur (yerel boş anahtar yeşil kalır).
 *
 *   npm run ops:runtime-readiness
 *
 * Üretimde (NODE_ENV=production) Inngest çifti, PayTR üçlüsü,
 * DATABASE_URL boşsa, ya da Direct havuz /
 * PayTR sandbox-mock / localhost APP_URL duruyorsa çıkış 1.
 * DEVLABS_KEY_PEPPER donmuş oda; üretim bloğu değildir.
 * Geliştirmede tablo basılır, çıkış 0. Direct :5432 / session-mode ve
 * GET /api/health Inngest sicili simüle edilir; canlı DB ping atılmaz.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { formatFullRuntimeReadiness } from "./ops-runtime-readiness-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

const { body, exitCode } = formatFullRuntimeReadiness(process.env);

if (exitCode !== 0) {
  console.error(`ops:runtime-readiness BAŞARISIZ:\n${body}`);
  console.error("Runbook: .system_docs/OPS_RUNBOOK.md §5.1 503 çıkış");
  process.exit(1);
}

console.log(`ops:runtime-readiness:\n${body}`);
