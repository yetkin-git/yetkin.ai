import type { FreelancerContractView } from "../contract/v1";
import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

export type BenchLane = "in_progress" | "delivered" | "released" | "refunded" | "disputed";

export type BenchRole = "client" | "freelancer";

export type BenchItem = {
  contract: FreelancerContractView;
  role: BenchRole;
  lane: BenchLane;
  title: null;
};

export type BenchLanes = {
  in_progress: BenchItem[];
  delivered: BenchItem[];
  released: BenchItem[];
  refunded: BenchItem[];
  disputed: BenchItem[];
};

export type BenchView =
  | { kind: "idle"; testID: "dron-bench-idle" }
  | { kind: "loading"; testID: "dron-bench-loading"; title: string }
  | {
      kind: "ready";
      testID: "dron-bench-ready";
      title: string;
      items: BenchItem[];
      lanes: BenchLanes;
      refreshError: string | null;
    }
  | {
      kind: "empty";
      testID: "dron-bench-empty";
      title: string;
      hint: string;
      refreshError: string | null;
    }
  | {
      kind: "error";
      testID: "dron-bench-error";
      title: string;
      message: string;
      requestId: string | null;
    };

export function benchLaneFor(contract: FreelancerContractView): BenchLane {
  if (contract.status === "RELEASED") {
    return "released";
  }
  if (contract.status === "REFUNDED") {
    return "refunded";
  }
  if (contract.status === "DISPUTED") {
    return "disputed";
  }
  if (contract.deliveredAt) {
    return "delivered";
  }
  return "in_progress";
}

export function benchRoleFor(contract: FreelancerContractView, userId: string): BenchRole | null {
  if (contract.freelancerId === userId) {
    return "freelancer";
  }
  if (contract.clientId === userId) {
    return "client";
  }
  return null;
}

export function presentBenchItems(contracts: FreelancerContractView[], userId: string): BenchItem[] {
  const items: BenchItem[] = [];
  for (const contract of contracts) {
    const role = benchRoleFor(contract, userId);
    if (!role) {
      continue;
    }
    items.push({
      contract,
      role,
      lane: benchLaneFor(contract),
      title: null,
    });
  }
  return items;
}

export function groupBenchLanes(items: BenchItem[]): BenchLanes {
  return {
    in_progress: items.filter((item) => item.lane === "in_progress"),
    delivered: items.filter((item) => item.lane === "delivered"),
    released: items.filter((item) => item.lane === "released"),
    refunded: items.filter((item) => item.lane === "refunded"),
    disputed: items.filter((item) => item.lane === "disputed"),
  };
}

export function presentBenchLoading(): BenchView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.bench.loadingTestID,
    title: RAIL_IS_COPY.bench.loading,
  };
}

export function presentBenchReady(contracts: FreelancerContractView[], userId: string): BenchView {
  const items = presentBenchItems(contracts, userId);
  if (items.length === 0) {
    return {
      kind: "empty",
      testID: RAIL_IS_COPY.bench.emptyTestID,
      title: RAIL_IS_COPY.bench.empty,
      hint: RAIL_IS_COPY.bench.emptyHint,
      refreshError: null,
    };
  }
  return {
    kind: "ready",
    testID: RAIL_IS_COPY.bench.readyTestID,
    title: RAIL_IS_COPY.bench.title,
    items,
    lanes: groupBenchLanes(items),
    refreshError: null,
  };
}

export function presentBenchError(error: unknown): BenchView {
  return presentBenchFromFailure(classifyV1Failure(error));
}

export function presentBenchFromFailure(failure: ClassifiedV1Failure): BenchView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.bench.errorTestID,
    title: RAIL_IS_COPY.bench.errorTitle,
    message: failure.message,
    requestId: failure.requestId,
  };
}

export function withBenchRefreshError(view: BenchView, message: string): BenchView {
  if (view.kind === "ready" || view.kind === "empty") {
    return { ...view, refreshError: message };
  }
  return presentBenchFromFailure({
    kind: "protocol",
    status: null,
    message,
    requestId: null,
    envelopeError: null,
  });
}

export function benchLaneLabel(lane: BenchLane): string {
  switch (lane) {
    case "in_progress":
      return RAIL_IS_COPY.bench.inProgress;
    case "delivered":
      return RAIL_IS_COPY.bench.delivered;
    case "released":
      return RAIL_IS_COPY.bench.released;
    case "refunded":
      return RAIL_IS_COPY.bench.refunded;
    case "disputed":
      return RAIL_IS_COPY.bench.disputed;
  }
}

export function canPostDelivery(item: BenchItem): boolean {
  return item.role === "freelancer" && item.lane === "in_progress";
}

/** Teslimat sonrası işveren CTA. Sunucu teslim şartı uydurmaz; UX dürüst tercihtir. */
export function canReleaseEscrow(item: BenchItem): boolean {
  return item.role === "client" && item.lane === "delivered";
}
