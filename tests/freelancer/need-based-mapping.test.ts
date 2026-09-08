import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_TITLES, ACADEMY_CANON_SKU_SLUGS } from "@/lib/academy/course-titles";
import { issueCareerVisaStamp } from "@/lib/career/engine";
import {
  LISTING_ACCESS_VISA_KIND,
  assertAcademyCareerVisaForListing,
  hasMatchingAcademyListingVisa,
} from "@/lib/career/visa-gate";
import { qualifyingCourseSlugsForListingPathway } from "@/lib/career/listing-visa-scope";
import {
  FREELANCER_MARKETPLACE_NEED_IDS,
  FREELANCER_NEED_IDS,
  FREELANCER_NEED_SKU_CODES,
  FREELANCER_NEED_TITLES,
  academySlugForNeedSku,
  isOpenTrialNeed,
  parseFreelancerNeedId,
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
  it("işveren ihtiyaçları SKU kodlarına kilitlenir; yayın başlığı olmayan slug vitrini açmaz", () => {
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([...ACADEMY_CANON_SKU_SLUGS]);
    expect(ACADEMY_COURSE_TITLES["01_office_ai"]).toContain("Ofiste Yapay Zekâ");
    expect(FREELANCER_NEED_TITLES["logo-gorsel-sosyal-medya"]).toBe(
      "Sosyal Medya İçerik ve Görsel Üretimi",
    );
    expect(FREELANCER_NEED_SKU_CODES["logo-gorsel-sosyal-medya"]).toEqual(["SM-103"]);
    expect(FREELANCER_NEED_SKU_CODES["eticaret-pazaryeri"]).toEqual(["EC-102"]);
    expect(FREELANCER_NEED_SKU_CODES["excel-veri-otomasyon"]).toEqual(["OFF-101"]);
    expect(FREELANCER_NEED_SKU_CODES["chatbot-musteri-hizmetleri"]).toEqual(["BOT-104"]);
    expect(FREELANCER_NEED_SKU_CODES["prompt-uretkenlik"]).toEqual(["PR-105"]);
    expect(FREELANCER_NEED_SKU_CODES["acik-deneme"]).toEqual([]);
    expect(FREELANCER_NEED_SKU_CODES["yazilim-web-mobil"]).toEqual([]);
    expect(FREELANCER_NEED_SKU_CODES["grafik-tasarim-kimlik"]).toEqual([]);
    expect(FREELANCER_NEED_SKU_CODES["dijital-pazarlama-seo"]).toEqual([]);
    expect(FREELANCER_NEED_SKU_CODES["ceviri-metin-yazarligi"]).toEqual([]);
    expect(FREELANCER_NEED_SKU_CODES["diger-genel-isler"]).toEqual([]);
    expect(academySlugForNeedSku("YOK-00")).toBeNull();
    expect(academySlugForNeedSku("OFF-101")).toBe("01_office_ai");
    expect(academySlugForNeedSku("EC-102")).toBe("02_ecommerce_ai");
    expect(academySlugForNeedSku("SM-103")).toBe("03_social_media_ai");
    expect(academySlugForNeedSku("BOT-104")).toBe("04_chatbot_nocode");
    expect(academySlugForNeedSku("PR-105")).toBe("05_prompt_practice");
    const publishedByNeed: Record<string, readonly string[]> = {
      "logo-gorsel-sosyal-medya": ["03_social_media_ai"],
      "eticaret-pazaryeri": ["02_ecommerce_ai"],
      "excel-veri-otomasyon": ["01_office_ai"],
      "chatbot-musteri-hizmetleri": ["04_chatbot_nocode"],
      "prompt-uretkenlik": ["05_prompt_practice"],
      "yazilim-web-mobil": [],
      "grafik-tasarim-kimlik": [],
      "dijital-pazarlama-seo": [],
      "ceviri-metin-yazarligi": [],
      "diger-genel-isler": [],
      "acik-deneme": [],
    };
    for (const needId of FREELANCER_NEED_IDS) {
      const slugs = qualifyingCourseSlugsForNeed(needId);
      const published = slugs.filter((slug) => slug in ACADEMY_COURSE_TITLES);
      expect(published).toEqual([...publishedByNeed[needId]!]);
      expect(published.every((slug) => slug in ACADEMY_COURSE_TITLES)).toBe(true);
      expect(qualifyingCourseSlugsForListingPathway(needId)).toEqual([...slugs]);
    }
  });

  it("ilan oluşturma select'i ihtiyaç dilini gösterir; akademi kurs adını basmaz", () => {
    const form = readSrc("components/freelancer/job-create-form.tsx");
    expect(form).toContain("FREELANCER_GUARANTEED_NEED_CATALOG");
    expect(form).toContain("FREELANCER_MARKETPLACE_NEED_CATALOG");
    expect(form).toContain("optgroup");
    expect(form).not.toContain("ACADEMY_LEVEL_PATHWAYS");
    expect(form).not.toContain("Python ile Yazılım");
    expect(form).not.toContain("AI Agent Mimarlığı");
    expect(form).toContain("need.title");
    expect(readSrc("lib/copy/sen-voice/freelancer.ts")).toContain('pathwayLabel: "Teklif Kapısı"');
    expect(readSrc("lib/copy/sen-voice/freelancer.ts")).not.toContain('pathwayLabel: "İhtiyaç"');
    for (const title of Object.values(FREELANCER_NEED_TITLES)) {
      expect(readSrc("lib/kernel/catalog-ids/need-based-mapping.ts")).toContain(title);
    }
  });

  it("amiral ofis slug'ı excel ihtiyacını açar; yabancı slug fail-closed", async () => {
    const officeListing = {
      title: "Ofis Otomasyonu",
      brief: "Excel ve Word otomasyonu",
      visaPathwayId: "excel-veri-otomasyon" as const,
    };

    expect(academySlugForNeedSku("OFF-101")).toBe("01_office_ai");
    expect(qualifyingCourseSlugsForNeed("excel-veri-otomasyon")).toEqual(["01_office_ai"]);

    const office = await stampSlug("01_office_ai", "cert-office");
    expect(
      hasMatchingAcademyListingVisa(await office.career.listStampsForUser(USER), officeListing),
    ).toBe(true);

    const stranger = await stampSlug("stranger-course", "cert-stranger");
    expect(
      hasMatchingAcademyListingVisa(await stranger.career.listStampsForUser(USER), officeListing),
    ).toBe(false);
    await expect(
      assertAcademyCareerVisaForListing(stranger.career, USER, officeListing, stranger.proofs),
    ).rejects.toThrow();
  });

  it("Açık Deneme ve serbest pazaryeri vizesizdir; eski siber id yayın formunda yoktur", async () => {
    expect(FREELANCER_NEED_IDS).not.toContain("siber-guvenlik-sunucu-test");
    expect(FREELANCER_NEED_IDS).not.toContain("web-sitesi-yazilim");
    expect(isOpenTrialNeed("acik-deneme")).toBe(true);
    expect(qualifyingCourseSlugsForNeed("acik-deneme")).toEqual([]);
    expect(parseFreelancerNeedId("siber-guvenlik-sunucu-test")).toBe("acik-deneme");
    expect(parseFreelancerNeedId("web-sitesi-yazilim")).toBe("eticaret-pazaryeri");
    expect(parseFreelancerNeedId("ai-agent-entegrasyon")).toBe("chatbot-musteri-hizmetleri");
    const empty = createMemoryCareerStore();
    const listing = {
      title: "Deneme ilanı",
      brief: "Vizesiz açık deneme",
      visaPathwayId: "acik-deneme" as const,
    };
    await expect(assertAcademyCareerVisaForListing(empty, USER, listing)).resolves.toBeUndefined();
    expect(hasMatchingAcademyListingVisa([], listing)).toBe(true);

    for (const needId of FREELANCER_MARKETPLACE_NEED_IDS) {
      expect(isOpenTrialNeed(needId)).toBe(true);
      expect(qualifyingCourseSlugsForNeed(needId)).toEqual([]);
      const marketListing = {
        title: "Serbest pazaryeri ilanı",
        brief: "Vize kalkanı çalışmaz",
        visaPathwayId: needId,
      };
      await expect(
        assertAcademyCareerVisaForListing(empty, USER, marketListing),
      ).resolves.toBeUndefined();
      expect(hasMatchingAcademyListingVisa([], marketListing)).toBe(true);
    }
  });
});
