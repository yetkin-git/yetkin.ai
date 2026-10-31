import type { FunnelRange } from "@/lib/kernel/admin/funnel-constants";

/** Realtime `activeUsers` penceresi. Canlı soket değildir. */
export const GA4_REALTIME_WINDOW_MINUTES = 30 as const;

/** Kota: kanal ve ülke kartı en fazla bu kadar satır ister. */
export const GA4_BREAKDOWN_LIMIT = 8 as const;

/** Aynı izolatta tekrar vuruşu keser. Sunucusuzda kova süreç başınadır. */
export const GA4_CACHE_SUCCESS_MS = 3 * 60 * 1000;

/** Hatalı yanıtı kısa süre tutar; admin yenilemesi kotayı doldurmasın. */
export const GA4_CACHE_FAILURE_MS = 60 * 1000;

/** Google yanıtı bu sürede gelmezse kart kapanır; huni bekletilmez. */
export const GA4_READ_TIMEOUT_MS = 8_000;

export const GA4_CHANNEL_DIMENSION = "sessionDefaultChannelGroup" as const;
export const GA4_COUNTRY_DIMENSION = "country" as const;
export const GA4_SESSIONS_METRIC = "sessions" as const;
export const GA4_ACTIVE_USERS_METRIC = "activeUsers" as const;

export type Ga4DimensionName = typeof GA4_CHANNEL_DIMENSION | typeof GA4_COUNTRY_DIMENSION;

export type Ga4DimensionRow = {
  label: string;
  sessions: number;
};

export type Ga4RealtimeSnapshot = {
  activeUsers: number;
  windowMinutes: typeof GA4_REALTIME_WINDOW_MINUTES;
};

export type Ga4TrafficSnapshot = {
  range: FunnelRange;
  fromYmd: string;
  toYmd: string;
  channels: Ga4DimensionRow[];
  countries: Ga4DimensionRow[];
};

export type Ga4UnavailableReason = "config" | "upstream";

export type Ga4ReadResult<T> =
  | { access: "ok"; snapshot: T }
  | { access: "unavailable"; reason: Ga4UnavailableReason };

/** Kart kendi başına kapanabilir. Kapalı kartta sayı yoktur. */
export type Ga4Card<T> = { access: "ok"; value: T } | { access: "unavailable" };

export type AdminGa4Board =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | {
      access: "ok";
      range: FunnelRange;
      fromYmd: string;
      toYmd: string;
      realtime: Ga4Card<Ga4RealtimeSnapshot>;
      traffic: Ga4Card<Pick<Ga4TrafficSnapshot, "channels" | "countries">>;
    };
