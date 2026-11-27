import {
  decideOutreachDraft,
  saveOutreachDraft,
} from "@/lib/kernel/outreach/write";
import { parseOutreachDraftEdit } from "@/lib/kernel/outreach/policy";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;
export const maxDuration = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Taslak düzenleme. Düzenlenen taslak yeniden onaya döner (onay metne bağlıdır). */
export async function PATCH(request: Request) {
  try {
    await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const edit = parseOutreachDraftEdit(body);
    if (!edit.ok) {
      throw new BadRequestError(edit.reason);
    }
    await saveOutreachDraft(edit.value);
    return jsonOk({ id: edit.value.id, status: "PENDING_APPROVAL" }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

/** Onay / ret kararı. */
export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.id !== "string") {
      throw new BadRequestError("Taslak kimliği yok.");
    }
    if (body.decision !== "approve" && body.decision !== "reject") {
      throw new BadRequestError("Karar onay veya ret olmalı.");
    }
    await decideOutreachDraft({
      actorUserId: session.id,
      id: body.id.trim(),
      decision: body.decision,
      subject: typeof body.subject === "string" ? body.subject : undefined,
      body: typeof body.body === "string" ? body.body : undefined,
    });
    return jsonOk(
      { id: body.id.trim(), status: body.decision === "approve" ? "APPROVED" : "REJECTED" },
      200,
      undefined,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
