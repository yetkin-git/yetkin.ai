import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  POSTGREST_WRITE_POLICY_FORBIDDEN,
  RLS_FORCE_TABLES,
  RLS_OWNERSHIP_COLUMNS,
  RLS_UNSCOPED_DENY_POLICY,
} from "@/lib/kernel/security/rls-policy-registry";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";

const ROOT = join(process.cwd());
const MIG_DIR = join(ROOT, "supabase", "migrations");

function readMig(suffix: string): string {
  const file = readdirSync(MIG_DIR).find((name) => name.endsWith(suffix));
  if (!file) {
    throw new Error(`migration missing: ${suffix}`);
  }
  return readFileSync(join(MIG_DIR, file), "utf8");
}

describe("Faz 1.1 RLS / Auth mühürleri", () => {
  it("handle_new_user users + TRY amount_minor cüzdan açar", () => {
    const sql = readMig("handle_new_user_auth_sync.sql");
    expect(sql).toMatch(/FUNCTION public\.handle_new_user\(\)/);
    expect(sql).toContain("INSERT INTO public.users");
    expect(sql).toContain("INSERT INTO public.wallets");
    expect(sql).toContain("amount_minor");
    expect(sql).toContain("'TRY'");
    expect(sql).toMatch(/EXCEPTION/);
    expect(sql).not.toMatch(/amount_kurus/);
    expect(sql).toContain(PLATFORM_TREASURY_USER_ID);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.handle_new_user\(\)/);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.handle_new_user\(\) FROM PUBLIC/);
    expect(sql).toContain("supabase_auth_admin");
    expect(sql).toMatch(/e-posta boş/);
    expect(sql).toContain("age_confirmed_at");
    expect(sql).toMatch(/18 yaş onayı yok/);
  });

  it("handle_user_email_update Auth e-postasını public.users'a kopyalar", () => {
    const sql = readMig("handle_user_email_update.sql");
    expect(sql).toMatch(/FUNCTION public\.handle_user_email_update\(\)/);
    expect(sql).toContain("SECURITY DEFINER");
    expect(sql).toContain("search_path = public, pg_catalog");
    expect(sql).toMatch(/AFTER UPDATE OF email ON auth\.users/);
    expect(sql).toContain("OLD.email IS DISTINCT FROM NEW.email");
    expect(sql).toMatch(/UPDATE public\.users/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.handle_user_email_update\(\)/);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.handle_user_email_update\(\) FROM PUBLIC/);
    expect(sql).toContain("supabase_auth_admin");
    expect(sql).toMatch(/e-posta boş/);
    expect(sql).not.toMatch(/INSERT INTO public\.wallets/);
    expect(sql).not.toMatch(/FOR INSERT/);
    expect(sql).not.toMatch(/FOR DELETE/);
  });

  it("ENABLE+FORCE RLS ve event trigger mühürlüdür", () => {
    const sql = readMig("enforce_rls_all_tables.sql");
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/FORCE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/CREATE EVENT TRIGGER yetkin_auto_enable_rls_on_create/);
    expect(sql).toMatch(/GRANT SELECT ON ALL TABLES/);
    expect(sql).not.toMatch(/GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated/);
  });

  it("owner SELECT politikası vardır, PostgREST yazma politikası yoktur", () => {
    const sql = readMig("rls_user_scoped_policies.sql");
    expect(sql).toMatch(/FUNCTION public\.yetkin_auth_user_id\(\)/);
    expect(sql).toMatch(/FUNCTION public\.yetkin_rls_ownership_columns\(\)/);
    expect(sql).toMatch(/FOR SELECT TO authenticated/);
    expect(sql).toMatch(/CREATE EVENT TRIGGER yetkin_auto_apply_rls_policies_on_create/);
    expect(sql).toContain("yetkin_apply_rls_unscoped_deny");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toMatch(/USING \(false\)/);
    expect(sql).not.toMatch(/FOR INSERT/);
    expect(sql).not.toMatch(/FOR UPDATE/);
    expect(sql).not.toMatch(/FOR DELETE/);
    expect(sql).toMatch(/id::text = public\.yetkin_auth_user_id\(\)/);
    const columns = [...sql.matchAll(/'([a-z_]+)'/g)]
      .map((match) => match[1])
      .filter((name) => RLS_OWNERSHIP_COLUMNS.includes(name as (typeof RLS_OWNERSHIP_COLUMNS)[number]));
    for (const column of RLS_OWNERSHIP_COLUMNS) {
      expect(sql).toContain(`'${column}'`);
    }
    expect(new Set(columns).size).toBe(RLS_OWNERSHIP_COLUMNS.length);
    expect(POSTGREST_WRITE_POLICY_FORBIDDEN).toBe(true);
    expect(RLS_UNSCOPED_DENY_POLICY).toBe("rls_deny_unscoped");
    expect(RLS_FORCE_TABLES.length).toBeGreaterThan(10);
  });

  it("treasury UUID Supabase biçimindedir", () => {
    expect(isSupabaseUserId(PLATFORM_TREASURY_USER_ID)).toBe(true);
    expect(isSupabaseUserId("not-a-uuid")).toBe(false);
  });
});
