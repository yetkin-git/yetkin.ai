/**
 * 01_office_ai-k1 KVKK / maskeleme — canlı Excel SSOT.
 * Ham liste Beat 2’de durur; maskeli kısa özet yalnız Beat 3 sağ panelde.
 */

export const ACADEMY_KVKK_WINDOW_TITLE = "Excel" as const;
export const ACADEMY_KVKK_FILE_NAME = "Musteri_Liste_Maske.xlsx" as const;
export const ACADEMY_KVKK_SHEET_NAME = "Maske" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — harf harf. PEDAGOJI §E.7. */
export const ACADEMY_KVKK_COPILOT_PROMPT =
  "Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste. Kişisel veri ekleme." as const;

/** Ham ızgarada Ad, Telefon, IBAN — ürün hücresi bayrak almaz. */
export const ACADEMY_KVKK_FLAG_CELLS = ["A2", "B2", "C2"] as const;

/** Ham yapıştırma — kişi adı, telefon ve IBAN açık. Maskeli tablo Beat 3’e kadar kapalı. */
export const ACADEMY_KVKK_RAW_TABLE = {
  headers: ["Ad", "Telefon", "IBAN", "Ürün"],
  rows: [
    ["Ayşe Kaya", "0532…", "TR12…7890", "Un 25kg"],
    ["Mert Demir", "0542…", "TR33…1122", "Yağ 18L"],
    ["Elif Yılmaz", "0505…", "TR90…3344", "Şeker"],
    ["Can Öz", "0555…", "TR44…5566", "Un 10kg"],
    ["Seda Ak", "0533…", "TR77…7788", "Tuz"],
  ],
  note: "Spoiler yasağı: maskeli kısa özet Beat 3’e kadar kapalı. Ekranda tam IBAN yok.",
} as const;

/** 3. Kapı: üç sahte satır + takma değer. Sütunlar istemle aynı: Ürün, Adet, Bölge. */
export const ACADEMY_KVKK_MASKED_TABLE = {
  headers: ["Kod", "Bölge", "Ürün", "Adet"],
  rows: [
    ["Müşteri A", "Marmara", "Un 25kg", "40"],
    ["Müşteri B", "Ege", "Yağ 18L", "12"],
    ["Müşteri C", "İç Anadolu", "Şeker", "8"],
    ["Not", "MASKELİ_IBAN", "MASKELİ_TELEFON", "3 satır"],
  ],
  note: "3. Kapı: maskeli kısa özet. Ham kutu ve ekran görüntüsü zinciri yok. Üç satır yeter.",
} as const;
