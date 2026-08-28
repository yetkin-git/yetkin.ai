# 03 — TESPİT RAPORU: AKADEMİ MVP VE BUDAMA

| Alan | Değer |
|------|--------|
| Görev | GÖREV 03 — Akademi’nin MVP’ye indirgenmesi (tespit, kod yok) |
| Tarih | 28 Ağustos 2026 |
| Rol | Baş mimar (Cursor / Grok) — Super Admin’e, CEO kontrolünde |
| Kaynak | Disk: `lib/academy`, `components/academy`, `prisma/schema/academy.prisma`, hop sicili, `apps/rail-is`, GÖREV 01/02, Anayasa A2/A4/A7/A9, Manifesto Kural 3 (Apple 3.1.1) |
| Ürün kodu | Bu raporda **değiştirilmedi.** |
| PayTR | **Pasif kabul duruyor.** Kasa kodu cüzdan DEBIT + `QuickTopUpModal`; kurs sayfasında doğrudan PayTR iframe yok. |
| İlişki | GÖREV 01 akademi tavanını ölçtü (≈23 646 satır). GÖREV 02 omurga sızıntısını kesti; **içerik fabrikasını dondurmadı.** Bu metin o Adım 0’ın icra haritasıdır. |

Kurallar kutsal değildir. Nakit halkası tek kullanıcıyla dönecekse ürün **üç ekrandır.** Pedagoji fabrikası, stüdyo ve mühür endüstrisi satış değildir. Çelişkide disk gerçektir.

**Üç hedef (ürün anayasası, bu görev için):**

1. **Vitrin** — eğitimler görülür, seçilir.
2. **Kasa** — eğitim PayTR ile güvenle alınır.
3. **Oynatıcı** — alınan eğitim pürüzsüz izlenir.

Bu üçlünün dışında kalan her şey ya **dondurulur**, ya **izole edilir**, ya (bağımlılık kesildikten sonra) **silinir.** İlk PR’da toptan `rm` yok — sistem çöker.

---

# 0. FİİLİ ÖLÇÜ (İDDİA DEĞİL)

Bugün (`Measure-Object -Line`, 28 Ağustos 2026):

| Bölge | Dosya | Satır (≈) |
|-------|------:|----------:|
| `lib/academy` | 96 | 23 373 |
| `components/academy` | 34 | 6 539 |
| `tests/academy` | 47 | 8 684 |
| `app/academy` + `app/api/academy` | 26 | düşük yüzler (BFF ince; motor şişik) |
| **Toplam akademi yüzeyi** | | **≈38 600** |

GÖREV 01 `lib/academy` ≈23 646 demişti. Motor **küçülmemiştir.** Kariyer hâlâ ≈918 satır; freelancer ≈3 306. Amiral gemisi diye seçilen oda, diğer iki odanın toplamının **katıdır.**

Vitrin zaten dört SKU’ya kilitli (`python-temel`, `fullstack-temel`, `ai-temel`, `ux-temel` — `pilot-sku.ts`). Katalog süzgeci sayfada **yok** (`course-list` `FilterBar` import etmez). Buna rağmen `catalog-filter.ts` 786 satır, `filter-bar.tsx` 320 satır, `real-world-pedagogy.ts` 3 651 satır duruyor. **Ürün daralmış, fabrika durmamış.**

Mevcut “mutlu yol” (`lib/academy/index.ts`) altı basamak iddia eder: katalog → kilit → settle → müfredat → sınav → belge. CEO kararı bunu **üç ekrana** indirir. Sınav/belge/vize **nakit halkası değildir**; pazaryeri kalite kapısıdır. MVP’de büyütülmez, ilk günde de silinmez (A4 + `CareerVisaStamp`).

---

# 1. KOD BUDAMA ROTASI

Karar üç kovadır. Karıştırmayın.

| Kova | Anlam | İlk hafta |
|------|--------|-----------|
| **DONDUR** | Yeni satır yok. Import durur. Ürün CTA’sından gizlenir. Dosya yerinde kalır. | Evet |
| **İZOLE** | `archived/lib/academy-*` veya `lib/academy/_frozen/` — canlı oynatıcı import etmez. | Evet (taşıma PR’ı) |
| **SİL** | Import grafı ve surface test kesildikten sonra. | Hayır — 2. dalga |

Studio odası zaten `archived/` + kenar 410. Akademi **kendi içinde ikinci bir stüdyo** yazmış: TTS, canlı soru, 5 perde, CastRegistry, SVG diyagram fabrikası. Donmuş oda geri gelmemiş; **oynatıcının karnına gömülmüş.**

## 1.1 Pedagoji fabrikası — İZOLE (sonra sil)

Oynatıcı `curriculum.ts` üzerinden bu dosyaları **doğrudan** örer. Önce `curriculum.ts` sade gövdeye iner; sonra fabrika taşınır. Tersi = derleme kırığı.

