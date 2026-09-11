import {
  PAYTR_LOGO_SRC,
  PAYTR_MARK_ALT,
  PAYTR_MARK_CAPTION,
  PAYTR_MARK_HREF,
  PAYTR_MARK_LABEL,
  SECURE_PAYMENT_3D_HINT,
  SECURE_PAYMENT_3D_LABEL,
  SECURE_PAYMENT_SSL_HINT,
  SECURE_PAYMENT_SSL_LABEL,
} from "@/lib/copy/payment-marks";

const markClassName =
  "inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold tracking-wide text-[var(--foreground)]";

/** Kasa ve footer — SSL + 3D Secure rozeti + PayTR logosu. Yasal sözleşme metninden ayrıdır. */
export function SecurePaymentMarks({ compact = false }: { compact?: boolean }) {
  return (
    <div
      data-secure-payment-marks=""
      className={
        compact
          ? "flex max-w-full flex-wrap items-center justify-center gap-2"
          : "flex max-w-full flex-wrap items-center justify-center gap-3"
      }
    >
      <p
        data-ssl-mark=""
        title={SECURE_PAYMENT_SSL_HINT}
        className={markClassName}
      >
        <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
        {SECURE_PAYMENT_SSL_LABEL}
      </p>
      <p
        data-3d-secure-mark=""
        title={SECURE_PAYMENT_3D_HINT}
        className={markClassName}
      >
        <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
        {SECURE_PAYMENT_3D_LABEL}
      </p>
      <a
        data-paytr-mark=""
        href={PAYTR_MARK_HREF}
        target="_blank"
        rel="noopener noreferrer"
        title={PAYTR_MARK_CAPTION}
        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2 py-1"
      >
        <img src={PAYTR_LOGO_SRC} alt={PAYTR_MARK_ALT} width={72} height={20} className="h-5 w-auto" />
        <span className="sr-only">{PAYTR_MARK_LABEL}</span>
      </a>
    </div>
  );
}
