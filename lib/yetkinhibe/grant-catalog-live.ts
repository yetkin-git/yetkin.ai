import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  GrantCatalogUnavailableError,
  mapGrantCallRow,
  type YetkinhibeGrantCatalogEntry,
} from "@/lib/yetkinhibe/grant-catalog-core";

/**
 * Canlı hibe kataloğu (F2). Yalnız `isPublished` satırları okunur. Veritabanı hatası, boş tablo
 * veya doğrulanamayan bir satır `GrantCatalogUnavailableError` fırlatır. Sabit kataloğa düşülmez
 * (R1, A5): süresi dolmuş veri aktif gibi görünmez.
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

  try {
    return rows.map((row) =>
      mapGrantCallRow(
        {
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
          sourceVerifiedAt: row.sourceVerifiedAt,
        },
        now,
      ),
    );
  } catch {
    throw new GrantCatalogUnavailableError("invalid_row");
  }
}
