# TEDAVİ RAPORU — Faz 1 Stratejik Hizalama

| Alan | Değer |
|------|--------|
| Tarih | 9 Eylül 2026 |
| Kaynak | `docs/Tespit_Raporu.md` |
| Muhatap | SUPER ADMIN / Kurucu irade |
| Kapsam | B Katmanı, Manifesto, Pedagoji, Ops, kamu sözleşmesi. **A1–A5 gevşetilmedi.** |
| Üslup | Ne yapıldı, ne duruyor, ne operatör işidir. Yeşil boyama yok. |

Bu belge tedavinin sicilidir. Tespit raporu teşhistir; önceki PayTR B2C yüzey kilidi `docs/Raporlar/TEDAVI_RAPORU.md` içindedir. Bu tur **zaman kipi** ve kamu sınıflandırmasıdır.

---

## Yönetici özeti

Kod zaten Faz 1’deydi: kamu vitrin 3 oda, `/freelancer` ve `/junior` kenar **410**, `MARKETPLACE_SPLIT_LIVE = false`, PayTR Merchant tek canlı tahsilat portu. Belgeler hâlâ “dört oda eşit omurga / freelancer ilan çalışır / Akademi makbuzu yok” diyordu. Ajan ve insan Faz 2’yi gün 0 sanıyordu.

Bu tur belgeler ve dış sözleşmeyi koda eşitledi. A Katmanı (`amountMinor`, tek `LedgerEntry`, S43 çekim yasağı, RLS/IDOR, satın alınamaz mühür, sahte bakiye yasağı) **dokunulmadı** — A2 Freelancer cümlesine yalnız “Faz 2; lisanslı Split bağlıysa uygulanır” zaman kipi eklendi.

**Hüküm:** Sınıflandırma sapması kapandı. Canlı nakit tanığı ve Production SMTP bu makineden doğrulanmadı; o katman SUPER ADMIN operasyonudur.

---

## 1. Doküman zaman kipi

### 1.1 `.system_docs/ANAYASA.md`

| Madde | Müdahale |
|-------|----------|
| A1, A3, A4, A5 | **Dokunulmadı.** |
| A2 Freelancer tahsilatı | Başa şerh: **Faz 2; lisanslı Split bağlıysa uygulanır.** Usta netinin cüzdana CREDIT yasağı durur. Fail-closed durur. |
| B2 | Faz 1 kamu vitrini Panel + Akademi + Kariyer. Freelancer motor sicilde, kamu 410, nakit iddiası yok. Dört oda omurga **hedefi**; eşit canlılık yoktur. |
| B5 | Faz 1 nakit kanalı PayTR Merchant. Split ayrı faz, ayrı sözleşme; Merchant onayı Split izni değildir. |

### 1.2 `.system_docs/MANIFESTO.md`

- Bölüm başı ve Kural 1: **Faz 1 çalışan vitrin 3 oda; 4. oda (Freelancer) kilitli motordur.**
- §1.3: Birincil kitle **B2C Öğrenen / Kart Sahibi**. İşveren **Faz 2 alıcısı**.
- Kural 2: vizyon/motor sicili; Faz 1’de canlı kapı diye okunmaz.
- Kural 3 / Motor 3: “ilan ve teklif açık” cümlesi kaldırıldı. Bugün kamu **410**, Split **503**.

### 1.3 `.system_docs/PEDAGOJI.md`

`/junior` 18 yaş altı / veli ürünüdür, `JUNIOR_PRODUCTION_LOCKED`, kenar 410. Başlangıç seviyesi Akademi içi **Temel Paketler**’dir (§F.3). `01_office_ai` kitlesel temel hattır. Junior oda ≠ başlangıç seviyesi.

### 1.4 `.system_docs/OPS_RUNBOOK.md`

- “Çalışan 4 oda” → **Motor 4 / Kamu Vitrini 3 Oda (Panel, Akademi, Kariyer)**.
- SMTP: Akademi makbuz kuyruğu `lib/kernel/notice/academy-receipt-mail.ts` kodda vardır; canlı gönderim `NOTICE_SMTP_HOST` / `NOTICE_MAIL_FROM` çiftine bağlıdır. Boşsa dürüst skip, nakit durmaz.
- Mühürlü WAV **2** → **6** (`STORAGE_CONTRACT.md` ile aynı).
- §12: kamu mutlu yol 3 oda; `/freelancer` ve `/junior` 410.
- §17: hop tablosu 16 → **8** (OpenAPI gerçeği). Marketplace tag yok.
- §19: Pedagoji’nin işaret ettiği TTS fırınlama SOP (6500 ms RPM, `expandAcademyTtsSkipPreventer`).

