/**
 * Altın Şablon — 4-beat görsel reji (PEDAGOJI.md §B).
 * 0–2 sn: Lyria jenerik + logo. Warm-up: 8 sn Veo 3.1 Lite B-roll (yerel MP4 reuse veya Ken Burns), sonra canlı Excel (donmuş kare yok).
 * Beat 2 (Command): %80 tek ekran; ızgara dağınık kalır — temiz tablo spoiler yasak.
 * Beat 3: dikey split-screen Önce / Sonra; temiz tablo ilk kez sağ panelde.
 * Beat 4: düzenli nihai tabloya dönüş.
 * Vatandaş etiketinde «Kirli» yok.
 */

import { academyPlaybackCueAtTime, type AcademyLessonCue } from "@/lib/academy/lesson-cues";

export const ACADEMY_GOLDEN_BEAT_IDS = ["warmup", "command", "comparison", "task"] as const;

export type AcademyGoldenBeatId = (typeof ACADEMY_GOLDEN_BEAT_IDS)[number];

export const ACADEMY_GOLDEN_WAITER_RATIO = 80 as const;

export const ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL = "ÖNCE (DÜZENLEMESİZ)" as const;
export const ACADEMY_GOLDEN_COMPARE_AFTER_LABEL = "SONRA (AI İLE)" as const;

/** 01_office_ai-2 Beat 3 — 10 sayfalık döküm vs 3 maddelik yönetim özeti. */
export const ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL = "ÖNCE (10 SAYFALIK DÖKÜM)" as const;
export const ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL = "SONRA (3 MADDELİK YÖNETİM ÖZETİ - AI)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_2_COPILOT_PROMPT =
  "Bu temiz tablodan toplamı ve trendi söyle. Tam üç maddelik yönetici özeti ve tek karar cümlesi yaz. Sayıları tablodaki hücrelerden al. Uydurma yüzde ekleme." as const;

/** 01_office_ai-3 Beat 3 — düz metin yığını vs görsel hiyerarşili slayt. */
export const ACADEMY_OFFICE_AI_3_COMPARE_BEFORE_LABEL = "ÖNCE (DÜZ METİN YIĞINI)" as const;
export const ACADEMY_OFFICE_AI_3_COMPARE_AFTER_LABEL = "SONRA (GÖRSEL HİYERARŞİLİ SLAYT - AI)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_3_COPILOT_PROMPT =
  "Bu düz metni slayt başına tek fikir ve görsel yönlendirme ile taslağa çevir. Copilot varsa şeride yaz; yoksa PowerPoint sunusu olarak ataşla." as const;

/** 01_office_ai-4 Beat 3 — 142 okunmamış mail vs sıfırlanmış kutu. */
export const ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL = "ÖNCE (142 OKUNMAMIŞ MAİL)" as const;
export const ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL = "SONRA (SIFIRLANMIŞ KUTU - AI)" as const;

/** 01_office_ai-5 Beat 3 — kör süreç vs dedektif süreç. */
export const ACADEMY_OFFICE_AI_5_COMPARE_BEFORE_LABEL = "KÖR SÜREÇ (HALÜSİNASYONLU VERİ)" as const;
export const ACADEMY_OFFICE_AI_5_COMPARE_AFTER_LABEL = "DEDEKTİF SÜREÇ (KONTROLLÜ VERİ)" as const;

/** 01_office_ai-6 Beat 3 — dağınık hafta vs Cuma otuz (sistemli rutin); mühürlü kaset. */
export const ACADEMY_OFFICE_AI_6_COMPARE_BEFORE_LABEL = "DAĞINIK HAFTA (KRİZ TEKRARI)" as const;
export const ACADEMY_OFFICE_AI_6_COMPARE_AFTER_LABEL = "CUMA OTUZ (SİSTEMLİ RUTİN)" as const;

