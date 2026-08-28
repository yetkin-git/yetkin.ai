/**
 * ops:runtime-readiness ek sicili — sır basmaz, canlı DB ping atmaz.
 * Direct :5432 / session-mode, PayTR üçlü + iFrame kök, Inngest health simülasyonu.
 * Transaction-mode :6543 ve pooler.supabase.com yasaktır.
 * Kernel `evaluateRuntimeReadiness` nakit 503 davranışını değiştirmez; bu katman
 * operatör tablosudur (DEVLABS_KEY_PEPPER, SMTP, JWT yedek, auth yön, hız tavanı).
 */

import { SUPABASE_DASHBOARD_REDIRECT_PATHS } from "@/lib/kernel/auth/redirects";
import { readServiceEnvChecks } from "@/lib/kernel/health/probe";
import { resolveInngestServeMode } from "@/lib/kernel/jobs/inngest-guard";
import {
  evaluateRuntimeReadiness,
  formatRuntimeReadiness,
  runtimeReadinessExitCode,
  type RuntimeReadinessReport,
} from "@/lib/kernel/jobs/runtime-readiness";
import {
  DIRECT_POSTGRES_PORT,
  FORBIDDEN_POOLER_PORT,
  isForbiddenPoolerUrl,
  parseDirectConnectionUrl,
} from "./ops-migrate-lib";

export const PAYTR_WEBHOOK_PATH = "/api/payments/webhooks/paytr" as const;

/** Dashboard Redirect URLs: /auth/callback /sifre-yenile — origin basılmaz. SSOT: lib/kernel/auth/redirects.ts */
export const AUTH_DASHBOARD_REDIRECT_PATHS = SUPABASE_DASHBOARD_REDIRECT_PATHS;

export type PostgresHostClass =
  | "unconfigured"
  | "unparseable"
  | "supabase-direct"
  | "forbidden-pooler"
  | "loopback"
  | "other";

export type PostgresUrlOps = {
  name: "DATABASE_URL" | "DIRECT_URL";
  present: boolean;
  hostClass: PostgresHostClass;
  port: number | null;
  sessionMode: boolean;
  transactionModeForbidden: boolean;
  okForDirectProtocol: boolean;
};

export type AppUrlClass = "unconfigured" | "unparseable" | "localhost" | "https-public" | "http-public";

export type PaytrOps = {
  triple: "configured" | "unconfigured";
  sandboxSet: boolean;
  mockCheckoutSet: boolean;
  webhookIpAllowlistSet: boolean;
  appUrlClass: AppUrlClass;
  webhookPath: typeof PAYTR_WEBHOOK_PATH;
};

export type HealthSimChecks = {
  db: "unconfigured" | "present-not-pinged";
  supabaseAuth: "configured" | "unconfigured";
  inngest: "configured" | "unconfigured";
  payments: "configured" | "unconfigured";
};

export type HealthSimulation = {
  ping: "skipped";
  checks: HealthSimChecks;
  inngestServeFailClosed: boolean;
  inngestServeMode: ReturnType<typeof resolveInngestServeMode>;
  /** DB ping yok: HTTP 200 iddia edilmez. Inngest sicili health JSON `checks.inngest` ile aynıdır. */
  note: string;
};

export type JwtFallbackMode = "jwks-only" | "hs256-fallback-set";
export type NoticeSmtpMode = "configured" | "honest-skip" | "partial";
export type DronOriginsMode = "native-no-cors" | "allowlist-set";
export type SuperAdminMode = "configured" | "nobody-is-admin";
export type DevlabsPepperMode = "configured" | "dev-default";
export type RateLimitStoreMode = "in-process-single-node";
export type HostingClass = "vercel" | "unspecified";

export type NoticeSmtpOps = {
  mode: NoticeSmtpMode;
  host: boolean;
  port: boolean;
  user: boolean;
  pass: boolean;
  mailFrom: boolean;
};

export type LlmProviderOps = {
  gemini: boolean;
  openai: boolean;
  anthropic: boolean;
};

