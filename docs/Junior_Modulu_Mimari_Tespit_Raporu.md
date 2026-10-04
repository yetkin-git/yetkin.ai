# YETKİN JUNIOR — MİMARİ TESPİT VE STRATEGİ RAPORU (FAZ 1)

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Kime | CEO ve SUPER_ADMIN |
| Kimden | Cursor Ajanı |
| Dil | Vatandaş lisanı. Teknik ad yalnız "nerede bakılır" diye parantez içinde geçer. |
| Kural | **Kod yazılmadı. Belge, ayar, veritabanı ve test dosyalarına dokunulmadı.** Bu dosya tek yeni dosyadır. |
| Kapsam | 10–18 yaş, 5–12. sınıf okul dersleri, oyunlaştırma, zekâ oyunları, seçmeli dersler, "Dinle ve Anlat" |

---

## 0. BİR SAYFADA ÖZET

**Kısa cevap:** Junior eklenebilir. Ama bugünkü haliyle "kayıt defterine birkaç satır ekleyelim" denecek bir iş değil. Üç sebep var, üçü de kodda doğrulandı:

| # | Bulgu | Önem |
|---|-------|------|
| 1 | **Anayasa Junior'u açıkça yasaklıyor.** `ANAYASA.md` B2: «18 yaş altı ürün yoktur. Junior kamu yüzeyi kilitlidir.» `PEDAGOJI.md` §A.3 aynısını söylüyor. `MANIFESTO.md` Kural 1: Faz 1'de yeni oda açmak için CEO + Super Admin **çift imza** ister. Kod da aynı yönde: `JUNIOR_PRODUCTION_LOCKED = true`. | **KIRMIZI — önce belge kararı** |
| 2 | **"Dinle ve Anlat" için bugün hiçbir şey yok.** Projede mikrofon, kayıt, konuşmayı yazıya çevirme kodu **sıfır**. Üstelik sitenin güvenlik başlığı mikrofonu **tüm sitede kapatıyor** (`microphone=()`, `lib/kernel/security/edge-security-headers.ts`). | **KIRMIZI** |
| 3 | **Bir eğitim eklemek bugün ~66 dosyaya dokunmak demek** (önceki rapor 261004, bu raporda yeniden doğrulandı: `05_prompt_practice` adı 66+ dosyada geçiyor). Junior'da 8 sınıf × ~8 ders = **~64 "kurs"** çıkar. Bu elle yapılamaz. Ayrıca `public/` klasörü zaten ~928 MB / 950 MB sınırında; tek bir okul dersi bile sığmaz. | **KIRMIZI — önce zemin** |
| 4 | **Arşivdeki eski Junior kodu işe yarar ama yarım ve tehlikeli kısmı var.** Yaş kapısı ve veli daveti kodu kullanılabilir. **Harçlık/cüzdan motoru kullanılmamalı** (Anayasa A1/A2/A5 ile çatışır). Tablolar zaten silinmek üzere yazılmış (`20260822010000_drop_frozen_room_tables`). | SARI |
| 5 | **Mevcut sertifika kapısı çocuk için uygun değil.** `/academy/dogrula/[hash]` oturumsuz herkese açık. Çocuğun adı/bilgisi orada görünürse KVKK sorunu olur. | SARI |

**Tek cümlelik görüşüm:** Önce (a) belge kararını imzalayın, (b) "yeni eğitim = ~66 dosya" ve "medya = `public/` içinde" sorunlarını Junior'dan **bağımsız** çözün, (c) sonra **tek sınıf, tek ders, kapalı pilot** ile başlayın. Sırayı tersine çevirirseniz Junior mevcut yetişkin ürününü de yavaşlatır.

---

## 1. NASIL ÇALIŞTIM, NELERİ GÖREMEDİM

**Okuduklarım (salt okunur):** `.system_docs/ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`, `AKADEMI_URETIM_ANAYASASI.md` (model haritası), `STORAGE_CONTRACT.md`; `packages/kernel/src/catalog-ids/course-registry.ts`; `lib/kernel/catalog-ids/*`; `lib/dronlar/kayit.ts`; `lib/kernel/compliance/circuit-breakers.ts`; `lib/kernel/ai/*` (model rolleri, geçit, tipler); `lib/academy/*` (entitlement, exam, pilot-sku, production-standard, lesson-assistant, web-speech); `prisma/schema/*`; `prisma/migrations` (Junior ile ilgili üçü); `archived/lib|app|components|prisma/**/junior*`; `tests/junior/*`; `scripts/verify-junior-*`; `next.config.ts`; `tsconfig.json`; `vitest*.config.ts`; `apps/rail-is/src/ui/*`; `docs/261004_Tespit_Raporu.md`.

**Yapmadıklarım / göremediklerim (dürüst liste):**
1. Testleri, derlemeyi ve doğrulama betiklerini **çalıştırmadım**. Bulgular kod okumasına dayanır.
2. Canlı veritabanına **bağlanmadım**. Junior tablolarının canlıda silinip silinmediğini bilmiyorum (silme migrasyonu dosyada var, uygulanıp uygulanmadığını göremem).
3. Rakipleri (Doping Hafıza, Okulistik, Tonguç) **bu oturumda incelemedim**. Aşağıdaki rakip yorumları genel bilgime dayanır, güncel olmayabilir. Satın alma kararından önce rakip ürünleri bir de insan gözüyle gezin.
4. **Hukuk görüşü değildir.** KVKK, çocuk verisi, mesafeli satış, MEB mevzuatı notları "bakılacak yer" listesidir. Hukuk müşavirinin teyidi şart.

---

## 2. ADIM 1 — MEVCUT MİMARİ VE ALTYAPI TESPİTİ

### 2.1 Tek Kurs Kayıt Defteri, Akademi ile Junior'u ayırmak için nasıl genişletilmeli?

**Bugünkü durum** (`packages/kernel/src/catalog-ids/course-registry.ts`, ~590 satır):

- 14 kart var: 13 "kanon" + 1 kanon dışı (OFF-201).
- Her kartta `layer: 1 | 2 | 3`. Bu **hedef kitle değil**, yetişkin kursunun zorluk/fiyat basamağıdır (Temel/Orta/İleri).
- Dosyanın sonundaki `assertCourseRegistry()` kontrolü **sayıları sabit kodlamış**: «Kanon 13 olmalıdır», «Kanon dışı yalnız OFF-201», «Vitrin sırası 1–6», «Mobil liste iki kart», «Pasaport kapısı beş kod». **Junior kartı eklemek bu kontrolü anında kırar.** (Güzel yanı: kırılması "sessiz hata" değil, gürültülü durmadır.)
- Kurs kimliklerinin hepsi bu dosyadan türer: `ac_<slug>`, `course:<slug>`, `cat_academy_course_<slug>`, `exam_<slug>`.
- Ücretsiz önizleme kuralı da buradan türer: `lib/kernel/catalog-ids/exam-path.ts` her kartın `lessonKeys[0]` değerini "herkese açık ilk ders" sayar. **Junior kartları eklenince ilk dersleri otomatik herkese açık olur.** Bu Anayasa B4 Freemium ilkesine uygun, istenen bir şey.

**Önerim — "tek defter, iki bölme":**

