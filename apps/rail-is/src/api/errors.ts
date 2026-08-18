import type { RailV1FailBody } from "../contract/v1";
import { RAIL_V1_PARSE_FAIL } from "../contract/v1";

/** Katı zarf hata gövdesi — `data` yoktur; liste/bakiye uydurulmaz. */
export class RailV1HttpError extends Error {
  readonly status: number;
  readonly envelope: RailV1FailBody;

  constructor(status: number, envelope: RailV1FailBody) {
    super(envelope.error);
    this.name = "RailV1HttpError";
    this.status = status;
    this.envelope = envelope;
  }

  get citizenMessage(): string {
    return this.envelope.error;
  }
}

/** HTML, versiyonsuz JSON veya bozuk gövde — boş home değildir. */
export class RailV1ProtocolError extends Error {
  readonly status: number | null;

  constructor(message = RAIL_V1_PARSE_FAIL, status: number | null = null) {
    super(message);
    this.name = "RailV1ProtocolError";
    this.status = status;
  }
}

export function isRailV1ClientError(error: unknown): error is RailV1HttpError | RailV1ProtocolError {
  return error instanceof RailV1HttpError || error instanceof RailV1ProtocolError;
}
