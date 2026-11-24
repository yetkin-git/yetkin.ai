-- Faz 1 — Tek stok gerçeği: approved_stock_qty ← varyant on_hand toplamı
UPDATE commerce_products AS p
SET approved_stock_qty = COALESCE(v.total, 0),
    updated_at = CURRENT_TIMESTAMP
FROM (
  SELECT product_id, SUM(on_hand_qty)::int AS total
  FROM commerce_variants
  GROUP BY product_id
) AS v
WHERE p.id = v.product_id
  AND p.approved_stock_qty IS DISTINCT FROM COALESCE(v.total, 0);
