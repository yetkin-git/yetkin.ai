import { describe, expect, it } from "vitest";
import {
  HEALTH_DEPENDENCY_UNREADY_ERROR,
  pingPrisma,
  probeLiveness,
  probeReadiness,
  readServiceEnvChecks,
} from "@/lib/kernel/health/probe";

const READY_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  INNGEST_EVENT_KEY: "evt",
  INNGEST_SIGNING_KEY: "sign",
  PAYTR_MERCHANT_ID: "id",
  PAYTR_MERCHANT_KEY: "key",
  PAYTR_MERCHANT_SALT: "salt",
};

describe("health readiness / liveness probe", () => {
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

  it("ping başarısızsa 503 down; bağımlılık eksikse 503; hepsi hazırsa 200", async () => {
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
    expect(down.body.checks.payments).toBe("unconfigured");

    const depsMissing = await probeReadiness({
      databaseUrl: "postgres://session/rail",
      pingDb: async () => undefined,
      env: {},
    });
    expect(depsMissing.statusCode).toBe(503);
    expect(depsMissing.body.ok).toBe(false);
    expect(depsMissing.body.checks.db).toBe("ok");
    expect(depsMissing.body.error).toBe(HEALTH_DEPENDENCY_UNREADY_ERROR);

    const ok = await probeReadiness({
      databaseUrl: "postgres://session/rail",
      pingDb: async () => undefined,
      env: READY_ENV,
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.body.ok).toBe(true);
    expect(ok.body.checks.db).toBe("ok");
    expect(ok.body.status).toBe("ok");
  });

  it("payments ve inngest kısmi anahtarda unconfigured; Payments 503 değildir", async () => {
    expect(
      readServiceEnvChecks({
        PAYTR_MERCHANT_ID: "id",
        PAYTR_MERCHANT_KEY: "key",
      }).payments,
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
      payments: "configured",
    });

    const unready = await probeReadiness({
      databaseUrl: "postgres://session/rail",
      pingDb: async () => undefined,
      env: {
        PAYTR_MERCHANT_ID: "id",
        INNGEST_SIGNING_KEY: "sign",
      },
    });
    expect(unready.statusCode).toBe(503);
    expect(unready.body.checks.payments).toBe("unconfigured");
    expect(unready.body.checks.inngest).toBe("unconfigured");

    const paytrMissing = await probeReadiness({
      databaseUrl: "postgres://session/rail",
      pingDb: async () => undefined,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        INNGEST_EVENT_KEY: "evt",
        INNGEST_SIGNING_KEY: "sign",
      },
    });
    expect(paytrMissing.statusCode).toBe(200);
    expect(paytrMissing.body.ok).toBe(true);
    expect(paytrMissing.body.checks.payments).toBe("unconfigured");
    expect(paytrMissing.body.checks.inngest).toBe("configured");
  });

  it("liveness DB ve sağlayıcı olmadan 200 döner", () => {
    const live = probeLiveness({});
    expect(live.statusCode).toBe(200);
    expect(live.body.ok).toBe(true);
    expect(live.body.probe).toBe("liveness");
    expect(live.body.checks.db).toBe("unconfigured");
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
