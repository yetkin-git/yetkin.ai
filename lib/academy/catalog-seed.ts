import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import { ACADEMY_COURSE_TITLES, type AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
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
 * Kanon 13 SKU `SEED_META` içinde dondurulur; vitrin tohumu ingest edilmiş alt kümedir.
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

const SEED_META: Record<
  AcademyCourseTitleSlug,
  {
    id: string;
    catalogEntryId: string;
    examId: string;
    globalRank: number;
    localRank: number;
  }
> = {
  "01_office_ai": {
    id: "ac_01_office_ai",
    catalogEntryId: "cat_academy_course_01_office_ai",
    examId: "exam_01_office_ai",
    globalRank: 1,
    localRank: 1,
  },
  "02_ecommerce_ai": {
    id: "ac_02_ecommerce_ai",
    catalogEntryId: "cat_academy_course_02_ecommerce_ai",
    examId: "exam_02_ecommerce_ai",
    globalRank: 2,
    localRank: 1,
  },
  "03_social_media_ai": {
    id: "ac_03_social_media_ai",
    catalogEntryId: "cat_academy_course_03_social_media_ai",
    examId: "exam_03_social_media_ai",
    globalRank: 3,
    localRank: 1,
  },
  "04_chatbot_nocode": {
    id: "ac_04_chatbot_nocode",
    catalogEntryId: "cat_academy_course_04_chatbot_nocode",
    examId: "exam_04_chatbot_nocode",
    globalRank: 4,
    localRank: 1,
  },
  "05_prompt_practice": {
    id: "ac_05_prompt_practice",
    catalogEntryId: "cat_academy_course_05_prompt_practice",
    examId: "exam_05_prompt_practice",
    globalRank: 5,
    localRank: 1,
  },
  "06_n8n_automation": {
    id: "ac_06_n8n_automation",
    catalogEntryId: "cat_academy_course_06_n8n_automation",
    examId: "exam_06_n8n_automation",
    globalRank: 6,
    localRank: 2,
  },
  "07_langgraph_agents": {
    id: "ac_07_langgraph_agents",
    catalogEntryId: "cat_academy_course_07_langgraph_agents",
    examId: "exam_07_langgraph_agents",
    globalRank: 7,
    localRank: 2,
  },
  "08_production_rag": {
    id: "ac_08_production_rag",
    catalogEntryId: "cat_academy_course_08_production_rag",
    examId: "exam_08_production_rag",
    globalRank: 8,
    localRank: 2,
  },
  "09_nextjs_ai": {
    id: "ac_09_nextjs_ai",
    catalogEntryId: "cat_academy_course_09_nextjs_ai",
    examId: "exam_09_nextjs_ai",
    globalRank: 9,
    localRank: 2,
  },
  "10_data_analytics_ai": {
    id: "ac_10_data_analytics_ai",
    catalogEntryId: "cat_academy_course_10_data_analytics_ai",
    examId: "exam_10_data_analytics_ai",
    globalRank: 10,
    localRank: 2,
  },
  "11_llm_redteam": {
    id: "ac_11_llm_redteam",
    catalogEntryId: "cat_academy_course_11_llm_redteam",
    examId: "exam_11_llm_redteam",
    globalRank: 11,
    localRank: 3,
  },
  "12_onprem_finetune": {
    id: "ac_12_onprem_finetune",
    catalogEntryId: "cat_academy_course_12_onprem_finetune",
    examId: "exam_12_onprem_finetune",
    globalRank: 12,
    localRank: 3,
  },
  "13_ai_governance": {
    id: "ac_13_ai_governance",
    catalogEntryId: "cat_academy_course_13_ai_governance",
    examId: "exam_13_ai_governance",
    globalRank: 13,
    localRank: 3,
  },
};

const SLUG_ORDER = ACADEMY_GROWTH_SKU_SLUGS as readonly AcademyCourseTitleSlug[];

const CATALOG_SORT_ORDER_BY_SLUG = Object.fromEntries(
  orderAcademyCatalogByCurriculum(
    SLUG_ORDER.map((slug) => ({ slug, level: ACADEMY_COURSE_LEVEL_BY_SLUG[slug] })),
  ).map((row, index) => [row.slug, index + 1]),
) as Record<AcademyCourseTitleSlug, number>;

export const ACADEMY_CATALOG_SEEDS: readonly AcademyCatalogSeed[] = SLUG_ORDER.map((slug) => {
  const meta = SEED_META[slug];
  const title = ACADEMY_COURSE_TITLES[slug];
  const trendScore = academyTrendScore(meta.globalRank, meta.localRank);
  const level = ACADEMY_COURSE_LEVEL_BY_SLUG[slug];
  const money = resolveAcademySeedMoney({
    amountMinor: ACADEMY_CATALOG_PRICE_MINOR[slug],
    minMinor: ACADEMY_CATALOG_PRICE_WINDOW.minMinor,
    maxMinor: ACADEMY_CATALOG_PRICE_WINDOW.maxMinor,
  });
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
    catalogSortOrder: CATALOG_SORT_ORDER_BY_SLUG[slug],
    exam: {
      id: meta.examId,
      title: `${title} müfredat sınavı`,
      passScore: ACADEMY_EXAM_PASS_SCORE,
    },
  };
});

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
