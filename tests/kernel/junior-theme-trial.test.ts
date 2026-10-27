import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrimeSieve, remainingSieveNumbers, strikePrimeMultiples, PRIME_SIEVE_STEPS } from "@/components/junior/prime-sieve";
import { JUNIOR_MAT_7_SCENARIO } from "@/lib/junior/content/mat/3";
import { JUNIOR_PILOT_TRIAL_LESSON_KEYS, isJuniorPilotTrialLesson } from "@/lib/junior/limits";
import { MAT_6_SPOKEN_FORBIDDEN, mat6NarrationSealIssue } from "@/lib/junior/pilot-engine/timeline-seal";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { juniorTopicEndQuestions } from "@/lib/junior/quiz";
import { evaluateJuniorGuestPilotTrialQuiz, readJuniorLesson, readJuniorPilotTrialFace } from "@/lib/junior/service";

const BANNED = ["en büyük ortak bölen", "en küçük ortak kat"] as const;

describe("1. tema deneme kancası ve MEB dili", () => {
  it("üç ders de bir kez misafir testine girer; katalog kilidi durur", () => {
    expect(JUNIOR_PILOT_TRIAL_LESSON_KEYS).toEqual(["jr_06_mat-1", "jr_06_mat-2", "jr_06_mat-3"]);
    expect(isJuniorPilotTrialLesson("jr_06_mat-8")).toBe(false);
    expect(readJuniorLesson("jr_06_mat-2").access).toBe("locked");
    expect(readJuniorLesson("jr_06_mat-3").access).toBe("locked");
    expect(readJuniorPilotTrialFace("jr_06_mat-1")).toBeNull();
    expect(readJuniorPilotTrialFace("jr_06_mat-2")?.access).toBe("free");
    expect(readJuniorPilotTrialFace("jr_06_mat-3")?.quiz.length).toBeGreaterThan(0);

    for (const lessonKey of JUNIOR_PILOT_TRIAL_LESSON_KEYS) {
      const served = juniorTopicEndQuestions(lessonKey);
      const guestQuiz = evaluateJuniorGuestPilotTrialQuiz({
        lessonKey,
        answers: served.map((question) => ({ id: question.id, choiceIndex: question.correctAnswerIndex })),
      });
      expect(guestQuiz.ok, lessonKey).toBe(true);
      if (guestQuiz.ok) {
        expect(guestQuiz.data.trial).toBe(true);
        expect(guestQuiz.data.correct).toBe(served.length);
      }
    }

    const closed = evaluateJuniorGuestPilotTrialQuiz({ lessonKey: "jr_06_mat-8", answers: [] });
    expect(closed.ok).toBe(false);
    if (!closed.ok) {
      expect(closed.status).toBe(403);
      expect(closed.error.length).toBeGreaterThan(10);
    }
  });

  it("mat-7 dersi, kilit tanıtımı ve veli notu uzun adı taşımaz", () => {
    const blob = [
      JUNIOR_MAT_7_SCENARIO.teaser,
      JUNIOR_MAT_7_SCENARIO.welcome,
      JUNIOR_MAT_7_SCENARIO.concept,
      JUNIOR_MAT_7_SCENARIO.example,
      JUNIOR_MAT_7_SCENARIO.warning,
      JUNIOR_MAT_7_SCENARIO.life,
      ...JUNIOR_MAT_7_SCENARIO.recap,
      ...JUNIOR_MAT_7_SCENARIO.outcomes,
      JUNIOR_MAT_7_SCENARIO.parentNote ?? "",
    ]
      .join("\n")
      .toLocaleLowerCase("tr-TR");
    for (const phrase of BANNED) {
      expect(blob, phrase).not.toContain(phrase);
    }
    expect(blob).toContain("ortak bölenler");
    expect(blob).toContain("ortak katlar");
    const face = readJuniorPilotTrialFace("jr_06_mat-3");
    expect(face?.script.toLocaleLowerCase("tr-TR")).not.toContain("en büyük ortak bölen");
    expect(face?.script.toLocaleLowerCase("tr-TR")).not.toContain("en küçük ortak kat");
  });

  it("mat-6 konuşma mührü kalbur kelimesini düşürmez; çocuk eleği yüzlük tabloyu çizer", () => {
    expect(MAT_6_SPOKEN_FORBIDDEN).not.toContain("kalbur");
    expect(MAT_6_SPOKEN_FORBIDDEN).not.toContain("eratosthenes");
    expect(MAT_6_SPOKEN_FORBIDDEN).not.toContain("yüzlük tablo");
    expect(MAT_6_SPOKEN_FORBIDDEN).toContain("kavramsal anlayış");
    const playback = resolveJuniorPlayback("jr_06_mat-2");
    expect(playback.engine).toBe("pilot");
    if (playback.engine === "pilot") {
      expect(mat6NarrationSealIssue(playback.timeline)).toBeNull();
    }

    let struck = new Set<number>([1]);
    for (const step of PRIME_SIEVE_STEPS) {
      struck = strikePrimeMultiples(struck, step);
    }
    expect(remainingSieveNumbers(struck)).toHaveLength(25);
    expect(remainingSieveNumbers(struck)).toContain(97);
    expect(remainingSieveNumbers(struck)).not.toContain(1);
    expect(remainingSieveNumbers(struck)).not.toContain(9);

    const html = renderToStaticMarkup(createElement(PrimeSieve));
    expect(html).toContain('data-junior-prime-sieve=""');
    expect(html).toContain("Eratosthenes kalburu");
    expect(html).toContain("yüzlük tablo");
    expect(html).toContain('data-junior-sieve-cell="100"');
    expect(html).toContain('data-junior-sieve-struck="true"');
  });
});
