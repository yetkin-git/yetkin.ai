/**
 * 01_office_ai-k1 KVKK / maskeleme — canlı Excel SSOT.
 * Ham liste Beat 2’de durur; maskeli kısa özet yalnız Beat 3 sağ panelde.
 */

/**
 * 2. ders kritik özeti — Sil düğmesi senin ekranından kaldırır, modelin gördüğünü geri almaz.
 * Kart, el kitabı, SSS ve çıkış şablonu bu cümleyi birebir taşır.
 */
export const ACADEMY_KVKK_DELETE_BUTTON_SUMMARY =
  "Sohbet ekranında Sil düğmesine basmak, o veriyi yapay zekânın aklından silmez; sadece senin ekranından kaldırır. Model o adresi, IBAN'ı bir kez gördüyse sunucusuna kaydetmiştir. Bu yüzden 'silmesi kolay' deyip gerçek veriyi sohbete asla atmazsın, önce maskelersin." as const;

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
 * 3. Kapı: üç sahte satır + takma değer (Garsonu Göster).
 * Split sağ panel ham tabloyla satır hiyerarşisi paylaşır (PEDAGOJI E.1):
 * Kod | Telefon | IBAN | Ürün — her müşteri kendi Tel / IBAN takmasıyla aynı satırda.
 * MASKELİ_* tekrarı vatandaşa basılmaz; Tel1 / IBAN1 gibi doğal takma değer durur.
 */
export const ACADEMY_KVKK_MASKED_TABLE = {
  headers: ["Kod", "Telefon", "IBAN", "Ürün"],
  rows: [
    ["Müşteri A", "Tel1", "IBAN1", "Un 25kg"],
    ["Müşteri B", "Tel2", "IBAN2", "Yağ 18L"],
    ["Müşteri C", "Tel3", "IBAN3", "Şeker"],
  ],
  note: "Maskeli kısa özet. Ham kutu ve ekran görüntüsü zinciri yok. Üç satır tablo şeklini gösterir.",
} as const;
