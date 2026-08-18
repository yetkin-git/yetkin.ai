#!/usr/bin/env tsx
/**
 * Atomik yazıcı mühürleri — statik (grep). Canlı Postgres yok.
 * Kariyer damga-portföy, freelancer kabul-emanet, ledger FOR UPDATE.
 * Surface test dosyalarının varlığı + verify:prebuild zincir kilidi.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

type Needle = { needle: string; label: string };

type FileRule = {
  file: string;
  must: Needle[];
  mustNot?: Needle[];
};

const FILE_RULES: FileRule[] = [
  {
    file: "lib/career/engine.ts",
    must: [
      { needle: "runStampPortfolioAtomic", label: "atomik damga-portföy kapısı" },
      { needle: "healed: true", label: "heal bayrağı" },
      { needle: "withUniqueRetry", label: "P2002 retry" },
      { needle: "P2002", label: "unique ihlali" },
    ],
    mustNot: [
      { needle: "purchaseAcademyCourse", label: "satın alma mega-tx sızıntısı" },
      { needle: "submitAcademyExam", label: "sınav mega-tx sızıntısı" },
    ],
  },
  {
    file: "lib/career/prisma-store.ts",
    must: [
      { needle: "prisma.$transaction", label: "damga+portföy $transaction" },
      { needle: "bindCareerWrites(tx)", label: "tx-bağlı yazıcı" },
      { needle: "runStampPortfolioAtomic", label: "atomik kapı" },
    ],
  },
  {
    file: "lib/freelancer/engine.ts",
    must: [
      { needle: "runAcceptAtomic", label: "atomik kabul kapısı" },
      { needle: "runReleaseAtomic", label: "atomik CREDIT çözülüş kapısı" },
      { needle: "freelancerJobEscrowReferenceKey", label: "job-bazlı emanet anahtarı" },
      { needle: "withUniqueRetry", label: "P2002 retry" },
      { needle: "P2002", label: "unique ihlali" },
      { needle: "healed: !holdApplied", label: "orphan hold heal" },
      { needle: "createEscrowHold", label: "emanet kilit aynı birimde" },
      { needle: "claimJobForAward", label: "ilan satır kilidi / şartlı AWARDED" },
      { needle: "RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE", label: "v1 yetersiz bakiye 409" },
      { needle: "ConflictError", label: "yetersiz bakiye ConflictError" },
      { needle: "AMOUNT_MINOR_OVERFLOW_ERROR", label: "çekirdek overflow iğnesi" },
    ],
    mustNot: [
      { needle: "tryIssueCareerVisaStamp", label: "vize accept tx'e girmez" },
      { needle: "issueCareerVisaStamp", label: "vize accept tx'e girmez" },
      { needle: "assertAcademyCareerVisaForListing", label: "vize kapısı HTTP'dedir" },
      { needle: "@/lib/career", label: "oda duvarı kariyer" },
      { needle: "@/lib/kurumsal", label: "oda duvarı kurumsal" },
      { needle: "freelancerContractReferenceKey(contractId)", label: "yazma tarihî contract anahtarı olmasın" },
    ],
  },
  {
    file: "lib/freelancer/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "kabul $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "bindEscrowStore(tx)", label: "tx escrow" },
      { needle: "bindFreelancerStore(tx)", label: "tx freelancer" },
      { needle: "runAcceptAtomic", label: "atomik kapı" },
      { needle: "runReleaseAtomic", label: "atomik CREDIT kapısı" },
    ],
  },
  {
    file: "lib/freelancer/fsm.ts",
    must: [{ needle: "freelancer.contract.job:", label: "job-bazlı emanet anahtarı biçimi" }],
  },
  {
    file: "lib/kernel/ledger/prisma-store.ts",
    must: [
      { needle: "FOR UPDATE", label: "cüzdan satır kilidi" },
      { needle: "FROM wallets", label: "wallets kilidi" },
      { needle: "lockWallet", label: "lockWallet" },
      { needle: "bindLedgerStore", label: "tx-bağlanabilir store" },
      { needle: "$queryRaw", label: "satır kilidi SQL" },
    ],
  },
  {
    file: "lib/kernel/escrow/prisma-store.ts",
    must: [
      { needle: "FOR UPDATE", label: "hold satır kilidi" },
      { needle: "FROM escrow_holds", label: "escrow_holds kilidi" },
      { needle: "lockByReferenceKey", label: "lockByReferenceKey" },
      { needle: 'status: "PENDING"', label: "PENDING CAS" },
    ],
  },
  {
    file: "app/api/(kernel)/jobs/inngest/route.ts",
    must: [
      { needle: "shouldFailClosedInngestServe", label: "üretim imza fail-closed" },
      { needle: "inngestNotConfiguredResponse", label: "boş imza 503" },
    ],
  },
  {
    file: "app/api/(kernel)/wallet/top-up/route.ts",
    must: [
      { needle: "readIdempotencyKey", label: "HTTP Idempotency-Key" },
      { needle: "buildIdempotentMerchantOid", label: "deterministik merchantOid" },
      { needle: "settleHttpIdempotency", label: "HTTP replay kapısı" },
      { needle: "failPaymentOrder", label: "checkout 503 markFailed" },
    ],
  },
  {
    file: "app/api/academy/courses/[id]/purchase/route.ts",
    must: [
      { needle: "readIdempotencyKey", label: "HTTP Idempotency-Key" },
      { needle: "settleHttpIdempotency", label: "HTTP replay kapısı" },
    ],
  },
  {
    file: "app/api/freelancer/jobs/[id]/accept/route.ts",
    must: [
      { needle: "acceptFreelancerBid", label: "kabul motoru" },
      { needle: "requireRailV1IdempotencyKey", label: "HTTP Idempotency-Key" },
      { needle: "settleHttpIdempotency", label: "HTTP replay kapısı" },
      { needle: "toFreelancerAcceptWire", label: "katı v1 DTO" },
    ],
    mustNot: [
      { needle: "tryIssueCareerVisaStamp", label: "accept'te vize yok" },
      { needle: "issueCareerVisaStamp", label: "accept'te vize yok" },
    ],
  },
  {
    file: "app/api/freelancer/jobs/[id]/bids/route.ts",
    must: [
      { needle: "assertAcademyCareerVisaForListing", label: "teklif vize kapısı" },
      { needle: "submitFreelancerBid", label: "teklif motoru" },
    ],
    mustNot: [
      { needle: "createEscrowHold", label: "teklifte hold yok" },
      { needle: "holdBps", label: "teklifte BPS yok" },
    ],
  },
  {
    file: "app/api/kurumsal/jobs/[id]/offers/route.ts",
    must: [
      { needle: "assertAcademyCareerVisaForListing", label: "kurumsal teklif vize kapısı" },
      { needle: "submitCorporateJobOffer", label: "kurumsal teklif motoru" },
    ],
    mustNot: [
      { needle: "createEscrowHold", label: "teklifte ikinci hold yok" },
      { needle: "holdBps", label: "teklifte BPS yok" },
    ],
  },
  {
    file: "app/api/kurumsal/jobs/[id]/award/route.ts",
    must: [{ needle: "assertAcademyCareerVisaForListing", label: "ödül vize kapısı" }],
    mustNot: [
      { needle: "createEscrowHold", label: "ödülde yeni hold yok" },
      { needle: "holdBps", label: "ödül BPS hesaplamaz" },
    ],
  },
  {
    file: "app/api/freelancer/contracts/[id]/release/route.ts",
    must: [{ needle: "tryIssueCareerVisaStamp", label: "release tryIssue duruyor" }],
  },
  {
    file: "app/api/kurumsal/jobs/[id]/release/route.ts",
    must: [{ needle: "tryIssueCareerVisaStamp", label: "kurumsal release tryIssue" }],
    mustNot: [{ needle: "@/lib/freelancer", label: "oda duvarı HTTP freelancer motoru" }],
  },
  {
    file: "lib/kurumsal/engine.ts",
    must: [
      { needle: "createEscrowHold", label: "çekirdek emanet mühür" },
      { needle: "corporateJobReferenceKey", label: "ilan string FK anahtarı" },
      { needle: "releaseEscrowHold", label: "çekirdek RELEASE" },
      { needle: "submitCorporateJobOffer", label: "mühürlü ilan teklifi" },
    ],
    mustNot: [
      { needle: "tryIssueCareerVisaStamp", label: "vize kurumsal engine'e girmez" },
      { needle: "issueCareerVisaStamp", label: "vize kurumsal engine'e girmez" },
      { needle: "assertAcademyCareerVisaForListing", label: "vize kapısı HTTP'dedir" },
      { needle: "@/lib/freelancer", label: "oda duvarı freelancer" },
      { needle: "@/lib/career", label: "oda duvarı kariyer" },
    ],
  },
  {
    file: "lib/career/visa-gate.ts",
    must: [
      { needle: "ACADEMY_CERTIFICATE", label: "teklif kapısı akademi vizesi" },
      { needle: "ForbiddenError", label: "erişim 403" },
    ],
    mustNot: [
      { needle: "createEscrowHold", label: "kapı emanete girmez" },
      { needle: "holdBps", label: "kapı BPS hesaplamaz" },
      { needle: "releaseEscrowHold", label: "kapı RELEASE yazmaz" },
      { needle: "splitGross", label: "kapı split yazmaz" },
      { needle: "amountMinor", label: "kapı tutar kilidi değil" },
    ],
  },
  {
    file: "lib/kernel/escrow/engine.ts",
    must: [
      { needle: "createEscrowHold", label: "tek hold yazıcı" },
      { needle: "appendLedgerEntry", label: "append-only defter" },
      { needle: "lockByReferenceKey", label: "hold satır kilidi" },
    ],
    mustNot: [
      { needle: "ACADEMY_CERTIFICATE", label: "vize emanet motoruna girmez" },
      { needle: "FREELANCER_RELEASE", label: "vize damgası emanet motoruna girmez" },
      { needle: "@/lib/career", label: "çekirdek kariyer import etmez" },
      { needle: "@/lib/freelancer", label: "çekirdek freelancer import etmez" },
      { needle: "@/lib/kurumsal", label: "çekirdek kurumsal import etmez" },
    ],
  },
  {
    file: "lib/kernel/jobs/inngest.ts",
    must: [
      { needle: "runEscrowTimeoutRefunds", label: "çekirdek TTL iade" },
      { needle: "runEscrowAtomic", label: "TTL hold TX" },
      { needle: "INNGEST_EVENTS.ESCROW_REFUNDED", label: "iade olayı" },
      { needle: "escrowRefundedNotify", label: "iade kanca dinleyicisi" },
      { needle: "reconcilePaytrPaymentOrder", label: "PSP fail-closed reconcile" },
    ],
    mustNot: [
      { needle: "freelancerContract", label: "dikey freelancer tablosu" },
      { needle: "corporateJobPosting", label: "dikey kurumsal tablosu" },
      { needle: "arenaTender", label: "dikey arena tablosu" },
      { needle: "marketplaceOrder", label: "dikey pazaryeri tablosu" },
      { needle: "clearSuccessfulPaymentOrder", label: "kör PayTR credit" },
    ],
  },
  {
    file: "lib/academy/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "akademi $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "runPurchaseAtomic", label: "atomik satın alma" },
    ],
  },
  {
    file: "lib/studio/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "studio $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "runSettleAtomic", label: "atomik settlement" },
    ],
  },
  {
    file: "lib/kernel/payments/prisma-order-store.ts",
    must: [
      { needle: "prisma.$transaction", label: "clearing $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "runClearingAtomic", label: "atomik clearing" },
      { needle: "FOR UPDATE", label: "payment_orders satır kilidi" },
    ],
  },
  {
    file: "lib/kernel/escrow/refund-hooks.ts",
    must: [
      { needle: "registerEscrowRefundHook", label: "iade kancası kaydı" },
      { needle: "OnEscrowRefunded", label: "onEscrowRefunded imzası" },
    ],
    mustNot: [
      { needle: "freelancerContract", label: "dikey freelancer tablosu" },
      { needle: "corporateJobPosting", label: "dikey kurumsal tablosu" },
    ],
  },
  {
    file: "lib/kernel/payments/paytr/mock-checkout.ts",
    must: [
      { needle: "PAYTR_MOCK_NO_CREDIT_CLAIM", label: "mock CREDIT iddia etmez" },
      { needle: "CREDIT yazmaz", label: "mock CREDIT iddia etmez metni" },
      { needle: 'NODE_ENV === "production"', label: "üretimde mock null" },
      { needle: "tryPaytrDevOnlyMockCheckout", label: "mock kapısı" },
    ],
  },
  {
    file: "lib/kernel/payments/paytr/webhook.ts",
    must: [
      { needle: "verifyPaytrWebhookHash", label: "HMAC doğrulama" },
      { needle: "PAYTR_WEBHOOK_PATH", label: "kanonik bildirim yolu" },
    ],
    mustNot: [
      { needle: "mock-checkout", label: "webhook mock checkout import etmez" },
      { needle: "buildPaytrMockCheckoutToken", label: "webhook mock token basmaz" },
    ],
  },
  {
    file: "lib/kernel/payments/paytr/callback-guard.ts",
    must: [
      { needle: "assertPaytrCallbackRouteIntegrity", label: "callback bütünlük kapısı" },
      { needle: "/api/paytr/callback", label: "ikinci ağız yasağı" },
      { needle: "merchant_ok_url", label: "tarayıcı dönüşü CREDIT yazmaz" },
    ],
  },
];

const REQUIRED_SURFACE_TESTS = [
  "tests/career/visa-stamp-surface.test.ts",
  "tests/career/visa-gate-surface.test.ts",
  "tests/freelancer/accept-atomic-surface.test.ts",
  "tests/freelancer/job-seed-surface.test.ts",
  "tests/academy/course-seed-surface.test.ts",
  "tests/kernel/wallet-ledger-surface.test.ts",
  "tests/kernel/profile-identity-surface.test.ts",
  "tests/kernel/passport-stamp-surface.test.ts",
  "tests/kernel/admin-catalog-surface.test.ts",
  "tests/kernel/auth-email-sync-surface.test.ts",
  "tests/kernel/auth-identity-ux-surface.test.ts",
  "tests/kernel/ops-migrate-surface.test.ts",
  "tests/kernel/atomic-seals-prebuild-surface.test.ts",
  "tests/kernel/boundaries-surface.test.ts",
  "tests/kernel/escrow-timeout-scan-surface.test.ts",
  "tests/kernel/legal-launch-surface.test.ts",
  "tests/freelancer/happy-path-e2e-surface.test.ts",
  "tests/freelancer/t4-freelancer-loop-surface.test.ts",
  "tests/academy/t3-academy-loop-surface.test.ts",
  "tests/academy/happy-path-e2e-surface.test.ts",
  "tests/academy/curriculum-player-surface.test.ts",
  "tests/dashboard/pulse-bff-surface.test.ts",
  "tests/kernel/cash-loop-catalog-migrate-surface.test.ts",
  "tests/kernel/cash-loop-e2e-surface.test.ts",
  "tests/kernel/http-idempotency-surface.test.ts",
  "tests/kernel/api-v1-surface.test.ts",
  "tests/kernel/rail-is-dron-lab-surface.test.ts",
  "tests/kernel/inngest-serve-guard-surface.test.ts",
  "tests/kernel/paytr-callback-guard-surface.test.ts",
  "tests/ui/shell-user-hub-surface.test.ts",
  "tests/auth/citizen-surface.test.ts",
  "tests/ui/room-skeleton-surface.test.ts",
  "tests/copy/sen-axis-surface.test.ts",
  "tests/studio/storage-signed-upload-surface.test.ts",
  "tests/kernel/earnings-bridge-surface.test.ts",
  "tests/kernel/three-ring-e2e-surface.test.ts",
] as const;

/** `*-surface.test.ts` glob’una düşmez; prebuild `test:surface` süzgecine ayrıca kilitlenir. */
const REQUIRED_CONSTITUTION_TEST = "tests/kernel/constitution-surfaces.test.ts";

