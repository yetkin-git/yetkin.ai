import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import { ACADEMY_CATALOG_SEEDS } from "@/lib/academy/catalog-seed";
import { mergePublishedAcademyCatalog, publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { academyExamPoolForSlug } from "@/lib/academy/exam-pools";
import { academyInstructorBySlug, ACADEMY_MODERATOR } from "@/lib/academy/instructors";
import { splitAcademyStudioDialogue } from "@/archived/lib/academy-studio/studio-cast";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";
import { buildAcademyLessonListenScript } from "@/archived/lib/academy-studio/lesson-listen-script";
import {
  ACADEMY_PILOT_SKU_LESSON_COUNT,
  ACADEMY_PILOT_SKU_SLUG,
} from "@/lib/academy/pilot-sku";
import {
  academyLessonFlowFromBlocks,
  academyLessonFlowHasFourSections,
  academyLessonFlowHasNoDialogueSplit,
  academyLessonFlowSpeechMatchesDisplay,
  ACADEMY_LESSON_FLOW_SECTION_COUNT,
} from "@/archived/lib/academy-studio/lesson-flow";
import { ACADEMY_LESSON_ACT_HEADINGS } from "@/lib/academy/lesson-body";
import {
  advanceStoryboard,
  applyStoryboardTargetIndex,
  canAdvanceStoryboard,
  createStoryboardState,
  handleStoryboardMediaEnded,
  skipAheadIsForbidden,
  storyboardProgress,
} from "@/archived/lib/academy-studio/storyboard";

function flowForPilotLesson(lessonIndex: number) {
  const lesson = curriculumForCourseSlug(ACADEMY_PILOT_SKU_SLUG)[lessonIndex]!;
  const blocks = composeAcademyLessonBlocks(lesson);
  const sections = academyLessonFlowFromBlocks(blocks);
  const script = buildAcademyLessonListenScript({
    lessonKey: lesson.key,
    title: lesson.title,
    body: lesson.body,
    courseSlug: ACADEMY_PILOT_SKU_SLUG,
    blocks,
  });
  return { lesson, script, sections };
}

describe("Amiral Ders (Pilot SKU) dört bölüm akışı", () => {
  it("sistemde dört büyüme SKU mühürlüdür; hayalet rail-temel vitrine girmez", () => {
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([
      ACADEMY_PILOT_SKU_SLUG,
      "fullstack-temel",
      "ai-temel",
      "ux-temel",
    ]);
    expect(Object.keys(CURRICULUM_DRAFTS_BY_SLUG).sort()).toEqual([
      "ai-temel",
      "fullstack-temel",
      "python-temel",
      "ux-temel",
    ]);
    expect(ACADEMY_CATALOG_SEEDS).toHaveLength(4);
    expect(ACADEMY_CATALOG_SEEDS[0]?.slug).toBe(ACADEMY_PILOT_SKU_SLUG);
    expect(curriculumForCourseSlug(ACADEMY_PILOT_SKU_SLUG)).toHaveLength(ACADEMY_PILOT_SKU_LESSON_COUNT);
    expect(curriculumForCourseSlug("ai-temel")).toHaveLength(ACADEMY_PILOT_SKU_LESSON_COUNT);
    expect(academyExamPoolForSlug(ACADEMY_PILOT_SKU_SLUG).length).toBeGreaterThanOrEqual(10);
    expect(academyExamPoolForSlug("ai-temel").length).toBeGreaterThanOrEqual(10);
    const ghostLive = {
      ...publishedCoursesFromSeed()[0]!,
      slug: "rail-temel",
      id: "ac_rail_temel",
    };
    expect(mergePublishedAcademyCatalog([ghostLive]).map((row) => row.slug)).toEqual([
      "python-temel",
      "ai-temel",
      "fullstack-temel",
      "ux-temel",
    ]);
  });

  it("her ders dört net bölüm taşır; diyalog kopukluğu yoktur", () => {
    const { sections, lesson } = flowForPilotLesson(0);
    expect(lesson.key).toBe("python-temel-1");
    expect(academyLessonFlowHasFourSections(sections)).toBe(true);
    expect(sections).toHaveLength(ACADEMY_LESSON_FLOW_SECTION_COUNT);
    expect(sections.map((section) => section.heading)).toEqual([
      ACADEMY_LESSON_ACT_HEADINGS.giris,
      ACADEMY_LESSON_ACT_HEADINGS.syntax,
      ACADEMY_LESSON_ACT_HEADINGS.mantik,
      ACADEMY_LESSON_ACT_HEADINGS.uygulama,
    ]);
    expect(academyLessonFlowHasNoDialogueSplit(sections)).toBe(true);
    for (const section of sections) {
      expect(splitAcademyStudioDialogue(section.displayText)).toBeNull();
    }
    expect(academyInstructorBySlug(ACADEMY_PILOT_SKU_SLUG).name).toBe("Maya");
    expect(ACADEMY_MODERATOR.name).toBe("Koray");
  });

  it("ders metni ile ses/akış verisi 1:1 eşleşir", () => {
    for (let index = 0; index < ACADEMY_PILOT_SKU_LESSON_COUNT; index += 1) {
      const { sections, script, lesson } = flowForPilotLesson(index);
      expect(academyLessonFlowSpeechMatchesDisplay(sections), lesson.key).toBe(true);
      expect(script.cards).toHaveLength(ACADEMY_LESSON_FLOW_SECTION_COUNT);
      expect(script.cards.some((card) => card.kind === "moderator"), lesson.key).toBe(false);
      expect(script.cards.some((card) => card.kind === "announcer"), lesson.key).toBe(false);
      for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
        const section = sections[sectionIndex]!;
        const card = script.cards[sectionIndex]!;
        expect(section.spokenText, `${lesson.key}:${section.act}`).toBe(section.displayText);
        expect(card.spokenText, `${lesson.key}:${section.act}:script`).toBe(section.displayText);
        expect(section.displayText.length, `${lesson.key}:${section.act}`).toBeGreaterThan(8);
      }
    }
  });

  it("ilerleme bölüm oranıdır; Sonraki anında +1 gider", () => {
    const { sections } = flowForPilotLesson(0);
    expect(sections).toHaveLength(4);

    let state = createStoryboardState(sections.length);
    expect(storyboardProgress(state)).toEqual({
      current: 1,
      total: 4,
      ratio: 1 / 4,
    });
    expect(canAdvanceStoryboard(state, "click")).toBe(true);
    expect(skipAheadIsForbidden(0, 1)).toBe(false);
    expect(skipAheadIsForbidden(0, 2)).toBe(true);

    const skipped = applyStoryboardTargetIndex(state, 2, "click");
    expect(skipped.index).toBe(0);

    const afterClick = advanceStoryboard(state, "click");
    expect(afterClick.index).toBe(1);
    expect(storyboardProgress(afterClick)).toEqual({
      current: 2,
      total: 4,
      ratio: 2 / 4,
    });

    const last = { ...state, index: 3 };
    expect(canAdvanceStoryboard(last, "click")).toBe(false);
    expect(advanceStoryboard(last, "click").status).toBe("complete");
    expect(handleStoryboardMediaEnded(last).status).toBe("complete");
  });
});
