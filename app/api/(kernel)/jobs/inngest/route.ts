import { serve } from "inngest/next";
import type { NextRequest } from "next/server";
import { licenseGapScan } from "@/app/api/(kernel)/jobs/license-gap-scan";
import { registerGrantMaintenanceHooks } from "@/app/api/(kernel)/jobs/register-grant-hooks";
import { registerTezgahRolloverHooks } from "@/app/api/(kernel)/jobs/register-rollover-hooks";
import { registerTetkikMaintenanceHooks } from "@/app/api/(kernel)/jobs/register-tetkik-hooks";
import { inngest, kernelInngestFunctions, inngestNotConfiguredResponse } from "@/lib/kernel/jobs/inngest";
import { canInvokeInngestServe, shouldFailClosedInngestServe } from "@/lib/kernel/jobs/inngest-guard";
import { registerPaytrValorLicenseHooks } from "@/app/api/(kernel)/payments/register-paytr-valor-hooks";
import { registerVerticalEscrowRefundHooks } from "../register-escrow-hooks";
import { registerHibePlatformPort } from "@/lib/yetkinhibe/platform-grant-port";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

registerVerticalEscrowRefundHooks();
registerPaytrValorLicenseHooks();
registerTezgahRolloverHooks();
registerGrantMaintenanceHooks();
registerTetkikMaintenanceHooks();
// Ş12 — platform talep portu: kernel tabloyu doğrudan okumaz, hibe kataloğu üzerinden okur.
registerHibePlatformPort();

export const auth = "webhook" as const;

type InngestHandlers = ReturnType<typeof serve>;

let handlers: InngestHandlers | null = null;

function getInngestHandlers(): InngestHandlers {
  handlers ??= serve({
    client: inngest,
    functions: [...kernelInngestFunctions, licenseGapScan],
  });
  return handlers;
}

function guard(method: "GET" | "POST" | "PUT") {
  return (request: Request, context?: unknown) => {
    if (shouldFailClosedInngestServe() || !canInvokeInngestServe()) {
      return inngestNotConfiguredResponse(resolveRequestId(request));
    }
    return getInngestHandlers()[method](request as NextRequest, context);
  };
}

export const GET = guard("GET");
export const POST = guard("POST");
export const PUT = guard("PUT");
