# Tedavi Raporu — Junior 6. sınıf, tek kaynak ve yetki

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Girdi | `docs/TESPIT_RAPORU.md` |
| Ölçüm | Çalışma alanı kodu, `export:junior-content`, `verify:junior-content`, `verify:junior-speech`, odaklı Vitest |
| Kapsam dışı | `.env`, Supabase kullanıcı satırı, canlı Vercel değişkeni, ses fırını, kasa (`JUNIOR_CHECKOUT_OPEN`), `docs/Yeni klasör` |

Canlı mimari ad **Pragmatik Monolit + `@yetkin/kernel` + tek native istemci (`apps/rail-is`)** dir. Karşılık tablosunun evi `.system_docs/ANAYASA.md` B1 dir.

2. dalga 8. bölümde, 3. dalga 9. bölümde kayıtlıdır. İngilizce altı uydunun ses fırını 12. bölümde, Sosyal Bilgiler altı ders 13. bölümde, Matematik on üç kazanım 14. bölümde. 1–7. bölümler sabahki hop, yetki ve matematik tedavisinin kaydıdır. Güncel yazarlık **111**, kab sayısı **13**, yayın rafı **93** tür.

## Hüküm

Ders hop'u artık oda bayrağından 410 almaz; `/junior` sayfası ile aynı katalogu basar. Vitrin anahtarı `jr_06_mat-5` dir. Sosyal Bilgiler çekirdek raftadır. İçerik yazımı TypeScript'tedir; JSON tek yönlü ihracattır. Eski quiz üreticileri silinmiş dersi diriltemez.

`yapinet360@gmail.com` kodu değiştirilmedi. Geliştirmede doğrulanmış yerleşik kutu Super Admin'dir. Üretimde aynı kutu yalnız doğrulanmış e-posta ve `SUPER_ADMIN_USER_ID` eşleşmesiyle açılır. Boş üretim UUID kimseyi açmaz.

On üç matematik kazanımı (`MAT.6.1.6`–`MAT.6.6.1`, `jr_06_mat-26`…`jr_06_mat-38`) senaryo, anlatı ve quiz olarak yazıldı ve JSON'a aktarıldı. Sesleri fırınlanmadığı için rafta yoktur. Türkçe'nin 204 saati yazılı uydulardadır; tema kabının saati 0'dır. İngilizce'nin yedi teması 2. dalgada uydudadır; üç eski saat kabı sandık olarak saat 0'da durur. Ayrıntı 8. bölümdedir.

Yayın rafı 68 derstir. Yazarlık kadrosu 81 senaryodur. Kab sayısı 37'dir. Takvim 41 haftadır.

---

## 1. Canlı hop ve vitrin

### 1.1 410

Tespit iki yüzeyi ayırmıştı. `/junior` sayfası oda bayrağıyla 410 olmuyordu. `GET /api/v1/junior/lessons/*` bayrak `closed|0|false` iken 410 dönüyordu. Hop, `canonicalApiPathname` ile `/api/junior/lessons/*` olur.

`lib/kernel/security/edge-api-auth.ts` içinde `isJuniorLessonCatalogApi` eklendi. Yol `/api/junior/lessons` veya onun altıysa junior oda kilidi bu hop'u dondurmaz. Profil masası ve kasa (`/api/junior-pilot/*`) aynı kapıda durur. `DRON_JUNIOR_ROOM_OPEN=0` hâlâ `isKapali("junior")` üretir; ders listesini ve ders kartını 410 yapmaz.

Boş bayrak çalışma alanında zaten açıktı. Canlı 410, kapalı bayrak veya eski dağıtımla açıklanır. Bu kod bir sonraki dağıtımda hop'u sayfa ile hizalar. Ortak bir öldürme anahtarı (sayfa ve hop birlikte kapansın) bu turda kurulmadı.

Kasa kilitli kaldı. `JUNIOR_CHECKOUT_OPEN` açılmadı.

Doğrulama: `tests/kernel/junior-closed-beta.test.ts`. Bayrak `closed` ve tanımsızken `isFrozenRoomApi("/api/junior/lessons/jr_06_mat-5")` ve `/api/v1/...` karşılığı yanlıştır.

### 1.2 Vitrin anahtarları

`lib/junior/lesson-face.ts` ve `juniorShelvesForGrade` bu turdan önce `jr_06_mat-5` ile açılıyor ve Sosyal Bilgiler'i çekirdek rafa koyuyordu. Canlı sitedeki `jr_06_mat-1` ve eksik sosyal kart, çalışma alanının gerisinde kalan dağıtımdır.

Bu turda eski anahtarın sözleşmesi ve varsayılanı güncellendi:

| Dosya | Değişiklik |
|---|---|
| `lib/kernel/http/v1-contract.ts` | Dört junior örnek anahtar `jr_06_mat-5` |
| `apps/rail-is/src/screens/JuniorLessonScreen.tsx` | Varsayılan ders `jr_06_mat-5` |
| `components/junior/player/scene-ui.tsx` | `jr_06_mat-1` üs sahnesi dalı silindi |
| `lib/junior/scene-media.ts` | `jr_06_mat-1` üs levhası silindi |

`tests/kernel/junior-meb-calendar.test.ts` sosyal kartın çekirdek rafta olduğunu ve ilk matematik dersinin `jr_06_mat-5` olduğunu kilitler. `jr_06_mat-26` bu rafta yoktur.

`jr_06_mat-1` emekli anahtar olarak bazı testlerde durur: yolu bilinmeyen ders sayılır, erişim `missing` kalır.

---

## 2. Tek doğruluk kaynağı ve temizlik

### 2.1 Yazım yönü

| Katman | Rol |
|---|---|
| `lib/junior/content/*.ts` ve `lib/junior/quiz/**/*.ts` | Yazarın evi |
| `scripts/export-junior-content.ts` | Tek yön: TypeScript → JSON |
| `packages/junior-content/topics/*.json` ve `quiz/*.json` | Çalışma zamanı okuması |
| `lib/junior/content-source.ts` | JSON'u okur. El ile JSON düzenlemesi bir sonraki ihracatta silinir |

`.system_docs/ANAYASA.md` B6 tek ev cümlesi bu yöne çekildi. Envanter sayısı belgede sabitlenmedi; ev kodda kaldı.

Vitrin kesişimi `content-source.ts` içindedir. `authoredKeys` senaryo JSON'unun tamamıdır. `sealedKeys` bunların sesi fırınlanmış olanlarıdır (`juniorLessonHasBakedAudio`). `juniorSealedCourseLessons` ve `juniorSealedQuizPacks` yalnız bu kesişimi verir. Senaryo okuyucusu fırınlanmamış metni defter için döndürebilir; public raf ve ders yüzü katalog anahtarını kullanır.

`packages/junior-content/src/sealed-roster.ts` yazılmış senaryo listesidir. Matematik numaralarına 26–38 eklendi. Kadros 81.

İhracın sabit «50 kab» fırlatması kalktı. Kab sayısı plandaki `plannedShellCount()` ile doğrulanır. Son başarılı ihrac: **81 senaryo (kadros 81), 81 quiz, 37 kab, takvim 41 hafta.** `verify:junior-content` aynı sayıları doğruladı. `verify:junior-speech`: **68 yayın dersi fırına hazır, yazarlık 81.**

### 2.2 Pasif üreticiler

`scripts/junior-quiz-archive-write.ts` yazmadan önce iki kapı uygular:

- Paket numarası `JUNIOR_SEALED_ROSTER` dışındaysa fırlatır. Silinmiş ders dirilmez.
- Hedef `index.ts` içinde `juniorSealedQuizPacks` varsa adaptörün üzerine yazmaz.

`scripts/generate-junior-mat-quiz-archive.ts` bu turda çalıştırıldı ve yazmadan durdu: `Quiz üretici kadro dışı numara yazamaz (mat: 1, 2, 3, 4, 8, 9, 10, 16, 20, 23, 24, 25).` Fen, Türkçe, Sosyal ve İngilizce üreticilerinin başlığı aynı pasif sözleşmeye çekildi. `package.json` betikleri durur; çalışınca fırlatırlar.

### 2.3 Silinen tek seferlik dosyalar

| Dosya | Neden |
|---|---|
| `scripts/_author-mat-26-38.ts` | 26–38 dosyalarını yeniden yazar. İş bitti; diskte kalırsa kadroyu ezer |
| `scripts/_scan-step-sync.ts` | `jr_06_mat-5` zaman çizelgesi dökümü. Ürün yolu değil |

`docs/Yeni klasör` tarihsel rapor yığınıdır. Bu turda taşınmadı ve silinmedi.

---

## 3. Super Admin

`lib/kernel/auth/super-admin.ts` davranışı değiştirilmedi. T-03 kilidi durur.

| Ortam | `yapinet360@gmail.com` |
|---|---|
| Geliştirme, e-posta doğrulanmış | UUID beklemeden açılır (`builtInRecoveryOpen`) |
| Üretim, e-posta doğrulanmış ve `SUPER_ADMIN_USER_ID` bu hesabın UUID'si | Açılır |
| Üretim, UUID boş | Kimse açılmaz; yerleşik kutu dahil |
| `yetkin.vision@gmail.com` | Hiçbir ortamda admin olmaz |

Kesintisiz üretim yetkisi, o hesabın Supabase UUID'sinin `SUPER_ADMIN_USER_ID` ile birebir yazılmasını ister. Canlı env ve kullanıcı satırı bu turda okunmadı. `tests/kernel/require-super-admin.test.ts` geçti.

---

## 4. Müfredat kapları

