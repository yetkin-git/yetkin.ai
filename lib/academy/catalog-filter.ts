/**
 * Akademi vitrin sırası — kulvar prefix’i → seviye kodu (101→102→103) → slug.
 * Süzgeç / puan kolonu yok. Client-safe: curriculum / node:crypto çekilmez.
 */

import { academyCourseLevelBySlug } from "@/lib/academy/course-level";

export type AcademyCatalogSortable = {
  slug: string;
  level?: string | null;
};

/** Kulvar sırası — eski süzgeç grup SSOT’sunun yassı izi. Aynı index paylaşan prefix’ler slug ile ayrılır. */
const CATALOG_PREFIX_ORDER: readonly (readonly string[])[] = [
  ["python-"],
  ["ds-"],
  ["eng-"],
  ["ai-"],
  ["mlo-"],
  ["fullstack-"],
  ["jav-"],
  ["qa-"],
  ["arch-"],
  ["sys-"],
  ["devops-"],
  ["cld-"],
  ["rn-"],
  ["gam-"],
  ["flutter-"],
  ["sec-"],
  ["db-"],
  ["w3-"],
  ["ux-"],
  ["pm-"],
  ["mkt-"],
  ["mnt-"],
  ["ex-"],
  ["pd-"],
  ["canva-", "linkedin-", "cad-", "pra-"],
];

const STEM_PREFIX: Record<string, string> = {
  python: "PY",
  ai: "AI",
  fullstack: "FS",
  devops: "DEV",
  flutter: "FLT",
  sec: "SEC",
  db: "DB",
  ds: "DS",
  arch: "ARCH",
  cld: "CLD",
  eng: "ENG",
  qa: "QA",
  jav: "JAV",
  rn: "RN",
  gam: "GAM",
  mlo: "MLO",
  sys: "SYS",
  pm: "PM",
  ux: "UX",
  w3: "W3",
  ex: "EX",
  mkt: "MKT",
  mnt: "MNT",
  pd: "PD",
  canva: "CANVA",
  linkedin: "LNK",
  cad: "CAD",
  pra: "PRA",
};

const LEVEL_CODE: Record<string, string> = {
  Temel: "101",
  Orta: "102",
  İleri: "103",
  Masterclass: "MC",
};

/** Kart SKU — PY-101 / FS-102 / UX-MC. Sıra yardımcısı ve vitrin kartı paylaşır. */
export function academyModuleCodeBySlug(slug: string): string | null {
  const stem = slug.split("-")[0] ?? "";
  const prefix = STEM_PREFIX[stem];
  if (!prefix) {
    return null;
  }
  const level = academyCourseLevelBySlug(slug);
  const fromLevel = level ? LEVEL_CODE[level] : undefined;
  const fromSlug = slug.includes("masterclass") ? "MC" : undefined;
  return `${prefix}-${fromLevel ?? fromSlug ?? "100"}`;
}

/** TTS anonsu — arşiv dinle motoru okur; harf harf kod okunmaz. */
const MODULE_PREFIX_SPOKEN: Record<string, string> = {
  PY: "Python",
  AI: "Yapay Zekâ",
  FS: "Full-Stack",
  DEV: "DevOps",
  FLT: "Mobil",
  SEC: "Siber Güvenlik",
  DB: "Veritabanı",
  DS: "Veri Bilimi",
  ARCH: "Mimari",
  CLD: "Bulut Mimarisi",
  ENG: "Veri Mühendisliği",
  QA: "Kalite Mühendisliği",
  JAV: "Kurumsal Java",
  RN: "Çapraz Mobil",
  GAM: "Oyun Geliştirme",
  MLO: "Model İşletmesi",
  SYS: "Sistem Tasarımı",
  PM: "Ürün Yönetimi",
  UX: "Tasarım",
  W3: "Web Üç",
  EX: "İş Zekâsı",
  MKT: "Pazarlama",
  MNT: "Dijital İçerik",
  PD: "Kişisel Gelişim",
  CANVA: "Canva",
  LNK: "LinkedIn",
  CAD: "AutoCAD",
  PRA: "Pratik Asistan",
};

const MODULE_LEVEL_SPOKEN: Record<string, string> = {
  "101": "yüz bir",
  "102": "yüz iki",
  "103": "yüz üç",
  MC: "usta sınıfı",
  "100": "yüz",
};

export function academySpokenModuleCode(slug: string): string | null {
  const code = academyModuleCodeBySlug(slug);
  if (!code) {
    return null;
  }
  const dash = code.indexOf("-");
  const prefix = dash === -1 ? code : code.slice(0, dash);
  const rest = dash === -1 ? "" : code.slice(dash + 1);
  const spokenPrefix = MODULE_PREFIX_SPOKEN[prefix] ?? prefix;
  const spokenRest = rest ? (MODULE_LEVEL_SPOKEN[rest] ?? rest) : "";
  return spokenRest ? `${spokenPrefix} ${spokenRest}` : spokenPrefix;
}

function catalogVerticalOrderIndex(slug: string): number {
  let index = 0;
  for (const prefixes of CATALOG_PREFIX_ORDER) {
    if (prefixes.some((prefix) => slug.startsWith(prefix))) {
      return index;
    }
    index += 1;
  }
  return Number.MAX_SAFE_INTEGER;
}

function resolveSortLevel(item: AcademyCatalogSortable): string | null {
  const explicit = item.level?.trim();
  if (explicit) {
    return explicit;
  }
  return academyCourseLevelBySlug(item.slug);
}

function catalogModuleLevelOrderIndex(item: AcademyCatalogSortable): number {
  const level = resolveSortLevel(item);
  if (level === "Masterclass") {
    return 1_000;
  }
  const fromLevel = level ? LEVEL_CODE[level] : undefined;
  if (fromLevel && fromLevel !== "MC") {
    const parsed = Number.parseInt(fromLevel, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  const moduleCode = academyModuleCodeBySlug(item.slug);
  if (moduleCode) {
    const suffix = moduleCode.split("-")[1];
    if (suffix === "MC") {
      return 1_000;
    }
    const parsed = Number.parseInt(suffix ?? "", 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 9_999;
}

/** Varsayılan vitrin sırası: dikey → 101→102→103 → slug. Puan kolonu okunmaz. */
export function compareAcademyCatalogCurriculumOrder(
  a: AcademyCatalogSortable,
  b: AcademyCatalogSortable,
): number {
  const verticalDelta = catalogVerticalOrderIndex(a.slug) - catalogVerticalOrderIndex(b.slug);
  if (verticalDelta !== 0) {
    return verticalDelta;
  }
  const levelDelta = catalogModuleLevelOrderIndex(a) - catalogModuleLevelOrderIndex(b);
  if (levelDelta !== 0) {
    return levelDelta;
  }
  return a.slug.localeCompare(b.slug, "tr");
}

export function orderAcademyCatalogByCurriculum<T extends AcademyCatalogSortable>(
  items: readonly T[],
): T[] {
  return [...items].sort(compareAcademyCatalogCurriculumOrder);
}
