import { describe, expect, it } from "vitest";
import {
  JUNIOR_QUIZ_MAX_CORRECT_SHARE,
  JUNIOR_QUIZ_MIN_DISTINCT_ANSWER_POSITIONS,
  juniorAnswerDistributionOk,
  juniorCorrectAnswerShares,
  juniorOptionOrder,
  juniorServedQuestions,
} from "@/lib/junior/quiz/answer-shuffle";
import {
  gradeJuniorTopicEndQuiz,
  juniorFenQuizLessonKeys,
  juniorIngQuizLessonKeys,
  juniorMatQuizLessonKeys,
  juniorElectiveQuizLessonKeys,
  juniorQuizDistributionOk,
  juniorQuizPack,
  juniorSosyalQuizLessonKeys,
  juniorTopicEndQuestions,
  juniorTurkceQuizLessonKeys,
  publicJuniorTopicEndQuiz,
} from "@/lib/junior/quiz";
import type { JuniorTopicEndQuestion } from "@/lib/junior/quiz/types";
import { JUNIOR_ELECTIVE_LESSON_KEY_PATTERN } from "@yetkin/junior-content/schema/topic";
import { JUNIOR_BAKED_AUDIO_KEYS } from "@/lib/junior/voice";

type Position = 0 | 1 | 2 | 3;

/** Doğru şık her zaman "Doğru" metnidir. Konum testleri için yeterli sentetik soru. */
function fixture(id: string, correct: Position): JuniorTopicEndQuestion {
  const options = ["Yanlış 1", "Yanlış 2", "Yanlış 3", "Yanlış 4"];
  options[correct] = "Doğru";
  return {
    id,
    level: "temel",
    question: `Soru ${id}`,
    options,
    correctAnswerIndex: correct,
    explanation: "Açıklama",
    hint: "İpucu",
  } as unknown as JuniorTopicEndQuestion;
}

function allLessonKeys(): string[] {
  return [
    ...juniorMatQuizLessonKeys(),
    ...juniorFenQuizLessonKeys(),
    ...juniorTurkceQuizLessonKeys(),
    ...juniorSosyalQuizLessonKeys(),
    ...juniorIngQuizLessonKeys(),
    ...juniorElectiveQuizLessonKeys(),
  ];
}

