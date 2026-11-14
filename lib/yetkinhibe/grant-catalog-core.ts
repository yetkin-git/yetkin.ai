import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  isGrantAudience,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isProvinceCode,
  type GrantAudience,
  type GrantInvestmentFocus,
} from "@/lib/yetkinhibe/grant-brief-axes";
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PROGRAM_SOURCES: readonly GrantProgramSource[] = [
  "KOSGEB",
  "TUBITAK",
  "TICARET_BAKANLIGI",
  "KALKINMA_AJANSI",
  "RESMI_GAZETE",
  "BOLGESEL_AJANS",
];

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
  poolAmountMinor: bigint | number;
  minSupportMinor: number;
  maxSupportMinor: number;
  supportRatioBps: number;
  applicationOpensAt: Date;
  applicationDeadline: Date;
  eligibilityJson: unknown;
  requiredDocuments: readonly string[];
  tags: readonly string[];
  officialInfoUrl: string;
  sourceVerifiedAt: Date | null;
};

/** API'ye giden çağrı. `sourceVerifiedAt` null ise resmî kaynakla doğrulanmamıştır; arayüz bunu dürüstçe gösterir. */
export type YetkinhibeGrantCatalogEntry = GrantCallWithMeta & {
  sourceVerifiedAt: string | null;
};

/** Kalan gün sayısı, yukarı yuvarlanır. Son tarih geçmişse 0 (negatif sızdırılmaz). */
export function computeRemainingDays(deadline: Date, now: Date): number {
  const diffMs = deadline.getTime() - now.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / MS_PER_DAY);
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

  return {
    id,
    source,
    sourceLabel: row.sourceLabel,
    title: row.title,
    summary: row.summary,
    poolAmountMinor: parseAmountMinor(row.poolAmountMinor, "poolAmountMinor", id),
    minSupportMinor,
    maxSupportMinor,
    supportRatioBps: row.supportRatioBps,
    applicationOpensAt: opensAt.toISOString(),
    applicationDeadline: deadline.toISOString(),
    eligibility: parseEligibility(row.eligibilityJson, id),
    requiredDocuments: [...row.requiredDocuments],
    tags: [...row.tags],
    officialInfoUrl: row.officialInfoUrl,
    status: computeGrantCallStatus(opensAt, deadline, now),
    remainingDays: computeRemainingDays(deadline, now),
    sourceVerifiedAt:
      row.sourceVerifiedAt === null
        ? null
        : parseInstant(row.sourceVerifiedAt, "sourceVerifiedAt", id).toISOString(),
  };
}

function isNonEmptyText(value: string): boolean {
  return value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseProgramSource(key: string, id: string): GrantProgramSource {
  if ((PROGRAM_SOURCES as readonly string[]).includes(key)) {
    return key as GrantProgramSource;
  }
  throw new GrantCatalogRowError(`${id}: bilinmeyen kaynak anahtarı`);
}

function parseInstant(value: Date, field: string, id: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new GrantCatalogRowError(`${id}: ${field} geçersiz tarih`);
  }
  return value;
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
