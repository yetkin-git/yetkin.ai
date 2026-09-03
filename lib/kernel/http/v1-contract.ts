/**
 * `/api/v1` sözleşme sicili — Diyar B (Rail İş) lab hop'ları.
 * Anayasa: yayınlanmış alan sessizce düşmez. Bu dosyadaki DTO / OpenAPI
 * kısaltması major sürüm ister. Kernel dikey oda import etmez; alanlar
 * burada dondurulur.
 */

import { z } from "zod";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { SHA256_HEX_PATTERN } from "@/lib/kernel/crypto/sha256";
import {
  RAIL_API_VERSION_LABEL,
  RAIL_MIN_VERSION_HEADER,
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_HEADER_INVALID,
  RAIL_VERSION_HEADER_REQUIRED,
  RAIL_VERSION_SERVER_STALE,
} from "@/lib/kernel/http/api-v1";
import { IDEMPOTENCY_KEY_HEADER } from "@/lib/kernel/http/idempotency-key";
import { CURRENCY_CODES } from "@/lib/kernel/money/currency";
import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/kernel/pricing/freelancer-job-band";
import { PASSPORT_STAMP_SOURCE_KINDS } from "@/lib/kernel/passport/types";
import { EDGE_API_SESSION_ERROR } from "@/lib/kernel/security/edge-api-auth";
import {
  RAIL_V1_API_VERSION_LABEL,
  RAIL_V1_ENVELOPE_KEYS,
  detectRailJsonFlavor,
  isRailUnversionedOkBody,
  type RailV1FailBody,
  type RailV1OkBody,
} from "@/lib/kernel/http/v1-envelope";
import {
  RAIL_V1_DRON_FORBIDDEN_HOP_IDS,
  RAIL_V1_HOPS_META,
  isRailV1HopMetaDronForbidden,
  type RailV1HopId,
  type RailV1HopMethod,
  type RailV1WireAuth,
} from "@/lib/kernel/http/v1-hops-meta";

export type { RailV1HopId, RailV1HopMethod, RailV1WireAuth };

export const RAIL_V1_OPENAPI_VERSION = "3.0.3" as const;
export const RAIL_V1_CONTRACT_TITLE = `${YETKIN_BRAND} API v1`;
export const RAIL_V1_BEARER_SCHEME = "BearerAuth" as const;

export const RAIL_V1_IDEMPOTENCY_REQUIRED = "Idempotency-Key başlığı zorunludur.";
export const RAIL_V1_IDEMPOTENCY_UUID = "Idempotency-Key UUID olmalıdır.";
export const RAIL_V1_IDEMPOTENCY_BODY_CONFLICT =
  "Idempotency-Key aynı anahtarla farklı gövde kullanılamaz.";
export const RAIL_V1_IDEMPOTENCY_IN_PROGRESS = "Aynı Idempotency-Key işleniyor.";
export const RAIL_V1_BID_FIELDS_INVALID = "Teklif alanları geçersiz.";
export const RAIL_V1_DELIVERY_FIELDS_INVALID = "Teslimat alanları geçersiz.";
export const RAIL_V1_DELIVERY_FORBIDDEN = "Yalnız sözleşme ustası teslimat yazabilir.";
export const RAIL_V1_DELIVERY_NOT_FUNDED = "Teslimat yalnız emanet blokeli sözleşmeye yazılır.";
export const RAIL_V1_RELEASE_FORBIDDEN = "Yalnız işveren emaneti serbest bırakabilir.";
export const RAIL_V1_RELEASE_NOT_FUNDED = "Sözleşme serbest bırakılamaz.";
export const RAIL_V1_ACCEPT_FORBIDDEN = "Yalnız ilan sahibi teklif kabul edebilir.";
export const RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE = "Yetersiz bakiye. Teklif kabul edilemez.";
export const RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE = "Ödeme henüz bağlanmadı";
export const RAIL_V1_ACCEPT_FIELDS_INVALID = "Teklif kimliği gerekli.";
export const RAIL_V1_OWNER_BIDS_FORBIDDEN = "Yalnız ilan sahibi teklifleri görebilir.";
export const RAIL_V1_OWNER_BIDS_NOT_FOUND = "İlan bulunamadı.";
export const RAIL_V1_LISTING_VISA_DENIED =
  "Nitelikli ilana teklif için geçerli Kariyer Vizesi (akademi sertifikası) gerekir.";
export const RAIL_V1_SESSION_REQUIRED = EDGE_API_SESSION_ERROR;
export const RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID = "Hash biçimi SHA256 (64 hex) değil.";
export const RAIL_V1_ACADEMY_CERTIFICATE_MISSING =
  "Bu hash akademi sicilinde yok. Uydurma geçerli damga basılmaz.";
export const RAIL_V1_ACADEMY_CERTIFICATE_MISMATCH =
  "Kayıt var; yeniden hesaplanan SHA256 saklanan hash ile örtüşmüyor. Belge güvenilir sayılmaz.";
export const RAIL_V1_ACADEMY_CERTIFICATE_INCOMPLETE =
  "Kayıt var; deneme, puan veya müfredat mühürü eksik olduğu için mühür yeniden hesaplanamaz.";

/** Akademi HTML mührü ile aynı kapsama cümleleri — kernel oda import etmez. */
export const RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS = [
  "vatandaş kimliği",
  "kurs kimliği",
  "sınav denemesi",
  "puan",
  "basım anı",
  "müfredat mühürü",
] as const;
export const RAIL_V1_ACADEMY_CERTIFICATE_PAYLOAD_VERSION =
  "yetkin-rail.academy.certificate.v2" as const;
export const RAIL_V1_ACADEMY_EXAM_PASS_SCORE = 70 as const;
export const RAIL_V1_ACADEMY_CERTIFICATE_ALGORITHM = "SHA256" as const;
export const RAIL_V1_ACADEMY_CERTIFICATE_INTEGRITY_KIND = "sha256-content-digest" as const;
export const RAIL_V1_ACADEMY_CERTIFICATE_SEAL_VALID = "valid" as const;
export const RAIL_V1_ACADEMY_CERTIFICATE_SEAL_REVOKED = "revoked" as const;
export const RAIL_V1_ACADEMY_PURCHASE_BODY_INVALID = "Satın alma gövdesi geçersiz.";

export const RAIL_V1_JOB_STATUSES = ["OPEN", "AWARDED", "CANCELLED"] as const;
export const RAIL_V1_BID_STATUSES = ["SUBMITTED", "ACCEPTED", "REJECTED"] as const;
export const RAIL_V1_CONTRACT_STATUSES = ["FUNDED", "RELEASED", "REFUNDED", "DISPUTED"] as const;

