import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";

export const RAIL_IS_DELIVERY_NOTE_MIN = 8;
export const RAIL_IS_DELIVERY_NOTE_MAX = 8000;

export type DeliveryFormView = {
  testID: "dron-delivery-form" | "dron-delivery-error" | "dron-delivery-pending";
  contractId: string;
  note: string;
  pending: boolean;
  error: string | null;
  requestId: string | null;
  fakeSuccess: false;
};

export function emptyDeliveryForm(contractId: string, note = ""): DeliveryFormView {
  return {
    testID: RAIL_IS_COPY.delivery.formTestID,
    contractId,
    note,
    pending: false,
    error: null,
    requestId: null,
    fakeSuccess: false,
  };
}

export function presentDeliveryPending(form: DeliveryFormView): DeliveryFormView {
  return {
    ...form,
    testID: "dron-delivery-pending",
    pending: true,
    error: null,
    requestId: null,
    fakeSuccess: false,
  };
}

export function presentDeliveryError(form: DeliveryFormView, error: unknown): DeliveryFormView {
  return presentDeliveryFromFailure(form, classifyV1Failure(error));
}

export function presentDeliveryFromFailure(
  form: DeliveryFormView,
  failure: ClassifiedV1Failure,
): DeliveryFormView {
  return {
    ...form,
    testID: RAIL_IS_COPY.delivery.errorTestID,
    pending: false,
    fakeSuccess: false,
    requestId: failure.requestId,
    error: failure.message,
  };
}

export function assertDeliveryNote(raw: string): string {
  const note = raw.trim();
  if (note.length < RAIL_IS_DELIVERY_NOTE_MIN || note.length > RAIL_IS_DELIVERY_NOTE_MAX) {
    throw new Error(RAIL_IS_COPY.delivery.noteBand);
  }
  return note;
}

export function deliveryIntentId(contractId: string): string {
  return `delivery.${contractId.trim()}`;
}
