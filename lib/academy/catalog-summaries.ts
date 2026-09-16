/**
 * Vitrin kart özeti — client-safe SSOT.
 * Amiral 1. bölüm taze ingest; kardeş SKU şeffaf Yakında şablonuna düşer.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

export const ACADEMY_COMING_SOON_SUMMARY =
  "Hazırlanıyor. Compact müfredat, kapak ve sınav kapısı yakında basılır; satın alma tek başına belge üretmez.";

export const ACADEMY_CATALOG_SUMMARIES: Record<AcademyCourseTitleSlug, string> = {
  "01_office_ai":
    "A1’den temiz Excel, KVKK maskeleme, üç maddelik yönetim özeti, slayt, hata avı, e-posta ritüeli, Gmail/Outlook aksiyon listesi, Word’de dilekçe ve rapor, Cuma 30 kapanış rutini.",
  "02_ecommerce_ai": ACADEMY_COMING_SOON_SUMMARY,
  "03_social_media_ai": ACADEMY_COMING_SOON_SUMMARY,
  "04_chatbot_nocode": ACADEMY_COMING_SOON_SUMMARY,
  "05_prompt_practice": ACADEMY_COMING_SOON_SUMMARY,
  "06_n8n_automation": ACADEMY_COMING_SOON_SUMMARY,
  "07_langgraph_agents": ACADEMY_COMING_SOON_SUMMARY,
  "08_production_rag": ACADEMY_COMING_SOON_SUMMARY,
  "09_nextjs_ai": ACADEMY_COMING_SOON_SUMMARY,
  "10_data_analytics_ai": ACADEMY_COMING_SOON_SUMMARY,
  "11_llm_redteam": ACADEMY_COMING_SOON_SUMMARY,
  "12_onprem_finetune": ACADEMY_COMING_SOON_SUMMARY,
  "13_ai_governance": ACADEMY_COMING_SOON_SUMMARY,
};

export function academyCatalogSummaryBySlug(slug: string): string | undefined {
  return ACADEMY_CATALOG_SUMMARIES[slug as AcademyCourseTitleSlug];
}
