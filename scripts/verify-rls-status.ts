#!/usr/bin/env tsx
/**
 * Faz 1.1 — RLS süreklilik mührü (statik).
 * Canlı DB yoksa yalnızca SQL + sicil + Prisma tabloları doğrulanır.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RLS_FORCE_TABLES, RLS_OWNERSHIP_COLUMNS, RLS_UNSCOPED_DENY_POLICY } from "@/lib/kernel/security/rls-policy-registry";

const ROOT = process.cwd();
const SCHEMA_DIR = join(ROOT, "prisma", "schema");
const SUPABASE_MIG_DIR = join(ROOT, "supabase", "migrations");

const issues: string[] = [];

function findMigration(pattern: RegExp): { file: string; sql: string } | null {
  if (!existsSync(SUPABASE_MIG_DIR)) {
    return null;
  }
  const files = readdirSync(SUPABASE_MIG_DIR).filter((name) => pattern.test(name)).sort();
  const file = files[files.length - 1];
  if (!file) {
    return null;
  }
  return { file, sql: readFileSync(join(SUPABASE_MIG_DIR, file), "utf8") };
}

function extractPrismaTables(): string[] {
  if (!existsSync(SCHEMA_DIR)) {
    return [];
  }
  const tables: string[] = [];
  for (const file of readdirSync(SCHEMA_DIR).filter((name) => name.endsWith(".prisma"))) {
    const schema = readFileSync(join(SCHEMA_DIR, file), "utf8");
    let currentMap: string | null = null;
    let currentName: string | null = null;
    let inModel = false;
    for (const line of schema.split(/\r?\n/)) {
      const modelMatch = line.match(/^model\s+(\w+)/);
      if (modelMatch) {
        inModel = true;
        currentName = modelMatch[1] ?? null;
        currentMap = null;
        continue;
      }
      if (!inModel || !currentName) {
        continue;
      }
      const mapMatch = line.match(/@@map\("([^"]+)"\)/);
      if (mapMatch) {
        currentMap = mapMatch[1] ?? null;
      }
      if (line.trim() === "}") {
        const snake = currentName.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
        tables.push(currentMap ?? snake);
        inModel = false;
        currentName = null;
        currentMap = null;
      }
    }
  }
  return [...new Set(tables)].sort();
}

const auth = findMigration(/^\d{14}_handle_new_user_auth_sync\.sql$/);
if (!auth) {
  issues.push("supabase/migrations/*_handle_new_user_auth_sync.sql eksik.");
} else {
  for (const marker of [
    { re: /FUNCTION public\.handle_new_user\(\)/, label: "handle_new_user" },
    { re: /INSERT INTO public\.users/, label: "users insert" },
    { re: /INSERT INTO public\.wallets/, label: "wallets insert" },
    { re: /amount_minor/, label: "amount_minor" },
    { re: /'TRY'/, label: "TRY cüzdan" },
    { re: /EXCEPTION/, label: "wallet TRY/EXCEPTION" },
    { re: /GRANT EXECUTE ON FUNCTION public\.handle_new_user\(\)/, label: "GRANT EXECUTE handle_new_user" },
    { re: /REVOKE ALL ON FUNCTION public\.handle_new_user\(\) FROM PUBLIC/, label: "REVOKE PUBLIC handle_new_user" },
    { re: /supabase_auth_admin/, label: "supabase_auth_admin EXECUTE" },
    { re: /age_confirmed_at/, label: "18+ age_confirmed_at" },
  ]) {
    if (!marker.re.test(auth.sql)) {
      issues.push(`${auth.file}: eksik mühür — ${marker.label}`);
    }
  }
  if (/amount_kurus/.test(auth.sql)) {
    issues.push(`${auth.file}: amount_kurus sızıntısı`);
  }
}

const emailSync = findMigration(/^\d{14}_handle_user_email_update\.sql$/);
if (!emailSync) {
  issues.push("supabase/migrations/*_handle_user_email_update.sql eksik.");
} else {
  for (const marker of [
    { re: /FUNCTION public\.handle_user_email_update\(\)/, label: "handle_user_email_update" },
    { re: /SECURITY DEFINER/, label: "SECURITY DEFINER" },
    { re: /search_path = public, pg_catalog/, label: "search_path" },
    { re: /AFTER UPDATE OF email ON auth\.users/, label: "AFTER UPDATE OF email" },
    { re: /OLD\.email IS DISTINCT FROM NEW\.email/, label: "email DISTINCT WHEN" },
    { re: /UPDATE public\.users/, label: "users email update" },
    { re: /GRANT EXECUTE ON FUNCTION public\.handle_user_email_update\(\)/, label: "GRANT EXECUTE handle_user_email_update" },
    { re: /REVOKE ALL ON FUNCTION public\.handle_user_email_update\(\) FROM PUBLIC/, label: "REVOKE PUBLIC handle_user_email_update" },
    { re: /supabase_auth_admin/, label: "supabase_auth_admin EXECUTE" },
  ]) {
    if (!marker.re.test(emailSync.sql)) {
      issues.push(`${emailSync.file}: eksik mühür — ${marker.label}`);
    }
  }
}

const enforce = findMigration(/^\d{14}_enforce_rls_all_tables\.sql$/);
if (!enforce) {
  issues.push("supabase/migrations/*_enforce_rls_all_tables.sql eksik.");
} else {
  for (const marker of [
    { re: /ENABLE ROW LEVEL SECURITY/, label: "ENABLE RLS" },
    { re: /FORCE ROW LEVEL SECURITY/, label: "FORCE RLS" },
    { re: /CREATE\s+EVENT\s+TRIGGER\s+yetkin_auto_enable_rls_on_create/, label: "event trigger" },
  ]) {
    if (!marker.re.test(enforce.sql)) {
      issues.push(`${enforce.file}: eksik mühür — ${marker.label}`);
    }
  }
}

const policy = findMigration(/^\d{14}_rls_user_scoped_policies\.sql$/);
if (!policy) {
  issues.push("supabase/migrations/*_rls_user_scoped_policies.sql eksik.");
} else {
  for (const marker of [
    { re: /FUNCTION public\.yetkin_auth_user_id\(\)/, label: "yetkin_auth_user_id" },
    { re: /FUNCTION public\.yetkin_rls_ownership_columns\(\)/, label: "ownership sicili" },
    { re: /CREATE POLICY/, label: "CREATE POLICY" },
    { re: /FOR SELECT TO authenticated/, label: "SELECT only" },
    { re: /FUNCTION public\.yetkin_apply_rls_unscoped_deny\(/, label: "unscoped deny" },
    { re: new RegExp(RLS_UNSCOPED_DENY_POLICY), label: "rls_deny_unscoped" },
    { re: /USING \(false\)/, label: "deny USING false" },
    {
      re: /CREATE\s+EVENT\s+TRIGGER\s+yetkin_auto_apply_rls_policies_on_create/,
      label: "policy event trigger",
    },
  ]) {
    if (!marker.re.test(policy.sql)) {
      issues.push(`${policy.file}: eksik mühür — ${marker.label}`);
    }
  }
  if (/FOR INSERT/.test(policy.sql) || /FOR UPDATE/.test(policy.sql) || /FOR DELETE/.test(policy.sql)) {
    issues.push(`${policy.file}: PostgREST yazma politikası yasaktır.`);
  }
  const fn = policy.sql.match(
    /CREATE OR REPLACE FUNCTION public\.yetkin_rls_ownership_columns\(\)[\s\S]*?SELECT ARRAY\[([\s\S]*?)\]::text\[\]/,
  );
  const sqlColumns = fn?.[1]
    ? [...fn[1].matchAll(/'([a-z0-9_]+)'/g)].map((match) => match[1]!)
    : [];
  const expected = [...RLS_OWNERSHIP_COLUMNS];
  if (sqlColumns.join(",") !== expected.join(",")) {
    issues.push(
      `RLS sicil sapması. SQL=[${sqlColumns.join(", ")}] TS=[${expected.join(", ")}]`,
    );
  }
}

const tables = extractPrismaTables();
if (tables.length === 0) {
  issues.push("prisma/schema altında model yok.");
} else {
  const force = [...RLS_FORCE_TABLES].sort();
  const prismaSorted = [...tables].sort();
  if (force.join(",") !== prismaSorted.join(",")) {
    issues.push(
      `RLS FORCE sicil sapması. sicil=[${force.join(", ")}] Prisma=[${prismaSorted.join(", ")}]`,
    );
  }
}

if (issues.length > 0) {
  console.error(["verify:rls-status BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"));
  process.exit(1);
}

console.log(
  `verify:rls-status OK — Auth sync + e-posta senkronu + FORCE RLS + owner SELECT + kapsamsız deny. Prisma tabloları: ${tables.join(", ")}.`,
);
