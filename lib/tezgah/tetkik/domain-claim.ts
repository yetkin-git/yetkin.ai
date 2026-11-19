import "server-only";

import { getPrisma } from "@/lib/kernel/db";

/**
 * Global ücretsiz tetkik domain kilidi.
 * Host başına bir ücretsiz analiz. Pro / kredi bu tabloyu aşar.
 * Test süreci bellek store kullanır.
 */

type ClaimStore = {
  isClaimed(host: string): Promise<boolean>;
  tryClaim(host: string, subjectKey: string, now: Date): Promise<"ok" | "claimed">;
  reset(): void;
};

const memoryClaims = new Map<string, string>();

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

const memoryStore: ClaimStore = {
  async isClaimed(host) {
    return memoryClaims.has(host);
  },
  async tryClaim(host, subjectKey) {
    if (memoryClaims.has(host)) {
      return "claimed";
    }
    memoryClaims.set(host, subjectKey);
    return "ok";
  },
  reset() {
    memoryClaims.clear();
  },
};

function prismaStore(): ClaimStore {
  const prisma = getPrisma();
  return {
    async isClaimed(host) {
      const row = await prisma.tetkikDomainClaim.findUnique({
        where: { host },
        select: { host: true },
      });
      return row != null;
    },
    async tryClaim(host, subjectKey, now) {
      try {
        await prisma.tetkikDomainClaim.create({
          data: { host, claimedBySubjectKey: subjectKey, createdAt: now },
        });
        return "ok";
      } catch (error) {
        if (isUniqueViolation(error)) {
          return "claimed";
        }
        throw error;
      }
    },
    reset() {
      memoryClaims.clear();
    },
  };
}

function memoryClaimRuntime(): boolean {
  return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}

function activeStore(): ClaimStore {
  return memoryClaimRuntime() ? memoryStore : prismaStore();
}

export async function isTetkikDomainClaimed(host: string): Promise<boolean> {
  const key = host.trim().toLowerCase();
  if (!key) {
    return false;
  }
  return activeStore().isClaimed(key);
}

/** Başarılı ücretsiz analizden sonra yazar. Yarışta ikinci aktör `claimed` alır. */
export async function claimTetkikDomain(
  host: string,
  subjectKey: string,
  now = new Date(),
): Promise<"ok" | "claimed"> {
  const key = host.trim().toLowerCase();
  if (!key || !subjectKey.trim()) {
    return "claimed";
  }
  return activeStore().tryClaim(key, subjectKey.trim(), now);
}

export function resetTetkikDomainClaimsForTests(): void {
  memoryStore.reset();
}
