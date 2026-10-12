# Tedavi Raporu: Yetkin Junior 6. Sınıf (Faz 2)

| Alan | Değer |
|---|---|
| Tarih | 9 Ekim 2026 |
| Dayanak | `docs/01_TESPIT_RAPORU_JUNIOR_6SINIF.md` (Faz 1 tespit raporu, salt okunur kaynak) |
| Kapsam | ADIM 1: T-01, T-02, T-03. ADIM 2: T-05, T-06 ve T-15, T-04. ADIM 3: T-11, T-16 ve T-18. ADIM 4: üç soru, ana plan ve karar kayıtları |
| Mod | Kod ve test değişikliği. Canlı veritabanı, Vercel ortamı ve CDN'e dokunulmadı; dağıtım yapılmadı. SQL dosyası düzeltildi ama veritabanına uygulanmadı |
| Hüküm | Canlıya %100 hazır değil. Ücretli satış açılmamalı. Kasa kapalı tutulup §7'deki koşullarla kapalı pilot kabul edilebilir |

**Kanıt etiketleri:** `[KOD]` dosya okuma ve arama ile doğrulandı. `[ÖLÇÜM]` betik veya komut çıktısı. `[DOĞRULANMADI]` canlı sistem, CDN, Vercel ortam değeri veya hukuki görüş gerektiriyor; bu turda yapılmadı.

---

## 0. Yönetici özeti

