import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import {
  computeGrantCallStatus,
  grantVerificationAgeDays,
  mapGrantCallRow,
  PROGRAM_SOURCES,
  type GrantCatalogRowInput,
} from "@/lib/yetkinhibe/grant-catalog-core";
import {
  GRANT_CALL_SEEDS_2027,
  GRANT_SEED_VERIFIED_AT,
  GRANT_SOURCE_SEEDS,
  type GrantCallSeed,
} from "@/lib/yetkinhibe/grant-call-seed-2027";
import type { GrantProgramSource } from "@/lib/yetkinhibe/types";

export type GrantCallWriteInput = {
  id: string;
  sourceKey: string;
  title: string;
  summary: string;
  poolAmountMinor: number | null;
  minSupportMinor: number;
  maxSupportMinor: number;
  supportRatioBps: number;
  applicationOpensAt: string;
  applicationDeadline: string;
  eligibility: unknown;
  requiredDocuments: readonly string[];
  tags: readonly string[];
  officialInfoUrl: string;
  publicationUrl?: string | null;
  sourceVerifiedAt?: string | null;
  specificationText?: string | null;
  rulesJson?: Record<string, unknown> | null;
  isPublished?: boolean;
};

export type GrantCallWriteResult =
  | { ok: true; id: string; dataVersion: number }
  | { ok: false; status: 400 | 404 | 409; error: string };

const SOURCE_LABELS: Record<GrantProgramSource, string> = {
  KOSGEB: "KOSGEB",
  TUBITAK: "TÜBİTAK",
  TICARET_BAKANLIGI: "Ticaret Bakanlığı",
  KALKINMA_AJANSI: "Kalkınma Ajansı",
  TKDK_IPARD: "TKDK / IPARD",
  TARIM_BAKANLIGI: "Tarım ve Orman Bakanlığı",
  SANAYI_BAKANLIGI: "Sanayi ve Teknoloji Bakanlığı",
  ISKUR: "İŞKUR",
  AB_FONLARI: "Avrupa Birliği fonları",
};

function snapshotOf(row: {
  id: string;
  sourceKey: string;
  title: string;
  dataVersion: number;
  isPublished: boolean;
  sourceVerifiedAt: Date | null;
  maxSupportMinor: number;
  officialInfoUrl: string;
}): Prisma.InputJsonValue {
  return {
    id: row.id,
    sourceKey: row.sourceKey,
    title: row.title,
    dataVersion: row.dataVersion,
    isPublished: row.isPublished,
    sourceVerifiedAt: row.sourceVerifiedAt?.toISOString() ?? null,
    maxSupportMinor: row.maxSupportMinor,
    officialInfoUrl: row.officialInfoUrl,
  };
}

function validateWrite(input: GrantCallWriteInput, sourceLabel: string): string | null {
  const opens = new Date(input.applicationOpensAt);
  const deadline = new Date(input.applicationDeadline);
  const verified =
    input.sourceVerifiedAt == null || input.sourceVerifiedAt === ""
      ? null
      : new Date(input.sourceVerifiedAt);
  const row: GrantCatalogRowInput = {
    id: input.id,
    sourceKey: input.sourceKey,
    sourceLabel,
    title: input.title,
    summary: input.summary,
    poolAmountMinor: input.poolAmountMinor,
    minSupportMinor: input.minSupportMinor,
    maxSupportMinor: input.maxSupportMinor,
    supportRatioBps: input.supportRatioBps,
    applicationOpensAt: opens,
    applicationDeadline: deadline,
    eligibilityJson: input.eligibility,
    requiredDocuments: input.requiredDocuments,
    tags: input.tags,
    officialInfoUrl: input.officialInfoUrl,
    publicationUrl: input.publicationUrl ?? null,
    sourceVerifiedAt: verified,
    specificationText: input.specificationText,
    rulesJson: input.rulesJson,
  };
  try {
    mapGrantCallRow(row, new Date());
    return null;
  } catch (error) {
    return error instanceof Error ? "Çağrı satırı katalog kuralına uymuyor." : "Çağrı satırı geçersiz.";
  }
}

