# TEDAVİ RAPORU — Aşama 2 / Paket 1 (Güvenlik, Temizlik ve İzolasyon)

| Alan | Değer |
|------|--------|
| Girdi | `docs/TESPIT_RAPORU.md` (Aşama 1) |
| Dal | `main` |
| Başlangıç HEAD | `db10963` |
| Bu paketin commit'leri | `1671a1b`, `895c74b`, `84b15e9`, `678f44b` (+ belge commit'i, bu raporla birlikte) |
| Kapsam | Adım 1.1 (ağaç hijyeni), 1.2 (shim/yetim temizliği), 1.3 (kutsal belge hizası) |
| Dokunulmayanlar | `AKADEMI_URETIM_ANAYASASI.md` içeriği, model tablosu, beş aşama kapısı, `model-roles.ts` model kimlikleri |

---

## 1. ÖZET

| Adım | Durum |
|------|-------|
| 1.1 3 korunan png geri yüklendi | Tamam |
| 1.1 `.tmp/ec102-puck-mp3/` silindi, `.gitignore` kontrol edildi | Tamam |
| 1.1 Commit edilmemiş EC-102 işi mantıksal commit'lere bölündü | Tamam (4 commit + belge commit'i) |
| 1.2 `curricula/ecommerce_ai/` shim dizini kaldırıldı | Tamam |
| 1.2 Eski import yolları kanonik `02_ecommerce_ai` yoluna çekildi | Tamam |
| 1.2 Yetim 4 dosya kaldırıldı (raporun 1.3.1 listesinden istenen) | Tamam |
| 1.3 Belge hizası (SSOT, Freemium, terminoloji, referans, tarihçe) | Tamam |
| Doğrulama | `tsc` temiz, `npm test` 239/239 dosya, `verify:boundaries` OK, `verify:api-auth` OK |

Plan dışı bir bulgu da düzeltildi: üretilmiş kenar `route-auth-map.ts` dosyası route'larla senkron değildi (Bölüm 3.4).

---

## 2. UYGULANAN DEĞİŞİKLİKLER

### 2.1 Adım 1.1 — Çalışma ağacı hijyeni

**Ekran görüntüleri.** `.cursorrules` gereği korunan üç dosya `git restore` ile HEAD'den geri yüklendi:

- `.system_docs/Ekran görüntüsü 2026-09-30 005227.png`
- `.system_docs/Ekran görüntüsü 2026-09-30 005251.png`
- `.system_docs/Ekran görüntüsü 2026-09-30 005309.png`

Doğrulama: `git status --short .system_docs` çıktısında artık `D` satırı yok; dosyalar diskte (300–323 KB).

**`.tmp/` temizliği.** `.tmp/ec102-puck-mp3/` (6 dosya, yaklaşık 194 MB) silindi. Hiçbir betik veya kod bu yola başvurmuyor (depo genelinde arandı; tek eşleşme Tespit raporuydu). Dizin `.gitignore` kapsamındaydı, yani bu dosyalar git'te yoktu ve geri getirilemez. Boş `.tmp/` dizini de kaldırıldı.

**`.gitignore` kontrolü.** Değişiklik gerekmedi. `git check-ignore -v` ile doğrulandı:

- `.tmp/` → satır 54
- `/media-bake/` → satır 69
- `.tmp-*.txt`, `tmp-*.txt`, `tmp/` → mevcut

Test koşusu için oluşturduğum geçici `.tmp-vitest-*.txt` dosyaları da bu desene uyuyordu ve iş bitince silindi.

**Commit bölümü.**

