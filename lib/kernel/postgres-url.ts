/**
 * Postgres URI sınıfları — runtime havuz (Vercel) vs Direct migrasyon.
 * Sır basmaz. Credential icat etmez.
 */

export const DIRECT_POSTGRES_PORT = 5432;
export const TRANSACTION_POOLER_PORT = 6543;
export const SUPABASE_DIRECT_HOST_RE = /^db\.[a-z0-9]+\.supabase\.co$/i;
export const SUPABASE_POOLER_HOST_RE = /(?:^|\.)pooler\.supabase\.com$/i;

/** Prisma motor parametreleri; Node `pg` / Postgres bunları startup option sanır. */
const PRISMA_ENGINE_QUERY_PARAMS = [
  "pgbouncer",
  "connection_limit",
  "pool_timeout",
  "socket_timeout",
] as const;

/** Adapter yolunda URL'den okunur; pg Pool.max / connectionTimeoutMillis'e yazılır. */
export const PRISMA_URL_CONNECTION_LIMIT = 20;
export const PRISMA_URL_POOL_TIMEOUT_SECONDS = 10;

export type PrismaEnginePoolParams = {
  connectionLimit: number | null;
  poolTimeoutSeconds: number | null;
};

function parsePositiveInt(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

/**
 * `connection_limit` / `pool_timeout` Prisma Dashboard kopyasıdır; pg'ye gitmez.
 * Adapter `Pool.max` ve `connectionTimeoutMillis` bu değerleri uygular.
 */
export function parsePrismaEnginePoolParams(url: string): PrismaEnginePoolParams {
  const trimmed = url.trim();
  if (!trimmed) {
    return { connectionLimit: null, poolTimeoutSeconds: null };
  }
  try {
    const parsed = new URL(trimmed);
    return {
      connectionLimit: parsePositiveInt(parsed.searchParams.get("connection_limit")),
      poolTimeoutSeconds: parsePositiveInt(parsed.searchParams.get("pool_timeout")),
    };
  } catch {
    return { connectionLimit: null, poolTimeoutSeconds: null };
  }
}

export type ParsedPostgresUrl = {
  hostname: string;
  port: number;
  username: string;
};

export function withPgLibpqSslCompat(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/[?&]uselibpqcompat=/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed.includes("?") ? `${trimmed}&uselibpqcompat=true` : `${trimmed}?uselibpqcompat=true`;
}

export function parsePostgresUrl(url: string): ParsedPostgresUrl | null {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.trim();
    if (!hostname) {
      return null;
    }
    const port = parsed.port ? Number(parsed.port) : DIRECT_POSTGRES_PORT;
    if (!Number.isInteger(port) || port <= 0) {
      return null;
    }
    return {
      hostname,
      port,
      username: decodeURIComponent(parsed.username),
    };
  } catch {
    return null;
  }
}

export function isSupabaseDirectHostname(hostname: string): boolean {
  return SUPABASE_DIRECT_HOST_RE.test(hostname.trim());
}

export function isSupabasePoolerHostname(hostname: string): boolean {
  return SUPABASE_POOLER_HOST_RE.test(hostname.trim().toLowerCase());
}

export function isRuntimePoolerUrl(url: string): boolean {
  const shape = parsePostgresUrl(url);
  if (!shape) {
    return /pooler\.supabase\.com/i.test(url) || /:6543(?:[/?#]|$)/.test(url.trim());
  }
  return isSupabasePoolerHostname(shape.hostname) || shape.port === TRANSACTION_POOLER_PORT;
}

export function isSupabaseDirectSessionUrl(url: string): boolean {
  const shape = parsePostgresUrl(url);
  if (!shape) {
    return false;
  }
  return isSupabaseDirectHostname(shape.hostname) && shape.port === DIRECT_POSTGRES_PORT;
}

export type RuntimeDatabaseHostKind = "direct" | "pooler" | "loopback" | "other";

/**
 * Sır basmaz — yalnız host sınıfı. Direct runtime Windows'ta AAAA tuzağıdır;
 * pooler IPv4 A kaydı taşır. Credential / hostname tam metin yazılmaz.
 */
export function runtimeDatabaseHostKind(url: string): RuntimeDatabaseHostKind {
  const trimmed = url.trim();
  if (!trimmed) {
    return "other";
  }
  if (isSupabaseDirectSessionUrl(trimmed)) {
    return "direct";
  }
  if (isRuntimePoolerUrl(trimmed)) {
    return "pooler";
  }
  if (/(?:localhost|127\.0\.0\.1|\[::1\])/i.test(trimmed)) {
    return "loopback";
  }
  return "other";
}

/**
 * Supavisor tenant: `postgres.<project-ref>`. Düz `postgres` havuzda "Tenant or user not found".
 * Direct `postgres` kullanıcısı bu kontrolden muaftır.
 */
export function supabasePoolerUsernameOk(url: string): boolean {
  const shape = parsePostgresUrl(url);
  if (!shape) {
    return false;
  }
  if (!isRuntimePoolerUrl(url)) {
    return true;
  }
  return shape.username.includes(".");
}

/**
 * Prisma Dashboard kopyasındaki `pgbouncer=true` / `connection_limit` pg'ye gitmez.
 * `uselibpqcompat=true` sslmode=require semantiğini libpq ile hizalar.
 */
export function normalizeRuntimeDatabaseUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    for (const key of PRISMA_ENGINE_QUERY_PARAMS) {
      parsed.searchParams.delete(key);
    }
    const host = parsed.hostname.trim();
    if (
      (isSupabaseDirectHostname(host) || isSupabasePoolerHostname(host)) &&
      !parsed.searchParams.has("sslmode")
    ) {
      parsed.searchParams.set("sslmode", "require");
    }
    return withPgLibpqSslCompat(parsed.toString());
  } catch {
    return withPgLibpqSslCompat(trimmed);
  }
}
