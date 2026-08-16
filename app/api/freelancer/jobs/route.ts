import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createFreelancerJob } from "@/lib/freelancer/engine";
import { createJobInputSchema } from "@/lib/freelancer/schemas";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const ports = createPrismaFreelancerPorts();
    const jobs = await ports.freelancer.listOpenJobs();
    return jsonOk({ jobs });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = createJobInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("İlan alanları geçersiz.", 400);
    }
    const ports = createPrismaFreelancerPorts();
    const job = await createFreelancerJob(ports, {
      clientId: user.id,
      title: parsed.data.title,
      brief: parsed.data.brief,
      budgetMinor: parsed.data.budgetMinor,
    });
    return jsonOk({ job }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
