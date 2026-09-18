# TESPİT RAPORU — `01_office_ai` (İş Hayatında ve Ofiste Yapay Zekâ) + Sistem Değerlendirmesi

| Alan | Değer |
|------|-------|
| Tarih | 18 Eylül 2026 |
| Kapsam | `https://yetkin.ai/academy/01_office_ai` rotası: sayfa/antre/oynatıcı, 9 derslik müfredat metni, sınav, mühür, satın alma, PayTR hattı, vitrin, kılavuz dokümanlar (`ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`), yeni eğitim önerisi |
| Yöntem | Statik kod + içerik incelemesi (çalıştırılabilir kod SSOT). Hedefli test koşumu (`tests/academy/production-standard.test.ts` → 2/2 yeşil). Üretim veritabanına bağlanılmadı, gerçek kartla ödeme denenmedi, ses dosyalarının bayt içeriği dinlenmedi. |
| Hüküm özeti | **Adım 3 kapanış (18 Eylül 2026): P0 / P1 / P2 kapandı. Amiral `01_office_ai` tam mühürlü.** Canlı nakit tanığı Super Admin teyidiyle alındı (PayTR CLEARED, ₺15,00). Ayrıntı: `docs/TEDAVI_RAPORU_OFFICE_AI.md`, `docs/ops/DURUM.md`. Yeni eğitime (`05_prompt_practice`) bu aşamada başlanmamalı — eşik hâlâ 10 SETTLED + 3 mühür. |

---

## 1. MEVCUT DURUM VE KOD İNCELEMESİ

### 1.1 Rota ve dosya haritası (doğrulanan)

| Katman | Dosya | Tespit |
|--------|-------|--------|
| Vitrin | `app/academy/page.tsx` | 5'li Vitrin Karması; amiral satın alınır, 4 kardeş "Çok Yakında" kabuğu |
| Antre (satış/sınav kapısı) | `app/academy/[slug]/page.tsx` | `dynamicParams=false`; vitrin dışı slug 404; satın alma + sınav + sertifika akışı tek sayfada |
| Oynatıcı | `app/academy/[slug]/oyna/page.tsx` | Oturum + satın alma zorunlu; almayanı antreye redirect |
| Müfredat metni | `lib/academy/curricula/office_ai/section_{1,2,3,4,5,6,g1,w1,k1}.ts` + `planned.ts` | 9 doygun ders; sıra SSOT'u `lesson-index.ts` |
| Sıra SSOT | `lib/academy/curricula/lesson-index.ts` | Vatandaş sırası: `1 → k1 → 2 → 3 → 5 → 4 → g1 → w1 → 6` (9 ders). Teknik sonek ders numarası değil |
| Ses/cue senkron | `lib/academy/lesson-audio-timings/`, `lesson-cues/`, `spoken-scripts/` | 9/9 ders; süre SSOT'u timings JSON |
| Ders sınavları | `lib/academy/lesson-exams/01_office_ai-*.json` | 9/9 ders, her biri ≥3 soru, baraj 70 |
| Final sınavı | `app/api/academy/courses/[id]/exam/route.ts` + `lib/academy/exam-engine.ts` | Sunucu puanlama + oturum token + müfredat-tamamı kapısı |
| Satın alma | `app/api/academy/courses/[id]/purchase/route.ts` | Idempotency + fiyat kilidi + KVKK/mesafeli onay + fatura bilgisi + makbuz kuyruğu |
| Sertifika doğrulama | `app/academy/dogrula/[hash]/page.tsx` | Herkese açık, oturumsuz ("Oturum istenmez") |
| Vitrin kataloğu | `lib/academy/pilot-sku.ts`, `published-catalog.ts`, `catalog-seed.ts` | Tek satın alınır SKU (`01_office_ai`); hayalet SKU vitrine giremez |
| Ödeme | `lib/kernel/payments/paytr/checkout.ts`, `wallet-top-up.ts` | HMAC get-token, sepet=tutar eşleşmesi, sandbox/mock üretim kalkanı |

### 1.2 Eğitim içeriği — yanlış bilgiler (düzeltilmeli)

