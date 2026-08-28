#!/usr/bin/env tsx
/**
 * Lab Postgres apply + gerçek DB testleri.
 * Hosted DIRECT_URL yok sayılır; loopback yetkin_rail_lab kullanılır.
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import {
  LAB_POSTGRES_DEFAULT_URL,
  isLabLoopbackUrl,
} from "./ops-migrate-lib";

const ROOT = process.cwd();

function fail(message: string): never {
  console.error(`verify:pg-lab BAŞARISIZ: ${message}`);
  process.exit(1);
}

const candidate = (
  process.env.RAIL_PG_LAB_URL?.trim() ||
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  LAB_POSTGRES_DEFAULT_URL
).trim();
const url = isLabLoopbackUrl(candidate) ? candidate : LAB_POSTGRES_DEFAULT_URL;

process.env.RAIL_PG_INTEGRATION = "1";
process.env.DIRECT_URL = url;
process.env.DATABASE_URL = url;

function run(script: string): void {
  console.log(`\n=== ${script} ===`);
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCmd, ["run", script], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (result.error) {
    fail(`${script}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(`${script} çıkış ${result.status ?? "null"}`);
  }
}

void resolve;
console.log(`verify:pg-lab — loopback ${url}`);
run("ops:lab-postgres");
run("db:generate");
run("test:pg");
run("ops:pg-backup-restore");
run("ops:list-payment-anomalies");
run("ops:hosted-apply-preflight");
run("ops:health-probe");
console.log("\nverify:pg-lab OK — Prisma zinciri + SQL mühür + PG testleri + dump/restore + anomali listesi + hosted preflight.");
