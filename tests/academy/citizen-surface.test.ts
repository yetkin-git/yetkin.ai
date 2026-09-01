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
  "app/academy/page.tsx",
  "app/academy/[slug]/page.tsx",
  "app/academy/[slug]/oyna/page.tsx",
  "app/(kernel)/cuzdan/page.tsx",
  "components/academy/curriculum-player.tsx",
  "components/academy/purchase-button.tsx",
  "lib/copy/sen-voice/academy.ts",
  "lib/copy/sen-voice/cuzdan.ts",
];

describe("akademi vatandaş yüzeyi — vitrin, kasa, oynatıcı, dinle kapalı", () => {
  it("/academy ve /cuzdan siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.cuzdan.closedLoopBody).toContain("Cüzdan Akademi tahsilatı içindir");
    expect(SEN_VOICE.cuzdan.closedLoopBody).not.toContain("Bakiyeniz");
    expect(SEN_VOICE.academy.catalog.description).toContain("Eğitimi incele");
    expect(PRICE_LOCK_GRACE_MINUTES).toBe(15);
    expect(PRICE_LOCK_GRACE_MS).toBe(PRICE_LOCK_GRACE_MINUTES * 60 * 1000);

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }

    expect(readSrc("app/academy/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/(kernel)/cuzdan/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("PurchaseButton");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("SettlementSteps");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("hasAcademyPlayerAccess");
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("/oyna");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("requirePageSession");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("hasPurchased");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("CurriculumPlayer");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/academy/curriculum-player.tsx")).toContain("completeLesson");
    expect(readSrc("components/academy/curriculum-player.tsx")).not.toContain("LessonListenButton");
  });

  it("vitrin kopyası defter jargonu ve süzgeç UI sızdırmaz; dinle kapalı", () => {
    const copy = SEN_VOICE.academy;
    const ledgerLeak = /SETTLED|amountMinor|CheckoutPriceLock|settlement|debit|escrow/i;
    expect(copy.catalog.description).toContain("Dersler ödeme sonrası açılır");
    expect(copy.catalog.description).not.toMatch(ledgerLeak);
    expect(copy.catalog.cardCtaBuy).toBe("Satın Al");
    expect(copy.catalog.audioBadge).toBe("Sesli");
    expect(copy.catalog.audioBadgeHint).toBe("Seslendirmeli İçerik");
    expect(copy.catalog.vatInclusiveHint).toBe("KDV dahil");
    expect(copy.catalog.priceVatInclusive("₺890,00")).toBe("₺890,00 · KDV dahil");
    expect(copy.course.heroBuyCta("₺890,00")).toBe("Eğitimi Satın Al — ₺890,00");
    expect(copy.purchase.cta("₺250,00")).toContain("Eğitimi Satın Al & Öğren");
    expect(copy.player.resumeCta).toBe("Kaldığın Yerden Devam Et");
    expect(copy.listen.cta).toBe("Dersi Dinle");
    expect(copy.player.completeCta).toBe("Dersi Tamamladım");
    expect(copy.exam.startCta(30, 70)).toBe("Testi Başlat");
    expect(copy.pilotPath.steps(70).map((step) => step.label)).toEqual([
      "Eğitimi Tamamla",
      "Testi Başlat",
      "Sertifika / Yetkinlik Kazan",
      "Kariyer sayfası",
    ]);
    expect(JSON.stringify(copy)).not.toContain("Mühür düşer");
    expect(JSON.stringify(copy)).not.toContain("Dikey vize");

    expect(ACADEMY_COURSE_TITLES["python-temel"]).not.toMatch(ledgerLeak);
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(row.title, row.slug).not.toMatch(ledgerLeak);
    }

    const catalog = readSrc("app/academy/page.tsx");
    expect(catalog).toContain("CourseList");
    expect(catalog).toContain("filterAcademyPilotCatalog");
    expect(catalog).not.toContain("overlayStudioGrowthLearnerBoard");
    expect(catalog).not.toContain("FilterBar");
    expect(catalog).not.toContain("SETTLED");
    expect(catalog).not.toContain("amountMinor");

    expect(readSrc("components/academy/course-list.tsx")).not.toContain("FilterBar");
    expect(readSrc("components/academy/course-list.tsx")).toContain("CourseCard");
    expect(readSrc("components/academy/course-list.tsx")).not.toContain("AcademyPilotPath");
    expect(readSrc("components/academy/course-list.tsx")).toContain("groupAcademyCatalogBySeries");
    expect(readSrc("components/academy/course-list.tsx")).toContain("md:grid-cols-3");
    expect(readSrc("components/academy/course-card.tsx")).not.toContain("MarketPopularityBadge");
    expect(readSrc("components/academy/course-card.tsx")).toContain("academyModuleCodeBySlug");
    expect(readSrc("components/academy/course-card.tsx")).toContain("academyCatalogSummaryBySlug");
    expect(readSrc("components/academy/course-card.tsx")).toContain("isAcademyMediaSealedSkuSlug");
    expect(readSrc("components/academy/course-card.tsx")).toContain("data-academy-audio-badge");
    expect(readSrc("components/academy/course-card.tsx")).toContain("audioBadgeHint");
    expect(readSrc("components/academy/level-pathway.tsx")).not.toContain("MarketPopularityBadge");
    expect(readSrc("components/academy/level-pathway.tsx")).not.toContain("trendScore");
    expect(readSrc("components/academy/level-pathway.tsx")).not.toContain("proofOfWorkHash");
    expect(existsSync(join(ROOT, "components/academy/filter-bar.tsx"))).toBe(false);

    expect(copy.catalog.cardLevelContext("Temel", academyModuleCodeBySlug("python-temel"))).toBe(
      "Temel · PY-101",
    );

    expect(readSrc("lib/academy/lesson-listen.ts")).toContain("ACADEMY_LESSON_LISTEN_ENABLED = false");
    expect(readSrc("app/api/academy/courses/[id]/listen/route.ts")).toContain("410");
    expect(readSrc("lib/academy/curriculum.ts")).not.toContain("CheckoutPriceLock");
  });

  it("sınav yüzeyi dondurulmuş durur; idor-exam silinmez", () => {
    expect(existsSync(join(ROOT, "tests/academy/idor-exam-purchase.test.ts"))).toBe(true);
    expect(readSrc("app/academy/[slug]/page.tsx")).toContain("ExamStartGate");
    expect(readSrc("app/academy/[slug]/page.tsx")).not.toContain("ExamPanel");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("ExamPanel");
  });
});
