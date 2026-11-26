/**
 * Kısa liste CSV. UTF-8 BOM + formül enjeksiyonu kaçışı (`=`, `+`, `-`, `@`).
 * Ham CV özeti bu dosyaya yazılmaz — çağıran satır setinde `cvSummary` yoktur.
 */

import type { KurumsalApplicationBand } from "@/lib/sales/kurumsal-screening";
import type { KurumsalShortlistCsvRow } from "@/lib/sales/kurumsal-screening-load";

/**
 * Formül enjeksiyonu kalıbı.
 *
 * Excel/LibreOffice/Google Sheets bir hücre `=`, `+`, `-`, `@` ile başlarsa onu
 * **formül** olarak çalıştırır. `\t` ve `\r` de bazı sürümlerde hücreyi formüle
 * çevirir. Kritik ayrıntı: baştaki **boşluk** ve görünmez denetim karakterleri
 * bu kontrolü atlatır — `" =CMD()"` naif `/^=/` testinden geçer, ama Excel
 * hücreyi yine formül sayar. Bu yüzden kontrol, baştaki boşluk/denetim karakterleri
 * atılmış hâl üzerinde yapılır.
 *
 * **Sıfır genişlik ve tam genişlik kaçışı.** Görünmez karakter listesi yalnız ASCII
 * denetim aralığını (`\u0000-\u001f`, `\u007f`) kapsıyordu. Ölçülen atlatmalar:
 * - `\u200b` (zero width space) — Excel bunu yok sayar, `=CMD()` yine formüldür;
 * - `\ufeff` (BOM) ve `\u200e`/`\u200f` (yön işaretleri);
 * - `\u00a0` (NBSP) — `\s` bunu **yakalar**, ama `\u2007`/`\u202f` yakalanmaz;
 * - `\u2028`/`\u2029` (satır/paragraf ayırıcı);
 * - `\uff1d` (FULLWIDTH EQUALS) — bazı sürümler NFKC normalleştirip `=` okur.
 *
 * Bu yüzden değer önce **NFKC** ile normalleştirilir (tam genişlik → ASCII), sonra
 * `\p{Cf}` (biçim) + `\p{Zs}` (ayırıcı boşluk) sınıfları atılır. `\p{Cf}` sıfır
 * genişlik karakterlerin tamamını kapsar; elle liste tutmak eksik kalıyordu.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * Hücre başında formülü gizleyebilen karakterler: denetim + biçim + ayırıcı
 * boşluk + satır/paragraf ayırıcı.
 *
 * `\p{Zl}` (U+2028) ve `\p{Zp}` (U+2029) `\p{Zs}` **değildir**; ölçüldü, ilk
 * sürümde `"\u2028=CMD()"` kaçışsız kalıyordu.
 */
const LEADING_INVISIBLE = /^[\p{Cc}\p{Cf}\p{Zs}\p{Zl}\p{Zp}]+/u;

const BAND_CSV_LABEL: Record<KurumsalApplicationBand, string> = {
  SHORTLISTED: "Mülakata uygun",
  QUALIFIED_NOT_SHORTLISTED: "Barajı geçti — yedek",
  BELOW_THRESHOLD: "Baraj altı",
  PENDING_TEST: "Test bekleniyor",
};

/**
 * Hücre başındaki görünmez karakterleri atar (yalnız test için).
 *
 * NFKC önce gelir: `\uff1d` (tam genişlik `=`) normalleştirilince ASCII `=` olur.
 * Ardından `\p{Cf}` (zero width space, BOM, yön işareti) ve `\p{Zs}` (NBSP,
 * figure space) atılır. Bu ikisi birlikte, elle sayılan ASCII listesinin
 * kaçırdığı tüm atlatmaları kapatır.
 */
function stripLeadingInvisible(value: string): string {
  return value.normalize("NFKC").replace(LEADING_INVISIBLE, "");
}

export function kurumsalCsvCell(value: string): string {
  let cell = value.replace(/\r\n/g, " ").replace(/[\r\n]/g, " ");
  // Baştaki boşluk/denetim/görünmez karakterler atlanmış hâlde formül mü?
  if (FORMULA_START.test(stripLeadingInvisible(cell))) {
    cell = `'${cell}`;
  }
  if (/[",]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function isoAppliedAt(date: Date): string {
  return date.toISOString();
}

export function buildKurumsalShortlistCsv(rows: readonly KurumsalShortlistCsvRow[]): string {
  const header = [
    "Aday adı",
    "E-posta",
    "Ağırlıklı puan",
    "Band",
    "Mühür doğrulama hash",
    "Başvuru tarihi",
  ];
  const lines = [
    header.map(kurumsalCsvCell).join(","),
    ...rows.map((row) =>
      [
        row.candidateName,
        row.candidateEmail,
        row.weightedScore === null ? "" : String(row.weightedScore),
        BAND_CSV_LABEL[row.band],
        row.certificateCode ?? "",
        isoAppliedAt(row.appliedAt),
      ]
        .map((cell) => kurumsalCsvCell(cell))
        .join(","),
    ),
  ];
  return `\uFEFF${lines.join("\n")}\n`;
}

/**
 * CSV dosya adı.
 *
 * **Neden ASCII.** `content-disposition` başlığı RFC 9110'a göre ByteString'dir:
 * her karakter ≤ 0xFF olmalıdır. Türkçe unvanların neredeyse tamamı (`ı`, `ş`,
 * `ğ`, `ü`, `ö`, `ç`) bu aralığın dışındadır ve `new Response(..., {headers})`
 * **TypeError** atar. Bu, `filename` alanına ham unvan yazıldığında dışa
 * aktarmayı HTTP 500'e düşürüyordu (ölçüldü: "Yazılım Mühendisi").
 *
 * Çözüm iki katmanlı: `filename` daima ASCII (eski istemciler için güvenli yedek),
 * `filename*` ise RFC 5987 `UTF-8''…` yüzde kodlamasıyla gerçek Türkçe adı taşır.
 * Tarayıcılar `filename*` varsa onu kullanır.
 */
export function kurumsalShortlistCsvFilename(title: string): string {
  const normalized = title.toLocaleLowerCase("tr-TR");
  const ascii = normalized
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `kisa-liste-${ascii || "ilan"}.csv`;
}

/**
 * `filename*` için okunabilir ad. Türkçe karakterler **korunur**; RFC 5987
 * yüzde kodlaması baytları taşıdığı için ByteString sınırı burada yoktur.
 */
export function kurumsalShortlistCsvFilenameStar(title: string): string {
  const readable = title
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşüâîû]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return encodeURIComponent(`kisa-liste-${readable || "ilan"}.csv`);
}

/**
 * Tek `content-disposition` değeri. `filename` ASCII, `filename*` UTF-8.
 * Değer burada kurulur ki başlığa asla ham Türkçe karakter girmesin.
 */
export function kurumsalShortlistCsvContentDisposition(title: string): string {
  const asciiName = kurumsalShortlistCsvFilename(title);
  const star = kurumsalShortlistCsvFilenameStar(title);
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${star}`;
}
