import "server-only";

import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";
import type { PassportBoard, SealedPassportStamp } from "@/lib/kernel/passport/types";

const PASSPORT_STAMP_SELECT = {
  id: true,
  userId: true,
  sourceKind: true,
  sourceId: true,
  visaKey: true,
  moduleId: true,
  title: true,
  certificateHash: true,
  issuedAt: true,
  createdAt: true,
} as const;

/**
 * CareerVisaStamp tek Prisma okuması.
 * Kariyer yazma portu (`listStampsForUser`) ve pasaport tahtası burayı çağırır.
 * userId doğrulaması çağıranın işidir — motor test id'leri UUID olmayabilir.
 */
export async function findPassportStampsForUser(userId: string): Promise<SealedPassportStamp[]> {
  const prisma = getPrisma();
  const rows = await prisma.careerVisaStamp.findMany({
    where: { userId },
    orderBy: [{ issuedAt: "desc" }, { id: "desc" }],
    select: PASSPORT_STAMP_SELECT,
  });
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    sourceKind: row.sourceKind,
    sourceId: row.sourceId,
    visaKey: row.visaKey,
    moduleId: row.moduleId,
    title: row.title,
    certificateHash: row.certificateHash,
    issuedAt: row.issuedAt,
    createdAt: row.createdAt,
  }));
}

/**
 * Oturum sahibinin mühür sicili.
 * userId oturumdan gelmelidir; sorgu başka kullanıcının damgasını çekmez.
 * DATABASE_URL yoksa veya Prisma patlarsa null — sahte vize yok.
 */
export async function loadPassportBoard(userId: string): Promise<PassportBoard | null> {
  if (!isSupabaseUserId(userId) || !process.env.DATABASE_URL?.trim()) {
    return null;
  }

  try {
    return { stamps: await findPassportStampsForUser(userId) };
  } catch {
    return null;
  }
}
