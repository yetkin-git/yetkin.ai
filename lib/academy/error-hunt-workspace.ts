/**
 * 01_office_ai-5 İstisnalar ve Hata Avı — canlı Excel / AI Masası SSOT.
 * Uydurma tablo Beat 2’de durur; düzeltilmiş dedektif tablosu yalnız Beat 3 sağ panelde.
 */

import { ACADEMY_OFFICE_AI_5_COPILOT_PROMPT } from "@/lib/academy/lesson-beat-visual";

export const ACADEMY_ERROR_HUNT_WINDOW_TITLE = "Excel" as const;
export const ACADEMY_ERROR_HUNT_FILE_NAME = "Tahsilat_Hata_Avi.xlsx" as const;
export const ACADEMY_ERROR_HUNT_FILE_LABEL = "Tahsilat Hata Avı (Excel)" as const;
export const ACADEMY_ERROR_HUNT_SHEET_NAME = "MartNisan" as const;

export const ACADEMY_ERROR_HUNT_SAMPLE_LOCK =
  "Örnek sayılar; kendi tablondaki sayıyı koy." as const;

/** Tek istem SSOT — `ACADEMY_OFFICE_AI_5_COPILOT_PROMPT` alias. */
export const ACADEMY_ERROR_HUNT_COPILOT_PROMPT = ACADEMY_OFFICE_AI_5_COPILOT_PROMPT;

export const ACADEMY_ERROR_HUNT_FLAG_CELLS = ["D4", "D5"] as const;

/** Yıldız satır toplamı 21.500 (olması gereken 12.500); genel toplam 59.450 = 20.650+17.300+21.500 (olması gereken 50.450). */
export const ACADEMY_ERROR_HUNT_HALLUCINATED_TABLE = {
  headers: ["Cari", "Mart", "Nisan", "Satır Toplam"],
  rows: [
    ["Kaya Gıda A.Ş.", "12.450", "8.200", "20.650"],
    ["Demir Lojistik", "8.200", "9.100", "17.300"],
    ["Yıldız Tekstil", "9.100", "3.400", "21.500"],
    ["Genel Toplam", "29.750", "20.700", "59.450"],
  ],
  note: ACADEMY_ERROR_HUNT_SAMPLE_LOCK,
} as const;

export const ACADEMY_ERROR_HUNT_VERIFIED_TABLE = {
  headers: ["Cari", "Mart", "Nisan", "Satır Toplam"],
  rows: [
    ["Kaya Gıda A.Ş.", "12.450", "8.200", "20.650"],
    ["Demir Lojistik", "8.200", "9.100", "17.300"],
    ["Yıldız Tekstil", "9.100", "3.400", "12.500"],
    ["Genel Toplam", "29.750", "20.700", "50.450"],
  ],
  note: `${ACADEMY_ERROR_HUNT_SAMPLE_LOCK} D4 formülle 12.500; genel toplam 50.450. İnsan gözü kilit.`,
} as const;