| Karar | Öneri | Neden |
|-------|-------|-------|
| Ayrı defter mi, aynı defter mi? | **Aynı defter, `audience` alanıyla bölünmüş.** Yeni alan: `audience: "adult" \| "junior"`. Mevcut 14 kart `adult` olur. | "Her bilgi tek yerde" kuralı. İkinci bir `junior-registry` bağımsız doğarsa ikilik tam burada başlar. |
| Junior'a özel alanlar | Kartta `junior: { grade: 5..12, subjectKey, kind, curriculumYear }` bloğu. `kind` = `core` (zorunlu ders) \| `elective` (seçmeli) \| `brain-game` (zekâ oyunu). | 5–12. sınıf, ders, seçmeli, oyun aynı yapıya girer. Duolingo tarzı oyunlar "ders" değil "etkinlik" olduğu için `kind` şart. |
| `layer` alanı | Sadece `adult` için anlamlı kalsın. Junior kartında `layer` yerine `junior.grade` okunsun. | `layer` (zorluk basamağı) ile `grade` (sınıf) aynı şey değil. Karışırsa fiyat/vitrin mantığı bozulur. |
| Sayı kontrolleri | `assertCourseRegistry()` içindeki 13 / 1 / 1–6 / 2 / 5 kontrolleri **yalnız `adult` kartlarına** uygulansın. Junior için ayrı kontrol: «grade 5–12 aralığında», «aynı sınıf+ders ikilisi tekrarsız», «passportListed = false». | Yetişkin ürününün kilitleri gevşemez, Junior'un kendi kilidi olur. |
| Slug ve kod biçimi | Slug: `jr_05_fen`, `jr_08_matematik` … Kod: `JR-05-FEN`. Ders anahtarı: `jr_05_fen-1` (mevcut `<slug>-<n>` kalıbıyla uyumlu). | `academyCourseSlugFromLessonKey` ders anahtarından kursu bulur; kalıp bozulmazsa dokunmadan çalışır. |
| "Kurs" neye denir? | **Kurs = Sınıf + Ders** (örn. "5. Sınıf Fen"). Üniteler kursun içindeki ders gruplarıdır. | Satış, sınav ve ilerleme için doğal birim. 64 civarı kart. |
| Satış birimi | Tek tek ders satmayın. **Sınıf paketi** satın: `PriceCatalogEntry` içinde `moduleKey = "junior"`, `unitKey = "grade:5"`. | Şema zaten `moduleKey + unitKey` ile esnek (`prisma/schema/kernel.prisma`); **tablo değişikliği gerekmez**. Fiyat yine Super Admin'in veritabanı satırıdır (Anayasa A1). |
| Pasaport / Kariyer | Junior kartlarında `passportListed: false`, `nativeListed` başta `false`. | Kariyer vizesi ve pasaport yetişkin kanıt sistemidir. Çocuğu iş ilanı/vize ekosistemine sokmayın. |
| Dosya boyutu | Defteri üç dosyaya bölün: ortak tipler + `adult` + `junior`. Junior bölmesi **tablodan üretilsin** (sınıf × ders matrisi → kart). | 64 elle yazılmış kart ~4000 satır eder. Tablo + üretici fonksiyon "saf veri" niteliğini korur. |

**En kritik teknik engel — "öğrenen kimliği":** Bugün her şey `userId` ile bağlı: satın alma (`AcademyPurchase`, `@@unique([userId, courseId])`), ders tamamlama, sınav, sertifika. Junior'da **parası ödeyen (veli) ile öğrenen (çocuk) farklı kişi.** Motor `payerId` ve `learnerId` ayrımını bilmiyor. Bu ayrım yoksa ya sahte çocuk hesabı açarız ya da veli ile çocuk ilerlemesi karışır. Bu, kayıt defterinden daha büyük iştir.

### 2.2 Veritabanı ve katalogda Junior için "katman / modül tipi" nasıl kurulmalı?

Üç yol düşündüm:

| Yol | Ne yapar | Artı | Eksi | Karar |
|-----|----------|------|------|-------|
| A. Junior'u ayrı oda olarak aç (eski usul) | `lib/dronlar/kayit.ts` içinde yeni oda, ayrı motor | Yalıtım | **İkinci motor.** Giriş, sınav, ödeme, oynatıcı yeniden yazılır. "Her bilgi tek yerde" bozulur. | **Hayır** |
| B. Junior'u Akademi'nin içine göm, kabuk yok | Sadece kayıt defterine kart ekle | En az kod | Veli kontrolü, yaş kapısı, çocuk güvenliği için yer yok. Çocuk arayüzü yetişkin arayüzüne benzer. | **Hayır** |
| C. **Motor Akademi, kabuk Junior** | Aynı motor (ödeme, sınav, oynatıcı, kayıt defteri). Üstüne `/junior` kabuğu + veli/profil katmanı. | Tek motor, ayrı deneyim | Motorun "öğrenen kimliği" ayrımını öğrenmesi gerekir | **Öneri** |

**Önerilen veri omurgası (kavramsal, kod değil):**

