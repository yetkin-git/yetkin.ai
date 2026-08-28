import { requireCitizenAuth } from "@/lib/kernel/auth/session";
import { CITIZEN_PASSWORD_MIN_LENGTH } from "@/lib/kernel/auth/password";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { z } from "zod";

export const auth = "session" as const;

const bodySchema = z.object({
  password: z.string().min(CITIZEN_PASSWORD_MIN_LENGTH).max(256),
});

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const citizen = await requireCitizenAuth(request);
    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Geçersiz şifre.", 400, requestId, request);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
    if (!url || !anon) {
      return jsonFail("Kimlik bağlantısı kapalı.", 503, requestId, request);
    }

    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${citizen.accessToken}` } },
    });
    const { error } = await client.auth.updateUser({ password: parsed.data.password });
    if (error) {
      return jsonFail("Şifre güncellenemedi.", 400, requestId, request);
    }
    return jsonOk({ updated: true }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 401, requestId, request);
  }
}
