import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import {
  POOL_STORE_NAME,
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
    const page = readFileSync(join(ROOT, "app/(kernel)/e-ticaret/page.tsx"), "utf8");
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
    expect(ui).toContain("Otonom Büyüme & Uzman");
    expect(ui).toContain("+ Stok Gir");
    expect(ui).toContain("Onayla ve Kanallara Yay");
    expect(ui).toContain("Tek Tıkla Tüm Kataloğu Eşitle");
    expect(ui).toContain("AI Yanıt Öner");
    expect(ui).toContain("Onayla ve Kanala Gönder");
    expect(ui).toContain("Örnek Müşteri Sorusu Simüle Et (Trendyol)");
    expect(ui).toContain("Otonom Reklam Paketi Oluştur");
    expect(ui).toContain("Örnek Kanal Siparişi Simüle Et (Trendyol -1 Adet)");
  });
});
