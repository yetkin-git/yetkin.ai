import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { preferIpv6ForDirectHost } from "@/lib/kernel/dns-ipv6-first";
import { Pool } from "pg";

preferIpv6ForDirectHost();

type KernelDbGlobal = {
  prisma?: PrismaClient;
  pool?: Pool;
  engineReady?: Promise<void>;
  refreshing?: Promise<void>;
};

const g = globalThis as typeof globalThis & { __yetkinKernelDb?: KernelDbGlobal };

/** Geliştirme / test: hot-reload sızıntısını ve Supabase Direct tavanını boğmamak. */
export const PRISMA_POOL_MAX_DEVELOPMENT = 5;
export const PRISMA_POOL_TIMEOUT_MS_DEVELOPMENT = 1_500;
export const PRISMA_POOL_IDLE_MS_DEVELOPMENT = 10_000;

/** Üretim: birkaç Next işçisi × küçük havuz; 20'lik tavan Direct'i kilitler. */
export const PRISMA_POOL_MAX_PRODUCTION = 10;
export const PRISMA_POOL_TIMEOUT_MS_PRODUCTION = 5_000;
export const PRISMA_POOL_IDLE_MS_PRODUCTION = 30_000;

export const PRISMA_WARMUP_TIMEOUT_MS = 400;

function isDevelopmentNode(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function prismaPoolLimits(env: NodeJS.ProcessEnv = process.env): {
  max: number;
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
  allowExitOnIdle: boolean;
} {
  const development = env.NODE_ENV !== "production";
  return {
    max: development ? PRISMA_POOL_MAX_DEVELOPMENT : PRISMA_POOL_MAX_PRODUCTION,
    connectionTimeoutMillis: development
      ? PRISMA_POOL_TIMEOUT_MS_DEVELOPMENT
      : PRISMA_POOL_TIMEOUT_MS_PRODUCTION,
    idleTimeoutMillis: development
      ? PRISMA_POOL_IDLE_MS_DEVELOPMENT
      : PRISMA_POOL_IDLE_MS_PRODUCTION,
    allowExitOnIdle: development,
  };
}

/**
 * RSC / Route Handler / HMR aynı Node sürecinde tek Pool + tek PrismaClient paylaşır.
 * `globalThis` slotu production'da da durur (soğuk start yeniden bağlanmasın).
 */
function dbGlobal(): KernelDbGlobal {
  if (!g.__yetkinKernelDb) {
    g.__yetkinKernelDb = {};
  }
  return g.__yetkinKernelDb;
}

/** pg 8.22 `sslmode=require` → verify-full; Supabase Direct özel CA. Libpq require = şifrele. */
function withPgLibpqSslCompat(url: string): string {
  if (/[?&]uselibpqcompat=/i.test(url)) {
    return url;
  }
  return url.includes("?") ? `${url}&uselibpqcompat=true` : `${url}?uselibpqcompat=true`;
}

/**
 * Prisma kodu (P2024, P2010, PG SQLSTATE, …) günlük için güvenlidir; SQL metni yazılmaz.
 */
export function prismaErrorLabel(error: unknown): string {
  const name = error instanceof Error ? error.name : "unknown";
  const codes: string[] = [];
  const walk = (value: unknown, depth: number) => {
    if (depth > 4 || !value || typeof value !== "object") {
      return;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.code === "string" && record.code.length > 0 && record.code.length <= 24) {
      codes.push(record.code);
    }
    if (record.cause !== undefined) {
      walk(record.cause, depth + 1);
    }
    if (record.meta !== undefined) {
      walk(record.meta, depth + 1);
    }
  };
  walk(error, 0);
  if (error instanceof Error) {
    const message = error.message;
    if (/\bENOENT\b/.test(message) && !codes.includes("ENOENT")) {
      codes.push("ENOENT");
    }
    if (/\bP1001\b/.test(message) && !codes.includes("P1001")) {
      codes.push("P1001");
    }
    if (/\bP2024\b/.test(message) && !codes.includes("P2024")) {
      codes.push("P2024");
    }
    if (/^db_read_timeout:/.test(message) && !codes.includes("TIMEOUT")) {
      codes.push("TIMEOUT");
    } else if (/\btimeout\b/i.test(message) && !codes.includes("TIMEOUT")) {
      codes.push("TIMEOUT");
    }
  }
  const unique = [...new Set(codes)];
  return unique.length > 0 ? `${name}:${unique.join(",")}` : name;
}

function isPrismaEngineEnoent(error: unknown): boolean {
  return /\bENOENT\b/.test(prismaErrorLabel(error));
}

function isDbReadTimeout(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("db_read_timeout:");
}

/**
 * Okuma yarışı — Prisma sorgusu iptal edilmez; süre dolunca fail-soft çağıran yutar.
 * Kaybeden vaadin unhandled rejection'ı yutulur.
 */
export async function withDbReadTimeout<T>(
  work: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`db_read_timeout:${label}`)), timeoutMs);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
    void work.then(
      () => undefined,
      () => undefined,
    );
  }
}

