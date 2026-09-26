/**
 * Altın Şablon — 4-beat görsel reji (PEDAGOJI.md §B).
 * 0–2 sn: Lyria jenerik + logo. Warm-up: 8 sn Veo 3.1 Lite B-roll (yerel MP4 reuse veya Ken Burns), sonra canlı Excel (donmuş kare yok).
 * Beat 2 (Command): %80 tek ekran; ızgara dağınık kalır — temiz tablo spoiler yasak.
 * Beat 3: dikey split-screen Önce / Sonra; temiz tablo ilk kez sağ panelde.
 * Beat 4: düzenli nihai tabloya dönüş.
 * Vatandaş etiketinde «Kirli» yok.
 * OFF-201 (`01_office_ai_ileri`) reji bu dosyanın sonundadır.
 * Canlı sahne `lib/academy/off201-cinema-slides.ts` üzerinden bu kaydı okur.
 */

import { academyPlaybackCueAtTime, type AcademyLessonCue } from "@/lib/academy/lesson-cues";

export const ACADEMY_GOLDEN_BEAT_IDS = ["warmup", "command", "comparison", "task"] as const;

export type AcademyGoldenBeatId = (typeof ACADEMY_GOLDEN_BEAT_IDS)[number];

export const ACADEMY_GOLDEN_WAITER_RATIO = 80 as const;

export const ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL = "ÖNCE (DÜZENLEMESİZ)" as const;
export const ACADEMY_GOLDEN_COMPARE_AFTER_LABEL = "SONRA (AI İLE)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_1_COPILOT_PROMPT =
  "Sana sunduğum bu ham veri içinde yer alan birleştirilmiş hücreleri tek tek ayır, aralardaki gereksiz boş satırları sil ve sayıları standart sayı formatına getir." as const;

/** 01_office_ai-2 Beat 3 — 10 sayfalık döküm vs 3 maddelik yönetim özeti. */
export const ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL = "ÖNCE (10 SAYFALIK DÖKÜM)" as const;
export const ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL = "SONRA (3 MADDELİK YÖNETİM ÖZETİ - AI)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_2_COPILOT_PROMPT =
  "Bu temiz tablodan toplamı ve yönü çıkar. Tam üç maddelik yönetim özetini ve tek karar cümlesini yaz. Sayıları tablodaki hücrelerden al. Uydurma yüzde ekleme." as const;

/** 01_office_ai-3 Beat 3 — düz metin yığını vs sıralı slayt. */
export const ACADEMY_OFFICE_AI_3_COMPARE_BEFORE_LABEL = "ÖNCE (DÜZ METİN YIĞINI)" as const;
export const ACADEMY_OFFICE_AI_3_COMPARE_AFTER_LABEL = "SONRA (SIRALI SLAYT - AI)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_3_COPILOT_PROMPT =
  "Bu üç maddeyi slayt başına tek fikirle taslağa çevir. Her slayt için başlığı, tek cümlelik mesajı ve parantez içinde görsel yönlendirmeyi yaz. Konuşmacı notunu slayt gövdesinden ayrı tut. Uydurma sayı ekleme." as const;

/** Sohbet kutusu istemine girmez — konsol alt-notu / howto bandı. */
export const ACADEMY_OFFICE_AI_3_COPILOT_HINT =
  "Copilot varsa şeride yaz; yoksa PowerPoint sunusu olarak ataşla." as const;

/** 01_office_ai-4 Beat 3 — 142 okunmamış ileti vs sıfır kutu. */
export const ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL = "ÖNCE (142 OKUNMAMIŞ İLETİ)" as const;
export const ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL = "SONRA (SIFIR KUTU - AI)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_4_COPILOT_PROMPT =
  "Gelen kutumdaki okunmamış iletileri tara. Bugün ödeme veya imza bekleyenleri Acil, bu hafta cevap bekleyenleri Aksiyon, dekont ve bültenleri Arşivlik diye etiketle. Aksiyon için taslak yanıt notu yaz. Hiçbir iletiyi gönderme, hiçbirini silme." as const;

