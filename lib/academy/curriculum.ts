/**
 * Tohum müfredat — CMS yok. Gövde yalnız SETTLED satın alma sonrası API/sayfada açılır.
 * Müze `[slug]/curriculum` kopyalanmaz.
 */

import { computeAcademyCurriculumSeal } from "@/lib/academy/exam";

export type AcademyLessonSeed = {
  key: string;
  order: number;
  title: string;
  body: string;
};

const RAIL_TEMEL_LESSONS: readonly AcademyLessonSeed[] = [
  {
    key: "rail-temel-1",
    order: 1,
    title: "Tek nakit defter: amountMinor",
    body: "Yetkin Rail tutarı float TL olarak tutmaz. Birim amountMinor + currencyCode. Wallet satırı tek bakiyedir; User kolonunda bakiye yoktur. Defter append-only LedgerEntry. İkinci nakit yazıcı (triple-balance, merit-swap) yasaktır.",
  },
  {
    key: "rail-temel-2",
    order: 2,
    title: "CheckoutPriceLock on beş dakika",
    body: "Satış fiyatı kod sabiti değildir; Super Admin katalog SSOT. Satın alma öncesi CheckoutPriceLock katalog tutarını 15 dakika mühürler. Süre dolunca kilit düşer. Kilitsiz debit yok.",
  },
  {
    key: "rail-temel-3",
    order: 3,
    title: "Settlement, emanet yok, sınav belgesi",
    body: "Akademi kurs ödemesinde emanet (escrow) yoktur. Debit sonrası tutar platform hazinesine geçer. Satın alma öğrenme kaydıdır; SHA256 ustalık belgesi müfredat sınavı ≥70 sonrası basılır. Kariyer vizesi belgeye bağlanır.",
  },
];

const RAY_SINYAL_LESSONS: readonly AcademyLessonSeed[] = [
  {
    key: "ray-sinyal-1",
    order: 1,
    title: "Anklaşman (interlocking)",
    body: "Anklaşman çelişen güzergâhları aynı anda kilitlemez. Sinyal ve makas durumu tek emniyet mantığında bağlanır. Hız rekoru veya bilet satışı anklaşman görevi değildir.",
  },
  {
    key: "ray-sinyal-2",
    order: 2,
    title: "Fail-safe sinyal ilkesi",
    body: "Arıza en kısıtlayıcı duruma düşer: kırmızı / dur. Yeşil yakmak fail-safe değildir. Emniyet varsayılanı açık güzergâh değil, kapalı güzergâhtır.",
  },
  {
    key: "ray-sinyal-3",
    order: 3,
    title: "Ray devresi ve kırmızı aspekt",
    body: "Ray devresi kesimde tren varlığını tespit eder. Kırmızı aspekt: dur — güzergâh kapalı veya korunuyor. Geçilebilir anlamı taşımaz.",
  },
];

