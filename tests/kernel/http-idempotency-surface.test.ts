import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("HTTP Idempotency-Key yazma yüzeyi", () => {
  it("nakit ve tezgâh yazma rotaları başlığı zorunlu kılar ve replay kapısını çağırır", () => {
    const wallet = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    const purchase = readSrc("app/api/academy/courses/[id]/purchase/route.ts");
    const accept = readSrc("app/api/freelancer/jobs/[id]/accept/route.ts");
    const jobs = readSrc("app/api/freelancer/jobs/route.ts");
    const bids = readSrc("app/api/freelancer/jobs/[id]/bids/route.ts");
    const release = readSrc("app/api/freelancer/contracts/[id]/release/route.ts");
    const refund = readSrc("app/api/freelancer/contracts/[id]/refund/route.ts");
    const delivery = readSrc("app/api/freelancer/contracts/[id]/messages/route.ts");
    for (const source of [wallet, jobs]) {
      expect(source).toContain("readIdempotencyKey");
      expect(source).toContain("settleHttpIdempotency");
      expect(source).toContain("hashIdempotencyPayload");
      expect(source).toContain("createPrismaHttpIdempotencyStore");
    }
    for (const source of [purchase, accept, bids, release, refund, delivery]) {
      expect(source).toContain("requireRailV1IdempotencyKey");
      expect(source).toContain("settleHttpIdempotency");
      expect(source).toContain("hashIdempotencyPayload");
      expect(source).toContain("createPrismaHttpIdempotencyStore");
    }
    expect(jobs).toContain('route: JOBS_ROUTE');
    expect(bids).toContain('"/api/freelancer/jobs/[id]/bids"');
    expect(accept).toContain('"/api/freelancer/jobs/[id]/accept"');
    expect(release).toContain('"/api/freelancer/contracts/[id]/release"');
    expect(refund).toContain('"/api/freelancer/contracts/[id]/refund"');
    expect(delivery).toContain('"/api/freelancer/contracts/[id]/messages"');
    expect(wallet).toContain("buildIdempotentMerchantOid");
    expect(wallet).toContain("decideWalletTopUpReuse");
    expect(wallet).toContain("failPaymentOrder");
    expect(wallet).not.toContain("buildMerchantOid(");
  });

  it("istemci çift tıklamada aynı Idempotency-Key başlığını basar", () => {
    const walletForm = readSrc("components/kernel/wallet-top-up-form.tsx");
    const purchase = readSrc("components/academy/purchase-button.tsx");
    const accept = readSrc("components/freelancer/accept-bid-button.tsx");
    const createJob = readSrc("components/freelancer/job-create-form.tsx");
    const bid = readSrc("components/freelancer/bid-form.tsx");
    const actions = readSrc("components/freelancer/contract-actions.tsx");
    const hook = readSrc("components/kernel/use-idempotency-key.ts");
    expect(hook).toContain("IDEMPOTENCY_KEY_HEADER");
    expect(hook).toContain("createClientIdempotencyKey");
    for (const source of [walletForm, purchase, accept, createJob, bid, actions]) {
      expect(source).toContain("useIdempotencyKey");
      expect(source).toContain("idempotency.headers()");
    }
  });

  it("sınav yetkilendirmesi oturum JTI tek tüketimdir; kenar Origin/Sec-Fetch yazma kalkanı durur", () => {
    const exam = readSrc("lib/academy/exam-engine.ts");
    const examRoute = readSrc("app/api/academy/courses/[id]/exam/route.ts");
    const proxy = readSrc("proxy.ts");
    const origin = readSrc("lib/kernel/security/origin-guard.ts");
    expect(exam).toContain("consumeAcademyExamSittingJti");
    expect(examRoute).toContain("submitAcademyExam");
    expect(examRoute).not.toContain("settleHttpIdempotency");
    expect(proxy).toContain("decideWebOriginGuard");
    expect(proxy).toContain('originDecision.kind === "deny"');
    expect(origin).toContain("WEB_ORIGIN_FORBIDDEN");
    expect(origin).toContain("Sec-Fetch-Site");
  });
});
