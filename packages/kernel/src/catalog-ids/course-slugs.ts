/**
 * Yayın SKU kimliği — vize damgası başlık eşlemesi.
 * Vitrin metni akademi odasında çoğaltılmaz; bu sicil SSOT’tur.
 *
 * Kanon: pazar analizindeki 13 odaklı eğitim (Katman 1×5 + Katman 2×5 + Katman 3×3).
 * Canlı vitrin `ACADEMY_GROWTH_SKU_SLUGS` mühürlü amiral SKU’dur.
 */

export const ACADEMY_CANON_SKU_SLUGS = [
  "01_office_ai",
  "02_ecommerce_ai",
  "03_social_media_ai",
  "04_chatbot_nocode",
  "05_prompt_practice",
  "06_n8n_automation",
  "07_langgraph_agents",
  "08_production_rag",
  "09_nextjs_ai",
  "10_data_analytics_ai",
  "11_llm_redteam",
  "12_onprem_finetune",
  "13_ai_governance",
] as const;

export const ACADEMY_COURSE_TITLES = {
  "01_office_ai":
    "İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)",
  "02_ecommerce_ai":
    "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)",
  "03_social_media_ai":
    "Yapay Zekâ ile Sosyal Medya İçeriği (Görsel ve Kısa Video)",
  "04_chatbot_nocode":
    "Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)",
  "05_prompt_practice":
    "Günlük İşler İçin İstem Yazma",
  "06_n8n_automation":
    "Kurumsal İş Akışı Otomasyonu (Self-Hosted n8n, Make & AI Entegrasyonları)",
  "07_langgraph_agents":
    "Otonom Yapay Zekâ Ajanları Mimarisi (LangGraph, CrewAI & Tool-Calling)",
  "08_production_rag":
    "Production RAG ve Kurumsal Arama Sistemleri (Vektör Veritabanları, GraphRAG & Hibrit Arama)",
  "09_nextjs_ai":
    "AI-Native Fullstack Web Geliştirme (Next.js, Vercel AI SDK & Reaktif Arayüzler)",
  "10_data_analytics_ai":
    "Veri Analitiği, SQL ve İş Zekâsı İçin Yapay Zekâ (Power BI, Python & AI Analytics)",
  "11_llm_redteam":
    "Yapay Zekâ Güvenliği, LLM Red Teaming & Guardrails Mimarisi",
  "12_onprem_finetune":
    "Yerel Model Dağıtımı ve İnce Ayar (Applied Fine-Tuning, LoRA/QLoRA & vLLM)",
  "13_ai_governance":
    "Kurumsal AI Yönetişimi, Hukuk ve Regülasyon Uyumu (AB Yapay Zekâ Yasası & KVKK)",
} as const satisfies Record<(typeof ACADEMY_CANON_SKU_SLUGS)[number], string>;

export type AcademyCourseTitleSlug = keyof typeof ACADEMY_COURSE_TITLES;

/**
 * Kanon 13 dışı canlı vitrin kartı. 13’lük tip kilidi burada genişlemez.
 * Başlık web `OFF_201_TITLE` ile aynı cümledir.
 */
export const ACADEMY_STOREFRONT_EXTRA_TITLES = {
  "01_office_ai_ileri": "İleri Ofis Yapay Zekâ",
} as const;

export type AcademyStorefrontExtraSlug = keyof typeof ACADEMY_STOREFRONT_EXTRA_TITLES;

export const ACADEMY_CATALOG_LAYER_BY_SLUG = {
  "01_office_ai": 1,
  "02_ecommerce_ai": 1,
  "03_social_media_ai": 1,
  "04_chatbot_nocode": 1,
  "05_prompt_practice": 1,
  "06_n8n_automation": 2,
  "07_langgraph_agents": 2,
  "08_production_rag": 2,
  "09_nextjs_ai": 2,
  "10_data_analytics_ai": 2,
  "11_llm_redteam": 3,
  "12_onprem_finetune": 3,
  "13_ai_governance": 3,
} as const satisfies Record<AcademyCourseTitleSlug, 1 | 2 | 3>;

type CanonLength = (typeof ACADEMY_CANON_SKU_SLUGS)["length"];
const _canonIsThirteen: CanonLength extends 13 ? true : never = true;
void _canonIsThirteen;

type MissingTitle = Exclude<(typeof ACADEMY_CANON_SKU_SLUGS)[number], AcademyCourseTitleSlug>;
type ExtraTitle = Exclude<AcademyCourseTitleSlug, (typeof ACADEMY_CANON_SKU_SLUGS)[number]>;
type _TitlesMatchCanon = [MissingTitle] extends [never]
  ? [ExtraTitle] extends [never]
    ? true
    : ExtraTitle
  : MissingTitle;
const _titlesMatchCanon: _TitlesMatchCanon = true;
void _titlesMatchCanon;

/**
 * Matrix kilidi sonrası ayrı onboarding SKU yoktur.
 * Visa / sınav özel yolu kapalıdır; null gönderilir.
 */
export const ACADEMY_ONBOARDING_COURSE_SLUG: AcademyCourseTitleSlug | null = null;

export function academyCourseTitleBySlug(slug: string): string | undefined {
  return ACADEMY_COURSE_TITLES[slug as AcademyCourseTitleSlug];
}

/** Kanon başlık, yoksa vitrin eki (`01_office_ai_ileri`). */
export function academyStorefrontTitleBySlug(slug: string): string | undefined {
  return (
    academyCourseTitleBySlug(slug) ??
    ACADEMY_STOREFRONT_EXTRA_TITLES[slug as AcademyStorefrontExtraSlug]
  );
}

export function academySlugFromCourseTitle(title: string): AcademyCourseTitleSlug | null {
  const trimmed = title.trim();
  for (const [slug, courseTitle] of Object.entries(ACADEMY_COURSE_TITLES)) {
    if (courseTitle === trimmed) {
      return slug as AcademyCourseTitleSlug;
    }
  }
  return null;
}

export function isAcademyCanonSkuSlug(slug: string): slug is AcademyCourseTitleSlug {
  return Object.prototype.hasOwnProperty.call(ACADEMY_COURSE_TITLES, slug);
}
