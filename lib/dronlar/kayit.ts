/**
 * Dron / dikey kayıt defteri — tek SSOT.
 * Yeni dron `npm run dron:new` ile buraya yazılır; eslint ve kenar buradan türer.
 * Kapalı doğar: `DronBayrakları.isKapali(id)` true iken kamu yüzeyi 410.
 */

export const VERTICAL_ROOMS = [
  { id: "dashboard", path: "/dashboard", label: "Anasayfa", blurb: "Genel bakış" },
  { id: "academy", path: "/academy", label: "Akademi", blurb: "Kurs, ödeme onayı, sertifika" },
  { id: "career", path: "/career", label: "Kariyer", blurb: "Sertifika ve ilanlar" },
  { id: "freelancer", path: "/freelancer", label: "Freelancer", blurb: "Arka plan · modül pasif" },
] as const;

export type VerticalRoomId = (typeof VERTICAL_ROOMS)[number]["id"];

/**
 * Müstakil oda. Dört kamu vitrinine yazılmaz. Akademi kayıt defterinde kartı yoktur.
 * Ziyaretçi kapısı aşağıdaki donmuş yol listesinde durur. Oturum açmış veli kapalı pilotu görür.
 */
export const INDEPENDENT_ROOMS = [
  {
    id: "junior",
    path: "/junior",
    label: "Junior",
    blurb: "10-18 yaş, veli hesabı altında, veli rızalı okul dersi",
  },
] as const;

export type IndependentRoomId = (typeof INDEPENDENT_ROOMS)[number]["id"];

/** Donmuş oda yolları. Junior burada ziyaretçi kapısıdır; ürün evi `lib/junior` dir. */
export const FROZEN_DISK_ROOMS = [
  "studio",
  "devlabs",
  "kurumsal",
  "hibe",
  "arena",
  "pazaryeri",
  "junior",
  "social",
] as const;

export type FrozenDiskRoomId = (typeof FROZEN_DISK_ROOMS)[number];

export type DronKayitSatiri = {
  id: VerticalRoomId;
  path: string;
  label: string;
  blurb: string;
  hops: readonly string[];
  sahipEkip: string;
  /** Varsayılan kapı: true = kamu 410. Env `DRON_<ID>_OPEN=1` ile açılır. */
  kapali: boolean;
  bayrakEnv?: string;
};

export const DRON_KAYIT: readonly DronKayitSatiri[] = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Anasayfa",
    blurb: "Genel bakış",
    hops: ["wallet-strip"],
    sahipEkip: "amiral",
    kapali: false,
  },
  {
    id: "academy",
    path: "/academy",
    label: "Akademi",
    blurb: "Kurs, ödeme onayı, sertifika",
    hops: [
      "academy-certificate",
      "academy-pulse",
      "academy-purchase",
      "academy-lock",
      "academy-curriculum",
      "academy-exam",
    ],
    sahipEkip: "amiral",
    kapali: false,
  },
  {
    id: "career",
    path: "/career",
    label: "Kariyer",
    blurb: "Sertifika ve ilanlar",
    hops: ["career-pulse", "career-visas", "career-portfolio"],
    sahipEkip: "amiral",
    kapali: false,
  },
  {
    id: "freelancer",
    path: "/freelancer",
    label: "Freelancer",
    blurb: "Arka plan · modül pasif",
    hops: [],
    sahipEkip: "pazaryeri",
    kapali: true,
    bayrakEnv: "DRON_FREELANCER_OPEN",
  },
];

function envFlagOpen(name: string | undefined): boolean | null {
  if (!name) {
    return null;
  }
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) {
    return null;
  }
  if (raw === "1" || raw === "true" || raw === "open") {
    return true;
  }
  if (raw === "0" || raw === "false" || raw === "closed") {
    return false;
  }
  return null;
}

export const DronBayrakları = {
  kayit(id: string): DronKayitSatiri | undefined {
    return DRON_KAYIT.find((row) => row.id === id);
  },
  isDonmus(id: string): boolean {
    return (FROZEN_DISK_ROOMS as readonly string[]).includes(id);
  },
  /** Bilinmeyen ve donmuş id kapalıdır. Kayıtlı dron env ile açılır. */
  isKapali(id: string): boolean {
    if (DronBayrakları.isDonmus(id)) {
      return true;
    }
    const row = DronBayrakları.kayit(id);
    if (!row) {
      return true;
    }
    const envOpen = envFlagOpen(row.bayrakEnv);
    if (envOpen === true) {
      return false;
    }
    if (envOpen === false) {
      return true;
    }
    const closedOverride = envFlagOpen(`DRON_${id.toUpperCase().replace(/-/g, "_")}_OPEN`);
    if (closedOverride === true) {
      return false;
    }
    if (closedOverride === false) {
      return true;
    }
    return row.kapali;
  },
};

export function isRegisteredVerticalRoom(id: string): id is VerticalRoomId {
  return VERTICAL_ROOMS.some((room) => room.id === id);
}
