import "server-only";

import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import {
  TRIAL_CANCEL_LINE,
  TRIAL_HEADLINE,
  TRIAL_VERIFY_LINE,
  trialRenewalLine,
} from "@/lib/pricing/trial-copy";
import { COMMERCE_PLANS } from "@/lib/commerce/os-rules";
import { TEZGAH_FREE_MONTHLY_CREDITS, TEZGAH_PATH, TEZGAH_PRO_MONTHLY_CREDITS } from "@/lib/tezgah/catalog";
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
  /** Başlangıç, Büyüme, Kurumsal. Tutar katalog satırı; satır yoksa plan açılış tutarı. */
  commercePlans: readonly PublicVitrineItem[];
  grantDossier: PublicVitrineItem;
  yetkinCv: PublicVitrineItem;
  kurumsal: PublicVitrineItem;
};

const ZERO = toAmountMinor(0);

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
  const [tezgahPro, commerceEntry, grantDossier, yetkinCvPublicationEntry, starterEntry, growthEntry, scaleEntry] =
    await Promise.all([
      catalog.findActiveEntry("tezgah", "pro"),
      catalog.findActiveEntry("commerce", "monthly"),
      catalog.findActiveEntry(TEZGAH_PRO_MODULE, TEZGAH_GRANT_UNIT),
      catalog.findActiveEntry("career", "yetkincv-exam"),
      catalog.findActiveEntry("commerce", "starter"),
      catalog.findActiveEntry("commerce", "growth"),
      catalog.findActiveEntry("commerce", "scale"),
    ]);
  const planCatalog = [starterEntry, growthEntry, scaleEntry];
  const commercePlans: PublicVitrineItem[] = COMMERCE_PLANS.map((plan, index) => {
    const catalogRow = planCatalog[index];
    const amountMinor = catalogRow?.isActive ? catalogRow.amountMinor : toAmountMinor(plan.listPriceMinor);
    const item = catalogItem({
      id: `commerce:${plan.unit}`,
      code: plan.code,
      title: plan.title,
      summary: plan.summary,
      lines: [TRIAL_HEADLINE, ...plan.lines],
      href: "/e-ticaret",
      entry: { amountMinor, isActive: true },
      monthly: true,
    });
    return {
      ...item,
      trial: {
        headline: TRIAL_HEADLINE,
        verifyLabel: TRIAL_VERIFY_LINE,
        renewalLabel: trialRenewalLine(amountMinor),
        cancelLine: TRIAL_CANCEL_LINE,
      },
    };
  });
  const yetkinCvPublicationLine = yetkinCvPublicationEntry?.isActive
    ? `Kamuya açık kariyer kartı + uzman dizini görünürlüğü — tek seferlik ${formatMinorCompact(
        yetkinCvPublicationEntry.amountMinor,
        SETTLEMENT_CURRENCY,
      )}`
    : "Kamuya açık yayın katalogda henüz açılmadı; sınav şimdilik tamamen ücretsiz";

  return {
    freeStart: {
      id: "free-start",
      code: "BASLANGIC",
      title: "Ücretsiz Başlangıç",
      summary: `AI Tezgâh ayda ${TEZGAH_FREE_MONTHLY_CREDITS} kredi. Uygulama rehberleri ücretsizdir.`,
      lines: [
        `AI Tezgâh (ayda ${TEZGAH_FREE_MONTHLY_CREDITS} kredi)`,
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
      summary: "Aylık 500 kredi havuzu ve DOCX/ZIP müşteri teslim paketleri.",
      lines: [
        // B-02 / S-01: kredi metni sabitten okunur; elle yazılan rakam yok.
        `Ayda ${TEZGAH_PRO_MONTHLY_CREDITS} kredi (ücretsiz ${TEZGAH_FREE_MONTHLY_CREDITS})`,
        "Kullanılmayan kredinin %50'si sonraki aya devreder",
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
      href: "/panel/hibe",
      entry: grantDossier,
    }),
    yetkinCv: {
      id: "career:yetkincv-exam",
      code: "YETKINCV",
      title: "YetkinCV Uygulamalı Sınav",
      summary:
        "Sınav, puan, SWOT ve 30/60/90 planı ücretsizdir. Puan satın almadan değil test sonucundan oluşur.",
      lines: [
        "Uygulamalı vaka testi — ücretsiz",
        "Puan, SWOT ve 30/60/90 planı — ücretsiz",
        "SHA-256 doğrulanabilir puan kodu — ücretsiz",
        yetkinCvPublicationLine,
      ],
      href: "/career",
      // Faz 3 / §4.3: kart **canlıdır** ama tutarı değerlendirme değil **yayın** satırıdır.
      // Para puanı değil kamuya açık kartı satın alır; dürüstlük ilkesi korunur.
      honesty: "live",
      amountMinor: yetkinCvPublicationEntry?.isActive
        ? yetkinCvPublicationEntry.amountMinor
        : null,
      priceLabel: yetkinCvPublicationEntry?.isActive
        ? formatMinorCompact(yetkinCvPublicationEntry.amountMinor, SETTLEMENT_CURRENCY)
        : PUBLIC_FREE_EVALUATION_LABEL,
      statusLabel: yetkinCvPublicationEntry?.isActive
        ? "Sınav ücretsiz · yayın tek seferlik"
        : PUBLIC_FREE_EVALUATION_LABEL,
    },
    commerce: {
      ...catalogItem({
        id: "commerce:monthly",
        code: "COMMERCE",
        title: "E-Ticaret İşletme Lisansı",
        // Y-01: yalnız bugün canlı kanallar yazılır (Trendyol, Hepsiburada).
        summary: "Trendyol ve Hepsiburada çift yönlü stok ve sipariş yönetimi.",
        lines: [
          TRIAL_HEADLINE,
          "Trendyol ve Hepsiburada tek panelden stok ve sipariş",
          "AI Tezgâh ile ürün açıklaması aktarımı",
          "Müşteri sorusu gelen kutusu ve fatura/KDV uyumu",
          "Dönem sonu iptali tek tıkla mağaza panelinde",
        ],
        href: "/e-ticaret",
        entry: commerceEntry,
        monthly: true,
      }),
      // B-05: deneme metni tek SSOT'tan (`lib/pricing/trial-copy.ts`) okunur.
      trial: {
        headline: TRIAL_HEADLINE,
        verifyLabel: TRIAL_VERIFY_LINE,
        renewalLabel: trialRenewalLine(commerceEntry?.isActive ? commerceEntry.amountMinor : null),
        cancelLine: TRIAL_CANCEL_LINE,
      },
    },
    commercePlans,
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