export async function createGrantCall(
  input: GrantCallWriteInput,
  actorUserId: string | null,
): Promise<GrantCallWriteResult> {
  if (!(PROGRAM_SOURCES as readonly string[]).includes(input.sourceKey)) {
    return { ok: false, status: 400, error: "Kaynak anahtarı katalogda yok." };
  }
  const sourceKey = input.sourceKey as GrantProgramSource;
  const invalid = validateWrite(input, SOURCE_LABELS[sourceKey]);
  if (invalid) {
    return { ok: false, status: 400, error: invalid };
  }
  const prisma = getPrisma();
  const existing = await prisma.yetkinhibeGrantCall.findUnique({ where: { id: input.id } });
  if (existing) {
    return { ok: false, status: 409, error: "Bu çağrı kimliği zaten kayıtlı." };
  }
  const source = await prisma.yetkinhibeGrantSource.findUnique({ where: { key: sourceKey } });
  if (!source) {
    return { ok: false, status: 400, error: "Kaynak kurum satırı yok." };
  }
  const verified = input.sourceVerifiedAt ? new Date(input.sourceVerifiedAt) : null;
  const created = await prisma.yetkinhibeGrantCall.create({
    data: {
      id: input.id,
      sourceKey,
      title: input.title,
      summary: input.summary,
      poolAmountMinor: input.poolAmountMinor,
      minSupportMinor: input.minSupportMinor,
      maxSupportMinor: input.maxSupportMinor,
      supportRatioBps: input.supportRatioBps,
      applicationOpensAt: new Date(input.applicationOpensAt),
      applicationDeadline: new Date(input.applicationDeadline),
      eligibilityJson: input.eligibility as object,
      requiredDocuments: [...input.requiredDocuments],
      tags: [...input.tags],
      officialInfoUrl: input.officialInfoUrl,
      publicationUrl: input.publicationUrl ?? null,
      sourceVerifiedAt: verified,
      specificationText: input.specificationText ?? null,
      rulesJson: input.rulesJson == null ? Prisma.DbNull : (input.rulesJson as Prisma.InputJsonValue),
      isPublished: input.isPublished ?? true,
      dataVersion: 1,
    },
  });
  await prisma.hibeGrantCallRevision.create({
    data: {
      callId: created.id,
      dataVersion: created.dataVersion,
      action: "CREATE",
      actorUserId,
      snapshotJson: snapshotOf(created),
    },
  });
  return { ok: true, id: created.id, dataVersion: created.dataVersion };
}

export async function patchGrantCall(
  id: string,
  input: Partial<GrantCallWriteInput>,
  actorUserId: string | null,
): Promise<GrantCallWriteResult> {
  const prisma = getPrisma();
  const current = await prisma.yetkinhibeGrantCall.findUnique({ where: { id } });
  if (!current) {
    return { ok: false, status: 404, error: "Çağrı bulunamadı." };
  }
  const merged: GrantCallWriteInput = {
    id: current.id,
    sourceKey: input.sourceKey ?? current.sourceKey,
    title: input.title ?? current.title,
    summary: input.summary ?? current.summary,
    poolAmountMinor:
      input.poolAmountMinor !== undefined
        ? input.poolAmountMinor
        : current.poolAmountMinor == null
          ? null
          : Number(current.poolAmountMinor),
    minSupportMinor: input.minSupportMinor ?? current.minSupportMinor,
    maxSupportMinor: input.maxSupportMinor ?? current.maxSupportMinor,
    supportRatioBps: input.supportRatioBps ?? current.supportRatioBps,
    applicationOpensAt: input.applicationOpensAt ?? current.applicationOpensAt.toISOString(),
    applicationDeadline: input.applicationDeadline ?? current.applicationDeadline.toISOString(),
    eligibility: input.eligibility ?? current.eligibilityJson,
    requiredDocuments: input.requiredDocuments ?? current.requiredDocuments,
    tags: input.tags ?? current.tags,
    officialInfoUrl: input.officialInfoUrl ?? current.officialInfoUrl,
    publicationUrl: input.publicationUrl !== undefined ? input.publicationUrl : current.publicationUrl,
    sourceVerifiedAt:
      input.sourceVerifiedAt !== undefined
        ? input.sourceVerifiedAt
        : current.sourceVerifiedAt?.toISOString() ?? null,
    specificationText:
      input.specificationText !== undefined ? input.specificationText : current.specificationText,
    rulesJson: input.rulesJson !== undefined ? input.rulesJson : (current.rulesJson as Record<string, unknown> | null),
    isPublished: input.isPublished ?? current.isPublished,
  };
  if (!(PROGRAM_SOURCES as readonly string[]).includes(merged.sourceKey)) {
    return { ok: false, status: 400, error: "Kaynak anahtarı katalogda yok." };
  }
  const sourceKey = merged.sourceKey as GrantProgramSource;
  const invalid = validateWrite(merged, SOURCE_LABELS[sourceKey]);
  if (invalid) {
    return { ok: false, status: 400, error: invalid };
  }
  const dataVersion = current.dataVersion + 1;
  const updated = await prisma.yetkinhibeGrantCall.update({
    where: { id },
    data: {
      sourceKey,
      title: merged.title,
      summary: merged.summary,
      poolAmountMinor: merged.poolAmountMinor,
      minSupportMinor: merged.minSupportMinor,
      maxSupportMinor: merged.maxSupportMinor,
      supportRatioBps: merged.supportRatioBps,
      applicationOpensAt: new Date(merged.applicationOpensAt),
      applicationDeadline: new Date(merged.applicationDeadline),
      eligibilityJson: merged.eligibility as object,
      requiredDocuments: [...merged.requiredDocuments],
      tags: [...merged.tags],
      officialInfoUrl: merged.officialInfoUrl,
      publicationUrl: merged.publicationUrl ?? null,
      sourceVerifiedAt: merged.sourceVerifiedAt ? new Date(merged.sourceVerifiedAt) : null,
      specificationText: merged.specificationText ?? null,
      rulesJson: merged.rulesJson == null ? Prisma.DbNull : (merged.rulesJson as Prisma.InputJsonValue),
      isPublished: merged.isPublished ?? true,
      dataVersion,
    },
  });
  await prisma.hibeGrantCallRevision.create({
    data: {
      callId: id,
      dataVersion,
      action: "UPDATE",
      actorUserId,
      snapshotJson: snapshotOf(updated),
    },
  });
  return { ok: true, id, dataVersion };
}

