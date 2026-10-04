import { z } from "zod";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { submitJuniorTell } from "@/lib/junior/service";
import { wipeAudioCarrier } from "@/lib/junior/tell";

export const auth = "session" as const;
export const maxDuration = 30;

const tellSchema = z
  .object({
    profileId: z.string().trim().min(1).max(40),
    lessonKey: z.string().trim().min(1).max(80),
    mode: z.enum(["speak", "write"]),
    text: z.string().max(600).optional(),
    audioBase64: z.string().max(1_200_000).optional(),
    mimeType: z.string().max(80).optional(),
    durationSec: z.number().finite().optional(),
  })
  .strict();

function wipeRaw(value: unknown): void {
  if (!value || typeof value !== "object") {
    return;
  }
  wipeAudioCarrier(value as { audioBase64?: string });
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  let raw: unknown = {};
  try {
    const user = await requireSession(request);
    raw = await request.json().catch(() => ({}));
    const parsed = tellSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("Anlatış gönderilemedi. Süreyi ve metni kontrol et.", 400, requestId, request);
    }
    const result = await submitJuniorTell(createPrismaJuniorStore(), {
      userId: user.id,
      profileId: parsed.data.profileId,
      lessonKey: parsed.data.lessonKey,
      mode: parsed.data.mode,
      text: parsed.data.text,
      audioBase64: parsed.data.audioBase64,
      mimeType: parsed.data.mimeType,
      durationSec: parsed.data.durationSec,
    });
    if (!result.ok) {
      return jsonFail(result.error, result.status, requestId, request);
    }
    return jsonOk(
      {
        praised: result.data.praised,
        missing: result.data.missing,
        advice: result.data.advice,
        score: result.data.score,
        xpAwarded: result.data.xpAwarded,
        points: result.data.points,
        badges: result.data.badges,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  } finally {
    wipeRaw(raw);
  }
}
