# TEDAVİ RAPORU — Junior tek kabuk ve kapalı BFF

Tarih: 20 Ekim 2026  
Dayanak: `docs/TESPIT_RAPORU.md` (CEO onayı).  
Bu tur ürün kodunu değiştirdi. `@yetkin/kernel` paketine Prisma, Supabase veya LLM eklenmedi. `packages/kernel` dosyalarına dokunulmadı.

---

## Uygulanan Tedaviler ve Değiştirilen Dosyalar

### 1. Junior ders sayfası tek sözleşmeye indi

Statik `app/junior/ders/jr_06_mat-1/page.tsx` silindi. Next.js statik segmenti dinamik `[lessonKey]` rotasının önüne geçiyordu; `jr_06_mat-1` katalog kapısına ve `LessonChain` gövdesine düşmüyordu.

Tek sayfa `app/junior/ders/[lessonKey]/page.tsx`:

- Katalog dışı üretim anahtarı (`JUNIOR_ENGINE_PRODUCTION_KEYS`, bugün `jr_06_mat-1` … `jr_06_mat-4`) ve kayıtlı blueprint varsa `JuniorEngineProductionLesson` çizer. Başlık blueprint’ten gelir. `robots` noindex kalır. Oturum ve yıllık paket bu dalda okunmaz; bu dersler katalog dersi değildir.
- Bilinen katalog anahtarı mevcut kapıdan geçer: oturum, `juniorLessonGate`, kilitli teaser, ücretsiz konuda `LessonChain`.
- Üretim anahtarı katalogla çakışırsa katalog dalı kazanır. `jr_06_mat-5` katalogdadır ve bu yüzden kapıdadır.

`JuniorEngineProductionLesson` artık ikinci bir stüdyo iskeleti kurmuyor. `JuniorLessonEngine` kabuğunu dolduruyor. Dokunsal ray varsa etkinlik stüdyosu, yoksa blueprint simülasyonu bağlanır.

`LessonChain` stüdyo ızgarasını iki koşuldan biriyle açar: pilot zaman çizelgesi (`isJuniorPilotPlaybackLesson`) veya kayıtlı blueprint (`hasJuniorLessonBlueprint`). `pilot-engine` saat kaynağı olarak durur. İkinci sayfa oynatıcısı kalkmıştır.

Kenar listesi `lib/junior/lesson-index.ts` içindedir ve lesson-engine gövdesini import etmez. `proxy.ts` bu listeyle bilinmeyen adrese 404 basmaya devam eder. Üretim anahtarları 404 adayı değildir. Katalog `juniorLessonKeyFromPath` hâlâ yalnız bilinen ders anahtarını döner; matematik 1–4 ders listesine ve site haritasına yazılmaz.

### 2. Hop dışı 410 uçları tek handler ve tek listeye indi

Akademi stüdyo artığı her dosyada kendi `ACADEMY_STUDIO_GONE` kopyasını taşıyordu. Metinler `lib/academy/studio-gone.ts` içinde toplandı. Freelancer uydu yolları `lib/freelancer/satellite-gone.ts` listesine eklendi. İkisinin birleşik envanteri `lib/closed-bff-surface.ts`.

HTTP gövdesi `lib/kernel/http/closed-surface-route.ts` içindeki `closedSurfaceGone`. Bu fonksiyon oda motoru import etmez. Route dosyaları `export const auth = "public"` ve 410 yorumunu taşımaya devam eder; `verify:idor-seals` iğneleri durur.

Donmuş oda yakalayıcısı `app/api/_gone/[...path]/route.ts` bu listeye alınmadı. O yüzey `frozenRoomGone` ve kenar `isFrozenRoomApi` ile «Bu oda üretimde kapalı.» basar. Akademi odası açıktır; stüdyo uçlarının vatandaş cümlesi ayrıdır (`Dersi dinle kapalı.` ve kardeşleri). Dosyayı silmek bu cümleyi genel oda cümlesine çevirir veya yolu 404 yapar. Mühür scriptleri dosya yolunu da ister.

### 3. Test

- `tests/kernel/junior-lesson-engine.test.ts` — blueprint ile üretim anahtarı aynı küme; statik sayfa yok; üretim dersi `JuniorLessonEngine` basar.
- `tests/kernel/junior-closed-beta.test.ts` — `jr_06_mat-4` kenarda bilinmeyen sayılmaz; `jr_06_mat-5` üretim anahtarı değildir; üretim kümesi katalogla kesişmez.
- `tests/kernel/closed-bff-surface.test.ts` — on kapalı uç ortak handler’a bağlıdır; `_gone` `frozenRoomGone` olarak kalır.

