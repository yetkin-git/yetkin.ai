/**
 * /rehber — Görsel İş Akış ve Kurulum Merkezi verisi.
 *
 * Makale gövdesi burada durmaz. Her modül için uçtan uca kurulum adımları:
 * adım numarası, tahmini süre, somut girdi → çıktı, kritik ipucu ve aksiyon butonu.
 * Tutar, kota ve süre uydurulmaz; canlı sabitler kendi evinden (`lib/tezgah/catalog`,
 * `lib/commerce/subscription-lifecycle`) okunur. Bu dosya yalnız akış iskeletidir.
 *
 * Korumalı rotalara giden butonlar ham adres basmaz: `href` ürün hedefidir,
 * basılan adres `workflowStepHref()` içinde `next` parametreli kayıt yoluna çevrilir.
 */

import type { Route } from "next";
import { COMMERCE_TRIAL_VERIFY_MINOR } from "@/lib/commerce/subscription-lifecycle";
import { formatMinor, formatMinorCompact } from "@/lib/kernel/money/format";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { isProtectedCitizenPath } from "@/lib/kernel/security/edge-guard";
import { TEZGAH_GUEST_DAILY_LIMIT } from "@/lib/tezgah/catalog";

/** Akış şeridinde basılan modül kimliği. Rota değildir; canlı sinyal anahtarıdır. */
export type WorkflowModuleId = "ecommerce" | "hibe" | "tezgah" | "career";

export type WorkflowStep = {
  /** 1'den başlayan adım numarası — şeritte rozet olarak basılır. */
  order: number;
  title: string;
  /** "≈ 2 dk" biçiminde okunur süre. Uydurma dakika değil, kurulum temposu. */
  duration: string;
  /** Somut girdi → çıktı. Tek cümle; pazarlama cümlesi değil. */
  input: string;
  output: string;
  /** Ön koşul veya kritik ipucu. Boş bırakılmaz: her adımın bir tuzağı vardır. */
  tip: string;
  /** Ürün hedefi. Ham korumalı adres basılmaz; `workflowStepHref` çevirir. */
  href: Route;
  cta: string;
  /** Buton ikincil mi (outline) yoksa birincil mi basılsın. */
  emphasis?: "primary" | "outline";
};

export type WorkflowModule = {
  id: WorkflowModuleId;
  /** Modül adı — sekme etiketi. */
  label: string;
  /** Kısa açıklama; akış başlığının altında durur. */
  blurb: string;
  /** Modülün kanonik giriş adresi. */
  href: Route;
  /** Modülün sunduğu sonuç — akış bittiğinde elde kalan. */
  outcome: string;
  steps: readonly WorkflowStep[];
};

/**
 * Sembolik kart doğrulama bedeli — katalog değildir, iade vaadi de yoktur.
 * Tek SSOT: `COMMERCE_TRIAL_VERIFY_MINOR` (100 kuruş = 1,00 TL).
 */
export const TRIAL_VERIFY_AMOUNT_LABEL = formatMinor(COMMERCE_TRIAL_VERIFY_MINOR, "TRY");

/**
 * Deneme sonrası yenileme etiketi katalogdan okunur; satır yoksa `null`.
 * Bu dosya tutar uydurmaz.
 */
export function trialRenewalAmountLabel(catalogAmountMinor: number | null): string | null {
  if (catalogAmountMinor == null || !Number.isInteger(catalogAmountMinor) || catalogAmountMinor <= 0) {
    return null;
  }
  return formatMinorCompact(catalogAmountMinor, "TRY");
}

/** Uçtan uca akış şeması — modül zinciri (Tezgâh → E-Ticaret → Hibe → Kariyer). */
export const WORKFLOW_CHAIN: readonly WorkflowModuleId[] = [
  "tezgah",
  "ecommerce",
  "hibe",
  "career",
] as const;

/**
 * Dört aktif ticari modül. Kapalı Akademi kursu burada yoktur.
 * Adımlar ürünün gerçek ekranlarına gider; hiçbir buton ölü adrese basmaz.
 */
