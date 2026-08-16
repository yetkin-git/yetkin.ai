import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MIG_DIR = join(ROOT, "supabase", "migrations");

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function readEmailSyncSql(): string {
  const file = readdirSync(MIG_DIR).find((name) => name.endsWith("handle_user_email_update.sql"));
  expect(file).toBe("20260814100000_handle_user_email_update.sql");
  return readFileSync(join(MIG_DIR, file!), "utf8");
}

describe("auth e-posta senkron yüzeyi", () => {
  it("UPDATE tetikleyicisi SECURITY DEFINER mühürlüdür; PUBLIC EXECUTE yok", () => {
    const sql = readEmailSyncSql();
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.handle_user_email_update\(\)/);
    expect(sql).toContain("SECURITY DEFINER");
    expect(sql).toContain("SET search_path = public, pg_catalog");
    expect(sql).toMatch(/AFTER UPDATE OF email ON auth\.users/);
    expect(sql).toContain("WHEN (OLD.email IS DISTINCT FROM NEW.email)");
    expect(sql).toMatch(/EXECUTE FUNCTION public\.handle_user_email_update\(\)/);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.handle_user_email_update\(\) FROM PUBLIC/);
    expect(sql).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.handle_user_email_update\(\) TO postgres, service_role/,
    );
    expect(sql).toContain("supabase_auth_admin");
    expect(sql).toMatch(/unique_violation/);
    expect(sql).toMatch(/GET DIAGNOSTICS updated_count = ROW_COUNT/);
  });

  it("mevcut drift'i auth.users SSOT'tan public.users'a çeker; cüzdan/display_name yazmaz", () => {
    const sql = readEmailSyncSql();
    expect(sql).toMatch(/UPDATE public\.users AS u/);
    expect(sql).toMatch(/FROM auth\.users AS a/);
    expect(sql).toContain("u.email IS DISTINCT FROM a.email");
    expect(sql).not.toMatch(/INSERT INTO public\.wallets/i);
    expect(sql).not.toMatch(/display_name/i);
    expect(sql).not.toMatch(/raw_user_meta_data/i);
    expect(sql).not.toMatch(/INSERT INTO public\.users/i);
  });

  it("uygulama public.users.email PATCH etmez; kart User.email'i SSOT okur", () => {
    const load = readSrc("lib/kernel/identity/load.ts");
    const display = readSrc("lib/kernel/identity/display.ts");
    expect(load).not.toMatch(/\.(create|update|upsert)\(/);
    expect(load).toContain("email: true");
    expect(display).toContain("User.email SSOT");
    expect(display).toContain("profileEmail");
    const write = readSrc("lib/kernel/identity/display-name-write.ts");
    const prismaWrite = readSrc("lib/kernel/identity/prisma-display-name-write.ts");
    expect(write).toContain(".strict()");
    expect(prismaWrite).toContain("displayName: input.displayName");
    expect(prismaWrite).not.toMatch(/data:\s*\{[^}]*email/);
  });
});
