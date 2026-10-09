/**
 * Yetkin Junior veli aydınlatması. 6502 kasa sürümü `2026-09-05` ile aynı dize değildir.
 * Özet `sha256` bu metnin kanonik gövdesidir. Metin değişince özet de değişir.
 */

import { LEGAL_ENTITY, LEGAL_ENTITY_IDS } from "@/lib/copy/legal-launch";

export const JUNIOR_GUARDIAN_NOTICE_VERSION = "junior-notice-2026-10-09" as const;

export const JUNIOR_GUARDIAN_NOTICE_HREF = "/legal/junior-veli" as const;

export const JUNIOR_GUARDIAN_NOTICE_TITLE = "Yetkin Junior Veli Aydınlatma Metni" as const;

/** Kanonik gövdeye giren paragraflar. Sayfa bunu okur. */
export function juniorGuardianNoticeParagraphs(): readonly string[] {
  return [
    `Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veliye sunulur. Veri sorumlusu: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). Marka: ${LEGAL_ENTITY.brandName}. Tebligat adresi: ${LEGAL_ENTITY.address}.`,
    "Hesap sizindir. Çocuk, sizin hesabınızın altında bir profildir. Çocuğa ayrı e-posta ve ayrı giriş açılmaz. Bu metindeki doğum yılı bir beyandır. Kimlik doğrulaması değildir. Metni onayladığınız gün 18 yaşından büyük olduğunuzu beyan edersiniz.",
    "İşlenen veriler şunlardır: takma ad, sınıf, çocuğun doğum yılı, sizin beyan ettiğiniz doğum yılı, ders ilerlemesi, anlatışın yazıya dökülmüş metni, öğretici not ve oyun puanı. Oyun puanı para değildir. Parayla alınamaz ve paraya çevrilemez. Platform çocuk adına bakiye, harçlık veya kredi tutmaz.",
    "Çocuğun sesi saklanmaz. Sesli anlatış, yalnız o değerlendirmenin metnini çıkarmak için modele gider. Değerlendirme bitince ses bellekten silinir ve diske yazılmaz. Kalan, yazıya dökülmüş metin ve öğretici nottur. Mikrofon kapalıysa aynı anlatış yazıyla yapılır.",
    `Ders, bu metnin yürürlükteki sürümü onaylanmadan açılmaz. Onay, sürüm ${JUNIOR_GUARDIAN_NOTICE_VERSION} ile kayda geçer. Profil kapatılınca takma ad Kapalı olur ve doğum yılı boşalır. Çocuk başka kullanıcıya mesaj atamaz. Reklam yoktur.`,
    "Bu aydınlatma, Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu değildir. Yıllık paket ödemesi bu metinden ayrı tik ister. Tikler tamamlanmadan ödeme ekranı yüklenmez ve ödeme isteği gitmez. Paket, ödeme bildirimi başarıyla kapandıktan sonra veli hesabına yazılır. Çocuk profili bu paketin derslerini açar.",
    `Destek: ${LEGAL_ENTITY.supportEmail}. WhatsApp: ${LEGAL_ENTITY.whatsappDisplay}. Adres: ${LEGAL_ENTITY.address}.`,
  ];
}

/** Sürüm satırı ve paragraflar. Özet yalnız bu dizeden hesaplanır. */
export function juniorGuardianNoticeCanonical(): string {
  return [`Sürüm: ${JUNIOR_GUARDIAN_NOTICE_VERSION}`, ...juniorGuardianNoticeParagraphs()].join("\n\n");
}