export type SafeDefaultOps = {
  jwtFallback: JwtFallbackMode;
  noticeSmtp: NoticeSmtpOps;
  railDronOrigins: DronOriginsMode;
  superAdmin: SuperAdminMode;
  devlabsPepper: DevlabsPepperMode;
  authRedirectPaths: readonly string[];
  appUrlClass: AppUrlClass;
  llm: LlmProviderOps;
  rateLimitStore: RateLimitStoreMode;
  hosting: HostingClass;
};

function filled(env: Record<string, string | undefined>, key: string): boolean {
  return Boolean(env[key]?.trim());
}

function classifyPostgresUrl(
  name: PostgresUrlOps["name"],
  url: string | undefined,
): PostgresUrlOps {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return {
      name,
      present: false,
      hostClass: "unconfigured",
      port: null,
      sessionMode: false,
      transactionModeForbidden: false,
      okForDirectProtocol: false,
    };
  }
  const forbidden = isForbiddenPoolerUrl(trimmed);
  const shape = parseDirectConnectionUrl(trimmed);
  if (!shape) {
    return {
      name,
      present: true,
      hostClass: "unparseable",
      port: null,
      sessionMode: false,
      transactionModeForbidden: forbidden,
      okForDirectProtocol: false,
    };
  }
  const hostClass: PostgresHostClass = forbidden
    ? "forbidden-pooler"
    : shape.isSupabaseDirectHost
      ? "supabase-direct"
      : shape.isLoopback
        ? "loopback"
        : "other";
  return {
    name,
    present: true,
    hostClass,
    port: shape.port,
    sessionMode: shape.isDirectPort && !forbidden,
    transactionModeForbidden: forbidden || shape.port === FORBIDDEN_POOLER_PORT,
    okForDirectProtocol: shape.ok,
  };
}

export function inspectPostgresOps(env: Record<string, string | undefined>): {
  database: PostgresUrlOps;
  direct: PostgresUrlOps;
} {
  return {
    database: classifyPostgresUrl("DATABASE_URL", env.DATABASE_URL),
    direct: classifyPostgresUrl("DIRECT_URL", env.DIRECT_URL),
  };
}

export function classifyAppUrl(url: string | undefined): AppUrlClass {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    return "unconfigured";
  }
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    const loopback = host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (loopback) {
      return "localhost";
    }
    if (parsed.protocol === "https:") {
      return "https-public";
    }
    return "http-public";
  } catch {
    return "unparseable";
  }
}

export function inspectPaytrOps(env: Record<string, string | undefined>): PaytrOps {
  const services = readServiceEnvChecks(env);
  return {
    triple: services.payments,
    sandboxSet: filled(env, "PAYTR_SANDBOX"),
    mockCheckoutSet: filled(env, "PAYTR_ALLOW_MOCK_CHECKOUT"),
    webhookIpAllowlistSet: filled(env, "PAYTR_WEBHOOK_IP_ALLOWLIST"),
    appUrlClass: classifyAppUrl(env.NEXT_PUBLIC_APP_URL),
    webhookPath: PAYTR_WEBHOOK_PATH,
  };
}

export function simulateHealthEnv(env: Record<string, string | undefined>): HealthSimulation {
  const services = readServiceEnvChecks(env);
  const dbPresent = filled(env, "DATABASE_URL");
  return {
    ping: "skipped",
    checks: {
      db: dbPresent ? "present-not-pinged" : "unconfigured",
      supabaseAuth: services.supabaseAuth,
      inngest: services.inngest,
      payments: services.payments,
    },
    inngestServeFailClosed: resolveInngestServeMode(env) === "fail-closed",
    inngestServeMode: resolveInngestServeMode(env),
    note: "Canlı SELECT 1 yok. checks.payments bilgi alanıdır (unconfigured ≠ HTTP 503). HTTP 200 readiness DB ping + Auth + Inngest sicili ister; liveness /api/health/live.",
  };
}