const YZ_ICERIK_LESSONS: readonly AcademyLessonSeed[] = [
  {
    key: "yz-icerik-1",
    order: 1,
    title: "Brief okuma: sözleşme, çelişki, dur",
    body: `Brief ilham metni değildir; teslim sözleşmesinin ilk cümlesidir. Sayı, format, palet, kullanım hakkı ve yasak listesi briefte yoksa üretim başlamaz.

Çelişen cümle (hem iki ikon hem on iki oda ikonu) ustanın yorum hakkı doğurmaz. Orta değer uydurulmaz. Studio jetonu düşülmez. Çelişki yazılı netleşene kadar iş fail-closed durur.

Ölçülemeyen istek (daha pop, daha premium, biraz canlı) revizyon değildir. Önce kısıta çevrilir: kırpma, punto, kontrast, negatif alan, en-boy. Çevrilmeden üretilen iş, brief ihlalidir.

Yetkin Rail dikeyinde alıcı korkusu yapay zekâ çöpüdür. Brief okuma, o çöpü daha üretimden önce keser.`,
  },
  {
    key: "yz-icerik-2",
    order: 2,
    title: "Telif ve kullanım hakları: fail-closed",
    body: `Yapay zekâ çıktısı kamu malı değildir. Araç lisansının ticari olması, teslim dosyasının müşteriye ticari hak verdiği anlamına gelmez. Hak, Rail sözleşmesinde RELEASE anında devredilir; üretim anında değil.

Brief ticari kullanım, coğrafya ve süre yazmıyorsa üretim durur. Eksik hak, sonradan doldurulacak bir dipnot değildir.

Yaşayan bir illustratörün ayırt edici tarzını ticari teslim olarak taklit etmek, modelin o stili üretmesi mümkün olsa da hak ihlalidir. Tarz, geometri / palet / ızgara gibi genel kısıtlara indirgenmeden yola çıkılmaz.

Stok + üretim karışımı gizlenmez. Görünür üçüncü taraf markası, briefte müşterinin kendi işareti değilse düşer. Gerçek kişi fotoğrafı model izni olmadan teslim edilemez.`,
  },
  {
    key: "yz-icerik-3",
    order: 3,
    title: "Prompt disiplini: kilitli paket",
    body: `Prompt dilek cümlesi değildir. Bir iş = bir kilitli paket: hedef, negatif kısıt, ızgara, palet, kabul ölçütü. Paket müşteri onayından sonra kilitlenir.

Revizyon turunda paketten sessizce kısıt silmek veya modeli değiştirmek iyileştirme değil spec ihlalidir. Delta yazılı onay ister.

Gizli anahtar, vatandaş kimliği ve cüzdan bakiyesi prompta girmez.

Studio bu dikeyin tezgâhıdır: üretim tek kapıdan geçer. DevLabs linter'dır, runner değildir; exec yoktur. Şablon, komutu tarif eder; sunucuda çalıştırmaz.

Improve tek başına prompt değildir. Delta listesi yoksa paket açılmaz.`,
  },
  {
    key: "yz-icerik-4",
    order: 4,
    title: "Revizyon yönetimi: tur tavanı ve kapsam",
    body: `Bu dikeyde varsayılan iki revizyon turudur. Tur sayısı briefte yazılmamışsa iki kabul edilir. Üçüncü tur yeni emanet farkı olmadan açılmaz.

Geçerli revizyon ölçülebilir kusur taşır: yanlış en-boy, brief paleti dışı renk, eksik dosya, hash uyuşmazlığı. Beğenmedim tek başına tur tüketmez; kısıta çevrilir.

Kapsam şişmesi (tur birden sonra altı yeni en-boy, ekstra ikon, yeni dil) ücretsiz revizyon değildir. Yeni brief ve bütçe farkı olmadan üretilmez.

Red, ölçülebilir kusur göstermeden teslimi yok sayamaz. Usta da kusuru kabul etmeden aynı dosyayı yeniden basamaz. İkisi de yazılı kalır; tahkim bu kayda bakar.`,
  },
  {
    key: "yz-icerik-5",
    order: 5,
    title: "Teslim şartnamesi: artifact, SHA-256, paket",
    body: `Teslim sohbet dökümü değildir. DELIVERY mesajında artifact URL, dosya listesi, her dosyanın SHA-256 (content_hash), lisans cümlesi ve kilitli prompt paketi bulunur. Hash yoksa teslim eksiktir; RELEASE istenmez.

Ad kuralı: is-anahtari.uzanti. Filigran finalde yok (brief özellikle istemedikçe). Renk uzayı ve piksel ölçüleri briefteki şartnameden sapmaz.

Quiet Luxury kanıtın görsel dilbilgisidir: hazır lucide ikon, geist font, dekoratif ilerleme çubuğu ve stok cam efekti düşer. Sükûnet iddia değil, mühür taşıyan yüzeydir.

Akademi kurs bedeli emanete girmez; anında settlement ile hazineye geçer. Emanet kilidi freelancer işindedir. SHA-256 ustalık belgesi satın almada basılmaz; müfredat tamam ve sınav barajı (70) geçilince basılır.`,
  },
];

const LESSONS_BY_SLUG: Record<string, readonly AcademyLessonSeed[]> = {
  "rail-temel": RAIL_TEMEL_LESSONS,
  "rayli-sinyal-emniyet": RAY_SINYAL_LESSONS,
  "yz-icerik-gorsel-uretim": YZ_ICERIK_LESSONS,
};

export function curriculumForCourseSlug(slug: string): readonly AcademyLessonSeed[] {
  return LESSONS_BY_SLUG[slug] ?? [];
}

export function academyLessonByKey(
  slug: string,
  lessonKey: string,
): AcademyLessonSeed | null {
  return curriculumForCourseSlug(slug).find((lesson) => lesson.key === lessonKey) ?? null;
}

export function isAcademyCurriculumComplete(
  slug: string,
  completedKeys: readonly string[],
): boolean {
  const lessons = curriculumForCourseSlug(slug);
  if (lessons.length === 0) {
    return false;
  }
  const done = new Set(completedKeys);
  return lessons.every((lesson) => done.has(lesson.key));
}

export function nextAcademyLessonKey(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  const done = new Set(completedKeys);
  const next = curriculumForCourseSlug(slug).find((lesson) => !done.has(lesson.key));
  return next?.key ?? null;
}

/** Tohum sırası — hash bu diziyi yer. Tamamlama tarihi sırası kullanılmaz. */
export function orderedAcademyLessonKeys(slug: string): readonly string[] {
  return curriculumForCourseSlug(slug).map((lesson) => lesson.key);
}

/**
 * Tamamlanan anahtarları müfredat sırasına indirger.
 * SKU dışı veya atlanan anahtar mühüre girmez.
 */
export function orderedCompletedAcademyLessonKeys(
  slug: string,
  completedKeys: readonly string[],
): string[] {
  const done = new Set(completedKeys);
  return orderedAcademyLessonKeys(slug).filter((key) => done.has(key));
}

export function academyCurriculumSealForSlug(slug: string): string | null {
  const keys = orderedAcademyLessonKeys(slug);
  if (keys.length === 0) {
    return null;
  }
  return computeAcademyCurriculumSeal(keys);
}

/**
 * Müfredat %100 değilse mühür basılmaz. Tamamlanmış küme tohum sırasına indirgenir.
 */
export function academyCurriculumSealFromCompletions(
  slug: string,
  completedKeys: readonly string[],
): string | null {
  if (!isAcademyCurriculumComplete(slug, completedKeys)) {
    return null;
  }
  return academyCurriculumSealForSlug(slug);
}