const issues: string[] = [];

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function readProjectFile(relPath: string): string | null {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    return null;
  }
  return readFileSync(full, "utf8");
}

function walkSurfaceTests(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "yetkin.ai") {
        continue;
      }
      files.push(...walkSurfaceTests(full));
    } else if (entry.endsWith("-surface.test.ts")) {
      files.push(relative(ROOT, full).replace(/\\/g, "/"));
    }
  }
  return files;
}

for (const rule of FILE_RULES) {
  const raw = readProjectFile(rule.file);
  if (raw === null) {
    issues.push(`${rule.file}: zorunlu mühür dosyası yok`);
    continue;
  }
  const source = stripComments(raw);
  for (const req of rule.must) {
    if (!source.includes(req.needle)) {
      issues.push(`${rule.file}: eksik mühür — ${req.label} (\`${req.needle}\`)`);
    }
  }
  for (const ban of rule.mustNot ?? []) {
    if (source.includes(ban.needle)) {
      issues.push(`${rule.file}: yasak sızıntı — ${ban.label} (\`${ban.needle}\`)`);
    }
  }
}

for (const file of REQUIRED_SURFACE_TESTS) {
  if (!existsSync(join(ROOT, file))) {
    issues.push(`${file}: zorunlu surface test yok (prebuild vitest bu dosyayı kaçırır)`);
  }
}
if (!existsSync(join(ROOT, REQUIRED_CONSTITUTION_TEST))) {
  issues.push(
    `${REQUIRED_CONSTITUTION_TEST}: zorunlu anayasa testi yok (prebuild vitest bu dosyayı kaçırır)`,
  );
}

