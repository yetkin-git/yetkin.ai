#!/usr/bin/env tsx
/**
 * Canlı Storage CORS dumanı — Dashboard jokerini kodla kapatamaz; OPTIONS ile mühürler.
 * ops:migrate kilitli yedi SQL'e eklenmez. Prebuild zincirinde yoktur (canlı ağ).
 *
 *   npm run ops:storage-cors
 *
 * İki prob: Rail origin PUT sözleşmesi + yetkisiz kökün joker/yansıma ile açılmadığı.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import {
  STUDIO_STORAGE_BUCKET,
  STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN,
  assertStudioStorageCorsHeaders,
  assertStudioStorageCorsRejectsForeignOrigin,
  studioStorageCorsOrigin,
} from "@/archived/lib/studio/storage";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:storage-cors BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function probeCors(
  probeUrl: string,
  origin: string,
): Promise<{ allowOrigin: string | null; allowMethods: string | null; status: number }> {
  const response = await fetch(probeUrl, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "PUT",
      "Access-Control-Request-Headers": "content-type,x-upsert",
    },
  });
  return {
    allowOrigin: response.headers.get("access-control-allow-origin"),
    allowMethods: response.headers.get("access-control-allow-methods"),
    status: response.status,
  };
}

async function main(): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!appUrl) {
    fail("NEXT_PUBLIC_APP_URL yok. .system_docs/OPS_RUNBOOK.md §9 / .system_docs/STORAGE_CONTRACT.md");
  }
  if (!supabaseUrl) {
    fail("NEXT_PUBLIC_SUPABASE_URL yok. Storage OPTIONS vurulamaz.");
  }

  const origin = studioStorageCorsOrigin(appUrl);
  const probeUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${STUDIO_STORAGE_BUCKET}/cors-probe`;
  const foreign = STUDIO_STORAGE_CORS_FOREIGN_PROBE_ORIGIN;
  console.log(`→ OPTIONS ${probeUrl}`);
  console.log(`→ Origin ${origin} (PUT)`);

  const rail = await probeCors(probeUrl, origin);
  console.log(
    `← Rail ACAO=${rail.allowOrigin ?? "(yok)"} ACAM=${rail.allowMethods ?? "(yok)"} status=${rail.status}`,
  );

  console.log(`→ Origin ${foreign} (yetkisiz kök)`);
  const stranger = await probeCors(probeUrl, foreign);
  console.log(
    `← Yabancı ACAO=${stranger.allowOrigin ?? "(yok)"} ACAM=${stranger.allowMethods ?? "(yok)"} status=${stranger.status}`,
  );

  const problems: string[] = [];
  try {
    assertStudioStorageCorsHeaders(
      { allowOrigin: rail.allowOrigin, allowMethods: rail.allowMethods },
      appUrl,
    );
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }
  try {
    assertStudioStorageCorsRejectsForeignOrigin(
      { allowOrigin: stranger.allowOrigin },
      foreign,
    );
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }
  if (problems.length > 0) {
    fail(problems.join(" | "));
  }

  console.log("ops:storage-cors OK — origin Rail, metod PUT, joker yok, yetkisiz kök kapalı.");
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
