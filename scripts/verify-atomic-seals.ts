#!/usr/bin/env tsx
/**
 * Atomik yazıcı taraması — statik (grep). Canlı Postgres yok.
 * Kariyer damga-portföy, freelancer kabul-emanet, ledger FOR UPDATE.
 * Surface test dosyalarının varlığı + verify:grep-seals / verify:nightly zincir kilidi.
 * Derleme kapısı değildir; güvenlik prebuild (sır, amountMinor, RLS, IDOR, v1) ayrıdır.
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
    file: "lib/career/prisma-proofs.ts",
    must: [
      { needle: "createPrismaProofReadPort", label: "kernel ProofReadPort adaptörü" },
      { needle: "@/lib/kernel/proof/prisma-read", label: "çekirdek kanıt okuma" },
    ],
    mustNot: [
      { needle: "@/lib/academy", label: "akademi dikey okuma sızıntısı" },
      { needle: "@/lib/freelancer", label: "freelancer dikey okuma sızıntısı" },
      { needle: "issued-certificates", label: "akademi iç okuma dosyası" },
      { needle: "released-proofs", label: "freelancer iç okuma dosyası" },
      { needle: "corporateJobPosting", label: "donmuş kurumsal tablo" },
      { needle: "corporate-released-proofs", label: "kurumsal okuma portu" },
      { needle: "studioDraft", label: "donmuş studio tablo" },
      { needle: "marketplaceProduct", label: "donmuş pazaryeri tablo" },
    ],
  },
  {
    file: "lib/kernel/proof/prisma-read.ts",
    must: [
      { needle: "createPrismaProofReadPort", label: "ProofReadPort Prisma adaptörü" },
      { needle: "academyCertificate", label: "akademi belge kanıtı" },
      { needle: "freelancerContract", label: "freelancer RELEASE kanıtı" },
      { needle: 'status !== "RELEASED"', label: "yalnız RELEASED iş" },
    ],
    mustNot: [
      { needle: "@/lib/academy", label: "kernel dikey akademi import etmez" },
      { needle: "@/lib/freelancer", label: "kernel dikey freelancer import etmez" },
      { needle: "@/lib/career", label: "kernel dikey kariyer import etmez" },
      { needle: "corporateJobPosting", label: "donmuş kurumsal tablo" },
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
      { needle: "RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE", label: "v1 pazaryeri 503" },
      { needle: "ServiceUnavailableError", label: "PSP yoksa 503" },
      { needle: 'funding: "psp"', label: "üçüncü kişi işinde Rail DEBIT yok" },
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
      { needle: "INSERT INTO ledger_entries", label: "defter insert CTE" },
      { needle: "Defter ve cüzdan atomik yazılamadı.", label: "CAS boş sonuç" },
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
      { needle: "requireRailV1IdempotencyKey", label: "HTTP Idempotency-Key" },
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
    file: "app/api/_gone/[...path]/route.ts",
    must: [
      { needle: "frozenRoomGone", label: "donmuş oda 410" },
    ],
    mustNot: [
      { needle: "submitCorporateJobOffer", label: "HTTP teklif motoru yok" },
      { needle: "createEscrowHold", label: "teklifte ikinci hold yok" },
      { needle: "@/lib/freelancer", label: "oda duvarı HTTP freelancer motoru" },
      { needle: "readIdempotencyKey", label: "HTTP nakit kapısı yok" },
      { needle: "settleHttpIdempotency", label: "HTTP replay yok" },
    ],
  },
  {
    file: "app/api/freelancer/contracts/[id]/release/route.ts",
    must: [{ needle: "tryIssueCareerVisaStamp", label: "release tryIssue duruyor" }],
  },
  {
    file: "archived/lib/kurumsal/engine.ts",
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
      { needle: "getSealedProof", label: "iptal edilmiş mühür canlı kanıttan düşer" },
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
      { needle: "lockByReferenceKey", label: "hold satır kilidi" },
      { needle: "settleMarketplaceSplit", label: "usta neti split portu (S43)" },
      { needle: "ESCROW_WALLET_FUNDING_FORBIDDEN", label: "cüzdan-fonlu hold yasak" },
    ],
    mustNot: [
      { needle: "appendLedgerEntry", label: "usta neti Rail defterine CREDIT yazılmaz" },
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
    file: "archived/lib/pazaryeri/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "pazaryeri $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "bindEscrowStore(tx)", label: "tx escrow" },
      { needle: "bindPazaryeriStore(tx)", label: "tx pazaryeri" },
      { needle: "runMoneyAtomic", label: "atomik nakit kapısı" },
    ],
    mustNot: [{ needle: "createPrismaLedgerStore()", label: "çıplak ledger" }],
  },
  {
    file: "archived/lib/pazaryeri/engine.ts",
    must: [
      { needle: "runMoneyAtomic", label: "atomik nakit kapısı" },
      { needle: "withPazaryeriMoney", label: "UoW sarmalayıcı" },
      { needle: "assertEidsPublicListingAllowed", label: "EİDS kamu LISTED kilidi" },
    ],
  },
  {
    file: "archived/lib/junior/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "junior $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "bindJuniorStore(tx)", label: "tx junior" },
      { needle: "runMoneyAtomic", label: "atomik harçlık kapısı" },
    ],
    mustNot: [{ needle: "createPrismaLedgerStore()", label: "çıplak ledger" }],
  },
  {
    file: "archived/lib/junior/engine.ts",
    must: [
      { needle: "runMoneyAtomic", label: "atomik harçlık kapısı" },
      { needle: "withJuniorMoney", label: "UoW sarmalayıcı" },
      { needle: "assertJuniorProductionOpen", label: "Junior üretim kilidi" },
    ],
  },
  {
    file: "archived/lib/arena/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "arena $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "bindEscrowStore(tx)", label: "tx escrow" },
      { needle: "bindArenaStore(tx)", label: "tx arena" },
      { needle: "runMoneyAtomic", label: "atomik ihale kapısı" },
    ],
    mustNot: [{ needle: "createPrismaLedgerStore()", label: "çıplak ledger" }],
  },
  {
    file: "archived/lib/arena/engine.ts",
    must: [
      { needle: "runMoneyAtomic", label: "atomik ihale kapısı" },
      { needle: "withArenaMoney", label: "UoW sarmalayıcı" },
    ],
  },
  {
    file: "archived/lib/kurumsal/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "kurumsal $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "bindEscrowStore(tx)", label: "tx escrow" },
      { needle: "bindKurumsalStore(tx)", label: "tx kurumsal" },
      { needle: "runMoneyAtomic", label: "atomik mühür kapısı" },
    ],
    mustNot: [{ needle: "createPrismaLedgerStore()", label: "çıplak ledger" }],
  },
  {
    file: "archived/lib/kurumsal/engine.ts",
    must: [
      { needle: "runMoneyAtomic", label: "atomik mühür kapısı" },
      { needle: "withKurumsalMoney", label: "UoW sarmalayıcı" },
    ],
  },
  {
    file: "archived/lib/devlabs/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "devlabs $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "bindDevLabsStore(tx)", label: "tx devlabs" },
      { needle: "runMoneyAtomic", label: "atomik settlement kapısı" },
      { needle: "bindPaidCommandStore", label: "ücretli komut store" },
    ],
    mustNot: [{ needle: "createPrismaLedgerStore()", label: "çıplak ledger" }],
  },
  {
    file: "archived/lib/devlabs/bench.ts",
    must: [
      { needle: "runMoneyAtomic", label: "atomik settlement kapısı" },
      { needle: "withDevLabsSettle", label: "UoW sarmalayıcı" },
      { needle: "requirePaidCommandKey", label: "ücretli komut anahtarı" },
      { needle: "commands.begin", label: "rezervasyon begin" },
    ],
  },
  {
    file: "archived/lib/studio/runtime.ts",
    must: [
      { needle: "prisma.$transaction", label: "studio $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "runSettleAtomic", label: "atomik settlement" },
      { needle: "bindPaidCommandStore", label: "ücretli komut store" },
    ],
  },
  {
    file: "archived/lib/studio/engine.ts",
    must: [
      { needle: "requirePaidCommandKey", label: "ücretli komut anahtarı" },
      { needle: "commands.begin", label: "rezervasyon begin" },
    ],
  },
  {
    file: "lib/kernel/compliance/circuit-breakers.ts",
    must: [
      { needle: "EIDS_PUBLIC_LISTING_LOCKED = true", label: "EİDS kilidi açık" },
      { needle: "JUNIOR_PRODUCTION_LOCKED = true", label: "Junior kilidi açık" },
      { needle: "WORKING_SHELL_NAV_ROOM_IDS", label: "çalışan 4 oda sicili" },
    ],
  },
  {
    file: "lib/kernel/payments/marketplace-split.ts",
    must: [
      { needle: 'id: "split"', label: "Pazaryeri split sağlayıcı" },
      { needle: "recorded_pending_psp", label: "split intent kaydı" },
    ],
  },
  {
    file: "prisma/migrations/20260819040000_escrow_hold_checks/migration.sql",
    must: [
      { needle: "escrow_holds_gross_equals_hold_plus_net", label: "emanet eşitlik CHECK" },
      { needle: "escrow_holds_amounts_positive", label: "emanet pozitif CHECK" },
      { needle: "escrow_holds_hold_bps_range", label: "emanet BPS CHECK" },
    ],
  },
  {
    file: "prisma/migrations/20260819030000_ledger_immutability_paid_commands/migration.sql",
    must: [
      { needle: "ledger_entries is append-only", label: "append-only trigger" },
      { needle: "wallets_amount_minor_non_negative", label: "cüzdan CHECK" },
      { needle: "ledger_entries_amount_minor_positive", label: "defter CHECK" },
      { needle: "ON DELETE RESTRICT", label: "defter RESTRICT" },
      { needle: "paid_command_reservations", label: "ücretli komut tablosu" },
      { needle: "paid_command_reservations_estimated_minor_non_negative", label: "rezerv CHECK" },
      { needle: "ledger_entries_user_id_fkey", label: "user RESTRICT" },
    ],
  },
  {
    file: "app/api/_gone/[...path]/route.ts",
    must: [{ needle: "frozenRoomGone", label: "donmuş oda 410" }],
    mustNot: [
      { needle: "readIdempotencyKey", label: "HTTP nakit kapısı yok" },
      { needle: "settleHttpIdempotency", label: "HTTP replay yok" },
    ],
  },
  {
    file: "lib/kernel/payments/prisma-order-store.ts",
    must: [
      { needle: "prisma.$transaction", label: "clearing $transaction" },
      { needle: "bindLedgerStore(tx)", label: "tx ledger" },
      { needle: "runClearingAtomic", label: "atomik clearing" },
      { needle: "FOR UPDATE", label: "payment_orders satır kilidi" },
      { needle: "updateMany", label: "durum CAS updateMany" },
      { needle: "PaymentOrderCasError", label: "CAS reddi" },
      { needle: 'in: ["PENDING", "FAILED"]', label: "PAID revive CAS" },
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
    file: "lib/kernel/ledger/engine.ts",
    must: [{ needle: "assertLedgerCreditPurpose", label: "CREDIT amaç kilidi" }],
  },
  {
    file: "lib/kernel/ledger/credit-purposes.ts",
    must: [
      { needle: 'LEDGER_EXTERNAL_CREDIT_PURPOSE = "wallet-top-up"', label: "dış CREDIT SSOT" },
      { needle: "academy-settlement", label: "akademi iç CREDIT" },
      { needle: "escrow-refund", label: "emanet iade CREDIT" },
      { needle: "escrow-release-payer-refund", label: "tahkim işveren iade CREDIT" },
    ],
    mustNot: [
      { needle: "studio-settlement", label: "donmuş studio CREDIT" },
      { needle: "junior-allowance", label: "donmuş junior CREDIT" },
    ],
  },
  {
    file: "app/api/(kernel)/payments/webhooks/paytr/route.ts",
    must: [
      { needle: 'export const auth = "webhook"', label: "webhook auth" },
      { needle: '{ status: "rejected", reason, requestId }', label: "PSP rejected gövdesi" },
    ],
    mustNot: [
      { needle: "jsonOk", label: "PayTR v1 zarfına sarılmaz" },
      { needle: "jsonFail", label: "PayTR v1 fail sarılmaz" },
      { needle: "buildV1OkBody", label: "PayTR v1 ok sarılmaz" },
      { needle: "x-rail-envelope", label: "PayTR zarf başlığı yok" },
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
  "tests/academy/lesson-media-surface.test.ts",
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
  "tests/kernel/earnings-bridge-surface.test.ts",
  "tests/kernel/three-ring-e2e-surface.test.ts",
  "tests/kernel/citizen-cash-ring-surface.test.ts",
  "tests/kernel/money-uow-surface.test.ts",
  "tests/kernel/ledger-concurrency-surface.test.ts",
  "tests/kernel/idor-seals-surface.test.ts",
  "tests/freelancer/idor-job-board-surface.test.ts",
  "tests/kernel/web-security-seals-surface.test.ts",
  "tests/kernel/paytr-reconciliation-seals-surface.test.ts",
  "tests/kernel/paytr-cas-surface.test.ts",
  "tests/kernel/circuit-breakers-surface.test.ts",
  "tests/kernel/ledger-immutability-surface.test.ts",
] as const;

/**
 * `*-surface.test.ts` glob’una düşmez. Varsayılan `npm test` PR kapısındadır;
 * nightly `test:surface` aynı dosyayı da koşar.
 */
