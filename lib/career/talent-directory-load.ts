import "server-only";

import { YETKINCV_ROLES, YETKINCV_VERTICALS } from "@/lib/career/yetkincv-options";
import {
  emptyTalentDirectory,
  parseTalentCity,
  parseTalentVertical,
  projectTalentDirectory,
  type TalentDirectorySource,
  type TalentDirectoryView,
} from "@/lib/career/talent-directory";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";
import { getPrisma } from "@/lib/kernel/db";

/** Dizin üst sınırı — sınırsız findMany yasak (O2). */
export const TALENT_DIRECTORY_TAKE_MAX = 200 as const;
export const TALENT_DIRECTORY_PAGE_SIZE_DEFAULT = 40 as const;
export const TALENT_DIRECTORY_PAGE_SIZE_MAX = 100 as const;

function sealTitle(roleKey: string, verticalKey: string): string {
  const role = YETKINCV_ROLES.find((row) => row.id === roleKey)?.label;
  const vertical = YETKINCV_VERTICALS.find((row) => row.id === verticalKey)?.label;
  if (vertical && role) {
    return `${vertical} · ${role}`;
  }
  return vertical ?? role ?? "YetkinCV mührü";
}

export function resolveTalentDirectoryPagination(query: {
  page?: number | string | null;
  pageSize?: number | string | null;
  take?: number | string | null;
}): { page: number; pageSize: number; take: number; skip: number } {
  const rawPage = typeof query.page === "string" ? Number(query.page) : query.page;
  const rawSize =
    typeof query.pageSize === "string"
      ? Number(query.pageSize)
      : typeof query.take === "string"
        ? Number(query.take)
        : (query.pageSize ?? query.take);
  const page = Number.isInteger(rawPage) && (rawPage as number) >= 1 ? (rawPage as number) : 1;
  const pageSize =
    Number.isInteger(rawSize) && (rawSize as number) >= 1
      ? Math.min(rawSize as number, TALENT_DIRECTORY_PAGE_SIZE_MAX)
      : TALENT_DIRECTORY_PAGE_SIZE_DEFAULT;
  const take = Math.min(pageSize, TALENT_DIRECTORY_TAKE_MAX);
  const skip = (page - 1) * take;
  return { page, pageSize: take, take, skip };
}

/**
 * Kamuya açık uzman dizini. Kaynak `yetkin_cv_seals`.
 * Akademi sertifikası okunmaz: o oda kapalı, yeni satır üretilmez.
 * E-posta, fatura adresi ve userId kamu kartına yazılmaz.
 * Kart bağları mühür hash'idir (`/vize/[hash]`).
 * O2: `take` / `page` / `pageSize` ile üst sınır; sınırsız belleğe çekilmez.
 */
export async function loadTalentDirectory(query: {
  dikey?: string | null;
  il?: string | null;
  page?: number | string | null;
  pageSize?: number | string | null;
  take?: number | string | null;
}): Promise<TalentDirectoryView> {
  const filter = {
    vertical: parseTalentVertical(query.dikey),
    city: parseTalentCity(query.il),
  };
  if (!process.env.DATABASE_URL?.trim()) {
    return emptyTalentDirectory("unavailable");
  }
  const { take, skip } = resolveTalentDirectoryPagination(query);
  try {
    const prisma = getPrisma();
    // K4: yalnız ücretli yayın mührü dizine girer. Ücretsiz mühür sızmaz.
    const seals = await prisma.yetkinCvSeal.findMany({
      where: { sealedPublication: true },
      orderBy: { issuedAt: "desc" },
      skip,
      take,
      select: {
        userId: true,
        roleKey: true,
        verticalKey: true,
        certificateHash: true,
        issuedAt: true,
        user: { select: { displayName: true } },
      },
    });
    if (seals.length === 0) {
      return projectTalentDirectory([], filter);
    }
    const userIds = [...new Set(seals.map((row) => row.userId))];
    const [portfolio, cvs] = await Promise.all([
      prisma.careerPortfolioItem.findMany({
        where: { userId: { in: userIds } },
        orderBy: { createdAt: "desc" },
        take: Math.min(userIds.length * 3, TALENT_DIRECTORY_TAKE_MAX),
        select: { userId: true, title: true },
      }),
      prisma.careerCv.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, city: true },
      }),
    ]);
    const portfolioByUser = new Map<string, string>();
    for (const item of portfolio) {
      if (!portfolioByUser.has(item.userId) && item.title.trim()) {
        portfolioByUser.set(item.userId, item.title);
      }
    }
    const cityByUser = new Map(cvs.map((row) => [row.userId, row.city.trim() || null]));
    const sources: TalentDirectorySource[] = [];
    for (const seal of seals) {
      const hash = parseSha256Hex(seal.certificateHash);
      if (!hash) {
        continue;
      }
      sources.push({
        userKey: seal.userId,
        stampId: hash,
        displayName: seal.user.displayName,
        title: sealTitle(seal.roleKey, seal.verticalKey),
        issuedAt: seal.issuedAt,
        courseSlug: seal.verticalKey,
        portfolioTitle: portfolioByUser.get(seal.userId) ?? null,
        city: cityByUser.get(seal.userId) ?? null,
        sourceKind: "YETKINCV_SEAL",
      });
    }
    return projectTalentDirectory(sources, filter);
  } catch {
    return emptyTalentDirectory("unavailable");
  }
}
