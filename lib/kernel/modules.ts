import { VERTICAL_ROOMS } from "@/lib/kernel/rooms.ssot";

export { VERTICAL_ROOMS, type VerticalRoomId } from "@/lib/kernel/rooms.ssot";

export type RibbonRoomId = Exclude<(typeof VERTICAL_ROOMS)[number]["id"], "dashboard">;

/** Anasayfa kokpitindeki şerit — dashboard çipi mükerrer olduğu için sicilden düşer. */
export const RIBBON_ROOMS = VERTICAL_ROOMS.filter(
  (room): room is Exclude<(typeof VERTICAL_ROOMS)[number], { readonly id: "dashboard" }> =>
    room.id !== "dashboard",
);

/** Çekirdek sığınaklar — vatandaş menüsü sol rayda değil, sağ üst hub’dadır. */
export const KERNEL_SURFACES = [
  { id: "profil", path: "/profil", label: "Profil", blurb: "Kimlik kartı" },
  { id: "cuzdan", path: "/cuzdan", label: "Cüzdan", blurb: "Canlı bakiye" },
  { id: "pasaport", path: "/pasaport", label: "Pasaport", blurb: "Taşınan mühür sicili" },
  { id: "admin", path: "/admin", label: "Admin", blurb: "Katalog idaresi" },
] as const;