export function inspectNoticeSmtp(env: Record<string, string | undefined>): NoticeSmtpOps {
  const host = filled(env, "NOTICE_SMTP_HOST");
  const port = filled(env, "NOTICE_SMTP_PORT");
  const user = filled(env, "NOTICE_SMTP_USER");
  const pass = filled(env, "NOTICE_SMTP_PASS");
  const mailFrom = filled(env, "NOTICE_MAIL_FROM");
  const configured = host && mailFrom;
  const any = host || port || user || pass || mailFrom;
  const mode: NoticeSmtpMode = configured ? "configured" : any ? "partial" : "honest-skip";
  return { mode, host, port, user, pass, mailFrom };
}

export function inspectSafeDefaultOps(env: Record<string, string | undefined>): SafeDefaultOps {
  return {
    jwtFallback: filled(env, "SUPABASE_JWT_SECRET") ? "hs256-fallback-set" : "jwks-only",
    noticeSmtp: inspectNoticeSmtp(env),
    railDronOrigins: filled(env, "RAIL_DRON_ORIGINS") ? "allowlist-set" : "native-no-cors",
    superAdmin: filled(env, "SUPER_ADMIN_USER_ID") ? "configured" : "nobody-is-admin",
    devlabsPepper: filled(env, "DEVLABS_KEY_PEPPER") ? "configured" : "dev-default",
    authRedirectPaths: AUTH_DASHBOARD_REDIRECT_PATHS,
    appUrlClass: classifyAppUrl(env.NEXT_PUBLIC_APP_URL),
    llm: {
      gemini: filled(env, "GEMINI_API_KEY"),
      openai: filled(env, "OPENAI_API_KEY"),
      anthropic: filled(env, "ANTHROPIC_API_KEY"),
    },
    rateLimitStore: "in-process-single-node",
    hosting: env.VERCEL?.trim() === "1" || filled(env, "VERCEL_ENV") ? "vercel" : "unspecified",
  };
}

function yesNo(value: boolean): "evet" | "hayır" {
  return value ? "evet" : "hayır";
}

export function extraProductionBlocks(
  env: Record<string, string | undefined>,
): readonly string[] {
  if (env.NODE_ENV !== "production") {
    return [];
  }
  const { database, direct } = inspectPostgresOps(env);
  const blocking: string[] = [];
  for (const row of [database, direct]) {
    if (!row.present) {
      continue;
    }
    if (row.transactionModeForbidden) {
      blocking.push(
        `${row.name} transaction-mode/havuz (:${FORBIDDEN_POOLER_PORT} veya pooler.supabase.com) — Direct :${DIRECT_POSTGRES_PORT} gerekir.`,
      );
    } else if (row.hostClass === "loopback") {
      blocking.push(
        `${row.name} loopback (lab) — üretim Direct db.<ref>.supabase.co:${DIRECT_POSTGRES_PORT} ister. yetkin_rail_lab production .env'e yapışmaz.`,
      );
    } else if (row.hostClass === "unparseable") {
      blocking.push(`${row.name} URI parse edilemedi — Direct session-mode beklenir.`);
    }
  }
  const paytr = inspectPaytrOps(env);
  if (paytr.triple === "configured" && paytr.sandboxSet) {
    blocking.push("PAYTR_SANDBOX üretimde dolu — throw; CREDIT yok.");
  }
  if (paytr.triple === "configured" && paytr.mockCheckoutSet) {
    blocking.push("PAYTR_ALLOW_MOCK_CHECKOUT üretimde dolu — throw; CREDIT yok.");
  }
  if (
    paytr.triple === "configured" &&
    (paytr.appUrlClass === "unconfigured" ||
      paytr.appUrlClass === "unparseable" ||
      paytr.appUrlClass === "localhost" ||
      paytr.appUrlClass === "http-public")
  ) {
    blocking.push(
      "NEXT_PUBLIC_APP_URL üretimde https genel köken ister (localhost / http Bildirim URL'yi kırar).",
    );
  }
  if (paytr.triple === "configured" && !paytr.webhookIpAllowlistSet) {
    blocking.push(
      "PAYTR_WEBHOOK_IP_ALLOWLIST üretimde zorunlu — boş liste HMAC-only lab içindir; IP spoof ile webhook açılmaz.",
    );
  }
  return blocking;
}

