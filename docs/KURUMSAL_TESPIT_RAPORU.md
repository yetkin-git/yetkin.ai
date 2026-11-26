# KURUMSAL (/kurumsal · /ilan) — BAĞIMSIZ B2B DENETİM RAPORU

**Denetim türü:** Kanıta dayalı statik + dinamik tespit (Lead Auditor / B2B SaaS & HRTech Ürün Mimarı / AppSec)
**Kapsam:** `/kurumsal`, `/kurumsal/ilanlar`, `/ilan/[slug]`, `/api/kurumsal/*`, `/api/lead`, `/api/ilan/*`, `/api/admin/ops/employer-verify`, `/api/admin/b2b`, `components/kurumsal/*`, `lib/sales/*`, `prisma/schema/b2b.prisma`, kenar kapıları (`proxy.ts`, `edge-api-auth.ts`, `circuit-breakers.ts`, `lib/dronlar/kayit.ts`)
**Kural:** Bu denetimde **hiçbir kaynak kod veya şema değiştirilmedi.** Yalnızca okuma + doğrulama komutları çalıştırıldı.
**Tarih:** 2026-11-25
**Sonuç:** **49 / 100** — *Satılamaz durumda.* Ürün mimarisi doğru kurulmuş, ancak ödeme anahtarı kenarda 410 ile kapatılmış; B2B modülü bugün fiilen lisans üretemiyor.

---

## 0. Yönetici Özeti

Kurumsal modülün **iç mantığı** (ağırlıklı puanlama, band sıralaması, oturum e-posta kilidi, RLS, IDOR kapsamı, dürüst `noindex`) sektör ortalamasının üzerinde ve bilinçli yazılmış. Buna karşılık modülün **para ve talep halkası** kopuk:

1. **Lisans üretilemiyor.** `POST /api/kurumsal/satin-al` — ürünün tek tahsilat rotası — kenarda `kurumsal` donmuş odasına çarptığı için **410** dönüyor. Lisans doğuran başka bir yol da yok. Dolayısıyla `POST /api/kurumsal/ilanlar` **her zaman 402** veriyor: bugün hiçbir müşteri ilan açamaz.
2. **Aday bulma yüzeyi yok.** `/ilan` dizin sayfası diskte yok (404), `sitemap.xml` içinde tek bir ilan URL'i yok. Aday ancak işverenin elle kopyaladığı bağlantıyla gelebilir — B2B değer önerisinin ("doğru adayı dakikalar içinde seçin") talep tarafı boş.
3. **İK kokpiti yarım.** Dışa aktarma, manuel durum değiştirme, notlama, ilan kapatma/yeniden açma ve adayla iletişim **yok**. İşveren kısa listeyi ekrandan okuyup elle taşımak zorunda.
4. **KVKK'da sahipsiz veri.** İlan/hesap kapandığında aday PII'si (e-posta, CV özeti, puan) için saklama süresi, temizlik işi veya işveren tarafı silme yolu yok.

Bunların hiçbiri "kötü kod" değil; **halkası kapatılmamış ürün** sorunudur. Aşağıdaki Faz 1 planı 6 kalemde modülü satılabilir hâle getirir.

---

## 1. Bulgu Özeti

| ID | Önem | Başlık | Kanıt |
|---|---|---|---|
| **K-01** | Kritik | Tahsilat rotası kenarda 410; lisans üretilemiyor, ilan açma kalıcı 402 | `lib/dronlar/kayit.ts:13`; `lib/kernel/security/edge-api-auth.ts:85-96`; `app/api/kurumsal/satin-al/route.ts:56` |
| **K-02** | Kritik | Aday PII'si için saklama/silme yolu yok; işveren hesabı kapanınca başvurular kalıcı | `lib/kernel/identity/close-account.ts:46-56`; `lib/career/cv-privacy.ts:29-36`; `lib/kernel/jobs/` (kurumsal işi yok) |
| **K-03** | Kritik | `/ilan` dizini yok + sitemap'te sıfır ilan → talep tarafı keşfedilemez | `app/(public)/ilan/` (yalnız `[slug]`); `app/sitemap.ts:73-82` |
| **Y-01** | Yüksek | Paket kotası yok: tek lisansla **sınırsız** ilan; ilan başına başvuru tavanı yok | `lib/sales/kurumsal-screening-entitlement.ts:36-46`; `lib/sales/kurumsal-screening-load.ts:144-162` |
| **Y-02** | Yüksek | İlan kapatma/yeniden açma rotası yok; `isActive` yalnız `true` yazılıyor | `lib/sales/kurumsal-screening-load.ts:159`; `app/api/kurumsal/**` (PATCH/PUT/DELETE yok) |
| **Y-03** | Yüksek | İşveren doğrulama **ilan başına**; yeni ilan rozeti sıfırlıyor + admin UI yok | `lib/sales/kurumsal-screening-load.ts:156-158,223`; `app/api/(kernel)/admin/ops/employer-verify/route.ts:29`; `components/**` (tetikleyici yok) |
| **Y-04** | Yüksek | Lead kuyruğu çıkmaz sokak: mükerrer kontrolü, bot koruması, yanıtlama, bildirim, 50 satır tavanı | `app/api/lead/route.ts:20-46`; `lib/kernel/admin/kurumsal-offer-load.ts:36-38`; `app/(kernel)/admin/b2b/page.tsx:53-72` |
| **Y-05** | Yüksek | Süresi dolmuş/kapalı ilan **HTTP 200** ile "İlan bulunamadı" basıyor (soft 404) | `app/(public)/ilan/[slug]/page.tsx:35,77-86` (`notFound()` yok) |
| **Y-06** | Yüksek | İK kokpiti: CSV/Excel/PDF export, notlama, manuel durum, aday iletişimi **yok** | `components/kurumsal/screening-cockpit.tsx` (yalnız okuma + kopyala) |
| **Y-07** | Yüksek | `taxNumber` yalnız biçim kontrolü; checksum ve eşsizlik yok | `lib/sales/kurumsal-screening.ts:340-348`; `prisma/schema/b2b.prisma:112` |
| **O-01** | Orta | Kokpit sorgusu sayfasız: tüm ilan + tüm başvuru, 6.000 karakter CV gövdesiyle | `lib/sales/kurumsal-screening-load.ts:229-241` |
| **O-02** | Orta | "Doğrulanmış e-posta" deniyor ama `emailConfirmedAt` denetlenmiyor | `lib/sales/kurumsal-screening-load.ts:350-357`; `lib/kernel/auth/require-session.ts:280-286` |
| **O-03** | Orta | Hız sınırları yalnız handler'da ve IP anahtarlı; kenar tablosunda bu yollar yok | `lib/kernel/security/http-rate-limit.ts:148-173`; ölçüm: 5 yol → `null` |
| **O-04** | Orta | IDOR kontrolü doğru ama **regresyon testi yok** | `tests/kurumsal/**`, `tests/sales/**` (çapraz işveren testi yok) |
| **O-05** | Orta | `/kurumsal` "İK" başlığı altında e-ticaret ajans paketi satıyor; fiyat slotunda "Kurumsal Tanımlama" | `app/(public)/kurumsal/page.tsx:77-79,112-113,130,137-140`; `lib/pricing/showcase-price.ts:19` |
| **O-06** | Orta | Band yazımı her teslimde tüm tabloyu yeniden yazıyor; eşzamanlı teslimde yarış | `lib/sales/kurumsal-screening-load.ts:281-305` |
| **O-07** | Orta | Testler canlı suite'te koşmuyor (`kurumsal` donmuş oda) | `vitest.config.ts:16,38`; `lib/dronlar/kayit.ts:13`; `npm test` çıktısı |
| **D-01** | Düşük | `purpose: { contains: "job-screening-pack" }` gevşek eşleşme | `lib/sales/kurumsal-screening-entitlement.ts:42` |
| **D-02** | Düşük | `Lead` şehir alanı serbest metin; e-posta MX/TEK doğrulaması yok | `app/api/lead/route.ts:33,39` |
| **D-03** | Düşük | `KurumsalOfferRequest` fiyat anlık görüntüsü taşımıyor | `prisma/schema/b2b.prisma:65-76` |

