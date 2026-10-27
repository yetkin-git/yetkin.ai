/**
 * PayTR iframe kapandıktan sonra CREDIT yarışını bekler (K2).
 *
 * Eski davranış 3 × 1 sn idi; PayTR bildirimi (callback) bu pencereden
 * sık sık geç gelir ve kullanıcı ödediği hâlde hata görürdü.
 * Yeni davranış kademelidir: kısa aralıklarla başlayıp seyrekleşen
 * yoklamalar toplam ~10 saniyelik bir pencereyi kaplar. Pencere dolarsa
 * sonuç "başarısız ödeme" değildir; çağıran, kullanıcıya
 * "İşleminiz onaylanıyor…" ara durumunu gösterir (sahte bakiye yazılmaz).
 */

/** Toplam yoklama penceresi (ms). Gap'lerin toplamıyla aynıdır + ilk okuma. */
export const ACADEMY_CREDIT_POLL_WINDOW_MS = 10_000;

/** Kademeli aralıklar: 0.5 + 1 + 1.5 + 2 + 2.5 + 2.5 = 10 sn. */
export const ACADEMY_CREDIT_POLL_GAPS_MS = [500, 1_000, 1_500, 2_000, 2_500, 2_500] as const;

/** İlk okuma + her gap sonrası bir okuma. */
export const ACADEMY_CREDIT_POLL_ATTEMPTS = ACADEMY_CREDIT_POLL_GAPS_MS.length + 1;

/** Geriye dönük uyum: ilk kademeli aralık. Yeni kod `GAPS_MS` kullanır. */
export const ACADEMY_CREDIT_POLL_GAP_MS = ACADEMY_CREDIT_POLL_GAPS_MS[0];

export type CreditPollPhase = "polling" | "funded" | "pending";

export async function pollWalletCredit(input: {
  requiredMinor: number;
  readBalance: () => Promise<{ live: boolean; amountMinor: number }>;
  wait?: (ms: number) => Promise<void>;
  attempts?: number;
  gapMs?: number;
  gapsMs?: readonly number[];
  /** Her denemeden sonra ara durum bildirimi (örn. "onaylanıyor" UI'ı). */
  onPhase?: (phase: CreditPollPhase, attempt: number) => void;
}): Promise<boolean> {
  const gaps: readonly number[] =
    input.gapsMs ??
    (input.gapMs !== undefined
      ? Array.from({ length: Math.max(0, (input.attempts ?? ACADEMY_CREDIT_POLL_ATTEMPTS) - 1) }, () => input.gapMs as number)
      : ACADEMY_CREDIT_POLL_GAPS_MS);
  const attempts = input.attempts ?? gaps.length + 1;
  const wait = input.wait ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  for (let index = 0; index < attempts; index += 1) {
    const strip = await input.readBalance();
    if (strip.live && strip.amountMinor >= input.requiredMinor) {
      input.onPhase?.("funded", index);
      return true;
    }
    if (index < attempts - 1) {
      input.onPhase?.("polling", index);
      await wait(gaps[index] ?? gaps[gaps.length - 1] ?? 1_000);
    }
  }
  input.onPhase?.("pending", attempts - 1);
  return false;
}
