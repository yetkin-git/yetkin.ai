/**
 * CEO / Super Admin canlı yayın kapatma kilidi.
 *
 * Varsayılan **kapalı** (`false`). Üretim 503 için env
 * `LIVE_BROADCAST_SHUTDOWN=true|1` (deploy sonrası, kod sabiti değil).
 * `SITE_MAINTENANCE_FREEZE` ayrı acil bakım bayrağıdır; müze
 * `MAINTENANCE_MODE` değildir.
 *
 * Açıkken: üretim hostunda ürün 503; Inngest serve/send fail-closed;
 * PayTR bildirim ağızları 503 (CREDIT yok). Geliştirme, Vitest ve
 * localhost yok sayılır.
 */

export type LiveBroadcastShutdownEnv = {
  NODE_ENV?: string;
  VITEST?: string;
  LIVE_BROADCAST_SHUTDOWN?: string;
};

export function isLiveBroadcastShutdownFlagOn(
  env: Pick<LiveBroadcastShutdownEnv, "LIVE_BROADCAST_SHUTDOWN"> = process.env,
): boolean {
  const value = env.LIVE_BROADCAST_SHUTDOWN?.trim().toLowerCase() ?? "";
  return value === "1" || value === "true";
}

/** Süreç başlangıcındaki env anlık görüntüsü. Kenar her istekte env bag'i okur. */
export const LIVE_BROADCAST_SHUTDOWN = isLiveBroadcastShutdownFlagOn();

export function isLiveBroadcastShutdownEnvActive(
  env: LiveBroadcastShutdownEnv = process.env,
): boolean {
  if (!isLiveBroadcastShutdownFlagOn(env)) {
    return false;
  }
  if (env.VITEST === "true") {
    return false;
  }
  if (env.NODE_ENV === "development") {
    return false;
  }
  return env.NODE_ENV === "production";
}
