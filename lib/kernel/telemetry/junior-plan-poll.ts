/**
 * Junior PayTR dönüşü paket açılınca `purchase` için yoklar.
 * Dönüş sayfası (`/cuzdan`) başarı ile hatayı ayırmaz; açık paket yoksa olay basılmaz.
 */

export const JUNIOR_PLAN_POLL_GAPS_MS = [1_000, 1_500, 2_000, 3_000, 5_000, 8_000, 8_000, 8_000] as const;

export async function pollJuniorPlanActive(input: {
  readActive: () => Promise<boolean>;
  wait?: (ms: number) => Promise<void>;
  gapsMs?: readonly number[];
  shouldStop?: () => boolean;
}): Promise<boolean> {
  const gaps = input.gapsMs ?? JUNIOR_PLAN_POLL_GAPS_MS;
  const wait = input.wait ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  for (let attempt = 0; attempt <= gaps.length; attempt += 1) {
    if (input.shouldStop?.()) {
      return false;
    }
    try {
      if (await input.readActive()) {
        return true;
      }
    } catch {
      // yoklama düşerse satın alma akışı durmaz
    }
    if (attempt === gaps.length || input.shouldStop?.()) {
      return false;
    }
    await wait(gaps[attempt] ?? 0);
  }
  return false;
}
