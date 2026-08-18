import { YETKINILAN_BLURB, YETKINILAN_BRAND, YETKINILAN_PATH } from "@/lib/kernel/yetkinilan";

/** Anayasa §2.8 — 12 dikey oda. Sıra mühürlü; eslint.config.mjs ve scripts/verify-boundaries.ts ile eleman eleman aynı. */
export const VERTICAL_ROOMS = [
  { id: "dashboard", path: "/dashboard", label: "Anasayfa", phase: 2, blurb: "Kaldığın yer ve on iki oda" },
  { id: "studio", path: "/studio", label: "Studio", phase: 4, blurb: "Üretim anında bakiyeden transfer (LLM Debit)." },
  { id: "academy", path: "/academy", label: "Akademi", phase: 3, blurb: "Kurs, ödeme onayı, sertifika" },
  { id: "career", path: "/career", label: "Kariyer", phase: 3, blurb: "Mühürlü vize ve portföy" },
  { id: "freelancer", path: "/freelancer", label: "Freelancer", phase: 2, blurb: "İlan, emanet, teslim" },
  { id: "devlabs", path: "/devlabs", label: "DevLabs", phase: 4, blurb: "Kod tezgâhta üretilir; exec yoktur." },
  { id: "kurumsal", path: "/kurumsal", label: "Kurumsal", phase: 5, blurb: "Şirket beyni, mühürlü iş" },
  { id: "hibe", path: "/hibe", label: "Hibe", phase: 6, blurb: "KOSGEB ve TÜBİTAK bilgi kataloğu" },
  { id: "arena", path: "/arena", label: "Arena", phase: 5, blurb: "Ödül havuzu ve ihale" },
  { id: "pazaryeri", path: YETKINILAN_PATH, label: YETKINILAN_BRAND, phase: 6, blurb: YETKINILAN_BLURB },
  { id: "junior", path: "/junior", label: "Junior", phase: 7, blurb: "Yaş kapısı ve okul izi" },
  { id: "social", path: "/social", label: "YetkinX", phase: 7, blurb: "Mühürlü başarı meydanı" },
] as const;

export type VerticalRoomId = (typeof VERTICAL_ROOMS)[number]["id"];
export type RibbonRoomId = Exclude<VerticalRoomId, "dashboard">;

/** Anasayfa kokpitindeki şerit — dashboard çipi mükerrer olduğu için sicilden düşer. */
export const RIBBON_ROOMS = VERTICAL_ROOMS.filter(
  (room): room is Exclude<(typeof VERTICAL_ROOMS)[number], { readonly id: "dashboard" }> =>
    room.id !== "dashboard",
);

/** Çekirdek sığınaklar — vatandaş menüsü sol rayda değil, sağ üst hub’dadır. */
export const KERNEL_SURFACES = [
  { id: "profil", path: "/profil", label: "Profil", blurb: "Kimlik kartı" },
  { id: "cuzdan", path: "/cuzdan", label: "Cüzdan", blurb: "Canlı bakiye" },
  { id: "pasaport", path: "/pasaport", label: "Pasaport", blurb: "Vize mühürleri" },
  { id: "admin", path: "/admin", label: "Admin", blurb: "Katalog idaresi" },
] as const;
