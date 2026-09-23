/**
 * 01_office_ai-2 (vatandaş 3. ders) — Tablodan yönetim özetine Excel ızgara SSOT.
 * Yaprak modül: cinema-cue-catalog buradan okur; excel-workspace yeniden dışa aktarır.
 * PEDAGOJI: ses «onlarca sütun / kaydırdıkça bitmeyen tablo» derken ekran küçük 5×6 göstermez.
 */

/**
 * KPI kilitli çekirdek satırlar.
 * Tutar toplamı 54.650; yönetim özeti paneli bu hücrelerden kilitlenir.
 */
export const ACADEMY_OFFICE_AI_2_SEED_ROWS = [
  ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12.450,00", "Ödendi"],
  ["13.03.2026", "Demir Lojistik", "FT-1043", "8.200,00", "Bekler"],
  ["13.03.2026", "Pınar Market", "FT-1044", "3.400,00", "Ödendi"],
  ["14.03.2026", "Yıldız Tekstil", "FT-1045", "9.100,00", "Açık"],
  ["14.03.2026", "Kaya Gıda A.Ş.", "FT-1047", "21.500,00", "Ödendi"],
] as const;

/** Command beat — odaklanmış temiz ızgara (ÖZET İSTE). */
export const ACADEMY_OFFICE_AI_2_CLEAN_TABLE = {
  headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum"],
  rows: ACADEMY_OFFICE_AI_2_SEED_ROWS,
  note: "Özet beş sütundan çıkar. Üç madde iste. Sayıları hücreden al. Uydurma yüzde yok.",
} as const;

/** Dense dump eşikleri — viewport’ta son sütun/satır hemen bitmez; kaydırma gerekir. */
export const ACADEMY_EXCEL_DENSE_DUMP_MIN_COLS = 12 as const;
export const ACADEMY_EXCEL_DENSE_DUMP_MIN_ROWS = 36 as const;

const OFFICE_AI_2_DENSE_EXTRA_HEADERS = [
  "Bölge",
  "Ürün",
  "Adet",
  "Vade",
  "Plasiyer",
  "Kanal",
  "Not1",
  "Not2",
  "Risk",
  "Ay",
  "Hafta",
] as const;

const OFFICE_AI_2_DENSE_NOISE = [
  ["Akdeniz", "Un 25kg", "12", "30 gün", "M. Demir", "Toptan", "mail?", "vade?", "Düşük", "Mart", "11"],
  ["Marmara", "Yağ 18L", "4", "45 gün", "A. Kaya", "Perakende", "çift?", "bekler", "Orta", "Mart", "11"],
  ["Ege", "Şeker", "20", "15 gün", "E. Yılmaz", "Online", "—", "iade?", "Düşük", "Mart", "12"],
  ["İç Anadolu", "Tuz", "8", "60 gün", "C. Öz", "Toptan", "eksik", "—", "Yüksek", "Mart", "12"],
  ["Karadeniz", "Un 10kg", "6", "30 gün", "S. Ak", "Perakende", "not", "takip", "Orta", "Mart", "13"],
] as const;

function buildOfficeAi2DenseDumpRows(): readonly (readonly string[])[] {
  const seed = ACADEMY_OFFICE_AI_2_SEED_ROWS.map((row, index) => {
    const noise = OFFICE_AI_2_DENSE_NOISE[index % OFFICE_AI_2_DENSE_NOISE.length]!;
    return [...row, ...noise] as string[];
  });
  const cariler = [
    "Kaya Gıda A.Ş.",
    "Demir Lojistik",
    "Pınar Market",
    "Yıldız Tekstil",
    "Güneş Ambalaj",
    "Nil Nehir Ltd.",
    "Atlas Nakliyat",
    "Bereket Un",
  ] as const;
  const durumlar = ["Ödendi", "Bekler", "Açık", "İade"] as const;
  const noiseRows: string[][] = [];
  for (let index = 0; index < 40; index += 1) {
    const day = 15 + (index % 14);
    const fatura = `FT-${1100 + index}`;
    const tutar = `${(1_200 + (index % 17) * 350).toLocaleString("tr-TR")},00`;
    const noise = OFFICE_AI_2_DENSE_NOISE[index % OFFICE_AI_2_DENSE_NOISE.length]!;
    noiseRows.push([
      `${String(day).padStart(2, "0")}.03.2026`,
      cariler[index % cariler.length]!,
      fatura,
      tutar,
      durumlar[index % durumlar.length]!,
      ...noise,
    ]);
  }
  return [...seed, ...noiseRows];
}

/**
 * Açılış / UZUN RAPOR — onlarca sütun+satır kalabalık döküm (A…P, 45 satır).
 * Fit/scale kapalı; yatay+dikey kaydırma pedagojik sinyaldir.
 */
export const ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE = {
  headers: [
    "Tarih",
    "Cari",
    "Fatura",
    "Tutar",
    "Durum",
    ...OFFICE_AI_2_DENSE_EXTRA_HEADERS,
  ],
  rows: buildOfficeAi2DenseDumpRows(),
  note: "Kalabalık döküm örnektir; kilitli toplam çekirdek 5 satırdan (54.650) gelir. Kendi tablonda toplamı TOPLA ile kilitle. Son sütun/satır viewport’ta bitmez; kaydırma gerekir.",
} as const;

export type AcademyExcelTableShape = {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
  note?: string;
};

/** Viewport’ta sığmayan kalabalık ızgara — fit/scale kapatılır, overflow kaydırılır. */
export function academyExcelIsDenseDumpTable(
  table: AcademyExcelTableShape | null | undefined,
): boolean {
  if (!table) {
    return false;
  }
  return (
    table.headers.length >= ACADEMY_EXCEL_DENSE_DUMP_MIN_COLS &&
    table.rows.length >= ACADEMY_EXCEL_DENSE_DUMP_MIN_ROWS
  );
}

/** KPI kilidi — yalnız çekirdek 5 satırın Tutar toplamı (54.650). */
export function academyExcelOfficeAi2SeedTutarSum(): number {
  return ACADEMY_OFFICE_AI_2_SEED_ROWS.reduce((sum, row) => {
    const raw = (row[3] ?? "").replace(/\./g, "").replace(/,00$/u, "");
    return sum + Number(raw);
  }, 0);
}

/** After paneli — üç madde + karar cümlesi; sayılar çekirdek 5 satırdan kilitli. */
export const ACADEMY_OFFICE_AI_2_SUMMARY_TABLE = {
  headers: ["Madde", "Kaynak sayı", "Not"],
  rows: [
    ["Toplam", "54.650", "Mart tahsilat; yön Kaya önde"],
    ["Bekler", "8.200", "Demir Lojistik bekler"],
    ["Açık", "9.100", "Yıldız Tekstil vade"],
    ["Karar", "—", "Vade için bugün ara (örnek eylem)"],
  ],
  note: "Üç madde + karar cümlesi. Sayılar tahsilat ızgarasından kilitli. Özet beş sütundan çıkar.",
} as const;
