import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

type KernelDbGlobal = {
  prisma?: PrismaClient;
  pool?: Pool;
  engineReady?: Promise<void>;
};

const g = globalThis as typeof globalThis & { __yetkinKernelDb?: KernelDbGlobal };

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
  const unique = [...new Set(codes)];
  return unique.length > 0 ? `${name}:${unique.join(",")}` : name;
}

export function getPrisma(): PrismaClient {
  const slot = dbGlobal();
  if (slot.prisma) {
    return slot.prisma;
  }
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  if (!slot.pool) {
    slot.pool = new Pool({
      connectionString: withPgLibpqSslCompat(url),
      max: 20,
      connectionTimeoutMillis: 10_000,
    });
  }
  slot.prisma = new PrismaClient({ adapter: new PrismaPg(slot.pool) });
  return slot.prisma;
}

/**
 * Query compiler WASM tek uçuşta ısınır. Route Handler'da ilk işlem soğuk
 * istemcide parametreli $queryRaw / model sorgusu olursa PrismaClientKnownRequestError
 * fırlatır (Pxxxx çoğu zaman yok). Health'in SELECT 1'i bu adımı açar; sonra findFirst.
 * 12 oda Promise.all bu vaatten sonra koşar. globalThis ile RSC/RH aynı istemciyi paylaşır.
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
    await slot.engineReady;
  } catch (error) {
    slot.engineReady = undefined;
    console.warn(
      JSON.stringify({
        event: "prisma.engine.warmup_failed",
        errorName: prismaErrorLabel(error),
      }),
    );
  }
}
