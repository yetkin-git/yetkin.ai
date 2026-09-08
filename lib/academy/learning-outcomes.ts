import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

/**
 * Antre öğrenim çıktıları — vitrin kartı değil, kurs sayfası sicili.
 * Client-safe: sınav şıkkı yok.
 */

export const ACADEMY_LEARNING_OUTCOMES: Record<AcademyCourseTitleSlug, readonly string[]> = {
  "01_office_ai": [
    "Yapay zekâyı ofiste akıllı bir stajyer olarak konumlandırmak",
    "Excel formül ve veri temizliği tariflerini doğal dille yazmak",
    "Word rapor, dilekçe ve sözleşme özeti üretmek",
    "PowerPoint slayt iskeleti ve konuşmacı notu çıkarmak",
    "E-posta özeti, öncelik ve diplomatik yanıt taslağı hazırlamak",
    "KVKK maskeleme ve halüsinasyon denetimi uygulamak",
  ],
  "02_ecommerce_ai": [
    "Pazaryeri SEO başlığı ve vitrin maddesi üretmek",
    "AIDA/PAS ile fayda odaklı ürün açıklaması yazmak",
    "Yorum duygu analizi ve kapalı döngü SSS kurmak",
    "Buybox, bundle ve stop-loss fiyat kilidi uygulamak",
    "0.8 saniye kuralına uygun görsel ve Reels kancası üretmek",
    "İade kriz protokolü, seller score ve KVKK maskelemesi uygulamak",
  ],
  "03_social_media_ai": [
    "Görsel ve video fabrikası iş akışını ve yayın takvimini kurmak",
    "Midjourney & Canva AI ile stüdyo kalitesinde ürün ve marka görselleri üretmek",
    "Reels/TikTok için yüksek etkileşimli kanca (hook) ve metin şablonları hazırlamak",
    "HeyGen ve ElevenLabs ile yapay zekâ avatarları ve doğal seslendirmeler oluşturmak",
    "CapCut AI ile otonom video kurgu hattı ve Reels/Shorts içerikleri hazırlamak",
    "Otonom içerik yayınlama, CCaaS (İçerik Hizmeti) paketleme ve müşteri teslim protokolü yürütmek",
  ],
  "04_chatbot_nocode": [
    "Kodsuz chatbot dünyasında satış kapatan ve müşteri tutan diyalog mimarisi kurmak",
    "Voiceflow ile görsel akış, mantık ve web sohbet asistanı tasarlamak",
    "Botpress ile yapay zekâ (LLM/RAG) entegrasyonu ve bilgi tabanı bağlamak",
    "Meta WhatsApp Cloud API entegrasyonu ile otonom WhatsApp hattı açmak",
    "Make.com, Webhooks ve CRM bağlantıları ile insan temsilciye devir (handoff) hattı kurmak",
    "KOBİ’lere satılabilir 1 günlük chatbot paketi (CaaS) hazırlamak ve ticari teslim protokolü yürütmek",
  ],
  "05_prompt_practice": [
    "5 yapı taşlı prompt zihniyeti ile net, kısıtlı ve denetlenebilir tarifler yazmak",
    "Few-Shot ve Chain-of-Thought (CoT) teknikleriyle karmaşık konularda sıfır-hata akıl yürütmek",
    "İş e-postası, rapor, teklif ve profesyonel metin üretim süreçlerini otomatize etmek",
    "SWOT, risk ve karar destek promptları ile verileri analiz edip stratejik kararlar almak",
    "Görsel ve multimodal yapay zekâ modelleri için hassas komutlar kurgulamak",
    "Tekrar kullanılabilir parametreli prompt kütüphanesi oluşturmak ve günlük akışa entegre etmek",
  ],
  "06_n8n_automation": [
    "Self-hosted n8n ile ERP/CRM/e-posta hatlarını bağlamak",
    "Manuel veri girişini sıfırlayan iş akışı tasarlamak",
    "KOBİ otomasyon projesini faturalanabilir paket haline getirmek",
  ],
  "07_langgraph_agents": [
    "Tool-calling ajanını LangGraph/CrewAI ile kurmak",
    "SQL ve API araçlarını fail-closed döngüye bağlamak",
    "Hata durumunda alternatif deneyen dijital çalışan tasarlamak",
  ],
  "08_production_rag": [
    "Vektör + anahtar kelime hibrit arama kurmak",
    "Alıntısız cümleyi reddeden production RAG basmak",
    "GraphRAG ile kurumsal belge sızdırmazlığını korumak",
  ],
  "09_nextjs_ai": [
    "Vercel AI SDK ile streaming arayüz basmak",
    "Generative UI desenini Next.js App Router’a bağlamak",
    "AI-native fullstack ürün iskeleti çıkarmak",
  ],
  "10_data_analytics_ai": [
    "SQL/Excel tablosundan yönetici özeti üretmek",
    "Anomali ve payda dürüstlüğü kuralını uygulamak",
    "Power BI ve Python analitiğini yapay zekâ ile hızlandırmak",
  ],
  "11_llm_redteam": [
    "Prompt injection ve araç sızdırma senaryosunu kırmızı takımla denemek",
    "Guardrails katmanını üretim kapısına bağlamak",
    "Canlıya çıkış öncesi güvenlik denetim raporunu basmak",
  ],
  "12_onprem_finetune": [
    "LoRA/QLoRA ile yerel ince ayar yapmak",
    "vLLM ile on-prem inferans işletmek",
    "Veriyi buluta göndermeden model dağıtmak",
  ],
  "13_ai_governance": [
    "EU AI Act ve KVKK risk sınıflarını haritalamak",
    "Kurumsal AI politika ve denetim dilini yazmak",
    "Hukuk ve risk komitesine uyum özeti basmak",
  ],
};

export function academyLearningOutcomesForSlug(slug: string): readonly string[] {
  return ACADEMY_LEARNING_OUTCOMES[slug as AcademyCourseTitleSlug] ?? [];
}
