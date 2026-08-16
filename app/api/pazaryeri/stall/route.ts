import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    const user = await requireSession(request);
    const ports = createPrismaPazaryeriPorts();
    const products = await ports.pazaryeri.listProductsBySeller(user.id);
    return jsonOk({ products });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
