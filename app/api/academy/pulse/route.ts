import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaAcademyPorts();
    const pulse = await ports.academy.pulseForUser(user.id);
    return jsonOk({ pulse: { ...pulse, live: true } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("DATABASE_URL")) {
      return jsonOk({
        pulse: {
          live: false,
          purchasesCount: 0,
          certificatesHeld: 0,
          lastCertificateTitle: null,
          currencyCode: "TRY",
        },
      });
    }
    return jsonFromUnknown(error);
  }
}