### Değişen ve eklenen dosyalar

| Dosya | Ne oldu |
|---|---|
| `app/junior/ders/jr_06_mat-1/page.tsx` | Silindi |
| `app/junior/ders/[lessonKey]/page.tsx` | Tek kabuk: üretim dalı + katalog dalı |
| `components/junior/lesson-engine/JuniorEngineProductionLesson.tsx` | `JuniorLessonEngine` adaptörü |
| `components/junior/lesson-engine/JuniorLessonEngine.tsx` | Dış rozet durumu kabul eder |
| `components/junior/lesson-chain.tsx` | Blueprint de stüdyo kabuğuna girer |
| `lib/junior/lesson-index.ts` | Üretim anahtarları `jr_06_mat-1..4` |
| `lib/junior/lesson-engine/registry.ts` | `hasJuniorLessonBlueprint` |
| `lib/junior/lesson-engine/index.ts` | Yeni fonksiyon export |
| `lib/academy/studio-gone.ts` | Yeni. Stüdyo 410 metni ve yolları |
| `lib/freelancer/satellite-gone.ts` | Uydu yol listesi |
| `lib/closed-bff-surface.ts` | Yeni. Birleşik hop dışı liste |
| `lib/kernel/http/closed-surface-route.ts` | Yeni. Ortak 410 fonksiyonu. Paket değil, gövde `lib/kernel` |
| `app/api/academy/generateSpeech/route.ts` | İnce 410 |
| `app/api/academy/discussion/route.ts` | İnce 410 |
| `app/api/academy/reviews/route.ts` | İnce 410 |
| `app/api/academy/courses/[id]/listen/route.ts` | İnce 410 |
| `app/api/academy/courses/[id]/pdf/route.ts` | İnce 410 |
| `app/api/(kernel)/admin/curriculum-revisions/route.ts` | İnce 410 |
| `app/api/freelancer/squad/route.ts` | İnce 410 |
| `app/api/freelancer/direct-offers/route.ts` | İnce 410 |
| `app/api/freelancer/direct-offers/[id]/accept/route.ts` | İnce 410 |
| `app/api/freelancer/direct-offers/[id]/decline/route.ts` | İnce 410 |
| `tests/kernel/junior-lesson-engine.test.ts` | Sözleşme testi |
| `tests/kernel/junior-closed-beta.test.ts` | Kenar kümesi |
| `tests/kernel/closed-bff-surface.test.ts` | Yeni |
| `docs/TEDAVI_RAPORU.md` | Bu rapor |

Çalışma ağacındaki diğer Junior diff’leri (etkinlik rayı, canlı koç, ses manifesti, pilot oynatıcı) bu turda yeniden yazılmadı. Sayfa ayrışması onların üstüne kapatıldı.

---

## Junior Oynatıcı Unification (Birleştirme) Özeti

Tek mimari sözleşme şudur.

| Ders | Adres | Sayfa | Gövde | Kapı |
|---|---|---|---|---|
| `jr_06_mat-1` … `jr_06_mat-4` | `/junior/ders/:key` | `[lessonKey]` | `JuniorEngineProductionLesson` → `JuniorLessonEngine` | Katalog dışı. Noindex. Ders listesinde yok. Kenar 404 basmaz |
| `jr_06_mat-5` ve pilot saatli dersler | aynı | `[lessonKey]` | `LessonChain` → `JuniorLessonEngineShell` | Katalog kapısı, anlatış, quiz, medya izni |
| Diğer katalog dersleri (ör. `jr_06_fen-1`) | aynı | `[lessonKey]` | `LessonChain` ray yerleşimi | Katalog kapısı |
| Bilinmeyen anahtar | aynı | kenar | 404 | `isUnknownJuniorLessonPath` |

Saat: kayıtlı timeline varsa `resolveJuniorEngineTimeline`, o da önce `getPilotTimelineForLesson`. `pilot-engine` grafik ve saat katmanıdır. Oynatıcı kabuğu `JuniorLessonEngine` / `JuniorLessonEngineShell`dir.

Yerel tarayıcı kontrolü (`next dev`, `http://localhost:3000`):

- `jr_06_mat-1` başlık «Üslü İfadeler ve Tekrarlı Çarpım». Üs kulesi sahnesi, etkinlik sekmeleri ve Üs Kulesi Lab açıldı. Eski kısa meta başlığı «Üslü İfadeler» yerini blueprint başlığına bıraktı; H1 ile aynıdır.
- `jr_06_mat-2` «İşlem Önceliği Kuralları» ve İşlem Önceliği Robotu. HTTP 200.
- `jr_06_mat-5` katalog başlığı, ısınma kapısı, eşleştirme rayı ve Bölünebilme Dedektifi rozeti. HTTP 200.
- `jr_06_fen-1` klasik anlatım oynatıcısı ve üçlü etkinlik rayı. Motor üretim çerçevesine düşmedi. HTTP 200.
- `jr_06_mat-99` HTTP 404.

