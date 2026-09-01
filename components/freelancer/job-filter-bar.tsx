"use client";

import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { IconGrid, IconList, IconSearch } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import {
  JOB_BOARD_VISA_PATHWAY_OPTIONS,
  isJobBoardSort,
  isJobBoardVisaPathwayId,
  type JobBoardFilters,
  type JobBoardSort,
} from "@/lib/freelancer/job-board-filter";
import type { FreelancerNeedId } from "@/lib/kernel/catalog-ids";
import type { JobBoardViewMode } from "@/lib/freelancer/job-board-view-pref";

const SELECT_CLASS = cn(INPUT_SURFACE_CLASS, "mt-0 cursor-pointer");

export function JobFilterBar({
  filters,
  budgetMinMajor,
  budgetMaxMajor,
  view,
  onQueryChange,
  onPathwayChange,
  onBudgetMinChange,
  onBudgetMaxChange,
  onSortChange,
  onViewChange,
}: {
  filters: JobBoardFilters;
  budgetMinMajor: string;
  budgetMaxMajor: string;
  view: JobBoardViewMode;
  onQueryChange: (value: string) => void;
  onPathwayChange: (value: FreelancerNeedId | "all") => void;
  onBudgetMinChange: (value: string) => void;
  onBudgetMaxChange: (value: string) => void;
  onSortChange: (value: JobBoardSort) => void;
  onViewChange: (value: JobBoardViewMode) => void;
}) {
  const copy = SEN_VOICE.freelancer.filter;

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          <IconSearch />
        </span>
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={copy.searchPlaceholder}
          aria-label={copy.searchPlaceholder}
          className={cn(INPUT_SURFACE_CLASS, "mt-0 pl-10")}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            {copy.pathwayLabel}
            <select
              className={cn(SELECT_CLASS, "mt-1")}
              value={filters.visaPathwayId}
              onChange={(event) => {
                const value = event.target.value;
                onPathwayChange(isJobBoardVisaPathwayId(value) ? value : "all");
              }}
              aria-label={copy.pathwayLabel}
            >
              <option value="all">{copy.pathwayAll}</option>
              {JOB_BOARD_VISA_PATHWAY_OPTIONS.map((need) => (
                <option key={need.id} value={need.id}>
                  {need.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[var(--foreground)]">
            {copy.budgetLabel}
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="1"
                value={budgetMinMajor}
                onChange={(event) => onBudgetMinChange(event.target.value)}
                placeholder={copy.budgetMinPlaceholder}
                aria-label={copy.budgetMinPlaceholder}
                className={cn(INPUT_SURFACE_CLASS, "mt-0")}
              />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="1"
                value={budgetMaxMajor}
                onChange={(event) => onBudgetMaxChange(event.target.value)}
                placeholder={copy.budgetMaxPlaceholder}
                aria-label={copy.budgetMaxPlaceholder}
                className={cn(INPUT_SURFACE_CLASS, "mt-0")}
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-[var(--foreground)] sm:col-span-2 xl:col-span-1">
            {copy.sortLabel}
            <select
              className={cn(SELECT_CLASS, "mt-1")}
              value={filters.sort}
              onChange={(event) => {
                const value = event.target.value;
                onSortChange(isJobBoardSort(value) ? value : "newest");
              }}
              aria-label={copy.sortLabel}
            >
              <option value="newest">{copy.sortNewest}</option>
              <option value="budget-desc">{copy.sortBudgetDesc}</option>
              <option value="budget-asc">{copy.sortBudgetAsc}</option>
            </select>
          </label>
        </div>

        <div
          className="inline-flex shrink-0 self-start rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1"
          role="group"
          aria-label={copy.viewLabel}
        >
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-pressed={view === "grid"}
            aria-label={copy.viewGrid}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
              view === "grid"
                ? "bg-[var(--surface)] text-[var(--safir-deep)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            <IconGrid />
            {copy.viewGrid}
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            aria-label={copy.viewList}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
              view === "list"
                ? "bg-[var(--surface)] text-[var(--safir-deep)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            <IconList />
            {copy.viewList}
          </button>
        </div>
      </div>
    </div>
  );
}
