import { generateSocialReply } from "@/lib/kernel/admin/social-generate";
import { isSocialModule, resolveReplyModule } from "@/lib/kernel/admin/social-desk";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;
export const maxDuration = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.inbound !== "string") {
      throw new BadRequestError("Gelen yorum yok.");
    }
    const inbound = body.inbound.trim();
    if (inbound.length < 2 || inbound.length > 4000) {
      throw new BadRequestError("Gelen yorum 2–4000 karakter olmalı.");
    }
    const selected = isSocialModule(body.module) ? body.module : null;
    const socialModule = resolveReplyModule(inbound, selected);
    const reply = await generateSocialReply({ inbound, module: socialModule, userId: session.id });
    return jsonOk(
      { draft: reply.draft, module: socialModule, source: reply.source, note: reply.note },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
