/**
 * /rehber — Görsel İş Akış ve Kurulum Merkezi verisi.
 *
 * Makale gövdesi burada durmaz. Her modül için uçtan uca kurulum adımları:
 * adım numarası, tahmini süre, somut girdi → çıktı, kritik ipucu, örnek önizleme
 * ve (oturumlu kullanıcıda) aksiyon butonu.
 * Tutar, kota ve süre uydurulmaz; canlı sabitler kendi evinden (`lib/tezgah/catalog`,
 * `lib/commerce/subscription-lifecycle`) okunur. Bu dosya yalnız akış iskeletidir.
 *
 * Oturumsuz ziyaretçiye adım içinde `/register` duvarı basılmaz: korumalı adımda
 * `samplePreview` gösterilir; açık araçta "kayıt gerekmez" bağı vardır. Tek ana
 * davet kartı modülün en altında durur (`invite`).
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
  /**
   * Üye olmadan görülebilen örnek ekran çıktısı (1–2 satır).
   * Oturumsuz ziyaretçide korumalı adımın yerine basılır.
   */
  samplePreview: string;
  /** Ürün hedefi. Ham korumalı adres basılmaz; `workflowStepHref` çevirir. */
  href: Route;
  cta: string;
  /** Buton ikincil mi (outline) yoksa birincil mi basılsın. */
  emphasis?: "primary" | "outline";
};

