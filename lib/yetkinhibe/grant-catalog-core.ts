import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  isGrantAudience,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isProvinceCode,
  type GrantAudience,
  type GrantInvestmentFocus,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { readSpecificationRules } from "@/lib/yetkinhibe/spec-rag";
import type {
  GrantCallStatus,
  GrantCallWithMeta,
  GrantEligibilityCriteria,
  GrantProgramSource,
} from "@/lib/yetkinhibe/types";

/**
 * YetkinHibe katalog çekirdeği (F2). Saf modül: veritabanı, sunucu modülü veya saat yoktur.
 * `now` çağıran tarafından verilir. Canlı okuma `grant-catalog-live.ts` içindedir.
 */

/** Son başvuruya bu gün sayısı kadar kalındığında durum CLOSING_SOON olur. */
export const GRANT_CLOSING_SOON_DAYS = 14;

/** Bu süreden eski `sourceVerifiedAt` açık çağrı sayılmaz. */
export const GRANT_VERIFICATION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Bakım eşiği. Doğrulama bu günden eskiyse satır yeniden doğrulama kuyruğuna girer.
 * Haftalık bakım işi bu eşikle çalıştığında 30 günlük pencere hiçbir zaman kırılmaz:
 * en kötü sapma bir haftadır (`GRANT_VERIFICATION_MAX_AGE_MS` − 25 gün).
 */
export const GRANT_REVERIFY_AFTER_DAYS = 25;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Doğrulama yaşı gün cinsinden. Tarih okunamazsa `null` (satır kuyruğa girer). */
export function grantVerificationAgeDays(
  sourceVerifiedAt: string | Date | null,
  now: Date,
): number | null {
  if (sourceVerifiedAt == null) {
    return null;
  }
  const at = sourceVerifiedAt instanceof Date ? sourceVerifiedAt : new Date(sourceVerifiedAt);
  if (Number.isNaN(at.getTime())) {
    return null;
  }
  return (now.getTime() - at.getTime()) / MS_PER_DAY;
}

export type GrantMaintenanceRow = {
  id: string;
  applicationOpensAt: Date;
  applicationDeadline: Date;
  sourceVerifiedAt: Date | null;
};

export type GrantMaintenancePlan = {
  /** Hâlâ açık ve doğrulaması eşiği aşan satırlar. Yeniden doğrulanır. */
  refresh: readonly GrantMaintenanceRow[];
  /** Açık ama doğrulaması okunamayan satırlar. Admin kuyruğuna düşer. */
  unverified: readonly GrantMaintenanceRow[];
  /** Penceresi kapanmış satırlar. Doğrulama damgası tazelenmez. */
  closed: readonly GrantMaintenanceRow[];
};

/**
 * Saf bakım planı. Veritabanı, saat veya yazma yoktur; çağıran `now` verir.
 * Kapalı pencere tazelenmez: süresi geçmiş çağrı "açık" diye damgalanmaz.
 */
export function planGrantMaintenance(
  rows: readonly GrantMaintenanceRow[],
  now: Date,
  thresholdDays: number = GRANT_REVERIFY_AFTER_DAYS,
): GrantMaintenancePlan {
  const refresh: GrantMaintenanceRow[] = [];
  const unverified: GrantMaintenanceRow[] = [];
  const closed: GrantMaintenanceRow[] = [];
  for (const row of rows) {
    const status = computeGrantCallStatus(row.applicationOpensAt, row.applicationDeadline, now);
    if (status === "CLOSED") {
      closed.push(row);
      continue;
    }
    const age = grantVerificationAgeDays(row.sourceVerifiedAt, now);
    if (age == null) {
      unverified.push(row);
      continue;
    }
    if (age >= thresholdDays) {
      refresh.push(row);
    }
  }
  return { refresh, unverified, closed };
}

/**
 * Bakım planını satırlara uygular. Saf: yeni dizi döner, girdiyi değiştirmez.
 * `refresh` ve `unverified` satırların doğrulama damgası `now` olur; kapanan satır dokunulmaz.
 * Canlı iş (`grant-catalog-verify.ts`) aynı semantiği `verifyGrantCall` ile yazar.
 */