| Dosya | Satır (≈) | Ne işe yarıyor | Kova |
|-------|----------:|----------------|------|
| `lib/academy/real-world-pedagogy.ts` | 3 651 | Her ders anahtarına ısınma hikâyesi + alıştırma sözlüğü | İzole |
| `lib/academy/field-voice.ts` | 2 028 | Saha pusulası / Koray ara soru sözlüğü | İzole |
| `lib/academy/sealed-diagrams.ts` | 955 | El çizimi SVG diyagram fabrikası | İzole |
| `lib/academy/instructors.ts` | 551 | Eğitmen biyografisi, ses kimliği, moderatör | Dondur (vitrin 1 satır yeter) |
| `lib/academy/lesson-body.ts` | 656 | 5 perdeli montaj, konuşmacı ayrımı | İzole → ince `body` string |
| `lib/academy/storyboard.ts` | 230 | Stüdyo hikâye tahtası | İzole |
| `lib/academy/pedagogy-doctrine.ts` | 62 | PEDAGOJI.md’nin kod gölgesi | Dondur |
| `lib/academy/growth-pedagogy.ts` | 41 | Büyüme SKU pedagoji alias | İzole |
| `lib/academy/growth-visuals.ts` | 55 | Görsel kopya haritası | İzole |
| `lib/academy/term-glossary.ts` | 133 | Terim sözlüğü | İzole |
| `lib/academy/acronym-normalizer.ts` | 189 | TTS/metin kısaltma | İzole (dinle ile gider) |
| `lib/academy/mentor-voice.ts` | 49 | Mentor sesi | İzole |
| `lib/academy/learning-outcomes.ts` | 38 | Çıktı mühürü | Dondur (sınav mührü kullanır) |
| `lib/academy/curricula/growth-draft.ts` | 35 | Taslak müfredat | İzole |
| `.system_docs/PEDAGOJI.md` | — | Fiili üçüncü anayasa (CastRegistry, %6 Maya, 5 perde) | **Ürün notuna indir.** Derleme kırıcısı zaten değil; ajan kırmızı çizgi **sanmasın.** |

`verify:academy-pedagogy-seals` nightly’dedir, `verify:prebuild` içinde değildir (GÖREV 01 doğru ayırmış). Budamada nightly’yi büyütmeyin; fabrikayı kesince bu betik **davranış testine** veya silinmeye iner. Yeni `verify:*` yok.

## 1.2 Stüdyo / TTS / dinle — İZOLE (bayrak, sonra sil)

`ACADEMY_LESSON_LISTEN_ENABLED = true` (`lesson-listen.ts`). GÖREV 02 sözleşmeyi dürüstleştirdi (`lesson-audios` istisnası); **dinlemeyi kapatmadı.** MVP oynatıcısı HTML5/canvas videodur; Gemini TTS nakit halkası değildir.

| Dosya / yüzey | Satır (≈) | Kova |
|----------------|----------:|------|
| `components/academy/lesson-listen-button.tsx` | **1 872** | İzole — tek bileşen, oynatıcıdan büyük |
| `lib/academy/lesson-listen.ts` | 796 | İzole |
| `lib/academy/lesson-listen-engine.ts` | 595 | İzole |
| `lib/academy/listen-audio-store.ts` | 327 | İzole (`AcademyAudioCache` yazarı) |
| `lib/academy/listen-route.ts` | 291 | İzole |
| `lib/academy/lesson-transcript-sync.ts` | 307 | İzole (dinle + altyazı senkron) |
| `lib/academy/lesson-listen-script.ts` | 240 | İzole |
| `lib/academy/studio-live.ts` | 213 | İzole — canlı soru hakkı, süreç belleği, Prisma yok |
| `lib/academy/listen-mock-tts.ts` | 53 | İzole |
| `lib/academy/lesson-listen-web-speech.ts` | 72 | İzole |
| `lib/academy/lesson-listen-focus.ts` | 115 | İzole |
| `components/academy/use-academy-listen-sync.ts` | 107 | İzole |
| `components/academy/use-academy-transcript-sync.ts` | 96 | İzole |
| `app/api/academy/generateSpeech/route.ts` | — | 410 veya sil (2. dalga) |
| `app/api/academy/courses/[id]/listen/route.ts` | — | 410 veya sil (2. dalga) |

`LessonMediaPlayer` (570 satır) dinle düğmesini ve `sealed-diagrams` tuvalini **içe aktarır.** Oynatıcıyı pürüzsüzleştirmek = bu iki bağı koparmak; oynatıcıyı yeni özelliklerle doldurmak değil.

## 1.3 Karmaşık içerik üretim / LMS tiyatrosu — DONDUR veya SİL (2. dalga)

Bunlar son kullanıcıya satış getirmez. Bir kısmı **Prisma tablosu bile değildir** (süreç içi `Map`). CMS vaadi yalandır; pod restart’ta kaybolur.

