#!/usr/bin/env tsx
/**
 * Operatör sicil iptali. Super Admin HTTP yok.
 *
 *   npm run ops:revoke-academy-certificate -- --hash <64hex> --reason "en az sekiz karakter"
 *
 * learnerId basılmaz. Kamu: /academy/dogrula/{hash} → sealStatus revoked.
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import { BadRequestError, NotFoundError } from "@/lib/kernel/http/errors";
import {
  isForbiddenPoolerUrl,
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";
import {
  createPgAcademyRevokePort,
  parseRevokeCliArgs,
  runOperatorCertificateRevoke,
} from "./ops-revoke-academy-certificate-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:revoke-academy-certificate BAŞARISIZ: ${message}`);
  process.exit(1);
}

function appBase(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

async function main(): Promise<void> {
  const parsed = parseRevokeCliArgs(process.argv.slice(2));
  if ("error" in parsed) {
    fail(parsed.error);
  }
  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!url) {
    fail("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }
  if (isForbiddenPoolerUrl(url)) {
    fail("İptal işlem havuzu (:6543 / pooler) üzerinden çalışmaz.");
  }

  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const port = createPgAcademyRevokePort(client);
    const result = await runOperatorCertificateRevoke(port, parsed);
    const publicView = await resolvePublicAcademyCertificate(port, parsed.hash);
    const hash =
      result.certificate.certificateHash ?? result.certificate.serialKey;
    console.log(`   applied=${result.applied}`);
    console.log(`   sealStatus=${publicView.status === "found" ? publicView.view.sealStatus : publicView.status}`);
    if (result.certificate.revokedAt) {
      console.log(`   revokedAt=${result.certificate.revokedAt.toISOString()}`);
    }
    console.log(`   kamu ${appBase()}/academy/dogrula/${hash}`);
    console.log(`   v1 GET ${appBase()}/api/v1/academy/certificates/${hash}`);
    if (!result.applied) {
      console.log("   ikinci iptal — applied=false (zaten iptal).");
    }
    console.log("ops:revoke-academy-certificate OK — HTTP yüzeyi yok.");
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      fail(error.message);
    }
    throw error;
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
