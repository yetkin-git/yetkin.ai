/**
 * Katalog öğrenen durumu — satın alınan / tamamlanan slug haritası.
 * Client-safe tip; yükleme `load-catalog.ts` içinde.
 */

export type AcademyCatalogLearnerStatus = "continue" | "completed";

export type AcademyCatalogLearnerBoard = {
  ownedSlugs: readonly string[];
  statusBySlug: Readonly<Record<string, AcademyCatalogLearnerStatus>>;
};

export const EMPTY_ACADEMY_CATALOG_LEARNER_BOARD: AcademyCatalogLearnerBoard = {
  ownedSlugs: [],
  statusBySlug: {},
};

/**
 * Lab Super Admin — büyüme SKU kartlarını DURUM B (Derse başla) basan helper.
 * Vitrin (`app/academy/page.tsx`) bunu çağırmaz: bağış nakit değildir, fiyat gizlenmez.
 * Ticari `ownedSlugs` değişmez; yeni slug'a continue yazılmaz.
 */
export function overlayStudioGrowthLearnerBoard(
  board: AcademyCatalogLearnerBoard,
  input: { studio: boolean; growthSlugs: readonly string[] },
): AcademyCatalogLearnerBoard {
  if (!input.studio) {
    return board;
  }
  const owned = new Set(board.ownedSlugs);
  for (const slug of input.growthSlugs) {
    const trimmed = slug.trim();
    if (trimmed) {
      owned.add(trimmed);
    }
  }
  return {
    ownedSlugs: [...owned],
    statusBySlug: board.statusBySlug,
  };
}

export function academyCatalogStatusLabel(
  status: AcademyCatalogLearnerStatus | undefined,
): string | null {
  if (status === "continue") {
    return "Devam Et";
  }
  if (status === "completed") {
    return "Tamamlandı";
  }
  return null;
}