export function formatPostgresLine(row: PostgresUrlOps): string {
  if (!row.present) {
    return `${row.name}=unconfigured`;
  }
  const mode = row.sessionMode
    ? "session-mode"
    : row.transactionModeForbidden
      ? "transaction-mode-YASAK"
      : "port-belirsiz";
  const protocol = row.okForDirectProtocol ? "direct-ok" : "direct-fail";
  return `${row.name} host=${row.hostClass} port=${row.port ?? "?"} ${mode} ${protocol}`;
}

export function formatPaytrLines(paytr: PaytrOps): string[] {
  return [
    `paytrTriple=${paytr.triple} sandboxSet=${paytr.sandboxSet ? "evet" : "hayır"} mockCheckoutSet=${paytr.mockCheckoutSet ? "evet" : "hayır"}`,
    `paytrWebhookPath=${paytr.webhookPath} ipAllowlistSet=${paytr.webhookIpAllowlistSet ? "evet" : "hayır"}`,
    `paytrAppUrl=${paytr.appUrlClass} (iFrame yetkisi panel; env yok)`,
  ];
}

export function formatHealthSimLines(sim: HealthSimulation): string[] {
  return [
    `GET /api/health simülasyon (ping=${sim.ping}):`,
    `  checks.db=${sim.checks.db}`,
    `  checks.supabaseAuth=${sim.checks.supabaseAuth}`,
    `  checks.inngest=${sim.checks.inngest}`,
    `  checks.payments=${sim.checks.payments}`,
    `  inngestServeMode=${sim.inngestServeMode} serveFailClosed=${sim.inngestServeFailClosed ? "evet" : "hayır"}`,
    `  ${sim.note}`,
  ];
}

export function formatSafeDefaultLines(ops: SafeDefaultOps): string[] {
  const smtp = ops.noticeSmtp;
  const llm = ops.llm;
  const lines = [
    "OPS-4 Güvenli varsayılanlar (sır yok; boş = dürüst kapalı):",
    `  devlabsPepper=${ops.devlabsPepper} (donmuş oda; üretim bloğu değil; kod varsayılanını env'e yapıştırma)`,
    `  jwtFallback=${ops.jwtFallback} (boş = JWKS-only; HS256 token düşer)`,
    `  noticeSmtp=${smtp.mode} host=${yesNo(smtp.host)} port=${yesNo(smtp.port)} user=${yesNo(smtp.user)} pass=${yesNo(smtp.pass)} from=${yesNo(smtp.mailFrom)} (boşsa nakit durmaz; piyasa kör)`,
    `  railDronOrigins=${ops.railDronOrigins} (üretim doğru varsayılan: native-no-cors)`,
    `  superAdmin=${ops.superAdmin}`,
    `  authRedirects=${ops.authRedirectPaths.join(" ")} originClass=${ops.appUrlClass} (Dashboard Redirect URLs; origin basılmaz)`,
    `  llm gemini=${yesNo(llm.gemini)} openai=${yesNo(llm.openai)} anthropic=${yesNo(llm.anthropic)}`,
    "OPS-5 Hız tavanı (lansman kararı 19 Ağustos 2026):",
    `  rateLimitStore=${ops.rateLimitStore} hosting=${ops.hosting}`,
    "  Faz 1: tek Node next start. Vercel/Cloud çok instance sessiz delik — store taşınmadan açılmaz.",
  ];
  if (ops.hosting === "vercel") {
    lines.push(
      "  UYARI: VERCEL algılandı — süreç-içi kota replica'lar arasında paylaşılmaz.",
    );
  }
  if (ops.railDronOrigins === "allowlist-set") {
    lines.push(
      "  UYARI: RAIL_DRON_ORIGINS dolu — üretim/Closed Testing varsayılanı boş (CORS yok).",
    );
  }
  return lines;
}

