import { logEvent } from "@/lib/kernel/observability/log";
import { suppressOutreachEmail } from "@/lib/kernel/outreach/write";
import {
  readOutreachUnsubscribeSecret,
  verifyOutreachUnsubscribeToken,
} from "@/lib/kernel/outreach/token";
import { applyHttpRateLimit, HTTP_RATE_LIMITS } from "@/lib/kernel/security/http-rate-limit";

/**
 * Tek tıkla RET — oturum yok, gövde yok, imza var.
 *
 * Neden `public`: çıkmak isteyen kişi giriş yapmak zorunda kalmaz. ETK/KVKK'da
 * RET hakkının kullanımı kolaylaştırılmalıdır; oturum şartı bunu fiilen engeller.
 *
 * Neden token: imzasız uçta herkes bir rakibin adresini kara listeye yazabilirdi.
 * Jeton HMAC-SHA256 ile imzalıdır (`lib/kernel/outreach/token.ts`).
 *
 * Yanıt biçimi: GET tarayıcıdan gelir → okunabilir HTML. POST makine çağrısıdır
 * (RFC 8058 `List-Unsubscribe=One-Click`) → gövdesiz 2xx. İkisi de aynı işi yapar.
 *
 * Bilgi sızdırmaz: geçersiz jeton ile geçerli jeton sayfa düzeyinde aynı mesajı
 * verir; yalnız HTTP durumu farklıdır. Adresin listede olup olmadığı dışarıya
 * söylenmez.
 */
export const auth = "public" as const;
export const maxDuration = 15;

type ApplyResult = { status: number; ok: boolean; reason: string };

const PAGE_HEAD = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">`;

const PAGE_STYLE = `<style>
:root{color-scheme:light}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f7f9;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#111827}
main{max-width:34rem;padding:2.5rem;background:#fff;border:1px solid #e5e7eb;border-radius:1rem}
h1{font-size:1.25rem;margin:0 0 .75rem}
p{margin:0;line-height:1.6;color:#4b5563}
a{display:inline-block;margin-top:1.5rem;color:#111827;font-weight:600}
</style></head><body><main>`;

function page(title: string, message: string, status: number): Response {
  const html = `${PAGE_HEAD}<title>${title} · yetkin.ai</title>${PAGE_STYLE}<h1>${title}</h1><p>${message}</p><a href="/">yetkin.ai</a></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

function tokenFrom(request: Request): string {
  try {
    return new URL(request.url).searchParams.get("token")?.trim() ?? "";
  } catch {
    return "";
  }
}

async function apply(request: Request): Promise<ApplyResult> {
  const limit = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.outreachUnsubscribeIp);
  if (!limit.allowed) {
    return { status: 429, ok: false, reason: "rate-limit" };
  }
  const token = tokenFrom(request);
  if (!token) {
    return { status: 400, ok: false, reason: "token-missing" };
  }
  const secret = readOutreachUnsubscribeSecret();
  const verified = verifyOutreachUnsubscribeToken(token, secret);
  if (!verified.ok) {
    return { status: 400, ok: false, reason: verified.reason };
  }
  try {
    const result = await suppressOutreachEmail({ email: verified.email });
    return { status: 200, ok: true, reason: result.added ? "added" : "already" };
  } catch {
    return { status: 503, ok: false, reason: "db-unavailable" };
  }
}

export async function GET(request: Request) {
  const result = await apply(request);
  logEvent({
    level: result.ok ? "info" : "warn",
    event: "outreach.unsubscribe",
    action: "unsubscribe",
    applied: result.ok,
    reason: result.reason,
    status: result.status,
  });
  if (result.ok) {
    return page(
      "Çıktın.",
      "Bu adres B2B tanışma listesinden çıkarıldı. Bundan sonra bu adrese tanışma e-postası gönderilmez. Doğrulama ve makbuz postaları etkilenmez.",
      200,
    );
  }
  if (result.status === 429) {
    return page("Çok fazla deneme", "Biraz sonra yeniden dene.", 429);
  }
  if (result.status === 503) {
    return page("Şu an işlenemedi", "Bağlantı geçerli görünüyor ama kayıt yazılamadı. Biraz sonra yeniden dene.", 503);
  }
  return page(
    "Bağlantı geçersiz",
    "Bağlantı okunamadı. E-postayı yanıtlayıp çıkmak istediğini yazarsan listeden düşeriz.",
    400,
  );
}

/** RFC 8058 one-click. Mail istemcisi bu uca POST atar. */
export async function POST(request: Request) {
  const result = await apply(request);
  logEvent({
    level: result.ok ? "info" : "warn",
    event: "outreach.unsubscribe",
    action: "unsubscribe-one-click",
    applied: result.ok,
    reason: result.reason,
    status: result.status,
  });
  return new Response(null, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}

/** Bazı istemciler başlığı doğrulamak için OPTIONS atar. */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: "GET, POST, OPTIONS",
      "cache-control": "no-store",
    },
  });
}