### 4.1 Matematik 13 kazanım

`MAT_SHELLS` boşaltıldı. Şeritler saatlerini korur ve `shell` değildir. `processOpen` true kaldı. Bu yüzden «yazılmış kazanım» sayacı 11'de durur; toplam 24'tür. Raf bu dersleri ses fırını ve `JUNIOR_LESSON_FACE` hizası olmadan göstermez. Public URL bugün 404 adayıdır.

Her dosya 12 anlatı adımı, 5–12 dakika bandı ve üç soruluk quiz taşır (kavram, uygulama, beceri). Günlük sahne çeşitliliği ve «sevgili arkadaşım» uyarı cümlesi mühürden geçer.

| Anahtar | Kazanım | Başlık |
|---|---|---|
| `jr_06_mat-26` | MAT.6.1.6 | Kesir ile bölme, sonlu ve devirli ondalık |
| `jr_06_mat-27` | MAT.6.1.7 | Standart uzunluk ölçü birimleri |
| `jr_06_mat-28` | MAT.6.2.2 | Sayı ve şekil örüntüsü |
| `jr_06_mat-29` | MAT.6.2.3 | Cebirsel ifadede algoritma |
| `jr_06_mat-30` | MAT.6.3.1 | İki paralel doğru ve bir kesenin açıları |
| `jr_06_mat-31` | MAT.6.3.2 | İki kesenin oluşturduğu dörtgenler |
| `jr_06_mat-32` | MAT.6.3.3 | Köşegenleri birbirini ortalayan dörtgenler |
| `jr_06_mat-33` | MAT.6.3.4 | Üçgen ve dörtgenlerin açı problemleri |
| `jr_06_mat-34` | MAT.6.4.4 | Çember uzunluğu ile çap |
| `jr_06_mat-35` | MAT.6.4.5 | Çember uzunluğu problemleri |
| `jr_06_mat-36` | MAT.6.4.6 | Merkez açı ve gördüğü yay |
| `jr_06_mat-37` | MAT.6.5.2 | Başkasının istatistiksel yorumunu tartışma |
| `jr_06_mat-38` | MAT.6.6.1 | Gözleme dayalı olasılık |

Hafta 3 sırası değişmedi: `jr_06_mat-6` ve `jr_06_mat-7`.

Oluşturulan yazar dosyaları: `lib/junior/content/mat/26.ts`–`38.ts`, `lib/junior/quiz/mat/26.ts`–`38.ts`. İhracın yazdığı JSON: `packages/junior-content/topics/jr_06_mat-26.json`–`38.json` ve `packages/junior-content/quiz/jr_06_mat-26.json`–`38.json`. Takvim ve MEB JSON'u aynı ihracla yenilendi.

### 4.2 Türkçe ve İngilizce saat taşıyıcıları

`packages/junior-content/src/place.ts` içine `pinned` eklendi. Yapışık şerit verilen hafta ve saati yerleştirir, ardışık öğretim bütçesini yemez. `anchored` bu bayrağı yazar.

Türkçe: altı tema kabı (`jr_06_turkce-21`…`26`) saat 0, kab olarak durur. 204 saat 20 uydudadır. Tema toplamları 34 saattir.

| Tema | Uydu saatleri |
|---|---|
| T.6.1 | 7+7+7+7+6 |
| T.6.2 | 9+9+8+8 |
| T.6.3 | 12+11+11 |
| T.6.4 | 9+9+8+8 |
| T.6.5 | 17+17 |
| T.6.6 | 17+17 |

İngilizce toplam 102 saattir. Aşağıdaki tablo 1. dalga sonundaki dağılımdır. 2. dalgada Family Life, Universe ve World and Culture saatleri uydulara taşındı; güncel tablo 8.3'tedir. G1 satırının kendi saati 0 kalır ve saati olan uyduya bağlanır.

| Tema | Taşıyıcı | Saat |
|---|---|---|
| ENG.6.1 Classroom Life | `jr_06_ing_main-20` | 15 |
| ENG.6.3 Nature | `jr_06_ing_main-7` + `17` | 8+7 |
| ENG.6.4 Neighbourhood | `jr_06_ing_main-5` + `16` | 8+7 |
| ENG.6.7 Personal Life | `jr_06_ing_main-1` + `3` + `8` | 5+5+4 |
| ENG.6.2 Family Life | kab | 15 |
| ENG.6.5 Universe | kab | 14 |
| ENG.6.6 World and Culture | kab | 14 |

Hafta rozetleri aynı öğretim haftalarına yapışıktır. Ücretsiz anahtarlar değişmedi: `jr_06_mat-14`, İngilizce açılış `jr_06_ing_main-20`.

`tests/kernel/junior-closed-beta.test.ts` içinde ikinci konu örneği `jr_06_mat-2` iken katalogda yoktu; kapı 404 dönüyordu. Örnek `jr_06_mat-6` oldu. `jr_06_mat-25` sonraki-ders yoklaması yerinde bırakıldı.

---

## 5. Doğrulama

| Komut | Sonuç |
|---|---|
| `npx tsx scripts/export-junior-content.ts` | 81 senaryo, 81 quiz, 37 kab, 41 hafta |
| `npx tsx scripts/verify-junior-content.ts` | 81 senaryo eşit, 37 kab |
| `npx tsx scripts/verify-junior-speech.ts` | 68 yayın, yazarlık 81 |
| `npx tsx scripts/generate-junior-mat-quiz-archive.ts` | Yazmadan fırlattı |
| Vitest: takvim, kapalı beta, ders rotası, ses, quiz dağılımı, ders zinciri, super admin | Geçti |
| `tests/kernel/junior-faz2-pilot.test.ts` | `lib/junior/micro-progress.ts` içindeki `localStorage` yasağına takıldı. Bu dosya bu turda değişmedi |

Tarayıcıda `https://yetkin.ai` bu turda açılmadı. Hop hizası birim testiyle doğrulandı. Canlı 200, bu kodun dağıtımından sonra ölçülür.

---

## 6. Stratejik sonraki adım

### 6.1 Bir sonraki mikro adım

On üç matematik dersini rafa almak için ses fırını, `JUNIOR_AUDIO_MANIFEST` ve ardından `scripts/sync-junior-lesson-face.ts`. Fırın olmadan yüz hizası rafı bozar: zincir testi çekirdek kartların fırınlanmış ses anahtarıyla birebir olmasını ister. Kasa bu adımda açılmaz. `processOpen` rafa girmeden kapatılmaz; takvim testi yazılı kazanımı 11 bekler.

Bu cümle 1. dalga kapanışındaydı. Fen kabları ve üç İngilizce tema 8. bölümde kapanmıştır. Sıradaki iş Sosyal Bilgiler'in saatli altı kabıdır. 7. sınıf bu dosya ağacını kopyalamaz.

### 6.2 Kalan riskler

1. Ders hop'u ile sayfa birlikte kapanan bir anahtar yok. Bayrak `isKapali("junior")` üretir; katalog hop'unu 410 yapmaz.
2. `jr_06_mat-26`…`38` yazarlıkta tam, vitrinde yok. Dağıtım bunları rafta göstermez.
3. Fen süreç kabları ve üç İngilizce tema 8. bölümde kapanmıştır. Saatli kab olarak Sosyal Bilgiler'in altı anahtarı durur. Türkçe saati tema düzeyindedir; beceri kazanımına bölünmemiştir.
4. Üretim Super Admin, `SUPER_ADMIN_USER_ID` ile hesap UUID'si yazılmadan açılmaz. Bu eşleşme canlıda bu turda okunmadı.
5. Native istemcide eski mimari ad geçiyor olabilir. Canlı ad B1'dedir; bu turda kopya metin taranıp yeniden adlandırılmadı.
6. `lib/kernel` gövde kodu ile `@yetkin/kernel` paket adı aynı sözcüğü taşır. İkinci ev açılmadı.
7. `docs/Yeni klasör` duruyor. Ürün yolu değildir.
8. Satış kanıtı bu turun dışında: kasa kapalı, admin olmayan bir veli ve tek `merchant_oid` A–D kapanınca ölçülür.

## 7. Dosya özeti

**Davranış değişen:** `lib/kernel/security/edge-api-auth.ts`, `lib/kernel/http/v1-contract.ts`, `lib/junior/content-source.ts`, `lib/junior/scene-media.ts`, `components/junior/player/scene-ui.tsx`, `apps/rail-is/src/screens/JuniorLessonScreen.tsx`, `packages/junior-content/src/place.ts`, `packages/junior-content/src/plan.ts`, `packages/junior-content/src/sealed-roster.ts`, `scripts/export-junior-content.ts`, `scripts/verify-junior-content.ts`, `scripts/verify-junior-speech.ts`, `scripts/junior-quiz-archive-write.ts`, beş `scripts/generate-junior-*-quiz-archive.ts`, `.system_docs/ANAYASA.md` (B6 cümlesi), `.system_docs/OPS_RUNBOOK.md`, `tests/kernel/junior-closed-beta.test.ts`, `tests/kernel/junior-meb-calendar.test.ts`, `tests/kernel/junior-lesson-route-audio.test.ts`, `tests/kernel/junior-voice-design.test.ts`.

**Yeni:** `lib/junior/content/mat/26.ts`–`38.ts`, `lib/junior/quiz/mat/26.ts`–`38.ts`, ihracın ürettiği 13 konu JSON'u ve 13 quiz JSON'u.

**Silinen:** `scripts/_author-mat-26-38.ts`, `scripts/_scan-step-sync.ts`.

---

