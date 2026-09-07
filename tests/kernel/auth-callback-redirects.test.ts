import { describe, expect, it } from "vitest";
import { PASSWORD_RECOVERY_PATH } from "@/lib/kernel/auth/password";
import {
  AUTH_CALLBACK_PATH,
  AUTH_LOGOUT_API_PATH,
  AUTH_REGISTER_API_PATH,
  AUTH_RESET_PASSWORD_API_PATH,
  buildCitizenLoginHref,
  buildPasswordResetRedirectTo,
  buildSignupEmailRedirectTo,
  isSafeAuthNextPath,
  resolveAuthCallbackNext,
  resolvePostLoginPath,
  supabaseDashboardRedirectUrls,
} from "@/lib/kernel/auth/redirects";

describe("Auth redirect sicili", () => {
  it("Dashboard URL listesi callback + sifre-yenile taşır", () => {
    expect(supabaseDashboardRedirectUrls("https://rail.example/")).toEqual([
      "https://rail.example/auth/callback",
      "https://rail.example/sifre-yenile",
    ]);
    expect(PASSWORD_RECOVERY_PATH).toBe("/sifre-yenile");
    expect(AUTH_CALLBACK_PATH).toBe("/auth/callback");
    expect(AUTH_LOGOUT_API_PATH).toBe("/api/auth/logout");
    expect(AUTH_REGISTER_API_PATH).toBe("/api/auth/register");
    expect(AUTH_RESET_PASSWORD_API_PATH).toBe("/api/auth/reset-password");
  });

  it("next allowlist dışı ve açık yönü dashboard'a düşürür", () => {
    expect(isSafeAuthNextPath("/dashboard")).toBe(true);
    expect(isSafeAuthNextPath("//evil.example")).toBe(false);
    expect(isSafeAuthNextPath("https://evil.example")).toBe(false);
    expect(isSafeAuthNextPath("/admin")).toBe(false);
    expect(resolveAuthCallbackNext({ next: "/sifre-yenile" })).toBe("/sifre-yenile");
    expect(resolveAuthCallbackNext({ type: "recovery" })).toBe("/sifre-yenile");
    expect(resolveAuthCallbackNext({ next: "//phish" })).toBe("/dashboard");
    expect(buildSignupEmailRedirectTo("http://localhost:3000")).toContain("/auth/callback");
    expect(buildPasswordResetRedirectTo("http://localhost:3000")).toContain("next=");
  });

  it("akademi kasa çapasını next içinde taşır; güvenli olmayan hash düşer", () => {
    expect(isSafeAuthNextPath("/academy/01_office_ai#satin-al")).toBe(true);
    expect(buildCitizenLoginHref("/academy/01_office_ai#satin-al")).toBe(
      "/login?next=%2Facademy%2F01_office_ai%23satin-al",
    );
    expect(resolvePostLoginPath("/academy/01_office_ai#satin-al")).toBe(
      "/academy/01_office_ai#satin-al",
    );
    expect(resolveAuthCallbackNext({ next: "/academy/01_office_ai#satin-al" })).toBe(
      "/academy/01_office_ai#satin-al",
    );
    expect(buildCitizenLoginHref("/academy/01_office_ai#javascript:alert(1)")).toBe(
      "/login?next=%2Facademy%2F01_office_ai",
    );
    expect(buildCitizenLoginHref("/admin#satin-al")).toBe("/login");
  });
});
