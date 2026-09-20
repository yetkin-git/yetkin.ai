import { describe, expect, it } from "vitest";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_GMAIL_GEMINI_PROMPT } from "@/lib/academy/gmail-workspace";
import {
  ACADEMY_OFFICE_AI_6_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_W1_DILEKCE_PROMPT,
  ACADEMY_OFFICE_AI_W1_RAPOR_PROMPT,
} from "@/lib/academy/lesson-beat-visual";
import {
  academyLessonHasPedagogy,
  academyLessonHasPractice,
  classifyAcademyLessonChunk,
  composePracticalLessonBody,
  spokenAcademyLessonBody,
  splitAcademyLessonChunks,
} from "@/lib/academy/lesson-body";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { academyInteractiveTaskByKey } from "@/lib/academy/proof-of-work";

const OFFICE_KEYS = curriculumLessonKeysForSlug("01_office_ai");

describe("01_office_ai — LESSON_PRACTICE iş tohumları (Faz T3)", () => {
  it("dokuz anahtarın tamamı 3 adımlı pratik taşır; hop compact-read kalır", () => {
    expect(OFFICE_KEYS).toHaveLength(9);
    expect(Object.keys(LESSON_PRACTICE).sort()).toEqual([...OFFICE_KEYS].sort());
    for (const key of OFFICE_KEYS) {
      const practice = LESSON_PRACTICE[key];
      expect(practice, key).toBeDefined();
      expect(practice!.params.length, key).toBeGreaterThanOrEqual(2);
      expect(practice!.params.some((row) => /senin|kendi|gerçek/i.test(`${row.label} ${row.value}`)), key).toBe(
        true,
      );
      expect(practice!.steps, key).toHaveLength(3);
      expect(practice!.code.language, key).toBe("text");
      expect(practice!.code.source.trim().length, key).toBeGreaterThan(40);
      expect(`${practice!.params.map((row) => row.value).join(" ")}`, key).not.toMatch(
        /\b(?:xlsx|docx|pptx)\b/iu,
      );
      expect(academyInteractiveTaskByKey(key), key).toBeNull();
    }
  });

  it("composePracticalLessonBody parametre, adım ve istem çitini Tam Ders Metni’ne basar", () => {
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(9);
    for (const lesson of lessons) {
      const practice = LESSON_PRACTICE[lesson.key]!;
      const composed = composePracticalLessonBody("Vatandaş kendi dosyasıyla iş çıkarır. İkinci cümle durur.", practice);
      expect(academyLessonHasPractice(composed), lesson.key).toBe(true);
      expect(composed).toContain("```params");
      expect(composed).toContain("```adim");
      expect(composed).toContain("```text");
      expect(classifyAcademyLessonChunk(`\`\`\`params\n${practice.params[0]!.label} | ${practice.params[0]!.value}\n\`\`\``).kind).toBe(
        "params",
      );
      expect(classifyAcademyLessonChunk(`\`\`\`adim\n${practice.steps[0]}\n\`\`\``).kind).toBe("steps");
      expect(lesson.body).toContain("```params");
      expect(lesson.body).toContain(practice.steps[0]!);
      expect(lesson.body).toContain(practice.code.source.trim());
      expect(academyLessonHasPractice(lesson.body), lesson.key).toBe(true);
      expect(academyLessonHasPedagogy(lesson.body), lesson.key).toBe(false);
      const kinds = new Set(splitAcademyLessonChunks(lesson.body).map((chunk) => classifyAcademyLessonChunk(chunk).kind));
      expect(kinds.has("params"), lesson.key).toBe(true);
      expect(kinds.has("steps"), lesson.key).toBe(true);
      expect(kinds.has("code"), lesson.key).toBe(true);
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken, lesson.key).not.toContain("```");
      expect(spoken, lesson.key).toContain(practice.params[0]!.label);
    }
  });

  it("Gmail tohumu yerleşik Gemini istemini taşır; Excel tohumu A1 kuralını ister", () => {
    expect(LESSON_PRACTICE["01_office_ai-g1"]!.code.source).toContain(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(LESSON_PRACTICE["01_office_ai-g1"]!.code.source).toMatch(/^Rol: Gelen kutusu süzgeci/mu);
    expect(LESSON_PRACTICE["01_office_ai-g1"]!.code.source).toMatch(/^İstem:/mu);
    expect(LESSON_PRACTICE["01_office_ai-g1"]!.code.source).not.toMatch(/@Gmail/u);
    expect(LESSON_PRACTICE["01_office_ai-g1"]!.steps[0]).toMatch(/Saha sırası/u);
    expect(LESSON_PRACTICE["01_office_ai-1"]!.steps[0]).toMatch(/A1/u);
    expect(LESSON_PRACTICE["01_office_ai-1"]!.code.source).toMatch(/A1 kuralıyla/u);
    expect(LESSON_PRACTICE["01_office_ai-1"]!.code.source).not.toMatch(/A1 eşiği/u);
    expect(LESSON_PRACTICE["01_office_ai-1"]!.code.source).toMatch(/Orijinal sayfayı koru/u);
    expect(LESSON_PRACTICE["01_office_ai-1"]!.params[0]!.value).toMatch(/kendi temiz deneme tablon/u);
    expect(LESSON_PRACTICE["01_office_ai-k1"]!.code.source).toMatch(/A1 kuralı/u);
    expect(LESSON_PRACTICE["01_office_ai-k1"]!.code.source).toMatch(/^Rol:/mu);
    expect(LESSON_PRACTICE["01_office_ai-k1"]!.code.source).toMatch(/^Görev:/mu);
    expect(LESSON_PRACTICE["01_office_ai-k1"]!.code.source).toMatch(/^Format:/mu);
    expect(LESSON_PRACTICE["01_office_ai-k1"]!.code.source).toMatch(/^Kısıt:/mu);
    expect(LESSON_PRACTICE["01_office_ai-k1"]!.steps[2]).toMatch(/sorunu yaz/u);
    expect(LESSON_PRACTICE["01_office_ai-2"]!.code.source).toMatch(/^Rol: Ofis asistanı\./mu);
    expect(LESSON_PRACTICE["01_office_ai-2"]!.code.source).toContain(
      "Bu temiz tablodan toplamı ve yönü çıkar. Tam üç maddelik yönetim özetini ve tek karar cümlesini yaz. Sayıları tablodaki hücrelerden al. Uydurma yüzde ekleme.",
    );
    expect(LESSON_PRACTICE["01_office_ai-2"]!.code.source).not.toMatch(/Grafik vaadi/u);
    expect(LESSON_PRACTICE["01_office_ai-2"]!.code.source).not.toMatch(/yönetici özeti|eylem cümlesi|anomali/u);
    expect(LESSON_PRACTICE["01_office_ai-2"]!.steps[0]).toMatch(/Saha sırası/u);
    expect(LESSON_PRACTICE["01_office_ai-3"]!.code.source).toMatch(/^Rol: Sunum tasarımcısı\./mu);
    expect(LESSON_PRACTICE["01_office_ai-3"]!.code.source).toContain(
      "Bu üç maddeyi slayt başına tek fikirle taslağa çevir. Her slayt için başlığı, tek cümlelik mesajı ve parantez içinde görsel yönlendirmeyi yaz. Konuşmacı notunu slayt gövdesinden ayrı tut. Uydurma sayı ekleme.",
    );
    expect(LESSON_PRACTICE["01_office_ai-3"]!.code.source).not.toMatch(/iskelet|Sunum mimarı|Hiyerarşi/u);
    expect(LESSON_PRACTICE["01_office_ai-3"]!.steps[0]).toMatch(/Saha sırası/u);
    expect(LESSON_PRACTICE["01_office_ai-3"]!.steps[1]).toMatch(/Sırayı kilitle: başlık, görsel yön, konuşmacı notu/u);
    expect(LESSON_PRACTICE["01_office_ai-5"]!.code.source).toMatch(/^Rol: Hata dedektifi\./mu);
    expect(LESSON_PRACTICE["01_office_ai-5"]!.code.source).toContain(
      "Tablodaki satır toplamları ile genel toplam arasında çelişki olup olmadığını incele. Uyumsuz her satırı kırmızı ile işaretle ve nedenini yaz. Toplamı TOPLA formülüyle doğrula.",
    );
    expect(LESSON_PRACTICE["01_office_ai-5"]!.code.source).toMatch(/TOPLA/u);
    expect(LESSON_PRACTICE["01_office_ai-5"]!.params[1]!.label).toBe("Kaynak hücre");
    expect(LESSON_PRACTICE["01_office_ai-5"]!.steps[0]).toMatch(/Saha sırası/u);
    expect(LESSON_PRACTICE["01_office_ai-5"]!.steps[2]).toMatch(/kırmızıyla işaretle, sonra kilitle/u);
    expect(LESSON_PRACTICE["01_office_ai-4"]!.code.source).toMatch(/^Rol: Gelen kutusu kâtibi\./mu);
    expect(LESSON_PRACTICE["01_office_ai-4"]!.code.source).toContain(
      "Gelen kutumdaki okunmamış iletileri tara. Bugün ödeme veya imza bekleyenleri Acil, bu hafta cevap bekleyenleri Aksiyon, dekont ve bültenleri Arşivlik diye etiketle. Aksiyon için taslak yanıt notu yaz.",
    );
    expect(LESSON_PRACTICE["01_office_ai-4"]!.code.source).toMatch(/Arşivlik/u);
    expect(LESSON_PRACTICE["01_office_ai-4"]!.steps[0]).toMatch(/Saha sırası/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.params[0]!.value).toMatch(/Cuma/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.code.source).toContain(ACADEMY_OFFICE_AI_6_COPILOT_PROMPT);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.code.source).toMatch(/^Görev: /mu);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.code.source).toMatch(/etiket, taslak, onay, arşiv/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.code.source).toMatch(/üç madde \+ karar/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.code.source).not.toMatch(/eylem cümlesi/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.steps[0]).toMatch(/Saha sırası/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.steps[2]).toMatch(/önce maskele/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.steps[2]).not.toMatch(/maskeli yedek/u);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).toMatch(/^Rol: Belge kâtibi\./mu);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).toContain(ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).toContain(ACADEMY_OFFICE_AI_W1_DILEKCE_PROMPT);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).toContain(ACADEMY_OFFICE_AI_W1_RAPOR_PROMPT);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).toMatch(/Sözleşme istemi:/u);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).toMatch(/Dilekçe istemi:/u);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).toMatch(/Rapor istemi:/u);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.code.source).not.toMatch(/Uzun doküman/u);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.steps[0]).toMatch(/Saha sırası/u);
    expect(LESSON_PRACTICE["01_office_ai-w1"]!.steps[2]).toMatch(/sen yazarsın/u);
  });
});
