import { describe, expect, it } from "vitest";
import { PASSWORD_RECOVERY_PATH } from "@/lib/kernel/auth/password";
import {
  AUTH_CALLBACK_PATH,
  AUTH_LOGOUT_API_PATH,
  buildPasswordResetRedirectTo,
  buildSignupEmailRedirectTo,
  isSafeAuthNextPath,
  resolveAuthCallbackNext,
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
});
