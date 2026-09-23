/**
 * Vitrin kart özeti — client-safe SSOT.
 * Amiral 1. bölüm taze ingest; kardeş SKU şeffaf Yakında şablonuna düşer.
 * T-02 — amiral özeti mührü 8 ders + 10 soru / 70 olarak tanımlar; sunucu dosya kontrolü yoktur.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";
import { OFFICE_AI_SEAL_PROOF_SHORT } from "@/lib/copy/sem-keywords";

export const ACADEMY_COMING_SOON_SUMMARY =
  "Hazırlanıyor. Compact müfredat, kapak ve sınav kapısı yakında basılır; satın alma tek başına belge üretmez.";

export const ACADEMY_CATALOG_SUMMARIES: Record<AcademyCourseTitleSlug, string> = {
  "01_office_ai":
    `İş hayatında yapay zekâ: Excel Copilot ve Ataş Yöntemi, A1 Düzeni ve Temiz Veri, yönetim özetine dönüştürme, Gmail'de yerleşik Gemini, Word belgesi inceleme, KVKK maskeleme ve haftalık Cuma rutini. ${OFFICE_AI_SEAL_PROOF_SHORT}`,
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
