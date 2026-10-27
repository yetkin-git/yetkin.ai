/**
 * Konu testi ve anlatış yönlendirmesinin tek evi.
 * Çekirdek konuda paket en az üç çözümlü soru taşır (`JUNIOR_QUIZ_MIN_ITEMS`);
 * pilot ders `jr_06_mat-1` gibi geniş paketler anlatılan her kuralı ölçebilir.
 */

export type JuniorQuizLevel = "concept" | "apply" | "skill";

export type JuniorTopicEndQuestion = {
  id: string;
  level: JuniorQuizLevel;
  question: string;
  options: readonly [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  hint: string;
  explanation: string;
};

export type JuniorLessonQuizPack = {
  lessonKey: string;
  title: string;
  /** «Hazırım, Sana Anlatayım!» yönlendirme kontrol soruları. */
  tellGuides: readonly [string, string] | readonly [string, string, string];
  questions: readonly JuniorTopicEndQuestion[];
};

export type JuniorTopicEndPublicQuestion = {
  id: string;
  level: JuniorQuizLevel;
  question: string;
  options: readonly [string, string, string, string];
  hint: string;
};
