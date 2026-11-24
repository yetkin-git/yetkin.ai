# E-Ticaret Faz 5 — Sipariş masası, etiket ve plan kapıları

Tarih: 23 Kasım 2026.

Bu faz sipariş yaşam döngüsünü, mağaza logolu barkod etiketini ve üç kademeli plan kapısını mevcut mühürlere bağlar. Stok defterine ciro yazılmaz. Pazaryeri satış tutarı abonelik satırına işlenmez.

## Ne eklendi

- `commerce_fulfillment_orders`: kanal, dış sipariş no, alıcı, kargo, kalemler, tutar (kuruş), durum (`NEW` → `PREPARED` → `SHIPPED` → `DELIVERED`, ayrıca `CANCELED`).
- `commerce_stores`: `logo_url`, `sender_title`, `sender_phone`, `sender_address`, `plan_code`. Eski satırlar `GROWTH` kalır; kapı bu yüzden mevcut lisansı daraltmaz.
- Trendyol ve Hepsiburada sipariş çekimi ile kanal webhook / simülasyon, siparişi `NEW` olarak masaya yazar. Masa yazılamazsa stok çekimi düşmez.
- Kokpitte **Sipariş & Kargo** sekmesi: üç sütun, tek etiket, toplu etiket, depo toplama listesi, gönderici çekmecesi.
- Code 128B SVG (`lib/commerce/barcode-svg.ts`). 100×100 mm termal ve A4 yerleşimi `components/commerce/shipping-label-sheet.tsx` içindedir.
- Planlar: Başlangıç 199000 kuruş, Büyüme 399000 kuruş, Kurumsal 799000 kuruş. Katalog satırı varsa vitrin onu basar; satır yoksa açılış tutarı basılır. İlk 30 gün denemesi `TRIAL_COPY` üzerinden durur.

## Kapılar

| Kapı | Sonuç |
| --- | --- |
| `npx tsc --noEmit` | OK (çıkış 0) |
| `npm run verify:sen-axis` | OK — 549 dosya |
| `npm run verify:boundaries` | OK |
| `npm run verify:api-auth -- --check` | OK — 156 rota |
| `npm run verify:rls-status` | OK — `commerce_fulfillment_orders` sicilde |
| `npm run verify:no-secrets` | OK |
| `npx vitest run tests/commerce tests/tezgah` | OK — 47 dosya, 366 test |
| `npx next build` | OK — derleme 45s, TypeScript 64s, 184 sayfa |

## Rota ve sahiplik

Yazma rotaları `export const auth = "session"`, `Idempotency-Key` ve mağaza `owner_user_id` kontrolü taşır.

- `GET /api/commerce/stores/[storeId]/orders`
- `PATCH /api/commerce/stores/[storeId]/orders/[orderId]/status`
- `POST /api/commerce/stores/[storeId]/orders/bulk-label` — Kurumsal plan
- `PATCH /api/commerce/stores/[storeId]/label-settings`

`commerce_fulfillment_orders` göçü `FORCE ROW LEVEL SECURITY` ve `rls_deny_unscoped` (`USING (false)`) kurar. PostgREST yazma politikası üretilmez.

## Plan davranışı

- Başlangıç: 1 mağaza, 1 pazaryeri, 250 SKU. Rekabet motoru, ikinci mağaza ve toplu etiket `403` döner.
- Büyüme: 3 mağaza, rekabet, set, kampanya, radar, CSV. API rakip beslemesi ve toplu etiket kapalıdır.
- Kurumsal: mağaza ve SKU sınırı yok; toplu etiket ve rakip beslemesi açıktır.
- Kargoya verme takip kodu ister. Bildirim kayda alınır ve yanıtta `cargoNotice` olarak döner; pazaryerine uydurma HTTP çağrısı yapılmaz.

## Uygulama notu

Göç dosyası `prisma/migrations/20261123180000_faz5_fulfillment_orders/migration.sql` idempotenttir. Canlı veritabanına bu turda uygulanmadı. Masa ve üç katalog satırı (`commerce/starter`, `commerce/growth`, `commerce/scale`) göç çalışınca açılır.
