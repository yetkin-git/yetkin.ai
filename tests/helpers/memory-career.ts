import type {
  CareerPortfolioItemRecord,
  CareerProofStore,
  CareerPulse,
  CareerStampWriteClient,
  CareerStore,
  CareerVisaSourceKind,
  CareerVisaStampRecord,
  SealedCareerProof,
} from "@/lib/career/types";

function uniqueViolation(target: string): Error {
  const error = new Error(`Unique constraint failed on the ${target}`);
  Object.assign(error, { code: "P2002", meta: { target } });
  return error;
}

export type MemoryCareerStore = CareerStore & {
  /** Bir sonraki portföy INSERT'i düşür (atomiklik / rollback mührü). */
  failNextPortfolioInsert(): void;
  /** Bir sonraki getStampBySource null döner — TOCTOU yarış penceresi. */
  skipNextStampLookup(): void;
};

export function createMemoryCareerStore(): MemoryCareerStore {
  const stamps = new Map<string, CareerVisaStampRecord>();
  const items = new Map<string, CareerPortfolioItemRecord>();
  let failPortfolio = false;
  let skipLookup = false;

  const writes: CareerStampWriteClient = {
    async insertStamp(stamp) {
      if (stamps.has(stamp.id)) {
        throw uniqueViolation("id");
      }
      const dup = [...stamps.values()].find(
        (row) =>
          row.userId === stamp.userId &&
          row.sourceKind === stamp.sourceKind &&
          row.sourceId === stamp.sourceId,
      );
      if (dup) {
        throw uniqueViolation("userId_sourceKind_sourceId");
      }
      stamps.set(stamp.id, { ...stamp, certificateHash: stamp.certificateHash ?? null });
      return { ...stamps.get(stamp.id)! };
    },
    async getStampBySource(userId, sourceKind, sourceId) {
      if (skipLookup) {
        skipLookup = false;
        return null;
      }
      const found = [...stamps.values()].find(
        (row) => row.userId === userId && row.sourceKind === sourceKind && row.sourceId === sourceId,
      );
      return found ? { ...found } : null;
    },
    async setStampCertificateHash(id, certificateHash) {
      const found = stamps.get(id);
      if (!found) {
        throw new Error("Vize damgası bulunamadı.");
      }
      const next = { ...found, certificateHash };
      stamps.set(id, next);
      return { ...next };
    },
    async insertPortfolioItem(item) {
      if (failPortfolio) {
        failPortfolio = false;
        throw new Error("Vize portföy yazımı düştü.");
      }
      if (items.has(item.id)) {
        throw uniqueViolation("id");
      }
      const dup = [...items.values()].find((row) => row.visaStampId === item.visaStampId);
      if (dup) {
        throw uniqueViolation("visaStampId");
      }
      items.set(item.id, item);
      return { ...item };
    },
    async getPortfolioItemByStampId(visaStampId) {
      const found = [...items.values()].find((row) => row.visaStampId === visaStampId);
      return found ? { ...found } : null;
    },
  };

  return {
    ...writes,
    failNextPortfolioInsert() {
      failPortfolio = true;
    },
    skipNextStampLookup() {
      skipLookup = true;
    },
    async listStampsForUser(userId) {
      return [...stamps.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
        .map((row) => ({ ...row }));
    },
    async listPortfolioForUser(userId) {
      return [...items.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async pulseForUser(userId) {
      const ownStamps = [...stamps.values()].filter((row) => row.userId === userId);
      const ownItems = [...items.values()].filter((row) => row.userId === userId);
      const latest = [...ownStamps].sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())[0];
      const pulse: CareerPulse = {
        visaCount: ownStamps.length,
        portfolioCount: ownItems.length,
        lastVisaTitle: latest?.title ?? null,
      };
      return pulse;
    },
    async runStampPortfolioAtomic(work) {
      const stampSnap = new Map(stamps);
      const itemSnap = new Map(items);
      try {
        return await work(writes);
      } catch (error) {
        stamps.clear();
        items.clear();
        for (const [key, value] of stampSnap) {
          stamps.set(key, value);
        }
        for (const [key, value] of itemSnap) {
          items.set(key, value);
        }
        throw error;
      }
    },
  };
}

export function createMemoryCareerProofStore(initial: SealedCareerProof[] = []): CareerProofStore & {
  add(proof: SealedCareerProof): void;
  remove(sourceKind: CareerVisaSourceKind, sourceId: string): void;
} {
  const proofs = new Map<string, SealedCareerProof>();
  function key(kind: CareerVisaSourceKind, sourceId: string) {
    return `${kind}:${sourceId}`;
  }
  for (const proof of initial) {
    proofs.set(key(proof.sourceKind, proof.sourceId), proof);
  }
  return {
    add(proof) {
      proofs.set(key(proof.sourceKind, proof.sourceId), proof);
    },
    remove(sourceKind, sourceId) {
      proofs.delete(key(sourceKind, sourceId));
    },
    async getSealedProof(sourceKind, sourceId) {
      const row = proofs.get(key(sourceKind, sourceId));
      return row
        ? {
            ...row,
            actorUserIds: [...row.actorUserIds],
            certificateHash: row.certificateHash,
            courseSlug: row.courseSlug,
          }
        : null;
    },
    async listSealedProofs(userId) {
      return [...proofs.values()]
        .filter((row) => row.userId === userId)
        .map((row) => ({
          ...row,
          actorUserIds: [...row.actorUserIds],
          certificateHash: row.certificateHash,
          courseSlug: row.courseSlug,
        }));
    },
  };
}
