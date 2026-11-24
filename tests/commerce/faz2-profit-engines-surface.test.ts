import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";

const ROOT = process.cwd();

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const ECONOMY_TABLES = [
  "commerce_unit_economics",
  "commerce_shipping_tariffs",
  "commerce_channel_economics",
  "commerce_campaign_simulations",
  "commerce_bundle_proposals",
  "commerce_daily_briefs",
  "commerce_profit_actions",
  "commerce_catalog_gap_signals",
  "commerce_product_suggestions",
] as const;

const ROUTES = [
  "app/api/commerce/stores/[storeId]/economics/route.ts",
  "app/api/commerce/stores/[storeId]/campaigns/simulate/route.ts",
  "app/api/commerce/stores/[storeId]/campaigns/route.ts",
  "app/api/commerce/stores/[storeId]/bundles/propose/route.ts",
  "app/api/commerce/stores/[storeId]/bundles/route.ts",
  "app/api/commerce/stores/[storeId]/bundles/[id]/accept/route.ts",
  "app/api/commerce/stores/[storeId]/bundles/[id]/route.ts",
  "app/api/commerce/stores/[storeId]/briefs/today/route.ts",
  "app/api/commerce/stores/[storeId]/actions/[id]/apply/route.ts",
  "app/api/commerce/stores/[storeId]/radar/scan/route.ts",
  "app/api/commerce/stores/[storeId]/radar/route.ts",
] as const;

describe("Faz 2 — kâr motorları yüzeyi", () => {
  it("şema ekonomi katmanını taşır; stock_ledgers'a ciro yazılmaz kuralı durur", () => {
    const schema = read("prisma/schema/commerce.prisma");
    expect(schema).toContain("model CommerceUnitEconomics");
    expect(schema).toContain("model CommerceShippingTariff");
    expect(schema).toContain("model CommerceChannelEconomics");
    expect(schema).toContain("model CommerceCampaignSimulation");
    expect(schema).toContain("model CommerceBundleProposal");
    expect(schema).toContain("model CommerceDailyBrief");
    expect(schema).toContain("model CommerceProfitAction");
    expect(schema).toContain("model CommerceCatalogGapSignal");
    expect(schema).toContain("model CommerceProductSuggestion");
    expect(schema).toContain("stock_ledgers");
    expect(schema).toContain("ciro yazılmaz");
    expect(schema).toContain('@@map("stock_ledgers")');
  });

  it("migration FORCE RLS + rls_deny_unscoped üretir", () => {
    const sql = read("prisma/migrations/20261122230000_faz2_commerce_economics/migration.sql");
    for (const table of ECONOMY_TABLES) {
      expect(sql).toContain(table);
      expect(RLS_FORCE_TABLES).toContain(table);
    }
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
  });

  it("tüm yeni rotalar session auth beyan eder", () => {
    for (const route of ROUTES) {
      expect(existsSync(join(ROOT, route))).toBe(true);
      const source = read(route);
      expect(source).toContain('export const auth = "session"');
    }
  });

  it("AI_TOKEN_SOURCES.COMMERCE vardır; yanıt taslağı commerce kaynağını kullanır", () => {
    expect(AI_TOKEN_SOURCES.COMMERCE).toBe("commerce");
    const os = read("lib/commerce/os-service.ts");
    expect(os).toContain("AI_TOKEN_SOURCES.COMMERCE");
    expect(read("lib/commerce/campaign-engine.ts")).toContain("AI_TOKEN_SOURCES.COMMERCE");
    expect(read("lib/commerce/bundle-engine.ts")).toContain("AI_TOKEN_SOURCES.COMMERCE");
  });

  it("Inngest sabah 07:00 commerce-daily-brief cron'unu taşır", () => {
    const jobs = read("lib/kernel/jobs/inngest.ts");
    expect(jobs).toContain('id: "commerce-daily-brief"');
    expect(jobs).toContain("TZ=Europe/Istanbul 0 7 * * *");
    expect(jobs).toContain("commerceDailyBrief");
    expect(jobs).toContain("runCommerceDailyBriefScan");
  });

  it("kokpit kâr paneli ve vitrin canlı motorları taşır", () => {
    expect(read("components/commerce/os-cockpit.tsx")).toContain("ProfitEnginesPanel");
    expect(read("components/commerce/profit-engines-panel.tsx")).toContain("Barem kırıcı paketler");
    expect(read("components/commerce/profit-engines-panel.tsx")).toContain("Kâr korumalı indirim");
    const vitrine = read("app/(public)/e-ticaret/page.tsx");
    expect(vitrine).toContain("PROFIT_ENGINES");
    expect(vitrine).not.toContain("Henüz canlı değil");
  });

  it("saf kâr çekirdeği DB import etmez", () => {
    const profit = read("lib/commerce/profit.ts");
    expect(profit).not.toMatch(/prisma|getPrisma|server-only/i);
    expect(profit).toContain("calculateUnitNet");
    expect(profit).toContain("simulateCampaign");
    expect(profit).toContain("evaluateBundleOpportunity");
  });
});