| Dosya / yüzey | Satır (≈) | Not | Kova |
|----------------|----------:|-----|------|
| `lib/academy/catalog-filter.ts` | 786 | Vitrin süzgeç kullanmıyor; sıra/modül kodu hâlâ import | İncelterek dondur; UI sil |
| `components/academy/filter-bar.tsx` | 320 | Canlı vitrinde yok; test tutuyor | Sil (2. dalga) |
| `lib/academy/moderation.ts` | 374 | Yıldız → revizyon kararı sınıflayıcı | İzole |
| `lib/academy/reviews.ts` + `reviews-engine.ts` | 132+252 | Bellek sicili | İzole |
| `lib/academy/curriculum-revisions.ts` | 286 | “Onay tohum yazmaz” diye **kendisi itiraf eder** | İzole |
| `components/academy/curriculum-revision-board.tsx` | 102 | Admin tiyatro | İzole |
| `app/(kernel)/admin/curriculum-revisions/` | — | Super Admin kuyruk UI | İzole |
| `lib/academy/lesson-discussion.ts` + engine | 85+66 | Bellek sicili | İzole |
| `components/academy/lesson-discussion.tsx` | 234 | Oynatıcıya gömülü | Oynatıcıdan çıkar |
| `app/api/academy/discussion/route.ts` | — | | 410 |
| `app/api/academy/reviews/route.ts` | — | | 410 |
| `lib/academy/lesson-note.ts` + `lesson-note-engine.ts` + `lesson-note-pdf.ts` | 125+117+261 | PDF not fabrikası | İzole |
| `lib/academy/pdf-unicode-font.ts` | 264 | | İzole |
| `lib/academy/qr-matrix.ts` | 389 | Belge QR — belge dondurulunca birlikte | Dondur |
| `components/academy/academy-pdf-download-button.tsx` | 96 | | Oynatıcı/antre’den çıkar |
| `app/api/academy/courses/[id]/pdf/route.ts` | — | | 410 |
| `lib/academy/lesson-code-lab-run.ts` | 422 | A9 `eval`/sandbox yasağına rağmen lab yüzeyi | İzole |
| `lib/academy/lesson-practice-python.ts` | 475 | | İzole |
| `lib/academy/lesson-practice-growth.ts` | 334 | | İzole |
| `components/academy/lesson-code-lab.tsx` | 120 | `CurriculumPlayer` import eder | Oynatıcıdan çıkar |
| `lib/academy/proof-of-work.ts` | 515 | SHA-256 iş kanıtı; ilerlemeyi kilitler | Dondur — oynatıcı kilidini **kaldır** |
| `components/academy/proof-of-work-card.tsx` | 238 | Antre şişmesi | Gizle |
| `components/academy/interactive-task.tsx` | 129 | | Gizle |
| `lib/academy/catalog-favorites.ts` | 114 | | Dondur |
| `lib/academy/catalog-view-pref.ts` | 68 | | Dondur |
| `lib/academy/continue-dismiss.ts` | 115 | | Dondur (ince resume kalabilir) |
| `components/academy/moderator-bridge.tsx` | 115 | | İzole |
| `lib/academy/exam-pools-growth.ts` | 75 | | Dondur (sınav ile) |

`CurriculumPlayer` (558 satır) kod lab + tartışma + dinle senkron + iş kanıtı ilerleme kilidini **tek istemci tanrısında** toplar. MVP oynatıcısı: ders listesi, medya, ileri/geri, SETTLED kapısı. Başka bir şey yok.

## 1.4 Vitrin / kasa / oynatıcı — TUT (incelet)

Bunlar üç hedefin iskeletidir. Silinmez. Şişman yerleri budanır.

### Vitrin

| Tut | Görev |
|-----|--------|
| `app/academy/page.tsx` | Katalog RSC |
| `components/academy/course-list.tsx` | Liste |
| `components/academy/course-card.tsx` | Kart (modül kodu/`catalog-filter` bağı inceltilir) |
| `lib/academy/load-catalog.ts` | Yayın SKU yükleme |
| `lib/academy/published-catalog.ts` | |
| `lib/academy/pilot-sku.ts` | Dört SKU kilidi — **yeni 5. SKU yok** |
| `lib/academy/catalog-seed.ts` | Kart tohumu (trend skorunu ürün UI’sından çıkar) |
| `lib/academy/course-titles.ts` | İnce re-export → `catalog-ids` |

`level-pathway.ts` (355) + `components/academy/level-pathway.tsx` vitrin ızgarası değil, **kariyer halka özeti.** Vitrin MVP’sine gerekmez; freelancer vize kimliği `lib/kernel/catalog-ids`’tedir. Akademi UI’sından gizlenebilir; kernel sicili **silinmez.**

### Kasa

| Tut | Görev |
|-----|--------|
| `components/academy/purchase-button.tsx` | Kilit + settle; yetersiz bakiyede `QuickTopUpModal` |
| `lib/academy/engine.ts` | DEBIT + hazine CREDIT + `AcademyPurchase` SETTLED |
| `app/api/academy/courses/[id]/lock/route.ts` | 15 dk fiyat kilidi |
| `app/api/academy/courses/[id]/purchase/route.ts` | Idempotency + **Dron 403** (`isV1CookieSessionBlocked`) |
| `lib/academy/enrolment.ts` | Ticari lisans vs Super Admin bağışı (bağış CREDIT değildir) |
| `lib/academy/access.ts` | Oynatıcı kapısı |
| `lib/academy/license.ts` | Lisans penceresi |
| `lib/academy/runtime.ts` + `prisma-store.ts` | Store |
| Kernel: `Wallet`, `LedgerEntry`, `CheckoutPriceLock`, `PriceCatalogEntry`, `PaymentOrder`, PayTR port | Nakit omurgası — akademi klasöründe değil |

