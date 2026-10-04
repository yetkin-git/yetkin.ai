import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyCitizenLessonOrdinal,
  curriculumLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";
import { officeAiSections, OFFICE_AI_PREP_STRIP_KEY } from "@/lib/academy/curricula/office_ai";
import {
  academyPrepStripForSlug,
  isAcademyPrepStripKey,
} from "@/lib/academy/prep-strip";
import { academyPaywallLockedLessonShells } from "@/lib/academy/paywall-shells";
import {
  academyPlayerMediaLessonKeys,
  academySectionAllowsFreePreview,
  isAcademyPlayerPaywallLessonLocked,
  sealClosedAcademyLessonPayload,
} from "@/lib/academy/preview-lock";
import {
  academyCourseOffersFreePreview,
  isAcademyFreePreviewLessonKey,
  isAcademyLessonPaywalled,
} from "@/lib/academy/purchase-path";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const SLUG = "01_office_ai";

describe("01_office_ai Ders 0 — Başlamadan Önce hazırlık şeridi", () => {
  it("lesson-index, compact 9'lu ve spoken-script anahtarına girmez", () => {
    expect(OFFICE_AI_PREP_STRIP_KEY).toBe("01_office_ai-0");
    expect(isAcademyPrepStripKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(true);
    expect(curriculumLessonKeysForSlug(SLUG)).toHaveLength(8);
    expect(curriculumLessonKeysForSlug(SLUG)).not.toContain(OFFICE_AI_PREP_STRIP_KEY);
    expect(officeAiSections).toHaveLength(8);
    expect(officeAiSections.some((row) => row.lessonKey === OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
    expect(curriculumForCourseSlug(SLUG).map((row) => row.key)).not.toContain(OFFICE_AI_PREP_STRIP_KEY);
    expect(academyCitizenLessonOrdinal(SLUG, OFFICE_AI_PREP_STRIP_KEY)).toBeNull();
    expect(isAcademySpokenScriptLessonKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
  });

  it("antre rozeti ve kapsama alanı sınav yolunu bozmaz", () => {
    const strip = academyPrepStripForSlug(SLUG);
    expect(strip).not.toBeNull();
    expect(strip?.badge).toBe(ACADEMY_SEN.outline.prepBadge);
    expect(strip?.title).toMatch(/Yapay Zekâyla Tanışma/u);
    expect(strip?.estimatedMinutes).toBe(8);
    expect(strip?.contentMarkdown).toMatch(/Bu şeridin sonunda/u);
    expect(strip?.contentMarkdown).toMatch(/ücretsiz ile ücretli/u);
    expect(strip?.contentMarkdown).toMatch(/istem kutusudur/u);
    expect(strip?.contentMarkdown).toMatch(/Türkçe mi İngilizce mi/u);
    expect(strip?.contentMarkdown).not.toMatch(/Sınav şimdi açıldı/u);
    expect(strip?.contentMarkdown).not.toMatch(/Baraj 70 puandır/u);
    expect(academyPrepStripForSlug("02_ecommerce_ai")).toBeNull();
  });

  it("hazırlık şeridi ve ders 1 ücretsizdir; ders 2–8 satın almadan kilitlidir", () => {
    const keys = curriculumLessonKeysForSlug(SLUG);
    expect(academyCourseOffersFreePreview(SLUG)).toBe(true);
    expect(academyCourseOffersFreePreview("01_office_ai_ileri")).toBe(true);
    expect(isAcademyFreePreviewLessonKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(true);
    expect(isAcademyFreePreviewLessonKey("01_office_ai-1")).toBe(true);
    expect(isAcademyLessonPaywalled(SLUG, OFFICE_AI_PREP_STRIP_KEY, false)).toBe(false);
    expect(isAcademyLessonPaywalled(SLUG, "01_office_ai-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai_ileri", "01_office_ai_ileri-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai_ileri", "01_office_ai_ileri-2", false)).toBe(true);
    expect(keys).toHaveLength(8);
    for (const key of keys) {
      const free = key === "01_office_ai-1";
      expect(isAcademyLessonPaywalled(SLUG, key, false)).toBe(!free);
      expect(isAcademyLessonPaywalled(SLUG, key, true)).toBe(false);
    }
    expect(academyCourseOffersFreePreview("02_ecommerce_ai")).toBe(true);
    expect(academyCourseOffersFreePreview("03_social_media_ai")).toBe(true);
    expect(academyCourseOffersFreePreview("04_chatbot_nocode")).toBe(true);
    expect(academyCourseOffersFreePreview("05_prompt_practice")).toBe(true);
    expect(isAcademyLessonPaywalled("03_social_media_ai", "03_social_media_ai-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("03_social_media_ai", "03_social_media_ai-2", false)).toBe(true);
    expect(isAcademyLessonPaywalled("02_ecommerce_ai", "02_ecommerce_ai-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("02_ecommerce_ai", "02_ecommerce_ai-2", false)).toBe(true);
    const shells = academyPaywallLockedLessonShells(SLUG);
    expect(shells.map((row) => row.key)).toEqual([...keys]);
    const lesson1 = shells.find((row) => row.key === "01_office_ai-1");
    expect(lesson1?.open).toBe(true);
    expect(lesson1?.body.length).toBeGreaterThan(0);
    expect(
      shells
        .filter((row) => row.key !== "01_office_ai-1")
        .every((row) => row.open === false && row.body === "" && row.completed === false),
    ).toBe(true);
    expect(shells.some((row) => row.key === OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
    const opening = officeAiSections.find((section) => section.lessonKey === "01_office_ai-1");
    expect(opening?.isPreviewAllowed).toBe(true);
    expect(opening?.isLocked).toBe(false);
    expect(academySectionAllowsFreePreview(opening!)).toBe(true);
    expect(
      officeAiSections
        .filter((section) => section.lessonKey !== "01_office_ai-1")
        .every(
          (section) =>
            section.isPreviewAllowed === false &&
            section.isLocked === true &&
            academySectionAllowsFreePreview(section) === false,
        ),
    ).toBe(true);
    for (const key of keys) {
      expect(isAcademyPlayerPaywallLessonLocked(SLUG, key, true)).toBe(key !== "01_office_ai-1");
    }
    expect(isAcademyPlayerPaywallLessonLocked(SLUG, "01_office_ai-1", true)).toBe(false);
    expect(isAcademyPlayerPaywallLessonLocked(SLUG, "01_office_ai-k1", true)).toBe(true);
    expect(isAcademyPlayerPaywallLessonLocked(SLUG, OFFICE_AI_PREP_STRIP_KEY, true)).toBe(false);
    expect(isAcademyPlayerPaywallLessonLocked(SLUG, "01_office_ai-1", false)).toBe(false);
    const oyna = readFileSync(join(process.cwd(), "app/academy/[slug]/oyna/page.tsx"), "utf8");
    expect(oyna).toContain("paywallLocked");
    expect(oyna).toContain("academyPaywallLockedLessonShells");
    expect(oyna).toContain("academyCourseOffersFreePreview");
    expect(oyna).toContain("getSession");
    expect(oyna).toContain("hasPurchased");
    const player = readFileSync(join(process.cwd(), "components/academy/curriculum-player.tsx"), "utf8");
    expect(player).toContain("isAcademyPlayerPaywallLessonLocked");
    expect(player).toContain("lessonMediaBlocked");
    expect(player).toContain("lessonPlaybackBlocked");
    expect(oyna).toContain("hasAcademyOynaAccess");
    expect(oyna).toContain("paywallLocked: true");
    expect(oyna).toContain("sealClosedAcademyLessonPayload");
    const mediaKeys = academyPlayerMediaLessonKeys({
      keys: ["01_office_ai-0", "01_office_ai-1", "01_office_ai-2"],
      paywallLocked: true,
    });
    expect(mediaKeys).toEqual(["01_office_ai-0", "01_office_ai-1"]);
    expect(
      academyPlayerMediaLessonKeys({
        keys: ["01_office_ai-0", "01_office_ai-1", "01_office_ai-2"],
        paywallLocked: false,
        openLessonKeys: ["01_office_ai-1"],
      }),
    ).toEqual(["01_office_ai-0", "01_office_ai-1"]);
    expect(
      sealClosedAcademyLessonPayload([
        { open: true, body: "açık" },
        { open: false, body: "gizli gövde" },
      ]),
    ).toEqual([
      { open: true, body: "açık" },
      { open: false, body: "" },
    ]);
  });
});