**Y1 — Ders 1: Sabit model stereotipleri (orta şiddet).**
Metin, sürümden sürüme değişen yetenekleri sabit karakter özelliği gibi sunuyor: *"ChatGPT hızlı taslak üretir, Claude uzun satırları dikkatle okur, Gemini adımları net sıralar, özel API ise evdeki kuralları unutmaz."* Üç sorun var: (a) olgusal iddia kipinde yazılmış eğilim cümleleri; (b) "özel API" hiç tanımlanmamış (şirketinin kurumsal modeli mi, API anahtarı mı?); (c) 2026 model gerçekliğiyle çürümeye mahkûm. Pedagoji §E.2 "çoklu AI ekosistemi farkını sade dille işlemeyi" ister — ders bunu yapıyor ama **eğilim dili + sürüm notu + "özel API = şirketinin kurumsal modeli" tanımı** ile yumuşatılmalı.

```1:60:D:/yetkin.ai/lib/academy/curricula/office_ai/section_1.ts
// ... "ChatGPT hızlı taslak üretir, Claude uzun satırları dikkatle okur,
// Gemini adımları net sıralar, özel API ise evdeki kuralları unutmaz."
// (ders gövdesi + CEBİNE KOY tekrarları — tanım ve sürüm notu yok)
```

**Y2 — Ders k1: Hukuken fazla mutlak cümle (yüksek şiddet, tek cümlelik düzeltme).**
El kitabında: *"Copilot kiracısı veya şirket DPA'sı kişisel veriyi yasal kılmaz."* Bu mutlak ifade yanlıştır: kurumsal tenant (veri sınırı + DPA) + aydınlatma/açık rıza hukuki zemini ile KVKK uyumlu işlem mümkündür. Dersin ruhu doğru (lisans ≠ otomatik yasallık) ama cümle tersini söylüyor. Doğrusu: **"Lisans ve DPA tek başına yeterli değildir; aydınlatma/açık rıza/VERBIS zeminini kurmadan ham kimlik hiçbir panele girmez."**

```51:60:D:/yetkin.ai/lib/academy/curricula/office_ai/section_k1.ts
// "Copilot kiracısı veya şirket DPA'sı kişisel veriyi yasal kılmaz. Neden?
// Çünkü lisans, sohbet kutusuna giren satırın sınıfını değiştirmez."
```

**Y3 — Başlık vaat aşımı (orta şiddet).**
Kurs başlığı *"Excel, Word, PowerPoint & E-Posta Otomasyonu"* diyor; içerikte otomasyon (Power Automate, makro, zamanlanmış akış) yok — öğretilen, AI-destekli iş akışları. Ders 3'ün "VBA bu derste yoktur" dürüstlüğü başlıkla çelişiyor. İki yoldan biri: başlıktaki **"Otomasyonu" → "Verimliliği"**, veya uydu pakete gerçek bir otomasyon dersi (uydu-10/11/12'nin yanına "uydu-13: Power Automate ile Cuma 30'u zamanla").

**Y4 — Ders 1 slogan sürtüşmesi (düşük şiddet, commitlenmemiş pedagojiyle ilgili).**
Ders 1'de *"saniyeler içinde çözeceğiz"* geçiyor. Commitlenmemiş `PEDAGOJI.md` taslağı bu sınıf sloganları ("saniyeler içinde etkileyici" vb.) kesinlikle yasaklıyor. Taslak yürürlüğe girerse ders 1 metni kendi anayasasını ihlal eder. Taslak commitlenmeden önce ders 1'deki 1–2 slogan cümlesi temizlenmeli.

### 1.3 Eğitim içeriği — eksik konular

| # | Eksik | Neden önemli | Önerilen yer |
|---|-------|--------------|--------------|
| E1 | **Excel formül/grafik yazdırma** (XLOOKUP, ÖZET tablo, grafik seçimi) | "Tablonu Konuştur" temizlik öğretiyor ama formül yazdırmıyor; TOPLA yalnız doğrulamada geçiyor | Uydu-11'i öne çek ("Sezon 2" ilk dersi) |
| E2 | **Copilot lisans pratik rehberi** (hangi M365 planında ne var, ücretsiz akış haritası) | Kullanıcının ilk takılacağı gerçek engel; dersler "lisans varsa/yoksa" deyip geçiyor | 0. ders / uydu-0 ("Kurulum: senin kapın hangisi?") — 3 dakikalık karar ağacı, sınav dışı |
| E3 | **Takvim/toplantı AI** (Teams/Meet transkript → aksiyon) | Ofis gerçeğinin üçte biri; başlık "ofiste yapay zekâ" diyor | Uydu-10 (planlı, doğru yerde) |
| E4 | **PDF/OCR** (taranmış belge, birleştirme, karşılaştırma) | Kamu + KOBİ'de en sık dosya türü | Uydu-12 (planlı, doğru yerde) |
| E5 | Sheets/Docs köprüsü | Hedef kitlenin bir kısmı Google ekosisteminde; SKU "bu derste kapsam dışı" diyor (dürüst) ama tek cümlelik köprü notu yok | Ders 2 el kitabına 3 cümlelik not |

