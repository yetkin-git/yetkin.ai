import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug, academyLessonByKey } from "@/lib/academy/curriculum";
import { compactDraftsFromModule } from "@/lib/academy/curricula";
import {
  academyCitizenLessonLabel,
  academyCitizenLessonOrdinal,
  academyCitizenLessonOrdinalFromKey,
  curriculumLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { OFFICE_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const SLUG = "01_office_ai";

/** Vatandaş sırası — teknik anahtar soneki değil. */
const CITIZEN_SPINE = [
  ["01_office_ai-1", 1, "Excel"],
  ["01_office_ai-k1", 2, "KVKK"],
  ["01_office_ai-2", 3, "Rapor"],
  ["01_office_ai-3", 4, "Sunum"],
  ["01_office_ai-5", 5, "Hata avı"],
  ["01_office_ai-4", 6, "E-posta"],
  ["01_office_ai-g1", 7, "Gmail"],
  ["01_office_ai-w1", 8, "Word"],
  ["01_office_ai-6", 9, "Cuma"],
] as const;

describe("01_office_ai vatandaş sıra numarası — lesson-index SSOT", () => {
  it("Ders 1–9 lesson-index sırasına kilitlenir; k1/5/6 anahtarı vatandaş numarası değildir", () => {
    expect(curriculumLessonKeysForSlug(SLUG)).toEqual(CITIZEN_SPINE.map(([key]) => key));
    for (const [key, ordinal] of CITIZEN_SPINE) {
      expect(academyCitizenLessonOrdinal(SLUG, key), key).toBe(ordinal);
      expect(academyCitizenLessonOrdinalFromKey(key), key).toBe(ordinal);
      expect(academyCitizenLessonLabel(SLUG, key), key).toBe(`Ders ${ordinal}`);
    }
    expect(academyCitizenLessonOrdinalFromKey("01_office_ai-5")).toBe(5);
    expect(academyCitizenLessonOrdinalFromKey("01_office_ai-4")).toBe(6);
    expect(academyCitizenLessonOrdinalFromKey("01_office_ai-6")).toBe(9);
    expect(academyCitizenLessonOrdinalFromKey("01_office_ai-k1")).toBe(2);
    expect(academyLessonByKey(SLUG, "4")).toBeNull();
    expect(academyLessonByKey(SLUG, "01_office_ai-4")?.order).toBe(6);
    expect(academyLessonByKey(SLUG, "01_office_ai-4")?.title).toMatch(/E-Posta/u);
    expect(academyLessonByKey(SLUG, "01_office_ai-5")?.order).toBe(5);
    expect(academyLessonByKey(SLUG, "01_office_ai-6")?.order).toBe(9);
  });

  it("compact taslak order alanı lesson-index ile birebir", () => {
    const drafts = compactDraftsFromModule(SLUG, officeAiMasteryModule);
    const live = curriculumForCourseSlug(SLUG);
    expect(drafts.map((row) => row.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(live.map((row) => row.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(live.map((row) => row.key)).toEqual(CITIZEN_SPINE.map(([key]) => key));
    expect(ACADEMY_SEN.catalog.cardMeta(9)).toBe("9 Ders");
    expect(ACADEMY_SEN.player.cardProgress(5, 9)).toBe("5 / 9 Ders");
  });

  it("sinema kapanış kartları eski L6/L7 yalanını taşımaz", () => {
    const hunt = loadAcademyCinemaCueSlides("01_office_ai-5");
    const friday = loadAcademyCinemaCueSlides("01_office_ai-6");
    const email = loadAcademyCinemaCueSlides("01_office_ai-4");
    const slides = loadAcademyCinemaCueSlides("01_office_ai-3");
    expect(hunt[7]?.subhead).toMatch(/e-posta ritüeli/iu);
    expect(hunt[7]?.bullets.join(" ")).toMatch(/6\. ders e-posta/u);
    expect(hunt[7]?.bullets.join(" ")).not.toMatch(/L6/u);
    expect(friday[7]?.subhead).toMatch(/sınav/iu);
    expect(friday[7]?.bullets.join(" ")).not.toMatch(/L7|Gmail köprüsü/u);
    expect(email[0]?.subhead).toMatch(/Hata avı/iu);
    expect(email[7]?.bullets.join(" ")).toMatch(/7\. ders Gmail/u);
    expect(slides[7]?.subhead).toMatch(/hata avı/iu);
  });

  it("sınav havuzu 6. ders tuzağını ve mükerrer dilekçe/3. Kapı kopyasını taşımaz", () => {
    const q17 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_17");
    const q35 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_35");
    const q39 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_39");
    const q28 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_28");
    const q34 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_34");
    expect(q17?.choices[0]).not.toMatch(/Sınavı 6\. derste açmak/u);
    expect(q17?.choices[0]).toMatch(/Cuma 30 kapanış/u);
    expect(q35?.prompt).toMatch(/sözleşme, dilekçe ve rapor/iu);
    expect(q35?.choices[1]).toMatch(/ayrı istem/iu);
    expect(q35?.prompt).not.toBe(q28?.prompt);
    expect(q39?.prompt).toMatch(/lisansı/iu);
    expect(q39?.prompt).not.toBe(q34?.prompt);
    expect(OFFICE_AI_EXAM_QUESTIONS).toHaveLength(42);
  });
});
