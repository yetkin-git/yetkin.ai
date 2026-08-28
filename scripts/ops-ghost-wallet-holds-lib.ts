/**
 * Lab/hosted emanet hayalet envanteri — cüzdan-fonlu PENDING hold.
 * Fail-closed motor (EscrowWalletFundedHoldError) serbest/iade yazmaz;
 * bu betik CREDIT/REFUNDED/RELEASED basmaz. Yalnız sayım + kimlik listesi.
 *
 *   npm run ops:ghost-wallet-holds
 *   npm run ops:ghost-wallet-holds -- --strict
 *   npm run ops:ghost-wallet-holds -- --limit 50
 */

export type GhostWalletHoldRow = {
  id: string;
  referenceKey: string;
  status: string;
  walletId: string | null;
  userId: string;
  grossMinor: number;
  createdAt: Date;
  source: "wallet_id" | "ledger_debit";
};

export type GhostWalletHoldInventory = {
  walletIdPending: number;
  ledgerDebitPending: number;
  /** Birleşik benzersiz hold sayısı (wallet_id ∪ ledger DEBIT). */
  uniqueHolds: number;
  rows: readonly GhostWalletHoldRow[];
};

export type GhostHoldQuery = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
};

export function parseGhostHoldCliArgs(argv: string[]): {
  limit: number;
  strict: boolean;
} {
  let limit = 50;
  let strict = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--strict") {
      strict = true;
      continue;
    }
    if (arg === "--limit") {
      const raw = argv[i + 1];
      i += 1;
      const parsed = Number.parseInt(raw ?? "", 10);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 500) {
        throw new Error("--limit 1..500 ister.");
      }
      limit = parsed;
      continue;
    }
    if (arg?.startsWith("-")) {
      throw new Error(`Bilinmeyen bayrak: ${arg}`);
    }
  }
  return { limit, strict };
}

type HoldSqlRow = {
  id: string;
  reference_key: string;
  status: string;
  wallet_id: string | null;
  user_id: string;
  gross_minor: number | string;
  created_at: Date | string;
};

function mapHold(row: HoldSqlRow, source: GhostWalletHoldRow["source"]): GhostWalletHoldRow {
  return {
    id: row.id,
    referenceKey: row.reference_key,
    status: row.status,
    walletId: row.wallet_id,
    userId: row.user_id,
    grossMinor: typeof row.gross_minor === "number" ? row.gross_minor : Number(row.gross_minor),
    createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    source,
  };
}

/**
 * PENDING + (wallet_id dolu VEYA ledger escrow-hold:{ref} DEBIT).
 * Temizlik = envanter; motor fail-closed bırakır. Otomatik CREDIT yok.
 */
export async function inventoryGhostWalletHolds(
  db: GhostHoldQuery,
  limit = 50,
): Promise<GhostWalletHoldInventory> {
  const walletCount = await db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM escrow_holds
     WHERE status = 'PENDING' AND wallet_id IS NOT NULL`,
  );
  const ledgerCount = await db.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM escrow_holds h
     WHERE h.status = 'PENDING'
       AND EXISTS (
         SELECT 1 FROM ledger_entries e
         WHERE e.idempotency_key = 'escrow-hold:' || h.reference_key
           AND e.direction = 'DEBIT'
       )`,
  );
  const walletRows = await db.query<HoldSqlRow>(
    `SELECT id, reference_key, status, wallet_id, user_id, gross_minor, created_at
     FROM escrow_holds
     WHERE status = 'PENDING' AND wallet_id IS NOT NULL
     ORDER BY created_at ASC
     LIMIT $1`,
    [limit],
  );
  const ledgerRows = await db.query<HoldSqlRow>(
    `SELECT h.id, h.reference_key, h.status, h.wallet_id, h.user_id, h.gross_minor, h.created_at
     FROM escrow_holds h
     WHERE h.status = 'PENDING'
       AND h.wallet_id IS NULL
       AND EXISTS (
         SELECT 1 FROM ledger_entries e
         WHERE e.idempotency_key = 'escrow-hold:' || h.reference_key
           AND e.direction = 'DEBIT'
       )
     ORDER BY h.created_at ASC
     LIMIT $1`,
    [limit],
  );

  const byId = new Map<string, GhostWalletHoldRow>();
  for (const row of walletRows.rows) {
    byId.set(row.id, mapHold(row, "wallet_id"));
  }
  for (const row of ledgerRows.rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, mapHold(row, "ledger_debit"));
    }
  }

  return {
    walletIdPending: Number.parseInt(walletCount.rows[0]?.count ?? "0", 10) || 0,
    ledgerDebitPending: Number.parseInt(ledgerCount.rows[0]?.count ?? "0", 10) || 0,
    uniqueHolds: byId.size,
    rows: [...byId.values()].slice(0, limit),
  };
}

export function formatGhostWalletHoldInventory(inv: GhostWalletHoldInventory): string {
  const lines = [
    `wallet_id IS NOT NULL PENDING=${inv.walletIdPending}`,
    `ledger escrow-hold DEBIT PENDING=${inv.ledgerDebitPending}`,
    `listelenen benzersiz=${inv.uniqueHolds} (CREDIT/RELEASE yazılmaz; fail-closed envanter)`,
  ];
  for (const row of inv.rows) {
    lines.push(
      `- ${row.id} ref=${row.referenceKey} source=${row.source} user=${row.userId} gross=${row.grossMinor}`,
    );
  }
  if (inv.walletIdPending + inv.ledgerDebitPending === 0) {
    lines.push("Hayalet yok — PENDING wallet-funded hold = 0.");
  } else {
    lines.push(
      "Temizlik: motor serbest/iade atmaz (EscrowWalletFundedHoldError). Elle CREDIT/REFUNDED yasak; Super Admin incelemesi.",
    );
  }
  return lines.join("\n");
}

export function ghostWalletHoldExitCode(inv: GhostWalletHoldInventory, strict: boolean): number {
  if (!strict) {
    return 0;
  }
  return inv.walletIdPending > 0 || inv.ledgerDebitPending > 0 ? 1 : 0;
}