Not: E3–E4 `planned.ts` uydularında doğru şekilde planlanmış; eksiklik "unutulmuş" değil, "bilinçli ertelenmiş" durumda. Çekirdek 9'un kilitli tutulması doğru karar.

```113:145:D:/yetkin.ai/lib/academy/curricula/office_ai/planned.ts
// Uydu (ileriki fırın, sınav yoluna girmez): 10 takvim/toplantı,
// 11 Excel formül/grafik, 12 PDF. Çekirdek 9 kilitli.
```

### 1.4 Eğitim içeriği — bölümler arası uyumsuzluklar

**U1 — Ders-içi köprü numaralandırması TUTARLI (güçlü yan, teyit edildi).**
9 dersin giriş/kapanış köprüleri vatandaş sırasıyla birebir örtüşüyor: Ders 1 → "2. derste (k1) buluşalım" ✓; Ders 3 (teknik `-2`) → "4. ders kapsamında slayt" ✓ (vatandaş ders 4 = `-3`); Ders 4 (`-3`) → "5. derste hata avı" ✓; Ders 5 (`-5`) → "sıradaki ders e-posta" ✓; Ders 6 (`-4`) → "bir sonraki derste Gmail/Outlook kapısı" ✓; g1 → "sonra Word" + "9. ders bitince sınav" ✓; w1 → "bu 8. derstir, sınav kapalı" ✓; Ders 9 (`-6`) → capstone + sınav kapısı ✓. Ayrıca `sectionNumber` değerleri vatandaş sırasına eşit (k1=2, g1=7, w1=8, `-4`=6, `-5`=5, `-6`=9). Bu disiplin korunmalı; yeni ders eklenirse köprü cümleleri testle kilitlenmeli.

**U2 — `docs/DURUM.md` tablosu teknik soneki ders numarası sanıyor (orta şiddet).**
Yaşayan kesit aynası "3. ders PowerPoint (`01_office_ai-3`)" yazıyor — oysa vatandaş ders 4; "4. ders E-posta (`01_office_ai-4`)" yazıyor — oysa vatandaş ders 6; ve `01_office_ai-2` (vatandaş ders 3, Rapor Otomasyonu) tabloda **hiç yok**. `lesson-index.ts`'in çözdüğü karışıklığı dokümantasyon yeniden üretiyor. Tablo vatandaş numarasına çevrilmeli ve ders 2 satırı eklenmeli.

**U3 — Mühürlü süre sayıları: kod SSOT vs doküman (yüksek şiddet, 7/9 tutmuyor).**
Timings JSON (kod gerçeği) ile `docs/DURUM.md` + `akademi-bake-elkitabi.md` karşılaştırması:

| Ders | Timings JSON (SSOT) | Doküman iddiası | Durum |
|------|---------------------|-----------------|-------|
| 1 (`-1`) | 607.28 sn | 571.72 sn | ✗ ~36 sn sapma |
| 2 (`-2`) | 553.84 sn | *(tabloda yok)* | ✗ eksik satır |
| 3 (`-3`) | 575.60 sn | 527 sn | ✗ ~49 sn sapma |
| 4 (`-4`) | 443.56 sn | 496.12 sn | ✗ ~53 sn sapma |
| 5 (`-5`) | 517.56 sn | 420.713 sn | ✗ ~97 sn sapma |
| 6 (`-6`) | 540.20 sn | 440.393 sn | ✗ ~100 sn sapma |
| 7 (`g1`) | 567.20 sn | 529.04 sn | ✗ ~38 sn sapma |
| 8 (`w1`) | 567.00 sn | 521.44 sn | ✗ ~46 sn sapma |
| 9 (`k1`) | 677.56 sn | 677.56 sn | ✓ tek tutan |

