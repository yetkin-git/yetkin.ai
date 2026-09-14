import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

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

export type AcademyPulseView =
  | { kind: "idle"; testID: "dron-academy-pulse-idle" }
  | { kind: "loading"; testID: "dron-academy-pulse-loading"; title: string }
  | {
      kind: "ready";
      testID: "dron-academy-pulse-ready";
      live: boolean;
      purchasesCount: number;
      certificatesHeld: number;
      lastCertificateTitle: string | null;
      lastCourseSlug: string | null;
      nextLessonKey: string | null;
    }
  | {
      kind: "error";
      testID: "dron-academy-pulse-error";
      title: string;
      message: string;
      requestId: string | null;
    };

export function presentAcademyPulseLoading(): AcademyPulseView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.academy.pulseLoadingTestID,
    title: RAIL_IS_COPY.academy.pulseLoading,
  };
}

export function presentAcademyPulse(data: unknown): AcademyPulseView {
  const root = asRecord(data);
  const pulse = asRecord(root?.pulse) ?? root;
  if (!pulse) {
    return presentAcademyPulseFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  const purchasesCount = asInt(pulse.purchasesCount);
  const certificatesHeld = asInt(pulse.certificatesHeld);
  if (purchasesCount === null || certificatesHeld === null) {
    return presentAcademyPulseFromFailure({
      kind: "protocol",
      status: null,
      message: RAIL_IS_COPY.protocol,
      requestId: null,
      envelopeError: null,
    });
  }
  return {
    kind: "ready",
    testID: RAIL_IS_COPY.academy.pulseReadyTestID,
    live: pulse.live === true,
    purchasesCount,
    certificatesHeld,
    lastCertificateTitle: asString(pulse.lastCertificateTitle),
    lastCourseSlug: asString(pulse.lastCourseSlug),
    nextLessonKey: asString(pulse.nextLessonKey),
  };
}

export function presentAcademyPulseFromFailure(failure: ClassifiedV1Failure): AcademyPulseView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.academy.pulseErrorTestID,
    title: RAIL_IS_COPY.academy.pulseErrorTitle,
    message: failure.message,
    requestId: failure.requestId,
  };
}

export function presentAcademyPulseError(error: unknown): AcademyPulseView {
  return presentAcademyPulseFromFailure(classifyV1Failure(error));
}
