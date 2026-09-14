import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";
import { academyCertificateVerifyUrl } from "./academy-catalog";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asInt(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

export type AcademyCertificateView =
  | { kind: "idle"; testID: "dron-certificate-idle" }
  | { kind: "loading"; testID: "dron-certificate-loading"; title: string }
  | {
      kind: "ready";
      testID: "dron-certificate-ready";
      title: string;
      courseTitle: string;
      score: number;
      certificateHash: string;
      issuedAt: string;
      sealStatus: string;
      verifyUrl: string;
    }
  | {
      kind: "error";
      testID: "dron-certificate-error";
      title: string;
      message: string;
      requestId: string | null;
    };

export function emptyAcademyCertificate(): AcademyCertificateView {
  return { kind: "idle", testID: "dron-certificate-idle" };
}

export function presentAcademyCertificateLoading(): AcademyCertificateView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.certificate.loadingTestID,
    title: RAIL_IS_COPY.certificate.loading,
  };
}

export function presentAcademyCertificate(data: unknown, apiBase: string): AcademyCertificateView {
  const root = asRecord(data);
  const certificateHash = asString(root?.certificateHash);
  const title = asString(root?.title);
  const courseTitle = asString(root?.courseTitle);
  const score = asInt(root?.score);
  const issuedAt = asString(root?.issuedAt);
  const sealStatus = asString(root?.sealStatus);
  if (!root || !certificateHash || !title || !courseTitle || score === null || !issuedAt || !sealStatus) {
    return presentAcademyCertificateFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  let verifyUrl: string;
  try {
    verifyUrl = academyCertificateVerifyUrl(apiBase, certificateHash);
  } catch (error) {
    return presentAcademyCertificateFromFailure({
      kind: "unknown",
      status: null,
      message: error instanceof Error ? error.message : RAIL_IS_COPY.unknown,
      requestId: null,
      envelopeError: null,
    });
  }
  return {
    kind: "ready",
    testID: RAIL_IS_COPY.certificate.readyTestID,
    title,
    courseTitle,
    score,
    certificateHash,
    issuedAt,
    sealStatus,
    verifyUrl,
  };
}

export function presentAcademyCertificateFromFailure(
  failure: ClassifiedV1Failure,
): AcademyCertificateView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.certificate.errorTestID,
    title: RAIL_IS_COPY.certificate.errorTitle,
    message: failure.message,
    requestId: failure.requestId,
  };
}

export function presentAcademyCertificateError(error: unknown): AcademyCertificateView {
  return presentAcademyCertificateFromFailure(classifyV1Failure(error));
}
