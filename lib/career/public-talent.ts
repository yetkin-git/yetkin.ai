import { CANONICAL_SITE_ORIGIN } from "@/lib/copy/seo";
import type { CareerPortfolioItemRecord } from "@/lib/career/types";
import type { LiveCareerStamp } from "@/lib/career/live";
import type { PassportStampSourceKind } from "@/lib/kernel/passport/types";

/** Kanonik kamu yetkinlik kartı — damga id'si; User satırı şişmez. */
export const PUBLIC_TALENT_PATH = "/vize" as const;
/** Kısa alias — `/p/[id]` 301 ile kanonik karta iner. */
export const PUBLIC_TALENT_ALIAS_PATH = "/p" as const;

const PUBLIC_TALENT_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

export type PublicTalentSeal = {
  id: string;
  title: string;
  sourceKind: PassportStampSourceKind;
  issuedAt: Date;
  certificateHash: string | null;
  courseSlug: string | null;
};

export type PublicTalentProof = {
  title: string;
  visaStampId: string;
};

export type PublicTalentCard = {
  featured: PublicTalentSeal;
  seals: PublicTalentSeal[];
  proofs: PublicTalentProof[];
};

export type PublicTalentResolution =
  | { status: "invalid-format" }
  | { status: "missing" }
  | { status: "found"; card: PublicTalentCard };

export function parsePublicTalentId(raw: string | null | undefined): string | null {
  const id = raw?.trim() ?? "";
  if (!PUBLIC_TALENT_ID_PATTERN.test(id)) {
    return null;
  }
  return id;
}

export function publicTalentPath(id: string): string {
  return `${PUBLIC_TALENT_PATH}/${id}`;
}

export function publicTalentAliasPath(id: string): string {
  return `${PUBLIC_TALENT_ALIAS_PATH}/${id}`;
}

export function publicTalentAbsoluteUrl(id: string, origin?: string): string {
  const base =
    origin?.trim().replace(/\/$/u, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/u, "") ||
    CANONICAL_SITE_ORIGIN;
  return `${base}${publicTalentPath(id)}`;
}

export function toPublicTalentSeal(
  stamp: Pick<
    LiveCareerStamp,
    "id" | "title" | "sourceKind" | "issuedAt" | "certificateHash" | "courseSlug"
  >,
): PublicTalentSeal {
  return {
    id: stamp.id,
    title: stamp.title,
    sourceKind: stamp.sourceKind,
    issuedAt: stamp.issuedAt,
    certificateHash: stamp.certificateHash,
    courseSlug: stamp.courseSlug ?? null,
  };
}

/**
 * İşveren kartı — userId, e-posta, sözleşme sourceId sızmaz.
 * Yalnız canlı mühür ve damgaya bağlı portföy başlığı.
 */
export function toPublicTalentCard(
  featured: LiveCareerStamp,
  live: readonly LiveCareerStamp[],
  portfolio: readonly Pick<CareerPortfolioItemRecord, "title" | "visaStampId">[],
): PublicTalentCard {
  const liveIds = new Set(live.map((stamp) => stamp.id));
  const seals = live.map(toPublicTalentSeal);
  const featuredSeal = seals.find((seal) => seal.id === featured.id) ?? toPublicTalentSeal(featured);
  return {
    featured: featuredSeal,
    seals,
    proofs: portfolio
      .filter((item) => liveIds.has(item.visaStampId))
      .map((item) => ({ title: item.title, visaStampId: item.visaStampId })),
  };
}

export function publicTalentCardHasIdentityLeak(value: unknown): boolean {
  const raw = JSON.stringify(value);
  return /userId|"email"|sourceId/i.test(raw);
}
