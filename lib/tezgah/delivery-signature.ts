/** Müşteriye giden çıktının kredi satırı. Sahte sosyal kanıt değildir. */
export const TEZGAH_DELIVERY_SIGNATURE =
  "Bu doküman/çıktı yetkin.ai AI Tezgâhı ile üretilmiştir · https://yetkin.ai/tezgah";

export function withTezgahDeliverySignature(body: string): string {
  const trimmed = body.replace(/\s+$/u, "");
  if (trimmed.includes(TEZGAH_DELIVERY_SIGNATURE)) {
    return trimmed;
  }
  return `${trimmed}\n\n${TEZGAH_DELIVERY_SIGNATURE}`;
}
