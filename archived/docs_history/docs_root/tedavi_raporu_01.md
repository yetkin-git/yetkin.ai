# Tedavi Raporu 01 — Koç kapısı, 6. sınıf mühürü, tek içerik okuması

Tarih: 2026-10-31  
Dayanak: `docs/tespit_raporu_01.md`  
Kapsam: `/api/junior/live-tutor` model kapısı, pilot sınıf kısıtı, çalışma zamanı içerik okuması, artık dosya.  
Barındırılan Postgres bu turda yazılmadı. Yeni CHECK migration dosyasıdır; canlı veritabanına uygulanmadı.

## ADIM 1 — Live Tutor mühürü

Delik: rota `public` kalıyordu ve koç kolu `canEnterJunior` ile `juniorLessonAccess` okumadan `answerJuniorLiveTutor` çağırıyordu. Oturum varsa model, ders bağlamını (senaryo, kitapçık, zaman çizelgesi) yüklüyordu. Seçilmemiş seçmeli ders ve paketsiz oturum aynı delikten geçiyordu. Anlatış ve konu testi kolları zaten `isJuniorPilotTrialLesson` ile `jr_06_mat-1..3` dışını 403 kesiyordu.

Kenar haritası `public` bırakıldı. Misafir deneme anahtarlarının uç noktaya ulaşması için JWT kapısı kapatılmadı. Karar handler’dadır. `verify:api-auth --check` hâlâ 77 rota, sapma yok. `public` sayısı 22.

### Kapı

Yeni fonksiyon: `authorizeJuniorLiveTutor` (`lib/junior/live-tutor-access.ts`).  
Rota bunu, kota patlamasından sonra ve `answerJuniorLiveTutor` öncesinde çağırır.

Fonksiyon şunları okur:

- `juniorLessonAccess` — katalogda yoksa 404 (`Bu ders yok.`).
- `juniorPlanCoversLesson` — aktif yıllık paket çekirdek mühürlü dersi açar. Seçmeli ders, seçilmiş ve mühürlü değilse açılmaz. Fiyat dışı `jr_06_ing` paket kapsamı sayılmaz.
- `canEnterJunior` — oturumda niyet `paid-action`. Paket kapsamı veya denetim aktörü yoksa red. Misafirde niyet `lesson` okunur; sonuç, deneme listesinin yerine geçmez.

Karar:

| Kim | Ders | Sonuç |
|---|---|---|
| Misafir | `jr_06_mat-1`, `jr_06_mat-2`, `jr_06_mat-3` | Yerel yanıt. Model çağrılmaz. |
| Misafir | Bu üçlünün dışı | 403. Bağlam yüklenmez. |
| Oturum, paket yok | Kamuya açık açılış dahil her ders | 403 `Bu konu veli girişi ve yıllık paket ister.` Model ve bağlam yok. |
| Oturum, paket var, çekirdek | Mühürlü çekirdek ders | Model. |
| Oturum, paket var, seçmeli seçilmemiş | Örnek `jr_06_alm-2` | 403 kota cümlesi. |
| Oturum, paket var, seçmeli seçilmiş | Seçilen mühürlü kart | Model. |
| Denetim aktörü | Paket olmasa da | `canEnterJunior` `audit` kolu modeli açar. |

Seçili profil `readJuniorHome` ile aynı süzgeçten gelir: kapalı profil düşer, seçili açık profil yoksa ilk açık profil. Abonelik `isJuniorPlanActive` (`ACTIVE` ve süresi dolmamış).

İkinci kilit `answerJuniorLiveTutor` içindedir. `localOnly` değilse ve rota `modelAllowed: true` geçmediyse fonksiyon 403 döner. Bu dönüş, ders bağlamı yüklenmeden ve kota yazılmadan olur. Rota modeli yalnız `mode === "model"` iken açar. Misafir denemesi `localOnly` kalır.

Anlatış (`trialMode: "tell"`) ve konu testi (`trialMode: "quiz"`) kolları aynı üç derste durur. Onlar bu turun modeli değildir; mevcut 403 sınırları yerinde bırakıldı.

## ADIM 2 — Sınıf 6

Üç bant vardı: veritabanı `grade BETWEEN 5 AND 12`, ortaokul şeması 5–8, ürün 6.

Yapılan:

- Yeni migration `prisma/migrations/20261031193000_junior_pilot_grade_six/migration.sql`. `junior_profiles_shape` düşürülüp yeniden kurulur. Sınıf satırı `grade = 6`. Takma ad, doğum yılı ve kapanış profili (`nickname = 'Kapalı'`, doğum yılı boş) önceki kısıtla aynıdır.
- `prisma/schema/junior.prisma` alan yorumu pilot kolonun 6 olduğunu söyler.
- `juniorShelvesForGrade` sınıfı yok saymıyor. `grade !== 6` boş raf döner. 6. sınıf metni 7. sınıf satırına giydirilmez. `grade === 6` iken kişiye özel raf aynı kalır.

Ortaokul bandı `JUNIOR_SCHOOL_SEGMENT` (5–8) ve `JUNIOR_GRADE_MIN` / `JUNIOR_GRADE_MAX` yerinde durur. Bu bant Young’ın 9’dan başlaması içindir. Profil yazma zaten `JUNIOR_PILOT_GRADE` (6) dışında 403 veriyordu. Değişen, rafın bu sabiti gerçekten kullanması ve kolon kısıtının dosyaya inmesidir.

