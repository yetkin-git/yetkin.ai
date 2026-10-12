# Tespit Raporu: Yetkin Junior 6. Sınıf (Faz 1)

| Alan | Değer |
|---|---|
| Tarih | 9 Ekim 2026 |
| Kapsam | Junior modülü (özellikle 6. sınıf), SUPER_ADMIN yetki modeli, ölü ve mükerrer dosyalar, Anayasa / Manifesto / Pedagoji / `.cursorrules` hizası |
| Mod | Salt-okunur tespit. Repo'da ve veritabanında hiçbir kod, şema, veri, yazma veya silme işlemi yapılmadı. Yazılan tek dosya bu rapor |
| Ölçüm betikleri | Repo dışında: `%TEMP%\yetkin-junior-audit\` (`inventory.mts`, `padding-core.mts`, `hash-check.mts`) |
| Sürüm notu | Bu sürümdeki her sayı ölçüldü ya da kaynak satırıyla doğrulandı. Doğrulanamayan ayrıntılar çıkarıldı veya `[DOĞRULANMADI]` ile işaretlendi (bkz. §9.2) |

**Kanıt etiketleri:** `[KOD]` dosya okuma ve arama ile doğrulandı. `[ÖLÇÜM]` salt-okunur betik veya komut çıktısı. `[DOĞRULANMADI]` canlı sistem, CDN, üretim ortam değişkeni veya uzman incelemesi gerektiriyor; bu turda yapılmadı.

---

## 0. Yönetici özeti

Junior 6. sınıf kod kapılarında temiz görünüyor: 105 çekirdek ders (5 kurs) mühür kapılarının tamamını geçiyor. Ama bu sonuç üç nedenle güvenilir değil:

1. **Quiz kapısı şekle bakıyor, cevap anahtarı yanlı.** 315 sorunun 304'ünde doğru cevap A. 105 konunun 96'sında "hep A" stratejisi tam puan alıyor.
2. **Süre bandı dolguyla tutturuluyor.** Yazılı anlatış ortalama 4,26 dakika. Sistem 7,5 dakika hedefine kadar ortalama 38 dolgu satırı ekliyor; anlatış karakterlerinin %43,2'si dolgu.
3. **Ses kapısı canlıda fail-open.** Ses klasörü bu süreçte yoksa kapı, anahtar listesindeki her ses için "mühürlü" diyor. Kodun kendi yorumu bunu "yokluk uydurulmaz" diye kabul ediyor. CDN'deki dosyaları hiçbir mekanizma doğrulamıyor.

Güvenlik ve veri tarafında üç P0 bulgu var:

- **T-01:** Herkese açık `/api/junior/lessons/[key]` yanıtı, erişim kararından bağımsız olarak 100 kilitli çekirdek dersin ses yolunu döndürüyor.
- **T-02:** Hesap kapatma Junior paketini kontrol etmiyor; Junior'a ait iade ve saklama süresi kodu yok.
- **T-03:** Üretimde `SUPER_ADMIN_USER_ID` boşsa, kaynakta yazılı yerleşik e-posta tek başına süper admin yetkisi veriyor; ek faktör yok.

**Ürün açısından en önemli yeni bulgu (T-06):** Aktif yıllık pakette seçilebilen 5 seçmeli kurs (10 ders) erişime açılıyor. Bu derslerin hiçbiri mühür kapısını geçemiyor: ses, ısınma ve quiz yok; anlatış 2,65–3,03 dakika. Kasa kodda varsayılan olarak kapalı; yeni satın alma henüz açılmıyor. Mevcut aboneler ve seçmeli seçimleri `[DOĞRULANMADI]`. Kasa açılmadan önce çözülmeli.

Mimari tarafında Shared Kernel (`packages/kernel`), RLS ve Junior–kernel sınırı gerçek. Çift imza, API-first Junior hedefi ve belge disiplini büyük ölçüde kâğıt üstünde.

### Bulgular (önem sırasıyla)

| ID | Önem | Bulgu | Ana kanıt |
|---|---|---|---|
| T-01 | P0 | Kilitli 100 çekirdek dersin ses yolu herkese açık API'de dönüyor | `app/api/junior/lessons/[key]/route.ts:40` |
| T-02 | P0 | Hesap kapatma Junior paketini kontrol etmiyor; Junior'da iade ve saklama süresi kodu yok | `lib/kernel/identity/close-account.ts:25-84`; `close-account-gate.ts:16` |
| T-03 | P0 | Üretimde `SUPER_ADMIN_USER_ID` boşsa yerleşik e-posta tek başına süper admin; ek faktör yok | `lib/kernel/auth/super-admin.ts:10`, `:89-101` |
| T-04 | P1 | Ses kapısı ses klasörü yokken "mühürlü" sayıyor; CDN dosyaları hiçbir mekanizmayla doğrulanmıyor | `lib/junior/production-seal.ts:37-52`; `production-seal-disk.ts:1-7` |
| T-05 | P1 | Quiz cevap anahtarı yanlı: A = 304/315; 96/105 konu "hep A" ile tam puan; kapı yalnız şekle bakıyor | `[ÖLÇÜM]`; `production-seal.ts:19-35` |
| T-06 | P1 | Aktif pakette seçilen 5 seçmeli kurs (10 ders) açılıyor; 4 mühür kapısı kapalı | `lib/junior/catalog.ts:180-196`; `limits.ts:17-30`; `service.ts:371-390` |
| T-07 | P1 | Süre bandı dolguyla tutturuluyor: yazılı anlatış 4,26 dk; 101/105 ders bandın altında | `[ÖLÇÜM]`; `lib/junior/scenario.ts:206-256` |
| T-08 | P1 | Çocuğun sesli anlatışı ve doğum yılı üçüncü taraf AI sağlayıcısına gidiyor; aydınlatmada sağlayıcı adı ve yurt dışı aktarım yok | `service.ts` (`submitJuniorTell`); `lib/copy/junior-guardian-notice.ts:20` |
| T-09 | P1 | "Çift imza" kodda yok; yönetici kurs yayını tek çağrıda fiyat satırının `is_active` değerini de değiştiriyor | `.system_docs/MANIFESTO.md:61`; `ANAYASA.md:129`; `lib/kernel/admin/course-publish.ts:113, 179` |
| T-10 | P2 | Freelancer kapalılığı birden çok kaynakta; staff önizleme yolu yok | `lib/kernel/compliance/circuit-breakers.ts:39, 148-158`; `lib/dronlar/kayit.ts:111-112` |
| T-11 | P2 | Fiyat tohumu `is_active`, sınır ve açıklamayı koşulsuz yazıyor; tekrar koşarsa kapatılmış satış açılır | `supabase/migrations/20261005160000_junior_yearly_price_seed.sql` |
| T-12 | P2 | Seçmeli kotası altı yerde sabit; DB kolonu yalnız gösterim için okunuyor | `lib/junior/plan.ts:62`; `service.ts:147`; iki migrasyon CHECK'i; şema varsayılanı |
| T-13 | P2 | Shelf hesabı önbelleksiz; çağrı başına ~64 ms | `[ÖLÇÜM]`; `lib/junior/catalog.ts:231-258` |
| T-14 | P2 | API-first eksik: v1'de tek Junior hop (kart); native istemci ders oynatamıyor; 7 `junior-pilot` rotası v1 dışında | `apps/rail-is/src/api/hops.ts:63-65`; `lib/kernel/http/v1-contract.ts:1108` |
| T-15 | P1 | Seçmeli dersler için mühür kuralları tasarımla çelişiyor: taslak bant dolgu istemiyor ama kapı 5 dk istiyor; seçmelide kaset tanımlı değil ama kapı ısınma istiyor | `lib/junior/warmup.ts:6, 9-14`; `scenario.ts:59, 231`; `production-seal.ts:58-82` |
| T-16 | P2 | 41 yetim betik; 5 Junior quiz üreticisi, en az biri canlı quiz dosyalarını yazıyor | `[ÖLÇÜM]`; `scripts/generate-junior-mat-quiz-archive.ts:1218` |
| T-17 | P2 | İki ayrı migrasyon hattı: `prisma/migrations` (43 dizin) ve `supabase/migrations` (16 SQL) | `[ÖLÇÜM]` |
| T-18 | P2 | Mükerrer raporlar: `docs/` içinde 19 dosya, 6'sı Junior 6. sınıf adını taşıyor; yönetişim kuralı birden çok belgede tekrarlanıyor | `[ÖLÇÜM]` |
| T-19 | P3 | Kodda ünite katmanı ve MEB kazanım kodu yok; `jr_06_ing` (seçmeli) ile `jr_06_ing_main` (çekirdek) slug'ları benzer | `lib/junior/limits.ts:17-30`; `[ÖLÇÜM]` |
| T-20 | P3 | Şişkin dosyalar, çalışma ağacı gürültüsü, kodda eski terminoloji (1 yorum, 1 test) | `[ÖLÇÜM]`; `lib/academy/lesson-beat-visual.ts:495` |

### Doğru çalışan şeyler

- **P+1 Shared Kernel gerçek.** `packages/kernel/src` 17 TypeScript dosyası içeriyor; `lib/kernel` tarafındaki karşılıklar `@yetkin/kernel`'e yönlenen ince köprüler. Paketi 28 dosya tüketiyor. `lib/kernel` ürün modüllerini (`junior`, `academy`, `freelancer`, `career`) import etmiyor. Tek bağ, oda kayıt defteri `lib/dronlar/kayit` (4 kernel dosyasında; kasıtlı) (`[KOD]`).
- **P+2 RLS fail-closed.** `supabase/migrations/20260814020000_enforce_rls_all_tables.sql`: tüm `public` tablolar ENABLE + FORCE RLS; yeni tablolar event trigger ile kapsanıyor. `20260814030000_rls_user_scoped_policies.sql`: sahiplik kolonlarına (`user_id`, `guardian_user_id` vb., satır 45–51) SELECT politikası; diğer her şeye `rls_deny_unscoped` (`USING (false)`).
- **P+3 Quiz cevapları istemciye sızmıyor.** `lib/junior/topic-quiz.ts:15-21` yalnız `id, kind, prompt, choices` döndürüyor; puanlama sunucuda. Pratik öğeleri aynı şekilde temiz (`lib/junior/practice.ts:53-63`).
- **P+4 Aydınlatma mühürü doğru.** `lib/junior/guardian-notice.ts:17` içindeki SHA-256 değeri, `juniorGuardianNoticeCanonical()` gövdesinden (`lib/copy/junior-guardian-notice.ts:28`) yeniden hesaplandı: **eşleşiyor** (`MATCH: true`). Değer `b5c875b2b40e5b0e1204771b3551cc4ba43d4931a8468d294a343f71e32d88c9`, kanonik gövde 1780 karakter, sürüm `junior-notice-2026-10-09` (`[ÖLÇÜM]` `hash-check.mts`).
- **P+5 Çocuk profili kapatma eksiksiz.** `lib/junior/load.ts` `eraseChildData` (satır 282 ff.): ilerleme ve XP siliniyor; takma ad kapatma sabitine çekiliyor; doğum yılı, aktif onay ve seçili seçmeliler boşaltılıyor; onay satırları profilden ayrılıp `erased_at` ile kanıt olarak tutuluyor. Bu, aydınlatma metnindeki "Profil kapatılınca takma ad Kapalı olur ve doğum yılı boşalır" cümlesiyle uyumlu.
- **P+6 Kasa varsayılan kapalı.** `lib/kernel/security/junior-gate.ts:60` (`isJuniorCheckoutLocked`): açık değer verilmedikçe kapalı. Fiyat DB'den okunuyor (`lib/junior/price.ts`, yalnız aktif satır); tutar tamsayı kuruş (`list_price_minor`).
- **P+7 Seçmeli sayısı sunucuda zorlanıyor.** `lib/junior/plan.ts:62` (`max(JUNIOR_ELECTIVE_QUOTA)`) ve normalize fonksiyonu fazla seçimi reddediyor.
- **P+8 Dinle-Anlat veri disiplini.** Ses, `submitJuniorTell` içinde `finally` bloğunda bellekten temizleniyor; günlük 8 anlatış sınırı var (`JUNIOR_TELLS_PER_DAY`); yapay zekâ kullanımı faturalama kaydına bağlanıyor (`AI_TOKEN_SOURCES.JUNIOR`).
- **P+9 Kapalı yüzeyler dürüst.** `app/api/(kernel)/admin/curriculum-revisions/route.ts` kapalı yüzey olarak tanımlı (410); dondurulmuş odalar edge'de 410 (`lib/kernel/security/edge-api-auth.ts:59`).
- **P+10 Junior kodunda ölü modül yok.** `lib/junior` üst düzey 45 modülünün tamamı en az bir importer'a sahip (`[ÖLÇÜM]`, önceki tur).
- **P+11 Denetim yolu ayrı ve sade.** `lib/kernel/security/junior-gate.ts:75`: denetim aktörü süper admin veya doğrulanmış `JUNIOR_BETA_ALLOWLIST` e-postası; test hesabı dışlanıyor; yorum "Nakit satırı yazmaz" diyor.

---

## 1. Kapsam, yöntem ve sınırlar

- **Salt-okunur.** Repo'da hiçbir dosya değiştirilmedi. Ölçüm betikleri repo dışındaki `%TEMP%\yetkin-junior-audit\` klasöründe.
- **`.cursorrules` dışlamaları uygulandı.** `archived/` içeriği okunmadı; yalnız üst düzey klasör adları yapı kontrolü için bakıldı. `public/media/` ve `node_modules/` okunmadı. Bu nedenle `archived/` ve `public/media/` ile ilgili iddialar `[DOĞRULANMADI]` olarak kaldı. Repo'daki `scripts/` dosyalarından `archived/` yoluna yapılan referanslar ise metin taramasıyla görüldü.
- **Bu turda yapılanlar:** 25'ten fazla kaynak dosya okuması ve grep taraması; repo içindeki betik, belge ve migrasyon sayımları; 2 salt-okunur ölçüm (`hash-check.mts`, yetim betik taraması).
- **Sınır:** Pedagojik doğruluk, MEB öğretim programı uyumu ve hukuki yorum bu raporun kapsamında değil; uzman gerektirir.

---

## 2. ADIM 1: Veritabanı şeması ve Junior 6. sınıf içerik envanteri

### 2.1 Junior tabloları `[KOD]`

Kaynak: `prisma/schema/junior.prisma` (model başlangıç satırları yaklaşık 5, 34, 56, 79, 102).

| Model | Tablo | Sahiplik | İçerik ve kısıtlar |
|---|---|---|---|
| `JuniorProfile` | `junior_profiles` | `user_id` (veli); `user` ilişkisi `Cascade` | Takma ad, sınıf (`grade`), doğum yılı (kapanışta boşalır), `active_consent_id`, `selected_electives`, `grade_switch_rights`. Ses kolonu yok (model yorumu) |
| `JuniorGuardianConsent` | `junior_guardian_consents` | `guardian_user_id`; veli FK'si `Restrict` | Her onay yeni satır: `consent_version`, `notice_sha256` (`CHAR(64)`). Çocuk silinince `profile_id` boşalır (`SetNull`), `erased_at` dolar. Model yorumu: "kanıt satırı durur" |
| `JuniorProgress` | `junior_progress` | `user_id` + `profile_id`; ikisi de `Cascade` | Ders anahtarı, `mode` (yorumda `speak \| write \| practice \| quiz`), `praised`/`missing`/`advice` metinleri, `score`, `xp_awarded` |
| `JuniorXp` | `junior_xp` | `user_id` + `profile_id` (tekil); `Cascade` | `points`, `badges_json`. Model yorumu: "Nakit satırına bağlanmaz. Paraya çevrilmez." |
| `JuniorSubscription` | `junior_subscriptions` | `user_id` (tekil); `Cascade` | `status` (PENDING/ACTIVE), `plan_code`, `list_price_minor`, `provider`, `provider_ref`, `applied_merchant_oids` (aynı sipariş süreyi yeniden uzatmaz), fatura alanları (`invoice_tckn`, `invoice_phone`, `invoice_address`: düz metin değil, `jinv1:` mührü), `elective_quota` (varsayılan 3), `grade_switch_rights` |

**Veritabanı kısıtları (migrasyonlar) `[KOD]`:**

- `junior_profiles_elective_quota` CHECK (`prisma/migrations/20261005040000_junior_plan_quota`): seçili seçmeli en çok 3, tekil, 6 seçmeli slug'ından biri.
- `junior_subscriptions_shape` CHECK (`prisma/migrations/20261006010000_junior_invoice_seal`): `plan_code = 'junior-yearly'`, `provider = 'paytr'`, `elective_quota = 3`, `grade_switch_rights IN (0, 1)`, fatura alanları yalnız `jinv1:` mühürlü olabilir.

### 2.2 RLS, saklama ve silme `[KOD]`

- Genel döngü: tüm `public` tablolar ENABLE + FORCE RLS; yeni tablolar event trigger ile kapsanıyor (`20260814020000_enforce_rls_all_tables.sql`).
- Sahiplik politikası listesi (`20260814030000_rls_user_scoped_policies.sql`, satır 45–51): `user_id`, `awarded_user_id`, `seller_user_id`, `guardian_user_id`. Beş Junior tablosunun her birinde bu kolonlardan biri var; politika üretimi bu tablolara uygulanabilir. Politikaların canlı veritabanında (`pg_policies`) fiilen uygulanıp uygulanmadığı `[DOĞRULANMADI]`.
- `rls_deny_unscoped` (aynı migrasyon, satır ~159): anon ve authenticated için `USING (false)`.
- **Saklama ve silme:** `lib/junior` içinde `retention|purge|saklama|iade|cayma|refund` taraması boş (`[ÖLÇÜM]`). Junior'a ait otomatik saklama süresi, temizleme işi veya iade akışı yok.

### 2.3 İçerik envanteri `[ÖLÇÜM]` (`inventory.mts`, bu tur)

Katalog 117 ders kaydı döndürüyor: **105 çekirdek + 12 seçmeli**.

**Çekirdek kurslar (5 kurs, 105 ders):**

| Kurs | Ders | Mühürlü | Anlatış dk (ort / min / maks, dolgulu) |
|---|---|---|---|
| `jr_06_mat` | 25 | 25 | 7,55 / 7,51 / 7,58 |
| `jr_06_fen` | 20 | 20 | 7,55 / 7,50 / 7,61 |
| `jr_06_turkce` | 20 | 20 | 7,54 / 7,50 / 7,60 |
| `jr_06_ing_main` | 20 | 20 | 7,54 / 7,50 / 7,60 |
| `jr_06_sosyal` | 20 | 20 | 7,55 / 7,50 / 7,60 |
| **Toplam** | **105** | **105** | |

Isınma kasetleri beş dosyadır (`lib/junior/warmup.ts:9-14`): `/media/junior/warmup/jr_06_{mat,fen,turkce,sosyal,ing_main}-warmup.mp4`. Kaset yaklaşık 10 saniyedir (`JUNIOR_WARMUP_MAX_SEC = 10`, satır 20). Dosyaların varlığı `[DOĞRULANMADI]` (`public/media` kapsam dışı).

**Seçmeli kurslar (6 kurs, 12 ders):**

| Kurs | Ders | Mühürlü | Anlatış dk (ort, aralık) | Paket seçimi |
|---|---|---|---|---|
| `jr_06_ing` | 2 | 0 | 3,00 (2,98–3,03) | Fiyat dışı (`JUNIOR_ELECTIVE_PRICE_EXCLUDED`); seçilemez |
| `jr_06_alm` | 2 | 0 | 2,67 (2,65–2,68) | Seçilebilir |
| `jr_06_fra` | 2 | 0 | 2,65 (2,64–2,66) | Seçilebilir |
| `jr_06_siyer` | 2 | 0 | 2,88 (2,79–2,98) | Seçilebilir |
| `jr_06_kod` | 2 | 0 | 2,91 (2,90–2,92) | Seçilebilir |
| `jr_06_arp` | 2 | 0 | 2,75 (2,65–2,85) | Seçilebilir |

**Kapı sayımı (12 seçmeli ders):** metin 12 (süre alt sınırı), ses 12, ısınma 12, quiz 12; sahne 0 eksik. Çekirdekte tüm kapılar geçiyor.

**Ücretsiz açılışlar:** 11 (5 çekirdek + 6 seçmeli). Ücretsiz açılışın anlatış metni erişim kararına göre döner (`service.ts:371-390`).

**Eksik olan metin değil, süre:** Seçmeli derslerin metni yazılmış, ama 2,65–3,03 dakika sürüyor. Mühür kapısı alt sınırını 5 dakika (`JUNIOR_NARRATION_MIN_MS = 300_000`) olarak tanımlıyor. Taslak bant (`band: "draft"`) bu dersleri dolgu ile uzatmayı yasaklıyor (`scenario.ts:59, 231`). Dolayısıyla bu derslerin tamamlanması gerçek yeni anlatış içeriği gerektiriyor.

### 2.4 Tamlık sınıflandırması

| Sınıf | Kapsam | Durum | Çekince |
|---|---|---|---|
| **Kod kapılarından geçiyor** | 105 çekirdek ders | 105/105 mühür kapısı boş | (a) Ses varlığı canlıda doğrulanmıyor (T-04); (b) quiz cevapları yanlı (T-05); (c) süre dolguyla tutturuluyor (T-07) |
| **Taslak, kapı geçmiyor** | 12 seçmeli ders | 12/12 dört kapıda açık | Ücretli pakette seçilebiliyor (T-06); kaset tanımlı değil (T-15) |
| **Eksik** | Ünite katmanı; MEB kazanım kodları | Kodda ünite alanı yok; `M.6.x` biçiminde kazanım kodu yok | Öğretim programına göre tamlık bu turda ölçülmedi (T-19) |
| **Riskli** | Quiz anahtarı; süre dolgusu; slug benzerliği | Bkz. 2.5–2.6 | `jr_06_ing` (seçmeli) ile `jr_06_ing_main` (çekirdek) benzer slug'lar |

### 2.5 Quiz cevap anahtarı (T-05) `[ÖLÇÜM]` `[KOD]`

**Çekirdek quiz (105 konu × 3 soru = 315 soru, her soru 4 şık):**

| Doğru cevap | Adet | Oran |
|---|---|---|
| A (indeks 0) | 304 | %96,5 |
| B (indeks 1) | 8 | %2,5 |
| C (indeks 2) | 3 | %1,0 |
| D (indeks 3) | 0 | %0 |

**Konu bazında:** 96/105 konunun üç sorusunun da doğru cevabı A. Kalan 9 konuda en az bir A-dışı cevap var.

**Geçme kuralı:** Quiz barajı %70, soru sayısı en az 3 (`lib/junior/limits.ts`: `JUNIOR_QUIZ_PASS_SCORE = 70`, `JUNIOR_QUIZ_MIN_ITEMS = 3`). Üç soruda %70'e ulaşmak için üçünün de doğru olması gerekir; 2/3 = %66,7 geçmez. Sonuç:

- "Hep A" stratejisi 96 konuda tam puan alır ve geçer.
- Aynı strateji 9 konuda geçmez (en az bir yanlış). Ama bir çocuk "A her zaman doğrudur" kuralını öğrenirse, quiz'in ölçtüğü şey değişir.

**Kapı ne kontrol ediyor:** `quizVerified` (`lib/junior/production-seal.ts:19-35`) yalnız şekle bakıyor: soru ve açıklama dolu mu, en az 2 şık var mı, doğru indeks aralıkta mı. Cevap dağılımına bakmıyor.

**Ne iyi:** Doğru cevap indeksi istemciye gitmiyor (P+3).

### 2.6 Süre dolgusu (T-07) `[ÖLÇÜM]` `[KOD]`

Ölçüm: `padding-core.mts`, yalnız dolgu içeren 105 çekirdek ders.

| Ölçüt | Değer |
|---|---|
| Dolgulu anlatış (toplam) | ort 7,54 dk; min 7,50; maks 7,61 |
| **Yazılı taban (dolgusuz)** | **ort 4,26 dk; min 3,12; maks 5,15** |
| Taban 5 dk bandının altında | **101 / 105** |
| Dolgu satırı / ders | ort 38,3 (min 28, maks 52) |
| Dolgu karakter payı | ort %43,2 |
| Dolgu havuzu | `JUNIOR_FORWARD_COACH`: 55 şablon satırı (`scenario.ts:110-166`) |
| Her derste aynen geçen beş cümle | 105/105 |
| Farklı dolgu paragrafı sayısı | 478 (başlık şablonları nedeniyle) |

**Mekanizma:** `juniorLessonFromScenario` (`scenario.ts:206-256`) havuz satırlarını (`scenario.ts:231`), anlatış 7,5 dakika hedefine (`JUNIOR_NARRATION_AIM_MS`) ulaşana kadar ekliyor (döngü satır 235); üst sınır 12 dakika (satır 242, 248–256).

**Yorum:** Kapı süreyi ölçüyor, ama süreyi üreten metnin özgünlüğünü ölçmüyor. Yazılı tabanın ortalama 4 dakika civarında olması, çekirdek derslerin gerçek içerik yoğunluğunun beklenenin altında kaldığını gösteriyor.

### 2.7 Ses kapısı ve CDN (T-04) `[KOD]`

- `lib/junior/production-seal.ts:37-40` kodun kendi yorumu: "Anahtar listede olsa bile klasör durup MP3 yoksa veya boşsa ses kapısı düşer. Klasör bu süreçte yoksa (CDN’e taşınmış paket) liste tek başına durur; yokluk uydurulmaz."
- `lib/junior/production-seal.ts:41-52` (`juniorBakedAudioSealed`): anahtar listedeyse ve `read.treePresent()` false ise fonksiyon `true` döner (satır 48–49). Yani klasör yokken kapı, listedeki her ses için "mühürlü" der.
- `lib/junior/production-seal-disk.ts:1-7` kendi yorumu: "`public/media/junior/audio` Vercel paketine girmez; canlı okuma CDN’dedir." ve "Klasör makinede yoksa (dağıtım veya boş klon) tek tek dosya yokluğu kanıtlanamaz."
- Anahtar listesi: `lib/junior/voice.ts:112` (`JUNIOR_BAKED_AUDIO_KEYS`, elle yazılmış 105 anahtar).
- `.vercelignore` Junior ses, kapak ve ısınma klasörlerini CLI yüklemesinden çıkarıyor.
- **Build zinciri `[KOD]`:** `package.json:11` `build` komutu `verify:prebuild` (satır 87; 9 adımdan oluşur) ve `generate:production-seal-manifest` (satır 19, `scripts/write-production-seal-manifest.ts`) çalıştırıyor. Manifest betiğinde `junior`, `audio`, `mp3` ve `warmup` kalıbı yok: Junior ses dosyaları üretim manifestinde değil. `verify:junior-pilot-seals` (satır 74) ayrı bir komut, build'de çağrılmıyor. `scripts/verify-junior-pilot-seals.ts` yalnız `node:fs` kullanıyor; CDN veya HEAD kontrolü yok.
- **Belge tasarımı:** `.system_docs/PEDAGOJI.md:311`: "Ses anahtarı listede durup ses klasörü makinede varken MP3 yoksa veya boşsa konu taze sayılmaz. Klasör dağıtımda yoksa (CDN) yokluk uydurulmaz." Bu bilinçli bir tasarım. Sorun, bu tasarımın sonucunda ses kapısının üretimde hiçbir dosyayı doğrulamaması.

**Sonuç:** Mühür "ses hazır" diyorsa, bu yalnızca "anahtar listede" anlamına geliyor. Dosyanın CDN'de var olduğu hiçbir yerde doğrulanmıyor.

### 2.8 Ücretli ders sesi sızıntısı (T-01, P0) `[KOD]`

- `app/api/junior/lessons/[key]/route.ts` satır 11: `auth = "public"`.
- Yanıt kartı (`card`): `lessonKey`, `title`, `subject`, `access`, `scene`, `audioPath: juniorLessonAudioSrc(lesson.key)` (satır 40), `coverPath`. Kart yorumu: "Kart, kilit kararı, ses yolu ve sahne kimliği. Anlatış metni bu zarfta yoktur." (satır 14–15).
- `audioPath` erişim kararına bakmıyor. Erişim kararı yalnız `access` alanında dönüyor. v1 sözleşmesi de bu uç noktayı `Auth: public` olarak yayınlıyor (`lib/kernel/http/openapi-v1.json:3877-3884`).
- `juniorLessonAudioSrc` (`lib/junior/voice.ts:231`): anahtar listedeyse CDN URL'si döner. Kilitli çekirdek ders sayısı: 105 çekirdekten 5 ücretsiz açılış düşülünce **100**. Seçmelilerin anahtarı listede olmadığı için onlarda `audioPath` boş döner.
- Anlatış metni erişim kararına bağlı (`service.ts`, ücretsiz dal). Ses yolu bağlı değil.
- **Etki:** CDN herkese açık okuma yapıyorsa, ücretli 100 dersin sesi paywall dışına çıkar. Okuma kapalıysa bile dosya adlandırma kuralı (`{anahtar}.mp3`) API'de ifşa olur.
- **Doğrulanmadı:** CDN okuma politikası ve gerçek erişilebilirlik. Staging'de anonim istekle test edilmeli; bu turda canlı sisteme istek atılmadı.

### 2.9 Seçmeli paket ürün riski (T-06, P1) `[KOD]`

**Akış:**

1. Veli, aktif pakette en fazla 3 seçmeli seçer (`lib/junior/plan.ts:62`, `normalizeElectiveSelection`).
2. Seçilebilir liste `juniorElectivePicks()` (`lib/junior/catalog.ts:220-229`) `jr_06_ing` hariç 5 seçmeliyi döndürür.
3. Aktif planda seçilen seçmelinin dersleri `free` olur (`lib/junior/catalog.ts:180-196`, `juniorLessonAccessForPlan`). Yani ödemeyle açılan ders, mühür kapılarının dördü açıkken açılır.
4. Açılan dersin yanıtı `preparing: true` döner (`service.ts:371`), ama `script: lesson.listenText` metnini de döner (`service.ts:379`).
5. Sayfa "Bu konu henüz tam ders değildir." notunu gösterir (`app/junior/ders/[lessonKey]/page.tsx:105`).
6. Seçmeli için tarayıcı konuşması yedek kalır (`lib/junior/voice.ts:110` yorumu; seçmeli dalı satır 276). Oynatıcı `SpeechSynthesis` kullanır (`components/junior/player/use-junior-playback.ts:258-266`).

**Sorun:** Belge çekirdek 5 dersin kalitesini vaat ediyor: "Çekirdek dersin ilk konusu ücretsizdir ve tam ders kalitesindedir. … Seçmeli hazırlık rafı bu cümlenin dışındadır." (`.system_docs/PEDAGOJI.md:272`). Ama ödeme sonrası paketin içine giren ders, kapıyı geçmemiş taslak. Yanıltıcı ticari uygulama ve ayıplı içerik riski hukuki değerlendirme gerektirir (`[DOĞRULANMADI]`).

**Ne yapılmalı (iki seçenek, karar gerekiyor):**

- **A (hızlı, dürüst):** Seçmeli seçimini ve kotasını kapat veya "Yakında" olarak etiketle; yalnız çekirdek 5 kursu paket vaadinde tut. Kasa açılmadan önce yapılır.
- **B (tamamla):** 10 seçmeli ders için gerçek 5–7 dakikalık anlatış metni, ses, ısınma ve quiz üret; kapı geçince paket kapsamına al.

### 2.10 Dinle-Anlat ve çocuk verisi (T-08, P1) `[KOD]`

- `submitJuniorTell` (`lib/junior/service.ts`, satır 392 ff.): çocuğun sesi (`inlineMedia`) ve **çocuğun doğum yılı** (`birthYear: gate.profile.birthYear`, sistem istemine giriyor) `invoke({ provider: "gemini", role: JUNIOR_TELL_ROLE, ... })` çağrısına gidiyor.
- Erişim: anlatış kaydı paket sahibi veli veya denetim aktörü içindir (`JUNIOR_PAID_ACTION_ERROR`, `lib/junior/limits.ts:49-50`; kontrol `service.ts:662`, 403).
- Kasa kapalıyken yeni paket açılamadığı için bu yol şu an esas olarak denetim ve beta listesi kullanıcılarına açık. Mevcut aktif abonelerin sayısı `[DOĞRULANMADI]`. Kasa açılınca tüm paket sahiplerine açılır.
- Aydınlatma (`lib/copy/junior-guardian-notice.ts:20`): "Çocuğun sesi saklanmaz. Sesli anlatış, yalnız o değerlendirmenin metnini çıkarmak için modele gider. Değerlendirme bitince ses bellekten silinir ve diske yazılmaz." Kod bu iddiayı karşılıyor: ses bellekte tutuluyor ve `finally` bloğunda temizleniyor.
- **Eksik:** Aydınlatma metninde sağlayıcı adı (Gemini veya Google) yok; yurt dışı işleme ve aktarım bildirimi yok; çocuğun doğum yılının modele gittiği bildirilmiyor.
- **Doğrulanmadı:** Sağlayıcının veri işleme şartları, saklama süresi ve platform loglarında ses veya metin bulunup bulunmadığı.
- **Öneri:** Hukuk danışmanı incelemesi; sağlayıcı adı, işleme amacı, yurt dışı aktarım ve gerekiyorsa ayrı açık rıza metni aydınlatmaya eklenmeli. Bu rapor hukuki sonuç vermez.

### 2.11 Fiyat tohumu ve fiyat yazma yolları (T-11, P2) `[KOD]`

`supabase/migrations/20261005160000_junior_yearly_price_seed.sql`:

- Tablo `public.price_catalog_entries`; satır `cat_junior_yearly`; tutar 549.900 kuruş (5.499,00 TRY); `is_active = true`; sınırlar 1 ile 50.000.000 kuruş arası.
- `ON CONFLICT (module_key, unit_key) DO UPDATE`: `amount_minor` ve `updated_at` yalnız `updated_by` boşsa (`IS NULL`) yeni değerle güncelleniyor; dolu ise korunuyor. Ama `is_active = true`, `min_minor`, `max_minor`, `description` ve `currency_code` koşulsuz yazılıyor.
- Sonuç: Yönetici satışı kapatmışsa (`is_active = false`) ve tohum aynı satır üzerinde tekrar koşarsa satış yeniden açılır. Normal migrasyonlar her sürümü bir kez koşar; risk yeniden tohumlama, ortam kurulumu veya elle yeniden uygulama senaryolarına bağlı.
- Dosya başlığı, yönetici tarafından güncellenmiş tutarın ezilmediğini söylüyor; `is_active` ve diğer alanlar için böyle bir koruma yok.
- **Fiyat yazma yolları:** `app/` altında `price_catalog_entries`'e referans veren hiçbir rota yok (`[KOD]`). Ama `lib/kernel/admin/course-publish.ts:113` yorumu, akademi kursu yayınında `course:<slug>` fiyat satırının `is_active` değerinin de aynı yöne çekildiğini söylüyor (satır 179 yazım). Yani tek bir yönetici işlemi, ikinci bir onay olmadan fiyat satırının durumunu değiştiriyor (T-09).
- Fiyat okuma: `lib/junior/price.ts` `findActiveEntry` ile yalnız aktif kaydı okuyor; pasif kayıt `null` döner (`juniorYearlyPriceFromEntry`, satır ~24).

### 2.12 İçerik yükleme ve API-first (T-13, T-14) `[KOD]` `[ÖLÇÜM]`

- **İçerik kodda gömülü:** Ders metinleri ve quiz paketleri TypeScript modülleri (`lib/junior/elective-catalog.ts`, `lib/junior/quiz/{mat,fen,turkce,ing,sosyal}/*.ts`: 105 konu dosyası ve indeksler). Junior içeriği için yönetici arayüzü bu turda görülmedi. Yayın = deploy.
- **Ders gövdesi SSR sayfasında:** `app/junior/ders/[lessonKey]/page.tsx` (`export const dynamic = "force-dynamic"`, satır 22).
- **v1 hop'u yalnız kart döner:** `junior-lesson-read` hop'unun kanonik yolu `/api/junior/lessons/{key}` (`lib/kernel/http/v1-contract.ts:1108-1110`); handler `app/api/junior/lessons/[key]/route.ts`. Yanıtta anlatış metni yok (satır 14–15). OpenAPI kaydı: `Auth: public`, yayınlanan veri kökü `card` (`lib/kernel/http/openapi-v1.json:3877-3884`).
- **Native istemci (T-14):** `apps/rail-is/src/api/hops.ts:63-65` yalnız bu tek junior hop'unu kullanıyor. `lib/kernel/http/v1-contract.ts:1108` tek junior anahtarı. Profil, seçmeli, sınıf, alıştırma, quiz, Dinle-Anlat ve ödeme 7 rotada (`app/api/junior-pilot/{grade,profiles,checkout,practice,tell,electives,quiz}/route.ts`); bunlar v1 sözleşmesinde yok.
- **Sonuç:** Native istemci Junior'da kart listeleyebilir, ama ders oynatamaz ve quiz çözemez.
- **Önbellek yok (T-13):** `juniorCourseShelves` çağrısı ortalama 63,7 ms (200 çağrı, `[ÖLÇÜM]`, geliştirme makinesi). Tüm katalog kapı geçişi 57,8 ms. Önbellek yok (`lib/junior/catalog.ts`).

---

## 3. ADIM 2: SUPER_ADMIN rolü ve yetki modeli

### 3.1 Kimlik ve rol modeli `[KOD]`

- **Kod tabanlı:** Süper admin için veritabanında rol kolonu yok (önceki tur). Tek karar noktası `lib/kernel/auth/super-admin.ts`.
- **Yerleşik kanonik e-posta:** `CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT = "yapinet360@gmail.com"` (satır 10). Test hesabı `CITIZEN_TEST_ACCOUNT_EMAIL = "yetkin.vision@gmail.com"` (satır 16) süper admin olamaz; `isCitizenTestAccountEmail` ve `isSuperAdminActor` içinde kontrol edilir.
- **Üretim kuralı** (`isSuperAdminActor`, satır 111–131): yerleşik olmayan adresler için üretimde `CANONICAL_SUPER_ADMIN_EMAIL` ve `SUPER_ADMIN_USER_ID` ikisi birlikte ayarlı olmalı ve eşleşmeli. Bu doğru.
- **Kurtarma kapısı** (`builtInRecoveryOpen`, satır 89–101): üretimde `SUPER_ADMIN_USER_ID` boşsa, doğrulanmış yerleşik kutu (`yapinet360@gmail.com`) tek başına süper admin olur. Kodda ek faktör (MFA) şartı yok. Kod kendi yorumunda bunu "kurtarma" olarak tanımlıyor. **Bu T-03.** Env doluysa kutu yalnız o UUID ile eşleşince açılır (satır 100).
- **Denetim aktörü** (`lib/kernel/security/junior-gate.ts:75`): süper admin veya doğrulanmış `JUNIOR_BETA_ALLOWLIST` e-postası; allowlist ayrıştırması satır 66'da. Denetim nakit satırı yazmaz (yorum).
- **Rol eksikliği:** Operatör, editör, finans veya salt-okunur denetçi rolleri kodda görülmedi (önceki tur ve bu tur taramasında yalnız süper admin ve denetim aktörü var).

### 3.2 Erişim matrisi `[KOD]`

| Yüzey | Süper admin erişimi | Mekanizma | Durum |
|---|---|---|---|
| `/admin`, `/admin/catalog` sayfaları (`app/(kernel)/admin/`) | Var (hedeflenen) | API rotaları `requireSuperAdmin` kullanıyor; sayfa katmanı yetkisi bu turda okunmadı | Sayfa guard'ı `[DOĞRULANMADI]` |
| `/api/(kernel)/admin/catalog` (PATCH) | Var | `requireSuperAdmin` (`app/api/(kernel)/admin/catalog/route.ts:10`); gövdesi bu turda okunmadı | `[KOD]` (yetki kapısı) |
| `/api/(kernel)/admin/catalog/publish` (PATCH) | Var | `requireSuperAdmin` → `runCoursePublish`; `academy_courses.is_published` yazılır; `course:<slug>` fiyat satırının `is_active` değeri de çekilir (`course-publish.ts:113, 179`) | `[KOD]` |
| `/api/(kernel)/admin/funnel` | Var | `requireSuperAdmin` (`app/api/(kernel)/admin/funnel/route.ts`) | `[KOD]` |
| `/api/(kernel)/admin/curriculum-revisions` | API 410 (kapalı); sayfa kapalı | Dondurulmuş yüzey | `[KOD]` (önceki tur) |
| Junior kilitli ders ve Junior API'leri | Var (denetim) | `canEnterJunior` → denetim aktörü | `[KOD]` |
| Junior kasa | Yok (kasa kapalıysa) | `isJuniorCheckoutLocked` (varsayılan kapalı, `junior-gate.ts:60`) | `[KOD]`; üretim değeri `[DOĞRULANMADI]` |
| Freelancer (dondurulmuş oda) | Yok | `isFreelancerPublicSurfaceLocked` (`circuit-breakers.ts:154-159`); edge 410 | `[KOD]` |
| Akademi | Bypass var | `hasAcademyAdminBypass` (`lib/academy/access.ts:62`) | `[KOD]`; canlı davranış `[DOĞRULANMADI]` |
| Junior fiyat tutarı | Yazan rota yok | `app/` altında `price_catalog_entries` referansı yok; yazım yalnız SQL ve ops | `[KOD]` |

### 3.3 Yetki tıkanıklıkları ve riskler

1. **Kurtarma kapısı (T-03, P0).** Üretimde env boşsa tek e-posta yeter. Düzeltme basit: üretimde `SUPER_ADMIN_USER_ID` zorunlu (boşsa fail-closed) ve kanonik e-posta ile birlikte kontrol.
2. **Hesap kapatma (T-02, P0).** `closeCitizenAccount` (`lib/kernel/identity/close-account.ts:25`) iki kontrol yapıyor: cüzdan bakiyesi sıfır mı (`assertAccountCloseable`) ve açık kart iadesi var mı (`wallet_card_refunds`, PENDING/ACCEPTED). **Junior paketi kontrol edilmiyor.** Sonra `user_billing_info` siliniyor, `users` satırı anonimleştiriliyor (e-posta ve ad), `auth.sessions`, `auth.identities`, `auth.users` siliniyor. Junior tabloları bu işlemde doğrudan dokunulmuyor.
   - **Kaskad:** `public.users` satırı silinmediği için Prisma `Cascade` ilişkileri bu işlemle tetiklenmiyor. Supabase migrasyonlarında `public.users` → `auth.users` yabancı anahtarı veya `auth.users` silme tetikleyicisi bulunamadı (`[KOD]` grep). Dolayısıyla `auth.users` silinmesinin `public.users` ve Junior tablolarına etkisi canlı şemaya bağlı (`[DOĞRULANMADI]`).
   - **Sonuç (her iki senaryoda):** Kapatma Junior paketini kontrol etmiyor, Junior için iade yolu yok. Yetim veri kalırsa çocuk verisi ve aktif paket sahipsiz kalır; kaskad varsa paket iade edilmeden silinir.
3. **Çift imza kodda yok (T-09).** `.system_docs/MANIFESTO.md:61`: "**Faz 1’de yeni oda açılmaz** (CEO + Super Admin çift imza olmadan)." `.system_docs/ANAYASA.md:129`: "İmza Super Admin + CEO." `lib/` taramasında onay, maker-checker veya çift imza kalıbı bulunamadı (`[KOD]`). Fiyat, oda ve kurs yayını kararları tek kişiyle verilebilir; kurs yayını fiyat satırını da değiştiriyor (2.11).
4. **Staff önizleme yok (T-10).** Dondurulmuş bir odayı test etmek için bayrak açmak odayı herkese açmak demek. `lib/kernel/compliance/circuit-breakers.ts:148-153` yorumu: "Açık sayılması için üçünün birden geçmesi gerekir: derleme kilidi kalkmış, `MARKETPLACE_SPLIT_LIVE` açık, dron kaydı kapalı değil. `DRON_FREELANCER_OPEN` tek başına vitrini açmaz." `ANAYASA.md:129` açılış kriterlerinde de `DronBayrakları.isKapali("freelancer") === false` koşulu var; kayıt `lib/dronlar/kayit.ts:111-112` (`kapali: true`).
5. **Kota katmanları (T-12).** Aşağıda 4.3.

### 3.4 Eksik roller ve önerilen minimum model

Kod karşılığı yok; öneri:

| Rol | Yetki | Not |
|---|---|---|
| `SUPER_ADMIN` | Tüm yüzeyler; oda ve fiyat kararları | Tek kişi kalabilir; fiyat ve oda için ikinci onayla |
| `OPERATOR` | Vitrin yayını, içerik yayını (fiyat ve oda hariç) | Günlük işler |
| `FINANCE` | Fiyat ve kasa açma talepleri (ikinci onayla) | Maker-checker |
| `AUDITOR` | Salt-okunur denetim | Yasal inceleme ve KVKK talepleri |

Bugünkü ölçekte tam RBAC gerekmez. En azından fiyat, kurs yayını ve oda bayrakları için "değişiklik talebi + ikinci onay" tablosu gerekli (Faz 3).

---

## 4. ADIM 3: Ölü, geçici, mükerrer ve şişkin dosyalar

### 4.1 Ölü kod

- **`lib/junior`:** Üst düzey 45 modülün tamamı en az bir importer'a sahip (`[ÖLÇÜM]`, önceki tur). Ölü modül yok.
- **`lib/` geneli:** Alias import taramasında 8 aday çıktı. 6'sı `proxy.ts`, `scripts/` veya `packages/` üzerinden referanslı. 2'si doğrulanmadı: `lib/kernel/env.ts` ve `lib/kernel/proof/index.ts`. `lib/kernel/env.ts` env şemasını taşıyor (ör. `JUNIOR_BETA_ALLOWLIST`, satır 39); ölü ilan edilmedi.
- **Arşiv bağımlılığı (T-16):** `scripts/ops-storage-cors-check.ts:19` `@/archived/lib/studio/storage` modülünü import ediyor. Canlı ops betiği arşiv koduna bağlı. `scripts/verify-atomic-seals.ts` ve `scripts/verify-sen-axis.ts` da `archived/` yollarını metin olarak kullanıyor (`[KOD]`).
- **Dondurulmuş yüzey:** `app/(kernel)/admin/curriculum-revisions/` ve API'si 410. Bilinçli arşiv. Kaldırma kararı belgelenmeli.

### 4.2 Yetim betikler `[ÖLÇÜM]`

`scripts/` kökünde 105 kod uzantılı betik var (`ts`, `mts`, `mjs`, `js`, `cjs`, `sh`, `ps1`, `py`). Yöntem: betik adı `package.json` içinde ve `lib`, `app`, `tests`, `scripts`, `components`, `.github` dizinlerinin metin dosyalarında (`ts`, `tsx`, `mts`, `mjs`, `js`, `cjs`, `json`, `yml`, `yaml`, `sh`, `ps1`, `md`) aranır; betiğin kendi dosyası hariç tutulur. Sonuç: **41 yetim**.

| Grup | Adet | Örnek adlar |
|---|---|---|
| Junior quiz üreticileri | 5 | `generate-junior-{fen,ing,mat,sosyal,turkce}-quiz-archive.ts` |
| Akademi medya, mühür, ingest ve senkron | 25 | `bake-*-nano-slides.ts`, `seal-*-player-clock.ts`, `ingest-*.ts`, `write-pilot-academy-seed-sql.ts`, `optimize-academy-course-covers.ts` |
| Ops ve yardımcı kütüphaneler | 10 | `ops-pg-direct-client.ts`, `ops-sync-media-to-storage(-lib).ts`, `room-ceiling-lib.ts`, `rail-v1-ops-json.ts` |
| Diğer | 1 | `generate-brand-icons.ts` |

- **Belge geçişi:** 41 adın 7'si (`generate-brand-icons.ts`, `generate-junior-mat-quiz-archive.ts`, `hard-mix-academy-bed.ts`, `ops-pg-direct-client.ts`, `rail-v1-ops-json.ts`, `room-ceiling-lib.ts`, `write-pilot-academy-seed-sql.ts`) `docs/`, `.system_docs/` veya kök markdown dosyalarında geçiyor; **34'ü hiçbir belgede geçmiyor**.

**Canlı dosyaların üzerine yazma riski:** `scripts/generate-junior-mat-quiz-archive.ts:1218` `writeFileSync` ile `lib/junior/quiz/mat/{1..25}.ts` dosyalarını yazıyor (dosya başlığı: "Bir kerelik üretim"). Betik yeniden koşulursa elle düzeltilmiş quiz içerikleri ezilir. Diğer dört Junior üreticisinin yazma davranışı bu turda okunmadı (`[DOĞRULANMADI]`).

### 4.3 Mükerrerlik ve tek kaynak (SSOT) ihlalleri

| Konu | Kaynaklar | Risk |
|---|---|---|
| **Seçmeli kotası (3)** | `lib/junior/limits.ts` (JS sabiti), `plan.ts:62` (zod), normalize fonksiyonu (`plan.ts`, ~88), `junior_profiles_elective_quota` CHECK (en çok 3), `junior_subscriptions_shape` (`elective_quota = 3`), şema varsayılanı (`electiveQuota @default(3)`) | Altı yerde sabit. Kota değişikliği migrasyon ister. DB kolonu yalnız gösterim için okunuyor (`service.ts:147`) (T-12) |
| **Seçmeli slug listesi (6)** | `limits.ts` JS dizisi; SQL CHECK dizisi (`20261005040000`) | Yeni seçmeli için migrasyon gerekir |
| **Junior ses anahtarları (105)** | `voice.ts:112`, elle yazılmış liste | Yeni ders eklenince sessizce "mühürsüz" kalır (T-04) |
| **Isınma kasetleri (5)** | `warmup.ts:9-14`, kurs slug'larına sabit eşleme | Seçmeli için tanım yok (T-15) |
| **Freelancer kapalılığı** | `circuit-breakers.ts:39` (sabit), `MARKETPLACE_SPLIT_LIVE`, `kayit.ts:111-112` (bayrak) | Env bayrağı tek başına etkisiz; kafa karıştırıcı (T-10) |
| **Model kimliği** | `lib/kernel/ai/model-roles.ts` ↔ `.system_docs/AKADEMI_URETIM_ANAYASASI.md` | Hizası bu turda kontrol edilmedi; yalnız dosyaların varlığı doğrulandı |
| **`lesson-face` çifti** | `lib/junior/lesson-face.ts` ↔ `scripts/sync-junior-lesson-face.ts` | `package.json`'da bu betiğe ait komut yok (önceki tur). Betik elle koşuluyor olabilir |
| **Shared Kernel** | `packages/kernel/src` (17) ↔ `lib/kernel` köprüleri | Gerçek re-export; ihlal değil (P+1) |

### 4.4 Belge ve rapor mükerrerliği (T-18) `[ÖLÇÜM]`

`docs/` içinde 19 Markdown dosyası var. Junior 6. sınıf adını taşıyanlar:

- `JUNIOR_6_SINIF_TESPIT_RAPORU.md`
- `JUNIOR_6_SINIF_TEDAVI_RAPORU.md`
- `JUNIOR_6_SINIF_FIRIN_VE_KASA_RAPORU.md`
- `JUNIOR_6_SINIF_CANLI_SATIS_RAPORU.md`
- `3.junior_6_sinif_tespit_raporu.md`
- `4.junior_6_sinif_tedavi_raporu.md`

Diğerleri: `01_Tespit_Raporu_Grok 4.7.md`, `02_Tedavi_Raporu_Grok 4.7.md`, `1.TESPIT_RAPORU.md`, `2.TEDAVI_RAPORU.md`, tarihli `260930a/b`, `261004a/b`, `261006a/b` dosyaları, `MEDYA_TASIMA_RAPORU.md`, `SEO_ENTAGRASYON_RAPORU.md` ve bu rapor.

**Yönetişim kuralı tekrarı:** "Beş katman / beş medya / beş aşama" kalıbı `.system_docs/ANAYASA.md` (3 satır), `.system_docs/PEDAGOJI.md` (6), `.cursorrules` (4) ve `.system_docs/README.md` (1) içinde toplam 14 satırda geçiyor (`[ÖLÇÜM]` grep sayımı).

**İçerik örtüşmesi bu turda karşılaştırılmadı.** İsimler, aynı konunun birden çok tespit ve tedavi turunda üretildiğini gösteriyor. Öneri: tek kanonik rapor ve bir arşiv klasörü.

### 4.5 İki migrasyon hattı (T-17) `[ÖLÇÜM]`

- `prisma/migrations/`: 43 dizin. Junior tabloları ve kısıtları burada (ör. `20261006010000_junior_invoice_seal`).
- `supabase/migrations/`: 16 SQL dosyası. RLS politikaları ve Junior fiyat tohumu burada (ör. `20261005160000_junior_yearly_price_seed.sql`).
- Hangi hattın hangi ortama, hangi sırayla uygulandığı repo içinde belgelenmiş mi bu turda kontrol edilmedi (`[DOĞRULANMADI]`).
- Öneri: tek hat ya da iki hat için tek uygulama sırası kaydı.

**Elenen yanlış alarm:** `20261005040000` migrasyonu `junior_subscriptions_shape` içinde `provider = 'iyzico-test'` tanımlıyor; ama `20261006010000` bu kısıtı `provider = 'paytr'` ile yeniden kuruyor. Kodda ödeme sağlayıcısı `paytr` (`lib/junior/plan.ts:25`). Uyumsuzluk yok.

### 4.6 Şişkinlik ve gürültü (T-20) `[ÖLÇÜM]`

| Dosya | Boyut | Not |
|---|---|---|
| `lib/academy/cinema-cue-catalog.ts` | 76,5 KB | Veri dosyası; bölünebilir |
| `lib/kernel/http/v1-contract.ts` | 51,6 KB | Sözleşme; üretilebilirlik değerlendirilmeli |
| `lib/copy/sen-voice/academy.ts` | 35,3 KB | Metin kataloğu |
| `lib/academy/lesson-beat-visual.ts` | 34,3 KB | |
| `lib/academy/instructors.ts` | 33,5 KB | |
| `lib/junior/elective-catalog.ts` | 28,3 KB | Seçmeli veri |
| `lib/junior/service.ts` | 25,5 KB | Junior servis; birden çok sorumluluk |
| `lib/kernel/db.ts` | 23,3 KB | |

- `tsconfig.tsbuildinfo` 725 KB (gitignored; çalışma ağacı gürültüsü). `package-lock.json` 479 KB (normal).
- **Yönetişim belgeleri** (`[ÖLÇÜM]`, bayt): `PEDAGOJI.md` 36.144 (188 satır); `ANAYASA.md` 20.928 (107); `AKADEMI_URETIM_ANAYASASI.md` 10.616 (82); `.cursorrules` 8.694 (118); `MANIFESTO.md` 9.023 (85); `OPS_RUNBOOK.md` 7.381 (`.system_docs`); kök `README.md` 1.992; `AGENTS.md` 2.057 (11). Toplam yaklaşık 97 KB.
- **Kodda eski terminoloji:** `Sürü Dron` hiçbir kod dosyasında yok (`[ÖLÇÜM]`; yalnız `docs/`, `.system_docs/` ve `.cursorrules`). `Amiral Gemi` iki kod dosyasında: `lib/academy/lesson-beat-visual.ts:495` (yorum) ve `tests/academy/off201-beat-visual.test.ts` (1 eşleşme). `.cursorrules` bu adlandırmayı yeni kodda istemiyor.
- **Testler:** 389 test dosyası (önceki tur). `verify:prebuild` zinciri 9 adım (`package.json:87`); Junior mühür doğrulaması bu zincirde yok (2.7).

---

## 5. ADIM 4: Anayasa, Manifesto, Pedagoji ve `.cursorrules` hizası

### 5.1 Hizalama tablosu

| Kural | Kaynak | Kod | Durum |
|---|---|---|---|
| Junior mühür sırası: metin, fırınlanmış ses, kart başına ısınma, üç soru, SVG sahne | `AGENTS.md` (sistem kuralı) | `juniorProductionSealGaps` (`production-seal.ts:58-82`): text, audio, warmup, quiz, scene | **Kısmi.** Ses fail-open (T-04); quiz şekle bakıyor (T-05); "kart başına" belirsiz: kod 5 kurs için 5 kaset kullanıyor. "Kart" kurs kartı anlamına geliyorsa uyumlu |
| Ses klasörü makinede varken eksik MP3 "taze" sayılmaz; klasör dağıtımda yoksa yokluk uydurulmaz | `PEDAGOJI.md:311` | `production-seal.ts:37-52`; `production-seal-disk.ts:1-7` | Belgeli tasarım; ama CDN için bağımsız kontrol yok (T-04) |
| Çekirdek dersin ilk konusu ücretsiz ve tam kalite; seçmeli hazırlık rafı bu vaadin dışında | `PEDAGOJI.md:272` | 11 ücretsiz açılış | Uyumlu. Ama paket seçimiyle seçmeliler açılıyor (T-06) |
| Her eğitimin ilk dersi herkese açık ve ücretsiz önizleme | `PEDAGOJI.md:79`; `ANAYASA.md` B4 (`.cursorrules` tablosu) | `juniorLessonAccess`, SSR | Uyumlu. API'de ses yolu erişim kararına bağlı değil (T-01) |
| Aydınlatma metni SHA ile mühürlü | `lib/junior/guardian-notice.ts:17` | Yeniden hesaplandı, eşleşiyor | **Uyumlu** (P+4) |
| Profil kapatılınca takma ad Kapalı olur, doğum yılı boşalır | Aydınlatma (`lib/copy/junior-guardian-notice.ts:21`) | `load.ts` `eraseChildData` (satır 282 ff.) | **Uyumlu** (P+5). Hesap kapatma ayrı yol ve kontrol eksik (T-02) |
| "Çocuğun sesi saklanmaz; ses bellekten silinir" | Aydınlatma (`copy:20`) | `submitJuniorTell` `finally` bloğu | Bellek temizliği uyumlu. Modele giden veri kapsamı aydınlatmada eksik (T-08) |
| "Sesli anlatış … modele gider" | Aydınlatma (`copy:20`) | `invoke({ provider: "gemini" })` | Sağlayıcı adı ve yurt dışı aktarım bildirilmiyor (T-08) |
| Çift imza (yeni oda) | `MANIFESTO.md:61`; `ANAYASA.md:129` | Kod yok | Kâğıt üstü (T-09) |
| Para tamsayı kuruş (Anayasa A1) | `lib/junior/price.ts` yorumu; `list_price_minor` (int) | `price_catalog_entries.amount_minor` | Uyumlu |
| Model kilidi: ajan model adını değiştiremez | `.cursorrules` | `lib/kernel/ai/model-roles.ts` | Dosya var; hizası bu turda kontrol edilmedi. Güncelleme prosedürü yok (öneri, §5.2) |
| Terminoloji: "Amiral Gemi" ve "Sürü Dron" eski dil | `.cursorrules` | Sürü Dron kodda 0; Amiral Gemi kodda 2 (yorum, test) | Büyük ölçüde uyumlu (T-20) |
| Shared Kernel `@yetkin/kernel` | `ANAYASA.md` B1 | `packages/kernel` (17 dosya, 28 tüketici) | **Uyumlu** (P+1) |
| Akademi beş katman mührü | `AGENTS.md`; `.cursorrules` | `lib/academy/production-standard.ts` (dosya mevcut) | Kapsam dışı; yalnız varlığı doğrulandı |

### 5.2 Uygulanamaz veya yük getiren kurallar

1. **Model kilidi ve güncelleme yasağı.** Ajanın model adını değiştirememesi doğru bir güvence. Ama sağlayıcı bir modeli kaldırırsa (deprecation) acil güncelleme yolu tanımsız. Öneri: "model değişiklik prosedürü" (kim onaylar, hangi testler koşar, hangi tarihte) belgeye eklensin.
2. **Medya üretimi insan adımı.** Isınma videosu otomatik video API'si yerine yerel dosyayla çözülmüş; API iptal edilmiş (`lib/academy/lesson-veo.ts`). Yeni ders başına medya üretimi insan emeği istiyor (çıkarım). Öneri: medya manifesti ve üretim betiği.
3. **Belge yükü.** Yaklaşık 97 KB, 8 yönetişim belgesi; `PEDAGOJI.md` 188 satır. Aynı kural birden çok belgede tekrarlanıyor (T-18). Öneri: tek kural tablosu, diğer belgeler bağlantı.
4. **`.cursorrules` dışlama listesi.** `public/media` ve `archived` taramasının yasak olması maliyet açısından doğru; ama medya varlığını doğrulamayı zorlaştırıyor. Öneri: üretilmiş medya manifesti (sha256, süre, bayt) repo'da tutulsun; ajan dosya sistemine girmeden doğrulayabilsin.
5. **Çift imza.** Belgede zorunlu, kodda yok. Ya kodla zorlansın ya da belgede "geçici istisna: tek operatör" olarak yazılsın.
6. **"Hizayı bozan taraf kod" ilkesi.** Güzel bir ilke, ama belge-kod hizası için otomatik kontrol yok. Öneri: belgedeki sabitler (model adları, süre bantları, eşikler) üretilmiş bir JSON'dan kontrol edilen bir `verify` adımı.

### 5.3 Belge düzeltme önerileri

- `PEDAGOJI.md` Ek-J: ses kapısının dağıtımda manifest ile doğrulandığı madde eklensin (T-04 çözülünce). Build zincirinde `write-production-seal-manifest.ts` zaten çalışıyor; Junior ses listesi buraya eklenebilir.
- `ANAYASA.md` B4: ücretsiz açılışların ses yolu politikası (T-01) yazılsın.
- `PEDAGOJI.md` ve `.cursorrules`: seçmeli paket kapsamı ve taslak dersin ödeme sonrası durumu açıkça yazılsın (T-06).
- `MANIFESTO.md:61` "çift imza" ifadesi, kodda karşılığı yazılana kadar "hedef" olarak işaretlensin.
- `.cursorrules` "Akademi üretim işaretçileri" tablosu tek kaynağa indirilsin; `AGENTS.md`'deki tekrar kaldırılsın.

---

## 6. ADIM 5: Tarafsız görüş

### 6.1 "Sen olsaydın ne yapardın?"

1. **Bu hafta üç P0'ı kapatırdım** (T-01 ses yolu, T-02 hesap kapatma, T-03 kurtarma kapısı). Güvenlik ve veri açıkları, içerik ve özellik işinden önce gelir.
2. **Seçmeli paketi kasa açılmadan önce dürüstleştirirdim.** Ödeme kapsamında taslak ders sunmak bugün ürünün en büyük ticari riski. 2.9'daki A seçeneğini (seçimi kapat ya da "Yakında" etiketle) hemen uygulardım; B seçeneği (tamamlama) sonra gelir.
3. **İçerik kalitesini ölçülebilir kapılarla korurdum.** "Mühür" iddiası ancak ölçülürse anlamlı. Quiz cevap dağılımı, yazılı taban süresi ve ses manifesti CI'da koşardı. Bugün 105/105 "tam" görünen sonuç, bu üç ölçü yüzünden güvenilir değil.
4. **Yönetişimi üç kritik alanla sınırlardım:** fiyat, kurs ve oda yayını, kasa. Her biri için "değişiklik talebi + ikinci onay" tablosu. Tam RBAC sonra gelir.
5. **Belge sayısını azaltırdım.** Tekrar eden kurallar tek tabloya, rapor tekrarları tek kanonik rapora inerdi.
6. **Pragmatik monolit kalırdım.** Mikro-uygulama ayrımına şimdilik geçmezdim. Shared Kernel yönü doğru; mevcut sınırı sıkılaştırırdım.
7. **6. sınıf "tamamlandı" tanımını netleştirirdim.** Bugünkü tanım "kapılardan geçti" demek. Gerçek tamlık için öğretim programıyla karşılaştırma ve ünite katmanı gerekir. Bu olmadan kapsam kanıtlanmış sayılamaz.

**Ödünler:** İçeriğin koda gömülü olması tek geliştirici için hızlıdır, ama içerik ekibi koda bağımlı olur. Veri tabanına taşımak migrasyon ve araç gerektirir; bu Faz 2 işi. Ses ve medya için manifest yaklaşımı ek bir üretim adımı getirir, ama kapıyı gerçek yapar.

### 6.2 Mimari: uygulanmış mı, yoksa kâğıt üstünde mi?

| Konu | Durum | Kanıt |
|---|---|---|
| Shared Kernel (`@yetkin/kernel`) | **Gerçek** | 17 dosya; 28 tüketici; `lib/kernel` ürün modüllerini import etmiyor |
| Pragmatik monolit | **Gerçek** | Tek Next.js gövdesi (`app/`, `lib/`) |
| Tek native istemci (`apps/rail-is`) | **Kısmi** | Junior için tek hop; ders oynatma yok (T-14) |
| API-first Junior | **Kısmi** | v1'de tek junior hop; 7 `junior-pilot` rotası v1 dışında |
| RLS fail-closed | **Gerçek** | Genel ENABLE + FORCE; `rls_deny_unscoped`; sahiplik politikaları |
| Para: tamsayı ve tek kaynak | **Gerçek** (Junior) | Fiyat DB'den; minör birim; kasa kapalı. Ama kurs yayını fiyat satırını değiştiriyor (T-09) |
| Junior mühür kapıları | **Kısmi** | Kapı kodu var; ses fail-open (T-04); quiz şekle bakıyor (T-05); seçmeli kapıları kapanmıyor (T-15) |
| Süper admin kimliği | **Gerçek ama zayıf** | Kod tabanlı; üretimde kurtarma tek faktör (T-03) |
| Çift imza | **Kâğıt üstü** | Belgede; kodda yok (T-09) |
| Ücretli içerik koruması | **Kısmi / risk** | UI ve metin kilidi var; API ses yolu kilitsiz (T-01); seçmeli paket taslak içerik sunuyor (T-06) |
| Veri silme ve saklama | **Kısmi** | Çocuk bazında silme var; hesap kapatma Junior paketini kontrol etmiyor (T-02); saklama süresi kodu yok |
| Oda kaydı | **Gerçek, çift kaynaklı** | `kayit.ts` + sabit bayraklar (T-10) |
| Terminoloji | **Büyük ölçüde gerçek** | Sürü Dron kodda yok; Amiral Gemi 2 yerde (yorum, test) |

### 6.3 Ana plan: Junior 6. sınıfı tamamlama ve ölçekleme

**Faz 0. Güvenlik, veri ve satış kapısı (2–4 iş günü)**

- T-01: Ses yolu yalnız erişim kararıyla dönsün; kilitli derste URL yok. CDN için imzalı veya kısa ömürlü URL ya da içerik hash'li dosya adı. *Kabul:* anonim istekte kilitli ders için `audioPath` boş; URL tahmin edilemez.
- T-02: Hesap kapatma, aktif Junior paketi veya çocuk profili varsa reddedilsin (409) ya da önce çocuk verisi ve paket kapatma akışı tamamlansın. Kaskad davranışı canlı şemada doğrulansın. *Kabul:* aktif paket varken kapatma reddedilir; kapatma sonrası Junior tablolarında kişisel alan kalmaz.
- T-03: Üretimde `SUPER_ADMIN_USER_ID` zorunlu (boşsa fail-closed). Yerleşik e-posta kurtarma kapısı kaldırılır ya da MFA şartı konur. *Kabul:* env boşken admin açılmaz; `verify:prebuild` bunu kontrol eder.
- T-06 kararı: Seçmeli paket kapsamı (2.9, A veya B). *Kabul:* kasa açılmadan önce seçmelilerin ödeme kapsamındaki durumu yazılı.

**Faz 1. Mühür ve içerik kalitesi (1–2 hafta)**

- T-04: Ses manifesti. Bake betiği anahtar, sha256, süre ve bayt üretir; build zincirindeki `write-production-seal-manifest.ts` bu manifesti kapsayacak şekilde genişletilir; eksik anahtarda build kırılır. Dağıtım sonrası CDN HEAD kontrolü. *Kabul:* manifestte olmayan anahtar build'de hata verir.
- T-05: Şık sıralamasını deterministik karıştır (ders ve soru kimliğine göre) ve yayın kapısına dağılım ölçüsü ekle: tek indeksin payı en fazla %40; her konuda en az bir A-dışı doğru cevap. *Kabul:* 105 konu dağılım kapısını geçer.
- T-07: Dolguyu yazılı içerikle değiştir. Taban 5 dakikaya gerçek metinle ulaşmalı. Ya da bant tanımı belgede revize edilmeli. *Kabul:* yazılı taban ≥ 5 dk ya da yazılı karar.
- T-08: Hukuk incelemesi. Aydınlatmaya sağlayıcı, işleme amacı, yurt dışı aktarım ve gerekiyorsa ayrı rıza. Sistem istemindeki doğum yılı için veri minimizasyonu gerekçesi. *Kabul:* hukuk onayı yazılı.
- T-09: Fiyat, kurs yayını ve oda değişikliği için en az bir "değişiklik talebi + ikinci onay" kaydı. *Kabul:* tek kişinin tek adımda fiyat değiştirebildiği yol kalmaz.
- T-15: Seçmeli için kaset ve süre kararı (2.3, 2.9). *Kabul:* her seçmeli dersin kapı gereksinimi yazılı ve uygulanabilir.

**Faz 2. Veri ve API-first (2–4 hafta)**

- Junior içeriğini versiyonlu, şema doğrulamalı veri katmanına taşı (JSON + zod); kapılar derleme zamanında koşsun.
- `juniorCourseShelves` için süreç içi önbellek (T-13). *Kabul:* sıcak çağrı 1 ms altı.
- v1 sözleşmesine Junior hop'ları: raf, kart, ders gövdesi (yetkiliye), ilerleme, anlatış. `apps/rail-is` tüketici olarak eklenir (T-14). *Kabul:* native istemci bir dersi oynatabilir.
- Kota tek kaynağa iner (T-12): DB CHECK'lerindeki sabitler ve seçmeli slug listesi ya kaldırılır ya da JS sabitiyle üretilir.
- Fiyat tohumu: `ON CONFLICT` içinde `is_active`, `min_minor`, `max_minor`, `description`, `currency_code` koşulsuz yazımı kaldırılır (T-11).
- Freelancer kapalılığı tek kaynağa iner (T-10).
- Migrasyon hattı kararı (T-17): tek hat ya da iki hat için tek uygulama sırası.

**Faz 3. Yönetişim ve ölçek (1–2 ay)**

- Maker-checker: fiyat, kurs yayını, oda bayrağı ve kasa açma için talep tablosu; belgede istisna varsa açıkça yazılır (T-09).
- Süper admin için imzalı staff önizleme modu (T-10).
- Belge tek kaynağa: kural başına tek ev; diğer belgeler bağlantı; rapor tekrarları arşivlenir (T-18). Model kilidi için değişiklik prosedürü.
- Ünite katmanı ve öğretim programı kazanım eşlemesi (T-19). *Kabul:* her kazanım en az bir derse bağlı.
- Yetim betik temizliği (41) ve `archived/` bağımlılığı (T-16).
- 6. sınıf kapsamı kararı: 5 çekirdek kurs + seçmeli (A ya da B). Junior'ın diğer sınıflara genişlemesi ancak içerik üretimi ve kota modeli netleştikten sonra. Kod bugün yalnız 6. sınıfı kabul ediyor (`switchJuniorGrade` yalnız `JUNIOR_PILOT_GRADE = 6` kabul eder, `service.ts:305-315`).

### 6.4 Öncelikli sonraki adımlar

| Öncelik | ID | Adım | Efor | Etki |
|---|---|---|---|---|
| P0 | T-01 | Ses yolunu erişim kararına bağla; CDN okuma politikasını doğrula | S | Ücretli içerik sızıntısı |
| P0 | T-02 | Hesap kapatmayı Junior paketi ve çocuk verisiyle bağla; kaskadı canlıda doğrula | M | KVKK, yetim veri, ödeme |
| P0 | T-03 | `SUPER_ADMIN_USER_ID` zorunlu; kurtarma kapısını sınırla | S | Yetki ele geçirme |
| P1 | T-06 | Seçmeli paket kapsamı kararı (A veya B); kasa açılmadan önce | S (A) / L (B) | Ticari ve hukuki risk |
| P1 | T-04 | Ses manifesti ve CDN doğrulaması (build zincirine ekle) | M | Mühür gerçekliği |
| P1 | T-05 | Şık karıştırma ve dağılım kapısı | S | Öğrenme ölçümü |
| P1 | T-07 | Yazılı taban süresini gerçek içerikle tut | L | İçerik kalitesi |
| P1 | T-08 | Aydınlatma: sağlayıcı ve aktarım; hukuk onayı | S (kod) / hukuk | Hukuki risk |
| P1 | T-09 | Fiyat, kurs yayını ve oda için ikinci onay (en az talep kaydı) | M | Yönetişim |
| P1 | T-15 | Seçmeli kaset ve süre kararı | M | T-06'nın ön koşulu |
| P2 | T-10 | Freelancer kilidi tek kaynak; staff önizleme | M | Operasyon, test |
| P2 | T-11 | Fiyat tohumunda koşulsuz yazımı kaldır | S | Satış mandalı |
| P2 | T-12 | Kota tek kaynak | S | Tutarlılık |
| P2 | T-13 | Shelf önbelleği | S | Performans |
| P2 | T-14 | Junior v1 hop'ları ve rail-is tüketimi | L | API-first |
| P2 | T-16 | Yetim betik temizliği; arşiv bağımlılığı; quiz üreticisi koruması | S | Bakım, veri kaybı riski |
| P2 | T-17 | Migrasyon hattı kararı | S | Uygulama sırası |
| P2 | T-18 | Belge ve rapor tekilliği | S | Belge yükü |
| P3 | T-19 | Ünite katmanı; kazanım eşlemesi | L | 6. sınıf tamlığı |
| P3 | T-20 | Büyük dosyaların bölünmesi; terminoloji artığı | M | Bakım |

Efor: S = en fazla 1 gün, M = 2–4 gün, L = 1–2 hafta.

---

## 7. Doğrulanmamış maddeler ve açık sorular

- **CDN ve medya varlığı:** `public/media` kapsam dışı. MP3, MP4 ve kapak dosyalarının varlığı ile R2/CDN okuma politikası doğrulanmadı (T-01, T-04). Grok raporundaki "105 MP3 örtüşüyor" iddiası da doğrulanmadı (`docs/01_Tespit_Raporu_Grok 4.7.md`, satır 92).
- **`.vercelignore` ile Git dağıtımı:** CLI yüklemesinde klasörler hariç tutuluyor; Git tabanlı dağıtımda aynı davranış `[DOĞRULANMADI]`.
- **Üretim ortam değişkenleri:** `SUPER_ADMIN_USER_ID`, `CANONICAL_SUPER_ADMIN_EMAIL`, `NEXT_PUBLIC_MEDIA_BASE_URL`, `JUNIOR_CHECKOUT_OPEN`, `DRON_JUNIOR_OPEN`, `DRON_JUNIOR_ROOM_OPEN`, `JUNIOR_BETA_ALLOWLIST` (T-03, T-06, T-08).
- **Canlı veritabanı:** `pg_policies` durumu; `price_catalog_entries` içindeki `cat_junior_yearly` satırının `is_active` değeri (T-11); `public.users` → `auth.users` kaskadı (T-02); Junior tablolarında gerçek satır sayıları ve ACTIVE abonelik sayısı; mevcut seçmeli seçimleri (T-06).
- **Migrasyon uygulaması:** İki migrasyon hattının hangi ortamlara, hangi sırayla uygulandığı (T-17).
- **Sağlayıcı şartları:** Gemini veya kullanılan sağlayıcının veri işleme şartları, saklama süresi ve loglama (T-08).
- **Sayfa katmanı yetkisi:** `app/(kernel)/admin/` sayfalarının kendi guard'ları bu turda okunmadı. API rotaları `requireSuperAdmin` kullanıyor (doğrulandı).
- **Yetim quiz üreticileri:** Dört üreticinin (`fen`, `ing`, `sosyal`, `turkce`) yazma davranışı okunmadı (T-16).
- **`lib/kernel/proof/index.ts`:** Kullanılıp kullanılmadığı doğrulanmadı. `lib/kernel/env.ts` env şemasıdır; ölü değil.
- **Belge içeriği:** `docs/` içindeki 18 eski raporun içerik örtüşmesi karşılaştırılmadı (T-18).
- **Pedagojik doğruluk:** İçerik metinlerinin bilimsel ve dil doğruluğu uzman incelemesi gerektirir.
- **MEB öğretim programı:** Repo'da kazanım kodu yok; 6. sınıf kapsamı öğretim programıyla karşılaştırılmadı (T-19).
- **Akademi (yetişkin) mühürü:** Kapsam dışı; yalnız Junior ile ilişkisi incelendi.
- **Canlı ses erişilebilirliği:** Kilitli ders sesinin anonim erişimi staging'de doğrulanmalı (T-01). Bu turda canlı sisteme istek atılmadı.
- **`archived/` içeriği:** Okunmadı (`.cursorrules`). `scripts/` içinden yapılan referanslar metin olarak incelendi.

---

## 8. Önceki raporlarla karşılaştırma

`docs/01_Tespit_Raporu_Grok 4.7.md` içindeki iddialardan bu turda yalnız birini kontrol ettim:

- **Güncelliğini yitirmiş:** Satır 92: "Junior mühür, disk bakmaz." Mevcut kod `lib/junior/production-seal-disk.ts` ile ses klasörünü okuyor ve `juniorBakedAudioSealed` (satır 41–52) diski kontrol ediyor. Ancak klasör yokken fail-open dalı (`production-seal.ts:48-49`) duruyor; bu, T-04 olarak yeniden yazıldı.

Diğer önceki raporlar (§4.4) bu turda içerik olarak karşılaştırılmadı.

---

## 9. Yeniden üretim ve revizyon notu

### 9.1 Yeniden üretim

Ölçümler repo dışındaki `%TEMP%\yetkin-junior-audit\` klasöründe, repo kökünden çalıştırılır:

- Envanter ve quiz dağılımı: `node --require <tmp>\server-only-stub.cjs --import tsx <tmp>\inventory.mts`. `server-only` paketini ölçüm süresince boş modüle yönlendiren CJS ön yükleyici kullanılır; repo dosyası değişmez.
- Çekirdek dolgu ölçümü: aynı komutla `padding-core.mts`.
- Aydınlatma SHA-256 eşleşmesi: `hash-check.mts` (tam değer ve `MATCH: true` çıktısı bu turda alındı).
- Yetim betik taraması: PowerShell ile `scripts/` kökündeki kod uzantılı dosyaların adları, `package.json` ve `lib`, `app`, `tests`, `scripts`, `components`, `.github` dizinlerinin metin dosyalarında aranır; betiğin kendi dosyası hariç tutulur. Belge geçişi ayrıca `docs/`, `.system_docs/` ve kök `*.md` dosyalarında aranır.

### 9.2 Revizyon notu (önceki taslağa göre düzeltmeler)

Önceki taslak (`docs/01_TESPIT_RAPORU_JUNIOR_6SINIF.md`'nin önceki hali) doğrulanmamış ayrıntılar içeriyordu. Bu sürümde yeniden doğrulandı. Düzeltilen başlıca noktalar:

1. **Ders etiketi:** `juniorCatalogLessonKeys()` 117 kayıt döndürüyor (105 çekirdek + 12 seçmeli). "Çekirdek" etiketi yalnız 105 ders için geçerli.
2. **Quiz sayımı:** Ham sayımda 108 "hep A" konu görünüyordu; 12 seçmelinin quiz dizisi boş ve boş dizinin `every` kontrolü doğru dönüyor. Çekirdek için doğru sayı **96**.
3. **Dolgu:** "52 farklı dolgu paragrafı" ifadesi kaldırıldı. Ölçülen değerler: 55 şablon satırı, ders başına ortalama 38,3 satır, karakter payı %43,2, beş cümle 105/105 derste, 478 farklı paragraf.
4. **Terminoloji:** "Amiral Gemi 1 dosyada" düzeltildi: kodda 2 eşleşme (1 yorum, 1 test). "Sürü Dron" kodda yok.
5. **Hesap kapatma (T-02):** Önceki taslakta yalnız bakiye kontrolü yazılmıştı; açık kart iadesi kontrolü de var. Eksik olan: Junior paketinin kontrol edilmemesi. Kaskad iddiası (`public.users`) kanıt yetersizliği nedeniyle `[DOĞRULANMADI]` yapıldı.
6. **Yeni bulgular:** T-06 (seçmeli paket kapsamı), T-15 (seçmeli mühür kuralları tasarımla çelişiyor), T-17 (iki migrasyon hattı), T-18 (rapor mükerrerliği), T-12 (kota altı yerde sabit), T-09 (kurs yayını fiyat satırını değiştiriyor), build manifest kapsamı dışı (T-04), `verify:prebuild` 9 adım ve Junior mühür yok.
7. **Kaldırılan veya düzeltilen doğrulanmamış ayrıntılar:** `yetkin_rls_ownership_columns` fonksiyon adı; `scripts/ops-publish-vitrine-catalog.ts` ve `ops-market-pricing-catalog-sync.ts` satır referansları; `lib/academy/access.ts:57` yorumu; "488 dosya" ve modül adı listesi; `lib/junior/content/*` yolu (içerik `lib/junior/quiz/*` ve `elective-catalog.ts` içinde); "Gemini yönergesiyle manuel üretim" alıntısı; `resolveSuperAdminAccess` ve `checkout-paytr.ts:136` referansları; PayTR iade modülü iddiası; "yalnız 3 belgede" yerine doğrulanmış 7/34 belge geçişi; "Cascade tetiklenmez" kesinliği.
8. **Doğrulanan ayrıntılar (önceki taslakta eksikti):** `/api/(kernel)/admin/funnel` rotası `requireSuperAdmin` kullanıyor; `juniorGuardianNoticeCanonical` adı `lib/copy/junior-guardian-notice.ts:28`'de; `JUNIOR_BETA_ALLOWLIST` `lib/kernel/env.ts:39`'da; `DronBayrakları.isKapali("freelancer")` ANAYASA'da ve circuit-breakers'ta; `scripts/ops-storage-cors-check.ts:19` arşiv modülünü import ediyor.
9. **Elenen yanlış alarm:** `iyzico-test` sağlayıcı kısıtı sonraki migrasyonla `paytr` olarak düzeltilmiş; uyumsuzluk yok (§4.5).
