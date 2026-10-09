# Yetkin.ai — Junior (6. Sınıf) ve Mimari Tespit Raporu

| | |
|---|---|
| Tarih | 5 Ekim 2026 |
| Hazırlayan | Cursor ajanı (salt okuma; bu turda kod, belge ve veritabanı değiştirilmedi) |
| Okuyan | SUPER_ADMIN (`yapinet360@gmail.com`) |
| Dayanak | Kod tabanı (`d:\yetkin.ai`), canlı adres `https://yetkin.ai/`, önceki raporlar `docs/261005a_Tespit_Raporu.md` ve `docs/261005b_Tedavi_Raporu.md` |
| Önceki rapordan farkı | 261005a, düzeltmelerden **önceki** durumu anlatıyordu. 261005b düzeltmeleri yaptı. Bu rapor düzeltmelerden **sonraki** durumu ölçer ve yeni bulguları ekler. Tarihli raporlar silinmedi. |

## 0. Ölçülen ve ölçülmeyen

**Ölçülen**

- Kod okuma: `lib/junior`, `app/junior`, `app/api/junior-pilot`, `components/junior`, `lib/kernel` (güvenlik, ödeme, uyum), `lib/dronlar`, `packages/kernel`, `prisma/schema`, `supabase/migrations`.
- Belgeler: `ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`, `.cursorrules`, `AGENTS.md`, `AKADEMI_URETIM_ANAYASASI.md`, `README.md`, `STORAGE_CONTRACT.md`, `OPS_RUNBOOK.md`, `DRON_CLIENT_SPEC.md`.
- Canlı sitede anonim GET istekleri (durum kodu ve görünen metin).
- Çalıştırılan kontroller: 10 Junior/kenar test dosyası → **51 test yeşil**. `verify:junior-pilot-seals` → OK. `verify:boundaries` → OK. `tsc --noEmit` → **hatasız**.
- Atıl dosya taraması: 1467 kaynak dosya üzerinde import grafiği (yöntem 2. bölümde).

**Ölçülmeyen**

- Canlı veritabanı satırları (kullanıcı, fiyat, yayın bayrağı). Bu yüzden `yapinet360@gmail.com` hesabının canlıdaki gerçek oturumu denenmedi; sonuç **kod okumasından** çıkarıldı.
- Vercel ortam değişkenleri (`SUPER_ADMIN_USER_ID`, `DRON_JUNIOR_OPEN`, PayTR üçlüsü).
- `public/media/` baytları ve `media-bake/` içeriği.
- Hukuki yeterlilik. Aşağıdaki KVKK notları mühendislik uyarısıdır, hukuki görüş değildir.

---

## Yönetici özeti (10 madde)

1. **Junior bugün canlıda yalnız vitrin.** Ders listesi ve her kartın ilk konusu açık (200). Profil, kasa, anlatış, test ve ikinci konular fiilen kullanılamaz. Canlı ölçüm kod ile birebir uyuşuyor.
2. **Junior'da para → paket köprüsü hiç yok.** `saveActiveSubscription` üretim kodunda **hiçbir yerden çağrılmıyor**; yalnız testler çağırıyor. PayTR bildirimi (webhook) Junior'u tanımıyor. Kasa açılsa bile paket doğamaz.
3. **Junior fiyatı Anayasa A1'e aykırı iki evde duruyor.** Kodda sabit `549_900` ve `"5.499 TL"` metni var. Veritabanına da `cat_junior_yearly` satırı tohumlanmış ama kod o satırı okumuyor. Super Admin fiyatı değiştirse vitrin eski rakamı basar.
4. **`yapinet360@gmail.com` yetişkin Akademi'de güçlü, Junior'da sıradan veli.** Junior kodunda süper yönetici yolu yok. Kapı kilitliyken ona da 410/503 döner. Yani 6. sınıfın ücretli kısımlarını kimse, süper yönetici dahil, üretimde deneyemiyor.
5. **Kilit mimarisi açılışa direniyor.** `JUNIOR_PRODUCTION_LOCKED = true` derleme sabitidir; bayrak tek başına açmaz; testler ve mühür betikleri bu sabitin `true` kalmasını şart koşar. Kapalı beta (yalnız süper yönetici ve seçili veliler) yapılamaz.
6. **Junior, kendi belgesindeki mimari kuralları karşılamıyor.** Anayasa B1: yeni yetenek önce `/api/v1` hop'u olur, oda `DRON_KAYIT`'a yazılır. Junior'un 0 hop'u var, `DRON_KAYIT`'ta satırı yok, aynı anda hem "bağımsız oda" hem "donmuş oda" listesinde duruyor.
7. **6. sınıf içeriği pilot ölçeğinde.** 4 çekirdek + 6 seçmeli ders × 2 konu = **20 konu**. Soru arşivi **3 konuda** var. Tam 6. sınıf müfredatından çok uzak.
8. **Çocuk odasında yetişkin sohbet asistanı açık.** `/junior` ve `/junior/checkout` sayfalarında "kariyer danışmanınım" karşılaması çıkıyor. Pedagoji Ek-J "serbest sohbet yoktur" der.
9. **Atıl kod küçük ama gerçek:** 15 hiçbir yerden çağrılmayan dosya, 28 yalnız testle yaşayan dosya, 13 yalnız betikle yaşayan dosya. Büyük çöp yığını yok. Asıl sorun atıllık değil, **aynı bilginin birden çok evde durması** (fiyat, oda listesi, yol kuralı, belge metni).
10. **Mimari yön doğru, uygulama Junior'da kopuk.** Pragmatik Monolit doğru seçim. Darboğazlar ayrı sunucu eksikliği değil: (a) Junior'un kendi paralel altyapısı, (b) açılışa direnen kilitler, (c) belge ağırlığı.

---

# ADIM 1 — Junior (6. Sınıf) ve içerik durumu

## 1.1 Canlı durum ve kodun doğruladığı tablo

Anonim istekle `https://yetkin.ai` üzerinde ölçüldü (5 Ekim 2026, akşam):

| Adres | Canlı sonuç | Kodla uyum |
|---|---|---|
| `/junior` | 200. "Dersler" listesi, pilot cümlesi, "Paketi Al (5.499 TL)" düğmesi | Uyuyor |
| `/junior/ders/jr_06_mat-1` | 200. Ders görünür | Uyuyor |
| `/junior/ders/jr_06_mat-2` | 200. "Bu konu veli girişi ve yıllık paket ister." Gövde yok | Uyuyor |
| `/junior/ders/jr_06_ing_main-1` | 200 | Uyuyor |
| `/junior/ders/jr_06_mat-9` (yok) | **200** (gövde not-found, `noindex`) | Soft-404, bkz. 1.7 |
| `/junior/checkout` | 200. "Ödeme hattı henüz bağlanmadı." | Uyuyor |
| `/api/junior-pilot/tell` | 401 | Uyuyor (oturum ister) |
| `/api/junior-pilot/profiles` | **410** | Uyuyor (kilit) |
| `/api/junior-pilot/checkout` | **410** | Uyuyor (kilit) |
| `/studio`, `/freelancer` | 410 | Uyuyor |
| `/api/v1/health` | 200, `db: ok`, `payments: configured` | Altyapı ayakta |

