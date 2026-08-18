import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  evaluateRuntimeReadiness,
  formatRuntimeReadiness,
  runtimeReadinessExitCode,
} from "@/lib/kernel/jobs/runtime-readiness";

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
    expect(report.paytr).toBe("configured");
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
  });
});
