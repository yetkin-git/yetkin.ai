# 08 — Studio Storage Sözleşmesi

İnsan + kod SSOT. Uygulama yüzeyi: `lib/studio/storage.ts`. Bucket SQL: `supabase/storage/studio-assets.sql`. Anayasa: `docs/ANAYASA.md`. Ops: `docs/07_OPS_RUNBOOK.md`.

Ürün kodu bu dosyayı import etmez. `service_role` JS anahtarı yoktur.

---

## Taşıyıcı

Yeni üretim varsayılanı `kind: "object-store"`. Eski satırlar `inline-base64` **okunur**; kör `data_base64` DROP yoktur.

| Alan | Değer |
|------|--------|
| Bucket | `studio-assets` (public = false) |
| Path | `{userId}/{generationId}.{png\|jpg\|webp}` |
| Mime allowlist | `image/png`, `image/jpeg`, `image/webp` |
| İmza | Vatandaş JWT + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| PUT | `createSignedUploadUrl` → imzalı PUT (TTL 300 sn) |
| GET | Kısa ömürlü imzalı GET. Kamu URL / CDN yok |
| Prisma | `content_hash`, `byte_size`, `object_path`, `storage_kind`, `bucket` |
| Yeni satır gövdesi | `data_base64` boş string (`STUDIO_EMPTY_DATA_BASE64`) |

Gateway yoksa `createObjectStoreStudioAssetStorage()` fail-closed **503** — “nesne depo bağlı değil”. Debit çağıran katmanda durur.

---

## Tavan

| Sabit | Sayı | Anlam |
|--------|------|--------|
| `STUDIO_IMAGE_DATA_BASE64_MAX_CHARS` | **2097152** | Postgres TEXT CHECK (`studio_digital_assets_data_base64_max_chars`) |
| `STUDIO_IMAGE_DECODED_MAX_BYTES` | **1572864** | Decoded bayt; bucket `file_size_limit` aynı |
| Aşım | HTTP **413** | Debit yok |

Bayt tavanı Base64 tavanının 3/4’üdür. `assertStudioByteSize` / `assertStudioImagePayloadCeiling` aynı kapıyı kilitler.

---

## Yetki — `auth.uid()` ; `service_role` yok

`SUPABASE_SERVICE_ROLE_KEY` kod ve env’de **yoktur**. Storage istemcisi anon key + `Authorization: Bearer` vatandaş JWT.

`storage.objects` RLS (`TO authenticated`, `TO anon` yok):

- SELECT / INSERT / UPDATE: `bucket_id = 'studio-assets'` **ve** `(storage.foldername(name))[1] = auth.uid()::text`
- **DELETE yok:** vatandaş nesneyi Storage’dan silmez
- Path traversal (`..`, `//`) ve başkasının `{userId}/` öneki `assertStudioObjectOwnerPath` ile 403

SQL `GRANT` tetikleyici `EXECUTE` ile karıştırılmaz. Prisma yazma postgres rolündedir; Storage nesnesi vatandaş JWT ile iner.

---

## `ops:migrate` bucket SQL taşımaz

`npm run ops:migrate` kilitli **yedi** SQL + Prisma deploy uygular. `supabase/storage/studio-assets.sql` bu listeye **eklenmez**.

Bucket + RLS **Dashboard SQL Editor** (Storage) adımıdır. Prisma metadata kolonları `prisma migrate deploy` ile gelir.

Atlanırsa görsel üretim dürüst 4xx/503 verir; “Studio bozuk” sanılmamalı — bağlanmamıştır.

---

## CORS

Dashboard → Storage → Configuration (veya `studio-assets`) → CORS. Kod SSOT: `lib/studio/storage.ts` (`assertStudioStorageCorsHeaders`). Operatör dumanı: `npm run ops:storage-cors`.

| Alan | Değer |
|------|--------|
| Allowed Origins | yalnız `NEXT_PUBLIC_APP_URL` origin (ör. `http://localhost:3000`). Path / trailing slash yok |
| Allowed Methods | **PUT** (preflight OPTIONS örtük) |
| Allowed Headers | `content-type`, `x-upsert` |
| **Yasak** | `Access-Control-Allow-Origin: *`, ek origin, GET/HEAD/POST/PATCH/DELETE/TRACE/CONNECT, kamu GET, CDN |

Yetkisiz kök (`https://evil.example`) joker veya yansıyan origin almaz (`assertStudioStorageCorsRejectsForeignOrigin`).

`next.config.ts` ve `proxy.ts` Storage CORS yazmaz. `.env` içinde `API_CORS_ALLOWED_ORIGINS` yoktur. Joker canlıda duruyorsa imzalı PUT bağlanmamalı; debit durur.

---

## Akış (imzalı PUT)

1. `POST /api/studio/storage/sign-upload` (`auth = "session"`) — mime, `byte_size`, `content_hash` (SHA-256 hex). Prisma pending satır; `createSignedUploadUrl`.
2. İstemci imzalı URL’ye PUT (tavan 1572864, allowlist mime).
3. `POST /api/studio/storage/confirm` — nesne `info` ile `byte_size` / mime doğrulanır; `storage_confirmed_at` mühürlenir.
4. Tezgâh imzalı GET. Next gövdeyi proxy etmez.

Mühürlü satırın hash / mime / path’i değişmez (409).
