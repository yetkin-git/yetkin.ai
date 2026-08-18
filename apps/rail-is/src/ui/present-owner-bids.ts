import type { ClientJobBidView } from "../contract/v1";
import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

export type OwnerBidsView =
  | { kind: "idle"; testID: "dron-owner-bids-idle" }
  | { kind: "loading"; testID: "dron-owner-bids-loading"; title: string }
  | {
      kind: "ready";
      testID: "dron-owner-bids-ready";
      title: string;
      hint: string;
      bids: ClientJobBidView[];
    }
  | {
      kind: "empty";
      testID: "dron-owner-bids-empty";
      title: string;
      hint: string;
    }
  | {
      kind: "error";
      testID: "dron-owner-bids-error";
      title: string;
      message: string;
      requestId: string | null;
    };

export function presentOwnerBidsLoading(): OwnerBidsView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.ownerBids.loadingTestID,
    title: RAIL_IS_COPY.ownerBids.loading,
  };
}

export function presentOwnerBidsReady(bids: ClientJobBidView[]): OwnerBidsView {
  if (bids.length === 0) {
    return {
      kind: "empty",
      testID: RAIL_IS_COPY.ownerBids.emptyTestID,
      title: RAIL_IS_COPY.ownerBids.empty,
      hint: RAIL_IS_COPY.ownerBids.emptyHint,
    };
  }
  return {
    kind: "ready",
    testID: RAIL_IS_COPY.ownerBids.readyTestID,
    title: RAIL_IS_COPY.ownerBids.title,
    hint: RAIL_IS_COPY.ownerBids.noPii,
    bids,
  };
}

export function presentOwnerBidsError(error: unknown): OwnerBidsView {
  return presentOwnerBidsFromFailure(classifyV1Failure(error));
}

export function presentOwnerBidsFromFailure(failure: ClassifiedV1Failure): OwnerBidsView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.ownerBids.errorTestID,
    title: RAIL_IS_COPY.ownerBids.errorTitle,
    message: failure.message,
    requestId: failure.requestId,
  };
}

export function ownerBidsHasRows(view: OwnerBidsView): view is Extract<OwnerBidsView, { kind: "ready" }> {
  return view.kind === "ready";
}
