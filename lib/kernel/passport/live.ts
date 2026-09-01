import type { ProofReadPort, SealedProofRecord } from "@/lib/kernel/proof/port";
import type { SealedPassportStamp } from "@/lib/kernel/passport/types";

/** Canlı kanıtla bağlanmış damga — iptal / düşmüş mühür projeksiyona girmez. */
export type LivePassportStamp = SealedPassportStamp & {
  courseSlug: string | null;
};

/**
 * Önceden çekilmiş kanıt listesini damgalara bağlar. Ek SELECT yok.
 * Kanıt yoksa (iptal, silinmiş teslim) damga projeksiyona girmez — uydurma vize yok.
 * userId oturumdan gelmelidir; başka vatandaşın damgası sızmaz.
 */
export function bindLivePassportStamps(
  stamps: readonly SealedPassportStamp[],
  sealed: readonly SealedProofRecord[],
  userId: string,
): LivePassportStamp[] {
  if (stamps.length === 0) {
    return [];
  }
  const byKey = new Map(
    sealed.map((proof) => [`${proof.sourceKind}:${proof.sourceId}`, proof] as const),
  );
  const live: LivePassportStamp[] = [];
  for (const stamp of stamps) {
    if (stamp.userId !== userId) {
      continue;
    }
    const proof = byKey.get(`${stamp.sourceKind}:${stamp.sourceId}`);
    if (!proof) {
      continue;
    }
    live.push({
      id: stamp.id,
      userId: stamp.userId,
      sourceKind: stamp.sourceKind,
      sourceId: stamp.sourceId,
      visaKey: stamp.visaKey,
      moduleId: stamp.moduleId,
      title: proof.title,
      certificateHash: proof.certificateHash ?? stamp.certificateHash,
      issuedAt: stamp.issuedAt,
      createdAt: stamp.createdAt,
      courseSlug: proof.courseSlug ?? null,
    });
  }
  return live;
}

/**
 * Sicil satırını mühürlü kanıta bağlar.
 * Damga yoksa kanıt listesi açılmaz.
 */
export async function projectLivePassportStamps(
  stamps: readonly SealedPassportStamp[],
  proofs: Pick<ProofReadPort, "listSealedProofs">,
  userId: string,
): Promise<LivePassportStamp[]> {
  if (stamps.length === 0) {
    return [];
  }
  const sealed = await proofs.listSealedProofs(userId);
  return bindLivePassportStamps(stamps, sealed, userId);
}
