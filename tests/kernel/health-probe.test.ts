import { describe, expect, it } from "vitest";
import { pingPrisma, probeReadiness, readServiceEnvChecks } from "@/lib/kernel/health/probe";

describe("health readiness probe", () => {
  it("DATABASE_URL yoksa 503 ve db unconfigured", async () => {
    const result = await probeReadiness({
      databaseUrl: "",
      pingDb: async () => {
        throw new Error("should not ping");
      },
      env: {},
    });
    expect(result.statusCode).toBe(503);
    expect(result.body.ok).toBe(false);
    expect(result.body.probe).toBe("readiness");
    expect(result.body.checks.db).toBe("unconfigured");
    expect(result.body).not.toHaveProperty("phase");
  });

  it("ping başarısızsa 503 down; başarılıysa 200", async () => {
    const down = await probeReadiness({
      databaseUrl: "postgres://session/rail",
      pingDb: async () => {
        throw new Error("ECONNREFUSED");
      },
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      },
    });
    expect(down.statusCode).toBe(503);
    expect(down.body.checks.db).toBe("down");
    expect(down.body.checks.supabaseAuth).toBe("configured");
    expect(down.body.checks.paytr).toBe("unconfigured");

    const ok = await probeReadiness({
      databaseUrl: "postgres://session/rail",
      pingDb: async () => undefined,
      env: {},
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.body.ok).toBe(true);
    expect(ok.body.checks.db).toBe("ok");
    expect(ok.body.status).toBe("ok");
  });

  it("paytr ve inngest kısmi anahtarda unconfigured (fail-closed sicil)", async () => {
    expect(
      readServiceEnvChecks({
        PAYTR_MERCHANT_ID: "id",
        PAYTR_MERCHANT_KEY: "key",
      }).paytr,
    ).toBe("unconfigured");
    expect(
      readServiceEnvChecks({
        INNGEST_EVENT_KEY: "evt",
      }).inngest,
    ).toBe("unconfigured");
    expect(
      readServiceEnvChecks({
        PAYTR_MERCHANT_ID: "id",
        PAYTR_MERCHANT_KEY: "key",
        PAYTR_MERCHANT_SALT: "salt",
        INNGEST_EVENT_KEY: "evt",
        INNGEST_SIGNING_KEY: "sign",
      }),
    ).toEqual({
      supabaseAuth: "unconfigured",
      inngest: "configured",
      paytr: "configured",
    });

    const ok = await probeReadiness({
      databaseUrl: "postgres://session/rail",
      pingDb: async () => undefined,
      env: {
        PAYTR_MERCHANT_ID: "id",
        INNGEST_SIGNING_KEY: "sign",
      },
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.body.checks.paytr).toBe("unconfigured");
    expect(ok.body.checks.inngest).toBe("unconfigured");
  });

  it("pingPrisma timeout'ta fırlatır", async () => {
    await expect(
      pingPrisma(
        {
          $queryRaw: () => new Promise(() => undefined),
        },
        20,
      ),
    ).rejects.toThrow(/db_ping_timeout/);
  });
});