export const railV1RequestIdSchema = z.uuid();
export const railV1CurrencySchema = z.enum(CURRENCY_CODES);
export const railV1AmountMinorSchema = z.int().nonnegative();
export const railV1IsoDateTimeSchema = z.iso.datetime();

export const railV1FailEnvelopeSchema = z.strictObject({
  ok: z.literal(false),
  error: z.string().min(1),
  requestId: railV1RequestIdSchema,
  apiVersion: z.literal(RAIL_V1_API_VERSION_LABEL),
  data: z.null(),
});

export const railV1OkEnvelopeSchema = z.strictObject({
  ok: z.literal(true),
  error: z.null(),
  requestId: railV1RequestIdSchema,
  apiVersion: z.literal(RAIL_V1_API_VERSION_LABEL),
  data: z.record(z.string(), z.unknown()),
});

export const railV1EnvelopeSchema = z.discriminatedUnion("ok", [
  railV1OkEnvelopeSchema,
  railV1FailEnvelopeSchema,
]);

export function railV1OkEnvelopeOf<T extends z.ZodType>(dataSchema: T) {
  return z.strictObject({
    ok: z.literal(true),
    error: z.null(),
    requestId: railV1RequestIdSchema,
    apiVersion: z.literal(RAIL_V1_API_VERSION_LABEL),
    data: dataSchema,
  });
}

export const railV1HealthChecksSchema = z.strictObject({
  db: z.enum(["ok", "down", "unconfigured"]),
  supabaseAuth: z.enum(["configured", "unconfigured"]),
  inngest: z.enum(["configured", "unconfigured"]),
  payments: z.enum(["configured", "unconfigured"]),
  examSitting: z.enum(["configured", "unconfigured"]),
});

export const railV1HealthDataSchema = z.strictObject({
  service: z.literal("yetkin-rail"),
  probe: z.literal("readiness"),
  status: z.enum(["ok", "unhealthy"]),
  checks: railV1HealthChecksSchema,
});

export const railV1SessionUserSchema = z.strictObject({
  id: z.uuid(),
  email: z.email(),
});

export const railV1SessionDataSchema = z.strictObject({
  user: railV1SessionUserSchema,
});

export const railV1WalletStripSchema = z.strictObject({
  live: z.boolean(),
  amountMinor: railV1AmountMinorSchema,
  currencyCode: railV1CurrencySchema,
});

export const railV1WalletStripDataSchema = z.strictObject({
  strip: railV1WalletStripSchema,
});

export const railV1JobSchema = z.strictObject({
  id: z.string().min(1),
  clientId: z.string().min(1),
  title: z.string().min(1),
  brief: z.string().min(1),
  budgetMinor: railV1AmountMinorSchema,
  currencyCode: railV1CurrencySchema,
  status: z.enum(RAIL_V1_JOB_STATUSES),
  createdAt: railV1IsoDateTimeSchema,
  updatedAt: railV1IsoDateTimeSchema,
});

export const railV1JobsDataSchema = z.strictObject({
  jobs: z.array(railV1JobSchema),
});

export const railV1BidRequestSchema = z.strictObject({
  amountMinor: z.int().min(FREELANCER_JOB_MIN_MINOR).max(FREELANCER_JOB_MAX_MINOR),
  coverNote: z.string().trim().min(4).max(2000),
});

export const railV1BidSchema = z.strictObject({
  id: z.string().min(1),
  jobId: z.string().min(1),
  bidderId: z.string().min(1),
  amountMinor: railV1AmountMinorSchema,
  currencyCode: railV1CurrencySchema,
  coverNote: z.string().min(1),
  status: z.enum(RAIL_V1_BID_STATUSES),
  createdAt: railV1IsoDateTimeSchema,
  updatedAt: railV1IsoDateTimeSchema,
});

export const railV1BidDataSchema = z.strictObject({
  bid: railV1BidSchema,
});

/**
 * GET /api/v1/client/jobs/{id}/bids — owner-only teklif listesi.
 * `bidderId` / `status` / `updatedAt` / `currencyCode` / `jobId` yok.
 * `bidId` accept gövdesi ile aynı addır; sessiz `id` map yok.
 */
export const railV1ClientJobBidSchema = z.strictObject({
  bidId: z.string().min(1),
  amountMinor: railV1AmountMinorSchema,
  coverNote: z.string().min(1),
  createdAt: railV1IsoDateTimeSchema,
});

export const railV1ClientJobBidsViewSchema = z.strictObject({
  bids: z.array(railV1ClientJobBidSchema),
});

export type ClientJobBidView = z.infer<typeof railV1ClientJobBidSchema>;
export type ClientJobBidsView = z.infer<typeof railV1ClientJobBidsViewSchema>;

export const railV1ContractSchema = z.strictObject({
  id: z.string().min(1),
  jobId: z.string().min(1),
  bidId: z.string().min(1),
  clientId: z.string().min(1),
  freelancerId: z.string().min(1),
  escrowHoldId: z.string().min(1),
  status: z.enum(RAIL_V1_CONTRACT_STATUSES),
  currencyCode: railV1CurrencySchema,
  grossMinor: railV1AmountMinorSchema,
  holdMinor: railV1AmountMinorSchema,
  netMinor: railV1AmountMinorSchema,
  holdBps: z.int().min(0).max(10_000),
  fundedAt: railV1IsoDateTimeSchema,
  releasedAt: railV1IsoDateTimeSchema.nullable(),
  refundedAt: railV1IsoDateTimeSchema.nullable(),
  createdAt: railV1IsoDateTimeSchema,
  updatedAt: railV1IsoDateTimeSchema,
});

export type RailV1Contract = z.infer<typeof railV1ContractSchema>;

/**
 * GET /api/v1/freelancer/contracts öğesi.
 * `deliveredAt` mesaj tablosundan türetilir (kind=DELIVERY, max createdAt).
 * Yeni kolon yoktur. body / artifactUrl / reportJson yayınlanmaz.
 */
export const railV1FreelancerContractViewSchema = z.strictObject({
  id: z.string().min(1),
  jobId: z.string().min(1),
  bidId: z.string().min(1),
  clientId: z.string().min(1),
  freelancerId: z.string().min(1),
  escrowHoldId: z.string().min(1),
  status: z.enum(RAIL_V1_CONTRACT_STATUSES),
  currencyCode: railV1CurrencySchema,
  grossMinor: railV1AmountMinorSchema,
  holdMinor: railV1AmountMinorSchema,
  netMinor: railV1AmountMinorSchema,
  holdBps: z.int().min(0).max(10_000),
  fundedAt: railV1IsoDateTimeSchema,
  releasedAt: railV1IsoDateTimeSchema.nullable(),
  refundedAt: railV1IsoDateTimeSchema.nullable(),
  createdAt: railV1IsoDateTimeSchema,
  updatedAt: railV1IsoDateTimeSchema,
  deliveredAt: railV1IsoDateTimeSchema.nullable(),
});