export async function verifyGrantCall(
  id: string,
  actorUserId: string | null,
  now: Date = new Date(),
): Promise<GrantCallWriteResult> {
  return touchGrantCall(id, actorUserId, "VERIFY", { sourceVerifiedAt: now, isPublished: true });
}

export type GrantCallBulkVerifyResult = {
  verified: string[];
  skipped: string[];
  failed: string[];
};

/**
 * Toplu yeniden doğrulama (Ş1). Tek komutla katalog tazelenir.
 *
 * `olderThanDays` verilmezse **yayımlı tüm** açık satırlar doğrulanır; verilirse yalnız
 * doğrulaması bu günden eski (veya hiç doğrulanmamış) satırlar. Penceresi kapanmış
 * (`CLOSED`) satır tazelenmez: süresi geçmiş çağrı "açık" diye damgalanmaz.
 */
export async function verifyGrantCalls(
  actorUserId: string | null,
  options: { olderThanDays?: number | null; now?: Date } = {},
): Promise<GrantCallBulkVerifyResult> {
  const now = options.now ?? new Date();
  const prisma = getPrisma();
  const rows = await prisma.yetkinhibeGrantCall.findMany({
    where: { isPublished: true },
    select: { id: true, applicationOpensAt: true, applicationDeadline: true, sourceVerifiedAt: true },
  });
  const verified: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];
  const olderThanDays = options.olderThanDays ?? null;
  for (const row of rows) {
    if (computeGrantCallStatus(row.applicationOpensAt, row.applicationDeadline, now) === "CLOSED") {
      skipped.push(row.id);
      continue;
    }
    if (olderThanDays != null) {
      const age = grantVerificationAgeDays(row.sourceVerifiedAt, now);
      if (age != null && age < olderThanDays) {
        skipped.push(row.id);
        continue;
      }
    }
    try {
      const result = await verifyGrantCall(row.id, actorUserId, now);
      if (result.ok) {
        verified.push(row.id);
      } else {
        failed.push(row.id);
      }
    } catch {
      failed.push(row.id);
    }
  }
  return { verified, skipped, failed };
}

/**
 * Şartname tohumunu mevcut satırlara işler. Idempotent: yalnız boş `specification_text`
 * alanı doldurulur; operatörün elle girdiği metin ezilmez.
 */
export async function applyGrantSpecificationSeeds(
  actorUserId: string | null,
  now: Date = new Date(),
): Promise<{ filled: string[]; kept: string[] }> {
  const prisma = getPrisma();
  const filled: string[] = [];
  const kept: string[] = [];
  for (const seed of GRANT_CALL_SEEDS_2027) {
    if (!seed.specificationText) {
      continue;
    }
    const row = await prisma.yetkinhibeGrantCall.findUnique({
      where: { id: seed.id },
      select: { id: true, dataVersion: true, specificationText: true },
    });
    if (!row) {
      continue;
    }
    if (row.specificationText && row.specificationText.trim().length >= 12) {
      kept.push(seed.id);
      continue;
    }
    const dataVersion = row.dataVersion + 1;
    await prisma.yetkinhibeGrantCall.update({
      where: { id: seed.id },
      data: {
        specificationText: seed.specificationText,
        rulesJson: seed.rulesJson == null ? Prisma.DbNull : (seed.rulesJson as unknown as Prisma.InputJsonValue),
        dataVersion,
        updatedAt: now,
      },
    });
    await prisma.hibeGrantCallRevision.create({
      data: {
        callId: seed.id,
        dataVersion,
        action: "UPDATE",
        actorUserId,
        snapshotJson: { id: seed.id, dataVersion, action: "SPECIFICATION_SEED" },
      },
    });
    filled.push(seed.id);
  }
  return { filled, kept };
}