## 8. İkinci dalga — Fen kabları ve İngilizce temalar

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Girdi | `docs/TESPIT_RAPORU.md`, 2. dalga |
| Ölçüm | `export:junior-content`, `verify:junior-content`, `verify:junior-speech`, odaklı Vitest |
| Kapsam dışı | Ses fırını, `JUNIOR_LESSON_FACE` hizası, kasa, canlı Vercel, Maarif PDF'sinin yeniden indirilmesi |

### 8.1 Hüküm

İngilizce'de 43 saat üç kabdan altı yeni uyduya taşındı. Yıl toplamı 102 saatte kaldı. `jr_06_ing_main-22`, `-25` ve `-26` saat 0 ve hafta 0 ile tema sandığı olarak durur. `G1` kodu saati olan uyduya bindi.

Fen'de 18 kab (`jr_06_fen-21`…`38`) kendi numarasıyla senaryo ve quiz oldu. `FEN_SHELLS` boşaldı. Fen kab sayısı 0'dır. Kurs kab sayısı 37'den 19'a indi: İngilizce 7 sandık, Türkçe 6 sandık, Sosyal Bilgiler 6 saatli kab.

Yazarlık kadrosu 81'den 105'e çıktı. Yayın rafı 68'de kaldı. Yeni derslerin sesi fırınlanmadığı için vitrinde yoktur.

`processOpen` bu dalgada `false` yapılmadı. `FB.6.2.2` satırında `hoursBasis: "unverified"` duruyor. Kazanım mühürlü çıktı diye ilan edilmedi.

### 8.2 İngilizce — altı uydu

Üç tema aynı düzenlemede açıldı. Family tek başına listeye girseydi Universe kabı saat paketleyicisinde hafta 1'e kayardı.

| Uydu | Tema | Saat | Hafta | Sahne |
|---|---|---:|---|---|
| `jr_06_ing_main-2` | ENG.6.2 Family Life, have got | 8 | 6–8 | `place` |
| `jr_06_ing_main-4` | ENG.6.2 Family Life, ev rutini | 7 | 9–11 | `clock` |
| `jr_06_ing_main-6` | ENG.6.5 Universe, there is | 7 | 25–28 | `globe` |
| `jr_06_ing_main-9` | ENG.6.5 Universe, will | 7 | 29–31 | `globe` |
| `jr_06_ing_main-10` | ENG.6.6 World and Culture, ülke ve milliyet | 7 | 32–33 | `culture` |
| `jr_06_ing_main-11` | ENG.6.6 World and Culture, kutlama ve yemek | 7 | 34 | `holiday` |

Saat toplamı 8+7+7+7+7+7 = 43. Hafta 9–11 ara tatil haftası 10'u, hafta 25–28 ara tatil haftası 26'yı aralığın içinde taşır. Uçlar öğretim haftasıdır. Hafta 34'e 7 saat yazmak, Personal Life'ın 40. haftasına 4 saat yazmasıyla aynı cinstendir. Rozet 35. haftadaki Personal dersine binmedi.

Sandıklar yalnız tema kodunu tutar. G1 uydudadır.

| Sandık | Saat | Hafta | Kalan kod |
|---|---:|---:|---|
| `jr_06_ing_main-22` | 0 | 0 | ENG.6.2 |
| `jr_06_ing_main-25` | 0 | 0 | ENG.6.5 |
| `jr_06_ing_main-26` | 0 | 0 | ENG.6.6 |

Boş numaralar 12, 13, 14, 15, 18 ve 19 yedekte kaldı. Takvim testi emekli örnek anahtarı `jr_06_ing_main-2` iken `jr_06_ing_main-12` oldu. Raf hâlâ 8 karttır; yeni uydular fırınsız olduğu için `juniorCourseShelves` onları basmaz.

Yazar dosyaları: `lib/junior/content/ing/2.ts`, `4.ts`, `6.ts`, `9.ts`, `10.ts`, `11.ts` ve `lib/junior/quiz/ing/` altındaki aynı numaralar.

### 8.3 Fen — on sekiz kab

Pilot `jr_06_fen-36` (ampul parlaklığının değişkenleri) önce mühürden geçti. Deney, bağımsız değişken ve bağımlı değişken 12 adımlı senaryonun örnek ve günlük kullanım cümlesine yazıldı. Ayrı bir 13. laboratuvar adımı açılmadı.

Ardından ünite sırası kapatıldı. `jr_06_fen-21` fen sırasında sonda durur; `hoursBasis` `unverified` kaldı. Başlık «Alınan yol ve yer değiştirme» yerinde durur.

| Anahtar | Kazanım | Süreç kökü metinde | Sahne |
|---|---|---|---|
| `jr_06_fen-36` | FB.6.6.2 Ampul parlaklığının değişkenleri | deney, değişken, gözlem, ölç | `circuit` |
| `jr_06_fen-22` | FB.6.3.1 Üreme | model, gözlem | `body` |
| `jr_06_fen-23` | FB.6.3.2 Büyüme | ölç, gözlem, grafik | `body` |
| `jr_06_fen-24` | FB.6.3.3 Çimlenme | deney, değişken, gözlem | `body` |
| `jr_06_fen-25` | FB.6.3.4 İnsan üreme organları | model, gözlem, çizim | `body` |
| `jr_06_fen-26` | FB.6.3.5 Canlılarda üreme ve büyüme | gözlem, grafik, ölç | `body` |
| `jr_06_fen-27` | FB.6.3.7 İç salgı | model, gözlem | `body` |
| `jr_06_fen-28` | FB.6.3.8 Ergenlik | gözlem, grafik, tartış | `body` |
| `jr_06_fen-29` | FB.6.4.1 Yansıma, FB.6.4.2 Normal | deney, ölç, model, gözlem | `mirror` |
| `jr_06_fen-30` | FB.6.4.3 Ayna çeşitleri | deney, gözlem | `mirror` |
| `jr_06_fen-31` | FB.6.4.4 Soğurulma, FB.6.4.5 Beyaz ışık | deney, gözlem | `mirror` |
| `jr_06_fen-32` | FB.6.4.6 Renk, FB.6.4.7 Güneş enerjisi | deney, model, gözlem | `mirror` |
| `jr_06_fen-33` | FB.6.5.1 Genleşme | deney, ölç, gözlem | `particles` |
| `jr_06_fen-34` | FB.6.5.2 Erime, donma ve kaynama | deney, ölç, grafik, gözlem | `particles` |
| `jr_06_fen-35` | FB.6.5.4 Tümdengelim, FB.6.5.5 Buzun yoğunluğu | hipotez, deney, model, gözlem | `particles` |
| `jr_06_fen-37` | FB.6.7.1 Biyoçeşitlilik, FB.6.7.2 Tehditler | gözlem, araştır, tartış | `body` |
| `jr_06_fen-38` | FB.6.7.3 Yakıt, FB.6.7.4 Çevre problemi | araştır, gözlem, tartış, model | `body` |
| `jr_06_fen-21` | FB.6.2.2 Alınan yol ve yer değiştirme | ölç, gözlem, grafik | `speed` |

Üreme ve ergenlik dersleri organ adı ve görev düzeyindedir. Ayrı bir oynatıcı modu açılmadı.

Işık ünitesi için kataloga `mirror` eklendi. `JUNIOR_VECTOR_STEP_COUNT` 12'de kaldı. Yedek vuruş listesi ve fen sahne çizimi bu kimliği taşır.

Yazılı iki komşu kapı da aynı turda cümle aldı:

- `jr_06_fen-1` örneğine gezegen modeli cümlesi girdi. Masa lambası Güneş, sekiz top sıra olur.
- `jr_06_fen-12` yoğunluk dersi olarak kaldı. Örneğin sonuna katı, sıvı ve gaz tanecik düzenini anlatan madde modeli cümlesi girdi.
- `jr_06_fen-2` tutulma modelini zaten anlatıyordu; bu turda gövdesi değişmedi.

`processOpen` açık kaldığı için «yazılmış kazanım» sayacı ilerlemez. `verify:junior-content` açık çıktı listesini bilgi diye basar ve derlemeyi kırmaz. Liste 59 satırdır; Fen ve İngilizce kazanımları bu listede durur çünkü bayrak kapanmadı.

Yazar dosyaları: `lib/junior/content/fen/21.ts`–`38.ts` ve `lib/junior/quiz/fen/21.ts`–`38.ts`. `fen/1.ts` ve `fen/12.ts` cümle eklentisi aldı.

### 8.4 Doğrulama

| Komut | Sonuç |
|---|---|
| `npm run export:junior-content` | 105 senaryo, 105 quiz, 19 kab, 41 hafta |
| `npm run verify:junior-content` | 105 senaryo eşit, 19 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |
| `npm run verify:junior-speech` | 68 yayın dersi fırına hazır, yazarlık 105 |
| Vitest: takvim, ders zinciri, içerik kalitesi, ses tasarımı, kapalı beta | 5 dosya, 39 test geçti |

İngilizce saati 102, fen saati 138. Hafta 3 fen sırası `jr_06_fen-2` olarak kaldı. Raf testleri İngilizce'de 8, fen'de 9 kart bekler; fırınsız yeni dersler bu sayıları değiştirmedi.

Tarayıcıda yeni oynatıcı sahnesi açılmadı. Yeni anahtarlar `JUNIOR_LESSON_FACE` ve ses manifestinde olmadığı için vitrin ve ders kapısı onları basmaz. Mevcut raf davranışı birim testiyle durdu.

### 8.5 Sonraki dalga — Türkçe ve Sosyal Bilgiler

