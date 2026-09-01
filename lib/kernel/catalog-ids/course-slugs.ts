/**
 * Yayın SKU kimliği — vize damgası başlık eşlemesi.
 * Vitrin metni akademi odasında çoğaltılmaz; bu sicil SSOT’tur.
 */

export const ACADEMY_COURSE_TITLES = {
  "security-temel": "Siber Güvenlik Temelleri, Ağ Güvenliği ve AÇS (OWASP)",
  "security-orta": "Uygulamalı Sızma Testi, Ağ Analizi ve Web Zafiyet Mimarisi",
  "security-ileri": "İleri Düzey DevSecOps, Bulut Güvenliği ve Olay Müdahalesi (Incident Response)",
  "ai-agent-temel": "AI Agent Mimarlığı ve Otonom Sistemlere Giriş",
  "ai-agent-orta": "Çoklu AI Agent Sistemleri ve RAG Mimarisi",
  "ai-agent-ileri": "İleri Düzey AI Agent Mimarisi, LangGraph ve Otonom Sistem Güvenliği",
  "python-temel": "Python ile Programlama ve Problem Çözme",
  "python-orta": "Python ile Nesne Yönelimli Programlama ve Veri İşleme",
  "python-ileri": "Python ile İleri Düzey Mimari, Asenkron Programlama ve Performans",
  "fullstack-temel": "Modern Web Geliştirme Temelleri (HTML, CSS, JavaScript ve TypeScript)",
  "fullstack-orta": "React, Node.js ve PostgreSQL ile Modern Uygulama Geliştirme",
  "fullstack-ileri": "İleri Düzey Full-Stack Mimari: Next.js App Router, Microservices, Docker ve CI/CD",
  "ai-temel": "Yapay Zekâ ve Veri Analizi (Prompt ve Veri Bilimi)",
  "ux-temel": "Dijital Ürün Tasarımı (UI/UX ve Figma Masterclass)",
  "excel-masterclass": "Sıfırdan Uygulamalı Excel ve Yapay Zekâ Destekli Veri Analizi Masterclass",
  "google-ads-masterclass": "A’dan Z’ye Google Ads ve Arama Motoru Pazarlaması Masterclass",
  "meta-ads-masterclass": "Meta Business Suite ile Instagram ve Facebook Reklamcılığı Masterclass",
  "eticaret-masterclass": "Sıfırdan E-Ticaret ve Pazar Yeri Yönetimi Masterclass",
  "canva-masterclass": "Canva ve Yapay Zekâ İle Dijital Tasarım Masterclass",
  "linkedin-masterclass": "LinkedIn İle Profesyonel Marka İnşası ve B2B Müşteri Bulma Masterclass",
} as const;

export type AcademyCourseTitleSlug = keyof typeof ACADEMY_COURSE_TITLES;

/**
 * Matrix kilidi sonrası ayrı onboarding SKU yoktur.
 * Visa / sınav özel yolu kapalıdır; null gönderilir.
 */
export const ACADEMY_ONBOARDING_COURSE_SLUG: AcademyCourseTitleSlug | null = null;

export function academyCourseTitleBySlug(slug: string): string | undefined {
  return ACADEMY_COURSE_TITLES[slug as AcademyCourseTitleSlug];
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
