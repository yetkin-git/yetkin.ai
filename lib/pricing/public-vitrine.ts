import "server-only";

import { COMMERCE_TRIAL_VERIFY_MINOR } from "@/lib/commerce/subscription-lifecycle";
import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor, formatMinorCompact } from "@/lib/kernel/money/format";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { TEZGAH_GUEST_DAILY_LIMIT, TEZGAH_PATH } from "@/lib/tezgah/catalog";
import { TEZGAH_GRANT_UNIT, TEZGAH_PRO_MODULE } from "@/lib/tezgah/paid-lane";
import {
  commerceMonthlyShowcase,
  PUBLIC_FREE_EVALUATION_LABEL,
  PUBLIC_KURUMSAL_QUOTE_LABEL,
  type PriceHonesty,
} from "@/lib/pricing/showcase-price";

export type PublicVitrineItem = {
  id: string;
  code: string;
  title: string;
  summary: string;
  /** Vitrin kartında madde madde basılır. Yoksa özet cümlelere bölünür. */
  lines?: readonly string[];
  href: string | null;
  honesty: PriceHonesty;
  amountMinor: AmountMinor | null;
  priceLabel: string;
  statusLabel: string;
  /**
   * Deneme teklifi. Yalnız E-Ticaret kartında doludur: müşteri "İlk 30 Gün Ücretsiz
   * (1 TL kart doğrulama)" teklifini, ardından aylık yenileme tutarını ve tek tıkla
   * dönem sonu iptal hakkını görür. Tutar katalog satırından okunur; uydurulmaz.
   */
  trial?: {
    headline: string;
    verifyLabel: string;
    renewalLabel: string | null;
    cancelLine: string;
  };
};

export type PublicPricingVitrine = {
  freeStart: PublicVitrineItem;
  tezgahPro: PublicVitrineItem;
  commerce: PublicVitrineItem;
  grantDossier: PublicVitrineItem;
  yetkinCv: PublicVitrineItem;
  kurumsal: PublicVitrineItem;
};

const ZERO = toAmountMinor(0);

/** Sembolik kart doğrulama bedeli etiketi — tek SSOT `COMMERCE_TRIAL_VERIFY_MINOR`. */
const TRIAL_VERIFY_LABEL = formatMinor(COMMERCE_TRIAL_VERIFY_MINOR, "TRY");

function catalogItem(input: {
  id: string;
  code: string;
  title: string;
  summary: string;
  lines?: readonly string[];
  href: string | null;
  entry: { amountMinor: AmountMinor; isActive: boolean } | null;
  monthly?: boolean;
}): PublicVitrineItem {
  const price = commerceMonthlyShowcase(input.entry);
  const live = price.honesty === "live";
  return {
    id: input.id,
    code: input.code,
    title: input.title,
    summary: input.summary,
    lines: input.lines,
    href: live ? input.href : null,
    honesty: price.honesty,
    amountMinor: price.amountMinor,
    priceLabel: live && input.monthly ? `${price.label} / Ay` : price.label,
    statusLabel: live ? (input.monthly ? "Aylık" : "Katalog") : price.label,
  };
}

/**
 * Kamu fiyat vitrini. Kurs kartı basılmaz.
 * Tutarlar `PriceCatalogEntry` satırından okunur. Satır yoksa tutar uydurulmaz.
 */
