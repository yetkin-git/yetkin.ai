# 07 — Ops Runbook (indeks)

İnsan ops SSOT indeksi. Anayasa: `.system_docs/ANAYASA.md`. Ürün kodu bu dosyayı import etmez. Credential icat edilmez.

**Canlı reçete:** Motor 4 / Kamu Vitrini 3 Oda (Panel, Akademi, Kariyer) + çekirdek yetenekler (`/profil`, `/cuzdan`, `/pasaport`, `/admin`). Freelancer motor sicilinde durur; kamu yüzeyi **410**. Akademi mühürlü yayın **8**’dir (`01_office_ai-1`, `01_office_ai-k1`, `01_office_ai-2`, `01_office_ai-3`, `01_office_ai-5`, `01_office_ai-g1`, `01_office_ai-w1`, `01_office_ai-6`). Dron T3 Akademi yüzeyi bağlıdır; Tezgâh donuk. Video katmanı terk edilmiştir. Motor 2 keşif fazındadır.

`LIVE_BROADCAST_SHUTDOWN` üretim kilidi 13 Eylül 2026 itibarıyla **kapalı** (varsayılan `false`; acil kapatma env `true|1`). `SITE_MAINTENANCE_FREEZE` ayrı bakım bayrağıdır.

## Parçalar

| Parça | Dosya | İçerik |
|-------|--------|--------|
| Veritabanı ve bağlama | [`ops/ops-db.md`](ops/ops-db.md) | Env, Direct Port, Super Admin, migrate, katalog, RLS, sağlık, T3, KVKK, TTS bağları |
| PayTR | [`ops/ops-paytr.md`](ops/ops-paytr.md) | Merchant ≠ Split, Bildirim URL, HMAC, `TRUSTED_PROXY_HOPS`. Canlı tanık: 18 Eylül 2026, ₺15,00 CLEARED |
| Inngest | [`ops/ops-inngest.md`](ops/ops-inngest.md) | Çift anahtar, valör, emanet TTL, 503 çıkış |
| Dron | [`ops/ops-dron.md`](ops/ops-dron.md) | CORS, hop sicili, Closed Testing (T3), 426 |

Akademi makbuzu `academy-receipt-mail.ts` üzerinden SMTP env’ine bağlıdır. SMTP boşsa **SMTP skipped**; nakit durmaz.

Faz 0: Akademi Canlı T3 Testi Prosedürü `ops-db.md` içindedir. PayTR Bildirim URL: `https://yetkin.ai/api/paytr/callback`. Kanonik handler: `/api/payments/webhooks/paytr`.

v1 hop SSOT: `RAIL_V1_HOPS`, **16 kayıt** (`@yetkin/kernel` hop meta + Amiral Zod). Yazma hop’ları dron Bearer ile tüketilebilir; native IAP yoktur. Cüzdan yükleme HMAC `/kasa` pasaportudur.

Closed Testing reçetesi T3 B2C (`ops-dron.md`). Tezgâh yüzeyi izole; Split ayrı idari kapıdır. Mağaza binary: `apps/rail-is/eas.json` (CI eas yok). İnceleme: `.system_docs/DRON_CLIENT_SPEC.md` + `docs/DURUM.md`.
