import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_SUPPORT_EMAIL } from "@/lib/copy/legal-launch";

export type ConfirmationEmail = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Auth eylem postası. signup marka şablonu; diğer tipler aynı kabuk, kısa cümle. */
export function buildSignupConfirmationEmail(
  confirmUrl: string,
  action: string = "signup",
): ConfirmationEmail {
  if (action !== "signup") {
    const href = escapeHtml(confirmUrl);
    const subject = `${YETKIN_BRAND} bağlantın`;
    const text = `Bağlantıyı aç:\n\n${confirmUrl}\n\nDestek: ${LEGAL_SUPPORT_EMAIL}\n`;
    const html = `<!DOCTYPE html><html lang="tr"><body style="font-family:Georgia,serif;color:#142033;padding:24px;">
<p>${YETKIN_BRAND}</p><p>Bu bağlantıyı sen istedin. Açmak için tıkla.</p>
<p><a href="${href}">Bağlantıyı aç</a></p><p>Destek: ${LEGAL_SUPPORT_EMAIL}</p></body></html>`;
    return { subject, text, html };
  }
  const href = escapeHtml(confirmUrl);
  const subject = `${YETKIN_BRAND} hesabını doğrula`;
  const text = [
    "Hesabını açmak için bu bağlantıya tıkla.",
    "",
    confirmUrl,
    "",
    "Bağlantı bu e-posta adresine özeldir.",
    "Bu kaydı sen açmadıysan iletiyi yok say.",
    "",
    `Destek: ${LEGAL_SUPPORT_EMAIL}`,
  ].join("\n");
  const html = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#f4f7fb;font-family:Georgia,serif;color:#142033;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #d5deea;border-radius:12px;">
    <tr><td style="padding:28px 28px 8px;font-size:13px;letter-spacing:0.04em;color:#1d4f91;">${YETKIN_BRAND}</td></tr>
    <tr><td style="padding:8px 28px 0;font-size:22px;line-height:1.3;">Hesabını doğrula</td></tr>
    <tr><td style="padding:16px 28px 0;font-size:16px;line-height:1.5;">Hesabını açmak için aşağıdaki bağlantıya tıkla. Bağlantı bu e-posta adresine özeldir.</td></tr>
    <tr><td style="padding:24px 28px;">
      <a href="${href}" style="display:inline-block;background:#1d4f91;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:16px;">E-postamı doğrula</a>
    </td></tr>
    <tr><td style="padding:0 28px 8px;font-size:13px;line-height:1.5;color:#3d4d63;">Bu kaydı sen açmadıysan iletiyi yok say.</td></tr>
    <tr><td style="padding:0 28px 28px;font-size:12px;line-height:1.5;color:#5c6b80;">Destek: ${LEGAL_SUPPORT_EMAIL}</td></tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
}