export type FreelancerContractView = z.infer<typeof railV1FreelancerContractViewSchema>;
export type RailV1FreelancerContractView = FreelancerContractView;

export const railV1ContractsDataSchema = z.strictObject({
  contracts: z.array(railV1FreelancerContractViewSchema),
});

/**
 * POST /api/v1/freelancer/contracts/{id}/messages — dar teslim.
 * Yalnız kind=DELIVERY. body/artifactUrl cevapta yoktur.
 */
export const railV1DeliveryRequestSchema = z.strictObject({
  kind: z.literal("DELIVERY"),
  body: z.string().trim().min(8).max(8000),
  artifactUrl: z.string().trim().max(2000).optional(),
});

export const railV1DeliveryMessageSchema = z.strictObject({
  id: z.string().min(1),
  contractId: z.string().min(1),
  kind: z.literal("DELIVERY"),
  createdAt: railV1IsoDateTimeSchema,
});

export const railV1DeliveryDataSchema = z.strictObject({
  message: railV1DeliveryMessageSchema,
});

export type RailV1DeliveryRequest = z.infer<typeof railV1DeliveryRequestSchema>;
export type RailV1DeliveryMessage = z.infer<typeof railV1DeliveryMessageSchema>;
export type RailV1DeliveryData = z.infer<typeof railV1DeliveryDataSchema>;

export const railV1VisaStampSchema = z.strictObject({
  id: z.string().min(1),
  userId: z.string().min(1),
  sourceKind: z.enum(PASSPORT_STAMP_SOURCE_KINDS),
  sourceId: z.string().min(1),
  visaKey: z.string().min(1),
  moduleId: z.string().min(1),
  title: z.string().min(1),
  certificateHash: z.string().nullable(),
  issuedAt: railV1IsoDateTimeSchema,
  createdAt: railV1IsoDateTimeSchema,
});

export type RailV1VisaStamp = z.infer<typeof railV1VisaStampSchema>;

export const railV1ReleaseDataSchema = z.strictObject({
  contract: railV1ContractSchema,
  visaStamp: railV1VisaStampSchema.nullable(),
});

export type RailV1ReleaseData = z.infer<typeof railV1ReleaseDataSchema>;

export const railV1RefundDataSchema = z.strictObject({
  contract: railV1ContractSchema,
});

export const railV1AcceptRequestSchema = z.strictObject({
  bidId: z.string().min(1),
});

/** POST …/jobs/{id}/accept ack. visaStamp yok; deliveredAt yok (GET Tezgâh view değil). */
export const railV1AcceptDataSchema = z.strictObject({
  contract: railV1ContractSchema,
});

export type RailV1AcceptRequest = z.infer<typeof railV1AcceptRequestSchema>;
export type RailV1AcceptData = z.infer<typeof railV1AcceptDataSchema>;

export const railV1Sha256HexSchema = z.string().regex(SHA256_HEX_PATTERN);

export const railV1PublicAcademyCertificateDataSchema = z.strictObject({
  title: z.string().min(1),
  courseTitle: z.string().min(1),
  courseSlug: z.string().min(1).nullable(),
  score: z.int().min(RAIL_V1_ACADEMY_EXAM_PASS_SCORE).max(100),
  issuedAt: railV1IsoDateTimeSchema,
  certificateHash: railV1Sha256HexSchema,
  curriculumSeal: railV1Sha256HexSchema,
  algorithm: z.literal(RAIL_V1_ACADEMY_CERTIFICATE_ALGORITHM),
  payloadVersion: z.literal(RAIL_V1_ACADEMY_CERTIFICATE_PAYLOAD_VERSION),
  hashedFields: z.tuple([
    z.literal(RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS[0]),
    z.literal(RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS[1]),
    z.literal(RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS[2]),
    z.literal(RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS[3]),
    z.literal(RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS[4]),
    z.literal(RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS[5]),
  ]),
  integrityKind: z.literal(RAIL_V1_ACADEMY_CERTIFICATE_INTEGRITY_KIND),
  sealStatus: z.enum([
    RAIL_V1_ACADEMY_CERTIFICATE_SEAL_VALID,
    RAIL_V1_ACADEMY_CERTIFICATE_SEAL_REVOKED,
  ]),
  revokedAt: railV1IsoDateTimeSchema.nullable(),
  passScore: z.literal(RAIL_V1_ACADEMY_EXAM_PASS_SCORE),
});

export type RailV1PublicAcademyCertificateData = z.infer<typeof railV1PublicAcademyCertificateDataSchema>;

export const railV1AcademyPulseSchema = z.strictObject({
  live: z.boolean(),
  purchasesCount: z.int().nonnegative(),
  certificatesHeld: z.int().nonnegative(),
  lastCertificateTitle: z.string().min(1).nullable(),
  currencyCode: railV1CurrencySchema,
});

export const railV1AcademyPulseDataSchema = z.strictObject({
  pulse: railV1AcademyPulseSchema,
});

export const railV1AcademyPurchaseRequestSchema = z.strictObject({
  lockId: z.string().trim().min(1).optional(),
});

export const railV1AcademyPurchaseDataSchema = z.strictObject({
  applied: z.boolean(),
  purchase: z.strictObject({
    id: z.string().min(1),
    courseId: z.string().min(1),
    amountMinor: railV1AmountMinorSchema,
    status: z.literal("SETTLED"),
  }),
  certificate: z
    .strictObject({
      id: z.string().min(1),
      serialKey: z.string().min(1),
    })
    .nullable(),
});

export const railV1CareerPulseSchema = z.strictObject({
  live: z.boolean(),
  visaCount: z.int().nonnegative(),
  portfolioCount: z.int().nonnegative(),
  lastVisaTitle: z.string().min(1).nullable(),
});

export const railV1CareerPulseDataSchema = z.strictObject({
  pulse: railV1CareerPulseSchema,
});

export const railV1CareerVisasDataSchema = z.strictObject({
  stamps: z.array(railV1VisaStampSchema),
});

export type RailV1RouteAuth = "public" | "session";

