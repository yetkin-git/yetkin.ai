# TESPİT RAPORU — yetkin.ai (OFF-101 / OFF-201 ve Mimari Analiz)

| Alan | Değer |
|------|-------|
| Tarih | 26 Eylül 2026 |
| Kapsam | Salt okuma taraması. Hiçbir kod dosyası değiştirilmedi. Yazılan tek dosya bu rapordur. |
| Referans commit | `49761f4` (`main`, `origin/main` ile eşit) + commit edilmemiş çalışma ağacı |
| Doğrulanamayanlar | Canlı veritabanı satırları (`PriceCatalogEntry`, `AcademyCourse`), PayTR mağaza paneli ayarları, Vercel'e hangi kaynaktan dağıtım yapıldığı, MP3 içeriklerinin metinle birebir uyumu |
| Koşulan testler | Çevrimdışı 8 test dosyası, 44 test: hepsi geçti (PayTR webhook güvenliği, PayTR cüzdan akışı, defter mutabakatı, medya mühür kapısı, vitrin, OFF-201 hazırlık, faz 2 taslak dizini) |

---

## 0. YÖNETİCİ ÖZETİ (TL;DR)

1. **En büyük risk kod değil, git.** `main` üzerinde **283 dosyada commit edilmemiş değişiklik** (+4.834 / −5.122 satır), **76 izlenmeyen yeni dosya** ve 1 eski stash var. OFF-201'in tüm müfredatı (`lib/academy/curricula/office_ai_2/`), ders sesleri, sınav havuzu ve yeni API uçları (`exemption`, `lesson-assistant`, `resend-confirmation`, `send-email` hook) **son commit'te yok**. Yani OFF-201 şu an yalnız bu bilgisayarın diskinde yaşıyor.
2. **OFF-101 sağlam.** 8 ders mühürlü, her biri 5 dakikanın üstünde, sınav yolu ve erişim kilidi doğru çalışıyor. Artık kalan tek yük arşivlenen 4. dersin dağınık kalıntıları.
3. **OFF-201 yarı yolda ve bu bilinçli.** Satış kapısı kapalı, fiyat yok. 6 dersten 3'ü (3, 4, 5) mühürlü. Ders 1, 2 ve 6, Gemini 3.1 TTS ile yeniden seslendirme bekliyor.
4. **PayTR bağlantısı kod düzeyinde temiz ve testleri geçiyor.** Canlıda gerçek parayla **cüzdan yükleme** tanığı var (18 Eylül, ₺15). Ama `docs/ops/DURUM.md` kendisi söylüyor: **gerçek parayla kurs satın alma (SETTLED) tanığı henüz yok.**
5. **Anayasa'nın para ve güvenlik katmanı (A1–A5) gerçekten uygulanıyor.** Akademi üretim kuralları ise belgelerde kodda olduğundan daha büyük görünüyor. "4 medya katmanı" kuralı 14 dersin yalnız birinde (OFF-101 ders 1) tam: fon müziği ve Veo klibi sadece o derste var.
6. **Dil:** OFF-201 metinleri iyi. OFF-101 metinlerinde hafif abartı ve korku dili kalmış. Asıl sorun arayüzde: cüzdan, akademi ve mobil uygulama ekranlarına iç jargon sızmış ("SSOT", "HMAC", "Amiral", "mühürlü", "JWT", "Supabase").

---

## A. ARTIK / ÇÖP DOSYA VE KOD TEMİZLİĞİ

### A.1 Diskte yer kaplayan geçici ve derleme çıktıları (git dışı, zararsız ama ağır)

| Yol | Boyut | Durum | Öneri |
|-----|------:|-------|-------|
| `media-bake/` | ~984 MB (16 WAV) | `.gitignore` içinde. Fırın ham sesleri. OFF-201 tek başına ~509 MB. | Mühürlü dersin WAV'ı dış yedeğe alınıp silinebilir. |
| `node_modules/` | ~909 MB | Normal. | — |
| `.next/` | ~266 MB | Doğru şekilde yok sayılıyor. (Oturum başındaki durum ekranında `?? .next\...` görünmesi tekrar üretilemedi. `git check-ignore` klasörü yok sayıyor. `.gitignore` bozuk değil.) | `npm run build` öncesi silinebilir. |
| `tsconfig.tsbuildinfo` | ~453 KB | Yok sayılıyor. | Yerel artık. |
| `generated/` | ~3.4 MB | Prisma çıktısı, yok sayılıyor. | Normal. |
| `.tmp/` | 0 dosya | Boş klasör. | Silinebilir. |
| `yetkin_muze/` | — | Diskte yok. `.gitignore` ve `.cursorrules` hâlâ ondan söz ediyor. | Kurallardan kaldırılabilir. |

### A.2 Git içinde duran artıklar

| Yol | Boyut | Kanıt | Güven |
|-----|------:|-------|-------|
| `public/media/academy/audio/01_office_ai/01_office_ai-4.mp3` | ~11.3 MB | Git'te izleniyor. 4. ders sınav yolundan çıktı, oynatıcı bu dosyayı açmıyor. | Yüksek |
| `lib/academy/lesson-exams/01_office_ai-4.json` | 1.5 KB | Hâlâ `lesson-exams/index.ts` içinde bağlı. Ders yok, mini sınavı var. | Yüksek |
| `lib/academy/curricula/office_ai/section_4.ts` | 8.7 KB | Hâlâ import ediliyor ama ders listesine (`officeAiSections`) girmiyor. `cinema-cue-catalog.ts` ve `lesson-beat-visual.ts` içinde de 4. ders kayıtları kalmış. | Yüksek |
| `docs/curriculum/01_office_ai_04_cue.json` | 17 KB | Yok sayılan fırın kopyası. | Yüksek |
| `archived/` | ~25 MB, 252 izlenen dosya | Bilinçli arşiv (kapalı odalar). Yeni iptal kasetleri (`archived/academy-audio-revoked/`, ~25 MB) henüz izlenmiyor. | Yüksek |
| 48 boş cue/zamanlama dosyası (`02_ecommerce_ai-*`, `03_social_media_ai-*`, `04_chatbot_nocode-*`, `05_prompt_practice-*`) | ~2.7 KB | İçerik `[]`. Bu kursların `sections` dizisi boş. | Yüksek (acil değil) |
| 23 silinmiş rapor (`docs/01_office_ai_*`, `docs/SEARCH_CONSOLE_*`, `docs/DURUM.md`) | — | Çalışma ağacında silinmiş, git dizininde duruyor. Aynı raporun iki adı var: `01_office_ai_final_muhur.md` ve `01_office_ai_final_mühür.md`. | Yüksek |

