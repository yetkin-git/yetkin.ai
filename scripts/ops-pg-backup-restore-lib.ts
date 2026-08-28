/**
 * pg_dump / restore dumanı — defter satır sayısı, idempotency anahtarı, requestId.
 * Kaynak veritabanının üzerine yazmaz. Restore slot ayrıdır.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import { resolveLabPostgresBinDir } from "./ops-lab-pg-runtime";
import {
  LAB_POSTGRES_DATABASE,
  LAB_RESTORE_DATABASE,
  isLabLoopbackUrl,
  labDatabaseName,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

export type CashIntegritySnapshot = {
  ledgerCount: number;
  ledgerIdempotencyKeys: string[];
  idempotencyCount: number;
  idempotencySlots: string[];
  anomalyCount: number;
  anomalyRequestIds: string[];
  walletCount: number;
  walletSumMinor: number;
};

export type BackupRestoreResult = {
  dumpPath: string;
  dumpMs: number;
  restoreMs: number;
  source: CashIntegritySnapshot;
  restored: CashIntegritySnapshot;
};

function failTool(bin: string, args: string[], result: ReturnType<typeof spawnSync>): never {
  const stderr = typeof result.stderr === "string" ? result.stderr : result.stderr?.toString() ?? "";
  const stdout = typeof result.stdout === "string" ? result.stdout : result.stdout?.toString() ?? "";
  throw new Error(`${bin} ${args.join(" ")} çıktı ${result.status ?? "null"}: ${stderr || stdout}`.trim());
}

function whichTool(name: string): string | null {
  const finder = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(finder, [name], { encoding: "utf8", windowsHide: true });
  if (result.status !== 0) {
    return null;
  }
  const line = result.stdout
    .split(/\r?\n/)
    .map((row) => row.trim())
    .find((row) => row.length > 0);
  return line ?? null;
}

export function resolvePgDumpBin(): string {
  const fromPath = whichTool(process.platform === "win32" ? "pg_dump.exe" : "pg_dump");
  if (fromPath && existsSync(fromPath)) {
    return fromPath;
  }
  const labDir = resolveLabPostgresBinDir();
  if (labDir) {
    const candidate = join(labDir, process.platform === "win32" ? "pg_dump.exe" : "pg_dump");
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error("pg_dump yok. CI: postgresql-client; Windows lab: .tmp/pg-lab ikilisi.");
}

export function resolvePgRestoreBin(): string {
  const fromPath = whichTool(process.platform === "win32" ? "pg_restore.exe" : "pg_restore");
  if (fromPath && existsSync(fromPath)) {
    return fromPath;
  }
  const labDir = resolveLabPostgresBinDir();
  if (labDir) {
    const candidate = join(labDir, process.platform === "win32" ? "pg_restore.exe" : "pg_restore");
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error("pg_restore yok. CI: postgresql-client; Windows lab: .tmp/pg-lab ikilisi.");
}

export function adminPostgresUrl(url: string): string {
  const parsed = new URL(url.trim());
  parsed.pathname = "/postgres";
  return parsed.toString();
}

export function databaseUrlWithName(url: string, database: string): string {
  const parsed = new URL(url.trim());
  parsed.pathname = `/${database}`;
  return parsed.toString();
}

export function assertBackupSourceUrl(url: string): void {
  if (!isLabLoopbackUrl(url)) {
    throw new Error(
      "ops:pg-backup-restore yalnız lab loopback yetkin_rail_lab. Hosted dump bu betikte yoktur (CREATE DATABASE yetkin_rail_lab_restore hosted'de yok). Direct :5432 pg_dump --format=custom; restore ayrı proje. .system_docs/OPS_RUNBOOK.md §19.",
    );
  }
  if (labDatabaseName(url) !== LAB_POSTGRES_DATABASE) {
    throw new Error(`Kaynak veritabanı ${LAB_POSTGRES_DATABASE} değil.`);
  }
}

export async function readCashIntegritySnapshot(url: string): Promise<CashIntegritySnapshot> {
  const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
  await client.connect();
  try {
    const ledger = await client.query<{ idempotency_key: string }>(
      `SELECT idempotency_key FROM ledger_entries ORDER BY created_at ASC, id ASC`,
    );
    const slots = await client.query<{ user_id: string; route: string; key: string }>(
      `SELECT user_id, route, key FROM http_idempotency_records ORDER BY created_at ASC, id ASC`,
    );
    const anomalies = await client.query<{ request_id: string }>(
      `SELECT request_id FROM payment_anomalies ORDER BY created_at ASC, id ASC`,
    );
    const wallets = await client.query<{ count: string; sum: string | null }>(
      `SELECT COUNT(*)::text AS count, COALESCE(SUM(amount_minor), 0)::text AS sum FROM wallets`,
    );
    return {
      ledgerCount: ledger.rows.length,
      ledgerIdempotencyKeys: ledger.rows.map((row) => row.idempotency_key),
      idempotencyCount: slots.rows.length,
      idempotencySlots: slots.rows.map((row) => `${row.user_id}\t${row.route}\t${row.key}`),
      anomalyCount: anomalies.rows.length,
      anomalyRequestIds: anomalies.rows.map((row) => row.request_id),
      walletCount: Number(wallets.rows[0]?.count ?? "0"),
      walletSumMinor: Number(wallets.rows[0]?.sum ?? "0"),
    };
  } finally {
    await client.end();
  }
}

export function cashIntegrityEqual(left: CashIntegritySnapshot, right: CashIntegritySnapshot): string[] {
  const issues: string[] = [];
  if (left.ledgerCount !== right.ledgerCount) {
    issues.push(`ledger count ${left.ledgerCount} ≠ ${right.ledgerCount}`);
  }
  if (left.ledgerIdempotencyKeys.join("|") !== right.ledgerIdempotencyKeys.join("|")) {
    issues.push("ledger idempotency_key kümesi sapması");
  }
  if (left.idempotencyCount !== right.idempotencyCount) {
    issues.push(`idempotency count ${left.idempotencyCount} ≠ ${right.idempotencyCount}`);
  }
  if (left.idempotencySlots.join("|") !== right.idempotencySlots.join("|")) {
    issues.push("http_idempotency (user_id, route, key) sapması");
  }
  if (left.anomalyCount !== right.anomalyCount) {
    issues.push(`anomaly count ${left.anomalyCount} ≠ ${right.anomalyCount}`);
  }
  if (left.anomalyRequestIds.join("|") !== right.anomalyRequestIds.join("|")) {
    issues.push("payment_anomalies.request_id sapması");
  }
  if (left.walletCount !== right.walletCount || left.walletSumMinor !== right.walletSumMinor) {
    issues.push("cüzdan sayısı veya amount_minor toplamı sapması");
  }
  return issues;
}

async function recreateRestoreDatabase(sourceUrl: string): Promise<string> {
  const restoreUrl = databaseUrlWithName(sourceUrl, LAB_RESTORE_DATABASE);
  const admin = new Client({ connectionString: withPgLibpqSslCompat(adminPostgresUrl(sourceUrl)) });
  await admin.connect();
  try {
    await admin.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [LAB_RESTORE_DATABASE],
    );
    await admin.query(`DROP DATABASE IF EXISTS ${LAB_RESTORE_DATABASE}`);
    await admin.query(`CREATE DATABASE ${LAB_RESTORE_DATABASE}`);
  } finally {
    await admin.end();
  }
  return restoreUrl;
}

export async function dropRestoreDatabase(sourceUrl: string): Promise<void> {
  const admin = new Client({ connectionString: withPgLibpqSslCompat(adminPostgresUrl(sourceUrl)) });
  await admin.connect();
  try {
    await admin.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [LAB_RESTORE_DATABASE],
    );
    await admin.query(`DROP DATABASE IF EXISTS ${LAB_RESTORE_DATABASE}`);
  } finally {
    await admin.end();
  }
}

export async function runLabBackupRestore(input: {
  sourceUrl: string;
  dumpDir: string;
  keepRestoreDb?: boolean;
}): Promise<BackupRestoreResult> {
  assertBackupSourceUrl(input.sourceUrl);
  mkdirSync(input.dumpDir, { recursive: true });
  const dumpPath = join(input.dumpDir, "rail-lab-restore-smoke.dump");
  const pgDump = resolvePgDumpBin();
  const pgRestore = resolvePgRestoreBin();

  const source = await readCashIntegritySnapshot(input.sourceUrl);
  const dumpStarted = Date.now();
  const dump = spawnSync(
    pgDump,
    ["--format=custom", "--no-owner", "--no-acl", `--dbname=${input.sourceUrl}`, `--file=${dumpPath}`],
    { encoding: "utf8", windowsHide: true },
  );
  if (dump.status !== 0) {
    failTool(pgDump, ["--format=custom"], dump);
  }
  const dumpMs = Date.now() - dumpStarted;
  if (!existsSync(dumpPath)) {
    throw new Error(`pg_dump dosya yazmadı: ${dumpPath}`);
  }

  const restoreUrl = await recreateRestoreDatabase(input.sourceUrl);
  const restoreStarted = Date.now();
  const restore = spawnSync(
    pgRestore,
    ["--no-owner", "--no-acl", `--dbname=${restoreUrl}`, dumpPath],
    { encoding: "utf8", windowsHide: true },
  );
  if (restore.status !== 0) {
    failTool(pgRestore, ["--no-owner"], restore);
  }
  const restoreMs = Date.now() - restoreStarted;
  const restored = await readCashIntegritySnapshot(restoreUrl);
  const drift = cashIntegrityEqual(source, restored);
  if (drift.length > 0) {
    throw new Error(`Restore sapması: ${drift.join("; ")}`);
  }
  if (!input.keepRestoreDb) {
    await dropRestoreDatabase(input.sourceUrl);
  }
  return { dumpPath, dumpMs, restoreMs, source, restored };
}
