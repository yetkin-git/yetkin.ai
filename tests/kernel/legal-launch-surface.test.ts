import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  LEGAL_CHECKOUT_CONSENT_COPY,
  LEGAL_ENTITY,
  LEGAL_ENTITY_COLOPHON,
  LEGAL_ENTITY_IDS,
  LEGAL_ENTITY_VKN,
  LEGAL_FOOTER_LINKS,
  LEGAL_HOME_CTA,
  LEGAL_HOME_HREF,
  LEGAL_HONESTY_BODY,
  LEGAL_LAUNCH_SECTIONS,
  LEGAL_PAGE_TITLE,
  LEGAL_SECTION_IDS,
  LEGAL_SECTION_TITLES,
  LEGAL_SITE_PATHS,
  LEGAL_SUPPORT_EMAIL,
  LEGAL_SUPPORT_LINE,
  LEGAL_SUPPORT_MAILTO,
} from "@/lib/copy/legal-launch";
import {
  CHECKOUT_LEGAL_CONSENT_PAYLOAD,
  CHECKOUT_LEGAL_CONSENT_VERSION,
  checkoutLegalConsentSchema,
} from "@/lib/kernel/legal/checkout-consent";
import { purchaseCourseInputSchema } from "@/lib/academy/schemas";
import { CHECKOUT_BILLING_PAYLOAD } from "@/lib/kernel/identity/billing-info";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("lansman hukuk yüzeyi (O13)", () => {
  it("resmi şirket kartını basar; dört lansman başlığını taşır", () => {
    expect(LEGAL_HONESTY_BODY).toContain(LEGAL_ENTITY.tradeName);
    expect(LEGAL_HONESTY_BODY).toContain(`VKN: ${LEGAL_ENTITY.vkn} / ${LEGAL_ENTITY.taxOffice}`);
    expect(LEGAL_HONESTY_BODY).toContain(`MERSİS No: ${LEGAL_ENTITY.mersis}`);
    expect(LEGAL_HONESTY_BODY).toContain("18 yaş ve üzerindeki kullanıcılar");
    expect(LEGAL_HONESTY_BODY).not.toContain("ebeveyn");
    expect(LEGAL_HONESTY_BODY).not.toContain("Canlı vergi mükellefiyeti henüz açık değildir");
    expect(LEGAL_ENTITY.address).toBe("İnönü Mah. 157 Sk. No:3/C Akhisar/Manisa");
    expect(LEGAL_ENTITY_COLOPHON).toContain(LEGAL_ENTITY.address);
    expect(LEGAL_ENTITY).toEqual({
      brandName: "Yetkin AI / yetkin.ai",
      tradeName: "Yapınet Gayrimenkul ve E-Ticaret Limited Şirketi",
      taxOffice: "Akhisar V.D.",
      vkn: "9370683361",
      mersis: "937068336100017",
      address: "İnönü Mah. 157 Sk. No:3/C Akhisar/Manisa",
      supportEmail: "destek@yetkin.ai",
      adminEmail: "yapinet360@gmail.com",
      whatsappDisplay: "0551 675 16 74",
      whatsappE164: "905516751674",
      iban: "TR82 0020 5000 0100 8852 4000 01",
    });
    expect(LEGAL_ENTITY_COLOPHON).toContain(LEGAL_ENTITY.taxOffice);
    expect(LEGAL_ENTITY_VKN).toBe("Akhisar V.D. - 9370683361");
    expect(LEGAL_ENTITY_IDS).toBe(
      `VKN: ${LEGAL_ENTITY.vkn} / ${LEGAL_ENTITY.taxOffice}, MERSİS No: ${LEGAL_ENTITY.mersis}`,
    );
    expect(LEGAL_PAGE_TITLE).toBe("Gizlilik ve yasal çerçeve");
    expect(LEGAL_LAUNCH_SECTIONS).toHaveLength(4);
    expect(LEGAL_LAUNCH_SECTIONS.map((row) => row.title)).toEqual([
      LEGAL_SECTION_TITLES.kvkk,
      LEGAL_SECTION_TITLES.refund,
      LEGAL_SECTION_TITLES.distance,
      LEGAL_SECTION_TITLES.terms,
    ]);
    expect(LEGAL_SECTION_TITLES.kvkk).toBe("Gizlilik Politikası ve KVKK Aydınlatma Metni");
    expect(LEGAL_SECTION_TITLES.refund).toBe("İptal ve İade Koşulları");
    expect(LEGAL_SECTION_TITLES.distance).toBe(
      "Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi",
    );
    expect(LEGAL_SECTION_TITLES.terms).toBe("Platform Kullanım Şartları & Sorumluluk Sınırları");
    expect(LEGAL_SECTION_IDS.kvkk).toBe("kvkk-cerez");
  });

  it("dijital içerik ifa istisnasını ve ön bilgilendirmeyi gerçek akışla hizalar", () => {
    const distance = LEGAL_LAUNCH_SECTIONS.find((row) => row.slug === "mesafeli-satis");
    const refund = LEGAL_LAUNCH_SECTIONS.find((row) => row.slug === "iade");
    const body = [distance, refund]
      .flatMap((section) => section?.articles.flatMap((article) => article.paragraphs) ?? [])
      .join("\n");
    expect(distance?.articles.some((article) => article.id === "on-bilgilendirme")).toBe(true);
    expect(distance?.articles.some((article) => article.id === "dijital-ifa-istisnasi")).toBe(true);
    expect(body).toContain("elektronik ortamda anında ifa edilen hizmet");
    expect(body).toContain("6502 sayılı Kanun");
    expect(body).toContain("ders içeriklerine erişim açıldığı anda");
    expect(body).toContain("Cüzdan Yükleme");
    expect(body).toContain(
      "Platform cüzdanına yüklenen bakiyeler yalnızca platform içi hizmetlerde kullanılabilir; farklı bir banka hesabına nakit transferi yapılamaz. Kullanılmamış bakiye otomatik olarak karta dönmez; nakit çekim bu gövdede yoktur. İade talepleri destek kanalından alınır ve henüz harcanmamış yükleme, ödeme kuruluşu takası ile operatör tarafından değerlendirilir.",
    );
    expect(body).toContain("emanet zaman aşımı");
    expect(body).toContain(
      "Satın alınan hizmet ve eğitimlere ait faturalar yasal süreçlere uygun düzenlenir. Fatura, kayıtlı e-posta adresine iletilir; bu iletim otomatik e-Arşiv paneli veya anında GİB gönderimi anlamına gelmez. İlan edilen tüm fiyatlara KDV dahildir.",
    );
    expect(body).not.toContain("Canlı e-arşiv");
    expect(body).not.toContain("ebeveyn onayına tabidir");
    expect(body).not.toContain("mükellefiyeti açık değildir");
    expect(body).toContain("Yetkili Ödeme Kuruluşu");
    expect(body).toContain(
      "Ödeme işlemleri Yetkili Ödeme Kuruluşu altyapısı üzerinden güvenle gerçekleştirilir. Kart tahsilatları ve cüzdan bakiyeleri Türk Lirası (TL) cinsinden işlenir. Kurs bedelleri kataloğumuzda ilan edilen güncel fiyatlar üzerinden tahsil edilir.",
    );
    expect(body).not.toContain("PayTR");
    expect(body).not.toContain("Junior");
    expect(body).not.toContain("amountMinor");
    expect(body).not.toContain("PriceCatalogEntry");
    expect(body).toContain(`MERSİS No: ${LEGAL_ENTITY.mersis}`);
    expect(LEGAL_CHECKOUT_CONSENT_COPY.distanceLabel).toContain("okudum, kabul ediyorum");
    expect(LEGAL_CHECKOUT_CONSENT_COPY.digitalLabel).toBe(
      "Dijital içeriğin anında ifa edileceğini kabul ediyorum.",
    );
  });

  it("kasa rızası fail-closed’dır; sahte sürüm geçmez", () => {
    expect(CHECKOUT_LEGAL_CONSENT_VERSION).toBe("2026-08-31");
    expect(checkoutLegalConsentSchema.safeParse(CHECKOUT_LEGAL_CONSENT_PAYLOAD).success).toBe(true);
    expect(purchaseCourseInputSchema.safeParse({ lockId: "lock-1" }).success).toBe(false);
    expect(
      purchaseCourseInputSchema.safeParse({
        lockId: "lock-1",
        ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
      }).success,
    ).toBe(false);
    expect(
      purchaseCourseInputSchema.safeParse({
        lockId: "lock-1",
        ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
        billing: CHECKOUT_BILLING_PAYLOAD,
      }).success,
    ).toBe(true);
    expect(checkoutLegalConsentSchema.safeParse({ amountMinor: 1000 }).success).toBe(false);
    expect(
      checkoutLegalConsentSchema.safeParse({
        ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
        distanceContractAccepted: false,
      }).success,
    ).toBe(false);
  });

  it("runbook PayTR bildirim yolunu taşır; sahte VKN yazılmaz", () => {
    const runbook = readFileSync(join(ROOT, ".system_docs", "OPS_RUNBOOK.md"), "utf8");
    expect(runbook).toContain("/api/payments/webhooks/paytr");
    expect(runbook).not.toMatch(/VKN:\s*\d/);
  });

  it("/legal sayfası resmi sicili ve MERSİS künyesini basar", () => {
    const page = readSrc("app/(public)/legal/page.tsx");
    const slug = readSrc("app/(public)/legal/[slug]/page.tsx");
    const copy = readSrc("lib/copy/legal-launch.ts");
    const contact = readSrc("app/(public)/iletisim/page.tsx");
    const articles = readSrc("components/legal/legal-section-articles.tsx");
    expect(page).toContain("LegalHonestyCard");
    expect(page).toContain("LegalSupportEmailLine");
    expect(page).toContain("LegalEntityColophon");
    expect(page).toContain("LegalBackToHome");
    expect(page).toContain("LEGAL_LAUNCH_SECTIONS");
    expect(page).toContain("LEGAL_PAGE_TITLE");
    expect(page).not.toContain("LEGAL_SUPPORT_LINE");
    expect(slug).toContain("LegalBackToHome");
    expect(slug).toContain("LegalSupportEmailLine");
    expect(slug).toContain("LegalEntityColophon");
    expect(slug).not.toContain("LEGAL_SUPPORT_LINE");
    expect(articles).toContain("LEGAL_SUPPORT_LINE_LABEL");
    expect(articles).toContain("LEGAL_ENTITY_COLOPHON");
    expect(LEGAL_SUPPORT_LINE).toBe(`Destek e-posta: ${LEGAL_SUPPORT_EMAIL}`);
    expect(copy).toContain(LEGAL_ENTITY.tradeName);
    expect(copy).toContain(LEGAL_ENTITY.vkn);
    expect(copy).toContain(LEGAL_ENTITY.taxOffice);
    expect(copy).toContain(LEGAL_ENTITY.mersis);
    expect(copy).toContain(LEGAL_ENTITY.address);
    expect(copy).toContain("Adres: ${LEGAL_ENTITY.address}");
    expect(copy).toContain(LEGAL_ENTITY.iban);
    expect(copy).toContain(LEGAL_ENTITY.adminEmail);
    expect(copy).toContain("emanet zaman aşımı");
    expect(copy).toContain(
      "Satın alınan hizmet ve eğitimlere ait faturalar yasal süreçlere uygun düzenlenir. Fatura, kayıtlı e-posta adresine iletilir; bu iletim otomatik e-Arşiv paneli veya anında GİB gönderimi anlamına gelmez. İlan edilen tüm fiyatlara KDV dahildir.",
    );
    expect(copy).not.toContain("Canlı e-arşiv");
    expect(copy).not.toContain("ebeveyn onayına tabidir");
    expect(copy).not.toContain("mükellefiyeti açık değildir");
    expect(copy).not.toMatch(/\bPayTR\b/);
    expect(copy).not.toContain("Junior odası");
    expect(copy).not.toContain("amountMinor");
    expect(copy).not.toContain("PriceCatalogEntry");
    expect(copy).not.toContain("hukuk@yetkin.ai");
    expect(copy).toContain(LEGAL_SUPPORT_EMAIL);
    expect(contact).toContain("LegalSupportEmailLine");
    expect(contact).toContain("LegalEntityColophon");
    expect(contact).toContain("LEGAL_ENTITY.taxOffice");
    expect(contact).toContain("LEGAL_ENTITY_VKN");
    expect(contact).toContain("LEGAL_ENTITY.mersis");
    expect(contact).toContain("LEGAL_ENTITY.address");
    expect(contact).not.toContain("PayTR");
    expect(LEGAL_SUPPORT_EMAIL).toBe("destek@yetkin.ai");
    expect(LEGAL_SUPPORT_MAILTO).toBe("mailto:destek@yetkin.ai");
    for (const section of LEGAL_LAUNCH_SECTIONS) {
      const body = section.articles.flatMap((article) => article.paragraphs).join("\n");
      expect(body, section.slug).toContain(LEGAL_SUPPORT_EMAIL);
      expect(body, section.slug).toContain(LEGAL_ENTITY.mersis);
      expect(body, section.slug).toContain(LEGAL_ENTITY.taxOffice);
      expect(body, section.slug).toContain(LEGAL_ENTITY.address);
    }
  });

  it("bağımsız URL'ler, footer ve robots yasal vitrine bağlıdır", () => {
    const slug = readSrc("app/(public)/legal/[slug]/page.tsx");
    const footer = readSrc("components/legal/legal-site-footer.tsx");
    const publicLayout = readSrc("app/(public)/layout.tsx");
    const authLayout = readSrc("app/(auth)/layout.tsx");
    const shell = readSrc("components/shell/app-shell-switch.tsx");
    const home = readSrc("app/(public)/page.tsx");
    const robots = readSrc("app/robots.ts");
    const sitemap = readSrc("app/sitemap.ts");
    expect(slug).toContain("legalSectionBySlug");
    expect(footer).toContain("LEGAL_FOOTER_LINKS");
    expect(footer).toContain("fixed");
    expect(footer).toContain("bottom-0");
    expect(footer).toContain("link.label");
    expect(publicLayout).toContain("LegalSiteFooter");
    expect(authLayout).toContain("LegalSiteFooter");
    expect(shell).toContain("LegalSiteFooter");
    expect(home).not.toContain("/legal/gizlilik");
    expect(home).not.toContain("/legal/mesafeli-satis");
    expect(home).not.toContain("/legal/iade");
    expect(home).not.toContain("legalCta");
    expect(home).not.toContain("Yasal metinler");
    expect(robots).toContain("/legal");
    expect(robots).toContain("LEGAL_SITE_PATHS");
    expect(sitemap).toContain("LEGAL_SITE_PATHS");
    expect(LEGAL_FOOTER_LINKS.map((link) => link.href)).toEqual([
      "/legal/gizlilik",
      "/legal/iade",
      "/legal/mesafeli-satis",
      "/legal/kullanim-sartlari",
      "/iletisim",
      "mailto:destek@yetkin.ai",
    ]);
    expect(LEGAL_FOOTER_LINKS.map((link) => link.label)).toEqual([
      "Gizlilik",
      "İade",
      "Mesafeli satış",
      "Kullanım şartları",
      "İletişim",
      "destek@yetkin.ai",
    ]);
    expect(LEGAL_SITE_PATHS).not.toContain("mailto:destek@yetkin.ai");
  });

  it("sitemap loc alanları https://yetkin.ai mutlak adresidir", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    const { default: sitemap } = await import("@/app/sitemap");
    const { default: robots } = await import("@/app/robots");
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain("https://yetkin.ai/");
    expect(urls).toContain("https://yetkin.ai/legal");
    expect(urls).toContain("https://yetkin.ai/legal/gizlilik");
    expect(urls).toContain("https://yetkin.ai/iletisim");
    for (const url of urls) {
      expect(url.startsWith("https://yetkin.ai")).toBe(true);
      expect(url.startsWith("/")).toBe(false);
    }
    expect(robots().sitemap).toBe("https://yetkin.ai/sitemap.xml");
    vi.unstubAllEnvs();
  });

  it("yasal sayfalar Hukuk rozetinin üstünde anasayfa çıkışı basar", () => {
    const back = readSrc("components/legal/legal-back-to-home.tsx");
    const page = readSrc("app/(public)/legal/page.tsx");
    const slug = readSrc("app/(public)/legal/[slug]/page.tsx");
    expect(LEGAL_HOME_CTA).toBe("Anasayfaya Dön");
    expect(LEGAL_HOME_HREF).toBe("/");
    expect(back).toContain("LEGAL_HOME_CTA");
    expect(back).toContain("LEGAL_HOME_HREF");
    expect(back).toContain("BrandIcon");
    expect(back).toContain('data-legal-home=""');
    expect(back).not.toContain("router.back");
    expect(page.indexOf("LegalBackToHome")).toBeLessThan(page.indexOf("Hukuk"));
    expect(slug.indexOf("LegalBackToHome")).toBeLessThan(slug.indexOf("Hukuk"));
  });

  it("satın alma ve cüzdan yükleme kasa tiklerini ve API rızasını taşır", () => {
    const purchaseUi = readSrc("components/academy/purchase-button.tsx");
    const wallet = readSrc("components/kernel/wallet-top-up-form.tsx");
    const modal = readSrc("components/kernel/quick-top-up-modal.tsx");
    const purchaseApi = readSrc("app/api/academy/courses/[id]/purchase/route.ts");
    const topUpApi = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    for (const source of [purchaseUi, wallet, modal]) {
      expect(source).toContain("CheckoutConsentFields");
      expect(source).toContain("CheckoutBillingFields");
      expect(source).toContain("CHECKOUT_LEGAL_CONSENT_VERSION");
    }
    expect(purchaseApi).toContain("CHECKOUT_LEGAL_CONSENT_REQUIRED");
    expect(topUpApi).toContain("CHECKOUT_LEGAL_CONSENT_REQUIRED");
    expect(purchaseApi).toContain("consentVersion");
    expect(topUpApi).toContain("consentVersion");
    expect(purchaseApi).toContain("persistCheckoutBilling");
    expect(topUpApi).toContain("persistCheckoutBilling");
  });
});
