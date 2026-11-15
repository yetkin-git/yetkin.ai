import {
  projectCommandCenter,
  type CommandCenterModel,
  type CommandQuotaRead,
  type CommandStoreRead,
} from "@/lib/dashboard/command-center";
import type { DashboardPulse } from "@/lib/dashboard/pulse";
import { TEZGAH_MEMBER_DAILY_LIMIT, TEZGAH_TOOLS } from "@/lib/tezgah/catalog";
import { peekTezgahQuota } from "@/lib/tezgah/quota";

export type SignedInCommand = {
  pulse: DashboardPulse;
  model: CommandCenterModel;
};

const QUOTA_DOWN: CommandQuotaRead = {
  live: false,
  remaining: 0,
  limit: TEZGAH_MEMBER_DAILY_LIMIT,
};

type StoreLoad =
  | { kind: "ok"; value: readonly { status: "DRAFT" | "ACTIVE" }[] }
  | { kind: "down" }
  | { kind: "missing" };

/** Üye kotası. Hak düşmez. Okunamazsa canlı sayı basılmaz. */
export function readMemberTezgahQuota(userId: string): CommandQuotaRead {
  const id = userId.trim();
  if (!id) {
    return QUOTA_DOWN;
  }
  try {
    const quota = peekTezgahQuota(id, false);
    return { live: true, remaining: quota.remaining, limit: quota.limit };
  } catch {
    return QUOTA_DOWN;
  }
}

/** Paralel okumaların dürüst karta dönüşü. Yazma yok. */
export function assembleSignedInCommand(input: {
  pulse: DashboardPulse;
  stores: StoreLoad;
  quota: CommandQuotaRead;
}): SignedInCommand {
  const storeRead: CommandStoreRead =
    input.stores.kind === "ok"
      ? { kind: "ok", stores: input.stores.value.map((store) => ({ status: store.status })) }
      : { kind: "down" };
  return {
    pulse: input.pulse,
    model: projectCommandCenter({
      pulse: input.pulse,
      stores: storeRead,
      quota: input.quota,
      toolCount: TEZGAH_TOOLS.length,
    }),
  };
}
