/**
 * İlerleme temelli ücretsiz ders kapısı — "kayıp" değil "kazanılmış mesafe".
 *
 * Bugün ücretsiz ders bitince kullanıcı yalnız "Kilitli" görüyor. Oysa ilerleme
 * verisi zaten yazılı (`academyLessonCompletions` / `junior_progress`) ve
 * müfredat uzunluğu katalogda duruyor. Bu modül o veriyi **görünür kanıta** çevirir:
 *
 *   "Bu dersi tamamladın. Sertifikana ve kalan N derse ulaşmak için eğitime katıl."
 *
 * Saf ve istemci-güvenli: Prisma, fs, server-only yok. Sayı uydurulmaz;
 * kalan ders = müfredat uzunluğu − tamamlanan ders. Sertifika mesafesi aynı çıkarmadır
 * çünkü akademide sertifika müfredat bitince açılır (A4: sınav 8 ders bitmeden açılmaz).
 */

export type AcademyProgressGateInput = {
  courseSlug: string;
  courseTitle: string;
  /** Oynatıcıda tamamlanan ders anahtarları (sunucudan gelir). */
  completedLessonKeys: readonly string[];
  /** Müfredat toplamı — `curriculumLessonKeysForSlug().length`. */
  totalLessonCount: number;
  /** Sertifika barajı — metinde "70+" olarak geçer. */
  passScore: number;
  /** Ücretsiz açık ders sayısı (önizleme). Genelde 1. */
  freeLessonCount: number;
};

export type AcademyProgressGateCopy = {
  /** Üst başlık — kazanılan şey. */
  eyebrow: string;
  /** Ana cümle — tamamlanan ders sayısını taşır. */
  title: string;
  /** Mesafe cümlesi — kalan ders ve sertifika. */
  body: string;
  /** Birincil eylem. */
  cta: string;
  /** Kalan mesafe göstergesi. */
  remainingLabel: string;
  /** Tamamlanan / toplam. */
  progressLabel: string;
};

export type AcademyProgressGate = {
  /** Kapı gösterilmeli mi? Hiç ders tamamlanmadıysa gösterilmez. */
  visible: boolean;
  completedCount: number;
  remainingCount: number;
  totalCount: number;
  /** 0–100 tamsayı. */
  percent: number;
  /** Sertifikaya kalan ders sayısı — müfredat tamamlanana kadar aynıdır. */
  lessonsToCertificate: number;
  copy: AcademyProgressGateCopy;
};

/**
 * Rakam biçimi: `Intl.NumberFormat` yerine sabit `tr-TR` kullanılır ki
 * sunucu/istemci aynı dizeyi bassın (hydration sapması olmasın).
 */
function count(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

export function resolveAcademyProgressGate(
  input: AcademyProgressGateInput,
): AcademyProgressGate {
  const total = Math.max(0, Math.trunc(input.totalLessonCount));
  const completedSet = new Set(
    input.completedLessonKeys.map((key) => key.trim()).filter((key) => key.length > 0),
  );
  const completed = Math.min(total, completedSet.size);
  const remaining = Math.max(0, total - completed);
  const percent = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
  const freeCount = Math.max(0, Math.trunc(input.freeLessonCount));

  const visible = completed > 0 && remaining > 0;
  const title =
    completed === 1
      ? "Bu dersi tamamladın."
      : `${count(completed)} dersi tamamladın.`;
  const body =
    remaining === 0
      ? `Müfredat bitti. Testi ${input.passScore}+ ile geçince sertifikan basılır.`
      : freeCount > 0 && completed <= freeCount
        ? `Ücretsiz açık ders bitti. Sertifikana ve kalan ${count(remaining)} derse ulaşmak için eğitime katıl.`
        : `Sertifikana ve kalan ${count(remaining)} derse ulaşmak için eğitime katıl.`;

  return {
    visible,
    completedCount: completed,
    remainingCount: remaining,
    totalCount: total,
    percent,
    lessonsToCertificate: remaining,
    copy: {
      eyebrow: "Kazanılan mesafe",
      title,
      body,
      cta: `Eğitime katıl — kalan ${count(remaining)} ders ve sertifika`,
      remainingLabel: `${count(remaining)} ders kaldı`,
      progressLabel: `${count(completed)} / ${count(total)} ders tamam`,
    },
  };
}
