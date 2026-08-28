import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { orderAcademyCatalogByCurriculum } from "@/lib/academy/catalog-filter";
import { ACADEMY_COURSE_TITLES, type AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import {
  ACADEMY_COURSE_LEVEL_BY_SLUG,
  resolveAcademySeedMoney,
  type AcademyCourseLevel,
} from "@/lib/academy/course-level";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

/**
 * Katalog kart tohumu — slug, başlık, özet, fiyat, sıra. Sınav şıkkı yok.
 * `exam-pools` / proof-of-work bu dosyaya girmez; soru gövdesi `seed.ts` yolundadır.
 * SQL: `supabase/migrations/20260814090000_academy_course_seed.sql`.
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

const SUMMARIES: Record<AcademyCourseTitleSlug, string> = {
  "python-temel":
    "Sıfırdan Python: değişken, kontrol akışı, koleksiyon, dosya, Pandas ve problem çözme laboratuvarı. Temel’den İleri kapanışa 12 bölüm.",
  "fullstack-temel":
    "React, Next.js ve Node.js: dürüst HTTP, TypeScript sözleşmesi, App Router ve üretim API’si. 12 bölüm, mühürlü teslim.",
  "ai-temel":
    "Prompt mühendisliği ve veri bilimi: tarif katmanları, yapılandırılmış çıktı, tablo temizliği ve kaynaklı cevap. 12 bölüm.",
  "ux-temel":
    "UI/UX ve Figma Masterclass: araştırma, tel çerçeve, jeton, prototip ve el teslimi. 12 bölüm, kariyer vizesi.",
};

const SEED_META: Record<
  AcademyCourseTitleSlug,
  {
    id: string;
    catalogEntryId: string;
    examId: string;
    globalRank: number;
    localRank: number;
    seedAmountMinor: number;
    seedMinMinor?: number;
    seedMaxMinor?: number;
  }
> = {
  "python-temel": {
    id: "ac_python_temel",
    catalogEntryId: "cat_academy_course_python_temel",
    examId: "exam_python_temel",
    globalRank: 1,
    localRank: 1,
    seedAmountMinor: 49_000,
  },
  "fullstack-temel": {
    id: "ac_fullstack_temel",
    catalogEntryId: "cat_academy_course_fullstack_temel",
    examId: "exam_fullstack_temel",
    globalRank: 1,
    localRank: 2,
    seedAmountMinor: 109_000,
    seedMaxMinor: 139_000,
  },
  "ai-temel": {
    id: "ac_ai_temel",
    catalogEntryId: "cat_academy_course_ai_temel",
    examId: "exam_ai_temel",
    globalRank: 1,
    localRank: 3,
    seedAmountMinor: 109_000,
    seedMaxMinor: 139_000,
  },
  "ux-temel": {
    id: "ac_ux_temel",
    catalogEntryId: "cat_academy_course_ux_temel",
    examId: "exam_ux_temel",
    globalRank: 1,
    localRank: 4,
    seedAmountMinor: 109_000,
    seedMaxMinor: 139_000,
  },
};

const SLUG_ORDER = Object.keys(ACADEMY_COURSE_TITLES) as AcademyCourseTitleSlug[];

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
    level,
    amountMinor: meta.seedAmountMinor,
    minMinor: meta.seedMinMinor,
    maxMinor: meta.seedMaxMinor,
  });
  return {
    id: meta.id,
    slug,
    title,
    summary: SUMMARIES[slug],
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

/** Eski RAIL / jenerik / sentetik yığın — hard-reset DELETE/PURGE. */
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
  "ac_python_orta",
  "ac_python_ileri",
  "ac_ai_orta",
  "ac_ai_ileri",
  "ac_fullstack_orta",
  "ac_fullstack_ileri",
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
  "course:python-orta",
  "course:python-ileri",
  "course:ai-orta",
  "course:ai-ileri",
  "course:fullstack-orta",
  "course:fullstack-ileri",
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
] as const;

export function academyCatalogSeedMatch(idOrSlug: string): AcademyCatalogSeed | undefined {
  return ACADEMY_CATALOG_SEEDS.find((row) => row.id === idOrSlug || row.slug === idOrSlug);
}
