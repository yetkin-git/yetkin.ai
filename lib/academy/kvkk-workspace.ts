/**
 * 01_office_ai-k1 KVKK / maskeleme — canlı Excel SSOT.
 * Ham liste Beat 2’de durur; maskeli kısa özet yalnız Beat 3 sağ panelde.
 */

export const ACADEMY_KVKK_WINDOW_TITLE = "Excel" as const;
export const ACADEMY_KVKK_FILE_NAME = "Musteri_Liste_Maske.xlsx" as const;
export const ACADEMY_KVKK_FILE_LABEL = "Müşteri Liste Maske (Excel)" as const;
export const ACADEMY_KVKK_SHEET_NAME = "Maske" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — harf harf. PEDAGOJI §E.7. */
export { ACADEMY_OFFICE_AI_K1_COPILOT_PROMPT as ACADEMY_KVKK_COPILOT_PROMPT } from "@/lib/academy/lesson-beat-visual";

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

/**
 * 3. Kapı: üç sahte satır + takma değer.
 * Split sağ panel ham tabloyla satır hiyerarşisi paylaşır (PEDAGOJI E.1):
 * Kod | Telefon | IBAN | Ürün — her müşteri kendi MASKELİ_* değerleriyle aynı satırda.
 */
export const ACADEMY_KVKK_MASKED_TABLE = {
  headers: ["Kod", "Telefon", "IBAN", "Ürün"],
  rows: [
    ["Müşteri A", "MASKELİ_TELEFON", "MASKELİ_IBAN", "Un 25kg"],
    ["Müşteri B", "MASKELİ_TELEFON", "MASKELİ_IBAN", "Yağ 18L"],
    ["Müşteri C", "MASKELİ_TELEFON", "MASKELİ_IBAN", "Şeker"],
  ],
  note: "3. Kapı: maskeli kısa özet. Ham kutu ve ekran görüntüsü zinciri yok. Üç satır yeter.",
} as const;
