"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import type { FreelancerJobRecord } from "@/lib/freelancer/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
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
import type { AcademyPathwayId } from "@/lib/academy/level-pathway";

type LiveBoardItem = FreelancerJobRecord & { kind: "live" };

function gridClass(view: JobBoardViewMode): string {
  return view === "list" ? "grid gap-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
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

  function onPathwayChange(value: AcademyPathwayId | "all") {
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

  let body: ReactNode;
  if (jobs.length === 0) {
    body = (
      <Card variant="default" className="border-dashed shadow-sm">
        <p className="text-base font-semibold text-[var(--foreground)]">{copy.list.emptyHint}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.list.filteredEmptyHint}</p>
        <div className="mt-4">
          <LinkButton href="/freelancer/new" variant="primary" size="sm">
            {copy.catalog.createCta}
          </LinkButton>
        </div>
      </Card>
    );
  } else if (visible.length === 0) {
    body = (
      <Card variant="default" className="border-dashed shadow-sm">
        <p className="text-base font-semibold text-[var(--foreground)]">{copy.list.filteredEmpty}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{copy.list.filteredEmptyHint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {filtersActive ? (
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              {copy.list.clearFiltersCta}
            </Button>
          ) : null}
          <LinkButton href="/freelancer/new" variant="primary" size="sm">
            {copy.catalog.createCta}
          </LinkButton>
        </div>
      </Card>
    );
  } else {
    body = list;
  }

  return (
    <section className="space-y-4" aria-label={copy.list.boardTitle}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {copy.list.boardTitle}
        </h2>
        {filtersActive && visible.length > 0 ? (
          <p className="text-xs text-[var(--muted)]">
            {visible.length}/{sourceItems.length}
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