/** 01_office_ai-g1 Beat 3 — gelen kutusundan kopuk taşıma su vs yerleşik Gemini. */
export const ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL =
  "GELEN KUTUSUNDAN KOPUK / TAŞIMA SU YÖNTEMİ" as const;
export const ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL =
  "GELEN KUTUSU İÇİ / YERLEŞİK GEMİNİ ENTEGRASYONU" as const;

/** 01_office_ai-w1 Beat 3 — tek tek kopyalama vs tek dosyayla analiz. */
export const ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL = "TEK TEK KOPYALAMA" as const;
export const ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL = "TEK DOSYAYLA ANALİZ" as const;

/** 01_office_ai-k1 Beat 3 — ham yapıştırma vs maskeli kısa özet. */
export const ACADEMY_OFFICE_AI_K1_COMPARE_BEFORE_LABEL = "HAM YAPIŞTIRMA (AÇIK KİMLİK)" as const;
export const ACADEMY_OFFICE_AI_K1_COMPARE_AFTER_LABEL = "MASKELİ KISA ÖZET (3. KAPI)" as const;

/** CEBİNE KOY overlay — 01_office_ai-1. */
export const ACADEMY_OFFICE_AI_1_POCKET_STEPS = [
  "A1'e sütun adı",
  "Birleşikleri çöz & boşlukları sil",
  "Yalın dille tek tip yap",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-2. */
export const ACADEMY_OFFICE_AI_2_POCKET_STEPS = [
  "Toplam ve trendi iste",
  "Anomali ve riskleri sor",
  "Eylem cümlesine çevir",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-3. */
export const ACADEMY_OFFICE_AI_3_POCKET_STEPS = [
  "Slayt başına tek fikir",
  "Görsel yönlendirmeyi yaz",
  "Taslağı aktar",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-4. */
export const ACADEMY_OFFICE_AI_4_POCKET_STEPS = [
  "Önem sırası etiketle",
  "Taslak yanıtı yazdır",
  "Arşive kaldır",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-5. */
export const ACADEMY_OFFICE_AI_5_POCKET_STEPS = [
  "Toplamı formülle doğrula",
  "Mantık hatası sor",
  "İnsan gözü kilitle",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-6. */
export const ACADEMY_OFFICE_AI_6_POCKET_STEPS = [
  "Cuma 30'u takvime yaz",
  "10 Excel + 10 slayt + 10 kutu",
  "Maskeli kısa son çare",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-g1. */
export const ACADEMY_OFFICE_AI_G1_POCKET_STEPS = [
  "Yerleşik paneli aç",
  "Aksiyon tablosu iste",
  "Onaylamadan gönderme",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-w1. */
export const ACADEMY_OFFICE_AI_W1_POCKET_STEPS = [
  "Dosyayı yükle",
  "Üç işi ayrı iste",
  "İmzayı kendin at",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-k1. */
export const ACADEMY_OFFICE_AI_K1_POCKET_STEPS = [
  "Ham veri yükleme",
  "Maskeleyip sor",
  "3. Kapı kısa özet",
] as const;

/** Command akış bandı — punchcard durum değil, Nasıl Yapılır? 1-2-3. */
export type AcademyHowtoStep = {
  n: 1 | 2 | 3;
  label: string;
};

export const ACADEMY_OFFICE_AI_1_HOWTO_STEPS = [
  { n: 1, label: "Copilot Şeridi" },
  { n: 2, label: "Ataş — Maske 2. Ders" },
  { n: 3, label: "A1'e Sütun Adı Koy" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_2_HOWTO_STEPS = [
  { n: 1, label: "Dökümü Ver" },
  { n: 2, label: "Üç Madde İste" },
  { n: 3, label: "Yönetici Özetini Al" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_3_HOWTO_STEPS = [
  { n: 1, label: "Düz Metni Seç" },
  { n: 2, label: "Tek Fikir Yaz" },
  { n: 3, label: "Taslağı Aktar" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_4_HOWTO_STEPS = [
  { n: 1, label: "E-Postaları Seç" },
  { n: 2, label: "Copilot Paneli" },
  { n: 3, label: "Taslak Yanıt Üret" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_5_HOWTO_STEPS = [
  { n: 1, label: "Veriyi Yükle" },
  { n: 2, label: "Çapraz Sorgu İstemini Yaz" },
  { n: 3, label: "Sapan Hücreyi Onayla" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_6_HOWTO_STEPS = [
  { n: 1, label: "Takvime Yaz" },
  { n: 2, label: "Üç Bloğu Kur" },
  { n: 3, label: "E-postayı Kapat" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_G1_HOWTO_STEPS = [
  { n: 1, label: "Paneli Aç" },
  { n: 2, label: "Aksiyon İste" },
  { n: 3, label: "Onayla, Gönderme" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_W1_HOWTO_STEPS = [
  { n: 1, label: "Dosyayı Ataşla" },
  { n: 2, label: "Üç İşi Ayır" },
  { n: 3, label: "İmzayı At" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_K1_HOWTO_STEPS = [
  { n: 1, label: "Yasak Listeyi Aç" },
  { n: 2, label: "Maskele" },
  { n: 3, label: "Kısa Özet Yaz" },
] as const satisfies readonly AcademyHowtoStep[];

const HOWTO_HIDDEN_SECTIONS = new Set(["GİRİŞ KÖPRÜSÜ", "CEBİNE KOY"]);

const HOWTO_ACTIVE_BY_LESSON: Readonly<Record<string, Readonly<Record<string, 0 | 1 | 2>>>> = {
  "01_office_ai-1": {
    "HOŞ GELDİN": 0,
    "DÜZENSİZ TABLO": 0,
    "A1 HÜCRESİ": 0,
    "TEMİZLE ŞİMDİ": 1,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-2": {
    "HOŞ GELDİN": 0,
    "UZUN RAPOR": 0,
    "ÖZET İSTE": 1,
    "KARAR NOTU": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-3": {
    "HOŞ GELDİN": 0,
    "ŞABLON KAOSU": 0,
    "SLAYT İSTE": 1,
    "HİYERARŞİ": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-4": {
    "HOŞ GELDİN": 0,
    "INBOX KAOSU": 0,
    "TASLAK YAZ": 1,
    "SIFIR KUTU": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-5": {
    "HOŞ GELDİN": 0,
    "AŞIRI GÜVEN": 0,
    "HATA AVI": 1,
    "AI DEDEKTİF": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-6": {
    "HOŞ GELDİN": 0,
    "DAĞINIK HAFTA": 0,
    "OTUZ DAKİKA": 1,
    "ÜÇ BLOK": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-g1": {
    "HOŞ GELDİN": 0,
    "TAŞIMA SU": 0,
    "GEMİNİ AÇ": 1,
    "YERLEŞİK YOL": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-w1": {
    "HOŞ GELDİN": 0,
    "PARÇA PARÇA": 0,
    "ATAŞ YÜKLE": 1,
    "TEK DOSYAYLA ANALİZ": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
  "01_office_ai-k1": {
    "HOŞ GELDİN": 0,
    "YASAK LİSTE": 0,
    "MASKELE": 1,
    "ÜÇÜNCÜ KAPI": 2,
    "FARK ORTADA": 2,
    "SIRA SENDE": 2,
  },
};

export function academyHowtoSteps(lessonKey: string): readonly AcademyHowtoStep[] | null {
  const key = lessonKey.trim();
  if (key === "01_office_ai-1") {
    return ACADEMY_OFFICE_AI_1_HOWTO_STEPS;
  }
  if (key === "01_office_ai-2") {
    return ACADEMY_OFFICE_AI_2_HOWTO_STEPS;
  }
  if (key === "01_office_ai-3") {
    return ACADEMY_OFFICE_AI_3_HOWTO_STEPS;
  }
  if (key === "01_office_ai-4") {
    return ACADEMY_OFFICE_AI_4_HOWTO_STEPS;
  }
  if (key === "01_office_ai-5") {
    return ACADEMY_OFFICE_AI_5_HOWTO_STEPS;
  }
  if (key === "01_office_ai-6") {
    return ACADEMY_OFFICE_AI_6_HOWTO_STEPS;
  }
  if (key === "01_office_ai-g1") {
    return ACADEMY_OFFICE_AI_G1_HOWTO_STEPS;
  }
  if (key === "01_office_ai-w1") {
    return ACADEMY_OFFICE_AI_W1_HOWTO_STEPS;
  }
  if (key === "01_office_ai-k1") {
    return ACADEMY_OFFICE_AI_K1_HOWTO_STEPS;
  }
  return null;
}

export function academyHowtoBandVisible(section: string | undefined): boolean {
  if (!section) {
    return false;
  }
  return !HOWTO_HIDDEN_SECTIONS.has(section.trim());
}

/** 0-tabanlı aktif adım; bant kapalıysa -1. */
export function academyHowtoActiveIndex(lessonKey: string, section: string | undefined): number {
  if (!academyHowtoBandVisible(section) || !academyHowtoSteps(lessonKey)) {
    return -1;
  }
  const mapped = HOWTO_ACTIVE_BY_LESSON[lessonKey.trim()]?.[section!.trim()];
  return mapped ?? 0;
}

/** currentTime SSOT — punchcard auto-hide’tan bağımsız; nefes boşluğunda son cue tutulur. */
export function academyHowtoActiveIndexAtTime(
  lessonKey: string,
  currentTime: number,
  cues: readonly Pick<AcademyLessonCue, "id" | "start" | "end" | "section">[],
): number {
  const cue = academyPlaybackCueAtTime(cues, currentTime);
  return academyHowtoActiveIndex(lessonKey, cue?.section);
}

export function academyPocketChecklistSteps(
  lessonKey: string,
  section: string,
): readonly string[] | null {
  if (section.trim() !== "CEBİNE KOY") {
    return null;
  }
  const key = lessonKey.trim();
  if (key === "01_office_ai-1") {
    return ACADEMY_OFFICE_AI_1_POCKET_STEPS;
  }
  if (key === "01_office_ai-2") {
    return ACADEMY_OFFICE_AI_2_POCKET_STEPS;
  }
  if (key === "01_office_ai-3") {
    return ACADEMY_OFFICE_AI_3_POCKET_STEPS;
  }
  if (key === "01_office_ai-4") {
    return ACADEMY_OFFICE_AI_4_POCKET_STEPS;
  }
  if (key === "01_office_ai-5") {
    return ACADEMY_OFFICE_AI_5_POCKET_STEPS;
  }
  if (key === "01_office_ai-6") {
    return ACADEMY_OFFICE_AI_6_POCKET_STEPS;
  }
  if (key === "01_office_ai-g1") {
    return ACADEMY_OFFICE_AI_G1_POCKET_STEPS;
  }
  if (key === "01_office_ai-w1") {
    return ACADEMY_OFFICE_AI_W1_POCKET_STEPS;
  }
  if (key === "01_office_ai-k1") {
    return ACADEMY_OFFICE_AI_K1_POCKET_STEPS;
  }
  return null;
}

/** 01_office_ai-1 pekiştirme — CEBİNE KOY ducking 0.46. Giriş jeneriği 0–2 sn ayrı. Bitiş 2–3 sn fade-out. */
export const ACADEMY_GOLDEN_REINFORCEMENT_CUE_IDS = ["cue-07"] as const;

export const ACADEMY_GOLDEN_BEAT_VISUAL = {
  warmup: { mode: "veo", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
  command: { mode: "live", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
  comparison: { mode: "split", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
  task: { mode: "live", waiterRatio: ACADEMY_GOLDEN_WAITER_RATIO },
} as const;

export type AcademyGoldenVisualMode = (typeof ACADEMY_GOLDEN_BEAT_VISUAL)[AcademyGoldenBeatId]["mode"];
