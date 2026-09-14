import {
  FUNNEL_DEFAULT_RANGE,
  FUNNEL_RANGE_INVALID,
  FUNNEL_TIME_ZONE,
  isFunnelRange,
  type FunnelRange,
} from "@/lib/kernel/admin/funnel-constants";
import type { FunnelWindow } from "@/lib/kernel/admin/funnel-types";
import { BadRequestError } from "@/lib/kernel/http/errors";

/** Türkiye 2016'dan beri kalıcı UTC+3 — İstanbul takvim günü bu ofsetle kilitlenir. */
const ISTANBUL_OFFSET = "+03:00";

const RANGE_DAYS: Record<FunnelRange, number> = {
  today: 1,
  "7d": 7,
  "30d": 30,
};

export function istanbulYmd(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUNNEL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addIstanbulDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = Date.UTC(year!, month! - 1, day! + days);
  const shifted = new Date(utc);
  const yy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function istanbulMidnightUtc(ymd: string): Date {
  return new Date(`${ymd}T00:00:00${ISTANBUL_OFFSET}`);
}

export function resolveFunnelWindow(range: FunnelRange, now: Date = new Date()): FunnelWindow {
  const today = istanbulYmd(now);
  const dayCount = RANGE_DAYS[range];
  const fromYmd = addIstanbulDays(today, -(dayCount - 1));
  const toYmdExclusive = addIstanbulDays(today, 1);
  return {
    range,
    timeZone: FUNNEL_TIME_ZONE,
    fromYmd,
    toYmdExclusive,
    from: istanbulMidnightUtc(fromYmd),
    to: istanbulMidnightUtc(toYmdExclusive),
  };
}

export function parseFunnelRangeParam(raw: string | null | undefined): FunnelRange {
  if (raw == null || raw.trim() === "") {
    return FUNNEL_DEFAULT_RANGE;
  }
  const value = raw.trim();
  if (!isFunnelRange(value)) {
    throw new BadRequestError(FUNNEL_RANGE_INVALID);
  }
  return value;
}

/** HTML sığınağı geçersiz sorguyu 400 yapmaz; varsayılan pencereye iner. */
export function coerceFunnelRange(raw: string | null | undefined): FunnelRange {
  try {
    return parseFunnelRangeParam(raw);
  } catch {
    return FUNNEL_DEFAULT_RANGE;
  }
}