Dürüst kasa gerçeği: kurs sayfası PayTR’ye **doğrudan** gitmez. Akış: PayTR → cüzdan CREDIT (`/cuzdan` / hızlı yükleme) → akademi DEBIT. “Kasa ekranı” vatandaşta `PurchaseButton` + top-up modalıdır. Merchant panel kapalıysa dürüst **503** (A2/A5). Sahte CREDIT yok.

`purchase-path.ts` **iki CTA** sunar: “Eğitimi Satın Al” ve “Doğrudan Sınava Gir & Vize Al”. MVP vitrin/kasa **tek kapı:** eğitim al → oyna. Sınav yolu dondurulur, karttan kalkar.

### Oynatıcı

| Tut | Görev |
|-----|--------|
| `app/academy/[slug]/oyna/page.tsx` | SETTLED yoksa antreye yönlendir — **doğru kapı** |
| `lib/academy/curriculum-engine.ts` | Ders tamamlama (iş kanıtı kilidi sökülür) |
| `lib/academy/curriculum.ts` | Tohum müfredat — gövde `curricula/*.ts`’ten, fabrika olmadan |
| `lib/academy/curricula/{python,fullstack,ai,ux}-temel.ts` | 12’şer bölüm taslağı — **içerik; fabrika değil** |
| `lib/academy/load.ts` | RSC load |
| `lib/academy/lesson-media.ts` | Medya slotları (ince) |
| `lib/academy/lesson-cinema.ts` | HLS/HTML5/canvas seçimi — **tut, şişirme** |
| `lib/academy/lesson-advance.ts` | İleri/geri |
| `lib/academy/baked-micro-videos.ts` | Bake bayrağı (15 satır) |
| `components/academy/curriculum-player.tsx` | **İncelterek tut** — lab/tartışma/dinle çıkınca |
| `components/academy/lesson-media-player.tsx` | **İncelterek tut** — dinle/diyagram fabrikası çıkınca |
| `components/academy/settlement-steps.tsx` | Kasa geri bildirimi — ince, tut |

## 1.5 Sınav / belge / vize köprüsü — DONDUR (silme)

Üç ekranın parçası değildir. **A4 ve pazaryeri vize 403** bunlara bağlıdır. İlk budamada `rm` = freelancer ilan tahtasını ve “kanıt satın alınamaz” iddiasını kırar.

Dondurulan yüzeyler (büyütme yok, yeni soru havuzu yok, yeni mühür versiyonu yok):

- `lib/academy/exam*.ts`, `exam-engine.ts`, `exam-sitting.ts`, `exam-pools.ts`
- `components/academy/exam-panel.tsx`, `exam-start-gate.tsx`
- `app/api/academy/courses/[id]/exam/route.ts`
- `lib/academy/certificate-*.ts`, `issued-certificates.ts`
- `components/academy/certificate-*.tsx`
- `app/academy/certificates/`, `app/academy/dogrula/`
- `app/api/academy/certificates/**`
- Kariyer: `CareerVisaStamp` `ACADEMY_CERTIFICATE` kaynağı

Kamu belge GET (`academy-certificate` hop) Dron’da **satış değildir**; mühür göstermedir. Manifesto cümlesi durur: *mobilde akademi satılmaz, mühür gösterilir.* MVP’de Dron’a yeni akademi ekranı **yine eklenmez.**

## 1.6 Hop / Dron sızıntısı (kod budaması değil, kapı hijyeni)

| Hop | Dron bugün | Hüküm |
|-----|------------|--------|
| `academy-purchase` | `dronForbidden: true` + kenar 403 + handler 403 + `apps/rail-is` allowlist’te **yok** | **Doğru. Dokunma.** |
| `academy-certificate` | Sicilde; Dron `hops.ts` **çağırmaz** | Kamu doğrulama; satış değil. Dron UI büyütme. |
| `academy-pulse` | Sicilde **`dronForbidden` yok**; Dron allowlist’te yok | Gri. Kokpit sayacı. Dron’a akademi kabuğu takmaya davetiye. **Yeni Dron ekranı yok.** İleride web-only işaretlenebilir; bu görevin silme işi değil. |

`RAIL_V1_DRON_FORBIDDEN_HOP_IDS` bugün fiilen **tek id:** `academy-purchase`. Bu, IAP yasağının kod kanıtıdır.

---

# 2. VERİTABANI TEMİZLİĞİ (PRISMA / SUPABASE)

Akademi şeması `prisma/schema/academy.prisma`. Nakit tabloları `kernel.prisma`. **İlk budama haftasında DROP COLUMN yok.** Önce yazmayı durdur; kolon boşta kalınca migrate.

Bellek sicilleri (review, discussion, revision, live-ask) **tablosuz tiyatrodur.** Temizlik = tablo eklememek + kodu izole etmek. “Şemadan düşür” diyecek bir şey yoktur.

## 2.1 MVP için gerekli (üç ekran)

### Akademi şeması