Türkçe'de saat taşınacak kab kalmamıştır. `jr_06_turkce-21`…`26` tema sandığıdır, saati 0'dır. 204 saat `jr_06_turkce-1`…`20` uydularındadır. Sonraki iş, `T.6.1`–`T.6.6` tema satırını dinleme, okuma, konuşma ve yazma çıktısına bölmek ve bu kodları mevcut uydulara bağlamaktır. Sandığa ikinci bir anlatı yazmak saati ikiye böler.

Sosyal Bilgiler, bu dalgada Fen'in kapandığı kalıpla kapanır. `jr_06_sosyal-21`…`26` altı kab, 34 saat tutar: `SB.6.1.3`, `SB.6.2.3`, `SB.6.3.2`, `SB.6.4.3`, `SB.6.5.3`, `SB.6.6.2`. Hepsi `processOpen` açıktır. Sıra, her anahtarın kendi numarasıyla kadroya girmesi, `shell` bayrağının kalkması ve senaryonun kabın üstüne yazılmasıdır. `jr_06_sosyal-2`, `-3`, `-6` ve `-13` saat 0 ile park edilmiş yazılı derslerdir; kab değildir ve bu dalgada diriltilmez.

Din Kültürü, Müzik, Görsel Sanatlar, Beden Eğitimi ve Bilişim, beş çekirdeğin saat haritası kapanmadan çekirdek kart yapılmaz. 7. sınıf, 6. sınıfın dosya ağacı kopyalanarak açılmaz.

Rafa almak ayrı bir iştir: ses fırını, `JUNIOR_AUDIO_MANIFEST`, ardından `scripts/sync-junior-lesson-face.ts`. Fırın olmadan yüz hizası rafı bozar. `processOpen` bu fırından önce kapatılmaz.

### 8.6 Dosya özeti

**Plan ve kadro:** `packages/junior-content/src/plan.ts`, `packages/junior-content/src/sealed-roster.ts`.

**Sahne:** `lib/junior/types.ts` (`mirror`), `components/junior/vector-player.tsx`, `components/junior/player/science-scenes.tsx`, `components/junior/player/step-art.tsx`.

**Test:** `tests/kernel/junior-meb-calendar.test.ts` emekli İngilizce örneği `jr_06_ing_main-12`.

**Yeni yazarlık:** 6 İngilizce senaryo ve quiz, 18 Fen senaryo ve quiz. İhracın yazdığı konu ve quiz JSON'ları aynı anahtarlardadır. İngilizce sandık JSON'ları `shell: true` ve 0 saat olarak yeniden basıldı.

---

## 9. Üçüncü dalga — Sosyal Bilgiler kabları ve Türkçe beceri soneki

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Girdi | `docs/TESPIT_RAPORU.md`, 3. dalga |
| Ölçüm | `export:junior-content`, `verify:junior-content`, `verify:junior-speech`, odaklı Vitest |
| Kapsam dışı | Ses fırını, `JUNIOR_LESSON_FACE` hizası, kasa, canlı Vercel, Maarif PDF'sinin yeniden indirilmesi |

### 9.1 Hüküm

Sosyal Bilgiler'in altı saatli kabı kendi numarasıyla senaryo ve quiz oldu. `SOSYAL_SHELLS` boşaldı. Sosyal kab sayısı 0'dır. Kurs kab sayısı 19'dan **13**'e indi: Türkçe 6 sandık, İngilizce 7 sandık. Kalan sandıkların saati 0 ve haftası 0'dır.

Yazarlık kadrosu 105'ten **111**'e çıktı. Yayın rafı **68**'de kaldı. Yeni altı sosyal dersin sesi fırınlanmadığı için vitrinde yoktur. Fırın kuyruğu 43 derstir.

Türkçe'de yeni ders açılmadı. `T.6.1`–`T.6.6` tema satırı 34 saatini korur. Altı beceri soneki saati 0 olan binicidir ve yirmi uydunun `outcomeCodes` listesine bindi. Uydu saati toplamı **204** kaldı. `jr_06_turkce-21`…`26` saat 0, hafta 0 ve `shell: true` olarak durur; kadroya girmedi.

`processOpen` bu dalgada `false` yapılmadı. Altı sosyal kazanım ve altı Türkçe tema kapsama listesinde durur. Sayaç, bayrak kapanmadan ilerlemez.

Park edilmiş `jr_06_sosyal-2`, `-3`, `-6` ve `-13` kadroda ve dosyasında kaldı. `jr_06_sosyal-14` ve `-19` açılmadı.

### 9.2 Sosyal Bilgiler — pilot ve beş kab

Pilot `jr_06_sosyal-21` (toplumsal sorunu müzakere, `SB.6.1.3`) önce mühürden geçti: 12 adım, 5,02 dakika, sahne `assembly`. Müzakere ve tartışma, 12 adımlı gövdenin örnek ve günlük kullanım cümlesine yazıldı. Adımlar şunlardır: sorunu adlandırmak, sırayla dinlemek, sözü kişiye değil soruna çevirmek, seçenek söylemek, ortak kararda buluşmak. Ayrı bir 13. adım açılmadı.

Ardından ünite sırası kapatıldı. Saat ve hafta şeridi yerinde kaldı. Alan saati 103'tür.

| Anahtar | Kazanım | Saat | Süreç kökü metinde | Sahne | Anlatım |
|---|---|---:|---|---|---:|
| `jr_06_sosyal-21` | SB.6.1.3 Toplumsal sorunu müzakere | 5 | müzakere, tartış | `assembly` | 5,02 dk |
| `jr_06_sosyal-22` | SB.6.2.3 Türk dünyasıyla kültürel iş birliği | 6 | araştır, tartış | `globe` | 5,00 dk |
| `jr_06_sosyal-23` | SB.6.3.2 VII–XIII. yüzyıl İslam medeniyetinin ortak mirası | 6 | araştır, yorumla | `history` | 5,16 dk |
| `jr_06_sosyal-24` | SB.6.4.3 Dijitalleşmenin vatandaşlık haklarına etkisi | 6 | tartış | `ballot` | 5,00 dk |
| `jr_06_sosyal-25` | SB.6.5.3 Yatırım ve pazarlama proje önerisi | 6 | model, araştır | `fair` | 5,07 dk |
| `jr_06_sosyal-26` | SB.6.6.2 Telif ve patent | 5 | araştır | `book` | 5,11 dk |

