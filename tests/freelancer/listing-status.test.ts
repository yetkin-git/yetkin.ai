import { describe, expect, it } from "vitest";
import { freelancerJobStatusLabel } from "@/lib/copy/status-labels";
import {
  FREELANCER_EXAMPLE_JOB_TITLE_PREFIX,
  FREELANCER_JOB_SEEDS,
} from "@/lib/freelancer/seed";
import {
  FREELANCER_SYSTEM_LISTING_STATUS_LABEL,
  jobListingStatusFace,
  partitionFreelancerBoardJobs,
} from "@/lib/freelancer/listing-face";
import {
  ACADEMY_NEED_SKU_CODES,
  FREELANCER_NEED_SKU_CODES,
  isFreelancerNeedId,
  isFreelancerSystemListing,
  isOpenTrialNeed,
} from "@/lib/kernel/catalog-ids";

describe("freelancer ilan statü yüzü ve örnek görev sicili", () => {
  it("Büyüme Beşlisi 5 kapıyı Örnek Görev başlığıyla 1:1 kapsar", () => {
    const growth = FREELANCER_JOB_SEEDS.filter(
      (row) => !isOpenTrialNeed(row.visaPathwayId),
    );
    expect(growth).toHaveLength(5);
    expect(growth.map((row) => {
      if (!isFreelancerNeedId(row.visaPathwayId)) {
        throw new Error(`tohum kapısı ihtiyaç id değil: ${row.visaPathwayId}`);
      }
      return FREELANCER_NEED_SKU_CODES[row.visaPathwayId][0];
    })).toEqual([...ACADEMY_NEED_SKU_CODES]);
    expect(ACADEMY_NEED_SKU_CODES).toEqual(["OFF-101", "EC-102", "SM-103", "BOT-104", "PR-105"]);
    for (const row of FREELANCER_JOB_SEEDS) {
      expect(row.title.startsWith(`${FREELANCER_EXAMPLE_JOB_TITLE_PREFIX} — `)).toBe(true);
      expect(isFreelancerSystemListing(row.id)).toBe(true);
    }
  });

  it("sistem OPEN ilanı Platform örneği / Pasif basar; organik OPEN yeşil Açık kalır", () => {
    const seed = FREELANCER_JOB_SEEDS[0];
    expect(seed).toBeDefined();
    const systemOpen = jobListingStatusFace({ id: seed!.id, status: "OPEN" });
    expect(systemOpen.label).toBe(FREELANCER_SYSTEM_LISTING_STATUS_LABEL);
    expect(systemOpen.label).toBe("Platform örneği / Pasif");
    expect(systemOpen.tone).toBe("safir");
    expect(systemOpen.isSystemListing).toBe(true);
    expect(systemOpen.label).not.toBe(freelancerJobStatusLabel("OPEN"));

    const organicOpen = jobListingStatusFace({ id: "fj_user_real_listing", status: "OPEN" });
    expect(organicOpen.label).toBe("Açık");
    expect(organicOpen.tone).toBe("emerald");
    expect(organicOpen.isSystemListing).toBe(false);
    expect(isFreelancerSystemListing("fj_user_real_listing")).toBe(false);
  });

  it("tohum ilanları organik tahtadan ayırır; kod silinmez", () => {
    const seed = FREELANCER_JOB_SEEDS[0];
    expect(seed).toBeDefined();
    const { live, examples } = partitionFreelancerBoardJobs([
      { id: seed!.id },
      { id: "fj_user_real_listing" },
    ]);
    expect(examples.map((row) => row.id)).toEqual([seed!.id]);
    expect(live.map((row) => row.id)).toEqual(["fj_user_real_listing"]);
  });
});