Sonuç: 261005b'nin "Junior kapısını tek cümleye indir" düzeltmesi canlıya yansımış.

## 1.2 6. sınıf ders verisi: nerede, nasıl duruyor

| Katman | Ev | Not |
|---|---|---|
| Ders metni | `lib/junior/catalog.ts` (çekirdek, ~41 KB), `lib/junior/elective-catalog.ts` (seçmeli, ~36 KB) | TypeScript dosyası. Veritabanı ders gövdesi tutmuyor. |
| Soru arşivi | `lib/junior/question-bank.ts` (kod). `junior_question_bank` tablosu şemada var | Konu testi kod arşivini okuyor; tablo fiilen boş kalan ikinci ev. |
| Çocuk profili, rıza, ilerleme, puan, paket | `prisma/schema/junior.prisma` (6 tablo) | Hepsi `FORCE RLS` sicilinde (`rls-policy-registry.ts`). |
| Kapı ve kilit | `lib/kernel/compliance/circuit-breakers.ts`, `lib/kernel/security/edge-guard.ts`, `edge-api-auth.ts` | Kernel, Junior politikasını taşıyor. |
| Ses | Tarayıcı sesi (`lib/junior/speech.ts`) | Yetişkin beş katman kuralı Junior'a uygulanmıyor (Pedagoji Ek-J, doğru karar). |
| Anlatış değerlendirme | `lib/junior/tell.ts` → `FAST_STREAM` rolü → `lib/kernel/ai/model-roles.ts` | Model kimliği tek evden okunuyor; sabit model adı yok. Model haritasına dokunulmadı. |

**Bir dersin iç yapısı** (`JuniorLessonScript`): `key`, `title`, `teaser`, `listenText`, `outcomes[]`, `scene`, `steps?`, `mebNote`, `lifeUse`.

- `listenText`, `mebNote` ve `lifeUse` aynı konuyu üç ayrı uzun metinle anlatıyor. `mebNote` ile `listenText` büyük ölçüde aynı cümleleri taşıyor. Bir düzeltme üç yerde yapılıyor.
- Seçmeli derslerin kalite kapısı, şablon cümlelerin metinde **geçip geçmediğine** bakıyor (`juniorElectiveLessonsSharePlayerContract`: "Sevgili çocuklar merhaba!", "Kavramsal Anlayış", "İfade Gücü", "Aferin size!"). İçerik kalitesini değil kalıp uyumunu ölçüyor.

## 1.3 Müfredat durumu: ne var, ne eksik

