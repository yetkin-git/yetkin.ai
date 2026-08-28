import {
  RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE,
  RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE,
} from "../contract/v1";
import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

export type AcceptFormView = {
  testID:
    | "dron-accept-form"
    | "dron-accept-error"
    | "dron-accept-pending"
    | "dron-accept-insufficient"
    | "dron-accept-payments-closed";
  pending: boolean;
  error: string | null;
  requestId: string | null;
  fakeSuccess: false;
  confirmOpen: boolean;
  selectedBidId: string | null;
  insufficientBalance: boolean;
  paymentsUnconfigured: boolean;
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
    paymentsUnconfigured: false,
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
    paymentsUnconfigured: false,
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
    paymentsUnconfigured: false,
  };
}

export function presentAcceptError(form: AcceptFormView, error: unknown): AcceptFormView {
  return presentAcceptFromFailure(form, classifyV1Failure(error));
}

export function presentAcceptFromFailure(
  form: AcceptFormView,
  failure: ClassifiedV1Failure,
): AcceptFormView {
  const paymentsUnconfigured =
    failure.status === 503 && failure.envelopeError === RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE;
  const insufficientBalance = failure.envelopeError === RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE;
  return {
    ...form,
    testID: paymentsUnconfigured
      ? RAIL_IS_COPY.accept.paymentsClosedTestID
      : insufficientBalance
        ? RAIL_IS_COPY.accept.insufficientTestID
        : RAIL_IS_COPY.accept.errorTestID,
    pending: false,
    confirmOpen: false,
    fakeSuccess: false,
    requestId: failure.requestId,
    error: paymentsUnconfigured ? RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE : failure.message,
    insufficientBalance,
    paymentsUnconfigured,
  };
}

export function isAcceptInsufficientBalance(error: unknown): boolean {
  const failure = classifyV1Failure(error);
  return failure.envelopeError === RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE;
}

export function isAcceptPaymentsUnconfigured(error: unknown): boolean {
  const failure = classifyV1Failure(error);
  return failure.status === 503 && failure.envelopeError === RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE;
}

export function acceptIntentId(jobId: string, bidId: string): string {
  return `accept.${jobId.trim()}.${bidId.trim()}`;
}