describe("Junior quiz şık sırası (T-05)", () => {
  it("şık sırası deterministik bir permütasyondur", () => {
    for (const id of ["q1", "q2", "q3", "uzun-kimlik-17"]) {
      const first = juniorOptionOrder("jr_06_mat-1", id);
      expect(juniorOptionOrder("jr_06_mat-1", id)).toEqual(first);
      expect([...first].sort()).toEqual([0, 1, 2, 3]);
    }
  });

  it("farklı soru kimlikleri farklı sıralar üretir (sabit A düzeni yok)", () => {
    const seen = new Set<string>();
    for (let n = 0; n < 40; n += 1) {
      seen.add(juniorOptionOrder("jr_06_fen-3", `q${n}`).join(","));
    }
    expect(seen.size).toBeGreaterThan(5);
  });

  it("tüm doğru cevaplar aynı konumdaysa son soru kaydırılır; konu en az iki konum taşır", () => {
    // Üç kimlik bulunur ki üçünün doğru şıkkı aynı konuma düşsün (kaynak paketteki A-yığılması örüntüsü).
    const lessonKey = "jr_06_test-1";
    const target = juniorOptionOrder(lessonKey, "seed").indexOf(0);
    const ids: string[] = [];
    for (let n = 0; n < 5000 && ids.length < 3; n += 1) {
      const id = `s${n}`;
      if (juniorOptionOrder(lessonKey, id).indexOf(0) === target) {
        ids.push(id);
      }
    }
    expect(ids).toHaveLength(3);
    const served = juniorServedQuestions(
      lessonKey,
      ids.map((id) => fixture(id, 0)),
    );
    expect(served[0]?.correctAnswerIndex).toBe(target);
    expect(served[1]?.correctAnswerIndex).toBe(target);
    // Döndürme her doğru konumu bir azaltır (mod 4). Son soru bu yüzden farklı konuma düşer.
    expect(served[2]?.correctAnswerIndex).toBe((target + 3) % 4);
    expect(new Set(served.map((row) => row.correctAnswerIndex)).size).toBeGreaterThanOrEqual(2);
    for (const row of served) {
      expect(row.options[row.correctAnswerIndex]).toBe("Doğru");
    }
  });

  it("kaynak sorunun soru, açıklama ve şık kümesi korunur; doğru metin değişmez", () => {
    for (const key of allLessonKeys()) {
      const source = juniorQuizPack(key)?.questions ?? [];
      const served = juniorTopicEndQuestions(key);
      expect(served, key).toHaveLength(source.length);
      for (const row of served) {
        const original = source.find((question) => question.id === row.id);
        expect(original, `${key}/${row.id}`).toBeDefined();
        if (!original) {
          continue;
        }
        expect(row.question).toBe(original.question);
        expect(row.explanation).toBe(original.explanation);
        expect([...row.options].sort()).toEqual([...original.options].sort());
        expect(row.options[row.correctAnswerIndex]).toBe(original.options[original.correctAnswerIndex]);
      }
    }
  });

  it("dağılım kapısı: tek şık %40'ı aşarsa kapanır", () => {
    // 10 konu × 3 soru. Sırada 20 doğru cevap A'da (%67); her konuda iki farklı konum var.
    const heavyA = Array.from({ length: 10 }, (_, topic) => [
      fixture(`t${topic}-1`, 0),
      fixture(`t${topic}-2`, 0),
      fixture(`t${topic}-3`, topic % 2 === 0 ? 1 : 2),
    ]);
    expect(juniorCorrectAnswerShares(heavyA.flat())[0]).toBeGreaterThan(JUNIOR_QUIZ_MAX_CORRECT_SHARE);
    expect(juniorAnswerDistributionOk(heavyA)).toBe(false);
  });

  it("dağılım kapısı: her konuda en az iki farklı konum istenir", () => {
    // Genel pay dengeli kalır (her şık ≤ %40). Tek konu ise hep A'dadır ve kapıyı kapatır.
    const oneUniformTopic = Array.from({ length: 12 }, (_, topic) =>
      topic === 0
        ? [fixture("u0-1", 0), fixture("u0-2", 0), fixture("u0-3", 0)]
        : [fixture(`u${topic}-1`, 1), fixture(`u${topic}-2`, 2), fixture(`u${topic}-3`, 3)],
    );
    const shares = juniorCorrectAnswerShares(oneUniformTopic.flat());
    for (const share of shares) {
      expect(share).toBeLessThanOrEqual(JUNIOR_QUIZ_MAX_CORRECT_SHARE);
    }
    expect(JUNIOR_QUIZ_MIN_DISTINCT_ANSWER_POSITIONS).toBe(2);
    expect(juniorAnswerDistributionOk(oneUniformTopic)).toBe(false);
  });

  it("dağılım kapısı: dengeli örnek geçer; boş küme geçmez", () => {
    const balanced = Array.from({ length: 40 }, (_, topic) =>
      [0, 1, 2].map((offset, index) => fixture(`b${topic}-${index}`, ((topic + offset) % 4) as Position)),
    );
    expect(juniorAnswerDistributionOk(balanced)).toBe(true);
    expect(juniorAnswerDistributionOk([])).toBe(false);
  });

  it("pay toplamı bire eşittir", () => {
    const shares = juniorCorrectAnswerShares([
      { correctAnswerIndex: 0 },
      { correctAnswerIndex: 1 },
      { correctAnswerIndex: 2 },
      { correctAnswerIndex: 3 },
      { correctAnswerIndex: 3 },
    ]);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(1, 10);
  });
});

describe("Junior quiz yayın sırası gerçek veride (T-05)", () => {
  it("mühürlü konu anahtarı fırınlanmış ders anahtarlarıyla aynıdır", () => {
    const keys = allLessonKeys();
    const core = keys.filter((key) => !JUNIOR_ELECTIVE_LESSON_KEY_PATTERN.test(key));
    expect(core).toHaveLength(111);
    expect(new Set(keys)).toEqual(new Set(JUNIOR_BAKED_AUDIO_KEYS));
  });

  it("yayın dağılımı kapıyı geçer: her şık ≤ %40, her konu ≥ 2 farklı konum", () => {
    expect(juniorQuizDistributionOk()).toBe(true);
    const served = allLessonKeys().map((key) => juniorTopicEndQuestions(key));
    const shares = juniorCorrectAnswerShares(served.flat());
    for (const share of shares) {
      expect(share).toBeLessThanOrEqual(JUNIOR_QUIZ_MAX_CORRECT_SHARE);
    }
    for (const questions of served) {
      expect(new Set(questions.map((row) => row.correctAnswerIndex)).size).toBeGreaterThanOrEqual(
        JUNIOR_QUIZ_MIN_DISTINCT_ANSWER_POSITIONS,
      );
    }
  });

  it("puanlama yayın sırasına göre çalışır; istemci cevap anahtarı görmez", () => {
    const key = allLessonKeys()[0] ?? "jr_06_mat-1";
    const served = juniorTopicEndQuestions(key);
    const perfect = gradeJuniorTopicEndQuiz(
      key,
      served.map((row) => ({ id: row.id, choiceIndex: row.correctAnswerIndex })),
    );
    expect(perfect?.score).toBe(100);
    expect(JSON.stringify(publicJuniorTopicEndQuiz(key))).not.toContain("correctAnswerIndex");
  });
});
