/**
 * Akademi vitrin sırası — sabit kulvar önceliği → seviye kodu (101→102→103) → slug.
 * created_at / girdi sırası / puan kolonu okunmaz. Client-safe: curriculum / node:crypto çekilmez.
 */

import { academyCourseLevelBySlug } from "@/lib/academy/course-level";
import {
  ACADEMY_PATHWAY_IDS,
  ACADEMY_PATHWAY_TITLES,
  catalogPathwayRingSlugs,
} from "@/lib/kernel/catalog-ids";

export type AcademyCatalogSortable = {
  slug: string;
  level?: string | null;
};

/**
 * Kulvar (seri raf) önceliği — vitrin rafları bu diziye kilitlidir.
 * 1 AI Agent Mimarlığı (amiral gemisi) · 2 Python · 3 Full-Stack · 4 Siber Güvenlik.
 * Aynı index paylaşan prefix’ler slug ile ayrılır. `ai-agent-` `ai-`’den önce durur.
 */
const CATALOG_PREFIX_ORDER: readonly (readonly string[])[] = [
  ["ai-agent-"],
  ["python-"],
  ["fullstack-"],
  ["security-"],
  ["ds-"],
  ["eng-"],
  ["ai-"],
  ["mlo-"],
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
  ["cad-", "pra-"],
  ["excel-", "google-ads-", "meta-ads-"],
  ["eticaret-"],
  ["canva-"],
  ["linkedin-"],
];

/** Tekil Beceriler rafı — Excel, Ads, E-Ticaret, Canva, LinkedIn aynı sırada durur. */
const TEKIL_BECERI_PREFIXES = [
  "excel-",
  "google-ads-",
  "meta-ads-",
  "eticaret-",
  "canva-",
  "linkedin-",
] as const;

const STEM_PREFIX: Record<string, string> = {
  python: "PY",
  ai: "AI",
  fullstack: "FS",
  security: "SEC",
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
  excel: "EXC",
  google: "GADS",
  meta: "META",
  mkt: "MKT",
  mnt: "MNT",
  pd: "PD",
  eticaret: "ETIC",
  canva: "CNV",
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
  if (slug === "ai-temel") {
    return "YZ-101";
  }
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
  YZ: "Yapay Zekâ Veri",
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
  EXC: "Excel",
  GADS: "Google Ads",
  META: "Meta",
  MKT: "Pazarlama",
  MNT: "Dijital İçerik",
  PD: "Kişisel Gelişim",
  CANVA: "Canva",
  CNV: "Canva",
  ETIC: "E-Ticaret",
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

/** Varsayılan vitrin sırası: sabit dikey öncelik → 101→102→103 → slug. created_at / puan kolonu okunmaz. */
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

export type AcademyCatalogSeriesShelf<T extends { slug: string }> = {
  key: string;
  title: string | null;
  courses: T[];
};

function catalogSeriesKey(slug: string): string {
  if (TEKIL_BECERI_PREFIXES.some((prefix) => slug.startsWith(prefix))) {
    return "excel";
  }
  for (const prefixes of CATALOG_PREFIX_ORDER) {
    const match = prefixes.find((prefix) => slug.startsWith(prefix));
    if (match) {
      return match.replace(/-$/, "");
    }
  }
  return slug;
}

function academyCatalogSeriesTitle(key: string, slugs: readonly string[]): string | null {
  if (key === "excel") {
    return "Tekil Beceriler & Masterclass";
  }
  for (const slug of slugs) {
    for (const id of ACADEMY_PATHWAY_IDS) {
      if (catalogPathwayRingSlugs(id).includes(slug)) {
        return ACADEMY_PATHWAY_TITLES[id];
      }
    }
  }
  for (const id of ACADEMY_PATHWAY_IDS) {
    const rings = catalogPathwayRingSlugs(id);
    if (rings.some((slug) => catalogSeriesKey(slug) === key)) {
      return ACADEMY_PATHWAY_TITLES[id];
    }
  }
  return null;
}

/**
 * Seviye yolu rafları — her dikey Temel → Orta → İleri üçlüsünü kendi satırında tutar.
 * Raf sırası CATALOG_PREFIX_ORDER’a kilitlidir (created_at / girdi sırası okunmaz); hayalet halka basılmaz.
 */
export function groupAcademyCatalogBySeries<T extends AcademyCatalogSortable>(
  items: readonly T[],
): AcademyCatalogSeriesShelf<T>[] {
  const shelves: AcademyCatalogSeriesShelf<T>[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of orderAcademyCatalogByCurriculum(items)) {
    const key = catalogSeriesKey(item.slug);
    const existing = indexByKey.get(key);
    if (existing !== undefined) {
      shelves[existing]!.courses.push(item);
      continue;
    }
    indexByKey.set(key, shelves.length);
    shelves.push({ key, title: null, courses: [item] });
  }

  return shelves.map((shelf) => ({
    ...shelf,
    courses: orderAcademyCatalogByCurriculum(shelf.courses),
    title: academyCatalogSeriesTitle(
      shelf.key,
      shelf.courses.map((course) => course.slug),
    ),
  }));
}