/** Modülün en altındaki tek ana davet — satış spam'i değil, sıcak özet. */
export type WorkflowInvite = {
  headline: string;
  cta: string;
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
  /** Oturumsuz ziyaretçi için tek ana CTA. */
  invite: WorkflowInvite;
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
 * Kayıt istemeden denenebilen açık araçlar.
 * Adım kartında "Ücretsiz Dene (Kayıt Gerekmez)" bağı yalnız bunlar için basılır.
 */
const OPEN_GUEST_TRY_PATHS = new Set(["/tezgah", "/career", "/tetkik"]);

export function isOpenGuestTryPath(href: string): boolean {
  return OPEN_GUEST_TRY_PATHS.has(href);
}

/**
 * Dört aktif ticari modül. Kapalı Akademi kursu burada yoktur.
 * Adımlar ürünün gerçek ekranlarına gider; hiçbir buton ölü adrese basmaz.
 */
export const WORKFLOW_MODULES: readonly WorkflowModule[] = [
  {
    id: "ecommerce",
    label: "E-Ticaret İşletme OS",
    blurb: "Trendyol ve Hepsiburada siparişleriniz, stok ve müşteri soruları tek panelde.",
    href: "/e-ticaret",
    outcome:
      "Mağazanız bağlı; sipariş, stok ve fiyat tek ekranda. Müşteri sorularına markanızın diliyle yanıt taslağı hazırlanır.",
    invite: {
      headline:
        "Bu kadar basit. Ortalama 20 dakikada mağazanızı bağlayabilirsiniz — hesabınızı ücretsiz açın, 30 gün boyunca tam paneli deneyin.",
      cta: "Ücretsiz Hesabını Aç ve 30 Gün Dene",
    },
    steps: [
      {
        order: 1,
        title: "30 gün ücretsiz denemeyi başlat",
        duration: "≈ 3 dk",
        input: `Kart doğrulaması için sadece ${TRIAL_VERIFY_AMOUNT_LABEL} çekilir; 30 gün boyunca başka hiçbir ücret alınmaz.`,
        output:
          "Tüm pazaryeri paneliniz 30 gün boyunca tam yetkiyle açılır. Memnun kalmazsanız tek tıkla iptal edebilirsiniz; iptal etmezseniz 30 gün sonunda aylık aboneliğiniz devam eder.",
        tip: `Deneme vergi kimliğinizle (VKN veya TCKN) açılır — her kimlikte bir deneme hakkı vardır. ${TRIAL_VERIFY_AMOUNT_LABEL} kart doğrulama bedelidir; bakiyenize yazılmaz ve iade taahhüdü değildir. İptal dönem sonunda işler.`,
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: «30 gün ücretsiz deneme aktif · kalan 30 gün» şeridi ve «Mağaza ekle» düğmesi.",
        href: "/e-ticaret",
        cta: "Denemeyi başlat",
      },
      {
        order: 2,
        title: "Pazaryeri bağlantısını kur",
        duration: "≈ 5 dk",
        input:
          "Trendyol veya Hepsiburada satıcı panelinizden aldığınız Satıcı ID, API Key ve API Secret.",
        output: "Mağazanız ile pazaryeri arasında doğrulanmış, güvenli kanal bağlantısı.",
        tip: "Trendyol veya Hepsiburada satıcı panelinizden aldığınız API anahtarını yapıştırın. Bilgileriniz şifrelenerek güvenle korunur, kimseyle paylaşılmaz. Anahtar panelde çoğu zaman bir kez gösterilir; kaybetmeden kopyalayın.",
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: Trendyol / Hepsiburada kartlarında yeşil «Bağlı» rozeti ve son senkron saati.",
        href: "/e-ticaret",
        cta: "Kanalları bağla",
      },
      {
        order: 3,
        title: "Ürünleri eşleştir, stoğu senkronla",
        duration: "≈ 10 dk",
        input: "Pazaryerindeki ürün listeniz ve kendi ürün kodlarınız.",
        output: "Eşleşmiş katalog; stok ve fiyat güncellemeleri panele yansır.",
        tip: "Önce 5–10 ürünle eşleştirip stok düşümünü kontrol edin; tüm kataloğu bir kerede açmayın.",
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: «12 ürün eşleşti · stok güncel» özeti ve ürün satırlarında stok/fiyat sütunları.",
        href: "/e-ticaret",
        cta: "Kataloğu aç",
      },
      {
        order: 4,
        title: "Müşteri sorularına AI yanıtı aç",
        duration: "≈ 5 dk",
        input: "Marka diliniz, sık sorulan sorular ve «bunu insana ver» kurallarınız.",
        output: "Gelen sorulara markanızın tonunda hazır yanıt taslağı.",
        tip: "Fiyat, iade ve özel ölçü sorularını insana bıraktırın. Taslak otomatik gönderilmez; siz onayladıktan sonra gider.",
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: bekleyen soru listesi, yan yana AI taslağı ve «Onayla & gönder» düğmesi.",
        href: "/e-ticaret",
        cta: "Otomasyonu ayarla",
      },
    ],
  },
  {
    id: "hibe",
    label: "YetkinHibe",
    blurb: "İşletmenizi tanıtın; size uyan KOSGEB / TÜBİTAK çağrısını ve proje taslağını görün.",
    href: "/hibe",
    outcome: "Sektörünüze uyan açık destek çağrıları ve kuruma taşıyabileceğiniz proje dosyası taslağı.",
    invite: {
      headline:
        "Uygun çağrıyı bulmak ortalama 20 dakikanızı alır. Hesabınızı ücretsiz açın; işletme profilinizi kaydedip eşleşmeye başlayın.",
      cta: "Ücretsiz Hesabını Aç ve Hibeyi Keşfet",
    },
    steps: [
      {
        order: 1,
        title: "İşletmenizi ve sektörünüzü tanıtın",
        duration: "≈ 4 dk",
        input: "Faaliyet alanınız (NACE), ölçeğiniz, iliniz ve çalışan sayınız.",
        output: "Eşleştirmeye hazır, net bir işletme profili.",
        tip: "NACE kodunu vergi levhanızdakiyle aynı yazın. Yanlış kod, size uyan çağrıyı kaçırmanıza yol açar.",
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: sektör, il ve ölçek alanları dolu bir «İşletme profili» kartı.",
        href: "/hibe",
        cta: "Profili oluştur",
      },
      {
        order: 2,
        title: "Size uyan destek çağrılarını görün",
        duration: "≈ 2 dk",
        input: "Kayıtlı işletme profiliniz.",
        output: "KOSGEB, TÜBİTAK ve diğer devlet desteklerinden size filtrelenmiş açık çağrı listesi.",
        tip: "Eşleşme katalog şartına bakar; kabul kararı kurumundur. Kapanmış çağrı açık gibi gösterilmez.",
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: «3 açık çağrı size uyuyor» listesi; her satırda kurum, son başvuru tarihi ve uygunluk özeti.",
        href: "/hibe",
        cta: "Çağrıları eşleştir",
      },
      {
        order: 3,
        title: "Proje dosyası taslağını üret",
        duration: "≈ 15 dk",
        input: "Seçtiğiniz çağrı, çözmek istediğiniz sorun ve iş paketi fikriniz.",
        output: "Tek seferlik hibe başvuru taslağı ve kontrol listesi.",
        tip: "Taslak, kurumun sistemine sizin taşıyacağınız metindir; başvurunun yerine geçmez. Destek tutarını cümleleriniz büyütmez.",
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: bölüm bölüm başvuru taslağı, eksik belge kontrol listesi ve «İndir / kopyala» düğmeleri.",
        href: "/hibe",
        cta: "Dosyayı oluştur",
      },
    ],
  },
  {
    id: "tezgah",
    label: "AI Tezgâh",
    blurb: "Kayıt olmadan üretin; düzenli kullanımda paket, ara sıra kullanımda kredi.",
    href: "/tezgah",
    outcome: "Ürün kartı, teklif, rapor ve ticari metin çıktısı; kotayı aşınca paket veya kredi ile devam.",
    invite: {
      headline: `Kayıt gerekmez. Günde ${TEZGAH_GUEST_DAILY_LIMIT} üretim hakkınız hazır — iş tanımınızı yazın, çıktıyı hemen görün.`,
      cta: "Tezgâhı Ücretsiz Aç",
    },
    steps: [
      {
        order: 1,
        title: "Ücretsiz günlük hakla dene",
        duration: "≈ 2 dk",
        input: "İş tanımınız veya hazır bir şablon seçimi.",
        output: `Günde ${TEZGAH_GUEST_DAILY_LIMIT} üretim hakkı; kayıt gerekmez.`,
        tip: "Kota her gün İstanbul saatinde yenilenir. Çıktıyı kaybetmemek isterseniz ücretsiz hesaba geçin; hakkınız düşmez.",
        samplePreview: `Misafir ekranda göreceğiniz: «Bugün ${TEZGAH_GUEST_DAILY_LIMIT} hakkınız var» sayacı, şablon listesi ve «Üret» düğmesi.`,
        href: "/tezgah",
        cta: "Tezgâhı aç",
      },
      {
        order: 2,
        title: "İhtiyaca göre paket seç",
        duration: "≈ 2 dk",
        input: "Aylık üretim hacminiz.",
        output: "30 günlük Tezgâh Pro aboneliği veya 10'lu üretim kredisi.",
        tip: "Her gün kullanıyorsanız Pro; ara sıra kullanıyorsanız kredi daha hesaplıdır. Tutarlar fiyat sayfasındaki katalogdan okunur.",
        samplePreview:
          "Fiyat sayfasında göreceğiniz: Tezgâh Pro aylık paket kartı ile 10'lu kredi kartı yan yana, her birinde net tutar.",
        href: "/fiyatlandirma",
        cta: "Paketleri karşılaştır",
      },
      {
        order: 3,
        title: "Çıktıyı üret ve revize et",
        duration: "≈ 3 dk / çıktı",
        input: "Marka sesiniz, ürün bilginiz ve hedef kitleniz.",
        output: "Metin, analiz veya ticari içerik taslağı; revizyonla son hâl.",
        tip: "Uydurma sayı ve vaat yazdırmayın. Üretilen tutarı ve süreyi kendi kaynağınızla doğrulayın.",
        samplePreview:
          "Tezgâhta göreceğiniz: solda girdi formu, sağda üretilmiş metin önizlemesi ve «Yeniden yaz / kısalt» düğmeleri.",
        href: "/tezgah",
        cta: "Üretime geç",
      },
    ],
  },
  {
    id: "career",
    label: "YetkinCV & Kariyer",
    blurb: "Ücretsiz yetkinlik testinden, işverene gösterebileceğiniz doğrulanabilir kanıt bağlantısına.",
    href: "/career",
    outcome: "Sunucuda hesaplanmış yetkinlik puanı, onaylı rozet ve işverene gönderilebilir doğrulama bağı.",
    invite: {
      headline:
        "Teste başlamak ücretsizdir. Yaklaşık 10 dakikada puanınızı alın; eşiği geçerseniz rozet ve paylaşılabilir kanıt bağı oluşur.",
      cta: "Ücretsiz Yetkinlik Testine Başla",
    },
    steps: [
      {
        order: 1,
        title: "Ücretsiz yetkinlik değerlendirmesini çöz",
        duration: "≈ 10 dk",
        input: "Seçtiğiniz uzmanlık alanı ve uygulamalı vaka testi.",
        output: "Sunucuda hesaplanmış 0–100 yetkinlik puanı.",
        tip: "Puan satın alma ile değil, test sonucuyla yazılır. Test bir kez değil; alan bazında tekrarlanabilir.",
        samplePreview:
          "Kariyer ekranında göreceğiniz: uzmanlık alanı seçimi, vaka soruları ve bitince 0–100 puan kartı.",
        href: "/career",
        cta: "Teste başla",
      },
      {
        order: 2,
        title: "YetkinCV onaylı yetenek rozetini kazan",
        duration: "≈ 1 dk · otomatik",
        input: "Başarılı değerlendirme sonucu.",
        output: "YetkinCV Onaylı Yetenek Rozeti ve beceri kırılımı.",
        tip: "Rozet elle basılmaz. Eşiğin altındaki sonuç rozet üretmez; yeniden deneyebilirsiniz.",
        samplePreview:
          "Başarılı testten sonra göreceğiniz: «YetkinCV Onaylı» rozeti, beceri kırılımı ve paylaşım alanı.",
        href: "/career",
        cta: "Rozet durumunu gör",
      },
      {
        order: 3,
        title: "Doğrulanabilir kamu kanıt linkini paylaş",
        duration: "≈ 1 dk",
        input: "Rozetli profiliniz.",
        output: "CV'ye ve iş başvurusuna eklenebilir `/vize/[id]` bağlantısı.",
        tip: "Bağ herkese açıktır; CV metniniz ve kimlik bilgileriniz görünmez. İşe yerleşme garantisi değildir.",
        samplePreview:
          "Üye olduğunuzda karşınıza çıkacak ekran: kopyalanabilir `/vize/…` adresi ve işverenin göreceği özet kart önizlemesi.",
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
 *
 * Adım kartlarında oturumsuz ziyaretçiye bu adres basılmaz; yalnız modülün tek ana
 * davet kartı (`invite`) korumalı hedefte bu yolu kullanır.
 */
export function workflowStepHref(href: string): Route {
  if (!href.startsWith("/")) {
    // Akış butonu dış adrese çıkmaz: dış hedef güvenli kayıt yoluna düşer.
    return "/register" as Route;
  }
  return (isProtectedCitizenPath(href) ? buildCitizenRegisterHref(href) : href) as Route;
}

/**
 * Modül davet kartının hedefi.
 * Açık araçta doğrudan ürün yolu; korumalı hedefte `next` parametreli kayıt yolu.
 */
export function workflowInviteHref(module: WorkflowModule): Route {
  return workflowStepHref(module.href);
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
