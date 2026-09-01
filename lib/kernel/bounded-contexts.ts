/**
 * Bounded context sicili — ürün dört çalışan oda (dashboard, academy, career, freelancer).
 * Diskte 12 klasör tarihsel sicildir; pazarlanmaz. Kernel dikey engine import etmez.
 *
 * Proof: akademi değerlendirme + kariyer vizesi + pasaport projeksiyonu.
 * Kanıt okuma sözleşmesi `lib/kernel/proof` (`ProofReadPort`); müfredat kimliği
 * `lib/kernel/catalog-ids`. Kariyer dikey oda iç okuma dosyası import etmez.
 * Marketplace: freelancer ilan/teklif/emanet. Donmuş pazaryeri 410 envanteridir.
 * Payments: cüzdan (yalnız platformun kendi dijital malı), PayTR merchant,
 * defter, emanet kaydı. Usta neti Rail cüzdanına yazılmaz; dağıtım split portundadır.
 */

export const RAIL_BOUNDED_CONTEXT_IDS = ["proof", "marketplace", "payments"] as const;

export type RailBoundedContextId = (typeof RAIL_BOUNDED_CONTEXT_IDS)[number];

export const RAIL_BOUNDED_CONTEXT_LABELS = {
  proof: "Proof",
  marketplace: "Marketplace",
  payments: "Payments",
} as const;

/** Çalışan oda → context. Sicil dışı oda (studio, junior, pazaryeri, …) frozen backlog'tur. */
export const RAIL_PHASE1_ROOM_CONTEXT = {
  academy: "proof",
  career: "proof",
  freelancer: "marketplace",
} as const satisfies Record<string, RailBoundedContextId>;

export type RailPhase1RoomId = keyof typeof RAIL_PHASE1_ROOM_CONTEXT;

/** Prisma delegate adı (camelCase) → sahip context. */
export const RAIL_CONTEXT_PRISMA_MODELS: Readonly<Record<string, RailBoundedContextId>> = {
  academyCourse: "proof",
  academyPurchase: "proof",
  academyExam: "proof",
  academyExamAttempt: "proof",
  academyCertificate: "proof",
  academyLessonCompletion: "proof",
  academyAudioCache: "proof",
  careerVisaStamp: "proof",
  careerPortfolioItem: "proof",
  freelancerJob: "marketplace",
  freelancerBid: "marketplace",
  freelancerContract: "marketplace",
  freelancerContractMessage: "marketplace",
  freelancerDispute: "marketplace",
  freelancerSquad: "marketplace",
  freelancerSquadMember: "marketplace",
  wallet: "payments",
  ledgerEntry: "payments",
  escrowHold: "payments",
  paymentOrder: "payments",
  checkoutPriceLock: "payments",
  paymentAnomaly: "payments",
  httpIdempotencyRecord: "payments",
  paidCommandReservation: "payments",
  userBillingInfo: "payments",
};

/**
 * Dondurulmuş sızıntı — yeni satır eklemek kanonikleştirme değildir.
 * Social/Studio Faz 1 context değildir; kariyer kurumsal tabloya girmez.
 */
export const RAIL_CONTEXT_PRISMA_ALLOWLIST = [
  "archived/lib/social/prisma-proofs.ts",
  "archived/lib/studio/load.ts",
  "lib/kernel/passport/load.ts",
] as const;

export const RAIL_CONTEXT_FORBIDDEN = {
  marketplaceMustNotSellHashAsSignature:
    "Marketplace, Proof hash'ini kriptografik imza veya imzalı sertifika diye satmaz.",
  paymentsMustNotInventIbanPayout:
    "Payments, Rail cüzdanından usta IBAN'ı ödemez. Usta neti lisanslı Pazaryeri (PayTR/iyzico split) ile dağılır.",
  proofMustNotWriteLedger:
    "Proof, Wallet/LedgerEntry/EscrowHold yazmaz; akademi settlement Payments portundan geçer.",
  payoutUnlockIsNotAnEnvFlag:
    "Usta hakedişi iç cüzdana yazılmaz ve env ile açılmaz. Dağıtım marketplace-split portundadır.",
} as const;

export function contextOfPhase1Room(room: string): RailBoundedContextId | null {
  if (room in RAIL_PHASE1_ROOM_CONTEXT) {
    return RAIL_PHASE1_ROOM_CONTEXT[room as RailPhase1RoomId];
  }
  return null;
}

export function contextOfPrismaModel(delegate: string): RailBoundedContextId | null {
  return RAIL_CONTEXT_PRISMA_MODELS[delegate] ?? null;
}

export function isContextPrismaAllowlisted(file: string): boolean {
  return (RAIL_CONTEXT_PRISMA_ALLOWLIST as readonly string[]).includes(file);
}
