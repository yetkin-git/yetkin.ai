import "server-only";

/**
 * Outreach gönderen kapısı — alan adı izolasyonu.
 *
 * Kural: outreach postası transactional postayla **aynı alan adından çıkmaz**.
 * Doğrulama, parola sıfırlama ve makbuz postaları `AUTH_MAIL_FROM` / `NOTICE_MAIL_FROM`
 * üzerindedir. Outreach itibarı (şikâyet, spam tuzağı, bounce) düşerse o alan adı
 * düşer; transactional posta da birlikte düşerdi. Bu yüzden ayrı alt alan adı şart.
 *
 * Fail-closed: `OUTREACH_FROM_EMAIL` boşsa veya transactional alan adıyla çakışıyorsa
 * hiçbir mail gitmez. Panel bunu `senderIssue` olarak dürüstçe basar; uydurma
 * "gönderildi" yazılmaz.
 */

import { readAuthMailTransport } from "@/lib/kernel/auth/auth-mail-config";
import { readNoticeMailConfig } from "@/lib/kernel/notice/mail";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import { OUTREACH_EMAIL_RE, emailDomainOf, normalizeOutreachEmail } from "@/lib/kernel/outreach/policy";

const RESEND_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

export type OutreachSenderState =
  | {
      ready: true;
      from: string;
      domain: string;
      transport: "resend" | "smtp";
      fromName: string;
    }
  | { ready: false; from: null; issue: string };

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

/** Transactional gönderen alan adları — outreach bunlardan biriyle çakışamaz. */
export function transactionalSenderDomains(
  env: Record<string, string | undefined> = process.env,
): string[] {
  // Kendi değerini çakışma saymamak için yalnız transactional iki alan okunur.
  return [trim(env.AUTH_MAIL_FROM), trim(env.NOTICE_MAIL_FROM)]
    .filter((value) => value.length > 0)
    .map((value) => emailDomainOf(value))
    .filter((domain) => domain.length > 0);
}

/**
 * Üst alan adı karşılaştırması: `iletisim.yetkin.ai` ile `yetkin.ai` **farklıdır**
 * (ayrı SPF/DKIM bölgesi), ama `yetkin.ai` ile `yetkin.ai` aynıdır → çakışma.
 */
export function senderDomainCollides(fromDomain: string, transactional: readonly string[]): boolean {
  const target = fromDomain.trim().toLowerCase();
  if (!target) {
    return true;
  }
  return transactional.some((domain) => domain.trim().toLowerCase() === target);
}

export function readOutreachSender(
  env: Record<string, string | undefined> = process.env,
): OutreachSenderState {
  const raw = trim(env.OUTREACH_FROM_EMAIL);
  if (!raw) {
    return {
      ready: false,
      from: null,
      issue:
        "OUTREACH_FROM_EMAIL tanımlı değil. Outreach gönderimi kapalı; transactional alan adı korunuyor.",
    };
  }
  const from = normalizeOutreachEmail(raw);
  if (!OUTREACH_EMAIL_RE.test(from)) {
    return { ready: false, from: null, issue: "OUTREACH_FROM_EMAIL geçerli bir adres değil." };
  }
  const domain = emailDomainOf(from);
  const transactional = transactionalSenderDomains(env);
  if (senderDomainCollides(domain, transactional)) {
    return {
      ready: false,
      from: null,
      issue: `Outreach alan adı (${domain}) transactional gönderenle aynı. Ayrı alt alan adı gerekli.`,
    };
  }
  const resendKey = trim(env.AUTH_RESEND_API_KEY);
  if (resendKey) {
    return { ready: true, from, domain, transport: "resend", fromName: "Yetkin" };
  }
  const smtp = readNoticeMailConfig(env);
  if (!smtp) {
    return {
      ready: false,
      from: null,
      issue: "SMTP kimliği yok (NOTICE_SMTP_*) ve Resend anahtarı yok. Outreach gönderimi kapalı.",
    };
  }
  return { ready: true, from, domain, transport: "smtp", fromName: "Yetkin" };
}

async function postResend(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`resend_${response.status}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type OutreachSendResult =
  | { ok: true }
  | { ok: false; reason: "sender_unconfigured" | "transport_failed"; detail: string };

/**
 * Tek gönderim. Taşıma hatası **yutulmaz**: çağıran taslağı FAILED işaretler ve
 * `error_message` yazar. Sessiz "gönderildi" yoktur.
 */
export async function sendOutreachMail(input: {
  to: string;
  subject: string;
  text: string;
  sender: Extract<OutreachSenderState, { ready: true }>;
  env?: Record<string, string | undefined>;
}): Promise<OutreachSendResult> {
  const env = input.env ?? process.env;
  const html = `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(
    input.text,
  )}</pre>`;
  try {
    if (input.sender.transport === "resend") {
      await postResend({
        apiKey: trim(env.AUTH_RESEND_API_KEY),
        from: `${input.sender.fromName} <${input.sender.from}>`,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html,
      });
      return { ok: true };
    }
    const smtp = readNoticeMailConfig(env);
    if (!smtp) {
      return { ok: false, reason: "sender_unconfigured", detail: "SMTP kimliği okunamadı." };
    }
    await sendNoticeSmtp(
      { ...smtp, from: input.sender.from },
      {
        to: input.to,
        subject: input.subject,
        text: input.text,
        html,
        fromName: input.sender.fromName,
      },
    );
    return { ok: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 200) : "gonderim_hatasi";
    return { ok: false, reason: "transport_failed", detail };
  }
}

/** Test gönderimi için: adaptörün taşıma seçimini dışa açar (anahtar sızdırmaz). */
export function outreachTransportLabel(env: Record<string, string | undefined> = process.env): string {
  const auth = readAuthMailTransport(env);
  if (!auth) {
    return "unconfigured";
  }
  return auth.kind;
}