export type RailV1Hop = {
  id: string;
  method: RailV1HopMethod;
  v1PathTemplate: string;
  canonicalPathTemplate: string;
  routeAuthPattern: string;
  routeAuth: RailV1RouteAuth;
  v1Auth: RailV1WireAuth;
  cookieAuth: false;
  idempotency: boolean;
  minVersionHeaderRequired: boolean;
  successStatus: 200 | 201;
  dataKeys: readonly string[];
  publishedDataPaths: readonly string[];
  dataSchema: z.ZodType;
  requestSchema?: z.ZodType;
  exampleParams?: Readonly<Record<string, string>>;
  errors: readonly string[];
  /**
   * Native mağaza (IAP). `forbidden` = Dron istemcisi çağırmaz;
   * hop Amiral çerez/Bearer + lab protokolündedir.
   */
  nativeStore?: "allowed" | "forbidden";
};

export const RAIL_V1_SHARED_ERRORS = {
  versionHeaderRequired: RAIL_VERSION_HEADER_REQUIRED,
  versionHeaderInvalid: RAIL_VERSION_HEADER_INVALID,
  versionClientStale: RAIL_VERSION_CLIENT_STALE,
  versionServerStale: RAIL_VERSION_SERVER_STALE,
  sessionRequired: RAIL_V1_SESSION_REQUIRED,
  idempotencyRequired: RAIL_V1_IDEMPOTENCY_REQUIRED,
  idempotencyUuid: RAIL_V1_IDEMPOTENCY_UUID,
  idempotencyBodyConflict: RAIL_V1_IDEMPOTENCY_BODY_CONFLICT,
  idempotencyInProgress: RAIL_V1_IDEMPOTENCY_IN_PROGRESS,
} as const;

const SESSION_ERRORS = [
  RAIL_V1_SESSION_REQUIRED,
  RAIL_VERSION_HEADER_REQUIRED,
  RAIL_VERSION_HEADER_INVALID,
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_SERVER_STALE,
] as const;

const WRITE_ERRORS = [
  ...SESSION_ERRORS,
  RAIL_V1_IDEMPOTENCY_REQUIRED,
  RAIL_V1_IDEMPOTENCY_UUID,
  RAIL_V1_IDEMPOTENCY_BODY_CONFLICT,
  RAIL_V1_IDEMPOTENCY_IN_PROGRESS,
] as const;

const PUBLIC_CERTIFICATE_ERRORS = [
  RAIL_VERSION_HEADER_REQUIRED,
  RAIL_VERSION_HEADER_INVALID,
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_SERVER_STALE,
  RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID,
  RAIL_V1_ACADEMY_CERTIFICATE_MISSING,
  RAIL_V1_ACADEMY_CERTIFICATE_MISMATCH,
  RAIL_V1_ACADEMY_CERTIFICATE_INCOMPLETE,
] as const;

type RailV1HopContract = Omit<
  RailV1Hop,
  "id" | "method" | "v1PathTemplate" | "v1Auth" | "cookieAuth" | "nativeStore"
>;

function bindRailV1Hop(
  meta: (typeof RAIL_V1_HOPS_META)[number],
  contract: RailV1HopContract,
): RailV1Hop {
  return {
    id: meta.id,
    method: meta.method,
    v1PathTemplate: meta.v1PathTemplate,
    v1Auth: meta.v1Auth,
    cookieAuth: meta.cookieAuth,
    nativeStore: isRailV1HopMetaDronForbidden(meta) ? "forbidden" : undefined,
    ...contract,
  };
}