export function applyGrantMaintenance<T extends GrantMaintenanceRow>(
  rows: readonly T[],
  plan: GrantMaintenancePlan,
  now: Date,
): T[] {
  const stamp = new Set<string>([...plan.refresh.map((row) => row.id), ...plan.unverified.map((row) => row.id)]);
  return rows.map((row) => (stamp.has(row.id) ? { ...row, sourceVerifiedAt: now } : row));
}

/**
 * Haftalık bakımı `from`–`to` aralığında adım adım uygular. Yalnız test ve simülasyon.
 * Üretimde tek adım cron'dur; burada amaç tazelik penceresinin kırılmadığını kanıtlamaktır.
 */
export function runGrantMaintenanceSimulation<T extends GrantMaintenanceRow>(
  rows: readonly T[],
  from: Date,
  to: Date,
  stepDays = 7,
  thresholdDays: number = GRANT_REVERIFY_AFTER_DAYS,
): { rows: readonly T[]; sweeps: number; reverified: number } {
  let current = [...rows];
  let sweeps = 0;
  let reverified = 0;
  const stepMs = stepDays * MS_PER_DAY;
  const end = to.getTime();
  for (let at = from.getTime() + stepMs; at <= end; at += stepMs) {
    const now = new Date(at);
    const plan = planGrantMaintenance(current, now, thresholdDays);
    reverified += plan.refresh.length + plan.unverified.length;
    current = applyGrantMaintenance(current, plan, now);
    sweeps += 1;
  }
  return { rows: current, sweeps, reverified };
}

export const PROGRAM_SOURCES: readonly GrantProgramSource[] = [
  "KOSGEB",
  "TUBITAK",
  "TICARET_BAKANLIGI",
  "KALKINMA_AJANSI",
  "TKDK_IPARD",
  "TARIM_BAKANLIGI",
  "SANAYI_BAKANLIGI",
  "ISKUR",
  "AB_FONLARI",
];

/** Eski anahtarlar okunur, kanonik kaynağa iner. Resmî Gazete kaynak değildir. */
const LEGACY_PROGRAM_SOURCES: Readonly<Record<string, GrantProgramSource>> = {
  BOLGESEL_AJANS: "KALKINMA_AJANSI",
};

export type GrantCatalogUnavailableReason = "read_failed" | "empty" | "invalid_row";

/**
 * Katalog okunamadı: veritabanı hatası, boş tablo veya bozuk satır.
 * Sabit kataloğa düşülmez (R1, A5). Çağıran 503 döner.
 */
export class GrantCatalogUnavailableError extends Error {
  readonly reason: GrantCatalogUnavailableReason;

  constructor(reason: GrantCatalogUnavailableReason) {
    super(`Hibe kataloğu okunamadı (${reason}).`);
    this.name = "GrantCatalogUnavailableError";
    this.reason = reason;
  }
}

/** Tek satır doğrulanamadığında fırlatılır. İç ileti günlüğe gider, istemciye gitmez. */
export class GrantCatalogRowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GrantCatalogRowError";
  }
}

/** Veritabanı satırının girdi biçimi. Tutarlar kuruş cinsindedir; tarihler `Date`. */
export type GrantCatalogRowInput = {
  id: string;
  sourceKey: string;
  sourceLabel: string;
  title: string;
  summary: string;
  /** Kurum dönem havuzu ilan etmemişse null. Negatif veya güvenli tamsayı dışı değer reddedilir. */
  poolAmountMinor: bigint | number | null;
  minSupportMinor: number;
  maxSupportMinor: number;
  supportRatioBps: number;
  applicationOpensAt: Date;
  applicationDeadline: Date;
  eligibilityJson: unknown;
  requiredDocuments: readonly string[];
  tags: readonly string[];
  officialInfoUrl: string;
  publicationUrl?: string | null;
  sourceVerifiedAt: Date | null;
  specificationText?: string | null;
  rulesJson?: unknown;
  dataVersion?: number | null;
};

