import { NextResponse, type NextRequest } from "next/server";
import { createLicenseGapPorts } from "@/app/api/(kernel)/payments/license-gap-runtime";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { runLicenseGapScan } from "@/lib/kernel/payments/license-gap";
import {
  cronBearerMatches,
  CRON_UNAUTHORIZED_ERROR,
  CRON_UNCONFIGURED_ERROR,
  readCronSecret,
} from "@/lib/kernel/security/api-auth";

/**
 * CLEARED ödeme ile açılmamış lisans alarmı.
 * Yetki: `Authorization: Bearer ${CRON_SECRET}`. Oturum rotayı açmaz.
 * `CRON_SECRET` boşsa 503.
 *
 * Zaman: `vercel.json` `15 3 * * *` (UTC, günde bir).
 * Hobby planı on beş dakikalık cron ifadesini dağıtımda reddeder.
 * On beş dakika Inngest `license-gap-scan` işidir.
 * Eksik lisans > 0 ise gövde 500 döner; log `license.gap` error basar.
 * SUCCEEDED kart iadesi alarm sayılmaz. Cüzdan düzeltilmez.
 */
export const auth = "cron" as const;

function isAuthorized(request: NextRequest): boolean {
  return cronBearerMatches(request.headers.get("authorization"), readCronSecret());
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request);
  const headers = { [REQUEST_ID_HEADER]: requestId, "cache-control": "no-store" };

  if (!readCronSecret()) {
    return NextResponse.json(
      { ok: false, error: CRON_UNCONFIGURED_ERROR },
      { status: 503, headers },
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: CRON_UNAUTHORIZED_ERROR }, { status: 401, headers });
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { ok: true, noop: true, reason: "database_unconfigured", gaps: 0 },
      { status: 200, headers },
    );
  }

  const result = await runLicenseGapScan(createLicenseGapPorts(), requestId);
  return NextResponse.json(
    { ok: result.gaps === 0, ...result },
    { status: result.gaps > 0 ? 500 : 200, headers },
  );
}
