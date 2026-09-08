import { describe, expect, it } from "vitest";
import { curriculumSyllabusForCourseSlug } from "@/lib/academy/curriculum-syllabus";
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

  it("mühür yoksa diyalog Ses basmaz; mikro-video Video, aksi Yazılı Compact", () => {
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
        key: "01_office_ai-3",
        courseSlug: "01_office_ai",
        body: "Eğitmen: Compact gövde ses mührü değildir.",
      }),
    ).toBe("document");
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
    expect(ACADEMY_SEN.outline.kindDocument).toBe("Yazılı Compact");
    expect(academyLessonKindLabel("audio", ACADEMY_SEN.outline)).toBe("Ses");
    expect(academyLessonKindLabel("video", ACADEMY_SEN.outline)).toBe("Video");
    expect(academyLessonKindLabel("document", ACADEMY_SEN.outline)).toBe("Yazılı Compact");
  });

  it("amiral müfredatta 1. ve 2. ders Ses, 3–6 Yazılı Compact", () => {
    const syllabus = curriculumSyllabusForCourseSlug("01_office_ai");
    expect(syllabus.lessonCount).toBe(6);
    expect(syllabus.lessons.map((lesson) => lesson.key)).toEqual([
      "01_office_ai-1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-4",
      "01_office_ai-5",
      "01_office_ai-6",
    ]);
    expect(syllabus.lessons[0]?.kind).toBe("audio");
    expect(syllabus.lessons[1]?.kind).toBe("audio");
    expect(syllabus.lessons.slice(2).map((lesson) => lesson.kind)).toEqual([
      "document",
      "document",
      "document",
      "document",
    ]);
    expect(academyLessonKindLabel(syllabus.lessons[0]!.kind, ACADEMY_SEN.outline)).toBe("Ses");
    expect(academyLessonKindLabel(syllabus.lessons[1]!.kind, ACADEMY_SEN.outline)).toBe("Ses");
    for (const lesson of syllabus.lessons.slice(2)) {
      expect(academyLessonKindLabel(lesson.kind, ACADEMY_SEN.outline)).toBe("Yazılı Compact");
    }
  });

  it("amiral antre vize vaadi Ofis Otomasyonu kapısını SEN ile adlandırır", () => {
    const visa = academyAntreVisaPromise("01_office_ai", 70);
    expect(visa).toBe(
      "Sınavı 70+ puanla tamamladığında «Ofis Otomasyonu» sertifikan Pasaport siciline işlenir ve Kariyer sayfanda doğrulanır.",
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
      "Sınav, 6 yazılı compact dersin tamamı bitirilmeden açılmaz. Baraj 70 puandır; satın alma tek başına belge basmaz.",
    );
    expect(ACADEMY_SEN.course.purchaseBody).toContain(ACADEMY_SEN.outline.examShield);
  });

  it("öğrenim çıktıları amiral SKU için somut beceri listesi basar", () => {
    const items = academyLearningOutcomesForSlug("01_office_ai");
    expect(items.length).toBe(6);
    expect(items[0]).toContain("stajyer");
    expect(items.join(" ")).toContain("KVKK");
  });
});
