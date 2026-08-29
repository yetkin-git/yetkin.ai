#!/usr/bin/env tsx
/**
 * Hosted DIRECT_URL apply ön kontrolü.
 * Lab Auth stub basmaz. 28 Prisma + sekiz SQL disk mührü.
 * Hosted URL varsa TCP :5432; apply için `npm run ops:migrate`.
 *
 *   npm run ops:hosted-apply-preflight
 */

import dns from "node:dns";
import net from "node:net";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import {
  DIRECT_PORT_OPERATOR_PROTOCOL,
  DIRECT_POSTGRES_PORT,
  EXPECTED_PRISMA_MIGRATIONS,
  EXPECTED_SQL,
  assertHostedApplyTargetUrl,
  hostedApplyForbidsLabStub,
  inspectHostedApplyDiskPlan,
  isHostedSupabaseDirectUrl,
  isLabLoopbackUrl,
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

const ROOT = process.cwd();

dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

dns.setDefaultResultOrder("ipv6first");

function fail(message: string): never {
  console.error(`ops:hosted-apply-preflight BAŞARISIZ: ${message}`);
  process.exit(1);
}

function probeDirectTcp(hostname: string, port: number, timeoutMs = 8000): Promise<void> {
  return new Promise((resolveProbe, rejectProbe) => {
    const socket = net.connect({ host: hostname, port });
    const timer = setTimeout(() => {
      socket.destroy();
      rejectProbe(new Error("timeout"));
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolveProbe();
    });
    socket.once("error", (error) => {
      clearTimeout(timer);
      socket.destroy();
      rejectProbe(error);
    });
  });
}

async function pingHosted(url: string): Promise<void> {
  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    await client.query("SELECT 1 AS ok");
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const plan = inspectHostedApplyDiskPlan(ROOT);
  console.log(
    `→ Disk plan: ${plan.prismaFolders.length} Prisma / ${plan.sqlFiles.length} SQL (kilit ${EXPECTED_PRISMA_MIGRATIONS.length} / ${EXPECTED_SQL.length})`,
  );
  for (const folder of plan.prismaFolders) {
    console.log(`     - ${folder}`);
  }
  for (const file of plan.sqlFiles) {
    console.log(`     - ${file}`);
  }
  if (plan.issues.length > 0) {
    fail(plan.issues.join("; "));
  }

  const migrateSrc = readFileSync(resolve(ROOT, "scripts", "ops-migrate.ts"), "utf8");
  const labSrc = readFileSync(resolve(ROOT, "scripts", "ops-lab-postgres.ts"), "utf8");
  const stubIssues = hostedApplyForbidsLabStub(migrateSrc, labSrc);
  if (stubIssues.length > 0) {
    fail(stubIssues.join("; "));
  }
  console.log("   lab Auth stub ops:migrate yolunda yok — hosted Auth şemasına stub basılmaz.");

  const url = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!url) {
    console.log(
      "ops:hosted-apply-preflight OK — disk mühür yeşil. DIRECT_URL yok; TCP/apply operatör secret store sonrası.",
    );
    return;
  }

  if (isLabLoopbackUrl(url)) {
    console.log(
      "   mevcut URL lab loopback. Hosted apply bu adreste koşulmaz; lab için ops:lab-postgres.",
    );
    console.log("ops:hosted-apply-preflight OK — disk mühür yeşil (lab URL yok sayıldı).");
    return;
  }

  if (!isHostedSupabaseDirectUrl(url)) {
    fail(
      `DIRECT_URL hosted Direct değil. ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }

  const shape = assertHostedApplyTargetUrl(url);
  console.log(`→ Hosted Direct ön kontrol: ${shape.hostname}:${shape.port}`);
  try {
    await probeDirectTcp(shape.hostname, DIRECT_POSTGRES_PORT);
    console.log("   TCP :5432 açık.");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(
      `Direct :5432 erişilemedi (${shape.hostname}:${shape.port} — ${detail}). ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }

  try {
    await pingHosted(url);
    console.log("   SELECT 1 OK.");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    fail(`Hosted ping düştü (${detail}). Şifre / IPv4 add-on / SSL. Apply yok.`);
  }

  console.log(
    "ops:hosted-apply-preflight OK — disk + Direct TCP + ping. Sonraki: npm run ops:migrate (DROP SCHEMA yok).",
  );
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
