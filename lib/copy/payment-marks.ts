/**
 * Kasa / footer ödeme görünürlüğü — yasal sözleşme metninden ayrı sicil.
 * Hukuk kopyası (`legal-launch`) sağlayıcı adını yazmaz; bu yüzey PayTR
 * üye işyeri incelemesi için logo, SSL ve 3D Secure rozetini basar.
 */

export const SECURE_PAYMENT_SSL_LABEL = "SSL / Güvenli Ödeme" as const;
export const SECURE_PAYMENT_SSL_HINT =
  "Bağlantı şifrelenir. Kart numarası platform sunucularında tutulmaz." as const;

export const SECURE_PAYMENT_3D_LABEL = "3D Secure" as const;
export const SECURE_PAYMENT_3D_HINT =
  "Kart ödemesi 3D Secure ile bankada doğrulanır. Kart numarası platformda tutulmaz." as const;

export const PAYTR_MARK_LABEL = "PayTR" as const;
export const PAYTR_MARK_ALT = "PayTR ile güvenli ödeme" as const;
export const PAYTR_MARK_HREF = "https://www.paytr.com" as const;
export const PAYTR_LOGO_SRC = "/paytr-logo.svg" as const;
export const PAYTR_MARK_CAPTION = "Yetkili Ödeme Kuruluşu" as const;