const REQUIRED_CONSTITUTION_TEST = "tests/kernel/constitution-surfaces.test.ts";

const REQUIRED_PR_UNIT_TESTS = [
  REQUIRED_CONSTITUTION_TEST,
  "tests/kernel/four-room-smoke.test.ts",
  "tests/kernel/money-uow-rollback.test.ts",
  "tests/kernel/escrow-refund-hooks-vertical.test.ts",
] as const;

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
      if (entry === "node_modules" || entry === "yetkin_muze" || entry === "yetkin.ai") {
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

const LIVE_CREDIT_PURPOSE_ALLOW = new Set([
  "wallet-top-up",
  "academy-settlement",
  "escrow-refund",
  "escrow-release-payer-refund",
]);

function walkLibTs(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules") {
        continue;
      }
      files.push(...walkLibTs(full));
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      files.push(relative(ROOT, full).replace(/\\/g, "/"));
    }
  }
  return files;
}

function liveCreditPurposeLiterals(source: string): string[] {
  const found = new Set<string>();
  const pattern = /direction:\s*"CREDIT"[\s\S]{0,280}?purpose:\s*"([^"]+)"/g;
  for (const match of source.matchAll(pattern)) {
    const purpose = match[1];
    if (purpose) {
      found.add(purpose);
    }
  }
  return [...found];
}

