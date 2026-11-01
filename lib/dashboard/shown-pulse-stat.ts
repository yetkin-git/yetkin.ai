import type { ReactNode } from "react";

export type ShownPulseStat = {
  label: string;
  value: ReactNode;
};

/**
 * Canlı sayaç 0 ise kartta yer kaplamaz.
 * Nabız yüklenmediyse "—" kalır; soğuk sıfır basılmaz.
 */
export function shownPulseStat(label: string, value: number, live: boolean): ShownPulseStat | null {
  if (!live) {
    return { label, value: "—" };
  }
  if (value > 0) {
    return { label, value };
  }
  return null;
}
