import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAREER_PUBLICATION_LEDGER_PURPOSE,
  KURUMSAL_SCREENING_LEDGER_PURPOSE,
  classifyPaymentOrderPurpose,
  isActivatedProductRefundBlocked,
  isCardRefundBlockedForOrder,
  isGrantProductPurpose,
  ledgerCreditLineForOrder,
  PAYMENT_ORDER_PURPOSE,
} from "@/lib/kernel/payments/order-purpose";
import { LEDGER_CREDIT_PURPOSES } from "@/lib/kernel/ledger/credit-purposes";
import { KURUMSAL_SCREENING_ORDER_PURPOSE } from "@/lib/sales/kurumsal-screening-entitlement";
import { YETKINCV_PUBLICATION_ORDER_PURPOSE } from "@/lib/career/yetkincv-publication";
import { parseYetkinCvStart, parseYetkinCvSubmit, yetkinCvSkillCatalog, yetkinCvQuestionsForSkills, yetkinCvSubmitSchema, YETKINCV_SUBMIT_ANSWERS_MAX } from "@/lib/career/yetkincv";
import { YETKINCV_VERTICALS } from "@/lib/career/yetkincv-options";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

/**
 * Kariyer/kurumsal para yolları — re-audit P0 mühürleri.
 *
 * Bu dosya `CAREER_FINAL_DENETIM_RAPORU.md` §1'deki üç para hatasını kilitler.
 * Kırılırsa ürün ya bedava satılır ya da hiç satılamaz.
 */
describe("P0-M1 — kariyer/kurumsal niyet sınıflaması (para kaçağı)", () => {
  it("YetkinCV yayın niyeti kanonik koda ve kendi defter etiketine bağlanır", () => {
    expect(classifyPaymentOrderPurpose(YETKINCV_PUBLICATION_ORDER_PURPOSE)).toBe(
      PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION,
    );
    const line = ledgerCreditLineForOrder({
      purpose: YETKINCV_PUBLICATION_ORDER_PURPOSE,
      merchantOid: "OID-CAREER",
    });
    // Eskiden "wallet-top-up" yazıyordu: ürün geliri cüzdan yüklemesi sayılıyordu.
    expect(line.purpose).toBe(CAREER_PUBLICATION_LEDGER_PURPOSE);
    expect(line.purpose).not.toBe("wallet-top-up");
    expect(line.idempotencyKey).toBe(`career-publication:OID-CAREER`);
  });

  it("kurumsal ilan paketi niyeti kanonik koda ve kendi defter etiketine bağlanır", () => {
    expect(classifyPaymentOrderPurpose(KURUMSAL_SCREENING_ORDER_PURPOSE)).toBe(
      PAYMENT_ORDER_PURPOSE.KURUMSAL_SCREENING,
    );
    const line = ledgerCreditLineForOrder({
      purpose: KURUMSAL_SCREENING_ORDER_PURPOSE,
      merchantOid: "OID-KURUMSAL",
    });
    expect(line.purpose).toBe(KURUMSAL_SCREENING_LEDGER_PURPOSE);
    expect(line.purpose).not.toBe("wallet-top-up");
  });

  it("iki yeni defter etiketi CREDIT izin listesindedir (clearing patlamaz)", () => {
    // Eksikse `appendLedgerEntry` fırlatır: para alınır, sipariş CLEARED olmaz.
    expect(LEDGER_CREDIT_PURPOSES).toContain(CAREER_PUBLICATION_LEDGER_PURPOSE);
    expect(LEDGER_CREDIT_PURPOSES).toContain(KURUMSAL_SCREENING_LEDGER_PURPOSE);
  });

  it("satılan dijital ürün nakit iadeye kapalıdır", () => {
    for (const purpose of [YETKINCV_PUBLICATION_ORDER_PURPOSE, KURUMSAL_SCREENING_ORDER_PURPOSE]) {
      expect(isActivatedProductRefundBlocked(purpose)).toBe(true);
      expect(isCardRefundBlockedForOrder({ purpose })).toBe(true);
    }
    // Kontrol: düz yükleme hâlâ iadeye açık.
    expect(isCardRefundBlockedForOrder({ purpose: "wallet-top-up" })).toBe(false);
    // Kontrol: hibe şartlı kalır (üretilmediyse iade).
    expect(isGrantProductPurpose("grant-dossier")).toBe(true);
    expect(isCardRefundBlockedForOrder({ purpose: "grant-dossier", produced: false })).toBe(false);
  });

  it("SQL iade kovası aynı niyetleri eler (uygulama kapısı tek başına yetmez)", () => {
    const sql = src("lib/kernel/payments/prisma-wallet-card-refund.ts");
    expect(sql).toContain("career-license:yetkincv-publication");
    expect(sql).toContain("kurumsal-license:job-screening-pack");
    expect(sql).toContain("CAREER_PUBLICATION");
    expect(sql).toContain("KURUMSAL_SCREENING");
  });

  it("Prisma enum + göç yeni niyetleri taşır", () => {
    const schema = src("prisma/schema/kernel.prisma");
    expect(schema).toContain("CAREER_PUBLICATION");
    expect(schema).toContain("KURUMSAL_SCREENING");
    const migration = src(
      "prisma/migrations/20261124180000_career_kurumsal_payment_purpose/migration.sql",
    );
    expect(migration).toContain(`'CAREER_PUBLICATION'`);
    expect(migration).toContain(`'KURUMSAL_SCREENING'`);
  });
});