`POST /api/academy/generateSpeech` gövdesi `{"ok":false,"error":"Dersi dinle kapalı.",...}` ve HTTP 410. `GET /api/academy/courses/x/listen` ve `GET /api/freelancer/squad` de 410.

---

## Sözleşme ve Tip Kontrol Sonuçları (Prebuild / Verification outputs)

`npm run verify:prebuild` çıkış kodu **0** (20 Ekim 2026, yerel). Bu komut `verify:v1-contract-artifacts` adımını da çalıştırır.

| Adım | Sonuç |
|---|---|
| `verify:no-secrets` | OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok |
| `verify:amount-minor` | OK — integer minor + PayTR sınır katmanı mühürlü |
| `verify:rls-status` | OK — Auth sync, FORCE RLS, owner SELECT |
| `verify:openapi-v1` | OK — JSON kopyası Zod sicili ile örtüşür |
| `verify:v1-client` | OK — `@yetkin/kernel` tipleri OpenAPI ile örtüşür |
| `verify:kernel-package` | OK — `@yetkin/kernel` saf; Dron tüketir |
| `verify:idor-seals` | OK — squad/direct-offer BFF 410; ardından ilgili Vitest dosyaları geçti |
| `ops:runtime-readiness` | Çıkış 0 (uyarı). Yerel lab: `NODE_ENV` production değil, hız deposu `in-process-single-node`, PayTR `sandboxSet=evet`, `mockCheckoutSet=hayır` |
| `verify:api-auth --check` | OK — 73 route. `{"session":46,"public":20,"cron":0,"admin":3,"webhook":4,"hybrid":0,"internal":0}` |
| `verify:public-size` | OK — public bütçesi uyarı eşiğinin altında |
| `verify:academy-curriculum` | OK — yazılmış eğitimler en az 6 ders ve ders başı 600 kelime |
| `verify:junior-content` | OK — 111 senaryo eşit, 13 kab |
| `verify:junior-audio-manifest` | OK — 111 anahtar; yerel ses SHA-256 ve bayt eşleşti |

Ayrıca:

- `tests/kernel/junior-lesson-engine.test.ts` — 5 test geçti.
- `junior-lesson-engine`, `closed-bff-surface`, `junior-closed-beta`, `curriculum-player-surface`, `citizen-surface` birlikte 25 test geçti (motor testi o turda 4’tü; üretim kabuğu render’ı sonra eklendi ve 5/5 geçti).

Hop sayısı 29 olarak kaldı. Yeni hop satırı yazılmadı.

---

## Kalan / Bilinçli Bırakılan Kilitler ve Bayrak Durumları

Bu turda açılmayan kapılar. Tespit raporundaki «bilinçli kilit» satırları durur.

| Kilit | Durum |
|---|---|
| Junior kasa | Kod aynı. `JUNIOR_CHECKOUT_OPEN` boşken checkout 410. Bu tur env açmadı, hop yazmadı |
| Freelancer kamu yüzeyi | `FREELANCER_PUBLIC_SURFACE_LOCKED` ve Split kapalı. Uydu route’ları 410 kaldı. İlan panosu sayfa gövdesine dokunulmadı |
| Young | `DRON_YOUNG_OPEN` açılmadı |
| Donmuş odalar | Studio, DevLabs, Kurumsal, Hibe, Arena, Pazaryeri, Social kenar 410 envanterinde kaldı. `_gone` dosyası `frozenRoomGone` |
| Canlı koç, ders asistanı, sohbet, kasa, sınıf | Hop sicilinde yok. Bilinçli olarak sicile eklenmedi |
| `06_`–`13_` yetişkin kabukları | Vitrin sırası ve ders yolu bu turda doldurulmadı |
| İki SQL akışı | Prisma migration ve Supabase RLS akışı yerinde |
| Üretim Redis çifti | Bu rapor canlı üretimi okumadı. Yerel readiness hız deposunu süreç içi bellek olarak yazdı |
| Matematik 1–4 | Erişilebilir üretim rotası. Katalog kartı, ücretsiz ilk konu ve `assertJuniorProductionSeal` konusu değiller |
| Çalışma ağacı | Değişiklikler commit edilmedi |

