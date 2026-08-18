import type { RailV1Bid } from "../contract/v1";
import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";
import { formatMinorLabel } from "./money";

export type BidFormView = {
  testID: "dron-bid-form" | "dron-bid-error" | "dron-bid-success" | "dron-bid-pending";
  amountMajor: string;
  coverNote: string;
  pending: boolean;
  error: string | null;
  success: { bidId: string; amountLabel: string } | null;
  conflict: boolean;
  fakeSuccess: false;
};

export function emptyBidForm(seed?: { amountMajor?: string; coverNote?: string }): BidFormView {
  return {
    testID: RAIL_IS_COPY.bid.formTestID,
    amountMajor: seed?.amountMajor ?? "",
    coverNote: seed?.coverNote ?? "",
    pending: false,
    error: null,
    success: null,
    conflict: false,
    fakeSuccess: false,
  };
}

export function presentBidPending(form: BidFormView): BidFormView {
  return {
    ...form,
    testID: "dron-bid-pending",
    pending: true,
    error: null,
    success: null,
    conflict: false,
    fakeSuccess: false,
  };
}

export function presentBidSuccess(form: BidFormView, bid: RailV1Bid): BidFormView {
  return {
    ...form,
    testID: RAIL_IS_COPY.bid.successTestID,
    pending: false,
    error: null,
    conflict: false,
    fakeSuccess: false,
    success: {
      bidId: bid.id,
      amountLabel: formatMinorLabel(bid.amountMinor, bid.currencyCode),
    },
  };
}

export function presentBidError(form: BidFormView, error: unknown): BidFormView {
  const failure = classifyV1Failure(error);
  return presentBidFromFailure(form, failure);
}

export function presentBidFromFailure(form: BidFormView, failure: ClassifiedV1Failure): BidFormView {
  const conflict = failure.status === 409;
  return {
    ...form,
    testID: RAIL_IS_COPY.bid.errorTestID,
    pending: false,
    success: null,
    fakeSuccess: false,
    conflict,
    error: conflict
      ? `${failure.message} ${RAIL_IS_COPY.bid.conflict}`
      : failure.message,
  };
}

export function bidIntentId(jobId: string): string {
  return `bid.${jobId.trim()}`;
}