### A.3 Ölü kod ve kırık bağlantılar

| Bulgu | Kanıt | Etki |
|-------|-------|------|
| `lib/academy/audio-gain.ts` hiçbir yerden import edilmiyor | `app`, `components`, `lib`, `tests`, `scripts`, `apps/rail-is/src` içinde 0 referans | Ölü modül. |
| `package.json` → `verify:web-security-seals` betiği `tests/kernel/origin-guard.test.ts` dosyasını koşuyor, ama **bu dosya yok** (git geçmişinde de hiç yok) | `Test-Path` → False | Gece CI'ı büyük ihtimalle kırılmıyor (Vitest diğer dosyaları koşar). Ama "Origin koruması testlendi" iddiası boşta. `tests/kernel/web-security-seals-surface.test.ts` de bu adı metin olarak arıyor ve geçiyor. |
| `docs/DURUM.md` silinmiş | Anayasa, Manifesto, Pedagoji ve `docs/ops/DURUM.md` hâlâ "`docs/DURUM.md` yalnız yönlendirir" diyor | Ölü yönlendirme. |
| `tests/academy/off-102-draft.test.ts` | Dosya adı OFF-102, içeriği OFF-201 | Ad borcu. |
| `scripts/` içinde tek seferlik betikler | `generate-brand-icons.ts`, `optimize-academy-course-covers.ts`, `ops-settle-cleared-academy-license.ts`, `sync-academy-cue-paragraphs.ts`, `ingest-ecommerce-ai-sections.ts`, `bake-office-ai-0{1–5}-sealed-pack.ts`, `repair-office-ai-05-silence-hole.ts`; `package.json` ve belgelerde hiç anılmıyor | Ölü değil, dağınık. `scripts/one-off/` altına alınabilir. |
| Playwright e2e dosyaları kapalı odaları hâlâ test ediyor | `tests/e2e/devlabs-happy-path.spec.ts`, `studio-cap-http.spec.ts`, `studio-happy-path.spec.ts` | CI e2e koşmuyor. Dosyalar sessizce çürüyor. |

### A.4 Tekrarlanan veya çakışan tanımlar

| Çift | Durum |
|------|-------|
| `office_ai/off-201.ts` + `office_ai/planned.ts` (uydu dersler `01_office_ai-10..12`) + `office_ai_2/` (canlı `01_office_ai_ileri-1..6`) | OFF-201 üç ayrı yerde anlatılıyor. Canlı gövde `office_ai_2/`. `off-201.ts` SKU ve sınav sabitlerini tutuyor. `planned.ts` ise eski "uydu ders" vaatlerini tutuyor. Birleştirilebilir. |
| Klasör adı `office_ai_2` ↔ adres `01_office_ai_ileri` ↔ kart kodu `OFF-201` | Aynı şeyin üç adı var. Çalışıyor ama yeni gelen her geliştirici ve ajan burada takılır. |
| Web kurs kimlikleri (`packages/kernel/src/catalog-ids/course-slugs.ts`) ↔ mobil (`apps/rail-is/src/ui/course-slugs.ts`) | Tekrar değil. Mobil taraf çekirdek listeyi süzüyor. Doğru tasarım. |
| Boş kurs kabukları (`ecommerce_ai`, `social_media_ai`, `chatbot_nocode`, `prompt_practice`) | Canlı müfredat dizininde duruyorlar ama içleri boş. Vitrinde "Çok Yakında" için yeterli, fakat testler ve dizinler bunları gerçek kurs gibi taşıyor. |
| Prisma şeması | Temiz. Canlı şemada kapalı odalara (junior, arena, studio...) ait model yok. Eski tablolar `20260822010000_drop_frozen_room_tables` ile silinmiş. 35 migration geçmiş olarak duruyor. |

---

## B. MODÜL VE YAYIN DURUMU

### B.0 Önce bunu okuyun: "canlı" neyi kapsıyor?

- Son commit (`49761f4`) içinde `lib/academy/curricula/office_ai_2/` klasörü **yok**, `off-102.ts` hâlâ **var**, `public/media/academy/audio/01_office_ai_ileri/` klasörü **yok**.
- `.vercel/project.json` mevcut, yani proje Vercel CLI'a bağlı. Dağıtım git'ten mi yoksa bu diskten mi yapılıyor, doğrulanamadı.
  - Git'ten yapılıyorsa: canlıda OFF-201 yok. `docs/ops/DURUM.md` içindeki "canlı vitrin kartıdır" cümlesi (bu dosya da commit edilmemiş) canlıyı değil, yerel diski anlatıyor.
  - Diskten (`vercel deploy`) yapılıyorsa: canlıda git'te olmayan kod çalışıyor. Geri dönüş ve inceleme imkânsız hâle gelir.
- Her iki durumda da ilk iş aynı: çalışma ağacını anlamlı commit'lere bölüp git'e almak (bkz. E.4).

### B.1 OFF-101 (`01_office_ai`)

**Genel hüküm: eksiksiz ve tutarlı.** Kalan borç 4. dersin temizliği ve medya katmanlarının eksikliği.

| Katman | Durum | Kanıt |
|--------|-------|-------|
| Müfredat kaydı | Bağlı | `lib/academy/curricula/index.ts:81–83`, modül kodu `CURR-OFFICE-AI-101` |
| Sınav yolu | 8 ders: `1 → k1 → 2 → 3 → 5 → g1 → w1 → 6` | `lib/academy/curricula/lesson-index.ts:12–22` |
| SKU eşlemesi | `OFF-101` | `lib/academy/catalog-filter.ts:55–58` |
| Fiyat | Kodda soğuk tohum 89.000 kuruş (₺890). Gerçek fiyat veritabanındaki `PriceCatalogEntry` satırı (canlı değer doğrulanamadı) | `lib/academy/catalog-pricing.ts:28–29`, `prisma/schema/kernel.prisma:246–264` |
| Veritabanı modelleri | `AcademyCourse`, `AcademyPurchase` (yalnız SETTLED), `AcademyExam*`, `AcademyCertificate`, `AcademyExemptionSeal`, `AcademyLessonCompletion` | `prisma/schema/academy.prisma` |
| Erişim | Ücretsiz yalnız hazırlık dersi (`01_office_ai-0`). 1–8 satın alma veya yönetici izni ister | `purchase-path.ts:76–99`, `preview-lock.ts:52–65`, `access.ts:53–89` |
| Satın alma | Cüzdandan düşüm (DEBIT) | `lib/academy/engine.ts:224–242` |
| Testler | `tests/academy/` altında ~130 dosya | — |

