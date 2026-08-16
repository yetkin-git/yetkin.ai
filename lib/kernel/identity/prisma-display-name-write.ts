import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { DisplayNameWriteStore } from "@/lib/kernel/identity/display-name-write";
import type { IdentityProfile } from "@/lib/kernel/identity/types";

const PROFILE_SELECT = {
  id: true,
  email: true,
  displayName: true,
  locale: true,
  timeZone: true,
  createdAt: true,
} as const;

function toProfile(row: {
  id: string;
  email: string;
  displayName: string | null;
  locale: string;
  timeZone: string;
  createdAt: Date;
}): IdentityProfile {
  return {
    userId: row.id,
    email: row.email,
    displayName: row.displayName,
    locale: row.locale,
    timeZone: row.timeZone,
    createdAt: row.createdAt,
  };
}

function isMissingRow(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2025"
  );
}

export function createPrismaDisplayNameWriteStore(): DisplayNameWriteStore {
  const prisma = getPrisma();
  return {
    async updateDisplayName(input) {
      try {
        const row = await prisma.user.update({
          where: { id: input.userId },
          data: { displayName: input.displayName },
          select: PROFILE_SELECT,
        });
        return toProfile(row);
      } catch (error) {
        if (isMissingRow(error)) {
          return null;
        }
        throw error;
      }
    },
  };
}
