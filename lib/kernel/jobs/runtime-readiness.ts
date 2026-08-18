/**
 * Üretim iş kuyruğu ve nakit webhook env sicili — sır basmaz.
 * Fail-closed (503 / CREDIT yok) üretimin *doğru* cevabıdır; bu rapor
 * o cevabın üretimde *unutulmaması* içindir. Prebuild zincirinde yoktur.
 */

import { readServiceEnvChecks } from "@/lib/kernel/health/probe";
import { resolveInngestServeMode } from "@/lib/kernel/jobs/inngest-guard";

export type RuntimePresence = "configured" | "unconfigured";

export type RuntimeReadinessReport = {
  production: boolean;
  database: RuntimePresence;
  supabaseAuth: RuntimePresence;
  inngest: RuntimePresence;
  paytr: RuntimePresence;
  smtp: RuntimePresence;
  /** serve() kapalı — GET/POST/PUT /api/jobs/inngest 503. */
  inngestServeFailClosed: boolean;
  /** Üretimde Inngest, PayTR veya DATABASE_URL boş. */
  productionBlocked: boolean;
  blocking: readonly string[];
};

function presence(ok: boolean): RuntimePresence {
  return ok ? "configured" : "unconfigured";
}

function envFilled(
  env: Record<string, string | undefined>,
  keys: readonly string[],
): boolean {
  return keys.every((key) => Boolean(env[key]?.trim()));
}

export function evaluateRuntimeReadiness(
  env: Record<string, string | undefined> = process.env,
): RuntimeReadinessReport {
  const services = readServiceEnvChecks(env);
  const database = presence(Boolean(env.DATABASE_URL?.trim()));
  const smtp = presence(envFilled(env, ["NOTICE_SMTP_HOST", "NOTICE_MAIL_FROM"]));
  const production = env.NODE_ENV === "production";
  const inngestServeFailClosed = resolveInngestServeMode(env) === "fail-closed";

  const blocking: string[] = [];
  if (production && database === "unconfigured") {
    blocking.push("DATABASE_URL boş — GET /api/health 503.");
  }
  if (production && services.inngest === "unconfigured") {
    blocking.push(
      "INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY boş — /api/jobs/inngest 503; valör ve emanet TTL durur.",
    );
  }
  if (production && services.paytr === "unconfigured") {
    blocking.push(
      "PAYTR üçlü boş — Bildirim URL CREDIT yazmaz; webhook missing_credentials.",
    );
  }

  return {
    production,
    database,
    supabaseAuth: services.supabaseAuth,
    inngest: services.inngest,
    paytr: services.paytr,
    smtp,
    inngestServeFailClosed,
    productionBlocked: blocking.length > 0,
    blocking,
  };
}

export function runtimeReadinessExitCode(report: RuntimeReadinessReport): number {
  return report.productionBlocked ? 1 : 0;
}

export function formatRuntimeReadiness(report: RuntimeReadinessReport): string {
  const lines = [
    `NODE_ENV production=${report.production ? "evet" : "hayır"}`,
    `database=${report.database}`,
    `supabaseAuth=${report.supabaseAuth}`,
    `inngest=${report.inngest} serveFailClosed=${report.inngestServeFailClosed ? "evet" : "hayır"}`,
    `paytr=${report.paytr}`,
    `smtp=${report.smtp} (boşsa nakit durmaz; piyasa kör)`,
  ];
  if (report.blocking.length > 0) {
    lines.push("Üretim bloğu:");
    for (const row of report.blocking) {
      lines.push(`- ${row}`);
    }
  } else if (report.production) {
    lines.push("Üretim bloğu yok. GET /api/health checks.inngest=configured doğrula.");
  } else {
    lines.push("Geliştirme: Cloud yoksa INNGEST_DEV=1. Çıkış kodu 0 (uyarı).");
    if (report.inngest === "unconfigured" && !report.inngestServeFailClosed) {
      lines.push("INNGEST_DEV yerel duman açık; üretim kilidini açmaz.");
    }
  }
  return lines.join("\n");
}
