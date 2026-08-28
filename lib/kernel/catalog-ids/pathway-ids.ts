/**
 * Müfredat kimliği — Modüler Monolit çekirdek sözleşmesi.
 * Kariyer ve freelancer lib/academy import etmez; yalnız bu sicili konuşur.
 * Pedagoji özeti / oynatıcı görünümü akademi odasındadır.
 */

export const ACADEMY_PATHWAY_IDS = [
  "python-yazilim-veri",
  "yz-muhendislik-agent",
  "fullstack-web-api",
  "veri-bilimi-ml-dl",
  "bulut-devops-guvenlik",
  "mobil-flutter-crossplatform",
  "siber-guvenlik-pentest",
  "veritabani-buyuk-veri",
  "yazilim-mimarisi-ddd",
  "teknik-urun-yonetimi-agile",
  "uiux-tasarim-sistemleri",
  "web3-blokzincir-solidity",
  "is-uretkenligi-veri",
  "dijital-pazarlama",
  "icerik-e-ticaret",
  "kisisel-gelisim",
  "bulut-mimarisi",
  "veri-muhendisligi",
  "kalite-muhendisligi",
  "kurumsal-java",
  "capraz-mobil",
  "oyun-gelistirme",
  "mlops-llmops",
  "sistem-tasarimi-olcek",
  "pratik-beceriler-vatandas",
  "pratik-linkedin-vatandas",
  "pratik-cad-vatandas",
  "pratik-asistan-vatandas",
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

/** Vize / ilan tabelası — halka sırası (Temel → Orta → İleri). Pedagoji etiketı değildir. */
export type CatalogPathwayRings = {
  Temel: string;
  Orta?: string;
  İleri?: string;
};

export const ACADEMY_PATHWAY_TITLES = {
  "python-yazilim-veri": "Python ile Yazılım ve Veri Mühendisliği",
  "yz-muhendislik-agent": "Yapay Zekâ Mühendisliği ve AI Agent Geliştirme",
  "fullstack-web-api": "Full-Stack Web & API Geliştirme (React & Node.js)",
  "veri-bilimi-ml-dl": "Veri Bilimi, Makine Öğrenmesi ve Derin Öğrenme",
  "bulut-devops-guvenlik": "Bulut Mimarisi, DevOps ve Siber Güvenlik",
  "mobil-flutter-crossplatform": "Mobil Uygulama Geliştirme (Flutter & Cross-Platform)",
  "siber-guvenlik-pentest": "Siber Güvenlik ve Sızma Testi (Ethical Hacking)",
  "veritabani-buyuk-veri":
    "Veritabanı Mimarileri ve Büyük Veri Mühendisliği (Yapılandırılmış Sorgu Dili ve Yapılandırılmış Olmayan)",
  "yazilim-mimarisi-ddd": "Yazılım Mimarisi ve Tasarım Kalıpları (Software Architecture & DDD)",
  "teknik-urun-yonetimi-agile": "Teknik Ürün Yönetimi, Çevik Metodolojiler ve İş Analizi",
  "uiux-tasarim-sistemleri": "UI/UX Tasarım ve Tasarım Sistemleri (Figma to Code)",
  "web3-blokzincir-solidity": "Blokzincir, Akıllı Sözleşmeler ve Web3 Mühendisliği",
  "is-uretkenligi-veri": "İş Üretkenliği, Excel, Power BI ve Veri Otomasyonu",
  "dijital-pazarlama": "Dijital Pazarlama, Reklam ve Growth",
  "icerik-e-ticaret": "İçerik Üretimi, Video ve E-Ticaret Operasyonu",
  "kisisel-gelisim": "Kişisel Gelişim, İletişim ve Zaman Yönetimi",
  "bulut-mimarisi": "Bulut Mimarisi (Amazon Web Servisleri, Kubernetes, Terraform)",
  "veri-muhendisligi": "Veri Mühendisliği (Hat, Orkestrasyon, Madalya)",
  "kalite-muhendisligi": "Kalite Mühendisliği ve Test Otomasyonu",
  "kurumsal-java": "Kurumsal Java ve Spring Boot",
  "capraz-mobil": "Çapraz Mobil Uygulama Geliştirme (React Native)",
  "oyun-gelistirme": "Unity ile Oyun Geliştirme",
  "mlops-llmops": "Yapay Zekâ Model Operasyonları ve Büyük Dil Modeli Operasyonları",
  "sistem-tasarimi-olcek": "Sistem Tasarımı ve Yüksek Debili Dağıtık Sistemler",
  "pratik-beceriler-vatandas": "Canva ile Pratik Tasarım ve Sosyal Medya",
  "pratik-linkedin-vatandas": "LinkedIn ve Dijital Profil Yönetimi",
  "pratik-cad-vatandas": "AutoCAD ile Temel Çizim ve Plan Okuma",
  "pratik-asistan-vatandas": "Günlük İşler İçin Yapay Zekâ Asistanlığı",
} as const satisfies Record<AcademyPathwayId, string>;

export const ACADEMY_PATHWAY_RINGS: Record<AcademyPathwayId, CatalogPathwayRings> = {
  "python-yazilim-veri": { Temel: "python-temel" },
  "yz-muhendislik-agent": { Temel: "ai-temel", Orta: "ai-orta", İleri: "ai-ileri" },
  "fullstack-web-api": {
    Temel: "fullstack-temel",
    Orta: "fullstack-orta",
    İleri: "fullstack-ileri",
  },
  "veri-bilimi-ml-dl": { Temel: "ds-temel", Orta: "ds-orta", İleri: "ds-ileri" },
  "bulut-devops-guvenlik": { Temel: "devops-temel", Orta: "devops-orta", İleri: "devops-ileri" },
  "mobil-flutter-crossplatform": {
    Temel: "flutter-temel",
    Orta: "flutter-orta",
    İleri: "flutter-ileri",
  },
  "siber-guvenlik-pentest": { Temel: "sec-temel", Orta: "sec-orta", İleri: "sec-ileri" },
  "veritabani-buyuk-veri": { Temel: "db-temel", Orta: "db-orta", İleri: "db-ileri" },
  "yazilim-mimarisi-ddd": { Temel: "arch-temel", Orta: "arch-orta", İleri: "arch-ileri" },
  "teknik-urun-yonetimi-agile": { Temel: "pm-temel", Orta: "pm-orta", İleri: "pm-ileri" },
  "uiux-tasarim-sistemleri": { Temel: "ux-temel", Orta: "ux-orta", İleri: "ux-ileri" },
  "web3-blokzincir-solidity": { Temel: "w3-temel", Orta: "w3-orta", İleri: "w3-ileri" },
  "is-uretkenligi-veri": { Temel: "ex-temel", Orta: "ex-orta", İleri: "ex-ileri" },
  "dijital-pazarlama": { Temel: "mkt-temel", Orta: "mkt-orta", İleri: "mkt-ileri" },
  "icerik-e-ticaret": { Temel: "mnt-temel", Orta: "mnt-orta", İleri: "mnt-ileri" },
  "kisisel-gelisim": { Temel: "pd-temel", Orta: "pd-orta", İleri: "pd-ileri" },
  "bulut-mimarisi": { Temel: "cld-temel", Orta: "cld-orta", İleri: "cld-ileri" },
  "veri-muhendisligi": { Temel: "eng-temel", Orta: "eng-orta", İleri: "eng-ileri" },
  "kalite-muhendisligi": { Temel: "qa-temel", Orta: "qa-orta", İleri: "qa-ileri" },
  "kurumsal-java": { Temel: "jav-temel", Orta: "jav-orta", İleri: "jav-ileri" },
  "capraz-mobil": { Temel: "rn-temel", Orta: "rn-orta", İleri: "rn-ileri" },
  "oyun-gelistirme": { Temel: "gam-temel", Orta: "gam-orta", İleri: "gam-ileri" },
  "mlops-llmops": { Temel: "mlo-temel" },
  "sistem-tasarimi-olcek": { Temel: "sys-temel" },
  "pratik-beceriler-vatandas": { Temel: "canva-temel" },
  "pratik-linkedin-vatandas": { Temel: "linkedin-temel" },
  "pratik-cad-vatandas": { Temel: "cad-temel" },
  "pratik-asistan-vatandas": { Temel: "pra-temel" },
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