export async function unpublishGrantCall(id: string, actorUserId: string | null): Promise<GrantCallWriteResult> {
  return touchGrantCall(id, actorUserId, "UNPUBLISH", { isPublished: false });
}

async function touchGrantCall(
  id: string,
  actorUserId: string | null,
  action: "VERIFY" | "UNPUBLISH",
  patch: { sourceVerifiedAt?: Date; isPublished?: boolean },
): Promise<GrantCallWriteResult> {
  const prisma = getPrisma();
  const current = await prisma.yetkinhibeGrantCall.findUnique({ where: { id } });
  if (!current) {
    return { ok: false, status: 404, error: "Çağrı bulunamadı." };
  }
  const dataVersion = current.dataVersion + 1;
  const updated = await prisma.yetkinhibeGrantCall.update({
    where: { id },
    data: { ...patch, dataVersion },
  });
  await prisma.hibeGrantCallRevision.create({
    data: {
      callId: id,
      dataVersion,
      action,
      actorUserId,
      snapshotJson: snapshotOf(updated),
    },
  });
  return { ok: true, id, dataVersion };
}

function seedToWrite(seed: GrantCallSeed): GrantCallWriteInput {
  return {
    id: seed.id,
    sourceKey: seed.sourceKey,
    title: seed.title,
    summary: seed.summary,
    poolAmountMinor: seed.poolAmountMinor,
    minSupportMinor: seed.minSupportMinor,
    maxSupportMinor: seed.maxSupportMinor,
    supportRatioBps: seed.supportRatioBps,
    applicationOpensAt: seed.applicationOpensAt,
    applicationDeadline: seed.applicationDeadline,
    eligibility: seed.eligibility,
    requiredDocuments: seed.requiredDocuments,
    tags: seed.tags,
    officialInfoUrl: seed.officialInfoUrl,
    publicationUrl: seed.publicationUrl,
    sourceVerifiedAt: GRANT_SEED_VERIFIED_AT,
    specificationText: seed.specificationText ?? null,
    rulesJson: seed.rulesJson ?? null,
    isPublished: true,
  };
}

/** Eksik tohum satırlarını ekler. Var olan kimliğe dokunmaz. */
export async function seedMissingGrantCalls(actorUserId: string | null): Promise<{
  inserted: string[];
  skipped: string[];
}> {
  const prisma = getPrisma();
  for (const source of GRANT_SOURCE_SEEDS) {
    await prisma.yetkinhibeGrantSource.upsert({
      where: { key: source.key },
      create: { key: source.key, label: source.label, officialUrl: source.officialUrl },
      update: { label: source.label, officialUrl: source.officialUrl },
    });
  }
  const inserted: string[] = [];
  const skipped: string[] = [];
  for (const seed of GRANT_CALL_SEEDS_2027) {
    const existing = await prisma.yetkinhibeGrantCall.findUnique({ where: { id: seed.id } });
    if (existing) {
      skipped.push(seed.id);
      continue;
    }
    const input = seedToWrite(seed);
    const sourceKey = input.sourceKey as GrantProgramSource;
    const created = await prisma.yetkinhibeGrantCall.create({
      data: {
        id: input.id,
        sourceKey,
        title: input.title,
        summary: input.summary,
        poolAmountMinor: input.poolAmountMinor,
        minSupportMinor: input.minSupportMinor,
        maxSupportMinor: input.maxSupportMinor,
        supportRatioBps: input.supportRatioBps,
        applicationOpensAt: new Date(input.applicationOpensAt),
        applicationDeadline: new Date(input.applicationDeadline),
        eligibilityJson: input.eligibility as object,
        requiredDocuments: [...input.requiredDocuments],
        tags: [...input.tags],
        officialInfoUrl: input.officialInfoUrl,
        publicationUrl: input.publicationUrl ?? null,
        sourceVerifiedAt: new Date(GRANT_SEED_VERIFIED_AT),
        specificationText: input.specificationText ?? null,
        rulesJson:
          input.rulesJson == null ? Prisma.DbNull : (input.rulesJson as Prisma.InputJsonValue),
        isPublished: true,
        dataVersion: 1,
      },
    });
    await prisma.hibeGrantCallRevision.create({
      data: {
        callId: created.id,
        dataVersion: 1,
        action: "SEED",
        actorUserId,
        snapshotJson: snapshotOf(created),
      },
    });
    inserted.push(created.id);
  }
  return { inserted, skipped };
}
