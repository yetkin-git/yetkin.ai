import "server-only";

import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_SUPPORT_EMAIL } from "@/lib/copy/legal-launch";
import { formatMinor } from "@/lib/kernel/money/format";
import { readNoticeMailConfig } from "@/lib/kernel/notice/mail";
import { sendNoticeSmtp } from "@/lib/kernel/notice/smtp";
import { logEvent } from "@/lib/kernel/observability/log";

/**
 * Faz 3 / §4.1 — misafir ödeme sonrası **hesap aktivasyon bağlantısı**.
 *
 * Dürüstlük: para alındı, hesap **henüz yok**. Posta bunu açıkça söyler ve tek
 * kullanımlık `/claim/[token]` bağını verir. Bağlantı 14 gün geçerlidir; süresi
 * dolarsa kullanıcı aynı e-postayla giriş yapıp destek üzerinden açabilir.
 *
 * SMTP yapılandırılmamışsa **dürüst atlanır** (`skipped`): nakit ve sipariş durmaz,
 * ancak "posta gitti" denmez. Operatör `tezgah.guest.claim_mail_skipped` görür.
 */

export type GuestClaimMailPayload = {
  email: string;
  claimToken: string;
  amountMinor: number;
  merchantOid: string;
};

export function claimAppOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

export function buildGuestClaimUrl(token: string, origin: string = claimAppOrigin()): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/claim/${encodeURIComponent(token)}`;
}

export function buildGuestClaimMail(
  payload: GuestClaimMailPayload,
  origin: string = claimAppOrigin(),
): { subject: string; text: string; html: string } {
  const url = buildGuestClaimUrl(payload.claimToken, origin);
  const amount = formatMinor(payload.amountMinor, "TRY");
  const subject = `${YETKIN_BRAND} — Tezgâh Pro hesabını aç`;
  const text = [
    "Ödemen alındı. Tezgâh Pro erişimin hazır.",
    "",
    `Tutar: ${amount}`,
    "",
    "Hesabını açmak ve aboneliğini başlatmak için tek kullanımlık bağlantı:",
    url,
    "",
    "Bağlantı 14 gün geçerlidir ve yalnız bir kez kullanılır.",
    "Bu satın alımı sen yapmadıysan iletiyi yok say; kart iaden için destekle görüş.",
    "",
    `Destek: ${LEGAL_SUPPORT_EMAIL}`,
  ].join("\n");
  const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:24px;background:#f4f7fb;font-family:Georgia,serif;color:#142033;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #d5deea;border-radius:12px;">
    <tr><td style="padding:28px 28px 8px;font-size:13px;letter-spacing:0.04em;color:#1d4f91;">${YETKIN_BRAND}</td></tr>
    <tr><td style="padding:8px 28px 0;font-size:22px;line-height:1.3;">Ödemen alındı, hesabın hazır</td></tr>
    <tr><td style="padding:16px 28px 0;font-size:16px;line-height:1.5;">Tutar: <strong>${amount}</strong>. Tezgâh Pro erişimini açmak için tek kullanımlık bağlantına tıkla. Bağlantı 14 gün geçerlidir.</td></tr>
    <tr><td style="padding:24px 28px;">
      <a href="${url}" style="display:inline-block;background:#1d4f91;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:16px;">Hesabımı aç</a>
    </td></tr>
    <tr><td style="padding:0 28px 8px;font-size:13px;line-height:1.5;color:#3d4d63;">Bu satın alımı sen yapmadıysan iletiyi yok say; kart iaden için destekle görüş.</td></tr>
    <tr><td style="padding:0 28px 28px;font-size:12px;line-height:1.5;color:#5c6b80;">Destek: ${LEGAL_SUPPORT_EMAIL}</td></tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
}

export async function deliverGuestClaimMail(
  payload: GuestClaimMailPayload,
): Promise<"sent" | "skipped"> {
  if (process.env.NODE_ENV === "test") {
    return "skipped";
  }
  const config = readNoticeMailConfig();
  if (!config) {
    logEvent({
      level: "warn",
      event: "tezgah.guest.claim_mail_skipped",
      merchantOid: payload.merchantOid,
      amountMinor: payload.amountMinor,
      reason: "smtp_unconfigured",
      applied: true,
    });
    return "skipped";
  }
  const letter = buildGuestClaimMail(payload);
  await sendNoticeSmtp(config, {
    to: payload.email,
    subject: letter.subject,
    text: letter.text,
    html: letter.html,
    fromName: YETKIN_BRAND,
  });
  logEvent({
    level: "info",
    event: "tezgah.guest.claim_mail_sent",
    merchantOid: payload.merchantOid,
    amountMinor: payload.amountMinor,
    applied: true,
  });
  return "sent";
}
