import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DRON_TEZGAH_STORE_ISOLATED, RAIL_IS_DAY0_HOPS } from "../../apps/rail-is/src/api/hops";
import { LIVE_BROADCAST_SHUTDOWN } from "@/lib/kernel/http/live-broadcast-shutdown";
import { RAIL_V1_HOPS } from "@/lib/kernel/http/v1-contract";
import { findRailV1Hop } from "@/lib/kernel/http/v1-hop-gate";
import { FREELANCER_PUBLIC_SURFACE_LOCKED } from "@/lib/kernel/compliance/circuit-breakers";
import { MARKETPLACE_SPLIT_LIVE } from "@/lib/kernel/payments/marketplace-split-live";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Faz 2 tamamlama — T3 yeşil halka yüzeyi", () => {
  it("protokol zinciri hop sicilinde durur; Dron Akademi UI ve yayın kilidi açıktır", () => {
    expect(RAIL_V1_HOPS).toHaveLength(16);
    expect(Object.keys(RAIL_IS_DAY0_HOPS)).toHaveLength(16);
    expect(findRailV1Hop("/api/v1/auth/session", "GET")?.id).toBe("auth-session");
    expect(findRailV1Hop("/api/v1/wallet/top-up", "POST")?.id).toBe("wallet-top-up");
    expect(findRailV1Hop("/api/v1/dashboard/wallet-strip", "GET")?.id).toBe("wallet-strip");
    expect(findRailV1Hop("/api/v1/academy/courses/c1/purchase", "POST")?.id).toBe("academy-purchase");
    expect(findRailV1Hop("/api/v1/academy/courses/c1/curriculum", "GET")?.id).toBe(
      "academy-curriculum-read",
    );
    expect(findRailV1Hop("/api/v1/academy/courses/c1/curriculum", "POST")?.id).toBe(
      "academy-curriculum",
    );
    expect(findRailV1Hop("/api/v1/academy/courses/c1/exam", "GET")?.id).toBe("academy-exam-read");
    expect(findRailV1Hop("/api/v1/academy/courses/c1/exam", "POST")?.id).toBe("academy-exam");
    expect(findRailV1Hop("/api/v1/academy/certificates/hash", "GET")?.id).toBe(
      "academy-certificate",
    );

    const app = readSrc("apps/rail-is/App.tsx");
    expect(app).toContain("WalletTopUpScreen");
    expect(app).toContain("beginWalletTopUp");
    expect(app).toContain("TOP_UP_OPEN");
    expect(app).toContain("AcademyPlayerScreen");
    expect(app).toContain("ExamScreen");
    expect(app).toContain("CertificateScreen");
    expect(app).not.toContain("ExamPanel");
    expect(app).not.toContain("CurriculumPlayer");
    expect(existsSync(join(ROOT, "apps/rail-is/src/screens/WalletTopUpScreen.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "apps/rail-is/src/screens/AcademyPlayerScreen.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "apps/rail-is/src/screens/ExamScreen.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "apps/rail-is/src/screens/CertificateScreen.tsx"))).toBe(true);

    const hook = readSrc("apps/rail-is/src/runtime/use-dron-app.ts");
    expect(hook).toContain("beginWalletTopUp");
    expect(hook).toContain("Linking.openURL");
    expect(hook).toContain("checkoutPassportUrl");
    expect(hook).toContain("getAcademyCurriculum");
    expect(hook).toContain("completeAcademyLesson");
    expect(hook).toContain("getAcademyExam");
    expect(hook).toContain("submitAcademyExam");
    expect(hook).toContain("getCertificate");

    const dronPkg = JSON.parse(readSrc("apps/rail-is/package.json")) as {
      yetkin?: { publishFrozenUntilFaz1Close?: boolean; tezgahStoreIsolated?: boolean };
    };
    expect(dronPkg.yetkin?.publishFrozenUntilFaz1Close).toBe(false);
    expect(dronPkg.yetkin?.tezgahStoreIsolated).toBe(true);
    expect(readSrc("apps/rail-is/app.config.ts")).toContain("publishFrozenUntilFaz1Close: false");
    expect(readSrc("apps/rail-is/app.config.ts")).toContain("tezgahStoreIsolated: true");
    expect(LIVE_BROADCAST_SHUTDOWN).toBe(false);
    expect(FREELANCER_PUBLIC_SURFACE_LOCKED).toBe(true);
    expect(MARKETPLACE_SPLIT_LIVE).toBe(false);
  });

  it("Closed Testing Tezgâh'ı gizler; EAS profili CI eas basmadan durur", () => {
    expect(DRON_TEZGAH_STORE_ISOLATED).toBe(true);
    expect(existsSync(join(ROOT, "apps/rail-is/src/screens/Phase2LockScreen.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "apps/rail-is/eas.json"))).toBe(true);
    expect(existsSync(join(ROOT, "eas.json"))).toBe(false);

    const app = readSrc("apps/rail-is/App.tsx");
    expect(app).toContain("DRON_TEZGAH_STORE_ISOLATED");
    expect(app).toContain("Phase2LockScreen");
    expect(app).toContain("tezgahOpen");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("Yansıtma bekleniyor");

    const hook = readSrc("apps/rail-is/src/runtime/use-dron-app.ts");
    expect(hook).toContain("DRON_TEZGAH_STORE_ISOLATED");
    expect(hook).toContain("skipTezgah");

    const eas = JSON.parse(readSrc("apps/rail-is/eas.json")) as {
      build?: Record<string, unknown>;
    };
    expect(Object.keys(eas.build ?? {})).toEqual(["development", "preview", "production"]);

    const ci = readSrc(".github/workflows/ci.yml");
    expect(ci).not.toMatch(/eas-cli/);
    expect(ci).not.toMatch(/expo\s+publish/i);

    expect(existsSync(join(ROOT, "docs/MAGAZA_YAYIN_RAPORU.md"))).toBe(true);
    expect(existsSync(join(ROOT, "docs/MAĞAZA_INCELEME_NOTU.md"))).toBe(true);
    expect(readSrc("docs/MAĞAZA_INCELEME_NOTU.md")).toContain("Native IAP");
    expect(readSrc("docs/MAĞAZA_INCELEME_NOTU.md")).toContain("/kasa");
    expect(readSrc("docs/MAĞAZA_INCELEME_NOTU.md")).toContain("E2E_T3_EMAIL");
  });

  it("Redis hız tavanı portu fail-closed bağlanır; ioredis http-rate-limit'e girmez", () => {
    const runtime = readSrc("lib/kernel/security/rate-limit-runtime.ts");
    expect(runtime).toContain("createRedisRestRateLimitPort");
    expect(runtime).toContain("createFailClosedRateLimitPort");
    expect(runtime).toContain("RATE_LIMIT_REDIS_REST_URL");
    const http = readSrc("lib/kernel/security/http-rate-limit.ts");
    expect(http).toContain("resolveRateLimitPort");
    expect(http).not.toMatch(/ioredis|@upstash\/redis/);
    const redis = readSrc("lib/kernel/security/redis-rate-limit-port.ts");
    expect(redis).toContain("fail-closed");
    expect(redis).toContain("INCR");
    expect(redis).toContain("EXPIRE");
  });
});
