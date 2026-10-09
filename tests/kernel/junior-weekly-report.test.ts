import { describe, expect, it } from "vitest";
import { JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import {
  buildJuniorWeeklyReport,
  juniorQuizCountsFromScore,
  juniorWeeklyWindow,
  type JuniorReportSource,
} from "@/lib/junior/report";

const NOW = new Date("2026-10-05T12:00:00+03:00");
const CHILD = "child-a";

function row(
  partial: Pick<JuniorReportSource, "mode" | "score" | "createdAt"> &
    Partial<Pick<JuniorReportSource, "profileId" | "lessonKey" | "advice">>,
): JuniorReportSource {
  return {
    profileId: CHILD,
    lessonKey: "jr_06_mat-1",
    advice: "Pay üstte, payda altta.",
    ...partial,
  };
}

function oneSentence(tip: string): boolean {
  return /^[^!.?]+[.]$/u.test(tip);
}

describe("Junior haftalık veli raporu", () => {
  it("paket puanını doğru ve yanlış sayıya çevirir", () => {
    for (let correct = 0; correct <= JUNIOR_QUIZ_MIN_ITEMS; correct += 1) {
      const score = Math.round((correct / JUNIOR_QUIZ_MIN_ITEMS) * 100);
      const counts = juniorQuizCountsFromScore(score);
      expect(counts.correct).toBe(correct);
      expect(counts.wrong).toBe(JUNIOR_QUIZ_MIN_ITEMS - correct);
      expect(counts.total).toBe(JUNIOR_QUIZ_MIN_ITEMS);
    }
  });

  it("son yedi takvim gününü İstanbul gün başından keser", () => {
    const window = juniorWeeklyWindow(NOW);
    expect(window.from.toISOString()).toBe("2026-09-28T21:00:00.000Z");
    expect(window.to.toISOString()).toBe(NOW.toISOString());
  });

  it("seçili çocuğun son yedi gününü tek özette toplar", () => {
    const report = buildJuniorWeeklyReport(
      [
        row({
          mode: "speak",
          score: 80,
          createdAt: new Date("2026-10-03T18:00:00+03:00"),
          advice: "Pay üstte, payda altta. Bunu bir kez daha anlat.",
        }),
        row({
          mode: "write",
          score: 60,
          createdAt: new Date("2026-10-04T18:00:00+03:00"),
          advice: "Paydayı alta yaz.",
        }),
        row({
          mode: "practice",
          score: 100,
          createdAt: new Date("2026-10-04T19:00:00+03:00"),
          advice: "Pekiştirme bu karta girmez.",
        }),
        row({
          mode: "quiz",
          score: 67,
          lessonKey: "jr_06_mat-1",
          createdAt: new Date("2026-10-04T20:00:00+03:00"),
          advice: "Eksik kalan cümleyi bir kez daha oku. Sonra testi yeniden çöz.",
        }),
        row({
          mode: "speak",
          score: 100,
          createdAt: new Date("2026-09-20T12:00:00+03:00"),
          advice: "Eski hafta.",
        }),
        row({
          profileId: "child-b",
          mode: "speak",
          score: 10,
          createdAt: new Date("2026-10-04T12:00:00+03:00"),
          advice: "Başka çocuk.",
        }),
      ],
      {
        profileId: CHILD,
        now: NOW,
        lessonTitle: () => "Bir bütünü eşit parçaya bölmek",
      },
    );

    expect(report.narration).toEqual({ attempts: 2, averageScore: 70, latestScore: 60 });
    expect(report.quizzes).toEqual([
      {
        lessonKey: "jr_06_mat-1",
        lessonTitle: "Bir bütünü eşit parçaya bölmek",
        score: 67,
        correct: 2,
        wrong: 1,
        total: JUNIOR_QUIZ_MIN_ITEMS,
        takenAt: new Date("2026-10-04T20:00:00+03:00").toISOString(),
      },
    ]);
    expect(report.quizTotals).toEqual({
      attempts: 1,
      correct: 2,
      wrong: 1,
      answered: JUNIOR_QUIZ_MIN_ITEMS,
    });
    expect(report.parentTip).toBe("Evde şunu pekiştirin: paydayı alta yaz.");
    expect(oneSentence(report.parentTip)).toBe(true);
  });

  it("kayıt yoksa tek cümlelik ev işi söyler", () => {
    const report = buildJuniorWeeklyReport([], { profileId: CHILD, now: NOW });
    expect(report.narration.averageScore).toBeNull();
    expect(report.quizzes).toHaveLength(0);
    expect(report.parentTip).toBe(
      "Bu yedi günde anlatış ve konu testi yok; akşam bir ders açıp ilk konuyu birlikte dinleyin.",
    );
    expect(oneSentence(report.parentTip)).toBe(true);
  });

  it("emin değilim cümlesini veliye tek iş olarak çevirir", () => {
    const report = buildJuniorWeeklyReport(
      [
        row({
          mode: "speak",
          score: 0,
          createdAt: new Date("2026-10-05T09:00:00+03:00"),
          advice: "Emin değilim. Bir kez daha anlat.",
        }),
      ],
      { profileId: CHILD, now: NOW },
    );
    expect(report.parentTip).toBe(
      "Anlatış bu kez net değildi; akşam aynı konuyu bir kez daha kendi sözleriyle anlatsın.",
    );
    expect(oneSentence(report.parentTip)).toBe(true);
  });
});