export async function loadPublicPricingVitrine(): Promise<PublicPricingVitrine> {
  const catalog = createPrismaPriceCatalogStore();
  const [tezgahPro, commerceEntry, grantDossier] = await Promise.all([
    catalog.findActiveEntry("tezgah", "pro"),
    catalog.findActiveEntry("commerce", "monthly"),
    catalog.findActiveEntry(TEZGAH_PRO_MODULE, TEZGAH_GRANT_UNIT),
  ]);

  return {
    freeStart: {
      id: "free-start",
      code: "BASLANGIC",
      title: "Ücretsiz Başlangıç",
      summary: `AI Tezgâh günde ${TEZGAH_GUEST_DAILY_LIMIT} üretim. Uygulama rehberleri ücretsizdir.`,
      lines: [
        `AI Tezgâh (günde ${TEZGAH_GUEST_DAILY_LIMIT} üretim)`,
        "Tüm Uygulama Rehberleri",
        // CRO: katalogda karşılığı olmayan seviye testi vaadi yerine gerçek ürün.
        "YetkinCV & Yetkinlik Pasaportu",
      ],
      href: TEZGAH_PATH,
      honesty: "live",
      amountMinor: ZERO,
      priceLabel: formatMinorCompact(ZERO, SETTLEMENT_CURRENCY),
      statusLabel: "Ücretsiz",
    },
    tezgahPro: catalogItem({
      id: "tezgah:pro",
      code: "TEZGAH-PRO",
      title: "AI Tezgâh Pro",
      summary: "Aylık yüksek üretim kotası ve DOCX/ZIP müşteri teslim paketleri.",
      lines: [
        "Aylık yüksek üretim kotası",
        "DOCX/ZIP müşteri teslim paketleri",
      ],
      href: TEZGAH_PATH,
      entry: tezgahPro,
      monthly: true,
    }),
    grantDossier: catalogItem({
      id: "tezgah:grant-dossier",
      code: "HIBE-DOSYA",
      title: "YetkinHibe Tam Proje Dosyası",
      summary: "Firma uygunluk analizi, kurum proje dosyası ve bütçe tabloları.",
      lines: [
        "Firma Uygunluk Analizi",
        "KOSGEB/TÜBİTAK/İhracat Proje Dosyası",
        "Bütçe ve İş Paketi Tabloları",
      ],
      href: "/hibe",
      entry: grantDossier,
    }),
    yetkinCv: {
      id: "career:yetkincv-exam",
      code: "YETKINCV",
      title: "YetkinCV Uygulamalı Sınav",
      summary:
        "Uygulamalı vaka testi ile paylaşılabilir YetkinCV puanı. Puan satın almadan değil test sonucundan oluşur.",
      lines: [
        "Uygulamalı vaka testi",
        "Doğrulanabilir puan kodu",
        "Herkese açık doğrulama bağlantısı",
      ],
      href: "/career",
      honesty: "live",
      amountMinor: null,
      priceLabel: PUBLIC_FREE_EVALUATION_LABEL,
      statusLabel: PUBLIC_FREE_EVALUATION_LABEL,
    },
    commerce: {
      ...catalogItem({
        id: "commerce:monthly",
        code: "COMMERCE",
        title: "E-Ticaret İşletme Lisansı",
        summary: "Trendyol, Hepsiburada, Amazon ve N11 çok kanallı yönetim paneli.",
        lines: [
          "İlk 30 gün ücretsiz (1 TL kart doğrulama)",
          "Trendyol, Hepsiburada, Amazon ve N11 tek panelden stok ve sipariş",
          "AI Tezgâh ile ürün açıklaması aktarımı",
          "Müşteri sorusu gelen kutusu ve fatura/KDV uyumu",
          "Dönem sonu iptali tek tıkla mağaza panelinde",
        ],
        href: "/e-ticaret",
        entry: commerceEntry,
        monthly: true,
      }),
      trial: {
        headline: "İlk 30 Gün Ücretsiz (1 TL Kart Doğrulama ile)",
        verifyLabel: `Bugün yalnız ${TRIAL_VERIFY_LABEL} kart doğrulama bedeli tahsil edilir`,
        renewalLabel:
          commerceEntry && commerceEntry.isActive && commerceEntry.amountMinor > 0
            ? `30 gün sonra ${formatMinorCompact(commerceEntry.amountMinor, SETTLEMENT_CURRENCY)} / Ay otomatik yenilenir`
            : null,
        cancelLine: "Tek tıkla dönem sonu iptali; erken iptal cezası yok.",
      },
    },
    kurumsal: {
      id: "kurumsal",
      code: "KURUMSAL",
      title: "Kurumsal & Ajans Paketleri",
      summary:
        "Ekip rozeti, ajans lisansı ve aday eleme. Talebinizi bırakın, kurumsal paneliniz tanımlansın.",
      lines: [
        "Ekip rozeti — self-servis talep",
        "Ajans lisansı — self-servis talep",
        "İlan ve aday eleme — paneli kendiniz açın",
      ],
      href: "/kurumsal",
      honesty: "live",
      amountMinor: null,
      priceLabel: PUBLIC_KURUMSAL_QUOTE_LABEL,
      statusLabel: PUBLIC_KURUMSAL_QUOTE_LABEL,
    },
  };
}
