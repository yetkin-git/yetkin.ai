import { loadB2bBoard } from "@/lib/kernel/admin/b2b-load";
import {
  B2B_OUTBOUND_BATCH_LIMIT,
  parseB2bLeadBatch,
  validateB2bLead,
  type B2bLeadInput,
} from "@/lib/kernel/admin/b2b-outbound";
import { editB2bDraft, releaseB2bSendLock, setB2bOutboundEnabled } from "@/lib/kernel/admin/b2b-write";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { getPrisma } from "@/lib/kernel/db";
import { BadRequestError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { loadB2bGrantCalls, prepareB2bDraft } from "@/app/api/(kernel)/admin/b2b/prepare";

export const auth = "admin" as const;
export const maxDuration = 120;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readLeadBatch(body: unknown): B2bLeadInput[] {
  if (!isRecord(body)) {
    throw new BadRequestError("İstek gövdesi yok.");
  }
  const items: B2bLeadInput[] = [];
  const errors: string[] = [];
  if (typeof body.lines === "string") {
    if (body.lines.length > 20_000) {
      throw new BadRequestError("Toplu satır çok uzun.");
    }
    const parsed = parseB2bLeadBatch(body.lines);
    items.push(...parsed.items);
    errors.push(...parsed.errors);
  }
  if (Array.isArray(body.items)) {
    if (body.items.length > B2B_OUTBOUND_BATCH_LIMIT) {
      throw new BadRequestError("Bir seferde en fazla 15 firma.");
    }
    for (const row of body.items) {
      const parsed = validateB2bLead(row);
      if (parsed.ok) {
        items.push(parsed.item);
      } else {
        errors.push(parsed.error);
      }
    }
  }
  if (errors.length > 0) {
    throw new BadRequestError(errors.slice(0, 3).join(" "));
  }
  if (items.length === 0) {
    throw new BadRequestError("En az bir firma gir.");
  }
  if (items.length > B2B_OUTBOUND_BATCH_LIMIT) {
    throw new BadRequestError("Bir seferde en fazla 15 firma.");
  }
  return items;
}

async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }
      const item = items[index];
      if (item === undefined) {
        return;
      }
      results[index] = await run(item);
    }
  }
  const width = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: width }, () => worker()));
  return results;
}

export async function GET(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const board = await loadB2bBoard(session);
    if (board.access !== "ok") {
      throw new ServiceUnavailableError("Motor okunamadı.");
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
    const items = readLeadBatch(body);
    const calls = items.some((item) => item.channel === "TUBITAK_HIBE") ? await loadB2bGrantCalls() : null;
    const prepared = await mapPool(items, 3, (item) => prepareB2bDraft(item, calls));
    const prisma = getPrisma();
    let failed = 0;
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const draft = prepared[index];
      if (!item || !draft) {
        continue;
      }
      if (draft.status === "FAILED") {
        failed += 1;
      }
      await prisma.b2bLeadCampaignItem.create({
        data: {
          companyName: item.companyName,
          email: item.email,
          websiteUrl: item.websiteUrl,
          sector: item.sector,
          city: item.city,
          channel: item.channel,
          status: draft.status,
          score: draft.score,
          note: draft.note,
          findingsJson: draft.findingsJson,
          subject: draft.subject,
          body: draft.body,
          actorUserId: session.id,
        },
      });
    }
    return jsonOk({ created: items.length, failed }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || typeof body.action !== "string") {
      throw new BadRequestError("Eylem yok.");
    }
    if (body.action === "switch") {
      if (typeof body.enabled !== "boolean") {
        throw new BadRequestError("Anahtar açık veya kapalı olmalı.");
      }
      await setB2bOutboundEnabled(session.id, body.enabled);
      return jsonOk({ enabled: body.enabled }, 200, undefined, request);
    }
    if (typeof body.id !== "string" || body.id.trim().length < 8) {
      throw new BadRequestError("Taslak kimliği yok.");
    }
    const id = body.id.trim();
    if (body.action === "edit") {
      if (typeof body.subject !== "string" || typeof body.body !== "string") {
        throw new BadRequestError("Konu ve metin gerekli.");
      }
      await editB2bDraft({ id, subject: body.subject, body: body.body });
      return jsonOk({ id }, 200, undefined, request);
    }
    if (body.action === "release") {
      await releaseB2bSendLock(id);
      return jsonOk({ id }, 200, undefined, request);
    }
    throw new BadRequestError("Eylem yok.");
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