---

## 2. Kanıt Yöntemi

Çalıştırılan doğrulamalar ve sonuçları:

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | **PASS** (exit 0) |
| `npm run verify:api-auth -- --check` | **PASS** — `175 route. {session:110, public:28, closed:11, cron:2, admin:16, webhook:8}` |
| `npm run verify:boundaries` | **PASS** |
| `npm run verify:rls-status` | **PASS** — `kurumsal_job_postings`, `kurumsal_job_applications`, `kurumsal_offer_requests` sicilde |
| `npm run verify:idor-seals` | **PASS** — 5 dosya / 17 test (kurumsal kapsamı **yok**) |
| `npx vitest run tests/sales` | **PASS** — 3 dosya / 24 test |
| `npx vitest run tests/kurumsal` | **0 dosya koştu** — donmuş oda dışlaması (`vitest.config.ts:38`) |
| `npx vitest run --config vitest.frozen.config.ts tests/kurumsal` | **2 FAIL / 11 PASS** — `job-posting.test.ts` 2 kırık (arşiv motoru) |
| `npm run verify:atomic-seals` | **FAIL** — 5 `tests/academy/*` surface dosyası yok (bu denetimle ilgisiz, önceden var) |
| Kenar kapısı ölçümü (`decideEdgeApiAuth`) | `/api/kurumsal/satin-al` → **410**; `/api/kurumsal/ilanlar` → next; `/api/lead` → next |
| Kenar hız sınırı ölçümü (`matchEdgeRateLimit`) | 5 kurumsal/ilan yolu → **hepsi `null`** (kenar sınırı yok) |

> Not: `verify:atomic-seals` kırığı ve `tests/kurumsal/job-posting.test.ts` kırığı **bu denetimden önce** vardı; ikisi de `archived/lib/kurumsal/engine.ts` bağımlılığından kaynaklanır, canlı `/kurumsal` kod yolunu etkilemez. Raporda ayrı bulgu olarak sayılmadı, O-07 altında not düşüldü.

---

## 3. Boyut 1 — B2B Ürün & Satış Hunisi

### 3.1 Vitrin (`/kurumsal`)

Sayfa, niyet ile içerik arasında **konumlandırma çatlağı** taşıyor:

- Başlık `"Kurumsal İK"` / `"Doğru Adayı Günler Değil, Dakikalar İçinde Seçin."` (`app/(public)/kurumsal/page.tsx:77-78`) — HRTech vaadi.
- Ama iki ana satış kartı **e-ticaret ajans** ürünü: `"10 mağaza koltuğu"`, `"E-ticaret ajans paketi"`, `"Trendyol ile Hepsiburada senkronizasyonu"` (`app/(public)/kurumsal/page.tsx:112-121`, `130-137`). İK alıcısının işi değil.
- Fiyat slotunda (`text-3xl`, fiyatın basıldığı yer) `PUBLIC_PREORDER_LABEL = "Kurumsal Tanımlama"` basılıyor (`app/(public)/kurumsal/page.tsx:123-124`, `139-140`; `lib/pricing/showcase-price.ts:19`). Fiyat tipografisiyle **fiyat olmayan bir metin** basmak, "şeffaf fiyat" iddiasıyla çelişir. Dürüstlük bayrağı (`data-price-honesty="planned"`) doğru ama görsel dil yanıltıcı.

**Fiyat şeffaflığı — iyi:** `jobScreening` fiyatı uydurulmuyor, yalnız aktif katalog satırından okunuyor; satır yoksa ön talep etiketi basılıyor (`lib/sales/kurumsal-offers.ts:36-53`). Bu, kod tabanının en disiplinli parçalarından biri.

### 3.2 Dönüşüm akışı — kopuk halka

Form → `POST /api/lead` → `kurumsal_offer_requests` satırı (`app/api/lead/route.ts:45`). Sonrası **yok**:

