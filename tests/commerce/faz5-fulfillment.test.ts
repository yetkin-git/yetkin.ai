import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { encodeCode128B, renderCode128Svg } from "@/lib/commerce/barcode-svg";
import {
  buildPickList,
  draftFromChannelEvent,
  draftFromMarketplacePackage,
  parseLabelSettings,
  planFulfillmentStatus,
  queueCargoNotice,
} from "@/lib/commerce/fulfillment-rules";
import {
  assertCommerceFeature,
  assertSkuCapacity,
  assertStoreCapacity,
  COMMERCE_PLANS,
  normalizeCommercePlan,
} from "@/lib/commerce/plan-gates";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";

const ROOT = process.cwd();

describe("Faz 5 — barkod, sipariş masası ve plan kapısı", () => {
  it("Code 128B checksum ve SVG sessiz bölge üretir", () => {
    const encoded = encodeCode128B("BAR");
    expect(encoded?.checksum).toBe(45);
    expect(encoded?.codes[0]).toBe(104);
    expect(encoded?.codes.at(-1)).toBe(106);
    const svg = renderCode128Svg("BAR");
    expect(svg).toContain("fill=\"#000\"");
    expect(svg).toContain("fill=\"#fff\"");
    expect(svg).toContain("aria-label=\"BAR\"");
    expect(renderCode128Svg("")).toBeNull();
    expect(renderCode128Svg("türkçe")).toBeNull();
    expect(renderCode128Svg("BAR")).toBe(svg);
  });

  it("durum makinesi hazırlık ve kargo kodu ister", () => {
    const now = new Date("2026-11-23T12:00:00.000Z");
    const prepared = planFulfillmentStatus({
      from: "NEW",
      to: "PREPARED",
      cargoTrackingCode: "",
      now,
      labelPrintedAt: null,
      shippedAt: null,
    });
    expect(prepared.ok).toBe(true);
    const skipped = planFulfillmentStatus({
      from: "NEW",
      to: "SHIPPED",
      cargoTrackingCode: "TRK12345",
      now,
      labelPrintedAt: null,
      shippedAt: null,
    });
    expect(skipped.ok).toBe(false);
    const shipped = planFulfillmentStatus({
      from: "PREPARED",
      to: "SHIPPED",
      cargoTrackingCode: "TRK12345",
      now,
      labelPrintedAt: now,
      shippedAt: null,
    });
    expect(shipped.ok).toBe(true);
    if (shipped.ok) {
      expect(shipped.shippedAt).toBe(now);
    }
    const notice = queueCargoNotice("TRENDYOL", "TRK12345");
    expect(notice.queued).toBe(true);
    expect(notice.message).toContain("Trendyol");
  });

  it("pazar yeri çekimi ve kanal olayı NEW taslak üretir; depo listesi SKU toplar", () => {
    const now = new Date("2026-11-23T12:00:00.000Z");
    const draft = draftFromMarketplacePackage({
      storeId: "store-1",
      channel: "HEPSIBURADA",
      externalOrderNo: "1001",
      statusText: "open",
      lines: [{ barcode: "SKU-1", quantity: 2 }],
      now,
    });
    expect(draft.status).toBe("NEW");
    expect(draft.items[0]?.sku).toBe("SKU-1");
    const channel = draftFromChannelEvent({
      storeId: "store-1",
      channel: "TRENDYOL",
      externalOrderId: "SIM-1",
      sku: "KUPA",
      variantSku: "KUPA-M",
      quantity: 1,
      customerLabel: "Simülasyon",
      eventType: "ORDER_CREATED",
      now,
    });
    expect(channel?.status).toBe("NEW");
    expect(channel?.customerName).toBe("Simülasyon");
    const pick = buildPickList([
      { items: [{ sku: "SKU-1", title: "Kupa", variant: "M", quantity: 1 }] },
      { items: [{ sku: "SKU-1", title: "Kupa", variant: "M", quantity: 2 }] },
    ]);
    expect(pick).toEqual([{ sku: "SKU-1", title: "Kupa", variant: "M", quantity: 3 }]);
  });

  it("etiket ayarı https logo ister", () => {
    expect(
      parseLabelSettings({ senderTitle: "Yetkin Mağaza", logoUrl: "http://logo.example/a.png" }).ok,
    ).toBe(false);
    const ok = parseLabelSettings({
      senderTitle: "Yetkin Mağaza",
      senderPhone: "905551112233",
      senderAddress: "İstanbul",
      logoUrl: "https://cdn.example/logo.png",
    });
    expect(ok.ok).toBe(true);
  });

  it("STARTER rekabet motorunu ve ikinci mağazayı 403 ile keser", () => {
    expect(assertCommerceFeature("STARTER", "repricer")).toMatchObject({ ok: false, status: 403 });
    expect(assertCommerceFeature("GROWTH", "repricer").ok).toBe(true);
    expect(assertCommerceFeature("STARTER", "bulkLabel")).toMatchObject({ ok: false, status: 403 });
    expect(assertCommerceFeature("SCALE", "bulkLabel").ok).toBe(true);
    expect(assertCommerceFeature("GROWTH", "competitorFeed")).toMatchObject({ ok: false, status: 403 });
    expect(assertStoreCapacity("STARTER", 1)).toMatchObject({ ok: false, status: 403 });
    expect(assertStoreCapacity("STARTER", 0).ok).toBe(true);
    expect(assertStoreCapacity("GROWTH", 3)).toMatchObject({ ok: false, status: 403 });
    expect(assertStoreCapacity("SCALE", 40).ok).toBe(true);
    expect(assertSkuCapacity("STARTER", 250).ok).toBe(false);
    expect(normalizeCommercePlan(null)).toBe("GROWTH");
    expect(COMMERCE_PLANS.map((plan) => plan.listPriceMinor)).toEqual([199_000, 399_000, 799_000]);
  });

  it("rota, RLS ve göç kapıları sipariş masasını taşır", () => {
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/orders"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/orders/[orderId]/status"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/orders/bulk-label"]).toBe("session");
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/label-settings"]).toBe("session");
    for (const path of [
      "/api/commerce/stores/[storeId]/orders/[orderId]/status",
      "/api/commerce/stores/[storeId]/orders/bulk-label",
      "/api/commerce/stores/[storeId]/label-settings",
    ]) {
      const row = WEB_ONLY_WRITE_ROUTES.find((item) => item.path === path);
      expect(row?.status).toBe("product-write");
      expect(row?.note).toContain("Cüzdan yazılmaz");
    }
    expect(RLS_FORCE_TABLES).toContain("commerce_fulfillment_orders");
    const sql = readFileSync(
      join(ROOT, "prisma/migrations/20261123180000_faz5_fulfillment_orders/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("USING (false)");
    expect(sql).toContain("199000");
    expect(sql).toContain("399000");
    expect(sql).toContain("799000");
    const handlers = readFileSync(join(ROOT, "lib/commerce/fulfillment-handlers.ts"), "utf8");
    expect(handlers).toContain("requireRailV1IdempotencyKey");
    const orders = readFileSync(join(ROOT, "app/api/commerce/stores/[storeId]/orders/route.ts"), "utf8");
    expect(orders).toContain('export const auth = "session"');
  });
});
