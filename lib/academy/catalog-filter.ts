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
 * Katman 1 (kitlesel) → Katman 2 (mesleki) → Katman 3 (kurumsal).
 */
const CATALOG_PREFIX_ORDER: readonly (readonly string[])[] = [
  ["01_office_ai", "01_"],
  ["02_ecommerce_ai", "02_"],
  ["03_social_media_ai", "03_"],
  ["04_chatbot_nocode", "04_"],
  ["05_prompt_practice", "05_"],
  ["06_n8n_automation", "06_"],
  ["07_langgraph_agents", "07_"],
  ["08_production_rag", "08_"],
  ["09_nextjs_ai", "09_"],
  ["10_data_analytics_ai", "10_"],
  ["11_llm_redteam", "11_"],
  ["12_onprem_finetune", "12_"],
  ["13_ai_governance", "13_"],
];

/** Tekil Beceriler rafı */
const TEKIL_BECERI_PREFIXES: readonly string[] = [];

const MODULE_CODE_BY_SLUG: Record<string, string> = {
  "01_office_ai": "OFF-101",
  "office-ai": "OFF-101",
  "02_ecommerce_ai": "EC-102",
  "03_social_media_ai": "SM-103",
  "04_chatbot_nocode": "BOT-104",
  "05_prompt_practice": "PR-105",
  "06_n8n_automation": "N8N-201",
  "07_langgraph_agents": "LG-202",
  "08_production_rag": "RAG-203",
  "09_nextjs_ai": "NX-204",
  "10_data_analytics_ai": "DA-205",
  "11_llm_redteam": "RT-301",
  "12_onprem_finetune": "FT-302",
  "13_ai_governance": "GV-303",
};

const STEM_PREFIX: Record<string, string> = {
  office: "OFF",
};

const LEVEL_CODE: Record<string, string> = {
  Temel: "101",
  Orta: "102",
  İleri: "103",
  Masterclass: "MC",
};

/** Kart SKU — OFF-101 / EC-102 / N8N-201. Sıra yardımcısı ve vitrin kartı paylaşır. */
export function academyModuleCodeBySlug(slug: string): string | null {
  const explicit = MODULE_CODE_BY_SLUG[slug];
  if (explicit) {
    return explicit;
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
  OFF: "Ofis",
  EC: "E-ticaret",
  SM: "Sosyal medya",
  BOT: "Chatbot",
  PR: "Prompt",
  N8N: "Otomasyon",
  LG: "Ajan",
  RAG: "RAG",
  NX: "Next.js",
  DA: "Veri",
  RT: "Kırmızı takım",
  FT: "İnce ayar",
  GV: "Yönetişim",
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
  if (key === "01_office_ai" || key === "office_ai" || key === "01_" || key === "office-ai") {
    return "İş Hayatında ve Ofiste Yapay Zekâ (Kitlesel Başlangıç)";
  }
  if (key === "02_ecommerce_ai" || key === "02_") {
    return "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı";
  }
  if (key === "excel") {
    return "Tekil Beceriler & Masterclass";
  }
  for (const slug of slugs) {
    for (const id of ACADEMY_PATHWAY_IDS) {
      if (catalogPathwayRingSlugs(id).includes(slug)) {
        return ACADEMY_PATHWAY_TITLES[id] ?? null;
      }
    }
  }
  for (const id of ACADEMY_PATHWAY_IDS) {
    const rings = catalogPathwayRingSlugs(id);
    if (rings.some((slug) => catalogSeriesKey(slug) === key)) {
      return ACADEMY_PATHWAY_TITLES[id] ?? null;
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