| Kart | Konu sayısı | Çizim | 10 soruluk test | Durum |
|---|---|---|---|---|
| Matematik `jr_06_mat` | 2 (Kesir; aynı paydada toplama) | Var | Yalnız 1. konuda | Pilot |
| Fen `jr_06_fen` | 2 (Kuvvet; sürtünme) | Var | Yalnız 1. konuda | Pilot |
| Türkçe `jr_06_turkce` | 2 (Ana fikir; yardımcı fikir) | Var | Yalnız 1. konuda | Pilot |
| Ana İngilizce `jr_06_ing_main` | 2 (I'm/is/are; a-an) | Adım şeridi | **Yok** | Pilot |
| 6 seçmeli (İngilizce pratik, Almanca, Fransızca, Siyer-i Nebi, Kodlama, Arapça) | 2'şer = 12 | Şablon | **Yok** | Taslak |
| **Toplam** | **20 konu** | | **3 konuda test** | |

**Eksikler (öncelik sırasıyla)**

1. **Konu derinliği.** Her derste yalnız 2 konu var. "6. sınıf Matematik" demek için ünite başına tam konu zinciri gerekir. Gerçek konu sayısı Milli Eğitim Bakanlığı (MEB) 6. sınıf öğretim programındaki kazanım listesinden çıkarılmalı. Bu raporda MEB kazanım sayısı doğrulanmadı; rakam uydurulmadı.
2. **Eksik dersler.** Çekirdek kartlarda Sosyal Bilgiler yok. Din Kültürü ve Ahlak Bilgisi doğrudan yok (yalnız seçmeli "Siyer-i Nebi" var). Kararı SUPER_ADMIN vermeli: pilot ürün sözü "4 çekirdek ders" olarak mı kalacak, yoksa "okul dersleri" mi denecek? (MEB ders çizelgesi dış bilgidir; yayın öncesi güncel çizelge ile karşılaştırılmalı.)
3. **Soru arşivi.** 17 konunun testi yok. Arşivsiz konuda ekran "Hazırlık Aşamasında" diyor; ders "bitti" sayılamıyor.
4. **Dil kuralı çelişkisi.** Ders metni "siz" ile konuşuyor ("Elmayı dört eşit parçaya bölün"). Manifesto 1.4 ve Pedagoji §A.2 platform sesini SEN yapıyor. Ek-J bu konuda susuyor. Karar verilmeli (bkz. 3.3).
5. **Sınıf.** Yalnız 6. sınıf. 7-8 için metin yok; seçici bilinçli olarak 6'ya kilitli (doğru).
6. **Ses.** Tarayıcı sesi cihaza göre değişir. Kalite güvencesi yok. Karar Ek-J'de "ayrı karar" olarak bırakılmış, henüz verilmemiş.

## 1.4 `yapinet360@gmail.com` — SUPER_ADMIN yetkileri

**Veritabanındaki tanım.** `users` tablosunda rol/yönetici kolonu **yoktur** (`prisma/schema/kernel.prisma`, `model User`). SUPER_ADMIN bir veri değil, **kod + ortam değişkeni** tanımıdır. Canlıdaki `users` satırının varlığı ölçülmedi.

**Kod tanımı** (`lib/kernel/auth/super-admin.ts`, tek kapı `isSuperAdminActor`):

| Koşul | Sonuç |
|---|---|
| E-posta `yapinet360@gmail.com` **ve** `email_confirmed_at` dolu | Admin. Kodun içine yazılı "yerleşik kutu". Üretimde `SUPER_ADMIN_USER_ID` boş olsa da açılır. |
| E-posta doğrulanmamış | Admin değil. |
| `yetkin.vision@gmail.com` | Hiçbir ortamda admin olamaz. |
| Başka adres, üretim | Hem `CANONICAL_SUPER_ADMIN_EMAIL` hem `SUPER_ADMIN_USER_ID` env'i oturumla eşleşmeli. |

**Erişim matrisi** (kod okumasından; canlı oturumla denenmedi)

| Alan | Erişim | Dayanak |
|---|---|---|
| Admin API'leri (katalog, yayın, huni) | Evet | `requireSuperAdmin`, `assertSuperAdminActor` (süper yönetici kapısı 22 dosyada kullanılıyor) |
| Yetişkin Akademi ders gövdesi (2. ders ve sonrası) | Evet, satın almadan | `admin-bypass` (`lib/academy/entitlement.ts`) |
| Akademi sınavı ve sertifikası | **Hayır** (üretimde gerçek `SETTLED` satır ister) | `hasUnlimitedAcademyAccess` üretimde kapalı |
| Kalıcı sıfır liralık bağış satırı | Hayır (üretimde yazılmaz) | `isZeroFeeAcademyGrantOpen` |
| **Junior ilk konular** | Evet, ama herkese zaten açık | |
| **Junior 2. konular, anlatış, test** | **Hayır** | `lib/junior` içinde süper yönetici dalı yok (arama sonucu boş) |
| **Junior profil açma, paket seçme, kasa** | **Hayır** (kenar 410 / servis 503) | `isFrozenRoomApi`, `juniorLockedResponse` |
| Eski stüdyo odası | Hayır (410) | Herkese kapalı |

**Sonuç:** "6. sınıf içeriklerine tam erişim" bugün **yok**. Süper yönetici de anonim ziyaretçinin gördüğünü görüyor. Ücretli kısmı (anlatış, test, 2. konu, haftalık rapor) hiç kimse üretimde deneyemiyor.

**Riskler**

- **Tek posta kutusu = tek nokta.** Yerleşik kutu koda gömülü; ikinci bir yönetici ya da kurtarma hesabı yok. Kutu veya Google/Supabase hesabı ele geçerse tüm admin yetkisi gider. Zorunlu çok adımlı doğrulama (MFA) kodda sınanmıyor.
- **Aynı e-posta iki yerde yazılı:** `lib/kernel/auth/super-admin.ts` ve `lib/copy/legal-launch.ts` (`adminEmail`). Biri değişirse diğeri kalır.

## 1.5 Core (Amiral) ↔ Junior: veri akışı ve yetkilendirme

```text
Tarayıcı (Supabase çerez oturumu)
   │
   ▼
Kenar: proxy.ts → edge-guard / edge-api-auth / edge-jwt
   │   /junior*            → geçir (isJuniorClosedPilotPath)
   │   /api/junior-pilot/* → kilitliyse 410 (tell, quiz, practice hariç)
   ▼
app/junior (RSC)  ─────────────────┐     app/api/junior-pilot/* (7 route, auth="session")
   │                               │          │ requireSession → juniorLockedResponse
   ▼                               ▼          ▼
lib/junior/load.ts  →  lib/junior/service.ts  →  JuniorStore (Prisma, 6 tablo)
                                   │
                                   ├─ lib/kernel/ai/llm-gateway + model-roles (FAST_STREAM)   [çocuk sesi/yazısı → dış model]
                                   ├─ lib/kernel/payments/paytr/checkout (yalnız yardımcılar)  [köprü yok]
                                   └─ lib/kernel/http, observability, auth/session
```

**Doğrulananlar**

- `verify:boundaries` yeşil: kernel, dikey odayı import etmiyor.
- Sahiplik kontrolü servis katmanında: işlemler `userId` ile çalışıyor; yabancı profilde "Bu profil senin hesabında yok" (404). RLS: altı Junior tablosu `FORCE RLS` sicilinde; yeni tablolar için olay tetikleyicisi var (`supabase/migrations/20260814020000_enforce_rls_all_tables.sql`). Canlı veritabanında uygulandığı ölçülmedi.
- Model kimliği sabit değil, `getDefaultModelId("FAST_STREAM")` ile tek evden geliyor.

**Kopuk olanlar**

| Kopukluk | Ayrıntı |
|---|---|
| **v1 hop yok** | `RAIL_V1_HOPS_META` içinde Junior hop'u 0. Native istemci (`apps/rail-is`) Junior'dan habersiz. Junior yalnız çerez oturumlu web rotalarıyla konuşuyor. |
| **`@yetkin/kernel` paketinde Junior yok** | `course-registry.ts` Junior kartını kasten yasaklıyor (doğru), ama Junior için ayrı bir kimlik/sözleşme paketi de yok. |
| **Oda kaydı yok** | `DRON_KAYIT`'ta Junior satırı yok. `INDEPENDENT_ROOMS` ve `FROZEN_DISK_ROOMS` listelerinde **birlikte** duruyor. `verify-boundaries.ts` içinde Junior için özel istisna (`closedPilot`) var. |
| **Kernel, Junior politikasını taşıyor** | `circuit-breakers.ts` ve `edge-guard.ts` Junior'a özel sabit ve yol fonksiyonları içeriyor. Import yasağı korunuyor ama politika kernel'e sızmış. |
| **Şema bağı** | `User` modeli Junior ilişkilerini taşıyor (5 ilişki). Tek veritabanı olduğu için doğal; ileride ayırma maliyetini artırır. |
| **Ödeme kopuk** | 1.6'da. |
| **Soru arşivi çift ev** | `junior_question_bank` tablosu + `question-bank.ts` kodu. |

## 1.6 Eksik servisler ve ölü kod (Junior içinde)

1. **Ödeme → paket köprüsü yok.** `JuniorStore.saveActiveSubscription` yalnız testlerde çağrılıyor. `completeJuniorCheckout` iki dalında da aynı 503'ü döndürüyor (ikinci `if` ölü). Webhook (`/api/payments/webhooks/paytr`) Junior niyetini (`intent`) tanımıyor (`lib/kernel/payments` altında "junior" sıfır eşleşme). Yetişkin Akademi'deki `paytr-license-bridge` karşılığı Junior için yazılmadı.
2. **Ölü ödeme kodu:** `buildJuniorPaytrSeal`, `JUNIOR_PAYTR_TEST_CREDENTIALS` (sandbox anahtarları kodda), "Direct" kart yolu için ayrı `createHmac` hesabı. Kernel zaten `buildPaytrTokenHash` taşıyor. Direct (kart numarasını sunucudan geçiren) yol PCI kapsamını büyütür; kernel iFrame kullanıyor. Bu kod silinmeli ya da kernel'e taşınmalı.
3. **Fatura bilgisi düz metin kolon:** `junior_subscriptions.invoice_tckn`, `invoice_phone`, `invoice_address`. Ödeme açılmadan önce ya hiç saklanmamalı (PayTR/fatura sağlayıcısında kalmalı) ya da şifrelenmeli. Şu an satır oluşmuyor, o yüzden risk henüz teorik.
4. **Çocuk sesi dış modele gidiyor.** "Ses saklanmaz" doğru (diske yazılmıyor), ama ses değerlendirme için üçüncü taraf modele gönderiliyor. Veli aydınlatma metni bunu açıkça söylemeli. (Hukuk danışmanı doğrulamalı.)
5. **Çocuk odasında yetişkin sohbet widget'ı.** `AppShellSwitch` yalnız `/academy/dogrula` için asistanı kapatıyor. `/junior` ve `/junior/checkout` canlıda "Ben yetkin.ai kariyer danışmanınım" karşılamasını gösteriyor.
6. **Kasa düğmesi vs. dürüst yüzey.** Oda listesinde "Paketi Al (5.499 TL)" görünüyor; kasa sayfası ise "Ödeme hattı henüz bağlanmadı" diyor. İlk ekran satış vaat ediyor (Anayasa A5 ruhuna ters; ağır değil).
7. **`DRON_JUNIOR_OPEN`** `.env.example` içinde yok. `OPS_RUNBOOK.md`, `STORAGE_CONTRACT.md`, `ops/*.md` içinde Junior'dan **hiç söz edilmiyor**. Operatör bu odayı belgeden öğrenemez.

## 1.7 Küçük teknik not: soft-404

Bilinmeyen adresler (`/junior/ders/jr_06_mat-9`, `/academy/yok-boyle-kurs`) HTTP **200** dönüyor; sayfa `notFound()` çağırıyor ama durum satırı 200 kalıyor, `noindex` var. Arama motoru için sorun küçük (noindex var); izleme ve bozuk bağlantı taramasında yanıltıcı. Düşük öncelik.

---

# ADIM 2 — Kod tabanı ve temizlik

## 2.1 Yöntem

1467 kaynak dosya (`app`, `components`, `lib`, `packages`, `scripts`, `tests`, `apps/rail-is/src`, kök yapılandırma). Dışlananlar: `.cursorrules` listesi (`node_modules`, `.next`, `archived`, `yetkin_muze`, `generated`, `public`, `.tmp` vb.). `import`/`export from`/`import()`/`require`/`vi.mock` kalıpları ile grafik kuruldu. Kök noktalar: `app/**`, `scripts/**`, `tests/**`, kök yapılandırma, `apps/rail-is`. Aday küme: `lib`, `components`, `packages` (733 dosya).

**Sınır:** Metinle okunan dosyalar (testlerin `readFileSync` ile açtığı) ve şablon dizeli dinamik import grafikte görünmez. "Yetim" listesi **silme listesi değil, inceleme listesidir**.

## 2.2 Sonuç

| Sınıf | Adet | Anlamı |
|---|---|---|
| Yetim (hiçbir yerden import yok, test dahil) | **15** | İncele, çoğu silinir |
| Yalnız testle erişiliyor | **28** | Üretimde ölü, testte canlı |
| Yalnız betikle erişiliyor | **13** | Üretim yolunda değil (fırın/ops) — çoğu bilinçli |
| Boş (0 bayt) dosya | 0 | Temiz |
| `.bak/.old/.orig` adlı gerçek yedek | 0 | Temiz (2 eşleşme yanlış alarm: `copy.ts`, `load-academy-bake-env.ts`) |

### 2.2.1 Yetim (15)

| Dosya | Not |
|---|---|
| `components/academy/junior-cross-sell.tsx` | Anayasa B6 "Akademi vitrininde Junior şeridi vardır" der. **Canlı `/academy` sayfasında şerit yok.** Belge yanlış ya da bileşen bağlanmamış. |
| `components/junior/maarif-seal.tsx` | Hiçbir yerde kullanılmıyor; yalnız bir test "yasak ifadeler yok" diye dosyayı okuyor. |
| `components/freelancer/` altında 9 dosya (`direct-job-offer-*`, `direct-offer-inbox`, `frozen-satellite`, `squad-*`, `standalone-squad-modal`, `usta-expertise-list`) | Freelancer yüzeyi 410; bileşenler bağlı değil. Anayasa "motor ve şema silinmez" der; bileşenler motor değil. |
| `components/shell/frozen-room-gone-page.tsx` | 410 sayfası başka yolla üretiliyor olabilir; doğrula. |
| `lib/freelancer/released-proofs.ts` | |
| `lib/kernel/proof/index.ts` | |
| `lib/kernel/env.ts` | İki test metin olarak okuyor; çalışma zamanında kullanılmıyor. |

### 2.2.2 Yalnız testle yaşayan (28)

- `lib/academy/curricula/phase2-drafts/**` (9 dosya, `parent_teacher_ai` taslağı) — **taslak müfredat üretim ağacında duruyor.**
- `lib/academy/`: `article-spoken-diff`, `catalog-favorites`, `config`, `index`, `issued-certificates`, `lesson-description`, `lesson-listen`, `lesson-tts-slot`, `syntax-highlight`, `web-speech`, `curricula/phase2-drafts.ts`, `curricula/phase2-exam-readiness.ts`
- `lib/career/index.ts`, `lib/freelancer/index.ts`, `lib/freelancer/standalone-squad-store.ts`
- `lib/junior/memory-port.ts` — test çifti üretim ağacında.
- `lib/kernel/ai/paid-command.ts`, `lib/kernel/http/memory-idempotency-store.ts`, `lib/kernel/notice/index.ts`, `lib/kernel/rooms.ssot.ts`

> `rooms.ssot.ts` kendini `@deprecated` ilan eden, `lib/dronlar/kayit.ts` için yeniden dışa aktarım kabuğu. Adı hâlâ "SSOT" diyor ama kimse import etmiyor. Silinebilir.

### 2.2.3 Yalnız betikle yaşayan (13) — çoğu bilinçli

`lib/academy/`: `certificate-lifecycle`, `curriculum-floor`, `human-rhythm`, `media-release-seal`, `tts-ab-sample`, `tts-loudnorm`, `tts-piece-cache`, `tts-quality-gate`, `tts-studio-prompt`; `lib/kernel/`: `bounded-contexts`, `public-size-budget`, `security/rls-policy-registry`, `storage/byte-ceilings`. Bunlar fırın ve doğrulama kodu. Dokunma.

### 2.2.4 Diğer atıllar

| Öğe | Durum |
|---|---|
| `tests/_archived-junior/` (3 dosya) | Vitest `exclude` ile hiç çalışmıyor. Ölü test. |
| `scripts/verify-junior-guardianship-seals.ts` | "Emekli" yazıp `exit(1)` veren kabuk. `package.json`'daki `verify:junior-guardianship-seals` takma adı ise **başka betiği** (`verify-junior-pilot-seals.ts`) çalıştırıyor. Çelişkili ikili. |
| `docs/261005b_Tedavi_Raporu.md` | Dayanak olarak `docs/TESPIT_RAPORU.md` ve `docs/TEDAVI_RAPORU.md` dosyalarını gösteriyor; o adlarla dosya yoktu (tarih önekli). Bu rapor `TESPIT_RAPORU.md` adını yeniden yaratıyor. |
| `.tmp/*-nano-slides-done.txt` (3 dosya), `tsconfig.tsbuildinfo` (587 KB), `generated/` (4 MB) | Git dışı; zararsız, yerel kalıntı. |
| `media-bake/` | **1,5 GB, 524 dosya**, git ve Vercel dışı. `.cursorindexingignore` içinde var, `.cursorrules` dışlama listesinde **yok**. |
| `archived/` 139 MB (268 dosya) | Bilinçli müze. |

## 2.3 DRY ihlali envanteri (aynı bilgi, birden çok ev)

| # | Bilgi | Evler | Risk |
|---|---|---|---|
| D1 | **Junior fiyatı** | `lib/junior/limits.ts` (`549_900`, `"5.499 TL"`), `supabase/migrations/20261005160000_junior_yearly_price_seed.sql` (`cat_junior_yearly`), 2 test (`549900`) | **Yüksek.** Anayasa A1: tek ev `PriceCatalogEntry`. Kod o satırı okumuyor. |
| D2 | **Junior yol/oda kuralı** | `edge-guard.ts` (`isJuniorClosedPilotPath`), `edge-security-headers.ts` (`isJuniorMicrophonePath`, aynı koşul), `circuit-breakers.ts` (3 fonksiyon + `FROZEN_DISK_ROOM_CATALOG` kaydı), `route-auth-map.ts` (7 satır), `dronlar/kayit.ts` (2 liste), `verify-boundaries.ts` (istisna) | Orta. Bir yolu değiştirmek 6 dosya. Fonksiyon adı "ClosedPilot" ama yol artık açık. |
| D3 | **Donmuş oda listesi** | `FROZEN_DISK_ROOMS` (`kayit.ts`) ve `FROZEN_DISK_ROOM_CATALOG` (`circuit-breakers.ts`) aynı kimlikleri ayrı tutuyor | Orta |
| D4 | **Junior "açık mı kapalı mı"** | `isVitrineRoomFrozen("junior")` → donmuş; kenar → geçir; yan menü → göster. Aynı odaya üç cevap | Orta |
| D5 | **Süper yönetici e-postası** | `super-admin.ts`, `legal-launch.ts`, yorumlar/betikler | Düşük |
| D6 | **Ders metni (Junior)** | Her derste `listenText` + `mebNote` + `lifeUse` | Yüksek (içerik ölçeğinde) |
| D7 | **PayTR test kipi** | Kernel: `PAYTR_SANDBOX`, `PAYTR_ALLOW_MOCK_CHECKOUT`. Junior: ayrı sandbox anahtar sabiti + ayrı HMAC | Orta |
| D8 | **Beş medya katmanı kuralı** | `ANAYASA.md` B4, `PEDAGOJI.md` §B ("tek tanım"), `AGENTS.md`, `.cursorrules`, `AKADEMI_URETIM_ANAYASASI.md` | Orta. "Tek tanım" iddiası doğru değil, 5 yerde geçiyor. |
| D9 | **Yayındaki kurs envanteri ("6 eğitim", kodlar)** | `README.md`, `STORAGE_CONTRACT.md` (2 yerde), `OPS_RUNBOOK.md` | Orta. Anayasa "sayı belgede durmaz" der; 4 belge sayıyı tutuyor. |
| D10 | **Junior tanımı cümlesi** ("10-18 yaş… veli rızalı özel kanal…") | `ANAYASA.md` B2, B6, `MANIFESTO.md` Ek-J (üç kez aynen) | Düşük |
| D11 | **"Tezgâh" sözcüğü** | Freelancer'ın eski adı (`DRON_CLIENT_SPEC.md`, ops) **ve** öğretmen kişiliği (`PEDAGOJI.md` §2.2) | Orta (karışıklık) |

---

# ADIM 3 — Belgeler ve Anayasa sorgusu

## 3.1 Uyum özeti

| Belge | Canlı/kod ile uyum | Not |
|---|---|---|
| `ANAYASA.md` A1-A5 | Yetişkin tarafta uyumlu | A1 Junior fiyatında ihlal (D1). A5: Junior ilk ekranda satış vaadi (1.6/6). |
| `ANAYASA.md` B1 | Yetişkin tarafta uyumlu | Junior kuralları karşılamıyor (hop, kayıt). |
| `ANAYASA.md` B3-B4 | Uyumlu | Beş katman, ilk ders ücretsiz, satış kapısı kodla örtüşüyor. |
| `ANAYASA.md` B6 | **Kısmen** | "Akademi vitrininde Junior şeridi" canlıda yok. Diğer cümleler (liste açık, kasa kapalı, 6. sınıf, hazırlık) uyuyor. |
| `MANIFESTO.md` | Uyumlu | Vizyon belgesi; kod çelişkisi yok. |
| `PEDAGOJI.md` | Yetişkin tarafta uyumlu | Ek-J ile Junior arasında dil (SEN/siz) ve sohbet farkı var. |
| `.cursorrules` | Uyumlu | `media-bake/` eksik; biçim eski (3.4). |
| `AKADEMI_URETIM_ANAYASASI.md` ↔ `model-roles.ts` | **Uyumlu** | Metin `gemini-3.8-flash`, ses `gemini-3.8-flash-tts`, görsel `gemini-3.1-flash-image`, müzik `lyria-3.5`, canlı sohbet `gemini-3.8-live`: belge ve kod aynı. Dokunulmadı. |

## 3.2 Çelişkiler ve eskimiş cümleler

| # | Çelişki / eskime | Kanıt | Önerilen karar |
|---|---|---|---|
| C1 | **B1 "yeni yetenek önce v1 hop"** ↔ Junior'un 0 hop'u ve çerez oturumlu 7 rotası | `v1-hops-meta.ts`, `route-auth-map.ts` | Ya B6'ya "Junior web-yalnız, native istemci gelince hop yazılır" istisnası yaz, ya salt-okuma hop'larını ekle. İstisnasız bırakma. |
| C2 | **B1 "yeni oda = `DRON_KAYIT` + sözleşme + bayrak"** ↔ Junior kayıtta yok, bayrağı özel (`DRON_JUNIOR_OPEN`) | `kayit.ts`, `circuit-breakers.ts` | Junior'u `DRON_KAYIT`'a yaz ya da B1'e "bağımsız oda" sınıfı ekle. |
| C3 | **Manifesto Kural 1 "Faz 1'de yeni oda açılmaz (CEO + SA çift imza)"** ↔ Junior oda olarak yan menüde herkese açık | `sidebar-nav.tsx` | Çift imzanın kaydı yok. İmzayı belgeye yaz ya da Junior'un "oda değil, kanal" olduğunu tanımla. |
| C4 | **B6 "Akademi vitrininde Junior tanıtım şeridi vardır"** | Canlı `/academy`, `junior-cross-sell.tsx` yetim | Cümleyi sil ya da şeridi bağla. |
| C5 | **A1 fiyat tek ev DB** ↔ Junior sabit fiyat | D1 | Kodu belgeye uydur: fiyatı katalogdan oku. |
| C6 | **Ek-J "serbest sohbet yoktur"** ↔ çocuk odasında genel sohbet widget'ı | Canlı `/junior`, `/junior/checkout` | Widget'ı Junior'da kapat ya da Junior'a özel kısıtlı kişilik ver. |
| C7 | **Manifesto/Pedagoji "SEN"** ↔ Junior metni "siz" | `catalog.ts` | Karar ver, Ek-J'ye yaz. |
| C8 | **`PEDAGOJI.md` §B "beş katmanın tek tanımı"** ↔ aynı liste Anayasa B4'te de sayılı | | Bir evi seç; ötekini işaret yap. |
| C9 | **`model-roles.ts` yorumu "Tavan: 8 (anayasa)"** | `ANAYASA.md` böyle bir madde içermiyor | Yorumu düzelt (belge değil kod). Model haritasına dokunma. |
| C10 | **Başlık tarihleri eski** | `ANAYASA.md` "16 Ağustos", `MANIFESTO.md` "17 Ağustos"; B6 Ekim'de yazılmış | Tarih satırını güncel tut ya da kaldır. |
| C11 | **Eski adlar kodda yaşıyor** | `lib/dronlar/`, `DronBayrakları`, `dron:new`, `RAIL_DRON_ORIGINS`, `apps/rail-is`, "Diyar B", "Tezgâh", "ikincil istemci" | B1 "yeni belge bu adı kullanmaz" diyor ama kimlikler kodda. Kod kimliklerini yeniden adlandırma; belgede "tarihsel ad" notu yeter. |
| C12 | **`README.md` "Beş zorunlu dosya"** | Tablo 5 satır; klasörde 8 belge + `ops/` | Başlığı düzelt. |
| C13 | **Junior ops belgesi yok** | `OPS_RUNBOOK`, `ops/*.md` | Bkz. 1.6/7 |

## 3.3 Kendi kurallarımızı sorgulayalım: hangisi yavaşlatıyor?

**Yavaşlatanlar**

1. **Derleme sabiti olarak kilit** (`JUNIOR_PRODUCTION_LOCKED = true`, `FREELANCER_PUBLIC_SURFACE_LOCKED`, `MARKETPLACE_SPLIT_LIVE`). Açmak için sabit, testler (`expect(...).toBe(true)`), `verify-atomic-seals` ve `verify-junior-pilot-seals` aynı anda değişmeli. Kilit, açılması gereken günü zorlaştırıyor. Davranışı (503/410) sınayın, sabitin değerini değil.
2. **İşaretçi belge düzeni** ("bu madde tekrar etmez, şuraya bak"). Amaç doğru (tek ev), sonuç labirent: bir kuralı anlamak 3-4 belge ve kod dosyası okumak. Yine de 5 kuralda ev çoğalmış (D8-D10).
3. **Belgeyi test eden testler.** 427 test dosyasının 20'si `.system_docs`/Anayasa metnini okuyor; yaklaşık 185 dosya `readFileSync`/`read(` kalıbı içeriyor (hepsi kaynak-metin testi değildir). Cümleyi düzeltmek CI'yi kırabilir. Anayasa B3 bu taramaların "mutlak engel olmaması"nı söylüyor; `vitest run` bunları zorunlu koşuyor.
4. **Anayasa B4'ün büyüklüğü.** İlkeler belgesinde ses adları, cinsiyet, hitap ("Kaan Bey") gibi ürün ayrıntıları var. Bu `lib/academy/instructors.ts` ve Pedagoji'nin işi.
5. **"Faz 1'de yeni oda yok" + Junior'un fiilen oda olması.** Kural ya uygulanmıyor ya yok sayılıyor; ikisi de kural için kötü.

**Koruyanlar (dokunma)**

- A1-A5 (tamsayı para, ödeme kuruluşu olmama, RLS/IDOR, sunucu puanlama, dürüst yüzey).
- Model haritası ve beş aşama kapısı. Bu raporda değiştirilmedi, değiştirilmemeli.
- İlk dersin ücretsiz olması ve bunun DB bayrağı olmaması.
- Mühürsüz kursun satılmaması (`academyCatalogPurchasable`).
- Çocuk güvenliği maddeleri (sahte bakiye yok, ses saklanmaz, reklam yok).

**Eskimiş / gereksiz**

- "Amiral Gemi + Sürü Dron" anlatımı: belge zaten emekli etti. Kodda kimlik olarak kalsın, yeniden adlandırma maliyeti getirisinden büyük.
- `README.md` ve `STORAGE_CONTRACT.md` içindeki kurs sayısı/listesi.
- `.cursorrules` biçimi: Cursor'un güncel yöntemi `.cursor/rules/` altındaki proje kurallarıdır (`.cursorrules` eski yöntem; güncel davranışı Cursor belgesinden teyit edin). Bu dosya her istemde baştan yükleniyor ve `AGENTS.md` ile üçüncü bir kopya oluşturuyor. Dışlama listesi yalnız ilgili dizinlerde geçerli kural olarak bölünebilir; "dokunulmaz referans kartı" kısa bir tek kural dosyası olarak kalabilir. (Kural dosyasının kendisi `.cursor/` dışlamasına takılmasın diye taşıma kararı sizde.)

---

# ADIM 4 — "Baş Mimar olsaydım"

## 4.1 Hemen değiştirecekleri (öncelik sırasıyla)

| # | Değişiklik | Neden | Maliyet |
|---|---|---|---|
| 1 | **Kilidi çalışma zamanına taşı:** `JUNIOR_PRODUCTION_LOCKED` sabitini kaldır; "kapalı beta" modu ekle (süper yönetici + adı geçen veli kimlikleri izin listesi). Davranış testi yaz. | Şu an ücretli akışı kimse deneyemiyor. | Düşük-orta |
| 2 | **Junior fiyatını katalogdan oku** (`price_catalog_entries`, `junior/yearly`); sabit ve etiketi sil; etiket tutardan türesin. | A1; D1. | Düşük |
| 3 | **Ödeme → paket köprüsü:** yetişkin `paytr-license-bridge` kalıbıyla `junior-license:` niyeti, webhook dalı, tek tablo (`junior_subscriptions`) yazımı, idempotency. Ölü Direct/sandbox kodunu sil. | Bugün paket doğmuyor. | Orta |
| 4 | **Çocuk odasında sohbet widget'ını kapat** (ya da Junior'a özel kısıtlı kişilik). | Ek-J; çocuk güvenliği. | Düşük |
| 5 | **Süper yönetici için Junior "izleme" yolu:** yetişkin `admin-bypass` kalıbıyla, nakit satırı yazmadan, yalnız okuma/denetleme. Çocuk verisi yazmasın; kendi test profilini açsın. | QA ve içerik denetimi. | Düşük |
| 6 | **Junior'u tek kapıya bağla:** `canEnterJunior(actor, lessonKey, profile)` tek fonksiyon; kenar, sayfa, API ve menü bunu okusun. `DRON_KAYIT`'a Junior'u gerçek satır olarak yaz; `FROZEN_DISK_ROOMS`'tan çıkar. | D2-D4; B1 uyumu. | Orta |
| 7 | **Ders metnini tek kaynak yap:** her konu için bölümlü tek senaryo (kavram, örnek, uyarı, hayat); `listenText`/`mebNote`/`lifeUse` bu bölümlerden üretilsin. Konu başına ayrı dosya (`lib/junior/content/<slug>/<n>.ts`). | 100+ konuda tek 40 KB dosya ve üç kopya yönetilemez. DB'ye geçiş şimdi değil. | Orta |
| 8 | **Belge temizliği (1 gün):** C4, C8-C13, D8-D10. Kurs sayısı/listesi yalnız koddan okunsun. | Güven. | Düşük |
| 9 | **Soft-404 düzeltmesi** ve Junior için canlı duman testi (Playwright). | İzleme. | Düşük |