**Ders envanteri (sesli ders süreleri, zamanlama dosyalarından):**

| Vatandaş sırası | Anahtar | Süre | Rozet (cue) | Zamanlama | Mini sınav | MP3 | Fon müziği | Veo klibi |
|---|---|---:|:-:|:-:|:-:|:-:|:-:|:-:|
| Hazırlık | `-0` | 255.8 sn (4.3 dk) | ✓ | ✓ | — | ✓ | — | — |
| 1 | `-1` | 691.8 sn | ✓ | ✓ | ✓ | ✓ | **✓** | **✓** |
| 2 | `-k1` | 702.0 sn | ✓ | ✓ | ✓ | ✓ | — | — |
| 3 | `-2` | 520.1 sn | ✓ | ✓ | ✓ | ✓ | — | — |
| 4 | `-3` | 538.0 sn | ✓ | ✓ | ✓ | ✓ | — | — |
| 5 | `-5` | 553.0 sn | ✓ | ✓ | ✓ | ✓ | — | — |
| 6 | `-g1` | 603.8 sn | ✓ | ✓ | ✓ | ✓ | — | — |
| 7 | `-w1` | 583.4 sn | ✓ | ✓ | ✓ | ✓ | — | — |
| 8 | `-6` | 506.0 sn | ✓ | ✓ | ✓ | ✓ | — | — |
| Arşiv | `-4` | — | silindi | silindi | **duruyor** | **duruyor** | — | — |

Notlar:
- Tüm sınav yolu dersleri 5 dakika tabanının üstünde. Hazırlık dersi 4.3 dakika, ama sınav yoluna girmediği için kural ihlali sayılmaz. Bu istisna belgede açıkça yazmıyor.
- 4. dersin cue ve zamanlama dosyalarının silinmesi derlemeyi bozmuyor. Bu dosyalar diskten okunuyor, statik import yok.
- Anayasa B4 "ders makale + karaoke yayınına indirgenmez" diyor. Aynı anda `docs/ops/DURUM.md` 8 dersin de `article+karaoke` modunda olduğunu yazıyor. Gerçekte dersler mühürlü ses + rozet + canlı uygulama sahnesiyle oynuyor. Yani çelişki içerikte değil, adlandırmada. Ama belge ile kod aynı dili konuşmuyor.

### B.2 OFF-201 (`01_office_ai_ileri`)

**Genel hüküm: iskelet tam, ses yarım, satış kapalı. Kapı doğru kurgulanmış. Fiyat ve mühür olmadan satış açılmıyor.**

| Ders | Anahtar | Metin | Rozet | Zamanlama | Mini sınav | MP3 | Ses | Durum |
|---|---|:-:|:-:|---:|:-:|:-:|---|---|
| 1 | `ileri-1` | ✓ | ✓ | 474.2 sn | ✓ | **yok** (arşivde) | Kore | Gemini 2.5 ile basıldığı için iptal. Yeniden fırın kuyruğunda. |
| 2 | `ileri-2` | ✓ | ✓ | 580.2 sn | ✓ | **yok** (arşivde) | Puck | İptal. Yeniden fırın kuyruğunda. |
| 3 | `ileri-3` | ✓ | ✓ | 865.9 sn | ✓ | ✓ | Fenrir | Mühürlü |
| 4 | `ileri-4` | ✓ | ✓ | 1080.1 sn | ✓ | ✓ | Aoede | Mühürlü |
| 5 | `ileri-5` | ✓ | ✓ | 1104.2 sn | ✓ | ✓ | Leda | Mühürlü |
| 6 | `ileri-6` | ✓ | ✓ | 1198.2 sn | ✓ | **eski dosya duruyor** | Zephyr | Metin sırası düzeltildi. Eski kaset oynatılmıyor. Yeniden fırın kuyruğunda. |

Kanıt: `lib/academy/pilot-sku.ts:74–100` (mühürlü, iptal ve yeniden fırın listeleri), `lib/academy/instructors.ts:214–221` (ders başına ses).

**Satış kapısı:**

| Kapı | Sonuç | Kanıt |
|------|-------|-------|
| Vitrinde görünür mü | Evet ("Çok Yakında / Fiyat Bekleniyor") | `published-catalog.ts:132–176` |
| Fiyat | `null`. Kodda tohum fiyat da yok. Super Admin `course:01_office_ai_ileri` satırını açmalı. | `catalog-pricing.ts:48`, `off201-catalog-slot.ts` |
| Satış açık mı | Hayır. `academyCourseSaleOpen`, sınav yolundaki bütün derslerin mühürlü olmasını şart koşuyor. | `pilot-sku.ts:260–279`, `tests/academy/media-release-seal.test.ts:68` |
| Sınav havuzu | 36 soru, baraj 70 | `exam-pools-office-ai-2.ts`, `exam-pools.ts:491–501`, `phase2-exam-readiness.ts` |
| Muafiyet | OFF-101 muafiyet sınavını geçen, OFF-101'i satın almadan OFF-201'e hak kazanır (`AcademyExemptionSeal`) | `app/api/academy/courses/[id]/exemption/route.ts` |
| Mobil uygulama | Aynı adres kullanılıyor. Yalnız mühürlü 3–5 rozetleri bağlı. | `apps/rail-is/src/ui/course-slugs.ts:11`, `academy-punchcards.ts:18–23` |

**Çakışan ve eksik kalan noktalar:**

| Önem | Bulgu |
|------|-------|
| **Kritik** | OFF-201'in bütün dosyaları git'te değil (bkz. B.0). |
| **Yüksek** | `ileri-6.mp3` diskte duruyor ama mühürsüz. Mühür kontrolünü atlayan herhangi bir yol (ör. doğrudan dosya adresi, statik dosya servisi) eski metni duyurur. Yeniden fırından önce silinmesi daha güvenli. |
| **Yüksek** | OFF-201 MP3'leri 20–28 MB (OFF-101'in yaklaşık iki katı). Tamamı `public/` altında ve git ile taşınıyor. Bkz. E.2 medya depolama. |
| Orta | Yeniden fırından sonra elle güncellenecek üç yer var: `ACADEMY_MEDIA_SEALED_AUDIO`, mobil `academy-punchcards.ts`, `docs/ops/DURUM.md`. Tek bir "mühür manifestosu" olmadığı için unutulma riski var. |
| Orta | `lib/academy/lesson-audio.ts:28–33` altı dersin süresini de "mühürlü süre" tablosunda tutuyor. Oynatma mühür kontrolüyle korunuyor, ama tablonun adı yanıltıcı. |
| Düşük | `off-201.ts` içinde `OFF_201_EXAM_POOL_MAX = 50`, hazırlık yorumunda "30–40", gerçek havuz 36. |
| Düşük | `instructors.ts:569–570` bu kurs için varsayılan ses olarak Callirrhoe (Gözde) döndürüyor. Ders başına ses bunu eziyor, ama yedek yol "tek ses" yasağıyla çelişiyor. |
| Düşük | Ödeme dönüş sayfası (`components/kernel/kasa-return-panel.tsx`) her zaman OFF-101'e yönlendiriyor. OFF-201 satışa açılınca kullanıcı yanlış kursa düşer. |