| Soru | Cevap | Kanıt |
|---|---|---|
| Hız sınırı var mı? | Var — IP başına 5 / 10 dk | `app/api/lead/route.ts:20-26` |
| Bot koruması? | **Yok** — captcha/Turnstile/honeypot yok | `app/api/lead/route.ts` (grep: 0) |
| Mükerrer talep kontrolü? | **Yok** — aynı e-posta+firma sınırsız satır açar | `app/api/lead/route.ts:45` (`create` tek başına) |
| Alan doğrulama? | Var ve istemci/sunucu sınırları **birebir kilitli** | `app/api/lead/route.ts:31-43`; `tests/sales/offer-form-surface.test.ts:31-48` |
| Admin panelde görüntüleme? | Var — **salt okunur**, son 50 satır | `lib/kernel/admin/kurumsal-offer-load.ts:36-38`; `app/(kernel)/admin/b2b/page.tsx:53-72` |
| Yanıtlama / durum / atama? | **Yok** — durum kolonu, `handledAt`, not, e-posta tetikleyicisi yok | `prisma/schema/b2b.prisma:65-76` |

Sonuç: gelen B2B talebi bir **ölü kuyruğa** düşüyor. Ne bildirim, ne otomatik yanıt, ne "işleme alındı" durumu var; 50. satırdan sonrası panelde hiç görünmüyor. Gelir Hunisi'nin en kritik boğazı burası.

> **Y-04.**

---

## 4. Boyut 2 — İlan Oluşturma, Paket Kotası, Ödeme/İade Simetrisi

### 4.1 K-01 — Tahsilat rotası kenarda 410 (Kritik)

Bu, modülün tamamını kilitliyor. Zinciri kanıtla:

**1)** `kurumsal` donmuş disk odası olarak kayıtlı:

```13:13:lib/dronlar/kayit.ts
  "kurumsal",
```

**2)** Kenar, donmuş oda API önekini 410 ile kesiyor — **yalnız** `/api/kurumsal/ilanlar` istisna:

