import "server-only";

import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";
import { TEZGAH_GUEST_DAILY_LIMIT, TEZGAH_PATH } from "@/lib/tezgah/catalog";
import { TEZGAH_GRANT_UNIT, TEZGAH_PRO_MODULE } from "@/lib/tezgah/paid-lane";
import {
  commerceMonthlyShowcase,
  PUBLIC_PREORDER_LABEL,
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
      summary: `AI Tezgâh günde ${TEZGAH_GUEST_DAILY_LIMIT} üretim. Uygulama rehberleri ve seviye testi ücretsizdir.`,
      lines: [
        `AI Tezgâh (günde ${TEZGAH_GUEST_DAILY_LIMIT} üretim)`,
        "Tüm Uygulama Rehberleri",
        "Seviye Testi",
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
      summary: "SHA-256 mühürlü CV paketi. PayTR kasası bağlı değildir. Puan, satın almadan değil vaka testinden türer.",
      lines: [
        "Uygulamalı vaka testi",
        "SHA-256 doğrulama kodu",
        "Herkese açık /vize bağı",
      ],
      href: "/kurumsal",
      honesty: "planned",
      amountMinor: null,
      priceLabel: PUBLIC_PREORDER_LABEL,
      statusLabel: PUBLIC_PREORDER_LABEL,
    },
    commerce: catalogItem({
      id: "commerce:monthly",
      code: "COMMERCE",
      title: "E-Ticaret İşletme Lisansı",
      summary: "Trendyol, Hepsiburada, Amazon ve N11 çok kanallı yönetim kokpiti.",
      lines: [
        "Trendyol, Hepsiburada, Amazon ve N11 tek panelden stok ve sipariş",
        "AI Tezgâh ile ürün açıklaması aktarımı",
        "Müşteri sorusu gelen kutusu ve fatura/KDV uyumu",
      ],
      href: "/e-ticaret",
      entry: commerceEntry,
      monthly: true,
    }),
    kurumsal: {
      id: "kurumsal",
      code: "KURUMSAL",
      title: "Kurumsal & Ajans Paketleri",
      summary:
        "Ekip rozeti, ajans lisansı ve aday eleme paketinin PayTR kasası yoktur. Tutar basılmaz; başvuru ön taleptir.",
      lines: [
        "academy/team-seat: ekip rozeti, ön talep",
        "commerce/agency: ajans lisansı, ön talep",
        "kurumsal/job-screening-pack: ilan ve aday eleme, ön talep",
      ],
      href: "/kurumsal",
      honesty: "planned",
      amountMinor: null,
      priceLabel: PUBLIC_PREORDER_LABEL,
      statusLabel: PUBLIC_PREORDER_LABEL,
    },
  };
}
