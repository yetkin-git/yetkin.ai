/**
 * Öğretmen ve veli (18+) — taslak harita.
 * Canlı sınav yolu `CURRICULUM_LESSON_KEYS_BY_SLUG` içine yazılmaz.
 * Gömülmeye hazır sıra `PHASE2_DRAFT_LESSON_KEYS_BY_SLUG` içindedir.
 * Vitrin kart kodu yoktur. `PTL-DRAFT` yayın SKU’su değildir.
 * Çocuk hesabı açılmaz. Junior açılmaz. Fırın yok.
 * Ön koşul yoktur. OFF-101 bitirmek gerekmez.
 */

export const PARENT_TEACHER_AI_SLUG_DRAFT = "parent_teacher_ai" as const;
/** Taslak kayıt kodu. `MODULE_CODE_BY_SLUG` ve vitrin bu değeri okumaz. */
export const PARENT_TEACHER_AI_MODULE_CODE_DRAFT = "PTL-DRAFT" as const;
export const PARENT_TEACHER_AI_STATUS = "planned" as const;
/** Baraj bu modülde kilitli değildir. Ofis barajı 70 ile karışmaz. */
export const PARENT_TEACHER_AI_EXAM_PASS_SCORE: number | null = null;

export const PARENT_TEACHER_AI_LESSON_PLAN = [
  {
    key: "parent_teacher_ai-1",
    order: 1,
    title: "Sohbet Kutusu Nedir, Ne Değildir?",
    status: PARENT_TEACHER_AI_STATUS,
    focus: "Sohbet kutusu okul dosyası değildir. Çocuğun adı, okulu ve notu kutuya yapışmaz. Hesap yetişkinin adınadır.",
  },
  {
    key: "parent_teacher_ai-2",
    order: 2,
    title: "Dört Parça: Rol, Görev, Biçim, Kısıt",
    status: PARENT_TEACHER_AI_STATUS,
    focus: "Tek iş, dört parçalı istem. Ödev modelden teslim ettirilmez.",
  },
  {
    key: "parent_teacher_ai-3",
    order: 3,
    title: "Uydurma Cevap: Kaynak Sor",
    status: PARENT_TEACHER_AI_STATUS,
    focus: "Akıcı cümle kaynak değildir. Alıntı ve tarih modelden gelmez.",
  },
  {
    key: "parent_teacher_ai-4",
    order: 4,
    title: "Öğrenci Verisi: Ne Yapıştırılmaz",
    status: PARENT_TEACHER_AI_STATUS,
    focus: "Ad, fotoğraf, not ve adres açık hâliyle kutuya girmez.",
  },
  {
    key: "parent_teacher_ai-5",
    order: 5,
    title: "Ödev ve Proje: Öğrenci Yazar, Model Taslak Önerir",
    status: PARENT_TEACHER_AI_STATUS,
    focus: "Taslak listesi üçüncü satırda biter. Teslim cümlesi çocuğun cümlesidir.",
  },
  {
    key: "parent_teacher_ai-6",
    order: 6,
    title: "Veli–Öğretmen Konuşması: Ev Kuralı, Okul Kuralı",
    status: PARENT_TEACHER_AI_STATUS,
    focus: "İki kural çatışırsa okulun yazılı kuralı durur. Konuşma sen dilindedir. Mektup bu dersin işi değildir.",
  },
] as const;