| Model | Kolonlar (MVP) | Neden |
|-------|----------------|--------|
| `AcademyCourse` | `id`, `slug`, `title`, `summary`, `catalogUnitKey`, `isPublished`, `createdAt`, `updatedAt` | Vitrin kartı + fiyat birimi anahtarı |
| `AcademyPurchase` | **tümü** (`userId`, `courseId`, `priceLockId`, `amountMinor`, `currencyCode`, `status`, `settledAt`, …) | Kasa fişi. `@@unique([userId, courseId])` çift satış yok. |
| `AcademyLessonCompletion` | `id`, `userId`, `courseId`, `purchaseId`, `lessonKey`, `completedAt`, `createdAt` | Oynatıcı ilerleme. `@@unique([purchaseId, lessonKey])` |

Kurs fiyatı kurs satırında **yoktur** (S11-A). Canlı tutar `PriceCatalogEntry.amountMinor`.

### Kernel şeması (kasa omurgası — akademi dosyası değil, kasa için şart)

| Model | Rol |
|-------|-----|
| `User` | Kimlik; `academyPurchases` ters ilişkisi Prisma vergisi (A8) |
| `Wallet` | Tek bakiye SSOT |
| `LedgerEntry` | Append-only DEBIT/CREDIT |
| `CheckoutPriceLock` | 15 dk kilit; süresi bitmiş kilitte debit yok |
| `PriceCatalogEntry` | Satış fiyatı SSOT (`moduleKey` + `unitKey`) |
| `PriceCatalogDecisionLedger` | Sessiz zam yok — admin fiyat değiştirirse |
| `PaymentOrder` | PayTR `merchantOid` siparişi (cüzdan yükleme) |
| `HttpIdempotencyRecord` | Çift tıklama ikinci DEBIT doğurmaz |

`EscrowHold` akademi kasası **değildir** (freelancer PSP hold). MVP akademi DROP etmez; karıştırmaz.

## 2.2 Tut, dondur — MVP ekranı değil, A4 / vize

| Model | Neden silinmez |
|-------|----------------|
| `AcademyExam` | `questionsJson` sunucu havuzu. Sınav tarayıcıda puanlanmaz (A4). |
| `AcademyExamAttempt` | Baraj + `passed` |
| `AcademyCertificate` | `certificateHash`, `serialKey`, `curriculumSeal`, `revokedAt` — kariyer vizesi kaynağı |
| `CareerVisaStamp` (`career.prisma`) | `sourceKind = ACADEMY_CERTIFICATE`. Pazaryeri 403 buradan. |

Kolon dondurma: yeni mühür alanı, vanity skor, sıralama yükü **eklenmez** (A4 yük listesi sabit).

## 2.3 MVP dışı ağırlık — yazmayı kes, DROP sonra

| Nesne | Ne | Ne zaman DROP |
|-------|-----|----------------|
| `AcademyCourse.globalRank` | Dünya sıra | UI okumayınca |
| `AcademyCourse.localRank` | TR sıra | aynı |
| `AcademyCourse.trendScore` **Float** | `globalRank × localRank`; GÖREV 01: tamsayı şemada Float yanlış tohum | Vitrin trend kullanmayınca. Para değildir; A1 ihlali değil, **vitrin yalanı.** |
| `@@index([isPublished, trendScore])` | Trend sırası | skor kolonlarıyla |
| `AcademyLessonCompletion.proofOfWorkHash` | İş kanıtı SHA-256 | Oynatıcı kilidi sökülünce |
| `AcademyAudioCache` **tüm tablo** | TTS locator; byte `lesson-audios` | Dinle izole + 0 yazma + TTL dolunca |
| `AcademyCertificate.curriculumSeal` vb. | Belge dondurulursa bile A4 durduğu sürece **DROP yok** | — |

`AiTokenUsage` dinle/Gemini gümrüğü yazar. Dinle kapanınca akademi kaynağından yazma durur; tablo kernel’dir, akademi DROP’u değildir.

## 2.4 Hiçbir zaman akademi MVP tablosu olmayacaklar

İcat edilmemiş (ve **edilmemeli**) tablolar: `AcademyReview`, `AcademyDiscussion`, `AcademyCurriculumRevision`, `AcademyStudioSession`, `AcademyLiveAsk`, `AcademyFavorite`. Kodun bellekte tuttuğu şeyleri Prisma’ya “temizlik” diye taşımak **şişirme** olur.

---

# 3. MİMARİ TEYİT — AKADEMİ WEB, DRON İŞ

**Hüküm: Akademi Amiral’de (web) kalır. Dron (Expo `apps/rail-is`) İşveren / Freelancer tezgâhıdır. Bu tercih marj değil; mağaza hukuku + tek cüzdan çelişkisidir.**

## 3.1 Apple 3.1.1 / Play Billing — kodda duran kapı

Guideline 3.1.1: uygulama **içinde** açılan dijital içerik (kurs, ders, dinle) için kendi ödemen yasak; IAP zorunlu. Harici ödeme bağlantı serbestliği fiilen ABD vitrini / reader istisnasıdır; TR’de ürün stratejisi yapılamaz.

Play: dijital ürün Play Billing; gerçek dünya hizmeti Play Billing **ile satılamaz.**

Manifesto Kural 3’ün disk cümlesi hâlâ doğru:

> Aynı bakiye hem kurs hem emanet fonlayamaz: kurs dijital içeriktir (mağaza faturalandırması zorunlu), emanet gerçek hizmettir (mağaza faturalandırması yasak, Apple 3.1.3(e)).