İyi haber: 9 ders de 420–720 sn bandının içinde (min 443.56, max 677.56) ve toplam ~84.2 dk ile 45–90 dk kurs bandında. Yani **ürün sağlıklı, doküman hasta**. Ek mikro-sapmalar: `ACADEMY_SEALED_AUDIO_DURATION_SEC` ders 5'i 516 yazıyor (timings 517.56 → 518 olmalı); `ACADEMY_SEALED_AUDIO_CACHE_V` kodda **boş** ama bake el kitabı dolu `cacheV` değerleri listeliyor.

```19:29:D:/yetkin.ai/lib/academy/lesson-audio.ts
// "01_office_ai-5": 516,  (timings JSON: 517.56 → yuvarlama 518 olmalıydı)
// ACADEMY_SEALED_AUDIO_CACHE_V = {} (el kitabı 571720 vb. değerler iddia ediyor)
```

**U4 — `targetDurationMinutes` hedefleri mühürlü sürelerden kopmuş (düşük şiddet).**
Ders 4: hedef 9.6 dk → mühür 7.4 dk (−%23); Ders 1: 9.0 → 10.1; k1: 9.0 → 11.3 (tavana yakın); Ders 6: 8.0 → 9.0. Vitrin/syllabus süreyi mühürlü sesten türettiği için kullanıcıya yanlış süre gösterilmiyor (`lesson-meta.ts` → `academyMediaDurationMin`), ama hedef tablo güncel değilse fırın planlaması şaşar. Hedefler mühürlü sürelerle eşitlenmeli. Ders 4 ayrıca en ince ders (`estimatedWordCount: 683`) — ritüel dersi olarak bilinçli kısaysa hedef 9.6 dk gerçekçi değil.

### 1.5 PayTR + Akademi teknik durum ve yayına engel hükmü

**Doğrulanan sağlamlıklar:**

- **PayTR Merchant hattı kod-olgun:** HMAC get-token (resmi parametre sırası), sepet toplamı = ödeme tutarı kapısı, `PAYTR_SANDBOX`/`PAYTR_ALLOW_MOCK_CHECKOUT` üretim kalkanı (throw), canlıda loopback/özel IP reddi, webhook HMAC + `total_amount === amountMinor` + idempotent tekil CREDIT. Cüzdan bandı ₺10–₺20.000, tek çekim.
- **Sınav/mühür Anayasa A4'e tam uyumlu:** puanlama sunucuda (`gradeAcademyExam`, tamsayı `floor(doğru*100/toplam)`, istemci skoru yok); tek kullanımlık oturum jetonu + süre aşımı = 0; sınav kapısı SETTLED lisans + **müfredatın tamamını** ister (`assertAcademyCurriculumComplete`); mühür yükü `userId · courseId · attemptId · score · issuedAt · curriculumSeal` — ödeme tutarı yok; doğrulama sayfası oturumsuz ve kamuya açık.

```109:160:D:/yetkin.ai/lib/academy/exam.ts
// gradeAcademyExam: sunucu sorularındaki correctIndex ile karşılaştırır.
// academyCertificateHashPayload: version + userId + courseId + attemptId
// + score + issuedAt + curriculumSeal (ödeme tutarı YOK).
```

- **Satın alma zinciri tam:** Idempotency-Key + fiyat kilidi + yasal onay + fatura bilgisi + Inngest makbuz kuyruğu (fail-safe). Dürüst vitrin: tek satın alınır SKU, kardeş SKU'lar "Çok Yakında", vitrin dışı slug 404 (A5 uyumu).
- **Test:** `tests/academy/production-standard.test.ts` 2/2 yeşil.

**Yayına engeller (hüküm):**