- **Katalog:** `AcademyCourse` satırına `audience` (`ADULT` varsayılan / `JUNIOR`), `grade`, `subjectKey` alanları. Mevcut satırlar `ADULT` kalır → **yetişkin tarafı değişmez**.
- **Fiyat:** `PriceCatalogEntry` içinde `moduleKey = "junior"` (şema değişmez).
- **Veli ve çocuk:** Yeni küçük tablolar: `JuniorProfile` (veli hesabına bağlı çocuk profili: takma ad, sınıf, **doğum yılı**, rıza zamanı), `JuniorProgress` (kazanım bazlı ustalık), `JuniorXp` (oyun puanı). Hepsi `profileId` ile bağlı; erişim kuralı «oturum sahibi = velisi» olur (Anayasa A3 IDOR kuralıyla uyumlu).
- **Çocuk için ayrı e-posta/giriş açmayın (Faz 2'ye kadar).** `User.email` zorunlu ve tekil. 10–13 yaş çocuğun e-postası olmaz. «Netflix Çocuk profili» mantığı: **tek veli hesabı, altında çocuk profilleri**. Çocuğa ait kişisel veri (e-posta, telefon) hiç toplanmaz. KVKK yükü ve saldırı yüzeyi küçülür.
- **Doğum tarihi yerine doğum yılı + sınıf.** Eski kod `JUNIOR_MIN_AGE_YEARS = 10` ve `JUNIOR_ADULT_AGE_YEARS = 18` ile **yaş sınırı** koyuyordu (`archived/lib/junior/types.ts`). Sorun: 5. sınıfa başlayan bazı çocuk 9 yaşında, 12. sınıfa giden bazı genç 18 yaşında. Katı yaş kapısı bu çocukları dışarıda bırakır. **Üyelik sınıfa göre olsun, yaş yalnız "veli izni gerekir mi" kararı için kullanılsın.**
- **Oyun puanı (XP, elmas, seri) kesinlikle `Wallet`/`LedgerEntry` içine girmez.** Anayasa A1 («tek defter») ve A5 («sahte bakiye yasağı») gereği. Oyun puanı ayrı tabloda, **parayla alınamaz, paraya çevrilemez** olarak durmalı.
- **Fırın ve medya:** Junior için **ayrı üretim standardı dosyası** gerekir (bkz. 2.3 ve 4.2). Yetişkin `production-standard.ts` gevşetilmez.

**Eski kodla ilgili net karar:**

| Eski parça (`archived/lib/junior`) | Karar | Gerekçe |
|---|---|---|
| `age-gate.ts` (yaş hesabı) | **Uyarlayıp al** | Hesap mantığı doğru; sadece 10–18 duvarını sınıf tabanlı yapmalı |
| `invite-token.ts`, `invite-format.ts` (veli daveti, hash'li token, süre) | **Al** | Güvenlik açısından düzgün tasarım (token düz metin saklanmıyor) |
| `engine.ts` içindeki **harçlık** (`JuniorAllowance`, ledger yazımı) | **Alma. Sil.** | Platform çocuğa para tutamaz/dağıtamaz (A2); harçlık = ikinci bakiye (A1) |
| `meb-catalog.ts` (2 satırlık "iz") | **Sil** | Yerini kayıt defteri alır |
| `prisma-store.ts`, `junior.prisma` | **Yeniden yaz** | Tablolar `20260822010000` ile silinmek üzere; yeni şema yeni migrasyonla gelmeli |
| `tests/junior/*` (yaş kapısı, vekâlet ve mühür testleri; 3 dosya) | **Test fikirlerini koru, dosyaları taşı** | İyi test; senaryolar yeni yapıda tekrar kullanılır |

### 2.3 Ses/video oynatıcı ve yapay zekâ altyapısı "Dinle ve Anlat" için neye ihtiyaç duyuyor?

**Bugün var olanlar:**

- Oynatıcı: `components/academy/lesson-media-player.tsx` (892 satır). Tek `<audio>` + fon müziği `<audio>`; karaoke altyazı; zaman çizelgesi `lib/academy/lesson-audio-timings/*.json` (cümle başlangıç/bitiş saniyeleri).
- Sesli okuma: mühürlü MP3 (fırında üretilmiş) + tarayıcı sesi yedeği (`lib/academy/web-speech.ts`).
- Yapay zekâ geçidi: `lib/kernel/ai/llm-gateway.ts`. **`inlineMedia` alanı var** (`LlmInlineMedia`: `mimeType` + `dataBase64`, `lib/kernel/ai/types.ts` ve `providers/gemini.ts`). Yani ses dosyasını modele **göndermek teknik olarak mümkün.**
- Bütçe kalkanı: kullanıcı başına günlük 200 000 token, dakikada 30 istek (`lib/kernel/ai/budget-shield.ts`). `AI_TOKEN_SOURCES.JUNIOR` kaynağı sicilde hazır duruyor.
- Ders asistanı: `lesson-assistant.ts` — yazılı soru, derse bağlı, 5 soru sınırı, konu dışı reddi. İyi bir örnek ama **yazılı**.
- Sınav: `exam-engine.ts` — yalnız çoktan seçmeli (`correctIndex`), 10 soru, baraj 70, puanlama sunucuda (Anayasa A4).

**Bugün eksik olanlar (hepsi doğrulandı):**

| # | Eksik | Kanıt | Ne gerekir |
|---|-------|-------|-----------|
| 1 | **Mikrofon kaydı yok** | `getUserMedia`, `MediaRecorder`, `SpeechRecognition` aramalarında proje kodunda **sıfır sonuç** | İstemci tarafında kısa ses kaydı bileşeni (15–45 sn), izin ekranı, "kaydediliyor" göstergesi |
| 2 | **Mikrofon tarayıcıda kapalı** | `EDGE_PERMISSIONS_POLICY_VALUE` = `camera=(), microphone=(), …`; bir test bunu kilitliyor (`tests/kernel/edge-guard.test.ts`) | Başlık **yalnız `/junior/**` yolunda** `microphone=(self)` olmalı. Tüm siteye açılmamalı. Test güncellenmeli |
| 3 | **Konuşmayı yazıya çevirme / anlama yok** | Aynı arama | İki seçenek, aşağıda |
| 4 | **Dersi "durdurup soru sorma" mekanizması yok** | Oynatıcı yalnız oynat/duraklat/ilerle bilir | Dersin belirli saniyelerine "kontrol noktası" (checkpoint) bağlamak: ders durur → soru gelir → çocuk konuşur → geri bildirim → ders devam eder. Zaman çizelgesi JSON'u buna zemin |
| 5 | **Konuşma cevabını değerlendirecek model yolu yok** | `AKADEMI_URETIM_ANAYASASI.md` kilitli harita: ses **girişi** için satır yok | Super Admin kararı (aşağıda) |
| 6 | **Çocuk sesi için saklama/rıza politikası yok** | — | Sesi kaydetmeme ilkesi + veli rızası |
| 7 | **Bütçe** | Ses girdisi metinden çok daha pahalı | Junior için ayrı günlük tavan (`source: junior`) |
| 8 | **Sınav tipi yetersiz** | Yalnız çoktan seçmeli | Boşluk doldurma, eşleştirme, sıralama, sesli anlatım (biçimlendirici) soru tipleri |

**"Dinle ve Anlat" için iki teknik yol:**

| Yol | Nasıl | Artı | Eksi |
|-----|-------|------|------|
| **S1. Sunucuda yapay zekâ ile (öneri)** | Tarayıcı 15–45 sn kaydeder → sunucuya yollar → mevcut geçit (`invokeLlm` + `inlineMedia`) tek çağrıda hem anlar hem değerlendirir → **ses hemen silinir**, yalnız yazıya dökülmüş metin + puan kalır | Tüm tarayıcılarda çalışır; "doğru anladı mı" değerlendirmesi tek adımda; Türkçe kalitesi tarayıcı tanımadan iyi | Sesin yurt dışı sağlayıcıya gitmesi (KVKK m.9); ses token maliyeti |
| **S2. Tarayıcının kendi tanıması (Web Speech)** | Tarayıcı yazıya çevirir, sunucu yalnız metni değerlendirir | Ucuz; ses sunucuya gitmez (ama Chrome kendi bulutuna yollar) | Firefox/Safari desteği zayıf; Türkçe/çocuk sesi kalitesi değişken; mobil uygulamada (React Native) ayrı kod |

**Önerim:** Birincil yol **S1**, yedek yol **"yazarak anlat"** (mikrofon yoksa/izin verilmezse). S2'yi yedek olarak eklemek isterseniz Faz 3'te.

**Super Admin'e gidecek karar sorusu:** `AKADEMI_URETIM_ANAYASASI.md` kilitli haritada «ses girdisi anlama» rolü yok. Kod tarafında rol tavanı 8 (7 canlı + 1 mühürlü-ölü, `model-roles.ts`). İki yol var:
(a) mevcut `FAST_STREAM` (`gemini-3.8-live`, canlı sohbet) rolünü ses girdisi için de kullanmak — yeni rol açılmaz, tavan bozulmaz; **ama rolün görev tanımı genişler.**
(b) yeni rol eklemek — tavan 8'i aşar, Anayasa değişikliği ister.
**Ben haritaya dokunmadım ve dokunmayacağım** (`.cursorrules` dokunulmaz kartı). Karar SUPER_ADMIN'in. Benim tercihim (a).

**Önemli ilke:** "Dinle ve Anlat" **biçimlendirici** olsun (öğretir, puan/seri verir), **sertifika/mühür kararı vermesin.** Yapay zekâ değerlendirmesi her seferinde aynı sonucu vermeyebilir. Anayasa A4 «kanıt satın alınamaz, sunucuda puanlanır» ilkesini bozmamak için **resmî sınav kapısı deterministik kalmalı** (çoktan seçmeli/eşleştirme).

---

## 3. ADIM 2 — BİLGİ TEKRARI VE ATIL DOSYA TEMİZLİĞİ

### 3.1 Junior ile ilgili "hayalet" kalıntılar (ikilik yaratanlar)

Junior şu an **en az 15 yerde** iz bırakmış durumda. Hiçbiri canlıyı bozmuyor; ama Junior'u açmaya kalkınca hepsi tek tek elle ele alınmak zorunda ve biri unutulursa test/derleme sessizce yanlış çalışır.

| # | Yer | Ne durumda | Junior açılırken yapılacak |
|---|-----|-----------|-----------------------------|
| 1 | `archived/lib/junior/*` (12 dosya), `archived/app/junior/*`, `archived/components/junior/*` (4 bileşen) | Donmuş kod | Seçerek taşı (2.2 tablosu), kalanını sil |
| 2 | `archived/prisma/schema/junior.prisma` | Donmuş şema | Yeni şema yazılacak; bu dosya referans kalsın |
| 3 | `prisma/migrations/20260814070000_faz7_init`, `…20260819020000_junior_guardian_invites`, `…20260822010000_drop_frozen_room_tables` | Oluştur → davet ekle → **sil** | Eski migrasyonlara dokunulmaz; yeni migrasyon eklenir |
| 4 | `lib/kernel/compliance/circuit-breakers.ts`: `JUNIOR_PRODUCTION_LOCKED`, `JUNIOR_PRODUCTION_LOCKED_ERROR`, `isJuniorProductionFrozen`, `isVitrineRoomFrozen` içindeki Junior şartı, `FROZEN_DISK_ROOM_CATALOG` içindeki `junior` satırı | Kilit | Kilidi tek bayrağa bağla; katalogdan çıkar |
| 5 | `lib/dronlar/kayit.ts`: `FROZEN_DISK_ROOMS` içinde `"junior"` | Donmuş oda listesi (`DronBayrakları.isDonmus` buna bakıyor) | Listeden çıkar, `DRON_KAYIT` içine **kapalı doğan** kayıt olarak ekle |
| 6 | `vitest.aliases.ts` | `@/lib/junior` ve `@/components/junior` yolunu **arşive** çeviriyor | Junior canlıya geçince bu takma ad **canlı kodu arşive yönlendirmeye devam eder** → testler yanlış kodu çalıştırır. **En sinsi tuzak** |
| 7 | `next.config.ts`: `outputFileTracingExcludes` içinde `lib/junior/**` | Canlı kod paketten **dışlanıyor** | Satır silinmezse Junior kodu Vercel'e hiç gitmez |
| 8 | `tsconfig.json`: `tests/junior/**`, `tests/helpers/memory-junior.ts`, `junior-bond.ts` dışlamada | Tip denetimi dışı | Dışlamadan çıkar |
| 9 | `package.json`: `verify:junior-guardianship-seals` | Donmuş odanın mühür betiği (`archived/...` yollarını okuyor) | Yeni yapıya göre yeniden yaz |
| 10 | `scripts/verify-atomic-seals.ts` (13 Junior satırı), `verify-boundaries.ts`, `verify-sen-axis.ts`, `room-ceiling-lib.ts`, `dron-new.ts` | Donmuş odaları sayan betikler | Her biri güncellenmeli |
| 11 | `tests/junior/*`, `tests/helpers/memory-junior.ts`, `junior-bond.ts` | `test:frozen` altında | Yeni konuma taşı |
| 12 | `app/globals.css` (`[data-room="junior"]`, `.junior-quest`, `.junior-shield-card`), `components/ui/icons.tsx` (`junior: IconChild`) | Hazır "enerjik gençlik" teması ve simge | **Faydalı.** Tasarım başlangıcı olarak kalsın |
| 13 | `lib/kernel/ai/sources.ts`: `JUNIOR: "junior"` | Bütçe kaynağı hazır | **Faydalı.** Kalsın |
| 14 | `lib/academy/curricula/phase2-drafts/parent_teacher_ai/planned.ts`: «Çocuk hesabı açılmaz. Junior açılmaz.» | Belgeleme notu | Karar sonrası güncelle |
| 15 | Belgeler: `ANAYASA.md` B2, `PEDAGOJI.md` §A.3, `README.md`, `.system_docs/ops/ops-db.md`, `.cursorrules` | «Junior kilitli / 18 yaş altı yok» | Aşağıda 4.2 |

**Sonuç:** Junior'u açmak "tek bayrak çevirmek" değil, **15 noktalı bir söküm/dikim.** Bunun kontrol listesi Master Plan Faz 1'e yazıldı.

### 3.2 Junior'dan bağımsız ama Junior'u zorlaştıracak tekrarlar

| # | Tekrar | Kanıt | Junior'a etkisi |
|---|--------|-------|-----------------|
| T-1 | **Eğitim listesi ~66 dosyada** | `05_prompt_practice` adı 66+ dosyada; başlıca evler: `pilot-sku.ts` (435 satır, kurs başına sabitler: `ACADEMY_EC102_*`, `SM103_*`, `BOT104_*`, `PR105_*`), `instructors.ts` (üç ayrı harita), `catalog-seed.ts` (346 satır), `retired-storefront.ts` (**kendi 5 slug listesi**), `production-seal-manifest.ts` (37 geçiş), `cinema-cue-catalog.ts` (24 geçiş), `copy/seo.ts`, SQL dosyaları, 3–4 betik | 64 Junior kursu için imkânsız. **Önce "her şey kayıt defterinden türesin" refaktörü şart** |
| T-2 | **Mobil istemcide sabit fiyat etiketi** | `apps/rail-is/src/ui/academy-catalog.ts`: `slug === "01_office_ai_ileri" ? "₺1.290"` | Anayasa A1'e aykırı (fiyat kodda). Junior için aynı hata tekrarlanmamalı; **mevcut hata ayrıca düzeltilmeli** |
| T-3 | **Oda listesi üç yerde** | `lib/dronlar/kayit.ts` (asıl), `lib/kernel/rooms.ssot.ts` (**@deprecated yeniden dışa aktarım**, hâlâ 5 dosya import ediyor: `edge-security-headers.ts`, `room-ceiling-lib.ts`, 3 test), `lib/kernel/compliance/circuit-breakers.ts` içindeki ayrı `FROZEN_DISK_ROOM_CATALOG` (aynı odaların ikinci listesi) | Junior'u açarken üç yerde güncelleme gerekir. `rooms.ssot.ts` kaldırılmalı; katalog tek listeden türemeli |
| T-4 | **Kimlik dosyaları iki klasörde** | `packages/kernel/src/catalog-ids/*` (asıl) ve `lib/kernel/catalog-ids/*` (ince yönlendirme dosyaları) + `exam-path.ts`/`free-preview.ts` yalnız `lib/` tarafında | Zararsız ama ikinci ev izlenimi veriyor. Junior kimlikleri **yalnız paket tarafında** doğmalı |
| T-5 | **Kurs seviyesi iki yerde** | `course-registry.ts` (`level`, `layer`) ve `lib/academy/course-level.ts` (ayrı `ACADEMY_COURSE_LEVELS`) | Junior'da "seviye" yerine "sınıf" kullanılacak; karışma riski |
| T-6 | **Üretim standardı yetişkine göre sabitlenmiş** | `production-standard.ts`: kurs ≥ 45 dk, ders ≥ 5 dk, ders ≥ 600 konuşma kelimesi, kurs başına en fazla **100** ses isteği (`ACADEMY_MATCH_WHISTLE_MAX`) | Bir okul dersi (30+ kısa ders) bu tavanı aşar; 10 yaşındaki çocuğa 5 dk / 600 kelime ders de pedagojik olarak yanlış. **Junior için ayrı standart dosyası** lazım; yetişkin olanı gevşetilmemeli |
| T-7 | **Medya depoda duruyor** | `public/` ≈ 927,8 MB / hata eşiği 950 MB (`verify:public-size`); bir eğitim 90–200 MB | Junior bir sınıf-ders bile sığmaz. **Nesne depolamaya geçiş (önceki rapor Faz 3) Junior'un ön koşulu** |
| T-8 | **Ders metni ve zaman çizelgesi `lib/` içinde** | `lib/academy/lesson-audio-timings/*.json`, `lib/academy/curricula/<kurs>/section_N.ts` | Junior'da binlerce ders = kod deposu şişer. İçerik/zaman çizelgesi veri deposuna taşınmalı |
| T-9 | **Eski sayılar belgelerde** | `STORAGE_CONTRACT.md` ve `OPS_RUNBOOK.md` «yayın 8» (gerçek 6); `AGENTS.md` ile `.cursorrules` birbirine ters talimat içeriyor (önceki rapor bulgu 7 ve D-1; bu oturumda ayrıca doğrulamadım) | Junior belgesi yazılırken bu karışıklık çoğalmasın |

### 3.3 Silinmeli mi, kalmalı mı? (Junior açısından net liste)

- **Sil (Junior kararı çıkınca):** harçlık/cüzdan kodu, `meb-catalog.ts`, `rooms.ssot.ts`, `FROZEN_DISK_ROOM_CATALOG`'un Junior satırı, `vitest.aliases.ts` içindeki Junior takma adı, `next.config.ts`'teki `lib/junior/**` dışlaması.
- **Taşı ve uyarla:** yaş hesabı, veli daveti ve token mantığı, `tests/junior/*` senaryoları.
- **Kalsın:** `AI_TOKEN_SOURCES.JUNIOR`, `[data-room="junior"]` teması, `IconChild`, geçmiş migrasyonlar.
- **Dokunma (kural gereği):** `AKADEMI_URETIM_ANAYASASI.md` ve model haritası.

---

## 4. ADIM 3 — TARAFTARSIZ GÖRÜŞ, SORGULAMA VE MASTER PLAN

### 4.1 Ben olsam ne yapardım? (En kritik 3 dokunuş)

**Önce dürüst durum:** Doping Hafıza, Okulistik ve Tonguç gibi rakiplerin gücü; **öğretmen markası, yıllarca biriken soru bankası, basılı kitap/deneme sınavı ve MEB müfredatına birebir oturan içerik.** Bunu bizim 12 aylık sürede geçme ihtimalimiz düşük. LGS/YKS "soru bankası" savaşına **girmemenizi** öneririm. Biz teknolojide öne geçeriz, içerik hacminde değil.

**Üç dokunuş:**

**1. "Dinle ve Anlat" döngüsü — çocuk öğretmene değil, kendine anlatır (asıl fark yaratan).**
Rakiplerin çoğu "izle → test çöz" modelinde. Biz "dinle → **kendi sözlerinle anlat** → anında, kazanıma bağlı geri bildirim" yapabiliriz. Anlatarak öğrenmek bilinen güçlü bir yöntem. Teknik olarak: dersin belli saniyelerine kontrol noktası; çocuk 20–40 sn konuşur; yapay zekâ **o dersin kazanım listesine** göre «Doğru söylediklerin / Eksik kalan / Bir dahaki adım» üç parçalı yanıt verir. Kritik kural: yapay zekâ **serbest sohbet etmez**; mevcut ders asistanındaki "konu dışı reddi" ve "dersin metnine bağlılık" ilkeleri (`lesson-assistant-policy.ts`) burada da zorunlu. Çocuk güvenliği için bu şart.

**2. Kazanım haritası + aralıklı tekrar motoru — oyunlaştırmanın gerçek motoru.**
Duolingo'yu iyi yapan konfeti değil, **"bugün hangi 5 dakikayı çalışmalıyım" sorusunu sizin yerinize çözmesi.** Bunun için her ders, soru ve oyun bir **MEB kazanım koduna** bağlanır; çocuğun kazanım başına "ustalık" puanı tutulur; unutma eğrisine göre günlük 5–10 dakikalık oturum otomatik kurulur. Bu kısım **yapay zekâ gerektirmez** (düzenli bir hesap), dolayısıyla ucuz ve her seferinde aynı sonucu verir. Zekâ oyunları ve seçmeli dersler de aynı kazanım iskeletine bağlanınca "oyun" ile "ders" birbirinden kopuk olmaz.

**3. Veli şeffaflığı ve çocuk güvenliği — pazardaki gerçek farklılaşma (güven).**
Çocuk ürününde veli kararı verir. Yapabileceğimiz en güçlü şey: **veliye haftalık sade rapor** («Bu hafta 4 gün çalıştı; kesirde zorlandı; şu üç soruyu sormanız yeter»), **sesin kaydedilmediğinin** açık yazılması, çocuğun başka kullanıcılarla yazışamaması, günlük süre sınırı, reklam yok. Bu aynı zamanda KVKK yükünü azaltan mimari tercihtir. Ücretli «veli paneli» de doğal bir satış ayağıdır.

**Bu üçünün altındaki beton (diferansiyatör değil, zorunluluk):** (a) kayıt defterinden türeyen içerik hattı, (b) medyanın nesne depolamaya taşınması, (c) Junior'a özel üretim standardı. Bunlar olmadan üç dokunuş de ölçeklenmez.

**Dürüst uyarılar:**
- **Duolingo tarzı oyunlaştırma çocuklarda çift ağızlı kılıçtır.** Seri kaybetme korkusu, sınırsız ödül döngüsü, "bir tur daha" tuzakları etik ve itibar riski taşır. Önerim: günlük hedef **tavanlı**, ceza değil sakin geri bildirim, paralı ödül/kutu **yok**. Bu, Manifesto'daki "Quiet Luxury / güven bağırmaz" duruşuyla da uyumlu.
- **Yapay zekâ çocuğa yanlış bilgi verebilir.** Okul dersinde yanlış bilgi, ofis dersinden daha ağır sonuç doğurur. Her Junior dersi, **yapay zekâ üretimi + insan öğretmen denetimi** ile yayınlanmalı. Mevcut «3 aşamalı kontrol kapısı»nın 2. kapısı (gözden geçirme) bugün operatör disiplinidir, kodda zorunlu değil; Junior için **kodda zorunlu** olmalı (bkz. Faz 1).
- **MEB ders kitabı metni telif konusudur.** Kazanım listesi kamuya açık; kitap metni değil. İçerik özgün yazılmalı. Hukuk teyidi gerekir.
- **Kapasite gerçeği:** Tek kişilik/küçük ekip için 64 kurs çok fazla. Pilot tek sınıf-tek ders; sonra genişleme.

### 4.2 Kılavuz doküman sorgulaması — uyum mu, çatışma mı, eskimiş mi?

#### `ANAYASA.md`

| Madde | Durum | Not |
|-------|-------|-----|
| A1 Tek defter, fiyat dinamik | ✅ **Uyumlu** | Junior fiyatı `PriceCatalogEntry` (`moduleKey = "junior"`). **Harçlık/oyun parası defter dışı kalmalı ve parayla alınmamalı** |
| A2 Ödeme kuruluşu değiliz | ✅ **Uyumlu (şartlı)** | Alıcı **veli** olmalı, PayTR üzerinden. Çocuğa cüzdan/harçlık yok |
| A3 RLS / IDOR | ⚠️ **Genişletme gerekir** | «Veli, kendi çocuğunun verisini okur» yeni yetki kuralı; IDOR testi yazılmalı |
| A4 Kanıt satın alınamaz, açık doğrulama | ⚠️ **Çatışma riski** | `/academy/dogrula/[hash]` oturumsuz herkese açık. **Çocuğun adı/bilgisi bu sayfada görünemez.** Faz 1–2'de sertifika yok, uygulama içi rozet var; Faz 3'te "adsız/veli onaylı" doğrulama |
| A5 Dürüst yüzey | ✅ **Uyumlu** | Yapay zekâ cevabı belirsizse "emin değilim" demeli; sahte puan yok |
| **B2 satır 80: «18 yaş altı ürün yoktur»** | ❌ **DOĞRUDAN ÇATIŞMA** | **CEO + SUPER_ADMIN imzasıyla değişmeli.** Yeni cümle önerisi: «18 yaş altı ürün (Yetkin Junior) yalnız veli hesabı altında, veli rızasıyla ve ayrı kapalı bayrakla açılır.» |
| B1 Yeni oda = kayıt + sözleşme + bayrak | ✅ **Uyumlu** | Yeni yetenek önce v1 hop olmalı (tek native istemci kuralı) |
| B3 Mühürsüz satış kapalı, medya diskte | ⚠️ **Ölçeklenmez** | «Beş katman diskte aranır» kuralı Junior'da binlerce dosya demek. Kuralın ruhu «dosya gerçekten var»; depolama alanında doğrulamak ruhu bozmaz (önceki rapor 7.3) |
| B4 Beş medya katmanı + **elle üretilen ısınma videosu** | ❌ **Junior için uygulanamaz** | Her ders için elle video üretmek 64 kurs × 30 ders = **~2000 video**. Junior için ayrı, hafifletilmiş katman tanımı gerekir (**yetişkin standardını gevşetmeden**, ayrı bölüm olarak) |
| B4 «1 Eğitim Kodu = 1 Ses» | ⚠️ **Gerilim** | 64 kursa 64 ayrı ses bulunamaz (ses listesi sınırlı: `ACADEMY_INSTRUCTORS_BY_VOICE`). Junior için «1 ders alanı = 1 ses» gibi bir çözüm SA kararı ister |
| B4 Freemium (ilk ders açık) | ✅ **Çok iyi uyumlu** | Veliler için en güçlü satış kozu. Değiştirmeyin |
| B5 Pilot iş modelleri | ➕ **Eksik** | Junior'un gelir modeli (veli aboneliği/sınıf paketi) yazılmamış |

#### `MANIFESTO.md`

| Madde | Durum | Not |
|-------|-------|-----|
| 1.3 Hedef kitle | ❌ **Eksik** | Dört kitle sayılıyor; **veli (alıcı) ve öğrenci (kullanıcı) yok.** Beşinci kitle olarak eklenmeli |
| 1.4 «Quiet Luxury / sakin arayüz» | ⚠️ **Gerilim** | Çocuk ürünü enerjik olmak zorunda (`[data-room="junior"]` teması bunu zaten öngörmüş). Çözüm: «Junior'da renk ve hareket serbest; baskı/aciliyet/ödül tuzağı yok» diye ayrım yazmak |
| Kural 1 «Faz 1'de yeni oda açılmaz» | ❌ **Çift imza şartı** | Junior ya **Akademi'nin alt kanalı** (kayıt + bayrak, yeni oda sayılmaz) ya da Faz 2 odası olarak tanımlanmalı. Bu bir CEO kararı |
| 1.1 «Öğrendiğini mühürle. Mührün kapıyı açsın.» | ⚠️ **Yetişkin cümlesi** | Junior için ayrı vitrin cümlesi gerekir; mühür/vize/iş dünyası dili çocuğa uygun değil |
| Bölüm 3 Gelir motorları | ➕ **Eksik** | Junior, Motor 1'in (B2C Akademi) alt kanalı olarak yazılabilir |
| Kural 4 Dürüst yüzey | ✅ **Uyumlu** | — |

#### `PEDAGOJI.md`

| Madde | Durum | Not |
|-------|-------|-----|
| §A.3 «Junior oda ≠ başlangıç seviyesi. 18 yaş altı ürün yoktur» | ❌ **Çatışma** | Cümle kaldırılmalı/yeniden yazılmalı; «Temel Paketler yetişkin başlangıcıdır, Junior okul dersidir» ayrımı kalabilir |
| §A.2 SEN dili, tek iş tek cümle, jargon yasağı | ✅ **Çok uygun** | Çocuk dersi için ideal temel |
| §A.2.2 «Deniz Usta / Tezgâh / Tezgâhın bereketli olsun» persona | ❌ **Uygun değil** | Esnaf/ofis kişiliği; 10–17 yaş için ayrı persona gerekir (ör. sakin, meraklı abla/ağabey öğretmen) |
| §A.4 Reji: %80 canlı uygulama ekranı / %20 sinematik | ❌ **Uygun değil** | Okul dersinde «canlı Excel ekranı» yok; tahta, çizim, deney animasyonu, sayı doğrusu gerekir. Junior için ayrı reji tablosu |
| §A.3 Bilişsel yük (uzun paragraf yok, kısa rozet) | ✅ **Uyumlu** | Çocuklar için daha da önemli |
| §A.5 Freemium | ✅ **Uyumlu** | — |
| §B 3 aşamalı kontrol, 2. kapı «operatör disiplini» | ⚠️ **Yetersiz** | Çocuk içeriğinde pedagoji/doğruluk denetimi **kodda zorunlu** olmalı |
| §C Üç adım (şirket politikası, veri sınıfı, aktarım yolu) | ➖ İlgisiz | Yetişkin ofis içeriği |
| Seslendirme: «600 kelime / 5 dk taban» (kodda) | ❌ **Uygun değil** | Çocuk için 3–6 dk mikro ders doğru; ayrı taban |

#### `AKADEMI_URETIM_ANAYASASI.md` (yalnız okudum)

- Kilitli model haritasında **ses girdisi anlama** satırı yok → SA kararı gerekli (2.3).
- Metin aşamasında «1-B Metin Denetim: Cursor / Grok 4.7» var; Junior için **insan öğretmen denetimi** ek bir aşama olarak yazılmalı. Bunu SA kendi dokümanına yazar; ben dokunmam.

#### Genel sonuç

Belgeler **yetişkin ofis eğitimi için** çok iyi yazılmış ve içeride tutarlı. Junior'u "kısıtlayan" kısım kötü yazım değil, **bilinçli bir kapı**: B2 satır 80 ve Manifesto Kural 1. Bunlar gerçek kararlardır; "eskimiş" değil. Eskimiş sayılabilecekler: tek bir Pedagoji reji tablosunun ve persona'nın tek hedef kitleye göre yazılmış olması. Çözüm **belgeleri silmek/gevşetmek değil, her belgeye "Junior eki" bölümü eklemektir** (yetişkin kuralları aynen kalır).

### 4.3 Risk tablosu

| # | Risk | Olasılık | Etki | Önlem |
|---|------|----------|------|-------|
| R1 | Çocuk verisi (KVKK) — ses, ad, ilerleme | Yüksek | Çok yüksek | Sesi saklama, veli rızası, doğum yılı + takma ad, yurt dışı aktarım bildirimi, VERBİS/aydınlatma metni; hukuk teyidi |
| R2 | Yapay zekâ çocuğa uygunsuz/yanlış içerik | Orta | Çok yüksek | Konu dışı reddi, kazanıma bağlı cevap kalıbı, içerik filtresi, insan denetimi, kapalı pilot |
| R3 | Maliyet patlaması (ses girdisi pahalı) | Yüksek | Yüksek | Junior'a ayrı günlük tavan (`source: junior`), çocuk başına günlük sınır, kısa kayıt (≤45 sn) |
| R4 | `public/` doluluğu derlemeyi durdurur | Kesin (bir sonraki eğitimde) | Yüksek | Nesne depolama önce |
| R5 | Yetişkin ürününü bozma (regresyon) | Orta | Yüksek | `audience` varsayılan `adult`; yetişkin kilitleri aynen; `verify:prebuild` yeşil kalmadan birleştirme yok |
| R6 | Ödeme/sertifika yüzeyinde çocuk bilgisi sızıntısı | Orta | Yüksek | Faz 1–2'de sertifika yok; dogrula sayfası Junior'u hiç göstermez |
| R7 | İçerik hacmi (64 kurs) ekibi eritir | Yüksek | Yüksek | Tek sınıf-tek ders pilot; kalıp üretim hattı; sonra genişleme |
| R8 | Etik: bağımlılık yapan oyunlaştırma | Orta | Orta/Yüksek | Günlük tavan, ceza yok, paralı ödül yok |
| R9 | MEB mevzuatı / telif (kitap metni, özel öğretim sınırı) | Belirsiz | Yüksek | Özgün içerik; hukuk teyidi |
| R10 | Eski 410/410 envanterinin ve takma adların yanlış kodu çalıştırması (vitest alias, next trace) | Yüksek (unutulursa) | Orta | 3.1 kontrol listesi |

---

## 5. GELECEK MASTER PLANI

> **Genel ilke (sıfır risk):** Junior her aşamada **kapalı bayrakla** (`DronBayrakları` kapalı doğar) ve **ayrı modül anahtarıyla** (`junior`) yaşar. Yetişkin akışlarının testleri her adımda yeşil kalmak zorundadır. Her faz sonunda **kapı (gate)**: geçmeden sonraki faz başlamaz. Her fazda tek tuşla geri alma (kill-switch) vardır.

### FAZ 1 — KARAR VE ZEMİN (Junior kullanıcıya hiç görünmez)

**Amaç:** İmzaları almak, zemini sağlamlaştırmak, hayalet kalıntıları temizlemek. Canlıya yeni bir şey çıkmaz.

**1A. Kararlar (CEO + SUPER_ADMIN):**
1. Junior, Akademi'nin alt kanalı mı yoksa Faz 2 odası mı? (Manifesto Kural 1)
2. `ANAYASA.md` B2 satır 80 ve `PEDAGOJI.md` §A.3 değişikliğinin metni ve imzası.
3. Ses girdisi için model: mevcut `FAST_STREAM`'in kapsamı genişletilsin mi? (SA, kilitli harita)
4. Pilot sınıf ve ders (öneri: **5. sınıf Fen Bilimleri** — düşük sınav baskısı, anlatmaya uygun).
5. Alıcı model: veli hesabı + sınıf paketi (yıllık lisans) — fiyatı SA katalogda belirler.
6. Junior'da sertifika yok (rozet var) kararı.
7. Hukuk müşavirliği: KVKK (çocuk, yurt dışı aktarım, ses), mesafeli satış, reklam, MEB/telif görüşü.

**1B. Belge işleri (SA onayıyla; SSOT kurallarına uygun — sayılar kodda kalır):**
- `ANAYASA.md`: B2 yeni cümle; yeni madde **B6 Junior** (veli hesabı, ses saklamama, XP'nin defter dışı olması, sertifika kapısı).
- `MANIFESTO.md`: 1.3'e "Veli ve Öğrenci" kitlesi; Junior vitrin cümlesi.
- `PEDAGOJI.md`: **Ek-J bölümü** — Junior persona, reji tablosu, mikro ders süresi, kazanım bağı. Yetişkin bölümleri aynen kalır.

**1C. Teknik zemin (Junior'dan bağımsız faydalı işler):**
1. **Kayıt defterinden türetme:** `pilot-sku.ts`, `instructors.ts`, `retired-storefront.ts`, `catalog-seed.ts` listelerinin kayıt defterinden otomatik türemesi (yeni kurs = tek satır).
2. **Medya nesne depolamaya** (önceki rapor Faz 3) — mühür kapısı «depolamada var» olarak okur.
3. **`audience` alanı** (varsayılan `adult`) + `assertCourseRegistry` sayı kontrollerinin yalnız yetişkine uygulanması. Yetişkin davranışı değişmez; testle kilitle.
4. **Mikrofon başlığı:** `microphone=(self)` **yalnız `/junior/**`** için; `edge-guard` testi güncellenir; tüm sitede kapalı kalır.
5. **Junior üretim standardı** (`lib/academy/junior-production-standard.ts` gibi ayrı dosya): mikro ders süresi, TTS tavanı, **insan denetimi kodda zorunlu**; yetişkin `production-standard.ts` değişmez.
6. **Hayalet kalıntı söküm listesi** (3.1'deki 15 madde) — özellikle `vitest.aliases.ts`, `next.config.ts` trace dışlaması, `tsconfig` dışlamaları.
7. **Mevcut hata:** mobil istemcideki sabit `₺1.290` etiketi (T-2) düzeltilsin.
8. **Mikro-ölçüm:** `AI_TOKEN_SOURCES.JUNIOR` için ayrı günlük tavan.

**Kapı (Faz 1 → 2):** (a) imzalar tamam, (b) hukuk teyidi yazılı, (c) `verify:prebuild` + tüm testler yeşil, (d) `/junior` hâlâ 410, (e) yetişkin kurs sayfaları, satın alma ve sınav akışı regresyonsuz.

### FAZ 2 — KAPALI PİLOT (davetli 30–50 aile)

**Amaç:** Gerçek çocukla "Dinle ve Anlat"ın çalıştığını ve maliyetin taşınabilir olduğunu kanıtlamak. Para akışı **yok** (ücretsiz pilot).

**İş paketleri:**
1. **Veli hesabı + çocuk profili:** `JuniorProfile`, veli daveti/rızası (eski token mantığından uyarlama), profil seçici, günlük süre sınırı.
2. **`/junior` kabuğu** (kapalı bayrak; yalnız davetli veli): çocuk ana ekranı, günlük görev, oyun alanı, veli paneli. Mevcut tema ve `IconChild` başlangıç.
3. **Yeni v1 hop'lar** (Anayasa B1: yetenek önce hop): profil, ilerleme, "Dinle ve Anlat" gönder-değerlendir. Tek native istemciye hazır.
4. **Dinle ve Anlat v1:** kontrol noktalı oynatıcı, 15–45 sn kayıt, sunucuda tek çağrıda değerlendirme, **ses anında silinir**, yazılı yedek yol, konu dışı reddi, kota.
5. **Kazanım haritası v1 + aralıklı tekrar:** pilot dersin kazanımları, günlük 5–10 dk oturum, XP/seri (**tavanlı, ceza yok, defter dışı**).
6. **İçerik:** 1 sınıf × 1 ders × 1 ünite (≈8–10 mikro ders + 40–60 soru + 3 zekâ oyunu), insan öğretmen denetiminden geçmiş.
7. **Soru tipleri:** boşluk doldurma, eşleştirme, sıralama (deterministik).
8. **İzleme:** maliyet/çocuk/gün, mikrofon izni başarı oranı, yapay zekâ değerlendirmesinin insanla uyum oranı (örnekleme), olay kaydı.

**Başarı ölçütleri (örnek, SA/CEO kesinleştirir):** 7 gün geri dönüş ≥ %40; ilk hafta tamamlama ≥ %60; yapay zekâ geri bildirimi insan değerlendirmesiyle ≥ %85 uyumlu; çocuk başına günlük ses+yapay zekâ maliyeti belirlenen tavanın altında; **sıfır** güvenlik/gizlilik olayı; veli memnuniyeti ≥ 4/5.

**Kapı (Faz 2 → 3):** ölçütler karşılandı, hukuk "satışa açılabilir" dedi, maliyet modeli yıllık fiyatı taşıyor, kill-switch tatbikatı yapıldı.

### FAZ 3 — KADEMELİ AÇILIŞ VE ÖLÇEK

**Amaç:** Para kazanmak ve kapsamı büyütmek, riski kademeleyerek.

1. **Satış:** Veli, PayTR üzerinden **sınıf paketi** (yıllık lisans) alır; fiyat SA'nın `PriceCatalogEntry` satırı (`moduleKey = "junior"`). Satış kapısı Anayasa B3 ile aynı (yayın + fiyat + medya mühürü). Ücretsiz önizleme: her kursun ilk dersi (B4).
2. **Kademeli sınıflar:** önce ortaokul (5→8), sonra lise (9→12). Her sınıf-ders ayrı "yayın kapısından" geçer.
3. **Ders çeşitliliği:** Türkçe, Matematik, Fen, Sosyal, İngilizce; **seçmeli** (kodlama, satranç, okuma) ve **zekâ oyunları** `kind` alanıyla.
4. **Lise öğrencisi için kendi girişi (15+):** veli onayıyla, ayrı gizlilik penceresi.
5. **Sertifika:** yalnız veli onaylı, adsız/kısmi doğrulama (`dogrula` sayfası için ayrı Junior kuralı) — yazılı hukuk teyidiyle.
6. **Mobil:** tek native istemcide Junior ekranları (aynı v1 hop'lar).
7. **Ses girdisi iyileştirme:** gerekirse tarayıcı tanıması (S2) yedek olarak.
8. **Veli raporları ve öğretmen/okul pilotu:** B2B keşif (Manifesto Motor 2) ile bağlanabilir.
9. **LGS/YKS hazırlık:** ancak içerik bankası olgunlaştıktan sonra, ayrı karar.

**Sürekli kontrol:** Her sınıf açılışında maliyet, şikâyet, yapay zekâ doğruluk örneklemesi ve olay raporu CEO'ya; eşik aşılırsa o sınıf otomatik kapanır (bayrak).

### Zaman değil, sıra

Takvim vermedim; çünkü süreyi içerik üretim hızı ve hukuk teyidi belirliyor, kod değil. Sıra bağlayıcıdır: **Karar → Zemin → Pilot → Satış.**

---

## 6. CEO İÇİN KARAR LİSTESİ (cevap bekleyen sorular)

| # | Soru | Neden önemli |
|---|------|--------------|
| 1 | Junior, Akademi'nin alt kanalı mı, ayrı oda mı? | Manifesto Kural 1 çift imzası |
| 2 | Anayasa B2'deki «18 yaş altı ürün yoktur» cümlesi değişsin mi? | Her şeyin ön koşulu |
| 3 | Ses girdisi için `FAST_STREAM` kapsamı genişletilsin mi, yoksa yeni rol mü? | Kilitli harita SA'nın |
| 4 | Pilot sınıf/ders ne olsun? (öneri: 5. sınıf Fen) | İçerik ve hukuk planı buna göre |
| 5 | Çocuk girişi: veli hesabı altında profil mi (öneri), ayrı hesap mı? | KVKK ve mimari yük |
| 6 | İlk sürümde sertifika olsun mu? (öneri: hayır, rozet) | `dogrula` kamu sayfası riski |
| 7 | Junior ayrı persona/ses/reji (Pedagoji Ek-J) yazılsın mı? | Mevcut tezgâh persona'sı uygun değil |
| 8 | Hukuk müşavirliği (KVKK/çocuk verisi/MEB/telif) görevlendirilsin mi? | Faz 1 kapısı |
| 9 | Medyanın nesne depolamaya taşınması onaylanıyor mu? | Junior'un fiziksel ön koşulu |

---

## 7. KISA KAPANIŞ

- **Evet, yapılabilir.** Motorun çoğu (ödeme, lisans, sınav, oynatıcı, yapay zekâ geçidi, bütçe kalkanı) yeniden kullanılabilir; bu iyi haber.
- **Hayır, bugün başlanamaz.** Üç kapı kapalı: **belge kararı, medya depolama/üretim hattı, "Dinle ve Anlat" altyapısı (hiç yok).**
- **En çok dikkat edilecek şey** teknik değil: **çocuk verisi ve çocuk güvenliği.** Rakipleri geçecek şey içerik hacmi değil, **konuşarak öğrenme + veliye şeffaflık** olabilir.
- Bu rapor yazılırken **hiçbir kod, belge, ayar veya veritabanı değiştirilmedi.**
