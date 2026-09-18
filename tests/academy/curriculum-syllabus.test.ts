import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";
import {
  OFFICE_AI_PLANNED_LESSONS,
  officeAiPlannedLessonByKey,
} from "@/lib/academy/curricula/office_ai";
import {
  academyLessonContentKind,
  academyLessonDurationMin,
  academyLessonKindLabel,
  academyMediaDurationMin,
  academyProgressPercent,
} from "@/lib/academy/lesson-meta";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyAntreVisaPromise } from "@/lib/academy/antre-visa";
import { academyLearningOutcomesForSlug } from "@/lib/academy/learning-outcomes";

describe("akademi müfredat özeti — modül, tür, süre", () => {
  it("yüzdeyi 0–100 aralığında basar", () => {
    expect(academyProgressPercent(0, 12)).toBe(0);
    expect(academyProgressPercent(6, 12)).toBe(50);
    expect(academyProgressPercent(12, 12)).toBe(100);
    expect(academyProgressPercent(3, 0)).toBe(0);
  });

  it("mühür yoksa diyalog Ses basmaz; mikro-video Video, aksi Makale / Okuma Metni", () => {
    expect(academyLessonContentKind({ microVideos: [{ durationSec: 6 }] })).toBe("video");
    expect(academyLessonContentKind({ microVideos: [] })).toBe("document");
    expect(
      academyLessonContentKind({
        body: "Eğitmen: Araç yoksa durursun.\n\nEğitmen: Fail-closed kapısı uydurmaz.",
        microVideos: [{ durationSec: 6 }],
      }),
    ).toBe("video");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-1",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Araç yoksa durursun.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-2",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Araç yoksa durursun.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-3",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-4",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-5",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-6",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-g1",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-w1",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("audio");
    expect(
      academyLessonContentKind({
        key: "01_office_ai-k1",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("audio");
  });

  it("konuşma süresinden dakikaya iner; 5 dk taban basmaz", () => {
    expect(academyMediaDurationMin(140)).toBe(2);
    expect(academyMediaDurationMin(0)).toBe(0);
    const minutes = academyLessonDurationMin({
      body: Array.from({ length: 640 }, () => "kelime").join(" "),
      microVideos: [{ durationSec: 8 }],
    });
    expect(minutes).toBeGreaterThanOrEqual(4);
    expect(minutes).toBeLessThanOrEqual(25);
  });

  it("boş müfredat özeti basmaz", () => {
    const syllabus = curriculumSyllabusForCourseSlug("sample-course");
    expect(syllabus.lessonCount).toBe(0);
    expect(syllabus.modules).toEqual([]);
    expect(syllabus.lessons).toEqual([]);
    expect(ACADEMY_SEN.outline.kindAudio).toBe("Ses");
    expect(ACADEMY_SEN.outline.kindDocument).toBe("Makale / Okuma Metni");
    expect(academyLessonKindLabel("audio", ACADEMY_SEN.outline)).toBe("Ses");
    expect(academyLessonKindLabel("video", ACADEMY_SEN.outline)).toBe("Video");
    expect(academyLessonKindLabel("document", ACADEMY_SEN.outline)).toBe("Makale / Okuma Metni");
  });

  it("amiral müfredat 1. bölümü basar; özet 9 ders taşır", () => {
    const syllabus = curriculumSyllabusForCourseSlug("01_office_ai");
    expect(syllabus.lessonCount).toBe(9);
    expect(syllabus.lessons.map((row) => row.key)).toEqual([
      "01_office_ai-1",
      "01_office_ai-k1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-4",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-6",
    ]);
    expect(syllabus.lessons[1]?.key).toBe("01_office_ai-k1");
    expect(syllabus.lessons[1]?.kind).toBe("audio");
    expect(syllabus.lessons[6]?.title).toMatch(/Gmail \+ Gemini/u);
    expect(syllabus.lessons[7]?.title).toMatch(/Word ve Uzun Doküman Analizi/u);
    expect(syllabus.lessons[8]?.key).toBe("01_office_ai-6");
    expect(syllabus.lessons[8]?.kind).toBe("audio");
    expect(syllabus.lessons[8]?.title).toBe("Haftalık Sistem: 30 Dakikalık Rutin");
    expect(syllabus.lessons[8]?.title).not.toMatch(/Sınav Köprüsü/u);
    expect(academyLessonKindLabel(syllabus.lessons[8]!.kind, ACADEMY_SEN.outline)).toBe("Ses");
  });

  it("Gmail ve Word ana akış dersleri 01_office_ai-g1 ve 01_office_ai-w1 canlı yolda 7. ve 8. derstir", () => {
    expect(OFFICE_AI_PLANNED_LESSONS.filter((lesson) => lesson.lane === "main")).toHaveLength(9);
    expect(OFFICE_AI_PLANNED_LESSONS.filter((lesson) => lesson.lane === "satellite")).toHaveLength(3);
    expect(
      OFFICE_AI_PLANNED_LESSONS.filter((lesson) => lesson.lane === "main").map((lesson) => lesson.key),
    ).toEqual([
      "01_office_ai-1",
      "01_office_ai-k1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-4",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-6",
    ]);
    expect(officeAiPlannedLessonByKey("01_office_ai-g1")?.lane).toBe("main");
    expect(officeAiPlannedLessonByKey("01_office_ai-g1")?.method).toBe("gmail-gemini");
    expect(officeAiPlannedLessonByKey("01_office_ai-g1")?.title).toMatch(/Gmail \+ Gemini/u);
    expect(officeAiPlannedLessonByKey("01_office_ai-g1")?.title).toMatch(/Aksiyon Listesi/u);
    expect(officeAiPlannedLessonByKey("01_office_ai-w1")?.title).toMatch(/Word ve Uzun Doküman Analizi/u);
    expect(officeAiPlannedLessonByKey("01_office_ai-w1")?.method).toBe("doc-upload-gemini");
    expect(officeAiPlannedLessonByKey("01_office_ai-w1")?.status).toBe("sealed");
    expect(officeAiPlannedLessonByKey("01_office_ai-w1")?.title).toMatch(/Dilekçe/u);
    expect(officeAiPlannedLessonByKey("01_office_ai-g1")?.pedagogicalObjective).toMatch(/1\. Kapı/u);
    expect(officeAiPlannedLessonByKey("01_office_ai-10")?.lane).toBe("satellite");
    expect(officeAiPlannedLessonByKey("01_office_ai-10")?.status).toBe("planned");
    expect(officeAiPlannedLessonByKey("01_office_ai-11")?.status).toBe("planned");
    expect(officeAiPlannedLessonByKey("01_office_ai-12")?.status).toBe("planned");
    expect(curriculumSyllabusForCourseSlug("01_office_ai").lessonCount).toBe(9);
  });

  it("amiral antre vize vaadi Ofis Verimliliği kapısını SEN ile adlandırır", () => {
    const visa = academyAntreVisaPromise("01_office_ai", 70);
    expect(visa).toBe(
      "Sınavı 70+ puanla tamamladığında «Ofis Verimliliği» sertifikan Pasaport siciline işlenir ve Kariyer sayfanda doğrulanır.",
    );
    expect(visa).not.toMatch(/mühür/i);
    expect(visa).not.toContain("CareerVisaStamp");
    expect(academyAntreVisaPromise("02_ecommerce_ai", 70)).toBe(
      "Sınavı 70+ puanla tamamladığında «E-Ticaret Asistanlığı» sertifikan Pasaport siciline işlenir ve Kariyer sayfanda doğrulanır.",
    );
    expect(academyAntreVisaPromise("02_ecommerce_ai", 70)).not.toContain("excel-veri-otomasyon");
  });

  it("sınav kalkanı amiral ve kardeş SKU için ortak SEN basar", () => {
    expect(ACADEMY_SEN.outline.examShield).toBe(
      "Sınav, 9 dersin tamamı bitirilmeden açılmaz. Baraj 70 puandır; satın alma tek başına belge basmaz.",
    );
    expect(ACADEMY_SEN.course.purchaseBody).toContain(ACADEMY_SEN.outline.examShield);
  });

  it("öğrenim çıktıları 1. bölüm A1 hücresi refleksini basar", () => {
    const items = academyLearningOutcomesForSlug("01_office_ai");
    expect(items.join(" ")).toContain("A1 hücresi");
    expect(items.join(" ")).toMatch(/hata avı|TOPLA/iu);
    expect(items.join(" ")).toMatch(/Cuma 30/u);
    expect(items).toHaveLength(9);
    expect(items.join(" ")).toMatch(/KVKK|maskele/iu);
    expect(items[1]).toMatch(/maskele/iu);
    expect(items[8]).toMatch(/Cuma 30/u);
    expect(items.join(" ")).not.toContain("stajyer");
  });

  it("amiral compact makale her derste el kitabı üçlüsü taşır", () => {
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(9);
    for (const lesson of lessons) {
      expect(lesson.body, lesson.key).toMatch(/El kitabı \(kasetin sığdırmadığı\)/u);
      expect(lesson.body, lesson.key).toMatch(/Lisans yoksa ne yapılır/u);
      expect(lesson.body, lesson.key).toMatch(/Kenar durum/u);
      expect(lesson.body, lesson.key).toMatch(/Yapılmaması gereken tuzak/u);
    }
  });
});
