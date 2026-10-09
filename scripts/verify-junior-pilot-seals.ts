#!/usr/bin/env tsx
/**
 * Canlı Junior pilot mührü. Arşivdeki vekâlet motorunu denetlemez.
 * Bayrak varsayılan kapalı, kasa not_configured, quiz modu diskte.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const issues: string[] = [];

function read(relative: string): string {
  const path = join(ROOT, relative);
  if (!existsSync(path)) {
    issues.push(`yok: ${relative}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function must(relative: string, needle: string, label: string) {
  if (!read(relative).includes(needle)) {
    issues.push(`${relative}: ${label}`);
  }
}

function mustNot(relative: string, needle: string, label: string) {
  if (read(relative).includes(needle)) {
    issues.push(`${relative}: ${label}`);
  }
}

must("lib/kernel/security/junior-gate.ts", 'DRON_JUNIOR_OPEN_ENV = "DRON_JUNIOR_OPEN"', "bayrak adı");
must("lib/kernel/security/junior-gate.ts", "export function canEnterJunior", "tek kapı");
must("lib/kernel/security/junior-gate.ts", "export function isJuniorCheckoutLocked", "kasa kapısı");
must("lib/kernel/security/junior-gate.ts", "JUNIOR_BETA_ALLOWLIST_ENV", "izin listesi");
mustNot("lib/kernel/compliance/circuit-breakers.ts", "JUNIOR_PRODUCTION_LOCKED = true", "derleme kilidi yok");
must("lib/kernel/compliance/circuit-breakers.ts", "export function isJuniorSurfaceLocked", "profil masası");
must("lib/kernel/security/edge-guard.ts", 'canEnterJunior(null, null, { intent: "vitrine" })', "liste açık");
must("lib/kernel/security/edge-guard.ts", 'kind: "frozen-410"', "donmuş oda 410");
must("lib/kernel/security/edge-api-auth.ts", "isJuniorPaidActionApiPath", "anlatış kenarı");
must("lib/junior/paytr.ts", "juniorPaytrCredentialsAllowSale", "canlı anahtar kapısı");
must("lib/junior/paytr.ts", 'merchantId === "000000"', "deneme mağaza");
must("lib/junior/paytr.ts", "buildPaytrTokenHash", "kernel iFrame hash");
mustNot("lib/junior/paytr.ts", "JUNIOR_PAYTR_TEST_CREDENTIALS", "deneme üçlüsü yok");
mustNot("lib/junior/paytr.ts", "directToken", "Direct HMAC yok");
must("lib/junior/paytr-license-bridge.ts", "junior-license:yearly", "lisans niyeti");
must("app/api/(kernel)/payments/webhooks/paytr/route.ts", "registerPaytrJuniorLicenseHook", "webhook kaydı");
must("lib/junior/limits.ts", "JUNIOR_QUIZ_PREPARING_LABEL", "hazırlık etiketi");
mustNot("lib/junior/limits.ts", "549_900", "fiyat sabiti yok");
mustNot("lib/junior/limits.ts", "5.499 TL", "fiyat metni yok");
must("lib/junior/price.ts", "cat_junior_yearly", "katalog kimliği");
must("lib/junior/price.ts", "readJuniorYearlyPrice", "katalog okuması");
must("lib/junior/catalog.ts", "export function juniorFreeLessonKeys", "ücretsiz liste");
must("lib/kernel/security/edge-api-auth.ts", "isJuniorPilotApiPath", "API kenarı");
must("lib/junior/checkout.ts", "JUNIOR_CHECKOUT_GUARDIAN_REQUIRED", "veli tiki");
must("lib/junior/checkout.ts", "JUNIOR_CHECKOUT_NOT_CONFIGURED = \"not_configured\"", "not_configured");
must("lib/junior/checkout.ts", "placeOrder", "sipariş kapısı");
must("lib/junior/checkout-paytr.ts", "JUNIOR_LICENSE_ORDER_PURPOSE", "lisans niyeti");
must("lib/junior/checkout-paytr.ts", "beginCheckout", "get-token");
mustNot("lib/junior/checkout.ts", "chargeJuniorTestPos", "deneme kasası çağrısı yok");
must("lib/junior/plan.ts", 'error: "not_configured"', "üretimde deneme kartı kapalı");
mustNot("components/junior/checkout-form.tsx", 'autoComplete="cc-number"', "PAN alanı yok");
mustNot("components/junior/checkout-form.tsx", "tckn", "TCKN alanı yok");
mustNot("components/junior/checkout-form.tsx", "Güvenlik kodu", "CVC alanı yok");
must(
  "prisma/migrations/20261005140000_junior_progress_quiz_mode/migration.sql",
  "'quiz'",
  "quiz CHECK",
);
must("lib/copy/junior-guardian-notice.ts", "junior-notice-2026-10-09", "veli aydınlatma sürümü");
must("lib/copy/junior-guardian-notice.ts", "juniorGuardianNoticeCanonical", "kanonik metin");
must("lib/junior/guardian-notice.ts", "JUNIOR_GUARDIAN_NOTICE_SHA256", "özet");
must("components/junior/checkout-form.tsx", "CheckoutConsentFields", "mesafeli satış tiki");
must("components/junior/checkout-form.tsx", "JUNIOR_GUARDIAN_NOTICE_HREF", "veli tiki");
must("components/junior/checkout-form.tsx", "if (!consentReady || pending)", "onaysız istek yok");
must("lib/junior/service.ts", "juniorLessonConsentBlock(profile, JUNIOR_GUARDIAN_NOTICE)", "ders kapısı");
mustNot("components/junior/junior-room.tsx", "MaarifSealLabel", "mühür etiketi");
mustNot("components/junior/junior-room.tsx", "MaarifSkillTags", "sahipsiz mühür");
mustNot("components/junior/profile-switcher.tsx", "Raf, yeni sınıfa göre açılır", "yanıltıcı raf");
must("components/junior/profile-switcher.tsx", "JUNIOR_PILOT_SHELF_LINE", "pilot cümlesi");
must("lib/junior/limits.ts", "Bu sınıf yakında gelecektir. Şu an sadece 6. Sınıf Pilot aktiftir.", "pilot cümlesi");
must("lib/junior/memory-port.ts", "junior_progress_shape", "bellek kuralı");
must("lib/junior/memory-port.ts", '"quiz"', "bellek quiz");
must("scripts/ops-migrate-lib.ts", "expectedPrismaMigrations", "migrasyon listesi diskten");
must("scripts/ops-migrate-lib.ts", "PRISMA_MIGRATION_FOLDER_NAME", "migrasyon ad kalıbı");
mustNot("scripts/ops-migrate-lib.ts", "EXPECTED_PRISMA_MIGRATIONS", "elle kilitli liste yok");

const apiDir = join(ROOT, "app", "api", "junior-pilot");
if (!existsSync(apiDir)) {
  issues.push("app/api/junior-pilot yok");
} else {
  const routes = readdirSync(apiDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (routes.length < 7) {
    issues.push(`junior-pilot rota sayısı 7 değil (${routes.length})`);
  }
  const paidRoutes = new Set(["tell", "quiz", "practice"]);
  for (const route of routes) {
    const relative = `app/api/junior-pilot/${route.name}/route.ts`;
    if (paidRoutes.has(route.name)) {
      mustNot(relative, "juniorLockedResponse", "anlatış ve test toptan kilit değil");
      continue;
    }
    must(relative, "juniorLockedResponse", "rota kilidi");
  }
  must("lib/junior/service.ts", "JUNIOR_PAID_ACTION_ERROR", "veli ve paket kapısı");
}

const paytr = join(ROOT, "prisma", "migrations", "20261005093000_junior_paytr_grade_switch", "migration.sql");
if (!existsSync(paytr)) {
  issues.push("20261005093000_junior_paytr_grade_switch diskte yok");
}

export function juniorPilotSealIssues(): readonly string[] {
  return issues;
}

function isDirectPilotSealRun(): boolean {
  const entry = (process.argv[1] ?? "").replace(/\\/g, "/");
  return entry.endsWith("verify-junior-pilot-seals.ts");
}

if (isDirectPilotSealRun()) {
  if (issues.length > 0) {
    console.error(["verify:junior-pilot-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"));
    process.exit(1);
  }
  console.log("verify:junior-pilot-seals OK — Junior listesi açık, kasa onay tikinden sonra iframe, anlatış paket ister.");
}