for (const file of walkLibTs(join(ROOT, "lib"))) {
  const raw = readProjectFile(file);
  if (raw === null) {
    continue;
  }
  const source = stripComments(raw);
  for (const purpose of liveCreditPurposeLiterals(source)) {
    if (!LIVE_CREDIT_PURPOSE_ALLOW.has(purpose)) {
      issues.push(`${file}: canlı lib CREDIT amacı izin listesinde değil — \`${purpose}\``);
    }
  }
}

const FROZEN_PRISMA_DELEGATES = [
  "corporateJobPosting",
  "corporateCompany",
  "corporateJobOffer",
  "studioDraft",
  "studioGeneration",
  "studioDigitalAsset",
  "devLabsProject",
  "devLabsApiKey",
  "devLabsArtifact",
  "grantProgram",
  "grantApplication",
  "arenaTender",
  "arenaSubmission",
  "arenaAward",
  "marketplaceProduct",
  "marketplaceOrder",
  "marketplaceOffer",
  "marketplaceDoping",
  "juniorProfile",
  "guardianInviteToken",
  "juniorAllowance",
  "proofFeedItem",
  "proofFeedInteraction",
] as const;

const FOUR_ROOM_SCAN_ROOTS = [
  join(ROOT, "lib", "academy"),
  join(ROOT, "lib", "career"),
  join(ROOT, "lib", "dashboard"),
  join(ROOT, "lib", "freelancer"),
  join(ROOT, "lib", "kernel"),
  join(ROOT, "app"),
] as const;