/**
 * Bozuk havuz / soğuk WASM sonrası istemciyi düşürür. Sonraki getPrisma() taze Pool açar.
 * ENOENT (getaddrinfo veya derleyici dosya yolu) için warmup catch yolundan çağrılır.
 */
export async function refreshPrismaConnection(): Promise<void> {
  const slot = dbGlobal();
  if (slot.refreshing) {
    await slot.refreshing;
    return;
  }
  slot.refreshing = (async () => {
    const pool = slot.pool;
    const prisma = slot.prisma;
    slot.engineReady = undefined;
    slot.prisma = undefined;
    slot.pool = undefined;
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch {
        /* stale istemci — yut */
      }
    }
    if (pool) {
      try {
        await pool.end();
      } catch {
        /* stale havuz — yut */
      }
    }
  })();
  try {
    await slot.refreshing;
  } finally {
    slot.refreshing = undefined;
  }
}

export function getPrisma(): PrismaClient {
  preferIpv6ForDirectHost();
  const slot = dbGlobal();
  if (slot.prisma) {
    return slot.prisma;
  }
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  if (!slot.pool) {
    const limits = prismaPoolLimits();
    slot.pool = new Pool({
      connectionString: withPgLibpqSslCompat(url),
      // connection_limit — pg Pool.max; Prisma URL parametresi adapter yolunda yok.
      max: limits.max,
      // pool_timeout — bağlantı beklerken milisaniye.
      connectionTimeoutMillis: limits.connectionTimeoutMillis,
      idleTimeoutMillis: limits.idleTimeoutMillis,
      allowExitOnIdle: limits.allowExitOnIdle,
      keepAlive: true,
      ...(isDevelopmentNode() ? {} : { maxUses: 7_500 }),
    });
  }
  slot.prisma = new PrismaClient({ adapter: new PrismaPg(slot.pool) });
  g.__yetkinKernelDb = slot;
  return slot.prisma;
}

/**
 * Query compiler WASM tek uçuşta ısınır. Route Handler'da ilk işlem soğuk
 * istemcide parametreli $queryRaw / model sorgusu olursa PrismaClientKnownRequestError
 * fırlatır (Pxxxx çoğu zaman yok). Health'in SELECT 1'i bu adımı açar; sonra findFirst.
 * Çalışan odalar Promise.all bu vaatten sonra koşar. globalThis ile RSC/RH aynı istemciyi paylaşır.
 * ENOENT → havuz + istemci yenilenir; istek çökmez, oda fallback boş nabız basar.
 * TIMEOUT → in-flight ısınma durur; ikinci warmup açılmaz (sızıntı yok).
 */
export async function ensurePrismaQueryEngine(): Promise<void> {
  const client = getPrisma();
  const slot = dbGlobal();
  if (!slot.engineReady) {
    slot.engineReady = (async () => {
      await client.$queryRaw`SELECT 1`;
      await client.wallet.findFirst({ select: { id: true } });
    })();
  }
  try {
    await withDbReadTimeout(slot.engineReady, PRISMA_WARMUP_TIMEOUT_MS, "prisma.warmup");
  } catch (error) {
    const label = prismaErrorLabel(error);
    console.warn(
      JSON.stringify({
        event: "prisma.engine.warmup_failed",
        errorName: label,
      }),
    );
    if (isDbReadTimeout(error)) {
      return;
    }
    slot.engineReady = undefined;
    if (!isPrismaEngineEnoent(error)) {
      return;
    }
    await refreshPrismaConnection();
    try {
      const fresh = getPrisma();
      const retry = (async () => {
        await fresh.$queryRaw`SELECT 1`;
        await fresh.wallet.findFirst({ select: { id: true } });
      })();
      await withDbReadTimeout(retry, PRISMA_WARMUP_TIMEOUT_MS, "prisma.warmup.retry");
      slot.engineReady = Promise.resolve();
    } catch (retryError) {
      slot.engineReady = undefined;
      console.warn(
        JSON.stringify({
          event: "prisma.engine.warmup_failed",
          errorName: prismaErrorLabel(retryError),
          retry: true,
        }),
      );
    }
  }
}
