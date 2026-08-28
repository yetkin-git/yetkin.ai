import { afterEach, describe, expect, it } from "vitest";
import {
  ACADEMY_GRANT_PURPOSE,
  createAcademyGrantPurchase,
  hasPurchased,
  hasUnlimitedAcademyAccess,
  hasAcademyArtifactAccess,
  hasAcademyPlayerAccess,
  isZeroFeeAcademyGrantOpen,
} from "@/lib/academy/access";
import { mergePublishedAcademyCatalog, publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const ADMIN_EMAIL = "admin@yetkin.test";
const ORIGINAL_ADMIN = process.env.SUPER_ADMIN_USER_ID;
const ORIGINAL_EMAIL = process.env.CANONICAL_SUPER_ADMIN_EMAIL;

describe("akademi Super Admin erişimi ve katalog birleştirme", () => {
  afterEach(() => {
    if (ORIGINAL_ADMIN == null) {
      delete process.env.SUPER_ADMIN_USER_ID;
    } else {
      process.env.SUPER_ADMIN_USER_ID = ORIGINAL_ADMIN;
    }
    if (ORIGINAL_EMAIL == null) {
      delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    } else {
      process.env.CANONICAL_SUPER_ADMIN_EMAIL = ORIGINAL_EMAIL;
    }
  });

  it("kanonik e-posta ve SUPER_ADMIN UUID hasPurchased / SETTLED bayrağını açar", () => {
    delete process.env.SUPER_ADMIN_USER_ID;
    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
    expect(hasUnlimitedAcademyAccess({ userId: ADMIN_ID, email: ADMIN_EMAIL })).toBe(true);
    expect(hasPurchased(null, { userId: ADMIN_ID, email: ADMIN_EMAIL })).toBe(true);
    expect(hasPurchased(null, { userId: ADMIN_ID, email: "vatandas@yetkin.rail" })).toBe(false);

    const expired = {
      ...createAcademyGrantPurchase("citizen-1", "ac_python_temel"),
      settledAt: new Date("2020-01-01T00:00:00.000Z"),
    };
    expect(
      hasPurchased(expired, { userId: "citizen-1", email: "vatandas@yetkin.rail" }, new Date("2026-08-22")),
    ).toBe(false);
    expect(hasAcademyArtifactAccess(expired, { userId: "citizen-1", email: "vatandas@yetkin.rail" })).toBe(
      true,
    );

    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    expect(hasUnlimitedAcademyAccess({ userId: ADMIN_ID, email: "vatandas@yetkin.rail" })).toBe(true);
    const grant = createAcademyGrantPurchase(ADMIN_ID, "ac_python_temel");
    expect(grant.status).toBe("SETTLED");
    expect(grant.amountMinor).toBe(0);
    expect(ACADEMY_GRANT_PURPOSE).toBe("academy-grant");
    expect(isZeroFeeAcademyGrantOpen()).toBe(true);
    expect(grant.priceLockId.startsWith("sa_grant:")).toBe(true);
    expect(hasAcademyPlayerAccess(null, { userId: ADMIN_ID, email: ADMIN_EMAIL })).toBe(true);
    expect(hasAcademyPlayerAccess(grant, { userId: ADMIN_ID, email: ADMIN_EMAIL })).toBe(true);
    expect(
      hasAcademyPlayerAccess(null, { userId: "citizen-1", email: "vatandas@yetkin.rail" }),
    ).toBe(false);
  });

  it("üretimde sıfır harçlı akademi bağışı kapalıdır", () => {
    expect(isZeroFeeAcademyGrantOpen("production")).toBe(false);
    expect(isZeroFeeAcademyGrantOpen("test")).toBe(true);
    expect(isZeroFeeAcademyGrantOpen("development")).toBe(true);
  });

  it("dört büyüme SKU tohumunu basar; müfredat kulvar sırasına kilitlenir", () => {
    const seeded = publishedCoursesFromSeed();
    expect(seeded).toHaveLength(4);
    expect(seeded.map((row) => row.slug)).toEqual([
      "python-temel",
      "ai-temel",
      "fullstack-temel",
      "ux-temel",
    ]);
    expect(seeded[0]?.trendScore).toBe(1);
    const sortOrders = ACADEMY_COURSE_SEEDS.map((row) => row.catalogSortOrder);
    expect(new Set(sortOrders).size).toBe(4);
    expect([...sortOrders].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
    expect(
      [...ACADEMY_COURSE_SEEDS]
        .sort((a, b) => a.catalogSortOrder - b.catalogSortOrder)
        .map((row) => row.slug),
    ).toEqual(seeded.map((row) => row.slug));
    for (const row of ACADEMY_COURSE_SEEDS) {
      expect(row.catalogSortOrder).toBeGreaterThan(0);
    }
    const partial = [
      {
        ...seeded[0]!,
        title: "Canlı başlık",
        priceMinor: toAmountMinor(1),
        trendScore: 0,
      },
    ];
    const merged = mergePublishedAcademyCatalog(partial);
    expect(merged).toHaveLength(4);
    expect(merged[0]?.title).toBe("Canlı başlık");
    expect(merged.find((row) => row.slug === "python-temel")?.title).toBe("Canlı başlık");
    const ghost = {
      ...seeded[0]!,
      id: "ac_rail_temel",
      slug: "rail-temel",
      title: "Hayalet SKU",
    };
    const sealed = mergePublishedAcademyCatalog([...partial, ghost]);
    expect(sealed).toHaveLength(4);
    expect(sealed.map((row) => row.slug)).toEqual([
      "python-temel",
      "ai-temel",
      "fullstack-temel",
      "ux-temel",
    ]);
    expect(sealed.some((row) => row.slug === "rail-temel")).toBe(false);
  });
});