### 1.5 Kök `README.md` ve `.system_docs/README.md`

Kamu ilk okuma yüzeyi “freelancer ilan çalışır” iddiasını taşıyordu. Motor 4 / vitrin 3 ve PayTR Merchant asıl kanal olarak düzeltildi.

---

## 2. Mimari ve sözleşme

Kod kilidi **zaten mühürlüydü**; bu tur doğruladı ve kamu sözleşmesine yazdı.

| Kilit | Değer | Yer |
|-------|--------|-----|
| `FREELANCER_PUBLIC_SURFACE_LOCKED` | `true` | `lib/kernel/compliance/circuit-breakers.ts` |
| `JUNIOR_PRODUCTION_LOCKED` | `true` | aynı |
| `MARKETPLACE_SPLIT_LIVE` | `false` | `lib/kernel/payments/marketplace-split-live.ts` |
| Payments port id | `"merchant"` | `lib/kernel/payments/port.ts` |
| Kamu nav | `dashboard`, `academy`, `career` | `WORKING_SHELL_NAV_ROOM_IDS` |
| Sitemap | `/academy`, `/career` | `PRODUCT_ROOM_PATHS` |
| Kenar | `/freelancer`, `/junior` → **410** | `proxy.ts` + `isFrozenShellPagePath` |

OpenAPI (`lib/kernel/http/v1-contract.ts` + `openapi-v1.json`):

- Tag’ler yalnız **Kernel / Proof / Payments**. `Marketplace` tag’i yok.
- `paths` içinde freelancer / client hop yok (8 hop).
- `info.description`: “Faz 1 kamu sözleşmesi B2C’dir; Marketplace tag’i ve freelancer path’leri yayınlanmaz.”
- Payments tag: Faz 1 tek nakit kanalı PayTR Merchant iFrame (`/api/wallet/top-up`); Split yayınlanmaz.
- İç bounded-context adı (`marketplace`) ve Zod DTO aynası (`FreelancerContractView` vb.) **bilinçli durur** — handler/IDOR/Faz 2 geri dönüş.

Yasal gövde (`LEGAL_ACTIVITY_SCOPE_BODY`) zaten B2C dijital eğitim / sınav / sertifikasyon; emanet / usta IBAN yok. Bu tur onu yeniden yazmadı.

---

## 3. Değişen dosyalar

| Dosya | Tür |
|-------|-----|
| `.system_docs/ANAYASA.md` | B2 + A2 zaman kipi + B5 Merchant |
| `.system_docs/MANIFESTO.md` | 1.3, Kural 1–3, Motor 3 |
| `.system_docs/PEDAGOJI.md` | Junior ≠ Temel paket |
| `.system_docs/OPS_RUNBOOK.md` | Vitrin 3, SMTP, WAV 6, 8 hop, §19 |
| `.system_docs/README.md` | Motor 4 / vitrin 3 |
| `README.md` | Kamu vitrin tablosu |
| `lib/kernel/http/v1-contract.ts` | OpenAPI açıklama + Payments tag |
| `lib/kernel/http/openapi-v1.json` | `generate:openapi-v1` |
| `lib/kernel/payments/marketplace-split-live.ts` | Faz 1 şerhi |
| `lib/kernel/payments/port.ts` | Merchant asıl kanal şerhi |
| `scripts/verify-boundaries.ts` | Yorum: Motor 4 |
| `tests/kernel/faz1-operating-picture-surface.test.ts` | **yeni** mühür |
| `tests/kernel/circuit-breakers-surface.test.ts` | `/junior` 410 |
| `docs/Tedavi_Raporu.md` | bu dosya |

A Katmanı kırmızı çizgi gövdesi, Prisma şema, escrow motoru, `lib/freelancer` **silinmedi**.

---

## 4. Doğrulama

Bu makineden Production secret, PayTR panel ve SMTP çıkışı **okunmadı**.