| # | Engel | Şiddet | Açıklama |
|---|-------|--------|----------|
| P0-1 | **Canlı nakit tanığı yok** | **Yayın engeli** | Hiçbir `PaymentOrder=CLEARED` + `LedgerEntry` CREDIT + cüzdan artışı operatör teyidi yok. Kod kalkanlı ama para akışı hiç denenmemiş. A5 gereği "para akıyor" denemez. Faz 0 prosedürü (`ops-db.md` §13.1) işletilmeden reklam/satış basılmaz. |
| P0-2 | **`docs/ops/DURUM.md` silinmiş (commitlenmemiş)** | **Yayın engeli (doküman)** | Anayasa, Manifesto ve Pedagoji'nin "yaşayan kesit" diye işaret ettiği dosya çalışma ağacında yok; 23 rapor dosyası da silinmiş (HEAD'de duruyor, kurtarılabilir). Anayasa şu haliyle var olmayan dosyaya atıf yapıyor. |
| P1 | U2+U3 doküman sapmaları | Yüksek | Süre tabloları ve ders numaraları kodun gerisinde; ilk denetimde güven sarsar. |
| P1 | Y2 hukuk cümlesi | Yüksek | Tek cümlelik düzeltme + gerekiyorsa k1 re-bake. |
| P2 | Y1/Y3/Y4 içerik rötuşları, U4 hedef eşitlemesi, ders-5 yuvarlama (516→518), boş `CACHE_V` | Orta/düşük | Fırın planına alınır; hiçbiri tek başına yayını durdurmaz. |

Net hüküm: **kod yayına hazır, para hattı tanıksız, doküman kırık.** P0-1 ve P0-2 kapanmadan "yayındayız" denmez; ikisi de günler içinde kapanabilir işler (biri operasyonel test, biri dosya kurtarma + tablo düzeltme).

---

## 2. KILAVUZ DOKÜMANLARIN SORGULANMASI

### 2.1 ANAYASA.md — sağlam, ama kendi atıfı kırık

A Katmanı (A1–A5) doğru çizilmiş ve gerçekten dokunulmaz olmayı hak ediyor: tamsayı para + tek defter, lisanssız çekim yasağı, sır/RLS/IDOR, sunucu puanlama + mühür şeması, dürüst yüzey. Kod incelemesi A4'ü satır satır doğruladı. B Katmanı'nın "yaşayan ilke" ayrımı da olgun bir reform.

İki geliştirme ihtiyacı:

1. **Ölü referans:** "Yaşayan kesit `docs/ops/DURUM.md`" cümlesi şu an var olmayan dosyayı gösteriyor (§1.5 P0-2). Anayasa'nın ilk işi kendi atıflarını doğrulamak olmalı. Öneri: `verify:docs-links` adında hafif bir kapı (Anayasa/Manifesto/Pedagoji'deki `docs/` + `.system_docs/` + `lib/` atıflarının dosyada gerçekten var olduğunu denetler; nightly veya prebuild'de koşar).
2. **"Son Reform" satırı şişiyor:** tarihçe Anayasa gövdesinde birikiyor. Reform günlüğü ayrı bir `DEGISIKLIK_GUNLUGU.md`'ye taşınmalı; Anayasa'da yalnız yürürlük tarihi kalmalı.

Kısıt değerlendirmesi: A Katmanı eğitimi **kısıtlamıyor, koruyor** (sınav/mühür/para kuralları ürünün satış vaadinin ta kendisi). B4'ün "tavan değil" esnekliği de müfredatı boğmuyor. Kısıt değil, zırh.

### 2.2 MANIFESTO.md — disiplin doğru, B2B keşif tanımsız

