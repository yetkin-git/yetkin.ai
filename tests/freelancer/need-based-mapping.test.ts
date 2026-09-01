import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { issueCareerVisaStamp } from "@/lib/career/engine";
import {
  LISTING_ACCESS_VISA_KIND,
  LISTING_ACCESS_VISA_SCOPE_DENIED,
  assertAcademyCareerVisaForListing,
  hasMatchingAcademyListingVisa,
} from "@/lib/career/visa-gate";
import { qualifyingCourseSlugsForListingPathway } from "@/lib/career/listing-visa-scope";
import {
  FREELANCER_NEED_IDS,
  FREELANCER_NEED_SKU_CODES,
  FREELANCER_NEED_TITLES,
  academySlugForNeedSku,
  qualifyingCourseSlugsForNeed,
} from "@/lib/kernel/catalog-ids";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "../helpers/memory-career";

const ROOT = process.cwd();
const HASH = "ab".repeat(32);
const USER = "need-map-worker";

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

async function stampSlug(slug: string, sourceId: string) {
  const career = createMemoryCareerStore();
  const proofs = createMemoryCareerProofStore([
    {
      sourceKind: LISTING_ACCESS_VISA_KIND,
      sourceId,
      userId: USER,
      actorUserIds: [USER],
      title: ACADEMY_COURSE_TITLES[slug as keyof typeof ACADEMY_COURSE_TITLES] ?? slug,
      courseSlug: slug,
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

describe("ihtiyaç odaklı eşleme (Need-Based Mapping)", () => {
  it("işveren ihtiyaçları SKU kodlarına kilitlenir; her SKU yayın slug'ına çözülür", () => {
    expect(FREELANCER_NEED_TITLES["logo-gorsel-sosyal-medya"]).toBe(
      "Logo, Görsel & Sosyal Medya Tasarımı",
    );
    expect(FREELANCER_NEED_SKU_CODES["logo-gorsel-sosyal-medya"]).toEqual([
      "CNV-MC",
      "UIUX-101",
      "LNK-MC",
    ]);
    expect(FREELANCER_NEED_SKU_CODES["web-sitesi-yazilim"]).toEqual([
      "FS-101",
      "FS-102",
      "FS-103",
      "PY-101",
      "PY-103",
    ]);
    expect(FREELANCER_NEED_SKU_CODES["reklam-kampanyasi"]).toEqual([
      "GADS-MC",
      "META-MC",
      "ETIC-MC",
    ]);
    expect(FREELANCER_NEED_SKU_CODES["excel-veri-otomasyon"]).toEqual(["EXC-MC", "PY-102"]);
    expect(FREELANCER_NEED_SKU_CODES["siber-guvenlik-sunucu-test"]).toEqual([
      "SEC-101",
      "SEC-102",
      "SEC-103",
    ]);
    expect(FREELANCER_NEED_SKU_CODES["ai-agent-entegrasyon"]).toEqual([
      "AI-101",
      "AI-102",
      "AI-103",
      "YZ-101",
    ]);
    expect(academySlugForNeedSku("CNV-MC")).toBe("canva-masterclass");
    expect(academySlugForNeedSku("UIUX-101")).toBe("ux-temel");
    expect(academySlugForNeedSku("FS-101")).toBe("fullstack-temel");
    expect(academySlugForNeedSku("PY-101")).toBe("python-temel");
    expect(academySlugForNeedSku("AI-101")).toBe("ai-agent-temel");
    expect(academySlugForNeedSku("YOK-00")).toBeNull();
    for (const needId of FREELANCER_NEED_IDS) {
      const slugs = qualifyingCourseSlugsForNeed(needId);
      expect(slugs.length).toBe(FREELANCER_NEED_SKU_CODES[needId].length);
      expect(qualifyingCourseSlugsForListingPathway(needId)).toEqual([...slugs]);
    }
  });

  it("ilan oluşturma select'i ihtiyaç dilini gösterir; akademi kurs adını basmaz", () => {
    const form = readSrc("components/freelancer/job-create-form.tsx");
    expect(form).toContain("FREELANCER_NEED_CATALOG");
    expect(form).not.toContain("ACADEMY_LEVEL_PATHWAYS");
    expect(form).not.toContain("Python ile Yazılım");
    expect(form).not.toContain("AI Agent Mimarlığı");
    expect(form).toContain("need.title");
    expect(readSrc("lib/copy/sen-voice/freelancer.ts")).toContain('pathwayLabel: "İhtiyaç"');
    for (const title of Object.values(FREELANCER_NEED_TITLES)) {
      expect(readSrc("lib/kernel/catalog-ids/need-based-mapping.ts")).toContain(title);
    }
  });

  it("eşleşen sertifikalardan en az biri teklifi açar; yabancısı fail-closed keser", async () => {
    const webListing = {
      title: "Kurumsal web",
      brief: "Site ve yazılım teslimi",
      visaPathwayId: "web-sitesi-yazilim" as const,
    };
    const designListing = {
      title: "Logo seti",
      brief: "Sosyal medya görselleri",
      visaPathwayId: "logo-gorsel-sosyal-medya" as const,
    };

    const fs = await stampSlug("fullstack-temel", "cert-fs");
    expect(hasMatchingAcademyListingVisa(await fs.career.listStampsForUser(USER), webListing)).toBe(
      true,
    );
    await expect(
      assertAcademyCareerVisaForListing(fs.career, USER, webListing, fs.proofs),
    ).resolves.toBeUndefined();
    await expect(
      assertAcademyCareerVisaForListing(fs.career, USER, designListing, fs.proofs),
    ).rejects.toThrow(LISTING_ACCESS_VISA_SCOPE_DENIED);

    const py101 = await stampSlug("python-temel", "cert-py101");
    expect(
      hasMatchingAcademyListingVisa(await py101.career.listStampsForUser(USER), webListing),
    ).toBe(true);

    const py102 = await stampSlug("python-orta", "cert-py102");
    expect(
      hasMatchingAcademyListingVisa(await py102.career.listStampsForUser(USER), webListing),
    ).toBe(false);
    expect(
      hasMatchingAcademyListingVisa(await py102.career.listStampsForUser(USER), {
        title: "Excel raporu",
        brief: "Otomasyon",
        visaPathwayId: "excel-veri-otomasyon",
      }),
    ).toBe(true);

    const uxOrta = await stampSlug("ux-orta", "cert-ux-orta");
    expect(
      hasMatchingAcademyListingVisa(await uxOrta.career.listStampsForUser(USER), designListing),
    ).toBe(false);
    const canva = await stampSlug("canva-masterclass", "cert-cnv");
    expect(
      hasMatchingAcademyListingVisa(await canva.career.listStampsForUser(USER), designListing),
    ).toBe(true);
  });
});