- **Kapatılanlar:** P0 bulguların kod tarafı (T-01'in API kısmı, T-02, T-03) ve P1 T-05 (quiz cevap dağılımı) ile T-06 (mühürsüz seçmeli ders paket içinde açılmıyor; vitrinde "Yakında").
- **Kısmen kapananlar:** T-01 (CDN'deki kilitli ses yolu hâlâ tahmin edilebilir), T-04 (manifest eklendi; CDN'de dosya varlığı build'de kanıtlanmıyor), T-11, T-16, T-18.
- **Kararlar alındı (§6):** K1, seçmeli vaadinden çıkarılacak (T-15). K2, ücretli medya imzalı URL ile korunacak (T-01). K3, mevcut hesap kapatma kuralı kalacak (T-02). Uygulama Faz 2'de; bu tur yalnızca "Yakında" dondurması yaptı.
- **Sonraki adım:** K1 için paket metni, kota ve fiyat kararının ürün tarafından yazılması; K2 için R2 bucket düzeninin netleşmesi. Bu iki bilgi gelince uygulama ve testler başlatılabilir. İade ve saklama süresi için ayrıca ürün ve hukuk girdisi gerekir.
- **Bu turun son doğrulamasında çıkan üç açık da kapatıldı:** ders gövdesi yolunda süzülmemiş seçim (E-1), dağılım kapısının her çağrıda yeniden hesaplanması (E-2) ve CI lint hatası (E-3).
- **Son kanıtlar:** `tsc` çıkış 0; tam test paketi 364 dosya, 1745 test, hepsi geçti; `verify:prebuild` çıkış 0; `next build` çıkış 0; `npm run lint` 0 hata (8 uyarı, mevcut).

## 1. Bulgu bazında durum

| ID | Önem | Durum | Ne değişti | Kalan iş |
|---|---|---|---|---|
| T-01 | P0 | Kısmen kapandı | `app/api/junior/lessons/[key]/route.ts`: `audioPath` yalnızca erişim `free` iken döner, kilitli derste `null`. Bu uçta anlatış gövdesi zaten yok. `[KOD]` | CDN'de kilitli dersin `{anahtar}.mp3` yolu (ısınma ve kapak da aynı desen) tahmin edilebilir; URL'yi bilen herkes indirebilir. Karar K2: imzalı URL. Mevcut R2 istemcisi (`lib/media/r2-s3.ts`, `signR2Request`) yalnızca başlık imzası üretiyor; sorgu imzalı (presign) URL yok. **Satış öncesi zorunlu.** (F2-1) |
| T-02 | P0 | Kapı kapandı; iade ve saklama açık | Kernel'e hesap kapatma kancası eklendi: `lib/kernel/identity/close-account-gate.ts` (`registerAccountCloseGuard`, `runAccountCloseGuards`). `lib/kernel/identity/close-account.ts` silme ve güncellemeden önce çağırır. Junior kancası `lib/junior/account-close-guard.ts` üç durumda reddeder: süresi dolmamış ACTIVE paket; doğum yılı dolu çocuk profili; PAID veya bir gün içindeki PENDING lisans siparişi. Kanca `app/api/(kernel)/profile/close/route.ts` içinde `registerJuniorAccountCloseGuard()` ile bağlanır. Kernel Junior'u import etmez. `[KOD]` | Karar K3: mevcut kural (önce çocuk profili kapatılır, sonra hesap; paket bitmeden kapanmaz). Junior'da iade akışı yok; saklama süresi tanımlı değil ve ayrıca karar bekliyor. Kapatma yalnızca engelliyor, silmiyor. (F2-4) |
| T-03 | P0 | Kapandı | `lib/kernel/auth/super-admin.ts` `builtInRecoveryOpen`: üretimde `SUPER_ADMIN_USER_ID` boşsa hiçbir hesap süper admin olmaz, yerleşik kutu dahil. Doluysa yerleşik kutu yalnızca bu UUID ile eşleşince açılır. `scripts/ops-runtime-readiness-lib.ts` `superAdminUuidProductionBlocks`, değer boşken `verify:prebuild` ve `npm run build` zincirini durdurur (üretim tespiti `NODE_ENV` veya `VERCEL_ENV`). `lib/academy/access.ts` ve `.system_docs/ops/ops-db.md` yorumları hizalandı. `[KOD]` | Vercel Production'a `SUPER_ADMIN_USER_ID` girilmeli. Ortamdaki değer bu turda görülmedi `[DOĞRULANMADI]`. |
| T-04 | P1 | Kısmen kapandı | `lib/junior/audio-manifest.generated.ts`: 105 çekirdek ders için SHA-256 ve bayt. `juniorBakedAudioSealed` manifest girdisi yoksa kapıyı kapatır. `scripts/verify-junior-audio-manifest.ts` üç mod: `--write`, `--check` (`verify:prebuild` içinde), `--cdn` (dağıtım sonrası HEAD denetimi). `[KOD]` | Ses klasörü o ortamda varsa SHA-256 denetlenir. Vercel'de klasör yok (`.vercelignore`, `public/media/junior/audio/` dizinini yüklemeden dışlıyor); production build dosya varlığını kanıtlayamaz. `--cdn` hiçbir CI akışında değil (`ci.yml`, `nightly.yml`). (F2-2) |
| T-05 | P1 | Kapandı | `lib/junior/quiz/answer-shuffle.ts`: tohum FNV-1a (`lessonKey` ve `questionId` birleşimi), PRNG mulberry32, Fisher-Yates. Puanlama, açık görünüm ve mühür aynı `juniorTopicEndQuestions` kaynağını okur; kaynak paket değişmedi. Dağılım kapısı `juniorQuizDistributionOk`: her şık en fazla %40, her konuda en az iki farklı doğru konum. `[KOD]` `[ÖLÇÜM]` | Kapı global: bir konu bozulursa bütün dersler "hazırlanıyor" olur. Fail-closed, ama operasyonel risk. (F3-8) |
| T-06 | P1 | Kapandı (dondurma) | Seçmeli yalnızca mühürlüyse ücretli pakette açılır. `juniorElectiveOpenable` (seçmeli, taslak değil, mühürlü). `juniorPaidElectives` tüm ödeme yollarında: `enter.ts`, `service.ts`, `app/junior/page.tsx`, `load.ts` (E-1). Seçim kaydı (`checkout.ts`, `saveJuniorElectives`) mühürsüz yeni dersi 400 ile reddeder. Vitrinde "Yakında" etiketi ve devre dışı düğme (`components/junior/elective-quota-modal.tsx`). `[KOD]` | Seçilebilir 5 seçmelinin hiçbiri mühürlü değil (§3.3). Önceden seçilmiş mühürsüz dersler kayıtlı kalır, paket açmaz. Canlıda kaç kayıt olduğu bilinmiyor `[DOĞRULANMADI]`. |
| T-15 | P1 | Karar alındı (K1); uygulama bekliyor | "Yakında" dondurması T-15'in geçici kod hâli. | Karar K1: seçmeli vaadinden çıkarılacak. Tasarım çelişkisi (taslak bandı 5 dakika; seçmelide kaset tanımlı değil ama ısınma istiyor) artık uygulanmayacak; paket metni, kota (`JUNIOR_ELECTIVE_QUOTA` = 3) ve fiyat ürün tarafından yeniden yazılmalı. (F2-3) |
| T-11 | P2 | Kısmen kapandı | `supabase/migrations/20261005160000_junior_yearly_price_seed.sql`: çakışmada `is_active = price_catalog_entries.is_active`; operatörün yayın kararı korunur. Test: `junior-price-seed-sql.test.ts` (3). Dosya değişti, veritabanına uygulanmadı. | Sınır ve açıklama alanları hâlâ tohumdan yazılır (kod sahipliği kararı). Dosya, bir sonraki `ops:migrate` ile uygulanır. |
| T-16 | P2 | Kısmen kapandı | `scripts/junior-quiz-live-guard.ts`: canlı quiz klasörüne yazım yalnızca `--allow-live-overwrite` bayrağı ile `JUNIOR_QUIZ_ALLOW_LIVE_OVERWRITE=1` birlikteyken. Beş üretici (`scripts/generate-junior-{mat,fen,turkce,sosyal,ing}-quiz-archive.ts`) `mkdirSync`'den önce bu kapıyı çağırır. Test: `junior-quiz-live-guard.test.ts` (7). | Rapor "41 yetim betik" dedi; ölçüm katı kriterle 31, gevşek kriterle 25 buldu. Silme yapılmadı. (F3-3) |
| T-18 | P2 | Kısmen kapandı | İki eski Grok raporu `docs/archive/` altına taşındı, içerik korundu. Bu turdan sonra `docs/` kökünde yalnızca tespit raporu ve bu rapor var. | Rapordaki "docs/ içinde 19 dosya" sayısı yeniden üretilemedi; listelenen 16 dosya adının hiçbiri depoda bulunamadı. Yönetişim tekrarı açık. (F3-4) |

**Bu turun kapsamı dışında kalan ve kapatılmayan:** T-07, T-08, T-09 (P1), T-10, T-12, T-13, T-14, T-17, T-19, T-20. T-07, T-08 ve T-09 satış öncesi kapanmalı. T-14 API-first açığı Faz 2'de (F2-9).

## 2. Doğrulama sırasında bulunan ve kapatılan ek açıklar

**E-1. Ders gövdesi süzülmeden hesaplanıyordu (T-06 ikinci yol).** `lib/junior/load.ts` içindeki `loadJuniorLessonPage`, ders gövdesini `readJuniorLesson` ile ham `selectedElectives` üzerinden hesaplıyordu. Ders sayfası bu döndürülen gövdeyi kullanmıyor; gövdeyi süzülmüş `juniorLessonGate().renderPlan` ile yeniden hesaplıyor. Yani bugün sızıntı yok. Ama fonksiyon mühürsüz seçmelinin gövdesini döndürüyordu ve T-06'nın kapatmak istediği yolu açık bırakıyordu. Düzeltme: `juniorPaidElectives(...)` ile süzüldü. Kilit: `junior-elective-seal-gate.test.ts` içinde davranış testi (süzülmüş plan + mühürsüz ders = kilitli) ve kaynak taraması. Kök neden: `juniorLessonAccessForPlan` girdiyi süzmez; süzme çağıranın sorumluluğu (F2-8).

**E-2. Dağılım kapısı her çağrıda yeniden hesaplanıyordu.** `juniorQuizDistributionOk` her mühür kontrolünde 315 soruyu yeniden tarıyordu. Veri sabit olduğu için modül yüklenirken bir kez hesaplanıyor (`lib/junior/quiz/index.ts`). Davranış aynı; `junior-quiz-answer-shuffle.test.ts` geçiyor.

**E-3. CI lint kapısı kırıktı.** `npm run lint` (CI'da `ci.yml` çalıştırır) `components/junior/lesson-covers.tsx` satır 303'teki SVG metnindeki tek tırnak nedeniyle 1 hata veriyordu (`react/no-unescaped-entities`). Düzeltme: `o&apos;clock`; görsel çıktı değişmez. Dosya bu turun kapsamında değildi; hatanın hangi değişiklikle girdiği bu turda izlenemedi.

**E-4. Fon yatağı manifest dışında.** `public/media/junior/audio/` içinde 106 MP3 var: 105 ders ve `bgm-light-learning.mp3`. Fon yatağı `lib/junior/voice.ts` içindeki `JUNIOR_BGM_PUBLIC_PATH` ile kullanılıyor; yetim değil. Manifest yalnızca 105 ders anahtarını kapsar, bu doğru. Ama fon yatağının bütünlüğünü hiçbir kapı denetlemiyor (F3-9). Bu klasörde yalnızca dosya adları ve sayısı kontrol edildi, içerik okunmadı.

## 3. Ölçümler

### 3.1 Quiz cevap dağılımı (T-05)

| Şık | Kaynak paket (karıştırma öncesi) | Yayın sırası (karıştırma sonrası) |
|---|---|---|
| A | 304 (%96,5) | 77 (%24,4) |
| B | 8 (%2,5) | 90 (%28,6) |
| C | 3 (%1,0) | 71 (%22,5) |
| D | 0 (%0) | 77 (%24,4) |

- "Hep A" ile tam puan alınabilen konu sayısı: 96 → 0. Kapı, her konuda en az iki farklı doğru konumu zorunlu kılıyor.
- Karıştırma sonrası kaynak pakete göre içerik uyuşmazlığı: 0 `[ÖLÇÜM]`.

### 3.2 Ses dosyaları (T-04)

| Kontrol | Nerede çalışır | Sonuç |
|---|---|---|
| `--check` (anahtar ve manifest) | `verify:prebuild` (CI ve Vercel build) | 105 / 105 anahtar `[ÖLÇÜM]` |
| `--check` (dosya SHA-256 ve bayt) | Klasörün bulunduğu ortam (yerel) | Yerelde 105 / 105 eşleşti `[ÖLÇÜM]` |
| `--check` (dosya) | Vercel build (klasör yüklenmez) | Atlanır `[KOD]` |
| `--cdn` (HEAD, durum ve boyut) | Dağıtım sonrası; hiçbir CI akışına bağlı değil | Çalıştırılmadı `[DOĞRULANMADI]` |

CI checkout'unda ses klasörünün bulunup bulunmadığı `[DOĞRULANMADI]`; depo izleme durumu bu turda kontrol edilemedi.

### 3.3 Seçmeli durumu (T-06, T-15)

| Kalem | Değer |
|---|---|
| Seçmeli kurs (katalog) | 6: `jr_06_alm`, `jr_06_arp`, `jr_06_fra`, `jr_06_kod`, `jr_06_siyer`, `jr_06_ing` |
| Taslak (ücretli pakete girmez) | 1: `jr_06_ing` |
| Seçilebilir | 5 |
| Mühürlü | 0 |
| Seçmeli ders (kurs başına 2 ders) | 12; hiçbirinin fırınlanmış sesi yok |
| Çekirdek fırınlanmış ses | 105 (mat 25, fen 20, türkçe 20, sosyal 20, ing_main 20) |

## 4. Doğrulama

| Kontrol | Komut | Sonuç |
|---|---|---|
| Tip denetimi | `npx tsc --noEmit` | Çıkış 0 |
| Hedefli Junior testleri | `npx vitest run` (9 Junior dosyası) | 68 / 68 |
| Tam test paketi | `npx vitest run` | 364 dosya, 1745 / 1745 |
| Lint (CI ile aynı) | `npm run lint` | 0 hata, 8 uyarı (mevcut `<img>` ve hook uyarıları) |
| Sınır denetimi | `npm run verify:boundaries` | OK |
| Build öncesi zincir | `npm run verify:prebuild` | Çıkış 0 |
| Üretim derlemesi | `npx next build` | Çıkış 0; Junior rotaları derlendi |

Yapılmayanlar:
- `npm run verify:junior-audio-cdn`: CDN yok `[DOĞRULANMADI]`.
- `npm run verify:nightly` ve `npm run test:pg`: nightly ve Postgres paketleri; bu turda çalıştırılmadı.
- Canlı PayTR akışı, Vercel ortam değerleri, canlı Supabase migrasyonu, tarayıcıda manuel ders akışı `[DOĞRULANMADI]`.
- Yetişkin Akademi kapısı (`assertAcademyProductionSeal`) değiştirilmedi.

## 5. Açık riskler (öncelik sırası)

1. **Kilitli ders medyası tahmin edilebilir (T-01).** Ücretli içerik korumasız. K2 (imzalı URL) kararlaştı, henüz uygulanmadı. Satış öncesi.
2. **Seçmeli vaadi içerikle çelişiyor (T-15).** Paket 3 seçmeli sayıyor; seçilebilir 5 seçmelinin hiçbiri açılamıyor. K1 (vaatten çıkarma) kararlaştı, metinler henüz değişmedi. Satış öncesi.
3. **İade ve saklama süresi tanımsız (T-02).** K3 ile kapatma kuralı netleşti; iade ve saklama süresi için ürün ve hukuk girdisi bekleniyor. Satış öncesi.
4. **Çocuk verisi ve üçüncü taraf AI (T-08).** Çocuğun sesli anlatışı ve doğum yılı üçüncü taraf AI sağlayıcısına gidiyor; aydınlatmada sağlayıcı adı ve yurt dışı aktarım yok. Kayıt kapısı ücretli kapıya bağlı (`canAct`), ama hukuki çözüm olmadan gerçek veli verisi işlenmemeli. Satış öncesi, hukuk.
5. **Yayın ve fiyat tek adımda (T-09).** "Çift imza" kodda yok; kurs yayını `is_active` değerini de değiştiriyor. Satış öncesi.
6. **Süre bandı dolguyla tutturuluyor (T-07).** Rapora göre yazılı anlatış ortalama 4,26 dakika; 101 / 105 ders bandın altında. Ürün vaadi bu bantla yazıldıysa yanıltıcı. Satış öncesi.
7. **CDN varlığı build'de doğrulanmıyor (T-04).** Post-deploy denetimi hiçbir CI akışına bağlı değil. Satış öncesi.
8. **Kayıtlı mühürsüz seçmeliler (T-06).** Paket açmıyor; kullanıcıya nasıl açıklanacağı ve telafi kararı yok. K1 uygulanırken bu kayıtların ne olacağı ayrıca kararlaştırılmalı.
9. **Dağılım kapısı global (E-2).** Tek bozuk konu bütün dersleri "hazırlanıyor" yapar. Operasyonel.
10. **`SUPER_ADMIN_USER_ID` ön koşulu (T-03).** Production değeri boşsa build düşer. Dağıtım ön koşulu.
11. **API-first açığı (T-14).** Native istemci ders oynatamıyor; 7 `junior-pilot` rotası v1 sözleşmesinin dışında. Faz 2.

## 6. Alınan kararlar ve uygulama notları

**K1. Seçmeli yolu (T-15, T-06). Karar: seçmeli vaadinden çıkarılacak.**
- Kasa çekirdek 105 ders ile satılır; seçmeli Faz 3'te yeniden tasarlanır.
- Paket metni, kota (`JUNIOR_ELECTIVE_QUOTA` = 3) ve fiyat ürün tarafından yeniden yazılmalı. Kod bu metinlere bağlı olduğu için değişiklik F2-3'te yapılır.
- Seçilmeyen alternatif: bir seçmeliyi (aday `jr_06_alm`) baştan sona mühürlemek. Büyük içerik işi; Faz 3'e kalır.

**K2. Ücretli medya koruması (T-01). Karar: imzalı URL.**
- Kısa ömürlü imzalı URL; sunucu paket kontrolünden sonra üretir.
- Teknik notlar: mevcut R2 istemcisi yalnızca başlık imzası üretiyor (`signR2Request`); sorgu imzalı (presign) URL için ekleme gerekiyor. R2 imzalı URL'leri S3 API uç noktası üzerinden üretilir; kamu özel alan adında (`NEXT_PUBLIC_MEDIA_BASE_URL`) imzanın doğrulanıp doğrulanmadığı `[DOĞRULANMADI]`.
- Sonuç: kilitli medya ayrı ve özel bir prefix'e (ya da bucket'a) taşınmalı; ücretsiz dersler kamu alanında kalabilir.
- Seçilmeyen alternatifler: kimlikli teslim (Vercel fonksiyonu üzerinden yönlendirme) ve şimdilik açık bırakmak.

**K3. Hesap kapatma ve çocuk profili (T-02). Karar: mevcut kural.**
- Önce çocuk profili kapatılır, sonra hesap kapatılır; paket bitmeden hesap kapanmaz. Kod değişmez.
- Seçilmeyen alternatif: hesap kapanınca otomatik silme. Bu yol için saklama süresi ve iade kuralı ayrıca tanımlanmalı (F2-4).

**Sorulmayan açık kararlar:** kayıtlı mühürsüz seçim sahiplerinin telafisi, ücretsiz önizlemede mühürsüz seçmelinin görünürlüğü, CDN yükleme ve deploy sırası, iade ve saklama süresi.

## 7. Soru 1: "Sen olsaydın ne yapardın? Canlıya %100 hazır mı?"

**Cevap: Hayır.** Ücretli satışı açmazdım. Kapalı pilot için bile aşağıdaki beş koşulun tamamı sağlanmadan kapıyı açmazdım:

1. `SUPER_ADMIN_USER_ID` Vercel Production'da dolu ve doğrulanmış (T-03). Build bunu zaten zorunlu tutuyor.
2. `NEXT_PUBLIC_MEDIA_BASE_URL` https CDN'e 105 ders sesi, kapaklar ve ısınma objeleri yüklü; `verify:junior-audio-cdn` deploy sonrası yeşil (T-04). Build bunu şu an kanıtlamıyor.
3. `JUNIOR_CHECKOUT_OPEN` tanımlı değil (kasa kapalı). Kod varsayılanı bu.
4. Dinle-Anlat kaydı ve çocuk verisi yalnızca iç ekip ve davetli test hesaplarında (T-08'in hukuki çözümü öncesi).
5. Seçmeliler vitrinde "Yakında" olarak görünüyor ve pakette açılmıyor; K1 gereği seçmeli vaadi metinlerden kaldırılmalı (F2-3).

Ücretli satış için ek olarak zorunlu: T-01 imzalı URL koruması (K2), T-02 iade ve saklama politikası, T-07 süre dolgusu, T-08 hukuki çözüm, T-09 yayın onayı.

Bu tur bana bir şey gösterdi: "çağıran süzsün" deseni erişim kararı için kırılgan. Ben de "süzülmüş girdi" iddiasını önce kendi kodlarım için yazmıştım; `load.ts` taranana kadar çağrı noktalarının tamamını sayıp doğrulamamıştım. E-1 bunu yakaladı. Bir sonraki adımda her güvenlik iddiasını çağrı noktası taramasıyla kanıtlardım; yorumlara ve hafızaya güvenmezdim.

## 8. Soru 2: "Platform kurgusu doğru mu? Shared Kernel / API-First Core uyumu?"

**Cevap: Yön doğru, uygulama yarım.**

Doğru olanlar:
- Mimari terminoloji `.system_docs/ANAYASA.md` B1 ile uyumlu: Pragmatik Monolit (Next.js gövdesi, `app/` ve `lib/`), Shared Kernel (`@yetkin/kernel`, `packages/kernel`), Tek Native İstemci (`apps/rail-is`).
- Sınır denetimi geçiyor: kernel dikey modüllere bağımlı değil, UI Prisma'ya erişmiyor, oda ile oda motoru ayrı, katalog Super Admin tutarını koruyor (`verify:boundaries`).
- Hesap kapatma kuralı kernel'e kanca (registry) ile bağlandı. Kernel Junior'u bilmiyor; bağlama `app/api/(kernel)/profile/close/route.ts` gibi bir composition root'ta yapılıyor. Bu, `verify:boundaries`'in istediği yön ve PayTR webhook deseniyle aynı.
- Sözleşme artefaktı var (`lib/kernel/http/openapi-v1.json`, `v1-contract.ts`) ve `verify:v1-contract-artifacts` build öncesi zincirinde.

Eksik ya da yanlış olanlar:
- **API-first Core yok, yalnızca kart API'si var.** v1 OpenAPI'da tek Junior ucu var: `/api/v1/junior/lessons/{key}`, kart döner. Profil, seçmeli, alıştırma, quiz, Dinle-Anlat ve ödeme 7 rotada (`app/api/junior-pilot/*`) ve v1 dışında. Native istemci (`apps/rail-is/src/api/hops.ts`) yalnızca tek hop kullanıyor; ders oynatamıyor (T-14).
- **Erişim kararı dağınık.** Süzgeç `enter.ts`, `service.ts`, `app/junior/page.tsx`, `load.ts` ve checkout'ta tekrar ediyor. `juniorLessonAccessForPlan` ham girdi kabul ediyor. E-1 bunun sonucuydu.
- **İki migrasyon hattı.** `prisma/migrations` (43 dizin) ve `supabase/migrations` (16 SQL). Hangisinin yetkili olduğu yazılı değil (T-17, ölçüldü). Fiyat tohumu SQL'i her `ops:migrate` çalıştırmasında yeniden uygulanıyor; checksum yok.

Hüküm: Shared Kernel sınırı iyi. "API-first" olarak pazarlanmamalı; v1 kapsamı Faz 2'de genişletilmeli (F2-9), erişim kararı tek girişe indirilmeli (F2-8).

## 9. Soru 3: "Gelecek MASTER PLAN önerisi"

İlke: Önce satış kapısı (Faz 2), sonra ölçek ve sahiplik (Faz 3). Faz 2'de F2-1'den F2-6'ya kadar olan işler kasa açılmadan zorunlu. Boyut tahmini: S ≈ bir iş günü, M ≈ birkaç gün, L ≈ bir haftadan uzun; içerik işleri hariç.

### Faz 2: Satış kapısı

| No | İş | T-ID | Kabul kriteri | Sahip | Boyut |
|---|---|---|---|---|---|
| F2-1 | Ücretli medya teslimi (K2 kararı: imzalı URL): kilitli dersin ses, ısınma ve kapak dosyaları özel prefix'ten, sorgu imzalı ve kısa ömürlü URL ile gelir; R2 presign eklenir | T-01 | Anonim istek kilitli dersin medyasını alamaz (403/404); ücretli oturum alır; ücretsiz ders açık kalır; test eklenir | Mühendislik, altyapı | M |
| F2-2 | CDN denetimi: `verify:junior-audio-cdn` deploy sonrası zorunlu adım (CI veya nightly) | T-04 | Eksik veya yanlış boyutlu objede adım kırmızı; sonuç loglanır | Operasyon | S |
| F2-3 | Seçmeli (K1 kararı: vaatten çıkar): paket metni, kota ve fiyat ürün tarafından yazılır; kod ve testler buna göre güncellenir | T-15, T-06 | Kasa metni, katalog ve `juniorElectivePicks` aynı dili kullanır (test). Seçmeli vaadi hiçbir paket metninde yok | Ürün, içerik, mühendislik | S |
| F2-4 | İade ve saklama politikası (K3 kapatma kuralını korur): iade akışı (PayTR), saklama süresi, silme takvimi, veri envanteri | T-02 | Yazılı politika; iade senaryosu testi (paket ve profil durumu); saklama süresi kodda sabit | Ürün, hukuk, muhasebe | M |
| F2-5 | Çocuk verisi ve AI sağlayıcısı: aydınlatma (sağlayıcı adı, yurt dışı aktarım), açık rıza; rıza yoksa AI çağrısı yok | T-08 | Aydınlatma metni sağlayıcıyı ve aktarımı yazar; test: rıza yoksa anlatış kaydı ve ses gönderimi yapılmaz | Hukuk, mühendislik | M |
| F2-6 | Yayın ve fiyat iki kişilik onayı (maker-checker); `is_active` yayın çağrısından ayrı | T-09, T-11 | Tek kullanıcıyla yayın reddedilir (test); denetim izi; tohum `is_active`'i değiştirmez (mevcut test) | Operasyon | M |
| F2-7 | Süre bandı: dolgu satırlarını kaldır ya da vaadi gerçek süreye çek | T-07 | Dolgu oranı 0 (ölçüm betiği); ders bandı yazılı kararla hizalı | İçerik | S (vaat) / L (içerik) |
| F2-8 | Erişim kararı tek giriş: `juniorLessonAccessForPlan` yalnızca "süzülmüş plan" tip markasıyla çağrılır | E-1 | Süzülmemiş girdi tsc hatası verir; mevcut süzgeç testleri yeşil | Mühendislik | S |
| F2-9 | Native istemciye ders gövdesi ve ilerleme (v1 kapsamı) | T-14 | `openapi-v1.json` ve `verify:v1-contract-artifacts` yeşil; `apps/rail-is` bir dersi açıp tamamlar | Mühendislik | L |
| F2-10 | Canlı ön koşul listesi: `SUPER_ADMIN_USER_ID`, `NEXT_PUBLIC_MEDIA_BASE_URL`, `JUNIOR_CHECKOUT_OPEN` kapalılığı, CDN objeleri, migrasyon durumu | T-03, T-04 | `ops:runtime-readiness` env kalemlerini doğrular; CDN ve migrasyon için runbook kontrol listesi | Operasyon | S |

### Faz 3: Ölçek ve sahiplik

| No | İş | T-ID | Kabul kriteri | Boyut |
|---|---|---|---|---|
| F3-1 | Kota ve vitrin tek kaynak; vitrin önbelleği (profil başına, sürüm anahtarlı) | T-12, T-13 | Kota tek sabit; vitrin hesabı ~64 ms'den ölçümle düşer | M |
| F3-2 | Migrasyon hattı kararı (ADR): tek yetkili hat, diğeri salt okunur | T-17 | CI tek hattı doğrular; karar belgesi | L (karar S) |
| F3-3 | Yetim betik temizliği; beş quiz üreticisinin ortak çekirdeğe birleşmesi | T-16 | Yetim sayısı ölçüm betiğinde 0; üreticiler ortak modül kullanır | M |
| F3-4 | Yönetişim tek kaynak: tekrar eden kural metinleri tek evde; rapor sayıları betikle üretilir | T-18 | Tekrarlayan kural cümlesi sayısı 0 (grep) | S |
| F3-5 | Ünite katmanı, MEB kazanım kodu; `jr_06_ing` ile `jr_06_ing_main` adlandırma çakışması | T-19 | Her ders bir kazanım koduna bağlı; slug çakışma testi | L (içerik) |
| F3-6 | Freelancer kapalılığı tek kaynak | T-10 | Kapalılık tek fonksiyon; kaynak sayısı 1 | S |
| F3-7 | Terminoloji ve şişkin dosyalar | T-20 | Eski terminoloji 0 (grep); büyük dosyalar bölünür | S |
| F3-8 | Quiz dağılım kapısını konu bazlı yap | E-2, T-05 | Tek bozuk konu yalnız o dersi "hazırlanıyor" yapar (test) | S |
| F3-9 | Medya manifestini birleştir: ses, kapak, ısınma, fon yatağı | T-04, E-4 | Manifest dışı medya dosyası kalmaz | S-M |

### Karar durumu ve sıra

K1, K2 ve K3 alındı. Sıradaki işler: F2-3 (paket metni, kota ve fiyat; ürün metni gerekir), F2-1 (R2 presign ve özel prefix; bucket düzeni gerekir), F2-4 (iade ve saklama süresi; ürün ve hukuk girdisi gerekir). F2-5 hukuk girdisi ister. Bu işler ürün ve altyapı bilgisi olmadan tam uygulanamaz.

## 10. Değişen dosyalar

- **Uygulama:** `app/api/junior/lessons/[key]/route.ts`, `app/api/(kernel)/profile/close/route.ts`, `app/junior/page.tsx`, `app/junior/checkout/page.tsx`, `components/junior/elective-quota-modal.tsx`, `components/junior/lesson-covers.tsx` (E-3)
- **Kernel:** `lib/kernel/auth/super-admin.ts`, `lib/kernel/identity/close-account-gate.ts`, `lib/kernel/identity/close-account.ts`
- **Junior:** `lib/junior/account-close-guard.ts` (yeni), `lib/junior/register-account-close-guard.ts` (yeni), `lib/junior/audio-manifest.ts` (yeni), `lib/junior/audio-manifest.generated.ts` (yeni, üretilmiş), `lib/junior/production-seal.ts`, `lib/junior/quiz/answer-shuffle.ts` (yeni), `lib/junior/quiz/index.ts`, `lib/junior/limits.ts`, `lib/junior/catalog.ts`, `lib/junior/enter.ts`, `lib/junior/service.ts`, `lib/junior/checkout.ts`, `lib/junior/load.ts`
- **Scripts:** `scripts/ops-runtime-readiness-lib.ts`, `scripts/verify-junior-audio-manifest.ts` (yeni), `scripts/junior-quiz-live-guard.ts` (yeni), `scripts/generate-junior-{mat,fen,turkce,sosyal,ing}-quiz-archive.ts` (beş dosya)
- **SQL:** `supabase/migrations/20261005160000_junior_yearly_price_seed.sql` (veritabanına uygulanmadı)
- **Paket:** `package.json` (`generate:junior-audio-manifest`, `verify:junior-audio-manifest`, `verify:junior-audio-cdn`; `verify:prebuild` sonuna manifest denetimi)
- **Testler, yeni (49 test):** `junior-audio-manifest` (9), `junior-quiz-answer-shuffle` (11), `junior-elective-seal-gate` (8), `junior-price-seed-sql` (3), `junior-quiz-live-guard` (7), `junior-account-close-guard` (8), `junior-lesson-route-audio` (3)
- **Testler, güncellenen:** `junior-checkout.test.ts`, `junior-faz2-pilot.test.ts`, `require-super-admin.test.ts`, `runtime-readiness.test.ts`
- **Dokümantasyon:** `lib/academy/access.ts` (yorum), `.system_docs/ops/ops-db.md` (T-03 ile ilgili adımlar), `docs/archive/` (iki eski Grok raporu), bu rapor

`AGENTS.md`, `.cursorrules` ve Next.js uyarı bloğu değiştirilmedi.
