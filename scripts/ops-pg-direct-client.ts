/**
 * Windows Node getaddrinfo IPv6-only Supabase Direct host'ta ENOENT basar.
 * `lookup` düşer; `resolve6` AAAA döner. TLS SNI orijinal host'ta kalır.
 *
 * `URL.hostname = ipv6` ataması kolon yüzünden yok sayılır; connectionString
 * eski DNS adını taşır. Bu yüzden Direct host'ta URI host kullanılmaz.
 *
 * DML (DELETE) Windows'ta Direct AAAA `ENETUNREACH` olursa runtime pooler
 * IPv4'e düşer. DDL / `ops:migrate` hâlâ Direct-only.
 */

import { promises as dnsPromises } from "node:dns";
import { Client } from "pg";
import { normalizeRuntimeDatabaseUrl } from "@/lib/kernel/postgres-url";
import {
  isForbiddenPoolerUrl,
  isIpv6OrDnsUnreachable,
  resolveMigratorConnectionUrl,
  SUPABASE_DIRECT_HOST_RE,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

export type OpsDmlPgSession = {
  client: Client;
  via: "direct" | "pooler";
};

function isIpv6Unreachable(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }
  const code = String((error as { code?: unknown }).code);
  return code === "ENETUNREACH" || code === "EHOSTUNREACH";
}

async function resolveDirectAddresses(hostname: string): Promise<string[]> {
  const ordered: string[] = [];
  const push = async (family: 4 | 6): Promise<void> => {
    try {
      const rows = family === 6
        ? await dnsPromises.resolve6(hostname)
        : await dnsPromises.resolve4(hostname);
      for (const ip of rows) {
        if (!ordered.includes(ip)) {
          ordered.push(ip);
        }
      }
    } catch {
      // AAAA yoksa A, A yoksa AAAA denenir. İkisi de yoksa çağıran ENOTFOUND görür.
    }
  };
  await push(6);
  await push(4);
  return ordered;
}

function directClient(url: string, host: string): Client {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const database = decodeURIComponent(
    parsed.pathname.replace(/^\//u, "").split("/")[0] || "postgres",
  );
  return new Client({
    host,
    port: Number(parsed.port || "5432"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    connectionTimeoutMillis: 8_000,
    // uselibpqcompat / libpq sslmode=require: şifrele, özel CA doğrulama.
    ssl: { rejectUnauthorized: false, servername: hostname },
  });
}

/**
 * Doğrudan oturum. AAAA önce, olmazsa A (IPv4 add-on).
 * Bağlı istemci döner. Havuz host'u bu fonksiyonun işi değildir.
 */
export async function openDirectPgClient(url: string): Promise<Client> {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  if (!SUPABASE_DIRECT_HOST_RE.test(hostname)) {
    const client = new Client({ connectionString: withPgLibpqSslCompat(url) });
    await client.connect();
    return client;
  }

  const addresses = await resolveDirectAddresses(hostname);
  if (addresses.length === 0) {
    throw Object.assign(new Error(`Direct host adresi çözülemedi: ${hostname}`), {
      code: "ENOTFOUND",
    });
  }

  let lastError: unknown;
  for (const ip of addresses) {
    const client = directClient(url, ip);
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => undefined);
    }
  }
  if (lastError instanceof Error) {
    throw lastError;
  }
  throw Object.assign(new Error(`Direct bağlantı düştü: ${hostname}`), { code: "ENETUNREACH" });
}

export async function createDirectPgClient(url: string): Promise<Client> {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  if (!SUPABASE_DIRECT_HOST_RE.test(hostname)) {
    return new Client({ connectionString: withPgLibpqSslCompat(url) });
  }
  const addresses = await resolveDirectAddresses(hostname);
  const ip = addresses[0];
  if (!ip) {
    throw Object.assign(new Error(`Direct host adresi çözülemedi: ${hostname}`), {
      code: "ENOTFOUND",
    });
  }
  return directClient(url, ip);
}

export async function connectOpsDmlClient(): Promise<OpsDmlPgSession> {
  const env = {
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  };
  const migrator = resolveMigratorConnectionUrl(env);
  if (!migrator) {
    throw new Error("DIRECT_URL veya DATABASE_URL yok. .system_docs/OPS_RUNBOOK.md");
  }

  if (!isForbiddenPoolerUrl(migrator)) {
    try {
      const client = await openDirectPgClient(migrator);
      return { client, via: "direct" };
    } catch (error) {
      if (!isIpv6Unreachable(error) && !isIpv6OrDnsUnreachable(error)) {
        throw error;
      }
    }
  }

  const runtime = env.DATABASE_URL?.trim();
  if (!runtime) {
    throw new Error("Direct IPv6 ulaşılamadı ve DATABASE_URL yok.");
  }
  const client = new Client({ connectionString: normalizeRuntimeDatabaseUrl(runtime) });
  await client.connect();
  return { client, via: "pooler" };
}
