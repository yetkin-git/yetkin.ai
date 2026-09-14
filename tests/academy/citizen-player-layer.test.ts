import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

describe("vatandaş oynatıcı katmanı — 01_office_ai-1/2 karaoke, kardeşler makale", () => {
  it("yalnız mühürlü 1. ve 2. ders article+karaoke basar", () => {
    const karaokeKeys = ACADEMY_GROWTH_SKU_SLUGS.flatMap((slug) =>
      curriculumForCourseSlug(slug)
        .filter((lesson) => academyCitizenPlayerLayer(slug, lesson.key).kind === "article+karaoke")
        .map((lesson) => lesson.key),
    );
    expect(karaokeKeys).toEqual(["01_office_ai-1", "01_office_ai-2"]);
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-2").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-6")).toEqual({ kind: "article" });
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-1")).toEqual({ kind: "article" });
  });
});
