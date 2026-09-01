import { describe, expect, it } from "vitest";
import {
  JOB_BOARD_DEFAULT_FILTERS,
  JOB_BOARD_VISA_PATHWAY_OPTIONS,
  filterAndSortJobs,
  parseBudgetMajorToMinor,
  type JobBoardFilterable,
} from "@/lib/freelancer/job-board-filter";
import { FREELANCER_NEED_IDS } from "@/lib/kernel/catalog-ids";
import {
  JOB_BOARD_DEFAULT_VIEW,
  parseJobBoardViewMode,
} from "@/lib/freelancer/job-board-view-pref";

const SAMPLE: JobBoardFilterable[] = [
  {
    title: "React arayüz",
    brief: "Dashboard bileşenleri",
    budgetMinor: 500_000,
    visaPathwayId: "uiux-tasarim-sistemleri",
    createdAt: "2026-08-10T00:00:00.000Z",
  },
  {
    title: "Prompt paket",
    brief: "YZ içerik ve RAG",
    budgetMinor: 1_200_000,
    visaPathwayId: "yz-muhendislik-agent",
    createdAt: "2026-08-20T00:00:00.000Z",
  },
  {
    title: "API iskeleti",
    brief: "Node ve bulut deploy",
    budgetMinor: 800_000,
    visaPathwayId: "fullstack-web-api",
    createdAt: "2026-08-15T00:00:00.000Z",
  },
];

describe("freelancer job board filter / view", () => {
  it("vize seçenekleri ihtiyaç listesi SSOT ile hizalıdır", () => {
    expect(JOB_BOARD_VISA_PATHWAY_OPTIONS.map((o) => o.id).sort()).toEqual(
      [...FREELANCER_NEED_IDS].sort(),
    );
  });

  it("başlık ve brief üzerinde anlık arama yapar", () => {
    const found = filterAndSortJobs(SAMPLE, {
      ...JOB_BOARD_DEFAULT_FILTERS,
      query: "rag",
    });
    expect(found).toHaveLength(1);
    expect(found[0]?.title).toBe("Prompt paket");
  });

  it("visaPathwayId süzgeci dürüst eşleşir; sahte sonuç üretmez", () => {
    const found = filterAndSortJobs(SAMPLE, {
      ...JOB_BOARD_DEFAULT_FILTERS,
      visaPathwayId: "web-sitesi-yazilim",
    });
    expect(found).toHaveLength(1);
    expect(found[0]?.visaPathwayId).toBe("fullstack-web-api");

    const empty = filterAndSortJobs(SAMPLE, {
      ...JOB_BOARD_DEFAULT_FILTERS,
      visaPathwayId: "siber-guvenlik-sunucu-test",
    });
    expect(empty).toEqual([]);
  });

  it("bütçe min/max ve sıralama dürüst çalışır", () => {
    expect(parseBudgetMajorToMinor("100")).toBe(10_000);
    expect(parseBudgetMajorToMinor("")).toBeNull();
    expect(parseBudgetMajorToMinor("abc")).toBeNull();

    const ranged = filterAndSortJobs(SAMPLE, {
      ...JOB_BOARD_DEFAULT_FILTERS,
      budgetMinMinor: 700_000,
      budgetMaxMinor: 1_000_000,
      sort: "budget-asc",
    });
    expect(ranged.map((j) => j.title)).toEqual(["API iskeleti"]);

    const byBudgetDesc = filterAndSortJobs(SAMPLE, {
      ...JOB_BOARD_DEFAULT_FILTERS,
      sort: "budget-desc",
    });
    expect(byBudgetDesc.map((j) => j.budgetMinor)).toEqual([1_200_000, 800_000, 500_000]);

    const newest = filterAndSortJobs(SAMPLE, JOB_BOARD_DEFAULT_FILTERS);
    expect(newest.map((j) => j.title)).toEqual(["Prompt paket", "API iskeleti", "React arayüz"]);
  });

  it("görünüm tercihi yalnız grid/list kabul eder", () => {
    expect(parseJobBoardViewMode("list")).toBe("list");
    expect(parseJobBoardViewMode("grid")).toBe("grid");
    expect(parseJobBoardViewMode("weird")).toBe(JOB_BOARD_DEFAULT_VIEW);
    expect(parseJobBoardViewMode(null)).toBe("grid");
  });
});
