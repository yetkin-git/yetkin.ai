import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import {
  LISTING_ACCESS_VISA_DENIED,
  LISTING_ACCESS_VISA_KIND,
  LISTING_ACCESS_VISA_SCOPE_DENIED,
  assertAcademyCareerVisaForListing,
  hasMatchingAcademyListingVisa,
  hasValidAcademyCareerVisa,
} from "@/lib/career/visa-gate";
import {
  BIM_LISTING_VISA_SUBJECT,
  YZ_LISTING_VISA_SUBJECT,
} from "@/lib/career/listing-visa-scope";
import { issueCareerVisaStamp } from "@/lib/career/engine";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "../helpers/memory-career";

const USER = "visa-gate-worker";
const HASH = "cd".repeat(32);

async function stampAcademyTitle(title: string, sourceId: string, courseSlug?: string) {
  const career = createMemoryCareerStore();
  const proofs = createMemoryCareerProofStore([
    {
      sourceKind: LISTING_ACCESS_VISA_KIND,
      sourceId,
      userId: USER,
      actorUserIds: [USER],
      title,
      courseSlug,
      issuedAt: new Date("2026-08-16T00:00:00.000Z"),
      certificateHash: HASH,
    },
  ]);
  await issueCareerVisaStamp(
    { career, proofs },
    { sourceKind: "ACADEMY_CERTIFICATE", sourceId, actorUserId: USER },
  );
  return { career, proofs };
}

describe("Kariyer Vizesi teklif kapısı", () => {
  it("ACADEMY_CERTIFICATE damgası olmadan teklifi 403 keser", async () => {
    const career = createMemoryCareerStore();
    expect(hasValidAcademyCareerVisa([])).toBe(false);
    await expect(
      assertAcademyCareerVisaForListing(career, USER, YZ_LISTING_VISA_SUBJECT),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      assertAcademyCareerVisaForListing(career, USER, YZ_LISTING_VISA_SUBJECT),
    ).rejects.toThrow(LISTING_ACCESS_VISA_DENIED);
  });

  it("FREELANCER_RELEASE damgası teklif kapısını açmaz; yalnız akademi vizesi açar", async () => {
    const career = createMemoryCareerStore();
    const proofs = createMemoryCareerProofStore([
      {
        sourceKind: "FREELANCER_RELEASE",
        sourceId: "contract-1",
        userId: USER,
        actorUserIds: [USER, "client-1"],
        title: "Eski teslim",
        issuedAt: new Date("2026-08-01T00:00:00.000Z"),
        certificateHash: null,
      },
    ]);
    await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "FREELANCER_RELEASE", sourceId: "contract-1", actorUserId: USER },
    );
    await expect(
      assertAcademyCareerVisaForListing(career, USER, YZ_LISTING_VISA_SUBJECT),
    ).rejects.toBeInstanceOf(ForbiddenError);

    proofs.add({
      sourceKind: LISTING_ACCESS_VISA_KIND,
      sourceId: "cert-1",
      userId: USER,
      actorUserIds: [USER],
      title: "Yapay Zekâ ve Prompt Mühendisliğine Giriş",
      courseSlug: "ai-temel",
      issuedAt: new Date("2026-08-16T00:00:00.000Z"),
      certificateHash: HASH,
    });
    await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-1", actorUserId: USER },
    );
    await expect(
      assertAcademyCareerVisaForListing(career, USER, YZ_LISTING_VISA_SUBJECT, proofs),
    ).resolves.toBeUndefined();
  });

  it("python-temel YZ ilanına teklif açmaz; ai dikeyi açar (onboarding slug null)", async () => {
    const python = await stampAcademyTitle(ACADEMY_COURSE_TITLES["python-temel"], "cert-py", "python-temel");
    expect(hasValidAcademyCareerVisa(await python.career.listStampsForUser(USER))).toBe(true);
    expect(
      hasMatchingAcademyListingVisa(await python.career.listStampsForUser(USER), YZ_LISTING_VISA_SUBJECT),
    ).toBe(false);
    await expect(
      assertAcademyCareerVisaForListing(
        python.career,
        USER,
        YZ_LISTING_VISA_SUBJECT,
        python.proofs,
      ),
    ).rejects.toThrow(LISTING_ACCESS_VISA_SCOPE_DENIED);

    const yz = await stampAcademyTitle("Yapay Zekâ ve Prompt Mühendisliğine Giriş", "cert-ai", "ai-temel");
    await expect(
      assertAcademyCareerVisaForListing(yz.career, USER, YZ_LISTING_VISA_SUBJECT, yz.proofs),
    ).resolves.toBeUndefined();
    await expect(
      assertAcademyCareerVisaForListing(yz.career, USER, BIM_LISTING_VISA_SUBJECT, yz.proofs),
    ).rejects.toThrow(LISTING_ACCESS_VISA_SCOPE_DENIED);
  });

  it("freelance ilanı ux halkası ister; python-temel yetmez", async () => {
    const ux = await stampAcademyTitle("UX Araştırma, Wireframing ve Figma Temelleri", "cert-ux", "ux-temel");
    await expect(
      assertAcademyCareerVisaForListing(ux.career, USER, BIM_LISTING_VISA_SUBJECT, ux.proofs),
    ).resolves.toBeUndefined();
    await expect(
      assertAcademyCareerVisaForListing(ux.career, USER, YZ_LISTING_VISA_SUBJECT, ux.proofs),
    ).rejects.toThrow(LISTING_ACCESS_VISA_SCOPE_DENIED);
  });

  it("iptal edilmiş akademi mührü zombi damgayı teklif kapısından düşürür", async () => {
    const yz = await stampAcademyTitle("Yapay Zekâ ve Prompt Mühendisliğine Giriş", "cert-ai-zombie", "ai-temel");
    await expect(
      assertAcademyCareerVisaForListing(yz.career, USER, YZ_LISTING_VISA_SUBJECT, yz.proofs),
    ).resolves.toBeUndefined();
    yz.proofs.remove(LISTING_ACCESS_VISA_KIND, "cert-ai-zombie");
    await expect(
      assertAcademyCareerVisaForListing(yz.career, USER, YZ_LISTING_VISA_SUBJECT, yz.proofs),
    ).rejects.toThrow(LISTING_ACCESS_VISA_DENIED);
  });
});