## 4.2 Amiral + Sürü kurgusu doğru mu?

**Evet, ilke doğru.** Tek Next.js gövdesi, ince sözleşme paketi (`@yetkin/kernel`), tek native istemci (`apps/rail-is`), ayrı sunucu yok. `verify:boundaries` yeşil; para, ödeme, RLS, idempotency omurgası yetişkin akışta sağlam görünüyor. Ayrı mikro servis bu ürünü büyütmez; küçük ekip için doğru karar.

**Ama uygulama Junior'da kopuk.** Kritik darboğazlar:

| # | Darboğaz | Etki |
|---|---|---|
| B1 | Junior, yetişkin Akademi'nin yaptığı işleri (yetki kararı, fiyat, ödeme köprüsü, içerik üretim hattı) **kendi paralel kodunda** yeniden yazıyor. | Her yeni özellik iki kez yazılır; sapma kaçınılmaz. |
| B2 | Yol/oda politikası beş-altı dosyaya dağılmış, kernel Junior adını taşıyor. | Oda açma/kapama riskli, yavaş. |
| B3 | Kilitler derleme sabiti; açılış sürecine direniyor. | Beta, canary, kademeli açılış yok. |
| B4 | İçerik kodda ve tek parça. | 6. sınıfı tamamlamak (yüzlerce konu) mevcut yapıyla taşınamaz. |
| B5 | Tek yönetici kutusu, rol tablosu yok. | Operasyonel ve güvenlik riski. |
| B6 | Belge sayısı ve işaretçi düzeni yön bulmayı yavaşlatıyor; testler belge metnine bağlı. | Geliştirme hızı. |
| B7 | Native istemci ve v1 sözleşmesi Junior'dan habersiz. | "Tek native istemci" vaadi Junior için boş. |
| B8 | `User` modeli bütün dikeylerin ilişkisini taşıyor. | Bugün sorun değil; ileride ayırma maliyeti. Eylem gerekmez, bilinmeli. |

