/**
 * OFF-201 / 01_office_ai_ileri — canlı ders haritası.
 * Kart kodu `OFF-201`. Emekli slug `02_business_ai` kullanılmaz.
 * Canlı sınav yolu `CURRICULUM_LESSON_KEYS_BY_SLUG` bu altı anahtarı yazar.
 * `curricula/index.ts` bu modülü import eder.
 * Uydu vaadi bu altı dersle aynıdır. XLOOKUP, özet tablo, OCR ve belge birleştirme bu sürümde yoktur.
 * Ders 3–5 mühürlüdür. Ders 1, 2 ve 6 ses bekler (`audio_pending`).
 */

/** Canlı slug. Adres `01_office_ai_ileri`. Kart kodu `OFF-201`. */
export const OFFICE_AI_2_SLUG = "01_office_ai_ileri" as const;
export const OFFICE_AI_2_MODULE_CODE = "OFF-201" as const;
/** Modül kaydı yayında. Ders 1, 2 ve 6 sesi ayrı: `audio_pending`. Satış kapısı bu etiketten açılmaz. */
export const OFFICE_AI_2_STATUS = "published" as const;
/** İptal kaset. Metin açık; ses yeniden fırın bekler. */
export const OFFICE_AI_2_AUDIO_PENDING = "audio_pending" as const;

export const OFFICE_AI_2_LESSON_PLAN = [
  {
    key: "01_office_ai_ileri-1",
    order: 1,
    title: "Dört Parçalı İstem",
    status: OFFICE_AI_2_AUDIO_PENDING,
    focus: "Tek bir iş notunu, veri sırasından sonra dört parçalı isteme döker. Parçalar rol, görev, biçim ve kısıttır. Eksik parça akıcı ama yanlış cevap üretir.",
  },
  {
    key: "01_office_ai_ileri-2",
    order: 2,
    title: "Toplantı Notu ve Eylem Listesi",
    status: OFFICE_AI_2_AUDIO_PENDING,
    focus: "Dağınık toplantı notundan kim, ne, ne zaman çıkarır. Çakışan saati ayrı satırda işaretler. Ham not kişisel hesaba gitmez.",
  },
  {
    key: "01_office_ai_ileri-3",
    order: 3,
    title: "Excel Formül ve Grafik",
    status: OFFICE_AI_2_STATUS,
    focus: "Tablodaki toplamı toplama formülüyle hücreye kilitler. Grafik, formülün okuduğu hücrelerden seçilir. Düz sayı ve uydurma formül masaya konmaz.",
  },
  {
    key: "01_office_ai_ileri-4",
    order: 4,
    title: "Uzun Belge ve Sayfa Kontrolü",
    status: OFFICE_AI_2_STATUS,
    focus: "Uzun belgeden maddeyi sayfa numarasıyla çıkarır. Yapay zekânın atladığı maddeyi, o sayfayı açarak denetler. «Tam analiz» cümlesi sayfa kontrolünün yerini tutmaz.",
  },
  {
    key: "01_office_ai_ileri-5",
    order: 5,
    title: "E-Posta Sınıflandırma ve Yanıt Taslağı",
    status: OFFICE_AI_2_STATUS,
    focus: "Karmaşık iş postasını üç sınıfa ayırır. Sınıflar bilgi, şikayet ve kişisel veri talebidir. Her iş ayrı satırdadır. Taslak şirket kuralına uyar. Ad, telefon, IBAN ve kimlik taslağa girmez. Taslak gönderilmez.",
  },
  {
    key: "01_office_ai_ileri-6",
    order: 6,
    title: "Üç Dosyada Yan Yana Sayı Denetimi",
    status: OFFICE_AI_2_AUDIO_PENDING,
    focus: "Tablo, yazılı not ve uzun belgeyi yan yana denetler. Uyuşmayan sayıyı tek sayfalık karar notuna koymaz. İki sayının ortası yeni sayıdır. Ad, telefon ve IBAN nota girmez.",
  },
] as const;
