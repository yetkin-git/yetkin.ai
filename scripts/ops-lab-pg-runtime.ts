/**
 * Docker yoksa: PostgreSQL 16 ikilisi .tmp altında, loopback :5432.
 * Hosted Auth değildir. Veri dizini gitignore (.tmp/).
 * Linux/CI: :5432 kapalıysa ikili indirme yok — compose beklenir.
 */
import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { appendFileSync } from "node:fs";
import { get } from "node:https";
import net from "node:net";
import { dirname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { Client } from "pg";
import {
  DIRECT_POSTGRES_PORT,
  LAB_POSTGRES_DATABASE,
  LAB_POSTGRES_DEFAULT_URL,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

const ROOT = process.cwd();
const PG_VERSION = "16.10.0";
const ARCHIVE_NAME = `postgresql-${PG_VERSION}-x86_64-pc-windows-msvc.tar.gz`;
const ARCHIVE_URL = `https://github.com/theseus-rs/postgresql-binaries/releases/download/${PG_VERSION}/${ARCHIVE_NAME}`;
const RUNTIME_ROOT = resolve(ROOT, ".tmp", "pg-lab");
const ARCHIVE_PATH = join(RUNTIME_ROOT, ARCHIVE_NAME);
const EXTRACT_DIR = join(RUNTIME_ROOT, "pgsql");
const DATA_DIR = join(RUNTIME_ROOT, "data");
const LOG_PATH = join(RUNTIME_ROOT, "postgres.log");
const PW_FILE = join(RUNTIME_ROOT, "pwfile");

function findNamedFile(dir: string, name: string): string | null {
  if (!existsSync(dir)) {
    return null;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      const nested = findNamedFile(full, name);
      if (nested) {
        return nested;
      }
    } else if (entry.toLowerCase() === name.toLowerCase()) {
      return full;
    }
  }
  return null;
}

function findPostgresBin(): string | null {
  const ctl = findNamedFile(EXTRACT_DIR, "pg_ctl.exe") ?? findNamedFile(RUNTIME_ROOT, "pg_ctl.exe");
  return ctl ? dirname(ctl) : null;
}

/** Lab ikili dizini (pg_dump / pg_restore). Yoksa null — PATH beklenir. */
export function resolveLabPostgresBinDir(): string | null {
  return findPostgresBin();
}

export function probeLoopbackPostgres(timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolveProbe) => {
    const socket = net.connect({ host: "127.0.0.1", port: DIRECT_POSTGRES_PORT });
    const timer = setTimeout(() => {
      socket.destroy();
      resolveProbe(false);
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolveProbe(true);
    });
    socket.once("error", () => {
      clearTimeout(timer);
      socket.destroy();
      resolveProbe(false);
    });
  });
}

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolveDownload, rejectDownload) => {
    const request = get(url, { headers: { "User-Agent": "yetkin-rail-pg-lab" } }, (response) => {
      const status = response.statusCode ?? 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location, dest).then(resolveDownload, rejectDownload);
        return;
      }
      if (status !== 200) {
        rejectDownload(new Error(`Postgres ikilisi indirilemedi HTTP ${status}`));
        response.resume();
        return;
      }
      const file = createWriteStream(dest);
      pipeline(response, file).then(resolveDownload, rejectDownload);
    });
    request.on("error", rejectDownload);
  });
}

async function ensureArchive(): Promise<void> {
  mkdirSync(RUNTIME_ROOT, { recursive: true });
  if (findPostgresBin()) {
    return;
  }
  if (!existsSync(ARCHIVE_PATH)) {
    console.log(`   Postgres ${PG_VERSION} ikilisi indiriliyor (Docker yok; gerçek motor).`);
    await download(ARCHIVE_URL, ARCHIVE_PATH);
  }
  mkdirSync(EXTRACT_DIR, { recursive: true });
  const unpacked = spawnSync("tar", ["-xf", ARCHIVE_PATH, "-C", EXTRACT_DIR], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (unpacked.status !== 0) {
    throw new Error("Postgres arşivi açılamadı (tar).");
  }
  if (!findPostgresBin()) {
    throw new Error("pg_ctl.exe arşivde yok.");
  }
}

function runBin(binDir: string, exe: string, args: string[]): void {
  const result = spawnSync(join(binDir, exe), args, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, PGUSER: "postgres" },
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`${exe} çıktı ${result.status ?? "null"}`);
  }
}

async function ensureDatabase(): Promise<void> {
  const adminUrl = "postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable";
  const client = new Client({ connectionString: withPgLibpqSslCompat(adminUrl) });
  await client.connect();
  try {
    const found = await client.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists`,
      [LAB_POSTGRES_DATABASE],
    );
    if (!found.rows[0]?.exists) {
      await client.query(`CREATE DATABASE ${LAB_POSTGRES_DATABASE}`);
      console.log(`   CREATE DATABASE ${LAB_POSTGRES_DATABASE}`);
    }
  } finally {
    await client.end();
  }
}

export async function ensureLabPostgresRuntime(): Promise<string> {
  if (await probeLoopbackPostgres()) {
    console.log("   loopback :5432 zaten açık.");
    await ensureDatabase();
    return LAB_POSTGRES_DEFAULT_URL;
  }
  if (process.platform !== "win32") {
    throw new Error("Lab :5432 kapalı. docker compose -f docker-compose.postgres.yml up -d");
  }
  await ensureArchive();
  const binDir = findPostgresBin();
  if (!binDir) {
    throw new Error("pg_ctl.exe yok.");
  }
  if (!existsSync(join(DATA_DIR, "PG_VERSION"))) {
    writeFileSync(PW_FILE, "postgres\n", { encoding: "utf8" });
    mkdirSync(DATA_DIR, { recursive: true });
    runBin(binDir, "initdb.exe", [
      "-D",
      DATA_DIR,
      "-U",
      "postgres",
      "-A",
      "password",
      `--pwfile=${PW_FILE}`,
      "-E",
      "UTF8",
      "--no-locale",
    ]);
    appendFileSync(
      join(DATA_DIR, "postgresql.conf"),
      "\nlisten_addresses = '127.0.0.1'\nport = 5432\n",
      "utf8",
    );
  }
  const started = spawnSync(join(binDir, "pg_ctl.exe"), ["-D", DATA_DIR, "-l", LOG_PATH, "start"], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, PGUSER: "postgres" },
    windowsHide: true,
  });
  if (started.status !== 0 && !(await probeLoopbackPostgres())) {
    throw new Error(`pg_ctl start çıktı ${started.status ?? "null"}. ${LOG_PATH}`);
  }
  for (let i = 0; i < 30; i += 1) {
    if (await probeLoopbackPostgres()) {
      await ensureDatabase();
      console.log("   lab Postgres ikilisi :5432 dinliyor (Docker değil; PostgreSQL 16 motoru).");
      return LAB_POSTGRES_DEFAULT_URL;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 300));
  }
  throw new Error(`pg_ctl start sonrası :5432 açılmadı. ${LOG_PATH}`);
}
