import { VERTICAL_ROOMS } from "@/lib/kernel/modules";
import { FROZEN_DISK_ROOM_CATALOG } from "@/lib/kernel/compliance/circuit-breakers";
import { formatMinor } from "@/lib/kernel/money/format";
import { HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import type { CatalogModuleGroup, SealedCatalogEntry } from "@/lib/kernel/admin/types";
import type { PriceCatalogUnitType } from "@/lib/kernel/pricing/catalog";

export const ADMIN_UNSET_LABEL = "—" as const;
export const ADMIN_EMPTY_LABEL = "Henüz katalog satırı yok" as const;
export const HOLD_BPS_BAND_LABEL = `${HOLD_BPS_MIN}–${HOLD_BPS_MAX} bps` as const;

const UNIT_TYPE_LABEL: Record<PriceCatalogUnitType, string> = {
  MINOR: "Minor",
  BPS: "Hold bps",
};

export function catalogModuleLabel(moduleKey: string): string {
  const room =
    VERTICAL_ROOMS.find((row) => row.id === moduleKey) ??
    FROZEN_DISK_ROOM_CATALOG.find((row) => row.id === moduleKey);
  return room?.label ?? moduleKey;
}

export function catalogUnitTypeLabel(unitType: PriceCatalogUnitType): string {
  return UNIT_TYPE_LABEL[unitType];
}

/** 10_000 bps = %100. 1000 bps → %10. `.toFixed(2)` yok — kalan bps ile iki hane. */
export function formatCatalogBps(bps: number): string {
  const whole = Math.trunc(bps / 100);
  const frac = Math.abs(bps % 100);
  const percentLabel = frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0")}`;
  return `${bps} bps (%${percentLabel})`;
}

export function formatCatalogValue(
  unitType: PriceCatalogUnitType,
  amount: number | null,
  currencyCode: SealedCatalogEntry["currencyCode"],
): string {
  if (amount == null) {
    return ADMIN_UNSET_LABEL;
  }
  if (unitType === "BPS") {
    return formatCatalogBps(amount);
  }
  return formatMinor(amount, currencyCode);
}

/** Checkout bandı ile aynı kural: taban = minMinor ?? amountMinor. */
export function catalogFloorMinor(entry: SealedCatalogEntry): number {
  return entry.minMinor ?? entry.amountMinor;
}

export function formatCatalogBand(entry: SealedCatalogEntry): string {
  const floor = formatCatalogValue(entry.unitType, catalogFloorMinor(entry), entry.currencyCode);
  const ceiling = formatCatalogValue(entry.unitType, entry.maxMinor, entry.currencyCode);
  return `${floor} → ${ceiling}`;
}

export function isHoldBpsInCodeBand(bps: number): boolean {
  return Number.isInteger(bps) && bps >= HOLD_BPS_MIN && bps <= HOLD_BPS_MAX;
}

export function groupCatalogEntriesByModule(
  entries: readonly SealedCatalogEntry[],
): CatalogModuleGroup[] {
  const groups: CatalogModuleGroup[] = [];
  const indexByModule = new Map<string, number>();
  for (const entry of entries) {
    const existing = indexByModule.get(entry.moduleKey);
    if (existing == null) {
      indexByModule.set(entry.moduleKey, groups.length);
      groups.push({ moduleKey: entry.moduleKey, entries: [entry] });
      continue;
    }
    groups[existing]!.entries.push(entry);
  }
  return groups;
}

export function countCatalogModules(entries: readonly SealedCatalogEntry[]): number {
  return new Set(entries.map((entry) => entry.moduleKey)).size;
}

export function countCatalogBpsEntries(entries: readonly SealedCatalogEntry[]): number {
  return entries.filter((entry) => entry.unitType === "BPS").length;
}