for (const scanRoot of FOUR_ROOM_SCAN_ROOTS) {
  for (const file of walkLibTs(scanRoot)) {
    const raw = readProjectFile(file);
    if (raw === null) {
      continue;
    }
    const source = stripComments(raw);
    for (const delegate of FROZEN_PRISMA_DELEGATES) {
      if (source.includes(`prisma.${delegate}`) || source.includes(`db.${delegate}`)) {
        issues.push(`${file}: 4 oda donmuş Prisma delegate — prisma.${delegate}`);
      }
    }
  }
}

for (const file of REQUIRED_SURFACE_TESTS) {
  if (!existsSync(join(ROOT, file))) {
    issues.push(`${file}: zorunlu surface test yok (nightly test:surface bu dosyayı kaçırır)`);
  }
}
for (const file of REQUIRED_PR_UNIT_TESTS) {
  if (!existsSync(join(ROOT, file))) {
    issues.push(`${file}: zorunlu PR birim testi yok (npm test bu dosyayı kaçırır)`);
  }
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
  const nightly = scripts["verify:nightly"] ?? "";
  const grepSeals = scripts["verify:grep-seals"] ?? "";
  const build = scripts.build ?? "";
  const surface = scripts["test:surface"] ?? "";
  const atomic = scripts["verify:atomic-seals"] ?? "";
  const unitTest = scripts.test ?? "";

  if (!build.includes("verify:prebuild")) {
    issues.push("package.json build: verify:prebuild zincirde yok");
  }
  if (prebuild.includes("verify:atomic-seals")) {
    issues.push("package.json verify:prebuild: verify:atomic-seals grep nightly/grep-seals kovasına taşınır");
  }
  if (!grepSeals.includes("verify:atomic-seals")) {
    issues.push("package.json verify:grep-seals: verify:atomic-seals yok");
  }
  if (!nightly.includes("verify:grep-seals")) {
    issues.push("package.json verify:nightly: verify:grep-seals yok");
  }
  if (!prebuild.includes("verify:idor-seals")) {
    issues.push("package.json verify:prebuild: verify:idor-seals yok");
  }
  if (prebuild.includes("test:surface")) {
    issues.push("package.json verify:prebuild: test:surface nightly kovasına taşınır");
  }
  if (prebuild.includes("verify:sen-axis")) {
    issues.push("package.json verify:prebuild: verify:sen-axis marka taramasıdır — grep-seals/nightly");
  }
  if (!grepSeals.includes("verify:sen-axis")) {
    issues.push("package.json verify:grep-seals: verify:sen-axis yok (nightly marka tarama)");
  }
  if (prebuild.includes("verify:ai-gateway")) {
    issues.push("package.json verify:prebuild: verify:ai-gateway nightly kovasına taşınır");
  }
  if (prebuild.includes("typecheck")) {
    issues.push("package.json verify:prebuild: typecheck ayrı CI adımıdır, prebuild'de yok");
  }
  if (!prebuild.includes("verify:amount-minor")) {
    issues.push("package.json verify:prebuild: verify:amount-minor düşmüş");
  }
  if (!prebuild.includes("verify:rls-status")) {
    issues.push("package.json verify:prebuild: verify:rls-status düşmüş");
  }
  if (prebuild.includes("verify:api-auth")) {
    issues.push("package.json verify:prebuild: verify:api-auth grep nightly/grep-seals kovasına taşınır");
  }
  if (!grepSeals.includes("verify:api-auth")) {
    issues.push("package.json verify:grep-seals: verify:api-auth yok");
  }
  if (prebuild.includes("verify:boundaries")) {
    issues.push("package.json verify:prebuild: verify:boundaries grep nightly/grep-seals kovasına taşınır");
  }
  if (!grepSeals.includes("verify:boundaries")) {
    issues.push("package.json verify:grep-seals: verify:boundaries yok");
  }
  if (!prebuild.includes("verify:v1-contract-artifacts")) {
    issues.push("package.json verify:prebuild: verify:v1-contract-artifacts yok");
  }
  if (!prebuild.includes("verify:no-secrets")) {
    issues.push("package.json verify:prebuild: verify:no-secrets yok");
  }
  if (!nightly.includes("verify:ai-gateway")) {
    issues.push("package.json verify:nightly: verify:ai-gateway yok");
  }
  if (!nightly.includes("test:surface")) {
    issues.push("package.json verify:nightly: test:surface yok");
  }
  if (!nightly.includes("verify:web-security-seals")) {
    issues.push("package.json verify:nightly: verify:web-security-seals yok");
  }
  if (!nightly.includes("verify:paytr-reconciliation-seals")) {
    issues.push("package.json verify:nightly: verify:paytr-reconciliation-seals yok");
  }
  if (nightly.includes("verify:junior-guardianship-seals")) {
    issues.push(
      "package.json verify:nightly: junior-guardianship 410 envanteridir — test:frozen",
    );
  }
  if (nightly.includes("verify:academy-pedagogy-seals")) {
    issues.push(
      "package.json verify:nightly: academy-pedagogy-seals Faz 4'te nightly dışı (prebuild'e alınmaz)",
    );
  }
  if (prebuild.includes("verify:academy-pedagogy-seals")) {
    issues.push("package.json verify:prebuild: academy-pedagogy-seals prebuild kapısı değildir");
  }
  if (!(scripts["test:frozen"] ?? "").includes("vitest.frozen.config.ts")) {
    issues.push("package.json test:frozen: vitest.frozen.config.ts yok — 410 yeşili ayrı kalmalı");
  }
  if (prebuild.includes("ops:migrate")) {
    issues.push("package.json verify:prebuild: ops:migrate canlı DB ister — statik zincire girmez");
  }
  if (/(?:^|[\s&;])npm test(?:$|[\s&;])/.test(prebuild)) {
    issues.push("package.json verify:prebuild: tam `npm test` statik zincire girmez");
  }
  if (!unitTest.includes("--exclude") || !unitTest.includes("surface.test.ts")) {
    issues.push(
      "package.json test: *surface.test.ts çekirdek vitest'ten --exclude ile çıkar; nightly test:surface",
    );
  }
  for (const file of REQUIRED_PR_UNIT_TESTS) {
    const base = file.slice(file.lastIndexOf("/") + 1);
    if (unitTest.includes(base)) {
      issues.push(`package.json test: ${base} çekirdek kapıdan --exclude ile çıkarılmamalı`);
    }
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
  `verify:atomic-seals OK — kariyer $transaction+heal, freelancer runAcceptAtomic+job anahtarı, akademi/studio/PayTR ledger tx, pazaryeri/junior/arena/kurumsal/devlabs runMoneyAtomic, PayTR fail-closed reconcile, ledger FOR UPDATE, accept'te vize yok. ${foundSurface.length} surface test dosyası.`,
);
