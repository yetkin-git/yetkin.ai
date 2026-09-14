import {
  ensurePrismaQueryEngine,
  getPrisma,
  pingRuntimePool,
  refreshPrismaConnection,
} from "@/lib/kernel/db";
import {
  HEALTH_DB_PING_TIMEOUT_MS,
  pingPrisma,
  probeReadiness,
} from "@/lib/kernel/health/probe";
import { buildV1FailBody, buildV1OkBody } from "@/lib/kernel/http/api-v1";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { v1EnvelopeHeaders } from "@/lib/kernel/http/unversioned-sunset";
import { logEvent } from "@/lib/kernel/observability/log";
import { NextResponse } from "next/server";

export const auth = "public" as const;

export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  const result = await probeReadiness({
    databaseUrl: process.env.DATABASE_URL,
    env: process.env,
    pingDb: async () => {
      try {
        await pingRuntimePool(HEALTH_DB_PING_TIMEOUT_MS);
      } catch {
        await refreshPrismaConnection();
        await pingRuntimePool(HEALTH_DB_PING_TIMEOUT_MS);
      }
      if (!(await ensurePrismaQueryEngine())) {
        throw new Error("prisma_engine_not_ready");
      }
      try {
        await pingPrisma(getPrisma());
      } catch {
        await refreshPrismaConnection();
        await pingRuntimePool(HEALTH_DB_PING_TIMEOUT_MS);
        if (!(await ensurePrismaQueryEngine())) {
          throw new Error("prisma_engine_not_ready");
        }
        await pingPrisma(getPrisma());
      }
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
