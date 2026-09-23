import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

describe("vatandaş oynatıcı katmanı — 01_office_ai 9 karaoke, kardeşler makale", () => {
  it("mühürlü 9 ofis dersi article+karaoke basar", () => {
    const karaokeKeys = ACADEMY_GROWTH_SKU_SLUGS.flatMap((slug) =>
      curriculumForCourseSlug(slug)
        .filter((lesson) => academyCitizenPlayerLayer(slug, lesson.key).kind === "article+karaoke")
        .map((lesson) => lesson.key),
    );
    expect(karaokeKeys).toEqual([
      "01_office_ai-1",
      "01_office_ai-k1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-6",
    ]);
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-2").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-3").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-4").kind).toBe("article");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-5").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-6").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-g1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-w1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-k1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-6")).toEqual(
      expect.objectContaining({ kind: "article+karaoke", lessonKey: "01_office_ai-6" }),
    );
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-1")).toEqual({ kind: "article" });
  });
});
