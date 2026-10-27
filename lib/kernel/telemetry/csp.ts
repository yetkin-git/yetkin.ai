/**
 * Ölçüm kimliği geçerliyken kenar CSP'ye eklenecek kökenler.
 * Dizeler kenar kaynağında durmaz; kimlik yoksa ek boştur.
 */

import { readGaMeasurementId } from "@/lib/kernel/telemetry/measurement-id";

type Ga4CspEnv = {
  NEXT_PUBLIC_GA_ID?: string;
};

const TAG_ORIGIN = "https://www.googletagmanager.com";
const COLLECT_ORIGINS = [
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  TAG_ORIGIN,
].join(" ");

function measurementIdForCsp(env: Ga4CspEnv): string | null {
  if (env !== process.env && !("NEXT_PUBLIC_GA_ID" in env)) {
    return null;
  }
  const raw = env === process.env ? process.env.NEXT_PUBLIC_GA_ID : env.NEXT_PUBLIC_GA_ID;
  if (raw == null || raw.trim() === "") {
    return null;
  }
  return readGaMeasurementId(raw);
}

/** CSP2 `script-src` yedeği. CSP3 nonce + strict-dynamic host listesini yok sayar. */
export function ga4ScriptSrcExtra(env: Ga4CspEnv): string {
  return measurementIdForCsp(env) ? ` ${TAG_ORIGIN}` : "";
}

/** GA4 collect / gtag beacon. */
export function ga4ConnectSrcExtra(env: Ga4CspEnv): string {
  return measurementIdForCsp(env) ? ` ${COLLECT_ORIGINS}` : "";
}
