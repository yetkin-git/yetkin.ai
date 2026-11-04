import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { collectSupabaseAuthCookieRefresh } from "@/lib/kernel/auth/refresh-edge-cookies";
import {
  expireSupabaseAuthCookies,
  installStaleRefreshTokenLogFilter,
  isStaleRefreshTokenError,
} from "@/lib/kernel/auth/stale-refresh-token";

const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser },
  })),
}));

function staleRefreshError() {
  return Object.assign(new Error("Invalid Refresh Token: Refresh Token Not Found"), {
    name: "AuthApiError",
    code: "refresh_token_not_found",
    status: 400,
  });
}

describe("ölü yenileme jetonu", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    getUser.mockReset();
  });

  it("kod ve AuthApiError mesajını tanır; düz metni yutmaz", () => {
    expect(isStaleRefreshTokenError(staleRefreshError())).toBe(true);
    expect(isStaleRefreshTokenError({ code: "refresh_token_already_used" })).toBe(true);
    expect(isStaleRefreshTokenError({ code: "session_expired", message: "expired" })).toBe(true);
    expect(
      isStaleRefreshTokenError({
        name: "AuthApiError",
        message: "Invalid Refresh Token: Refresh Token Not Found",
      }),
    ).toBe(true);
    expect(isStaleRefreshTokenError({ name: "AuthApiError", code: "invalid_credentials" })).toBe(
      false,
    );
    expect(
      isStaleRefreshTokenError(
        "Error [AuthApiError]: Invalid Refresh Token: Refresh Token Not Found",
      ),
    ).toBe(false);
    expect(isStaleRefreshTokenError(new Error("network down"))).toBe(false);
  });

  it("çerez Max-Age=0 düşer; auth dışı çerez durur", () => {
    const setCookie = vi.fn();
    expireSupabaseAuthCookies(
      [
        { name: "sb-testref-auth-token", value: "dead" },
        { name: "sb-testref-auth-token.0", value: "chunk" },
        { name: "theme", value: "dark" },
        { name: "sb-testref-auth-token.1", value: "   " },
      ],
      setCookie,
      new URL("http://localhost:3000/dashboard"),
    );
    expect(setCookie).toHaveBeenCalledTimes(2);
    expect(setCookie).toHaveBeenCalledWith(
      "sb-testref-auth-token",
      "",
      expect.objectContaining({ maxAge: 0, httpOnly: true, path: "/", secure: false }),
    );
    expect(setCookie).toHaveBeenCalledWith(
      "sb-testref-auth-token.0",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );
  });

  it("konsol filtresi yalnız ölü jeton nesnesini yutar", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    installStaleRefreshTokenLogFilter();
    const stale = staleRefreshError();
    console.warn(stale);
    console.error(stale);
    console.warn("keepalive");
    console.error("Error [AuthApiError]: Invalid Refresh Token: Refresh Token Not Found");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith("keepalive");
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      "Error [AuthApiError]: Invalid Refresh Token: Refresh Token Not Found",
    );
  });

  it("kenar getUser ölü jetonu yanıt çerezinden düşürür", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://edge-test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test");
    getUser.mockResolvedValue({ data: { user: null }, error: staleRefreshError() });
    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: { cookie: "sb-testref-auth-token=dead-session" },
    });

    const refresh = await collectSupabaseAuthCookieRefresh(request);
    expect(request.cookies.get("sb-testref-auth-token")).toBeUndefined();

    const response = NextResponse.next();
    refresh.applyTo(response);
    const setCookie = response.headers.getSetCookie().join("\n");
    expect(setCookie).toContain("sb-testref-auth-token=");
    expect(setCookie.toLowerCase()).toContain("max-age=0");
  });

  it("ağ hatasında kenar çerezi silmez", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://edge-test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test");
    getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthRetryableFetchError", message: "timeout" },
    });
    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: { cookie: "sb-testref-auth-token=still-here" },
    });

    const refresh = await collectSupabaseAuthCookieRefresh(request);
    expect(request.cookies.get("sb-testref-auth-token")?.value).toBe("still-here");
    const response = NextResponse.next();
    refresh.applyTo(response);
    expect(response.headers.getSetCookie()).toEqual([]);
  });
});
