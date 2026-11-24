/**
 * Vatandaş bildirim türleri.
 *
 * Faz 1 asgarisi beş olaydı. **Commerce günlük kâr özeti** (P0.6) altıncı türdür:
 * sabah 07:00 taraması satıcıya gerçekten ulaşır. Yeni oda/model/sayfa açılmaz;
 * mevcut SMTP hattı (`deliverCitizenNoticeMail`) kullanılır.
 */
export const CITIZEN_NOTICE_KINDS = [
  "bid_received",
  "bid_accepted",
  "delivery_posted",
  "escrow_released",
  "escrow_ttl_approaching",
  "commerce_daily_brief",
] as const;

export type CitizenNoticeKind = (typeof CITIZEN_NOTICE_KINDS)[number];

/** Kâr özeti e-postasının alıcıya özel taşıdığı satırlar. Başka türde yoktur. */
export type CommerceDailyBriefNoticeBody = {
  /** Özet cümlesi — koddan gelen sayılarla. */
  summary: string;
  lossSkuCount: number;
  criticalStockCount: number;
  /** Panele doğrudan bağlantı (mutlak yol). */
  panelPath: string;
};