/** Super Admin kontrol listesi — sır yok; canlı DB/PayTR paneli açılmaz. */
export function formatSuperAdminChecklistLines(
  env: Record<string, string | undefined>,
): string[] {
  const report = evaluateRuntimeReadiness(env);
  const smtp = inspectNoticeSmtp(env);
  const paytr = inspectPaytrOps(env);
  const serveMode = resolveInngestServeMode(env);
  const lines = [
    "OPS-6 Super Admin kontrol listesi (Sıra 7 — Merchant mühürü öncesi):",
    `  [ ] Inngest: serve=${serveMode} (üretim fail-closed=503; EVENT_KEY yoksa webhook defer 503, SDK crash yok)`,
    `  [ ] SMTP: mode=${smtp.mode} (honest-skip/partial → mail atlanır, nakit durmaz; partial host+from tamamla veya boşalt)`,
    `  [ ] npm run ops:runtime-readiness → çıkış ${runtimeReadinessExitCode(report) === 0 ? "0 (beklenen lab)" : "1 (üretim bloğu)"}`,
    "  [ ] npm run ops:ghost-wallet-holds — PENDING wallet_id / ledger DEBIT hayalet sayımı (CREDIT yazmaz)",
    "  [ ] P3 DROP disk: prisma/migrations/20260822010000_drop_frozen_room_tables/migration.sql DROP TABLE mühürlü",
    `  [ ] PayTR üretim flag: sandboxSet=${paytr.sandboxSet ? "evet" : "hayır"} mockCheckoutSet=${paytr.mockCheckoutSet ? "evet" : "hayır"} (üretimde ikisi de yasak)`,
    "  [ ] Merchant lab iskeleti: vitest merchant-academy-lab + ops:t3-academy-loop (canlı panel ayrı idari kapı)",
    "  [ ] Split stub: beginHold/settle not_configured — Freelancer kazanç mühürü bu pakette verilmez",
  ];
  if (smtp.mode === "partial") {
    lines.push(
      "  UYARI: SMTP partial — NOTICE_SMTP_HOST + NOTICE_MAIL_FROM birlikte veya ikisi de boş olmalı.",
    );
  }
  if (report.production && report.inngestServeFailClosed) {
    lines.push("  BLOK: üretimde Inngest serve fail-closed — valör/TTL durur.");
  }
  return lines;
}

export function formatFullRuntimeReadiness(env: Record<string, string | undefined>): {
  report: RuntimeReadinessReport;
  extraBlocking: readonly string[];
  body: string;
  exitCode: number;
} {
  const report = evaluateRuntimeReadiness(env);
  const extraBlocking = extraProductionBlocks(env);
  const postgres = inspectPostgresOps(env);
  const paytr = inspectPaytrOps(env);
  const health = simulateHealthEnv(env);
  const safeDefaults = inspectSafeDefaultOps(env);

  const lines = [
    formatRuntimeReadiness(report),
    "",
    "OPS-1 Database (sır yok, ping yok):",
    formatPostgresLine(postgres.database),
    formatPostgresLine(postgres.direct),
    `beklenen Direct/session port=${DIRECT_POSTGRES_PORT}; yasak pooler port=${FORBIDDEN_POOLER_PORT}`,
    "",
    "OPS-2 PayTR (webhook + iFrame kök):",
    ...formatPaytrLines(paytr),
    "",
    "OPS-3 Inngest (health simülasyon):",
    ...formatHealthSimLines(health),
    "",
    ...formatSafeDefaultLines(safeDefaults),
    "",
    ...formatSuperAdminChecklistLines(env),
  ];

  if (extraBlocking.length > 0) {
    lines.push("", "Ek üretim bloğu (ops script):");
    for (const row of extraBlocking) {
      lines.push(`- ${row}`);
    }
  }

  const kernelCode = runtimeReadinessExitCode(report);
  const extraCode = extraBlocking.length > 0 ? 1 : 0;
  const exitCode = kernelCode !== 0 || extraCode !== 0 ? 1 : 0;

  return { report, extraBlocking, body: lines.join("\n"), exitCode };
}