Canlı veritabanına `ALTER` çalıştırılmadı. Migration, apply planına girer. Uygulanmadan önceki satırlar hâlâ eski CHECK’i taşır. Tespit turundaki iki profil `grade = 6` idi. Başka sınıfta satır varsa apply o satırda durur; bu, kısıtın işidir.

## ADIM 3 — Hijyen ve tek okuma

### Silinen

`media-bake/` altındaki 8 `.log` silindi. Dizin `.gitignore` içindedir; ürün derlemesine girmez.

- `media-bake/junior/sosyal-kurs2-bake.log`
- `media-bake/junior/fen-course4/summary.log`
- `media-bake/junior/ing-batch/jr_06_ing_main-2.log`
- `media-bake/junior/ing-batch/jr_06_ing_main-4.log`
- `media-bake/junior/ing-batch/jr_06_ing_main-6.log`
- `media-bake/junior/ing-batch/jr_06_ing_main-9.log`
- `media-bake/junior/ing-batch/jr_06_ing_main-10.log`
- `media-bake/junior/ing-batch/jr_06_ing_main-11.log`

`docs/` içindeki iki görüntü (`WhatsApp Image 2026-10-31 at 00.47.08.jpeg`, `Ekran görüntüsü 2026-10-31 005225.png`) bu turda diskte yoktu. Silinecek dosya kalmamıştı. `app/apple-icon.png` yerinde durur.

### Tek kaynak

Katalog zaten `packages/junior-content` okuyordu (`juniorSealedCourseLessons`). Çift yazarlık, 19 graf saatinin ders cümlesini `lib/junior/content/**` dosyasından almasıydı.

Geçişten önce 19 dersin başlık, örnek ve `listenText` değeri paket senaryosu ile karşılaştırıldı. Sapma 0. Sonra graf dosyaları `juniorGraphLessonCopy` ile paketi okur. Sahne zamanı ve kareler graf dosyasında kaldı. Kaset metni bu kopyaya girmez; kaset mühürlü timeline çıktısıdır.

Grafikler:

- `fen-9`, `fen-10`, `fen-21`, `fen-37`, `fen-38`
- `mat-7` (`jr_06_mat-3`), `mat-11`, `mat-12`, `mat-13`, `mat-21`, `mat-22`, `mat-27`, `mat-30` … `mat-36`

`lib/junior/content/**/*.ts` silinmedi. `export:junior-content` bu ağaçtan JSON basar. `verify:junior-content` TypeScript senaryosu ile paket JSON’unun aynı olduğunu mühürler. Bu turda mühür geçti: 111 senaryo eşit, 13 kab. Dosyayı silmek yazarı kaldırır; çalışma zamanı okuması pakete alındı. Ders dizinleri (`mat`, `fen`, `ing`, `sosyal`, `turkce` `index.ts`) listeyi paketten kurmaya devam eder.

## ADIM 4 — Doğrulama

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | Geçti. |
| `npm run verify:api-auth -- --check` | Geçti. 77 rota. `public` 22, `session` 48, `admin` 3, `webhook` 4. |
| `npm run verify:boundaries` | Geçti. |
| `npm run verify:junior-content` | Geçti. 111 senaryo eşit, 13 kab. Açık kazanım listesi derlemeyi kırmaz. |
| `npx vitest run` | 392 dosya geçti, 8 dosyada 10 test kırıldı. 1942 geçti, 1952 toplam. |

Yeni ve etkilenen Junior testleri geçti: `tests/junior/live-tutor-access.test.ts`, `tests/junior/live-tutor.test.ts`, `tests/kernel/sicil-hizasi-surface.test.ts`, `tests/kernel/v1-hop-gate-surface.test.ts`, Junior zincir / mühür / graf sözleşmeleri.

Kırılan 10 test Akademi `01_office_ai-k1` kaset süresindedir. Beklenen uç yaklaşık 226 sn, diskteki timings yaklaşık 735 sn. Parça sayısı ve kurs toplamı da bu kasete bağlı. Bu tur Akademi ses dosyasına ve timings JSON’una dokunmadı. Kırılma listesi:

- `tests/academy/dron-punchcards-from-timings.test.ts`
- `tests/academy/office-ai-bridge-lock.test.ts`
- `tests/academy/office-ai-lesson-k1.test.ts` (2)
- `tests/academy/prep-strip-audio.test.ts`
- `tests/academy/production-standard.test.ts`
- `tests/academy/sealed-audio-pilot.test.ts` (2)
- `tests/academy/sealed-duration-band.test.ts`
- `tests/academy/tts-breath-chunks.test.ts`

## Bilinçli sınır

- Koç rotası kenarda `public` kaldı. Oturum zorunluluğu misafir denemesini kapatırdı.
- `JUNIOR_SCHOOL_SEGMENT` 5–8 olarak durur. Pilot kolon ve raf 6’dır.
- Sınıf CHECK’i dosyadadır. Barındırılan veritabanı bu turda değiştirilmedi.
- Yazarlık TypeScript ağacı durur. Çalışma zamanı cümlesi pakettedir.