describe("P0-M2 — kurumsal paket satın alma yolu (kapı kapanmış, anahtar yoktu)", () => {
  it("kasa rotası gerçekten var ve katalog birimini tahsil eder", () => {
    const route = src("app/api/kurumsal/satin-al/route.ts");
    expect(route).toContain("placeSingleCatalogPurchase");
    expect(route).toContain("KURUMSAL_SCREENING_MODULE");
    expect(route).toContain("KURUMSAL_SCREENING_UNIT");
    expect(route).toContain("KURUMSAL_SCREENING_ORDER_PURPOSE");
    // Tutar istekten okunmaz.
    expect(route).not.toContain("body.amountMinor");
    expect(route).toContain("checkoutLegalConsentSchema");
    expect(route).toContain("requireRailV1IdempotencyKey");
  });

  it("ilan açma kapısı hâlâ lisans ister (kapı gevşetilmedi)", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("assertKurumsalScreeningEntitlement");
    expect(load).toContain("PaymentRequiredError");
  });

  it("vitrin etiketi katalogdan okunur, sabit 'Kurumsal Tanımlama' değildir", () => {
    const offers = src("lib/sales/kurumsal-offers.ts");
    expect(offers).toContain("findActiveEntry");
    expect(offers).toContain("KURUMSAL_SCREENING_UNIT");
    expect(offers).toContain('honesty: "live"');
    // Katalog yoksa uydurma fiyat basılmaz.
    expect(offers).toContain("PUBLIC_PREORDER_LABEL");
  });
});

describe("P0-S1 — sınav rotası gövde sözleşmesi (sınav hiç açılmıyordu)", () => {
  const cvText = "Depoda stok ve sipariş takibi yaptım, iade sürecini kurdum.";

  it("istemcinin gönderdiği action anahtarı reddedilmez", () => {
    // İstemci `{ action: "start", ... }` yollar ve şema strictObject'ti:
    // önceden bu gövde "Hedef pozisyon ve uzmanlık listeden seçilir." ile düşüyordu.
    const parsed = parseYetkinCvStart({
      action: "start",
      roleId: "corporate",
      verticalId: "ecommerce",
      cvText,
    });
    expect(parsed.ok).toBe(true);
  });

  it("submit gövdesi de action taşıyabilir", () => {
    const parsed = parseYetkinCvSubmit({
      action: "submit",
      sittingId: "sitting01",
      answers: [{ questionId: "q1", choiceIndex: 1 }],
    });
    expect(parsed.ok).toBe(true);
  });

  it("yanlış action değeri yine reddedilir (gevşeme yok)", () => {
    expect(
      parseYetkinCvStart({ action: "submit", roleId: "corporate", verticalId: "ecommerce", cvText }).ok,
    ).toBe(false);
  });

  it("action olmadan da çalışır (geriye dönük)", () => {
    expect(parseYetkinCvStart({ roleId: "corporate", verticalId: "ecommerce", cvText }).ok).toBe(true);
    expect(
      parseYetkinCvSubmit({ sittingId: "sitting01", answers: [{ questionId: "q1", choiceIndex: 0 }] }).ok,
    ).toBe(true);
  });

  it("rota action'ı okuyup iki dala ayırır", () => {
    const route = src("app/api/career/yetkincv/route.ts");
    expect(route).toContain('action === "start"');
    expect(route).toContain('action === "submit"');
    expect(route).toContain("applyHttpRateLimit");
  });
});

