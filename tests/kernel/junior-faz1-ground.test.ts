import path from "node:path";
import { describe, expect, it } from "vitest";
import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { INDEPENDENT_ROOMS, VERTICAL_ROOMS } from "@/lib/dronlar/kayit";
import { JUNIOR_PILOT_COURSES } from "@/lib/junior/catalog";
import { JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import {
  ACADEMY_CANON_SKU_SLUGS,
  ACADEMY_STOREFRONT_EXTRA_TITLES,
} from "@yetkin/kernel/catalog-ids/course-slugs";
import {
  ACADEMY_LICENSE_SALE_SLUGS,
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
  ACADEMY_OFF201_STOREFRONT_SLUG,
} from "@/lib/academy/pilot-sku";
import { CURRICULUM_LESSON_KEYS_BY_SLUG } from "@/lib/kernel/catalog-ids/exam-path";
import {
  FROZEN_VITEST_ROOMS,
  LIVE_VITEST_ARCHIVE_ROOMS,
  railVitestAliases,
} from "../../vitest.aliases";

describe("Junior faz 1 zemin — kayıt defteri", () => {
  it("yetişkin kilitleri durur; Junior Akademi defterinde yoktur", () => {
    const cards: readonly { audience: string; slug: string }[] = COURSE_REGISTRY;
    const adults = cards.filter((row) => row.audience === "adult");
    const juniors = cards.filter((row) => row.audience === "junior");
    expect(adults).toHaveLength(14);
    expect(juniors).toHaveLength(0);
    expect(COURSE_REGISTRY).toHaveLength(14);
    const adultCards = COURSE_REGISTRY.filter((row) => row.audience === "adult");
    expect(adultCards.filter((row) => row.canon)).toHaveLength(13);
    expect(adultCards.filter((row) => !row.canon).map((row) => row.code)).toEqual(["OFF-201"]);
    expect(adultCards.filter((row) => row.passportListed)).toHaveLength(5);
    expect(adultCards.filter((row) => row.nativeListed)).toHaveLength(2);
    expect(ACADEMY_CANON_SKU_SLUGS).toHaveLength(13);
    expect(Object.keys(ACADEMY_STOREFRONT_EXTRA_TITLES)).toEqual(["01_office_ai_ileri"]);

    expect(VERTICAL_ROOMS.map((room) => room.id)).not.toContain("junior");
    expect(INDEPENDENT_ROOMS.map((room) => room.id)).toEqual(["junior"]);
    expect(JUNIOR_PILOT_COURSES.map((course) => course.slug)).toEqual([...JUNIOR_PILOT_SLUGS]);
    expect(JUNIOR_PILOT_COURSES.map((course) => course.code)).toEqual([
      "JR-06-MAT",
      "JR-06-FEN",
      "JR-06-TUR",
      "JR-06-ING-ANA",
    ]);
    for (const slug of JUNIOR_PILOT_SLUGS) {
      expect(ACADEMY_CANON_SKU_SLUGS).not.toContain(slug);
      expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).not.toContain(slug);
      expect(ACADEMY_LICENSE_SALE_SLUGS).not.toContain(slug);
      expect(CURRICULUM_LESSON_KEYS_BY_SLUG[slug]).toBeUndefined();
      expect(cards.some((row) => row.slug === slug)).toBe(false);
    }
    expect(ACADEMY_OFF201_STOREFRONT_SLUG).toBe("01_office_ai_ileri");
  });
});

describe("Junior faz 1 zemin — takma ad", () => {
  it("canlı Vitest Junior'u arşive bağlamaz; donmuş envanter bağlar", () => {
    const root = path.resolve(process.cwd());
    const live = railVitestAliases(root);
    const frozen = railVitestAliases(root, FROZEN_VITEST_ROOMS);
    const juniorTarget = (aliases: ReturnType<typeof railVitestAliases>) =>
      aliases.find((row) => row.find === "@/lib/junior");

    expect(LIVE_VITEST_ARCHIVE_ROOMS).not.toContain("junior");
    expect(FROZEN_VITEST_ROOMS).toContain("junior");
    expect(juniorTarget(live)).toBeUndefined();
    expect(juniorTarget(frozen)?.replacement).toBe(path.join(root, "archived", "lib", "junior"));
  });
});
