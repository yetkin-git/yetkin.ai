# Tedavi 11 — Nihai canlıya geçiş mührü (seremoni)

| Alan | Değer |
|------|--------|
| Tür | Seremoni belgesi (insan SSOT) |
| Tarih | 16 Ağustos 2026 |
| Gövde | `yetkin_rail` |
| Anayasa | `docs/ANAYASA.md` |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Depo | `docs/08_STORAGE_CONTRACT.md` |
| D3 | `docs/07_tedavi_raporu_d3_nihai_muhur.md` |

Bu dosya **seremoni** belgesidir. Runtime bayrağı değildir. `GET /api/health` JSON’u `phase` **taşımaz**; sağlık yanıtına, env’e veya koda sahte `phase` yazılmaz. Migrasyon klasör adları tarihsel izdir; canlı süreç “faz numarası” basmaz.

Beş dikey oda (Akademi, Freelancer, Yetkinİlan, Studio, DevLabs) ve kenar JWKS/CSP **kodda** mühürlüdür. Bu belge o kalkanın operatör tarafını dürüst anlatır. Kurumsal altıncı vitrin diye açılmaz. On üçüncü oda yasaktır. S43: nakit PayTR ile girer, 12 odada harcanır, bankaya çıkış yoktur.

---

## 1. `ops:migrate` ne yapar, ne yapmaz

```
npm run ops:migrate
```

(`ops:init` aynı betik.)

**Yapar:** Direct `:5432` biçim + TCP ön kontrolü; `prisma migrate deploy` (şema + Studio `data_base64` CHECK + `http_idempotency_records` + D2 halkası); kilitli **yedi** SQL sırayla (auth sync, FORCE RLS, sahip SELECT, katalog tohumu, akademi seed, e-posta update, freelancer seed); post-apply mühürler.

**Yapmaz:** `supabase/storage/studio-assets.sql` bu listede **yoktur**. Bucket + `storage.objects` RLS `ops:migrate` ile gelmez. İzleme tablosu icat edilmez. Havuz `pooler.supabase.com` ve port **6543** yeşil boyanmaz.

Atlanan bucket adımı “Studio bozuk” değildir: nesne depo bağlanmamıştır; görsel üretim dürüst 4xx/503 verir, debit durur.

---

## 2. Dashboard — `studio-assets.sql`

Bucket SQL **Dashboard SQL Editor** (Storage) adımıdır:

1. `npm run ops:migrate` yeşil olmadan bucket SQL çalıştırılmaz (Prisma metadata kolonları migrate ile gelir).
2. Dashboard → SQL Editor → `supabase/storage/studio-assets.sql` içeriğini uygula.
3. Bucket adı `studio-assets`, `public = false`. Path `{userId}/{generationId}.{png|jpg|webp}`.
4. RLS: `auth.uid()` klasör sahibi; `service_role` JS anahtarı yoktur.
5. Kör `data_base64` DROP yoktur. Eski `inline-base64` satırlar okunur.

Bu adım `EXPECTED_SQL` yedisine eklenmez. Şişirme yasaktır.

---

## 3. Storage CORS — dürüst bağ

Kod CORS yazmaz. Operatör Dashboard’da yazar; duman `npm run ops:storage-cors`.

| Alan | Değer |
|------|--------|
| Allowed Origins | yalnız `NEXT_PUBLIC_APP_URL` origin (path / trailing slash yok) |
| Allowed Methods | **PUT** (preflight OPTIONS örtük) |
| Yasak | `Access-Control-Allow-Origin: *`, ek origin, GET/HEAD/POST/PATCH/DELETE |

Joker origin duruyorsa imzalı PUT bağlanmamalı; debit durur. Kamu GET / CDN yoktur; tezgâh imzalı GET kullanır.

---

## 4. Canlıya çıkış sırası (seremoni checklist)

1. `.env.example` → `.env.local` (`verify:no-secrets`; `service_role` yok).
2. `DATABASE_URL` + `DIRECT_URL` = `db.<ref>.supabase.co:5432`.
3. `npm run ops:migrate`.
4. Dashboard SQL Editor: `supabase/storage/studio-assets.sql`.
5. Storage CORS: origin = `NEXT_PUBLIC_APP_URL`; metod yalnız PUT. `npm run ops:storage-cors`.
6. `/register` → UUID → `SUPER_ADMIN_USER_ID` → süreç yeniden.
7. PayTR webhook + Inngest çift anahtar + Redirect URLs (`/auth/callback`, `/sifre-yenile`).
8. `GET /api/health` 200; JSON `phase` taşımaz. Inngest `configured`.

Üretimde `PAYTR_SANDBOX` / mock checkout / boş `INNGEST_SIGNING_KEY` / boş `INNGEST_EVENT_KEY` fail-closed’dır.

---

## 5. Bu mühür ne değildir

- Yeni oda, Redis, Socket, GİB, çekim, Turnstile açılmaz.
- Health veya dashboard’a `phase` alanı yazılmaz.
- `ops:migrate` yeşili “Studio bağlı” demek değildir — bucket + CORS ayrıdır.
