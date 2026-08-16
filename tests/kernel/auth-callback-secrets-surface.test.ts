import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Auth callback ve no-secrets yüzeyi", () => {
  it("/auth/callback PKCE code exchange mühürler", () => {
    const route = readSrc("app/auth/callback/route.ts");
    expect(route).toContain("exchangeCodeForSession");
    expect(route).toContain('searchParams.get("code")');
    expect(route).toContain("resolveAuthCallbackNext");
    expect(route).toContain("createSupabaseCookieClient");
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("verify:no-secrets betiği PEM ve service_role JWT tarar; prebuild'dedir", () => {
    const script = readSrc("scripts/verify-no-secrets.ts");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(script).toContain("PRIVATE KEY");
    expect(script).toContain("service_role");
    expect(script).toContain(".env.example");
    expect(script).toContain("git ls-files");
    expect(pkg.scripts["verify:no-secrets"]).toBe("tsx scripts/verify-no-secrets.ts");
    expect(pkg.scripts["verify:prebuild"]).toContain("verify:no-secrets");
  });
});
