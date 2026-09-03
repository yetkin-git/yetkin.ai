import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import {
  isPrismaPoolBusyError,
  isPrismaTransientConnectionError,
} from "@/lib/kernel/db-errors";
import { preferIpv6ForDirectHost } from "@/lib/kernel/dns-ipv6-first";
import {
  isSupabaseDirectSessionUrl,
  normalizeRuntimeDatabaseUrl,
  parsePrismaEnginePoolParams,
  PRISMA_URL_CONNECTION_LIMIT,
  PRISMA_URL_POOL_TIMEOUT_SECONDS,
  runtimeDatabaseHostKind,
} from "@/lib/kernel/postgres-url";
import { Pool } from "pg";

preferIpv6ForDirectHost();

type KernelDbGlobal = {
  prisma?: PrismaClient;
  pool?: Pool;
  engineReady?: Promise<void>;
  engineOk?: boolean;
  circuitOpenUntil?: number;
  refreshing?: Promise<void>;
};

/**
 * HMR / RSC / Route Handler: tek PrismaClient.
 * `globalThis.prisma` klasik singleton; `__yetkinKernelDb` havuz + ısınma slotu.
 */
const g = globalThis as typeof globalThis & {
  __yetkinKernelDb?: KernelDbGlobal;
  prisma?: PrismaClient;
};

/**
 * Uzun süreç (next dev / Node): `connection_limit=10&pool_timeout=10`.
 * Adapter URL'den okur; pg'ye `connection_limit` gitmez (Pool.max).
 * Prisma Dashboard `connection_limit=1` kopyası uzun süreçte yok sayılır.
 */
export const PRISMA_POOL_MAX_DEVELOPMENT = PRISMA_URL_CONNECTION_LIMIT;
export const PRISMA_POOL_TIMEOUT_MS_DEVELOPMENT = PRISMA_URL_POOL_TIMEOUT_SECONDS * 1_000;
export const PRISMA_POOL_IDLE_MS_DEVELOPMENT = 10_000;

/** Üretim (uzun süreç): aynı tavan; birkaç işçi × 20 Direct kotasını zorlar — serverless ayrı. */
export const PRISMA_POOL_MAX_PRODUCTION = PRISMA_URL_CONNECTION_LIMIT;
export const PRISMA_POOL_TIMEOUT_MS_PRODUCTION = PRISMA_URL_POOL_TIMEOUT_SECONDS * 1_000;
export const PRISMA_POOL_IDLE_MS_PRODUCTION = 30_000;

/**
 * Vercel/serverless: her izolat PgBouncer'a 1 TCP. Büyük `max` Direct tavanını ve
 * donmuş lambdada çürük soketi çoğaltır. connection_limit URL'de yok; Pool.max.
 */
export const PRISMA_POOL_MAX_SERVERLESS = 1;
export const PRISMA_POOL_TIMEOUT_MS_SERVERLESS = 5_000;
export const PRISMA_POOL_IDLE_MS_SERVERLESS = 4_000;
export const PRISMA_POOL_MAX_LIFETIME_SECONDS_SERVERLESS = 60;
export const PRISMA_POOL_MAX_USES_SERVERLESS = 500;

/**
 * Serverless ısınma. 400ms WASM+TLS soğuk izolatı false-circuit açardı.
 * Hobby 10s: 1.5s ısınma + 4×2s oda ≈ 9.5s.
 */
export const PRISMA_WARMUP_TIMEOUT_MS = 1_500;

/**
 * Uzun süreç ısınma. Havuz `pool_timeout` (10s) ile kilitlenmez.
 * TR→EU soğuk TLS 3s'yi aşınca false-circuit ve warmup_pending spam doğurur.
 */
export const PRISMA_WARMUP_TIMEOUT_MS_LONG_RUNNING = 8_000;

/**
 * Isınma kaçırınca yeni SELECT 1 açılmaz. In-flight bağlanırsa `engineOk` yeşile döner.
 */
export const PRISMA_WARMUP_CIRCUIT_MS = 15_000;

/**
 * Uzun süreç (`next dev` / Node): uzak Supabase RTT 400ms fail-soft'u yer.
 * Serverless nabız ayrı sabittir (`DASHBOARD_PULSE_ROOM_TIMEOUT_MS`).
 */
export const KERNEL_BACKGROUND_READ_TIMEOUT_MS_LONG_RUNNING = 8_000;

