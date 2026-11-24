import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import {
  POOL_STORE_NAME,
  commerceLicenseActivateHref,
  commercePlanOpenAmounts,
  formatCommercePlanPriceRibbon,
  isCriticalStock,
  isHighStock,
  nextApprovedQty,
  parseOsTab,
  pickPoolStore,
} from "@/lib/commerce/os-rules";

const ROOT = process.cwd();

describe("e-ticaret kokpit kuralları", () => {
  it("taslak onaylı stoğu değiştirmez; satış eksiye inmez", () => {
    expect(nextApprovedQty(4, "INBOUND_DRAFT", 3)).toBe(4);
    expect(nextApprovedQty(4, "INBOUND_APPROVED", 3)).toBe(7);
    expect(nextApprovedQty(4, "CHANNEL_SALE", 3)).toBe(1);
    expect(nextApprovedQty(2, "CHANNEL_SALE", 3)).toBeNull();
    expect(nextApprovedQty(2, "RETURN_RESTOCK", 3)).toBe(5);
    expect(isCriticalStock(2, 5)).toBe(true);
    expect(isCriticalStock(2, 0)).toBe(false);
    expect(isHighStock(6, 5)).toBe(true);
    expect(isHighStock(5, 5)).toBe(false);
    expect(isHighStock(10, 0)).toBe(true);
    expect(parseOsTab("kanallar")).toBe("kanallar");
    expect(parseOsTab(undefined)).toBe("havuz");
    expect(pickPoolStore([{ name: "Diğer" }, { name: POOL_STORE_NAME }])?.name).toBe(POOL_STORE_NAME);
  });

  it("şema, migration ve kokpit yüzeyi stok defterini taşır", () => {
    const schema = readFileSync(join(ROOT, "prisma/schema/commerce.prisma"), "utf8");
    const sql = readFileSync(join(ROOT, "prisma/migrations/20261116090000_commerce_os_cockpit/migration.sql"), "utf8");
    const page = readFileSync(join(ROOT, "app/(kernel)/panel/e-ticaret/page.tsx"), "utf8");
    const ui = readFileSync(join(ROOT, "components/commerce/os-cockpit.tsx"), "utf8");
    expect(schema).toContain("approvedStockQty");
    expect(schema).toContain("model StockLedger");
    expect(schema).toContain("model SalesChannel");
    expect(schema).toContain("INBOUND_DRAFT");
    expect(schema).toContain("OWN_STORE");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("stock_ledgers is append-only");
    expect(RLS_FORCE_TABLES).toContain("stock_ledgers");
    expect(RLS_FORCE_TABLES).toContain("sales_channels");
    expect(RLS_FORCE_TABLES).toContain("commerce_inbox_entries");
    expect(page).toContain("requirePageSession");
    expect(ui).toContain("Ürün & Stok Havuzu");
    expect(ui).toContain("Kanallar & Eşitleme");
    expect(ui).toContain("Sipariş & Gelen Kutusu");
    expect(ui).toContain("Kâr & Büyüme");
    expect(ui).toContain("ProfitEnginesPanel");
    expect(RLS_FORCE_TABLES).toContain("commerce_unit_economics");
    expect(RLS_FORCE_TABLES).toContain("commerce_bundle_proposals");
    expect(RLS_FORCE_TABLES).toContain("commerce_daily_briefs");
    expect(ui).toContain("+ Stok Gir");
    expect(ui).toContain("Onayla ve Kanallara Yay");
    expect(ui).toContain("Bağlı Kanallara Kuyruk Yaz");
    expect(ui).toContain("AI Yanıt Öner");
    expect(ui).toContain("Onayla ve Kanala Gönder");
    expect(ui).toContain("SHOW_SIMULATION_CONTROLS");
    expect(ui).toContain("Örnek Müşteri Sorusu Simüle Et (Trendyol)");
    expect(ui).toContain("Otonom Reklam Paketi Oluştur");
    expect(ui).toContain("Örnek Kanal Siparişi Simüle Et (Trendyol -1 Adet)");
    expect(ui).toContain('process.env.NODE_ENV !== "production"');
    expect(ui).toContain("Trendyol ve Hepsiburada");
    expect(ui).not.toContain("Amazon, N11");
    expect(ui).toContain("Paket senin Kariyer çalışma odana yazılır");
    expect(ui).toContain("ProductCardStudio");
    expect(ui).not.toContain('tezgahToolHref("ecommerce")');
    const studio = readFileSync(join(ROOT, "components/commerce/product-card-studio.tsx"), "utf8");
    expect(studio).toContain('"/api/tezgah/generate"');
    expect(studio).toContain('tool: "ecommerce"');
    expect(studio).toContain('action: "pool"');
    expect(studio).toContain("Havuza kaydet");
  });

  it("lisans şeridi üç kademeli güncel fiyatı basar; eski ₺1.490 / monthly yok", () => {
    const amounts = commercePlanOpenAmounts();
    expect(amounts).toEqual({ starter: 199_000, growth: 399_000, scale: 799_000 });
    const ribbon = formatCommercePlanPriceRibbon(amounts);
    expect(ribbon).toBe("Başlangıç ₺1.990 • Büyüme ₺3.990 • Kurumsal ₺7.990 / Ay");
    expect(ribbon).not.toContain("1.490");
    expect(commerceLicenseActivateHref("store_1")).toBe("/magazam/store_1/lisans");
    expect(commerceLicenseActivateHref(null)).toBe("/magazam/yeni");
    const ui = readFileSync(join(ROOT, "components/commerce/os-cockpit.tsx"), "utf8");
    expect(ui).toContain("İlk 30 gün ücretsiz, ardından");
    expect(ui).toContain("Lisansı Aktifleştir →");
    expect(ui).toContain("data-license-activate");
    expect(ui).not.toContain("149000");
    expect(ui).not.toContain("1.490");
    const band = readFileSync(join(ROOT, "lib/commerce/os-license-band.ts"), "utf8");
    expect(band).toContain('findActiveEntry("commerce", "starter")');
    expect(band).toContain('findActiveEntry("commerce", "growth")');
    expect(band).toContain('findActiveEntry("commerce", "scale")');
    expect(band).not.toContain("readCommerceMonthlyAmount");
    expect(band).not.toContain("149000");
    const load = readFileSync(join(ROOT, "lib/commerce/os-load.ts"), "utf8");
    expect(load).toContain("planCode: true");
    expect(load).toContain("commercePlanTitle");
  });
});