### B.3 PayTR bağlantı noktaları

**Genel hüküm: kod doğru, testler geçiyor, cüzdan yükleme canlıda kanıtlı. Kurs satın almanın gerçek parayla uçtan uca kanıtı eksik.**

Akış:

```
Cüzdan yükleme  POST /api/wallet/top-up
  → PaymentOrder (PENDING) + PayTR token / iFrame
  → PayTR bildirimi  POST /api/payments/webhooks/paytr  (veya /api/paytr/callback takma adı)
      HMAC doğrulama → CLEARED → defter CREDIT → cüzdan bakiyesi
      amaç "academy-license:{slug}" ise → otomatik lisans (paytr-license-bridge.ts)
  → Kurs satın alma  POST /api/academy/courses/[id]/purchase
      cüzdan DEBIT + AcademyPurchase SETTLED
```

| Nokta | Durum | Kanıt |
|-------|-------|-------|
| Tutar birimi | Tamsayı kuruş (`amountMinor`). Yükleme bandı ₺10 – ₺20.000. | `wallet-top-up.ts:3–5`, `verify:amount-minor` |
| Bildirim yanıtı | PayTR'nin beklediği düz metin `OK` | `webhooks/paytr/route.ts:37–47` |
| İmza | HMAC doğrulaması var | `lib/kernel/payments/paytr/webhook.ts:67–77` |
| Test/sandbox | `PAYTR_SANDBOX="1"`, üretimde sahte ödeme yasak | `.env.example:95–107`, `checkout.ts` |
| İade | PayTR iade API'si gerçekten çağrılıyor (yalnız defter kaydı değil) | `lib/kernel/payments/paytr/refund.ts`, `wallet-card-refund.ts` |
| Split / Freelancer | Bilinçli olarak kapalı (`MARKETPLACE_SPLIT_LIVE = false`), 410 | `docs/ops/DURUM.md` |
| Canlı tanık | ₺15 cüzdan yükleme CLEARED, 18 Eylül 2026 | `docs/ops/DURUM.md` |

Açık noktalar:
- **Gerçek parayla kurs satın alma tanığı yok.** `docs/ops/DURUM.md` kendisi "Açık kalan: amiral SETTLED satın alma + anonim `/dogrula`" diyor. Test kartı ya da sandbox değil, gerçek bir kartla OFF-101 satın alınıp sertifika dışarıdan doğrulanmalı.
- İade ucu, `wallet_card_refunds` tablosu yoksa 503 dönecek şekilde yazılmış. Bu tablonun migration'ı canlı veritabanına uygulandı mı, doğrulanamadı. Son dört commit iade üzerine olduğu için canlıda bir kez denenmeli.
- İade, muafiyet ve ders asistanı uçları `/api/v1` sicilinde yok. Web'de çalışıyorlar, mobil uygulamada yoklar. Anayasa B1 bunu yalnız mobilin tüketeceği yetenekler için şart koşuyor, yani ihlal değil, ama bir eşitlik açığı.

---

## C. MİMARİ VE ANAYASA / MANİFESTO / PEDAGOJİ SORGULAMASI

### C.1 Mimari adlandırma: belgeler sizden bir adım önde

Talep metninde "Amiral Gemi + Sürü Dron (Shared Kernel / API-First)" ifadesi geçiyor. Ancak belgeler bu adı **zaten emekliye ayırmış**:

> «Sürü Dron» ve «Micro-Apps» bu adın yerine geçmez. … Bugün tek native istemci vardır. — `ANAYASA.md` B1

Kodun gerçeği de belgelerle aynı:

| İddia | Gerçek |
|-------|--------|
| Paylaşılan çekirdek | `@yetkin/kernel` (`packages/kernel`) var. İnce: para, kurs kimlikleri, v1 zarfı, v1 uç listesi. Prisma ve Supabase içermez. Doğru boyutta. |
| API öncelikli | `/api/v1` ayrı bir klasör değil. `proxy.ts` gelen isteği yeniden yazıp mevcut `/api/...` ucuna yönlendiriyor. 16 uç kayıtlı. OpenAPI üretimi ve kontrolü derleme kapısında. |
| Dron sayısı | **Bir.** `apps/rail-is`. |
| `scripts/dron-new.ts` | Yeni mobil uygulama değil, monolit içinde yeni "oda" iskeleti açıyor. Adı yanıltıcı. |
| Web aynı API'yi mi kullanıyor | Hayır. Sayfalar `lib/` fonksiyonlarını doğrudan çağırıyor, mobil ise `/api/v1` kullanıyor. B1 bu ayrıma okuma için izin veriyor. |

Değerlendirme: **Pragmatik monolit + ince sözleşme paketi + tek mobil istemci, bu aşama için doğru mimari.** "Sürü" hedefi ise bugün gerçekte karşılığı olmayan bir hikâye. Ya ekip dilinden çıkarılmalı ya da belgeye "ikinci istemci ne zaman ve hangi şartla doğar" ölçütüyle geri yazılmalı. Şu an CEO dili ile Anayasa dili birbirinden farklı.

### C.2 Belgelerin koda uyumu

