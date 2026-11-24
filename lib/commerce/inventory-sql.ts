/**
 * Stok değişiminin tek yazarı. Kapı `inventory-gate.ts` ile aynıdır.
 * `SALE`: on_hand_qty - safety_buffer >= quantity.
 * Diğer `OUT`: on_hand_qty >= quantity.
 * `IN` her zaman geçer. Kapı tutmazsa satır yazılmaz.
 * Aynı idempotency_key varsa stok ikinci kez değişmez.
 * Varyant değişince ürünün onaylı stoğu aynı ifadede eşitlenir (tek stok gerçeği).
 * Set satışı bu ifadeyi üye başına, aynı işlem içinde bir kez daha çalıştırır
 * (`moveWithSetMembers` / kanal `applyVariantMovement`). Üye kısa stokta işlem geri alınır.
 */
export const INVENTORY_MOVE_SQL = `
WITH existing AS (
  SELECT
    t.id,
    t.store_id,
    t.variant_id,
    t.actor_user_id,
    t.type::text AS type,
    t.direction::text AS direction,
    t.quantity,
    t.on_hand_after,
    t.note,
    t.idempotency_key,
    t.created_at
  FROM inventory_transactions t
  INNER JOIN commerce_stores s ON s.id = t.store_id
  WHERE t.idempotency_key = $1
    AND s.owner_user_id = $4
),
locked AS (
  SELECT
    v.id,
    v.store_id,
    v.product_id,
    v.on_hand_qty,
    v.safety_buffer,
    v.status::text AS status,
    v.amount_minor,
    v.barcode
  FROM commerce_variants v
  INNER JOIN commerce_stores s ON s.id = v.store_id
  WHERE v.id = $2
    AND v.store_id = $3
    AND s.owner_user_id = $4
    AND NOT EXISTS (SELECT 1 FROM existing)
  FOR UPDATE OF v
),
gated AS (
  SELECT
    l.*,
    CASE
      WHEN $5 = 'IN' THEN l.on_hand_qty + $7
      ELSE l.on_hand_qty - $7
    END AS next_on_hand,
    CASE
      WHEN $5 = 'IN' THEN (l.on_hand_qty + $7) <= 2147483647
      WHEN $6 = 'SALE' THEN (l.on_hand_qty - l.safety_buffer) >= $7
      ELSE l.on_hand_qty >= $7
    END AS allowed
  FROM locked l
),
updated AS (
  UPDATE commerce_variants v
  SET
    on_hand_qty = g.next_on_hand,
    status = CASE
      WHEN g.status = 'ACTIVE'
        AND $5 = 'OUT'
        AND $6 IN ('SALE', 'ADJUSTMENT')
        AND (g.next_on_hand - g.safety_buffer) <= 0
        THEN 'PASSIVE'::"CommerceVariantStatus"
      WHEN g.status = 'PASSIVE'
        AND $5 = 'IN'
        AND $6 IN ('INBOUND', 'RETURN')
        AND (g.next_on_hand - g.safety_buffer) > 0
        AND g.amount_minor IS NOT NULL
        AND g.barcode IS NOT NULL
        THEN 'ACTIVE'::"CommerceVariantStatus"
      ELSE g.status::"CommerceVariantStatus"
    END,
    updated_at = CURRENT_TIMESTAMP
  FROM gated g
  WHERE v.id = g.id
    AND g.allowed
  RETURNING v.id
),
inserted AS (
  INSERT INTO inventory_transactions (
    id,
    store_id,
    variant_id,
    actor_user_id,
    type,
    direction,
    quantity,
    on_hand_after,
    note,
    idempotency_key,
    created_at
  )
  SELECT
    $9,
    $3,
    $2,
    $4,
    CAST($6 AS "InventoryTransactionType"),
    CAST($5 AS "InventoryDirection"),
    $7,
    g.next_on_hand,
    $8,
    $1,
    CURRENT_TIMESTAMP
  FROM gated g
  INNER JOIN updated u ON u.id = g.id
  WHERE g.allowed
  RETURNING
    id,
    store_id,
    variant_id,
    actor_user_id,
    type::text AS type,
    direction::text AS direction,
    quantity,
    on_hand_after,
    note,
    idempotency_key,
    created_at
),
-- Ürünün onaylı stoğu, aynı işlemde, tüm varyantların eldeki toplamına çekilir.
-- Bu ifadenin anlık görüntüsünde güncellenen varyantın eski değeri görünür; bu yüzden
-- yeni değer (g.next_on_hand) ayrıca eklenir, kardeşler (id <> g.id) toplamdan okunur.
-- Eşzamanlı kardeş yazımı için çağıran ürün satırını bu ifadeden ÖNCE kilitler
-- (prisma-repository applyMovement). Yalnız varyant gerçekten güncellendiyse çalışır.
synced AS (
  UPDATE commerce_products p
  SET
    approved_stock_qty = (
      SELECT COALESCE(SUM(sib.on_hand_qty), 0)::int
      FROM commerce_variants sib
      WHERE sib.product_id = g.product_id
        AND sib.id <> g.id
    ) + g.next_on_hand,
    updated_at = CURRENT_TIMESTAMP
  FROM gated g
  INNER JOIN updated u ON u.id = g.id
  WHERE p.id = g.product_id
  RETURNING p.id
)
SELECT
  'replay'::text AS outcome,
  e.id,
  e.store_id,
  e.variant_id,
  e.actor_user_id,
  e.type,
  e.direction,
  e.quantity,
  e.on_hand_after,
  e.note,
  e.idempotency_key,
  e.created_at
FROM existing e
UNION ALL
SELECT
  'applied'::text,
  i.id,
  i.store_id,
  i.variant_id,
  i.actor_user_id,
  i.type,
  i.direction,
  i.quantity,
  i.on_hand_after,
  i.note,
  i.idempotency_key,
  i.created_at
FROM inserted i
UNION ALL
SELECT
  'rejected'::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::int,
  NULL::int,
  NULL::text,
  NULL::text,
  NULL::timestamp
WHERE EXISTS (SELECT 1 FROM gated WHERE NOT allowed)
UNION ALL
SELECT
  'missing'::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::text,
  NULL::int,
  NULL::int,
  NULL::text,
  NULL::text,
  NULL::timestamp
WHERE NOT EXISTS (SELECT 1 FROM existing)
  AND NOT EXISTS (SELECT 1 FROM locked)
`.trim();

export type InventoryMoveSqlRow = {
  outcome: "applied" | "replay" | "rejected" | "missing";
  id: string | null;
  store_id: string | null;
  variant_id: string | null;
  actor_user_id: string | null;
  type: string | null;
  direction: string | null;
  quantity: number | null;
  on_hand_after: number | null;
  note: string | null;
  idempotency_key: string | null;
  created_at: Date | null;
};

export function isInventoryIdempotencyRace(error: unknown): boolean {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return text.includes("inventory_transactions_idempotency_key");
}
