/**
 * Bounded context sicili — ürün dört çalışan oda (dashboard, academy, career, freelancer).
 * Diskte tarihsel klasör pazarlanmaz. Kernel dikey engine import etmez.
 *
 * Proof: akademi değerlendirme + kariyer vizesi + pasaport projeksiyonu.
 * Kanıt okuma sözleşmesi `lib/kernel/proof` (`ProofReadPort`); müfredat kimliği
 * `lib/kernel/catalog-ids`. Kariyer dikey oda iç okuma dosyası import etmez.
 * Marketplace: freelancer ilan/teklif/emanet. Donmuş pazaryeri 410 envanteridir.
 * Payments: cüzdan (yalnız platformun kendi dijital malı), PayTR merchant,
 * defter, emanet kaydı. Usta neti Rail cüzdanına yazılmaz; dağıtım split portundadır.
 * Junior: müstakil oda. Sahip `lib/junior` (`RAIL_JUNIOR_CONTEXT`). Üç context'e yazılmaz.
 */

export const RAIL_BOUNDED_CONTEXT_IDS = ["proof", "marketplace", "payments"] as const;

export type RailBoundedContextId = (typeof RAIL_BOUNDED_CONTEXT_IDS)[number];

export const RAIL_BOUNDED_CONTEXT_LABELS = {
  proof: "Proof",
  marketplace: "Marketplace",
  payments: "Payments",
} as const;

/**
 * Faz 1 dikey oda → context.
 * Junior bu tabloda yoktur; sahibi `RAIL_JUNIOR_CONTEXT` (`lib/junior`).
 * Studio ve pazaryeri donmuş disktir (`FROZEN_DISK_ROOMS`).
 */
export const RAIL_PHASE1_ROOM_CONTEXT = {
  academy: "proof",
  career: "proof",
  freelancer: "marketplace",
} as const satisfies Record<string, RailBoundedContextId>;

export type RailPhase1RoomId = keyof typeof RAIL_PHASE1_ROOM_CONTEXT;

/**
 * Junior müstakil odadır (`INDEPENDENT_ROOMS`, `DRON_KAYIT`).
 * Donmuş disk listesinde değildir. Beş modelin sahibi `lib/junior`.
 * Proof, Marketplace ve Payments bu satırlara yazmaz.
 */
export const RAIL_JUNIOR_CONTEXT = {
  owner: "lib/junior",
  models: [
    "JuniorProfile",
    "JuniorGuardianConsent",
    "JuniorProgress",
    "JuniorXp",
    "JuniorSubscription",
  ],
  delegates: [
    "juniorProfile",
    "juniorGuardianConsent",
    "juniorProgress",
    "juniorXp",
    "juniorSubscription",
  ],
} as const;

export function isJuniorContextOwnerFile(file: string): boolean {
  const normalized = file.replace(/\\/g, "/");
  return normalized === "lib/junior.ts" || normalized.startsWith("lib/junior/");
}

/** Şemadaki Junior modeli sahip listesinden saparsa boş dönmez. */
export function juniorSchemaModelGaps(modelNames: readonly string[]): string[] {
  const errors: string[] = [];
  const expectedModels = RAIL_JUNIOR_CONTEXT.models;
  const expectedDelegates = RAIL_JUNIOR_CONTEXT.delegates;
  if (expectedModels.length !== expectedDelegates.length) {
    errors.push("Junior model ve delegate sayısı eşit değil");
  }
  for (let index = 0; index < expectedModels.length; index += 1) {
    const model = expectedModels[index];
    const delegate = expectedDelegates[index];
    if (!model || !delegate) {
      continue;
    }
    const derived = `${model.charAt(0).toLowerCase()}${model.slice(1)}`;
    if (delegate !== derived) {
      errors.push(`${model} delegate ${delegate} türetilen ad ${derived}`);
    }
  }
  for (const name of expectedModels) {
    if (!modelNames.includes(name)) {
      errors.push(`şemada yok: ${name}`);
    }
  }
  for (const name of modelNames) {
    if (!(expectedModels as readonly string[]).includes(name)) {
      errors.push(`sahip listesinde yok: ${name}`);
    }
  }
  return errors;
}

function stripSourceComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/**
 * Haritasız Junior delegate sessiz geçmez.
 * Sahip dosya `lib/junior`. Başka oda veya çekirdek bu modellere dokunursa ihlaldir.
 */
export function juniorDelegateViolations(file: string, source: string): string[] {
  const owned = RAIL_JUNIOR_CONTEXT.delegates;
  const ownedSet = new Set<string>(owned);
  const alternation = [...owned]
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const re = new RegExp(`\\.(${alternation}|junior[A-Z][A-Za-z0-9]*)\\.`, "g");
  const stripped = stripSourceComments(source);
  const ownerFile = isJuniorContextOwnerFile(file);
  const errors: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(stripped)) !== null) {
    const delegate = match[1];
    if (!delegate || seen.has(delegate)) {
      continue;
    }
    seen.add(delegate);
    if (!ownedSet.has(delegate)) {
      errors.push(`prisma.${delegate} haritasız Junior delegate`);
      continue;
    }
    if (!ownerFile) {
      errors.push(`prisma.${delegate} sahibi lib/junior`);
    }
  }
  return errors;
}

/** Prisma delegate adı (camelCase) → sahip context. */
export const RAIL_CONTEXT_PRISMA_MODELS: Readonly<Record<string, RailBoundedContextId>> = {
  academyCourse: "proof",
  academyPurchase: "proof",
  academyExam: "proof",
  academyExamAttempt: "proof",
  academyExamSitting: "proof",
  academyExemptionSeal: "proof",
  academyCertificate: "proof",
  academyLessonCompletion: "proof",
  academyAudioCache: "proof",
  careerVisaStamp: "proof",
  careerPortfolioItem: "proof",
  /** `/vize` kart sayacı. Kişisel satır yok; kanıt çıkışının hacmidir. */
  funnelDailyCounter: "proof",
  freelancerJob: "marketplace",
  freelancerBid: "marketplace",
  freelancerContract: "marketplace",
  freelancerContractMessage: "marketplace",
  freelancerDispute: "marketplace",
  freelancerSquad: "marketplace",
  freelancerSquadMember: "marketplace",
  wallet: "payments",
  walletCardRefund: "payments",
  ledgerEntry: "payments",
  escrowHold: "payments",
  paymentOrder: "payments",
  checkoutPriceLock: "payments",
  paymentAnomaly: "payments",
  priceCatalogEntry: "payments",
  priceCatalogDecisionLedger: "payments",
  /** costMinor ölçer. İkinci cüzdan değildir; yazan kernel AI kapısıdır. */
  aiTokenUsage: "payments",
  httpIdempotencyRecord: "payments",
  paidCommandReservation: "payments",
  userBillingInfo: "payments",
};

/**
 * Platform kimliği üç context'in malı değildir.
 * `user` haritaya yazılmaz: `lib/freelancer/prisma-store.ts` bu satırı okur ve
 * yazar; akademi ile kariyer aynı satıra FK ile bağlanır. Sahip
 * `lib/kernel/identity`. Bir context'e bağlamak ya import duvarını kırar
 * ya da kimlik satırını tek odaya mal eder.
 */
export const RAIL_CONTEXT_PLATFORM_DELEGATES = ["user"] as const;

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
