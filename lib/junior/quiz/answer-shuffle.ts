import type { JuniorTopicEndQuestion } from "@/lib/junior/quiz/types";

/**
 * Doğru şıkkın konumunu kaynak sıradan bağımsız yapar (T-05).
 * Kaynak paketlerde doğru cevap büyük çoğunlukla A'dadır. Bu modül şıkları ders ve soru kimliğinden
 * türeyen deterministik bir sırayla yeniden dizer. Rastgelelik yoktur: sunucu, istemci ve mühür aynı sırayı hesaplar.
 */

/** Tek şıkkın doğru cevap payı üst sınırı. Yayın kapısı bunu ölçer. */
export const JUNIOR_QUIZ_MAX_CORRECT_SHARE = 0.4;

/** Her konuda en az bu kadar farklı doğru şık konumu bulunur (hep aynı harf ile tam puan olmaz). */
export const JUNIOR_QUIZ_MIN_DISTINCT_ANSWER_POSITIONS = 2;

/** `order[yeniKonum] = kaynakŞıkİndeksi`. Dört şıklı sorular için. */
type OptionOrder = readonly [number, number, number, number];

const IDENTITY_ORDER: OptionOrder = [0, 1, 2, 3];

function fnv1a32(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: tohumdan tekrarlanabilir [0, 1) akışı. */
function seededUnit(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ders ve soru kimliğinden 4'lü şık sırası. Aynı girdi her zaman aynı sırayı verir. */
export function juniorOptionOrder(lessonKey: string, questionId: string): OptionOrder {
  const random = seededUnit(fnv1a32(`${lessonKey}|${questionId}`));
  const order = [0, 1, 2, 3];
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapAt = Math.floor(random() * (index + 1));
    const current = order[index] ?? index;
    const target = order[swapAt] ?? swapAt;
    order[index] = target;
    order[swapAt] = current;
  }
  return [order[0] ?? 0, order[1] ?? 1, order[2] ?? 2, order[3] ?? 3];
}

/** Sıranın bir kaydırması. Doğru şıkkın konumunu tam bir azaltır (dört konumda döngüsel). */
function rotate(order: OptionOrder): OptionOrder {
  return [order[1], order[2], order[3], order[0]];
}

function positionOf(order: OptionOrder, sourceIndex: number): 0 | 1 | 2 | 3 {
  const position = order.indexOf(sourceIndex);
  return (position < 0 ? 0 : position) as 0 | 1 | 2 | 3;
}

function applyOrder(question: JuniorTopicEndQuestion, order: OptionOrder): JuniorTopicEndQuestion {
  const option = (index: number): string => question.options[index] ?? "";
  const options = [option(order[0]), option(order[1]), option(order[2]), option(order[3])] as const;
  return {
    ...question,
    options,
    correctAnswerIndex: positionOf(order, question.correctAnswerIndex),
  };
}

/**
 * Bir konunun sorularını yayın sırasına sokar.
 * Bütün sorularda doğru şık aynı konuma düşerse son sorunun sırası bir kaydırılır.
 * Böylece konu içinde "hep aynı harf" örüntüsü oluşmaz. Sıra yine tamamen deterministiktir.
 */
export function juniorServedQuestions(
  lessonKey: string,
  questions: readonly JuniorTopicEndQuestion[],
): JuniorTopicEndQuestion[] {
  const orders: OptionOrder[] = questions.map((question) => juniorOptionOrder(lessonKey, question.id));
  const positions = questions.map((question, index) =>
    positionOf(orders[index] ?? IDENTITY_ORDER, question.correctAnswerIndex),
  );
  const allSame = positions.length > 1 && positions.every((position) => position === positions[0]);
  const lastIndex = questions.length - 1;
  const lastOrder = orders[lastIndex];
  if (allSame && lastOrder) {
    orders[lastIndex] = rotate(lastOrder);
  }
  return questions.map((question, index) => applyOrder(question, orders[index] ?? IDENTITY_ORDER));
}

/** Her şıkkın doğru cevap payı. Dizi sırası şık indeksidir. */
export function juniorCorrectAnswerShares(
  rows: readonly Pick<JuniorTopicEndQuestion, "correctAnswerIndex">[],
): number[] {
  const counts = [0, 0, 0, 0];
  for (const row of rows) {
    counts[row.correctAnswerIndex] = (counts[row.correctAnswerIndex] ?? 0) + 1;
  }
  const total = rows.length || 1;
  return counts.map((count) => count / total);
}

/**
 * Yayın dağılım kapısı. Her şık en fazla %40 doğru cevap alır.
 * Her konuda en az iki farklı doğru şık konumu bulunur.
 */
export function juniorAnswerDistributionOk(lessons: readonly (readonly JuniorTopicEndQuestion[])[]): boolean {
  const rows = lessons.flat();
  if (rows.length === 0) {
    return false;
  }
  const shares = juniorCorrectAnswerShares(rows);
  if (shares.some((share) => share > JUNIOR_QUIZ_MAX_CORRECT_SHARE)) {
    return false;
  }
  return lessons.every(
    (questions) =>
      new Set(questions.map((question) => question.correctAnswerIndex)).size >=
      JUNIOR_QUIZ_MIN_DISTINCT_ANSWER_POSITIONS,
  );
}