/**
 * Isınma bütçesi `pool_timeout`'tan bağımsızdır.
 * 8s ısınma + 8s oda = 26s+ sayfa kilidi; kaçırınca 8s fail-fast + circuit.
 */
export function prismaWarmupBudgetMs(env: NodeJS.ProcessEnv = process.env): number {
  if (isServerlessRuntime(env)) {
    return PRISMA_WARMUP_TIMEOUT_MS;
  }
  return PRISMA_WARMUP_TIMEOUT_MS_LONG_RUNNING;
}

export function isPrismaQueryEngineReady(): boolean {
  return dbGlobal().engineOk === true;
}

export function isPrismaWarmupCircuitOpen(nowMs: number = Date.now()): boolean {
  const slot = dbGlobal();
  if (slot.engineOk) {
    return false;
  }
  return slot.circuitOpenUntil != null && nowMs < slot.circuitOpenUntil;
}

function openPrismaWarmupCircuit(slot: KernelDbGlobal, nowMs: number = Date.now()): void {
  slot.engineOk = false;
  slot.circuitOpenUntil = nowMs + PRISMA_WARMUP_CIRCUIT_MS;
}

let warnedDirectRuntimeHost = false;

function warnDirectRuntimeDatabaseUrl(url: string): void {
  if (warnedDirectRuntimeHost || isServerlessRuntime() || !isSupabaseDirectSessionUrl(url)) {
    return;
  }
  warnedDirectRuntimeHost = true;
  console.warn(
    JSON.stringify({
      event: "prisma.engine.runtime_direct_host",
      hostKind: "direct",
      reason: "DATABASE_URL Direct db.<ref> — Windows IPv6/DNS asılması. Runtime pooler :6543.",
    }),
  );
}

function runtimeHostKindForLog(): string {
  return runtimeDatabaseHostKind(process.env.DATABASE_URL ?? "");
}

/**
 * Arka plan SELECT (nabız, cüzdan şeridi, kimlik).
 * Serverless: çağıranın fail-soft'u. Uzun süreç: TR→EU RTT + 2–3 round-trip sığar.
 */
export function kernelBackgroundReadTimeoutMs(
  serverlessMs: number,
  env: NodeJS.ProcessEnv = process.env,
): number {
  if (isServerlessRuntime(env)) {
    return serverlessMs;
  }
  const customMs = env.KERNEL_BACKGROUND_READ_TIMEOUT_MS
    ? Number(env.KERNEL_BACKGROUND_READ_TIMEOUT_MS)
    : env.DB_READ_TIMEOUT_MS
      ? Number(env.DB_READ_TIMEOUT_MS)
      : null;
  if (customMs && Number.isFinite(customMs) && customMs > 0) {
    return Math.max(serverlessMs, customMs);
  }
  return Math.max(serverlessMs, KERNEL_BACKGROUND_READ_TIMEOUT_MS_LONG_RUNNING);
}

export function isServerlessRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL === "1" || Boolean(env.VERCEL_ENV?.trim());
}

function resolveLongRunningPoolMax(
  url: string,
  fallback: number,
  env: NodeJS.ProcessEnv = process.env,
): number {
  const envMax = env.PRISMA_POOL_MAX ? Number(env.PRISMA_POOL_MAX) : null;
  if (envMax && Number.isInteger(envMax) && envMax > 0) {
    return Math.min(envMax, 30);
  }
  const parsed = parsePrismaEnginePoolParams(url);
  if (parsed.connectionLimit == null || parsed.connectionLimit <= 1) {
    return fallback;
  }
  return Math.min(parsed.connectionLimit, PRISMA_URL_CONNECTION_LIMIT);
}

function resolvePoolTimeoutMs(
  url: string,
  fallbackMs: number,
  env: NodeJS.ProcessEnv = process.env,
): number {
  const envTimeout = env.PRISMA_POOL_TIMEOUT_MS ? Number(env.PRISMA_POOL_TIMEOUT_MS) : null;
  if (envTimeout && Number.isFinite(envTimeout) && envTimeout > 0) {
    return envTimeout;
  }
  const parsed = parsePrismaEnginePoolParams(url);
  if (parsed.poolTimeoutSeconds == null) {
    return fallbackMs;
  }
  const fromUrl = Math.min(Math.max(parsed.poolTimeoutSeconds, 1), 30) * 1_000;
  // Dashboard `pool_timeout=5` TR→EU TLS'i ısınma bütçesinden önce keser; taban fallback.
  return Math.max(fromUrl, fallbackMs);
}