const RAIL_V1_HOP_CONTRACTS = {
  health: {
    canonicalPathTemplate: "/api/health",
    routeAuthPattern: "/api/health",
    routeAuth: "public",
    idempotency: false,
    minVersionHeaderRequired: false,
    successStatus: 200,
    dataKeys: ["service", "probe", "status", "checks"],
    publishedDataPaths: [
      "service",
      "probe",
      "status",
      "checks",
      "checks.db",
      "checks.supabaseAuth",
      "checks.inngest",
      "checks.payments",
      "checks.examSitting",
    ],
    dataSchema: railV1HealthDataSchema,
    errors: ["Veritabanı bağlı değil.", "Veritabanı erişilemez.", "Omurga hazır değil."],
  },
  "academy-certificate": {
    canonicalPathTemplate: "/api/academy/certificates/{hash}",
    routeAuthPattern: "/api/academy/certificates/[hash]",
    routeAuth: "public",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: [
      "title",
      "courseTitle",
      "courseSlug",
      "score",
      "issuedAt",
      "certificateHash",
      "curriculumSeal",
      "algorithm",
      "payloadVersion",
      "hashedFields",
      "integrityKind",
      "sealStatus",
      "revokedAt",
      "passScore",
    ],
    publishedDataPaths: [
      "title",
      "courseTitle",
      "courseSlug",
      "score",
      "issuedAt",
      "certificateHash",
      "curriculumSeal",
      "algorithm",
      "payloadVersion",
      "hashedFields",
      "integrityKind",
      "sealStatus",
      "revokedAt",
      "passScore",
    ],
    dataSchema: railV1PublicAcademyCertificateDataSchema,
    exampleParams: {
      hash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
    errors: PUBLIC_CERTIFICATE_ERRORS,
  },
  "academy-pulse": {
    canonicalPathTemplate: "/api/academy/pulse",
    routeAuthPattern: "/api/academy/pulse",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["pulse"],
    publishedDataPaths: [
      "pulse",
      "pulse.live",
      "pulse.purchasesCount",
      "pulse.certificatesHeld",
      "pulse.lastCertificateTitle",
      "pulse.currencyCode",
    ],
    dataSchema: railV1AcademyPulseDataSchema,
    errors: SESSION_ERRORS,
  },
  "academy-purchase": {
    canonicalPathTemplate: "/api/academy/courses/{id}/purchase",
    routeAuthPattern: "/api/academy/courses/[id]/purchase",
    routeAuth: "session",
    idempotency: true,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["applied", "purchase", "certificate"],
    publishedDataPaths: [
      "applied",
      "purchase",
      "purchase.id",
      "purchase.courseId",
      "purchase.amountMinor",
      "purchase.status",
      "certificate",
      "certificate.id",
      "certificate.serialKey",
    ],
    dataSchema: railV1AcademyPurchaseDataSchema,
    requestSchema: railV1AcademyPurchaseRequestSchema,
    exampleParams: { id: "course_lab_1" },
    errors: [...WRITE_ERRORS, RAIL_V1_ACADEMY_PURCHASE_BODY_INVALID],
  },
  "auth-session": {
    canonicalPathTemplate: "/api/auth/session",
    routeAuthPattern: "/api/auth/session",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["user"],
    publishedDataPaths: ["user", "user.id", "user.email"],
    dataSchema: railV1SessionDataSchema,
    errors: SESSION_ERRORS,
  },
  "wallet-strip": {
    canonicalPathTemplate: "/api/dashboard/wallet-strip",
    routeAuthPattern: "/api/dashboard/wallet-strip",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["strip"],
    publishedDataPaths: ["strip", "strip.live", "strip.amountMinor", "strip.currencyCode"],
    dataSchema: railV1WalletStripDataSchema,
    errors: [...SESSION_ERRORS, "Veritabanı erişilemez."],
  },
  "freelancer-jobs": {
    canonicalPathTemplate: "/api/freelancer/jobs",
    routeAuthPattern: "/api/freelancer/jobs",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["jobs"],
    publishedDataPaths: [
      "jobs",
      "jobs[].id",
      "jobs[].clientId",
      "jobs[].title",
      "jobs[].brief",
      "jobs[].budgetMinor",
      "jobs[].currencyCode",
      "jobs[].status",
      "jobs[].createdAt",
      "jobs[].updatedAt",
    ],
    dataSchema: railV1JobsDataSchema,
    errors: SESSION_ERRORS,
  },
  "client-job-bids": {
    canonicalPathTemplate: "/api/client/jobs/{id}/bids",
    routeAuthPattern: "/api/client/jobs/[id]/bids",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["bids"],
    publishedDataPaths: [
      "bids",
      "bids[].bidId",
      "bids[].amountMinor",
      "bids[].coverNote",
      "bids[].createdAt",
    ],
    dataSchema: railV1ClientJobBidsViewSchema,
    exampleParams: { id: "fj_lab_1" },
    errors: [...SESSION_ERRORS, RAIL_V1_OWNER_BIDS_FORBIDDEN, RAIL_V1_OWNER_BIDS_NOT_FOUND],
  },
  "freelancer-bid": {
    canonicalPathTemplate: "/api/freelancer/jobs/{id}/bids",
    routeAuthPattern: "/api/freelancer/jobs/[id]/bids",
    routeAuth: "session",
    idempotency: true,
    minVersionHeaderRequired: true,
    successStatus: 201,
    dataKeys: ["bid"],
    publishedDataPaths: [
      "bid",
      "bid.id",
      "bid.jobId",
      "bid.bidderId",
      "bid.amountMinor",
      "bid.currencyCode",
      "bid.coverNote",
      "bid.status",
      "bid.createdAt",
      "bid.updatedAt",
    ],
    dataSchema: railV1BidDataSchema,
    requestSchema: railV1BidRequestSchema,
    exampleParams: { id: "fj_lab_1" },
    errors: [...WRITE_ERRORS, RAIL_V1_BID_FIELDS_INVALID, RAIL_V1_LISTING_VISA_DENIED],
  },
  "freelancer-accept": {
    canonicalPathTemplate: "/api/freelancer/jobs/{id}/accept",
    routeAuthPattern: "/api/freelancer/jobs/[id]/accept",
    routeAuth: "session",
    idempotency: true,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["contract"],
    publishedDataPaths: [
      "contract",
      "contract.id",
      "contract.jobId",
      "contract.bidId",
      "contract.clientId",
      "contract.freelancerId",
      "contract.escrowHoldId",
      "contract.status",
      "contract.currencyCode",
      "contract.grossMinor",
      "contract.holdMinor",
      "contract.netMinor",
      "contract.holdBps",
      "contract.fundedAt",
      "contract.releasedAt",
      "contract.refundedAt",
      "contract.createdAt",
      "contract.updatedAt",
    ],
    dataSchema: railV1AcceptDataSchema,
    requestSchema: railV1AcceptRequestSchema,
    exampleParams: { id: "fj_lab_1" },
    errors: [
      ...WRITE_ERRORS,
      RAIL_V1_ACCEPT_FIELDS_INVALID,
      RAIL_V1_ACCEPT_FORBIDDEN,
      RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE,
    ],
  },
  "freelancer-contracts": {
    canonicalPathTemplate: "/api/freelancer/contracts",
    routeAuthPattern: "/api/freelancer/contracts",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["contracts"],
    publishedDataPaths: [
      "contracts",
      "contracts[].id",
      "contracts[].jobId",
      "contracts[].bidId",
      "contracts[].clientId",
      "contracts[].freelancerId",
      "contracts[].escrowHoldId",
      "contracts[].status",
      "contracts[].currencyCode",
      "contracts[].grossMinor",
      "contracts[].holdMinor",
      "contracts[].netMinor",
      "contracts[].holdBps",
      "contracts[].fundedAt",
      "contracts[].releasedAt",
      "contracts[].refundedAt",
      "contracts[].createdAt",
      "contracts[].updatedAt",
      "contracts[].deliveredAt",
    ],
    dataSchema: railV1ContractsDataSchema,
    errors: SESSION_ERRORS,
  },
  "freelancer-delivery": {
    canonicalPathTemplate: "/api/freelancer/contracts/{id}/messages",
    routeAuthPattern: "/api/freelancer/contracts/[id]/messages",
    routeAuth: "session",
    idempotency: true,
    minVersionHeaderRequired: true,
    successStatus: 201,
    dataKeys: ["message"],
    publishedDataPaths: [
      "message",
      "message.id",
      "message.contractId",
      "message.kind",
      "message.createdAt",
    ],
    dataSchema: railV1DeliveryDataSchema,
    requestSchema: railV1DeliveryRequestSchema,
    exampleParams: { id: "fc_lab_1" },
    errors: [
      ...WRITE_ERRORS,
      RAIL_V1_DELIVERY_FIELDS_INVALID,
      RAIL_V1_DELIVERY_FORBIDDEN,
      RAIL_V1_DELIVERY_NOT_FUNDED,
    ],
  },
  "freelancer-release": {
    canonicalPathTemplate: "/api/freelancer/contracts/{id}/release",
    routeAuthPattern: "/api/freelancer/contracts/[id]/release",
    routeAuth: "session",
    idempotency: true,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["contract", "visaStamp"],
    publishedDataPaths: [
      "contract",
      "contract.id",
      "contract.jobId",
      "contract.bidId",
      "contract.clientId",
      "contract.freelancerId",
      "contract.escrowHoldId",
      "contract.status",
      "contract.currencyCode",
      "contract.grossMinor",
      "contract.holdMinor",
      "contract.netMinor",
      "contract.holdBps",
      "contract.fundedAt",
      "contract.releasedAt",
      "contract.refundedAt",
      "contract.createdAt",
      "contract.updatedAt",
      "visaStamp",
      "visaStamp.id",
      "visaStamp.userId",
      "visaStamp.sourceKind",
      "visaStamp.sourceId",
      "visaStamp.visaKey",
      "visaStamp.moduleId",
      "visaStamp.title",
      "visaStamp.certificateHash",
      "visaStamp.issuedAt",
      "visaStamp.createdAt",
    ],
    dataSchema: railV1ReleaseDataSchema,
    exampleParams: { id: "fc_lab_1" },
    errors: [...WRITE_ERRORS, RAIL_V1_RELEASE_FORBIDDEN, RAIL_V1_RELEASE_NOT_FUNDED],
  },
  "freelancer-refund": {
    canonicalPathTemplate: "/api/freelancer/contracts/{id}/refund",
    routeAuthPattern: "/api/freelancer/contracts/[id]/refund",
    routeAuth: "session",
    idempotency: true,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["contract"],
    publishedDataPaths: [
      "contract",
      "contract.id",
      "contract.jobId",
      "contract.bidId",
      "contract.clientId",
      "contract.freelancerId",
      "contract.escrowHoldId",
      "contract.status",
      "contract.currencyCode",
      "contract.grossMinor",
      "contract.holdMinor",
      "contract.netMinor",
      "contract.holdBps",
      "contract.fundedAt",
      "contract.releasedAt",
      "contract.refundedAt",
      "contract.createdAt",
      "contract.updatedAt",
    ],
    dataSchema: railV1RefundDataSchema,
    exampleParams: { id: "fc_lab_1" },
    errors: WRITE_ERRORS,
  },
  "career-pulse": {
    canonicalPathTemplate: "/api/career/pulse",
    routeAuthPattern: "/api/career/pulse",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["pulse"],
    publishedDataPaths: [
      "pulse",
      "pulse.live",
      "pulse.visaCount",
      "pulse.portfolioCount",
      "pulse.lastVisaTitle",
    ],
    dataSchema: railV1CareerPulseDataSchema,
    errors: SESSION_ERRORS,
  },
  "career-visas": {
    canonicalPathTemplate: "/api/career/visas",
    routeAuthPattern: "/api/career/visas",
    routeAuth: "session",
    idempotency: false,
    minVersionHeaderRequired: true,
    successStatus: 200,
    dataKeys: ["stamps"],
    publishedDataPaths: [
      "stamps",
      "stamps[].id",
      "stamps[].userId",
      "stamps[].sourceKind",
      "stamps[].sourceId",
      "stamps[].visaKey",
      "stamps[].moduleId",
      "stamps[].title",
      "stamps[].certificateHash",
      "stamps[].issuedAt",
      "stamps[].createdAt",
    ],
    dataSchema: railV1CareerVisasDataSchema,
    errors: SESSION_ERRORS,
  },
} satisfies Record<RailV1HopId, RailV1HopContract>;

export const RAIL_V1_HOPS: readonly RailV1Hop[] = RAIL_V1_HOPS_META.map((meta) =>
  bindRailV1Hop(meta, RAIL_V1_HOP_CONTRACTS[meta.id]),
);

export { RAIL_V1_DRON_FORBIDDEN_HOP_IDS };

export function isRailV1HopForbiddenOnDron(id: string): boolean {
  return isRailV1HopMetaDronForbidden(id);
}

export const RAIL_V1_PUBLISHED_FIELD_PATHS: readonly string[] = RAIL_V1_HOPS.flatMap((hop) =>
  hop.publishedDataPaths.map((path) => `${hop.method} ${hop.v1PathTemplate} data.${path}`),
);

export function applyRailV1PathParams(
  template: string,
  params: Readonly<Record<string, string>> = {},
): string {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, name: string) => {
    const value = params[name];
    if (!value) {
      throw new Error(`v1 yol parametresi eksik: ${name}`);
    }
    return value;
  });
}

