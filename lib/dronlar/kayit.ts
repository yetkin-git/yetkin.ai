/**
 * Dron / dikey kayıt defteri — tek SSOT.
 * Yeni oda bu gövdede bir satırdır: kayıt, bayrak, hop. Ayrı repo, ayrı veritabanı
 * veya ayrı kimlik açılmaz. Mimari ad Anayasa B1’dedir: Pragmatik Monolit + `@yetkin/kernel`.
 * Yeni dron `npm run dron:new` ile buraya yazılır; eslint ve kenar buradan türer.
 * Kapalı doğar: `DronBayrakları.isKapali(id)` true iken kamu yüzeyi 410.
 */

/** Donmuş oda yolları. Junior bu listede değildir; müstakil oda `DRON_KAYIT` satırıdır. */
export const FROZEN_DISK_ROOMS = [
  "studio",
  "devlabs",
  "kurumsal",
  "hibe",
  "arena",
  "pazaryeri",
  "social",
] as const;

export type FrozenDiskRoomId = (typeof FROZEN_DISK_ROOMS)[number];

/**
 * Junior oda kapısı. Profil masası bu ada bakmaz.
 * Profil masası `DRON_JUNIOR_OPEN` (`lib/kernel/security/junior-gate.ts`).
 * `0|false|closed` kamu yüzünü 410 yapar. Boşken satırın `kapali` değeri durur.
 */
export const DRON_JUNIOR_ROOM_OPEN_ENV = "DRON_JUNIOR_ROOM_OPEN" as const;

/**
 * Young oda kapısı. Boşken satır `kapali: true` kalır ve `/young` 410 döner.
 * `1|true|open` lise rafını açar. Profil masası bu ada bakmaz.
 */
export const DRON_YOUNG_OPEN_ENV = "DRON_YOUNG_OPEN" as const;

export const DRON_KAYIT = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Genel Bakış",
    blurb: "Öğrenci paneli",
    hops: ["wallet-strip"],
    sahipEkip: "gövde",
    kapali: false,
    vitrin: true,
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
      "academy-catalog",
    ],
    sahipEkip: "gövde",
    kapali: false,
    vitrin: true,
  },
  {
    id: "career",
    path: "/career",
    label: "Kariyer",
    blurb: "Sertifika ve ilanlar",
    hops: ["career-pulse", "career-visas", "career-portfolio"],
    sahipEkip: "gövde",
    kapali: false,
    vitrin: true,
  },
  {
    id: "freelancer",
    path: "/freelancer",
    label: "Freelancer",
    blurb: "Arka plan · modül pasif",
    hops: [],
    sahipEkip: "pazaryeri",
    kapali: true,
    vitrin: true,
    bayrakEnv: "DRON_FREELANCER_OPEN",
  },
  {
    id: "junior",
    path: "/junior",
    label: "Junior",
    blurb: "6. Sınıf Pilot",
    hops: [
      "junior-lesson-read",
      "junior-lesson-play",
      "junior-lesson-progress",
      "junior-lesson-practice",
      "junior-shelves",
      "junior-progress-read",
      "junior-profile",
      "junior-profile-create",
      "junior-profile-select",
      "junior-profile-consent",
      "junior-profile-erase",
      "junior-electives",
      "junior-tell",
      "junior-practice",
      "junior-quiz",
      "junior-pilot-checkout",
    ],
    sahipEkip: "gövde",
    kapali: false,
    vitrin: false,
    bayrakEnv: DRON_JUNIOR_ROOM_OPEN_ENV,
  },
  {
    id: "young",
    path: "/young",
    label: "Young",
    blurb: "9–12. Sınıf ve YKS",
    hops: [],
    sahipEkip: "gövde",
    kapali: true,
    vitrin: false,
    bayrakEnv: DRON_YOUNG_OPEN_ENV,
  },
] as const;

type DronKayitRow = (typeof DRON_KAYIT)[number];

/** Kamu vitrin. Yol, etiket ve kısa metin `DRON_KAYIT` satırından gelir. */
export const VERTICAL_ROOMS = DRON_KAYIT.filter(
  (row): row is Extract<DronKayitRow, { vitrin: true }> => row.vitrin,
);

/** Müstakil oda. Dört kamu vitrinine yazılmaz. */
export const INDEPENDENT_ROOMS = DRON_KAYIT.filter(
  (row): row is Extract<DronKayitRow, { vitrin: false }> => row.vitrin === false,
);

export type DronKayitSatiri = DronKayitRow;
export type DronKayitId = DronKayitRow["id"];
export type VerticalRoomId = Extract<DronKayitRow, { vitrin: true }>["id"];
export type IndependentRoomId = Extract<DronKayitRow, { vitrin: false }>["id"];

function readDronEnv(name: string): string | undefined {
  if (name === DRON_YOUNG_OPEN_ENV) {
    return process.env.DRON_YOUNG_OPEN;
  }
  return process.env[name];
}

function envFlagOpen(name: string | undefined): boolean | null {
  if (!name) {
    return null;
  }
  const raw = readDronEnv(name)?.trim().toLowerCase();
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
    const named = "bayrakEnv" in row ? row.bayrakEnv : undefined;
    const envOpen = envFlagOpen(named);
    if (envOpen === true) {
      return false;
    }
    if (envOpen === false) {
      return true;
    }
    if (named) {
      return row.kapali;
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
