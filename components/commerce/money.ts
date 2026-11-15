export function minorToLiraInput(amountMinor: number | null): string {
  if (amountMinor == null) {
    return "";
  }
  const whole = Math.trunc(amountMinor / 100);
  const frac = Math.abs(amountMinor % 100);
  if (frac === 0) {
    return String(whole);
  }
  return `${whole},${String(frac).padStart(2, "0")}`;
}

export function liraInputToMinor(raw: string): number | null | "invalid" {
  const text = raw.trim().replace(/\s/g, "");
  if (!text) {
    return null;
  }
  const normalized = text.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return "invalid";
  }
  const [whole, frac = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

export function barcodeOk(value: string): boolean {
  return /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value.trim());
}