export function resolveRailV1HopPaths(
  hop: Pick<RailV1Hop, "v1PathTemplate" | "canonicalPathTemplate" | "exampleParams">,
  params?: Readonly<Record<string, string>>,
): { v1: string; canonical: string } {
  const merged = { ...hop.exampleParams, ...params };
  return {
    v1: applyRailV1PathParams(hop.v1PathTemplate, merged),
    canonical: applyRailV1PathParams(hop.canonicalPathTemplate, merged),
  };
}

export function parseRailV1Envelope(body: unknown): RailV1OkBody<Record<string, unknown>> | RailV1FailBody {
  if (isRailUnversionedOkBody(body) || detectRailJsonFlavor(body) === "unversioned-fail") {
    throw new Error("Versiyonsuz JSON v1 zarfı değildir.");
  }
  return railV1EnvelopeSchema.parse(body) as RailV1OkBody<Record<string, unknown>> | RailV1FailBody;
}

export function parseRailV1HopOkBody(hop: RailV1Hop, body: unknown) {
  return railV1OkEnvelopeOf(hop.dataSchema).parse(body);
}

export function zodObjectKeys(schema: z.ZodType): string[] {
  const candidate = schema as { shape?: Record<string, unknown> };
  if (!candidate.shape || typeof candidate.shape !== "object") {
    return [];
  }
  return Object.keys(candidate.shape);
}

export function assertRailV1EnvelopeSchemaKeys(): void {
  const okKeys = zodObjectKeys(railV1OkEnvelopeSchema);
  const failKeys = zodObjectKeys(railV1FailEnvelopeSchema);
  if (okKeys.join(",") !== RAIL_V1_ENVELOPE_KEYS.join(",") || failKeys.join(",") !== RAIL_V1_ENVELOPE_KEYS.join(",")) {
    throw new Error("v1 zarf Zod şekli sicil anahtarlarından saptı.");
  }
}

export type RailV1OpenApiDocument = {
  openapi: typeof RAIL_V1_OPENAPI_VERSION;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: ReadonlyArray<{ url: string }>;
  tags: ReadonlyArray<{ name: string; description: string }>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
    parameters: Record<string, unknown>;
  };
};

function toOpenApiSchema(schema: z.ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema, { target: "openapi-3.0" }) as Record<string, unknown>;
}

function headerParameter(name: string, required: boolean, description: string, extra: Record<string, unknown> = {}) {
  return {
    name,
    in: "header",
    required,
    description,
    schema: { type: "string", ...extra },
  };
}

function hopTag(hop: RailV1Hop): string[] {
  if (hop.id.startsWith("freelancer") || hop.id.startsWith("client")) {
    return ["Marketplace"];
  }
  if (hop.id.startsWith("academy") || hop.id.startsWith("career")) {
    return ["Proof"];
  }
  if (hop.id === "wallet-strip") {
    return ["Payments"];
  }
  return ["Kernel"];
}

function pathParamNames(template: string): string[] {
  return [...template.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]!);
}

