/**
 * Vitrin kart özeti — client-safe SSOT.
 * `catalog-seed` tohum satırını, `CourseCard` ön yüzü aynı sicilden basar.
 * Sınav şıkkı / Prisma / node:crypto yok.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

export const ACADEMY_CATALOG_SUMMARIES: Record<AcademyCourseTitleSlug, string> = {
  "01_office_ai":
    "Ofiste yapay zekâ devrimi: Excel formül sihirbazlığı, profesyonel Word raporlama, PowerPoint sunum hazırlama, Outlook e-posta otomasyonu ve kurumsal KVKK etiği.",
  "02_ecommerce_ai":
    "Pazaryeri satıcısı için yapay zekâ: SEO başlık, ürün açıklaması, yorum analitiği, Buybox/fiyat ve iade kriz protokolü.",
  "03_social_media_ai":
    "Reels, TikTok ve ürün görseli fabrikası: Midjourney, Runway, Kling ve CapCut ile dakikalar içinde yayınlık içerik.",
  "04_chatbot_nocode":
    "Kod yazmadan WhatsApp ve web chatbot: Voiceflow & Botpress ile 7/24 randevu, SSS ve satış asistanı.",
  "05_prompt_practice":
    "ChatGPT, Claude ve Perplexity ile günlük üretkenlik: doğru tarif, ödev, araştırma ve metin hızı.",
  "06_n8n_automation":
    "ERP, CRM, e-fatura ve WhatsApp hatlarını n8n / Make ile bağlayan self-hosted iş akışı otomasyonu.",
  "07_langgraph_agents":
    "LangGraph, CrewAI ve tool-calling ile SQL sorgulayan, API çağıran otonom ajan mimarisi.",
  "08_production_rag":
    "Kurumsal PDF ve sözleşmeleri halüsinasyonsuz sorgulayan production RAG, GraphRAG ve hibrit arama.",
  "09_nextjs_ai":
    "Next.js ve Vercel AI SDK ile streaming, Generative UI ve AI-native fullstack web.",
  "10_data_analytics_ai":
    "Excel/SQL tablolarından Power BI, Python ve yapay zekâ ile grafik, anomali ve yönetim özeti.",
  "11_llm_redteam":
    "Prompt injection, sızdırma ve yetkisiz araç çağrısına karşı LLM red teaming ve guardrails mimarisi.",
  "12_onprem_finetune":
    "KVKK ve on-prem için LoRA/QLoRA ince ayar, vLLM dağıtımı ve yerel model işletimi.",
  "13_ai_governance":
    "AB Yapay Zekâ Yasası, KVKK ve kurumsal AI yönetişimi: hukuk, denetim ve risk komitesi dili.",
};

export function academyCatalogSummaryBySlug(slug: string): string | undefined {
  return ACADEMY_CATALOG_SUMMARIES[slug as AcademyCourseTitleSlug];
}