**Ölçülmeyen ama izlenmesi gereken:** derleme süresi (`build` önce çok sayıda doğrulama koşturuyor), Gemini maliyeti (çocuk başına günlük 8 anlatış sınırı var, bütçe kalkanı bağlı mı doğrulanmadı), canlı veritabanı yükü.

## 4.3 MASTER PLAN

Bağımlılık sırası: **karar → kapı → ödeme/hukuk → içerik → ölçek.** Hukuki işler kod işleriyle paralel yürür; kod yalnız hazır olur, para kilidi hukuki onaydan sonra kalkar.

### Aşama 0 — Kararlar (SUPER_ADMIN, bu hafta, kod yok)

| # | Karar |
|---|---|
| 0.1 | Ürün sözü: "6. sınıf tamamı" mı, "4 çekirdek ders + pilot" mı? Sosyal Bilgiler ve Din Kültürü kapsamda mı? |
| 0.2 | Junior dili SEN mi siz mi? Ek-J'ye yazılacak. |
| 0.3 | Junior "oda" mı "kanal" mı? Manifesto Kural 1 çift imzası kayda geçecek ya da madde yeniden yazılacak. |
| 0.4 | İkinci yönetici/kurtarma hesabı ve MFA politikası. |
| 0.5 | Junior sesi: tarayıcı sesi kalıcı mı, kayıtlı ses mi? |
| 0.6 | Çocuk odasında sohbet asistanı: kapalı mı, kısıtlı mı? |

