/**
 * 01_office_ai-6 Haftalık Sistem — canlı Excel / Cuma 30 dakika SSOT.
 * Dağınık hafta Beat 2’de durur; sistemli Cuma tablosu yalnız Beat 3 sağ panelde.
 */

export const ACADEMY_WEEKLY_ROUTINE_WINDOW_TITLE = "Excel" as const;
export const ACADEMY_WEEKLY_ROUTINE_FILE_NAME = "Cuma_30_Dakika.xlsx" as const;
export const ACADEMY_WEEKLY_ROUTINE_SHEET_NAME = "CumaRutin" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — harf harf. PEDAGOJI §E.7. */
export const ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT =
  "Cuma otuz dakikalık ofis rutinini üç bloğa böl. İlk on dakika Excel: tabloyu yapay zekâya dosya olarak ver veya Copilot varsa şeritten okut. İkinci on dakika slayt: temiz tablodan üç madde ve bir eylem cümlesi iste. Üçüncü on dakika e-posta: gelen kutundaki işleri aynı pencerede kapat." as const;

export const ACADEMY_WEEKLY_ROUTINE_FLAG_CELLS = ["D3", "D5"] as const;

/** Dağınık hafta — kriz tekrarı. Sistemli Cuma tablosu Beat 3’e kadar kapalı. */
export const ACADEMY_WEEKLY_ROUTINE_CHAOS_TABLE = {
  headers: ["Gün", "Ne yaptın", "Süre", "Sonuç"],
  rows: [
    ["Pazartesi", "Tabloyu kopyala", "45 dk", "Yapıştırma"],
    ["Salı", "Ekran görüntüsü", "30 dk", "Kopuk kutu"],
    ["Çarşamba", "Krizi icat et", "80 dk", "Gece mesaisi"],
    ["Perşembe", "Kör rapor", "25 dk", "Sapma kaçtı"],
    ["Cuma", "Yetiştirme", "90 dk", "Sistem yok"],
  ],
  note: "Spoiler yasağı: sistemli Cuma tablosu Beat 3’e kadar kapalı.",
} as const;

export const ACADEMY_WEEKLY_ROUTINE_SYSTEM_TABLE = {
  headers: ["Blok", "İş", "Süre", "Kapı"],
  rows: [
    ["0–10", "Excel ataş", "10 dk", "Tablo yerinde"],
    ["10–20", "Üç madde + slayt", "10 dk", "Tek fikir"],
    ["20–30", "E-posta", "10 dk", "Gelen kutusu"],
    ["Sonra", "Gmail paneli", "g1", "Gemini"],
    ["Sonra", "Word ataş", "w1", "Sözleşme"],
  ],
  note: "Cuma 30 Dakika üç blok. 3. Kapı maskeli kısa özet. Sınav tüm dersler bitince.",
} as const;
