import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import {
  academyModuleCodeBySlug,
  groupAcademyCatalogBySeries,
  orderAcademyCatalogByCurriculum,
} from "@/lib/academy/catalog-filter";
import type { AcademyCatalogSortable } from "@/lib/academy/catalog-filter";
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
  it("mühürlü vitrin SKU amiral ofis kursunu sıraya koyar; trendScore okunmaz", () => {
    const slugs = orderAcademyCatalogByCurriculum(
      ACADEMY_COURSE_SEEDS.map((row) => ({ slug: row.slug, level: row.level })),
    ).map((row) => row.slug);
    expect(slugs).toEqual([
      "01_office_ai",
      "02_ecommerce_ai",
      "03_social_media_ai",
      "04_chatbot_nocode",
      "05_prompt_practice",
    ]);
    expect(slugs.map((slug) => academyModuleCodeBySlug(slug))).toEqual([
      "OFF-101",
      "EC-102",
      "SM-103",
      "BOT-104",
      "PR-105",
    ]);
    expect(existsSync(join(process.cwd(), "components/academy/filter-bar.tsx"))).toBe(false);
  });

  it("boş girdi boş raf üretir", () => {
    // Boş dizi literalinde generic `never`a düşer; açık tip argümanıyla daraltılır.
    expect(
      orderAcademyCatalogByCurriculum<AcademyCatalogSortable>([]).map((row) => row.slug),
    ).toEqual([]);
    expect(groupAcademyCatalogBySeries<AcademyCatalogSortable>([])).toEqual([]);
  });

  it("görünüm / favori / öğrenen rozeti süzgeç UI’sına bağlı değildir", () => {
    expect(parseAcademyCatalogViewMode("list")).toBe("list");
    expect(parseAcademyCatalogViewMode("weird")).toBe(ACADEMY_CATALOG_DEFAULT_VIEW);
    expect(parseAcademyCatalogFavorites('["sample-course"]')).toEqual(["sample-course"]);
    expect(isAcademyCatalogFavorite("sample-course", ["sample-course"])).toBe(true);
    expect(academyCatalogStatusLabel("completed")).toBe("Tamamlandı");
    expect(academyCatalogStatusLabel("continue")).toBe("Devam Et");
  });
});