export const WORKFLOW_MODULES: readonly WorkflowModule[] = [
  {
    id: "ecommerce",
    label: "E-Ticaret İşletme OS",
    blurb: "Pazaryeri bağlantısı, stok senkronizasyonu ve müşteri sorusu otomasyonu tek panelde.",
    href: "/e-ticaret",
    outcome: "Trendyol ve Hepsiburada siparişleri, stok ve fiyat tek ekranda; müşteri soruları marka tonunda yanıtlanır.",
    steps: [
      {
        order: 1,
        title: "30 gün ücretsiz denemeyi başlat",
        duration: "≈ 3 dk",
        input: `Kart bilgisi (${TRIAL_VERIFY_AMOUNT_LABEL} sembolik kart doğrulama bedeli tahsil edilir)`,
        output: "30 gün açık E-Ticaret İşletme OS denemesi; kart saklanır, dönem sonunda aylık yenileme başlar",
        tip: `İlk 30 gün ücretsizdir; ${TRIAL_VERIFY_AMOUNT_LABEL} kart doğrulama bedeli tahsil edilir ve bakiyeye yazılmaz. Deneme VKN veya TCKN ile açılır; vergi kimliği başına bir deneme vardır. İptal tek tıkla, dönem sonunda işler.`,
        href: "/e-ticaret",
        cta: "Denemeyi başlat",
      },
      {
        order: 2,
        title: "Pazaryeri API bağlantısını kur",
        duration: "≈ 5 dk",
        input: "Trendyol / Hepsiburada Satıcı ID, API Key ve API Secret",
        output: "Mağaza ile pazaryeri arasında doğrulanmış kanal bağlantısı",
        tip: "Satıcı panelindeki API bilgisi tek seferlik gösterilir; kaybetmeden panele gir. Secret tarayıcıya değil sunucuya yazılır.",
        href: "/e-ticaret",
        cta: "Kanalları bağla",
      },
      {
        order: 3,
        title: "Ürün kataloğunu eşleştir, stoğu senkronla",
        duration: "≈ 10 dk",
        input: "Pazaryeri ürün listesi ve kendi ürün kodların",
        output: "Eşleşmiş katalog; anlık stok ve fiyat güncellemesi",
        tip: "Önce 5-10 ürünle eşleştir ve stok düşümünü doğrula; tüm kataloğu tek seferde açma.",
        href: "/e-ticaret",
        cta: "Kataloğu aç",
      },
      {
        order: 4,
        title: "AI müşteri soru yanıtlamayı aç",
        duration: "≈ 5 dk",
        input: "Marka tonu, sık sorulan sorular ve devretme kuralı",
        output: "Gelen sorulara marka tonunda otomatik yanıt taslağı",
        tip: "Fiyat, iade ve özel ölçü soruları insana devretsin. Taslak gönderilmez; onayla gönderilir.",
        href: "/e-ticaret",
        cta: "Otomasyonu ayarla",
      },
    ],
  },
  {
    id: "hibe",
    label: "YetkinHibe",
    blurb: "İşletme profilinden uygun KOSGEB / TÜBİTAK çağrısına, oradan proje dosyasına.",
    href: "/hibe",
    outcome: "Sektörüne uyan açık destek çağrıları ve kurum şablonuna taşınabilir proje dosyası taslağı.",
    steps: [
      {
        order: 1,
        title: "İşletme profilini ve sektörü tanımla",
        duration: "≈ 4 dk",
        input: "NACE / faaliyet alanı, ölçek, il ve çalışan sayısı",
        output: "Eşleştirmeye hazır işletme profili",
        tip: "NACE kodu beyan değil beyandır: vergi levhandaki kodla aynı olmalı. Yanlış kod uygun çağrıyı kaçırtır.",
        href: "/hibe",
        cta: "Profili oluştur",
      },
      {
        order: 2,
        title: "Uygun destek çağrılarını eşleştir",
        duration: "≈ 2 dk",
        input: "Kayıtlı işletme profili",
        output: "KOSGEB / TÜBİTAK / devlet desteklerinden filtrelenmiş açık çağrı listesi",
        tip: "Eşleşme katalog şartına bakar; kabul kararı kurumundur. Kapanmış çağrı açık gibi gösterilmez.",
        href: "/hibe",
        cta: "Çağrıları eşleştir",
      },
      {
        order: 3,
        title: "Proje dosyası taslağını üret",
        duration: "≈ 15 dk",
        input: "Seçili çağrı, problem tanımı ve iş paketi fikri",
        output: "Tek seferlik hibe başvuru taslağı ve kontrol listesi",
        tip: "Taslak kurumun sistemine senin taşıyacağın metindir; başvurunun yerine geçmez. Destek tutarını senin cümlen büyütmez.",
        href: "/hibe",
        cta: "Dosyayı oluştur",
      },
    ],
  },
  {
    id: "tezgah",
    label: "AI Tezgâh",
    blurb: "Kayıt gerekmeden üretim; düzenli kullanımda paket, ara sıra kullanımda kredi.",
    href: "/tezgah",
    outcome: "Ürün kartı, teklif, rapor ve ticari metin çıktısı; kotayı aşınca paket veya kredi ile devam.",
    steps: [
      {
        order: 1,
        title: "Ücretsiz günlük hakla dene",
        duration: "≈ 2 dk",
        input: "İş tanımı veya hazır şablon seçimi",
        output: `Günde ${TEZGAH_GUEST_DAILY_LIMIT} üretim hakkı; kayıt gerekmez`,
        tip: "Kota İstanbul gününde sıfırlanır. Çıktıyı kaybetmemek için ücretsiz hesaba geç; hak düşmez.",
        href: "/tezgah",
        cta: "Tezgâhı aç",
      },
      {
        order: 2,
        title: "İhtiyaca göre paket seç",
        duration: "≈ 2 dk",
        input: "Aylık üretim hacmin",
        output: "30 günlük Tezgâh Pro aboneliği veya 10'lu üretim kredisi",
        tip: "Düzenli kullanıyorsan Pro; ara sıra kullanıyorsan kredi daha hesaplı. Tutar katalog satırından okunur.",
        href: "/fiyatlandirma",
        cta: "Paketleri karşılaştır",
      },
      {
        order: 3,
        title: "Çıktıyı üret ve revize et",
        duration: "≈ 3 dk / çıktı",
        input: "Marka sesi, ürün bilgisi ve hedef kitle",
        output: "Metin, analiz veya ticari içerik taslağı; revizyonla son hâl",
        tip: "Uydurma sayı ve vaat yazdırma. Üretilen tutarı ve süreyi kendi kaynağınla doğrula.",
        href: "/tezgah",
        cta: "Üretime geç",
      },
    ],
  },
  {
    id: "career",
    label: "YetkinCV & Kariyer",
    blurb: "Ücretsiz yetkinlik testinden doğrulanabilir kamu kanıt bağlantısına.",
    href: "/career",
    outcome: "Sunucuda hesaplanmış yetkinlik puanı, onaylı rozet ve işverene gönderilebilir doğrulama bağı.",
    steps: [
      {
        order: 1,
        title: "Ücretsiz yetkinlik değerlendirmesini çöz",
        duration: "≈ 10 dk",
        input: "Seçtiğin uzmanlık alanı ve uygulamalı vaka testi",
        output: "Sunucuda hesaplanmış 0–100 yetkinlik puanı",
        tip: "Puan satın alma ile değil, test sonucuyla yazılır. Test bir kez değil; alan bazında tekrarlanabilir.",
        href: "/career",
        cta: "Teste başla",
      },
      {
        order: 2,
        title: "YetkinCV onaylı yetenek rozetini kazan",
        duration: "≈ 1 dk · otomatik",
        input: "Başarılı değerlendirme sonucu",
        output: "YetkinCV Onaylı Yetenek Rozeti ve beceri kırılımı",
        tip: "Rozet elle basılmaz. Eşiğin altındaki sonuç rozet üretmez; yeniden deneyebilirsin.",
        href: "/career",
        cta: "Rozet durumunu gör",
      },
      {
        order: 3,
        title: "Doğrulanabilir kamu kanıt linkini paylaş",
        duration: "≈ 1 dk",
        input: "Rozetli profil",
        output: "CV'ye ve iş başvurusuna eklenebilir `/vize/[id]` bağlantısı",
        tip: "Bağ herkese açıktır; CV metni ve vatandaş kimliği görünmez. İşe yerleşme garantisi değildir.",
        href: "/pasaport",
        cta: "Kanıt bağını al",
        emphasis: "outline",
      },
    ],
  },
] as const;

