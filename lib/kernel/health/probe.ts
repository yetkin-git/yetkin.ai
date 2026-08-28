/**
 * Dürüst liveness / readiness.
 * Şema fazı / oda phase / migrasyon klasör adı JSON'da yoktur.
 * Liveness: süreç ayakta (DB yok). Readiness: DB ping + Auth + Inngest sicili.
 * checks.payments bilgi alanıdır (Payments port); unconfigured ≠ 503.
 * checks.inngest = anahtar varlığı. configured ≠ mağaza canlılığı / Cloud cron.
 */

export const HEALTH_SERVICE = "yetkin-rail" as const;
export const HEALTH_PROBE = "readiness" as const;
export const HEALTH_PROBE_LIVE = "liveness" as const;
export const HEALTH_PROBE_READY = "readiness" as const;
export const HEALTH_DB_PING_TIMEOUT_MS = 2_000;
export const HEALTH_DEPENDENCY_UNREADY_ERROR = "Omurga bağımlılıkları hazır değil.";

export type HealthDbState = "ok" | "down" | "unconfigured";
export type HealthEnvState = "configured" | "unconfigured";
export type HealthProbeKind = typeof HEALTH_PROBE_LIVE | typeof HEALTH_PROBE_READY;

export type HealthChecks = {
  db: HealthDbState;
  supabaseAuth: HealthEnvState;
  inngest: HealthEnvState;
  payments: HealthEnvState;
};

export type HealthBody = {
  ok: boolean;
  service: typeof HEALTH_SERVICE;
  probe: HealthProbeKind;
  status: "ok" | "unhealthy";
  checks: HealthChecks;
  error?: string;
};

export type HealthProbeResult = {
  statusCode: number;
  body: HealthBody;
};

export type HealthDbPinger = {
  $queryRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
};

function envConfigured(env: Record<string, string | undefined>, keys: readonly string[]): HealthEnvState {
  return keys.every((key) => Boolean(env[key]?.trim())) ? "configured" : "unconfigured";
}

export function readServiceEnvChecks(
  env: Record<string, string | undefined> = process.env,
): Omit<HealthChecks, "db"> {
  return {
    supabaseAuth: envConfigured(env, ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]),
    inngest: envConfigured(env, ["INNGEST_EVENT_KEY", "INNGEST_SIGNING_KEY"]),
    payments: envConfigured(env, ["PAYTR_MERCHANT_ID", "PAYTR_MERCHANT_KEY", "PAYTR_MERCHANT_SALT"]),
  };
}

export function areReadinessDependenciesReady(checks: HealthChecks): boolean {
  return (
    checks.db === "ok" &&
    checks.supabaseAuth === "configured" &&
    checks.inngest === "configured"
  );
}

export async function pingPrisma(
  client: HealthDbPinger,
  timeoutMs = HEALTH_DB_PING_TIMEOUT_MS,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("db_ping_timeout")), timeoutMs);
  });
  try {
    await Promise.race([client.$queryRaw`SELECT 1`, timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export function probeLiveness(
  env: Record<string, string | undefined> = process.env,
): HealthProbeResult {
  const services = readServiceEnvChecks(env);
  const checks: HealthChecks = { db: "unconfigured", ...services };
  return {
    statusCode: 200,
    body: {
      ok: true,
      service: HEALTH_SERVICE,
      probe: HEALTH_PROBE_LIVE,
      status: "ok",
      checks,
    },
  };
}

export async function probeReadiness(input: {
  databaseUrl?: string | null;
  pingDb: () => Promise<void>;
  env?: Record<string, string | undefined>;
}): Promise<HealthProbeResult> {
  const services = readServiceEnvChecks(input.env ?? process.env);
  const url = input.databaseUrl?.trim() ?? "";

  if (!url) {
    const checks: HealthChecks = { db: "unconfigured", ...services };
    return {
      statusCode: 503,
      body: {
        ok: false,
        service: HEALTH_SERVICE,
        probe: HEALTH_PROBE_READY,
        status: "unhealthy",
        checks,
        error: "Veritabanı bağlı değil.",
      },
    };
  }

  try {
    await input.pingDb();
  } catch {
    const checks: HealthChecks = { db: "down", ...services };
    return {
      statusCode: 503,
      body: {
        ok: false,
        service: HEALTH_SERVICE,
        probe: HEALTH_PROBE_READY,
        status: "unhealthy",
        checks,
        error: "Veritabanı erişilemez.",
      },
    };
  }

  const checks: HealthChecks = { db: "ok", ...services };
  if (!areReadinessDependenciesReady(checks)) {
    return {
      statusCode: 503,
      body: {
        ok: false,
        service: HEALTH_SERVICE,
        probe: HEALTH_PROBE_READY,
        status: "unhealthy",
        checks,
        error: HEALTH_DEPENDENCY_UNREADY_ERROR,
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      ok: true,
      service: HEALTH_SERVICE,
      probe: HEALTH_PROBE_READY,
      status: "ok",
      checks,
    },
  };
}