function hopParameters(hop: RailV1Hop): unknown[] {
  const parameters: unknown[] = [];
  for (const name of pathParamNames(hop.v1PathTemplate)) {
    if (name === "hash") {
      parameters.push({
        name: "hash",
        in: "path",
        required: true,
        description: "SHA256 akademi sertifika mührü (64 küçük hex).",
        schema: { type: "string", pattern: "^[a-f0-9]{64}$", minLength: 64, maxLength: 64 },
      });
      continue;
    }
    parameters.push({
      name,
      in: "path",
      required: true,
      description: "Kayıt kimliği (ilan veya sözleşme).",
      schema: { type: "string", minLength: 1 },
    });
  }
  parameters.push(
    headerParameter(
      RAIL_MIN_VERSION_HEADER,
      hop.minVersionHeaderRequired,
      "Asgari API sürümü. Health dışında zorunlu. Eski istemci 426 alır.",
      { pattern: "^[1-9]\\d*$" },
    ),
  );
  parameters.push(
    headerParameter("x-request-id", false, "İsteğe bağlı korelasyon UUID.", { format: "uuid" }),
  );
  if (hop.v1Auth === "bearer") {
    parameters.push(
      headerParameter("Authorization", true, "Bearer JWT. v1 çerez oturumunu yok sayar.", {
        pattern: "^Bearer\\s+\\S+",
      }),
    );
  }
  if (hop.idempotency) {
    parameters.push(
      headerParameter(IDEMPOTENCY_KEY_HEADER, true, "UUID. Aynı anahtar ikinci debit doğurmaz.", {
        format: "uuid",
      }),
    );
  }
  return parameters;
}

function hopResponses(hop: RailV1Hop): Record<string, unknown> {
  const failRef = { $ref: "#/components/schemas/RailV1FailEnvelope" };
  const responses: Record<string, unknown> = {
    [String(hop.successStatus)]: {
      description: "v1 başarı zarfı. Yayınlanmış data alanları sessizce düşmez.",
      content: {
        "application/json": {
          schema: toOpenApiSchema(railV1OkEnvelopeOf(hop.dataSchema)),
        },
      },
    },
    "400": { description: "Sürüm başlığı / doğrulama / Idempotency-Key.", content: { "application/json": { schema: failRef } } },
    "401": { description: RAIL_V1_SESSION_REQUIRED, content: { "application/json": { schema: failRef } } },
    "426": { description: RAIL_VERSION_CLIENT_STALE, content: { "application/json": { schema: failRef } } },
  };
  if (hop.id === "freelancer-bid") {
    responses["403"] = {
      description: RAIL_V1_LISTING_VISA_DENIED,
      content: { "application/json": { schema: failRef } },
    };
  }
  if (hop.id === "freelancer-delivery") {
    responses["403"] = {
      description: RAIL_V1_DELIVERY_FORBIDDEN,
      content: { "application/json": { schema: failRef } },
    };
  }
  if (hop.id === "freelancer-release") {
    responses["403"] = {
      description: RAIL_V1_RELEASE_FORBIDDEN,
      content: { "application/json": { schema: failRef } },
    };
  }
  if (hop.id === "freelancer-accept") {
    responses["403"] = {
      description: RAIL_V1_ACCEPT_FORBIDDEN,
      content: { "application/json": { schema: failRef } },
    };
    responses["503"] = {
      description: RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE,
      content: { "application/json": { schema: failRef } },
    };
  }
  if (hop.id === "client-job-bids") {
    responses["403"] = {
      description: RAIL_V1_OWNER_BIDS_FORBIDDEN,
      content: { "application/json": { schema: failRef } },
    };
    responses["404"] = {
      description: RAIL_V1_OWNER_BIDS_NOT_FOUND,
      content: { "application/json": { schema: failRef } },
    };
  }
  if (hop.id === "academy-certificate") {
    responses["404"] = {
      description: RAIL_V1_ACADEMY_CERTIFICATE_MISSING,
      content: { "application/json": { schema: failRef } },
    };
  }
  if (hop.idempotency) {
    responses["409"] = {
      description:
        hop.id === "freelancer-release"
          ? `${RAIL_V1_IDEMPOTENCY_BODY_CONFLICT} ${RAIL_V1_RELEASE_NOT_FUNDED}`
          : hop.id === "freelancer-accept"
            ? `${RAIL_V1_IDEMPOTENCY_BODY_CONFLICT} ${RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE}`
            : RAIL_V1_IDEMPOTENCY_BODY_CONFLICT,
      content: { "application/json": { schema: failRef } },
    };
  }
  return responses;
}

