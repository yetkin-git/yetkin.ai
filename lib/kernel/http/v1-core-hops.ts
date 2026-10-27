/**
 * Çekirdek hop — `DRON_KAYIT[].hops` oda listesine girmez.
 * Oda dizisi hop kaynağı değildir. Meta ile çelişki, bu listede tek cümleyle kapanır.
 * Akademi okuma hop’ları (`academy-curriculum-read`, `academy-exam-read`) buradadır:
 * oda satırı yazma kimliğini (`academy-curriculum`, `academy-exam`) taşır.
 */

import type { RailV1HopId } from "@/lib/kernel/http/v1-hops-meta";

export const RAIL_V1_CORE_HOP_SENTENCE = "Çekirdek hop, oda listesine girmez." as const;

export const RAIL_V1_CORE_HOPS = [
  {
    id: "health",
    note: `${RAIL_V1_CORE_HOP_SENTENCE} Sağlık yoklaması bir odanın hop listesine girmez.`,
  },
  {
    id: "auth-session",
    note: `${RAIL_V1_CORE_HOP_SENTENCE} Oturum okuması kimlik çekirdeğindedir.`,
  },
  {
    id: "wallet-top-up",
    note: `${RAIL_V1_CORE_HOP_SENTENCE} Cüzdan yükleme dashboard satırındaki wallet-strip okumasından ayrıdır.`,
  },
  {
    id: "profile-patch",
    note: `${RAIL_V1_CORE_HOP_SENTENCE} Profil yaması platform kimliğindedir.`,
  },
  {
    id: "academy-curriculum-read",
    note: `${RAIL_V1_CORE_HOP_SENTENCE} Akademi satırı academy-curriculum yazar; bu GET oda dizisine yazılmaz.`,
  },
  {
    id: "academy-exam-read",
    note: `${RAIL_V1_CORE_HOP_SENTENCE} Akademi satırı academy-exam yazar; bu GET oda dizisine yazılmaz.`,
  },
] as const satisfies readonly { id: RailV1HopId; note: string }[];

export type RailV1CoreHopId = (typeof RAIL_V1_CORE_HOPS)[number]["id"];
