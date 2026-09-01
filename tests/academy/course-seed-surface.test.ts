import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_LEGACY_PURGE_CATALOG_UNITS,
  ACADEMY_LEGACY_PURGE_COURSE_IDS,
  ACADEMY_SEED_CURRENCY,
  ACADEMY_SEED_MODULE_KEY,
} from "@/lib/academy/seed";
import {
  ACADEMY_CATALOG_PRICE_MINOR,
  ACADEMY_CATALOG_PRICE_WINDOW,
} from "@/lib/academy/catalog-pricing";
import {
  isAcademyCourseLevel,
  resolveAcademySeedMoney,
} from "@/lib/academy/course-level";
import {
  ACADEMY_EXAM_PASS_SCORE,
  gradeAcademyExam,
  parseAcademyExamQuestions,
  serializeAcademyExamQuestions,
} from "@/lib/academy/exam";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function academySeedSql(): string {
  const dir = join(ROOT, "supabase", "migrations");
  const file = readdirSync(dir).find((name) => name.endsWith("academy_course_seed.sql"));
  expect(file).toBe("20260814090000_academy_course_seed.sql");
  return readFileSync(join(dir, file!), "utf8");
}

function extractDollarBlob(sql: string, tag: string): string {
  const open = `$${tag}$`;
  const start = sql.indexOf(open);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = sql.indexOf(open, start + open.length);
  expect(end).toBeGreaterThan(start);
  return sql.slice(start + open.length, end);
}

