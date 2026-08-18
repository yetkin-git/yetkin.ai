import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

export type ReleaseFormView = {
  testID: "dron-release-form" | "dron-release-error" | "dron-release-pending";
  contractId: string;
  pending: boolean;
  error: string | null;
  requestId: string | null;
  fakeSuccess: false;
};

export function emptyReleaseForm(contractId: string): ReleaseFormView {
  return {
    testID: RAIL_IS_COPY.release.formTestID,
    contractId,
    pending: false,
    error: null,
    requestId: null,
    fakeSuccess: false,
  };
}

export function presentReleasePending(form: ReleaseFormView): ReleaseFormView {
  return {
    ...form,
    testID: "dron-release-pending",
    pending: true,
    error: null,
    requestId: null,
    fakeSuccess: false,
  };
}

export function presentReleaseError(form: ReleaseFormView, error: unknown): ReleaseFormView {
  return presentReleaseFromFailure(form, classifyV1Failure(error));
}

export function presentReleaseFromFailure(
  form: ReleaseFormView,
  failure: ClassifiedV1Failure,
): ReleaseFormView {
  return {
    ...form,
    testID: RAIL_IS_COPY.release.errorTestID,
    pending: false,
    fakeSuccess: false,
    requestId: failure.requestId,
    error: failure.message,
  };
}

export function releaseIntentId(contractId: string): string {
  return `release.${contractId.trim()}`;
}
