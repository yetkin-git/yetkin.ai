/**
 * Seviye Yol Haritası — disiplinin yaygın Temel → Orta → İleri halkaları (zorunlu değildir).
 * Tekil Masterclass veya serbest etiketli SKU pathway’siz olabilir.
 * Client-safe: sınav şıkları, node:crypto ve Prisma yok.
 */

import {
  ACADEMY_COURSE_LEVELS,
  academyCourseLevelBySlug,
  type AcademyCourseLevel,
} from "@/lib/academy/course-level";
import { academyCourseTitleBySlug } from "@/lib/academy/course-titles";
import { curriculumLessonCountForSlug } from "@/lib/academy/curricula/lesson-index";
import { ACADEMY_PROOF_OF_WORK_HASH_PATTERN } from "@/lib/academy/proof-of-work";
import {
  ACADEMY_PATHWAY_IDS,
  ACADEMY_PATHWAY_RINGS,
  ACADEMY_PATHWAY_TITLES,
  type AcademyPathwayId,
} from "@/lib/kernel/catalog-ids";
import { formatMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";

export { ACADEMY_PATHWAY_IDS, type AcademyPathwayId };

export const ACADEMY_PATHWAY_MASTERY_VERSION = "yetkin-rail.academy.pathway-mastery.v1" as const;

export type AcademyPathwayDefinition = {
  id: AcademyPathwayId;
  title: string;
  summary: string;
  /**
   * Yaygın 3 halkalı yol — anayasal zorunluluk değildir.
   * Tekil Masterclass pathway’siz SKU olabilir; bu sicil yalnız çoklu halka dikeyler içindir.
   * Temel halka şarttır; Orta / İleri henüz tohumlanmamış dikeyde boş kalabilir.
   */
  rings: {
    Temel: string;
    Orta?: string;
    İleri?: string;
  };
};

const ACADEMY_PATHWAY_SUMMARIES = {
  "python-yazilim-veri":
    "Piyasa dikeyi: sıfırdan Python → Pandas ve Yapılandırılmış Sorgu Dili veri boru hattı → FastAPI, doğrulama, Docker ve eşzamansız bekleyiş.",
  "yz-muhendislik-agent":
    "Piyasa dikeyi: prompt & structured output → RAG/vektör DB → otonom agent ve multi-agent sistemler.",
  "fullstack-web-api":
    "Piyasa dikeyi: modern web mimarisi → React & Node.js full-stack → Node/Express/PostgreSQL prod REST API.",
  "veri-bilimi-ml-dl":
    "Piyasa dikeyi: NumPy/Pandas EDA → Scikit-Learn ML ve metrikler → PyTorch sinir ağları ve model yaygınlaştırma.",
  "bulut-devops-guvenlik":
    "Piyasa dikeyi: bulut ve Linux temelleri → konteyner, Sürekli Entegrasyon ve Sürekli Teslimat → Geliştirme-Güvenlik-İşletme, bilgi güvenliği ve Kişisel Verilerin Korunması Kanunu uyumlu mimari.",
  "mobil-flutter-crossplatform":
    "Piyasa dikeyi: Dart ve bileşen temelleri → durum yönetimi, Temsili Durum Transferi ve yerel veri → yerel platform köprüsü, Sürekli Entegrasyon ve Sürekli Teslimat ile mağaza dağıtımı.",
  "siber-guvenlik-pentest":
    "Piyasa dikeyi: ağ/Linux/keşif temelleri → OWASP web zafiyet analizi → tersine mühendislik, exploit disiplini ve ağ sızma simülasyonu.",
  "veritabani-buyuk-veri":
    "Piyasa dikeyi: ilişkisel Yapılandırılmış Sorgu Dili / modelleme → PostgreSQL performans ve sorgu ayarı → Redis, MongoDB, Apache Kafka ile olay güdümlü büyük veri.",
  "yazilim-mimarisi-ddd":
    "Piyasa dikeyi: OOP/SOLID/Clean Code → GoF kalıpları ve OO mimari → microservices, DDD ve event-driven sistemler.",
  "teknik-urun-yonetimi-agile":
    "Piyasa dikeyi: gereksinim toplama / kullanıcı hikayesi → çevik çerçeveler, Scrum / Kanban ve JIRA iş takip panosu → ürün analitiği, Hedefler ve Anahtar Sonuçlar / Temel Performans Göstergeleri ve ikili karşılaştırma testi.",
  "uiux-tasarim-sistemleri":
    "Piyasa dikeyi: Kullanıcı Deneyimi araştırması ve tel çerçeve → Tasarım Sistemi ve prototip → Figma’dan React / Tailwind el teslimi ve kullanılabilirlik testi.",
  "web3-blokzincir-solidity":
    "Piyasa dikeyi: blokzincir / kriptografi ve Solidity → Ethereum Yorum Talebi Standartları ve sözleşme güvenliği → Dağıtık Uygulama, Ethers.js / Web3.js ve Centralize Olmayan Finans / Merkeziyetsiz Finans mimarileri.",
  "is-uretkenligi-veri":
    "Piyasa dikeyi: ileri Excel analiz → Power BI gösterge panosu ve Veri Çözümleme İfadeleri → Google E-Tablolar / Uygulama Senaryosu otomasyon.",
  "dijital-pazarlama":
    "Piyasa dikeyi: Meta Ads performans → Google Ads arama/display → SEO, içerik ve growth döngüleri.",
  "icerik-e-ticaret":
    "Piyasa dikeyi: YouTube kanal büyümesi → kısa dikey video prodüksiyon → e-ticaret, doğrudan sevkiyat ve birim ekonomi.",
  "kisisel-gelisim":
    "Piyasa dikeyi: ikna ve sunum → duygusal zekâ ve liderlik iletişimi → etik NLP ve zaman yönetimi sistemleri.",
  "bulut-mimarisi":
    "Piyasa dikeyi: hesap ve fatura disiplini → yük dengeleyici, ölçek, yönetilen kasa ve sunucusuz mantık → Kubernetes, Kod Olarak Altyapı / Terraform ve GitOps üretim bandı.",
  "veri-muhendisligi":
    "Piyasa dikeyi: Ayıkla-Dönüştür-Yükle / Ayıkla-Yükle-Dönüştür, Veri Gölü, Veri Ambarı, boyut modelleme ve Veri Dönüştürme Aracı → Hava Akışı orkestrasyonu, veri kalitesi ve Hizmet Seviyesi Anlaşması → Madalya mimarisi, Kıvılcım Veri İşleme Motoru ve soğuk depo maliyeti.",
  "kalite-muhendisligi":
    "Piyasa dikeyi: damga, terazi, reçete ve tutanak → robotik uçtan uca, kararsız test yasağı ve kırmızı kalite kapısı → sözleşme testi, baraj basıncı ve yüzde doksan beş bütçe.",
  "kurumsal-java":
    "Piyasa dikeyi: Java Sanal Makinesi, Nesne Yönelimli Programlama ve derleme damgası → Spring Boot kapısı, Temsili Durum Transferi ve şema dışı paket yasağı → Outbox, sır kasası ve merkezi izleme kulesi.",
  "capraz-mobil":
    "Piyasa dikeyi: çapraz platform pasaportu, vitrin dizilimi ve kaydırma bandı → çevrimdışı emanet kasası, sahte yeşil yasağı ve şifreli yerel depo → yerel köprü tercümanı, mağaza onay gişesi ve red metni tutanağı.",
  "oyun-gelistirme":
    "Piyasa dikeyi: tiyatro sahnesi, kukla ipleri ve tek sahneli oynanır prototip → jeton otomatı, montaj hattı ve paketleme kutusu → canlı dekor değişimi, dürüst bilet gişesi ve kumar yasağı tutanağı.",
  "mlops-llmops":
    "Piyasa dikeyi: fırın parti defteri, reçete kağıdı ve Model Sicili damgası — Yapay Zekâ yüz üç mezununa üretim takibi köprüsü; Orta / İleri halkaları henüz tohumlanmamıştır.",
  "sistem-tasarimi-olcek":
    "Piyasa dikeyi: kavşak lambası, büfe vitrini ve mahalle PTT şubesi — Mimari yüz üç ve Full-Stack yüz üç mezununa ölçek laboratuvarı köprüsü; Orta / İleri halkaları henüz tohumlanmamıştır.",
  "pratik-beceriler-vatandas":
    "Vatandaş menüsü — vitrin: şablon, çekmece, vesikalık ölçü ve bakkal panosu. İsimlik veya plan şart değildir.",
  "pratik-linkedin-vatandas":
    "Vatandaş menüsü — isimlik: kapı tabelası, vesikalık, bakkal camı ve ev tanıtımı. İş vaadi yoktur.",
  "pratik-cad-vatandas":
    "Vatandaş menüsü — plan: kuşbakışı ev haritası, çekmece, bakkal işaretleri ve matbaa kopya. Meslek diploması yoktur.",
  "pratik-asistan-vatandas":
    "Vatandaş menüsü — yazıcı komşu: komşu gibi sor, vesikalık sırrı caddeye asma, matbaa prova oku — tarif mühendisliği değildir.",
} as const satisfies Record<AcademyPathwayId, string>;

export const ACADEMY_LEVEL_PATHWAYS: readonly AcademyPathwayDefinition[] = ACADEMY_PATHWAY_IDS.map(
  (id) => ({
    id,
    title: ACADEMY_PATHWAY_TITLES[id],
    summary: ACADEMY_PATHWAY_SUMMARIES[id],
    rings: { ...ACADEMY_PATHWAY_RINGS[id] },
  }),
);

export type AcademyPathwayRingView = {
  level: AcademyCourseLevel;
  slug: string;
  title: string;
  summary: string;
  href: string;
  completed: boolean;
  highlighted: boolean;
  purchasable: boolean;
  lessonCount: number;
  priceLabel: string | null;
  owned: boolean;
};

export type AcademyPathwayView = {
  id: AcademyPathwayId;
  title: string;
  summary: string;
  rings: AcademyPathwayRingView[];
  mastered: boolean;
  masteryHash: string | null;
};

export type AcademyPathwayMasteryView = {
  pathwayId: AcademyPathwayId;
  pathwayTitle: string;
  masteryHash: string;
  rings: readonly { level: AcademyCourseLevel; slug: string; title: string }[];
};

export type AcademyProgressionBridgeView = {
  nextSlug: string | null;
  nextTitle: string | null;
  nextHref: string | null;
  pathwayId: AcademyPathwayId | null;
  pathwayTitle: string | null;
  mastered: boolean;
};

export function academyPathwayById(id: string): AcademyPathwayDefinition | null {
  return ACADEMY_LEVEL_PATHWAYS.find((row) => row.id === id) ?? null;
}

export function academyPathwayBySlug(slug: string): AcademyPathwayDefinition | null {
  return (
    ACADEMY_LEVEL_PATHWAYS.find((pathway) =>
      ACADEMY_COURSE_LEVELS.some((level) => pathway.rings[level] === slug),
    ) ?? null
  );
}

export function academyPathwayRingSlugs(pathway: AcademyPathwayDefinition): string[] {
  return ACADEMY_COURSE_LEVELS.filter((level) => Boolean(pathway.rings[level])).map(
    (level) => pathway.rings[level]!,
  );
}

export function academyPathwayNextSlug(slug: string): string | null {
  const pathway = academyPathwayBySlug(slug);
  const level = academyCourseLevelBySlug(slug);
  if (!pathway || !level) {
    return null;
  }
  if (level === "Temel") {
    return pathway.rings.Orta ?? null;
  }
  if (level === "Orta") {
    return pathway.rings.İleri ?? null;
  }
  return null;
}

export function academyProgressionHref(nextSlug: string, nextOwned: boolean): string {
  return nextOwned ? `/academy/${nextSlug}/oyna` : `/academy/${nextSlug}`;
}

export function academyCompletedSlugsFromCertificates(
  certificates: readonly { courseId: string; revokedAt: Date | null }[],
  courses: readonly { id: string; slug: string }[],
): Set<string> {
  const idToSlug = new Map(courses.map((course) => [course.id, course.slug]));
  const slugs = new Set<string>();
  for (const certificate of certificates) {
    if (certificate.revokedAt) {
      continue;
    }
    const slug = idToSlug.get(certificate.courseId);
    if (slug) {
      slugs.add(slug);
    }
  }
  return slugs;
}

export function academyPathwayIsMastered(
  pathway: AcademyPathwayDefinition,
  completedSlugs: ReadonlySet<string>,
): boolean {
  return academyPathwayRingSlugs(pathway).every((slug) => completedSlugs.has(slug));
}

export function academyPathwayCatalogSlugs(): Set<string> {
  return new Set(ACADEMY_LEVEL_PATHWAYS.flatMap((pathway) => academyPathwayRingSlugs(pathway)));
}

export function academyPathwayMasteryCanonicalJson(input: {
  pathwayId: AcademyPathwayId;
  rings: readonly { level: AcademyCourseLevel; slug: string; proofOfWorkHash: string }[];
}): string {
  return JSON.stringify({
    v: ACADEMY_PATHWAY_MASTERY_VERSION,
    pathwayId: input.pathwayId,
    rings: input.rings.map((ring) => ({
      level: ring.level,
      slug: ring.slug,
      proofOfWorkHash: ring.proofOfWorkHash,
    })),
  });
}

export function academyPathwayMasteryHash(
  canonicalJson: string,
  digest: (value: string) => string,
): string {
  const hash = digest(canonicalJson).trim().toLowerCase();
  if (!ACADEMY_PROOF_OF_WORK_HASH_PATTERN.test(hash)) {
    throw new Error("Yol haritası mührü SHA-256 değil.");
  }
  return hash;
}

export function canonicalAcademyPathwayMasteryHash(
  pathway: AcademyPathwayDefinition,
  proofHashBySlug: Readonly<Record<string, string | null | undefined>>,
  digest: (value: string) => string,
): string | null {
  const rings: { level: AcademyCourseLevel; slug: string; proofOfWorkHash: string }[] = [];
  for (const level of ACADEMY_COURSE_LEVELS) {
    const slug = pathway.rings[level];
    if (!slug) {
      continue;
    }
    const proofOfWorkHash = proofHashBySlug[slug];
    if (!proofOfWorkHash || !ACADEMY_PROOF_OF_WORK_HASH_PATTERN.test(proofOfWorkHash)) {
      return null;
    }
    rings.push({ level, slug, proofOfWorkHash });
  }
  if (rings.length === 0) {
    return null;
  }
  return academyPathwayMasteryHash(
    academyPathwayMasteryCanonicalJson({ pathwayId: pathway.id, rings }),
    digest,
  );
}

export function academyProgressionBridgeView(input: {
  currentSlug: string;
  completedSlugs: ReadonlySet<string>;
  nextOwned: boolean;
}): AcademyProgressionBridgeView {
  const pathway = academyPathwayBySlug(input.currentSlug);
  if (!pathway) {
    return {
      nextSlug: null,
      nextTitle: null,
      nextHref: null,
      pathwayId: null,
      pathwayTitle: null,
      mastered: false,
    };
  }
  const nextSlug = academyPathwayNextSlug(input.currentSlug);
  const mastered = academyPathwayIsMastered(pathway, input.completedSlugs);
  return {
    nextSlug,
    nextTitle: nextSlug ? (academyCourseTitleBySlug(nextSlug) ?? null) : null,
    nextHref: nextSlug ? academyProgressionHref(nextSlug, input.nextOwned) : null,
    pathwayId: pathway.id,
    pathwayTitle: pathway.title,
    mastered,
  };
}

export function buildAcademyPathwayCatalog(input: {
  courses: readonly {
    slug: string;
    title: string;
    summary: string;
    purchasable: boolean;
    priceMinor?: number | null;
    currencyCode?: string;
  }[];
  completedSlugs: ReadonlySet<string>;
  masteryHashByPathway?: Readonly<Record<string, string | null | undefined>>;
  highlightLevel: AcademyCourseLevel | null;
  ownedSlugs?: ReadonlySet<string>;
}): AcademyPathwayView[] {
  const bySlug = new Map(input.courses.map((course) => [course.slug, course]));
  return ACADEMY_LEVEL_PATHWAYS.map((pathway) => {
    const rings = ACADEMY_COURSE_LEVELS.flatMap((level) => {
      const slug = pathway.rings[level];
      if (!slug) {
        return [];
      }
      const course = bySlug.get(slug);
      const completed = input.completedSlugs.has(slug);
      const owned = input.ownedSlugs?.has(slug) ?? false;
      const priceMinor = course && "priceMinor" in course ? course.priceMinor : null;
      const currency =
        course && "currencyCode" in course && typeof course.currencyCode === "string"
          ? course.currencyCode
          : SETTLEMENT_CURRENCY;
      return [
        {
          level,
          slug,
          title: course?.title ?? academyCourseTitleBySlug(slug) ?? slug,
          summary: course?.summary ?? "",
          href: owned && !completed ? `/academy/${slug}/oyna` : `/academy/${slug}`,
          completed,
          highlighted: input.highlightLevel === level,
          purchasable: course?.purchasable ?? false,
          lessonCount: curriculumLessonCountForSlug(slug),
          priceLabel:
            typeof priceMinor === "number" && priceMinor > 0
              ? formatMinor(priceMinor, (currency as CurrencyCode) ?? SETTLEMENT_CURRENCY)
              : null,
          owned,
        } satisfies AcademyPathwayRingView,
      ];
    });
    const mastered = academyPathwayIsMastered(pathway, input.completedSlugs);
    return {
      id: pathway.id,
      title: pathway.title,
      summary: pathway.summary,
      rings,
      mastered,
      masteryHash: mastered ? (input.masteryHashByPathway?.[pathway.id] ?? null) : null,
    };
  });
}