export function workflowModule(id: string): WorkflowModule | null {
  return WORKFLOW_MODULES.find((module) => module.id === id) ?? null;
}

/** Geçerli sekme anahtarı. Bilinmeyen değer ilk modüle düşer. */
export function parseWorkflowModuleId(value: string | null | undefined): WorkflowModuleId {
  const found = WORKFLOW_MODULES.find((module) => module.id === value);
  return found?.id ?? WORKFLOW_MODULES[0]!.id;
}

/**
 * Butona basılan gerçek adres.
 *
 * Korumalı hedef (`/e-ticaret`, `/hibe`, `/pasaport`, `/magazam`) oturumsuz ziyaretçiyi
 * çıplak `/login` duvarına düşürmez: `next` parametreli kayıt yoluna çevrilir ve
 * giriş sonrası kullanıcı doğrudan ilgili adıma iner (`lib/kernel/auth/redirects.ts`).
 */
export function workflowStepHref(href: string): Route {
  if (!href.startsWith("/")) {
    // Akış butonu dış adrese çıkmaz: dış hedef güvenli kayıt yoluna düşer.
    return "/register" as Route;
  }
  return (isProtectedCitizenPath(href) ? buildCitizenRegisterHref(href) : href) as Route;
}

/**
 * "≈ 3 dk", "≈ 10 dk", "≈ 1 dk · otomatik", "≈ 3 dk / çıktı" → dakika.
 * Okunamayan süre 0 sayılır; toplam yalnız okunabilen adımlardan oluşur.
 */
export function stepMinutes(duration: string): number {
  const match = /(\d+)\s*dk/u.exec(duration);
  return match?.[1] ? Number.parseInt(match[1], 10) : 0;
}

/** Modülün uçtan uca toplam tahmini süresi (dakika). */
export function moduleTotalMinutes(module: WorkflowModule): number {
  return module.steps.reduce((total, step) => total + stepMinutes(step.duration), 0);
}

/** Şeritte basılan toplam süre özeti: "≈ 23 dk". */
export function moduleTotalLabel(module: WorkflowModule): string {
  const minutes = moduleTotalMinutes(module);
  if (minutes <= 0) {
    return "Süre okunamadı";
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const text = hours > 0 ? (rest > 0 ? `${hours} sa ${rest} dk` : `${hours} sa`) : `${rest} dk`;
  return `≈ ${text}`;
}

/** Canlı durum göstergesinin okuduğu adım işaretleri. */
export type WorkflowProgress = {
  /** Rozet basılan adım sıra numaraları. */
  completed: readonly number[];
  /** Oturum açmış kullanıcı için kısa durum cümlesi. Misafirde null. */
  note: string | null;
};
