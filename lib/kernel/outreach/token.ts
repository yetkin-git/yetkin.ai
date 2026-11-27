/**
 * Tek tıkla RET bağlantısı — HMAC imzalı jeton.
 *
 * Neden imza: RET ucu `auth: "public"`. Oturum yok, gövde yok. Jeton olmadan
 * herkes keyfi bir adresi kara listeye yazabilirdi (rakip imhası). İmza, jetonun
 * yalnız bizim ürettiğimiz bir gönderimden çıktığını kanıtlar.
 *
 * Neden süresiz: ETK/KVKK'da RET hakkı zamana bağlı değildir. Bir yıl sonra da
 * çalışmak zorundadır. Bu yüzden jeton `exp` taşımaz.
 *
 * Gizlilik notu: jeton adresi taşır (aksi hâlde kara listeye yazılacak adres
 * bilinemezdi). Adres URL'de görünmesin diyorsan jetonun opak kimliğe çevrilmesi
 * ayrı bir tablo ister; bu modül onu yapmaz ve yapıyormuş gibi davranmaz.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const OUTREACH_UNSUBSCRIBE_PATH = "/api/outreach/unsubscribe" as const;
export const OUTREACH_TOKEN_VERSION = "v1" as const;
/** HMAC anahtarı için asgari uzunluk. Kısa anahtar sözlük saldırısına açıktır. */
export const OUTREACH_UNSUBSCRIBE_SECRET_MIN = 32;

export function readOutreachUnsubscribeSecret(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const raw = env.OUTREACH_UNSUBSCRIBE_SECRET?.trim() ?? "";
  return raw.length >= OUTREACH_UNSUBSCRIBE_SECRET_MIN ? raw : null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
}

export function buildOutreachUnsubscribeToken(email: string, secret: string): string {
  const normalized = email.trim().toLowerCase();
  const payload = Buffer.from(normalized, "utf8").toString("base64url");
  return `${OUTREACH_TOKEN_VERSION}.${payload}.${sign(`${OUTREACH_TOKEN_VERSION}.${payload}`, secret)}`;
}

export type OutreachTokenResult =
  | { ok: true; email: string }
  | { ok: false; reason: "malformed" | "signature" };

export function verifyOutreachUnsubscribeToken(
  token: string,
  secret: string | null,
): OutreachTokenResult {
  if (!secret) {
    return { ok: false, reason: "signature" };
  }
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "malformed" };
  }
  const [version, payload, mac] = parts as [string, string, string];
  if (version !== OUTREACH_TOKEN_VERSION || !payload || !mac) {
    return { ok: false, reason: "malformed" };
  }
  const expected = sign(`${version}.${payload}`, secret);
  const actualBuf = Buffer.from(mac, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (actualBuf.length !== expectedBuf.length) {
    return { ok: false, reason: "signature" };
  }
  if (!timingSafeEqual(actualBuf, expectedBuf)) {
    return { ok: false, reason: "signature" };
  }
  let email = "";
  try {
    email = Buffer.from(payload, "base64url").toString("utf8").trim().toLowerCase();
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!email || email.length > 160) {
    return { ok: false, reason: "malformed" };
  }
  return { ok: true, email };
}

/** Uygulama kökü — bağlantı mutlak olmalı; mail istemcisinde göreli yol çalışmaz. */
export function outreachAppOrigin(env: Record<string, string | undefined> = process.env): string {
  const raw = env.NEXT_PUBLIC_APP_URL?.trim() || "https://yetkin.ai";
  return raw.replace(/\/+$/, "");
}

export function buildOutreachUnsubscribeUrl(input: {
  email: string;
  secret: string;
  env?: Record<string, string | undefined>;
}): string {
  const token = buildOutreachUnsubscribeToken(input.email, input.secret);
  return `${outreachAppOrigin(input.env)}${OUTREACH_UNSUBSCRIBE_PATH}?token=${encodeURIComponent(token)}`;
}
