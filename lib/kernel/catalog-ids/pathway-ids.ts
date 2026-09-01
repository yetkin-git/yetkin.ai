/**
 * Müfredat kimliği — Modüler Monolit çekirdek sözleşmesi.
 * Yalnız canlı SKU halkaları. Kariyer ve freelancer lib/academy import etmez.
 */

export const ACADEMY_PATHWAY_IDS = [
  "python-yazilim-veri",
  "ai-agent-mimarligi",
  "yz-muhendislik-agent",
  "fullstack-web-api",
  "siber-guvenlik-pentest",
  "uiux-tasarim-sistemleri",
  "is-uretkenligi-veri",
  "dijital-pazarlama",
  "icerik-e-ticaret",
  "pratik-beceriler-vatandas",
  "pratik-linkedin-vatandas",
] as const;

export type AcademyPathwayId = (typeof ACADEMY_PATHWAY_IDS)[number];

const PATHWAY_ID_SET = new Set<string>(ACADEMY_PATHWAY_IDS);

export function isAcademyPathwayId(value: string): value is AcademyPathwayId {
  return PATHWAY_ID_SET.has(value);
}

export function parseAcademyPathwayId(value: string | null | undefined): AcademyPathwayId | null {
  if (!value) {
    return null;
  }
  return isAcademyPathwayId(value) ? value : null;
}

/** Vize / ilan tabelası — halka sırası (Temel → Orta → İleri). Pedagoji etiketi değildir. */
export type CatalogPathwayRings = {
  Temel: string;
  Orta?: string;
  İleri?: string;
};

export const ACADEMY_PATHWAY_TITLES = {
  "python-yazilim-veri": "Python ile Yazılım ve Veri Mühendisliği",
  "ai-agent-mimarligi": "AI Agent Mimarlığı",
  "yz-muhendislik-agent": "Yapay Zekâ Mühendisliği ve AI Agent Geliştirme",
  "fullstack-web-api": "Full-Stack Web Geliştirme",
  "siber-guvenlik-pentest": "Siber Güvenlik ve Sızma Testi (Ethical Hacking)",
  "uiux-tasarim-sistemleri": "UI/UX Tasarım ve Tasarım Sistemleri (Figma to Code)",
  "is-uretkenligi-veri": "İş Üretkenliği, Excel, Power BI ve Veri Otomasyonu",
  "dijital-pazarlama": "Dijital Pazarlama, Reklam ve Growth",
  "icerik-e-ticaret": "İçerik Üretimi, Video ve E-Ticaret Operasyonu",
  "pratik-beceriler-vatandas": "Canva ile Pratik Tasarım ve Sosyal Medya",
  "pratik-linkedin-vatandas": "LinkedIn ve Dijital Profil Yönetimi",
} as const satisfies Record<AcademyPathwayId, string>;

export const ACADEMY_PATHWAY_RINGS: Record<AcademyPathwayId, CatalogPathwayRings> = {
  "python-yazilim-veri": { Temel: "python-temel", Orta: "python-orta", İleri: "python-ileri" },
  "ai-agent-mimarligi": { Temel: "ai-agent-temel", Orta: "ai-agent-orta", İleri: "ai-agent-ileri" },
  "yz-muhendislik-agent": { Temel: "ai-temel" },
  "fullstack-web-api": {
    Temel: "fullstack-temel",
    Orta: "fullstack-orta",
    İleri: "fullstack-ileri",
  },
  "siber-guvenlik-pentest": {
    Temel: "security-temel",
    Orta: "security-orta",
    İleri: "security-ileri",
  },
  "uiux-tasarim-sistemleri": { Temel: "ux-temel" },
  "is-uretkenligi-veri": { Temel: "excel-masterclass" },
  "dijital-pazarlama": { Temel: "google-ads-masterclass", Orta: "meta-ads-masterclass" },
  "icerik-e-ticaret": { Temel: "eticaret-masterclass" },
  "pratik-beceriler-vatandas": { Temel: "canva-masterclass" },
  "pratik-linkedin-vatandas": { Temel: "linkedin-masterclass" },
};

export function catalogPathwayTitleById(id: string): string | null {
  if (!isAcademyPathwayId(id)) {
    return null;
  }
  return ACADEMY_PATHWAY_TITLES[id];
}

export function catalogPathwayRingSlugs(pathwayId: AcademyPathwayId): string[] {
  const rings = ACADEMY_PATHWAY_RINGS[pathwayId];
  const slugs: string[] = [rings.Temel];
  if (rings.Orta) {
    slugs.push(rings.Orta);
  }
  if (rings.İleri) {
    slugs.push(rings.İleri);
  }
  return slugs;
}
