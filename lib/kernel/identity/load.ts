import "server-only";

import { cache } from "react";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import {
  ensurePrismaQueryEngine,
  getPrisma,
  kernelBackgroundReadTimeoutMs,
  withDbReadTimeout,
} from "@/lib/kernel/db";
import type { IdentityProfile } from "@/lib/kernel/identity/types";

export type IdentityBoard = {
  user: IdentityProfile | null;
};

/** Serverless fail-soft; uzun süreç `kernelBackgroundReadTimeoutMs` ile 8s. */
const IDENTITY_READ_TIMEOUT_MS = 2_000;

/**
 * Oturum sahibinin çekirdek User satırı.
 * userId oturumdan gelmelidir; sorgu başka kullanıcı çekmez.
 * DATABASE_URL yoksa veya Prisma patlarsa null — sahte kimlik yok.
 */
export const loadIdentityBoard = cache(async function loadIdentityBoard(
  userId: string,
): Promise<IdentityBoard | null> {
  if (!isSupabaseUserId(userId) || !process.env.DATABASE_URL?.trim()) {
    return null;
  }

  try {
    const engineReady = await ensurePrismaQueryEngine();
    if (!engineReady) {
      return null;
    }
    const prisma = getPrisma();
    const row = await withDbReadTimeout(
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          locale: true,
          timeZone: true,
          createdAt: true,
        },
      }),
      kernelBackgroundReadTimeoutMs(IDENTITY_READ_TIMEOUT_MS),
      "identity.user",
    );

    if (!row) {
      return { user: null };
    }

    return {
      user: {
        userId: row.id,
        email: row.email,
        displayName: row.displayName,
        locale: row.locale,
        timeZone: row.timeZone,
        createdAt: row.createdAt,
      },
    };
  } catch {
    return null;
  }
});
