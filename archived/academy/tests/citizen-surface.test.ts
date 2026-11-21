import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { academyModuleCodeBySlug } from "@/lib/academy/catalog-filter";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PRICE_LOCK_GRACE_MINUTES, PRICE_LOCK_GRACE_MS } from "@/lib/kernel/pricing/price-lock";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "Bakiyeniz",
  "cüzdanınız",
  "hesabınız",
  "Hesabınızda",
  "seçin",
  "onaylayın",
  "ödeyin",
  "yanıtlayın",
  "Geçtiniz",
  "yapın",
  "kullanabilirsiniz",
];

const SEN_SURFACES = [
  "archived/academy/app/page.tsx",
  "archived/academy/app/[slug]/page.tsx",
  "archived/academy/app/[slug]/oyna/page.tsx",
  "archived/academy/app/[slug]/cikis-paketi/page.tsx",
  "app/(kernel)/cuzdan/page.tsx",
  "archived/academy/components/curriculum-player.tsx",
  "archived/academy/components/purchase-button.tsx",
  "lib/copy/sen-voice/academy.ts",
  "lib/copy/sen-voice/cuzdan.ts",
];

describe("akademi vatandaş yüzeyi — vitrin, kasa, oynatıcı, dinle kapalı", () => {
  it("/academy ve /cuzdan siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.cuzdan.description).toBe(
      "Cüzdan bakiyesi Tezgâh üretim kredileri, tek seferlik dosyalar ve platform içi hizmetler için kullanılır.",
    );
    expect(SEN_VOICE.cuzdan.closedLoopTitle).toBe("Cüzdan bakiyesi");
    expect(SEN_VOICE.cuzdan.closedLoopBody).toContain(SEN_VOICE.cuzdan.description);
    expect(SEN_VOICE.cuzdan.closedLoopBody).not.toContain("Akademi");
    expect(SEN_VOICE.cuzdan.closedLoopBody).not.toContain("Bakiyeniz");
    expect(SEN_VOICE.academy.catalog.description).toContain("Dersler ücretsiz");
    expect(PRICE_LOCK_GRACE_MINUTES).toBe(15);
    expect(PRICE_LOCK_GRACE_MS).toBe(PRICE_LOCK_GRACE_MINUTES * 60 * 1000);

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }

    expect(readSrc("archived/academy/app/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/(kernel)/cuzdan/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("PurchaseButton");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("SettlementSteps");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("hasAcademyPlayerAccess");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("PrepStripTeaser");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("/oyna");
    expect(readSrc("archived/academy/app/[slug]/oyna/page.tsx")).toContain("requirePageSession");
    expect(readSrc("archived/academy/app/[slug]/oyna/page.tsx")).toContain("hasPurchased");
    expect(readSrc("archived/academy/app/[slug]/oyna/page.tsx")).toContain("CurriculumPlayer");
    expect(readSrc("archived/academy/app/[slug]/cikis-paketi/page.tsx")).toContain("OfficeAiExitKit");
    expect(readSrc("archived/academy/components/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/academy/components/curriculum-player.tsx")).toContain("completeLesson");
    expect(readSrc("archived/academy/components/curriculum-player.tsx")).not.toContain("LessonListenButton");
  });

  it("vitrin kopyası defter jargonu ve süzgeç UI sızdırmaz; dinle kapalı", () => {
    const copy = SEN_VOICE.academy;
    const ledgerLeak = /SETTLED|amountMinor|CheckoutPriceLock|settlement|debit|escrow/i;
    // 5 saniye testi: ne sunuluyor · süre · kazanç. İç organizasyon dili ve keyword
    // dolgusu vitrin gövdesinden çıktı (P1 tedavi); SSS ve meta SEO niyetini taşır.
    expect(copy.catalog.description).toContain("Dersler ücretsiz");
    expect(copy.catalog.description).toContain("AI Tezgâh");
    expect(copy.catalog.description).toContain("Resmî Uzmanlık Sınavına");
    expect(copy.catalog.description).not.toContain("yayındadır");
    expect(copy.catalog.description).not.toContain("ayrı rafta");
    expect(copy.catalog.description).not.toContain("Vitrinin merkezinde");
    expect(copy.catalog.description).not.toContain("fırın");
    // Vitrin istatistiği eğitim sayısını değil ürünü anlatır.
    expect(copy.catalog.stats).toBe("Dersler ücretsiz · Baraj 70 · SHA-256 rozet");
    expect(copy.catalog.stats).not.toContain("6 eğitim");
    expect(copy.catalog.description).not.toContain("13 eğitim");
    expect(copy.catalog.description).not.toMatch(ledgerLeak);
    expect(copy.catalog.cardCtaBuy).toBe("Satın Al");
    expect(copy.catalog.cardCtaFreePreview).toBe("► 1. Dersi Ücretsiz İzle");
    expect(copy.catalog.audioBadge).toBe("Sesli anlatım");
    expect(copy.catalog.audioBadgeHint).toBe(
      "Sesli Anlatım + Sınav + Sertifika",
    );
    expect(copy.catalog.heroAudioBadge).toBe(
      "Sesli Anlatım + Sınav + Sertifika",
    );
    expect(copy.catalog.comingSoonBadge).toBe("Çok Yakında / Hazırlanıyor");
    expect(copy.catalog.comingSoonMeta).toBe("Hazırlanıyor");
    expect(copy.catalog.liveBadge).toBe("Yayında");
    expect(copy.catalog.cardCtaComingSoon).toBe("Çok Yakında");
    expect(copy.catalog.cardMetaAudio(9)).toBe("9 dk · Sesli Anlatım");
    expect(copy.catalog.cardMetaNarration(8)).toBe("8 Ders • Sesli Anlatım • Baraj 70");
    expect(copy.catalog.articleBadgeHint).toBe(
      "Makale / Okuma Metni + Uygulamalı Senaryolar + Sınav + Sertifika",
    );
    expect(copy.catalog.heroArticleBadge).toBe(
      "Makale / Okuma Metni + Uygulamalı Senaryolar + Sınav + Sertifika",
    );
    expect(copy.catalog.heroLevelIdentity("Temel", academyModuleCodeBySlug("01_office_ai"))).toBe(
      "Temel Seviye · OFF-101",
    );
    expect(copy.outline.kindAudio).toBe("Ses");
    expect(copy.outline.kindDocument).toBe("Makale / Okuma Metni");
    expect(copy.catalog.vatInclusiveHint).toBe("KDV dahil");
    expect(copy.catalog.priceVatInclusive("₺890,00")).toBe("₺890,00 · KDV dahil");
    expect(copy.course.heroBuyCta("₺890,00")).toBe("Uzmanlık Paketini Aç — ₺890,00");
    expect(copy.purchase.cta("₺250,00")).toContain("Uzmanlık Paketini Aç");
    expect(copy.purchase.cta("₺250,00")).not.toContain("& Öğren");
    expect(copy.player.resumeCta).toBe("Kaldığın Yerden Devam Et");
    expect(copy.listen.cta).toBe("Dersi Dinle");
    expect(copy.player.completeCta).toBe("Dersi Tamamladım");
    expect(copy.exam.startCta(30, 70)).toBe("Testi Başlat");
    expect(copy.player.examLaunchCta(6, 6, 70)).toBe("6/6 Bitti. Baraj 70. Testi Başlat!");
    expect(copy.pilotPath.steps(70).map((step) => step.label)).toEqual([
      "Eğitimi Tamamla",
      "Testi Başlat",
      "Sertifika / Yetkinlik Kazan",
      "Kariyer sayfası",
    ]);
    expect(JSON.stringify(copy)).not.toContain("Mühür düşer");
    expect(JSON.stringify(copy)).not.toContain("Dikey vize");

    expect(ACADEMY_COURSE_TITLES["01_office_ai"]).toContain("Ofiste Yapay Zekâ");
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(row.title, row.slug).not.toMatch(ledgerLeak);
    }

    const catalog = readSrc("archived/academy/app/page.tsx");
    expect(catalog).toContain("CourseList");
    expect(catalog).toContain("loadAcademyVitrineCourses");
    // Vitrin boş iskelet basmaz: yüklenen kurslar prop olarak geçer.
    expect(catalog).toContain("courses={courses}");
    expect(catalog).not.toContain("courses={[]}");
    expect(catalog).not.toContain("Siber Güvenlik");
    expect(catalog).not.toContain("Full-Stack");
    expect(catalog).not.toContain("AI Agent Mimarlığı");
    expect(catalog).not.toContain("overlayStudioGrowthLearnerBoard");
    expect(catalog).not.toContain("FilterBar");
    expect(catalog).not.toContain("SETTLED");
    expect(catalog).not.toContain("amountMinor");

    expect(readSrc("archived/academy/components/course-list.tsx")).not.toContain("FilterBar");
    expect(readSrc("archived/academy/components/course-list.tsx")).toContain("CourseCard");
    expect(readSrc("archived/academy/components/course-list.tsx")).not.toContain("AcademyPilotPath");
    expect(readSrc("archived/academy/components/course-list.tsx")).toContain("orderAcademyCatalogByCurriculum");
    expect(readSrc("archived/academy/components/course-list.tsx")).not.toContain("groupAcademyCatalogBySeries");
    expect(readSrc("archived/academy/components/course-list.tsx")).not.toContain("seriesPath");
    expect(readSrc("archived/academy/components/course-list.tsx")).toContain(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    );
    expect(readSrc("archived/academy/components/course-list.tsx")).toContain("ACADEMY_FLAGSHIP_SKU_SLUG");
    expect(readSrc("archived/academy/app/page.tsx")).not.toContain("academy-catalog-viewport-lock");
    expect(readSrc("archived/academy/app/page.tsx")).toContain("LegalColophonStrip");
    expect(readSrc("archived/academy/components/course-card.tsx")).not.toContain("MarketPopularityBadge");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("academyModuleCodeBySlug");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("academyCatalogSummaryBySlug");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("academyCourseHasSealedAudio");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("academyCourseCoverPath");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("coverSrc");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("ctaSize");
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("data-academy-catalog-cover");
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("data-academy-catalog-cta");
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("CourseCoverImage");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("data-academy-audio-badge");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("data-academy-coming-soon-badge");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("cardMetaNarration");
    expect(readSrc("archived/academy/components/course-card.tsx")).not.toContain("cardMetaAudio");
    expect(readSrc("archived/academy/components/course-card.tsx")).not.toContain("min-h-[40rem]");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("academyModuleCodeBySlug");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("academyCourseHasSealedAudio");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("CurriculumOutcomes");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("academyAntreVisaPromise");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("data-academy-checkout-cta");
    expect(copy.outline.examShield).toContain("8 dersin tamamı bitirilmeden");
    expect(copy.outline.visaPromise(70, "Ofis Verimliliği", "excel-veri-otomasyon")).toContain(
      "Uzmanlık Portföyüne",
    );
    expect(copy.course.purchaseBody).toContain(copy.outline.examShield);
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain("data-academy-hero-identity");
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain("heroAudioBadge");
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain("comingSoonHint");
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain("data-academy-hero-coming-soon");
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain("data-academy-hero-paytr");
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain("buyPriced");
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain('size="lg"');
    expect(readSrc("archived/academy/components/course-hero-actions.tsx")).toContain("data-academy-price-lead");
    expect(readSrc("archived/academy/components/course-card.tsx")).toContain("audioBadgeHint");
    expect(readSrc("archived/academy/components/course-card.tsx")).not.toContain("hasAudio = true");
    expect(readSrc("archived/academy/components/course-list.tsx")).not.toContain("Sesli");
    expect(existsSync(join(ROOT, "archived/academy/components/level-pathway.tsx"))).toBe(false);
    expect(existsSync(join(ROOT, "archived/academy/components/filter-bar.tsx"))).toBe(false);

    expect(copy.catalog.cardLevelContext("Temel", academyModuleCodeBySlug("python-temel"))).toBe(
      "Temel",
    );
    expect(copy.catalog.cardLevelContext("Temel", academyModuleCodeBySlug("sample-course"))).toBe(
      "Temel",
    );

    expect(readSrc("lib/academy/lesson-listen.ts")).toContain("ACADEMY_LESSON_LISTEN_ENABLED = false");
    expect(readSrc("app/api/academy/courses/[id]/listen/route.ts")).toContain("410");
    expect(readSrc("lib/academy/curriculum.ts")).not.toContain("CheckoutPriceLock");
  });

  it("sınav yüzeyi dondurulmuş durur; idor-exam silinmez", () => {
    expect(existsSync(join(ROOT, "archived/academy/tests/idor-exam-purchase.test.ts"))).toBe(true);
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).toContain("ExamStartGate");
    expect(readSrc("archived/academy/app/[slug]/page.tsx")).not.toContain("ExamPanel");
    expect(readSrc("archived/academy/components/exam-start-gate.tsx")).toContain("ExamPanel");
  });
});