Faz 1 kilidi (3 oda, yeni oda için CEO + Super Admin çift imzası), "vitrin kanonun alt kümesidir" ilkesi ve Motor 1'e (B2C Akademi) odaklanma stratejik olarak doğru. Dron'un "bağlı ama web-parite değil" tarifi dürüst ve teknik olarak teyitli (16 hop sicili, Tezgâh izole, simülasyon web'de).

İki geliştirme ihtiyacı:

1. **Motor 2 (B2B) "keşif" tanımı boş:** hangi sinyal B2B'yi keşiften pilota geçirir? Öneri: ölçülebilir kapı yazılmalı (örn. "1 imzalı pilot niyet mektubu + 10 koltuk + sınav paketi fiyat onayı = pilot; öncesi vitrin yok").
2. **"Gün 0 vitrin cümlesi" ile P0-1 çelişiyor:** manifesto nakit Akademi'de diyor ama canlı tanık yok. Cümle doğru ama zaman kipi yanlış — "nakit hattı tanıksız" dipnotu yaşayan kesite (o da onarılınca) işlenmeli.

Kısıt değerlendirmesi: Manifesto eğitimi kısıtlamıyor; tersine **ikinci fırın açma iştahını frenleyerek** amirali koruyor (§3'teki tavsiyenin dayanağı bu disiplin).

### 2.3 PEDAGOJI.md (commitlenmemiş taslak dahil) — içerik reformu güçlü, belge şişmanlıyor

Taslakta gelenler olumlunun çoğu: Nedensellik Reformu (Sebep → Eylem → Sonuç), "Öğretmen SEN, Belge SIZ" ayrımı, slogan yasağı, Üç Kapı'nın §D'ye taşınarak vatandaş özeti kazanması. Bunlar ders metinlerinin kalitesini doğrudan yükseltiyor ve §1.4 U1'deki köprü disiplinini açıklıyor.

Üç yapısal sorun:

1. **Piksel değerleri felsefeye sızmış:** `font-weight: inherit`, `padding-block: 0.08em 0.22em`, `calc(100dvh - 5.5rem)` bir eğitim felsefesi belgesinde durmamalı; bunlar bake el kitabı / kod SOP'udur. İlke ("altyazı titremez, harf kesilmez") Pedagoji'de kalır, sayı taşınır.
2. **Test ters bağımlılığı:** `tests/academy/production-standard.test.ts` pedagoji **cümlelerini** string-match ile kilitliyor ("420 – 720 saniye", "Baraj 70" yazmazsa test kırılır). Felsefe belgesi test fixture'ına dönüşmüş; bir virgül değişikliği CI kırar. Testler davranışı kilitlemeli (bant sayıları kod sabitlerinden okunur), cümleleri değil.
3. **Süre bandının iki yerde yazılması:** 420–720 hem kodda hem Pedagoji'de sayı olarak geçiyor. Sayı kod SSOT'ta kalmalı, Pedagoji "neden 7–12 dakika" gerekçesini taşımalı (dikkat aralığı + TTS ekonomisi).

Kısıt değerlendirmesi: Pedagoji'nin içerik yasakları (slogan, paragraf overlay, soyut AI Masası) **kısıt değil kalite filtresi** — ama belge işletme kılavuzuna dönüşürse yazarları boğar. Öneri: Pedagoji ≤4 sayfa ilke; sayılar ve SOP bake el kitabına.

---

## 3. YENİ EĞİTİM KONUSU DEĞERLENDİRMESİ

### 3.1 Mevcut durum: `05_prompt_practice` bugün boş bir kabuk

- `promptPracticeSections = []` (sıfır ders), `lesson-index.ts`'te ders sayısı 0, cue/timing JSON'ları 3 baytlık placeholder, vitrinde "Çok Yakında" rozeti. Yani başlanmamış değil, **doğru şekilde bekleyen** bir SKU.

```1:25:D:/yetkin.ai/lib/academy/curricula/prompt_practice/index.ts
// promptPracticeSections: Section[] = [];
// estimatedTotalMinutes: 0 — içerik yok, kabuk var. Vitrin dürüst (A5 ✓).
```

### 3.2 Tavsiye: BAŞLAMA — gerekçeler

1. **Amiral kapanmadı.** §1.5'teki P0/P1 listesi (nakit tanığı, doküman onarımı, k1 hukuk cümlesi, ders 4 doygunluğu, süre senkronu) dururken ikinci fırın açmak, bitmiş işi yarım bırakıp yeni cephe açmaktır. Bake kapasitesi tekil: tek TTS sesi (Gözde), TTS kotası + RPM kalkanı, tek reji dikkati. İki SKU paralel fırınlanırsa ikisi de yavaşlar.
2. **Mimari tek-SKU ritmine ayarlı.** `pilot-sku.ts` büyüme vitrinini bilinçli olarak tek SKU tutuyor; bake kuyruğu boş ve fırın disiplini (§E.5: reji oturmadan `--seal` yok) sıra işi. Yeni SKU bugün kuyruğa girerse amiralin re-bake ihtiyacı (Y2, Y4) ile kaynak kavgası çıkar.
3. **Kapı ürünü, kapı açılmadan satmaz.** "Pratik Prompt" konum olarak doğru bir *kapı ürünü* (ucuz, hızlı, amirale akıtan) — ama kapı ürününün işi amirale trafik taşımak; amiralin satış/sınav/mühür döngüsü canlı tanıkla kapanmadan kapı ürününün ölçülecek hunisi yok. Önce amiral satar, sonra kapı ürününün dönüşüm hipotezi test edilir.

### 3.3 İstisna ve karar eşiği

- **Serbest:** fırınsız, vitrinsiz, kuyruksuz **senaryo taslağı** (metin düzeyinde 6–8 ders iskeleti + Üç Kapı ile çakışmayan konu haritası). Sıcak tutar, kaynak yemez.
- **Yasak:** bake, kuyruk kaydı, vitrin değişikliği, "yakında" tarih ilanı.
- **Fırın açma eşiği (tümü):** (a) P0-1 + P0-2 kapalı; (b) amiralde ilk **10 SETTLED satış**; (c) ilk **3 mühür** (`/dogrula` kamuya açık teyitli); (d) P1 içerik rötuşları bakesiz veya bake'li kapanmış. Eşik tutunca `05_prompt_practice` "101/uydu" konumuyla fırına girer; gerekirse amiral alana çapraz indirimle paketlenir.

---

## 4. BEYİN FIRTINASI VE GERİ BİLDİRİM

### 4.1 Sen olsaydın ne yapardın? (Amiral Gemisi reçetesi)

**EKLE (4 hamle):**

1. **Uydu-0 "Kurulum: Senin Kapın Hangisi?"** — 3 dakikalık, sınav-dışı karar ağacı: M365 planı → Copilot var/yok → ücretsiz akış. Bugün derslerin "lisans varsa/yoksa" parantezleri bu boşluğu doldurmuyor; kullanıcının ilk 10 dakikadaki donma anı burası. En yüksek kaldıraçlı ekleme bu.
2. **"60 Saniyelik Yönetici Özeti" kartı her derse** — dersin 3 kuralını tek kartta veren, yazdırılabilir/paylaşılabilir özet. Hem öğrenmeyi pekiştirir hem organik paylaşım üretir (sertifika + kart = iki kanıt yüzeyi).
3. **Uydu-11 (Formül/Grafik) öne çekme** — "Tablonu Konuştur" temizlikte bitiyor; kullanıcı ilk XLOOKUP'u hâlâ yazamıyor. Sezon 2'nin açılış dersi olmalı, kapanışı değil.
4. **Köprü-cümle kilit testi** — §1.4 U1'deki numaralandırma disiplini bugün insan dikkatine emanet. Her dersin giriş/kapanış cümlelerindeki ders numaralarını `lesson-index.ts` sırasına karşı denetleyen küçük bir test, gelecekteki her re-bake'i korur.

**ÇIKAR (3 hamle):**

1. Başlıktaki **"Otomasyonu"** kelimesi (veya karşılığında gerçek otomasyon dersi) — vaat-içerik makası amiral gemisine yakışmıyor.
2. Ders 1'deki **sabit model karakterleri** — eğilim diline çevrilmeden durmamalı (Y1).
3. Pedagoji'deki **piksel sayıları** — felsefe belgesi 4 sayfaya inmeli (§2.3).

**DÜZELT (sıralı):** k1 hukuk cümlesi (Y2) → `docs/ops/DURUM.md` onarımı + süre tabloları (U2/U3) → ders 4 doygunluğu + hedef eşitlemesi (U4) → ders-5 yuvarlama + `CACHE_V` (U3 mikro) → slogan temizliği (Y4).

### 4.2 Platform kurgusu doğru mu? ("Amiral Gemisi + Sürü Dron / Shared Kernel API-First")

**Evet, doğru kurgulanmış — ve kod bunu doğruluyor.** Kanıtlar: `@yetkin/kernel` gerçekten ince (para, katalog kimliği, v1 hop, JSON zarf; Prisma/Supabase taşımıyor); v1 hop sicili 16 kayıt ve web ile dron aynı handler'ı konuşuyor (çerez vs Bearer ayrımı kenarda); Tezgâh/Freelancer izole ve 410; native IAP yok, kasa HMAC pasaportla web'e köprüleniyor. Dron'un "sınav+mühür+kasa tam, simülasyon web'de" tarifi bilinçli bir kapsam kararı ve doğru: native'e Excel/Gmail klonu taşımak bakım kabusudur; metin+rozet+sınav yeter.

İki uyarı:

1. **B1 geri-yazım disiplini:** web BFF'de doğan her yeni yazma yeteneği v1 siciline geri yazılmazsa dron sessizce geride kalır. Her PR'da "yeni yazma = hop kaydı?" sorusu checklist'e girmeli (bugün kural var, işletim kanıtı yok).
2. **"Sürü" henüz tek dron:** mimari sürüye hazır ama ikinci istemci (ikinci dron veya harici tüketici) bağlanmadan API-First iddiası teorik. Kapanış kriteri: kapalı test halkasında dronla tam T3 döngüsü (yükle → satın al → izle → sınav → mühür) + web ile aynı handler kanıtı.

### 4.3 Sonraki adımlar (sıralı, sahibiyle)

| Sıra | Adım | Sahip | Bitti sayılır |
|------|------|-------|---------------|
| 1 | `docs/ops/DURUM.md`'yi HEAD'den geri yükle; süreleri timings SSOT'tan yaz; ders 2 satırını ekle; numaraları vatandaş sırasına çevir; silinen 23 raporun akıbetine karar ver (arşivle veya kurtar) | İçerik + mühendislik | Anayasa atıfları yaşayan dosyaları gösteriyor |
| 2 | Faz 0 canlı T3 prosedürünü işlet: küçük tutarlı gerçek kart → `CLEARED` + CREDIT + cüzdan teyidi → `01_office_ai` satın alma → sınav → `/dogrula` anonim teyit | Operatör + Super Admin | P0-1 kapanır; "para akıyor" denebilir |
| 3 | Y2 (k1 hukuk) + Y1 (model dili) + Y4 (slogan) metin revizyonu; gerekiyorsa hedefli re-bake | İçerik fırını | Pedagoji taslağı commitlenebilir hale gelir |
| 4 | `targetDurationMinutes` + `ACADEMY_SEALED_AUDIO_DURATION_SEC[5]` + `CACHE_V` senkronu; ders 4 doygunluk kararı (kısa kalacaksa hedefi düşür) | Mühendislik | U3/U4 kapanır |
| 5 | Pedagoji diyeti: piksel SOP'a, cümle-testleri davranış-testine | Mühendislik | Pedagoji ≤ ilke, testler cümle bağımsız |
| 6 | Köprü-cümle kilit testi + `verify:docs-links` kapısı | Mühendislik | U1/U2 sınıfı hatalar otomatik yakalanır |
| 7 | Metrik eşiği izle: 10 satış + 3 mühür → `05_prompt_practice` fırın kararı + uydu 10/11/12 "Sezon 2" paketleme | Ürün | §3.3 eşiği |

---

## EK — Teyit tablosu (Anayasa A1–A5)

| Madde | Hüküm | Kod karşılığı | Durum |
|-------|-------|---------------|-------|
| A1 | Tamsayı para, tek defter, dinamik fiyat | `amountMinor` her yerde; `Wallet` + append-only `LedgerEntry`; Super Admin fiyat satırı migrate'te korunur | ✓ |
| A2 | Lisanssız çekim yok, Split kapalıyken fail-closed | Çekim rotası yok; `beginHold/settle` → `not_configured`; Merchant/Split ayrık | ✓ |
| A3 | Sır sızmaz, RLS+IDOR, idempotency | `service_role` istemcide yok; sınav/satın alma `Idempotency-Key` + sahiplik kontrolleri | ✓ (RLS tarafı bu incelemede DB'ye bakılmadı) |
| A4 | Sunucu puanlama, mühür şeması, açık doğrulama | `gradeAcademyExam` sunucuda; mühürde ödeme yok; `/dogrula` oturumsuz | ✓ |
| A5 | Sahte başarı yok | Tek satın alınır SKU; Çok Yakında kabukları; tanıksız "para akıyor" denmiyor | ✓ (P0-1 bu disiplinin gereği) |

*Not: RLS politikalarının veritabanındaki fiili durumu bu incelemede test edilmedi (DB bağlantısı yok); `ops:migrate` sonrası `ops:runtime-readiness` çıktısı görülmeden "RLS yeşil" denmez.*
