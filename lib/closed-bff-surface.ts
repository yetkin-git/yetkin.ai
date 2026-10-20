import { ACADEMY_STUDIO_CLOSED_ROUTES } from "@/lib/academy/studio-gone";
import { FREELANCER_SATELLITE_CLOSED_ROUTES } from "@/lib/freelancer/satellite-gone";

/**
 * Hop dışı kalıcı 410 listesi.
 * Donmuş oda envanteri burada değildir; o yüzey `app/api/_gone` ve kenar `isFrozenRoomApi`.
 * `@yetkin/kernel` bu dosyayı import etmez.
 */
export const CLOSED_BFF_SURFACES = [
  ...ACADEMY_STUDIO_CLOSED_ROUTES,
  ...FREELANCER_SATELLITE_CLOSED_ROUTES,
] as const;
