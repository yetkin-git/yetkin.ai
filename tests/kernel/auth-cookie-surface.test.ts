import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  AUTH_COOKIE_ENCODING,
  AUTH_RESPONSE_CACHE_HEADERS,
  normalizeAuthCookieOptions,
} from "@/lib/kernel/auth/cookie-options";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Supabase SSR 0.12 çerez hizası", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("paketler müze bandındadır; service_role ve LOCAL_MOCK_AUTH yok", () => {
    const pkg = JSON.parse(readSrc("package.json")) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies["@supabase/ssr"]).toBe("^0.12.4");
    expect(pkg.dependencies["@supabase/supabase-js"]).toBe("^2.112.3");
    const lock = JSON.parse(readSrc("package-lock.json")) as {
      packages: Record<string, { version?: string }>;
    };
    expect(lock.packages["node_modules/@supabase/ssr"]?.version).toMatch(/^0\.12\./);
    expect(lock.packages["node_modules/@supabase/supabase-js"]?.version).toMatch(/^2\.11/);

    const session = readSrc("lib/kernel/auth/require-session.ts");
    const callback = readSrc("app/auth/callback/route.ts");
    const browser = readSrc("lib/kernel/auth/supabase-browser.ts");
    const refresh = readSrc("lib/kernel/auth/refresh-edge-cookies.ts");
    expect(`${session}\n${callback}\n${browser}`).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(`${session}\n${callback}\n${browser}`).not.toContain("LOCAL_MOCK_AUTH");
    expect(refresh).toContain("LOCAL_MOCK_AUTH");
    expect(session).toContain("@supabase/supabase-js");
    expect(callback).toContain("createSupabaseCookieClient");
  });

  it("localhost Secure/Domain düşürür; üretimde secure; name sızıntısını siler", () => {
    vi.stubEnv("NODE_ENV", "development");
    const local = normalizeAuthCookieOptions(
      { secure: true, domain: ".example.com", path: "/api", name: "sb-leak-auth-token" },
      new URL("http://localhost:3000/auth/callback"),
    );
    expect(local.secure).toBe(false);
    expect(local.domain).toBeUndefined();
    expect(local.path).toBe("/api");
    expect(local.sameSite).toBe("lax");
    expect(local.httpOnly).toBe(true);
    expect((local as { name?: string }).name).toBeUndefined();

    const loopback = normalizeAuthCookieOptions({ secure: true }, new URL("http://127.0.0.1:3000/login"));
    expect(loopback.secure).toBe(false);
    expect(loopback.path).toBe("/");
    expect(loopback.httpOnly).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    const prod = normalizeAuthCookieOptions(
      { secure: false, sameSite: "none", httpOnly: false },
      new URL("https://rail.example/auth/callback"),
    );
    expect(prod.secure).toBe(true);
    expect(prod.sameSite).toBe("lax");
    expect(prod.httpOnly).toBe(true);
    expect((prod as { partitioned?: boolean }).partitioned).toBeUndefined();
  });

  it("giriş/kayıt/callback/şifre çerez ve PKCE mühürler; kenar getUser yeniler", () => {
    const login = readSrc("components/auth/login-form.tsx");
    const register = readSrc("components/auth/register-form.tsx");
    const forgot = readSrc("components/auth/forgot-password-form.tsx");
    const reset = readSrc("components/auth/reset-password-form.tsx");
    const callback = readSrc("app/auth/callback/route.ts");
    const browser = readSrc("lib/kernel/auth/supabase-browser.ts");
    const server = readSrc("lib/kernel/auth/supabase-server.ts");
    const refresh = readSrc("lib/kernel/auth/refresh-edge-cookies.ts");
    const proxy = readSrc("proxy.ts");
    const jwt = readSrc("lib/kernel/security/edge-jwt.ts");

    expect(browser).toContain("createBrowserClient");
    expect(browser).toContain("AUTH_COOKIE_ENCODING");
    expect(browser).toContain("readPublicSupabaseBrowserEnv");
    expect(browser).toContain("AbortSignal.timeout");
    expect(browser).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(browser).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(AUTH_COOKIE_ENCODING).toBe("base64url");

    expect(login).toContain("createSupabaseBrowserClient");
    expect(login).toContain("signInWithPassword");
    expect(login).toContain("readPostLoginPathFromSearch");
    expect(login).toContain("window.location.search");
    expect(login).toContain("window.location.assign(");
    expect(login).not.toContain("router.push");
    expect(login).not.toContain("router.refresh");
    expect(register).toContain("signUp");
    expect(register).toContain("emailRedirectTo");
    expect(register).toContain("buildSignupEmailRedirectTo");
    expect(register).toContain("buildSignupAuthMetadata");
    expect(register).toContain("readPostLoginPathFromSearch");
    expect(register).toContain("window.location.assign(");
    expect(register).not.toContain("router.push");
    expect(readSrc("lib/kernel/auth/signup-metadata.ts")).toContain("display_name");
    expect(readSrc("lib/kernel/auth/signup-metadata.ts")).toContain("age_confirmed_at");
    expect(forgot).toContain("resetPasswordForEmail");
    expect(forgot).toContain("buildPasswordResetRedirectTo");
    expect(reset).toContain("/api/auth/session");
    expect(reset).toContain("/api/auth/password");
    expect(reset).not.toContain("createSupabaseBrowserClient");
    expect(reset).not.toContain("updateUser");
    expect(reset).not.toContain("PASSWORD_RECOVERY");

    expect(callback).toContain("exchangeCodeForSession");
    expect(callback).toContain("createSupabaseCookieClient");
    const logout = readSrc("app/api/(kernel)/auth/logout/route.ts");
    expect(logout).toContain("createSupabaseCookieClient");
    expect(logout).toContain("signOut");
    expect(logout).toContain("303");
    expect(callback).toContain("setHeaders: response.headers");
    expect(server).toContain("cookieEncoding: AUTH_COOKIE_ENCODING");
    expect(server).toContain("setAll(cookiesToSet, headers)");
    expect(server).toContain("normalizeAuthCookieOptions");
    expect(server).toContain("applyAuthResponseHeaders");
    expect(AUTH_RESPONSE_CACHE_HEADERS["Cache-Control"]).toContain("no-store");

    expect(refresh).toContain("supabase.auth.getUser");
    expect(refresh).toContain("LOCAL_MOCK_AUTH");
    expect(refresh).toContain("isSupabaseConfigured");
    expect(proxy).toContain("collectSupabaseAuthCookieRefresh");
    expect(jwt).toContain('BASE64_PREFIX = "base64-"');
    expect(jwt).toContain("combineCookieChunks");
  });
});
