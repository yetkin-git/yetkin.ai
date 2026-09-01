import { describe, expect, it } from "vitest";
import {
  FREELANCE_LISTING_VISA_SUBJECT,
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  LISTING_VISA_PATHWAY_BY_JOB_ID,
  UIUX_URUN_FREELANCE_LISTING_PATHWAY,
  YAZILIM_BULUT_LISTING_PATHWAY,
  YZ_ICERIK_LISTING_PATHWAY,
  YZ_LISTING_VISA_SUBJECT,
  inspectListingVisaPathway,
  listingVisaCourseSlugFromStamp,
  lockListingVisaPathway,
  resolveListingVisaPathway,
} from "@/lib/career/listing-visa-scope";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";

describe("ilan vize kapsamı çözümü", () => {
  it("tohum iş kimliği regex'ten önce YZ dikeyini kilitler", () => {
    const [seedId] = Object.keys(LISTING_VISA_PATHWAY_BY_JOB_ID);
    expect(seedId).toBeTruthy();
    const resolution = inspectListingVisaPathway({
      id: seedId,
      title: "Nitelikli freelance teslimi",
      brief: "UI/UX ve pazaryeri — yine de tohum YZ kilitlidir.",
    });
    expect(resolution).toEqual({ pathwayId: YZ_ICERIK_LISTING_PATHWAY, source: "job-id" });
  });

  it("açık visaPathwayId kelime kestirimini ezer", () => {
    const resolution = inspectListingVisaPathway({
      title: "React ve freelance teslimi",
      brief: "Full stack AWS işi.",
      visaPathwayId: YZ_ICERIK_LISTING_PATHWAY,
    });
    expect(resolution).toEqual({ pathwayId: YZ_ICERIK_LISTING_PATHWAY, source: "explicit" });
    expect(lockListingVisaPathway({ title: "Genel teslim", brief: "Kapsam belirsiz." })).toBe(
      FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
    );
  });

  it("YZ öznesi freelance kelimesine rağmen YZ skorunu seçer", () => {
    expect(resolveListingVisaPathway(YZ_LISTING_VISA_SUBJECT)).toBe(YZ_ICERIK_LISTING_PATHWAY);
    expect(
      inspectListingVisaPathway({
        title: "YZ içerik teslimi",
        brief: "Yapay zekâ destekli görsel üretim; freelance teslim.",
      }).source,
    ).toBe("phrase");
    expect(
      resolveListingVisaPathway({
        title: "YZ içerik teslimi",
        brief: "Yapay zekâ destekli görsel üretim; freelance teslim.",
      }),
    ).toBe(YZ_ICERIK_LISTING_PATHWAY);
  });

  it("freelance öznesi UI/UX dikeyine düşer; çözülemeyen ilan kapanır", () => {
    expect(resolveListingVisaPathway(FREELANCE_LISTING_VISA_SUBJECT)).toBe(
      UIUX_URUN_FREELANCE_LISTING_PATHWAY,
    );
    expect(
      resolveListingVisaPathway({
        title: "Genel teslim",
        brief: "Kapsam belirsiz; dikey kilit yok.",
      }),
    ).toBeNull();
    expect(inspectListingVisaPathway({ title: "Genel teslim", brief: "Kapsam belirsiz." }).source).toBe(
      "none",
    );
  });

  it("yazılım ifadeleri bulut dikeyini seçer", () => {
    expect(
      resolveListingVisaPathway({
        title: "Full stack React teslimi",
        brief: "Node.js ve AWS DevOps.",
      }),
    ).toBe(YAZILIM_BULUT_LISTING_PATHWAY);
  });

  it("kurs slug'ı başlıktan önce damgadaki courseSlug'ı kullanır", () => {
    expect(
      listingVisaCourseSlugFromStamp({
        title: "Eski başlık",
        courseSlug: "ai-temel",
      }),
    ).toBe("ai-temel");
    expect(
      listingVisaCourseSlugFromStamp({
        title: ACADEMY_COURSE_TITLES["python-temel"],
      }),
    ).toBe("python-temel");
  });
});
