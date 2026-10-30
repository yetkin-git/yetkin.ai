import type { CSSProperties } from "react";

/**
 * Rakam kutusu boyası.
 * Gradyan (`background-image`) ChromeOS'ta düşerse düz `background-color` kalır.
 * Metin rengi bu zeminin hex karşılığıyla kontrastlıdır.
 */
export const JUNIOR_DIGIT_FONT = "system-ui, sans-serif";

export const JUNIOR_DIGIT_BOX_CLASS = "junior-digit-box";

export function juniorDigitBoxStyle(
  backgroundColor: string,
  color: string,
  colorScheme: "light" | "dark",
): CSSProperties {
  return {
    backgroundColor,
    color,
    colorScheme,
    fontFamily: JUNIOR_DIGIT_FONT,
    "--junior-digit-bg": backgroundColor,
  } as CSSProperties;
}