`jr_06_sosyal-23` ortak mirası kütüphane, hastane ve sayı düzeni üzerinden anlatır. Park edilmiş `-6` (İslamiyet'in doğuşu ve yayılışı) bu saati almaz.

Her dosya 12 anlatı adımı ve üç soruluk quiz taşır (kavram, uygulama, beceri). Bant 5–12 dakikadır.

Yazar dosyaları: `lib/junior/content/sosyal/21.ts`–`26.ts` ve `lib/junior/quiz/sosyal/21.ts`–`26.ts`. İhracın yazdığı JSON: `packages/junior-content/topics/jr_06_sosyal-21.json`–`26.json` ve `packages/junior-content/quiz/jr_06_sosyal-21.json`–`26.json`. Kab bayrağı bu altı dosyada kalktı.

Kadro: `packages/junior-content/src/sealed-roster.ts` sosyal numaralarına 21–26 eklendi. Mevcut 1–13, 15–18 ve 20 yerinde durur.

### 9.3 Türkçe — beceri soneki

Yeni uydu ve yeni sandık açılmadı. Sonek, `packages/junior-content/src/plan.ts` içinde `TURKCE_THEMES` yanındaki `TURKCE_SKILLS` dizisine ve uydunun çıktı listesine aynı değişiklikte girdi. `hours` 0, `hoursBasis` `plan`, `processOpen` `false`.

| Sonek | Beceri | Tema | Bağlanan uydular |
|---|---|---|---|
| `.O` | Okuma ve söz varlığı | `T.6.1`, `T.6.2`, `T.6.3` | `1`, `2`, `3`, `4`, `13`, `8`, `9`, `10`, `12`, `5`, `7`, `11` |
| `.C` | Cümle ve ek | `T.6.4` | `6`, `14`, `15`, `16` |
| `.Y` | Yazım ve noktalama | `T.6.5`, `T.6.6` | `17`, `18`, `19`, `20` |

Örnek takvim bağları: `jr_06_turkce-1` kodları `T.6.1` ve `T.6.1.O`, saati 7. `jr_06_turkce-6` kodları `T.6.4` ve `T.6.4.C`, saati 9. `jr_06_turkce-21` yalnız `T.6.1` tutar, saati 0, haftası 0, `shell: true`.

Dinleme ve konuşma soneki açılmadı. Yirmi uydu dosyası yeniden yazılmadı. Tema saati 34 ve `processOpen` açık kaldığı için `T.6.1`–`T.6.6` kapsama listesinde durur. Sonek satırının saati 0 olduğu için kapsama listesine düşmez.

### 9.4 Doğrulama

| Komut | Sonuç |
|---|---|
| `npm run export:junior-content` | 111 senaryo, 111 quiz, 13 kab, 41 hafta |
| `npm run verify:junior-content` | 111 senaryo eşit, 13 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |
| `npm run verify:junior-speech` | 68 yayın dersi fırına hazır, yazarlık 111 |
| Vitest: takvim, içerik kalitesi, ses tasarımı, sosyal quiz arşivi, ders zinciri, kapalı beta | 6 dosya, 44 test geçti |

Sosyal saati 103, Türkçe saati 204. Raf testleri Türkçe'de 20 kart bekler; fırınsız sosyal 21–26 bu sayıyı değiştirmedi. `jr_06_mat-5` hâlâ ilk matematik kartıdır. `outcomeWritten` matematik için 11'de kaldı.

Tarayıcıda yeni oynatıcı sahnesi açılmadı. Yeni anahtarlar `JUNIOR_LESSON_FACE` ve ses manifestinde olmadığı için vitrin ve ders kapısı onları basmaz. Mevcut raf davranışı birim testiyle durdu.

### 9.5 Fırın kuyruğu — 43 ders

Raf, sesi fırınlanmış anahtardır. Manifestte 68 kayıt vardır. Yazarlık 111'dir. Fırınsız 43 ders rafta yoktur:

| Sıra | Dersler | Adet |
|---|---|---:|
| 1 | Matematik `jr_06_mat-26` … `38` | 13 |
| 2 | Fen `jr_06_fen-21` … `38` | 18 |
| 3 | İngilizce `jr_06_ing_main-2`, `-4`, `-6`, `-9`, `-10`, `-11` | 6 |
| 4 | Sosyal `jr_06_sosyal-21` … `26` | 6 |

Türkçe beceri bağı yeni ses isteği doğurmadı. Yirmi Türkçe kaset yerinde kaldı. Yayınlanmış 68 kasete dokunulmaz.

Geçiş sırası şudur. Bu turda fırın çalıştırılmadı.

1. Fırın havuzu, manifestteki anahtarlar ile kadrodaki senaryonun farkıdır: yukarıdaki 43 anahtar. Kurs geneli komut bu 43'ü toplu çağırmaz. `JUNIOR_SOSYAL_LESSONS` ve kardeşleri yalnız manifestteki anahtarı döndürür. `--course=jr_06_sosyal` raftaki 18 dersi yeniden sentezler; `bakeLesson` mevcut MP3'ü atlamaz.
2. Her anahtar önce `--dry-run` fişi alır, sonra tek anahtar ve `--confirm-gemini-spend` ile yazılır. Ders başına bir konuşma isteği. Süre bandı 5–12 dakikadır.
3. Yazılan MP3, `npm run generate:junior-audio-manifest` ile manifeste girer.
4. Manifestten sonra `scripts/sync-junior-lesson-face.ts` çalışır. Fırından önce çalıştırılırsa yeni anahtarı eklemez. Fırından sonra başlığı senaryodan basar.
5. `processOpen` bu fırında kapanmaz. Sayaç, bayrak kapanınca ilerler.
6. Kasa bu dalgada açılmaz.

Sıra, rafta boşluğu en eski olan dersten başlar: önce matematik 26–38, sonra fen 21–38, sonra altı İngilizce uydu, en sonda sosyal 21–26. Sosyal fırının ilk anahtarı `-21` dir.

### 9.6 Dosya özeti

**Plan ve kadro:** `packages/junior-content/src/plan.ts` (`SOSYAL_SHELLS` boş, `TURKCE_SKILLS` ve uydu kodları), `packages/junior-content/src/sealed-roster.ts` (sosyal 21–26).

**Yeni yazarlık:** 6 sosyal senaryo ve 6 sosyal quiz. İhracın yazdığı konu ve quiz JSON'ları aynı anahtarlardadır. Türkçe sandık JSON'ları `shell: true` ve 0 saat olarak yeniden basıldı. `packages/junior-content/meb/2026-2027/turkce.json` altı soneki saat 0 ile taşır.

**Dokunulmayan:** `lib/junior/content/sosyal/2.ts`, `3.ts`, `6.ts`, `13.ts` ve bunların quizleri. Türkçe `1.ts`–`20.ts`. Ses manifesti. `JUNIOR_LESSON_FACE`.

---

## 10. Ücretsiz ilk ders ses kapısı

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Kaynak | `juniorFreeLessonKeys()` |
| Model kimliği | `gemini-3.8-flash-tts` (`VOICE_TTS`, `academyBakeVoiceModelId`) |
| API | Çağrı yok. Yayın kaseti ikinci kez yazılmadı |
| Manifest | `lib/junior/audio-manifest.generated.ts` — bayt ve SHA değişmedi |

`juniorFreeLessonKeys()` on iki anahtar döndürür. Altısı çekirdek rafta, sesi diskte ve mühür boşluğu yok. Altısı seçmeli taslaktır; metin bandı, ses, ısınma ve soru kapısı kapalıdır. Seçmeli taslak fırın havuzunda yoktur (`bake-junior-pilot-tts.ts` yalnız beş çekirdek kursu tanır).

### 10.1 Çekirdek — diskte, mühür boşluğu yok

Süre, MP3 dosyasının ffmpeg okumasıdır. Bayt, dosya boyutu ile manifest kaydının aynı olduğunu gösterir. `assertJuniorProductionSeal` bu altı derste `juniorProductionSealGaps` boş olduğu için fırlatmaz. Vitrin yüzü `scripts/sync-junior-lesson-face.ts --check` ile senaryo başlığına eşittir.

| Anahtar | Başlık | Süre | Bayt | Manifest `?v=` | Oynatıcı |
|---|---|---:|---:|---|---|
| `jr_06_mat-5` | Çarpanlar, katlar ve bölünebilme | 7:15.26 | 17.411.565 | `21b700adc4b3` | https://yetkin.ai/junior/ders/jr_06_mat-5 |
| `jr_06_fen-1` | Güneş sistemindeki gezegenler | 6:52.42 | 16.497.645 | `ffdf466dc027` | https://yetkin.ai/junior/ders/jr_06_fen-1 |
| `jr_06_turkce-1` | Gerçek, mecaz ve terim anlam | 6:48.12 | 16.325.805 | `21d6bcc65a5f` | https://yetkin.ai/junior/ders/jr_06_turkce-1 |
| `jr_06_ing_main-20` | Hak, sorumluluk ve sınıf kuralı | 7:16.66 | 17.467.245 | `365d0eff695d` | https://yetkin.ai/junior/ders/jr_06_ing_main-20 |
| `jr_06_sosyal-1` | Değerlerimiz ve toplumdaki roller | 6:28.87 | 15.555.885 | `8622b5452495` | https://yetkin.ai/junior/ders/jr_06_sosyal-1 |
| `jr_06_mat-14` | Ondalık gösterimi okumak | 7:14.71 | 17.389.485 | `743140db47a4` | https://yetkin.ai/junior/ders/jr_06_mat-14 |

Kamu ses yolu `/media/junior/audio/{anahtar}.mp3?v={ilk 12 hex}` biçimindedir. Örnek: `/media/junior/audio/jr_06_mat-14.mp3?v=743140db47a4`. CDN kökü `NEXT_PUBLIC_MEDIA_BASE_URL` doluysa bu yolun önüne gelir. Bu oturumda taban boştu; adres yerel kamu yoludur.

Fırın komutu:

```
npx tsx scripts/bake-junior-pilot-tts.ts --dry-run --course=jr_06_mat --key=jr_06_mat-14
```

Çıkış 1. Metin: `jr_06_mat-14 zaten fırınlı (manifestte). Bu betik yayındaki sesi yeniden üretmez.` Gemini isteği açılmadı. Aynı kapı diğer beş çekirdek anahtarda da durur.

### 10.2 Seçmeli açılış — fırın açılmadı

Bu altı anahtar ücretsiz listededir ve `band: "draft"` taşır. `juniorProductionSealGaps` her birinde `text`, `audio`, `warmup`, `quiz` döndürür. Metin bandı 5–12 dakika kapısını geçmeden ses fırını açılmaz.

| Anahtar | Başlık |
|---|---|
| `jr_06_ing-1` | Saate göre selam |
| `jr_06_alm-1` | Günün selamı |
| `jr_06_fra-1` | Bonjour demek |
| `jr_06_siyer-1` | Doğru söz |
| `jr_06_kod-1` | Komut sırası |
| `jr_06_arp-1` | Selam vermek |

### 10.3 Kapı komutları

| Komut | Sonuç |
|---|---|
| `scripts/sync-junior-lesson-face.ts --check` | lesson-face senaryo ile aynı |
| `npm run verify:junior-content` | OK. 111 senaryo eşit, 13 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |
| `npm run verify:junior-speech` | OK. Puck katalog sesi. 68 yayın dersi fırına hazır, yazarlık 111 |

Kontrol yüzeyi altı çekirdek oynatıcı adresidir. Yayınlanmış kaset yerinde durur.

---

## 11. Sahne plaka kataloğu — A grubu 21

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Girdi | `/junior/ders/[lessonKey]` çalışma zamanı: `Junior sahne: A plaka 21 olmalı.` |
| Dosya | `lib/junior/scene-media.ts` |
| Ölçüm | `npx vitest run tests/kernel/junior-player-clock.test.ts`, `npm run verify:junior-content` |

### 11.1 Hüküm

`assertSceneCatalog` A grubunda 21, B grubunda 22, toplamda 43 plaka bekler. Katalogda A grubu 20 plakaydı. Eksik satır Faz 31 A listesinin 14. karesiydi: `jr_06_mat-1`, başlık «Üslü ifadede taban ve üs», öğretim adımı 5. B grubu zaten 22 idi; ona satır eklenmedi. Video kaseti 14 olarak kaldı. `jr_06_mat-1` yalnız Lite kare bekler.

Eklenen plaka `jr_06_fen-16` ile `jr_06_mat-8` arasındadır. İstem, üssü `2×2×2 = 8` diye açar ve `2×3 = 6` tuzağını çizer. Etiketler «Taban 2» ve «Üs 3» dir.

### 11.2 Doğrulama

| Komut | Sonuç |
|---|---|
| `npx vitest run tests/kernel/junior-player-clock.test.ts` | 16 test geçti. Modül yüklenirken `assertSceneCatalog` hata fırlatmadı |
| `npm run verify:junior-content` | Çıkış 0. 111 senaryo eşit, 13 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |

Sahne plaka hatası çözüldü, testler yeşil.

---

## 12. KURS 1 — İngilizce altı uydu, tek istek

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Model | `gemini-3.8-flash-tts` (`VOICE_TTS`, `academyBakeVoiceModelId`) |
| Ses | Selin / Kore, tempo `0.94`, `tr-TR`, voicePrompt gönderilmedi |
| İstek | Ders başına 1. Kalite kapısı `QUALITY_RETRY_MAX = 1`. Süre veya kalite düşerse aynı ders yeniden sentezlenmez |
| Kapsam | `jr_06_ing_main-2`, `-4`, `-6`, `-9`, `-10`, `-11` |
| Toplam düdük | 6 istek, tavan 100. 429, ağ tekrarı ve kalite tekrarı yok |

Her anahtar önce `--dry-run --course=jr_06_ing_main` fişi aldı, sonra `--confirm-gemini-spend --course=jr_06_ing_main --key=` ile tek başına yazıldı. Kurs bayrağı şart: bu altı anahtar pilot havuzunda değil, İngilizce fırın adayındadır. Biri kapıdan düşseydi süreç durmadan sıradakine geçecekti. Altısı da çıkış 0 ile bitti. Atlanan ders yok.

Sert süre bandı kelime × 0,4 saniye ile 720 saniye arasıdır. Bunun altı veya üstü dosyayı yazmaz. Oyuncu saatinin alt sınırı 300 saniyedir; metin tamsa betik uyarı basar ve dosyayı yine yazar.

### 12.1 Yazılan kasetler

Süre, fırın çıktısındaki MP3 saniyesidir. Saat, saniyenin dakika karşılığıdır. `?v=` manifest SHA'sının ilk 12 karakteridir.

| Anahtar | Başlık | Süre | Saat | Bayt | LUFS | `?v=` |
|---|---|---:|---:|---:|---:|---|
| `jr_06_ing_main-2` | Family Life: ailem ve have got | 319.13 | 5:19.13 | 12.766.125 | −15.6 | `9e5cfe5ba418` |
| `jr_06_ing_main-9` | Universe: gelecekte will | 308.62 | 5:08.62 | 12.345.645 | −16.1 | `81cff765da2b` |
| `jr_06_ing_main-4` | Family Life: evde rutin işler | 287.14 | 4:47.14 | 11.486.445 | −15.9 | `9fae861bb570` |
| `jr_06_ing_main-6` | Universe: gökyüzü ve there is | 292.06 | 4:52.06 | 11.683.245 | −16.3 | `c717e2dfc1e9` |
| `jr_06_ing_main-11` | World and Culture: kutlama ve yemek | 292.80 | 4:52.80 | 11.713.005 | −16.4 | `2d803e6491b9` |
| `jr_06_ing_main-10` | World and Culture: ülke ve milliyet | 283.46 | 4:43.46 | 11.339.565 | −16.1 | `887a11bdd670` |

İlk iki kaset 300 saniyenin üstündedir. Alttaki dört kaset oyuncu saatinin altındadır. Sert bandın içindedirler (taban yaklaşık 223–229 saniye). Betik «katalog temposu oyuncu saatinin altında, metin tam, dosya yazılır» dedi. Retry atılmadı. Dosyalar `public/media/junior/audio/{anahtar}.mp3` yolunda durur. İnceleme bu dört süre içindir; silinmedi.

Oynatıcı adresleri:

- https://yetkin.ai/junior/ders/jr_06_ing_main-2
- https://yetkin.ai/junior/ders/jr_06_ing_main-4
- https://yetkin.ai/junior/ders/jr_06_ing_main-6
- https://yetkin.ai/junior/ders/jr_06_ing_main-9
- https://yetkin.ai/junior/ders/jr_06_ing_main-10
- https://yetkin.ai/junior/ders/jr_06_ing_main-11

### 12.2 Manifest ve vitrin

`npm run generate:junior-audio-manifest` ilk çalıştığında 68 anahtarı yeniden özetledi; yeni dosyayı sicile almadı. Yazıcı, anahtar listesini mevcut manifestten okuyordu. `--write` artık yayın siciline, diskte MP3'si olan fırın adayını da katar. Emekli dosya ve `bgm-light-learning.mp3` girmez. İkinci yazım **74** kayıt bastı. Eklenenler yalnız bu altı İngilizce anahtardır.

`scripts/sync-junior-lesson-face.ts` **86** başlık yazdı. İngilizce rafı hafta sırasıyla 8 karttan **14** karta çıktı. Yeni sıra: `-20`, `-2`, `-4`, `-7`, `-17`, `-5`, `-16`, `-6`, `-9`, `-10`, `-11`, `-1`, `-3`, `-8`.

Yayın rafı 68'den **74**'e çıktı. Yazarlık 111 kaldı. Fırın kuyruğunda 37 ders durur: matematik 26–38 (13), fen 21–38 (18), sosyal 21–26 (6).

### 12.3 Doğrulama

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-content` | Çıkış 0. 111 senaryo eşit, 13 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |
| `npm run verify:junior-speech` | Çıkış 0. 74 yayın dersi fırına hazır, yazarlık 111 |
| Vitest: takvim, ders zinciri, quiz dağılımı, ses manifesti, ses tasarımı | 5 dosya, 41 test geçti |

Raf testleri İngilizce'de 14 kart ve ünite sırası `1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7` bekler. Quiz anahtar sayısı 74'tür ve fırın siciliyle aynıdır.

---

## 13. KURS 2 — Sosyal Bilgiler altı ders, tek istek

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Model | `gemini-3.8-flash-tts` (`VOICE_TTS`, `academyBakeVoiceModelId`) |
| Ses | Murat / Achird, tempo `0.94`, `tr-TR`, voicePrompt gönderilmedi |
| İstek | Ders başına 1. Kalite kapısı `QUALITY_RETRY_MAX = 1`. Süre veya kalite düşerse aynı ders yeniden sentezlenmez |
| Kapsam | `jr_06_sosyal-21`, `-22`, `-23`, `-24`, `-25`, `-26` |
| Toplam düdük | 6 istek, tavan 100. 429, ağ tekrarı ve kalite tekrarı yok |

Her anahtar önce `--dry-run --course=jr_06_sosyal` fişi aldı, sonra `--confirm-gemini-spend --course=jr_06_sosyal --key=` ile tek başına yazıldı. Kurs bayrağı şart: bu altı anahtar pilot havuzunda değil, Sosyal Bilgiler fırın adayındadır. Biri kapıdan düşseydi süreç durmadan sıradakine geçecekti. Altısı da çıkış 0 ile bitti. Atlanan ders yok. Her süreç «kullanılan 1 istek» dedi.

Sert süre bandı kelime × 0,4 saniye ile 720 saniye arasıdır. Bunun altı veya üstü dosyayı yazmaz. Oyuncu saatinin alt sınırı 300 saniyedir; metin tamsa betik uyarı basar ve dosyayı yine yazar.

### 13.1 Yazılan kasetler

Süre, fırın çıktısındaki MP3 saniyesidir. Saat, saniyenin dakika karşılığıdır. `?v=` manifest SHA'sının ilk 12 karakteridir.

| Anahtar | Başlık | Süre | Saat | Bayt | LUFS | `?v=` |
|---|---|---:|---:|---:|---:|---|
| `jr_06_sosyal-21` | Toplumsal sorunu müzakere | 255.05 | 4:15.05 | 10.202.925 | −16.6 | `7457624ba0df` |
| `jr_06_sosyal-22` | Türk dünyasıyla kültürel iş birliği | 257.30 | 4:17.30 | 10.293.165 | −16.5 | `ca1306b793e7` |
| `jr_06_sosyal-23` | İslam medeniyetinin ortak mirası | 256.82 | 4:16.82 | 10.273.965 | −17.0 | `fb63df1b4811` |
| `jr_06_sosyal-24` | Dijitalleşme ve vatandaşlık | 253.08 | 4:13.08 | 10.124.205 | −16.3 | `d1c8d01d826e` |
| `jr_06_sosyal-25` | Yatırım ve pazarlama proje önerisi | 261.65 | 4:21.65 | 10.466.925 | −16.6 | `e900f095f6d0` |
| `jr_06_sosyal-26` | Telif ve patent | 256.06 | 4:16.06 | 10.243.245 | −16.5 | `37f2896f0bf5` |

Altı kaset de 300 saniyenin altındadır. Sert bandın içindedirler (taban yaklaşık 197–221 saniye). Betik «katalog temposu oyuncu saatinin altında, metin tam, dosya yazılır» dedi. Retry atılmadı. Dosyalar `public/media/junior/audio/{anahtar}.mp3` yolunda durur. İnceleme bu altı süre içindir; silinmedi.

Oynatıcı adresleri:

- https://yetkin.ai/junior/ders/jr_06_sosyal-21
- https://yetkin.ai/junior/ders/jr_06_sosyal-22
- https://yetkin.ai/junior/ders/jr_06_sosyal-23
- https://yetkin.ai/junior/ders/jr_06_sosyal-24
- https://yetkin.ai/junior/ders/jr_06_sosyal-25
- https://yetkin.ai/junior/ders/jr_06_sosyal-26

### 13.2 Manifest ve vitrin

`npm run generate:junior-audio-manifest` **80** kayıt bastı. Eklenenler yalnız bu altı Sosyal Bilgiler anahtarıdır. Önceki sicil 74 idi.

`scripts/sync-junior-lesson-face.ts` **92** başlık yazdı. Sosyal raf hafta sırasıyla 18 karttan **24** karta çıktı. Yeni sıra: `-1`, `-21`, `-9`, `-10`, `-11`, `-22`, `-5`, `-23`, `-7`, `-16`, `-18`, `-4`, `-17`, `-24`, `-12`, `-15`, `-25`, `-8`, `-20`, `-26`, ardından saat 0 park: `-2`, `-3`, `-6`, `-13`.

Yayın rafı 74'ten **80**'e çıktı. Yazarlık 111 kaldı. Fırın kuyruğunda 31 ders durur: matematik 26–38 (13), fen 21–38 (18). Sosyal 21–26 kuyruktan çıktı.

Kapsama sayacı 59 açık kaldı. `SB.6.1.3`, `SB.6.2.3`, `SB.6.3.2`, `SB.6.4.3`, `SB.6.5.3` ve `SB.6.6.2` açık listede durur. Fırın `processOpen` bayrağını kapatmaz.

### 13.3 Doğrulama

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-content` | Çıkış 0. 111 senaryo eşit, 13 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |
| `npm run verify:junior-speech` | Çıkış 0. 80 yayın dersi fırına hazır, yazarlık 111 |
| Vitest: takvim, ders zinciri, quiz dağılımı, sosyal quiz arşivi, ses manifesti | 5 dosya, 42 test geçti |

Raf testi Sosyal Bilgiler'de 24 kart bekler. Quiz anahtar sayısı 80'dir ve fırın siciliyle aynıdır. Sosyal soru arşivi 24 paket bekler. SEN kilidi «siz» zamirini sözcük sınırında arar; `jr_06_sosyal-24` anlatısındaki «izinsiz» bu kilidi bozmaz.

---

## 14. KURS 3 — Matematik on üç ders, tek istek

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Model | `gemini-3.8-flash-tts` (`VOICE_TTS`, `academyBakeVoiceModelId`) |
| Ses | Selim / Fenrir, tempo `0.94`, `tr-TR`, voicePrompt gönderilmedi |
| İstek | Kalite kapısı `QUALITY_RETRY_MAX = 1`. Süre veya kalite yüzünden aynı ders yeniden sentezlenmedi |
| Kapsam | `jr_06_mat-26` … `jr_06_mat-38` |
| Yazılan kaset | 13. Atlanan ders yok |

Her anahtar önce `--dry-run --course=jr_06_mat` fişi aldı. Havuz tam bu on üç anahtardı; hepsi Selim/Fenrir. Sonra `--confirm-gemini-spend --course=jr_06_mat --key=` ile tek başına yazıldı. Kurs bayrağı şart: bu anahtarlar pilot havuzunda değil, Matematik fırın adayındadır.

On bir ders ilk süreçte «kullanılan 1 istek» dedi ve çıktı 0 ile bitti. `jr_06_mat-34` iki ağ beklemesinden sonra yazıldı; süreç «kullanılan 3 istek» dedi, kalite tekrarı yok. `jr_06_mat-33` ilk süreçte üç ağ beklemesinden sonra `fetch failed` ile düştü; MP3 yazılmadı. Dosya olmadığı için aynı anahtar bir kez daha açıldı ve «kullanılan 1 istek» ile yazıldı. Kalite kapısı hiçbir derste ikinci sentez istemedi.

Sert süre bandı kelime × 0,4 saniye ile 720 saniye arasıdır. Bunun altı veya üstü dosyayı yazmaz. Oyuncu saatinin alt sınırı 300 saniyedir; metin tamsa betik uyarı basar ve dosyayı yine yazar.

### 14.1 Yazılan kasetler

Süre, fırın çıktısındaki MP3 saniyesidir. Saat, saniyenin dakika karşılığıdır. `?v=` manifest SHA'sının ilk 12 karakteridir.

| Anahtar | Başlık | Süre | Saat | Bayt | LUFS | `?v=` |
|---|---|---:|---:|---:|---:|---|
| `jr_06_mat-26` | Kesir ile bölme, sonlu ve devirli ondalık | 298.61 | 4:58.61 | 11.945.325 | −16.6 | `d9bc9c83c861` |
| `jr_06_mat-27` | Standart uzunluk ölçü birimleri | 286.39 | 4:46.39 | 11.456.685 | −16.5 | `c26f6f8c412e` |
| `jr_06_mat-28` | Sayı ve şekil örüntüsü | 283.22 | 4:43.22 | 11.329.965 | −16.9 | `ab8d4d2db23c` |
| `jr_06_mat-29` | Cebirsel ifadede algoritma | 272.66 | 4:32.66 | 10.907.565 | −16.3 | `57f563f2e0d3` |
| `jr_06_mat-30` | İki paralel doğru ve bir kesenin açıları | 285.72 | 4:45.72 | 11.429.805 | −16.5 | `836d0ea356f8` |
| `jr_06_mat-31` | İki kesenin oluşturduğu dörtgenler | 291.31 | 4:51.31 | 11.653.485 | −17.0 | `f79600a53e60` |
| `jr_06_mat-32` | Köşegenleri birbirini ortalayan dörtgenler | 289.82 | 4:49.82 | 11.593.965 | −16.6 | `430a707702f0` |
| `jr_06_mat-33` | Üçgen ve dörtgenlerin açı problemleri | 284.59 | 4:44.59 | 11.384.685 | −16.5 | `82495edb778a` |
| `jr_06_mat-34` | Çember uzunluğu ile çap | 296.11 | 4:56.11 | 11.845.485 | −16.4 | `db8a8fd5809c` |
| `jr_06_mat-35` | Çember uzunluğu problemleri | 284.66 | 4:44.66 | 11.387.565 | −16.4 | `2fa402d00c0d` |
| `jr_06_mat-36` | Merkez açı ve gördüğü yay | 285.77 | 4:45.77 | 11.431.725 | −16.7 | `f264feebf0d8` |
| `jr_06_mat-37` | Başkasının istatistiksel yorumunu tartışma | 312.02 | 5:12.02 | 12.481.965 | −16.6 | `df6a3752ca4c` |
| `jr_06_mat-38` | Gözleme dayalı olasılık | 292.54 | 4:52.54 | 11.702.445 | −16.1 | `478d2cb6b962` |

`jr_06_mat-37` 300 saniyenin üstündedir. Diğer on iki kaset oyuncu saatinin altındadır. Sert bandın içindedirler (taban yaklaşık 204–224 saniye). Betik «katalog temposu oyuncu saatinin altında, metin tam, dosya yazılır» dedi. Kalite tekrarı atılmadı. Dosyalar `public/media/junior/audio/{anahtar}.mp3` yolunda durur. İnceleme bu on iki süre içindir; silinmedi.

Oynatıcı adresleri:

- https://yetkin.ai/junior/ders/jr_06_mat-26
- https://yetkin.ai/junior/ders/jr_06_mat-27
- https://yetkin.ai/junior/ders/jr_06_mat-28
- https://yetkin.ai/junior/ders/jr_06_mat-29
- https://yetkin.ai/junior/ders/jr_06_mat-30
- https://yetkin.ai/junior/ders/jr_06_mat-31
- https://yetkin.ai/junior/ders/jr_06_mat-32
- https://yetkin.ai/junior/ders/jr_06_mat-33
- https://yetkin.ai/junior/ders/jr_06_mat-34
- https://yetkin.ai/junior/ders/jr_06_mat-35
- https://yetkin.ai/junior/ders/jr_06_mat-36
- https://yetkin.ai/junior/ders/jr_06_mat-37
- https://yetkin.ai/junior/ders/jr_06_mat-38

### 14.2 Manifest ve vitrin

`npm run generate:junior-audio-manifest` **93** kayıt bastı. Eklenenler yalnız bu on üç Matematik anahtarıdır. Önceki sicil 80 idi.

`scripts/sync-junior-lesson-face.ts` **105** başlık yazdı. Matematik rafı hafta sırasıyla 13 karttan **26** karta çıktı. Yeni sıra: `-5`, `-6`, `-7`, `-14`, `-26`, `-27`, `-11`, `-12`, `-13`, `-15`, `-17`, `-28`, `-29`, `-30`, `-31`, `-32`, `-33`, `-22`, `-21`, `-34`, `-35`, `-36`, `-18`, `-19`, `-37`, `-38`.

Yayın rafı 80'den **93**'e çıktı. Yazarlık 111 kaldı. Fırın kuyruğunda 18 ders durur: fen 21–38. Matematik 26–38 kuyruktan çıktı.

Kapsama sayacı 59 açık kaldı. `MAT.6.1.6`–`MAT.6.1.7`, `MAT.6.2.2`–`MAT.6.2.3`, `MAT.6.3.1`–`MAT.6.3.4`, `MAT.6.4.4`–`MAT.6.4.6`, `MAT.6.5.2` ve `MAT.6.6.1` açık listede durur. Fırın `processOpen` bayrağını kapatmaz. `outcomeWritten` 11, `outcomeTotal` 24 kaldı.

### 14.3 Doğrulama

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-content` | Çıkış 0. 111 senaryo eşit, 13 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |
| `npm run verify:junior-speech` | Çıkış 0. 93 yayın dersi fırına hazır, yazarlık 111. Katalog sesi Fenrir |
| Vitest: takvim, ders zinciri, quiz dağılımı, matematik quiz arşivi, ses manifesti, ses tasarımı | 6 dosya, 48 test geçti |

Raf testi Matematik'te 26 kart ve yukarıdaki hafta sırasını bekler. `jr_06_mat-5` hâlâ ilk karttır. Quiz anahtar sayısı 93'tür ve fırın siciliyle aynıdır. Matematik soru arşivi 26 paket bekler.

---

## 15. KURS 4 — Fen Bilimleri on sekiz ders, tek istek

| Alan | Değer |
|---|---|
| Tarih | 11 Ekim 2026 |
| Model | `gemini-3.8-flash-tts` (`VOICE_TTS`, `academyBakeVoiceModelId`) |
| Ses | Deniz / Fenrir, tempo `0.94`, `tr-TR`, voicePrompt gönderilmedi |
| İstek | Kalite kapısı `QUALITY_RETRY_MAX = 1`. Süre veya kalite yüzünden aynı ders yeniden sentezlenmedi |
| Kapsam | `jr_06_fen-21` … `jr_06_fen-38` |
| Yazılan kaset | 18. Atlanan ders yok |

Kurs dry-run havuzu tam bu on sekiz anahtardı; hepsi Deniz/Fenrir. Her anahtar önce `--dry-run --course=jr_06_fen --key=` fişi aldı, sonra `--confirm-gemini-spend --course=jr_06_fen --key=` ile tek başına yazıldı. Kurs bayrağı şart: bu anahtarlar pilot havuzunda değil, Fen Bilimleri fırın adayındadır.

On yedi ders ilk süreçte «kullanılan 1 istek» dedi ve çıktı 0 ile bitti. `jr_06_fen-35` konuşma isteğini bitirdi, kalite kapısını geçti ve WAV'ı diske indirdi. MP3 aktarımı sırasında üst süreç durdu; yarım dosya 1.572.864 bayttı. Kaset, aynı WAV'dan yeniden aktarıldı. İkinci Gemini isteği açılmadı. 429, ağ tekrarı ve kalite tekrarı yok.

Sert süre bandı kelime × 0,4 saniye ile 720 saniye arasıdır. Bunun altı veya üstü dosyayı yazmaz. Oyuncu saatinin alt sınırı 300 saniyedir; metin tamsa betik uyarı basar ve dosyayı yine yazar.

### 15.1 Yazılan kasetler

Süre, fırın çıktısındaki MP3 saniyesidir. `jr_06_fen-35` süresi, kurtarılan WAV'dan yazılan MP3'ün süresidir. Saat, saniyenin dakika karşılığıdır. `?v=` manifest SHA'sının ilk 12 karakteridir.

| Anahtar | Başlık | Süre | Saat | Bayt | LUFS | `?v=` |
|---|---|---:|---:|---:|---:|---|
| `jr_06_fen-21` | Alınan yol ve yer değiştirme | 269.30 | 4:29.30 | 10.773.165 | −16.8 | `ddcf92da28d1` |
| `jr_06_fen-22` | Üreme | 277.85 | 4:37.85 | 11.114.925 | −16.4 | `c5b540c5798a` |
| `jr_06_fen-23` | Büyüme | 274.06 | 4:34.06 | 10.963.245 | −16.6 | `f3eb8bda65e0` |
| `jr_06_fen-24` | Çimlenme | 269.30 | 4:29.30 | 10.773.165 | −17.1 | `d9b5ae665ecc` |
| `jr_06_fen-25` | İnsan üreme organları | 384.74 | 6:24.74 | 15.390.765 | −16.3 | `399bd6bc00ac` |
| `jr_06_fen-26` | Canlılarda üreme ve büyüme | 281.02 | 4:41.02 | 11.241.645 | −16.3 | `b7aef299834b` |
| `jr_06_fen-27` | İç salgı | 259.08 | 4:19.08 | 10.364.205 | −16.8 | `2954efd2f908` |
| `jr_06_fen-28` | Ergenlik | 278.06 | 4:38.06 | 11.123.565 | −16.4 | `0400690b5b15` |
| `jr_06_fen-29` | Yansıma ve normal | 272.35 | 4:32.35 | 10.895.085 | −17.0 | `fdfe95e7e78e` |
| `jr_06_fen-30` | Ayna çeşitleri | 274.25 | 4:34.25 | 10.970.925 | −16.9 | `d812f8ee9431` |
| `jr_06_fen-31` | Soğurulma ve beyaz ışık | 265.44 | 4:25.44 | 10.618.605 | −16.4 | `3a9e0a6ee3dd` |
| `jr_06_fen-32` | Renk ve güneş enerjisi | 263.95 | 4:23.95 | 10.559.085 | −17.3 | `c3560cb1cd0e` |
| `jr_06_fen-33` | Genleşme | 430.08 | 7:10.08 | 17.204.205 | −16.6 | `f46387e60462` |
| `jr_06_fen-34` | Erime, donma ve kaynama | 262.10 | 4:22.10 | 10.485.165 | −16.9 | `76e4caa154d5` |
| `jr_06_fen-35` | Tümdengelim ve buzun yoğunluğu | 280.92 | 4:40.92 | 11.237.805 | −16.4 | `4e034ce8f6f2` |
| `jr_06_fen-36` | Ampul parlaklığının değişkenleri | 268.99 | 4:28.99 | 10.760.685 | −16.5 | `062519d4f008` |
| `jr_06_fen-37` | Biyoçeşitlilik ve tehditler | 269.21 | 4:29.21 | 10.769.325 | −17.1 | `d846cc313616` |
| `jr_06_fen-38` | Yakıt ve çevre problemi | 265.97 | 4:25.97 | 10.639.725 | −16.4 | `d164775c7a42` |

`jr_06_fen-25` ve `jr_06_fen-33` 300 saniyenin üstündedir. Diğer on altı kaset oyuncu saatinin altındadır. Sert bandın içindedirler (taban yaklaşık 200–218 saniye). Betik «katalog temposu oyuncu saatinin altında, metin tam, dosya yazılır» dedi. Kalite tekrarı atılmadı. Dosyalar `public/media/junior/audio/{anahtar}.mp3` yolunda durur. İnceleme bu on altı süre içindir; silinmedi.

Oynatıcı adresleri:

- https://yetkin.ai/junior/ders/jr_06_fen-21
- https://yetkin.ai/junior/ders/jr_06_fen-22
- https://yetkin.ai/junior/ders/jr_06_fen-23
- https://yetkin.ai/junior/ders/jr_06_fen-24
- https://yetkin.ai/junior/ders/jr_06_fen-25
- https://yetkin.ai/junior/ders/jr_06_fen-26
- https://yetkin.ai/junior/ders/jr_06_fen-27
- https://yetkin.ai/junior/ders/jr_06_fen-28
- https://yetkin.ai/junior/ders/jr_06_fen-29
- https://yetkin.ai/junior/ders/jr_06_fen-30
- https://yetkin.ai/junior/ders/jr_06_fen-31
- https://yetkin.ai/junior/ders/jr_06_fen-32
- https://yetkin.ai/junior/ders/jr_06_fen-33
- https://yetkin.ai/junior/ders/jr_06_fen-34
- https://yetkin.ai/junior/ders/jr_06_fen-35
- https://yetkin.ai/junior/ders/jr_06_fen-36
- https://yetkin.ai/junior/ders/jr_06_fen-37
- https://yetkin.ai/junior/ders/jr_06_fen-38

### 15.2 Manifest ve vitrin

`npm run generate:junior-audio-manifest` **111** kayıt bastı. Eklenenler yalnız bu on sekiz Fen Bilimleri anahtarıdır. Önceki sicil 93 idi.

`scripts/sync-junior-lesson-face.ts` **123** başlık yazdı. Fen rafı hafta sırasıyla 9 karttan **27** karta çıktı. Yeni sıra: `-1`, `-2`, `-9`, `-21`, `-10`, `-22`, `-23`, `-24`, `-25`, `-26`, `-16`, `-27`, `-18`, `-28`, `-29`, `-30`, `-31`, `-32`, `-33`, `-34`, `-12`, `-35`, `-19`, `-36`, `-20`, `-37`, `-38`.

Yayın rafı 93'ten **111**'e çıktı. Yazarlık 111 kaldı. Fırın kuyruğu boş. Fen dry-run «tümü yayında» dedi. İngilizce 6, Sosyal Bilgiler 6, Matematik 13 ve Fen Bilimleri 18 olmak üzere 43 derslik fırın kapandı.

Kapsama sayacı 59 açık kaldı. `FB.6.2.2`, `FB.6.3.1`–`FB.6.3.5`, `FB.6.3.7`–`FB.6.3.8`, `FB.6.4.1`–`FB.6.4.7`, `FB.6.5.1`–`FB.6.5.2`, `FB.6.5.4`–`FB.6.5.5`, `FB.6.6.2` ve `FB.6.7.1`–`FB.6.7.4` açık listede durur. Fırın `processOpen` bayrağını kapatmaz.

### 15.3 Doğrulama

| Komut | Sonuç |
|---|---|
| `npm run verify:junior-content` | Çıkış 0. 111 senaryo eşit, 13 kab, takvim planla aynı. Kapsama bilgisi 59 açık çıktı |
| `npm run verify:junior-speech` | Çıkış 0. 111 yayın dersi fırına hazır, yazarlık 111. Katalog sesi Fenrir |
| Vitest: takvim, ders zinciri, quiz dağılımı, fen quiz arşivi, ses manifesti, ses tasarımı | 6 dosya, 48 test geçti |

Raf testi Fen Bilimleri'nde 27 kart ve yukarıdaki hafta sırasını bekler. `jr_06_fen-1` hâlâ ilk karttır. Quiz anahtar sayısı 111'dir ve fırın siciliyle aynıdır. Fen soru arşivi 27 paket bekler.
