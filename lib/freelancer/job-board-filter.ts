import {
  ACADEMY_PATHWAY_IDS,
  ACADEMY_PATHWAY_TITLES,
  isAcademyPathwayId,
  type AcademyPathwayId,
} from "@/lib/kernel/catalog-ids";

export type JobBoardSort = "newest" | "budget-desc" | "budget-asc";

export type JobBoardFilters = {
  query: string;
  visaPathwayId: AcademyPathwayId | "all";
  budgetMinMinor: number | null;
  budgetMaxMinor: number | null;
  sort: JobBoardSort;
};

/** Filtre/sıralama için ortak yüzey — canlı ilan veya vitrin. */
export type JobBoardFilterable = {
  title: string;
  brief: string;
  budgetMinor: number;
  visaPathwayId: AcademyPathwayId;
  createdAt: Date | string | number;
};

export const JOB_BOARD_DEFAULT_FILTERS: JobBoardFilters = {
  query: "",
  visaPathwayId: "all",
  budgetMinMinor: null,
  budgetMaxMinor: null,
  sort: "newest",
};

export const JOB_BOARD_VISA_PATHWAY_OPTIONS = ACADEMY_PATHWAY_IDS.map((id) => ({
  id,
  title: ACADEMY_PATHWAY_TITLES[id],
})) as readonly { id: AcademyPathwayId; title: string }[];

export function isJobBoardVisaPathwayId(value: string): value is AcademyPathwayId {
  return isAcademyPathwayId(value);
}

export function isJobBoardSort(value: string): value is JobBoardSort {
  return value === "newest" || value === "budget-desc" || value === "budget-asc";
}

function createdAtMs(value: Date | string | number): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function matchesQuery(item: JobBoardFilterable, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase("tr-TR");
  if (!needle) {
    return true;
  }
  const haystack = `${item.title}\n${item.brief}`.toLocaleLowerCase("tr-TR");
  return haystack.includes(needle);
}

function matchesVisa(item: JobBoardFilterable, visaPathwayId: AcademyPathwayId | "all"): boolean {
  return visaPathwayId === "all" || item.visaPathwayId === visaPathwayId;
}

function matchesBudget(
  item: JobBoardFilterable,
  budgetMinMinor: number | null,
  budgetMaxMinor: number | null,
): boolean {
  if (budgetMinMinor !== null && item.budgetMinor < budgetMinMinor) {
    return false;
  }
  if (budgetMaxMinor !== null && item.budgetMinor > budgetMaxMinor) {
    return false;
  }
  return true;
}

function compareJobs(a: JobBoardFilterable, b: JobBoardFilterable, sort: JobBoardSort): number {
  if (sort === "budget-desc") {
    return b.budgetMinor - a.budgetMinor;
  }
  if (sort === "budget-asc") {
    return a.budgetMinor - b.budgetMinor;
  }
  return createdAtMs(b.createdAt) - createdAtMs(a.createdAt);
}

/** Dürüst istemci filtresi — sahte eşleşme yok; boş sonuç boş kalır. */
export function filterAndSortJobs<T extends JobBoardFilterable>(
  items: readonly T[],
  filters: JobBoardFilters,
): T[] {
  return items
    .filter(
      (item) =>
        matchesQuery(item, filters.query) &&
        matchesVisa(item, filters.visaPathwayId) &&
        matchesBudget(item, filters.budgetMinMinor, filters.budgetMaxMinor),
    )
    .slice()
    .sort((a, b) => compareJobs(a, b, filters.sort));
}

/** Bütçe alanı (₺ major) → minor; boş/geçersiz → null. */
export function parseBudgetMajorToMinor(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) {
    return null;
  }
  const major = Number.parseFloat(trimmed);
  if (!Number.isFinite(major) || major < 0) {
    return null;
  }
  return Math.round(major * 100);
}
