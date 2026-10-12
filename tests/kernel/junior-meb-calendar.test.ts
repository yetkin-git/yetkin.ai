import { describe, expect, it } from "vitest";

import { JUNIOR_FREE_LESSON_KEY } from "@/lib/junior/limits";
import { JUNIOR_FREE_STARTER_LABEL, JUNIOR_LEGACY_ARCHIVE_LABEL } from "@/lib/junior/meb";
import { juniorCourseShelves, juniorLessonAccess } from "@/lib/junior/catalog";
import { juniorTopicCardFace } from "@/lib/junior/topic-face";
import { juniorCourseUnits, juniorLessonUnit, juniorShelfJumpTargets } from "@/lib/junior/units";
import {
  juniorActiveLessonKeys,
  juniorCourseHoursComplete,
  juniorSchoolWeek,
} from "@/lib/junior/week";

const WEEK_3 = new Date("2026-10-04T12:00:00+03:00");

function weekNoon(week: number): Date {
  const open = new Date("2026-09-14T12:00:00+03:00");
  return new Date(open.getTime() + (week - 1) * 7 * 86_400_000);
}

describe("Junior MEB takvimi", () => {
  it("3. haftada asal sayı ve ortak kat yan yana durur", () => {
    expect(juniorSchoolWeek(WEEK_3)).toBe(3);
    expect(juniorActiveLessonKeys("jr_06_mat", WEEK_3)).toEqual(["jr_06_mat-6", "jr_06_mat-7"]);
    expect(juniorActiveLessonKeys("jr_06_fen", WEEK_3)).toEqual(["jr_06_fen-2"]);
  });

  it("ara tatil, sınav ve okul temelli hafta konu taşımaz", () => {
    expect(juniorActiveLessonKeys("jr_06_mat", weekNoon(10))).toEqual([]);
    expect(juniorActiveLessonKeys("jr_06_fen", weekNoon(19))).toEqual([]);
    expect(juniorActiveLessonKeys("jr_06_sosyal", weekNoon(26))).toEqual([]);
    expect(juniorActiveLessonKeys("jr_06_turkce", weekNoon(39))).toEqual([]);
    expect(juniorActiveLessonKeys("jr_06_ing_main", weekNoon(41))).toEqual([]);
  });

  it("müfredat dışı arşiv takvimde ve rafta yoktur; kapı etiketi durur", () => {
    const retired = ["jr_06_mat-1", "jr_06_fen-3", "jr_06_sosyal-14", "jr_06_ing_main-12"];
    for (let week = 1; week <= 41; week += 1) {
      const keys = [
        ...juniorActiveLessonKeys("jr_06_mat", weekNoon(week)),
        ...juniorActiveLessonKeys("jr_06_fen", weekNoon(week)),
        ...juniorActiveLessonKeys("jr_06_sosyal", weekNoon(week)),
        ...juniorActiveLessonKeys("jr_06_ing_main", weekNoon(week)),
      ];
      for (const key of retired) {
        expect(keys).not.toContain(key);
      }
    }
    const mat = juniorCourseShelves(WEEK_3).find((course) => course.slug === "jr_06_mat");
    expect(mat?.lessons[0]?.key).toBe("jr_06_mat-5");
    expect(mat?.lessons).toHaveLength(26);
    expect(mat?.lessons.some((lesson) => lesson.key === "jr_06_mat-26")).toBe(true);
    expect(mat?.lessons[0]?.archiveLabel).toBeUndefined();
    expect(mat?.lessons[0]?.starterLabel).toBeUndefined();
    expect(mat?.lessons[0]?.unitIndex).toBe(1);
    const gate = mat?.lessons.find((lesson) => lesson.key === JUNIOR_FREE_LESSON_KEY);
    expect(gate?.starterLabel).toBe(JUNIOR_FREE_STARTER_LABEL);
    expect(mat?.lessons.some((lesson) => lesson.archiveLabel === JUNIOR_LEGACY_ARCHIVE_LABEL)).toBe(false);
    expect(mat?.lessons[0]?.thisWeek).toBe(false);
    expect(mat?.outcomeWritten).toBe(11);
    expect(mat?.outcomeTotal).toBe(24);
    const sosyal = juniorCourseShelves(WEEK_3).find((course) => course.slug === "jr_06_sosyal");
    expect(sosyal?.track).toBe("core");
    expect(sosyal?.subject).toBe("Sosyal Bilgiler");
    expect((sosyal?.lessons.length ?? 0) > 0).toBe(true);
    expect(sosyal?.lessons.some((lesson) => lesson.key === "jr_06_sosyal-1")).toBe(true);
  });

  it("ünite çubuğu tema sırasını ve arşivi ayırır", () => {
    const units = juniorCourseUnits("jr_06_mat");
    expect(units[0]).toMatchObject({ index: 1, code: "MAT.6.1", title: "Sayılar ve nicelikler" });
    expect(units.map((unit) => unit.title)).toEqual([
      "Sayılar ve nicelikler",
      "Cebir",
      "Geometri",
      "Ölçme",
      "Veri",
      "Olasılık",
    ]);
    expect(juniorLessonUnit("jr_06_mat", "jr_06_mat-5")?.index).toBe(1);
    expect(juniorLessonUnit("jr_06_mat", "jr_06_mat-1")).toBeNull();
    expect(juniorCourseUnits("jr_06_ing_main")[0]?.title).toBe("Sınıf yaşamı");
    const mat = juniorCourseShelves(WEEK_3).find((course) => course.slug === "jr_06_mat");
    const jumps = juniorShelfJumpTargets("jr_06_mat", mat?.lessons ?? []);
    expect(jumps.some((jump) => jump.chip === "Arşiv")).toBe(false);
    expect(jumps[0]?.chip).toBe("1. Ünite: Sayılar ve nicelikler");
    expect(jumps[0]?.lessonKey).toBe("jr_06_mat-5");
    expect(jumps[0]?.lessonKey).not.toBe(JUNIOR_FREE_LESSON_KEY);
    expect(mat?.lessons.find((lesson) => lesson.key === "jr_06_mat-5")?.unitTitle).toBe(
      "Sayılar ve nicelikler",
    );
  });

  it("Türkçe uydu kartları tema hafta rozetini taşır", () => {
    const turkce = juniorCourseShelves(WEEK_3).find((course) => course.slug === "jr_06_turkce");
    expect(turkce?.lessons).toHaveLength(20);
    expect(turkce?.lessons.every((lesson) => lesson.weekHeading?.includes(". Hafta"))).toBe(true);
    const headings = turkce?.lessons.map((lesson) => lesson.weekHeading) ?? [];
    expect(new Set(headings).size).toBe(headings.length);
    expect(turkce?.lessons.find((lesson) => lesson.key === "jr_06_turkce-1")?.weekHeading).toBe(
      "1–3. Hafta: Gerçek, mecaz ve terim anlam",
    );
    expect(turkce?.lessons.find((lesson) => lesson.key === "jr_06_turkce-2")?.weekHeading).toBe(
      "1–3. Hafta (B Bölümü): Eş anlam, zıt anlam ve yakın anlamlı sözcükler",
    );
    expect(turkce?.lessons.find((lesson) => lesson.key === "jr_06_turkce-3")?.weekHeading).toBe(
      "4–6. Hafta: Sözcükte çok anlamlılık ve söz varlığı",
    );
    expect(turkce?.lessons.find((lesson) => lesson.key === "jr_06_turkce-13")?.weekHeading).toBe(
      "4–6. Hafta (C Bölümü): Deyimler ve atasözleri",
    );
    expect(turkce?.lessons.filter((lesson) => lesson.thisWeek).map((lesson) => lesson.key)).toEqual([
      "jr_06_turkce-1",
      "jr_06_turkce-2",
    ]);
    expect(turkce?.lessons.map((lesson) => lesson.unitTitle)).toEqual([
      "Dilimizin Zenginliği",
      "Dilimizin Zenginliği",
      "Dilimizin Zenginliği",
      "Dilimizin Zenginliği",
      "Dilimizin Zenginliği",
      "Bağımsızlık Yolu",
      "Bağımsızlık Yolu",
      "Bağımsızlık Yolu",
      "Bağımsızlık Yolu",
      "Farklı Dünyalar",
      "Farklı Dünyalar",
      "Farklı Dünyalar",
      "İletişim ve Sosyal İlişkiler",
      "İletişim ve Sosyal İlişkiler",
      "İletişim ve Sosyal İlişkiler",
      "İletişim ve Sosyal İlişkiler",
      "Bilim ve Teknoloji",
      "Bilim ve Teknoloji",
      "Lider Ruhlar",
      "Lider Ruhlar",
    ]);
  });

  it("Matematik kazanım kartları hafta sırasına göre dizilir", () => {
    const mat = juniorCourseShelves(WEEK_3).find((course) => course.slug === "jr_06_mat");
    expect(mat?.lessons).toHaveLength(26);
    expect(mat?.lessons.map((lesson) => lesson.key)).toEqual([
      "jr_06_mat-5",
      "jr_06_mat-6",
      "jr_06_mat-7",
      "jr_06_mat-14",
      "jr_06_mat-26",
      "jr_06_mat-27",
      "jr_06_mat-11",
      "jr_06_mat-12",
      "jr_06_mat-13",
      "jr_06_mat-15",
      "jr_06_mat-17",
      "jr_06_mat-28",
      "jr_06_mat-29",
      "jr_06_mat-30",
      "jr_06_mat-31",
      "jr_06_mat-32",
      "jr_06_mat-33",
      "jr_06_mat-22",
      "jr_06_mat-21",
      "jr_06_mat-34",
      "jr_06_mat-35",
      "jr_06_mat-36",
      "jr_06_mat-18",
      "jr_06_mat-19",
      "jr_06_mat-37",
      "jr_06_mat-38",
    ]);
  });

  it("Fen Bilimleri kazanım kartları hafta sırasına göre dizilir", () => {
    const fen = juniorCourseShelves(WEEK_3).find((course) => course.slug === "jr_06_fen");
    expect(fen?.lessons).toHaveLength(27);
    expect(fen?.lessons.map((lesson) => lesson.key)).toEqual([
      "jr_06_fen-1",
      "jr_06_fen-2",
      "jr_06_fen-9",
      "jr_06_fen-21",
      "jr_06_fen-10",
      "jr_06_fen-22",
      "jr_06_fen-23",
      "jr_06_fen-24",
      "jr_06_fen-25",
      "jr_06_fen-26",
      "jr_06_fen-16",
      "jr_06_fen-27",
      "jr_06_fen-18",
      "jr_06_fen-28",
      "jr_06_fen-29",
      "jr_06_fen-30",
      "jr_06_fen-31",
      "jr_06_fen-32",
      "jr_06_fen-33",
      "jr_06_fen-34",
      "jr_06_fen-12",
      "jr_06_fen-35",
      "jr_06_fen-19",
      "jr_06_fen-36",
      "jr_06_fen-20",
      "jr_06_fen-37",
      "jr_06_fen-38",
    ]);
  });

  it("İngilizce uydu kartları tema haftasına göre dizilir", () => {
    const ing = juniorCourseShelves(WEEK_3).find((course) => course.slug === "jr_06_ing_main");
    expect(ing?.lessons).toHaveLength(14);
    expect(ing?.lessons.every((lesson) => lesson.weekHeading?.includes(". Hafta"))).toBe(true);
    const headings = ing?.lessons.map((lesson) => lesson.weekHeading) ?? [];
    expect(new Set(headings).size).toBe(headings.length);
    expect(ing?.lessons.map((lesson) => lesson.key)).toEqual([
      "jr_06_ing_main-20",
      "jr_06_ing_main-2",
      "jr_06_ing_main-4",
      "jr_06_ing_main-7",
      "jr_06_ing_main-17",
      "jr_06_ing_main-5",
      "jr_06_ing_main-16",
      "jr_06_ing_main-6",
      "jr_06_ing_main-9",
      "jr_06_ing_main-10",
      "jr_06_ing_main-11",
      "jr_06_ing_main-1",
      "jr_06_ing_main-3",
      "jr_06_ing_main-8",
    ]);
    expect(ing?.lessons[0]?.weekHeading).toBe("1–5. Hafta: Hak, sorumluluk ve sınıf kuralı");
    expect(ing?.lessons[0]?.access).toBe("free");
    expect(juniorLessonAccess("jr_06_ing_main-20")).toBe("free");
    expect(juniorTopicCardFace(ing!.lessons[0]!, true)).toMatchObject({
      badge: "Ücretsiz Başla",
      action: "Ücretsiz Başla",
      destination: "lesson",
    });
    const week35 = ing?.lessons.find((lesson) => lesson.key === "jr_06_ing_main-1");
    expect(week35?.access).toBe("locked");
    expect(juniorLessonAccess("jr_06_ing_main-1")).toBe("locked");
    expect(juniorTopicCardFace(week35!, false).destination).toBe("locked");
    expect(ing?.lessons[0]?.unitIndex).toBe(1);
    expect(ing?.lessons.find((lesson) => lesson.key === "jr_06_ing_main-5")?.weekHeading).toBe(
      "17–18. Hafta: Şehirde şu an ne oluyor",
    );
    expect(ing?.lessons.find((lesson) => lesson.key === "jr_06_ing_main-1")?.weekHeading).toBe(
      "35–36. Hafta: Daily routines ve saati söylemek",
    );
    expect(ing?.lessons.find((lesson) => lesson.key === "jr_06_ing_main-8")?.unitIndex).toBe(7);
    expect(ing?.lessons.map((lesson) => lesson.unitIndex)).toEqual([
      1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7,
    ]);
    expect(ing?.lessons.filter((lesson) => lesson.thisWeek).map((lesson) => lesson.key)).toEqual([
      "jr_06_ing_main-20",
    ]);
  });

  it("saat dolunca ders tamam sayılır; dosya sonu tamam değildir", () => {
    expect(juniorCourseHoursComplete("jr_06_mat")).toBe(true);
    expect(juniorCourseHoursComplete("jr_06_fen")).toBe(true);
    expect(juniorCourseHoursComplete("jr_06_sosyal")).toBe(true);
    expect(juniorCourseHoursComplete("jr_06_turkce")).toBe(true);
    expect(juniorCourseHoursComplete("jr_06_ing_main")).toBe(true);
  });
});
