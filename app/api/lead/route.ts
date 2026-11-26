import { randomBytes } from "node:crypto";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { getPrisma } from "@/lib/kernel/db";
import { isKurumsalOfferPackage } from "@/lib/sales/kurumsal-offer-packages";
import { normalizeKurumsalLeadCity } from "@/lib/sales/kurumsal-lead-city";
import { snapshotKurumsalOfferQuotedAmountMinor } from "@/lib/sales/kurumsal-lead-quote";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60_000;
/** Lead mükerrer kilidi ad alanı — `pg_advisory_xact_lock(namespace, hashtext(email:paket))`. */
const KURUMSAL_LEAD_LOCK_NAMESPACE = 74_210_002;

/** Kurumsal teklif. Oda açılmaz. Gönderim kuyruğuna düşmez. */
export const auth = "public" as const;

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function honeypotFilled(record: Record<string, unknown> | null): boolean {
  if (!record) {
    return false;
  }
  for (const key of ["website", "companyWebsite"] as const) {
    if (!(key in record)) {
      continue;
    }
    const raw = record[key];
    if (typeof raw === "string" && raw.trim().length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Honeypot için sahte ama biçimsel olarak geçerli talep kimliği.
 *
 * Prisma `cuid()` üretir (25 karakter, `c` ile başlar). Bot yanıtın **şeklini**
 * incelerse (alan kümesi, kimlik biçimi) tuzağı fark edebilir; bu yüzden gerçek
 * yanıtla aynı alanlar ve aynı biçimde kimlik döner. Kimlik veritabanında yoktur.
 */
function fakeOfferRequestId(): string {
  const body = randomBytes(16)
    .toString("base64url")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 24)
    .toLowerCase();
  return `c${body.padEnd(24, "0")}`;
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const limit = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.leadIp);
  if (!limit.allowed) {
    return rateLimitedJsonResponse(limit, request);
  }
  try {
    const body: unknown = await request.json().catch(() => null);
    const record = body != null && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
    // Bot honeypot: dolu gelirse sessizce başarılı yanıt dön (F2.5).
    // Yanıt **şekli** gerçek başarıyla birebir aynıdır: aynı alanlar, aynı kimlik
    // biçimi (`Request.id` gerçek cuid gibi görünür). Aksi hâlde bot tuzağı
    // "request.id yok" farkından anlar ve honeypot etkisiz kalırdı.
    if (honeypotFilled(record)) {
      return jsonOk(
        {
          received: true,
          duplicate: false,
          request: {
            id: fakeOfferRequestId(),
            status: "NEW",
            quotedAmountMinor: null,
          },
        },
        200,
        requestId,
        request,
      );
    }
    const companyName = clip(record && "companyName" in record ? record.companyName : "", 120);
    const email = clip(record && "email" in record ? record.email : "", 160).toLowerCase();
    const cityRaw = clip(record && "city" in record ? record.city : "", 80);
    const note = clip(record && "note" in record ? record.note : "", 500);
    const packageKey = clip(record && "packageKey" in record ? record.packageKey : "", 40);
    if (companyName.length < 2) {
      return jsonFail("Firma adı ve il gerekli.", 400, requestId, request);
    }
    const city = normalizeKurumsalLeadCity(cityRaw);
    if (!city) {
      return jsonFail("İl, Türkiye’nin 81 ilinden biri olmalı.", 400, requestId, request);
    }
    if (!EMAIL_RE.test(email)) {
      return jsonFail("E-posta adresi geçersiz.", 400, requestId, request);
    }
    if (!isKurumsalOfferPackage(packageKey)) {
      return jsonFail("Paket seçin.", 400, requestId, request);
    }
    const prisma = getPrisma();
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    /**
     * Katalog anlık görüntüsü **transaction'dan önce** alınır. Katalog okuması
     * global `getPrisma()` istemcisini kullanır; açık bir `$transaction` bloğunun
     * içinde çağrılırsa ikinci bağlantı ister. Vercel serverless havuzu `max: 1`
     * olduğu için bağlantı hiç açılmaz ve istek `pool_timeout` ile 500'e düşerdi.
     * Fiyat anlık görüntüsü mükerrer kilidiyle aynı anlık görüntüde olmak zorunda değil.
     */
    const quotedQuote = await snapshotKurumsalOfferQuotedAmountMinor(packageKey);
    /**
     * Mükerrer kontrolü + yazma tek transaction'da ve danışma kilidi altındadır.
     * Kilit olmadan iki eşzamanlı istek de "kayıt yok" görüp iki satır açardı
     * (24 saatlik pencere yalnız sıralı isteklerde çalışırdı).
     * Kilit anahtarı e-posta + pakettir; farklı talepler birbirini beklemez.
     */
    const result = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          ${KURUMSAL_LEAD_LOCK_NAMESPACE}::int,
          hashtext(${`${email}:${packageKey}`})::int
        )
      `;
      const existing = await tx.kurumsalOfferRequest.findFirst({
        where: {
          email,
          packageKey,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, createdAt: true },
      });
      if (existing) {
        // Yanıt yalnız "gördüm" der; başka bir firmanın künyesi geri basılmaz.
        return {
          duplicate: true as const,
          request: {
            id: existing.id,
            status: existing.status,
            createdAt: existing.createdAt.toISOString(),
          },
        };
      }
      const created = await tx.kurumsalOfferRequest.create({
        data: {
          companyName,
          email,
          city,
          note,
          packageKey,
          quotedAmountMinor: quotedQuote,
          status: "NEW",
        },
        select: { id: true, status: true, quotedAmountMinor: true },
      });
      return {
        duplicate: false as const,
        request: {
          id: created.id,
          status: created.status,
          quotedAmountMinor: created.quotedAmountMinor,
        },
      };
    });
    return jsonOk(
      { received: true, duplicate: result.duplicate, request: result.request },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