**Bitti sayılır:** Kararlar `ANAYASA.md` B6 / `PEDAGOJI.md` Ek-J içinde tek cümleyle yazılı.

### Aşama 1 — Dürüst ve açılabilir kapı (1 hafta)

1. Kilit sabitini kaldır; kapalı beta modu + izin listesi (4.1/1).
2. `canEnterJunior` tek kapı; `DRON_KAYIT` kaydı; yinelenen yol fonksiyonlarını tek yere indir (4.1/6).
3. Süper yönetici izleme yolu (4.1/5).
4. Sohbet widget'ı kararı uygulanır (4.1/4).
5. Fiyat katalogdan (4.1/2).
6. Belge düzeltmeleri (4.1/8) ve `OPS_RUNBOOK`'a Junior bölümü (bayrak, kilit, kapalı beta, geri alma).
7. Testler: kilit sabitini değil davranışı sınayan testler. Eski "sabit `true`" testlerini ve mühür needle'larını güncelle.

**Bitti sayılır:** SUPER_ADMIN, üretimde kendi test velisi ve çocuk profiliyle bir ikinci konuyu açıp anlatış ve test akışını uçtan uca görür; herkese açık davranış değişmemiştir.

### Aşama 2 — Ödeme ve hukuk (paralel; 2-4 hafta, hukuka bağlı)