| Kural | Nerede uygulanıyor | Durum |
|-------|--------------------|-------|
| A1 tamsayı para, tek defter | `verify:amount-minor`, `packages/kernel/src/money` | **Uygulanıyor** |
| A1 fiyat veritabanında | `PriceCatalogEntry`, OFF-201 "Fiyat Bekleniyor" | **Uygulanıyor** |
| A2 çekim yok, Split kapalı | `MARKETPLACE_SPLIT_LIVE`, 410 | **Uygulanıyor** |
| A3 RLS, IDOR, sır koruması, idempotency | `verify:prebuild` (sır, RLS, IDOR testleri) | **Uygulanıyor** |
| A4 sunucu puanlaması, baraj 70 | `lib/academy/exam.ts` `ACADEMY_EXAM_PASS_SCORE = 70` | **Uygulanıyor** |
| A5 dürüst kapalı yüzey | 503 / `not_configured` kalıpları | **Büyük ölçüde** |
| B4 ders ≥ 5 dk, kurs ≥ 6 ders | `production-standard.ts:10–12` + testler | **Uygulanıyor** |
| B4 "üst tavan yok, metin kırpılmaz" | `lib/academy/config.ts:32–33, 44–45` → `minWords: 1050`, `maxWords: 1800` | **Kodla çelişiyor** |
| Konuşma hızı 0.93 | Gemini API'de böyle bir parametre yok. Hız, ses geldikten sonra SOLA zaman esnetmesiyle uygulanıyor (`scripts/generate-academy-lesson-audio.ts:642`, `lib/kernel/ai/pcm-wav.ts`) | **Uygulanıyor, ama belgede yanlış anlaşılmaya açık** |
| Nefes 0.4 sn, geçiş 1.75 sn, slayt ön-açılış 1.5 sn | `lib/academy/human-rhythm.ts:9–18` | **Uygulanıyor** (fırında) |
| TTS isteği 10–12 blok | `tts-breath-chunks.ts:22–25` | **Uygulanıyor** |
| Yalnız Gemini 3.1 TTS, 2.5'e düşüş kapalı | `lib/kernel/ai/model-roles.ts:53, 61` | **Uygulanıyor** |
| Lyria 3.5 fon müziği | Betik var (`generate-academy-lesson-bed.ts`) ama **yalnız 1 derste çıktı var** (`01_office_ai-1.bed.mp3`) | **Kısmen** (1/14) |
| Veo 3.1 Lite, ders başına 1 klip | Sabitler ve betik var ama **yalnız 1 klip var** (`01_office_ai-1-warmup.mp4`) | **Kısmen** (1/14) |
| Nano Banana 2 | Fırında `gemini-3.1-flash-image`, ağ geçidi varsayılanı `imagen-4.0-generate-001` | **Adlandırma karışık** |
| %80 canlı ekran / %20 sinematik | Her sahneye `waiterRatio: 80` yazılıyor, ama gerçek süre ölçülmüyor | **Beyan var, ölçüm yok** |
| "Sabit logo olmaz" | Hiçbir kontrol yok. Pedagoji de giriş logosuna "opsiyonel" diyor | **Uygulanmıyor** |
| Pedagoji §E.7 | `lesson-beat-visual.ts` yorumu §E.7'ye atıf yapıyor. Pedagoji'de yalnız E.2–E.5 var | **Eski atıf** |
| "`/docs` derleme fikstürü değildir" (Anayasa başlığı) | `tests/academy/production-standard.test.ts` PEDAGOJI.md'yi okuyup 142 `toContain` kontrolü yapıyor. 12 test dosyası `.system_docs` veya `.cursorrules` okuyor | **Kodla çelişiyor** |

### C.3 Gerçek dışı, aksayan veya yavaşlatan maddeler

Tarafsız değerlendirme. Her maddenin bir işe yaradığı yeri de yazdım.

| Madde | Neden sorun | Korunması gereken değer |
|-------|-------------|-------------------------|
| **4 medya katmanı "zorunlu"** (B4, `.cursorrules` §1) | 14 dersten 1'inde tam. Kural ya gerçeği anlatmıyor ya da her yeni ders için pahalı ve yavaş bir şart koyuyor. OFF-201'in satışını fon müziği ve video yüzünden bekletmek mantıksız olur. | Ses + rozet + canlı sahne gerçek çekirdek. Fon müziği ve video "iyileştirme katmanı" olarak tanımlanabilir. |
| **Önizleme model kimlikleri anayasada** (`gemini-3.1-flash-tts-preview`, "Lyria 3.5", "Veo 3.1 Lite") | Google önizleme adlarını sık değiştirir. Her değişiklikte belge + test + ajan bağlamı güncellenir. Pedagoji kendisi "model adı bu belgede dondurulmaz" diyor, `.cursorrules` ise donduruyor. | Rol adı (`VOICE_TTS`) yeter. Ad `model-roles.ts` içinde yaşar. |
| **2.5'e düşüş yasağı** | Kota bitince üretim duruyor. Bu bilinçli bir bedel. | Aynı kursta karışık kalite sesin önüne geçiyor. OFF-201 1–2 bu yüzden iptal edildi. **Korunmalı**, ama anayasa değil üretim kuralı olarak. |
| **Saniye düzeyinde ritim sabitleri anayasa dilinde** | Anayasa için fazla ayrıntılı. Fırın el kitabına ve koda ait. | Sabitler gerçekten uygulanıyor ve işe yarıyor. Yerleri değişmeli, kendileri değil. |
| **%80 / %20 reji oranı** | Ölçülmüyor, bu yüzden "mühür" gibi sunulması yanlış güven veriyor. | İyi bir tasarım niyeti. Gözden geçirme listesine taşınmalı. |
| **"Üst tavan yok"** | Kodda 1800 kelime bandı var. Ajanlar iki zıt emir alıyor. | Ya bant kaldırılmalı ya da belge "öneri bandı var" demeli. |
| **Yasaklı kelime listeleri ve hazır anlatıcı cümlesi** | Metin denetimine dönüşünce yazarı kalıba sokar. Aynı cümle her derste tekrarlanırsa da yapay durur. | Öğrencinin özgüvenini koruma amacı değerli. İnsan incelemesi için kontrol listesi olarak kalmalı, CI kuralı olmamalı. |
| **İptal kaset adları `.cursorrules` içinde** | Envanter bilgisi. `pilot-sku.ts` ve `DURUM.md` zaten tutuyor. | Kodda kalması yeterli. |
| **Belgelerin metin olarak test edilmesi** | Pedagoji'deki bir virgülü değiştirmek bile testi kırıyor. Bu da "belgeler kutsal değil" kararını pratikte uygulanamaz kılıyor. | Sabitleri test etmek doğru. Metni test etmek yanlış. |
| **`.cursorrules` 193 satır, her ajan isteğine ekleniyor** | Akademi kilidi Pedagoji, Anayasa B4, fırın el kitabı ve testlerde zaten tekrar ediliyor. Her ajan turunda bağlam harcıyor ve eski bilgi taşıyor (ör. olmayan `yetkin_muze/`). | Dışlama listesi değerli. Akademi kilidi 10 satırlık bir yönlendirme listesine inebilir. |
| **Manifesto'daki vitrin cümlesi** «Öğrendiğini mühürle. Mührün kapıyı açsın. İşin güvende olsun.» | Pedagoji'nin "ajans sloganı yasağı" ile aynı aileden. "Mühür" iç jargonu vatandaş cümlesine taşıyor. | Marka cümlesi olarak bilinçli bir tercih olabilir. Ama o zaman yasağın vitrin metnini kapsamadığı açıkça yazılmalı. |

