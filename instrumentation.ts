/**
 * Next.js sunucu örneği ayağa kalkarken bir kez çalışır.
 * Node sürecinde Direct host AAAA sırası; pooler DATABASE_URL ipv4first. Edge bu dosyayı yüklemez.
 * Müze instrumentation kopyası değildir.
 * Üretimde boş Inngest/PayTR sır basmadan fail-closed uyarısı yazar.
 * Prisma ısınması burada yoktur — `await import(db)` kamu HTML TTFB'sini soğuk başlangıçta
 * şişirir. Motor health / API / oda yükleyicilerinde `ensurePrismaQueryEngine` ile ısınır.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  await import("@/lib/academy/lesson-json-disk");
  await import("@/lib/academy/production-seal-disk");
  await import("@/lib/junior/pilot-engine/acoustic-timeline-disk");
  const { preferIpv6ForDirectHost } = await import("@/lib/kernel/dns-ipv6-first");
  preferIpv6ForDirectHost();
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const { evaluateRuntimeReadiness } = await import("@/lib/kernel/jobs/runtime-readiness");
  const { logEvent } = await import("@/lib/kernel/observability/log");
  const { isLiveBroadcastShutdownEnvActive } = await import(
    "@/lib/kernel/http/live-broadcast-shutdown"
  );
  if (isLiveBroadcastShutdownEnvActive()) {
    logEvent({
      level: "warn",
      event: "ops.live_broadcast.shutdown",
      reason: "LIVE_BROADCAST_SHUTDOWN=true; urun 503; Inngest/PayTR fail-closed",
      status: 503,
    });
  }
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
      reason:
        "ACADEMY_EXAM_SITTING_SECRET bos veya kisa; JWT derive fallback (SUPABASE_JWT_SECRET>=16) sinavi ayakta tutar; ikisi de yoksa sinav 503, site ayakta",
      route: "/api/academy/courses/[id]/exam",
    });
  }
  // OPS-5 (Faz 2): paylaşılan hız tavanı yoksa her serverless örnek kendi sayacını
  // tutar → gerçek limit = limit × örnek. Build kapısı bunu `verify:prebuild`
  // içinde zaten düşürür; burada çalışma zamanı sicili bırakılır ki ölçüm ve
  // alarm tarafı aynı olayı görsün. Vercel Production'da tek süreç kabulü sayılmaz.
  const { classifyRateLimitStore } = await import("@/lib/kernel/security/rate-limit-runtime");
  const rateLimitStore = classifyRateLimitStore({
    RATE_LIMIT_REDIS_REST_URL: process.env.RATE_LIMIT_REDIS_REST_URL,
    RATE_LIMIT_REDIS_REST_TOKEN: process.env.RATE_LIMIT_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  });
  if (rateLimitStore !== "redis-rest") {
    const vercelProduction = process.env.VERCEL_ENV?.trim() === "production";
    const acknowledged = Boolean(process.env.RATE_LIMIT_SINGLE_NODE_ACK?.trim()) && !vercelProduction;
    if (!acknowledged) {
      logEvent({
        level: "warn",
        event: "ops.rate_limit.store_not_shared",
        reason:
          rateLimitStore === "fail-closed-partial"
            ? "RATE_LIMIT_REDIS_REST_*/KV_REST_API_* kismi; hiz tavani fail-closed, form ve LLM uclari 503"
            : "RATE_LIMIT_REDIS_REST_* ve KV_REST_API_* bos; sayac surec-ici, cok ornekte limit x ornek",
        status: rateLimitStore === "fail-closed-partial" ? 503 : 200,
      });
    }
  }
}
