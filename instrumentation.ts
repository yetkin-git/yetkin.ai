/**
 * Next.js sunucu örneği ayağa kalkarken bir kez çalışır.
 * Node sürecinde Direct host AAAA sırası; pooler DATABASE_URL ipv4first. Edge bu dosyayı yüklemez.
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
      level: "warn",
      event: "ops.smtp.honest_skip",
      reason: "NOTICE_SMTP_HOST/FROM bos; gun 0 makbuz yok; nakit durmaz",
    });
  }
  logEvent({
    level: report.trustedProxyHops < 2 ? "warn" : "info",
    event: "ops.proxy.trusted_hops",
    reason:
      report.trustedProxyHops < 2
        ? `TRUSTED_PROXY_HOPS=${report.trustedProxyHops}; Cloudflare+Vercel canli recete=2`
        : `TRUSTED_PROXY_HOPS=${report.trustedProxyHops}`,
  });
  if (report.examSitting === "unconfigured") {
    logEvent({
      level: "warn",
      event: "ops.exam_sitting.unconfigured",
      reason: "ACADEMY_EXAM_SITTING_SECRET bos veya kisa; sinav 503, site ayakta",
      route: "/api/academy/courses/[id]/exam",
    });
  }
}
