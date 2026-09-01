import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import {
  academyModuleCodeBySlug,
  academySpokenModuleCode,
  groupAcademyCatalogBySeries,
  orderAcademyCatalogByCurriculum,
} from "@/lib/academy/catalog-filter";
import {
  parseAcademyCatalogViewMode,
  ACADEMY_CATALOG_DEFAULT_VIEW,
} from "@/lib/academy/catalog-view-pref";
import {
  parseAcademyCatalogFavorites,
  isAcademyCatalogFavorite,
} from "@/lib/academy/catalog-favorites";
import { academyCatalogStatusLabel } from "@/lib/academy/catalog-learner";

describe("akademi katalog sıra yardımcısı", () => {
  it("mühürlü vitrin SKU müfredat sırasına kilitlenir; trendScore okunmaz", () => {
    const slugs = orderAcademyCatalogByCurriculum(
      ACADEMY_COURSE_SEEDS.map((row) => ({ slug: row.slug, level: row.level })),
    ).map((row) => row.slug);
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
    expect(slugs.map((slug) => academyModuleCodeBySlug(slug))).toEqual([
      "AI-101",
      "AI-102",
      "AI-103",
      "PY-101",
      "PY-102",
      "PY-103",
      "FS-101",
      "FS-102",
      "FS-103",
      "SEC-101",
      "SEC-102",
      "SEC-103",
      "YZ-101",
      "UX-MC",
      "EXC-MC",
      "GADS-MC",
      "META-MC",
      "ETIC-MC",
      "CNV-MC",
      "LNK-MC",
    ]);
    expect(existsSync(join(process.cwd(), "components/academy/filter-bar.tsx"))).toBe(false);
  });

  it("aynı dikeyde 101→102→103; karışık dikey kendi bloğunu korur", () => {
    expect(
      orderAcademyCatalogByCurriculum([
        { slug: "python-ileri" },
        { slug: "python-temel" },
        { slug: "python-orta" },
      ]).map((row) => row.slug),
    ).toEqual(["python-temel", "python-orta", "python-ileri"]);

    expect(
      orderAcademyCatalogByCurriculum([
        { slug: "devops-ileri" },
        { slug: "python-orta" },
        { slug: "devops-temel" },
        { slug: "python-temel" },
        { slug: "devops-orta" },
        { slug: "python-ileri" },
      ]).map((row) => row.slug),
    ).toEqual([
      "python-temel",
      "python-orta",
      "python-ileri",
      "devops-temel",
      "devops-orta",
      "devops-ileri",
    ]);
  });

  it("seri rafları Temel → Orta → İleri üçlüsünü dikeyde tutar", () => {
    const shelves = groupAcademyCatalogBySeries([
      { slug: "python-temel" },
      { slug: "python-orta" },
      { slug: "python-ileri" },
      { slug: "devops-temel" },
      { slug: "devops-orta" },
      { slug: "devops-ileri" },
    ]);
    expect(shelves.map((shelf) => shelf.key)).toEqual(["python", "devops"]);
    expect(shelves[0]?.courses.map((row) => row.slug)).toEqual([
      "python-temel",
      "python-orta",
      "python-ileri",
    ]);
    expect(shelves[1]?.courses.map((row) => row.slug)).toEqual([
      "devops-temel",
      "devops-orta",
      "devops-ileri",
    ]);
    expect(shelves[0]?.title).toBe("Python ile Yazılım ve Veri Mühendisliği");
    expect(groupAcademyCatalogBySeries([{ slug: "python-temel" }])[0]?.courses).toHaveLength(1);
    expect(
      groupAcademyCatalogBySeries([
        { slug: "python-ileri" },
        { slug: "python-temel" },
        { slug: "python-orta" },
      ])[0]?.courses.map((row) => row.slug),
    ).toEqual(["python-temel", "python-orta", "python-ileri"]);
  });

  it("Siber Güvenlik rafı sabit öncelikte dördüncü dikeydir; SEC-101 ilk, SEC-102 ikinci, SEC-103 üçüncü karttır", () => {
    const ordered = groupAcademyCatalogBySeries(
      orderAcademyCatalogByCurriculum([
        { slug: "python-temel" },
        { slug: "fullstack-temel" },
        { slug: "security-ileri" },
        { slug: "security-orta" },
        { slug: "security-temel" },
        { slug: "ai-agent-temel" },
      ]),
    );
    expect(ordered.map((shelf) => shelf.key)).toEqual(["ai-agent", "python", "fullstack", "security"]);
    expect(ordered[3]?.title).toBe("Siber Güvenlik ve Sızma Testi (Ethical Hacking)");
    expect(ordered[3]?.courses.map((row) => row.slug)).toEqual([
      "security-temel",
      "security-orta",
      "security-ileri",
    ]);
    expect(academyModuleCodeBySlug("security-temel")).toBe("SEC-101");
    expect(academyModuleCodeBySlug("security-orta")).toBe("SEC-102");
    expect(academyModuleCodeBySlug("security-ileri")).toBe("SEC-103");
    expect(academySpokenModuleCode("security-temel")).toBe("Siber Güvenlik yüz bir");
    expect(academySpokenModuleCode("security-orta")).toBe("Siber Güvenlik yüz iki");
    expect(academySpokenModuleCode("security-ileri")).toBe("Siber Güvenlik yüz üç");
  });

  it("Full-Stack Web Geliştirme rafı sabit öncelikte üçüncü dikeydir; FS-101 ilk, FS-102 ikinci, FS-103 üçüncü karttır", () => {
    const ordered = groupAcademyCatalogBySeries(
      orderAcademyCatalogByCurriculum([
        { slug: "python-temel" },
        { slug: "ai-agent-temel" },
        { slug: "fullstack-orta" },
        { slug: "fullstack-ileri" },
        { slug: "fullstack-temel" },
      ]),
    );
    expect(ordered.map((shelf) => shelf.key)).toEqual(["ai-agent", "python", "fullstack"]);
    expect(ordered[2]?.title).toBe("Full-Stack Web Geliştirme");
    expect(ordered[2]?.courses.map((row) => row.slug)).toEqual([
      "fullstack-temel",
      "fullstack-orta",
      "fullstack-ileri",
    ]);
  });

  it("AI Agent Mimarlığı rafı amiral gemisidir; girdi sırası / created_at okunmaz, İleri 3. sütundadır", () => {
    const shelves = groupAcademyCatalogBySeries([
      { slug: "python-temel" },
      { slug: "ai-agent-temel" },
      { slug: "python-orta" },
    ]);
    expect(shelves.map((shelf) => shelf.key)).toEqual(["ai-agent", "python"]);
    const ordered = groupAcademyCatalogBySeries(
      orderAcademyCatalogByCurriculum([
        { slug: "python-ileri" },
        { slug: "ai-agent-orta" },
        { slug: "ai-agent-ileri" },
        { slug: "ai-agent-temel" },
        { slug: "python-temel" },
      ]),
    );
    expect(ordered.map((shelf) => shelf.key)).toEqual(["ai-agent", "python"]);
    expect(ordered[0]?.title).toBe("AI Agent Mimarlığı");
    expect(ordered[0]?.courses.map((row) => row.slug)).toEqual([
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
    ]);
  });

  it("seri rafları sabit önceliğe kilitlenir; created_at benzeri karışık girdi okunmaz", () => {
    const shuffled = groupAcademyCatalogBySeries([
      { slug: "security-orta" },
      { slug: "fullstack-ileri" },
      { slug: "python-temel" },
      { slug: "ai-agent-ileri" },
      { slug: "security-temel" },
      { slug: "fullstack-temel" },
      { slug: "python-ileri" },
      { slug: "ai-agent-temel" },
      { slug: "fullstack-orta" },
      { slug: "python-orta" },
      { slug: "security-ileri" },
      { slug: "ai-agent-orta" },
    ]);
    expect(shuffled.map((shelf) => shelf.key)).toEqual(["ai-agent", "python", "fullstack", "security"]);
    expect(shuffled.map((shelf) => shelf.title)).toEqual([
      "AI Agent Mimarlığı",
      "Python ile Yazılım ve Veri Mühendisliği",
      "Full-Stack Web Geliştirme",
      "Siber Güvenlik ve Sızma Testi (Ethical Hacking)",
    ]);
  });

  it("Tekil Beceriler & Masterclass rafı en alttadır; EXC-MC ilk, ardından Ads, E-Ticaret, Canva, LinkedIn", () => {
    const shelves = groupAcademyCatalogBySeries([
      { slug: "linkedin-masterclass", level: "Masterclass" },
      { slug: "meta-ads-masterclass", level: "Masterclass" },
      { slug: "canva-masterclass", level: "Masterclass" },
      { slug: "excel-masterclass", level: "Masterclass" },
      { slug: "eticaret-masterclass", level: "Masterclass" },
      { slug: "google-ads-masterclass", level: "Masterclass" },
      { slug: "security-temel" },
      { slug: "python-temel" },
      { slug: "ai-agent-temel" },
      { slug: "fullstack-temel" },
    ]);
    expect(shelves.map((shelf) => shelf.key)).toEqual([
      "ai-agent",
      "python",
      "fullstack",
      "security",
      "excel",
    ]);
    expect(shelves.at(-1)?.title).toBe("Tekil Beceriler & Masterclass");
    expect(shelves.at(-1)?.courses.map((row) => row.slug)).toEqual([
      "excel-masterclass",
      "google-ads-masterclass",
      "meta-ads-masterclass",
      "eticaret-masterclass",
      "canva-masterclass",
      "linkedin-masterclass",
    ]);
    expect(academyModuleCodeBySlug("excel-masterclass")).toBe("EXC-MC");
    expect(academySpokenModuleCode("excel-masterclass")).toBe("Excel usta sınıfı");
    expect(academyModuleCodeBySlug("google-ads-masterclass")).toBe("GADS-MC");
    expect(academySpokenModuleCode("google-ads-masterclass")).toBe("Google Ads usta sınıfı");
    expect(academyModuleCodeBySlug("meta-ads-masterclass")).toBe("META-MC");
    expect(academySpokenModuleCode("meta-ads-masterclass")).toBe("Meta usta sınıfı");
    expect(academyModuleCodeBySlug("eticaret-masterclass")).toBe("ETIC-MC");
    expect(academySpokenModuleCode("eticaret-masterclass")).toBe("E-Ticaret usta sınıfı");
    expect(academyModuleCodeBySlug("canva-masterclass")).toBe("CNV-MC");
    expect(academySpokenModuleCode("canva-masterclass")).toBe("Canva usta sınıfı");
    expect(academyModuleCodeBySlug("linkedin-masterclass")).toBe("LNK-MC");
    expect(academySpokenModuleCode("linkedin-masterclass")).toBe("LinkedIn usta sınıfı");
  });

  it("modül kodu kart SKU’sudur; konuşma biçimi harf harf okumaz", () => {
    expect(academyModuleCodeBySlug("python-temel")).toBe("PY-101");
    expect(academyModuleCodeBySlug("fullstack-temel")).toBe("FS-101");
    expect(academyModuleCodeBySlug("fullstack-orta")).toBe("FS-102");
    expect(academyModuleCodeBySlug("fullstack-ileri")).toBe("FS-103");
    expect(academyModuleCodeBySlug("ux-temel")).toBe("UX-MC");
    expect(academyModuleCodeBySlug("ai-temel")).toBe("YZ-101");
    expect(academySpokenModuleCode("ai-temel")).toBe("Yapay Zekâ Veri yüz bir");
    expect(academySpokenModuleCode("python-temel")).toBe("Python yüz bir");
    expect(academySpokenModuleCode("fullstack-temel")).toBe("Full-Stack yüz bir");
    expect(academySpokenModuleCode("fullstack-orta")).toBe("Full-Stack yüz iki");
    expect(academySpokenModuleCode("fullstack-ileri")).toBe("Full-Stack yüz üç");
    expect(academySpokenModuleCode("ai-agent-temel")).toBe("Yapay Zekâ yüz bir");
    expect(academySpokenModuleCode("ai-agent-orta")).toBe("Yapay Zekâ yüz iki");
    expect(academySpokenModuleCode("ai-agent-ileri")).toBe("Yapay Zekâ yüz üç");
    expect(academyModuleCodeBySlug("security-temel")).toBe("SEC-101");
    expect(academyModuleCodeBySlug("security-orta")).toBe("SEC-102");
    expect(academyModuleCodeBySlug("security-ileri")).toBe("SEC-103");
    expect(academySpokenModuleCode("security-temel")).toBe("Siber Güvenlik yüz bir");
    expect(academySpokenModuleCode("security-orta")).toBe("Siber Güvenlik yüz iki");
    expect(academySpokenModuleCode("security-ileri")).toBe("Siber Güvenlik yüz üç");
    expect(academySpokenModuleCode("ux-temel")).toBe("Tasarım usta sınıfı");
    expect(academyModuleCodeBySlug("excel-masterclass")).toBe("EXC-MC");
    expect(academySpokenModuleCode("excel-masterclass")).toBe("Excel usta sınıfı");
    expect(academyModuleCodeBySlug("google-ads-masterclass")).toBe("GADS-MC");
    expect(academySpokenModuleCode("google-ads-masterclass")).toBe("Google Ads usta sınıfı");
    expect(academyModuleCodeBySlug("meta-ads-masterclass")).toBe("META-MC");
    expect(academySpokenModuleCode("meta-ads-masterclass")).toBe("Meta usta sınıfı");
    expect(academyModuleCodeBySlug("eticaret-masterclass")).toBe("ETIC-MC");
    expect(academySpokenModuleCode("eticaret-masterclass")).toBe("E-Ticaret usta sınıfı");
    expect(academyModuleCodeBySlug("canva-masterclass")).toBe("CNV-MC");
    expect(academySpokenModuleCode("canva-masterclass")).toBe("Canva usta sınıfı");
    expect(academyModuleCodeBySlug("linkedin-masterclass")).toBe("LNK-MC");
    expect(academySpokenModuleCode("linkedin-masterclass")).toBe("LinkedIn usta sınıfı");
  });

  it("görünüm / favori / öğrenen rozeti süzgeç UI’sına bağlı değildir", () => {
    expect(parseAcademyCatalogViewMode("list")).toBe("list");
    expect(parseAcademyCatalogViewMode("weird")).toBe(ACADEMY_CATALOG_DEFAULT_VIEW);
    expect(parseAcademyCatalogFavorites('["python-temel"]')).toEqual(["python-temel"]);
    expect(isAcademyCatalogFavorite("python-temel", ["python-temel"])).toBe(true);
    expect(academyCatalogStatusLabel("continue")).toBe("Devam Et");
  });
});
