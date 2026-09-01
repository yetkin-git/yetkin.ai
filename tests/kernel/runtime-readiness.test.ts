import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  evaluateRuntimeReadiness,
  formatRuntimeReadiness,
  runtimeReadinessExitCode,
} from "@/lib/kernel/jobs/runtime-readiness";
import {
  extraProductionBlocks,
  formatFullRuntimeReadiness,
  inspectPaytrOps,
  inspectPostgresOps,
  inspectSafeDefaultOps,
  simulateHealthEnv,
} from "../../scripts/ops-runtime-readiness-lib";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("üretim runtime readiness (Inngest / PayTR)", () => {
  it("üretimde boş Inngest çifti bloğu ve çıkış 1", () => {
    const report = evaluateRuntimeReadiness({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://session/rail",
      INNGEST_EVENT_KEY: "",
      INNGEST_SIGNING_KEY: "",
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
    });
    expect(report.inngest).toBe("unconfigured");
    expect(report.payments).toBe("configured");
    expect(report.inngestServeFailClosed).toBe(true);
    expect(report.productionBlocked).toBe(true);
    expect(report.blocking.some((row) => row.includes("INNGEST"))).toBe(true);
    expect(runtimeReadinessExitCode(report)).toBe(1);
    expect(formatRuntimeReadiness(report)).toContain("503");
  });

  it("üretimde dolu çift + PayTR üçlü bloğu kapatır", () => {
    const report = evaluateRuntimeReadiness({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://session/rail",
      INNGEST_EVENT_KEY: "evt",
      INNGEST_SIGNING_KEY: "sign",
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    });
    expect(report.inngest).toBe("configured");
    expect(report.inngestServeFailClosed).toBe(false);
    expect(report.productionBlocked).toBe(false);
    expect(runtimeReadinessExitCode(report)).toBe(0);
  });

  it("üretimde PayTR üçlüsü boşken süreç bloğu açılmaz", () => {
    const report = evaluateRuntimeReadiness({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://session/rail",
      INNGEST_EVENT_KEY: "evt",
      INNGEST_SIGNING_KEY: "sign",
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    });
    expect(report.payments).toBe("unconfigured");
    expect(report.productionBlocked).toBe(false);
    expect(runtimeReadinessExitCode(report)).toBe(0);
    expect(formatRuntimeReadiness(report)).toContain("unconfigured ≠ süreç down");
  });

  it("geliştirmede boş anahtar çıkış 0; INNGEST_DEV olmadan serve kapalı", () => {
    const report = evaluateRuntimeReadiness({
      NODE_ENV: "development",
      DATABASE_URL: "",
      INNGEST_EVENT_KEY: "",
      INNGEST_SIGNING_KEY: "",
    });
    expect(report.productionBlocked).toBe(false);
    expect(report.inngestServeFailClosed).toBe(true);
    expect(runtimeReadinessExitCode(report)).toBe(0);
  });

  it("INNGEST_DEV geliştirmede serve açar; üretim kilidini açmaz", () => {
    const dev = evaluateRuntimeReadiness({
      NODE_ENV: "development",
      INNGEST_DEV: "1",
      INNGEST_EVENT_KEY: "",
      INNGEST_SIGNING_KEY: "",
    });
    expect(dev.inngest).toBe("unconfigured");
    expect(dev.inngestServeFailClosed).toBe(false);
    expect(runtimeReadinessExitCode(dev)).toBe(0);
    expect(formatRuntimeReadiness(dev)).toContain("üretim kilidini açmaz");

    const prod = evaluateRuntimeReadiness({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://session/rail",
      INNGEST_DEV: "1",
      INNGEST_EVENT_KEY: "",
      INNGEST_SIGNING_KEY: "",
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
    });
    expect(prod.inngestServeFailClosed).toBe(true);
    expect(prod.productionBlocked).toBe(true);
  });

  it("SMTP boş üretim bloğu değildir", () => {
    const report = evaluateRuntimeReadiness({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://session/rail",
      INNGEST_EVENT_KEY: "evt",
      INNGEST_SIGNING_KEY: "sign",
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
    });
    expect(report.smtp).toBe("unconfigured");
    expect(report.devlabsPepper).toBe("unconfigured");
    expect(report.jwtHs256Fallback).toBe("unconfigured");
    expect(report.productionBlocked).toBe(false);
  });

  it("yüzey: ops betiği prebuild'de yoktur; sır basmaz", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:runtime-readiness"]).toBe("tsx scripts/ops-runtime-readiness.ts");
    expect(pkg.scripts["verify:prebuild"]).not.toContain("ops:runtime-readiness");
    const script = readSrc("scripts/ops-runtime-readiness.ts");
    expect(script).toContain("Sır basmaz");
    expect(script).toContain("§5.1");
    expect(script).not.toContain("INNGEST_SIGNING_KEY=");
    expect(script).toContain("formatFullRuntimeReadiness");
    expect(script).toContain("canlı DB ping atılmaz");
    const lib = readSrc("scripts/ops-runtime-readiness-lib.ts");
    expect(lib).toContain("OPS-1");
    expect(lib).toContain("OPS-4");
    expect(lib).toContain("OPS-5");
    expect(lib).toContain("session-mode");
    expect(lib).toContain("5432");
    expect(lib).toContain("6543");
    expect(lib).toContain("/api/payments/webhooks/paytr");
    expect(lib).toContain("/auth/callback");
    expect(lib).toContain("/sifre-yenile");
    expect(lib).toContain("DEVLABS_KEY_PEPPER");
    expect(lib).toContain("NOTICE_SMTP_HOST");
    expect(lib).toContain("in-process-single-node");
    expect(lib).toContain("checks.inngest");
    expect(lib).not.toContain("INNGEST_SIGNING_KEY=");
    expect(lib).not.toContain("PAYTR_MERCHANT_SALT=");
    expect(readSrc("instrumentation.ts")).toContain("ops.devlabs.pepper_unconfigured");
    expect(readSrc("instrumentation.ts")).toContain("ops.smtp.honest_skip");
  });
});

