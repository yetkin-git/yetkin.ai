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
    ["0–10", "Excel temizlik", "10 dk", "Tablo yerinde"],
    ["10–20", "Slayt özet", "10 dk", "Üç madde"],
    ["20–30", "E-posta sıfırlama", "10 dk", "Gelen kutusu"],
  ],
  note: "Cuma 30 Dakika üç blok: Excel temizlik, slayt özet, e-posta sıfırlama. 3. Kapı maskeli kısa özet.",
} as const;

/** Cue-08 canlı sahne — 16:9 tuvalde dikey ezilmeden oturan kapanış mührü. */
export const ACADEMY_WEEKLY_ROUTINE_EXAM_GATE_SEAL = "Sınav Kapısı Açıldı" as const;
export const ACADEMY_WEEKLY_ROUTINE_EXAM_GATE_SEAL_SUB = "Baraj 70 · mühürlü vize kartı" as const;

export function academyWeeklyRoutineExamGateSealVisible(
  lessonKey: string,
  section: string,
  pane?: string,
): boolean {
  return (
    lessonKey.trim() === "01_office_ai-6" &&
    section.trim() === "SIRA SENDE" &&
    pane !== "before"
  );
}
