#!/usr/bin/env tsx
/**
 * DIRECT_URL runbook biçimi: db.<ref>.supabase.co:5432.
 * Havuz kullanıcısı postgres.<ref> ise doğrudan oturum türetilir ve denenir.
 * --apply bağlantı açılırsa disk satırını bu hosta çeker. :6543 yazılmaz.
 * Bağlantı dizgisi basılmaz.
 *
 *   npm run ops:direct-session
 *   npm run ops:direct-session -- --apply
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { isSupabaseDirectSessionUrl } from "@/lib/kernel/postgres-url";
import {
  DIRECT_PORT_OPERATOR_PROTOCOL,
  isForbiddenPoolerUrl,
  parseDirectConnectionUrl,
  resolveHostedDirectSessionUrl,
  resolveMigratorConnectionUrl,
} from "./ops-migrate-lib";
import { openDirectPgClient } from "./ops-pg-direct-client";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

function fail(message: string): never {
  console.error(`ops:direct-session BAŞARISIZ: ${message}`);
  process.exit(1);
}

function publicDbError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  if (message.includes("://") || message.includes("@")) {
    return code || "bağlantı düştü";
  }
  return code ? `${code} ${message.slice(0, 160)}` : message.slice(0, 160);
}

function diskClass(url: string): string {
  if (isSupabaseDirectSessionUrl(url)) {
    return "supabase-direct";
  }
  if (isForbiddenPoolerUrl(url)) {
    return "forbidden-pooler";
  }
  const shape = parseDirectConnectionUrl(url);
  if (shape?.isLoopback) {
    return "loopback";
  }
  return "other";
}

function envFileWithDirectUrl(): { path: string; source: string } | null {
  for (const name of [".env.local", ".env"] as const) {
    const path = resolve(ROOT, name);
    try {
      const source = readFileSync(path, "utf8");
      const match = source.match(/^DIRECT_URL=(.*)$/m);
      const raw = match?.[1]?.trim() ?? "";
      const unquoted = raw.replace(/^["']|["']$/g, "");
      if (unquoted.length > 0) {
        return { path, source };
      }
    } catch {
      // Dosya yoksa sıradaki aday.
    }
  }
  return null;
}

function rewriteDirectUrl(source: string, nextValue: string): string {
  if (nextValue.includes("\n") || nextValue.includes("'")) {
    throw new Error("DIRECT_URL satırı tırnak veya satır sonu taşıyor. Elle yaz.");
  }
  if (!/^DIRECT_URL=.*$/m.test(source)) {
    throw new Error("DIRECT_URL satırı yok.");
  }
  return source.replace(/^DIRECT_URL=.*$/m, `DIRECT_URL='${nextValue}'`);
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const raw = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!raw) {
    fail(`DIRECT_URL veya DATABASE_URL yok. ${DIRECT_PORT_OPERATOR_PROTOCOL}`);
  }
  const shape = parseDirectConnectionUrl(raw);
  const port = shape?.port ?? "?";
  console.log(`ops:direct-session disk=${diskClass(raw)} port=${port}`);

  if (isSupabaseDirectSessionUrl(raw) && !isForbiddenPoolerUrl(raw)) {
    console.log("ops:direct-session OK — disk zaten doğrudan oturum :5432.");
    return;
  }

  const derived = resolveHostedDirectSessionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!derived || isForbiddenPoolerUrl(derived) || derived.includes(":6543")) {
    fail(
      `Doğrudan oturum türetilemedi. Kullanıcı postgres.<ref> olmalı. ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }

  try {
    const client = await openDirectPgClient(derived);
    await client.query("SELECT 1");
    await client.end();
  } catch (error) {
    fail(
      `Türetilen doğrudan oturum açılmadı (${publicDbError(error)}). Disk havuzda kaldı. ${DIRECT_PORT_OPERATOR_PROTOCOL}`,
    );
  }
  console.log("ops:direct-session connect=ok derived=supabase-direct port=5432");

  if (!apply) {
    console.log("ops:direct-session apply yok. Diski çekmek için --apply.");
    return;
  }

  const file = envFileWithDirectUrl();
  if (!file) {
    fail("DIRECT_URL satırı .env.local veya .env içinde yok. Değer bu betikte icat edilmez.");
  }
  const next = rewriteDirectUrl(file.source, derived);
  writeFileSync(file.path, next);
  console.log("ops:direct-session yazıldı — DIRECT_URL doğrudan oturum :5432. :6543 yok.");
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
