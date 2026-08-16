import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import {
  LISTING_ACCESS_VISA_DENIED,
  LISTING_ACCESS_VISA_KIND,
  assertAcademyCareerVisaForListing,
  hasValidAcademyCareerVisa,
} from "@/lib/career/visa-gate";
import { issueCareerVisaStamp } from "@/lib/career/engine";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "../helpers/memory-career";

const USER = "visa-gate-worker";
const HASH = "cd".repeat(32);

describe("Kariyer Vizesi teklif kapısı", () => {
  it("ACADEMY_CERTIFICATE damgası olmadan teklifi 403 keser", async () => {
    const career = createMemoryCareerStore();
    expect(hasValidAcademyCareerVisa([])).toBe(false);
    await expect(assertAcademyCareerVisaForListing(career, USER)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(assertAcademyCareerVisaForListing(career, USER)).rejects.toThrow(
      LISTING_ACCESS_VISA_DENIED,
    );
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
    await expect(assertAcademyCareerVisaForListing(career, USER)).rejects.toBeInstanceOf(
      ForbiddenError,
    );

    proofs.add({
      sourceKind: LISTING_ACCESS_VISA_KIND,
      sourceId: "cert-1",
      userId: USER,
      actorUserIds: [USER],
      title: "Raylı sistem temeli",
      issuedAt: new Date("2026-08-16T00:00:00.000Z"),
      certificateHash: HASH,
    });
    await issueCareerVisaStamp(
      { career, proofs },
      { sourceKind: "ACADEMY_CERTIFICATE", sourceId: "cert-1", actorUserId: USER },
    );
    await expect(assertAcademyCareerVisaForListing(career, USER)).resolves.toBeUndefined();
  });
});