| Kontrol | Sonuç |
|---------|-------|
| `tests/kernel/faz1-operating-picture-surface.test.ts` | 6/6 geçti |
| `tests/kernel/circuit-breakers-surface.test.ts` | 6/6 geçti |
| `tests/kernel/verify-v1-contract.test.ts` | 5/5 geçti |
| `tests/kernel/v1-hop-gate-surface.test.ts` | 6/6 geçti |
| `tests/kernel/kanoniklestirme-surface.test.ts` | 6/6 geçti |
| `tests/kernel/legal-launch-surface.test.ts` | 12/12 geçti |
| `tests/academy/production-standard.test.ts` | 2/2 geçti |
| `tests/kernel/system-docs-contract-surface.test.ts` | 3/3 geçti |
| `npm run verify:v1-contract-artifacts` | OpenAPI + Dron tipleri OK |

Kilit gerçekleri (test): `FREELANCER_PUBLIC_SURFACE_LOCKED === true`, `JUNIOR_PRODUCTION_LOCKED === true`, `MARKETPLACE_SPLIT_LIVE === false`, `paymentsPort.id === "merchant"`, `RAIL_V1_HOPS.length === 8`, OpenAPI tag listesi `["Kernel","Proof","Payments"]`.

---

## 5. Cursor’a özel sorular — dürüst cevap

### 5.1 6493 ve PayTR Merchant açısından canlıya çıkış direnci sıfırlandı mı?

**Hayır.** Belge ve kamu sözleşmesi artık incelemecinin “pazaryeri” okumasını **beslemiyor**; bu sınıflandırma direncini düşürür. Sıfırlamaz.

Hâlâ açık olanlar:

1. **Hukuk:** Bu rapor avukat/BDDK mütalaası değildir. 6502 cayma / anında ifa, kullanılmamış bakiye iadesi, sicil unvanı–NACE–fiili faaliyet üçlüsü bağımsız hukuk görüşü ister.
2. **Nakit halkası:** Merchant üçlüsü + Bildirim URL + ilk gerçek `PaymentOrder=CLEARED` + `LedgerEntry CREDIT` bu makinede tanık değil. Kod hazır ≠ mağaza canlı.
3. **SMTP:** Makbuz kodu vardır; Production env dolu değilse chargeback dosyası boş kalır.
4. **İç “cüzdan” kelimesi:** Kapalı devre ön ödeme olarak duruyor; dilekçe dilinde “ön ödemeli bakiye” tercih edilmeli. Kod adı değişmedi.

Freelancer kamu 410 + Split stub, Model C’yi (lisanssız emanet) teknik olarak doğurtmaz. Bu **doğru mimari**dir; lisans belgesi değildir.

### 5.2 Son mühür / onay öncesi TEK kritik adım

**PayTR Merchant canlı üçlüyü Production’a yazıp Bildirim URL’yi `https://yetkin.ai/api/paytr/callback` yapmak ve küçük tutarlı gerçek kartla T3 halkasını kapatmak** (`CLEARED` → bir SKU DEBIT → mümkünse sınav ≥70 → `/academy/dogrula`).

Bu halka yoksa site vitrindir, dükkân değil. SMTP ikinci sıradadır; Split / Freelancer / Junior / Dron **bu mühürden önce konuşulmaz**.

### 5.3 Platform kurgusu — son durum

Kurgu **doğru, erken şişirilmişti; belgeler artık şişirmeyi “şimdi” diye satmıyor.**

Amiral + shared kernel bir B2C eğitim dükkânını taşır. Freelancer motoru ve Split **Faz 2 yedek motor** olarak durmalı — silinmemeli, açılmamalı. Junior oda çocuk ürünüdür; Temel paket Akademi’dedir. Sürü Dron donuk kalmalıdır.

Eksik olan mimari hayal değil: canlı nakit tanığı, gerçek SMTP makbuzu, ve `01_office_ai` vaat disiplini.

---

## 6. Karar kaydı (bu tur uyguladı)

1. A Katmanı kilit. Yalnız A2 Freelancer cümlesine Faz 2 zaman kipi.
2. Faz 1 kamu vitrini 3 oda. 4. oda kilitli motor. Junior üretim kilitli.
3. Faz 1 birincil kitle B2C öğrenen / kart sahibi. İşveren Faz 2 alıcısı.
4. Kamu sözleşmesi Marketplace lansmanı taşımaz. İç kod adı durur.
5. PayTR Merchant Faz 1 tek kamu nakit kanalı. Split ayrı sözleşme.
6. Canlıya çıkış operasyonu (T3 + SMTP) SUPER ADMIN işidir; bu tur onu yeşile boyamaz.

---

*Çelişkide `.system_docs/ANAYASA.md` A Katmanı bağlayıcıdır. `/docs` build fixture değildir.*
