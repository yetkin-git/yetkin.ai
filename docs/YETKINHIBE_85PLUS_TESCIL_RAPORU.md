# yetkin.ai — YetkinHibe (`/hibe`) Nihai Tescil Raporu

**Denetim tarihi:** 23 Kasım 2026
**Denetçi rolü:** Baş Teknoloji Sorumlusu (CTO) / Türkiye Hibe & Teşvik Ürün Mimarı
**Önceki karar:** `docs/YETKINHIBE_TESPIT_RAPORU.md` — **46 / 100**
**İnceleme konusu:** `docs/YETKINHIBE_FAZ1_RAPORU.md` + `docs/YETKINHIBE_FAZ2_RAPORU.md` iddiaları
**Kural:** Hiçbir kaynak dosya değiştirilmedi, silinmedi, taşınmadı. Yalnız bu rapor yazıldı.
**Yöntem:** Rapor değil kod okundu. Her iddia `dosya:satır` ile eşleştirildi; davranış iddiaları (widget skoru, kalkan regex'i, tazelik eşiği, faz kapısı) **çalıştırılarak ölçüldü**. Ölçüm için kök dizinde geçici `tsx` sondaları kullanıldı; sondalar silindi, çalışma ağacında iz bırakmadı (`git status` temiz).

---

## 1. Nihai Puan Kartı ve Dönüşüm Özeti (46 → Final)

### 1.1 Skor: **72 / 100**

Faz 1 ve Faz 2 gerçek iş çıkardı. Katalog artık deploy'suz yazılıyor, tek skor motoru var, kamu vitrini indeksli, tam dosya PayTR'ye doğrudan iniyor, arşiv kendi dosyasını açıyor, altı kurum şablonu birbirinden gerçekten farklı, Word çıktısı gerçek `<w:tbl>` taşıyor, başvuru sonrası beş faz canlı. İlk denetimdeki 25 bulgunun **13'ü tam, 8'i kısmen, 4'ü hiç** kapanmadı.

Buna karşın modül **85 barajını geçmedi** ve geçemezdi — çünkü kapanan maddelerin üçü *nominal* kapandı ve yeni bir `[KRİTİK]` sınıfı regresyon doğdu:

| Eksen | Ağırlık | Önceki | **Final** | Gerekçe (tek cümle) |
|---|---:|---:|---:|---|
| **Mimari Hazırlık** | %25 | 58 | **76** | Yazma yolu + revision + 6 yeni RLS tablosu + tek motor gerçek; ama **ücretli hat doğrulama tazeliğini atlıyor**, kernel hâlâ dikeyin tablosunu okuyor, ajans satırının fiyatı ve ödeme yolu yok. |
| **Mevcut İşlevsellik** | %30 | 47 | **74** | 32 açık çağrı / 9 kurum / TKDK dahil, bakiye LLM'den önce, arşiv açılıyor; ama **23 Aralık 2026 09:01'de katalog dört yüzeyde birden sıfırlanıyor** ve toplu yeniden doğrulama yolu yok, widget bir kelimeyle 1507'ye kayıyor. |
| **Ticari Farklılaşma** | %25 | 38 | **66** | 6 şablon + yaşam döngüsü + evrak kasası + kişiselleştirilmiş radar gerçek; ama **şartname atıfı basacak tek satır veri yok** (0/32), ajans matrisi 32 çağrının 29'una yapısal olarak kör, ajans satılamıyor. |
| **UX / Vitrin** | %20 | 42 | **72** | `/hibe` indeksli kamu vitrini + `/panel/hibe` korumalı kokpit + rızalı PayTR düğmesi + 402'de cüzdan bağlantısı gerçek; ama vitrin başlığı bir kafeye "İŞKUR Engelli İstihdam Teşviki %100" basıyor, sihirbaz `siz` kaçakları `lib/tezgah`'a taşınarak kapıdan kaçırıldı. |

**Ağırlıklı hesap:** `76×0,25 + 74×0,30 + 66×0,25 + 72×0,20 = 19,0 + 22,2 + 16,5 + 14,4 = 72,1 → **72 / 100**`

### 1.2 Dönüşüm tablosu (46 → 72)

| Eksen | 46'lık rapor | Faz 1 | Faz 2 | **Final** | 85 hedefi | Fark |
|---|---:|---:|---:|---:|---:|---:|
| Mimari Hazırlık | 58 | 74 | 78 | **76** | 88 | −12 |
| Mevcut İşlevsellik | 47 | 71 | 76 | **74** | 90 | −16 |
| Ticari Farklılaşma | 38 | 60 | 68 | **66** | 85 | −19 |
| UX / Vitrin | 42 | 70 | 73 | **72** | 86 | −14 |
| **Toplam** | **46** | **69** | **74** | **72** | **87** | **−15** |

> Faz raporlarının kendi beyan ettiği eksen puanları (Faz 2 sonu 74) ile bu teftişin sonucu (72) arasındaki 2 puanlık fark, **raporun "kapandı" dediği ama ölçümde kapalı çıkmayan** üç kalemden geliyor: doğrulama tazeliğinin ikili davranışı (B-01), şartname atıfının veri yokluğu (B-02) ve ajans matrisinin yatırım odağı körlüğü (B-04).

### 1.3 Tek cümlelik teşhis

> **Bu modül artık "katalog görüntüleyici" değil; ama hâlâ "otuz gün ömrü olan dürüst bir katalog memuru": 23 Aralık 2026 sabahı 09:01'de, kodda hiçbir şey bozulmadan, dört yüzey birden boşalacak ve bunu durduracak tek bir toplu komut yok.**

### 1.4 Doğrulama kapıları (bu teftişte çalıştırıldı)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ exit 0 |
| Dil aksı | `npm run verify:sen-axis` | ✅ 562 dosya, "41 siz kaçağı tarandı" |
| Sınır | `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma, oda↛oda engine |
| API ↔ auth | `npm run verify:api-auth -- --check` | ✅ 164 rota (`session:101, public:27, closed:11, cron:2, admin:15, webhook:8`) |
| RLS | `npm run verify:rls-status` | ✅ `hibe_applications`, `hibe_clients`, `hibe_company_profiles`, `hibe_documents`, `hibe_dossiers`, `hibe_grant_call_revisions` sicilde |
| Giz | `npm run verify:no-secrets` | ✅ |
| Test | `npx vitest run tests/yetkinhibe-core tests/tezgah tests/commerce` | ✅ **70 dosya / 505 test** |

**Kapıların söylemediği şey (bu teftişin ana bulgusu):**
Yeşil `verify:sen-axis`, `lib/tezgah/catalog.ts:284,290,296` içindeki `"İşletme adınızı yazınız..."`, `"Adınızı yazınız..."`, `"İl seçiniz..."` metinlerini **görmüyor** — çünkü tarama kökleri `SCAN_DIRS = ["app","components","lib/copy"]` (`scripts/verify-sen-axis.ts:17`); `lib/tezgah` kapsam dışı. Ve bu dosya hibe sihirbazının alan tanımıdır; `components/tezgah/workbench.tsx:1265` bu `fields` dizisini basıyor. Yani ilk raporda sayılan 10 kaçak **çevrilmedi, taşındı**.

---

## 2. Faz 1 & Faz 2 Çapraz Doğrulama Matrisi

İşaretler: ✅ **kodla doğrulandı** · 🟡 **kısmen / şartlı** · ❌ **doğrulanmadı**

### 2.1 Faz 1 — Çekirdek kapanışlar

| # | İddia | Karar | Kanıt (gerçek kod) | Ölçülen davranış |
|---|---|---|---|---|
| F1.1 | 32 çağrılık güncel katalog, 9 kurum, TKDK dahil | ✅ | `lib/yetkinhibe/grant-call-seed-2027.ts` — 32 `id`, 9 `sourceKey`; migration `20261123180000_.../migration.sql:131-200` aynı 32 satırı `ON CONFLICT DO NOTHING` ile basıyor; `grant-catalog-core.ts:32-41` `TKDK_IPARD`, `TARIM_BAKANLIGI`, `SANAYI_BAKANLIGI`, `ISKUR`, `AB_FONLARI` eklendi | 32/32 satır `mapGrantCallRow`'dan geçiyor; 4 Ticaret, 3 TKDK, 8 kalkınma ajansı ayrı satır |
| F1.2 | Deploy'suz admin/CLI yazma yolu | ✅ | `app/api/(kernel)/admin/grant-calls/route.ts:10-46` (`auth="admin"` + `requireSuperAdmin` + `Idempotency-Key`), `[id]/route.ts:10-46`, `lib/yetkinhibe/grant-call-admin.ts:114-291`, `scripts/ops-grant-call.ts` (`seed\|add\|update\|verify\|unpublish`) | `dataVersion` her yazmada +1 (`:220`, `:279`); revision satırı `CREATE/UPDATE/VERIFY/UNPUBLISH/QUARANTINE` |
| F1.3 | Bozuk satır karantinası | ✅ ama **fail-closed'ı yumuşatıyor** | `grant-catalog-live.ts:57-58` → `quarantineGrantCalls` (`:66-108`): `isPublished=false` + `QUARANTINE` revision + `logEvent`; `partitionGrantCatalogRows` (`grant-catalog-core.ts:238-258`) geçerli satırları servis eder | Tek bozuk satır artık tüm yüzeyleri düşürmüyor — ilk raporun 3.13 bulgusu **gerçekten** kapandı. Yan etki: bozuk satırı **`isPublished=false` yazan yol, aynı okuma isteğinin içinde** çalışıyor, yani bir GET yan etkisi olarak kalıcı yazma yapıyor (`:76-87`) |
| F1.4 | Tek deterministik `AND` skor motoru | 🟡 | `match-grants-for-profile.ts` ve `grant-match-api.ts` **diskte yok** (`faz1-score-widget.test.ts:87-88` `existsSync` ile kilitli); `grantBriefCriteria` 11 satır (`match-grant-programs-for-brief.ts:133-227`); `program-fit.ts:73-75` yalnız kısıtlı kriter oranı; kısıtsız çağrı `fitPct: null` | Üç yüzey (panel analizi, `/api/yetkinhibe/grant/match` teli, vitrin widget'ı) aynı `best.fitPct`'i basıyor. **Ancak 4. yüzey ayrıştı:** `engine.ts:263-276` `matchGrantProgramsForBrief`'i `now` **vermeden** çağırıyor → bkz. B-01 |
| F1.5 | NACE/il/ölçek kısıtlı dürüst kamu widget'ı | 🟡 | `public-eligibility.ts:39-70` gerçek `GrantProgramBrief` kuruyor; `:100-131` AND kapısından geçen en iyi satırı döndürüyor | Kafe + NACE 47 + `arastirma` kelimesi yok → **0%**, "eşleşmedi" ✅. Kafe + aynı cümle + "müşteri **araştırması**" → `investmentFocus:"arge"`, `rdMaturityLevel:"EARLY"` → **TÜBİTAK 1501 + 1507 uygun listeye giriyor**, skor %100. Uydurma çarpan (`estimateSupportMinor`) silinmiş ✅, etiket "Program üst limiti: ₺X" ✅ |
| F1.6 | Bakiye kontrolü LLM'den **önce** | ✅ | `paid-dossier.ts:100-105` `wallet.amountMinor < amount` → `{status:402}`; `generateGrantProject` çağrısı ancak `:163`'te; test `grant-paid-before-llm.test.ts:71-83` `not.toHaveBeenCalled()` ve `reservationCreate` `not.toHaveBeenCalled()` | Gerçekten önce. Rezervasyon da yazılmıyor. |
| F1.7 | Doğrudan `GRANT_DOSSIER` checkout + `/cuzdan` geçişi | 🟡 para yolu çalışıyor, **defter etiketi yanlış** | `order-purpose.ts:11,22,36`; `checkout.ts:36,50-54,63-66,75-79,174-178` (`kind="grant-dossier"`, `TZG` merchant oid, `masa=hibe`); `checkout/route.ts:17-21`; `grant-dossier-buy.tsx:11-58` (rıza + iframe + `href="/cuzdan"`); `cuzdan-return-signal.tsx:29` → `/panel/hibe` | Sipariş `GRANT_DOSSIER` açılıyor ✅, PayTR'ye iniyor ✅, dönüş hibe masasına düşüyor ✅. **Ama** `paid-lane.ts:420-428` bu niyet için `{applied:true, reason:"clearing_credited"}` döndürüp **hiçbir şey yazmıyor**; parayı cüzdana yazan tek yer `clearing.ts:149-156` ve orada etiket **`"Cüzdan yükleme"` / `WALLET_TOP_UP`**. Bkz. B-03 |
| F1.8 | Kalıcı şirket profili + açılabilir arşiv | ✅ | `hibe_company_profiles` (`yetkinhibe.prisma:73-92`, RLS `20261123180000:100-129`); `company-profile.ts:36-60`; kokpit boş açılışta `savedProfile` okuyor (`os-load.ts:196-239,323`); arşiv `hibeDossiers` yazımı `paid-dossier.ts:207-224`; liste `os-load.ts:241-275`; aç/indir `os-cockpit.tsx:404-413` + `app/api/yetkinhibe/dossier/[id]/export/route.ts:50-96` (sahiplik `userId`, 404) | Uçtan uca bağlı ✅ — docx/pdf/md üçü de gerçek. **Yan not:** profil yazımı `panel/hibe/page.tsx:34-36` içinde, yani **bir GET render'ında** `?hesap=1` görüldüğü anda `upsert` çalışıyor; idempotent ama yine de GET-yan-etkisi |
| F1.9 | Türkçe sayı sözlüklü halüsinasyon kalkanı | 🟡 **hem delik hem aşırı geniş** | `narrative.ts:11-18` regex'ler; `:21-29` `lineBanned`; `:96-107` `cleanDossierSection` | **Reddedilen:** "yüzde altmış oranla", "iki yüz bin lira", "Yüzde 60 oranla", "150 bin lira" ✅. **Geçen:** "Bu proje **yüzde 75 destek alır**." / "Fon yüzde 60 destek sağlar." / "Proje yüzde 75 desteklenecek." ❌ (çünkü `RATE_WORD` yalnız `oran` arıyor, `%`/rakam/`bin\|milyon` yok). **Yanlış ölen:** "Depo **iki yüz metrekare** olacak" ve "**iki bin adet** ürün kapasitesi" satırı düşüyor ve bölüm 12 karakterin altına indiği için **tüm dosya üretimi 503 + kota iadesine** gidiyor ❌ (`MAGNITUDE` + `WRITTEN_AMOUNT`). Yani ilk raporun 3.10 bulgusu **kapanmadı, yer değiştirdi** |
| F1.10 | `/hibe` SEO vitrini ≠ `/panel/hibe` kokpit | ✅ | `app/(public)/hibe/page.tsx:11-13` (`index:true`), `:39-63` (FAQ + katalog fiyatı + kayıt CTA'sı); `edge-guard.ts:52-53` `/panel/hibe` korumalı; `seo.ts:340` robots dışı; `seo.ts:291` sitemap; `page.tsx:46` `JsonLd` | Organik giriş mümkün ✅. `/hibe` artık `PROTECTED_KERNEL_PATHS`'ta değil; eski `app/(kernel)/hibe/page.tsx` **silinmiş** (`git status: D`), boş dizin kalmış (zararsız) |
| F1.11 | `AI_TOKEN_SOURCES.GRANT` | ✅ | `engine.ts:329-334` `source: AI_TOKEN_SOURCES.GRANT`; `grant-engine.test.ts` bunu kilitliyor | ⚠️ Bu madde ilk raporda **hiç yoktu**; Faz 1'in ekstra disiplini |

### 2.2 Faz 2 — İleri yetkinlikler

| # | İddia | Karar | Kanıt | Ölçülen davranış |
|---|---|---|---|---|
| F2.1 | 6 kuruma özel şablon, `grantId`'ye göre değişir | ✅ | `lib/yetkinhibe/templates/index.ts:99-128`; `kosgeb-is-plani` (SWOT/rekabet/istihdam), `tubitak-prodis-1501`, `tubitak-prodis-1507`, `ticaret-ihracat`, `kays-kalkinma`, `tkdk-ipard`; `engine.ts:354-361`, `details.ts:181-197` şablonu **hedef çağrıdan** seçiyor | KOSGEB ≠ 1501 ≠ 1507 bölüm ağaçları farklı; `faz2-institution.test.ts:38-53` kilitli. Eşleşmeyen kimlik `UNMAPPED`'e düşüp **iddia yazmıyor** (`index.ts:26-34`) — dürüst |
| F2.2 | Gerçek `<w:tbl>` DOCX + mevzuat izi | 🟡 tablo ✅, iz **boş** | `docx-document.ts:26-42` `<w:tbl>/<w:tr>/<w:tc>/<w:tcBorders>`, `:73-79` `Heading1/Heading2` + `pgMar` + `PAGE` alanlı footer + içindekiler; `tezgah/grant/document.ts:52-58,77-91,109-150` tablolar | DOCX tablolu ve stilli ✅. **Ama** `formatLegislationNote` (`legislation-trace.ts:36-55`) yalnız `sourceVerifiedAt` dolu satır için madde basıyor; `madde` alanı `engine.ts:363` `citeTemplateSections`'tan geliyor ve o da `specificationText` istiyor. **Katalogdaki 32 satırın 0'ında `specificationText` var** (`GRANT_CALL_SEEDS_2027.filter(s=>s.specificationText!=null).length === 0`) → her başlık `SPEC_SILENCE` basıyor |
| F2.3 | Sunucu taraflı indirilebilir PDF | 🟡 var, **kullanılabilir değil** | `plain-pdf.ts:103-235` gerçek `%PDF-1.4` + xref + sayfa ağacı; `export/route.ts:83-85` | PDF açılıyor ✅ ama 5×7 **nokta matrisi** ile çiziliyor (`plain-pdf.ts:4-66`); tablo hücresi 28 karakterde kesiliyor (`:161`) ve Türkçe olmayan her glif `BOX` kutusuna düşüyor (`:70-73`). Danışmanın müşteriye vereceği belge değil, **faks** |
| F2.4 | Şartname madde atıflı RAG | ❌ **altyapı var, veri yok** | `spec-rag.ts:71-138` (`chunkSpecification`, `Madde 3.1` / `sayfa 4` ayrıştırma), `:141-163` (`citeTemplateSections`, her başlık en çok bir madde, eşleşmezse `SPEC_SILENCE`) | Modül doğru çalışıyor ✅ — ama **çağıracak metin yok**. `migration 20261123203000` yalnız `specification_text`/`rules_json` **kolonunu** ekliyor; hiçbir satıra değer yazmıyor. Ölçüm: 1501 şablonunun **5/5 bölümü** "Şartname maddesi yok. Bu başlıkta cümle üretilmedi." basıyor. "Şartname madde atıflı RAG" bugün **hiçbir dosyada tek atıf üretmiyor** |
| F2.5 | 5 fazlı yaşam döngüsü + evrak kasası + ajans matrisi | ✅ (faz/evrak) / 🟡 (ajans) | `hibe_applications`, `hibe_documents`, `hibe_clients` şema (`yetkinhibe.prisma:113-184`) + migration `20261123220000:4-150` (`CHECK phase IN (...)`, `CHECK last_reminder_days IN (7,3,1)`, `CHECK category/status`, FORCE RLS + owner policy); rotalar `applications/route.ts:10-79`, `[id]/phase/route.ts:16-59`, `[id]/documents/route.ts:16-112`, `clients/route.ts:26-130`; faz sırası `grant-lifecycle.ts:203-213` (`phaseAdvanceError`); UI `lifecycle-desk.tsx:64-256` | Faz atlama/geri dönüş **reddediliyor** ✅ (`:272-274` 422). Evrak durumu sahibin kaydı ✅. Bağlantı `hibe-lifecycle-reminders` (`inngest.ts:626-645`) → kanca `app/api/(kernel)/jobs/register-grant-hooks.ts:10-14` → `kernelInngestFunctions` (`inngest.ts:685`) **gerçekten bağlı** ✅; 7/3/1 bandı CAS ile tekilleştirilmiş (`lifecycle-reminders.ts:71-79`) ✅ |
| F2.6 | Ajans çoklu müşteri matrisi | 🟡 **yapısal kör** | `agency-match.ts:41-75` `cardBrief`; `:77-86` `missingAxis`; `:93-135` matris | Ölçüm: 32 çağrının **29'unda `investmentFocus` dolu**; `cardBrief` yatırım odağını **sabit `"ihracat"`** yazıyor (`:68`) ve `missingAxis` odağı dolu her çağrıyı "eksik" kovasına atıyor. Sonuç: İstanbul'da 40 çalışanlı, ihracat yapan, NACE 10 bir müşteri kartı için uygun liste = **yalnız 3 İŞKUR satırı**, 8 satır "eksik". KOSGEB/TÜBİTAK/bakanlık/ajans çağrılarının hiçbiri ajans ekranında **eşleşemez**. Dürüst — ama ajansın tek sorusuna ("hangi müşteri hangi çağrıya") cevap vermiyor |
| F2.7 | Kişiselleştirilmiş haftalık radar → `/panel/hibe` | ✅ | `radar-profile.ts:86-101` AND kapısı, `:103-125` metin, `:21` `HIBE_PANEL_PATH`; `weekly-radar.ts:66-71` profil okuma, `:88-106` filtreli satır, `:113` bağlantı | Genel ilk-3 kalktı ✅, bağlantı `/panel/hibe` ✅, profil yoksa "profilin kayıtlı değil" ✅. **Kusur:** alıcı listesi `tezgahOutputs` **veya** `academyCertificates` **veya** `commerceStores` olanlarla sınırlı (`weekly-radar.ts:58-62`) — sadece hibe profili doldurmuş bir üye **hiç mektup almıyor** |
| F2.8 | E-ticaret köprüsü + `sourceVerifiedAt` + mağaza sahipliği | ✅ | `lib/commerce/grant-ribbon.ts:26-40` (`sourceVerifiedAt == null` → atla, `isGrantVerificationFresh` → atla); `os-load.ts:70-79`; `store-prefill-live.ts:14-22` (`ownerUserId: userId`); `store-prefill.ts:28-50` (sözlük eşleşmezse NACE boş) | İlk raporun 3.17 bulgusu **gerçekten** kapandı ✅. Sahiplik kapısı ✅. Çalışan/yaş uydurulmuyor ✅. **Kusur:** `os-growth.ts:28-37` bağlantı `yatirim: "ihracat"` **sabit** ve `hesap=1` yok → mağaza bağlantısı analizi otomatik çalıştırmıyor, perakende mağazayı ihracat odağına itiyor |

### 2.3 Kapanmayan eski bulgular (regresyon değil, ihmal)

| Eski # | Bulgu | Durum | Kanıt |
|---|---|---|---|
| 3.16 | Kernel, dikeyin tablosunu Prisma ile okuyor | ❌ **hiç dokunulmadı** | `lib/kernel/market-demand/platform-demand-port.ts:120-141` hâlâ `getPrisma().yetkinhibeGrantCall.findMany` |
| 3.22 | Ölü kod + yanlış yeşil test | 🟡 4 silindi, 3 kaldı | Silinen: `analyze-grant-eligibility-gap`, `build-preview-gap-from-criteria`, `calculate-grant-budget`, `grant-fail-closed`, `match-grants-for-profile`, `grant-match-api` ✅. Kalan ve **0 canlı tüketici**: `preview-idea-validator.ts`, `preview-match-score.ts` (eski katalog kimlikleri + `+24` anahtar kelime + `98` tavanı hâlâ içinde), `home-offer-state.ts`. `wizard-navigation.ts` yalnız testte |
| 3.15 | `closed-room` sicili gerçek davranışla çelişiyor | 🟡 kısmen | `web-only-write-routes.ts:1177-1192` hâlâ `/api/yetkinhibe/grant/catalog` ve `grant/match` için `"closed-room"` yazıyor; oda açık (`dronlar/kayit.ts:135-141`, `kapali: false`) |
| 3.21 | Ücretsiz üretimde `Idempotency-Key` opsiyonel | ❌ aynı | `command-key.ts:8-13` başlık yoksa `{ok:true, key:null}` — hibe ücretsiz hattı hâlâ bu yolu kullanıyor |

---

## 3. Tespit Edilen Yeni Gözlemler / Canlı Operasyon Notları

### B-01 `[KRİTİK]` Katalog 30 gün sonra kendiliğinden kapanıyor; toplu yeniden doğrulama yolu yok

**Ölçüm (çalıştırıldı):**

```
2026-11-23T12:00Z   openVerified=32   widget=100%
2026-12-22T12:00Z   openVerified=32   widget=100%
2026-12-23T08:59Z   openVerified=32   widget=100%
2026-12-23T09:01Z   openVerified= 0   widget=  0%   ← devrilme anı
2026-12-24T12:00Z   openVerified= 0   widget=  0%
```

**Kök neden:** `GRANT_SEED_VERIFIED_AT = "2026-11-23T09:00:00.000Z"` (`grant-call-seed-2027.ts:10`) ve `GRANT_VERIFICATION_MAX_AGE_MS = 30 gün` (`grant-catalog-core.ts:27`). 32 satırın **tamamı** aynı saniyeye damgalı. Otuz gün sonra `isGrantVerificationFresh` hepsi için `false` döner (`:118-131`) ve `matchGrantProgramsForBrief` onları `eligible`'dan `unverified`'a taşır (`:320-352`).

**O gün ne oluyor:**
- Vitrin widget'ı: `openCallCount: 0`, `"Bu profil için katalogda açık çağrı eşleşmedi."` (`public-eligibility.ts:34,117-124`)
- `/panel/hibe` uygun listesi: boş; her satır "doğrulanmamış" notuna düşer (`grant-project-notes.ts`)
- Proje dosyası: `matched.eligible.length === 0` → `GRANT_DOSSIER_NO_ELIGIBLE`, kota iadesi, 400 (`engine.ts:285-291`)
- Haftalık radar: `"Kayıtlı profiline uyan doğrulanmış açık çağrı yok."` (`radar-profile.ts:116-118`)
- E-ticaret şeridi: boş (`grant-ribbon.ts:33-35`)

**Ve düzeltecek toplu komut yok.** `verifyGrantCall(id)` **tek satır** (`grant-call-admin.ts:257-259`); CLI `verify --id` zorunlu (`scripts/ops-grant-call.ts:63-66`); `seedMissingGrantCalls` yalnız eksik satır ekler, mevcut satıra dokunmaz (`:316-372`); `grantCatalogVerify` Inngest işi sadece **uyarı logu** atıyor, `sourceVerifiedAt`'ı **güncellemiyor** (`grant-catalog-verify.ts:30-51`).

**Sonuç:** 23 Aralık 2026 sabahı operatör ya 32 ayrı CLI çağrısı yapacak ya da ürün dört yüzeyde birden "hibe yok" diyecek. İlk raporun "26 Kasım'da boş kalıyor" bulgusu **kapanmadı; 28 gün ileri taşındı ve tarih artık biliniyor**.

### B-02 `[KRİTİK]` Doğrulama tazeliği iki hatta farklı uygulanıyor: panel "hayır", ücretli hat "evet"

`engine.ts:263-276` `matchGrantProgramsForBrief`'i **`now` parametresi olmadan** çağırıyor. `match-grant-programs-for-brief.ts:320-322`:

```320:322:lib/yetkinhibe/match-grant-programs-for-brief.ts
    const verifiedAt = text(call.sourceVerifiedAt);
    const verified = now ? isGrantVerificationFresh(verifiedAt, now) : verifiedAt !== null;
```

`now` yoksa **yalnız `null` kontrolü** yapılıyor. Ölçüm (aynı katalog, 10 Ocak 2027, doğrulama 48 gün eski):

```
PANEL   (with now)        eligible=0   unverified=8
DOSYASI (without now)     eligible=8   unverified=0
DOSYASI_IDS = kosgeb-kapasite-gelistirme-2027-1, istka-yatirim-2027,
              iskur-isbasi-2027, iskur-engelli-istihdam-2027, ...
```

**Etki:** Aynı kullanıcı aynı anda analiz sekmesinde "doğrulanmamış" görüp, **1.490 TL ödediği dosyada** o çağrıyı uygun program olarak bastırıyor. Bu, ilk raporun 3.17 bulgusunun ("iki yüzey aynı çağrı için farklı dürüstlük sergiliyor") **ters yönde ve daha pahalı** hâli: yanlış taraf artık para alan taraf. Düzeltme tek satır (`calls, now`), ama bugün kodda yok.

### B-03 `[YÜKSEK]` `GRANT_DOSSIER` ödemesi deftere "Cüzdan yükleme" olarak yazılıyor; iade semantiği çelişiyor

`paid-lane.ts:420-428` bu niyet için:

```420:428:lib/tezgah/paid-lane.ts
  if (
    input.purpose === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER ||
    classifyPaymentOrderPurpose(input.purpose) === PAYMENT_ORDER_PURPOSE.GRANT_DOSSIER
  ) {
    const catalog = await liveCatalogAmount(TEZGAH_PRO_MODULE, TEZGAH_GRANT_UNIT);
    if (catalog == null || catalog !== input.amountMinor) {
      return { applied: false, reason: "catalog" };
    }
    return { applied: true, reason: "clearing_credited" };
  }
```

Hiçbir yazma yok — "credited" diyor, kredi yazmıyor. Parayı cüzdana yazan tek yer `clearSuccessfulPaymentOrder` (`clearing.ts:149-156`) ve o **her sahipli sipariş için** koşulsuz çalışıyor:

```149:156:lib/kernel/payments/clearing.ts
    await appendLedgerEntry(tx.ledger, {
      ...
      label: "Cüzdan yükleme",
      purpose: WALLET_TOP_UP_PURPOSE,
```

**Üç sonuç:**
1. **Muhasebe:** 1.490 TL'lik ürün satışı, defterde "cüzdan yükleme" olarak görünüyor. Ürün bazlı gelir/maliyet ölçümü (F2.8 hedefi) bu satırla **imkânsız**.
2. **Bildirim:** kullanıcıya `wallet_cleared` bildirimi gidiyor (`clearing.ts:164-171`), dosya satın alma bildirimi değil.
3. **İade:** `order-purpose.ts:44-51` `GRANT_DOSSIER`'ı "aktive edilmiş ürün" sayıp iade dışı bırakıyor; `wallet-card-refund.ts:114-118` bu satırın kart iadesi payını **atlıyor**. Dosya hiç üretilmezse bakiye kullanılamaz durumda kalıyor, kart iadesi de yapılamıyor.

Ayrıca ödeme ile üretim arasında **komut anahtarı bağı yok**: PayTR siparişi `crypto.randomUUID()` ile açılıyor (`grant-dossier-buy.tsx:31`), dosya üretimi başka bir `uuid` ile (`project-desk.tsx:122`). Kullanıcı ödedikten sonra `/panel/hibe`'ye düşüp **formu baştan dolduruyor**.

### B-04 `[YÜKSEK]` Ajans satırının fiyatı da ödeme yolu da yok

`catalog-write.ts:110-124` `hibe/dossier` ve `hibe/agency` birimlerini **açılabilir** ilan ediyor. Ama:
- `prisma/migrations/**/*.sql` içinde `'hibe'` module satırı **yok** (price catalog seed'lerinde yalnız `tezgah/grant-dossier` = 149.000 kuruş var, `20261118160000_launch_price_catalog/migration.sql:63-69`).
- Bu yüzden `os-load.ts:178-179` her zaman `null` döner ve kokpit "**Ajans katalog satırı açık değil. Tutar uydurulmaz.**" basar (`agency-desk.tsx:37`) — dürüst, ama boş.
- `checkout.ts:36` `TezgahCheckoutKind = "pro" | "credit-pack" | "grant-dossier"`; `agency` için **hiçbir ödeme türü yok**. Ajans modu bugün **satılamaz**.

Yani "Ajans Lansmanı" için `[YÜKSEK]` bir açık kapı var: ekran var, matris var (kör), fiyat yok, satın alma yok.

### B-05 `[YÜKSEK]` Vitrin widget'ı gülünç sonuç üretiyor: kafe → "%100 · İŞKUR Engelli İstihdam Teşviki"

Ölçüm (gerçek 32 satır, gerçek motor, 23 Kasım 2026):

| Ziyaretçi girdisi | Widget sonucu |
|---|---|
| "Mahallede kafe açacağım" · NACE 47 · İstanbul · mevcut KOBİ | **%100** · "İŞKUR Engelli İstihdam Teşviki 2027" · "Program üst limiti: ₺150.000" |
| "…müşteri **araştırması** yapacağım" (aynı fikir) | **%100** · "İŞKUR Engelli İstihdam Teşviki" — ve uygun listeye **TÜBİTAK 1501 + 1507** giriyor |
| "Makine imalat atölyesi kuracağım" · NACE 28 · mevcut KOBİ | **%100** · "AB IPA Rekabetçilik ve Yenilik Hibe Çağrısı" |
| Aynı girdi, **26 Aralık** | **%0** · "eşleşmedi" |

**İki ayrı kusur:**
1. **`fitPct` = farklı kısıtlı kriterlerin oranı.** `İŞKUR Engelli İstihdam` satırında `investmentFocus: null`, `nacePrefixes: null`, tek kısıt `requiresKobiStatus` (`grant-call-seed-2027.ts:521-535`) → **1/1 = %100**. Kafe fikri ile engelli istihdam teşviki arasında hiçbir ilişki yok, ama sayı %100 ve `os-cockpit.tsx:293` o sayıyı **2xl puntoyla** basıyor.
2. **`publicGrantBrief` anahtar kelime kapısı.** `public-eligibility.ts:47` `const rd = /ar-?\s?ge|araştırma|arastirma/.test(idea);` → "pazar **araştırması**" yazan her ziyaretçi `investmentFocus:"arge"` + `rdMaturityLevel:"EARLY"` oluyor (`:50-52,67`). İlk raporun "kafe + Ar-Ge yok → 1507 listelenmez" kabul ölçütü, **Türkçede en sık geçen iş-planı kelimesiyle** deliniyor. Test bunu görmüyor çünkü fikstür "Mahallede kafe açacağım." (`faz1-score-widget.test.ts:158`).

**Ayrıca:** `employeeCount` ve `companyAgeYears` ziyaretçiye **sorulmuyor**; `audience`'a göre sabit 3/1 veya 15/5 yazılıyor (`:65-66`). Yani 1 kişilik dükkân profili, 15 çalışanlı KOBİ olarak değerlendiriliyor.

### B-06 `[ORTA]` Word/PDF çıktısında "Adam-ay" kolonu **literal olarak** "Sayı yazılmadı" basıyor

```20:23:lib/tezgah/grant/document.ts
  return template.workPackages.map((row, index) => {
    const windowLabel = dossier.workPackages[index]?.windowLabel ?? "süre boş";
    const [start, end] = windowEnds(windowLabel);
    return [row.name, start, end, "Sayı yazılmadı", row.successMeasure];
```

TÜBİTAK PRODİS'in **zorunlu** iş paketi–adam-ay matrisi, teslim edilen Word dosyasında dördüncü kolonu "Sayı yazılmadı" olan bir tablo. Dürüstlük doğru, ürün **yarım**: danışman bu tabloyu müşteriye veremez. İlk raporun 3.6 bulgusu tablo/stil tarafında kapandı, **içerik tarafında kapanmadı**.

### B-07 `[ORTA]` `siz` aksı kaçakları `lib/tezgah`'a taşınarak kapıdan kaçırıldı

`lib/tezgah/catalog.ts:284,290,296`:

```
"İşletme adınızı yazınız..."
"Adınızı yazınız..."
"İl seçiniz..."
```

Bu dosya hibe sihirbazının alan tanımıdır (`TEZGAH_TOOLS` → `grant` → `fields`), `workbench.tsx:1265` tarafından basılır. `verify:sen-axis` yeşil çünkü `SCAN_DIRS = ["app","components","lib/copy"]` (`scripts/verify-sen-axis.ts:17`) — `lib/tezgah` **taranmıyor**. Kapıya `seçiniz/yazın/dönersiniz/fikrinizi` kalıpları eklenmiş (`:104-107`) ✅, ama kapsam dışındaki dosyayı hiçbir kalıp yakalayamaz. **Kural eklendi, denetim alanı büyütülmedi.**

### B-08 `[ORTA]` Katalog okuması kalıcı yazma yapıyor (GET → UPDATE)

`grant-catalog-live.ts:57-58` her okumada karantina yazımını tetikliyor; `quarantineGrantCalls` (`:76-87`) `isPublished=false` + revision yazıyor. Yani bir **anonim `GET /api/yetkinhibe/grant/catalog`** çağrısı, veritabanında kalıcı durum değiştirebiliyor. Fail-closed'ın doğru sonucu, ama yazma yetkisi okuma yoluna sızmış. Karantina ayrı bir bakım işine (veya admin onayına) taşınmalı.

### B-09 `[ORTA]` `/hibe` vitrininde aynı ürün için iki fiyat kaynağı var, biri boş

`app/(public)/hibe/page.tsx:38-44` fiyatı `loadPublicPricingVitrine().grantDossier` → `tezgah/grant-dossier` satırından okuyor (149.000 kuruş). Kokpit ise ayrıca `hibe/dossier` satırını okuyup "Dosya kataloğu: …" basıyor (`os-load.ts:178`, `os-cockpit.tsx:124-126`). İkinci satır hiç seed edilmediği için o etiket **hiç görünmeyecek**, ajans etiketi ise **her zaman** "açık değil" diyecek. İki kaynak, tek ürün, sıfır tutarlılık garantisi.

### B-10 `[ORTA]` Haftalık radar yalnız "başka ürün kullanmış" üyelere gidiyor

`weekly-radar.ts:58-62` alıcı kitlesi `tezgahOutputs`/`academyCertificates`/`commerceStores` üzerinden seçiliyor. Sadece hibe profili doldurmuş bir KOBİ — yani bu modülün **tam hedef kitlesi** — haftalık radarı **hiç almıyor**. Kişiselleştirme (F2.9) doğru, **dağıtım kitlesi** yanlış.

### B-11 `[ORTA]` Yeni testler bazı maddeleri "doğruluyor" ama davranışı ölçmüyor

- `faz1-score-widget.test.ts:158` "Mahallede kafe açacağım." — `araştırma` kelimesi yok, B-05'in asıl deliği test dışı.
- `grant-paid-before-llm.test.ts` yalnız 402 dalını ölçüyor; `engine.ts`'in `now`'suz çağrısını (B-02) hiçbir test görmüyor.
- `faz2-institution.test.ts:90-116` `formatLegislationNote`'u **elle verilmiş** `madde: "3.1"` ile doğruluyor; gerçek katalogda `specificationText` olmadığı için üretimde bu satır **hiç oluşmuyor** (F2.4).
- 505 yeşil test, B-01/B-02/B-05/B-06'nın hiçbirini yakalamıyor. Test sayısı arttı, **test kapsamı ürün riskine göre kaymadı**.

### B-12 `[DÜŞÜK]` Kozmetik ama sicil bozucu

- `lib/tezgah/catalog.ts:290` hibe sihirbazında alan etiketi **"Freelancer adı"** — bireysel KOBİ'ye "freelancer" deniyor (`project-desk.tsx:235` de aynı).
- `web-only-write-routes.ts:1177-1192` hâlâ `closed-room` (oda açık).
- `app/(kernel)/hibe/` boş dizin olarak duruyor.
- `engine.ts:363` `targetArticle` yalnız `cited.find(s=>s.article)` ile ilk maddeyi alıyor; kalan 4 bölümün atfı `dossier.templateSections`'a düşüyor ama `report.eligible[].madde` **tek** madde taşıyor (`:414-419`) — mevzuat izi tablosunda satır başına tek atıf.

---

## 4. Resmî Tam Ölçekli Ticari Ürün Kararı

### 4.1 Karar

> ## **ŞARTLI ONAY** (Koşullu)
>
> **Modül 85 / 100 barajını GEÇMEDİ (72 / 100).**
> **Tam Ölçekli Ticari Ürün (Self-Serve & Ajans Lansmanı) onayı VERİLMEDİ.**
> Bireysel self-serve lansmanı **3 bloke edici koşulun** kapanmasına bağlı olarak koşullu onaylanır. **Ajans lansmanı RED** — ajans satılamaz durumda (B-04) ve matrisi işlevsiz (F2.6).

**Gerekçe (tek paragraf):** Faz 1 ve Faz 2 gerçek mühendisliktir; ilk rapordaki üç `[KRİTİK]` bulgunun ikisi (katalog yazma yolu, ödeme hunisi) ve beş `[YÜKSEK]` bulgunun dördü kod üzerinden doğrulandı. Ancak modül, lansman tarihinden **30 gün sonra** kendi kendine tükenecek şekilde damgalanmış (B-01), doğrulama tazeliğini para alan hatta atlıyor (B-02), ve ticari farklılaşmanın iki ana ayağı — şartname atıflı dosya (F2.4) ile ajans çoklu müşteri matrisi (F2.6) — bugün **hiçbir iş çıkarmıyor**. 85 puan, ürün "çalışıyor" demek değil; "çalışmaya devam ediyor" demektir. Bu modül henüz ikincisini kanıtlamadı.

### 4.2 Bloke edici koşullar (lansman öncesi zorunlu)

| # | Koşul | Bağlı bulgu | Kabul ölçütü (ölçülebilir) |
|---|---|---|---|
| **Ş1** | **Katalog tazelik penceresi kırılmayacak** | B-01 | `ops-grant-call.ts` içine `verify --all` (veya `refresh --older-than 25d`) komutu; Inngest `grant-catalog-verify` işi 30 gün eşiğine giren satırları **otomatik yeniden doğrulayacak** ya da admin kuyruğuna düşürecek; **31 Aralık 2026 tarihinde `openCallCount ≥ 20`** olacak şekilde bir test. Bugün bu test yok. |
| **Ş2** | **Tek doğruluk: para alan hat da tazeliği uygulayacak** | B-02 | `engine.ts:263` `matchGrantProgramsForBrief(..., calls, now)` — `now` zorunlu hale getirilecek, `now?` opsiyonelliği kaldırılacak; "48 gün eski doğrulama → 0 uygun" testi (`tests/tezgah/grant-engine.test.ts`). |
| **Ş3** | **`GRANT_DOSSIER` para yolu tek etiket, tek komut** | B-03 | (a) defter satırı `purpose: GRANT_DOSSIER`, `label: "Hibe proje dosyası"`; (b) PayTR siparişi ile dosya üretimi **aynı `commandKey`**'e bağlanacak (`paid-dossier` zaten `Idempotency-Key` istiyor); (c) `fulfillTezgahOrder`'ın `clearing_credited` no-op'u ya gerçek yazmaya ya `applied:false`'a dönecek; (d) `isActivatedProductRefundBlocked` bu niyet için gözden geçirilecek. |

### 4.3 Bloke etmeyen ama lansman notunda beyan edilmesi gereken koşullar

| # | Koşul | Bağlı bulgu |
|---|---|---|
| Ş4 | Vitrin widget'ı `fitPct` yerine **"kaç kısıt geçti / kaç kısıt var + kısıt listesi"** gösterecek; `araştırma` kelimesi Ar-Ge kanıtı sayılmayacak; çalışan/yaş ziyaretçiye sorulacak (veya "varsayılan 15 çalışan" açıkça yazılacak) | B-05 |
| Ş5 | Şartname atıfı: ya 32 satırın en az 6'sına `specificationText` girilecek, ya "şartname atıflı" iddiası siteden kaldırılacak | F2.4 |
| Ş6 | `hack`: `hibe/dossier` + `hibe/agency` ya seed edilip ödeme yoluna bağlanacak ya `CATALOG_OPENABLE_UNITS`'tan çıkarılacak | B-04, B-09 |
| Ş7 | Ajans matrisi: kartta `investmentFocus` alanı (veya "odağı belirt" zorunlu alanı); "eksik" kovası yatırım odağını **sormadan** çağrıyı elememeli | F2.6 |
| Ş8 | Word `Adam-ay` kolonu gerçek sayı veya "adam-ay matrisi şartname madde X'te istenir" atfı | B-06 |
| Ş9 | `verify:sen-axis` `SCAN_DIRS`'a `lib/tezgah` eklenecek; `"yazınız"`, `"seçiniz"`, `"Adınızı"` kalıpları | B-07 |
| Ş10 | Radar alıcı kitlesine `hibeCompanyProfile` sahipleri eklenecek | B-10 |
| Ş11 | Karantina yazımı GET'ten çıkarılacak | B-08 |
| Ş12 | `[ORTA]` eski bulgu 3.16 (kernel → dikey tablo) ve 3.15 (`closed-room` sicili) kapatılacak | §2.3 |

### 4.4 Ne zaman 85+ olur

Ş1–Ş3 kapandığında: Mimari 76→**84** (tek doğruluk + para yolu tek etiket), İşlevsellik 74→**83** (tazelik penceresi kırılmıyor), Farklılaşma 66→**72**, UX 72→**78** → `84×0,25 + 83×0,30 + 72×0,25 + 78×0,20 = 21,0 + 24,9 + 18,0 + 15,6 = **79,5**`.

Ş4–Ş7 de kapandığında (widget dürüstlüğü + şartname verisi + ajans odağı + ajans fiyatı): Farklılaşma **→ 86**, UX **→ 84**, İşlevsellik **→ 88** → `84×0,25 + 88×0,30 + 86×0,25 + 84×0,20 = 21,0 + 26,4 + 21,5 + 16,8 = **85,7** → 86 / 100`. **Bu, gerçek 85+ eşiğidir.** Yol haritası ilk rapordakiyle aynı; eksik olan iş hacmi değil, **iki dürüstlük kapısının tekilleştirilmesi** (Ş1–Ş2) ve **iki ticari iddianın veriyle doldurulması** (Ş5–Ş7).

### 4.5 İmza

| Alan | Değer |
|---|---|
| Nihai puan | **72 / 100** (önceki 46) |
| Eksenler | Mimari 76 · İşlevsellik 74 · Farklılaşma 66 · Vitrin 72 |
| Karar | **ŞARTLI ONAY** — bireysel self-serve, Ş1–Ş3 sonrası |
| Ajans lansmanı | **RED** — B-04 + F2.6 |
| 85+ onayı | **VERİLMEDİ** |
| Doğrulama kapıları | 7/7 yeşil (testler 70 dosya / 505 test) — *ve yine de dört kritik bulgu yeşil geçti* |
| Değiştirilen kaynak dosya | **0** |

> Bu raporun en can alıcı cümlesi kapı tablosunda değil, B-01'de: **23 Aralık 2026, 09:01.** O dakikada kodda hiçbir satır bozulmadan 32 çağrı "doğrulanmamış" olacak. Bugün bunu engelleyen tek şey, o tarihe kadar birinin 32 kez `npm run ops:grant-call -- verify --id <...>` yazması. Bir ticari ürünün "çalışıyor" sayılması, böyle bir insan sözüne bağlı olamaz.

**Rapor sonu.** Bu belge dışında hiçbir dosya oluşturulmadı, değiştirilmedi, silinmedi.
