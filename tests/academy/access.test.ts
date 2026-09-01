import { afterEach, describe, expect, it } from "vitest";
import {
  ACADEMY_GRANT_PURPOSE,
  createAcademyAdminBypassPurchase,
  createAcademyGrantPurchase,
  hasAcademyAdminBypass,
  hasPurchased,
  hasUnlimitedAcademyAccess,
  hasAcademyArtifactAccess,
  hasAcademyPlayerAccess,
  isZeroFeeAcademyGrantOpen,
} from "@/lib/academy/access";
import { hasCommercialAcademyEnrolment } from "@/lib/academy/enrolment";
import { mergePublishedAcademyCatalog, publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
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

  it("ADMIN / SUPER_ADMIN satın almadan oynatıcıyı açar; vatandaş kapalı kalır", () => {
    delete process.env.SUPER_ADMIN_USER_ID;
    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
    expect(hasAcademyAdminBypass({ userId: ADMIN_ID, email: ADMIN_EMAIL })).toBe(true);
    expect(hasAcademyPlayerAccess(null, { userId: ADMIN_ID, email: ADMIN_EMAIL })).toBe(true);
    expect(hasPurchased(null, { userId: ADMIN_ID, email: ADMIN_EMAIL })).toBe(true);
    const preview = createAcademyAdminBypassPurchase(ADMIN_ID, "ac_python_temel");
    expect(preview.status).toBe("SETTLED");
    expect(preview.amountMinor).toBe(0);
    expect(hasCommercialAcademyEnrolment(preview)).toBe(false);
    expect(hasAcademyAdminBypass({ userId: ADMIN_ID, email: "vatandas@yetkin.rail" })).toBe(false);
    expect(hasAcademyPlayerAccess(null, { userId: "citizen-1", email: "vatandas@yetkin.rail" })).toBe(
      false,
    );
    expect(hasPurchased(null, { userId: "citizen-1", email: "vatandas@yetkin.rail" })).toBe(false);
  });

  it("mühürlü vitrin SKU tohumunu basar; şablon kartlar ve hayalet rail-temel girmez", () => {
    const seeded = publishedCoursesFromSeed();
    expect(seeded).toHaveLength(20);
    expect(seeded.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(seeded[0]?.trendScore).toBe(1);
    const sortOrders = ACADEMY_COURSE_SEEDS.map((row) => row.catalogSortOrder);
    expect(new Set(sortOrders).size).toBe(20);
    expect([...sortOrders].sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ]);
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
    expect(merged).toHaveLength(20);
    expect(merged[0]?.title).toBe("Canlı başlık");
    expect(merged.find((row) => row.slug === "ai-agent-temel")?.title).toBe("Canlı başlık");
    expect(merged[0]?.summary).toBe(seeded[0]!.summary);
    expect(merged[0]?.summary).toBe(
      "Büyük Dil Modeli ile otonom ajan farkı, yapılandırılmış çıktı, araç çağrısı, hafıza ve ReAct döngüsü; hava ve not ajanı.",
    );
    const staleCopy = mergePublishedAcademyCatalog([
      {
        ...seeded[0]!,
        summary: "Temel'den İleri kapanışa 12 bölüm",
        priceMinor: toAmountMinor(1),
      },
    ]);
    expect(staleCopy[0]?.summary).toBe(seeded[0]!.summary);
    expect(staleCopy[0]?.summary).not.toContain("12 bölüm");
    expect(staleCopy[0]?.summary).not.toContain("Temel'den İleri");
    const ghost = {
      ...seeded[0]!,
      id: "ac_rail_temel",
      slug: "rail-temel",
      title: "Hayalet SKU",
    };
    const sealed = mergePublishedAcademyCatalog([...partial, ghost]);
    expect(sealed).toHaveLength(20);
    expect(sealed.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(sealed.some((row) => row.slug === "rail-temel")).toBe(false);
    expect(sealed.some((row) => row.slug === "fullstack-temel")).toBe(true);
    expect(sealed.some((row) => row.slug === "ai-temel")).toBe(true);
    expect(sealed.some((row) => row.slug === "ux-temel")).toBe(true);
  });
});
