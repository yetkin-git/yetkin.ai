export function pickLatestDeliveryMessage<T extends { kind: string; createdAt: Date | string }>(
  messages: readonly T[],
): T | null {
  let latest: T | null = null;
  let latestMs = Number.NEGATIVE_INFINITY;
  for (const row of messages) {
    if (row.kind !== "DELIVERY") {
      continue;
    }
    const ms = new Date(row.createdAt).getTime();
    if (!Number.isFinite(ms)) {
      continue;
    }
    if (ms >= latestMs) {
      latest = row;
      latestMs = ms;
    }
  }
  return latest;
}

export function shouldShowDeliveryHero(input: {
  contractStatus: string;
  hasDelivery: boolean;
}): boolean {
  return input.hasDelivery && input.contractStatus === "FUNDED";
}