describe("akademi kurs tohumu yüzeyi", () => {
  it("serbest tutar ve seviye etiketi — maktu bant / kapalı enum kilidi yoktur", () => {
    const master = resolveAcademySeedMoney({
      amountMinor: 249_000,
      level: "Masterclass",
    });
    expect(master.amountMinor).toBe(249_000);
    expect(master.minMinor).toBe(1);
    expect(master.maxMinor).toBeGreaterThanOrEqual(249_000);
    expect(isAcademyCourseLevel("Masterclass")).toBe(true);
    expect(isAcademyCourseLevel("Modül-1")).toBe(true);
    expect(isAcademyCourseLevel("")).toBe(false);
  });

  it("mühürlü Python Temel tohumu taşır; sınav havuzu ≥10 soru, fiyat kurs satırında değil katalog birimindedir", () => {
    expect(ACADEMY_COURSE_SEEDS).toHaveLength(20);
    expect(ACADEMY_SEED_MODULE_KEY).toBe(ACADEMY_MODULE_KEY);
    expect(ACADEMY_SEED_CURRENCY).toBe("TRY");
    const slugs = ACADEMY_COURSE_SEEDS.map((row) => row.slug);
    expect(slugs).toEqual([
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
      "python-temel",
      "python-orta",
      "python-ileri",
      "fullstack-temel",
      "fullstack-orta",
      "fullstack-ileri",
      "security-temel",
      "security-orta",
      "security-ileri",
      "ai-temel",
      "ux-temel",
      "excel-masterclass",
      "google-ads-masterclass",
      "meta-ads-masterclass",
      "eticaret-masterclass",
      "canva-masterclass",
      "linkedin-masterclass",
    ]);
    expect(slugs).toContain("ai-temel");
    expect(slugs).toContain("ux-temel");
    expect(slugs).not.toContain("rail-temel");
    expect(slugs).not.toContain("yz-icerik-gorsel-uretim");
    const securityTemel = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "security-temel");
    expect(securityTemel?.title).toBe("Siber Güvenlik Temelleri, Ağ Güvenliği ve AÇS (OWASP)");
    expect(securityTemel?.level).toBe("Temel");
    expect(securityTemel?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["security-temel"]);
    expect(securityTemel?.catalogSortOrder).toBe(10);
    expect(securityTemel?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const securityOrta = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "security-orta");
    expect(securityOrta?.title).toBe("Uygulamalı Sızma Testi, Ağ Analizi ve Web Zafiyet Mimarisi");
    expect(securityOrta?.level).toBe("Orta");
    expect(securityOrta?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["security-orta"]);
    expect(securityOrta?.catalogSortOrder).toBe(11);
    expect(securityOrta?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const securityIleri = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "security-ileri");
    expect(securityIleri?.title).toBe(
      "İleri Düzey DevSecOps, Bulut Güvenliği ve Olay Müdahalesi (Incident Response)",
    );
    expect(securityIleri?.level).toBe("İleri");
    expect(securityIleri?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["security-ileri"]);
    expect(securityIleri?.catalogSortOrder).toBe(12);
    expect(securityIleri?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const excelMc = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "excel-masterclass");
    expect(excelMc?.title).toBe(
      "Sıfırdan Uygulamalı Excel ve Yapay Zekâ Destekli Veri Analizi Masterclass",
    );
    expect(excelMc?.level).toBe("Masterclass");
    expect(excelMc?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["excel-masterclass"]);
    expect(excelMc?.catalogSortOrder).toBe(15);
    expect(excelMc?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const googleAdsMc = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "google-ads-masterclass");
    expect(googleAdsMc?.title).toBe("A’dan Z’ye Google Ads ve Arama Motoru Pazarlaması Masterclass");
    expect(googleAdsMc?.level).toBe("Masterclass");
    expect(googleAdsMc?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["google-ads-masterclass"]);
    expect(googleAdsMc?.catalogSortOrder).toBe(16);
    expect(googleAdsMc?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const metaAdsMc = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "meta-ads-masterclass");
    expect(metaAdsMc?.title).toBe(
      "Meta Business Suite ile Instagram ve Facebook Reklamcılığı Masterclass",
    );
    expect(metaAdsMc?.level).toBe("Masterclass");
    expect(metaAdsMc?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["meta-ads-masterclass"]);
    expect(metaAdsMc?.catalogSortOrder).toBe(17);
    expect(metaAdsMc?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const eticaretMc = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "eticaret-masterclass");
    expect(eticaretMc?.title).toBe("Sıfırdan E-Ticaret ve Pazar Yeri Yönetimi Masterclass");
    expect(eticaretMc?.level).toBe("Masterclass");
    expect(eticaretMc?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["eticaret-masterclass"]);
    expect(eticaretMc?.catalogSortOrder).toBe(18);
    expect(eticaretMc?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const canvaMc = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "canva-masterclass");
    expect(canvaMc?.title).toBe("Canva ve Yapay Zekâ İle Dijital Tasarım Masterclass");
    expect(canvaMc?.level).toBe("Masterclass");
    expect(canvaMc?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["canva-masterclass"]);
    expect(canvaMc?.catalogSortOrder).toBe(19);
    expect(canvaMc?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const linkedinMc = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "linkedin-masterclass");
    expect(linkedinMc?.title).toBe("LinkedIn İle Profesyonel Marka İnşası ve B2B Müşteri Bulma Masterclass");
    expect(linkedinMc?.level).toBe("Masterclass");
    expect(linkedinMc?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["linkedin-masterclass"]);
    expect(linkedinMc?.catalogSortOrder).toBe(20);
    expect(linkedinMc?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const fullstackTemel = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "fullstack-temel");
    expect(fullstackTemel?.title).toBe(
      "Modern Web Geliştirme Temelleri (HTML, CSS, JavaScript ve TypeScript)",
    );
    expect(fullstackTemel?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["fullstack-temel"]);
    expect(fullstackTemel?.catalogSortOrder).toBe(7);
    expect(fullstackTemel?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const fullstackOrta = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "fullstack-orta");
    expect(fullstackOrta?.title).toBe("React, Node.js ve PostgreSQL ile Modern Uygulama Geliştirme");
    expect(fullstackOrta?.level).toBe("Orta");
    expect(fullstackOrta?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["fullstack-orta"]);
    expect(fullstackOrta?.catalogSortOrder).toBe(8);
    expect(fullstackOrta?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const fullstackIleri = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "fullstack-ileri");
    expect(fullstackIleri?.title).toBe(
      "İleri Düzey Full-Stack Mimari: Next.js App Router, Microservices, Docker ve CI/CD",
    );
    expect(fullstackIleri?.level).toBe("İleri");
    expect(fullstackIleri?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["fullstack-ileri"]);
    expect(fullstackIleri?.catalogSortOrder).toBe(9);
    expect(fullstackIleri?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const aiAgent = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "ai-agent-temel");
    expect(aiAgent?.title).toBe("AI Agent Mimarlığı ve Otonom Sistemlere Giriş");
    expect(aiAgent?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["ai-agent-temel"]);
    expect(aiAgent?.catalogSortOrder).toBe(1);
    expect(aiAgent?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const aiAgentOrta = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "ai-agent-orta");
    expect(aiAgentOrta?.title).toBe("Çoklu AI Agent Sistemleri ve RAG Mimarisi");
    expect(aiAgentOrta?.level).toBe("Orta");
    expect(aiAgentOrta?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["ai-agent-orta"]);
    expect(aiAgentOrta?.catalogSortOrder).toBe(2);
    expect(aiAgentOrta?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const aiAgentIleri = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "ai-agent-ileri");
    expect(aiAgentIleri?.title).toBe(
      "İleri Düzey AI Agent Mimarisi, LangGraph ve Otonom Sistem Güvenliği",
    );
    expect(aiAgentIleri?.level).toBe("İleri");
    expect(aiAgentIleri?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["ai-agent-ileri"]);
    expect(aiAgentIleri?.catalogSortOrder).toBe(3);
    expect(aiAgentIleri?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const pythonTemel = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "python-temel");
    expect(pythonTemel?.title).toBe("Python ile Programlama ve Problem Çözme");
    expect(pythonTemel?.summary).toBe(
      "Python ile programlamanın temelleri, kontrol akışları, fonksiyonlar ve veri yapıları.",
    );
    expect(pythonTemel?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["python-temel"]);
    expect(pythonTemel?.seedMinMinor).toBe(ACADEMY_CATALOG_PRICE_WINDOW.minMinor);
    expect(pythonTemel?.seedMaxMinor).toBe(ACADEMY_CATALOG_PRICE_WINDOW.maxMinor);
    expect(pythonTemel?.trendScore).toBe(1);
    expect(pythonTemel?.catalogSortOrder).toBe(4);
    expect(pythonTemel?.exam.questions.length).toBeGreaterThanOrEqual(10);
    expect(pythonTemel?.exam.passScore).toBe(ACADEMY_EXAM_PASS_SCORE);
    expect(pythonTemel?.exam.questions.some((q) => q.correctIndex === 1)).toBe(true);
    const pythonOrta = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "python-orta");
    expect(pythonOrta?.title).toBe("Python ile Nesne Yönelimli Programlama ve Veri İşleme");
    expect(pythonOrta?.level).toBe("Orta");
    expect(pythonOrta?.catalogSortOrder).toBe(5);
    expect(pythonOrta?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const aiTemel = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "ai-temel");
    expect(aiTemel?.title).toBe("Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi)");
    expect(aiTemel?.level).toBe("Temel");
    expect(aiTemel?.catalogSortOrder).toBe(13);
    expect(aiTemel?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const uxTemel = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "ux-temel");
    expect(uxTemel?.title).toBe("Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass)");
    expect(uxTemel?.level).toBe("Masterclass");
    expect(uxTemel?.catalogSortOrder).toBe(14);
    expect(uxTemel?.exam.questions.length).toBeGreaterThanOrEqual(10);
    const pythonIleri = ACADEMY_COURSE_SEEDS.find((row) => row.slug === "python-ileri");
    expect(pythonIleri?.title).toBe(
      "Python ile İleri Düzey Mimari, Asenkron Programlama ve Performans",
    );
    expect(pythonIleri?.level).toBe("İleri");
    expect(pythonIleri?.catalogSortOrder).toBe(6);
    expect(pythonIleri?.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR["python-ileri"]);
    expect(pythonIleri?.exam.questions.length).toBeGreaterThanOrEqual(10);
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(row.catalogUnitKey.startsWith("course:")).toBe(true);
      expect(row.seedAmountMinor).toBe(ACADEMY_CATALOG_PRICE_MINOR[row.slug]);
      expect(row.seedMinMinor).toBe(ACADEMY_CATALOG_PRICE_WINDOW.minMinor);
      expect(row.seedMaxMinor).toBe(ACADEMY_CATALOG_PRICE_WINDOW.maxMinor);
      expect(row.level.trim().length).toBeGreaterThan(0);
      expect(row.globalRank).toBeGreaterThan(0);
      expect(row.localRank).toBeGreaterThan(0);
      expect(row.trendScore).toBe(row.globalRank * row.localRank);
      expect(row.catalogSortOrder).toBeGreaterThan(0);
      expect(Number.isInteger(row.catalogSortOrder)).toBe(true);
      expect(row.exam.passScore).toBe(ACADEMY_EXAM_PASS_SCORE);
      expect(row.exam.questions.length).toBeGreaterThanOrEqual(4);
      expect(ACADEMY_LEGACY_PURGE_COURSE_IDS).not.toContain(row.id);
      expect(ACADEMY_LEGACY_PURGE_CATALOG_UNITS).not.toContain(row.catalogUnitKey);
    }
  });

  it("ops SQL sicil anahtarları, tutarlar ve müfredat JSON ile hizalıdır", () => {
    const sql = academySeedSql();
    expect(sql).toMatch(/ON CONFLICT \(module_key, unit_key\) DO UPDATE/);
    expect(sql).toMatch(/price_catalog_entries\.updated_by IS NOT NULL/);
    expect(sql).toMatch(/THEN price_catalog_entries\.amount_minor/);
    expect(sql).toMatch(/updated_by = price_catalog_entries\.updated_by/);
    expect(sql).toMatch(/ON CONFLICT \(id\) DO UPDATE/);
    expect(sql).toMatch(/ON CONFLICT \(course_id\) DO UPDATE/);
    expect(sql).not.toMatch(/INSERT INTO public\.academy_purchases/i);
    expect(sql).not.toMatch(/INSERT INTO public\.academy_certificates/i);
    expect(sql).not.toMatch(/INSERT INTO public\.users/i);
    expect(sql).not.toMatch(/INSERT INTO public\.career_visa_stamps/i);
    expect(sql).toContain("'academy'");

    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(sql).toContain(row.id);
      expect(sql).toContain(row.slug);
      expect(sql).toContain(row.title);
      expect(sql).toContain(row.summary);
      expect(sql).toContain(row.catalogUnitKey);
      expect(sql).toContain(row.catalogEntryId);
      expect(sql).toContain(String(row.seedAmountMinor));
      expect(sql).toContain(String(row.seedMinMinor));
      expect(sql).toContain(String(row.seedMaxMinor));
      expect(sql).toContain(row.exam.id);
      expect(sql).toContain(row.exam.title);
      const blob = extractDollarBlob(sql, row.exam.id);
      expect(blob).toBe(serializeAcademyExamQuestions(row.exam.questions));
      const parsed = parseAcademyExamQuestions(blob);
      expect(parsed).toHaveLength(row.exam.questions.length);
      const perfect = row.exam.questions.map((question) => ({
        questionId: question.id,
        choiceIndex: question.correctIndex,
      }));
      expect(gradeAcademyExam(parsed, perfect).score).toBe(100);
    }
  });

  it("vitrin loadPublishedCourses ile DB kursunu basar; örnek kart yalnız boş listede kalır", () => {
    const page = readSrc("app/academy/page.tsx");
    const load = readSrc("lib/academy/load-catalog.ts");
    const list = readSrc("components/academy/course-list.tsx");
    const detail = readSrc("app/academy/[slug]/page.tsx");

    expect(page).toContain("loadPublishedCourses");
    expect(page).toContain("load-catalog");
    expect(page).not.toContain("from \"@/lib/academy/curriculum\"");
    expect(page).not.toContain("curriculumForCourseSlug");
    expect(page).toContain("curriculumLessonCountForSlug");
    expect(page).toContain("SEN_VOICE");
    expect(page).not.toContain("overlayStudioGrowthLearnerBoard");
    expect(page).not.toContain("hasUnlimitedAcademyAccess");
    expect(page).not.toContain("ACADEMY_SHOWCASE");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain(
      "Eğitimler · Dersler ödeme sonrası açılır · Test barajı 70+ · Sertifika ve yetkinlik Kariyer sayfasına işlenir",
    );
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺690");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺990");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("₺1.490");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).not.toContain("Canlı sicil");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain("Piyasa Talep Skoru");
    expect(load).toContain("listPublishedCourses");
    expect(readSrc("lib/academy/prisma-store.ts")).toContain("orderAcademyCatalogByCurriculum");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("orderAcademyCatalogByCurriculum");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("byTrendScoreAsc");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("ACADEMY_SHOWCASE_PINNED_SLUGS");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("orderAcademyShowcaseCatalog");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("@/lib/academy/catalog-seed");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("@/lib/academy/seed\"");
    expect(readSrc("lib/academy/published-catalog.ts")).not.toContain("@/lib/academy/exam-pools");
    expect(readSrc("lib/academy/catalog-seed.ts")).not.toContain("@/lib/academy/exam-pools");
    expect(readSrc("lib/academy/load-catalog.ts")).not.toContain("@/lib/academy/exam-pools");
    expect(readSrc("lib/academy/seed.ts")).toContain("@/lib/academy/exam-pools");
    expect(load).toContain("ACADEMY_MODULE_KEY");
    expect(load).toContain("course.catalogUnitKey");
    expect(load).toContain("listActiveEntries");
    expect(load).toContain("ensurePrismaQueryEngine");
    expect(load).toContain("ACADEMY_CATALOG_READ_TIMEOUT_MS");
    expect(load).toContain("withDbReadTimeout");
    const priceLoader = load.slice(
      load.indexOf("loadPublishedCourses"),
      load.indexOf("loadAcademyCatalogLearnerBoard"),
    );
    expect(priceLoader).toContain("listActiveEntries");
    expect(priceLoader).not.toContain("withDbReadTimeout");
    expect(priceLoader).not.toContain("ACADEMY_CATALOG_READ_TIMEOUT_MS");
    expect(list).toContain("ACADEMY_SEN");
    expect(list).toContain("CourseCard");
    expect(list).toContain('surface = "catalog"');
    expect(list).toContain("groupAcademyCatalogBySeries");
    expect(list).toContain("md:grid-cols-3");
    expect(readSrc("components/academy/course-card.tsx")).toContain("resolveAcademyCatalogCardCta");
    expect(readSrc("lib/academy/storefront-cta.ts")).toContain("/academy/${input.slug}");
    expect(readSrc("components/academy/course-card.tsx")).not.toContain("MarketPopularityBadge");
    expect(readSrc("components/academy/course-card.tsx")).toContain('hit="card"');
    expect(readSrc("components/academy/course-card.tsx")).toContain("academyCatalogSummaryBySlug");
    expect(readSrc("components/academy/course-card.tsx")).not.toContain("Temel'den İleri");
    expect(readSrc("lib/academy/catalog-summaries.ts")).toContain(
      "Python ile programlamanın temelleri, kontrol akışları, fonksiyonlar ve veri yapıları.",
    );
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("6 Ders");
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("PEDAGOJI.md mühürlü");
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("12 bölüm");
    expect(readSrc("lib/academy/catalog-summaries.ts")).not.toContain("Temel'den İleri");
    expect(readSrc("lib/academy/published-catalog.ts")).toContain("summary: seed?.summary ?? course.summary");
    expect(readSrc("components/academy/level-pathway.tsx")).not.toContain("MarketPopularityBadge");
    expect(existsSync(join(ROOT, "components/academy/filter-bar.tsx"))).toBe(false);
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("justify-end");
    expect(list).toContain("courses.length === 0");
    expect(detail).toContain("loadCourseBySlug");
    expect(detail).toContain("hasCommercialAcademyEnrolment");
    expect(detail).not.toContain("hasCommercialAcademyEnrolment(purchase) ||");
    expect(detail).toContain("PurchaseButton");
    expect(detail).toContain("ExamStartGate");
    expect(detail).not.toContain("ExamPanel");
    expect(detail).not.toContain("AcademyPilotPath");
    expect(detail).not.toContain("CurriculumOutcomes");
    expect(detail).toContain("curriculumSyllabusForCourseSlug");
    expect(detail).toContain("AcademyProgressBar");
    expect(detail).toContain("libraryGuarantee");
    expect(detail).toContain("trainingHref");
    expect(detail).not.toContain("examHref");
    expect(detail).not.toContain("?gate=exam");
    expect(readSrc("lib/academy/purchase-path.ts")).toContain("Eğitimi Satın Al & Öğren");
    expect(readSrc("lib/academy/purchase-path.ts")).toContain("Doğrudan teste gir ve yetkinlik kazan");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("ExamPanel");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("role=\"dialog\"");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("data-academy-exam-exit");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain("Testi Başlat");
    expect(readSrc("lib/copy/sen-voice/academy.ts")).toContain(
      "Bu test ${minutes} dakika, baraj ${passScore}. Başla deyince süre işler.",
    );
    expect(detail).toContain("/oyna");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("CurriculumPlayer");
    expect(readSrc("lib/academy/index.ts")).toContain("curriculum");
  });
});
