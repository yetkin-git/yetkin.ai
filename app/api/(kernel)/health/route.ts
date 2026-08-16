import { getPrisma } from "@/lib/kernel/db";
import { probeReadiness, pingPrisma } from "@/lib/kernel/health/probe";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";
import { NextResponse } from "next/server";

export const auth = "public" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const result = await probeReadiness({
    databaseUrl: process.env.DATABASE_URL,
    env: process.env,
    pingDb: async () => {
      await pingPrisma(getPrisma());
    },
  });

  logEvent({
    level: result.statusCode === 200 ? "info" : "warn",
    event: "health.probe",
    requestId,
    status: result.statusCode,
    db: result.body.checks.db,
    route: "/api/health",
  });

  return NextResponse.json(
    { ...result.body, requestId },
    {
      status: result.statusCode,
      headers: {
        [REQUEST_ID_HEADER]: requestId,
        "cache-control": "no-store",
      },
    },
  );
}