describe("P0-M3 — yayın CTA'sı gerçekten tahsilat başlatır", () => {
  it("CTA satın alma rotasını çağırır (yalnız bağlantı basmaz)", () => {
    const cta = src("components/career/yetkincv-publication-cta.tsx");
    expect(cta).toContain('"/api/career/yetkincv/purchase"');
    expect(cta).toContain("Idempotency-Key");
    expect(cta).toContain("CHECKOUT_LEGAL_CONSENT_PAYLOAD");
    expect(cta).toContain("iframeUrl");
  });

  it("yayın açıksa ikinci kez ücret alınmaz", () => {
    const cta = src("components/career/yetkincv-publication-cta.tsx");
    expect(cta).toContain("published");
    expect(cta).toContain('"settled"');
  });

  it("vize kartı yayın durumunu CTA'ya geçirir", () => {
    const page = src("app/(public)/vize/[id]/page.tsx");
    expect(page).toContain("published={seal.published}");
  });
});

describe("P1 — doğrulama ucu uydurma 'geçerli' demez", () => {
  it("valid alanı HMAC'e bağlıdır; satır varlığına değil", () => {
    const store = src("lib/career/yetkincv-store.ts");
    expect(store).toContain("valid: hmac.valid");
    expect(store).not.toContain("// Geçerli mühür = satır var.");
    expect(store).toContain("signatureState");
    expect(store).toContain('"tampered"');
    expect(store).toContain('"unsigned"');
  });

  it("verify rotası imza durumunu istemciye taşır", () => {
    const route = src("app/api/career/verify/[hash]/route.ts");
    expect(route).toContain("signatureState");
    expect(route).toContain("hmacValid");
  });
});

describe("P1 — ücretsiz sınav hakkı kurumsal başvuruyla tükenmez", () => {
  it("deneme sayacı yalnız serbest oturumları sayar", () => {
    const store = src("lib/career/yetkincv-store.ts");
    expect(store).toContain("kurumsalApplication: { is: null }");
    expect(store).toContain("YETKINCV_MAX_ATTEMPTS");
  });
});

describe("P1 — kurumsal teslim cap'i bank büyümesine yer bırakır", () => {
  it("her dikeyde tüm becerilerin sorusu cap'in altında kalır", () => {
    for (const vertical of YETKINCV_VERTICALS) {
      const skills = yetkinCvSkillCatalog(vertical.id) ?? [];
      expect(skills.length).toBeGreaterThan(0);
      const questions = yetkinCvQuestionsForSkills(
        vertical.id,
        skills.map((row) => row.key),
      );
      expect(questions).not.toBeNull();
      // Cap tam banka boyutunda olsaydı yeni soru teslimi sessizce kırardı.
      expect(questions!.length).toBeLessThan(YETKINCV_SUBMIT_ANSWERS_MAX);
      expect(
        yetkinCvSubmitSchema.safeParse({
          sittingId: "sitting01",
          answers: questions!.map((row) => ({ questionId: row.id, choiceIndex: 0 })),
        }).success,
      ).toBe(true);
    }
  });
});

describe("P1 — işveren doğrulama yolu kapatılmadı", () => {
  it("verifiedEmployerAt'i yazan bir süper yönetici rotası var", () => {
    const route = src("app/api/(kernel)/admin/ops/employer-verify/route.ts");
    expect(route).toContain('export const auth = "admin"');
    expect(route).toContain("verifiedEmployerAt");
    expect(route).toContain("requireSuperAdmin");
    expect(route).toContain("writeSuperAdminAudit");
    // Numara biçimi geçmezse rozet basılmaz.
    expect(route).toContain("isKurumsalTaxNumber");
  });

  it("doğrulanmamış ilan hâlâ noindex", () => {
    const page = src("app/(public)/ilan/[slug]/page.tsx");
    expect(page).toContain("employerVerified");
    expect(page).toContain("index: false");
  });
});

describe("P1 — portföy rotası hız sınırı taşır", () => {
  it("GET ve POST aynı kariyer kovasını kullanır", () => {
    const route = src("app/api/career/portfolio/route.ts");
    const matches = route.match(/HTTP_RATE_LIMITS\.careerUser/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(route).toContain("rateLimitedJsonResponse");
  });
});
