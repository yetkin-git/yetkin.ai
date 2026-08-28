import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import {
  academyModuleCodeBySlug,
  academySpokenModuleCode,
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
  it("dört büyüme SKU müfredat sırasına kilitlenir; trendScore okunmaz", () => {
    const slugs = orderAcademyCatalogByCurriculum(
      ACADEMY_COURSE_SEEDS.map((row) => ({ slug: row.slug, level: row.level })),
    ).map((row) => row.slug);
    expect(slugs).toEqual(["python-temel", "ai-temel", "fullstack-temel", "ux-temel"]);
    expect(slugs.map((slug) => academyModuleCodeBySlug(slug))).toEqual([
      "PY-101",
      "AI-101",
      "FS-101",
      "UX-MC",
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

  it("modül kodu kart SKU’sudur; konuşma biçimi harf harf okumaz", () => {
    expect(academyModuleCodeBySlug("python-temel")).toBe("PY-101");
    expect(academyModuleCodeBySlug("fullstack-temel")).toBe("FS-101");
    expect(academyModuleCodeBySlug("ux-temel")).toBe("UX-MC");
    expect(academySpokenModuleCode("python-temel")).toBe("Python yüz bir");
    expect(academySpokenModuleCode("ux-temel")).toBe("Tasarım usta sınıfı");
  });

  it("görünüm / favori / öğrenen rozeti süzgeç UI’sına bağlı değildir", () => {
    expect(parseAcademyCatalogViewMode("list")).toBe("list");
    expect(parseAcademyCatalogViewMode("weird")).toBe(ACADEMY_CATALOG_DEFAULT_VIEW);
    expect(parseAcademyCatalogFavorites('["python-temel"]')).toEqual(["python-temel"]);
    expect(isAcademyCatalogFavorite("python-temel", ["python-temel"])).toBe(true);
    expect(academyCatalogStatusLabel("continue")).toBe("Devam Et");
  });
});
