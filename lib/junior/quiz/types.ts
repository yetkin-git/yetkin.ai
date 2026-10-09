/**
 * Konu testi ve anlatış yönlendirmesinin tek evi.
 * Çekirdek konuda paket, kavram / uygulama / beceri sırasında üç çözümlü soru taşır.
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
  questions: readonly [
    JuniorTopicEndQuestion,
    JuniorTopicEndQuestion,
    JuniorTopicEndQuestion,
  ];
};

export type JuniorTopicEndPublicQuestion = {
  id: string;
  level: JuniorQuizLevel;
  question: string;
  options: readonly [string, string, string, string];
  hint: string;
};