1. **Hukuk (kod dışı):** veli doğrulaması, KVKK aydınlatma ve açık rıza (çocuk verisi, çocuk sesinin dış modele gönderilmesi dahil), mesafeli satış sözleşmesi ve ön bilgilendirme, iade/cayma, veri saklama ve silme süreleri. Hukuk danışmanı onayı yazılı kayda geçer.
2. **PayTR:** canlı mağaza üçlüsü, fatura akışı. TCKN/telefon/adres için saklama yerine sağlayıcı tarafı ya da şifreleme kararı.
3. **Köprü:** `junior-license:` niyeti → webhook → `junior_subscriptions` (idempotent) → yıl bitiminde süre. Deneme/Direct kodunu sil.
4. **Uçtan uca test:** PayTR sandbox (kernel kipiyle), webhook tekrar teslimi, çift tıklama, başarısız ödeme.
5. Kilit indirilir **ancak** hukuk onayı + canlı üçlü + uçtan uca test yeşil iken.

**Bitti sayılır:** Gerçek bir veli (iç test) paketi alır, paket aktif olur, makbuz gelir, defterde tek kayıt vardır.

### Aşama 3 — 6. sınıfı tamamlama (sürekli; en uzun iş)

1. **Kazanım envanteri:** MEB 6. sınıf programından her ders için konu listesi çıkar (sayı bu çalışmanın çıktısıdır). Sosyal Bilgiler ve Din Kültürü kararına göre eklenir.
2. **Dikey dilim önce:** tek dersi (öneri: Matematik "Kesirler") baştan sona bitir: tüm konular + her konuya 10+ soruluk arşiv + çizim sahnesi. Satış sözü bu dilimle test edilir. Sonra Fen, Türkçe, İngilizce.
3. **İçerik hattı:** tek bölümlü senaryo biçimi (4.1/7), otomatik denetim (uzunluk, dil, kazanım eşleşmesi, yasak ifade), yazar kontrol listesi. Okul kitabı metni kopyalanmaz (Ek-J).
4. **Soru arşivi:** 10+ soru/konu, kazanım kodu, ağırlık, kalıp yılı; yeni konuya arşiv şartı koyan test ("arşivsiz konu 'hazır' sayılmaz").
5. **Ses:** kararı 0.5'e göre. Tarayıcı sesi kalıyorsa desteklenen tarayıcı listesi ve yedek metin yolu.
6. **Seçmeli dersler:** soru arşivi yazılmadan paket vaadinde yer almaz.
7. **İçerik depo kararı:** konu sayısı ~60'ı geçtiğinde veya yazarlar mühendis olmadığında dosyadan tabloya geçiş (migration + yönetim ekranı) yeniden değerlendirilir.