| Commit | İçerik |
|--------|--------|
| `1671a1b` | `media(academy)`: 37 dosya, EC-102 6 mp3 ve cinema jpg'leri (yalnız `public/`) |
| `895c74b` | `feat(academy)`: `02_ecommerce_ai/` (10 dosya, untracked'tı), `measure-display.ts`, `lock-ec102-cue-clock.ts`, `verify-ec102-live-media.ts`, cue/timings JSON, spoken-scripts, `lib/academy` güncellemeleri, `model-roles.ts`, ilgili testler ve script'ler |
| `84b15e9` | `chore(cleanup)`: shim, yetim dosyalar, bunları okuyan iki test satırı |
| `678f44b` | `fix(security)`: üretilmiş `route-auth-map.ts` ve sayım testi |
| (belge commit'i) | `.system_docs/*`, `.cursorrules`, `docs/TESPIT_RAPORU.md`, bu rapor |

Not: İlk denemede medya commit'ine, daha önce `git rm` ile staged edilmiş silmeler de karışmıştı. Commit'i geri alıp (`reset --soft`, sonra `reset`) medyayı yalnız `public/` yollarıyla yeniden commit ettim. Geçmişte bu yüzden tek bir medya commit'i var.

**Bilerek commit dışı bırakılanlar.** `docs/FAZ1_MASTER_RAPORU.md`, `HOTFIX_EC102_RAPORU.md`, `TEDAVI_RAPORU_01.md`, `TESPIT_RAPORU_01_GLM.md` silinmiş (`D`) durumda. Bunlar istemde geri yükleme kapsamında değildi; `.system_docs/README.md` `/docs`'un silinebilir olduğunu söylüyor. Silmeler olduğu gibi stage edilmeden duruyor (içerik git geçmişinde). İstersen geri yüklerim.

### 2.2 Adım 1.2 — Shim ve yetim temizliği

**Import yolları** (`ecommerce_ai` → `02_ecommerce_ai`):

| Dosya | Değişiklik |
|-------|------------|
| `lib/academy/cinema-cue-catalog.ts` | `.../curricula/02_ecommerce_ai/cinema-slides` |
| `scripts/bake-ec102-nano-slides.ts` | aynı |
| `tests/academy/ecommerce-ai-lesson-3.test.ts` | `.../curricula/02_ecommerce_ai` |

`lib/academy/curricula/index.ts` zaten kanonik yola çekilmişti. Bu işlem sırasında PowerShell'in `Set-Content` komutu üç dosyaya BOM eklemişti. BOM'u temizledim; son diff'lerde yalnızca import satırı var.

**Kaldırılanlar** (`git rm`; hepsi commit `84b15e9`):

| Dosya | Gerekçe |
|-------|---------|
| `lib/academy/curricula/ecommerce_ai/` (4 dosya: `cinema-slides.ts`, `index.ts`, `sections.ts`, `spoken-body.ts`) | İstemde istenen shim dizini. Kanonik ev `02_ecommerce_ai/` |
| `lib/showcase/catalog.ts` | Canlı kodda import eden yok. Dizin de boşaldı |
| `components/academy/level-pathway.tsx` | Canlı kodda import eden yok. `lib/academy/level-pathway.ts` (farklı dosya) yerinde ve kullanımda |

**Test uyarlaması.** İki surface testi silinen bileşeni `readSrc` ile okuyordu ve dosya yokluğunda patlardı:

- `tests/academy/citizen-surface.test.ts`: beş `readSrc("components/academy/level-pathway.tsx")` satırı tek `existsSync(...) === false` iddiasına indirildi.
- `tests/academy/course-seed-surface.test.ts`: aynı biçimde tek satır.

**Raporun yetim listesinden kaldırılmayanlar.** İstem yalnız dört dosya (`sections.ts`, `spoken-body.ts` shim'leri, `showcase/catalog.ts`, `level-pathway.tsx`) saydı. Tespit raporunun 1.3.1 tablosundaki şunlara dokunmadım: `lib/kernel/env.ts`, `lib/freelancer/released-proofs.ts`, 7 freelancer bileşeni, 3 legal bileşeni, `frozen-room-gone-page.tsx`. Raporun kendisi "silme öncesi manuel teyit gerekir" diyor.

**Bilinen yan etki.** `archived/` altındaki beş dosya (`pazaryeri/product-list`, `kurumsal/job-posting-list`, `arena/tender-board`, `social/proof-feed-list`, `hibe/program-list`) `@/lib/showcase/catalog` import ediyordu. O dizin `tsconfig.json` `exclude` listesinde, `.cursorrules` da "aktif ürün kodu değildir" diyor; bu yüzden `tsc` ve `verify:boundaries` etkilenmedi. Ancak bu müze dosyaları artık tek başına derlenmez. Müzeyi yeniden canlandırmak istenirse `catalog.ts` git geçmişinden (`db10963`) alınabilir.

### 2.3 Adım 1.3 — Kutsal belgelerin hizalanması

Belgelerde değişiklikler eklemeli yapıldı. `AKADEMI_URETIM_ANAYASASI.md` hiçbir satır değiştirilmedi. Çalışma ağacındaki mevcut (senin yaptığın) değişiklikleri olduğu gibi commit'e girdi. Model kimlikleri (`gemini-...`, `lyria-...`) hiçbir belgeye yazılmadı; mevcut testler `ANAYASA.md` ve `PEDAGOJI.md` içinde bu dizgilerin bulunmamasını zorunlu kılıyor.

| # | İstek | `ANAYASA.md` | `MANIFESTO.md` | `PEDAGOJI.md` | `.cursorrules` |
|---|-------|--------------|----------------|---------------|----------------|
| 1 | SSOT netleştirme | Üst bölüme "SSOT sırası" paragrafı; B4 karar tablosuna "Model ve rol kimliği" satırı | Dron durumu paragrafına tek cümle | Giriş paragrafındaki model cümlesi yeniden yazıldı | Dokunulmaz kart altına "SSOT hizası" paragrafı |
| 2 | Freemium | B4'e "Freemium ilkesi" maddesi + karar tablosuna satır | — | §A.5 "Ücretsiz önizleme (Freemium)" | İşaretçi tablosuna satır |
| 3 | Terminoloji | B1'e "Terminoloji hizası" maddesi | Dron durumu paragrafı | Giriş: mimari ad paragrafı | "Terminoloji" paragrafı + tablo satırı |
| 4 | Referans temizliği | — | Kural 2: `docs/specs/freelancer-vize-kapisi.md` → `lib/career/visa-gate.ts` ve `lib/freelancer/job-visa-lock.ts` | — | — |
| 5 | Tarihçe temizliği | "Son Reform" satırı silindi | "Son Reform" satırı silindi | "Son hiza 30 Eylül 2026" cümlesi silindi | (blok yoktu) |

Kararlar ve dikkat edilecek noktalar:

- **SSOT ile `.cursorrules` çelişkisi.** İstem, model/rol tanımının `model-roles.ts` içinde yaşadığını söylüyor. `.cursorrules` ve SOP ise "model tercihlerini Super Admin SOP belgesinden yönetir, uyumsuzlukta kod belgeye eşitlenir" diyor. İkisini tek cümlede uzlaştırdım: çalışma zamanı tek evi `model-roles.ts`; kilitli harita SOP belgesinde; kod haritayla aynı; uyumsuzlukta düzeltilen taraf koddur, harita silinmez. SOP'un yetki sırasını değiştirmedim. Bu cümleyi onaylaman iyi olur.
- **Freemium maddesi yalnız koddaki gerçeği yazar.** "İlk ders açık" kuralı `exam-path.ts` ilk anahtarından türetiliyor, DB bayrağı yok; madde bunu açıkça söylüyor. Önizleme kapsamı için "yalnız ilk dersin oynatımını açar" dedim. Dersi olmayan boş kabuk kursta önizleme yok (kodla uyumlu).
- **OFF-101 hazırlık şeridi:** Tespit raporunun F-2 bulgusu (OFF-101'de iki açık birim) belgeye "varsa hazırlık şeridiyle birlikte" ifadesiyle girdi. Kodda hazırlık şeridi sabit anahtarla (`01_office_ai-0`) tanımlı; `resolveAcademyEntitlement` adımında tek tabloya indirilmesi önerilir.
- **Terminoloji.** Eski "Amiral Gemi + Sürü Dron" dili artık yazılı bir eşleşmeyle bağlandı: Amiral Gemi = Pragmatik Monolit, Sürü Dron = `lib/dronlar/kayit.ts` kaydı + `DronBayrakları` + route öneki (ayrı dağıtım değil), Shared Kernel = `@yetkin/kernel`. `MANIFESTO.md` metninde `@yetkin/kernel` adı geçmiyor; bu, bir testin zorunlu kıldığı bir kural (`faz1-operating-picture-surface`).
- **"Son Reform" silinirken** `MANIFESTO.md` testinin aradığı "pazar, vizyon ve gelir modelinde kalır" ifadesi Statü satırına taşındı; yani ilke korundu, tarihçe gitti. "Tarih" satırlarına dokunmadım.
- **Belgelerdeki sayı tekrarı (D-4)** ve **Deniz/Selin persona ayrımı (D-2)** bu pakette istenmediği için yapılmadı (bkz. Bölüm 5).

---

## 3. DOĞRULAMA SONUÇLARI

### 3.1 Komutlar

| Kontrol | Sonuç |
|---------|-------|
| `npx tsc --noEmit --incremental false -p tsconfig.json` | exit 0 (shim/yetim silmeden sonra; test düzeltmelerinden sonra tekrar) |
| `npm test` (vitest, `*surface.test.ts` hariç, projenin tanımı) | **239/239 dosya, 1176/1176 test** |
| `npm run verify:boundaries` | OK (kernel↛dikey, UI↛prisma, oda↛oda, donmuş oda, tablo sahipliği) |
| `npm run verify:api-auth` | OK, 60 route (`session:36 public:18 admin:2 webhook:4`) |
| Belge ile ilgili hedefli testler (production-standard, pedagogy-doctrine, faz1/faz2 surface, citizen-surface) | Belge düzenlemelerinden kaynaklı hata yok (aşağıdaki iki istisna dışında) |

`npm run typecheck` (içinde `prisma generate`) yerine doğrudan `tsc` çalıştırıldı; şema değişmediği için sonuç eşdeğerdir.

### 3.2 İlk koşuda bulunan ve düzeltilen hatalar

| Hata | Neden | Düzeltme |
|------|-------|----------|
| `MANIFESTO.md` içinde `@yetkin/kernel` geçtiği için `faz1-operating-picture-surface` kırıldı | Test bu dizgiyi yasaklıyor | Terminoloji cümlesi "ince sözleşme paketi" olarak yeniden yazıldı |
| Aynı test "pazar, vizyon ve gelir modelinde kalır" arıyordu | Silinen "Son Reform" satırındaydı | Cümle Statü satırına taşındı |
| `tests/kernel/edge-api-auth.test.ts`: 56 bekleniyor, 60 geldi | Bölüm 3.4 | Beklenen sayı 60 yapıldı |
| `live-broadcast-shutdown` testi 5 sn zaman aşımı | Tam koşuda yük kaynaklı dalgalanma | Tekrar koşuda ve hedefli koşuda geçti; kod değişikliği yok |

### 3.3 Bu pakette çözülmemiş, bu paketten kaynaklanmayan hatalar

`npm test` bu iki dosyayı dışarıda bırakıyor (`--exclude **/*surface.test.ts`), ama elle koşulunca kırılıyorlar. İkisi de bu paketin dokunmadığı kodda:

1. `tests/academy/course-seed-surface.test.ts:84` — SQL tohumunun `office.title` ile örtüşme iddiası. Bu pakette yalnız aynı dosyadaki bir satırı (`level-pathway.tsx` yokluğu) değiştirdim; hata başka bir `it` bloğunda.
2. `tests/kernel/system-docs-contract-surface.test.ts` — `faz2-t3-dron-ring-surface.test.ts` içindeki `readSrc(".system_docs/ops/ops-dron.md")` çağrısını `read…docs/` yasak regex'iyle yakalıyor (`.system_docs/` içinde `docs/` geçiyor). `faz2-t3-dron-ring-surface.test.ts` bu pakette değişmedi.

Bunları HEAD'e karşı ayrı bir çalışma ağacında koşarak kanıtlamadım; nedenleri yukarıdaki okumaya dayanıyor. Aşama 3'te düzeltilmeleri önerilir.

### 3.4 Plan dışı bulgu: `route-auth-map.ts` eski kalmıştı

`scripts/verify-api-auth.ts` her koşuda `lib/kernel/security/route-auth-map.ts` dosyasını yeniden yazıyor. Dosya çalışma ağacında bu pakete başlamadan önce (değişiklik saati 22:21) zaten yeniden üretilmişti ama commit edilmemişti; büyük olasılıkla Tespit aşamasındaki `verify:api-auth` koşusu yazdı. Commit edilmiş (HEAD) sürümde dört route eksikti:

- `/api/academy/courses/[id]/exemption` → `session`
- `/api/academy/lesson-assistant` → `session`
- `/api/auth/hooks/send-email` → `webhook`
- `/api/auth/resend-confirmation` → `public`

Kenar (`proxy.ts`) bu harita üzerinden karar verdiği için, bu eksiklik güvenlik açısından önemliydi. Yeniden üretilmiş harita `678f44b` ile commit edildi ve sayım testi 56 → 60 yapıldı. Not: Sonraki her `verify:api-auth` koşusu dosyayı yeniden yazar; route eklenince dosyayı commit etmek gerekir. Bunu `verify:prebuild` veya CI'da "üretilmiş dosya commit'lenmiş mi" kontrolüne bağlamayı öneririm.

---

## 4. STRATEJİK / TARAFSIZ SORGULAMA

### 4.1 SEN OLSAYDIN NE YAPARDIM? — `resolveAcademyEntitlement` ne kadar kritik?

**Yüksek, ama bir sıra var.** İlk ders kuralı artık belgede yazılı; bu, kodun neyi korumak zorunda olduğunu netleştirdi. Bu yüzden entitlement tekleştirmesi "temizlik" olmaktan çıkıp "belgedeki sözü kodda tek noktada doğrulamak" işi oldu. Gerekçelerim:

- Tespit raporunun F-3 bulgusu hâlâ açık: `lesson-assistant` istemciden gelen `lessonKey`'i slug ile eşleştirmeden kabul ediyor. Şu an anahtarlar benzersiz olduğu için sızıntı yok; ama yeni kurs eklenince (03–05) bu varsayım bozulabilir.
- `access.ts` içinde yaklaşık 10 benzer kapı var. EC-102 satışı açıkken bu kapılardan birinde yapılacak küçük bir düzeltme, diğerini atlayabilir.
- Bu paketteki `route-auth-map` bulgusu, "aynı kararı birden fazla yerde tutmanın" sessizce nasıl eskidiğini gösterdi.

Yine de **EC-102 lansman duman testinden (canlı medya doğrulaması, anonim ders 1, ders 2 kabuğu, satın alma) önce** yapmam. Sıra: önce lansman doğrulaması ve "üç kursta ders 1 açık, ders 2 kapalı" sözleşme testi (davranışı dondurur), sonra refactor. Sözleşme testi refactor'un güvenlik ağıdır.

### 4.2 PLATFORM KURGUSU DOĞRU MU? — `verify:boundaries` sağlam mı?

**Evet, sağlam.** Kanıt: shim kaldırıldıktan, yetimler silindikten ve import yolları değiştikten sonra `verify:boundaries` OK ve `tsc` temiz.

Neden beklenen sonuç: Silinen `ecommerce_ai/` shim'i `lib/academy` içindeydi, yani dikey içi bir yeniden dışa aktarımdı. `lib/kernel` → dikey yönünde hiçbir kenar eklenmedi veya silinmedi. `level-pathway.tsx` ve `showcase/catalog.ts` canlı grafikte zaten yetimdi; grafiğe etkileri yoktu.

Sınırlar:

- `verify:boundaries` `archived/` dizinini kapsamıyor; oradaki beş dosyanın bozulduğunu bu araç göstermez (Bölüm 2.2).
- Duvar içe import yönünü denetliyor, dizin adı ↔ slug tutarlılığını değil. `office_ai` / `office_ai_2` / `social_media_ai` hâlâ slug önekini taşımıyor; yalnız EC-102 `02_` aldı. Bu tutarsızlık işlevsel değil, kozmetik; ama yeni kurslarda yinelenmesin diye bir kural (dizin adı = slug) eklenmeli.

### 4.3 GELECEK MASTER PLANI — `public/` 866 MB sınırı

Ölçüm (bu paket sonrası): `public/` **866 MB** (değişmedi), git paketi **3,78 GiB** (EC-102 yeniden fırını geçmişe eklendi). `.gitignore` yorumundaki "Vercel Pro 1 GB statik tavan" rakamını ben doğrulamadım; planı o rakama göre kurdum. Marj yaklaşık 134 MB, yani bir kurs mp3'ünün (~33 MB) 4 katı.

Önerdiğim takvim:

| Zaman | İş | Çıkış ölçütü |
|-------|----|--------------|
| **Lansman öncesi (gün 0–3)** | CI'da `public/` boyut koruması (850 MB uyarı, 950 MB hata). EC-102'nin yeniden fırınlanması dondurulur: her ek fırın ~200 MB git geçmişi ve diskte eski dosyaların üstüne yazma demek | Koruma yeşil; EC-102 açılır |
| **Lansman haftası (hafta 1)** | Anonim ders 1 sesi, bant genişliği ve hız sınırı izlemesi. Mimari karar: Supabase Storage (özel kova + imzalı URL) mı, S3/R2 + CDN mi | Karar belgesi; maliyet ve çıkış (egress) tahmini |
| **Hafta 2–3** | Medya manifesti (içerik hash'i, boyut, yol) repoya; mühür kapısı (`assertAcademyProductionSeal`) "diskte var" yerine "manifestte var ve depoda HEAD 200" okur. Mevcut HMAC grant, imzalı URL üreticisine bağlanır. Önce 1 kurs (EC-102) pilot olarak taşınır | Pilot kurs depo üzerinden oynar; `public/media` küçülür |
| **Hafta 4–5** | OFF-101 ve OFF-201 mp3/mp4/bed taşınır (608 MB'lık `public/media/` ana kalem). Cinema jpg (258 MB) ikinci dalga; isterse `next/image` + CDN | `public/` < 300 MB |
| **Yeni kurs (03–05) öncesi** | Bu iş bitmeden 03–05 fırınlanmaz | — |

Uyarı: Mühür kapısının "diskte fiziken var" koşulu `.cursorrules` ve SOP'un bir parçası. Bunu manifest tabanlı okumaya çevirmek, belge metnini değiştirmeyi gerektirir. Bu senin (Super Admin) kararın; ben yapmadım ve yapmam. Geçmiş ağırlığı (3,78 GiB) için `git filter-repo` ile geçmiş yeniden yazmayı önermem; yeni dosyaları depoya sokmamak yeterli, geçmiş kalır.

### 4.4 HER SEFERİNDE BİR SONRAKİ AŞAMA — Aşama 3 / Tedavi Paketi 2 (Test ve Doğrulama)

Önerilen sıra:

1. **Sözleşme testi:** "OFF-101, OFF-201, EC-102'de ders 1 (OFF-101'de hazırlık şeridi dahil) oturumsuz açık; ders 2 kapalı; lisans dolunca geri kapanır." Bu, yeni Freemium maddesinin test karşılığı.
2. **F-3 kapatma:** `lesson-assistant` isteğinde `lessonKey`'in `courseSlug`'a ait olduğunu doğrula; test ekle.
3. **`resolveAcademyEntitlement` ilk sürümü** (saf fonksiyon, yüzeyler teker teker ona geçirilir). Davranış 1. adımdaki testle dondurulmuş olur.
4. **Bozuk iki surface testinin onarımı** (Bölüm 3.3) ve `surface` testlerinin tam koşuya katılması ya da gerekçeli dışlanması.
5. **Tam kapı koşusu:** `npm run verify:prebuild` (sır taraması, `amountMinor`, RLS durumu, IDOR mühürleri, `ops:runtime-readiness`) ve Playwright E2E. Bu pakette koşmadım.
6. **Canlı Super Admin teyidi** (salt-okunur): Vercel Production'da `CANONICAL_SUPER_ADMIN_EMAIL` ve `SUPER_ADMIN_USER_ID`, `ops:runtime-readiness` çıktısında `superAdmin=configured`, canlıda `/admin` açılışı. Repodan yapılamaz; senin erişimin gerekir.
7. **`route-auth-map` commit disiplini:** `verify:api-auth` sonrası dosya farkı varsa CI kırmızı olsun.
8. **Onaylı yetim temizliği:** Bölüm 2.2'de bırakılan yetim modüller için liste sana sunulup tek tek onaylanır.
9. **Belge küçük işleri:** D-2 (Deniz persona ↔ Selin anlatıcı ayrımı) ve D-4 (belgelerdeki TTS sayı tekrarı; bu, `production-standard.test.ts` kilitleriyle birlikte düzeltilmeli).

---

## 5. AÇIK MADDELER ÖZETİ

| Madde | Durum / Karar sahibi |
|-------|----------------------|
| `docs/*` içindeki 4 silinmiş rapor | Stage edilmedi; geri yükleme kararı kullanıcıda |
| `media-bake/` (2,2 GB yerel WAV çıktısı) | Dokunulmadı (istem kapsamında değildi; gitignored) |
| Tespit 1.3.1'in kalan yetimleri | Manuel teyit bekliyor |
| `archived/` içinde `showcase/catalog` import eden 5 dosya | Bilinçli yan etki; müze derlenmez |
| SSOT cümlesinin SOP ile uzlaştırılması | Super Admin onayı önerilir |
| `course-seed-surface` ve `system-docs-contract-surface` testleri | Mevcut hata; Aşama 3 |
| Canlı Supabase/Vercel doğrulaması | Yapılmadı (erişim yok) |