export function buildRailV1OpenApiDocument(): RailV1OpenApiDocument {
  assertRailV1EnvelopeSchemaKeys();
  const paths: Record<string, Record<string, unknown>> = {};
  for (const hop of RAIL_V1_HOPS as readonly RailV1Hop[]) {
    const item = paths[hop.v1PathTemplate] ?? {};
    const operation: Record<string, unknown> = {
      operationId: hop.id,
      tags: hopTag(hop),
      summary: hop.v1PathTemplate,
      description: [
        `Kanonik yol: ${hop.canonicalPathTemplate}.`,
        `Auth: ${hop.v1Auth === "bearer" ? "Bearer JWT" : "public"}.`,
        "Çerez oturumu yok sayılır (cookieAuth=false).",
        hop.idempotency
          ? `Idempotency-Key UUID zorunlu (${IDEMPOTENCY_KEY_HEADER}).`
          : "Idempotency-Key yok.",
        `Yayınlanmış data kökleri: ${hop.dataKeys.join(", ")}.`,
        hop.id === "freelancer-contracts"
          ? "FreelancerContractView: deliveredAt, kind=DELIVERY mesajının max(createdAt) değerinden türetilir; Prisma kolonu yoktur. Mesaj gövdesi / artifactUrl / reportJson sızmaz."
          : hop.id === "freelancer-delivery"
            ? "Dar teslim yazması. Yalnız kind=DELIVERY. Actor = freelancerId; status = FUNDED (emanet blokeli). İşveren/üçüncü şahıs 403. Cevap DTO: message.{id,contractId,kind,createdAt}. body / artifactUrl / userId sızmaz. deliveredAt Tezgâh GET'inden türetilir."
            : hop.id === "freelancer-release"
              ? "Hak ediş serbest bırakma. Actor = contract.clientId (işveren). Usta/üçüncü şahıs 403. Status FUNDED dışında 409; DELIVERY tanığı sunucu şartı değildir (FSM uydurması yok). Cevap RailV1Contract + visaStamp (deliveredAt yok). Alıcı istek gövdesinden okunmaz. Mükerrer UUID ikinci CREDIT yazmaz."
              : hop.id === "freelancer-accept"
                ? "İşveren teklif kabulü. Actor = job.clientId. Usta/üçüncü şahıs 403. Pazaryeri split portu yoksa 503; Rail cüzdanına DEBIT yazılmaz, ilan OPEN kalır, hold/sözleşme yazılmaz, 2xx yok. PSP bağlıysa kilit kaydı pspPaymentId taşır. Cevap tam RailV1Contract (clientId, freelancerId, escrowHoldId, holdBps, ISO tarihler). deliveredAt ve visaStamp yoktur. Tutar istek gövdesinden okunmaz. Mükerrer UUID ikinci hold yazmaz."
                : hop.id === "client-job-bids"
                  ? "Owner-only teklif okuma. Actor = job.clientId. Usta/üçüncü şahıs 403, data:null, bids basılmaz. İlan yok 404. Yalnız SUBMITTED; OPEN değilse bids boş dizi (ikinci bidId uydurulmaz). ClientJobBidsView: bidId, amountMinor, coverNote, createdAt. bidderId / status / updatedAt / currencyCode / jobId sızmaz. GET /freelancer/jobs/{id} bu hop değildir."
                  : "",
      ]
        .filter(Boolean)
        .join(" "),
      security: hop.v1Auth === "bearer" ? [{ [RAIL_V1_BEARER_SCHEME]: [] }] : [],
      parameters: hopParameters(hop),
      responses: hopResponses(hop),
      "x-rail-cookie-auth": false,
      "x-rail-idempotency": hop.idempotency,
      "x-rail-route-auth": hop.routeAuth,
      "x-rail-published-data-paths": hop.publishedDataPaths,
    };
    if (hop.requestSchema) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: toOpenApiSchema(hop.requestSchema),
          },
        },
      };
    }
    item[hop.method.toLowerCase()] = operation;
    paths[hop.v1PathTemplate] = item;
  }

  return {
    openapi: RAIL_V1_OPENAPI_VERSION,
    info: {
      title: RAIL_V1_CONTRACT_TITLE,
      version: RAIL_API_VERSION_LABEL,
      description: [
        `${YETKIN_BRAND} Modüler Monolit + API-First Dron sözleşmesi — Proof / Marketplace / Payments.`,
        "Kopya `app/api/v1` handler ağacı yoktur; kenar soyar.",
        "Zarf: { ok, error, requestId, apiVersion, data }.",
        "X-Rail-Min-Version API sözleşme sürümüdür; mağaza uygulama build'i değildir (X-Rail-App-Build ayrı, v1'de kapı değil).",
        "Amiral ve Dron aynı v1 zarfı konuşur. Versiyonsuz `{ ok, ...data }` serimi kapalıdır.",
        "Yayınlanmış alan sessizce düşmez. CORS joker ve Allow-Credentials yoktur.",
        "SHA-256 akademi kaydı kriptografik imza değildir; içerik özeti / bütünlük kaydıdır.",
      ].join(" "),
    },
    servers: [{ url: "/" }],
    tags: [
      { name: "Kernel", description: "Health ve oturum." },
      { name: "Proof", description: "Akademi pulse/satın alma, kariyer vizesi, kamu içerik özeti doğrulama." },
      { name: "Marketplace", description: "Freelancer ilan / teklif / emanet. İç hakediş kilidi 403 olarak durur." },
      { name: "Payments", description: "Cüzdan şeridi. PayTR top-up v1 hop değildir." },
    ],
    paths,
    components: {
      securitySchemes: {
        [RAIL_V1_BEARER_SCHEME]: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Supabase vatandaş JWT. Cookie güvenlik şeması yoktur.",
        },
      },
      schemas: {
        RailV1FailEnvelope: toOpenApiSchema(railV1FailEnvelopeSchema),
        RailV1OkEnvelope: toOpenApiSchema(railV1OkEnvelopeSchema),
        RailV1SessionUser: toOpenApiSchema(railV1SessionUserSchema),
        RailV1WalletStrip: toOpenApiSchema(railV1WalletStripSchema),
        RailV1Job: toOpenApiSchema(railV1JobSchema),
        RailV1Bid: toOpenApiSchema(railV1BidSchema),
        RailV1BidRequest: toOpenApiSchema(railV1BidRequestSchema),
        ClientJobBidView: toOpenApiSchema(railV1ClientJobBidSchema),
        ClientJobBidsView: toOpenApiSchema(railV1ClientJobBidsViewSchema),
        RailV1Contract: toOpenApiSchema(railV1ContractSchema),
        FreelancerContractView: toOpenApiSchema(railV1FreelancerContractViewSchema),
        RailV1DeliveryRequest: toOpenApiSchema(railV1DeliveryRequestSchema),
        RailV1DeliveryMessage: toOpenApiSchema(railV1DeliveryMessageSchema),
        RailV1VisaStamp: toOpenApiSchema(railV1VisaStampSchema),
        RailV1ReleaseData: toOpenApiSchema(railV1ReleaseDataSchema),
        RailV1AcceptRequest: toOpenApiSchema(railV1AcceptRequestSchema),
        RailV1AcceptData: toOpenApiSchema(railV1AcceptDataSchema),
        RailV1PublicAcademyCertificate: toOpenApiSchema(railV1PublicAcademyCertificateDataSchema),
        RailV1AcademyPulse: toOpenApiSchema(railV1AcademyPulseSchema),
        RailV1AcademyPurchaseRequest: toOpenApiSchema(railV1AcademyPurchaseRequestSchema),
        RailV1AcademyPurchaseData: toOpenApiSchema(railV1AcademyPurchaseDataSchema),
        RailV1CareerPulse: toOpenApiSchema(railV1CareerPulseSchema),
        RailV1CareerVisasData: toOpenApiSchema(railV1CareerVisasDataSchema),
        RailV1SessionData: toOpenApiSchema(railV1SessionDataSchema),
        RailV1WalletStripData: toOpenApiSchema(railV1WalletStripDataSchema),
        RailV1JobsData: toOpenApiSchema(railV1JobsDataSchema),
        RailV1BidData: toOpenApiSchema(railV1BidDataSchema),
        RailV1ContractsData: toOpenApiSchema(railV1ContractsDataSchema),
        RailV1DeliveryData: toOpenApiSchema(railV1DeliveryDataSchema),
      },
      parameters: {
        RailMinVersion: headerParameter(
          RAIL_MIN_VERSION_HEADER,
          true,
          "Asgari API sürümü.",
          { pattern: "^[1-9]\\d*$" },
        ),
        IdempotencyKey: headerParameter(IDEMPOTENCY_KEY_HEADER, true, "UUID yazma kalkanı.", {
          format: "uuid",
        }),
      },
    },
  };
}

export function serializeRailV1OpenApiDocument(document: RailV1OpenApiDocument = buildRailV1OpenApiDocument()): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}