/** 01_office_ai-5 Beat 3 — kör süreç vs dedektif süreç. */
export const ACADEMY_OFFICE_AI_5_COMPARE_BEFORE_LABEL = "KÖR SÜREÇ (UYDURMA VERİ)" as const;
export const ACADEMY_OFFICE_AI_5_COMPARE_AFTER_LABEL = "ÇAPRAZ KONTROL (KİLİTLİ SAYI)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_5_COPILOT_PROMPT =
  "Tablodaki satır toplamları ile genel toplam arasında çelişki olup olmadığını incele. Uyumsuz her satırı kırmızı ile işaretle ve nedenini yaz. Toplamı TOPLA formülüyle doğrula." as const;

/** 01_office_ai-6 Beat 3 — dağınık hafta vs Cuma otuz (sistemli rutin); mühürlü kaset. */
export const ACADEMY_OFFICE_AI_6_COMPARE_BEFORE_LABEL = "DAĞINIK HAFTA (KRİZ TEKRARI)" as const;
export const ACADEMY_OFFICE_AI_6_COMPARE_AFTER_LABEL = "CUMA OTUZ (SİSTEMLİ RUTİN)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_6_COPILOT_PROMPT =
  "Cuma otuz dakikalık ofis rutinini üç bloğa böl. İlk on dakika Excel: tabloyu yapay zekâya ataş ile yükle veya Copilot varsa şeritten okut. İkinci on dakika slayt: temiz tablodan üç madde ve bir karar cümlesi iste. Üçüncü on dakika kutu: gelen kutundaki işleri aynı pencerede kapat." as const;

/** 01_office_ai-g1 Beat 3 — gelen kutusundan kopuk taşıma su vs yerleşik Gemini. */
export const ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL =
  "GELEN KUTUSUNDAN KOPUK / TAŞIMA SU YÖNTEMİ" as const;
export const ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL =
  "GELEN KUTUSU İÇİ / YERLEŞİK GEMİNİ PANELİ" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — reji notu yok. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_G1_COPILOT_PROMPT =
  "Gelen kutumdaki son 24 saat içinde gelen e-postaları tara. Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu. Rutin dekont ve bültenleri Arşivlik yaz. Hiçbir taslağı gönderme." as const;

/** 01_office_ai-w1 Beat 3 — tek tek kopyalama vs tek dosyayla analiz. */
export const ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL = "TEK TEK KOPYALAMA" as const;
export const ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL = "TEK DOSYAYLA ANALİZ" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — sözleşme SSOT. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT =
  "Yüklediğim sözleşme dosyasını (Word belgesi) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme." as const;

/** Dilekçe işi — pratik alanı kopyalanabilir istem. Sahne konsolu sözleşme SSOT'unda kalır. */
export const ACADEMY_OFFICE_AI_W1_DILEKCE_PROMPT =
  "Yüklediğim dilekçe taslağını incele. Hitap satırını, konu satırını, üç cümlelik gerekçeyi, açık talebi ve ek listesini yaz. Tarih, sayı, unvan ve imzayı boş bırak. Uydurma kanun maddesi ekleme." as const;

/** Rapor işi — pratik alanı kopyalanabilir istem. Sahne konsolu sözleşme SSOT'unda kalır. */
export const ACADEMY_OFFICE_AI_W1_RAPOR_PROMPT =
  "Yüklediğim saha notundan bir sayfalık durum raporu çıkar: başlık, üç madde, bir sonraki adım. Gözlem ile karar notunu aynı cümleye koyma." as const;

/** 01_office_ai-k1 Beat 3 — ham yapıştırma vs maskeli kısa özet. */
export const ACADEMY_OFFICE_AI_K1_COMPARE_BEFORE_LABEL = "HAM YAPIŞTIRMA (HAM KİMLİK)" as const;
export const ACADEMY_OFFICE_AI_K1_COMPARE_AFTER_LABEL = "MASKELİ KISA ÖZET (3. KAPI)" as const;

