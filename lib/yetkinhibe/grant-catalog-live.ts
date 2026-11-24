import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  GrantCatalogUnavailableError,
  partitionGrantCatalogRows,
  type GrantCatalogRowInput,
  type YetkinhibeGrantCatalogEntry,
} from "@/lib/yetkinhibe/grant-catalog-core";

/**
 * Canlı hibe kataloğu. Yalnız `isPublished` satırları okunur.
 *
 * Ş11 / B-08 — bu yol **salt okunur**. Bozuk satır okuma anında yalnız bellekte
 * elenir (`partitionGrantCatalogRows`); `isPublished=false` yazımı, `QUARANTINE`
 * revizyonu ve olay günlüğü admin/cron bakım yolundadır
 * (`lib/yetkinhibe/grant-catalog-verify.ts`). Böylece anonim bir
 * `GET /api/yetkinhibe/grant/catalog` çağrısı veritabanında kalıcı durum değiştiremez.
 *
 * Veritabanı hatası veya servis edilecek satır kalmaması 503'tür. Sabit kataloğa düşülmez.
 */
export async function loadYetkinhibeGrantCatalog(
  now: Date = new Date(),
): Promise<readonly YetkinhibeGrantCatalogEntry[]> {
  const rows = await getPrisma()
    .yetkinhibeGrantCall.findMany({
      where: { isPublished: true },
      orderBy: { applicationDeadline: "asc" },
      include: { source: { select: { label: true } } },
    })
    .catch((): never => {
      throw new GrantCatalogUnavailableError("read_failed");
    });

  if (rows.length === 0) {
    throw new GrantCatalogUnavailableError("empty");
  }

  const input: GrantCatalogRowInput[] = rows.map((row) => ({
    id: row.id,
    sourceKey: row.sourceKey,
    sourceLabel: row.source.label,
    title: row.title,
    summary: row.summary,
    poolAmountMinor: row.poolAmountMinor,
    minSupportMinor: row.minSupportMinor,
    maxSupportMinor: row.maxSupportMinor,
    supportRatioBps: row.supportRatioBps,
    applicationOpensAt: row.applicationOpensAt,
    applicationDeadline: row.applicationDeadline,
    eligibilityJson: row.eligibilityJson,
    requiredDocuments: row.requiredDocuments,
    tags: row.tags,
    officialInfoUrl: row.officialInfoUrl,
    publicationUrl: row.publicationUrl,
    sourceVerifiedAt: row.sourceVerifiedAt,
    specificationText: row.specificationText,
    rulesJson: row.rulesJson,
    dataVersion: row.dataVersion,
  }));
  // Okuma yolu: geçersiz satır yalnız bellekte elenir, kalıcı yazma yoktur.
  const partitioned = partitionGrantCatalogRows(input, now);
  if (partitioned.served.length === 0) {
    throw new GrantCatalogUnavailableError(partitioned.invalidIds.length > 0 ? "invalid_row" : "empty");
  }
  return partitioned.served;
}

/**
 * Bakım okuması — admin/cron yolu. Geçersiz satır kimlikleri **döner**, yazılmaz.
 * Kalıcı karantina yazımı `quarantineGrantCalls` içindedir ve yalnız bu yol çağırır.
 */
export async function scanYetkinhibeGrantCatalog(
  now: Date = new Date(),
): Promise<{
  served: readonly YetkinhibeGrantCatalogEntry[];
  invalidIds: readonly string[];
}> {
  const rows = await getPrisma()
    .yetkinhibeGrantCall.findMany({
      where: { isPublished: true },
      orderBy: { applicationDeadline: "asc" },
      include: { source: { select: { label: true } } },
    })
    .catch((): never => {
      throw new GrantCatalogUnavailableError("read_failed");
    });

  const input: GrantCatalogRowInput[] = rows.map((row) => ({
    id: row.id,
    sourceKey: row.sourceKey,
    sourceLabel: row.source.label,
    title: row.title,
    summary: row.summary,
    poolAmountMinor: row.poolAmountMinor,
    minSupportMinor: row.minSupportMinor,
    maxSupportMinor: row.maxSupportMinor,
    supportRatioBps: row.supportRatioBps,
    applicationOpensAt: row.applicationOpensAt,
    applicationDeadline: row.applicationDeadline,
    eligibilityJson: row.eligibilityJson,
    requiredDocuments: row.requiredDocuments,
    tags: row.tags,
    officialInfoUrl: row.officialInfoUrl,
    publicationUrl: row.publicationUrl,
    sourceVerifiedAt: row.sourceVerifiedAt,
    specificationText: row.specificationText,
    rulesJson: row.rulesJson,
    dataVersion: row.dataVersion,
  }));
  const partitioned = partitionGrantCatalogRows(input, now);
  return { served: partitioned.served, invalidIds: partitioned.invalidIds };
}

/**
 * Kalıcı karantina. **Yalnız** bakım yolu çağırır: admin uçları ve cron işi.
 * Okuma yolu bu işlevi çağırmaz (Ş11).
 */
export async function quarantineGrantCalls(
  ids: readonly string[],
  options: { actorUserId?: string | null } = {},
): Promise<{ quarantined: string[]; failed: string[] }> {
  const prisma = getPrisma();
  const actorUserId = options.actorUserId ?? null;
  const quarantined: string[] = [];
  const failed: string[] = [];
  for (const id of ids) {
    if (!id || id === "unknown") {
      continue;
    }
    try {
      const row = await prisma.yetkinhibeGrantCall.findUnique({ where: { id } });
      if (!row || !row.isPublished) {
        continue;
      }
      const dataVersion = row.dataVersion + 1;
      await prisma.yetkinhibeGrantCall.update({
        where: { id },
        data: { isPublished: false, dataVersion },
      });
      await prisma.hibeGrantCallRevision.create({
        data: {
          callId: id,
          dataVersion,
          action: "QUARANTINE",
          actorUserId,
          snapshotJson: { id, reason: "invalid_row", dataVersion },
        },
      });
      quarantined.push(id);
    } catch {
      failed.push(id);
    }
  }
  return { quarantined, failed };
}