/** API'ye giden çağrı. `sourceVerifiedAt` null ise resmî kaynakla doğrulanmamıştır; arayüz bunu dürüstçe gösterir. */
export type YetkinhibeGrantCatalogEntry = GrantCallWithMeta & {
  sourceVerifiedAt: string | null;
  dataVersion?: number | null;
};

/** Kalan gün sayısı, yukarı yuvarlanır. Son tarih geçmişse 0 (negatif sızdırılmaz). */
export function computeRemainingDays(deadline: Date, now: Date): number {
  const diffMs = deadline.getTime() - now.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / MS_PER_DAY);
}

/** Yalnız ACTIVE ve CLOSING_SOON çağrılar eşleşmeye girer. */
export function isMatchableGrantCall(call: Pick<GrantCallWithMeta, "status">): boolean {
  return call.status === "ACTIVE" || call.status === "CLOSING_SOON";
}

/** Doğrulama zamanı yoksa veya 30 günden eskiyse satır açık sayılmaz. */
export function isGrantVerificationFresh(
  sourceVerifiedAt: string | Date | null,
  now: Date,
): boolean {
  if (sourceVerifiedAt == null) {
    return false;
  }
  const at = sourceVerifiedAt instanceof Date ? sourceVerifiedAt : new Date(sourceVerifiedAt);
  if (Number.isNaN(at.getTime())) {
    return false;
  }
  const age = now.getTime() - at.getTime();
  return age >= 0 && age <= GRANT_VERIFICATION_MAX_AGE_MS;
}

/** Durum: açılıştan önce UPCOMING, son tarihten sonra CLOSED, son 14 gün CLOSING_SOON, aksi ACTIVE. */
export function computeGrantCallStatus(opensAt: Date, deadline: Date, now: Date): GrantCallStatus {
  const nowMs = now.getTime();
  if (nowMs < opensAt.getTime()) {
    return "UPCOMING";
  }
  if (nowMs > deadline.getTime()) {
    return "CLOSED";
  }
  return computeRemainingDays(deadline, now) <= GRANT_CLOSING_SOON_DAYS ? "CLOSING_SOON" : "ACTIVE";
}

/**
 * Veritabanı satırını API biçimine çevirir. Her alan doğrulanır; bir hata tüm katalogu
 * `GrantCatalogRowError` ile reddeder (fail-closed). Sessiz düzeltme yapılmaz.
 */
