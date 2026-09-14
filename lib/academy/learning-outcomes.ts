import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

/**
 * Antre öğrenim çıktıları — taze ingest bekler.
 * Client-safe: sınav şıkkı yok.
 */

const AWAITING_INGEST_OUTCOMES = [
  "Taze ingest bekleniyor — öğrenim çıktıları yayın öncesi basılacaktır.",
] as const;

export const ACADEMY_LEARNING_OUTCOMES: Record<AcademyCourseTitleSlug, readonly string[]> = {
  "01_office_ai": [
    "Düzensiz Excel tablosunu A1 hücresinden başlayarak düzenli tabloya çevirirsin.",
    "ChatGPT, Claude, Gemini ve özel AI API kapılarının Excel verisinde farkını ayırt eder, aynı temiz komutu tümüne uygularsın.",
    "Birleşik hücre, boş satır ve tarih/tutar tür karmaşasını ayıklarsın.",
    "Temiz eşikte yapay zekâya formül sordurmadan önce A1 hücresini doğrularsın.",
  ],
  "02_ecommerce_ai": AWAITING_INGEST_OUTCOMES,
  "03_social_media_ai": AWAITING_INGEST_OUTCOMES,
  "04_chatbot_nocode": AWAITING_INGEST_OUTCOMES,
  "05_prompt_practice": AWAITING_INGEST_OUTCOMES,
  "06_n8n_automation": AWAITING_INGEST_OUTCOMES,
  "07_langgraph_agents": AWAITING_INGEST_OUTCOMES,
  "08_production_rag": AWAITING_INGEST_OUTCOMES,
  "09_nextjs_ai": AWAITING_INGEST_OUTCOMES,
  "10_data_analytics_ai": AWAITING_INGEST_OUTCOMES,
  "11_llm_redteam": AWAITING_INGEST_OUTCOMES,
  "12_onprem_finetune": AWAITING_INGEST_OUTCOMES,
  "13_ai_governance": AWAITING_INGEST_OUTCOMES,
};

export function academyLearningOutcomesForSlug(slug: string): readonly string[] {
  return ACADEMY_LEARNING_OUTCOMES[slug as AcademyCourseTitleSlug] ?? [];
}
