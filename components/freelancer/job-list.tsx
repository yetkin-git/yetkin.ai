"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import type { FreelancerJobRecord } from "@/lib/freelancer/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { IconBriefcase, IconSearch } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { JobFilterBar } from "@/components/freelancer/job-filter-bar";
import { FreelancerJobCard } from "@/components/freelancer/job-card";
import {
  JOB_BOARD_DEFAULT_FILTERS,
  filterAndSortJobs,
  parseBudgetMajorToMinor,
  type JobBoardFilters,
  type JobBoardSort,
} from "@/lib/freelancer/job-board-filter";
import {
  getJobBoardViewClientSnapshot,
  getJobBoardViewServerSnapshot,
  subscribeJobBoardView,
  writeJobBoardViewToStorage,
  type JobBoardViewMode,
} from "@/lib/freelancer/job-board-view-pref";
import type { FreelancerNeedId } from "@/lib/kernel/catalog-ids";

type LiveBoardItem = FreelancerJobRecord & { kind: "live" };
type JobBoardEmptyKind = "catalog" | "filtered";

function gridClass(view: JobBoardViewMode): string {
  return view === "list" ? "grid gap-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
}

function JobBoardEmptyState({
  kind,
  onClearFilters,
}: {
  kind: JobBoardEmptyKind;
  onClearFilters?: () => void;
}) {
  const copy = SEN_VOICE.freelancer.list;
  const isCatalogEmpty = kind === "catalog";

  return (
    <Card variant="default" className="border-dashed shadow-sm">
      <div className="flex flex-col items-center px-2 py-8 text-center sm:py-12">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--safir-soft)] text-[var(--safir-deep)]">
          {isCatalogEmpty ? <IconBriefcase /> : <IconSearch />}
        </span>
        <p className="mt-4 text-base font-semibold tracking-tight text-[var(--foreground)]">
          {isCatalogEmpty ? copy.emptyHint : copy.filteredEmpty}
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          {isCatalogEmpty ? copy.emptyBody : copy.filteredEmptyHint}
        </p>
        <div className="mt-5">
          {isCatalogEmpty ? (
            <LinkButton href="/freelancer/new" variant="primary" size="sm">
              {copy.emptyCta}
            </LinkButton>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
              {copy.clearFiltersCta}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export function JobList({ jobs }: { jobs: FreelancerJobRecord[] }) {
  const copy = SEN_VOICE.freelancer;
  const [filters, setFilters] = useState<JobBoardFilters>(JOB_BOARD_DEFAULT_FILTERS);
  const [budgetMinMajor, setBudgetMinMajor] = useState("");
  const [budgetMaxMajor, setBudgetMaxMajor] = useState("");
  const view = useSyncExternalStore(
    subscribeJobBoardView,
    getJobBoardViewClientSnapshot,
    getJobBoardViewServerSnapshot,
  );

  const sourceItems = useMemo<LiveBoardItem[]>(
    () => jobs.map((job) => ({ ...job, kind: "live" as const })),
    [jobs],
  );

  const activeFilters = useMemo<JobBoardFilters>(
    () => ({
      ...filters,
      budgetMinMinor: parseBudgetMajorToMinor(budgetMinMajor),
      budgetMaxMinor: parseBudgetMajorToMinor(budgetMaxMajor),
    }),
    [filters, budgetMinMajor, budgetMaxMajor],
  );

  const visible = useMemo(
    () => filterAndSortJobs(sourceItems, activeFilters),
    [sourceItems, activeFilters],
  );

  const filtersActive =
    activeFilters.query.trim().length > 0 ||
    activeFilters.visaPathwayId !== "all" ||
    activeFilters.budgetMinMinor !== null ||
    activeFilters.budgetMaxMinor !== null ||
    activeFilters.sort !== "newest";

  function onPathwayChange(value: FreelancerNeedId | "all") {
    setFilters((prev) => ({ ...prev, visaPathwayId: value }));
  }

  function onSortChange(value: JobBoardSort) {
    setFilters((prev) => ({ ...prev, sort: value }));
  }

  function onViewChange(next: JobBoardViewMode) {
    writeJobBoardViewToStorage(next);
  }

  function clearFilters() {
    setFilters(JOB_BOARD_DEFAULT_FILTERS);
    setBudgetMinMajor("");
    setBudgetMaxMajor("");
  }

  const list = (
    <ul className={gridClass(view)}>
      {visible.map((job) => (
        <li key={job.id} className="h-full">
          <FreelancerJobCard job={job} layout={view} />
        </li>
      ))}
    </ul>
  );

  const totalJobs = jobs.length;
  const filteredJobs = visible.length;

  let body: ReactNode;
  if (totalJobs === 0) {
    body = <JobBoardEmptyState kind="catalog" />;
  } else if (filteredJobs === 0) {
    body = <JobBoardEmptyState kind="filtered" onClearFilters={clearFilters} />;
  } else {
    body = list;
  }

  return (
    <section className="space-y-4" aria-label={copy.list.boardTitle}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {copy.list.boardTitle}
        </h2>
        {filtersActive && filteredJobs > 0 ? (
          <p className="text-xs text-[var(--muted)]">
            {filteredJobs}/{sourceItems.length}
          </p>
        ) : null}
      </div>
      <JobFilterBar
        filters={activeFilters}
        budgetMinMajor={budgetMinMajor}
        budgetMaxMajor={budgetMaxMajor}
        view={view}
        onQueryChange={(query) => setFilters((prev) => ({ ...prev, query }))}
        onPathwayChange={onPathwayChange}
        onBudgetMinChange={setBudgetMinMajor}
        onBudgetMaxChange={setBudgetMaxMajor}
        onSortChange={onSortChange}
        onViewChange={onViewChange}
      />
      {body}
    </section>
  );
}
