/**
 * Dönüşüm kancası. GTM düz nesnesi itilmez.
 * Olay `emitGa4Event` ile gider. Etiket yalnız ölçüm kimliği varken bootstrap'tan yüklenir.
 * Komut dosyası bu dosyadan çekilmez.
 */

import { emitGa4Event, trackPurchase } from "@/lib/kernel/telemetry/funnel";
import { readGaMeasurementId } from "@/lib/kernel/telemetry/measurement-id";

export const SEM_CONVERSION_EVENT = "yetkin:conversion" as const;

export const SEM_CONVERSION_NAMES = {
  purchase: "purchase",
  register: "sign_up",
  form: "generate_lead",
} as const;

export type SemConversionName = keyof typeof SEM_CONVERSION_NAMES;

export type SemConversionDetail = Readonly<Record<string, string | number | boolean>>;

function textField(detail: SemConversionDetail, key: string): string | null {
  const value = detail[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function minorField(detail: SemConversionDetail, key: string): number | null {
  const value = detail[key];
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

export function emitSemConversion(
  name: SemConversionName,
  detail: SemConversionDetail = {},
): void {
  if (typeof window === "undefined") {
    return;
  }
  const eventName = SEM_CONVERSION_NAMES[name];
  const payload = { event: eventName, ...detail };
  window.dispatchEvent(new CustomEvent(SEM_CONVERSION_EVENT, { detail: payload }));
  if (!readGaMeasurementId()) {
    return;
  }
  if (name === "purchase") {
    trackPurchase({
      itemId: textField(detail, "itemId") ?? textField(detail, "courseId"),
      itemName: textField(detail, "itemName"),
      valueMinor: minorField(detail, "valueMinor"),
      currency: textField(detail, "currency"),
      transactionId: textField(detail, "transactionId"),
    });
    return;
  }
  const params: Record<string, unknown> = {};
  if (name === "register") {
    params.method = "email";
  }
  for (const [key, value] of Object.entries(detail)) {
    if (key === "email" || key === "password") {
      continue;
    }
    params[key] = value;
  }
  emitGa4Event(eventName, params);
}
