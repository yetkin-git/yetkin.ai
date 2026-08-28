/** Sözleşme revizyon hakkı — varsayılan 3 tur (UX SSOT). */
export const DEFAULT_REVISION_ALLOWANCE = 3;

export function countRevisionRequests(messages: readonly { kind: string }[]): number {
  let used = 0;
  for (const row of messages) {
    if (row.kind === "REVISION") {
      used += 1;
    }
  }
  return used;
}

export function remainingRevisions(
  used: number,
  allowance: number = DEFAULT_REVISION_ALLOWANCE,
): number {
  return Math.max(0, allowance - used);
}

/** Hak bittiğinde veya inceleme bekleyen teslim varken onay CTA’sını öne çıkar. */
export function shouldHighlightReleaseCta(input: {
  contractStatus: string;
  remaining: number;
  hasDelivery: boolean;
}): boolean {
  if (input.contractStatus !== "FUNDED") {
    return false;
  }
  return input.remaining === 0 || input.hasDelivery;
}
