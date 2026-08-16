#!/usr/bin/env tsx
/**
 * Canlı Storage CORS dumanı — Dashboard jokerini kodla kapatamaz; OPTIONS ile mühürler.
 * ops:migrate kilitli yedi SQL'e eklenmez. Prebuild zincirinde yoktur (canlı ağ).
 *
 *   npm run ops:storage-cors
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import {
  STUDIO_STORAGE_BUCKET,
  assertStudioStorageCorsHeaders,
  studioStorageCorsOrigin,
} from "@/lib/studio/storage";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:storage-cors BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!appUrl) {
    fail("NEXT_PUBLIC_APP_URL yok. docs/07_OPS_RUNBOOK.md §9 / docs/08_STORAGE_CONTRACT.md");
  }
  if (!supabaseUrl) {
    fail("NEXT_PUBLIC_SUPABASE_URL yok. Storage OPTIONS vurulamaz.");
  }

  const origin = studioStorageCorsOrigin(appUrl);
  const probeUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${STUDIO_STORAGE_BUCKET}/cors-probe`;
  console.log(`→ OPTIONS ${probeUrl}`);
  console.log(`→ Origin ${origin} (PUT)`);

  const response = await fetch(probeUrl, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "PUT",
      "Access-Control-Request-Headers": "content-type,x-upsert",
    },
  });

  const allowOrigin = response.headers.get("access-control-allow-origin");
  const allowMethods = response.headers.get("access-control-allow-methods");
  try {
    assertStudioStorageCorsHeaders({ allowOrigin, allowMethods }, appUrl);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }

  console.log("ops:storage-cors OK — origin Rail, metod PUT, joker yok.");
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
