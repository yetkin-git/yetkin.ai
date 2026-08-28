import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyRailV1Cors,
  decideRailApiVersion,
  parseRailDronOrigins,
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_SERVER_STALE,
} from "@/lib/kernel/http/api-v1";
import { RAIL_V1_HOPS } from "@/lib/kernel/http/v1-contract";
import { classifyV1Failure } from "../../apps/rail-is/src/ui/classify";
import { RAIL_IS_COPY } from "../../apps/rail-is/src/ui/copy";
import { webWalletUrl } from "../../apps/rail-is/src/ui/present-wallet";
import { RAIL_IS_DAY0_HOPS, assertRailIsDay0Path } from "../../apps/rail-is/src/api/hops";
import { RailV1HttpError } from "../../apps/rail-is/src/api/errors";
import type { RailV1FailBody } from "../../apps/rail-is/src/contract/v1";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function failEnvelope(error: string): RailV1FailBody {
  return {
    ok: false,
    error,
    requestId: "550e8400-e29b-41d4-a716-446655440000",
    apiVersion: "1",
    data: null,
  };
}

describe("Staging T4 saha runner + Closed Testing paket izolasyonu", () => {
  it("verify-staging-t4-loop v1 halkasını ve atomik kilitleri dürüstçe tarar", () => {
    const script = readSrc("scripts/verify-staging-t4-loop.ts");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["verify:staging-t4-loop"]).toBe("tsx scripts/verify-staging-t4-loop.ts");
    expect(script).toContain("/api/v1/freelancer/jobs");
    expect(script).toContain("/api/v1/client/jobs/");
    expect(script).toContain("/api/v1/freelancer/jobs/${jobId}/bids");
    expect(script).toContain("/api/v1/freelancer/jobs/${jobId}/accept");
    expect(script).toContain("/api/v1/freelancer/contracts/${contractId}/messages");
    expect(script).toContain("/api/v1/freelancer/contracts/${contractId}/release");
    expect(script).toContain("X-Rail-Min-Version");
    expect(script).toContain("Idempotency-Key");
    expect(script).toContain("POST /api/freelancer/jobs");
    expect(script).toContain("RAIL_V1_LISTING_VISA_DENIED");
    expect(script).toContain("RAIL_V1_OWNER_BIDS_FORBIDDEN");
    expect(script).toContain("bidderId");
    expect(script).toContain("RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE");
    expect(script).toContain("escrow-hold");
    expect(script).toContain("escrow-release-net");
    expect(script).toContain("EscrowHold PENDING");
    expect(script).toContain("kind: \"DELIVERY\"");
    expect(script).toContain("FREELANCER_RELEASE");
    expect(script).toContain("computePaytrWebhookHash");
    expect(script).toContain("PAYTR_SANDBOX");
    expect(script).toContain("parseRailDronOrigins");
    expect(script).toContain("dron-stale-lock");
    expect(script).toContain("/cuzdan");
    expect(script).toContain("çerez-only");
    expect(script).toContain("E2E_T4_WORKER");
    expect(script).toContain("E2E_T4_CLIENT");
    expect(script).toContain("STAGING_APP_URL");
    expect(script).toContain("AbortSignal.timeout");
    expect(script).not.toContain("auth.signUp");
    expect(script).not.toContain("LOCAL_MOCK_AUTH");
    expect(script).not.toContain("PAYTR_ALLOW_MOCK_CHECKOUT=true");
    expect(script).not.toMatch(/UPDATE\s+wallets/i);
    expect(script).not.toMatch(/SET\s+amount_minor/i);
    expect(script).not.toContain("/api/v1/freelancer/jobs/${jobId}\"");
    expect(script).not.toContain("GET /api/v1/freelancer/jobs/{id}");
  });

  it("RAIL_DRON_ORIGINS boşken Bearer yolu CORS basmaz; joker düşer", () => {
    expect(parseRailDronOrigins("")).toEqual([]);
    expect(parseRailDronOrigins(undefined)).toEqual([]);
    const headers = new Headers();
    applyRailV1Cors(
      { headers },
      {
        url: "http://staging.yetkin.rail/api/v1/auth/session",
        headers: new Headers({ origin: "https://lab.yetkin.rail" }),
      },
      { RAIL_DRON_ORIGINS: "" },
    );
    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(headers.get("Access-Control-Allow-Credentials")).toBeNull();

    expect(readSrc("apps/rail-is/src/api/client.ts")).toContain('credentials: "omit"');
    expect(readSrc("apps/rail-is/src/api/client.ts")).toContain("stripCookieHeaders");
    expect(readSrc("apps/rail-is/src/api/client.ts")).toContain("RAIL_MIN_VERSION_HEADER");
    expect(readSrc("apps/rail-is/src/api/client.ts")).toContain("AUTHORIZATION_HEADER");
    expect(readSrc("apps/rail-is/.env.example")).toContain("service_role YASAK");
    expect(readSrc("apps/rail-is/.env.example")).not.toMatch(/SERVICE_ROLE_KEY\s*=/);
    expect(readSrc("apps/rail-is/.env.example")).toContain("EXPO_PUBLIC_RAIL_API_BASE");
    expect(readSrc(".env.example")).toContain("RAIL_DRON_ORIGINS=\"\"");
    expect(readSrc(".env.example")).toContain("STAGING_APP_URL=\"\"");
  });

  it("HTTP 426 kilit ekranı ve /cuzdan web köprüsü Dron'da bağlıdır", () => {
    const clientStale = decideRailApiVersion({
      pathname: "/api/v1/auth/session",
      minVersionHeader: "1",
      minVersion: 2,
      apiVersion: 2,
    });
    expect(clientStale).toEqual({ kind: "fail", status: 426, error: RAIL_VERSION_CLIENT_STALE });

    const serverStale = decideRailApiVersion({
      pathname: "/api/v1/auth/session",
      minVersionHeader: "2",
    });
    expect(serverStale).toEqual({ kind: "fail", status: 426, error: RAIL_VERSION_SERVER_STALE });

    const classified = classifyV1Failure(
      new RailV1HttpError(426, failEnvelope(RAIL_VERSION_CLIENT_STALE)),
    );
    expect(classified.kind).toBe("stale");
    expect(classified.status).toBe(426);
    expect(classified.message).toBe("Lütfen uygulamayı güncelleyiniz");
    expect(RAIL_IS_COPY.stale.testID).toBe("dron-stale-lock");
    expect(readSrc("apps/rail-is/App.tsx")).toContain("UpdateRequiredScreen");
    expect(readSrc("apps/rail-is/src/screens/UpdateRequiredScreen.tsx")).toContain(
      "RAIL_IS_COPY.stale.testID",
    );

    expect(webWalletUrl("https://staging.yetkin.rail")).toBe("https://staging.yetkin.rail/cuzdan");
    expect(webWalletUrl("http://192.168.1.5:3000/")).toBe("http://192.168.1.5:3000/cuzdan");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).toContain("Linking.openURL");
    expect(readSrc("apps/rail-is/src/runtime/use-dron-app.ts")).toContain("openWebWallet");
    expect(readSrc("apps/rail-is/src/screens/OwnerBidsScreen.tsx")).toContain("dron-accept-payments-passive");
    expect(readSrc("apps/rail-is/app.config.ts")).toContain("IAP / Push / ikinci bundle yoktur");
    expect(readSrc("apps/rail-is/app.config.ts")).not.toContain("in-app-purchase");
    expect(readSrc("apps/rail-is/package.json")).not.toMatch(/iap|billing|play-billing/i);
  });

  it("Dron allowlist 9 hop; ilan POST ve GET jobs/{id} yok", () => {
    expect(Object.keys(RAIL_IS_DAY0_HOPS)).toHaveLength(9);
    expect(RAIL_V1_HOPS).toHaveLength(16);
    expect(() => assertRailIsDay0Path("/api/v1/freelancer/jobs/fj_1", "GET")).toThrow(
      /allowlist dışı/,
    );
    expect(() => assertRailIsDay0Path("/api/v1/freelancer/jobs", "POST")).toThrow(/allowlist dışı/);
    expect(() => assertRailIsDay0Path("/api/wallet/top-up", "POST")).toThrow();
    expect(assertRailIsDay0Path("/api/v1/client/jobs/fj_1/bids", "GET")).toBe(
      "/api/v1/client/jobs/fj_1/bids",
    );
    expect(assertRailIsDay0Path("/api/v1/freelancer/jobs/fj_1/accept", "POST")).toBe(
      "/api/v1/freelancer/jobs/fj_1/accept",
    );
  });
});
