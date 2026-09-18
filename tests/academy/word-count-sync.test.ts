import { describe, expect, it } from "vitest";
import { officeAiSections, sectionW1 } from "@/lib/academy/curricula/office_ai";
import { COMPACT_ARTICLE_GUIDE, SEALED_AUDIO_LIMITS } from "@/lib/academy/config";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";

describe("compact makale kelime senkronu", () => {
  it("w1 dilekçe hitabını taşır; estimatedWordCount gövdeyle örtüşür", () => {
    const words = countAcademyMarkdownWords(sectionW1.contentMarkdown);
    expect(sectionW1.estimatedWordCount).toBe(words);
    expect(words).toBeGreaterThan(400);
    expect(sectionW1.contentMarkdown).toMatch(/Sayın Yetkili/u);
    expect(sectionW1.contentMarkdown).toMatch(/Öğretmen SEN, belge SIZ/u);
    expect(COMPACT_ARTICLE_GUIDE.minWords).toBe(SEALED_AUDIO_LIMITS.minWords);
  });

  it("9 compact bölüm estimatedWordCount alanı gövde sayımıdır", () => {
    expect(officeAiSections).toHaveLength(9);
    for (const section of officeAiSections) {
      expect(section.estimatedWordCount, section.lessonKey).toBe(
        countAcademyMarkdownWords(section.contentMarkdown),
      );
    }
  });
});
