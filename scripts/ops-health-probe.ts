#!/usr/bin/env tsx
/**
 * Dürüst liveness / readiness. Credential icat etmez.
 * Liveness DB istemez. Readiness DATABASE_URL ping + Auth/PayTR/Inngest sicili.
 *
 *   npm run ops:health-probe
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { probeLiveness, probeReadiness } from "@/lib/kernel/health/probe";
import { withPgLibpqSslCompat } from "./ops-migrate-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:health-probe BAŞARISIZ: ${message}`);
  process.exit(1);
}

async function pingUrl(url: string): Promise<void> {
  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const live = probeLiveness(process.env);
  console.log(
    `→ liveness HTTP ${live.statusCode} probe=${live.body.probe} ok=${live.body.ok}`,
  );
  if (live.statusCode !== 200 || !live.body.ok) {
    fail("liveness 200 değil.");
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() || process.env.DIRECT_URL?.trim() || "";
  const ready = await probeReadiness({
    databaseUrl,
    env: process.env,
    pingDb: async () => {
      if (!databaseUrl) {
        throw new Error("unconfigured");
      }
      await pingUrl(databaseUrl);
    },
  });
  console.log(
    `→ readiness HTTP ${ready.statusCode} db=${ready.body.checks.db} auth=${ready.body.checks.supabaseAuth} payments=${ready.body.checks.payments} inngest=${ready.body.checks.inngest}`,
  );
  if (ready.body.checks.db === "down") {
    fail("readiness db=down — TCP / şifre / Direct Port.");
  }
  if (ready.statusCode === 200) {
    console.log("ops:health-probe OK — live 200, ready 200 (DB + sicil).");
    return;
  }
  if (ready.body.checks.db === "ok") {
    console.log(
      `ops:health-probe OK — live 200, DB ping ok, readiness ${ready.statusCode} dürüst (${ready.body.error ?? "sicil eksik"}).`,
    );
    return;
  }
  if (ready.body.checks.db === "unconfigured") {
    console.log("ops:health-probe OK — live 200, DATABASE_URL yok; readiness dürüst unconfigured.");
    return;
  }
  fail(`readiness beklenmeyen durum HTTP ${ready.statusCode} db=${ready.body.checks.db}`);
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