Kod kanıtı (üç katman, defense-in-depth):

1. **Kenar:** `lib/kernel/http/v1-hops-meta.ts` — `academy-purchase` `dronForbidden: true`. `v1-hop-gate.ts` eşleşince **403** (`RAIL_V1_HOP_DRON_FORBIDDEN`).
2. **Handler:** `app/api/academy/courses/[id]/purchase/route.ts` — `isV1CookieSessionBlocked` ise 403. Rewrite sızıntısı kenarı aşsa da ikinci kapı durur.
3. **İstemci:** `apps/rail-is/src/api/hops.ts` — `academy-purchase` allowlist’te **yok.** Yorum satırı IAP yasağını açık yazar.

Sözleşme: `nativeStore: "forbidden"` (`v1-contract.ts`). Anayasa B: “Akademi native IAP ile satılmaz.”

Bu kapılar **doğru kurulmuş.** Budama onları gevşetmez. “Dron’da kurs listesi, ödeme Safari’de” de 3.1.1 riskidir (dijital vitrin native kabukta). Temiz kesit: native’de akademi **ürünü yoktur.**

## 3.2 Dron neden yalnız İşveren / Freelancer?

| | Akademi (dijital mal) | İş / emanet (gerçek hizmet) |
|--|----------------------|------------------------------|
| Apple | 3.1.1 → IAP | 3.1.3(e) → IAP **yasak** |
| Play | Play Billing | Play Billing **yasak** |
| Rail fiyat SSOT | Super Admin katalog `amountMinor` | Aynı katalog + split (lisanslı) |
| IAP fiyat SSOT | Mağaza paneli | — |
| İade | Mağaza tek taraflı; SETTLED + belge kalır | PSP hold / release / refund sicili |
| Nakit yolu | Merchant PayTR → cüzdan → DEBIT | Split; usta neti cüzdana CREDIT **yok** (A2) |

Tek native binary’de ikisini birleştirmek:

1. **IAP aç:** akademi marjı kesilir; fiyat SSOT mağazaya kaçar; iade mührü sahipsiz bırakır (A4 / Kural 4).
2. **IAP açma, native’de sat:** 3.1.1 red / hesap ban.
3. **Aynı cüzdanla ikisini fonla:** inceleme hem “dijital mal kaçak ödeme” hem “gerçek hizmete IAP” diye vurur.

Bu yüzden Dron **İş** dikeyidir: ilan, teklif, accept (PSP hold), teslim, release. Cüzdan **okunur**; yükleme sistem tarayıcısında `/cuzdan`. Akademi oynatıcı, kasa, TTS, sınav native’e **açılmaz.**

İşveren ve freelancer aynı Dron’da durabilir: ikisi de **gerçek hizmet** piyasasıdır (ilan sahibi / usta). Akademi vatandaşı üçüncü bir rol (öğrenci) ve üçüncü bir mal sınıfıdır; native’e üçüncü rol = ikinci IAP evreni.

“Sürü Dron” (GÖREV 01): elde bir Expo lab var; navigator yok. İkinci bundle (akademi-native) **ayrıca** 3.1.1 cehennemidir. Açılmaz.

## 3.3 Amiral’de kalmanın ürün gerekçesi (hukuk üstüne)

Akademi tek kullanıcıyla nakit halkasını döndürür: vitrin → PayTR → oynatıcı. Web’de IAP yok; PayTR üye işyeri yeter. Komisyon Apple/Google’a gitmez; fiyat Rail kataloğunda kalır; iade Rail + PayTR sicilindedir.

Pazaryeri 10 000 kullanıcı ister; native tezgâh orada haklıdır (bildirim, sahada teklif). Akademi vitrini bir tarayıcı sekmesidir. Amiral gemisini Dron’a tıkmak hem hukuku hem nakit marjını yakar.

---

# 4. SEN OLSAYDIN NE YAPARDIN?

Bu budamayı **yaparım.** Yapmamak, GÖREV 01’in teşhisini tekrar etmektir: halka dönmeden 23k satır fabrika.

Yaparken sistemi çökertmemek için **silerek başlamam.** Sıra:

### Adım A — Yazılı dondurma (bugün, kod minimal)

1. Yeni ders perdesi, yeni `real-world-pedagogy` anahtarı, yeni TTS karakteri, 5. SKU, yeni `verify:*` **yok.**
2. `ACADEMY_LESSON_LISTEN_ENABLED = false`. Dinle kapanır; metin/video yolu açık kalır. GÖREV 02’nin `lesson-audios` istisnası durur; **yeni byte yazılmaz.** Bu, fabrikayı `rm` etmeden nakit yolunu sadeleştirir.
3. Satın alma kartından `path: "exam"` CTA’sını gizlerim. Motor ve tablo durur.
4. Surface test’e **yeni** `toContain` iğnesi eklemem. Mevcut `curriculum-player-surface.test.ts` budamanın düşmanıdır; davranış testine kaydırılmadan dosya silmek CI’yi kırmızıya boyar.

Bunu **yapmam:**

