import { getPrisma } from "@/lib/kernel/db";
import { requireSession } from "@/lib/kernel/auth/session";
import { BadRequestError, ForbiddenError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";

/** Kamu vitrinden iletişim talebi. Aday e-postası HTML'e basılmaz. */
export const auth = "session" as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.careerContactIp);
  if (!limited.allowed) {
    return rateLimitedJsonResponse(limited, request);
  }
  try {
    await requireSession(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) {
      throw new BadRequestError("İstek gövdesi okunamadı.");
    }
    const sealHash = parseSha256Hex(typeof body.sealHash === "string" ? body.sealHash : "");
    const requesterName = String(body.requesterName ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    const requesterEmail = String(body.requesterEmail ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .slice(0, 160);
    const message = String(body.message ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
    if (!sealHash) {
      throw new BadRequestError("Mühür kodu geçersiz.");
    }
    if (requesterName.length < 2) {
      throw new BadRequestError("Ad en az 2 karakter olmalı.");
    }
    if (!EMAIL_RE.test(requesterEmail)) {
      throw new BadRequestError("E-posta adresi geçersiz.");
    }
    if (message.length < 20) {
      throw new BadRequestError("Mesaj en az 20 karakter olmalı.");
    }
    const prisma = getPrisma();
    const seal = await prisma.yetkinCvSeal.findUnique({
      where: { certificateHash: sealHash },
      select: { userId: true, sealedPublication: true },
    });
    if (!seal || !seal.sealedPublication) {
      throw new BadRequestError("Yayınlı mühür bulunamadı.");
    }
    const cv = await prisma.careerCv.findUnique({
      where: { userId: seal.userId },
      select: { contactOptInAt: true },
    });
    if (!cv?.contactOptInAt) {
      throw new ForbiddenError("Aday iletişim izni vermemiş.");
    }
    await prisma.careerContactRequest.create({
      data: {
        talentUserId: seal.userId,
        requesterName,
        requesterEmail,
        message,
        sealHash,
      },
    });
    // Aday e-postası yanıta yazılmaz; yalnız talep alındı bilgisi.
    return jsonOk({ accepted: true }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
