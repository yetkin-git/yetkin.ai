/**
 * Freelancer uydu BFF — squad / direct-offer HTTP 410.
 * Motor `lib/freelancer` içinde durur; vatandaş ve Dron bu yüzeyi çağırmaz.
 */

export const FREELANCER_SATELLITE_GONE = {
  squad: "Takım paylaşımı bu fazda kapalı.",
  directOffer: "Doğrudan teklif bu fazda kapalı.",
} as const;
