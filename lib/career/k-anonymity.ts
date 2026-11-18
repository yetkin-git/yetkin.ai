/**
 * Uzman dizini k-anonimlik eşiği.
 * İl × dikey kırılımında 5'ten az kişi bastırılır.
 * İlçe ve mahalle yayımlanmaz. Eşik gevşetilemez.
 */

export const TALENT_DIRECTORY_K_MIN = 5 as const;

export type TalentDirectoryStatInput = {
  province: string | null;
  verticalId: string;
};

export type TalentDirectoryStatCell = {
  province: string | null;
  verticalId: string;
  count: number;
  suppressed: boolean;
};

function assertKMin(kMin: number): void {
  if (!Number.isInteger(kMin) || kMin < TALENT_DIRECTORY_K_MIN) {
    throw new Error(`talent_directory_k_min_invalid: kMin >= ${TALENT_DIRECTORY_K_MIN} olmalı`);
  }
}

/** İlçe, mahalle ve serbest metin il değildir. */
export function isPublishableProvince(value: string | null | undefined): boolean {
  const province = value?.trim() ?? "";
  if (!province || province.length > 40) {
    return false;
  }
  if (/[/,;]|mahalle|sokak|cadde|no:/i.test(province)) {
    return false;
  }
  return true;
}

export function isDirectorySlicePublished(count: number, kMin: number = TALENT_DIRECTORY_K_MIN): boolean {
  assertKMin(kMin);
  return Number.isInteger(count) && count >= kMin;
}

/**
 * İl × dikey sayımı. Boş il, il geneli dikey sayımıdır.
 * İlçe yazılmaz. Eşik altı hücre `suppressed` kalır; kamu yüzeyi onu basmaz.
 */
export function aggregateTalentDirectoryCells(
  rows: readonly TalentDirectoryStatInput[],
  kMin: number = TALENT_DIRECTORY_K_MIN,
): TalentDirectoryStatCell[] {
  assertKMin(kMin);
  const buckets = new Map<string, TalentDirectoryStatCell>();
  for (const row of rows) {
    const verticalId = row.verticalId.trim();
    if (!verticalId) {
      continue;
    }
    const province =
      row.province && isPublishableProvince(row.province) ? row.province.trim() : null;
    const key = `${province ?? ""}|${verticalId}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.set(key, { province, verticalId, count: 1, suppressed: false });
    }
  }
  const cells: TalentDirectoryStatCell[] = [];
  for (const cell of buckets.values()) {
    cells.push({ ...cell, suppressed: cell.count < kMin });
  }
  cells.sort((left, right) => {
    const byProvince = (left.province ?? "").localeCompare(right.province ?? "", "tr");
    if (byProvince !== 0) {
      return byProvince;
    }
    return left.verticalId.localeCompare(right.verticalId, "tr");
  });
  return cells;
}

export function publishedDirectoryCells(
  cells: readonly TalentDirectoryStatCell[],
): TalentDirectoryStatCell[] {
  return cells.filter((cell) => !cell.suppressed);
}