### C.4 Belgeler arası çelişkiler

- Mimari ad: "Sürü Dron" (ekip dili), "Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci" (B1), "API-First Dron Sözleşmesi" (kök `README.md`).
- Yayın dondurma: kök `README.md` "Faz 1 kapanana kadar yayın hattı donuktur" diyor. `apps/rail-is/package.json` `publishFrozenUntilFaz1Close: false`, Manifesto ve DURUM da "donuk değil" diyor.
- Süreler: fırın el kitabı `01_office_ai-1` için 688.68 sn yazıyor. Zamanlama dosyası ve DURUM 691.84 sn diyor.
- `docs/DURUM.md` yönlendirmesi dört belgede anılıyor, dosya silinmiş.
- Pedagoji "model adı dondurulmaz" diyor, `.cursorrules` model adını "değiştirilemez" başlığı altında donduruyor.

---

## D. EĞİTİM DİLİ VE SUNUM KONTROLÜ

### D.1 Alan bazında hüküm

| Alan | Hüküm |
|------|-------|
| OFF-201 ders metinleri | **İyi.** Kısa cümle, önce günlük dil sonra terim («Kutuya yazacağın bu metne **istem** diyeceğiz.»), yanlıştan doğruya somut örnek, iş adı taşıyan rozetler (`KAYNAĞI KARŞILAŞTIR`, `UYUŞMAYANI YAZMA`, `FORMÜLÜ KİLİTLE`). Eksik: "anlatıcı suçu üstlenir" kalıbı yalnız ders 1 ve 2'de var. 3. derste bazı uzun, çok adımlı paragraflar var. |
| OFF-101 ders metinleri | **Orta.** Klasik yasaklı ifadeler yok, ama aynı aileden hafif abartı ve korku dili kalmış. Ders mühürlü olduğu için metni düzeltmek yeniden seslendirme (ücretli) gerektirir. |
| Veli-öğretmen taslağı (`parent_teacher_ai`) | **İyi.** Sade, SEN dili, somut sahne. |
| Diğer kurslar (`prompt_practice`, `social_media_ai`, `ecommerce_ai`, `chatbot_nocode`) | İçerik yok. Denetlenecek metin yok. |
| Web arayüzü | **Karışık.** Düğmeler sade («İncele», «Satın Al»). Cüzdan, akademi ve pasaport metinlerine iç jargon sızmış. |
| Mobil uygulama arayüzü | **Zayıf.** `apps/rail-is/src/ui/copy.ts` bir operasyon kılavuzu gibi okunuyor. |
| Hukuk metinleri | Uygun. Resmî dil yerinde, slogan yok. |
| E-postalar | İyi. «Hesabını doğrula», «E-postamı doğrula». |

### D.2 Somut bulgular

**Abartı ve slogan (OFF-101):**

| Yer | Metin |
|-----|-------|
| `lib/academy/curricula/office_ai/section_1.ts:20` | «…Yapay Zekâ **yolculuğunun** ilk dersine hoş geldin!» |
| `section_1.ts:26` | «…o karmaşayı **bir çırpıda** okur.» |
| `section_1.ts:56` | «Kendi gözlerinle **dönüşümün hızını** gördüğünde…» |
| `section_3.ts:14` | «…ham verileri **dakikalar içinde** derleyip toparlamıştık.» ("saniyeler içinde" ailesi) |
| `section_3.ts:16` | «Elinde **harika** fikirler, **eksiksiz** veriler var ama onları boş bir slayta dökmek **korkutucu** gelir.» |
| `section_3.ts:40` | «Üstelik bu **dönüşümü** … doğru yönlendirilmiş **tek bir istemle** elde ediyorsun.» |
| `lib/copy/sen-voice/public.ts:7` | «Yapay zekâ yetkinliğini kanıtla, **kariyerini mühürle**» |
| `lib/copy/sen-voice/dashboard.ts:38` | «**Kariyer yolculuğuna** başlamak için…» |

**Korku / özgüven kırıcı çerçeve:** `section_1.ts:18` «paniklemek yerine», `section_1.ts:20` «gözünü korkutan», `section_1.ts:52` «veri gözünü korkutamaz», `section_3.ts:16` «korkutucu gelir». Niyet cesaret vermek, ama önce korkuyu adlandırıyor.

**Vatandaşa sızan iç jargon:**

