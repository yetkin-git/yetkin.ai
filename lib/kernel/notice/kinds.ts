/** Faz 1 bildirim asgarisi — beş olay. Yeni oda / model / sayfa yoktur. */
export const CITIZEN_NOTICE_KINDS = [
  "bid_received",
  "bid_accepted",
  "delivery_posted",
  "escrow_released",
  "escrow_ttl_approaching",
] as const;

export type CitizenNoticeKind = (typeof CITIZEN_NOTICE_KINDS)[number];
