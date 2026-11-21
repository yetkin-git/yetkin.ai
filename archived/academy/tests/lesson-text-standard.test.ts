import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scrubAcademyLessonAssistantReply } from "@/lib/academy/lesson-assistant-policy";
import {
  ACADEMY_LESSON_BENCH_CLOSING,
  ACADEMY_LESSON_TEXT_STAGES,
  ACADEMY_LESSON_TEXT_SYSTEM_PROMPT,
} from "@/lib/academy/lesson-text-standard";

describe("ders metni standardı", () => {
  it("master istem beş aşamayı, sen dilini ve tezgâh duasını taşır", () => {
    for (const stage of ACADEMY_LESSON_TEXT_STAGES) {
      expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain(stage);
    }
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain("Sen");
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain("Seo");
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain("En on bir");
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain("elliye yetmiş santimetre");
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain("iki adet");
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain("50x70 cm, 2 adet");
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain(ACADEMY_LESSON_BENCH_CLOSING);
    expect(ACADEMY_LESSON_TEXT_SYSTEM_PROMPT).toContain("Rol, Ürün Adı, Ölçü, Malzeme, Özellik Listesi");
  });

  it("pedagoji beş aşamayı ve Deniz usta kapanışını kilitler", () => {
    const pedagogy = readFileSync(join(process.cwd(), ".system_docs/PEDAGOJI.md"), "utf8");
    expect(pedagogy).toContain("### 2.2 Deniz Usta ve dersin beş aşaması");
    expect(pedagogy).toContain("ACADEMY_LESSON_TEXT_SYSTEM_PROMPT");
    expect(pedagogy).toContain(ACADEMY_LESSON_BENCH_CLOSING);
    expect(pedagogy).toContain("Warm-up → Command → Comparison → Task");
  });

  it("ajans sloganını asistan cevabından siler", () => {
    expect(scrubAcademyLessonAssistantReply("büyü burada başlıyor")).toBe("bu iş");
    expect(scrubAcademyLessonAssistantReply("muazzam dönüşüm")).toBe("bu iş");
  });
});
