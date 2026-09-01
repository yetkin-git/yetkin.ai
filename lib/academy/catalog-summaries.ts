/**
 * Vitrin kart özeti — client-safe SSOT.
 * `catalog-seed` tohum satırını, `CourseCard` ön yüzü aynı sicilden basar.
 * Sınav şıkkı / Prisma / node:crypto yok.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

/** Kart özeti yalnız ne öğretildiğini anlatır; bölüm sayısı meta satırındadır. */
export const ACADEMY_PYTHON_TEME_SUMMARY =
  "Python ile programlamanın temelleri, kontrol akışları, fonksiyonlar ve veri yapıları.";

export const ACADEMY_PYTHON_ORTA_SUMMARY =
  "Nesne yönelimli Python: sınıf, miras, JSON, hata kapısı ve REST yanıtını dosyaya mühürleme.";

export const ACADEMY_PYTHON_ILERI_SUMMARY =
  "Decorator, üreteç, asyncio, iş parçacığı/süreç ve metaclass: bellek dostu asenkron işleme motoru.";

export const ACADEMY_CATALOG_SUMMARIES: Record<AcademyCourseTitleSlug, string> = {
  "security-temel":
    "CIA üçlüsü, TCP/IP ve port kapısı, OWASP web zafiyeti, hash/MFA ve güvenlik duvarı etiği; Fail-closed kapatma.",
  "security-orta":
    "Sızma testi metodolojisi, OSINT keşif, lab ağ envanteri, IDOR/SSRF, OAuth2/JWT ve SAST; Fail-closed kapatma.",
  "security-ileri":
    "DevSecOps boru hattı, bulut IAM/KMS, olay müdahalesi, SIEM/SOC ve Sıfır Güven; Fail-closed kapatma.",
  "ai-agent-temel":
    "Büyük Dil Modeli ile otonom ajan farkı, yapılandırılmış çıktı, araç çağrısı, hafıza ve ReAct döngüsü; hava ve not ajanı.",
  "ai-agent-orta":
    "RAG ve gömme, vektör sorgu, araştırmacı+yazar pası, ortak durum ve insan onay kapısı; çift ajanlı rapor ekibi.",
  "ai-agent-ileri":
    "Durum grafiği, yansıma onarımı, güvenlik korkuluğu, eval barajı ve kuyruk işçisi; üretim ajan odası.",
  "python-temel": ACADEMY_PYTHON_TEME_SUMMARY,
  "python-orta": ACADEMY_PYTHON_ORTA_SUMMARY,
  "python-ileri": ACADEMY_PYTHON_ILERI_SUMMARY,
  "fullstack-temel":
    "HTML, CSS, JavaScript ve TypeScript: HTTP/DNS fişi, semantik iskelet, DOM, fetch ve tip sözleşmesi.",
  "fullstack-orta":
    "React bileşen ve durum, Express REST, Prisma/PostgreSQL ve JWT ara katmanı; Fail-closed görev takip uygulaması.",
  "fullstack-ileri":
    "App Router ve RSC, mikroservis ve olay fişi, Redis önbelleği, Docker Compose sağlığı ve GitHub Actions CI/CD.",
  "ai-temel":
    "Prompt mühendisliği ve veri bilimi: tarif katmanları, yapılandırılmış çıktı, tablo temizliği ve kaynaklı cevap.",
  "ux-temel": "UI/UX ve Figma: araştırma, tel çerçeve, jeton, prototip ve teslim.",
  "excel-masterclass":
    "Hücre mimarisi, XLOOKUP, özet tablo, veri temizliği, Copilot/VBA disiplini ve satış dashboard’u; Fail-closed kapatma.",
  "google-ads-masterclass":
    "Hesap mimarisi, eşleme türü, arama/görüntülü ağ, GTM dönüşüm takibi, kalite puanı ve kampanya teslimi; Fail-closed kapatma.",
  "meta-ads-masterclass":
    "Business Suite, özel/benzer kitle, Reels/kreatif, piksel ve CAPI, CBO/ABO-ROAS ve satış hunisi; Fail-closed kapatma.",
  "eticaret-masterclass":
    "Pazar yeri mantığı, Trendyol/Hepsiburada mağaza, liste SEO, stok/fiyat senkronu ve kargo/iade; Fail-closed kapatma.",
  "canva-masterclass":
    "Marka kiti ve tipo, sosyal kare/Reels, sunum/broşür, Magic Studio disiplini ve baskı/dijital teslim; Fail-closed kapatma.",
  "linkedin-masterclass":
    "All-Star profil, algoritma içeriği, Sales Navigator ICP, cold outreach ve bireysel konum; Fail-closed kapatma.",
};

export function academyCatalogSummaryBySlug(slug: string): string | undefined {
  return ACADEMY_CATALOG_SUMMARIES[slug as AcademyCourseTitleSlug];
}
