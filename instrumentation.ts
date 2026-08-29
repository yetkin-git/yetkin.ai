/**
 * Next.js sunucu örneği ayağa kalkarken bir kez çalışır.
 * Node sürecinde Direct host AAAA sırası; Edge bu dosyayı yüklemez.
 * Müze instrumentation kopyası değildir.
 * Üretimde boş Inngest/PayTR sır basmadan fail-closed uyarısı yazar.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  const { preferIpv6ForDirectHost } = await import("@/lib/kernel/dns-ipv6-first");
  preferIpv6ForDirectHost();
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const { evaluateRuntimeReadiness } = await import("@/lib/kernel/jobs/runtime-readiness");
  const { logEvent } = await import("@/lib/kernel/observability/log");
  const report = evaluateRuntimeReadiness(process.env);
  if (report.inngestServeFailClosed) {
    logEvent({
      level: "warn",
      event: "ops.inngest.fail_closed",
      reason: "Inngest Cloud anahtarlari bos; /api/jobs/inngest 503",
      route: "/api/jobs/inngest",
      status: 503,
    });
  }
  if (report.payments === "unconfigured") {
    logEvent({
      level: "warn",
      event: "ops.paytr.unconfigured",
      reason: "PAYTR uclu bos; webhook CREDIT yok",
      route: "/api/payments/webhooks/paytr",
    });
  }
  if (report.devlabsPepper === "unconfigured") {
    logEvent({
      level: "warn",
      event: "ops.devlabs.pepper_unconfigured",
      reason: "DEVLABS_KEY_PEPPER bos; kod varsayilani yalniz gelistirme",
    });
  }
  if (report.smtp === "unconfigured") {
    logEvent({
      level: "info",
      event: "ops.smtp.honest_skip",
      reason: "NOTICE_SMTP_HOST/FROM bos; bes bildirim atlanir; nakit durmaz",
    });
  }
}
