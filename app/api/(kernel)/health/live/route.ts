import { probeLiveness } from "@/lib/kernel/health/probe";
import { buildV1FailBody, buildV1OkBody } from "@/lib/kernel/http/api-v1";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { v1EnvelopeHeaders } from "@/lib/kernel/http/unversioned-sunset";
import { logEvent } from "@/lib/kernel/observability/log";
import { NextResponse } from "next/server";

export const auth = "public" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const result = probeLiveness(process.env);

  logEvent({
    level: "info",
    event: "health.live",
    requestId,
    status: result.statusCode,
    route: "/api/health/live",
  });

  const headers = {
    [REQUEST_ID_HEADER]: requestId,
    "cache-control": "no-store",
    ...v1EnvelopeHeaders(),
  };

  const data = {
    service: result.body.service,
    probe: result.body.probe,
    status: result.body.status,
    checks: result.body.checks,
  };
  if (result.statusCode >= 200 && result.statusCode < 300) {
    return NextResponse.json(buildV1OkBody(data, requestId), {
      status: result.statusCode,
      headers,
    });
  }
  return NextResponse.json(
    buildV1FailBody(result.body.error ?? "Omurga hazır değil.", requestId),
    { status: result.statusCode, headers },
  );
}
