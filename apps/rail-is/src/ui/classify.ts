import { RailV1HttpError, RailV1ProtocolError } from "../api/errors";
import { RAIL_V1_CLIENT_STALE, RAIL_V1_PARSE_FAIL } from "../contract/v1";
import { RAIL_IS_COPY } from "./copy";

export type ClassifiedV1Failure = {
  kind: "session" | "stale" | "protocol" | "http" | "unknown";
  status: number | null;
  message: string;
  requestId: string | null;
  envelopeError: string | null;
};

/**
 * 401 → giriş kapısı (istemci refresh'i zaten denedi).
 * 426 → mağaza kilit ekranı.
 * 400/403/409/500 → zarfın error cümlesi; sahte başarı yok.
 * Parse fail → boş liste/bakiye değil.
 */
export function classifyV1Failure(error: unknown): ClassifiedV1Failure {
  if (error instanceof RailV1HttpError) {
    if (error.status === 401) {
      return {
        kind: "session",
        status: 401,
        message: error.citizenMessage,
        requestId: error.envelope.requestId,
        envelopeError: error.citizenMessage,
      };
    }
    if (error.status === 426) {
      return {
        kind: "stale",
        status: 426,
        message: RAIL_IS_COPY.stale.title,
        requestId: error.envelope.requestId,
        envelopeError: error.citizenMessage || RAIL_V1_CLIENT_STALE,
      };
    }
    return {
      kind: "http",
      status: error.status,
      message: error.citizenMessage,
      requestId: error.envelope.requestId,
      envelopeError: error.citizenMessage,
    };
  }
  if (error instanceof RailV1ProtocolError) {
    return {
      kind: "protocol",
      status: error.status,
      message: error.message || RAIL_V1_PARSE_FAIL,
      requestId: null,
      envelopeError: null,
    };
  }
  if (error instanceof Error && error.message.trim()) {
    return {
      kind: "unknown",
      status: null,
      message: error.message,
      requestId: null,
      envelopeError: null,
    };
  }
  return {
    kind: "unknown",
    status: null,
    message: RAIL_IS_COPY.unknown,
    requestId: null,
    envelopeError: null,
  };
}

export function isGlobalGate(failure: ClassifiedV1Failure): failure is ClassifiedV1Failure & {
  kind: "session" | "stale";
} {
  return failure.kind === "session" || failure.kind === "stale";
}

export function pickGlobalGate(
  failures: ClassifiedV1Failure[],
): "stale" | "session" | null {
  if (failures.some((item) => item.kind === "stale")) {
    return "stale";
  }
  if (failures.some((item) => item.kind === "session")) {
    return "session";
  }
  return null;
}