**Bitti sayılır (her ders için):** konu zinciri tam; her konuda test; kazanım eşleşme tablosu; ebeveyn haftalık raporu gerçek veriyle çalışıyor.

### Aşama 4 — Ölçek

1. **Gözlemlenebilirlik:** Junior için günlük aktif çocuk, anlatış başına maliyet, hata oranı, bütçe kalkanı alarmı.
2. **Maliyet sınırı:** çocuk başına ve veli başına günlük AI limitleri bütçe kalkanına bağlı doğrulansın.
3. **v1 hop'ları (native gerekince):** salt-okuma `junior-shelves`, `junior-lesson`; yazma `junior-tell`, `junior-profile` (Bearer + Idempotency-Key). `@yetkin/kernel` içine Junior kimlik/DTO paketi (Prisma'sız).
4. **Yetki kararını genelleştir:** `resolveAcademyEntitlement` ile Junior kararı ortak bir `Entitlement` arayüzünün iki gerçeklemesi olsun; fiyat, ödeme köprüsü ve fatura ortak.
5. **Sınıf genişlemesi (7, 8):** önce 6. sınıfın içerik hattı kanıtlansın; sonra sınıf başına ayrı içerik paketi, sınıf seçici ancak içerik hazır olunca açılır.
6. **Playwright duman testleri:** Junior ziyaretçi, veli, süper yönetici akışları nightly.
7. **Temizlik turu:** 2. bölümdeki yetim/ölü dosyalar; `tests/_archived-junior`, `phase2-drafts` taşıma; `media-bake/` yedeği.

### Yapılmaması gerekenler

- Model haritasına ve `ACADEMY_SEALED_MEDIA_MODEL`'e dokunmak.
- Yetişkin beş katman kuralını Junior'a kopyalamak.
- Ayrı sunucu, ayrı veritabanı, ayrı kimlik açmak.
- İçeriği acele tabloya taşımak (önce dosya bölme ve tek senaryo).
- Para kilidini hukuk onayı olmadan kaldırmak.
- Oyun puanını para birimine bağlamak.
- Eski adı ("Amiral Gemi + Sürü Dron") yeniden planın başlığı yapmak.

---

## 5. Riskler ve açık sorular

| Risk | Olasılık | Not |
|---|---|---|
| Hukuki onay gecikmesi Aşama 2'yi uzatır | Yüksek | Kod hazır, kilit kapalı bekler. |
| Çocuk sesinin dış modele gitmesi aydınlatmada eksik kalırsa | Orta | Hukuk. |
| Tek yönetici kutusu kaybı | Düşük-Yüksek etki | Karar 0.4. |
| İçerik hacmi (yüzlerce konu) yazar kapasitesini aşar | Yüksek | Dikey dilim ve içerik hattı. |
| Canlıda gerçek oturumla denenmeyen yollar | Orta | Bu rapor canlıda yalnız anonim istek yaptı. |

**Açık sorular (SUPER_ADMIN'e):** Aşama 0'daki altı karar. Ayrıca: canlı veritabanında `price_catalog_entries` içinde `junior/yearly` satırı gerçekten var mı ve `updated_by` dolu mu? Vercel'de `DRON_JUNIOR_OPEN` tanımlı mı? Bu iki bilgi bu oturumda okunamadı.

---

## 6. Ek: bu raporda çalıştırılan komutlar

- `npx vitest run` (10 Junior/kenar test dosyası) → 51 geçti.
- `npx tsx scripts/verify-junior-pilot-seals.ts` → OK.
- `npx tsx scripts/verify-boundaries.ts` → OK.
- `npx tsc --noEmit -p tsconfig.json` → hatasız.
- Canlı: `https://yetkin.ai/` altında yaklaşık 20 anonim GET (durum kodu) ve 5 sayfa gövdesi (`/junior`, `/junior/checkout`, `/junior/ders/jr_06_mat-2`, `/academy`, `/api/v1/health`).
- Atıl dosya taraması: geçici bir Node betiği (depoya eklenmedi).

Kod, belge ve veritabanında hiçbir değişiklik yapılmadı. Yalnız bu dosya yazıldı.