- `AcademyExam` / `AcademyCertificate` DROP. Vize 403 ve A4 aynı gecede ölür.
- `lib/kernel/catalog-ids` silmek. GÖREV 02 bunun için vardı.
- PayTR’yi env ile “açmak” veya sahte CREDIT.
- Dinlemeyi kapatıp yerine yeni stüdyo (WebSpeech varsayılan, ikinci sağlayıcı) koymak.
- Akademi sayfalarını Dron `App.tsx`’e eklemek.
- PEDAGOJI.md’yi Anayasa A’ya yükseltmek.

### Adım B — Import grafını kes (küçük PR’lar, her biri yeşil test)

Sıra zorunlu. Tersi derleme kırığıdır çünkü `curriculum.ts` fabrikayı örer, `CurriculumPlayer` dinle/lab/tartışmayı örer.

1. `CurriculumPlayer`’dan `LessonCodeLab`, `LessonDiscussion`, dinle senkron, iş kanıtı `canAdvance` kilidini çıkar. İlerleme = “izlendi / tamamla”.
2. `LessonMediaPlayer`’dan `LessonListenButton` ve diyagram fabrikası bağı. Kalan: HTML5/canvas + play/pause.
3. `curriculum.ts` gövdeyi yalnız `curricula/*.ts` taslağından üretsin; `real-world-pedagogy` / `field-voice` / `sealed-diagrams` import’u kesilsin.
4. Antre (`[slug]/page.tsx`) PDF, iş kanıtı kartı, çift CTA, revizyon köprüsünü düşürsün. Kalan: fiyat, tek satın al, oyna kapısı.

Her PR’da yalnız o kesitin testini yeşile çek. 8 684 satır `tests/academy`’nin yarısı surface/`toContain`. Onları anayasa sanma; **davranış** (purchase SETTLED → oyna 200, satın almadan oyna redirect) kalsın.

### Adım C — İzolasyon (taşima, henüz git rm değil)

Fabrikayı `archived/lib/academy-studio/` altına al (Studio odası kalıbı). Kenar 410 zaten donmuş odalar için var; akademi alt ağacı için yeni 410 envanteri: `generateSpeech`, `listen`, `discussion`, `reviews`, `pdf`.

Canlı `lib/academy` tavanı: load, engine, access, curriculum (ince), seed/catalog, prisma-store, exam (dondurulmuş ince).

### Adım D — Şema (ayrı migrate, ayrı hafta)

Yazma 0 olduktan sonra: `trendScore` / rank kolonları, `proofOfWorkHash`, `AcademyAudioCache`. **Aynı PR’da kod sil + DROP yapmam.** Replay ve ops-migrate mühürleri (`assertAcademyLessonCompletions`) körlemesine kırılır.

### Adım E — Nakit (idari ≠ kod)

Budama PayTR’yi açmaz. CEO üye işyeri panelini açar. Kod hazır dilim (yeni özellik yok): CREDIT → DEBIT → oyna. Sınav/vize **ikinci** dilimdir; ilk satışı bekletmez.

Çökme senaryoları ve karşı tedbir:

| Yanlış hamle | Ne kırılır | Tedbir |
|--------------|------------|--------|
| Fabrikayı önce sil | `curriculum.ts`, oynatıcı, onlarca surface test | Önce import kes |
| Sınav tablosunu DROP | Kariyer vize, A4, kamu doğrulama | Dondur |
| `catalog-ids`’i akademi ile sil | İlan kapısı, GÖREV 02 duvarı | Dokunma |
| Dinle bucket’ı “yok” say | STORAGE_CONTRACT yalanına dönüş | Yazmayı kes, sözleşmeyi sonra sadeleştir |
| Tek mega-PR | Review imkânsız, revert felaket | 4–6 ince PR |
| Surface test’i “anayasa” tut | Hiçbir dosya silinemez | Davranış testine kaydır |

---

# 5. TEDAVİ / BUDAMA YOL HARİTASI

Hedef metrik: `lib/academy` + `components/academy` vatandaş yolunda **üç ekranın taşıdığı satır.** Fabrika arşivde. Sınav/belge dondurulmuş ince dilim. Yeni SKU yok.

## Faz 0 — Karar mühürü (bugün)

- Ürün: Vitrin / Kasa / Oynatıcı.
- Yazılı yasak: yeni perde, yeni TTS, 5. SKU, akademi-native, IAP, sahte CREDIT.
- PEDAGOJI.md ajan kırmızı çizgisi değildir.

## Faz 1 — Sönümleme (1–2 PR, nakit yok)

| # | İş | Başarı ölçüsü |
|---|-----|----------------|
| 1.1 | `ACADEMY_LESSON_LISTEN_ENABLED = false` | generateSpeech/listen 503/410; oyna metin+video |
| 1.2 | Kartta tek CTA: eğitimi al | `path=exam` UI’da yok |
| 1.3 | Oynatıcı: lab + tartışma + PoW kilidi çık | SETTLED kullanıcı ders geçebiliyor |
| 1.4 | Antre: PDF / PoW / süzgeç yok | `[slug]` fiyat + satın al + oyna |

## Faz 2 — Oynatıcı iskeleti (1–2 PR)

