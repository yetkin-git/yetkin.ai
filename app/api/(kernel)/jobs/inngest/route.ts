import { serve } from "inngest/next";
import type { NextRequest } from "next/server";
import { inngest, kernelInngestFunctions, inngestNotConfiguredResponse } from "@/lib/kernel/jobs/inngest";
import { canInvokeInngestServe, shouldFailClosedInngestServe } from "@/lib/kernel/jobs/inngest-guard";
import { arenaInngestFunctions } from "@/lib/arena/jobs";
import { registerVerticalEscrowRefundHooks } from "../register-escrow-hooks";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

registerVerticalEscrowRefundHooks();

export const auth = "webhook" as const;

type InngestHandlers = ReturnType<typeof serve>;

let handlers: InngestHandlers | null = null;

function getInngestHandlers(): InngestHandlers {
  handlers ??= serve({
    client: inngest,
    functions: [...kernelInngestFunctions, ...arenaInngestFunctions],
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
