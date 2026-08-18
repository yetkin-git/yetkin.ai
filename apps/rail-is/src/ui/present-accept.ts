import {
  RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE,
} from "../contract/v1";
import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

export type AcceptFormView = {
  testID: "dron-accept-form" | "dron-accept-error" | "dron-accept-pending" | "dron-accept-insufficient";
  pending: boolean;
  error: string | null;
  requestId: string | null;
  fakeSuccess: false;
  confirmOpen: boolean;
  selectedBidId: string | null;
  insufficientBalance: boolean;
};

export function emptyAcceptForm(): AcceptFormView {
  return {
    testID: RAIL_IS_COPY.accept.formTestID,
    pending: false,
    error: null,
    requestId: null,
    fakeSuccess: false,
    confirmOpen: false,
    selectedBidId: null,
    insufficientBalance: false,
  };
}

export function presentAcceptConfirmOpen(form: AcceptFormView, bidId: string): AcceptFormView {
  return {
    ...form,
    testID: RAIL_IS_COPY.accept.formTestID,
    confirmOpen: true,
    selectedBidId: bidId,
    error: null,
    insufficientBalance: false,
    fakeSuccess: false,
  };
}

export function presentAcceptConfirmClose(form: AcceptFormView): AcceptFormView {
  return {
    ...form,
    confirmOpen: false,
  };
}

export function presentAcceptPending(form: AcceptFormView): AcceptFormView {
  return {
    ...form,
    testID: "dron-accept-pending",
    pending: true,
    confirmOpen: false,
    error: null,
    requestId: null,
    fakeSuccess: false,
    insufficientBalance: false,
  };
}

export function presentAcceptError(form: AcceptFormView, error: unknown): AcceptFormView {
  return presentAcceptFromFailure(form, classifyV1Failure(error));
}

export function presentAcceptFromFailure(
  form: AcceptFormView,
  failure: ClassifiedV1Failure,
): AcceptFormView {
  const insufficientBalance =
    failure.status === 409 && failure.envelopeError === RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE;
  return {
    ...form,
    testID: insufficientBalance
      ? RAIL_IS_COPY.accept.insufficientTestID
      : RAIL_IS_COPY.accept.errorTestID,
    pending: false,
    confirmOpen: false,
    fakeSuccess: false,
    requestId: failure.requestId,
    error: failure.message,
    insufficientBalance,
  };
}

export function isAcceptInsufficientBalance(error: unknown): boolean {
  const failure = classifyV1Failure(error);
  return failure.status === 409 && failure.envelopeError === RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE;
}

export function acceptIntentId(jobId: string, bidId: string): string {
  return `accept.${jobId.trim()}.${bidId.trim()}`;
}
