import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { NOTICE_SEN } from "@/lib/copy/sen-voice/notice";
import {
  bundleCostMinor,
  bundleDesiGrams,
  bundleMembersAttribute,
  bundleVatBps,
  ean13CheckDigit,
  readBundleMembers,
  setBarcode,
  setSku,
} from "@/lib/commerce/set-catalog";
import {
  CITIZEN_NOTICE_KINDS,
  emitCitizenNotice,
  setCitizenNoticeSink,
  type CitizenNotice,
} from "@/lib/kernel/notice";
import { commerceBriefMailBody } from "@/lib/kernel/notice/mail";

const ROOT = process.cwd();

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

afterEach(() => {
  setCitizenNoticeSink(null);
});

describe("P0.6 — günlük kâr özeti bildirimi", () => {
  it("commerce_daily_brief altıncı bildirim türüdür", () => {
    expect([...CITIZEN_NOTICE_KINDS]).toEqual([
      "bid_received",
      "bid_accepted",
      "delivery_posted",
      "escrow_released",
      "escrow_ttl_approaching",
      "commerce_daily_brief",
    ]);
  });

  it("özet bildirimi kuyruğa girer ve gövdesi koddan gelen sayıları taşır", () => {
    const seen: CitizenNotice[] = [];
    setCitizenNoticeSink((notice) => seen.push(notice));
    emitCitizenNotice({
      kind: "commerce_daily_brief",
      userId: "seller-1",
      reference: "commerce-brief:store-1:2026-11-22",
      applied: true,
      commerceBrief: {
        summary: "3 SKU tarandı. Toplam birim net ₺12,40. 1 zarar eden SKU. 1 kritik stok.",
        lossSkuCount: 1,
        criticalStockCount: 1,
        panelPath: "/panel/e-ticaret?sekme=buyume",
      },
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.kind).toBe("commerce_daily_brief");
    expect(seen[0]?.commerceBrief?.lossSkuCount).toBe(1);
  });

  it("replay (applied=false) ikinci bildirim basmaz", () => {
    const seen: CitizenNotice[] = [];
    setCitizenNoticeSink((notice) => seen.push(notice));
    emitCitizenNotice({
      kind: "commerce_daily_brief",
      userId: "seller-1",
      reference: "r",
      applied: false,
      commerceBrief: { summary: "x", lossSkuCount: 0, criticalStockCount: 0, panelPath: "/panel/e-ticaret" },
    });
    expect(seen).toEqual([]);
  });

  it("mail gövdesi kayıp SKU, kritik stok ve panel bağlantısını taşır", () => {
    const body = commerceBriefMailBody({
      kind: "commerce_daily_brief",
      userId: "seller-1",
      reference: "r",
      applied: true,
      commerceBrief: {
        summary: "5 SKU tarandı. Toplam birim net ₺-8,90. 2 zarar eden SKU. 1 kritik stok.",
        lossSkuCount: 2,
        criticalStockCount: 1,
        panelPath: "/panel/e-ticaret?sekme=buyume&magaza=store-1",
      },
    });
    expect(body).toContain("Zarar eden SKU: 2");
    expect(body).toContain("Kritik stok: 1");
    expect(body).toContain("5 SKU tarandı");
    expect(body).toContain("/panel/e-ticaret?sekme=buyume");
    expect(body).toContain(NOTICE_SEN.commerceDailyBrief.panelLabel);
  });

  it("mail.ts commerce dalını switch'te taşır ve varsayılan panel yolunu bilir", () => {
    const mail = read("lib/kernel/notice/mail.ts");
    expect(mail).toContain('case "commerce_daily_brief"');
    expect(mail).toContain("commerceBriefMailBody");
    expect(mail).toContain('return "/freelancer"');
    // Sen aksı: "sizin" yok.
    expect(NOTICE_SEN.commerceDailyBrief.subject.length).toBeGreaterThan(3);
    expect(read("lib/copy/sen-voice/notice.ts")).not.toContain("hesabınız");
  });

  it("daily-brief cron özet üretince emitCitizenNotice çağırır ve e-posta yolu kapanmaz", () => {
    const source = read("lib/commerce/daily-brief.ts");
    expect(source).toContain('kind: "commerce_daily_brief"');
    expect(source).toContain("emitCitizenNotice");
    expect(source).toContain("lossSkuCount: input.payload.totals.lossSkuCount");
    expect(source).toContain("criticalStockCount: input.payload.criticalStock.length");
    // DRAFT mağaza da taranır: yeni satıcı özeti kaçırmaz.
    expect(source).toContain('status: { in: ["ACTIVE", "DRAFT"] }');
    // AI metni e-postaya girmez.
    expect(source).toContain("sendBriefNotice");
  });
});

describe("P1.3 — set ürün kimliği", () => {
  it("SKU teklif kimliğinden türetilir ve SET- öneki taşır", () => {
    const sku = setSku("8f14e45f-ceea-467a-9d1a-1a2b3c4d5e6f");
    expect(sku).toBe("SET-8F14E45F");
    expect(setSku("8f14e45f-ceea-467a-9d1a-1a2b3c4d5e6f")).toBe(sku);
  });

  it("barkod 13 hane sayısal EAN-13 ve sağlama basamağı doğru", () => {
    const barcode = setBarcode("8f14e45f-ceea-467a-9d1a-1a2b3c4d5e6f");
    expect(barcode).toHaveLength(13);
    expect(/^\d{13}$/.test(barcode)).toBe(true);
    expect(barcode.slice(0, 3)).toBe("299");
    expect(barcode.slice(-1)).toBe(ean13CheckDigit(barcode.slice(0, 12)));
    // Deterministik: aynı teklif aynı barkod.
    expect(setBarcode("8f14e45f-ceea-467a-9d1a-1a2b3c4d5e6f")).toBe(barcode);
    expect(ean13CheckDigit("868000000000")).toBe("6");
  });

  it("barkod farklı tekliflerde çakışmaz", () => {
    const a = setBarcode("aaaaaaaa-1111-4111-8111-111111111111");
    const b = setBarcode("bbbbbbbb-2222-4222-8222-222222222222");
    expect(a).not.toBe(b);
  });

  it("üye bağı attributes JSON'unda okunur", () => {
    const attribute = bundleMembersAttribute(["v-1", "v-2"]);
    expect(attribute.column).toBe("Paket üyeleri");
    expect(attribute.value).toBe("v-1|v-2");
    expect(readBundleMembers([{ column: "Paket tipi", value: "2'li set" }, attribute])).toEqual(["v-1", "v-2"]);
    expect(readBundleMembers([])).toEqual([]);
    expect(readBundleMembers(null)).toEqual([]);
    expect(readBundleMembers([{ column: "Paket üyeleri", value: "" }])).toEqual([]);
  });

  it("set maliyeti ve desisi üyelerden toplanır, KDV en yüksek oranı alır", () => {
    const members = [
      { costMinor: 4_000, desiGrams: 800, vatBps: 1_000 },
      { costMinor: 3_500, desiGrams: 900, vatBps: 2_000 },
    ];
    expect(bundleCostMinor(members)).toBe(7_500);
    expect(bundleDesiGrams(members)).toBe(1_700);
    expect(bundleVatBps(members)).toBe(2_000);
    expect(bundleCostMinor([])).toBe(0);
    expect(bundleVatBps([])).toBe(2_000);
  });

  it("bundle-engine accept: unitEconomics, barkod ve üye bağı yazar", () => {
    const source = read("lib/commerce/bundle-engine.ts");
    expect(source).toContain("commerceUnitEconomics.create");
    expect(source).toContain("bundleMembersAttribute(memberIds)");
    expect(source).toContain("setBarcode(proposal.id)");
    expect(source).toContain("setSku(proposal.id)");
    expect(source).toContain('status: "ACTIVE"');
    // Kartın attributes alanına ham kuruş yazılmaz: TL metni gider (LLM istemindeki
    // "kuruş" satırı iç kullanımdır, ekrana basılmaz).
    expect(source).toContain("{ column: BUNDLE_CARGO_SAVED_COLUMN, value: formatTryFromMinor(proposal.cargoSavedMinor) }");
    expect(source).not.toContain('{ column: "Kargo tasarrufu kuruş"');
    // Üye maliyeti eksikse yarım kart doğmaz.
    expect(source).toContain("Paket üyelerinin birim maliyeti eksik");
  });
});

describe("P1.1/P1.2 — dürüst aksiyonlar", () => {
  it("REPRICE kapalı form kullanır; eski 'fiyat + |net| + %5' formülü kalktı", () => {
    const source = read("lib/commerce/daily-brief.ts");
    expect(source).toContain("profitablePriceMinor");
    expect(source).toContain("TARGET_NET_MARGIN_BPS");
    expect(source).not.toContain("Math.abs(sku.netMinor) + Math.ceil(sku.priceMinor * 0.05)");
    // Fiyat yazıldıktan sonra ilanlar pazaryerine gönderilmek üzere kuyruğa alınır.
    expect(source).toContain("syncStatus: \"PENDING\"");
  });

  it("BUNDLE ve RESTOCK no-op değil", () => {
    const source = read("lib/commerce/daily-brief.ts");
    expect(source).not.toContain("burada yalnız işaretlenir");
    expect(source).not.toContain("burada yalnız hatırlatma");
    expect(source).toContain("proposeBundles");
    expect(source).toContain("applyRestock");
    expect(source).toContain('type: "INBOUND_DRAFT"');
    expect(source).toContain("kind: \"STOCK_ALERT\"");
  });

  it("kritik stok varyant toplamından okunur (M4-7)", () => {
    const source = read("lib/commerce/daily-brief.ts");
    expect(source).toContain("sumVariantOnHand(product.variants)");
    expect(source).not.toContain("isCriticalStock(product.approvedStockQty, product.criticalStockQty)");
  });
});