describe("ops:runtime-readiness Direct / PayTR / health ek sicili", () => {
  it("OPS-1: Direct :5432 session-mode geçer; runtime DATABASE_URL pooler :6543 serbest", () => {
    const ok = inspectPostgresOps({
      DATABASE_URL: "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
      DIRECT_URL: "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
    });
    expect(ok.database.hostClass).toBe("supabase-direct");
    expect(ok.database.port).toBe(5432);
    expect(ok.database.sessionMode).toBe(true);
    expect(ok.database.okForDirectProtocol).toBe(true);
    expect(ok.direct.okForDirectProtocol).toBe(true);

    const pooler = inspectPostgresOps({
      DATABASE_URL:
        "postgresql://postgres.abcdefgh:x@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    });
    expect(pooler.database.hostClass).toBe("supabase-pooler");
    expect(pooler.database.transactionModeForbidden).toBe(false);
    expect(pooler.database.sessionMode).toBe(false);
    expect(pooler.database.okForRuntime).toBe(true);
    expect(pooler.database.port).toBe(6543);

    const directPooler = inspectPostgresOps({
      DIRECT_URL:
        "postgresql://postgres.abcdefgh:x@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    });
    expect(directPooler.direct.hostClass).toBe("forbidden-pooler");
    expect(directPooler.direct.transactionModeForbidden).toBe(true);
  });

  it("OPS-2: PayTR üçlü ve iFrame kök sınıfı; sır basılmaz", () => {
    const paytr = inspectPaytrOps({
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
      PAYTR_SANDBOX: "1",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    });
    expect(paytr.triple).toBe("configured");
    expect(paytr.sandboxSet).toBe(true);
    expect(paytr.appUrlClass).toBe("localhost");
    expect(paytr.webhookPath).toBe("/api/payments/webhooks/paytr");
    const body = formatFullRuntimeReadiness({
      NODE_ENV: "development",
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    }).body;
    expect(body).toContain("paytrWebhookPath=/api/payments/webhooks/paytr");
    expect(body).not.toContain("salt");
    expect(body).not.toContain("localhost:3000");
  });

  it("OPS-3: GET /api/health Inngest sicili ping atmadan simüle edilir", () => {
    const configured = simulateHealthEnv({
      DATABASE_URL: "postgres://session/rail",
      INNGEST_EVENT_KEY: "evt",
      INNGEST_SIGNING_KEY: "sign",
    });
    expect(configured.ping).toBe("skipped");
    expect(configured.checks.db).toBe("present-not-pinged");
    expect(configured.checks.inngest).toBe("configured");
    expect(configured.inngestServeFailClosed).toBe(false);

    const empty = simulateHealthEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://session/rail",
      INNGEST_EVENT_KEY: "",
      INNGEST_SIGNING_KEY: "",
    });
    expect(empty.checks.inngest).toBe("unconfigured");
    expect(empty.inngestServeFailClosed).toBe(true);
  });

  it("üretimde DIRECT_URL pooler / Vercel Direct DATABASE_URL ek bloğu basar; runtime pooler geçerlidir", () => {
    expect(
      extraProductionBlocks({
        NODE_ENV: "production",
        DATABASE_URL:
          "postgresql://postgres.abcdefgh:x@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
      }),
    ).toEqual([]);

    expect(
      extraProductionBlocks({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://postgres:x@aws-0.pooler.supabase.com:6543/postgres",
      }).some((row) => row.includes("postgres.<project-ref>")),
    ).toBe(true);

    expect(
      extraProductionBlocks({
        NODE_ENV: "production",
        DIRECT_URL: "postgresql://postgres:x@aws-0.pooler.supabase.com:6543/postgres",
      }).some((row) => row.includes("6543")),
    ).toBe(true);

    expect(
      extraProductionBlocks({
        NODE_ENV: "production",
        VERCEL: "1",
        DATABASE_URL: "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
      }).some((row) => row.includes("6543")),
    ).toBe(true);

    expect(
      extraProductionBlocks({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/yetkin_rail_lab",
      }).some((row) => row.includes("loopback")),
    ).toBe(true);

    const lab = formatFullRuntimeReadiness({
      NODE_ENV: "development",
      DATABASE_URL: "",
      INNGEST_EVENT_KEY: "",
      INNGEST_SIGNING_KEY: "",
    });
    expect(lab.exitCode).toBe(0);
    expect(lab.body).toContain("OPS-1");
    expect(lab.body).toContain("OPS-4");
    expect(lab.body).toContain("OPS-6");
    expect(lab.body).toContain("ops:ghost-wallet-holds");
    expect(lab.body).toContain("Merchant lab");
    expect(lab.body).toContain("devlabsPepper=dev-default");
    expect(lab.body).toContain("jwtFallback=jwks-only");
    expect(lab.body).toContain("noticeSmtp=honest-skip");
    expect(lab.body).toContain("authRedirects=/auth/callback /sifre-yenile");
    expect(lab.body).toContain("GET /api/health simülasyon");
    expect(lab.body).toContain("in-process-single-node");
  });

  it("OPS-4/5: pepper üretim bloğu; SMTP/JWT boş nakit 503 değildir; sır ve origin basılmaz", () => {
    expect(
      extraProductionBlocks({
        NODE_ENV: "production",
        PAYTR_MERCHANT_ID: "id",
        PAYTR_MERCHANT_KEY: "key",
        PAYTR_MERCHANT_SALT: "salt",
        NEXT_PUBLIC_APP_URL: "https://rail.example",
      }).some((row) => row.includes("PAYTR_WEBHOOK_IP_ALLOWLIST")),
    ).toBe(true);

    const missingPepper = extraProductionBlocks({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
      NEXT_PUBLIC_APP_URL: "https://rail.example",
    });
    expect(missingPepper.some((row) => row.includes("DEVLABS_KEY_PEPPER"))).toBe(false);

    const ready = formatFullRuntimeReadiness({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
      DIRECT_URL: "postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres",
      INNGEST_EVENT_KEY: "evt",
      INNGEST_SIGNING_KEY: "sign",
      PAYTR_MERCHANT_ID: "id",
      PAYTR_MERCHANT_KEY: "key",
      PAYTR_MERCHANT_SALT: "salt",
      NEXT_PUBLIC_APP_URL: "https://rail.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      DEVLABS_KEY_PEPPER: "unit-test-pepper",
      PAYTR_WEBHOOK_IP_ALLOWLIST: "203.0.113.10",
    });
    expect(ready.report.productionBlocked).toBe(false);
    expect(ready.report.devlabsPepper).toBe("configured");
    expect(ready.report.smtp).toBe("unconfigured");
    expect(ready.report.jwtHs256Fallback).toBe("unconfigured");
    expect(ready.exitCode).toBe(0);
    expect(ready.body).toContain("devlabsPepper=configured");
    expect(ready.body).not.toContain("unit-test-pepper");
    expect(ready.body).not.toContain("rail.example");
    expect(ready.body).not.toContain("salt");

    const smtpPartial = inspectSafeDefaultOps({
      NOTICE_SMTP_HOST: "smtp.example.test",
    });
    expect(smtpPartial.noticeSmtp.mode).toBe("partial");
    expect(smtpPartial.jwtFallback).toBe("jwks-only");
    expect(smtpPartial.railDronOrigins).toBe("native-no-cors");
    expect(smtpPartial.rateLimitStore).toBe("in-process-single-node");

    const vercel = inspectSafeDefaultOps({ VERCEL: "1" });
    expect(vercel.hosting).toBe("vercel");
    const vercelBody = formatFullRuntimeReadiness({
      NODE_ENV: "development",
      VERCEL: "1",
    }).body;
    expect(vercelBody).toContain("VERCEL algılandı");
    expect(vercelBody).not.toContain("smtp.example.test");
  });
});
