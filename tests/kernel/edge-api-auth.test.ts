import { describe, expect, it } from "vitest";
import {
  decideEdgeApiAuth,
  EDGE_API_FORBIDDEN_ERROR,
  EDGE_API_NOT_FOUND_ERROR,
  EDGE_API_SESSION_ERROR,
} from "@/lib/kernel/security/edge-api-auth";
import { toPublicApiPath, matchApiAuthKind } from "@/lib/kernel/security/api-auth";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

const MAP: Record<string, string> = {
  "/api/health": "public",
  "/api/studio/generate": "session",
  "/api/admin/catalog": "admin",
  "/api/payments/webhooks/paytr": "webhook",
  "/api/jobs/inngest": "webhook",
  "/api/freelancer/jobs/[id]": "session",
  "/api/freelancer/jobs/[id]/accept": "session",
};

describe("K6 public API yolu", () => {
  it("(kernel) grup klasörünü URL'den düşürür", () => {
    expect(toPublicApiPath("app/api/(kernel)/health/route.ts")).toBe("/api/health");
    expect(toPublicApiPath("app/api/(kernel)/payments/webhooks/paytr/route.ts")).toBe(
      "/api/payments/webhooks/paytr",
    );
    expect(toPublicApiPath("app/api/studio/generate/route.ts")).toBe("/api/studio/generate");
  });
});

describe("K6 kind eşlemesi", () => {
  it("dinamik [id] ve daha uzun alt yolu ayırır", () => {
    expect(matchApiAuthKind("/api/freelancer/jobs/fj_1", MAP)).toBe("session");
    expect(matchApiAuthKind("/api/v1/freelancer/jobs/fj_1", MAP)).toBe("session");
    expect(matchApiAuthKind("/api/v1/freelancer/jobs/fj_1/accept", MAP)).toBe("session");
    expect(matchApiAuthKind("/api/health", MAP)).toBe("public");
    expect(matchApiAuthKind("/api/unknown", MAP)).toBeNull();
  });
});

describe("K6 kenar kararı", () => {
  it("API olmayan yolu atlar", () => {
    expect(decideEdgeApiAuth({ pathname: "/dashboard", sessionHint: false, map: MAP })).toEqual({
      kind: "skip",
    });
  });

  it("public ve webhook oturumsuz geçer; OPTIONS geçer", () => {
    expect(
      decideEdgeApiAuth({ pathname: "/api/health", sessionHint: false, map: MAP }).kind,
    ).toBe("next");
    expect(
      decideEdgeApiAuth({
        pathname: "/api/payments/webhooks/paytr",
        method: "POST",
        sessionHint: false,
        map: MAP,
      }).kind,
    ).toBe("next");
    expect(
      decideEdgeApiAuth({
        pathname: "/api/studio/generate",
        method: "OPTIONS",
        sessionHint: false,
        map: MAP,
      }).kind,
    ).toBe("next");
  });

  it("session kind oturumsuz 401; doğrulanmış oturum varsa geçer", () => {
    expect(
      decideEdgeApiAuth({
        pathname: "/api/studio/generate",
        method: "POST",
        sessionHint: false,
        map: MAP,
      }),
    ).toEqual({ kind: "deny", status: 401, error: EDGE_API_SESSION_ERROR });
    expect(
      decideEdgeApiAuth({
        pathname: "/api/freelancer/jobs/fj_1/accept",
        method: "POST",
        sessionHint: true,
        map: MAP,
      }).kind,
    ).toBe("next");
  });

  it("haritada olmayan /api yolunu 404 eker", () => {
    expect(
      decideEdgeApiAuth({ pathname: "/api/secret-backdoor", sessionHint: false, map: MAP }),
    ).toEqual({ kind: "deny", status: 404, error: EDGE_API_NOT_FOUND_ERROR });
  });

  it("admin kind oturumsuz 401; oturumlu gayri-admin 403; Super Admin geçer", () => {
    const previous = process.env.SUPER_ADMIN_USER_ID;
    const adminId = "11111111-1111-4111-8111-111111111111";
    const citizenId = "22222222-2222-4222-8222-222222222222";
    try {
      process.env.SUPER_ADMIN_USER_ID = adminId;
      expect(
        decideEdgeApiAuth({
          pathname: "/api/admin/catalog",
          method: "PATCH",
          sessionHint: false,
          map: MAP,
        }),
      ).toEqual({ kind: "deny", status: 401, error: EDGE_API_SESSION_ERROR });
      expect(
        decideEdgeApiAuth({
          pathname: "/api/admin/catalog",
          method: "PATCH",
          sessionHint: true,
          sessionUserId: citizenId,
          map: MAP,
        }),
      ).toEqual({ kind: "deny", status: 403, error: EDGE_API_FORBIDDEN_ERROR });
      expect(
        decideEdgeApiAuth({
          pathname: "/api/admin/catalog",
          method: "PATCH",
          sessionHint: true,
          sessionUserId: adminId,
          map: MAP,
        }).kind,
      ).toBe("next");
      delete process.env.SUPER_ADMIN_USER_ID;
      const emptyEnv = decideEdgeApiAuth({
        pathname: "/api/admin/catalog",
        method: "PATCH",
        sessionHint: true,
        sessionUserId: adminId,
        map: MAP,
      });
      expect(emptyEnv).toEqual({ kind: "deny", status: 403, error: EDGE_API_FORBIDDEN_ERROR });
    } finally {
      if (previous == null) {
        delete process.env.SUPER_ADMIN_USER_ID;
      } else {
        process.env.SUPER_ADMIN_USER_ID = previous;
      }
    }
  });
});

describe("üretilen ROUTE_AUTH_MAP", () => {
  it("sağlık public, PayTR ve Inngest webhook, Studio session; grup segmenti yok", () => {
    expect(ROUTE_AUTH_MAP["/api/health"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/payments/webhooks/paytr"]).toBe("webhook");
    expect(ROUTE_AUTH_MAP["/api/jobs/inngest"]).toBe("webhook");
    expect(ROUTE_AUTH_MAP["/api/studio/generate"]).toBe("session");
    expect(Object.keys(ROUTE_AUTH_MAP).some((path) => path.includes("("))).toBe(false);
    expect(Object.keys(ROUTE_AUTH_MAP)).toHaveLength(89);
    expect(ROUTE_AUTH_MAP["/api/academy/certificates"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/academy/certificates/[hash]"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/freelancer/contracts"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/client/jobs/[id]/bids"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/auth/logout"]).toBe("public");
    expect(ROUTE_AUTH_MAP["/api/kurumsal/jobs/[id]/offers"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/dashboard/pulse"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/admin/catalog"]).toBe("admin");
    expect(ROUTE_AUTH_MAP["/api/profile"]).toBe("session");
  });
});
