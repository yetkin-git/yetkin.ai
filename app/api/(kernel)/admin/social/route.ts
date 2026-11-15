import { generateSocialPackage } from "@/lib/kernel/admin/social-generate";
import { loadSocialBoard } from "@/lib/kernel/admin/social-load";
import { createSocialDrafts, saveSocialDraft } from "@/lib/kernel/admin/social-write";
import { isSocialModule, validateSocialEdit } from "@/lib/kernel/admin/social-desk";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;
export const maxDuration = 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const board = await loadSocialBoard(session);
    if (board.access === "forbidden") {
      throw new ServiceUnavailableError("Masa okunamadı.");
    }
    if (board.access === "unavailable") {
      return jsonOk({ board: null, connections: board.connections }, 200, undefined, request);
    }
    return jsonOk({ board: board.board }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || !isSocialModule(body.module)) {
      throw new BadRequestError("Modül seçilmedi.");
    }
    const pack = await generateSocialPackage({ module: body.module, userId: session.id });
    const created = await createSocialDrafts(session.id, pack.drafts);
    return jsonOk({ created, source: pack.source, note: pack.note }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const edit = validateSocialEdit(body);
    if (!edit.ok) {
      throw new BadRequestError(edit.reason);
    }
    await saveSocialDraft(edit.value);
    return jsonOk({ id: edit.value.id }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
