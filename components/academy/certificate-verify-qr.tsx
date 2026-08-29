import { academyQrSvg } from "@/lib/academy/qr-matrix";
import { academyVerifyUrl } from "@/lib/academy/lesson-note-paths";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

/** Kamu doğrulama QR — kullanıcı girdisi değil; hash'ten üretilir. */
export function CertificateVerifyQr({ hash }: { hash: string }) {
  const copy = ACADEMY_SEN.verify;
  const url = academyVerifyUrl(hash, process.env.NEXT_PUBLIC_APP_URL);
  const qr = academyQrSvg(url, { cell: 3, margin: 1, dark: "#0f172a", light: "#ffffff" });
  if (!qr) {
    return null;
  }
  return (
    <figure className="mt-4 w-fit">
      <div
        className="h-28 w-28 overflow-hidden rounded-lg border border-[var(--border)] bg-white p-1"
        dangerouslySetInnerHTML={{ __html: qr }}
      />
      <figcaption className="mt-2 text-[11px] text-[var(--muted)]">{copy.qrCaption}</figcaption>
    </figure>
  );
}
