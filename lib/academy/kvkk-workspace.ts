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

export const ACADEMY_KVKK_FLAG_CELLS = ["B2", "C2", "D3"] as const;

/** Ham yapıştırma — kişi adı ve IBAN açık. Maskeli tablo Beat 3’e kadar kapalı. */
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

export const ACADEMY_KVKK_MASKED_TABLE = {
  headers: ["Kod", "Bölge", "Ürün", "Adet"],
  rows: [
    ["A.K.", "Marmara", "Un 25kg", "40"],
    ["M.D.", "Ege", "Yağ 18L", "12"],
    ["E.Y.", "İç Anadolu", "Şeker", "8"],
    ["Toplam", "—", "—", "60"],
    ["Not", "IBAN yok", "Telefon yok", "3 madde"],
  ],
  note: "3. Kapı: maskeli kısa özet. Ham kutu ve ekran görüntüsü zinciri yok.",
} as const;
