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
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
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
    "Piyasa dikeyi: sıfırdan Python → nesne yönelimi, JSON ve Uygulama Programlama Arayüzü boru hattı → decorator, üreteç, asyncio, süreç seçimi ve metaclass motoru.",
  "ai-agent-mimarligi":
    "Piyasa dikeyi: Büyük Dil Modeli ile ajan farkı → RAG, vektör sorgu ve araştırmacı+yazar pası → durum grafiği, yansıma onarımı, korkuluk, eval ve üretim kuyruğu.",
  "yz-muhendislik-agent":
    "Piyasa dikeyi: prompt ve yapılandırılmış çıktı. Tekil Temel SKU; Orta / İleri halkası yayınlanmadı.",
  "fullstack-web-api":
    "Piyasa dikeyi: HTML/CSS/JS/TS temelleri → React, Express, Prisma ve JWT orta yığın → App Router, mikroservis, Redis, Docker ve CI/CD üretim mimarisi.",
  "siber-guvenlik-pentest":
    "Piyasa dikeyi: ağ/Linux/keşif temelleri → OWASP web zafiyet analizi → tersine mühendislik, exploit disiplini ve ağ sızma simülasyonu.",
  "uiux-tasarim-sistemleri":
    "Piyasa dikeyi: Kullanıcı Deneyimi araştırması ve tel çerçeve. Tekil Temel SKU.",
  "is-uretkenligi-veri":
    "Piyasa dikeyi: Excel ve yapay zekâ destekli veri analizi Masterclass.",
  "dijital-pazarlama":
    "Piyasa dikeyi: Google Ads ve Meta Ads Masterclass (katalog komşuları; pedagoji seviyesi değildir).",
  "icerik-e-ticaret":
    "Piyasa dikeyi: e-ticaret ve pazar yeri yönetimi Masterclass.",
  "pratik-beceriler-vatandas":
    "Vatandaş menüsü — Canva Masterclass.",
  "pratik-linkedin-vatandas":
    "Vatandaş menüsü — LinkedIn Masterclass. İş vaadi yoktur.",
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
            owned
              ? ACADEMY_SEN.course.accessOpen
              : typeof priceMinor === "number" && priceMinor > 0
                ? ACADEMY_SEN.catalog.priceVatInclusive(
                    formatMinor(priceMinor, (currency as CurrencyCode) ?? SETTLEMENT_CURRENCY),
                  )
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
