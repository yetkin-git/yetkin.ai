import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi. İslam medeniyetinin ortak mirası. */
export const JUNIOR_SOSYAL_QUIZ_23 = {
  lessonKey: "jr_06_sosyal-23",
  title: "İslam medeniyetinin ortak mirası",
  tellGuides: [
    "Ortak miras ne demektir?",
    "Kütüphane ile hastaneyi neden aynı mirasta sayarsın?",
    "Bugünkü bir izi nasıl yorumlarsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "VII–XIII. yüzyıl İslam medeniyetinde ortak miras ne demektir?",
      options: [
        "Birçok şehrin birlikte büyüttüğü eser ve bilgi",
        "Tek bir evin duvar süsü",
        "Yalnızca bir şehrin sur adı",
        "Bugün hiç kullanılmayan bir eşya",
      ],
      correctAnswerIndex: 0,
      hint: "Kütüphane ve hastane bu taraftadır.",
      explanation:
        "Adım 1: Ortak miras birçok şehrin eseridir. Adım 2: Kütüphane ve hastane bu eserlerdendir. Adım 3: Tek evin süsü bu tanımın yerine geçmez.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Çizimde kütüphane ile hastane yan yana durunca hangi yorum doğrudur?",
      options: [
        "İkisi de şehirler arasında dolaşan ortak mirastır",
        "İkisi de tek bir evin süsüdür",
        "Hastane miras sayılmaz, yalnız kitap sayılır",
        "Eser bugün hiçbir işe yaramaz",
      ],
      correctAnswerIndex: 0,
      hint: "Kitap ve bakım bilgisi şehir değiştirir.",
      explanation:
        "Adım 1: Kütüphanede kitap çoğaltılıp gider. Adım 2: Hastanedeki bakım bilgisi de dolaşır. Adım 3: İkisi de ortak mirastır.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Okul kitaplığında bir kitap ve defterindeki sayı düzeni duruyor. Öğrenci, VII. yüzyıldan XIII. yüzyıla uzanan İslam medeniyetinin bu izini yorumlayacak. Doğru iş hangisidir?",
      options: [
        "Kitabı ve sayı düzenini ortak mirasın bugünkü izi diye söylemek",
        "İkisini de tek şehrin süsü sanmak",
        "Sayıyı mirastan ayırıp yalnız sur adı ezberlemek",
        "Araştırmadan eserin bittiğini söylemek",
      ],
      correctAnswerIndex: 0,
      hint: "Eserin adı, işi ve bugünkü izi ayrı durur.",
      explanation:
        "Adım 1: Kitap, çoğaltılan sayfanın izidir. Adım 2: Sayı düzeni defterde durur. Adım 3: İkisi de ortak mirasın bugünkü izi diye yorumlanır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
