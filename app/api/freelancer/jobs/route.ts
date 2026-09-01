import { requireSession } from "@/lib/kernel/auth/session";
import { DATABASE_BUSY_ERROR, isPrismaUnavailableError } from "@/lib/kernel/db-errors";
import { ensurePrismaQueryEngine } from "@/lib/kernel/db";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { readIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { createFreelancerJob } from "@/lib/freelancer/engine";
import { createJobInputSchema } from "@/lib/freelancer/schemas";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

const JOBS_ROUTE = "/api/freelancer/jobs";

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const ports = createPrismaFreelancerPorts();
    const jobs = await ports.freelancer.listOpenJobs();
    return jsonOk({ jobs }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    if (!(await ensurePrismaQueryEngine())) {
      throw new ServiceUnavailableError(DATABASE_BUSY_ERROR);
    }
    const idempotency = readIdempotencyKey(request);
    if (!idempotency.ok) {
      return jsonFail(idempotency.error, 400, requestId, request);
    }
    const parsed = createJobInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("İlan alanları geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: user.id,
        route: JOBS_ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload({
          title: parsed.data.title,
          brief: parsed.data.brief,
          budgetMinor: parsed.data.budgetMinor,
          visaPathwayId: parsed.data.visaPathwayId,
        }),
        requestId,
        request,
      },
      async () => {
        const ports = createPrismaFreelancerPorts();
        const job = await createFreelancerJob(ports, {
          clientId: user.id,
          title: parsed.data.title,
          brief: parsed.data.brief,
          budgetMinor: parsed.data.budgetMinor,
          visaPathwayId: parsed.data.visaPathwayId,
        });
        return { status: 201, body: { job } };
      },
    );
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return jsonFromUnknown(error, 503, requestId, request);
    }
    if (isPrismaUnavailableError(error)) {
      return jsonFromUnknown(new ServiceUnavailableError(DATABASE_BUSY_ERROR), 503, requestId, request);
    }
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
