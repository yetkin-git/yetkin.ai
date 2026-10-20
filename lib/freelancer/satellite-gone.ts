/**
 * Freelancer uydu BFF — squad / direct-offer HTTP 410.
 * Motor `lib/freelancer` içinde durur; vatandaş ve Dron bu yüzeyi çağırmaz.
 */

export const FREELANCER_SATELLITE_GONE = {
  squad: "Takım paylaşımı bu fazda kapalı.",
  directOffer: "Doğrudan teklif bu fazda kapalı.",
} as const;

/** Hop dışı uydu uçları. Kenar kilitliyken de 410 basar; dosya mühür iğnesidir. */
export const FREELANCER_SATELLITE_CLOSED_ROUTES = [
  {
    path: "/api/freelancer/squad",
    file: "app/api/freelancer/squad/route.ts",
    message: FREELANCER_SATELLITE_GONE.squad,
  },
  {
    path: "/api/freelancer/direct-offers",
    file: "app/api/freelancer/direct-offers/route.ts",
    message: FREELANCER_SATELLITE_GONE.directOffer,
  },
  {
    path: "/api/freelancer/direct-offers/[id]/accept",
    file: "app/api/freelancer/direct-offers/[id]/accept/route.ts",
    message: FREELANCER_SATELLITE_GONE.directOffer,
  },
  {
    path: "/api/freelancer/direct-offers/[id]/decline",
    file: "app/api/freelancer/direct-offers/[id]/decline/route.ts",
    message: FREELANCER_SATELLITE_GONE.directOffer,
  },
] as const;