```85:96:lib/kernel/security/edge-api-auth.ts
  // Sayfa yolu `/kurumsal/ilanlar` açıktır. Aynı kokpitin API'si donmuş `kurumsal`
  // önekine takılıp 410 dönmesin. Diğer `/api/kurumsal/*` yolları kapalı kalır.
  if (path === "/api/kurumsal/ilanlar" || path.startsWith("/api/kurumsal/ilanlar/")) {
    return false;
  }
  if (
    (FROZEN_SHELL_ROOM_IDS as readonly string[]).some(
      (id) => path === `/api/${id}` || path.startsWith(`/api/${id}/`),
    )
  ) {
    return true;
  }
```

**3)** `proxy.ts:233` bu kapıyı handler'dan **önce** çalıştırıyor.

**4)** Ölçüm (çalıştırıldı):

```
API /api/kurumsal/satin-al       {"kind":"deny","status":410,"error":"Bu oda üretimde kapalı."}
API /api/kurumsal/ilanlar        {"kind":"next"}
```

**5)** Lisans kapısı yalnız CLEARED sipariş kabul ediyor:

```36:46:lib/sales/kurumsal-screening-entitlement.ts
  const order = await getPrisma().paymentOrder.findFirst({
    where: {
      userId: ownerUserId,
      status: "CLEARED",
      OR: [
        { purpose: KURUMSAL_SCREENING_ORDER_PURPOSE },
        { purpose: { contains: KURUMSAL_SCREENING_UNIT } },
      ],
```

**6)** Bu `purpose`'u üreten **tek** yol `app/api/kurumsal/satin-al/route.ts:56` (`placeSingleCatalogPurchase`). Grep ile doğrulandı: admin grant rotası yalnız Akademi için (`app/api/(kernel)/admin/ops/grant/route.ts`), kurumsal için ikinci üretici yok.

**7)** Sonuç: `createKurumsalJobPosting` her çağrıda `PaymentRequiredError` (402) fırlatır:

```122:130:lib/sales/kurumsal-screening-load.ts
  const entitlement = await assertKurumsalScreeningEntitlement(input.ownerUserId);
  if (!entitlement.ok) {
    throw new PaymentRequiredError(
```

Ayrıca **hiçbir istemci bu rotayı çağırmıyor**: `components/**` içinde `satin-al` geçen tek yer yok. Yani ürün "satın alma" düğmesine sahip değil; olsaydı da 410 yerdi.

Bu, rotanın kendi yorum bloğunun tarif ettiği hatanın **birebir tekrarı**: *"kapı kapanmış, anahtar üretilmemişti"* (`app/api/kurumsal/satin-al/route.ts:24-30`). O rota eklenirken kenar kapısı hesaba katılmamış.

### 4.2 Y-01 — Kotası olmayan lisans

`assertKurumsalScreeningEntitlement` **kullanıcı başına** tek CLEARED sipariş arıyor; kaç ilan açıldığını **saymıyor**. Sonuç:

- 2.900 TL (katalog satırı, `prisma/migrations/20261118230000_kurumsal_ilan_eleme/migration.sql:36` → `v_amount := 290000`) tek seferlik → **sınırsız ilan, süresiz**.
- İlan başına başvuru tavanı yok; `shortlistLimit` yalnız **kaç adayın kısa listeye çıkacağını** belirler (`lib/sales/kurumsal-screening.ts:280-325`), başvuru sayısını sınırlamaz.
- Aynı anda sınırsız aktif ilan: `createKurumsalJobPosting` `isActive: true` ile koşulsuz satır açar (`lib/sales/kurumsal-screening-load.ts:159`), eşzamanlılık kontrolü yok.

Bu, B2B SaaS'ta fiyatlandırma modelinin aşınması: lisans "ilan başına" değil "kişi başına ömürlük". Kota (örn. 3 ilan / dönem) hem gelir hem kötüye kullanım kalkanıdır.

### 4.3 Ödeme simetrisi — tasarım doğru, erişim ölü

Doğru olanlar (kredi verilmesi gerekir):

- Tutar istekten okunmuyor, katalogdan geliyor (`lib/kernel/payments/single-purchase-checkout.ts:113-117`).
- `Idempotency-Key` zorunlu (`app/api/kurumsal/satin-al/route.ts:45-48`).
- Kasa rızası şeması zorunlu (`:52-55`).
- Defter satırı ürün etiketiyle yazılıyor — "Cüzdan yükleme" olarak görünmüyor (`lib/kernel/payments/order-purpose.ts:210-216`).
- Self-servis karta iade **bloke**: kurumsal `purpose` iade listesinde (`lib/kernel/payments/prisma-wallet-card-refund.ts:60-78`).

**Atomiklik notu:** Tahsilat ile ilan aktivasyonu arasında atomik bağ **yok** — ve olmamalı da; lisans `PaymentOrder.status = CLEARED` üzerinden okunuyor, ilan açılışı ayrı bir işlem. Bu, tasarım tercihi olarak doğru. Ancak *"ödedim ama ilan açamıyorum"* durumunda işverene gösterilen çıkış yolu `KURUMSAL_SCREENING_PURCHASE_PATH = "/kurumsal#kurumsal-teklif"` — yani 410 alan rotanın kendisi. Çıkmaz sokak.

---

## 5. Boyut 3 — İK Kokpiti & Aday Değerlendirme

`components/kurumsal/screening-cockpit.tsx` (450 satır) iki sütun: **ilan aç** + **kısa liste**. Olan ve olmayan:

| Yetenek | Durum | Kanıt |
|---|---|---|
| İlan açma (ağırlıklı kriter, baraj, kontenjan, deadline) | **Var**, istemci doğrulaması sağlam | `screening-cockpit.tsx:96-124,187-308` |
| Ağırlıklı puan sıralaması + band etiketleri | **Var** | `screening-cockpit.tsx:41-53,390-441` |
| CV özeti + "doğrulanmamış metin" etiketi | **Var** (dürüst) | `screening-cockpit.tsx:397-406` |
| Mühür doğrulama bağı | **Var** | `screening-cockpit.tsx:432-435` |
| **Dışa aktarma (CSV/Excel/PDF)** | **YOK** | grep `csv|xlsx|Excel|pdf|export` → 0 |
| **Notlama** | **YOK** | kolon yok (`prisma/schema/b2b.prisma:130-151`) |
| **Manuel durum değiştirme** (`SHORTLISTED` vb.) | **YOK** — durum tamamen türetilmiş | `lib/sales/kurumsal-screening-load.ts:281-305` |
| **İlan kapatma/yeniden açma** | **YOK** — mutasyon rotası yok | `app/api/kurumsal/**` (PATCH/PUT/DELETE yok) |
| **Adayla iletişim** | **YOK** — `mailto:` bile yok | grep `mailto|contact` → 0 |
| Aday arama/filtre/sayfalama | **YOK** | `screening-cockpit.tsx:375-443` |

**Y-06** bu tablonun tamamı. İK profesyoneli için "kısa liste" bir ekran değil, dışa aktarılabilir bir dosyadır; bugün ekrandan elle kopyalamak gerekir.

**O-01 (performans/DoS):** Kokpit tek sorguda **tüm** ilanları ve **tüm** başvuruları, `cvSummary` (6.000 karakter) dahil çekiyor:

```229:241:lib/sales/kurumsal-screening-load.ts
  const jobs = await prisma.kurumsalJobPosting.findMany({
    where: { ownerUserId },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
```

100 aday × 5 ilan × 6 KB ≈ 3 MB tek sayfa yüklemesi. Sayfalama yok, `select` yok. Bu hem yavaşlık hem de "tek ilanla tüm İK'yı kilitle" vektörü.

**O-06 (yarış):** `persistBands` her teslimde tüm başvuru setini okuyup durumları yeniden yazıyor (`:281-305`). İki aday aynı anda teslim ederse son yazan kazanır; kısa liste geçici olarak tutarsız görünür. Ayrıca O(n) yazma.

---

## 6. Boyut 4 — Halka Açık İlan Sayfaları & Başvuru Akışı

### 6.1 K-03 — Liste sayfası yok, sitemap'te ilan yok

- Diskte yalnız `app/(public)/ilan/[slug]/page.tsx` var. **`app/(public)/ilan/page.tsx` yok** → `/ilan` 404. Doğrulandı (`Test-Path` → `False`).
- `app/sitemap.ts` içinde `kurumsalJobPosting` okuması **yok**; yalnız statik yollar + kurs + sözlük + rehber + mağaza (`app/sitemap.ts:73-90`).
- `/kurumsal` sitemap'te var (`lib/copy/seo.ts:291`) — yani **satış sayfası** indekslenir, **satılan ürünün çıktısı** (ilanlar) indekslenmez.
- Adayın ilanları görebildiği tek yer `/career` sayfası ve o da **oturum zorunlu** (`app/career/page.tsx:145` `loadCareerJobMatchBoard(session.id)`, yalnız `SignedInCareerPage` içinde).

Sonuç: `JobPosting` JSON-LD üretiliyor (`app/(public)/ilan/[slug]/page.tsx:92-101`) ama o URL'i hiçbir tarayıcı keşfedemiyor. B2B ürünün talep motoru çalışmıyor.

### 6.2 Y-05 — Soft 404: kapalı ilan HTTP 200

```77:87:app/(public)/ilan/[slug]/page.tsx
  if (!job) {
    return (
      <RoomFrame className="px-6 pb-16 pt-10">
        <PageHeader
          eyebrow="Başvuru"
          title="İlan bulunamadı"
          description="Bu başvuru adresi açık bir ilana bağlı değil. Sahte ilan basılmaz."
        />
      </RoomFrame>
    );
  }
```

`notFound()` çağrılmıyor; `loadPublicKurumsalJob` kapalı/süresi dolmuş ilanda `null` dönüyor (`lib/sales/kurumsal-screening-load.ts:274-277`). Sonuç: **kapalı ilan 200 döner**. Arama motoruna "bu sayfa var" denir, adaya "yok" denir. `generateMetadata` bu durumda `index:false` veriyor (`:35-39`) — doğru ama geç; durum kodu yanlış. Ayrıca `app/(public)/ilan/not-found.tsx` de yok.

Kapalı ilan kontrolü **API tarafında doğru**: `startKurumsalJobExam` `isActive` + `deadlineAt` denetliyor (`lib/sales/kurumsal-screening-load.ts:362-368`), `submitKurumsalJobExam` de (`:477-480`). Yani veri bütünlüğü sağlam; sorun yalnız HTTP sözleşmesinde.

### 6.3 Başvuru akışı — bu bölüm güçlü

| Kontrol | Durum | Kanıt |
|---|---|---|
| Mükerrer başvuru | **Var** — `@@unique([jobId, candidateUserId])` + P2002 yarış yakalama | `prisma/schema/b2b.prisma:149`; `lib/sales/kurumsal-screening-load.ts:424-450` |
| Kapanmış ilan | **Var** | `lib/sales/kurumsal-screening-load.ts:362-368,477-480` |
| YetkinCV mührü zorunlu | **Var** — puan yalnız sunucu motorundan | `lib/sales/kurumsal-screening-load.ts:485-511` |
| Oturum e-posta kilidi | **Var** — form e-postası oturumunkinden farklıysa 400 | `lib/sales/kurumsal-screening-load.ts:350-357`; `components/kurumsal/job-apply-gate.tsx:235` (`readOnly`) |
| Hız sınırı | **Var** — 8/10 dk (ama IP anahtarlı) | `app/api/ilan/[slug]/basvuru/route.ts:13-18` |
| Ücretsiz sınav hakkını tüketmeme | **Var** — kurumsal oturumlar ücretsiz kovaya girmiyor | `lib/career/yetkincv-store.ts:126-147` |
| Puan satın alınamaz | **Var** — ödeme rotası puan basmıyor | `app/api/kurumsal/satin-al/route.ts:31-32` (dürüstlük sınırı) |

**O-02:** Kullanıcıya "oturumundaki **doğrulanmış** e-posta" deniyor (`components/kurumsal/job-apply-gate.tsx:234`) ve hata mesajı da öyle (`lib/sales/kurumsal-screening-load.ts:353-355`), ama `emailConfirmedAt` **hiç denetlenmiyor**. `requireSession` yalnız oturum varlığına bakıyor (`lib/kernel/auth/require-session.ts:280-286`). Yani e-postasını doğrulamamış hesap başvurabiliyor — metin ile davranış çelişiyor ve işverene doğrulanmamış iletişim adresi gidiyor.

---

## 7. Boyut 5 — Yetkilendirme, IDOR, RLS & KVKK

### 7.1 IDOR — sağlam

Kontrol ettim, çapraz işveren erişimi **kapalı**:

- Kokpit yüklemesi `ownerUserId` ile filtreli, başvurular yalnız o ilanların `include`'uyla geliyor (`lib/sales/kurumsal-screening-load.ts:231-240`).
- Hiçbir rotada istemciden `jobId` alıp sahiplik denetlemeden dönen yol yok; `GET /api/kurumsal/ilanlar` oturumu `requireSession` ile bağlıyor (`app/api/kurumsal/ilanlar/route.ts:11-17`).
- Aday tarafı: `submitKurumsalJobExam` `sittingId + candidateUserId + job.slug` üçlüsünü birlikte filtreliyor (`lib/sales/kurumsal-screening-load.ts:466-473`).
- `sitting` sahipliği ikinci kez doğrulanıyor (`lib/career/yetkincv-store.ts:210`).

**O-04:** Buna rağmen **çapraz işveren reddi için regresyon testi yok**. `tests/kurumsal/**` ve `tests/sales/**` içinde "başka işveren / other owner / 403" araması 0 sonuç. Kontrol bugün doğru; yarın bozulursa kimse fark etmez. `verify:idor-seals` kapsamında da kurumsal yok (`package.json` → yalnız career/freelancer testleri).

### 7.2 RLS

`verify:rls-status` **PASS**: `kurumsal_job_postings`, `kurumsal_job_applications`, `kurumsal_offer_requests` sicilde; `ENABLE` + `FORCE ROW LEVEL SECURITY` ve `rls_deny_unscoped` (`SELECT ... USING (false)`) migration'larda mevcut (`prisma/migrations/20261118230000_kurumsal_ilan_eleme/migration.sql:67-97`; `20261118260000_kurumsal_agirlikli_eleme/migration.sql:26-29`).

**Doğru okuma:** Prisma `BYPASSRLS` ile bağlanıyor (`supabase/migrations/20260814020000_enforce_rls_all_tables.sql:3`). Yani RLS burada **PostgREST sızıntı kalkanıdır**, uygulama yetkilendirmesi değil. Uygulama yetkisi %100 kodda — bu yüzden 7.1'deki sahiplik filtreleri kritiktir ve bu yüzden O-04 (test boşluğu) önemlidir.

### 7.3 K-02 — KVKK: sahipsiz aday PII'si (Kritik)

Üç ayrı boşluk:

**(a) İşveren hesabı kapanınca başvurular kalıcı.** `closeCitizenAccount` yalnız `user_billing_info` siler, `users` e-postasını anonimleştirir (`lib/kernel/identity/close-account.ts:46-56`). `KurumsalJobPosting` / `KurumsalJobApplication` satırlarına dokunmaz. Ürün kapısı (guard) kaydı kurumsal için yok — yalnız Junior kayıtlı (`lib/junior/register-account-close-guard.ts`). Sonuç: işveren gider, adayların adı/e-postası/CV özeti/puanı sahipsiz kalır.

**(b) Saklama süresi / temizlik işi yok.** `lib/kernel/jobs/` altında kurumsal için tek bir Inngest adımı yok (grep: `kurumsal` → 0). Kapanmış ilan + başvuru süresiz büyür.

**(c) Silme yolu yalnız aday tarafında.** `eraseCareerPersonalData` adayın kendi satırını anonimleştiriyor (`lib/career/cv-privacy.ts:29-36` → `"Anonim aday"`, `"anonim@yetkin.local"`). Doğru ve iyi. Ama **işveren** kendi ilanının başvurularını silemiyor: ilan silme rotası yok, ilan kapatma rotası yok (`isActive` hiç `false` yazılmıyor). Yani "ilanı kaldır, aday verisini temizle" talebi bugün yalnız DB operatörüyle karşılanır.

Bu, B2B sözleşmede DPA (veri işleyen) sorusuna cevap verilememesi demek. `/kurumsal` sayfası "CV metni kamu dizinine basılmaz" diyerek veri sorumluluğu iddiasında bulunuyor (`app/(public)/kurumsal/page.tsx:79`) — bu iddia saklama tarafında karşılıksız.

---

## 8. Boyut 6 — Güven, İşveren Doğrulama, Kötüye Kullanım

### 8.1 Y-07 — `taxNumber` zayıf

```340:348:lib/sales/kurumsal-screening.ts
const TAX_NUMBER_RE = /^[0-9]{10,11}$/;

export function normalizeTaxNumber(raw: string): string {
  return raw.replace(/\s+/g, "").replace(/[^0-9]/g, "").slice(0, 20);
}

export function isKurumsalTaxNumber(value: string): boolean {
  return TAX_NUMBER_RE.test(value);
}
```

Eksikler:
- **Checksum yok.** Türkiye VKN 10 hane + doğrulama algoritması; TCKN 11 hane + checksum. `1234567890` geçerli sayılıyor.
- **Eşsizlik yok.** Aynı vergi no ile N ilan, N farklı hesap açabilir. Benzersizlik kısıtı şemada yok (`prisma/schema/b2b.prisma:113`).
- **Zorunluluk yok.** `taxNumber` boş olabilir (`:446-449` → `taxNumber.length > 0 && !isKurumsalTaxNumber(...)`), boş ilan açılır ama asla doğrulanamaz — ki doğrulama rotası boş numarayı reddediyor (`app/api/(kernel)/admin/ops/employer-verify/route.ts:42-47`). Yani boş numaralı ilan **kalıcı olarak noindex**'te kilitli.

### 8.2 Y-03 — Doğrulama ilan başına, UI yok

`verifiedEmployerAt` **ilan** kolonu, **işveren** kolonu değil:

```156:159:lib/sales/kurumsal-screening-load.ts
      // Doğrulama ops mühürüdür; ilan açılışında otomatik doğrulanmaz.
      verifiedEmployerAt: null,
      isActive: true,
```

Sonuç: doğrulanmış işveren ikinci ilanı açınca rozeti sıfırdan kazanmak zorunda. Güven birikmiyor; operatör her ilan için ayrı mühür basıyor. Doğrulama rotasının kendi yorumu da bunu kabul ediyor (`app/api/(kernel)/admin/ops/employer-verify/route.ts:14-17`).

Dahası: rota **var** ama **hiçbir arayüz onu çağırmıyor**. `components/**` içinde `employer-verify` geçen tek bir satır yok; `app/(kernel)/admin/ops/page.tsx` yalnız grant/revoke/refund içeriyor (`components/kernel/admin-ops-actions.tsx`). Yani rozet bugün yalnız elle `curl` ile verilebilir. Bu, Y1 düzeltmesinin ikinci kez "kilidi kurup anahtarı gizlemek" olmasıdır.

İyi olan: rota denetim mührü yazamazsa işlemi geri alıyor (fail-closed, `:59-67`) ve gerekçe zorunlu (`lib/kernel/admin/ops-desk.ts:218-236`).

### 8.3 Kötüye kullanım kalkanları — kısmi

| Vektör | Kalkan | Değerlendirme |
|---|---|---|
| Toplu ilan açma | 8 / 10 dk (IP) | Zayıf — NAT arkası paylaşımlı |
| Toplu başvuru | 8 / 10 dk (IP) | Zayıf |
| Sahte ilan | Doğrulanmamış = `noindex` + uyarı şeridi | **İyi** (`app/(public)/ilan/[slug]/page.tsx:45-48,103-109`) |
| Puan manipülasyonu | Puan yalnız sunucu motoru; istemci alt puan gönderemiyor | **İyi** (`lib/sales/kurumsal-screening.ts:9-11`) |
| Lead spam | 5 / 10 dk (IP), captcha yok | Orta |
| Aynı adayla çoklu başvuru | `@@unique([jobId, candidateUserId])` | **İyi** |

**O-03:** Kenar hız sınırı tablosunda bu yolların hiçbiri yok — `matchEdgeRateLimit` 5 yolun tamamı için `null` döndü. Yani koruma yalnız handler içinde; kenarda JWT/Origin kapısından sonra çalışıyor. Handler limitleri de yalnız IP anahtarlı (`applyHttpRateLimit(request, {...})`, `extraIdentity` verilmemiş) — `checkoutUser` gibi kullanıcı bazlı kova kullanılmamış (`app/api/kurumsal/ilanlar/route.ts:22-27`).

---

## 9. Boyut 7 — Skor ve Önceliklendirilmiş Yol Haritası

### 9.1 Puanlama

| Boyut | Ağırlık | Puan | Gerekçe |
|---|---|---|---|
| 1. B2B ürün & satış hunisi | 15 | **8** | Fiyat dürüstlüğü örnek; konumlandırma karışık; lead kuyruğu çıkmaz sokak (Y-04) |
| 2. İlan/paket/ödeme simetrisi | 20 | **6** | Ödeme kodu doğru ama **rota 410** (K-01) → satılamaz; kota yok (Y-01) |
| 3. İK kokpiti & aday deneyimi | 15 | **7** | Sıralama/band etiketleri iyi; export/not/manuel durum/iletişim yok (Y-06), sayfasız sorgu (O-01) |
| 4. Kamu ilan sayfaları & başvuru | 15 | **8** | Başvuru akışı güçlü; `/ilan` 404 (K-03), soft 404 (Y-05), sitemap boş |
| 5. Yetki/IDOR/RLS/KVKK | 20 | **12** | IDOR ve RLS sağlam; KVKK saklama/silme yok (K-02), regresyon testi yok (O-04) |
| 6. Güven/doğrulama/kötüye kullanım | 15 | **8** | Dürüst noindex iyi; vergi no zayıf (Y-07), doğrulama ilan başına + UI yok (Y-03) |
| **TOPLAM** | **100** | **49** | **Satılamaz — halka kopuk** |

**Yorum:** 49, "kötü yazılmış" değil **"yarıda bırakılmış"** puanıdır. Kod kalitesi (tip disiplini, dürüstlük sınırları, sunucu tarafı puanlama, RLS) 75+ seviyesinde; ürün halkası (para + talep + İK iş akışı) 30 seviyesinde. Faz 1 tamamlanınca gerçekçi bant **78–84**.

### 9.2 Faz 1 — Tedavi Planı (satılabilirlik; 5 iş günü)

| # | Bulgu | Eylem | Dosya | Kabul kriteri |
|---|---|---|---|---|
| **F1.1** | K-01 | `/api/kurumsal/satin-al` yolunu donmuş oda 410'undan muaf tut. `edge-api-auth.ts:87`'deki istisnayı `isKurumsalScreeningPurchasePath(path)` ile genişlet; sicile yaz. Alternatif (daha temiz): `kurumsal`'ı `FROZEN_DISK_ROOMS`'tan çıkarıp ayrı "sales" satırı olarak kaydet. | `lib/kernel/security/edge-api-auth.ts:85-96`; `lib/dronlar/kayit.ts:10-18`; `lib/kernel/compliance/circuit-breakers.ts:80-89` | `decideEdgeApiAuth('/api/kurumsal/satin-al','POST')` → `next`; uçtan uca test: rıza + `Idempotency-Key` → `kind:"iframe"` → CLEARED → `POST /api/kurumsal/ilanlar` 200 |
| **F1.2** | K-01 | `/kurumsal` kokpitine gerçek satın alma düğmesi ekle (bugün hiçbir istemci rotayı çağırmıyor). `KurumsalScreeningCockpit` yalnız fiyat basıyor, `satin-al` çağırmıyor. | `components/kurumsal/screening-cockpit.tsx:186-190` | Düğme `satin-al` → PayTR iframe açar; `grep satin-al components/` > 0 |
| **F1.3** | K-03 | `app/(public)/ilan/page.tsx` ekle: aktif + süresi geçmemiş ilanlar, arama/filtre/sayfalama; `app/sitemap.ts`'e `kurumsalJobPosting` sorgusu ekle (yalnız `verifiedEmployerAt != null` + `isActive` + deadline). | `app/(public)/ilan/page.tsx` (yeni); `app/sitemap.ts:73-90` | `/ilan` 200; `/sitemap.xml`'de ≥1 `/ilan/` URL; doğrulanmamış ilan sitemap'te **yok** |
| **F1.4** | Y-05 | `loadPublicKurumsalJob` null döndüğünde `notFound()` çağır; `app/(public)/ilan/not-found.tsx` ekle. | `app/(public)/ilan/[slug]/page.tsx:77-87` | Kapalı/süresi dolmuş ilan → **404**; meta `noindex` korunur |
| **F1.5** | Y-06 / Y-02 | (a) `PATCH /api/kurumsal/ilanlar/[id]` → `isActive` aç/kapat (sahiplik filtreli). (b) `GET /api/kurumsal/ilanlar/[id]/export?format=csv` → kısa liste CSV. | `app/api/kurumsal/ilanlar/[id]/route.ts` (yeni); `components/kurumsal/screening-cockpit.tsx` | Kapatılan ilan `/ilan/[slug]` → 404 ve yeni başvuru 404; CSV indirilebilir, `cvSummary` **dahil değil** |
| **F1.6** | K-02 | (a) Kurumsal `registerAccountCloseGuard` yaz: açık ilan varsa hesap kapanışını reddet. (b) Inngest adımı: `deadlineAt < now - 90g` ilanların başvurularını anonimleştir (`eraseCareerPersonalData` ile aynı sabitler). | `lib/sales/register-kurumsal-close-guard.ts` (yeni); `lib/kernel/jobs/inngest.ts` | Hesap kapanışı açık ilanla 409; temizlik işi testte anonim satır üretir |

### 9.3 Faz 2 — Olgunlaşma (B2B iş akışı; 10 iş günü)

| # | Bulgu | Eylem |
|---|---|---|
| **F2.1** | Y-01 | Lisans kotası: `KurumsalLicenseQuota` (dönem + ilan sayısı) veya `KurumsalJobPosting`'e `licenseMerchantOid` bağı. Aynı lisansla N ilan sınırı; aşımda 402 + katalog yönlendirmesi. |
| **F2.2** | Y-03 | Doğrulamayı **işveren** seviyesine taşı (`KurumsalEmployer` tablosu: `taxNumber @unique`, `verifiedAt`, `verifiedBy`). İlan doğrulamayı işverenden miras alsın. Admin ops sayfasına "İşveren doğrula" formu ekle. |
| **F2.3** | Y-07 | VKN/TCKN checksum doğrulaması + `taxNumber` eşsizlik kısıtı + ilan açılışında zorunlu alan. |
| **F2.4** | Y-04 | Lead kuyruğu: `status` (`NEW`/`CONTACTED`/`WON`/`LOST`), `handledAt`, `handledBy`, `note`; yeni talepte süper admin bildirimi; panelde sayfalama (50 tavanını kaldır) ve "yanıtla" (şablonlu e-posta). |
| **F2.5** | Y-04 | `POST /api/lead`'e mükerrer kontrolü (aynı `email` + `packageKey` 24 saat içinde → 200 + `duplicate:true`) ve Turnstile/alt-saat honeypot. |
| **F2.6** | O-01 | Kokpit sorgusuna `select` + sayfalama (`take`/`cursor`); `cvSummary` yalnız satır açıldığında ayrı uçtan okunsun. |
| **F2.7** | O-02 | `emailConfirmedAt` zorunluluğu: doğrulanmamış hesapla başvuru → 403 "Önce e-postanı doğrula". Metin ile davranış eşitlenir. |
| **F2.8** | O-03 | `HTTP_RATE_LIMITS`'a `kurumsalIlanUser`, `kurumsalApplyUser`, `leadIp` ekle; ilan/başvuru limitlerini `extraIdentity` (userId) ile anahtarla; kenar tablosuna `isKurumsalMutationPath` ekle. |
| **F2.9** | O-04 | `tests/sales/kurumsal-idor.test.ts`: A işvereni B'nin `jobId`'siyle `GET`/`PATCH` → 403/404; `sittingId` başka adayla → 400. |
| **F2.10** | O-05 | `/kurumsal` vitrini sadeleştir: e-ticaret ajans kartını ayrı yüzeye taşı; fiyat slotunda "Kurumsal Tanımlama" yerine "Teklif alın" veya gerçek katalog fiyatı. |
| **F2.11** | O-06 | `persistBands` yerine tek `updateMany` + `status` türetmeyi okuma anına bırak; ya da advisory lock. |

### 9.4 Düşük

| # | Bulgu | Eylem |
|---|---|---|
| **D-01** | Gevşek `contains` eşleşmesi | `purpose: KURUMSAL_SCREENING_ORDER_PURPOSE` tek eşitlik; `contains` kaldır. |
| **D-02** | Şehir serbest metin | `city` için 81 il allowlist; e-posta için MX kontrolü (opsiyonel). |
| **D-03** | Fiyat anlık görüntüsü yok | `KurumsalOfferRequest`'e `quotedAmountMinor` + `quotedAt` ekle. |

### 9.5 O-07 — Test görünürlüğü (süreç bulgusu)

`kurumsal` hem `FROZEN_DISK_ROOMS` içinde hem canlı ürün yüzeyi. Sonuç: `tests/kurumsal/**` **canlı suite'te hiç koşmuyor** (`vitest.config.ts:16,38`); yalnız `test:frozen` ile elle. Canlı eşdeğerleri `tests/sales/**` altında kısmen var (24 test) ama IDOR, kota ve kenar kapısı kapsamı yok.

**Öneri:** Ürün canlıysa testleri de canlı olmalı. F1.1 ile birlikte `kurumsal`'ı `FROZEN_DISK_ROOMS`'tan çıkarın; `tests/kurumsal/**` otomatik canlı suite'e girer. Aksi hâlde her yeni kurumsal davranışı yalnız elle koşulan bir suite'e yazılır ve regresyon görünmez olur (K-01 tam olarak bu körlükte doğdu).

---

## 10. Ek — Doğrulanmış İyi Uygulamalar

Denge için, denetimde **kasten bozulmadığını** doğruladığım noktalar:

1. **Puan satın alınamaz.** Ödeme rotası yalnız ilan açma hakkı verir; `weightedScore` yalnız `sealYetkinCvSitting` çıktısından yazılır (`lib/sales/kurumsal-screening-load.ts:485-500`).
2. **İstemci alt puan gönderemiyor.** `parseKurumsalApplyDraft` yalnız ad/e-posta/CV alır; ağırlık anahtarları vaka bankasından doğrulanır (`lib/sales/kurumsal-screening.ts:234-269`).
3. **Kurumsal sınav ücretsiz hakkı tüketmiyor** — açıkça düzeltilmiş bir hata (`lib/career/yetkincv-store.ts:126-147`).
4. **Tutar istekten okunmuyor**, katalogdan geliyor; katalog kapalıysa tahsilat başlamıyor, 422 + dürüst yönlendirme (`lib/sales/kurumsal-offers.ts:36-53`; `app/api/kurumsal/satin-al/route.ts:68-78`).
5. **Self-servis karta iade bloke** — kurumsal `purpose` iade sorgusundan dışlanmış (`lib/kernel/payments/prisma-wallet-card-refund.ts:60-78`).
6. **Kurumsal ödeme defterde kendi etiketiyle** görünüyor, "Cüzdan yükleme" değil (`lib/kernel/payments/order-purpose.ts:210-216`).
7. **Doğrulanmamış işveren = noindex + görünür uyarı şeridi** (`app/(public)/ilan/[slug]/page.tsx:45-48,103-109`).
8. **Doğrulama rotası fail-closed**: denetim mührü yazılamazsa doğrulama geri alınıyor (`app/api/(kernel)/admin/ops/employer-verify/route.ts:59-67`).
9. **Form istemci/sunucu sınırları birebir kilitli** — sessiz kırpma imkânsız (`tests/sales/offer-form-surface.test.ts:31-48`).
10. **Aday kendi verisini silebiliyor**, sıralama bozulmadan (`lib/career/cv-privacy.ts:29-36`).

---

## 11. Sonuç

Kurumsal B2B modülü, **doğru mimariyle yanlış kapıda** duruyor. Puanlama motoru, sunucu taraflı mühür, band sıralaması, RLS ve IDOR disiplini üretim kalitesinde. Buna karşılık üç halka kopuk:

- **Para halkası:** tahsilat rotası kenarda 410 → lisans üretilemiyor → ilan açılamıyor **(K-01)**.
- **Talep halkası:** `/ilan` dizini yok, sitemap boş → aday bulunamıyor **(K-03)**.
- **Uyum halkası:** aday PII'sinin saklama/silme sahibi yok **(K-02)**.

Faz 1'in 6 kalemi (≈5 iş günü) modülü **satılabilir** hâle getirir; Faz 2 (≈10 iş günü) B2B sözleşmeye dayanıklı **İK iş akışını** tamamlar. Faz 1 sonrası beklenen puan: **78–84**.

---

*Bu rapor yalnız okuma ve doğrulama üzerine kuruludur. Hiçbir kaynak dosya, şema veya migration değiştirilmedi.*
