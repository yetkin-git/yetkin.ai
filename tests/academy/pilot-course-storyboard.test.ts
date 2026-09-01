import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import { ACADEMY_CATALOG_SEEDS } from "@/lib/academy/catalog-seed";
import { mergePublishedAcademyCatalog, publishedCoursesFromSeed } from "@/lib/academy/published-catalog";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { academyExamPoolForSlug } from "@/lib/academy/exam-pools";
import { academyInstructorBySlug, ACADEMY_MODERATOR } from "@/lib/academy/instructors";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";
import { buildAcademyLessonListenScript } from "@/archived/lib/academy-studio/lesson-listen-script";
import {
  ACADEMY_GROWTH_LESSON_COUNT,
  ACADEMY_PILOT_SKU_LESSON_COUNT,
  ACADEMY_PILOT_SKU_SLUG,
} from "@/lib/academy/pilot-sku";
import {
  academyLessonFlowFromBlocks,
  academyLessonFlowSpeechMatchesDisplay,
} from "@/archived/lib/academy-studio/lesson-flow";
import { ACADEMY_FIVE_ACT_HEADINGS } from "@/lib/academy/lesson-body";
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

describe("Amiral Ders (Pilot SKU) dört perde tek eğitmen akışı", () => {
  it("vitrin yalnız mühürlü Python Temel basar; şablon ve hayalet SKU girmez", () => {
    expect(Object.keys(ACADEMY_COURSE_TITLES)).toEqual([
      "security-temel",
      "security-orta",
      "security-ileri",
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
      ACADEMY_PILOT_SKU_SLUG,
      "python-orta",
      "python-ileri",
      "fullstack-temel",
      "fullstack-orta",
      "fullstack-ileri",
      "ai-temel",
      "ux-temel",
      "excel-masterclass",
      "google-ads-masterclass",
      "meta-ads-masterclass",
      "eticaret-masterclass",
      "canva-masterclass",
      "linkedin-masterclass",
    ]);
    expect(Object.keys(CURRICULUM_DRAFTS_BY_SLUG).sort()).toEqual([
      "ai-agent-ileri",
      "ai-agent-orta",
      "ai-agent-temel",
      "ai-temel",
      "canva-masterclass",
      "eticaret-masterclass",
      "excel-masterclass",
      "fullstack-ileri",
      "fullstack-orta",
      "fullstack-temel",
      "google-ads-masterclass",
      "linkedin-masterclass",
      "meta-ads-masterclass",
      "python-ileri",
      "python-orta",
      "python-temel",
      "security-ileri",
      "security-orta",
      "security-temel",
      "ux-temel",
    ]);
    expect(ACADEMY_CATALOG_SEEDS).toHaveLength(20);
    expect(ACADEMY_CATALOG_SEEDS.map((row) => row.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(ACADEMY_CATALOG_SEEDS[0]?.slug).toBe("ai-agent-temel");
    expect(ACADEMY_CATALOG_SEEDS[0]?.summary).toBe(
      "Büyük Dil Modeli ile otonom ajan farkı, yapılandırılmış çıktı, araç çağrısı, hafıza ve ReAct döngüsü; hava ve not ajanı.",
    );
    expect(curriculumForCourseSlug(ACADEMY_PILOT_SKU_SLUG)).toHaveLength(ACADEMY_PILOT_SKU_LESSON_COUNT);
    expect(curriculumForCourseSlug("ai-temel")).toHaveLength(ACADEMY_GROWTH_LESSON_COUNT);
    expect(academyExamPoolForSlug(ACADEMY_PILOT_SKU_SLUG).length).toBeGreaterThanOrEqual(10);
    expect(academyExamPoolForSlug("ai-temel").length).toBeGreaterThanOrEqual(10);
    const ghostLive = {
      ...publishedCoursesFromSeed()[0]!,
      slug: "rail-temel",
      id: "ac_rail_temel",
    };
    expect(mergePublishedAcademyCatalog([ghostLive]).map((row) => row.slug)).toEqual([
      ...ACADEMY_GROWTH_SKU_SLUGS,
    ]);
  });

  it("her ders beş perde ve DialogueTurn taşır", () => {
    const { sections, lesson } = flowForPilotLesson(0);
    expect(lesson.key).toBe("python-temel-1");
    expect(sections).toHaveLength(5);
    expect(sections.map((section) => section.heading)).toEqual([
      ACADEMY_FIVE_ACT_HEADINGS.warmup,
      ACADEMY_FIVE_ACT_HEADINGS.problem,
      ACADEMY_FIVE_ACT_HEADINGS.development,
      ACADEMY_FIVE_ACT_HEADINGS.conclusion,
      ACADEMY_FIVE_ACT_HEADINGS.assessment,
    ]);
    expect(lesson.body).not.toMatch(/Koray:/);
    expect(lesson.body).toContain("Hoş geldiniz. Bu bölümde");
    expect(academyInstructorBySlug(ACADEMY_PILOT_SKU_SLUG).name).toBe("Maya");
    expect(ACADEMY_MODERATOR.name).toBe("Koray");
    expect(ACADEMY_MODERATOR.speechRate).toBe(1);
  });

  it("ders metni ile ses/akış verisi 1:1 eşleşir", () => {
    for (let index = 0; index < ACADEMY_PILOT_SKU_LESSON_COUNT; index += 1) {
      const { sections, script, lesson } = flowForPilotLesson(index);
      expect(academyLessonFlowSpeechMatchesDisplay(sections), lesson.key).toBe(true);
      expect(script.cards).toHaveLength(sections.length);
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
    expect(sections).toHaveLength(5);

    let state = createStoryboardState(sections.length);
    expect(storyboardProgress(state)).toEqual({
      current: 1,
      total: 5,
      ratio: 1 / 5,
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
      total: 5,
      ratio: 2 / 5,
    });

    const last = { ...state, index: 4 };
    expect(canAdvanceStoryboard(last, "click")).toBe(false);
    expect(advanceStoryboard(last, "click").status).toBe("complete");
    expect(handleStoryboardMediaEnded(last).status).toBe("complete");
  });
});