export function prismaPoolLimits(env: NodeJS.ProcessEnv = process.env): {
  max: number;
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
  allowExitOnIdle: boolean;
  maxLifetimeSeconds?: number;
  maxUses?: number;
} {
  if (isServerlessRuntime(env)) {
    return {
      max: PRISMA_POOL_MAX_SERVERLESS,
      connectionTimeoutMillis: PRISMA_POOL_TIMEOUT_MS_SERVERLESS,
      idleTimeoutMillis: PRISMA_POOL_IDLE_MS_SERVERLESS,
      allowExitOnIdle: true,
      maxLifetimeSeconds: PRISMA_POOL_MAX_LIFETIME_SECONDS_SERVERLESS,
      maxUses: PRISMA_POOL_MAX_USES_SERVERLESS,
    };
  }
  const development = env.NODE_ENV !== "production";
  const url = env.DATABASE_URL ?? "";
  const fallbackMax = development ? PRISMA_POOL_MAX_DEVELOPMENT : PRISMA_POOL_MAX_PRODUCTION;
  const fallbackTimeoutMs = development
    ? PRISMA_POOL_TIMEOUT_MS_DEVELOPMENT
    : PRISMA_POOL_TIMEOUT_MS_PRODUCTION;
  return {
    max: resolveLongRunningPoolMax(url, fallbackMax, env),
    connectionTimeoutMillis: resolvePoolTimeoutMs(url, fallbackTimeoutMs, env),
    idleTimeoutMillis: development
      ? PRISMA_POOL_IDLE_MS_DEVELOPMENT
      : PRISMA_POOL_IDLE_MS_PRODUCTION,
    allowExitOnIdle: development,
    ...(development ? {} : { maxUses: 7_500 }),
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
  const slot = g.__yetkinKernelDb;
  if (!slot.prisma && g.prisma) {
    slot.prisma = g.prisma;
  }
  return slot;
}

function bindPrismaSingleton(client: PrismaClient): PrismaClient {
  const slot = dbGlobal();
  slot.prisma = client;
  g.prisma = client;
  g.__yetkinKernelDb = slot;
  return client;
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
    if (/^db_read_timeout:/.test(message)) {
      if (!codes.includes("TIMEOUT")) {
        codes.push("TIMEOUT");
      }
      if (/:pool_busy\b/.test(message) && !codes.includes("POOL_BUSY")) {
        codes.push("POOL_BUSY");
      }
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

function isStalePrismaPoolError(error: unknown): boolean {
  if (isPrismaEngineEnoent(error)) {
    return true;
  }
  return isPrismaTransientConnectionError(error);
}

export { isPrismaPoolBusyError, isPrismaTransientConnectionError };

type PgPoolStats = {
  totalCount?: number;
  idleCount?: number;
  waitingCount?: number;
  options?: { max?: number };
};

/**
 * Pulse / arka plan okuması kuyruğa girmeden çıkar.
 * Yazma (ilan POST) zaten kuyruktayken nabız ek istek açmaz.
 * Serverless `max=1`: tek meşgul soket kuyruk değildir — aksi halde nabız hiç SELECT açamaz.
 */
export function isKernelDbPoolBusy(env: NodeJS.ProcessEnv = process.env): boolean {
  if (isPrismaWarmupCircuitOpen()) {
    return true;
  }
  const pool = dbGlobal().pool as PgPoolStats | undefined;
  if (!pool) {
    return false;
  }
  const max = pool.options?.max ?? 0;
  const waiting = pool.waitingCount ?? 0;
  const idle = pool.idleCount ?? 0;
  const total = pool.totalCount ?? 0;

  // Boşta soket varsa havuz meşgul değildir (pg-pool connect() sırasında idle olsa bile pendingItem tutabilir)
  if (idle > 0) {
    return false;
  }

  // Havuz henüz maksimum bağlantı tavanına ulaşmadıysa yeni TCP açabilir; meşgul değildir
  if (max > 0 && total < max) {
    return false;
  }

  // Geliştirme ortamında (localhost dev) tek geliştirici çalışırken geçici bağlantı yarışında nabız düşürülmez
  if (!isServerlessRuntime(env) && env.NODE_ENV === "development") {
    // Sadece havuz tavanı dolmuş ve belirgin bir kuyruk birikmişse fail-early devreye girer
    return max > 1 && total >= max && waiting >= 3;
  }

  if (waiting > 0) {
    return true;
  }
  return max > 1 && idle === 0 && total >= max;
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
 * Arka plan nabız: havuz doluysa sorgu açılmaz (fail-early).
 * Doluysa `db_read_timeout:` — Pulse boş dilim basar, yazma kuyruğu bozulmaz.
 * `work` fabrika: busy iken Promise yaratılmaz (bağlantı kaçmaz).
 */
export async function withFailEarlyDbRead<T>(
  work: () => Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  if (isKernelDbPoolBusy()) {
    throw new Error(`db_read_timeout:${label}:pool_busy`);
  }
  return withDbReadTimeout(work(), timeoutMs, label);
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
    slot.engineOk = false;
    slot.circuitOpenUntil = undefined;
    slot.prisma = undefined;
    slot.pool = undefined;
    g.prisma = undefined;
    if (prisma) {
      try {
        // Yalnız kopuk havuz yenilemesi. İstek/RSC sonunda $disconnect YASAK.
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

export const PRISMA_TRANSIENT_RETRY_ATTEMPTS = 1;

function isPrismaWarmupRecoverableError(error: unknown): boolean {
  if (isPrismaEngineEnoent(error) || isStalePrismaPoolError(error) || isPrismaPoolBusyError(error)) {
    return true;
  }
  return /\bTIMEOUT\b/.test(prismaErrorLabel(error));
}

/**
 * Kopuk soket için bir kez taze havuz. P2024 (havuz dolu) yeniden denenmez.
 */
export async function withPrismaTransientRetry<T>(work: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= PRISMA_TRANSIENT_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
      if (!isPrismaTransientConnectionError(error) || attempt === PRISMA_TRANSIENT_RETRY_ATTEMPTS) {
        throw error;
      }
      await refreshPrismaConnection();
    }
  }
  throw lastError;
}

function kickPrismaEngineWarmup(client: PrismaClient, slot: KernelDbGlobal): void {
  if (slot.engineOk || slot.engineReady || isPrismaWarmupCircuitOpen()) {
    return;
  }
  trackPrismaEngineWarmup(client, slot);
}

export function getPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim();
  preferIpv6ForDirectHost(url);
  if (url) {
    warnDirectRuntimeDatabaseUrl(url);
  }
  const slot = dbGlobal();
  if (slot.prisma) {
    bindPrismaSingleton(slot.prisma);
    kickPrismaEngineWarmup(slot.prisma, slot);
    return slot.prisma;
  }
  if (!url) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  if (!slot.pool) {
    const limits = prismaPoolLimits();
    slot.pool = new Pool({
      connectionString: normalizeRuntimeDatabaseUrl(url),
      // connection_limit — pg Pool.max; Prisma URL parametresi adapter yolunda yok.
      max: limits.max,
      // pool_timeout — bağlantı beklerken milisaniye.
      connectionTimeoutMillis: limits.connectionTimeoutMillis,
      idleTimeoutMillis: limits.idleTimeoutMillis,
      allowExitOnIdle: limits.allowExitOnIdle,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      ...(limits.maxUses !== undefined ? { maxUses: limits.maxUses } : {}),
      ...(limits.maxLifetimeSeconds !== undefined
        ? { maxLifetimeSeconds: limits.maxLifetimeSeconds }
        : {}),
    });
    slot.pool.on("error", (error) => {
      queueMicrotask(() => {
        console.warn(
          JSON.stringify({
            event: "prisma.pool.error",
            errorName: prismaErrorLabel(error),
          }),
        );
      });
    });
  }
  const client = new PrismaClient({
    adapter: new PrismaPg(slot.pool, {
      onPoolError: (error) => {
        queueMicrotask(() => {
          console.warn(
            JSON.stringify({
              event: "prisma.pool.error",
              errorName: prismaErrorLabel(error),
            }),
          );
        });
      },
      onConnectionError: (error) => {
        queueMicrotask(() => {
          console.warn(
            JSON.stringify({
              event: "prisma.pool.connection_error",
              errorName: prismaErrorLabel(error),
            }),
          );
        });
      },
    }),
  });
  bindPrismaSingleton(client);
  kickPrismaEngineWarmup(client, slot);
  return client;
}

function startPrismaEngineWarmup(client: PrismaClient): Promise<void> {
  return (async () => {
    await client.$queryRaw`SELECT 1`;
    // Model derleyicisi ısınması yanıt yolunu kilitlemez.
    void client.wallet.findFirst({ select: { id: true } }).then(
      () => undefined,
      () => undefined,
    );
  })();
}

let prismaWarmupPendingLogged = false;

function trackPrismaEngineWarmup(client: PrismaClient, slot: KernelDbGlobal): Promise<void> {
  const tracked: Promise<void> = startPrismaEngineWarmup(client).then(
    () => {
      slot.engineOk = true;
      slot.circuitOpenUntil = undefined;
      prismaWarmupPendingLogged = false;
    },
    (error: unknown) => {
      slot.engineOk = false;
      if (slot.engineReady === tracked) {
        slot.engineReady = undefined;
      }
      throw error;
    },
  );
  slot.engineReady = tracked;
  void tracked.then(
    () => undefined,
    () => undefined,
  );
  return tracked;
}

/**
 * Query compiler WASM tek uçuşta ısınır. Route Handler'da ilk işlem soğuk
 * istemcide parametreli $queryRaw / model sorgusu olursa PrismaClientKnownRequestError
 * fırlatır (Pxxxx çoğu zaman yok). Health'in SELECT 1'i bu adımı açar; sonra findFirst.
 * globalThis ile RSC/RH aynı istemciyi paylaşır.
 * `true` = motor hazır, odalar SELECT açabilir. `false` = fail-soft; çağıran boş dilim basar.
 * TIMEOUT → in-flight sürer (bağlanırsa yeşile döner); circuit 15s ikinci SELECT 1 yok.
 * warmup_failed (kopuk soket / havuz TIMEOUT) → bir kez taze havuz; ikinci SELECT 1.
 * ENOENT → havuz yenilenir; kurtarma kaçırırsa circuit.
 */
export async function ensurePrismaQueryEngine(recover = true): Promise<boolean> {
  const slot = dbGlobal();
  if (slot.engineOk) {
    return true;
  }
  if (isPrismaWarmupCircuitOpen()) {
    return false;
  }

  let client: PrismaClient;
  try {
    client = getPrisma();
  } catch {
    return false;
  }

  if (!slot.engineReady) {
    trackPrismaEngineWarmup(client, slot);
  }
  const flight = slot.engineReady;
  if (!flight) {
    return false;
  }

  const budgetMs = prismaWarmupBudgetMs();
  try {
    await withDbReadTimeout(flight, budgetMs, "prisma.warmup");
    // Uçuş çözüldüyse `trackPrismaEngineWarmup` then `engineOk=true` yazdı.
    // TS, erken `if (slot.engineOk)` daraltmasını uçuş sonrasına taşımaz.
    return true;
  } catch (error) {
    const label = prismaErrorLabel(error);
    const hostKind = runtimeHostKindForLog();
    if (isDbReadTimeout(error)) {
      if (!prismaWarmupPendingLogged) {
        prismaWarmupPendingLogged = true;
        queueMicrotask(() => {
          console.warn(
            JSON.stringify({
              event: "prisma.engine.warmup_pending",
              errorName: label,
              hostKind,
              budgetMs,
              circuitMs: PRISMA_WARMUP_CIRCUIT_MS,
            }),
          );
        });
      }
      openPrismaWarmupCircuit(slot);
      return false;
    }
    queueMicrotask(() => {
      console.warn(
        JSON.stringify({
          event: "prisma.engine.warmup_failed",
          errorName: label,
          hostKind,
        }),
      );
    });
    slot.engineReady = undefined;
    const recoverable = recover && isPrismaWarmupRecoverableError(error);
    if (recoverable) {
      queueMicrotask(() => {
        console.warn(
          JSON.stringify({
            event: "prisma.engine.warmup_recover",
            errorName: label,
            hostKind,
          }),
        );
      });
      await refreshPrismaConnection().catch(() => undefined);
      return ensurePrismaQueryEngine(false);
    }
    openPrismaWarmupCircuit(slot);
    if (isPrismaEngineEnoent(error) || isStalePrismaPoolError(error)) {
      void refreshPrismaConnection().catch(() => undefined);
    }
    return false;
  }
}
