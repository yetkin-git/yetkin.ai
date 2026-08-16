# D3 nihai mühür — üç halka operatör sözleşmesi

| Alan | Değer |
|------|--------|
| Tür | Operatör mührü (insan SSOT) |
| Tarih | 16 Ağustos 2026 |
| Gövde | `yetkin_rail` |
| Anayasa | `docs/ANAYASA.md` |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Seremoni | `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` |
| Kod kanıtı | `tests/helpers/three-ring-journey.ts`, `tests/kernel/three-ring-e2e-surface.test.ts` |

**Üç halka** tek vatandaş kimliğinde kapanır: öğrenme (akademi `rail-temel` → müfredat → sınav ≥70 → sertifika) → kanıt (kariyer vizesi / pasaport doğrula) → kazanç (freelancer emanet serbest + kurumsal teklif kapısı). Bellek yüzeyi yeşili üretim sayılmaz; canlı duman ayrı ops adımıdır.

Bu mühür **fail-closed** durur: boş sır, havuz portu, joker CORS, boş Inngest anahtarı “şimdilik aç” ile yeşil boyanmaz.

---

## 1. Tek süreç sözleşmesi

HTTP hız tavanı süreç-içi bellek `Map`’tir (`lib/kernel/security/http-rate-limit.ts`): cüzdan yükleme + auth IP.

**Dürüst tavan:** tek Node süreci (tek VM / tek `next start`). İkinci replica aynı IP kotasını görmez — sessiz delik.

Yatay ölçek bu mühürde yoktur. İkinci instance açılmaz. Paylaşılan store sonraya bırakılır; o karar verilmeden replica çoğaltılmaz.

---

## 2. Redis yok

Redis / Upstash bu gövdede **yoktur**. `.env.example` `REDIS_URL` taşımaz. Arena taşıması HTTP + Inngest’tir; Socket.IO yoktur.

“Ölçek için Redis ekle” bu mühürü bozar. Önce tek süreç sözleşmesi; sonra (ayrı onay) paylaşılan tavan. Kör müze `lib/redis/` kopyası yasaktır.

---

## 3. Direct `:5432`

`ops:migrate` ve runtime Direct session-mode ister:

- Host: `db.<ref>.supabase.co`
- Port: **5432**
- Yasak: `pooler.supabase.com`, port **6543**, transaction-mode pooler

Havuz `FOR UPDATE` / `$transaction` kilidini düşürür; P1001 havuzla yeşil boyanmaz.

Direct host çoğu projede yalnız AAAA (IPv6) yayınlar. Operatör makinesinde IPv6 yoksa `getaddrinfo ENOENT` / `P1001` **fail-closed** durur. Yol: IPv4 add-on veya makinede IPv6 rota. Yol C yasak: URI’yi `:6543` yapmak.

Protokol: `docs/07_OPS_RUNBOOK.md` §2.1 (`DIRECT_PORT_OPERATOR_PROTOCOL`, `Test-NetConnection`).

---

## 4. Inngest çift anahtar — runbook prensibi

Uygulama id `yetkin-rail`. Serve `/api/jobs/inngest`.

Üretimde **çift anahtar** zorunlu: `INNGEST_EVENT_KEY` **ve** `INNGEST_SIGNING_KEY`. İkisinden biri boşsa `serve()` açılmaz; GET/POST/PUT **503**. Sahte event gövdesi handler’a inmez.

`INNGEST_DEV` üretimde bypass etmez. Geliştirmede boş anahtar yerel Dev’e aittir; üretim kilidini açmaz.

İşler: PayTR valör (30 dk), emanet TTL, Arena tur. Boş imzada PENDING birikir; “işler çalışıyor” denmez.

Runbook: `docs/07_OPS_RUNBOOK.md` §5.

---

## 5. D2 halkası (migrate mühürleri)

Direct `:5432` üzerinde sırayla durur:

1. `20260816020000_academy_lesson_completions`
2. `20260816030000_d2_2_curriculum_seal_certificate_hash`
3. `20260816040000_d2_3_corporate_job_offers`

Disk klasörü yoksa `ops:migrate` fail-closed. Storage CORS joker (`*`) yasak; Inngest boş anahtarda 503.

---

## 6. Bu mühür ne kapatmaz

Canlı Auth + gerçek PayTR dumanı bu dosyanın varlığı değildir. Bellek üç halka yeşili “üretimde nakit aktı” iddiası taşımaz. T2 omurga bağlama (`ops:migrate`, bucket SQL, CORS, PayTR, Inngest Cloud) ayrı adımdır.
