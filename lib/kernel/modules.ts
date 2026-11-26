import { isVitrineRoomFrozen } from "@/lib/kernel/compliance/circuit-breakers";
import { VERTICAL_ROOMS } from "@/lib/dronlar/kayit";

export { VERTICAL_ROOMS, type VerticalRoomId } from "@/lib/dronlar/kayit";

export type RibbonRoomId = Exclude<(typeof VERTICAL_ROOMS)[number]["id"], "dashboard">;

/** Panel kokpitindeki şerit — dashboard çipi ve kilitli vitrin odası düşer. */
export const RIBBON_ROOMS = VERTICAL_ROOMS.filter(
  (room): room is Exclude<(typeof VERTICAL_ROOMS)[number], { readonly id: "dashboard" }> =>
    room.id !== "dashboard" && !isVitrineRoomFrozen(room.id),
);

/** Çekirdek sığınaklar — vatandaş menüsü sol rayda değil, sağ üst hub’dadır. */
export const KERNEL_SURFACES = [
  { id: "profil", path: "/profil", label: "Profil", blurb: "Kimlik kartı" },
  { id: "cuzdan", path: "/cuzdan", label: "Cüzdan", blurb: "Canlı bakiye" },
  { id: "pasaport", path: "/pasaport", label: "Pasaport", blurb: "Pasaport Vize Damgası sicili" },
  { id: "admin", path: "/admin", label: "Admin", blurb: "Katalog idaresi" },
] as const;

/**
 * Yetkin Commerce kokpiti. Hub siciline ve dron kaydına girmez.
 * Canlı vitrin `/magaza/[slug]` olarak kalır.
 * Kokpit `/panel/e-ticaret` altındadır; `/e-ticaret` kamu vitrinidir.
 * `/magazam` kenarda `/panel/e-ticaret`e iner. Mağaza alt yolları durur.
 */
export const COMMERCE_NAV = {
  id: "magazam",
  path: "/panel/e-ticaret",
  label: "E-Ticaret",
  blurb: "Stok, kanal ve sipariş",
} as const;

/**
 * Kurumsal B2B İK & ilan eleme odası. Hub siciline ve dron kaydına girmez.
 * `/kurumsal` kamu satış vitrinidir; sol ray ve komuta kartı çalışma odasına
 * (`/kurumsal/ilanlar`) iner. Kamu aday vitrini `/ilan` ayrıdır (üst çubuk).
 */
export const KURUMSAL_NAV = {
  id: "kurumsal",
  path: "/kurumsal/ilanlar",
  label: "Kurumsal",
  blurb: "İlan, eleme ve İK kokpiti",
} as const;
