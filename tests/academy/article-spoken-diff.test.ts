import { describe, expect, it } from "vitest";
import {
  academyCassetteTrackParagraphs,
  academySpokenScriptDisplayParagraphs,
  academyArticleSpokenJaccardFloor,
  ACADEMY_ARTICLE_SPOKEN_FORBIDDEN,
  ACADEMY_CASSETTE_GAIN_SENTENCE,
  diffAcademyArticleSpoken,
} from "@/lib/academy/article-spoken-diff";
import { officeAiSections } from "@/lib/academy/curricula/office_ai";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { loadAcademySpokenScriptRawMarkdown } from "@/lib/academy/spoken-scripts";

const LAST_LESSON_KEY = "01_office_ai-6";
const PENDING_EXAM_SENTENCE = `Sınav, 8. ders bitince açılır. Baraj ${ACADEMY_EXAM_PASS_SCORE} puandır.`;
const OPENED_EXAM_SENTENCE = `Sınav şimdi açıldı. Baraj ${ACADEMY_EXAM_PASS_SCORE} puandır.`;

function officeAiLessonKey(section: { lessonKey?: string }): string {
  const key = section.lessonKey?.trim();
  if (!key) {
    throw new Error("Office AI bölümü lessonKey taşımaz.");
  }
  return key;
}

describe("01_office_ai kaset hizası — compact makale ↔ konuşma metni", () => {
  it("dokuz mühürlü dersin kaset şeridi konuşma metniyle Jaccard tabanını geçer", () => {
    expect(officeAiSections).toHaveLength(8);
    for (const section of officeAiSections) {
      const lessonKey = officeAiLessonKey(section);
      const spoken = loadAcademySpokenScriptRawMarkdown(lessonKey);
      expect(spoken.length, lessonKey).toBeGreaterThan(200);
      const diff = diffAcademyArticleSpoken({
        lessonKey,
        articleMarkdown: section.contentMarkdown,
        spokenMarkdown: spoken,
      });
      expect(diff.jargonHits, lessonKey).toEqual([]);
      expect(diff.missingGainInArticle, lessonKey).toBe(false);
      expect(diff.missingGainInSpoken, lessonKey).toBe(false);
      expect(diff.jaccard, `${lessonKey} jaccard=${diff.jaccard.toFixed(3)}`).toBeGreaterThanOrEqual(
        academyArticleSpokenJaccardFloor(lessonKey),
      );
      expect(
        diff.articleParagraphs,
        `${lessonKey} paragraf ${diff.articleParagraphs}≠${diff.spokenParagraphs}`,
      ).toBe(diff.spokenParagraphs);
    }
  });

  it("Ders 9 kaset şeridi 18 = 18 paragraf taşır", () => {
    const friday = officeAiSections.find((row) => row.lessonKey === LAST_LESSON_KEY)!;
    const spoken = loadAcademySpokenScriptRawMarkdown(LAST_LESSON_KEY);
    const diff = diffAcademyArticleSpoken({
      lessonKey: LAST_LESSON_KEY,
      articleMarkdown: friday.contentMarkdown,
      spokenMarkdown: spoken,
    });
    expect(diff.articleParagraphs).toBe(18);
    expect(diff.spokenParagraphs).toBe(18);
  });

  it("konuşma metni P0 jargon yasaklarını ve kazanım cümlesini taşır", () => {
    for (const section of officeAiSections) {
      const lessonKey = officeAiLessonKey(section);
      const spoken = loadAcademySpokenScriptRawMarkdown(lessonKey);
      const spokenProse = academySpokenScriptDisplayParagraphs(spoken).join(" ");
      for (const pattern of ACADEMY_ARTICLE_SPOKEN_FORBIDDEN) {
        expect(spokenProse, `${lessonKey}:${pattern}`).not.toMatch(pattern);
      }
      expect(spokenProse, lessonKey).toMatch(ACADEMY_CASSETTE_GAIN_SENTENCE);
      if (lessonKey === LAST_LESSON_KEY) {
        expect(spokenProse).toContain(OPENED_EXAM_SENTENCE);
        expect(spokenProse).not.toContain("Sınav, 8. ders bitince açılır.");
      } else {
        expect(spokenProse).toContain(PENDING_EXAM_SENTENCE);
        expect(spokenProse).not.toContain("Sınav şimdi açıldı.");
      }
      expect(academyCassetteTrackParagraphs(section.contentMarkdown)[0]).toMatch(
        ACADEMY_CASSETTE_GAIN_SENTENCE,
      );
    }
  });
});