| # | İş | Başarı ölçüsü |
|---|-----|----------------|
| 2.1 | `curriculum.ts` fabrikayı import etmiyor | `real-world-pedagogy` graf dışı |
| 2.2 | `LessonMediaPlayer` dinle/diyagram fabrikası yok | Play/pause, süre, varsa bake MP4 |
| 2.3 | `CurriculumPlayer` < ~200 satır hedef | İleri/geri, tamamla, kapı |

## Faz 3 — İzolasyon

| # | İş |
|---|-----|
| 3.1 | Fabrika + TTS + review/revision/discussion → `archived/lib/academy-studio/` |
| 3.2 | API 410: listen, generateSpeech, discussion, reviews, pdf |
| 3.3 | Admin curriculum-revisions 410 veya gizle |
| 3.4 | `filter-bar` sil; `catalog-filter` sıra helper’ına indir |

## Faz 4 — Test vergisi

| # | İş |
|---|-----|
| 4.1 | `curriculum-player-surface` / `citizen-surface` `toContain` yığınını kes |
| 4.2 | Kalsın: purchase-flow, idor-exam (dondurulmuş), access, happy-path (üç ekran), listen kapalı |
| 4.3 | `verify:academy-pedagogy-seals` nightly’den çıkar veya boşalt — **prebuild’e alma** |

## Faz 5 — Şema (opsiyonel, yazma 0 kanıtı sonrası)

- `trendScore` / rank DROP veya kullanımsız bırak (zararsız borç).
- `proofOfWorkHash` DROP.
- `AcademyAudioCache` DROP + bucket yazma kapısı ops’ta kilit.

`AcademyExam*` / `AcademyCertificate` **bu fazda yok.**

## Faz 6 — Halka (idari)

PayTR merchant. Bir gerçek tahsilat. Bir SETTLED. Bir oyna. Bu GÖREV 03’ün kodu değildir; budamanın **amacıdır.**

Sınav ≥70 + vize: pazaryeri açılınca, ayrı karar.

## Bilinçli olarak yapılmayacaklar

- Akademi native / IAP / ikinci Dron bundle
- 5. çalışan oda
- Sahte CREDIT, çekim
- Vize 403 gevşetme
- Fabrikayı “biraz sadeleştirip” yeni perde yazmak
- Review/discussion için “kalıcı olsun diye” Prisma tablosu
- `packages/@yetkin/academy-mvp` npm paketi

---

# 6. MVP MİNİMUM GEREKSİNİM LİSTESİ

Vatandaşın gördüğü:

1. **Vitrin** `/academy` — dört SKU, başlık, özet, fiyat etiketi (`amountMinor` formatlı), kart → antre.
2. **Kasa** `/academy/[slug]` — tek satın al; kilit; yetersiz bakiyede PayTR top-up; SETTLED; bağış “satın alındı” yalanı yok.
3. **Oynatıcı** `/academy/[slug]/oyna` — yalnız SETTLED (veya lab Super Admin); ders sırası; video/tuval; ileri/geri; tamamlandı kaydı.

Sunucu:

- Katalog load + `isPublished`
- `lockAcademyCoursePrice` + `purchaseAcademyCourse` atomik
- Oynatıcı load + `completeAcademyLesson` (PoW opsiyonel/kapalı)
- Kenar: akademi purchase Dron 403

Olmayan (MVP):

- Dinle, canlı stüdyo, kod lab, tartışma, yıldız, revizyon kuyruğu, PDF, süzgeç, trend, doğrudan sınav CTA, native kurs

---

# 7. SİCİL

**Tespit edildi**

- Akademi LMS + stüdyo + pedagoji fabrikası; üç ekran değil.
- En ağır dosyalar satış değil: `real-world-pedagogy` (3 651), `field-voice` (2 028), `lesson-listen-button` (1 872).
- Vitrin dört SKU; fabrika ve `catalog-filter` hâlâ şişman.
- Kasa = cüzdan DEBIT + top-up; kurs içi PayTR iframe yok.
- IAP yasağı kodda üç katmanlı ve doğru.
- `academy-pulse` Dron-forbidden değil; Dron allowlist’te de yok — gri, büyütülmez.
- Sınav/belge nakit MVP’si değil; A4/vize için dondurulur.

**Önerilen kova özeti**

| İzole / 2. dalga sil | Dondur | Tut (incelet) |
|----------------------|--------|----------------|
| Pedagoji sözlükleri, TTS, live-ask, review/discussion/revision, PDF, kod lab, filter-bar | Sınav, belge, vize, `catalog-ids`, PoW motoru (UI kilidi yok) | Vitrin 4 SKU, kasa engine, oynatıcı medya, Prisma purchase/course/completion, PayTR kernel |

**Yapılmadı (bu görev — doğru)**

Ürün kodu, migrate, 410, `LISTEN_ENABLED` flip. Bu belge icra iznidir, PR değildir.

---

*Bu rapor `/docs` günlük alanındadır. Kalıcı kırmızı çizgi `.system_docs/ANAYASA.md`. Çelişkide Anayasa bağlayıcıdır; Anayasa ile disk çelişirse disk yazılır. GÖREV 03 disk ölçüsüdür; budama PR’ları CEO/Super Admin onayıyla Faz 1’den başlar.*
