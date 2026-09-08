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
      ...createAcademyGrantPurchase("citizen-1", "ac_sample_course"),
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
    const grant = createAcademyGrantPurchase(ADMIN_ID, "ac_sample_course");
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
    const preview = createAcademyAdminBypassPurchase(ADMIN_ID, "ac_sample_course");
    expect(preview.status).toBe("SETTLED");
    expect(preview.amountMinor).toBe(0);
    expect(hasCommercialAcademyEnrolment(preview)).toBe(false);
    expect(hasAcademyAdminBypass({ userId: ADMIN_ID, email: "vatandas@yetkin.rail" })).toBe(false);
    expect(hasAcademyPlayerAccess(null, { userId: "citizen-1", email: "vatandas@yetkin.rail" })).toBe(
      false,
    );
    expect(hasPurchased(null, { userId: "citizen-1", email: "vatandas@yetkin.rail" })).toBe(false);
  });

  it("mühürlü vitrin tohumu amiral SKU taşır; hayalet SKU girmez", () => {
    const seeded = publishedCoursesFromSeed();
    expect(seeded.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(seeded).toHaveLength(ACADEMY_GROWTH_SKU_SLUGS.length);
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    const ghost = {
      id: "ac_rail_temel",
      slug: "rail-temel",
      title: "Hayalet SKU",
      summary: "ghost",
      catalogUnitKey: "course:rail-temel",
      globalRank: 1,
      localRank: 1,
      trendScore: 1,
      isPublished: true,
      createdAt: new Date("2026-08-14T00:00:00.000Z"),
      updatedAt: new Date("2026-08-14T00:00:00.000Z"),
      priceMinor: toAmountMinor(1),
      currencyCode: "TRY" as const,
      purchasable: true,
    };
    const sealed = mergePublishedAcademyCatalog([ghost]);
    expect(sealed).toHaveLength(5);
    expect(sealed[0]?.slug).toBe("01_office_ai");
    expect(sealed.some((row) => row.slug === "rail-temel")).toBe(false);
    expect(sealed.some((row) => row.slug === "01_office_ai")).toBe(true);
  });
});