export function mapGrantCallRow(row: GrantCatalogRowInput, now: Date): YetkinhibeGrantCatalogEntry {
  const id = row.id;
  if (!isNonEmptyText(id)) {
    throw new GrantCatalogRowError("id boş");
  }
  const source = parseProgramSource(row.sourceKey, id);
  const opensAt = parseInstant(row.applicationOpensAt, "applicationOpensAt", id);
  const deadline = parseInstant(row.applicationDeadline, "applicationDeadline", id);
  if (deadline.getTime() < opensAt.getTime()) {
    throw new GrantCatalogRowError(`${id}: son başvuru açılıştan önce`);
  }
  const minSupportMinor = parseAmountMinor(row.minSupportMinor, "minSupportMinor", id);
  const maxSupportMinor = parseAmountMinor(row.maxSupportMinor, "maxSupportMinor", id);
  if (minSupportMinor > maxSupportMinor) {
    throw new GrantCatalogRowError(`${id}: destek alt sınırı üst sınırdan büyük`);
  }
  if (!Number.isInteger(row.supportRatioBps) || row.supportRatioBps < 0 || row.supportRatioBps > 10_000) {
    throw new GrantCatalogRowError(`${id}: supportRatioBps 0-10000 dışında`);
  }
  if (!isNonEmptyText(row.title) || !isNonEmptyText(row.summary) || !isNonEmptyText(row.sourceLabel)) {
    throw new GrantCatalogRowError(`${id}: başlık, özet veya kaynak adı boş`);
  }
  if (!/^https:\/\//.test(row.officialInfoUrl)) {
    throw new GrantCatalogRowError(`${id}: resmî bağlantı https değil`);
  }
  const publicationUrl = parsePublicationUrl(row.publicationUrl, id);
  const specificationText = parseSpecificationText(row.specificationText, id);
  const rules = readSpecificationRules(row.rulesJson);
  if (!rules.ok) {
    throw new GrantCatalogRowError(`${id}: rulesJson geçersiz`);
  }
  const dataVersion = parseDataVersion(row.dataVersion, id);

  return {
    id,
    source,
    sourceLabel: row.sourceLabel,
    title: row.title,
    summary: row.summary,
    poolAmountMinor: parsePoolAmountMinor(row.poolAmountMinor, id),
    minSupportMinor,
    maxSupportMinor,
    supportRatioBps: row.supportRatioBps,
    applicationOpensAt: opensAt.toISOString(),
    applicationDeadline: deadline.toISOString(),
    eligibility: parseEligibility(row.eligibilityJson, id),
    requiredDocuments: [...row.requiredDocuments],
    tags: [...row.tags],
    officialInfoUrl: row.officialInfoUrl,
    publicationUrl,
    status: computeGrantCallStatus(opensAt, deadline, now),
    remainingDays: computeRemainingDays(deadline, now),
    sourceVerifiedAt:
      row.sourceVerifiedAt === null
        ? null
        : parseInstant(row.sourceVerifiedAt, "sourceVerifiedAt", id).toISOString(),
    specificationText,
    rulesJson: rules.rules,
    dataVersion,
  };
}

function parseSpecificationText(value: string | null | undefined, id: string): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new GrantCatalogRowError(`${id}: specificationText metin değil`);
  }
  const clean = value.replace(/\u0000/g, "").trim();
  if (clean.length === 0) {
    return null;
  }
  if (clean.length > 200_000) {
    throw new GrantCatalogRowError(`${id}: specificationText sınırı aşıldı`);
  }
  return clean;
}

function parseDataVersion(value: number | null | undefined, id: string): number | null {
  if (value == null) {
    return null;
  }
  if (!Number.isInteger(value) || value < 1 || value > 1_000_000) {
    throw new GrantCatalogRowError(`${id}: dataVersion geçersiz`);
  }
  return value;
}

/**
 * Bozuk satır tüm kataloğu düşürmez. Geçerli satırlar servis edilir, bozuk kimlikler karantinaya gider.
 */
export function partitionGrantCatalogRows(
  rows: readonly GrantCatalogRowInput[],
  now: Date,
): { served: YetkinhibeGrantCatalogEntry[]; invalidIds: string[] } {
  const served: YetkinhibeGrantCatalogEntry[] = [];
  const invalidIds: string[] = [];
  for (const row of rows) {
    try {
      served.push(mapGrantCallRow(row, now));
    } catch (error) {
      if (error instanceof GrantCatalogRowError) {
        invalidIds.push(isNonEmptyText(row.id) ? row.id : "unknown");
        continue;
      }
      throw error;
    }
  }
  return { served, invalidIds };
}

function parsePublicationUrl(value: string | null | undefined, id: string): string | null {
  if (value == null || value.trim().length === 0) {
    return null;
  }
  if (!/^https:\/\//.test(value)) {
    throw new GrantCatalogRowError(`${id}: yayın bağlantısı https değil`);
  }
  return value;
}

function isNonEmptyText(value: string): boolean {
  return value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseProgramSource(key: string, id: string): GrantProgramSource {
  const mapped = LEGACY_PROGRAM_SOURCES[key] ?? key;
  if ((PROGRAM_SOURCES as readonly string[]).includes(mapped)) {
    return mapped as GrantProgramSource;
  }
  throw new GrantCatalogRowError(`${id}: bilinmeyen kaynak anahtarı`);
}

function parseInstant(value: Date, field: string, id: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new GrantCatalogRowError(`${id}: ${field} geçersiz tarih`);
  }
  return value;
}

