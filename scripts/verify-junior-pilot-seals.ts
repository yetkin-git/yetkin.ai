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

must("lib/kernel/compliance/circuit-breakers.ts", 'DRON_JUNIOR_OPEN_ENV = "DRON_JUNIOR_OPEN"', "bayrak adı");
must("lib/kernel/compliance/circuit-breakers.ts", "JUNIOR_PRODUCTION_LOCKED = true", "üretim kilidi");
must("lib/kernel/compliance/circuit-breakers.ts", "export function isDronJuniorOpen", "bayrak okuyucusu");
must("lib/kernel/compliance/circuit-breakers.ts", "export function isJuniorSurfaceLocked", "para kilidi");
must("lib/kernel/security/edge-guard.ts", "isJuniorClosedPilotPath(pathname)", "liste açık");
must("lib/kernel/security/edge-guard.ts", 'kind: "frozen-410"', "donmuş oda 410");
must("lib/kernel/security/edge-api-auth.ts", "isJuniorPaidActionApiPath", "anlatış kenarı");
must("lib/junior/paytr.ts", "juniorPaytrCredentialsAllowSale", "canlı anahtar kapısı");
must("lib/junior/paytr.ts", 'merchantId === "000000"', "deneme mağaza");
must("lib/junior/limits.ts", "JUNIOR_QUIZ_PREPARING_LABEL", "hazırlık etiketi");
must("lib/junior/catalog.ts", "export function juniorFreeLessonKeys", "ücretsiz liste");
must("lib/kernel/security/edge-api-auth.ts", "isJuniorPilotApiPath", "API kenarı");
must("lib/junior/checkout.ts", 'error: JUNIOR_CHECKOUT_NOT_CONFIGURED', "kasa 503");
must("lib/junior/checkout.ts", 'JUNIOR_CHECKOUT_NOT_CONFIGURED = "not_configured"', "not_configured");
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
must("lib/junior/guardian-notice.ts", "JUNIOR_GUARDIAN_NOTICE: JuniorGuardianNotice | null = null", "sahte sürüm yok");
must("lib/junior/service.ts", "juniorLessonConsentBlock(profile, JUNIOR_GUARDIAN_NOTICE)", "ders kapısı");
mustNot("components/junior/maarif-seal.tsx", "%100 Uygun", "dayanaksız uygunluk");
mustNot("components/junior/maarif-seal.tsx", "Maarif Mührü", "dayanaksız mühür");
mustNot("components/junior/maarif-seal.tsx", "5.000 TL", "dayanaksız bant");
mustNot("components/junior/junior-room.tsx", "MaarifSealLabel", "mühür etiketi");
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

if (issues.length > 0) {
  console.error(["verify:junior-pilot-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"));
  process.exit(1);
}

console.log("verify:junior-pilot-seals OK — Junior listesi açık, kasa not_configured, anlatış paket ister.");
