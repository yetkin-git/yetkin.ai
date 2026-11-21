import { CANONICAL_SITE_ORIGIN } from "@/lib/copy/seo";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

/**
 * Kamu kanıt kartı paylaşım bağlantıları — saf fonksiyonlar.
 *
 * Tespit P4/18: her YetkinCV/Akademi mührü `/vize/[id]` adresinde herkese açık
 * bir kanıt kartı üretiyor, ama kartın üzerinde paylaşım aksiyonu yoktu. Her
 * mühür = bir organik backlink fırsatı; bu modül o fırsatın URL üretimini
 * sunucu/istemci ayrımından bağımsız, test edilebilir tutar.
 *
 * Kimlik sızmaz: üretilen metinlerde yalnız kart başlığı ve mutlak adres vardır.
 * Vatandaş kimliği, e-posta ve sözleşme numarası bu yüzeyde yoktur.
 */

function appOrigin(origin?: string): string {
  return (
    origin?.trim().replace(/\/$/u, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/u, "") ||
    CANONICAL_SITE_ORIGIN
  );
}

/** Göreli kart yolunu mutlak adrese çevirir. Zaten mutlak adres aynen döner. */
export function absoluteProofCardUrl(path: string, origin?: string): string {
  const trimmed = path.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${appOrigin(origin)}${normalized}`;
}

/**
 * LinkedIn "share-offsite" — mevcut kartı kendi akışında paylaşır.
 * (Sertifika *profil*ine ekleme ayrı akıştır: `linkedInAddCertificationUrl`;
 * o bağ `/career` oturumlu rehberinde zaten var.)
 */
export function linkedInProofShareUrl(cardUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cardUrl)}`;
}

/** WhatsApp — metin ve adres tek `text` parametresinde gider. */
export function whatsAppProofShareUrl(cardUrl: string, text: string): string {
  const body = text.trim() ? `${text.trim()} ${cardUrl}` : cardUrl;
  return `https://wa.me/?text=${encodeURIComponent(body)}`;
}

/** Paylaşım metni: kart başlığı + marka vaadi. Kimlik taşımaz. */
export function proofShareText(title: string): string {
  const named = title.trim();
  if (named) {
    return CAREER_SEN.publicPage.shareTextNamed(named);
  }
  return CAREER_SEN.publicPage.shareText;
}
