import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import { ACADEMY_COURSE_TITLES, type AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import { ACADEMY_GROWTH_SKU_SLUGS, ACADEMY_VITRINE_SHELL_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import {
  ACADEMY_COURSE_LEVEL_BY_SLUG,
  resolveAcademySeedMoney,
  type AcademyCourseLevel,
} from "@/lib/academy/course-level";
import {
  ACADEMY_CATALOG_PRICE_MINOR,
  ACADEMY_CATALOG_PRICE_WINDOW,
} from "@/lib/academy/catalog-pricing";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { ACADEMY_CATALOG_SUMMARIES } from "@/lib/academy/catalog-summaries";

/**
 * Katalog kart tohumu — slug, başlık, özet, fiyat, sıra.
 * SQL: `supabase/migrations/20260814090000_academy_course_seed.sql`.
 * Kanon 13 SKU `SEED_META` içinde dondurulur; vitrin tohumu mühürlü amiral SKU’dur.
 */
export type AcademyCatalogExamMeta = {
  id: string;
  title: string;
  passScore: number;
};

export type AcademyCatalogSeed = {
  id: string;
  slug: AcademyCourseTitleSlug;
  title: string;
  summary: string;
  catalogUnitKey: string;
  catalogEntryId: string;
  seedAmountMinor: number;
  seedMinMinor: number;
  seedMaxMinor: number;
  level: AcademyCourseLevel;
  globalRank: number;
  localRank: number;
  trendScore: number;
  catalogSortOrder: number;
  exam: AcademyCatalogExamMeta;
};

export function academyTrendScore(globalRank: number, localRank: number): number {
  return globalRank * localRank;
}

const SEED_META = Object.fromEntries(
  COURSE_REGISTRY.filter((row) => row.canon && row.seedRanks).map((row) => {
    const ranks = row.seedRanks;
    if (!ranks) {
      throw new Error(`Tohum sırası yok: ${row.slug}`);
    }
    return [
      row.slug,
      {
        id: `ac_${row.slug}`,
        catalogEntryId: `cat_academy_course_${row.slug}`,
        examId: `exam_${row.slug}`,
        globalRank: ranks.globalRank,
        localRank: ranks.localRank,
      },
    ];
  }),
) as Record<
  AcademyCourseTitleSlug,
  {
    id: string;
    catalogEntryId: string;
    examId: string;
    globalRank: number;
    localRank: number;
  }
>;

const SLUG_ORDER = ACADEMY_GROWTH_SKU_SLUGS as readonly AcademyCourseTitleSlug[];

const CATALOG_SORT_ORDER_BY_SLUG = Object.fromEntries(
  orderAcademyCatalogByCurriculum(
    SLUG_ORDER.map((slug) => ({ slug, level: ACADEMY_COURSE_LEVEL_BY_SLUG[slug] })),
  ).map((row, index) => [row.slug, index + 1]),
) as Record<AcademyCourseTitleSlug, number>;

function catalogSeedForSlug(slug: AcademyCourseTitleSlug): AcademyCatalogSeed {
  const meta = SEED_META[slug];
  const title = ACADEMY_COURSE_TITLES[slug];
  const trendScore = academyTrendScore(meta.globalRank, meta.localRank);
  const level = ACADEMY_COURSE_LEVEL_BY_SLUG[slug];
  const money = resolveAcademySeedMoney({
    amountMinor: ACADEMY_CATALOG_PRICE_MINOR[slug],
    minMinor: ACADEMY_CATALOG_PRICE_WINDOW.minMinor,
    maxMinor: ACADEMY_CATALOG_PRICE_WINDOW.maxMinor,
  });
  const vitrineOrder = (ACADEMY_VITRINE_SHELL_SKU_SLUGS as readonly string[]).indexOf(slug);
  return {
    id: meta.id,
    slug,
    title,
    summary: ACADEMY_CATALOG_SUMMARIES[slug],
    catalogUnitKey: `course:${slug}`,
    catalogEntryId: meta.catalogEntryId,
    seedAmountMinor: money.amountMinor,
    seedMinMinor: money.minMinor,
    seedMaxMinor: money.maxMinor,
    level,
    globalRank: meta.globalRank,
    localRank: meta.localRank,
    trendScore,
    catalogSortOrder:
      vitrineOrder >= 0 ? vitrineOrder + 1 : (CATALOG_SORT_ORDER_BY_SLUG[slug] ?? 99),
    exam: {
      id: meta.examId,
      title: `${title} müfredat sınavı`,
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
  };
}

export const ACADEMY_CATALOG_SEEDS: readonly AcademyCatalogSeed[] = SLUG_ORDER.map(catalogSeedForSlug);

/** Dürüst Yakında kabuğu — satın alınır tohum (`ACADEMY_CATALOG_SEEDS`) değildir. */
export function academyVitrineDisplaySeed(slug: string): AcademyCatalogSeed | undefined {
  if (!(slug in SEED_META)) {
    return undefined;
  }
  return catalogSeedForSlug(slug as AcademyCourseTitleSlug);
}

export const ACADEMY_SEED_MODULE_KEY = ACADEMY_MODULE_KEY;

export const ACADEMY_SEED_CURRENCY = SETTLEMENT_CURRENCY;

export const ACADEMY_SEED_COURSE_IDS = ACADEMY_CATALOG_SEEDS.map((row) => row.id);

export const ACADEMY_SEED_CATALOG_UNITS = ACADEMY_CATALOG_SEEDS.map((row) => row.catalogUnitKey);

/** Eski pasif / jenerik / taslak yığın — yayını kapat (lisans DROP yok). */
export const ACADEMY_LEGACY_PURGE_COURSE_IDS = [
  "ac_rail_temel",
  "ac_ray_sinyal",
  "ac_yz_icerik_gorsel",
  "ac_ileri_prompt",
  "ac_bim_iso",
  "ac_siber_kvkk",
  "ac_python_bi",
  "ac_esg",
  "ac_agile_scrum",
  "ac_bulut_devops",
  "ac_uiux_ds",
  "ac_fintek_ob",
  "ac_ai_orta",
  "ac_ai_ileri",
  "ac_devops_temel",
  "ac_devops_orta",
  "ac_devops_ileri",
  "ac_flutter_temel",
  "ac_flutter_orta",
  "ac_flutter_ileri",
  "ac_ds_temel",
  "ac_ds_orta",
  "ac_ds_ileri",
  "ac_sec_temel",
  "ac_sec_orta",
  "ac_sec_ileri",
  "ac_db_temel",
  "ac_db_orta",
  "ac_db_ileri",
  "ac_arch_temel",
  "ac_arch_orta",
  "ac_arch_ileri",
  "ac_pm_temel",
  "ac_pm_orta",
  "ac_pm_ileri",
  "ac_ux_orta",
  "ac_ux_ileri",
  "ac_w3_temel",
  "ac_w3_orta",
  "ac_w3_ileri",
  "ac_ex_temel",
  "ac_ex_orta",
  "ac_ex_ileri",
  "ac_mkt_temel",
  "ac_mkt_orta",
  "ac_mkt_ileri",
  "ac_mnt_temel",
  "ac_mnt_orta",
  "ac_mnt_ileri",
  "ac_pd_temel",
  "ac_pd_orta",
  "ac_pd_ileri",
  "ac_cld_temel",
  "ac_cld_orta",
  "ac_cld_ileri",
  "ac_eng_temel",
  "ac_eng_orta",
  "ac_eng_ileri",
  "ac_qa_temel",
  "ac_qa_orta",
  "ac_qa_ileri",
  "ac_jav_temel",
  "ac_jav_orta",
  "ac_jav_ileri",
  "ac_rn_temel",
  "ac_rn_orta",
  "ac_rn_ileri",
  "ac_gam_temel",
  "ac_gam_orta",
  "ac_gam_ileri",
  "ac_mlo_temel",
  "ac_sys_temel",
  "ac_canva_temel",
  "ac_pra_temel",
  "ac_linkedin_temel",
  "ac_cad_temel",
  // Eski varsayılan katalog taslakları (Full-Stack, Siber Güvenlik, Python, AI Agent vb.)
  "ac_security_temel",
  "ac_security_orta",
  "ac_security_ileri",
  "ac_ai_agent_temel",
  "ac_ai_agent_orta",
  "ac_ai_agent_ileri",
  "ac_python_temel",
  "ac_python_orta",
  "ac_python_ileri",
  "ac_fullstack_temel",
  "ac_fullstack_orta",
  "ac_fullstack_ileri",
  "ac_ai_temel",
  "ac_ux_temel",
  "ac_excel_masterclass",
  "ac_google_ads_masterclass",
  "ac_meta_ads_masterclass",
  "ac_eticaret_masterclass",
  "ac_canva_masterclass",
  "ac_linkedin_masterclass",
  "ac_production_rag_graphrag",
] as const;

export const ACADEMY_LEGACY_PURGE_CATALOG_UNITS = [
  "course:rail-temel",
  "course:rayli-sinyal-emniyet",
  "course:yz-icerik-gorsel-uretim",
  "course:ileri-prompt-muhendisligi",
  "course:bim-iso-19650",
  "course:siber-guvenlik-kvkk-iso-27001",
  "course:python-veri-analizi-is-zekasi",
  "course:kurumsal-esg-surdurulebilirlik",
  "course:agile-scrum-masterlik",
  "course:bulut-mimarisi-devops",
  "course:ui-ux-design-systems",
  "course:fintek-acik-bankacilik",
  "course:ai-orta",
  "course:ai-ileri",
  "course:devops-temel",
  "course:devops-orta",
  "course:devops-ileri",
  "course:flutter-temel",
  "course:flutter-orta",
  "course:flutter-ileri",
  "course:ds-temel",
  "course:ds-orta",
  "course:ds-ileri",
  "course:sec-temel",
  "course:sec-orta",
  "course:sec-ileri",
  "course:db-temel",
  "course:db-orta",
  "course:db-ileri",
  "course:arch-temel",
  "course:arch-orta",
  "course:arch-ileri",
  "course:pm-temel",
  "course:pm-orta",
  "course:pm-ileri",
  "course:ux-orta",
  "course:ux-ileri",
  "course:w3-temel",
  "course:w3-orta",
  "course:w3-ileri",
  "course:ex-temel",
  "course:ex-orta",
  "course:ex-ileri",
  "course:mkt-temel",
  "course:mkt-orta",
  "course:mkt-ileri",
  "course:mnt-temel",
  "course:mnt-orta",
  "course:mnt-ileri",
  "course:pd-temel",
  "course:pd-orta",
  "course:pd-ileri",
  "course:cld-temel",
  "course:cld-orta",
  "course:cld-ileri",
  "course:eng-temel",
  "course:eng-orta",
  "course:eng-ileri",
  "course:qa-temel",
  "course:qa-orta",
  "course:qa-ileri",
  "course:jav-temel",
  "course:jav-orta",
  "course:jav-ileri",
  "course:rn-temel",
  "course:rn-orta",
  "course:rn-ileri",
  "course:gam-temel",
  "course:gam-orta",
  "course:gam-ileri",
  "course:mlo-temel",
  "course:sys-temel",
  "course:canva-temel",
  "course:pra-temel",
  "course:linkedin-temel",
  "course:cad-temel",
  // Eski varsayılan katalog taslakları
  "course:security-temel",
  "course:security-orta",
  "course:security-ileri",
  "course:ai-agent-temel",
  "course:ai-agent-orta",
  "course:ai-agent-ileri",
  "course:python-temel",
  "course:python-orta",
  "course:python-ileri",
  "course:fullstack-temel",
  "course:fullstack-orta",
  "course:fullstack-ileri",
  "course:ai-temel",
  "course:ux-temel",
  "course:excel-masterclass",
  "course:google-ads-masterclass",
  "course:meta-ads-masterclass",
  "course:eticaret-masterclass",
  "course:canva-masterclass",
  "course:linkedin-masterclass",
  "course:production-rag-graphrag",
] as const;

export function academyCatalogSeedMatch(idOrSlug: string): AcademyCatalogSeed | undefined {
  return ACADEMY_CATALOG_SEEDS.find((row) => row.id === idOrSlug || row.slug === idOrSlug);
}