const foundSurface = walkSurfaceTests(join(ROOT, "tests"));
if (foundSurface.length < REQUIRED_SURFACE_TESTS.length) {
  issues.push(
    `tests/**/*-surface.test.ts sayısı yetersiz: ${foundSurface.length} < ${REQUIRED_SURFACE_TESTS.length}`,
  );
}

const pkgRaw = readProjectFile("package.json");
if (pkgRaw === null) {
  issues.push("package.json yok");
} else {
  const pkg = JSON.parse(pkgRaw) as { scripts?: Record<string, string> };
  const scripts = pkg.scripts ?? {};
  const prebuild = scripts["verify:prebuild"] ?? "";
  const build = scripts.build ?? "";
  const surface = scripts["test:surface"] ?? "";
  const atomic = scripts["verify:atomic-seals"] ?? "";

  if (!build.includes("verify:prebuild")) {
    issues.push("package.json build: verify:prebuild zincirde yok");
  }
  if (!prebuild.includes("verify:atomic-seals")) {
    issues.push("package.json verify:prebuild: verify:atomic-seals yok");
  }
  if (!prebuild.includes("test:surface")) {
    issues.push("package.json verify:prebuild: test:surface yok");
  }
  if (!prebuild.includes("verify:amount-minor")) {
    issues.push("package.json verify:prebuild: verify:amount-minor düşmüş");
  }
  if (!prebuild.includes("verify:ai-gateway")) {
    issues.push("package.json verify:prebuild: verify:ai-gateway düşmüş");
  }
  if (!prebuild.includes("verify:rls-status")) {
    issues.push("package.json verify:prebuild: verify:rls-status düşmüş");
  }
  if (!prebuild.includes("verify:api-auth")) {
    issues.push("package.json verify:prebuild: verify:api-auth düşmüş");
  }
  if (!prebuild.includes("verify:boundaries")) {
    issues.push("package.json verify:prebuild: verify:boundaries yok");
  }
  if (!prebuild.includes("verify:sen-axis")) {
    issues.push("package.json verify:prebuild: verify:sen-axis yok");
  }
  if (!prebuild.includes("typecheck")) {
    issues.push("package.json verify:prebuild: typecheck yok");
  }
  if (prebuild.includes("ops:migrate")) {
    issues.push("package.json verify:prebuild: ops:migrate canlı DB ister — statik zincire girmez");
  }
  if (/(?:^|[\s&;])npm test(?:$|[\s&;])/.test(prebuild)) {
    issues.push("package.json verify:prebuild: tam `npm test` statik zincire girmez");
  }
  if (!atomic.includes("scripts/verify-atomic-seals.ts")) {
    issues.push("package.json verify:atomic-seals: scripts/verify-atomic-seals.ts hedefi yok");
  }
  if (!surface.includes("surface.test")) {
    issues.push("package.json test:surface: *-surface.test.ts süzgeci yok");
  }
  if (!surface.includes("constitution-surfaces.test.ts")) {
    issues.push("package.json test:surface: constitution-surfaces.test.ts süzgeci yok");
  }
  if (surface.includes("**")) {
    issues.push(
      "package.json test:surface: ** glob vitest dosya süzgeci olarak Windows'ta sıfır dosya döner — `vitest run surface.test.ts` kullan",
    );
  }
}

if (issues.length > 0) {
  console.error(
    ["verify:atomic-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"),
  );
  process.exit(1);
}

console.log(
  `verify:atomic-seals OK — kariyer $transaction+heal, freelancer runAcceptAtomic+job anahtarı, akademi/studio/PayTR ledger tx, PayTR fail-closed reconcile, ledger FOR UPDATE, accept'te vize yok. ${foundSurface.length} surface test dosyası.`,
);