| Yer | Metin |
|-----|-------|
| `lib/copy/sen-voice/cuzdan.ts:6` | «TRY cüzdan **SSOT**» |
| `cuzdan.ts:53–54` | «…gerçek **LedgerEntry** satırları…», «**Dron kasa**» |
| `lib/copy/sen-voice/academy.ts:155–156` | «**Amiral**: 8 **mühürlü** sesli ders.» |
| `academy.ts:455–456` | «Onaylı **Maya** metni açık… **mühürlü** kayıt yeniden basılmaya hazırdır.» |
| `lib/copy/sen-voice/pasaport.ts:44` | «Beş **compact** yetkinlik.» |
| `lib/copy/sen-voice/career.ts:47` | «ilgili Akademi **SKU**'sunun 8 dersi…» |
| `lib/copy/seo.ts:62`, `lib/copy/sem-keywords.ts:52` | «**amiral** kurs yayındadır» |
| `lib/academy/lesson-cues/01_office_ai-g1.json:30` | Sahne rozeti `"TAŞIMA SU"` (Pedagoji'ye göre stüdyo terimi, vatandaş eşlemesinde yok) |
| `lib/academy/lesson-cues/01_office_ai-k1.json:49` | Rozet `"ÜÇÜNCÜ KAPI"` |
| `components/academy/office-ai-guide-preview.tsx:81` | «**Üç kapı**: dosyayı modele nasıl verirsin?» |
| `apps/rail-is/src/ui/copy.ts:14` | «**Supabase** oturumu native **JWT** üretir. Çerez yok. **Amiral** oturumu taşınmaz.» |
| `apps/rail-is/src/ui/copy.ts:115` | «Kart PayTR iFrame'dedir (**HMAC kasa**). Native **IAP** yok. … Split bağlı değilse kabul **503**.» |
| `lib/copy/sen-voice/auth.ts:49` | «…**Confirm Email** açık ve **Auth SMTP** bağlı değil.» |
| `app/api/(kernel)/wallet/top-up/route.ts:194–197` | Kullanıcıya dönen «**Idempotency-Key**» hata metni |

**Tutarsızlık:** «yapay zekâ» (ders metinleri) ile «yapay zeka» (katalog başlığı, SEO) aynı sayfada yan yana. `office-ai-guide-preview.tsx:31–33`: başlık «zeka», gövde «zekâ». Dersler «istem» öğretiyor, SEO ve SSS «Prompt eğitimi» satıyor.

**Uzun, çok adımlı cümleler:** Otomatik sayımda 25 kelimeyi aşan cümle az (~7). Asıl sorun, tek cümleye birden çok eylem sıkıştırılması. Örnekler: `section_1.ts:38` (~44 kelimelik örnek istem), `section_3.ts:50` (maskele, rol ver, beş slayt, görsel öner, on madde kontrol: hepsi tek görev cümlesinde), `office-ai-guide-preview.tsx:33–42` (120+ kelimelik tek vitrin paragrafı).

**Kuralın eksik uygulandığı yer:** «Yani aslında yaptığımız şey…» pekiştirme kalıbı hiçbir ders metninde geçmiyor (0 sonuç). Kural var, uygulama yok.

### D.3 Kuralın fazla uygulanmaması gereken yerler

- **«prompt» kelimesi:** Vatandaş bu kelimeyle arama yapıyor. Derste «istem» doğru. SEO'da «prompt» kalmalı. En iyisi: «istem (prompt diye de geçer)» şeklinde bir kez eşleştirmek.
- **Olumsuz örnek olarak alıntılanan kötü istemler:** OFF-201 ders 4'teki «Eksiksiz rapor yaz» gibi kötü istemler öğretmek için var. Yasaklı kelime taramasıyla silinmemeli.
- **«Sihirli değildir» / «Sihirli cümle yoktur»** (`prep.ts:25, 33, 37`): Abartı değil, abartıya karşı söz. Korunmalı.
- **Marka metaforları (Cüzdan, Pasaport, sertifika mührü):** Ürün dili, stüdyo dili değil. Sorun «mühürlü ses», «Amiral SKU», «Maya» gibi üretim terimleri.

---

## E. DANIŞMA VE TAVSİYE

### E.1 Sen olsaydın ne yapardın?

İlk gün sırayla şu üçünü yapardım:

1. **Çalışma ağacını git'e alırdım.** 283 değişiklik ve 76 yeni dosya, konuya göre 8–12 commit'e bölünür (OFF-201 müfredatı, OFF-201 medya, OFF-101 düzeltmeleri, cüzdan/iade, kimlik/e-posta, belge temizliği, silinen raporlar). Önce ayrı bir dala (`off-201`) alınır, CI yeşile döner, sonra `main`'e birleşir. Bundan sonra canlıya yalnız git'ten dağıtım yapılır. Bu yapılmadan diğer her iş kum üstünde durur: disk bozulursa OFF-201 kaybolur.
2. **`.cursorrules` akademi kilidini 10 satırlık yönlendirmeye indirirdim.** "Sayılar `production-standard.ts`, `human-rhythm.ts`, `instructors.ts`, `model-roles.ts` içindedir. Değiştirmeden önce sor." Aynı anda `production-standard.test.ts` içindeki 142 metin kontrolünü sabit kontrolüne çevirirdim. Böylece belgeleri özgürce düzeltebilirsiniz ve bu raporun C bölümü uygulanabilir hâle gelir.
3. **"4 katman" kuralını dürüst hâle getirirdim.** Ya fon müziği ve video 14 derse de basılır ya da kural "zorunlu çekirdek: ses + rozet + canlı sahne; iyileştirme: fon müziği + ısınma videosu" diye yeniden yazılır. Ben ikincisini seçerdim, çünkü satışı ve öğrenmeyi etkileyen katman ses ve sahne.

### E.2 Kontrol ve öneri: kurgu doğru mu?

**Doğru kurgulanan taşlar:**
- Para, güvenlik ve dürüstlük omurgası (A1–A5). Tek defter, tamsayı kuruş, sunucu puanlaması, fail-closed ödeme. Bu seviyedeki bir girişim için olağanüstü disiplinli.
- Monolit + ince paket + tek mobil istemci. Mikroservise erken bölünmemek doğru karar.
- Satış kapısının mühre bağlı olması (`academyCourseSaleOpen`). Eksik ders satılamıyor.
- Fiyatın koddan değil veritabanından okunması.

**Eksik veya hatalı taşlar:**

| Taş | Sorun | Öneri |
|-----|-------|-------|
| **Sürüm disiplini** | Canlı sistemin ana dalında 283 dosyalık commit edilmemiş iş birikmiş. Canlı ile git'in aynı olduğundan emin olunamıyor. | Dal + PR + yalnız git'ten dağıtım. Küçük ve sık commit. |
| **Medya depolama** | Ders sesleri `public/` altında, git içinde. OFF-101 ~130 MB, OFF-201 ~100 MB (tamamlanınca ~150 MB). Vercel statik tavanı 1 GB. Üçüncü ya da dördüncü kursta tavana çarpılır. Git geçmişi de her yeniden fırında büyür. | Nesne depolama + CDN (Supabase Storage veya Cloudflare R2). Git'te yalnız dosya adresi ve özet (hash) tutulur. `STORAGE_CONTRACT.md` bu kararı bekliyor. |
| **İçerik = kod** | Ders metinleri `.ts` dosyalarında, rozet ve zamanlamalar kodun yanında JSON. Her metin düzeltmesi kod dağıtımı ve test demek. | Ders başına tek klasör (`content/courses/<slug>/<ders>/`: metin, rozet, zamanlama, sınav, medya manifestosu). Kod yalnız okuyucu olur. |
| **Mühür manifestosu yok** | Bir ders mühürlenince 3–4 yerin elle güncellenmesi gerekiyor (mühürlü liste, mobil rozetler, DURUM, süre tablosu). | Fırın betiği tek bir `manifest.json` yazar. Diğerleri ondan türetilir. |
| **Test takımı kırılgan** | Belgeler ve metinler test fikstürü olmuş. Kapalı odaların e2e testleri çürüyor. Olmayan test dosyası "koşuyor" görünüyor. | Metin testleri sabit testine dönüşür. Ölü e2e dosyaları arşive gider. `origin-guard.test.ts` yazılır ya da listeden çıkar. |
| **Uçtan uca gelir kanıtı** | Cüzdan yükleme kanıtlı, kurs satın alma kanıtlı değil. | Bu hafta gerçek kartla bir OFF-101 satın alma + sertifika + dışarıdan `/academy/dogrula` doğrulaması. |
| **Ölçüm** | Belgelerde "gelir üretimini hızlandırıyor mu?" sorusu var, ama dönüşüm hunisi verisi raporlarda yok (`/api/admin/funnel` ucu var). | Haftalık DURUM'a 3 sayı: vitrin ziyareti, hazırlık dersi izlenmesi, satın alma. |
| **Mobil eşitlik** | İade, muafiyet ve ders asistanı mobilde yok. | Kapsam kararı: mobil yalnız "izle + sınav + sertifika" mı kalacak? Karar belgeye yazılır. |

### E.3 Master plan (öneri)

| Faz | Süre | İş | Bitti ölçütü |
|-----|------|----|--------------|
| **0. Zemin** | 1–2 gün | Çalışma ağacını dala alıp commit'lere bölmek. CI'ı yeşile döndürmek. Stash'i incelemek ve atmak/uygulamak. Yalnız git'ten dağıtım. | `git status` temiz, CI yeşil, canlı = son commit. |
| **1. Gelir kanıtı** | 3–5 gün | Gerçek kartla OFF-101 satın alma, sertifika, dışarıdan doğrulama. İade ucunu canlıda bir kez denemek. `wallet_card_refunds` migration'ını teyit etmek. | DURUM'da SETTLED satın alma tanığı. |
| **2. Vatandaş yüzeyi temizliği** | 3–5 gün (ücretsiz) | Cüzdan, akademi, pasaport, kariyer, SEO ve mobil metinlerinden iç jargonu çıkarmak. «yapay zekâ» yazımını tekleştirmek. Rozet eşlemesine `TAŞIMA SU` ve `ÜÇÜNCÜ KAPI` eklemek. Bunlar ses gerektirmez. | Vatandaş metninde SSOT, HMAC, JWT, Amiral, SKU, compact, Maya geçmez. |
| **3. OFF-201 satışa açılış** | 1–2 hafta (ücretli çağrı) | E.4'teki adımlar. | `academyCourseSaleOpen("01_office_ai_ileri") === true`, fiyat satırı açık, bir gerçek satın alma. |
| **4. Belge reformu** | 2–3 gün | Anayasa = yalnız A katmanı + kısa B. Üretim kuralları tek belgede (fırın el kitabı). `.cursorrules` = dışlama listesi + yönlendirme. Metin testleri sabit testine. `docs/DURUM.md` ya geri gelir ya tüm atıflar silinir. README güncellenir. | Pedagoji'de bir cümle değişince hiçbir test kırılmaz. |
| **5. Medya ve içerik altyapısı** | 1–2 hafta | Nesne depolama + CDN. İçerik klasörü. Mühür manifestosu. OFF-101 4. ders kalıntılarını ve ölü dosyaları temizlemek. | Yeni ders eklemek kod değişikliği gerektirmez. Git'te MP3 yok. |
| **6. OFF-101 metin revizyonu** | Fırsat olunca (ücretli) | Abartı ve korku dilini düzeltip ilgili dersleri yeniden seslendirmek. Pekiştirme kalıbını eklemek. Hiçbir ders düzeltme yüzünden satıştan kalkmaz. | Ders 1 ve 4 (`-1`, `-3`) yeni metinle mühürlü. |
| **7. Büyüme** | Sürekli | Huni ölçümü. Sonraki kurs (veli-öğretmen taslağı en hazır olanı) için aynı hat. | Haftalık 3 sayı DURUM'da. |

Sıralama mantığı: önce kaybetme riskini kapat (0), sonra parayı kanıtla (1), sonra ücretsiz kaliteyi artır (2), sonra yeni ürünü sat (3). Altyapı (5), üçüncü kurstan önce bitmeli.

### E.4 Bir sonraki aşama: OFF-201 için ilk somut adım

**İlk adım: OFF-201'i git'e almak.** Bugün `office_ai_2/`, ses dosyaları, sınav havuzu ve yeni uçlar son commit'te yok. Yeniden seslendirme ücretli bir iş. Bir hata ya da disk sorunu yaşanırsa, ödenen fırının kaydı bile kalmaz.

Somut sıra:

1. `off-201` dalı açılır. OFF-201 dosyaları kendi commit'lerine alınır: müfredat (`lib/academy/curricula/office_ai_2/`, `off-201.ts`, `exam-pools-office-ai-2.ts`, `phase2-*`), rozet/zamanlama/sınav JSON'ları, konuşma metinleri, mühürlü 3–5 sesleri. CI yeşil olmalı.
2. Mühürsüz `01_office_ai_ileri-6.mp3` silinir. Mühür kontrolünü atlayan bir yol olursa eski metni duyurmasın.
3. Gemini 3.1 Flash TTS kotası kontrol edilir. Kota yoksa beklenir. 2.5'e düşülmez.
4. Ders 1 `--dry-run` ile denenir (ses Kore). Metin, rozet ve zamanlama birbirine oturunca `--seal --confirm-gemini-spend` açılır. Aynı sıra ders 2 (Puck) ve ders 6 (Zephyr) için tekrarlanır.
5. Mühür sonrası güncellenecek yerler: `ACADEMY_MEDIA_SEALED_AUDIO`, `ACADEMY_TTS_REBAKE_QUEUE` / `ACADEMY_TTS_REVOKED_CASSETTES`, `apps/rail-is/src/ui/academy-punchcards.ts`, `docs/ops/DURUM.md`.
6. Küçük kod işleri: ödeme dönüş sayfası kullanıcıyı satın aldığı kursa yönlendirsin. `instructors.ts` içindeki Callirrhoe yedeği kaldırılsın. `OFF_201_EXAM_POOL_MAX` gerçek havuzla hizalansın.
7. Super Admin `PriceCatalogEntry` içinde `course:01_office_ai_ileri` fiyatını açar. Satış kapısı kendiliğinden açılır.
8. Gerçek kartla bir OFF-201 satın alma ve bir muafiyet yolu denemesi yapılır.

---

## EK: Kanıt komutları (tekrar üretmek için)

```powershell
git diff --shortstat                                  # 283 files changed, 4834 insertions(+), 5122 deletions(-)
git status --porcelain | Measure-Object -Line         # 361 satır (256 M, 29 D, 76 ??)
git ls-tree -r --name-only HEAD -- lib/academy/curricula | Select-String office_ai_2   # boş
git ls-tree -r --name-only HEAD -- public/media/academy/audio | Select-String ileri    # boş
Test-Path tests/kernel/origin-guard.test.ts           # False
Get-ChildItem public/media/academy -Recurse -Include *bed*.mp3,*.mp4                   # yalnız 01_office_ai-1
npx vitest run tests/kernel/paytr-webhook-security.test.ts tests/kernel/paytr-wallet-flow.test.ts tests/kernel/ledger-reconciliation.test.ts   # geçti
```
