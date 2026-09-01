import { describe, expect, it } from "vitest";
import {
  kernelBackgroundReadTimeoutMs,
  prismaPoolLimits,
  prismaWarmupBudgetMs,
  PRISMA_WARMUP_TIMEOUT_MS,
  PRISMA_WARMUP_TIMEOUT_MS_LONG_RUNNING,
} from "@/lib/kernel/db";
import {
  isRuntimePoolerUrl,
  isSupabaseDirectSessionUrl,
  normalizeRuntimeDatabaseUrl,
  parsePrismaEnginePoolParams,
  runtimeDatabaseHostKind,
  supabasePoolerUsernameOk,
  withPgLibpqSslCompat,
} from "@/lib/kernel/postgres-url";

const POOLER_TX =
  "postgresql://postgres.abcdefgh:x@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
const POOLER_SESSION =
  "postgresql://postgres.abcdefgh:x@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";
const DIRECT = "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres";

describe("runtime Postgres URI", () => {
  it("transaction ve session pooler'ı runtime havuz sayar; Direct :5432 saymaz", () => {
    expect(isRuntimePoolerUrl(POOLER_TX)).toBe(true);
    expect(isRuntimePoolerUrl(POOLER_SESSION)).toBe(true);
    expect(isRuntimePoolerUrl(DIRECT)).toBe(false);
    expect(isSupabaseDirectSessionUrl(DIRECT)).toBe(true);
    expect(isSupabaseDirectSessionUrl(POOLER_TX)).toBe(false);
  });

  it("havuz kullanıcısı postgres.<ref> ister; düz postgres kırılır", () => {
    expect(supabasePoolerUsernameOk(POOLER_TX)).toBe(true);
    expect(
      supabasePoolerUsernameOk(
        "postgresql://postgres:x@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
      ),
    ).toBe(false);
    expect(supabasePoolerUsernameOk(DIRECT)).toBe(true);
  });

  it("pgbouncer ve connection_limit'i soyar; uselibpqcompat ekler", () => {
    const raw = `${POOLER_TX}?pgbouncer=true&connection_limit=1&sslmode=require`;
    const normalized = normalizeRuntimeDatabaseUrl(raw);
    expect(normalized).not.toMatch(/pgbouncer=/i);
    expect(normalized).not.toMatch(/connection_limit=/i);
    expect(normalized).toContain("uselibpqcompat=true");
    expect(normalized).toContain("sslmode=require");
    expect(normalized).toContain(":6543");
    expect(normalizeRuntimeDatabaseUrl(POOLER_TX)).toContain("sslmode=require");
    expect(withPgLibpqSslCompat(normalized)).toBe(normalized);
  });

  it("Direct / pooler / loopback host sınıfı sır basmadan ayrılır", () => {
    expect(runtimeDatabaseHostKind(DIRECT)).toBe("direct");
    expect(runtimeDatabaseHostKind(POOLER_TX)).toBe("pooler");
    expect(runtimeDatabaseHostKind(POOLER_SESSION)).toBe("pooler");
    expect(runtimeDatabaseHostKind("postgresql://postgres:x@127.0.0.1:5432/yetkin_rail_lab")).toBe(
      "loopback",
    );
    expect(runtimeDatabaseHostKind("")).toBe("other");
  });

  it("connection_limit ve pool_timeout'u URL'den okur; soyma öncesi", () => {
    expect(
      parsePrismaEnginePoolParams(`${POOLER_TX}?connection_limit=20&pool_timeout=10`),
    ).toEqual({ connectionLimit: 20, poolTimeoutSeconds: 10 });
    expect(parsePrismaEnginePoolParams(POOLER_TX)).toEqual({
      connectionLimit: null,
      poolTimeoutSeconds: null,
    });
  });
});

describe("Prisma havuz tavanı", () => {
  it("Vercel izolatında max=1 ve kısa idle; uzun süreçte connection_limit=20 pool_timeout=10s", () => {
    expect(prismaPoolLimits({ VERCEL: "1", NODE_ENV: "production" }).max).toBe(1);
    expect(prismaPoolLimits({ VERCEL_ENV: "production", NODE_ENV: "production" }).max).toBe(1);
    expect(prismaPoolLimits({ NODE_ENV: "development" }).max).toBe(20);
    expect(prismaPoolLimits({ NODE_ENV: "development" }).connectionTimeoutMillis).toBe(10_000);
    expect(prismaPoolLimits({ NODE_ENV: "production" }).max).toBe(20);
    expect(prismaPoolLimits({ NODE_ENV: "production" }).connectionTimeoutMillis).toBe(10_000);
  });

  it("DATABASE_URL connection_limit=1 (Dashboard kopyası) uzun süreçte 20'ye yükselir", () => {
    const url = `${POOLER_TX}?connection_limit=1&pool_timeout=10`;
    expect(prismaPoolLimits({ NODE_ENV: "development", DATABASE_URL: url }).max).toBe(20);
    expect(
      prismaPoolLimits({ NODE_ENV: "development", DATABASE_URL: url }).connectionTimeoutMillis,
    ).toBe(10_000);
  });

  it("DATABASE_URL connection_limit=8 pool_timeout=5 uzun süreçte uygulanır", () => {
    const url = `${POOLER_TX}?connection_limit=8&pool_timeout=5`;
    expect(prismaPoolLimits({ NODE_ENV: "development", DATABASE_URL: url }).max).toBe(8);
    expect(
      prismaPoolLimits({ NODE_ENV: "development", DATABASE_URL: url }).connectionTimeoutMillis,
    ).toBe(5_000);
  });

  it("ısınma bütçesi pool_timeout'tan bağımsızdır; serverless 1.5s, uzun süreç 3s", () => {
    expect(prismaWarmupBudgetMs({ NODE_ENV: "development" })).toBe(
      PRISMA_WARMUP_TIMEOUT_MS_LONG_RUNNING,
    );
    expect(prismaWarmupBudgetMs({ NODE_ENV: "production" })).toBe(
      PRISMA_WARMUP_TIMEOUT_MS_LONG_RUNNING,
    );
    expect(prismaWarmupBudgetMs({ VERCEL: "1", NODE_ENV: "production" })).toBe(
      PRISMA_WARMUP_TIMEOUT_MS,
    );
    expect(PRISMA_WARMUP_TIMEOUT_MS_LONG_RUNNING).toBe(3_000);
    expect(PRISMA_WARMUP_TIMEOUT_MS).toBe(1_500);
  });

  it("arka plan okuma uzun süreçte 8s; serverless çağıranın fail-soft'u", () => {
    expect(kernelBackgroundReadTimeoutMs(400, { NODE_ENV: "development" })).toBe(8_000);
    expect(kernelBackgroundReadTimeoutMs(2_000, { NODE_ENV: "development" })).toBe(8_000);
    expect(kernelBackgroundReadTimeoutMs(2_000, { NODE_ENV: "production" })).toBe(8_000);
    expect(kernelBackgroundReadTimeoutMs(2_000, { VERCEL: "1", NODE_ENV: "production" })).toBe(2_000);
    expect(kernelBackgroundReadTimeoutMs(400, { VERCEL: "1", NODE_ENV: "production" })).toBe(400);
  });
});
