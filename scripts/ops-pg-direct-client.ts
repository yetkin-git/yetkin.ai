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

export async function createDirectPgClient(url: string): Promise<Client> {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  if (!SUPABASE_DIRECT_HOST_RE.test(hostname)) {
    return new Client({ connectionString: withPgLibpqSslCompat(url) });
  }

  const v6 = await dnsPromises.resolve6(hostname);
  const ip = v6[0];
  if (!ip) {
    throw new Error(`Direct host IPv6 çözülemedi: ${hostname}`);
  }

  const database = decodeURIComponent(
    parsed.pathname.replace(/^\//u, "").split("/")[0] || "postgres",
  );

  return new Client({
    host: ip,
    port: Number(parsed.port || "5432"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    // uselibpqcompat / libpq sslmode=require: şifrele, özel CA doğrulama.
    ssl: { rejectUnauthorized: false, servername: hostname },
  });
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
    const client = await createDirectPgClient(migrator);
    try {
      await client.connect();
      return { client, via: "direct" };
    } catch (error) {
      await client.end().catch(() => undefined);
      if (!isIpv6Unreachable(error)) {
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
