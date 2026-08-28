import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function assignedEnvKeys(source: string): string[] {
  return [...source.matchAll(/^(?:export )?([A-Z][A-Z0-9_]+)=/gm)].map((match) => match[1]!);
}

function envSchemaKeys(source: string): string[] {
  return [...source.matchAll(/^  ([A-Z][A-Z0-9_]+):/gm)].map((match) => match[1]!);
}

const MUSEUM_KEYS = [
  "REDIS_URL",
  "UPSTASH_REDIS_REST_URL",
  "LOCAL_MOCK_AUTH",
  "MAINTENANCE_MODE",
  "AUTH_COOKIE_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GIB_EARSIV_USERID",
  "CHESS_SOCKET_PORT",
  "INNGEST_DEV",
  "NETGSM_USERCODE",
  "YETKIN_HOLDING_USER_ID",
];

describe(".env.example ops şablonu", () => {
  it("lib/kernel/env.ts anahtarlarını dürüst atama olarak taşır", () => {
    const example = readSrc(".env.example");
    const envTs = readSrc("lib/kernel/env.ts");
    const exampleKeys = assignedEnvKeys(example).sort();
    const schemaKeys = envSchemaKeys(envTs).sort();
    expect(exampleKeys).toEqual(schemaKeys);
    expect(exampleKeys).toContain("SHADOW_DATABASE_URL");
    expect(exampleKeys).toContain("SUPER_ADMIN_USER_ID");
    expect(exampleKeys).toContain("INNGEST_EVENT_KEY");
    expect(exampleKeys).toContain("INNGEST_SIGNING_KEY");
    expect(exampleKeys).toContain("PLATFORM_TREASURY_USER_ID");
    expect(example).toContain("00000000-0000-4000-8000-000000000001");
    expect(example).toContain("db.<ref>.supabase.co:5432");
    expect(example).toContain("pooler.supabase.com");
    expect(exampleKeys).toContain("PAYTR_MERCHANT_ID");
    expect(exampleKeys).toContain("PAYTR_MERCHANT_KEY");
    expect(exampleKeys).toContain("PAYTR_MERCHANT_SALT");
    expect(exampleKeys).toContain("PAYTR_SANDBOX");
    expect(exampleKeys).toContain("PAYTR_ALLOW_MOCK_CHECKOUT");
    expect(exampleKeys).toContain("NOTICE_SMTP_HOST");
    expect(exampleKeys).toContain("NOTICE_MAIL_FROM");
    expect(exampleKeys).toContain("NOTICE_SMTP_PASS");
    expect(example).toContain("CREDIT yazmaz");
    expect(example).toContain("Resend / Postmark SDK yok");
    expect(example).toContain("INNGEST_DEV=1 yalnızca .env.local");
    expect(example).toContain("/api/payments/webhooks/paytr");
    expect(exampleKeys).toContain("RAIL_DRON_ORIGINS");
    expect(exampleKeys).toContain("TRUSTED_PROXY_HOPS");
    expect(example).not.toMatch(/^INNGEST_DEV=/m);
    expect(example).not.toMatch(/^RESEND_API_KEY=/m);
  });

  it("müze / holding anahtarlarını şablona yazmaz", () => {
    const example = readSrc(".env.example");
    const assigned = new Set(assignedEnvKeys(example));
    for (const key of MUSEUM_KEYS) {
      expect(assigned.has(key), key).toBe(false);
    }
    expect(example).toContain("Müze");
    expect(example).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
