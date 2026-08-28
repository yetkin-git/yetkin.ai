#!/usr/bin/env tsx
/**
 * PayTR webhook mutabakat / anomali mühürleri — statik (grep). Canlı Postgres yok.
 * HMAC, üretim IP allowlist, tutar uyuşmazlığında CREDIT yok, gece defter taraması.
 * Davranış testleri package.json zincirinde vitest ile koşar.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

type Needle = { needle: string; label: string };

type FileRule = {
  file: string;
  must: Needle[];
  mustNot?: Needle[];
};

const FILE_RULES: FileRule[] = [
  {
    file: "lib/kernel/payments/anomaly.ts",
    must: [
      { needle: "export async function recordPaymentAnomaly", label: "anomali kaydı" },
      { needle: "paymentAnomalyFingerprint", label: "parmak izi" },
      { needle: "amount_mismatch", label: "tutar uyuşmazlığı türü" },
      { needle: "order_not_found", label: "sipariş yok türü" },
      { needle: "malformed_replay", label: "mükerrer bozuk türü" },
      { needle: "wallet_ledger_drift", label: "defter sapması türü" },
    ],
  },
  {
    file: "lib/kernel/payments/paytr/webhook-settle.ts",
    must: [
      { needle: "export async function settlePaytrWebhookSuccess", label: "settle kapısı" },
      { needle: "recordPaymentAnomaly", label: "anomali yazımı" },
      { needle: "creditApplied: false", label: "mismatch CREDIT yok" },
      { needle: "persist_failed", label: "yazılamazsa retry" },
      { needle: "amount_mismatch", label: "tutar uyuşmazlığı" },
      { needle: "order_not_found", label: "sipariş yok" },
    ],
    mustNot: [
      { needle: "paytr.webhook.skipped", label: "sessiz skip ACK yok" },
    ],
  },
  {
    file: "lib/kernel/payments/paytr/webhook.ts",
    must: [
      { needle: "export function isPaytrWebhookIpAllowlistRequired", label: "üretim allowlist kapısı" },
      { needle: 'env.NODE_ENV === "production"', label: "üretim zorunluluğu" },
      { needle: "resolveTrustedForwardedIp", label: "trusted-proxy IP" },
      { needle: "verifyPaytrWebhookHash", label: "HMAC" },
    ],
  },
  {
    file: "app/api/(kernel)/payments/webhooks/paytr/route.ts",
    must: [
      { needle: "settlePaytrWebhookSuccess", label: "settle çağrısı" },
      { needle: "anomaly_unacked", label: "persist fail 500" },
      { needle: "isPaytrWebhookSourceIpAllowed", label: "IP allowlist" },
      { needle: "verifyWebhook", label: "HMAC handler" },
    ],
    mustNot: [
      { needle: "paytr.webhook.skipped", label: "sessiz mismatch ACK yok" },
    ],
  },
  {
    file: "lib/kernel/payments/ledger-reconciliation.ts",
    must: [
      { needle: "evaluateWalletLedgerInvariant", label: "cüzdan invariant" },
      { needle: "evaluateClearedPaymentOrderInvariant", label: "CLEARED sipariş uyumu" },
      { needle: "runLedgerReconciliationScan", label: "tarama kapısı" },
      { needle: "wallet_ledger_drift", label: "cüzdan sapması" },
      { needle: "cleared_order_mismatch", label: "CLEARED sapması" },
    ],
    mustNot: [
      { needle: "appendLedgerEntry", label: "tarama CREDIT yazmaz" },
      { needle: "wallet.update", label: "tarama bakiye düzeltmez" },
      { needle: "clearSuccessfulPaymentOrder", label: "tarama kör clearing yok" },
    ],
  },
  {
    file: "lib/kernel/payments/prisma-anomaly-store.ts",
    must: [
      { needle: "paymentAnomaly.create", label: "append insert" },
      { needle: "P2002", label: "parmak izi unique" },
    ],
    mustNot: [
      { needle: "paymentAnomaly.update", label: "anomali update yok" },
      { needle: "paymentAnomaly.delete", label: "anomali delete yok" },
    ],
  },
  {
    file: "lib/kernel/jobs/inngest.ts",
    must: [
      { needle: 'id: "ledger-reconciliation-scan"', label: "gece tarama işi" },
      { needle: "runLedgerReconciliationScan", label: "tarama çağrısı" },
      { needle: "createPrismaPaymentAnomalyStore", label: "valör anomali deposu" },
      { needle: "paytrFailedRecoveryAfter", label: "FAILED recovery tarama" },
    ],
  },
  {
    file: "lib/kernel/payments/paytr/reconcile.ts",
    must: [
      { needle: "late_paid_recovery", label: "geç paid recovery" },
      { needle: "queryPaytrOrderStatus", label: "PSP sorgu" },
      { needle: "amount_mismatch", label: "tutar uyuşmazlığı" },
    ],
  },
  {
    file: "lib/kernel/payments/prisma-order-store.ts",
    must: [
      { needle: "updateMany", label: "CAS updateMany" },
      { needle: 'status: { in: ["PENDING", "FAILED"] }', label: "PAID revive CAS" },
      { needle: 'where: { id, status: "PENDING" }', label: "FAILED yalnız PENDING" },
    ],
  },
  {
    file: "prisma/schema/kernel.prisma",
    must: [
      { needle: "model PaymentAnomaly", label: "PaymentAnomaly modeli" },
      { needle: '@@map("payment_anomalies")', label: "payment_anomalies tablosu" },
      { needle: "fingerprint    String   @unique", label: "parmak izi unique" },
    ],
  },
  {
    file: "tests/kernel/paytr-webhook-security.test.ts",
    must: [
      { needle: "invalid_signature", label: "HMAC testi" },
      { needle: "amount_mismatch", label: "mismatch enjeksiyonu" },
      { needle: "creditApplied", label: "CREDIT yazılmadı assert" },
      { needle: "anomalies.list()", label: "anomali kaydı" },
      { needle: "ip_not_allowed", label: "üretim IP" },
    ],
  },
  {
    file: "tests/kernel/ledger-reconciliation.test.ts",
    must: [
      { needle: "evaluateWalletLedgerInvariant", label: "cüzdan eşitliği" },
      { needle: "evaluateClearedPaymentOrderInvariant", label: "CLEARED uyumu" },
      { needle: "anomaliesWritten", label: "tarama anomali yazımı" },
    ],
  },
];

const REQUIRED_FILES = [
  "tests/kernel/paytr-webhook-security.test.ts",
  "tests/kernel/ledger-reconciliation.test.ts",
  "tests/kernel/paytr-reconciliation-seals-surface.test.ts",
  "tests/kernel/paytr-cas-surface.test.ts",
  "lib/kernel/payments/anomaly.ts",
  "lib/kernel/payments/paytr/webhook-settle.ts",
  "lib/kernel/payments/ledger-reconciliation.ts",
  "prisma/migrations/20260819010000_payment_anomalies/migration.sql",
] as const;

const issues: string[] = [];

function readProjectFile(relPath: string): string | null {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    return null;
  }
  return readFileSync(full, "utf8");
}

for (const rule of FILE_RULES) {
  const raw = readProjectFile(rule.file);
  if (raw === null) {
    issues.push(`${rule.file}: yok`);
    continue;
  }
  for (const item of rule.must) {
    if (!raw.includes(item.needle)) {
      issues.push(`${rule.file}: eksik — ${item.label} (\`${item.needle}\`)`);
    }
  }
  for (const item of rule.mustNot ?? []) {
    if (raw.includes(item.needle)) {
      issues.push(`${rule.file}: yasak — ${item.label} (\`${item.needle}\`)`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!existsSync(join(ROOT, file))) {
    issues.push(`${file}: zorunlu PayTR mutabakat testi/kaynak yok`);
  }
}

const schema = readProjectFile("prisma/schema/kernel.prisma") ?? "";
const anomalyStart = schema.indexOf("model PaymentAnomaly");
const anomalyEnd = schema.indexOf("model PriceCatalogEntry");
if (anomalyStart < 0 || anomalyEnd < 0 || anomalyEnd <= anomalyStart) {
  issues.push("prisma/schema/kernel.prisma: PaymentAnomaly bloğu ayrılamadı");
} else {
  const anomalyBlock = schema.slice(anomalyStart, anomalyEnd);
  if (anomalyBlock.includes("updatedAt")) {
    issues.push("prisma/schema/kernel.prisma: PaymentAnomaly append-only — updatedAt yasak");
  }
}

const pkgRaw = readProjectFile("package.json");
if (pkgRaw === null) {
  issues.push("package.json yok");
} else {
  const pkg = JSON.parse(pkgRaw) as { scripts?: Record<string, string> };
  const scripts = pkg.scripts ?? {};
  const prebuild = scripts["verify:prebuild"] ?? "";
  const nightly = scripts["verify:nightly"] ?? "";
  const seal = scripts["verify:paytr-reconciliation-seals"] ?? "";
  if (prebuild.includes("verify:paytr-reconciliation-seals")) {
    issues.push("package.json verify:prebuild: paytr-reconciliation nightly kovasına taşınır");
  }
  if (!nightly.includes("verify:paytr-reconciliation-seals")) {
    issues.push("package.json verify:nightly: verify:paytr-reconciliation-seals yok");
  }
  const webAt = nightly.indexOf("verify:web-security-seals");
  const paytrAt = nightly.indexOf("verify:paytr-reconciliation-seals");
  const surfaceAt = nightly.indexOf("test:surface");
  if (webAt < 0 || paytrAt < 0 || paytrAt < webAt) {
    issues.push("package.json verify:nightly: paytr-reconciliation web-security'den sonra değil");
  }
  if (surfaceAt < 0 || surfaceAt < paytrAt) {
    issues.push("package.json verify:nightly: paytr-reconciliation surface vitest'ten önce değil");
  }
  if (!seal.includes("scripts/verify-paytr-reconciliation-seals.ts")) {
    issues.push(
      "package.json verify:paytr-reconciliation-seals: scripts/verify-paytr-reconciliation-seals.ts hedefi yok",
    );
  }
  if (!seal.includes("tests/kernel/paytr-webhook-security.test.ts")) {
    issues.push("package.json verify:paytr-reconciliation-seals: webhook güvenlik vitest yok");
  }
  if (!seal.includes("tests/kernel/ledger-reconciliation.test.ts")) {
    issues.push("package.json verify:paytr-reconciliation-seals: defter mutabakat vitest yok");
  }
}

if (issues.length > 0) {
  console.error(
    ["verify:paytr-reconciliation-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join(
      "\n",
    ),
  );
  process.exit(1);
}

console.log(
  "verify:paytr-reconciliation-seals OK — HMAC, üretim IP allowlist, mismatch anomali/CREDIT yok, gece defter taraması kilitli.",
);
