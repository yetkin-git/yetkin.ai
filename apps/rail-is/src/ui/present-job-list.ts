import type { RailV1Job } from "../contract/v1";
import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

export type JobListView =
  | { kind: "idle"; testID: "dron-job-list-idle" }
  | { kind: "loading"; testID: "dron-job-list-loading"; title: string }
  | {
      kind: "ready";
      testID: "dron-job-list-ready";
      title: string;
      jobs: RailV1Job[];
    }
  | {
      kind: "empty";
      testID: "dron-job-list-empty";
      title: string;
      hint: string;
    }
  | {
      kind: "error";
      testID: "dron-job-list-error";
      title: string;
      message: string;
      requestId: string | null;
    };

export function presentJobListLoading(): JobListView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.jobs.loadingTestID,
    title: RAIL_IS_COPY.jobs.loading,
  };
}

export function presentJobListReady(jobs: RailV1Job[]): JobListView {
  if (jobs.length === 0) {
    return {
      kind: "empty",
      testID: RAIL_IS_COPY.jobs.emptyTestID,
      title: RAIL_IS_COPY.jobs.empty,
      hint: RAIL_IS_COPY.jobs.emptyHint,
    };
  }
  return {
    kind: "ready",
    testID: RAIL_IS_COPY.jobs.readyTestID,
    title: RAIL_IS_COPY.jobs.title,
    jobs,
  };
}

export function presentJobListError(error: unknown): JobListView {
  const failure = classifyV1Failure(error);
  return presentJobListFromFailure(failure);
}

export function presentJobListFromFailure(failure: ClassifiedV1Failure): JobListView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.jobs.errorTestID,
    title: RAIL_IS_COPY.jobs.errorTitle,
    message: failure.message,
    requestId: failure.requestId,
  };
}

export function jobListHasJobs(view: JobListView): view is Extract<JobListView, { kind: "ready" }> {
  return view.kind === "ready";
}
