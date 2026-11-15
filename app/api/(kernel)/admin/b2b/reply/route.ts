import { composeB2bReplyDraft, type B2bLeadChannel } from "@/lib/kernel/admin/b2b-outbound";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function channelOf(value: unknown): B2bLeadChannel | null {
  if (value === "WEB_TETKIK" || value === "TUBITAK_HIBE") {
    return value;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.inbound !== "string") {
      throw new BadRequestError("Gelen yanıt yok.");
    }
    const channel = channelOf(body.channel);
    if (!channel) {
      throw new BadRequestError("Kanal WEB_TETKIK veya TUBITAK_HIBE olmalı.");
    }
    const inbound = body.inbound.trim();
    if (inbound.length < 2 || inbound.length > 4000) {
      throw new BadRequestError("Gelen yanıt 2–4000 karakter olmalı.");
    }
    const companyName = typeof body.companyName === "string" ? body.companyName : "";
    const draft = composeB2bReplyDraft({ companyName, channel, inbound });
    return jsonOk({ draft }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