/** Öğrencinin Prompt Terminaline yazacağı gerçek istem — kaset + çıkış kartı SSOT. PEDAGOJI §E.7. */
export const ACADEMY_OFFICE_AI_K1_COPILOT_PROMPT =
  "Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste." as const;

/** CEBİNE KOY overlay — 01_office_ai-0 (hazırlık şeridi, 101 dışı). */
export const ACADEMY_OFFICE_AI_0_POCKET_STEPS = [
  "Hesabı aç, kutuyu tanı",
  "Dört parçayla yaz",
  "Belgenin dilinde yaz",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-1. */
export const ACADEMY_OFFICE_AI_1_POCKET_STEPS = [
  "A1'e sütun adı",
  "Birleşikleri çöz & boşlukları sil",
  "Yalın dille tek tip yap",
] as const;

/** CEBİNE KOY overlay — 01_office_ai-2. */
export const ACADEMY_OFFICE_AI_2_POCKET_STEPS = [
  "Toplamı ve yönü iste",
  "Sapan nokta ve riskleri sor",
  "Karar cümlesine çevir",
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
  "Taslak yanıt iste",
  "Arşive al",
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

export const ACADEMY_OFFICE_AI_0_HOWTO_STEPS = [
  { n: 1, label: "Hesabı Aç" },
  { n: 2, label: "Kutuyu Tanı" },
  { n: 3, label: "İlk İstemi Yaz" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_1_HOWTO_STEPS = [
  { n: 1, label: "Copilot Düğmesi" },
  { n: 2, label: "Ataş — Maske 2. Ders" },
  { n: 3, label: "A1'e Sütun Adı Koy" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_2_HOWTO_STEPS = [
  { n: 1, label: "Tabloyu Ver" },
  { n: 2, label: "Üç Madde İste" },
  { n: 3, label: "Yönetim Özetini Al" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_3_HOWTO_STEPS = [
  { n: 1, label: "Metni Al" },
  { n: 2, label: "Tek Fikir Yaz" },
  { n: 3, label: "Taslağı Aktar" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_4_HOWTO_STEPS = [
  { n: 1, label: "İletileri Seç" },
  { n: 2, label: "Etiketle" },
  { n: 3, label: "Taslak İste" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_5_HOWTO_STEPS = [
  { n: 1, label: "Veriyi Yükle" },
  { n: 2, label: "Çapraz Kontrol İstemini Yaz" },
  { n: 3, label: "Sapan Hücreyi Kilitle" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_6_HOWTO_STEPS = [
  { n: 1, label: "Takvime Yaz" },
  { n: 2, label: "Üç Bloğu Kur" },
  { n: 3, label: "E-postayı Kapat" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_G1_HOWTO_STEPS = [
  { n: 1, label: "Yerleşik Paneli Aç" },
  { n: 2, label: "Aksiyon İste" },
  { n: 3, label: "Onaylamadan Gönderme" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_W1_HOWTO_STEPS = [
  { n: 1, label: "Dosyayı Yükle" },
  { n: 2, label: "Üç İşi Ayrı İste" },
  { n: 3, label: "İmzayı Kendin At" },
] as const satisfies readonly AcademyHowtoStep[];

export const ACADEMY_OFFICE_AI_K1_HOWTO_STEPS = [
  { n: 1, label: "Yasak Listeyi Aç" },
  { n: 2, label: "Maskele" },
  { n: 3, label: "Kısa Özet Yaz" },
] as const satisfies readonly AcademyHowtoStep[];

const HOWTO_HIDDEN_SECTIONS = new Set(["GİRİŞ KÖPRÜSÜ", "CEBİNE KOY"]);

const HOWTO_ACTIVE_BY_LESSON: Readonly<Record<string, Readonly<Record<string, 0 | 1 | 2>>>> = {
  "01_office_ai-0": {
    "TANIŞMA": 0,
    "HESAP AÇ": 0,
    "ÜCRET FARKI": 0,
    "SOHBET EKRANI": 1,
    "İLK İSTEM": 2,
    "HANGİ DİL": 2,
    "SIRA SENDE": 2,
  },
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
    "KUTU KAOSU": 0,
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
    "ÇAPRAZ KONTROL": 2,
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
  const visual = academyBusinessAiBeatVisual(lessonKey);
  if (visual) {
    return visual.pocketSteps.map((label, index) => ({
      n: (index + 1) as 1 | 2 | 3,
      label,
    }));
  }
  const key = lessonKey.trim();
  if (key === "01_office_ai-0") {
    return ACADEMY_OFFICE_AI_0_HOWTO_STEPS;
  }
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
  const business = academyBusinessAiBeatVisual(lessonKey);
  if (business) {
    const name = section!.trim();
    if (name === "VERİYİ VERMEDEN ÖNCE" || name === "DÖRT PARÇA") {
      return 1;
    }
    if (name === "YANLIŞ VE DOĞRU" || name === "SIRA SENDE") {
      return 2;
    }
    return 0;
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
  const trimmed = section.trim();
  const key = lessonKey.trim();
  const businessFirst = academyBusinessAiBeatVisual(key);
  if (businessFirst) {
    const pocket = businessFirst.punchcards.find((card) => card.beat === "pocket");
    if (!pocket || trimmed !== pocket.section) {
      return null;
    }
    return businessFirst.pocketSteps;
  }
  if (trimmed !== "CEBİNE KOY") {
    return null;
  }
  if (key === "01_office_ai-0") {
    return ACADEMY_OFFICE_AI_0_POCKET_STEPS;
  }
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

/**
 * OFF-201 taslak reji — `01_office_ai_ileri-1` … `01_office_ai_ileri-6`.
 * Punchcard rozeti en fazla üç sözcüktür (PEDAGOJI §E.2). İşin adıdır.
 * Split, YANLIŞ VE DOĞRU bölümündedir. Temiz sonuç sağ panelden önce açılmaz.
 * Canlı sahne bu kaydın rozet, split ve cep adımlarını cue slaytına bağlar.
 * `01_office_ai-*` sabitleri Amiral Gemisi dersleridir; bu blok onlara yazılmaz.
 */
export const ACADEMY_BUSINESS_AI_PUNCHCARD_COUNT = 8 as const;

export const ACADEMY_BUSINESS_AI_LESSON_KEYS = [
  "01_office_ai_ileri-1",
  "01_office_ai_ileri-2",
  "01_office_ai_ileri-3",
  "01_office_ai_ileri-4",
  "01_office_ai_ileri-5",
  "01_office_ai_ileri-6",
] as const;

export type AcademyBusinessAiLessonKey = (typeof ACADEMY_BUSINESS_AI_LESSON_KEYS)[number];

export type AcademyBusinessAiBeatSlot = "bridge" | AcademyGoldenBeatId | "pocket";

export type AcademyBusinessAiPunchcard = {
  order: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  beat: AcademyBusinessAiBeatSlot;
  /** Onaylı gövdedeki bölüm. Açılışta markdown başlığı yoktur. */
  section: string;
  /** Sahnedeki kısa rozet. En fazla üç sözcük. */
  label: string;
};

export type AcademyBusinessAiSplitScene = {
  beat: "comparison";
  visualMode: "split";
  section: "YANLIŞ VE DOĞRU";
  beforeLabel: string;
  afterLabel: string;
  /** Sol panel. Turuncu çerçeve. Dağınık iş. */
  beforeScene: string;
  /** Sağ panel. Temiz sonuç ilk kez burada açılır. */
  afterScene: string;
  /** Sağ panelden önce ekranda durmayan sonuç. */
  withheldUntilSplit: string;
};

export type AcademyBusinessAiLessonBeatVisual = {
  lessonKey: AcademyBusinessAiLessonKey;
  title: string;
  punchcards: readonly [
    AcademyBusinessAiPunchcard,
    AcademyBusinessAiPunchcard,
    AcademyBusinessAiPunchcard,
    AcademyBusinessAiPunchcard,
    AcademyBusinessAiPunchcard,
    AcademyBusinessAiPunchcard,
    AcademyBusinessAiPunchcard,
    AcademyBusinessAiPunchcard,
  ];
  split: AcademyBusinessAiSplitScene;
  /** CEBİNE KOY overlay. Üç kısa adım. */
  pocketSteps: readonly [string, string, string];
};

function businessAiBridge(label: string): AcademyBusinessAiPunchcard {
  return { order: 1, beat: "bridge", section: "Açılış", label };
}

function businessAiWelcome(label: string): AcademyBusinessAiPunchcard {
  return { order: 2, beat: "warmup", section: "Açılış", label };
}

function businessAiCompare(label: string): AcademyBusinessAiPunchcard {
  return { order: 6, beat: "comparison", section: "YANLIŞ VE DOĞRU", label };
}

function businessAiPocket(label: string): AcademyBusinessAiPunchcard {
  return { order: 7, beat: "pocket", section: label, label };
}

function businessAiTask(label: string): AcademyBusinessAiPunchcard {
  return { order: 8, beat: "task", section: label, label };
}

function businessAiDataBadge(label: string): AcademyBusinessAiPunchcard {
  return {
    order: 4,
    beat: "command",
    section: "VERİYİ VERMEDEN ÖNCE",
    label,
  };
}

function businessAiCommandBadge(label: string): AcademyBusinessAiPunchcard {
  return {
    order: 5,
    beat: "command",
    section: "DÖRT PARÇA",
    label,
  };
}

function businessAiProblemBadge(label: string): AcademyBusinessAiPunchcard {
  return {
    order: 3,
    beat: "warmup",
    section: "Açılış",
    label,
  };
}

export const ACADEMY_BUSINESS_AI_BEAT_VISUAL: Readonly<
  Record<AcademyBusinessAiLessonKey, AcademyBusinessAiLessonBeatVisual>
> = {
  "01_office_ai_ileri-1": {
    lessonKey: "01_office_ai_ileri-1",
    title: "Dört Parçalı İstem",
    punchcards: [
      businessAiBridge("DÖRT PARÇA"),
      businessAiWelcome("ÜÇ ADIM"),
      businessAiProblemBadge("HAM NOT"),
      businessAiDataBadge("ADI ÇIKAR"),
      businessAiCommandBadge("ROL BAŞTA"),
      businessAiCompare("YANLIŞ ÖZET"),
      businessAiPocket("KAYNAĞI KARŞILAŞTIR"),
      businessAiTask("MASKELİ NOT"),
    ],
    split: {
      beat: "comparison",
      visualMode: "split",
      section: "YANLIŞ VE DOĞRU",
      beforeLabel: "ÖNCE (GÜZELCE ÖZETLE)",
      afterLabel: "SONRA (DÖRT PARÇALI İSTEM)",
      beforeScene:
        "Ham not kutudadır. Ad ve telefon durur. İstem «Bunu güzelce özetle»dir. Uzun metin, notta olmayan yüzde ve kişi adı döner.",
      afterScene:
        "Ürüne ait üç satır maskelidir. Dört parça aynı kutudadır. Üç madde 120, 80 ve eksik İç Anadolu satırıdır. Karar cümlesi yüzde ve kişi adı taşımaz.",
      withheldUntilSplit: "Kaynak satırla eşleşen üç madde ve karar cümlesi.",
    },
    pocketSteps: ["Onaylı aracı aç", "Adı ve telefonu çıkar", "Dört parçayı aynı kutuya yaz"],
  },
  "01_office_ai_ileri-2": {
    lessonKey: "01_office_ai_ileri-2",
    title: "Toplantı Notu ve Eylem Listesi",
    punchcards: [
      businessAiBridge("EYLEM LİSTESİ"),
      businessAiWelcome("ÜÇ ADIM"),
      businessAiProblemBadge("İKİ DAVET"),
      businessAiDataBadge("ADI ÇIKAR"),
      businessAiCommandBadge("ÇAKIŞMAYI İŞARETLE"),
      businessAiCompare("ÇAKIŞAN SAAT"),
      businessAiPocket("SAATİ AYIR"),
      businessAiTask("KENDİ TOPLANTIN"),
    ],
    split: {
      beat: "comparison",
      visualMode: "split",
      section: "YANLIŞ VE DOĞRU",
      beforeLabel: "ÖNCE (TEK RANDEVU)",
      afterLabel: "SONRA (ÇAKIŞMA SATIRI)",
      beforeScene:
        "İki Perşembe 10:00 tek randevuya inmiştir. Notta olmayan tarih vardır. Selin Korkmaz sahip yazılmıştır.",
      afterScene:
        "İki satır ayrı durur. Çakışma ayrı satırdadır. Sahip yoktur. Hangi Perşembe yoktur. Yeni saat yoktur. Ad yoktur.",
      withheldUntilSplit: "Çakışması ayrı satırda duran eylem listesi.",
    },
    pocketSteps: ["Onaylı takvimi aç", "Adı ve telefonu çıkar", "Çakışan saati ayrı satırda ara"],
  },
  "01_office_ai_ileri-3": {
    lessonKey: "01_office_ai_ileri-3",
    title: "Excel Formül ve Grafik",
    punchcards: [
      businessAiBridge("FORMÜLÜ KİLİTLE"),
      businessAiWelcome("ÜÇ ADIM"),
      businessAiProblemBadge("BOŞ HÜCRE"),
      businessAiDataBadge("IBAN ÇIKAR"),
      businessAiCommandBadge("FORMÜLÜ YAZ"),
      businessAiCompare("DÜZ SAYI"),
      businessAiPocket("HÜCREYİ KONTROL ET"),
      businessAiTask("KENDİ TABLON"),
    ],
    split: {
      beat: "comparison",
      visualMode: "split",
      section: "YANLIŞ VE DOĞRU",
      beforeLabel: "ÖNCE (DÜZ SAYI)",
      afterLabel: "SONRA (TOPLA FORMÜLÜ)",
      beforeScene:
        "B4 hücresinde düz 250 yazar. Pasta grafikte üçüncü dilim vardır. Marmara için yüzde vardır. IBAN notu kutudadır.",
      afterScene:
        "B4 formülü =TOPLA(B2:B3) olur. Hücre 200 gösterir. Grafik yalnız B2 ve B3 hücrelerinden seçilir. Yüzde yoktur. IBAN yoktur.",
      withheldUntilSplit: "Formülle kilitlenmiş toplam ve o hücreden seçilen grafik.",
    },
    pocketSteps: ["Onaylı tabloyu aç", "Adı ve IBAN'ı çıkar", "Formülü B4 hücresine yaz"],
  },
  "01_office_ai_ileri-4": {
    lessonKey: "01_office_ai_ileri-4",
    title: "Uzun Belge ve Sayfa Kontrolü",
    punchcards: [
      businessAiBridge("SAYFA KONTROLÜ"),
      businessAiWelcome("ÜÇ ADIM"),
      businessAiProblemBadge("UZUN BELGE"),
      businessAiDataBadge("KİMLİĞİ ÇIKAR"),
      businessAiCommandBadge("SAYFAYI YAZ"),
      businessAiCompare("ATLANAN MADDE"),
      businessAiPocket("SAYFAYI DENETLE"),
      businessAiTask("KENDİ BELGEN"),
    ],
    split: {
      beat: "comparison",
      visualMode: "split",
      section: "YANLIŞ VE DOĞRU",
      beforeLabel: "ÖNCE (TAM ANALİZ)",
      afterLabel: "SONRA (SAYFA SATIRI)",
      beforeScene:
        "Listenin üstünde «Tam analiz tamam» yazar. Sayfa 7 yerine yüzde 10 vardır. Dosyada olmayan 22. sayfada 5 yıllık yenileme vardır. Sayfa 11'deki 15 gün listede yoktur. Ad ve IBAN durur.",
      afterScene:
        "Ödeme günü sayfa 4, 30 gündür. Gecikme oranı sayfa 7, yüzde 2'dir. Fesih süresi sayfa 11, 15 gündür. Gizlilik süresi sayfa 18, 2 yıldır. 22. sayfa yoktur. Ad yoktur. IBAN yoktur.",
      withheldUntilSplit: "Sayfa numarasıyla eşleşen dört madde.",
    },
    pocketSteps: ["Onaylı belgeyi aç", "Kimliği ve IBAN'ı çıkar", "Her satırın sayfasını aç"],
  },
  "01_office_ai_ileri-5": {
    lessonKey: "01_office_ai_ileri-5",
    title: "E-Posta Sınıflandırma ve Yanıt Taslağı",
    punchcards: [
      businessAiBridge("POSTAYI AYIR"),
      businessAiWelcome("ÜÇ ADIM"),
      businessAiProblemBadge("KARIŞIK POSTA"),
      businessAiDataBadge("KİMLİĞİ ÇIKAR"),
      businessAiCommandBadge("SINIFI AYIR"),
      businessAiCompare("TASLAK SATIRI"),
      businessAiPocket("TASLAĞI TUT"),
      businessAiTask("KENDİ POSTAN"),
    ],
    split: {
      beat: "comparison",
      visualMode: "split",
      section: "YANLIŞ VE DOĞRU",
      beforeLabel: "ÖNCE (NAZİK PARAGRAF)",
      afterLabel: "SONRA (ÜÇ SINIF SATIRI)",
      beforeScene:
        "Tek paragraf döner. Üstte «Gönderildi» yazar. Stok 200 koli olur. Yüzde 10 tazminat vardır. Ad, telefon, IBAN ve kimlik paragrafın içindedir.",
      afterScene:
        "Birinci satır bilgidir: stok notu 120 kolidir. İkinci satır şikayettir: 2 gün gecikme, tazminat yoktur. Üçüncü satır kişisel veri talebidir: ad, telefon, IBAN ve kimlik yoktur. «Gönderildi» yoktur.",
      withheldUntilSplit: "Kural kartıyla eşleşen üç sınıf satırı.",
    },
    pocketSteps: ["Onaylı postayı aç", "Kimliği taslaktan çıkar", "Taslağı kurala karşılaştır"],
  },
  "01_office_ai_ileri-6": {
    lessonKey: "01_office_ai_ileri-6",
    title: "Üç Dosyada Yan Yana Sayı Denetimi",
    punchcards: [
      businessAiBridge("YAN YANA SAYI"),
      businessAiWelcome("ÜÇ ADIM"),
      businessAiProblemBadge("ÜÇ DOSYA"),
      businessAiDataBadge("ADI ÇIKAR"),
      businessAiCommandBadge("YAN YANA BAK"),
      businessAiCompare("UYUŞMAYAN SAYI"),
      businessAiPocket("UYUŞMAYANI YAZMA"),
      businessAiTask("ÜÇ DOSYAYI SEÇ"),
    ],
    split: {
      beat: "comparison",
      visualMode: "split",
      section: "YANLIŞ VE DOĞRU",
      beforeLabel: "ÖNCE (ORTA SAYI)",
      afterLabel: "SONRA (UYUŞAN SATIR)",
      beforeScene:
        "Üstte «Kaynaklar uyumlu» yazar. Marmara 150 veya 135 olur. Toplam 230 olur. Ödeme 45 gündür. Gecikme yüzde 10'dur. Ad ve telefon sayfanın altında durur.",
      afterScene:
        "Karar notunda 120, 200, 30 gün ve yüzde 2 durur. 150, 230, 135, 45 gün ve yüzde 10 yoktur. Ad yoktur. «Kaynaklar uyumlu» yoktur.",
      withheldUntilSplit: "Tablo ve sayfayla eşleşen tek sayfalık karar notu.",
    },
    pocketSteps: ["Onaylı aracı aç", "Kimliği nottan çıkar", "Uyuşmayan sayıyı yazma"],
  },
};

export function academyBusinessAiBeatVisual(
  lessonKey: string,
): AcademyBusinessAiLessonBeatVisual | null {
  const key = lessonKey.trim();
  if (!(key in ACADEMY_BUSINESS_AI_BEAT_VISUAL)) {
    return null;
  }
  return ACADEMY_BUSINESS_AI_BEAT_VISUAL[key as AcademyBusinessAiLessonKey];
}

export type AcademyOff201SpokenTableKey = "raw" | "mask" | "clean";

export type AcademyOff201SpokenSentence = {
  cueId: string;
  text: string;
  start: number;
  end: number;
};

export type AcademyOff201SpokenVisualCue = {
  cueId: string;
  /** Cümlenin başladığı an — mühürlü parça saatinin cümle payı. */
  start: number;
  end: number;
  tableKey: AcademyOff201SpokenTableKey;
  rowIndex: number;
  needle: string;
  highlightCell: string;
};

const SPOKEN_NEEDLE_MIN_CHARS = 10;

function foldSpoken(text: string): string {
  return text.toLocaleLowerCase("tr-TR").replace(/\s+/gu, " ").trim();
}

function spokenNeedles(
  tables: Record<AcademyOff201SpokenTableKey, { rows: readonly (readonly string[])[] }>,
): { tableKey: AcademyOff201SpokenTableKey; rowIndex: number; needle: string }[] {
  const keys: AcademyOff201SpokenTableKey[] = ["raw", "mask", "clean"];
  const needles: { tableKey: AcademyOff201SpokenTableKey; rowIndex: number; needle: string }[] = [];
  for (const tableKey of keys) {
    tables[tableKey].rows.forEach((row, rowIndex) => {
      for (const cell of row) {
        const needle = cell.replace(/\s+/gu, " ").trim();
        if (needle.length < SPOKEN_NEEDLE_MIN_CHARS) {
          continue;
        }
        needles.push({ tableKey, rowIndex, needle });
      }
    });
  }
  return needles;
}

/**
 * Konuşulan cümlenin başında görsel cue açılır.
 * Saat, mühürlü ses parçasının cümle sınırıdır; cue rozetinin başı değildir.
 */
export function academyOff201SpokenVisualCues(input: {
  sentences: readonly AcademyOff201SpokenSentence[];
  tables: Record<AcademyOff201SpokenTableKey, { rows: readonly (readonly string[])[] }>;
}): readonly AcademyOff201SpokenVisualCue[] {
  const needles = spokenNeedles(input.tables);
  const cues: AcademyOff201SpokenVisualCue[] = [];
  for (const sentence of input.sentences) {
    const folded = foldSpoken(sentence.text);
    let best: { tableKey: AcademyOff201SpokenTableKey; rowIndex: number; needle: string; at: number } | null =
      null;
    for (const needle of needles) {
      const at = folded.indexOf(foldSpoken(needle.needle));
      if (at < 0) {
        continue;
      }
      const longer = best != null && needle.needle.length > best.needle.length;
      const earlier = best != null && needle.needle.length === best.needle.length && at < best.at;
      if (best == null || longer || earlier) {
        best = { ...needle, at };
      }
    }
    if (!best) {
      continue;
    }
    cues.push({
      cueId: sentence.cueId,
      start: sentence.start,
      end: sentence.end,
      tableKey: best.tableKey,
      rowIndex: best.rowIndex,
      needle: best.needle,
      highlightCell: `A${best.rowIndex + 2}`,
    });
  }
  return cues;
}

const SPOKEN_CUE_BREATH_SEC = 0.45;

export function academyOff201SpokenVisualCueAtTime(
  cues: readonly AcademyOff201SpokenVisualCue[],
  currentTime: number,
): AcademyOff201SpokenVisualCue | null {
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  let held: AcademyOff201SpokenVisualCue | null = null;
  for (const cue of cues) {
    if (cue.start > t) {
      break;
    }
    held = cue;
  }
  if (!held) {
    return null;
  }
  if (t < held.end + SPOKEN_CUE_BREATH_SEC) {
    return held;
  }
  return null;
}
