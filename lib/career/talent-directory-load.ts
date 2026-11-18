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

function sealTitle(roleKey: string, verticalKey: string): string {
  const role = YETKINCV_ROLES.find((row) => row.id === roleKey)?.label;
  const vertical = YETKINCV_VERTICALS.find((row) => row.id === verticalKey)?.label;
  if (vertical && role) {
    return `${vertical} · ${role}`;
  }
  return vertical ?? role ?? "YetkinCV mührü";
}

/**
 * Kamuya açık uzman dizini. Kaynak `yetkin_cv_seals`.
 * Akademi sertifikası okunmaz: o oda kapalı, yeni satır üretilmez.
 * E-posta, fatura adresi ve userId kamu kartına yazılmaz.
 * Kart bağları mühür hash'idir (`/vize/[hash]`).
 */
export async function loadTalentDirectory(query: {
  dikey?: string | null;
  il?: string | null;
}): Promise<TalentDirectoryView> {
  const filter = {
    vertical: parseTalentVertical(query.dikey),
    city: parseTalentCity(query.il),
  };
  if (!process.env.DATABASE_URL?.trim()) {
    return emptyTalentDirectory("unavailable");
  }
  try {
    const prisma = getPrisma();
    const seals = await prisma.yetkinCvSeal.findMany({
      orderBy: { issuedAt: "desc" },
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
    const portfolio = await prisma.careerPortfolioItem.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      select: { userId: true, title: true },
    });
    const portfolioByUser = new Map<string, string>();
    for (const item of portfolio) {
      if (!portfolioByUser.has(item.userId) && item.title.trim()) {
        portfolioByUser.set(item.userId, item.title);
      }
    }
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
        city: null,
        sourceKind: "YETKINCV_SEAL",
      });
    }
    return projectTalentDirectory(sources, filter);
  } catch {
    return emptyTalentDirectory("unavailable");
  }
}
