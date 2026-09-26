import { describe, expect, it } from "vitest";
import { decideWebOriginGuard } from "@/lib/kernel/security/origin-guard";

const SESSION_COOKIE = [{ name: "sb-yetkin-auth-token", value: "session" }];
const APP_ENV = {
  NODE_ENV: "production",
  NEXT_PUBLIC_APP_URL: "https://yetkin.ai",
} as NodeJS.ProcessEnv;

/** Kenar `proxy.ts` deny kararını 403 ile mühürler. */
function edgeStatus(kind: "skip" | "allow" | "deny"): number {
  return kind === "deny" ? 403 : 200;
}

describe("web origin kalkanı", () => {
  it("sec-fetch-site cross-site ve https://evil.example çerezli yazmayı reddeder", () => {
    const decision = decideWebOriginGuard({
      pathname: "/api/wallet/top-up",
      method: "POST",
      originHeader: "https://evil.example",
      secFetchSite: "cross-site",
      cookies: SESSION_COOKIE,
      requestUrl: new URL("https://yetkin.ai/api/wallet/top-up"),
      env: APP_ENV,
    });
    expect(decision.kind).toBe("deny");
    expect(edgeStatus(decision.kind)).toBe(403);
  });

  it("/api/v1/ Bearer yazmalarında kalkan konuşmaz", () => {
    const decision = decideWebOriginGuard({
      pathname: "/api/v1/wallet/top-up",
      method: "POST",
      originHeader: "https://evil.example",
      secFetchSite: "cross-site",
      cookies: SESSION_COOKIE,
      requestUrl: new URL("https://yetkin.ai/api/v1/wallet/top-up"),
      env: APP_ENV,
    });
    expect(decision.kind).toBe("skip");
    expect(edgeStatus(decision.kind)).toBe(200);
  });

  it("aynı kökenli çerezli yazmaya izin verir", () => {
    const decision = decideWebOriginGuard({
      pathname: "/api/wallet/top-up",
      method: "POST",
      originHeader: "https://yetkin.ai",
      secFetchSite: "same-origin",
      cookies: SESSION_COOKIE,
      requestUrl: new URL("https://yetkin.ai/api/wallet/top-up"),
      env: APP_ENV,
    });
    expect(decision.kind).toBe("allow");
  });
});
