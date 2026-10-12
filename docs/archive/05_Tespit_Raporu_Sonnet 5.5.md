# Tespit ve Mimari Analiz Raporu (Faz 1)

| Alan | Değer |
|---|---|
| Tarih | 9 Ekim 2026 |
| Kapsam | Junior 6. sınıf durumu, Super Admin erişimi, dosya ve SSOT temizliği, kılavuz belgelerin kritiği, kıdemli mimar görüşü ve Master Plan |
| Mod | **Yalnız okuma.** Kod, şema, belge, medya ve ortam dosyasına dokunulmadı. Tek yazılan dosya bu rapordur. Kilitli model haritası (`AKADEMI_URETIM_ANAYASASI.md`, `lib/kernel/ai/model-roles.ts`) okundu, değiştirilmedi |
| Önceki raporlar | `docs/archive/` (T-01…T-20 tespitleri), `docs/03_FAZ3_MASTER_PLAN_RAPORU.md` |

**Kanıt etiketleri.**
`[KOD]` dosya okuma. `[ÖLÇÜM]` komut veya test çıktısı. `[YORUM]` benim mimari yargım. `[DOĞRULANMADI]` bu turda ölçemediğim şey: canlı Vercel/Supabase/R2 ortamı, `.env.local` (gizli dosya, kurala göre okunmadı), tarayıcı oturumu, `git` durumu (bu kabukta `git` PATH'te yok).

---

## 0. Yönetici özeti

1. **6. sınıf çekirdeği teknik olarak tamam, içerik takvimi olarak eksik.** 5 çekirdek kartta 105 konu var (Mat 25, Fen 20, Türkçe 20, İngilizce 20, Sosyal 20). 105 konunun hepsi beş kapıyı geçiyor: metin, fırınlanmış ses, ısınma kaseti, üç soru, SVG sahne `[ÖLÇÜM]`. Ama okul haftası kilidi 14 Eylül 2026'da başladı. **1 Şubat 2027'de dört kartın rafı biter, 8 Mart 2027'de Matematik biter** `[KOD]` (`lib/junior/week.ts`). Ders yılı Haziran'a sürüyor. Yani "6. sınıf bitti" demek için yaklaşık 75 konu daha gerekir `[YORUM]`.
2. **Seçmeli dersler yok hükmünde.** 6 seçmeli kartın her birinde 2 taslak konu var (toplam 12). Hiçbirinde ses, ısınma, soru yok. Paket "3 seçmeli" vaat ediyor, bugün açılabilir seçmeli sayısı 0 `[ÖLÇÜM]`.
3. **Super Admin (`yapinet360@gmail.com`) denetim açısından neredeyse tam, ama "%100" değil.** Rol veritabanında değil, e-posta + `SUPER_ADMIN_USER_ID` ortam değişkeninde. Üretimde UUID boşsa **kimse admin olamaz**. Beş yerde bilinçli veya yan etkili kısıt var: Junior kasası, Junior ders yazımı, dondurulmuş odalar (Freelancer + 7 arşiv oda), Akademi stüdyo/revizyon, canlı ortam doğrulanamadı (§2).
4. **En büyük risk kod değil, belge ile kod arasındaki çelişki ve tek kişiye bağlılık.** `.env.example` "UUID boşsa yerleşik kutu açılır" diyor, kod "boşsa kimse açılmaz" diyor. Super Admin e-postası `/iletisim` sayfasında herkese açık yazıyor.
5. **Belgeler ipte boğmuyor ama bağlam vergisi yüksek.** A katmanı (para, güvenlik, dürüst yüzey) sağlam ve doğru. B katmanı ve ajan kuralları aynı bilgiyi 3-4 yerde tekrar ediyor, rakamlar eskiyor (§4).
6. **Mimari (Pragmatik Monolit + `@yetkin/kernel` + tek native istemci) bugün için doğru.** 12 aylık ölçekte kırılacak yer içeriğin TypeScript dosyasında yaşaması, medyanın ağır kodlanması ve Junior'ın `/api/v1` dışında kalan yazma yolları (§5).
7. **Bir sonraki somut adım:** "Satış kapısı sprinti" (kilitli medyanın özel öneke alınması, çocuk verisi/AI hukuk çözümü, iade ve saklama, seçmeli vaadi kararı), paralelde içerik hattının koddan çıkarılıp 2027 Şubat duvarına yetiştirilmesi (§5.4).

---

## 1. Junior modülü ve 6. sınıf ders durumu

### 1.1 Veri yapısı: içerik nerede yaşıyor?

İçerik **veritabanında değil, TypeScript kaynak dosyasında.** `junior_question_bank` tablosu 8 Ekim'de bilerek düşürüldü (`prisma/migrations/20261008120000_drop_junior_question_bank`). Veritabanı yalnız kullanıcı verisini tutar.

| Katman | Ev | Ne taşır |
|---|---|---|
| Kart (kurs) | `lib/junior/catalog.ts` `JUNIOR_PILOT_COURSES`, `lib/junior/elective-catalog.ts` | slug, kod, başlık, branş, `lessons[]` |
| Konu içeriği | `lib/junior/content/{mat,fen,turkce,ing,sosyal}/N.ts` (toplam ~440 KB) | `JuniorLessonScenario`: hoş geldin, kavram, örnek, ipucu/tuzak, günlük hayat, özet, kazanım listesi, `scene`, `parentNote`, `mebNote`, `lifeUse` |
| Konu sonu sorusu | `lib/junior/quiz/{ders}/N.ts` (~225 KB) | 3 soru (kavram, uygulama, beceri), 4 şık, doğru indeks, ipucu, çözüm; 2-3 "Anlat" yönlendirme sorusu |
| Pekiştirme | `lib/junior/practice.ts` | çoktan seçmeli ve eşleştirme |
| Dinle ve Anlat | `lib/junior/service.ts` `submitJuniorTell`, `tell.ts`, `persona.ts` | sesli veya yazılı anlatış, yaş grubuna göre üslup |
| Sahne | `lib/junior/types.ts` `JUNIOR_VECTOR_SCENES` (~50 kimlik), `components/junior/player/*` | SVG vektör sahne, 12 adımlı oynatıcı |
| Medya | `public/media/junior/{audio,covers,warmup}` → R2 | konu başı MP3 + JPG kapak, kart başı ısınma MP4 |
| Mühür | `lib/junior/production-seal.ts` | 5 kapı: `text`, `audio`, `warmup`, `quiz`, `scene` |
| Kayıt defterleri | `lib/junior/audio-manifest.generated.ts` (SHA-256), `lib/junior/voice.ts` `JUNIOR_BAKED_AUDIO_KEYS` (105 anahtar) | yayın ses sicili |
| Kullanıcı verisi | `prisma/schema/junior.prisma` | `JuniorProfile`, `JuniorGuardianConsent`, `JuniorProgress`, `JuniorXp`, `JuniorSubscription` |

Kapı: `lib/kernel/security/junior-gate.ts` `canEnterJunior`. İlk konu ücretsiz, kalanı yıllık paket veya denetim aktörü.

### 1.2 6. sınıf durum tablosu `[ÖLÇÜM]`

Ölçüm yolu: dosya sayımı, `npm run verify:junior-audio-manifest` (çıkış 0, 105 anahtar, yerel SHA-256 eşleşti), `npm run verify:junior-pilot-seals` (OK), `tests/kernel/junior-lesson-chain.test.ts` "Junior üretim mührü" (geçti: 5 çekirdek kartın tüm konuları `juniorProductionSealGaps = []`).

| Kart | Slug | Konu | Soru (3/konu) | Ses | Kapak | Isınma | Mühür | Durum |
|---|---|---:|---:|---:|---:|---:|---|---|
| Matematik | `jr_06_mat` | 25 | 75 | 25 | 25 | 1 (kart) | geçti | **Tam** (içerik takvimi: 8 Mart 2027'de biter) |
| Fen Bilimleri | `jr_06_fen` | 20 | 60 | 20 | 20 | 1 | geçti | Tam, 1 Şubat 2027'de biter |
| Türkçe | `jr_06_turkce` | 20 | 60 | 20 | 20 | 1 | geçti | Tam, 1 Şubat 2027'de biter |
| İngilizce (ana) | `jr_06_ing_main` | 20 | 60 | 20 | 20 | 1 | geçti | Tam, 1 Şubat 2027'de biter |
| Sosyal Bilgiler | `jr_06_sosyal` | 20 | 60 | 20 | 20 | 1 | geçti | Tam, 1 Şubat 2027'de biter |
| **Toplam çekirdek** | | **105** | **315** | **105** | **105** | 5 | | |
| Seçmeli İngilizce | `jr_06_ing` | 2 | 0 | 0 | 0 | 0 | **geçmez** (`text, audio, warmup, quiz`) | Taslak, fiyat dışı (`JUNIOR_ELECTIVE_PRICE_EXCLUDED`) |
| Seçmeli Almanca | `jr_06_alm` | 2 | 0 | 0 | 0 | 0 | geçmez | Taslak, "Yakında" |
| Seçmeli Fransızca | `jr_06_fra` | 2 | 0 | 0 | 0 | 0 | geçmez | Taslak, "Yakında" |
| Seçmeli Siyer | `jr_06_siyer` | 2 | 0 | 0 | 0 | 0 | geçmez | Taslak, "Yakında" |
| Seçmeli Kodlama | `jr_06_kod` | 2 | 0 | 0 | 0 | 0 | geçmez | Taslak, "Yakında" |
| Seçmeli Arapça | `jr_06_arp` | 2 | 0 | 0 | 0 | 0 | geçmez | Taslak, "Yakında" |

Ses ölçümü `[ÖLÇÜM]` (MP3 başlığından, sabit bit hızı varsayımıyla): 105 konu, ortalama 6,9 dk (5,9 - 7,8), toplam ~12,1 saat. Bu `JUNIOR_NARRATION_MIN_MS/MAX_MS` bandının (5-12 dk) içinde. T-07'nin "dolgu" iddiasını (yazılı anlatış 4,26 dk) ben ölçmedim; ses süresi banda uyuyor ama içeriğin dolgu olup olmadığı editoryal incelemeyle bakılmalı `[DOĞRULANMADI]`.

### 1.3 İçeriğin üç boyutu: "video, metin, interaktif soru, pedagoji" bugün nasıl temsil ediliyor

| Boyut | Bugün | Boşluk |
|---|---|---|
| **Metin** | Dört bölüm (Kavram, Örnek, Kritik Uyarı, Günlük Kullanım) + "Bugün Neler Öğrendik?" kartı; sen dili; sıcak açılış mühürlü (`content-rules.ts`) | Ünite yok. MEB kazanım kodu yok (`mebNote` serbest metin). Konu sırası = dosya numarası = hafta |
| **Ses** | Branş başına sabit öğretmen (Selim, Deniz, Elif, Selin, Murat), konu başı fırınlanmış MP3 | Her dosya ~15,8 MB (mono, 48 kHz, ~320 kb/s). Konuşma için gereksiz ağır (bkz. §5.1) |
| **Video** | Kart başına ~10 sn ısınma kaseti (5 dosya, 25 MB). Konu başına video **yok** | Ders görseli SVG sahne + ses. "Video ders" vaadi varsa bu bir boşluktur |
| **İnteraktif** | Pekiştirme (seç/eşleştir), 3 soruluk hızlı kontrol, Dinle ve Anlat (ses/yazı), XP ve rozet | Soru havuzu konu başına 3. Aynı soruyu tekrar çözmek mümkün; uyarlanabilir sıra, yanlış analizi, konu bazlı tekrar yok |
| **Pedagoji** | Yaş grubuna göre üslup, tuzak/altın ipucu kutusu, veli notu, haftalık rapor (`report.ts`) | Kazanım bazlı ilerleme haritası yok. Rapor "konu bitti" seviyesinde, "hangi kazanım zayıf" seviyesinde değil |

### 1.4 Eksiklerin tamamlanması için gereken veri ve kod yapıları

1. **Müfredat iskeleti.** `sınıf → branş → ünite → kazanım (MEB kodu) → konu → hafta` ilişkisi. Bugün yalnız düz `lessons[]` dizisi var. `docs/archive` T-19 / F3-5 aynı şeyi söylüyor, hâlâ açık.
2. **Açık hafta takvimi.** Hafta bugün dizi indeksinden türüyor (`juniorThisWeekLessonIndex`). Tatil, sınav haftası ve ünite sonu tekrarı yazılamıyor. `weekNo` ve `unitId` konuya açıkça yazılmalı.
3. **Konu yaşam döngüsü kaydı.** Taslak → metin onaylı → ses fırınlı → mühürlü durumu bugün diskten ve testten türüyor, kimin onayladığı yok. Maker-checker için `lesson_status` kaydı (kim, ne zaman, hangi sürüm) gerekir (T-09 ile aynı kök).
4. **İçerik şeması ve doğrulayıcı.** `JuniorLessonScenario` için tek Zod şeması; CI'da bütün konular bu şemadan geçmeli. Bugün kurallar `content-rules.ts` ve test metinlerine dağılmış.
5. **Medya sicili tek kayıt.** `lessonKey → {ses SHA, süre, bayt, kapak, ısınma}`. Bugün aynı bilgi 3 yerde (`JUNIOR_BAKED_AUDIO_KEYS`, `audio-manifest.generated.ts`, disk) elle senkron tutuluyor.
6. **Soru bankası.** Konu başı 10-15 soru, seviye ve kazanım etiketli; oturum başına 3 çekiliyor. Düşürülen tablonun işlevi koda taşındı ama büyümeye hazır değil.
7. **Seçmeli kararı (K1).** Ya 12 taslak 6 kartlık gerçek derse çıkarılır (6 × en az 12 konu), ya paket vaadinden seçmeli çıkarılır. İkisi arasında kalmak en kötü seçenek: bugün kasa, kota ve kullanıcı arayüzü ürünün vermediği şeyi anlatıyor.
8. **Diğer 6. sınıf branşları.** Din Kültürü, Görsel Sanatlar, Müzik, Bilişim gibi dersler hiç yok. "6. sınıf tamam" tanımına girip girmeyeceği ürün kararı; MEB ders çizelgesiyle doğrulanmalı `[DOĞRULANMADI]`.
9. **Sınıf seçici davranışı.** `JUNIOR_GRADE_MIN = 5`, `JUNIOR_GRADE_MAX = 12`, ama `juniorShelvesForGrade(_grade, …)` sınıfı yok sayıp her zaman 6. sınıf rafını döndürüyor `[KOD]` (`lib/junior/catalog.ts:341`). 7. sınıf profili açan veli 6. sınıf içeriği görür. Vitrin metni "yakında" diyor ama veri düzeyinde koruma yok.

### 1.5 İçerik takvimi duvarı `[KOD]` + `[YORUM]`

Okul açılışı 14 Eylül 2026. Bugün 4. haftadayız.

| Hafta | Başlangıç | Olay |
|---:|---|---|
| 4 | 5 Ekim 2026 | Bugünün haftası |
| 21 | 1 Şubat 2027 | Fen, Türkçe, İngilizce, Sosyal rafı biter. Rozet "son konuda" kalır |
| 26 | 8 Mart 2027 | Matematik rafı biter |
| 36 | 17 Mayıs 2027 | 36 haftalık yıl varsayımıyla hedef |

36 haftaya ulaşmak için ihtiyaç: 4 kart × 16 + Mat × 11 = **~75 konu**, ~8,6 saat ses. Ekip 105 konuyu hâlihazırda üretebildiği için bu ulaşılabilir, ama 16 haftalık bir üretim takvimi gerektirir ve süreç bugün elle.

---

## 2. SUPER_ADMIN yetkilendirme ve erişim kontrolü

### 2.1 Kimlik modeli `[KOD]`

- Rol **veritabanında yok.** `User` modelinde rol kolonu yok (`prisma/schema/kernel.prisma:36`). Supabase RLS politikaları admin bilmiyor; Prisma servis rolüyle RLS'i aşıyor.
- Tek kapı: `lib/kernel/auth/super-admin.ts` `isSuperAdminActor`. Kenar (`proxy.ts` → `edge-api-auth.ts`, `auth = "admin"`) ve sayfa/rota (`requireSuperAdmin`, `resolveSuperAdminAccess`) aynı fonksiyonu okuyor. Bu iyi: tek karar noktası.
- `yapinet360@gmail.com` yerleşik kanonik kutu (`CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT`).
  - **Geliştirme:** doğrulanmış e-posta yeter.
  - **Üretim:** `email_confirmed_at` dolu **ve** `SUPER_ADMIN_USER_ID` ortam değişkeni bu hesabın UUID'sine birebir eşit olmalı. UUID boşsa **hiçbir hesap admin olmaz** (fail-closed, T-03).
- `yetkin.vision@gmail.com` asla admin sayılmaz (vatandaş test hesabı).
- Test: `tests/kernel/require-super-admin.test.ts` ve ilgili Junior testleri 35/35 geçti `[ÖLÇÜM]`.

### 2.2 Erişim matrisi `[KOD]`

| Yüzey | Super Admin | Not |
|---|---|---|
| `/admin` (katalog, fiyat, huni, kurs yayını) | **Evet** | `/api/admin/catalog`, `/publish`, `/funnel` kenarda `admin` |
| Akademi (izleme, stüdyo önizleme, çıkış paketi) | **Evet** | `isSuperAdminActor` ile bağış satırı olmadan izleme |
| Junior vitrin, tüm kilitli konular, anlatış, test, profil masası | **Evet** ("denetim") | `isJuniorAuditActor`; `DRON_JUNIOR_OPEN` gerekmez |
| Junior seçmeli taslaklar (mühürsüz) | **Evet** | Denetim raf süzgecinden geçmez (`catalog.ts:243`) |
| **Junior kasası (satın alma)** | **Hayır** | Denetim aktörü ödeme yapamaz (`checkout.ts:216`, 403). Tasarım gereği ("nakit satırı yazmaz") |
| **Junior ders metni yazma/yayın** | **Hayır** | İçerik kod dosyası; panel yok. `ANAYASA.md` B6 açıkça yasaklıyor |
| Freelancer (sayfa + API) | **Hayır, herkes için 410** | `FREELANCER_PUBLIC_SURFACE_LOCKED = true` derleme sabiti; `isFrozenRoomApi` admini ayırt etmiyor (T-10) |
| Studio, DevLabs, Kurumsal, Hibe, Arena, Yetkinİlan, YetkinX | **Hayır, herkes için 410** | `FROZEN_DISK_ROOMS` |
| `/admin/curriculum-revisions` | Sayfa açılır ama yalnız "kapalı" mesajı | API `auth = "public"` ve her yöntem 410 |
| `/profil`, `/cuzdan`, `/pasaport` | Evet (kendi hesabı) | |

### 2.3 Bulgular

| Kod | Ağırlık | Bulgu | Kanıt |
|---|---|---|---|
| S-1 | **P1** | **Belge-kod çelişkisi, üretimde kilitlenme riski.** `.env.example:172` "Boşsa doğrulanmış yerleşik kutu kurtarma kapısıdır" diyor. Kod ise üretimde UUID boşsa yerleşik kutuyu da kapatıyor. `lib/kernel/auth/require-super-admin.ts` yorumu da "UUID ve env gecikse de açılır" diyor. Operatör UUID'yi girmeden dağıtırsa admin paneli dahil her şey kapalı kalır. | `super-admin.ts:80-110`, `.env.example:169-176` |
| S-2 | **P1** | **Super Admin e-postası herkese açık.** `LEGAL_ENTITY.adminEmail` `/iletisim` sayfasında yazılı. Anahtarları tutan hesap hedeflenmiş oltalama ve şifre sıfırlama saldırısına açık bir adres. MFA/passkey durumu doğrulanamadı. | `lib/copy/legal-launch.ts:18`, `app/(public)/iletisim/page.tsx:89` |
| S-3 | P1 | **Tek kişi, tek hesap, tek anahtar.** Rol modeli yok (içerik editörü, finans, destek ayrımı yok). "CEO + Super Admin çift imza" belgede var, kodda yok (T-09: kurs yayını tek çağrıda `is_active` değiştiriyor). Hesap kaybı = tüm yönetim kaybı. | `ANAYASA.md` B5, `course-publish.ts` |
| S-4 | P2 | **Junior için yönetim paneli yok.** Admin sayfası katalog/fiyat/huni/kurs yayınına bakıyor. Junior abonelik, rıza, ilerleme, iade, içerik durumu için görünüm veya araç yok. Fiyat satırı (`cat_junior_yearly`) katalogdan düzenlenebiliyor. | `app/(kernel)/admin/*`, `OPS_RUNBOOK.md:29` |
| S-5 | P2 | **Denetim aktörü kasayı deneyemiyor.** Uçtan uca "ödeme → lisans → ders açılır" akışı admin hesabıyla sınanamaz. Ayrı, admin olmayan bir test ebeveyni gerekir (`yetkin.vision` bu iş için ayrılmış görünüyor). Üretimde `PAYTR_SANDBOX` satışı açmıyor. | `checkout.ts`, `paytr.ts:79` |
| S-6 | P2 | `JUNIOR_BETA_ALLOWLIST`'teki herkes Super Admin ile aynı Junior denetim gücünü alıyor (tüm kilitli konular + seçmeli taslaklar). Liste kullanım kaydı yok. | `junior-gate.ts:75-97` |
| S-7 | P3 | `/api/admin/curriculum-revisions` yolu `route-auth-map`'te `public`. 410 döndüğü için zararsız; yeniden açılırsa `admin`e çevrilmeli. | `route-auth-map.ts:26` |
| S-8 | P3 | Admin e-postası kodda 3 ayrı yerde sabit (`super-admin.ts`, `legal-launch.ts`, `.env.example` + belgeler). Tek ev: `super-admin.ts`. | |
| S-9 | `[DOĞRULANMADI]` | Üretimde `SUPER_ADMIN_USER_ID` ve `CANONICAL_SUPER_ADMIN_EMAIL` değerleri, Supabase'de hesabın `email_confirmed_at` durumu, MFA. `.env.local` ve `.vercel/` okunmadı. | |

### 2.4 Hüküm

- "Tüm modüllere, panellere ve Junior içerik yönetim araçlarına %100 erişim" **bugün sağlanmıyor ve bunun üç nedeni farklı:**
  1. *Bilinçli kapalı:* Junior kasası, dondurulmuş odalar (koda ve belgeye göre doğru).
  2. *Hiç yazılmamış:* Junior içerik yönetim aracı (panel yok; içerik kodda).
  3. *Doğrulanamayan:* üretim ortamında UUID ve e-posta onayı.
- RBAC/RLS **yetersizliği** bulunmadı; çünkü RBAC yok, yetkilendirme tamamen uygulama katmanında ve tek yerde. Sorun yetersiz kural değil, **tek kural, tek kişi, tek kutu**.
- Super Admin'in "içerik yönetim aracı" beklentisi mimari bir karar: `ANAYASA.md` B6 bunu yasaklıyor. Bu yasak ürün ölçeğinde revize edilmeli (§4, §5).

---

## 3. Amiral Gemi + Sürü Dron (Shared Kernel) ve dosya temizlik analizi

### 3.1 Mimari ad hizası `[KOD]`

`lib/dronlar/kayit.ts` (kayıt + bayrak), `packages/kernel` (`@yetkin/kernel`, v1 hop sicili), `apps/rail-is` (tek native istemci, 48 kaynak dosya), `middleware/api-auth.ts` (tek dosya; asıl kenar `proxy.ts`). Kural dosyasındaki terminoloji ("Amiral Gemi = monolit, Sürü Dron = kayıt+bayrak+yol") kodla uyumlu.

### 3.2 Çelişen ve mükerrer yapılar (SSOT ihlalleri)

| Kod | Konu | Nerede tekrarlanıyor | Öneri |
|---|---|---|---|
| D-1 | **Junior ders kimliği ~8 yerde** | `content/*/N.ts` (`key`), `quiz/*/N.ts` (`lessonKey`), `lesson-face.ts` (üretilmiş izdüşüm), `audio-manifest.generated.ts`, `voice.ts` `JUNIOR_BAKED_AUDIO_KEYS` (105 anahtar elle), kapak dosyaları, `human-titles.ts` | Tek sicil: katalogdan türet; `JUNIOR_BAKED_AUDIO_KEYS` kaldırılıp manifestten okunur |
| D-2 | **Kurs slug tablosu 6+ yerde** | `limits.ts`, `warmup.ts`, `human-titles.ts`, `voice.ts` (öğretmen), `scripts/bake-junior-covers.ts`, `catalog.ts`, ANAYASA B6 metni | Tek kurs tanımı nesnesi; diğerleri ondan okur |
| D-3 | **Seçmeli kota 3** | `limits.ts` (tek sabit), ama Prisma `@default(3)`, iki SQL `CHECK`, `plan.ts:90` "En fazla üç…", `elective-quota-modal.tsx:109` "Üç ders dolunca…" | Metinleri sabitten üret; migration değişimi test kilitli |
| D-4 | **İki migration hattı** | `prisma/migrations` (43 dizin) ve `supabase/migrations` (16 SQL, fiyat tohumu dahil) | ADR ile tek yetkili hat (T-17, açık) |
| D-5 | **Dondurulmuş oda 3 gösterim** | `FROZEN_DISK_ROOMS` (`kayit.ts`), `FROZEN_DISK_ROOM_CATALOG` (`circuit-breakers.ts`), `FREELANCER_PUBLIC_SURFACE_LOCKED` + `DronBayrakları` | Tek fonksiyon (T-10) |
| D-6 | **`jr_06_ing` ve `jr_06_ing_main`** | iki ayrı kart, benzer ad | Slug çakışma testi, ad netleştirme (T-19) |
| D-7 | **`archived/` canlı kodla bağlı** | `vitest.aliases.ts:22,26` arşive alias verir; 25+ test dosyası arşiv kodunu import eder; `scripts/ops-storage-cors-check.ts` `@/archived/lib/studio/storage` import eder; `lib/` içinde 7 dosya "archived" anıyor | Kural "arşiv canlı referans değil" diyor, test altyapısı tersini yapıyor. Gereken fikstürleri `tests/fixtures`a taşı |
| D-8 | **Model haritası iki sicil** | `AI_MODEL_ROLE_DEFAULTS` içindeki `FAST_STREAM: "gemini-3.8-live"` düz dize; harita ise `ACADEMY_SEALED_MEDIA_MODEL` | Harita ile kod **şu an hizalı** `[KOD]`; dokunulmadı. İleride `FAST_STREAM` da sealed nesneden okunabilir |
| D-9 | **Rakamlar belgelerde** | `OPS_RUNBOOK.md:44` "20 kayıt"; Anayasa "sayılar belgede durmaz" diyor | Belgeden sayıyı çıkar, betikle üret (F3-4, açık) |
| D-10 | **Eski referanslar** | `docs/03_FAZ3…` `docs/02_TEDAVI_RAPORU_JUNIOR_6SINIF.md`'e dayanıyor, dosya yok (arşivde farklı adla). `tsconfig.json:77` `tests/_archived-junior/**` dışlıyor, dizin yok. `yetkin_muze/` .gitignore, .vercelignore, .cursorindexingignore, .cursorrules ve Anayasa'da geçiyor, diskte yok | Referansları temizle |

### 3.3 Hacim ve temizlik adayları `[ÖLÇÜM]`

`git` kabukta olmadığı için "izlenen/izlenmeyen" ayrımı `.gitignore`/`.vercelignore` okumasından; kesin durum `[DOĞRULANMADI]`.

| Öğe | Boyut | Git/Vercel | Değerlendirme |
|---|---:|---|---|
| `media-bake/` (WAV kaynakları: Junior 3,98 GB + Akademi 1,53 GB) | **5,5 GB** | dışarıda | Yerel yedek. R2 doğrulanınca soğuk depoya taşı. Silme: onay şart |
| `public/media/junior/audio` (106 dosya) | **1,66 GB** | dışarıda (R2) | Yerel kaynak kopya. 320 kb/s mono; yeniden kodlamayla ~0,35 GB (bkz. §5.1) |
| `public/media/junior/covers` + `warmup` | 20,7 + 25,2 MB | dışarıda (R2) | Normal |
| `node_modules` | 909 MB | dışarıda | Normal |
| `apps/rail-is/node_modules` | ~280 MB | dışarıda | Normal |
| `.next/` | 304 MB | dışarıda | Yeniden üretilir, silinebilir |
| `generated/` (Prisma istemcisi) | 4 MB | dışarıda | `prisma generate` ile yeniden üretilir |
| `tsconfig.tsbuildinfo` (kök) | küçük | dışarıda | Silinebilir |
| `.tmp/` (4 dosya: `junior-preflight.mjs`, 3 `*-nano-slides-done.txt`) | <10 KB | dışarıda | Operatör kalıntısı, silinebilir |
| `archived/` (260 dosya) | 1,3 MB | **izleniyor olabilir** | Testler bağlı (D-7); önce bağı kes |
| `scripts/` içinde 25 tek seferlik Akademi fırın/mühür betiği (`bake-office-ai-0N-sealed-pack`, `*-nano-slides`, `seal-*-player-clock`, `*-stage2-audio`, `ingest-ec102-*`, `lock-ec102-*`, `align-ec102-*`, `repair-office-ai-05-*`) | küçük | izleniyor | `docs/03` §3.3 aynı tespiti yaptı. `scripts/archive/` altına taşı veya sil; silmeden önce son fırın tarihlerini doğrula |
| `scripts/ops-sync-media-to-storage.ts` ve `scripts/sync-media-to-r2.ts` | küçük | izleniyor | İşlev örtüşmesi olabilir `[DOĞRULANMADI]` |
| `.cursor/mcp.json` | küçük | dışarıda | Okunmadı (kural) |

**Gerçek hacim sorunu repo'da değil, medyada.** Repo kaynağı küçük (`lib/` ~5 MB, `tests/` ~3 MB, `scripts/` ~1,3 MB). Kaynak dışındaki 7+ GB yerel medya ve WAV birikimi, yedeksiz tek disk riski taşıyor.

---

## 4. Kılavuz belgelerin kritiği

Okunanlar: `.cursorrules` (118 satır), `AGENTS.md`/`CLAUDE.md`, `ANAYASA.md` (107 satır, 20 KB), `MANIFESTO.md` (85 satır), `PEDAGOJI.md` (188 satır, 35 KB), `AKADEMI_URETIM_ANAYASASI.md` (10 KB), `OPS_RUNBOOK.md`, `ops/*.md`.

### 4.1 "İpte boğulma" var mı?

**Kısmen. Ürün kararlarını değil, geliştirme hızını ve ajan bağlamını boğuyor.**

- **A katmanı (A1-A5) doğru ve korunmalı:** `amountMinor`, tek defter, ödeme kuruluşu olmama, RLS/IDOR, sunucu puanlama, dürüst kapalı yüzey. Bunlar "ip" değil, can simidi.
- **Boğan kısım:**
  1. **Bağlam vergisi.** `.cursorrules` + `AGENTS.md` + Anayasa + Pedagoji + Akademi SOP ≈ 85 KB (≈ 25 bin token) okunmadan Junior'a tek satır yazmak bile "doğru" sayılmıyor.
  2. **Aynı bilgi 3-4 yerde.** Akademi 5 katman standardı: `AGENTS.md`, `.cursorrules` tablosu, Anayasa B4, Pedagoji B, `AKADEMI_URETIM_ANAYASASI.md`. Her biri "ikinci ev değilim" diyor, yine de tekrar ediyor.
  3. **Kelime ve üslup mühürleri testlerde kilit.** "Tuzaklara Düşme", "Altın İpucu", sıcak açılış listesi, "Girişteki sahneyi aklında tut" yasağı. Üslup tercihleri CI kapısı gibi davranıyor. B3 bunları "esnek" ilan etse de testler sert.
  4. **Kararı kod değil belge sahipleniyor.** B6: Super Admin ders metnini panelden yazamaz. Bu, içerik hızını doğrudan sınırlayan bir *mimari yasak*, bir güvenlik gereği değil.
  5. **Faz 1 kilidi ile gerçek ürün ayrışmış.** Anayasa B2/Manifesto: "Faz 1 vitrin 3 oda; yeni oda CEO+SA çift imza". Canlıda ise Junior ayrı bir oda, en çok kod (273 dosya `lib/junior`), en çok medya (1,7 GB) onda. Manifesto'nun hedef kitle ve gelir motoru bölümünde Junior hiç yok.

### 4.2 Belge ↔ kod çelişkileri

| Kod | Belge | Kod/gerçek | Öneri |
|---|---|---|---|
| B-1 | Anayasa B6: "10-18 yaş" | `juniorBirthYearBounds`: doğum yılı 9-18 yaş aralığı; `JUNIOR_GRADE_MIN=5…MAX=12`; Pedagoji "10-12 yaş (5,6,7. sınıf)" | Tek yaş tanımı, kodla hizala |
| B-2 | `.env.example:172` ve `require-super-admin.ts` yorumu: UUID boşsa yerleşik kutu açılır | Kod ve testler: üretimde boşsa kimse açılmaz | Belge ve yorum koda eşitlensin (S-1) |
| B-3 | B5/Manifesto: "çift imza (Super Admin + CEO)" | Kodda yok (T-09) | Ya kodla zorla, ya "ilke" diye işaretle |
| B-4 | Anayasa: "sayılar belgede durmaz" | `OPS_RUNBOOK:44` "20 kayıt"; B4'te ses adları (Callirrhoe, Kore, Puck), B6'da 5 slug | Belgeden sayıyı/slug'ı çıkar |
| B-5 | Anayasa tarihi 16 Ağustos 2026 | Ekim 2026'ya kadar Junior, R2, imzalı URL, v1 hop (17→20) eklendi | Tarihi ve sürümü güncelle, değişiklik günlüğü ekle |
| B-6 | B2 "sol menüde Junior herkese açık" | `WORKING_SHELL_NAV_ROOM_IDS` Panel+Akademi+Kariyer'den türüyor, Junior'ı ayrı ele alıyor | Junior'ın vitrindeki yerini tek cümleyle yaz |
| B-7 | `docs/` yeni raporları numaralıyor | `docs/01`, `docs/02` yok (arşivde farklı adla) | Numaralama kuralı + dizin |
| B-8 | Manifesto: gelir motorları Akademi, Kurumsal, Pazaryeri | Junior B2C-veli gelir motoru, fiyat 5.499 TL/yıl tohumu (`549900` kuruş), ayrı kasa | Manifesto'ya Motor ekle |

### 4.3 Kilitli model haritası

`AKADEMI_URETIM_ANAYASASI.md` §2.1 ile `lib/kernel/ai/model-roles.ts` `ACADEMY_SEALED_MEDIA_MODEL` **birebir hizalı** `[KOD]`: `gemini-3.8-flash`, `gemini-3.8-flash-tts`, `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`, `lyria-3.5`, `gemini-3.8-live`. Kurala uygun olarak **hiçbiri değiştirilmedi, "böyle model yok" diye işaretlenmedi, öneri kapsamına da alınmadı.** Aşağıdaki öneriler bu haritaya dokunmaz.

### 4.4 Revize önerisi (belge sahibi karar verir, ben dosyaya dokunmadım)

1. **A katmanı aynen kalsın.**
2. **Ajan bağlamı için tek sayfalık "Hızlı Kart":** model haritası bağlantısı, Super Admin kuralı, Junior kapı özeti, "bunu yapma" 10 madde. `.cursorrules`ın tekrar eden tablo bölümü ve `AGENTS.md`in Akademi bölümü bu karta bağlanır.
3. **B6'daki "Super Admin metin yazamaz" kuralı revize:** "Metin yazımı yalnız maker-checker ile, denetim izli içerik stüdyosundan yapılır; kasa ve fiyat yine ayrı yetkidir."
4. **Manifesto'ya Junior eklensin** (hedef kitle: veli; gelir motoru; pazar).
5. **Üslup mühürleri "nightly kalite raporu" statüsüne** (B3'ün kendi ilkesi) indirilsin; para, güvenlik ve çocuk verisi testleri sert kalsın.

---

## 5. "Sen olsaydın ne yapardın?" ve Master Plan

### 5.1 Sen olsaydın: ilk düzeltilecekler (öncelik sırasıyla)

**P0 – Satıştan önce (kod değil, güven):**

1. **Kilitli medyayı gerçekten kilitle.** İmzalı URL kodu hazır (`presignR2GetUrl`) ama nesneler `private/junior/` önekine taşınmadı, ücretli ses CDN'de tahmin edilebilir yolda duruyor (T-01, K2; `docs/03` §5). İmza doğrulaması özel alan adında ölçülmedi. **Bu yapılmadan para alınırsa ücretli içerik açıkta.**
2. **Çocuk verisi ve AI sağlayıcısı (T-08).** Çocuğun sesli anlatışı ve doğum yılı üçüncü taraf AI'ya gidiyor; aydınlatmada sağlayıcı adı ve yurt dışı aktarım yok. Hukuk çözümü olmadan gerçek veli verisi işlenmemeli. (KVKK ve çocuk verisi kuralları hukukçuyla doğrulanmalı `[DOĞRULANMADI]`.)
3. **İade ve saklama politikası (T-02/K3).**
4. **Super Admin hijyeni:** S-1 çelişkisini kapat, S-2 herkese açık e-postayı ayır (kamu iletişim `destek@yetkin.ai`), hesap için MFA/passkey, ikinci bir kurtarma yöntemi.
5. **Seçmeli vaadi (K1):** paket metni ve kota ya içeriğe, ya vaade göre düzelsin.

**P1 – Önümüzdeki 4-6 hafta (hız):**

6. **İçerik hattını koddan çıkar.** 105 konu bugün elle yazılmış `.ts`; 75 konu daha, sonra 7. ve 8. sınıf için bu sürdürülemez. Hedef: konu içeriği için Zod şemalı JSON/MDX paketi (`packages/junior-content` veya veritabanı), doğrulayıcı CI, durum kaydı. Kod, içeriği **okur**, içerik koda **gömülmez**.
7. **Sesi yeniden kodla.** Konuşma için mono 320 kb/s/48 kHz gereksiz. 64-96 kb/s mono (veya Opus) ile 1,66 GB → ~0,35-0,5 GB; indirme süresi, R2 maliyeti ve mobil veri %80 düşer. Kalite dinleme testiyle onaylanmalı; hash manifesti yeniden üretilir.
8. **Tek sicil.** D-1 ve D-2: ders ve kurs kimliği tek yerden türesin.
9. **`archived/` bağını kes** (D-7), 25 tek seferlik betiği arşivle, `tsc`/`vitest` hızlanır, "arşiv canlı değil" ilkesi gerçek olur.
10. **Maker-checker (T-09)** ve minimum rol modeli: `SUPER_ADMIN`, `CONTENT_EDITOR`, `FINANCE`, `SUPPORT`. Rolü veritabanında/JWT claim'inde tut, `isSuperAdminActor` yine kök yetki kalsın.

**P2 – 2-3 ay:**

11. Ünite + MEB kazanım katmanı (T-19), açık hafta takvimi.
12. Migration hattı ADR (T-17).
13. Soru bankası 3 → 10+ / konu, kazanım bazlı veli raporu.
14. Junior yönetim görünümü (abonelik, rıza, iade, içerik durumu).

### 5.2 Mimari kurgu: Amiral Gemi + Sürü Dron doğru mu?

**Doğru; ama adı yanıltıcı, kenarları iki yerde çatlıyor.** `[YORUM]`

*Güçlü yanlar:*
- Tek dağıtım, tek veritabanı, tek kimlik: 1-3 kişilik ekip için doğru maliyet. Mikroservis bu aşamada kaynak israfı olurdu.
- `@yetkin/kernel` (para, katalog kimliği, v1 hop, JSON zarfı) ve `verify:boundaries`, `verify:kernel-package` ile "kernel dikeyi import etmez" kuralı otomatik denetleniyor. Bu, monolitin modüler kalmasının en kritik şartı ve yapılmış.
- Kenarda tek karar noktası (`proxy.ts`, `route-auth-map`, `decideEdgeApiAuth`), fail-closed varsayılan, `verify:api-auth` CI'da. Güvenlik yaklaşımı olgun.
- Dronları "bayrak + kayıt + yol" olarak tanımlamak (ayrı uygulama değil) doğru ve dürüst. `DRON_JUNIOR_ROOM_OPEN`, `DRON_JUNIOR_OPEN` gibi bayraklar kademeli açılış sağlıyor.

*Çatlaklar:*
1. **API-First yarım.** v1 sicili 20 hop; Junior'da yalnız ders okuma, oynatma, ilerleme, pekiştirme var. Profil, seçmeli, ödeme, anlatış (`/api/junior-pilot/*`) v1'in dışında. Native istemci veli akışını yapamaz. `ANAYASA.md` B1 "yeni yetenek önce v1 hop" diyor; Junior'ın yazma yarısı bu kuralı çiğniyor.
2. **İçerik ve kod aynı deploy'da.** Bir yazım hatasını düzeltmek için üretim dağıtımı gerekiyor. Bu "monolit" kusuru değil, **içeriği koda gömme** kusuru.
3. **Medya mimaride yok.** ANAYASA B1 "ayrı deploy, ayrı veritabanı yok" diyor ama R2, imzalı URL, medya sicili fiilen ikinci bir altyapı. `STORAGE_CONTRACT.md` 14 satır; yetersiz.
4. **Tek Super Admin, tek hata noktası.**
5. **Sınıf boyutu:** `lib/junior` 273 dosya (içerik dahil). 7-12. sınıf eklenince bu yapı ~2000+ dosyaya gider; dosya-başına-konu modeli kırılır.
6. **"Sürü Dron" kavramı.** Belge zaten "eski anlatım dili" diyor ve doğru. Pazarlama dili olarak kalsın, mühendislik dili "modüler monolit + kernel paketi + native kabuk" olsun.

*Hüküm:* Önümüzdeki 12 ay için **mimariyi değiştirme, kenarlarını sertleştir.** Mikroservise bölmek yerine (a) içeriği paketle, (b) medyayı bir "media contract" servisine/ modülüne soyutla, (c) Junior'ın bütün yazma yollarını v1 hop yap.

### 5.3 Gelecek Master Plan: 6-12 ay (Ekim 2026 → Eylül 2027)

Zaman çapası: **2027-28 ders yılı Eylül 2027'de açılır** `[YORUM]`. 7. sınıf, hedeflenirse Ağustos 2027'ye hazır olmalı.

| Dönem | Tema | Çıktılar | Çıkış kriteri |
|---|---|---|---|
| **Ekim-Kasım 2026** (0-2 ay) | **Satış kapısı** | P0 maddeleri: özel medya, çocuk verisi/AI hukuk, iade/saklama, seçmeli kararı, SA hijyeni, maker-checker | Yetişkin dışı kullanıcıyla 1 gerçek işlem + iade denemesi; `JUNIOR_CHECKOUT_OPEN` kararı |
| **Kasım 2026-Ocak 2027** (2-4 ay) | **İçerik platformu** | İçerik paketi + şema + durum kaydı, ses yeniden kodlama, tek sicil, kazanım/ünite iskeleti | Yeni konu eklemek "dosya yaz + doğrula + yayınla" akışı; kod dağıtımı gerekmez |
| **Aralık 2026-Mart 2027** | **6. sınıf tamamlama** | Hafta 21-36 (~75 konu), soru bankası 10/konu, seçmeli kararına göre kartlar | Raf Şubat duvarını aşar; mühür testi 100% |
| **Şubat-Nisan 2027** | **Native Junior (veli kabuğu)** | `apps/rail-is`te veli girişi, profil, ilerleme, rapor; v1 hop'ları (profil, seçmeli, ödeme durumu, anlatış) | Veli, mobilde çocuğunun haftalık raporunu görür |
| **Mart-Mayıs 2027** | **Çocuk kabuğu ve mağaza stratejisi** | Çocuk oynatıcı (ses + SVG + soru), çevrimdışı önbellek, mağaza kategorisi/politika incelemesi, IAP kararı | Kapalı beta (TestFlight / dahili test) |
| **Mayıs-Temmuz 2027** | **7. sınıf üretim hattı** | 6. sınıf hattıyla aynı pipeline, 5 çekirdek kart, hafta 1-36 planı | İlk 12 konu mühürlü |
| **Temmuz-Eylül 2027** | **Genişleme + mikro uygulamalar** | 7. sınıf açılışı, 8. sınıf/LGS planı; ilk mikro uygulama | Yeni ders yılı açılışı |

**Dikey mobil ve mikro-uygulama stratejisi `[YORUM]`:**

- **Tek kod tabanı, çok kabuk.** `apps/rail-is` tek Expo kod tabanı kalsın; EAS profilleriyle varyantlar (Yetkin Akademi, Yetkin Junior-Veli, Yetkin Junior-Çocuk) üretilsin. Ortak paket: `@yetkin/kernel` + yeni `@yetkin/ui` + `@yetkin/junior-content`.
- **Çocuk uygulaması ayrı mağaza kaydı** olmalı: çocuklara yönelik kategori ve politikalar (reklam yok, harici bağlantı yok, ebeveyn kapısı) ayrı ve katı kurallar getirir. Veli uygulaması ayrı. (Mağaza politikaları güncel haliyle doğrulanmalı `[DOĞRULANMADI]`.)
- **IAP kararı erken verilmeli:** dijital abonelik mobilde mağaza ödeme kuralına tabi olabilir. `OPS_RUNBOOK` "native IAP yoktur" diyor. Seçenekler: (a) mobil yalnız tüketim, satın alma web; (b) IAP + PayTR çift kasa. Hukuki ve komisyon etkisi iş modelini değiştirir, karar Ocak 2027'den önce olmalı.
- **Mikro uygulama tanımı:** "bir v1 hop kümesi + bir kabuk + bir bayrak". Aday mikro uygulamalar, bugünkü varlıklardan türeyen: (1) **Dinle ve Anlat** (tek özellik: konu dinle, kendi sözünle anlat, geri bildirim; zaten ayrı hop olabilir), (2) **Veli Raporu** (haftalık rapor + bildirim), (3) **LGS Hazırlık** (8. sınıf için konu tarama + soru bankası), (4) Akademi'nin **Ofis-AI** mikro dersleri.
- **Yeni oda = kayıt + bayrak + hop** kuralı aynen geçerli (Anayasa B1). Fark: içerik ve medya ortak platformdan gelir.

**İzleme metrikleri** (her çeyrek): ücretsiz konuyu bitiren oran, ücretsiz→ücretli dönüşüm, 7. gün tutunma, konu başı ortalama anlatış puanı, iade oranı, konu üretim süresi (gün/konu), medya maliyeti (GB, çıkış).

### 5.4 Bir sonraki somut adım

**Adım 1 – "Satış kapısı sprinti" (2-3 hafta, sırayla):**

| # | İş | Sahip | Kabul ölçütü |
|---|---|---|---|
| 1 | R2 nesnelerini `private/junior/` önekine al, kamu kopyaları kaldır, özel alan adında imza doğrula | Mühendislik + altyapı | Ücretli konunun eski kamu URL'si 403/404; imzalı URL 600 sn sonra geçersiz; test ve elle tarayıcı turu |
| 2 | Çocuk verisi / AI sağlayıcı: aydınlatma metni, açık rıza, rıza yoksa AI çağrısı yok | Hukuk + mühendislik | Aydınlatmada sağlayıcı ve aktarım yazılı; test: rıza yoksa ses gönderilmez |
| 3 | İade ve saklama politikası, hesap kapatma kuralı | Ürün + hukuk | Politika sayfası + kod |
| 4 | Seçmeli vaadi (K1): paket metni, kota, `juniorElectivePicks` tek dil | Ürün | Hiçbir metin üretilmeyen derse söz vermez |
| 5 | Super Admin hijyeni: `.env.example` ve yorum düzeltmesi, kamu e-postası ayrımı, MFA, kurtarma yöntemi | Operatör | S-1, S-2 kapalı; üretim env doğrulama listesi imzalı |
| 6 | Maker-checker: yayın ve fiyat ayrı onay (T-09) | Mühendislik | Tek kullanıcı yayın yapamaz (test) |
| 7 | Test ebeveyni ile gerçek (küçük tutarlı) işlem + iade | Operatör | PayTR canlı akışı uçtan uca, lisans yazıldı, ders açıldı, iade yapıldı |

**Adım 2 (paralel) – İçerik hattı:** §1.4 madde 1-5 ve §5.1 madde 6-8; ilk hedef Şubat 2027 duvarını aşacak 16 konu/kart sprint planı.

Bu iki adım bitmeden `JUNIOR_CHECKOUT_OPEN` açılmamalı. Bugünkü kod ve test seviyesi (366 dosya / 1752 test, `verify:prebuild` yeşil, `docs/03` §4) bu adımları taşıyacak sağlamlıkta.

---

## 6. Bu turda yapılanlar ve yapılmayanlar

**Çalıştırılan (okuma amaçlı) komutlar** `[ÖLÇÜM]`:

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-audio-manifest` | OK, 105 anahtar, yerel SHA-256 eşleşti |
| `npm run verify:junior-pilot-seals` | OK |
| `npx vitest run tests/kernel/require-super-admin.test.ts tests/kernel/junior-closed-beta.test.ts tests/kernel/junior-elective-seal-gate.test.ts tests/kernel/junior-checkout.test.ts` | 4 dosya, 35 test, geçti |
| `npx vitest run tests/kernel/junior-lesson-chain.test.ts -t "Junior üretim mührü"` | Geçti (5 çekirdek kart mühürlü, 6 seçmeli kart mühürsüz) |
| Dosya/dizin sayımı, MP3 başlık okuması (Node tek satırlık, dosya yazmadı) | §1.2 ve §3.3 |

**Yapılmayan:** Kod, şema, belge, medya, ortam değişkeni değişikliği. `.env.local`, `.vercel/`, `.cursor/mcp.json` okunmadı. Canlı Vercel/Supabase/R2/PayTR denetlenmedi. Tarayıcı turu yapılmadı. `git` durumu alınamadı. Tam test paketi ve `verify:prebuild` bu turda yeniden koşulmadı (`docs/03` §4 son ölçümü: çıkış 0).

**Dokunulmayan kilitli alanlar:** `.system_docs/AKADEMI_URETIM_ANAYASASI.md`, `lib/kernel/ai/model-roles.ts` (model haritası ve beş aşama kapısı).

**Karar bekleyenler (Super Admin / ürün):**

1. Seçmeli yol: içerik üret mi, vaatten çıkar mı (K1).
2. `ANAYASA.md` B6 "metin panelden yazılamaz" kuralı revize edilsin mi.
3. Mobil mağaza satış modeli: yalnız web ödeme mi, IAP mi.
4. 6. sınıf "tamam" tanımı: yalnız 5 çekirdek × 36 hafta mı, yoksa diğer branşlar da mı.
5. `media-bake/` ve yerel medyanın yedek/soğuk depo planı.