/** İlan edilmemiş havuz null kalır. Null, sıfır liraya çevrilmez. */
function parsePoolAmountMinor(value: bigint | number | null, id: string): AmountMinor | null {
  if (value === null) {
    return null;
  }
  return parseAmountMinor(value, "poolAmountMinor", id);
}

/** Bigint veya sayı kabul eder. Güvenli tamsayı dışındaki değer reddedilir (A1). */
function parseAmountMinor(value: bigint | number, field: string, id: string): AmountMinor {
  const numeric = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isSafeInteger(numeric) || numeric < 0) {
    throw new GrantCatalogRowError(`${id}: ${field} geçersiz tutar`);
  }
  return toAmountMinor(numeric);
}

function parseNullableNumber(value: unknown, field: string, id: string): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  throw new GrantCatalogRowError(`${id}: eligibility.${field} geçersiz`);
}

function parseBoolean(value: unknown, field: string, id: string): boolean {
  if (value === undefined) {
    return false;
  }
  if (typeof value === "boolean") {
    return value;
  }
  throw new GrantCatalogRowError(`${id}: eligibility.${field} mantıksal değil`);
}

function parseSectorCodes(value: unknown, id: string): readonly string[] | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return [...value];
  }
  throw new GrantCatalogRowError(`${id}: eligibility.eligibleSectorCodes geçersiz`);
}

function parseClosedList<T extends string>(
  value: unknown,
  field: string,
  id: string,
  accept: (item: string) => item is T,
): readonly T[] | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw new GrantCatalogRowError(`${id}: eligibility.${field} geçersiz`);
  }
  const seen = new Set<string>();
  const items: T[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !accept(item) || seen.has(item)) {
      throw new GrantCatalogRowError(`${id}: eligibility.${field} geçersiz`);
    }
    seen.add(item);
    items.push(item);
  }
  return items;
}

function parseProvinceList(value: unknown, id: string): readonly string[] | null {
  return parseClosedList(value, "eligibleRegionCodes", id, (item): item is string => isProvinceCode(item));
}

function parseEligibility(value: unknown, id: string): GrantEligibilityCriteria {
  if (!isRecord(value)) {
    throw new GrantCatalogRowError(`${id}: eligibility_json nesne değil`);
  }
  return {
    eligibleSectorCodes: parseSectorCodes(value.eligibleSectorCodes, id),
    minEmployeeCount: parseNullableNumber(value.minEmployeeCount, "minEmployeeCount", id),
    maxEmployeeCount: parseNullableNumber(value.maxEmployeeCount, "maxEmployeeCount", id),
    minCompanyAgeYears: parseNullableNumber(value.minCompanyAgeYears, "minCompanyAgeYears", id),
    maxCompanyAgeYears: parseNullableNumber(value.maxCompanyAgeYears, "maxCompanyAgeYears", id),
    requiresRdActivity: parseBoolean(value.requiresRdActivity, "requiresRdActivity", id),
    requiresExportActivity: parseBoolean(value.requiresExportActivity, "requiresExportActivity", id),
    requiresKobiStatus: parseBoolean(value.requiresKobiStatus, "requiresKobiStatus", id),
    requiresPatentOrUtilityModel: parseBoolean(
      value.requiresPatentOrUtilityModel,
      "requiresPatentOrUtilityModel",
      id,
    ),
    eligibleRegionCodes: parseProvinceList(value.eligibleRegionCodes, id),
    audiences: parseClosedList<GrantAudience>(value.audiences, "audiences", id, isGrantAudience),
    investmentFocus: parseClosedList<GrantInvestmentFocus>(
      value.investmentFocus,
      "investmentFocus",
      id,
      isGrantInvestmentFocus,
    ),
    nacePrefixes: parseClosedList(value.nacePrefixes, "nacePrefixes", id, isGrantNaceGroup),
  };
}