`GET /api/_gone/studio` bu yerel sunucuda HTML 404 döndü. Vatandaşın kapalı akademi ve freelancer uçları route dosyasından 410 alır. `_gone` donmuş oda mührünün dosyası olarak durur; bu tur onu yeniden bağlamadı.

---

## SEN OLSAYDIN NE YAPARDIN?

Bu tedaviden sonra gövde, tespit raporunun tarif ettiği kırığı kapatmış durumda. Ayrı `jr_06_mat-1` sayfası yok. Matematik 1–5 ve fen gibi katalog dersleri aynı route dosyasından, aynı çerçeveden (oda, ekmek kırıntısı, başlık) açılıyor. Saat hâlâ `pilot-engine` içinde. Kabuk `JuniorLessonEngine`. İki oynatıcının yan yana büyümesi bu sayfa katmanında bitmiş.

Kalite «mühürlü tek ürün» seviyesinde değil. Üç katman hâlâ ayrı iş yapıyor ve bu ayrım doğru:

1. Katalog dersi kapı, anlatış ve quiz taşır. `jr_06_mat-5` bunun örneği; tarayıcıda ısınma kapısı ve dedektif rozeti duruyordu.
2. Üretim dersi blueprint ve simülasyon taşır, paket ve profil yazmaz. `jr_06_mat-1` ve `jr_06_mat-2` bunu yaptı.
3. Klasik ders stüdyo ızgarasına girmez. `jr_06_fen-1` ray yerleşiminde kaldı.

Ben olsam matematik 2–4’ü kenar allowlist’ine, her birinin içerik mührü yazılmadan koymazdım. Aynı sözleşme bunu istediği için route açıldı; ders listesi ve indeks hâlâ kapalı. Doğrudan URL ile mühürsüz konu açılıyor. Bu, çift oynatıcıdan daha küçük bir risk ve ürün kararı olarak durmalı. Mühür öncesi ya bu dördü laboratuvar URL’si diye işaretlenir ya da kataloga alınıp `assertJuniorProductionSeal` geçirilir. İkisi birden «yayındaki 6. sınıf matematik» diye anlatılmamalı.

410 tarafında dosyaları silmezdim. Sildiğim yerde vatandaş cümlesi kaybolur, IDOR mührü kırmızı yanar, `_gone` ise bu sunucuda zaten 404. Ortak fonksiyon ve tek liste, haritayı inceltir, HTTP davranışını korur. Bu haliyle API yüzeyi hâlâ «route dosyası var» diye geniş görünür. Liste (`CLOSED_BFF_SURFACES`) artık o genişliğin okunabilir hali.

`@yetkin/kernel` ince kaldı. Yeni 410 fonksiyonu gövde `lib/kernel/http` içindedir; paket sınırına ve hop metasına girmez. Bunu şişirmek bu tedavinin işi değildi.

Kod ağacı commitlenmeden «tedavi bitti, yayında» denmez. Diskteki sayfa birleşmesi çalışıyor. Git geçmişine girmemiş hali, tespit raporunun uyardığı çalışma ağacı riskinin küçülmüş halidir. Sıfır değil.

Genel sağlamlık: sayfa sözleşmesi toparlandı, paket ve 29 hop bozulmadı, kapalı odalar sahte yeşil basmıyor. Kalan borç ürün kapılarında. Mimariyi bölmek hâlâ yanlış iş.

---

## Bir Sonraki Aşamada Ne Yapılmalı?

Son onay ve mühürden önce ilk üç aksiyon:

1. **Matematik 1–4 için mühür kararı.** Bu dördü ya katalog dışı laboratuvar rotası olarak kalır ya da senaryo, ses ve `assertJuniorProductionSeal` ile katalog dersine dönüşür. Karar yazılmadan yeni matematik konusu ve ikinci oynatıcı eklenmez. Bu tedavinin diff’i ancak o kararla birlikte commitlenir.
2. **Junior kasa kapalı kalır.** Açılış dört parçayla birden gelir: hukuki metin, fatura mührü, PayTR siparişi, `RAIL_V1_HOPS_META` satırı. `JUNIOR_CHECKOUT_OPEN=1` bu dördünün yerine geçmez. Telefona eklenecek ilk yazma, canlı koç değil, bu kasadır. Koç web’de kalabilir.
3. **Üretim env çifti, kod kilidi gibi okunur.** Yerel readiness hız limitini süreç belleğinde ve PayTR sandbox’ını açık gördü. Çok örnekli üretimde Redis URL ve token birlikte dolu olmalıdır. Sandbox üretimde kapalı olmalıdır. Freelancer ve Young bayrakları bu okumada açılmaz.

Bu üçü bitmeden yeni oda, yeni repo veya ikinci veritabanı açılmaz.
