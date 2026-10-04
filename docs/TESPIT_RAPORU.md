# TESPİT VE MİMARİ SAĞLIK RAPORU — Aşama 1

| Alan | Değer |
|------|--------|
| Tarih | 4 Ekim 2026 |
| Kime | CEO |
| Dil | Yalın Türkçe. Teknik ad yalnızca "nerede bakılır" diye parantez içinde geçer. |
| Kural | Sıfır risk. Koda, belgeye, ayara, veritabanına **hiçbir değişiklik yapılmadı.** Bu dosya tek yeni dosyadır. |
| Önceki rapor | `docs/TESPIT_RAPORU_260930.md` (30 Eylül). Bu rapor onun üstüne değil, **bugünkü durumun sıfırdan yeniden ölçümüne** dayanır. Onda yazılanların çoğu o günden beri düzeltilmiş; aşağıda ayrıca belirttim. |

---

## 0. BİR SAYFADA ÖZET

**Genel hava:** Temel sağlam, ama "son metre" tıkalı. Üç yeni eğitim (SM-103, BOT-104, PR-105) içerik ve medya olarak **bitmiş**, kod tarafında "yayında" diye işaretlenmiş, ama **veritabanında hâlâ kapalı** ve onu açacak yol (migrasyon) **kendi kilidine takılmış**. Yani bugün bu üç eğitim ücretsiz ilk dersiyle izlenir ama **satılamaz.**

| # | Bulgu | Önem |
|---|-------|------|
| 1 | **Yeni üç eğitimin satışa açılması tıkalı.** Veritabanında `SM-103`, `BOT-104`, `PR-105` "yayında değil" ve fiyatları "pasif". Bunları açan SQL dosyası (`20261003230400_…publish.sql`) diskte duruyor ama migrasyon aracının kilitli listesinde yok; araç "14 dosya var, 13 bekliyordum" diye **durur.** | KIRMIZI |
| 2 | **`public/` klasörü 927,8 MB.** Derlemeyi durduran hata eşiği 950 MB. Elde **~22 MB** pay var. Yeni bir eğitim ortalama 90–200 MB ekliyor. Bir sonraki eğitim derlemeyi kırar. | KIRMIZI |
| 3 | **Son commit'ten sonra 318 dosya değişmiş** (1 Ekim 23:02'den sonra). Yeni üç eğitimin metni, sesi, görseli, videosu muhtemelen **hiçbir yerde yedekli değil** (bu makinede `git` çalışmadığı için kesin teyit edemedim; dosya tarihlerinden çıkardım). | KIRMIZI |
| 4 | **Test paketi bugün 3 hata veriyor** (1193/1196 geçti). İkisi gerçek ve sürekli kırmızı (eski varsayımlı test + migrasyon listesi), biri yük altında zaman aşımı (tek başına çalışınca geçti). CI `npm run test` çalıştırıyor; yani bugünkü hâliyle CI kırmızı olur. | SARI |
| 5 | **"Her eğitimin ilk dersi ücretsiz" kuralı web'de kodda doğru ve kurs-bağımsız çalışıyor** (6 eğitimin hepsi dahil). **Eksik yer: mobil uygulama.** Orada ücretsiz izleme yok; ayrıca uygulama yalnız 2 eğitimi biliyor. | SARI |
| 6 | **`yapinet360@gmail.com` canlı veritabanında var, e-postası onaylı, kimliği ayardaki Super Admin kimliğiyle birebir aynı.** Kodda tam yetkili tek kişi o. Ama "tam yetki" dar: fiyat ve gösterge paneli var, **eğitimi yayına alma/kapatma düğmesi ve ikinci yönetici yok.** | YEŞİL / SARI |
| 7 | **Belgeler büyük ölçüde güncel** (30 Eylül'deki 8 sürtünmenin çoğu giderilmiş). Kalan: iki belgede "yayın 8" gibi eski sayılar, EC-102'de eski dua cümlesi, AGENTS.md ile .cursorrules'un birbirine ters talimatı. | SARI |
| 8 | **"Sürü Dron / Micro-Apps" hâlâ bir etiket, gerçek ayrı yapı değil.** Kod disiplinli bir **modüler monolit.** Bu iyi bir şey; belgeler de bunu açıkça söylüyor. Asıl sorun mimari değil, "yeni eğitim eklemek ~66 dosyaya dokunmak" ve medyanın depoda yaşaması. | SARI |

**Tek cümlelik görüşüm:** Yeni mimari kurmak yerine, önce bitmiş üç eğitimi güvene alıp satışa açacak "boru hattını" onarın; sonra bu hattı bir daha tıkanmasın diye sadeleştirin.

---

## 1. NASIL ÇALIŞTIM, NELERİ GÖREMEDİM

**Yaptıklarım (hepsi salt-okunur):**
- Kural ve kılavuz belgeleri okudum: `ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`, `AKADEMI_URETIM_ANAYASASI.md`, `.cursorrules`, `AGENTS.md`, `.system_docs/README.md`, `STORAGE_CONTRACT.md`, `OPS_RUNBOOK.md`.
- Kodu okudum ve ölçtüm: erişim kapıları, ücretsiz önizleme, Super Admin kararı, eğitim kayıtları, medya klasörleri, test ve doğrulama komutları.
- Çalıştırdığım kontroller: `tsc` (tip denetimi), `verify:academy-curriculum`, `verify:api-auth`, `verify:boundaries`, `verify:public-size`, `ops:runtime-readiness`, tüm `npm test`.
- Projenin kendi `.env.local` bağlantısıyla veritabanına **tek bir salt-okunur sorgu seti** gönderdim (`BEGIN READ ONLY` + `ROLLBACK`; yazma imkânı yok, sır yazdırılmadı). Sonuçlar 2. ve 3. bölümde.
- Geçici betiklerimi proje dışındaki geçici klasöre koydum; projeye yalnız bu rapor yazıldı.

**Göremediklerim / emin olmadığım şeyler (dürüst liste):**
1. **Canlı site (Vercel) ve canlı ortam değişkenleri.** Bu bilgisayardaki `.env.local` hangi veritabanına bağlıysa onu gördüm. Bu veritabanının "canlı" mı "laboratuvar" mı olduğunu repodan **kanıtlayamam.** İşaret: içinde yalnızca 1 kullanıcı var (Super Admin) ve vatandaş test hesabı (`yetkin.vision@gmail.com`) yok. Canlıysa henüz müşteri yok demektir; laboratuvarsa canlı ayrı bir yerde. **Bunu sizin teyit etmeniz gerekiyor.**
2. **`git` bu makinede çalışmıyor** (komut satırında bulunamadı). Bu yüzden commit durumunu `.git` kayıt dosyası ve dosya tarihleriyle çıkardım.
3. İkinci veritabanı sorgu setim (satın alma, sertifika, defter, tablo bazlı güvenlik) otomatik güvenlik denetiminde reddedildi; ısrar etmedim. **Bu sayılar yok:** satın alma sayısı, defter, tablo bazlı RLS durumu, `public.users` aynası.
4. Ses kalitesini **dinlemedim**, videoları **izlemedim**, mobil uygulamayı **çalıştırmadım**, uçtan uca (Playwright) testleri koşmadım.

---

## 2. ADIM 1 — KILAVUZ DOKÜMANLAR

### 2.1 Belgeler canlı duruma ne kadar uyuyor?

**Kısa cevap: İyi uyuyor; 30 Eylül'deki raporun işaret ettiği sorunların çoğu giderilmiş.**

| Konu | 30 Eylül | Bugün |
|------|----------|-------|
| "İlk ders ücretsiz" kuralı hiçbir belgede yok | Eksikti | **Yazılı** (`ANAYASA.md` B4 "Freemium ilkesi", `PEDAGOJI.md` bölüm A.5) |
| Mimari adı (Amiral Gemi / Sürü Dron) | Çelişki | Net: `ANAYASA.md` B1 "Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci"; eski ad "takma ad" olarak açıklanmış |
| Olmayan `docs/specs/…` dosyasına atıf (`MANIFESTO.md`) | Vardı | Giderilmiş (kapı artık kod dosyalarına işaret ediyor) |
| Yasa metnine karışan "Son Reform" günlükleri | Vardı | Giderilmiş |
| Model SSOT yönü (belge mi kod mu) | Belirsiz | Net: `ANAYASA.md` "uyumsuzlukta belge silinmez, kod belgeye eşitlenir" |
| EC-102 anlatıcısı (Selin mi Kaan mı) | Çelişki | Net: Kaan/Puck. `ANAYASA.md`, `PEDAGOJI.md`, `instructors.ts`, `pilot-sku.ts` aynı şeyi söylüyor |
| Erişim kapısı dağınıklığı | ~10 kapı, parça parça | **Tek karar fonksiyonu yazılmış** (`lib/academy/entitlement.ts`, `resolveAcademyEntitlement`) |

Mimari iddia ile kod örtüşmesi (bugün ölçtüğüm):
- `verify:boundaries` **OK** → çekirdek (`lib/kernel`) dikey odaları (akademi, kariyer, freelancer) import etmiyor.
- `verify:api-auth` **OK** → 60 API kapısı, 36 oturumlu, 18 açık, 2 yönetici, 4 webhook.
- `tsc` (tip denetimi) **temiz.**
- Dron kayıt defteri (`lib/dronlar/kayit.ts`): Panel, Akademi, Kariyer açık; Freelancer kapalı (410). `ANAYASA.md` B2 ile aynı.
- Beş medya katmanı kapısı ve fiyatın veritabanında olması (A1) kodda duruyor.

### 2.2 Bizi kısıtlayan, kendi ipimizde boğan kurallar

Aşağıda **belgeleri** ve **kodun içine gömülü kuralları** ayrı ayrı yazdım; çünkü asıl boğucu olanlar belge değil, koddaki kilitler.

| # | Kural / yapı | Sorun | Önerim |
|---|--------------|-------|--------|
| K-1 | **Kilitli migrasyon listesi** (`scripts/ops-migrate-lib.ts` `EXPECTED_SQL` + test). Her yeni SQL dosyası **3 yerde** elle kaydedilmeden uygulanamıyor. | Bugün **yeni üç eğitimin yayınını fiilen engelliyor** (bulgu 1). Güvenlik niyeti iyi (sıra bozulmasın) ama liste unutulunca sistem sessizce değil, gürültüyle durur: yani doğru davranıyor, ama operasyonel olarak ağır. | Sıra kilidini koru, **listeyi dosya adından otomatik türet** (ya da yeni dosya eklenince testin otomatik güncellenmesini sağla). |
| K-2 | **Yayın/kapama = SQL migrasyonu.** EC-102 için üç ayrı migrasyon (yayınla / geri al / tekrar yayınla), OFF-201 fiyat, şimdi SM/BOT/PR. Yönetici panelinde "yayınla/kapat" düğmesi yok. | Bir eğitimi açmak için kod yazmak ve dağıtmak gerekiyor. | Süper Admin için "yayında/değil" anahtarı. (Ücretsiz önizleme anayasa gereği hâlâ kodda kalır.) |
| K-3 | **Mühür kapısı medyayı depoda arıyor** (`public/media/...` dosyaları diskte olmalı). | Güvenli ve dürüst bir fikir, ama medyanın kod deposunda ve Vercel paketinde yaşamasını zorunlu kılıyor → `public/` şişiyor (bulgu 2). | Kuralın ruhu "dosya gerçekten var" — bunu "depolama alanında var" diye yeniden tanımlamak mühürü bozmaz (bkz. bölüm 7.3). `AKADEMI_URETIM_ANAYASASI.md`'ye **dokunmadan**, uygulama tarafında. |
| K-4 | **`AGENTS.md` ile `.cursorrules` birbirine ters.** `AGENTS.md`: "kod yazmadan önce `node_modules/next/dist/docs/` oku". `.cursorrules`: "`node_modules/` içindeki dosyalar **asla** okunmaz." | Yapay zekâ ajanı iki talimatın arasında kalıyor. | `.cursorrules`'a tek satırlık istisna: "yalnız `node_modules/next/dist/docs/` okunabilir." |
| K-5 | **"Sayı burada tekrarlanmaz, koda bak" deseni.** | Niyet doğru (sapmayı önler) ama bir sayıyı öğrenmek için 4–5 dosyaya gidilmesi gerekiyor. Ayrıca bu kural belgelerde kendi kendine çiğneniyor (örnek: `STORAGE_CONTRACT.md`, `OPS_RUNBOOK.md` "yayın **8**"). | Sayı yazan belgeleri ya güncelleyin ya da sayıyı kaldırıp koda atıf bırakın (aşağıda D-1). |
| K-6 | **Ücretsiz önizlemenin DB'den kapatılamaması** (`ANAYASA.md` B4). | Bilinçli bir karar ve ürün açısından doğru (karar kodda, tek kaynak). Ama acil durumda (hatalı ders, hukuki talep) tek bir dersi **kapatmak** için kod değişikliği + dağıtım gerekir. | Açma yetkisini hiçbir şekilde DB'ye vermeden, yalnız "acil **kapat**" mandalı eklemeyi düşünün. Anayasa metni değişmeden de bunun için yer var (kapatma, açmayı gevşetmez). |
| K-7 | **Eski mimari dili hâlâ yaşıyor.** Bu görev metni de "Amiral Gemi + Sürü Dron (Core + Micro-Apps)" diyor; belgeler ise bu adı emekli ediyor. | Ajanlar ve yeni gelenler ayrı dağıtım bekleyebilir; yanlış beklenti yanlış iş üretir. | Belgelerin başına tek satır sözlük: "Amiral Gemi = monolit; Sürü Dron = kayıtlı yetenek; Shared Kernel = `@yetkin/kernel`." Bu zaten `ANAYASA.md` B1'de var; kısa bir "kapak notu" yeter. |

**Dokunulmaması gerekenler (benim de önerim):** A1–A5 (para, ödeme kuruluşu olmama, güvenlik, kanıt satın alınamaz, dürüst yüzey); model tablosu; 5 aşama kapısı; "kota gelince dur" politikası. Bunları gevşetmeyi önermiyorum.

### 2.3 Belge belge karar

| Belge | Karar | Neden |
|-------|-------|-------|
| `ANAYASA.md` | **Küçük güncelleme** | A katmanı olduğu gibi kalsın. B4'te yalnız üç kursun anlatıcısı yazılı; SM-103, BOT-104, PR-105 anlatıcıları (Selin/Aoede, Mert/Achird, Oğuz/Fenrir) yalnız kodda (`instructors.ts`). Başlık tarihi "16 Ağustos" eski. |
| `MANIFESTO.md` | **Dokunma** (tarih notu hariç) | Vizyon belgesi; mimari çıkışı doğru yönlendiriyor. |
| `PEDAGOJI.md` | **Küçük güncelleme + bir çelişki çözümü** | Bölüm 2.2 kapanış duası olarak "Tezgâhın bereketli olsun…"u şart koşuyor; `AKADEMI_URETIM_ANAYASASI.md` 1-B aynı cümleyi **temizlenecek slogan** sayıyor (D-2). |
| `AKADEMI_URETIM_ANAYASASI.md` | **Dokunma** | Dokunulmaz kart. Tek not: Madde 4/1 katmanı "`.ts` / spokenScript" diyor; kod aslında `lib/academy/spoken-scripts/{ders}.md` dosyasına bakıyor. Kod belgeye eşitlenecekse bu ancak CEO kararıyla. |
| `STORAGE_CONTRACT.md`, `OPS_RUNBOOK.md` | **Güncelle** | "Yayın **8**", "kardeş SKU 02–05 Çok Yakında", "Video katmanı terk edilmiştir" eski. Bugün 6 eğitim, 5 katman (video = yerel ısınma kaseti). |
| `README.md` (`.system_docs`) | **Küçük** | "Beş zorunlu dosya" diyor ama klasörde 8 belge + `ops/` altında 4 belge var. |
| `.cursorrules` | **Küçük** | K-4 istisnası. Dışlama listesi (public/media, archived, node_modules) bağlam için makul. |
| `AGENTS.md` / `CLAUDE.md` | **Dokunma** | `next dev` tarafından yönetilen blok; sadece K-4 çelişkisini çözün. |

**D-1 (eski sayılar):** `STORAGE_CONTRACT.md` ve `OPS_RUNBOOK.md` hâlâ "Akademi mühürlü yayın 8; kardeşler Çok Yakında" diyor. Gerçek: 6 eğitim, hepsi diskte mühürlü.
**D-2 (çelişen dua cümlesi):** EC-102'nin 4 dersinde (1, 2, 5, 6) "Tezgâhın bereketli olsun. Satışın hayırlı gelsin." var — bu seslere **fırınlanmış** durumda. Yeni üç eğitimin tüm dersleri ise SOP'un önerdiği "Zihnine sağlık…" cümlesini kullanıyor. Yani pratikte SOP kazanmış; `PEDAGOJI.md` geride. EC-102'yi değiştirmek yeniden ses fırını (ücretli) demek; bu **CEO kararı**.
**D-3 (bir kez daha ses haritası):** Bu görev metnindeki "OFF-101/201 ve EC-102 canlı" sözü doğru; ama yeni üç eğitimin "geliştirme" sayılması artık eski (bölüm 3).

---

## 3. ADIM 2 — EĞİTİMLER VE KULLANICI DENEYİMİ

### 3.1 Altı eğitimin bugünkü durumu (kod + disk + veritabanı)

Kullandığım ölçüler: ders sayısı ve konuşma metni (`verify:academy-curriculum`), disk (`public/…` altındaki ses, fon müziği, görsel, ısınma videosu), kod kapısı (`pilot-sku.ts`), veritabanı (salt-okunur sorgu).

| Kod | Slug | Anlatıcı (ses) | Ders / kelime / süre | 5 medya katmanı diskte | Kodda kapı | Veritabanı | Gerçekte şu an |
|-----|------|----------------|----------------------|------------------------|------------|------------|----------------|
| **OFF-101** | `01_office_ai` | Gözde (Callirrhoe) | 8 ders · 10.252 kelime · ~85 dk (+ hazırlık şeridi) | Tam: 8 ses, 8 fon, 73 görsel, 1 video | Satışa açık | Yayında · ₺890 aktif | **Canlı, satın alınabilir** |
| **OFF-201** | `01_office_ai_ileri` | Aylin (Kore) | 6 ders · 6.820 kelime · ~57 dk | Tam: 6 ses, 6 fon, **6 görsel (ders başına 1)**, 1 video | Satışa açık (`LAUNCH_SALE_OPEN`) | Yayında · ₺1.290 aktif | **Canlı, satın alınabilir** |
| **EC-102** | `02_ecommerce_ai` | Kaan (Puck) | 6 ders · 9.588 kelime · ~80 dk | Tam: 6 ses, 6 fon, 31 görsel, 2 video | Açık | Yayında · ₺990 aktif | **Canlı, satın alınabilir** |
| **SM-103** | `03_social_media_ai` | Selin (Aoede) | 6 ders · 4.117 kelime · ~34 dk | Tam: 6 ses, 6 fon, 30 görsel, 1 video | **Açık** (bu sabah 09:14'te değişti) | **Yayında değil · ₺890 PASİF** | İlk ders izlenir; **satılamaz** |
| **BOT-104** | `04_chatbot_nocode` | Mert (Achird) | 6 ders · 4.048 kelime · ~34 dk | Tam: 6 ses, 6 fon, 30 görsel, 1 video | **Açık** | **Yayında değil · ₺1.290 PASİF** | İlk ders izlenir; **satılamaz** |
| **PR-105** | `05_prompt_practice` | Oğuz (Fenrir) | 6 ders · 4.318 kelime · ~36 dk | Tam: 6 ses, 6 fon, 30 görsel, 1 video | **Açık** | **Yayında değil · ₺1.290 PASİF** | İlk ders izlenir; **satılamaz** |

Doğrulamalar: `verify:academy-curriculum` OK (her ders ≥ 600 kelime, UTF-8 sağlam). Mühür listesi (`production-seal-manifest.ts`) 6 eğitimin 5 katmanını tam gösteriyor. Veritabanı fiyatlarının hiçbiri Super Admin eliyle girilmemiş (hepsinde `updated_by` boş; yani "tohum" fiyat — A1 uyarınca satış fiyatı DB satırıdır ve bu satırlar var, ama panelden hiç ayarlanmamış).

**Dikkat çeken tespitler:**
1. **"Geliştirme" artık doğru kelime değil.** PR-105, SM-103 ve BOT-104 geliştirmeyi bitirmiş; eksik olan **yayın adımı**. Neden satılamadığı: veritabanında kurs kapalı + fiyat pasif (bu ikisini bu sabahki migrasyon açacaktı), migrasyon da kilitli listeye eklenmediği için uygulanamıyor (bulgu 1).
2. **Yeni üç eğitim, ilk üçün neredeyse yarısı kadar kısa:** ~34–36 dakika; OFF-101 ~85, EC-102 ~80, OFF-201 ~57. Kapı eşiği (ders başına ≥ 600 kelime) geçiliyor ama BOT-104'ün bazı dersleri tabana yakın (636–650 kelime). Fiyatları ise OFF-201 ile aynı bandda (₺1.290). Bu yasaklanmış bir şey değil; yalnızca ürün/fiyat dengesi sorusu: **"₺1.290 için 36 dakika"** pazarda nasıl karşılanır, sizin takdiriniz.
3. **Görsel yoğunluğu tutarsız:** OFF-201 yalnız 6 görsel taşıyor, diğerlerinin hepsi 30'a yakın. Mühür kapısı yalnızca her dersin ilk görselini arıyor, o yüzden sessizce geçiyor. Kalite hedefiniz bunu da kapsıyorsa kapıya eşik konabilir.
4. **EC-102 ses kapanışı** (D-2): 4 derste eski dua cümlesi seslendirilmiş halde.
5. **Ölü ağırlık:** `01_office_ai-4.mp3` (11,3 MB) hâlâ `public/` altında; bu ders sınav yolunda yok ("arşivde kalır" denmiş ama dosya yayın klasöründe).
6. **Satılabilirliğin DB'ye bağlı iki yüzü:** Kodda SM/BOT/PR "kapı açık" ama DB "yayında değil" olduğu için vitrin kartı bugün "Yayında Değil" gösterecek, ders 1 ise ücretsiz izlenecek. Dürüst yüzey ilkesine (A5) uyuyor; sadece beklenmeyen bir ara hâl.

### 3.2 Özel UX kuralı: "Her eğitimin ilk dersi ödeme duvarsız, herkese açık"

**Cevap: Web'de evet, kodda mevcut ve doğru kurgulanmış. Eksikler aşağıda.**

**Kural nerede yaşıyor?** Tek karar fonksiyonu: `resolveAcademyEntitlement` (`lib/academy/entitlement.ts`). Kural: "eğitimin sınav yolunun ilk dersi herkese açık; OFF-101'de ek olarak hazırlık şeridi." İlk dersin kimliği `lib/kernel/catalog-ids/exam-path.ts` tablosundan türetiliyor. **Kurs listesi yazılmıyor**; yani tabloya eklenen her yeni eğitim kuralı otomatik alıyor. Bu yüzden SM-103, BOT-104, PR-105 de kuralın içinde (ders 1: `…-1`).

| Katman | Davranış | Nerede |
|--------|----------|--------|
| Belge | Yazılı (B4 Freemium ilkesi, Pedagoji A.5) | `ANAYASA.md`, `PEDAGOJI.md` |
| Kenar (giriş kapısı) | `/academy/<eğitim>/oyna` yolu, dersi olan her eğitimde **oturumsuz açık**; boş kabukta kapalı | `lib/kernel/security/edge-guard.ts` |
| Sayfa | Oturumsuz/lisanssız: ders 1 dolu, ders 2+ gövdesi **boşaltılmış** (istemciye hiç gitmiyor) | `app/academy/[slug]/oyna/page.tsx`, `lib/academy/paywall-shells.ts`, `preview-lock.ts` |
| Ses | Oturumsuz kullanıcıya yalnız ders 1 için kısa ömürlü imzalı adres | `lib/academy/free-preview-audio.ts` |
| Asistan | Ders anahtarını kursa bağlıyor (başka kursun ilk dersiyle sızma yok) | `app/api/academy/lesson-assistant/route.ts` |
| Test | "Ders 1 açık, ders 2 kilitli, lisans bitince geri kapanır, yabancı anahtar açmaz, Super Admin lisanssız açar" | `tests/academy/freemium-contract.test.ts` |

**Eksik / zayıf yerler:**

| # | Eksik | Nerede | Etki |
|---|-------|--------|------|
| F-1 | **Mobil uygulama (`apps/rail-is`) hiç "ücretsiz önizleme" bilmiyor** (kodda böyle bir kavram bulunmadı) ve oturum istiyor. | `apps/rail-is/src/…` | Kural mobilde **uygulanmıyor.** |
| F-2 | **Mobil uygulama yalnız 2 eğitimi tanıyor** (`DRON_COURSE_SLUGS = ["01_office_ai", "01_office_ai_ileri"]`). EC-102 ve yenileri listede yok. Web'in listesiyle elle senkron. | `apps/rail-is/src/ui/course-slugs.ts` | Yeni eğitimler mobilde görünmez. |
| F-3 | **Sözleşme testi yalnız eski üç kursu kapsıyor.** SM/BOT/PR için "ders 1 açık / ders 2 kapalı" testi yok. Üstelik eski bir test (`edge-guard.test.ts` satır 112) SM-103 oynatıcısının **korumalı (kapalı)** olduğunu bekliyor — artık yanlış, bugünkü iki kırmızı testten biri. | `tests/kernel/edge-guard.test.ts`, `tests/academy/freemium-contract.test.ts` | Kural doğru çalışıyor ama güvence eksik. |
| F-4 | **Kilitli ders kontrolü "EC-102 ders 2"yi sonda olarak kullanıyor** (`ACADEMY_LOCKED_LESSON_PROBE`). "Bu kullanıcı lisanslı mı?" sorusunu yanıtlamak için sabit bir eğitimin ikinci dersine soruluyor. EC-102 bir gün yeniden adlandırılırsa modül yüklenirken hata fırlatır ve uygulama açılmaz. | `lib/academy/entitlement.ts` | Kırılgan ama şu an çalışıyor. |
| F-5 | **İki ayrı sabit aynı şeyi söylüyor:** hazırlık şeridi anahtarı hem `ACADEMY_FREE_PREVIEW_LESSON_KEY = "01_office_ai-0"` (`purchase-path.ts`) hem `OFFICE_AI_PREP_STRIP_KEY` olarak tanımlı. | `lib/academy/purchase-path.ts`, `curricula/office_ai/prep` | Tek kaynak ilkesine aykırı; küçük. |
| F-6 | **Ücretsiz ders sesi büyük:** ders 1 mp3'leri 20–27 MB (+ fon müziği). Her anonim izleme bu baytı çekiyor; bant genişliği maliyeti ve kötüye kullanım yüzeyi var. Hız sınırı için Redis bu makinede **tanımlı değil** (bellek içi sayaç kullanılır; sunucusuz ortamda örnekler arası paylaşılmaz). | `proxy.ts`, `.env.local` | Ölçek geldikçe maliyet. |
| F-7 | **Veritabanı yayın bayrağı kapalı olan eğitimlerde ders 1 yine de açık.** Kod "serbest önizleme eğitim yayında olmasa da çalışır" diyor (kurs tohumdan çözülüyor). Karar tutarlı ama bilinmeli: SM/BOT/PR bugün yarı açık. | `lib/academy/load.ts` | Bilgi. |

**Sonuç:** Kuralın **kod omurgası eksiksiz ve yeni kurslara kendiliğinden uyuyor.** Boşluklar: mobil (F-1, F-2), testin yeni kursları kapsamaması (F-3) ve yarı açık ara hâl (F-7).

---

## 4. ADIM 3 — SUPER_ADMIN VE YETKİLENDİRME

### 4.1 `yapinet360@gmail.com` bugün ne durumda?

**Veritabanı (salt-okunur sorguyla bugün ölçtüm):**

| Soru | Cevap |
|------|-------|
| Hesap var mı? | **Evet** (Supabase kimlik tablosunda, 26 Eylül 2026'da açılmış) |
| E-postası onaylı mı? | **Evet** (onaylı) |
| Yasaklı / silinmiş mi? | **Hayır** / **Hayır** |
| Giriş yöntemi | E-posta (parola) |
| Son giriş | 30 Eylül 2026, 21:51 (UTC) |
| Kimliği (UUID), ayardaki `SUPER_ADMIN_USER_ID` ile aynı mı? | **Evet, birebir aynı** |
| Bu veritabanında toplam kullanıcı | **1** (yalnız bu hesap) |
| `public.users` aynasındaki satır, satın alma/sertifika durumu | **Ölçülemedi** (2. sorgu seti reddedildi) |

**Kod (yetkiyi kim, nasıl veriyor):** Tek karar fonksiyonu `isSuperAdminActor` (`lib/kernel/auth/super-admin.ts`):
1. E-posta onaylı değilse → admin değil.
2. `yetkin.vision@gmail.com` (vatandaş test hesabı) → **asla** admin.
3. Üretimde: ayarda `CANONICAL_SUPER_ADMIN_EMAIL` **ve** `SUPER_ADMIN_USER_ID` ikisi de dolu olmalı; oturumdaki e-posta **ve** kimlik ikisi de eşleşmeli (çift kilit). Biri eksikse **kimse admin olamaz** (güvenli ama kilitlenme riski).
4. Geliştirmede: onaylı kanonik e-posta yeter.

Bu karar üç katmanda aynı fonksiyonu okuyor: giriş kapısı (`proxy.ts`), API (`requireSuperAdmin`), sayfa (`resolveSuperAdminAccess`). Akademi duvarını da aynı kapı geçiriyor (`hasAcademyAdminBypass`).

Bu bilgisayarın ayarları (değer okunmadı, yalnız "dolu mu?" bakıldı): `CANONICAL_SUPER_ADMIN_EMAIL` **dolu**, `SUPER_ADMIN_USER_ID` **dolu**, `ops:runtime-readiness` çıktısı `superAdmin=configured`.

### 4.2 "Eksiksiz tam yetki" var mı?

**Platformun ürettiği tek yetkili rol o ve onu eksiksiz tanıyor.** Ama "tam" kelimesi bugün şu anlama geliyor, fazlasına gelmiyor:

| Yapabildiği | Yapamadığı / yok |
|-------------|------------------|
| Akademi duvarını lisanssız geçer, tüm dersleri izler (üretimde de, DB'ye yazmadan) | **Eğitimi yayına alma/kapama düğmesi yok** (yalnız SQL migrasyonu) |
| `/admin`: fiyat kataloğunu görür ve değiştirir (karar defteri ile), satış gösterge paneli (funnel), denetim odaları | **Kullanıcı yönetimi / satın alma / iade ekranı yok** |
| Sertifika iptali ve bağış komutları (komut satırı betikleriyle) | **İkinci yönetici, acil durum yedek hesabı (break-glass), yönetici eylem denetim izi yok** |

**Eksikler ve riskler:**
1. **Tek hesap, tek ayar.** Yetkiyi devretmek için ayar değişikliği + yeniden dağıtım gerekir. Hesap kaybolur ya da e-posta erişimi kopar ise platformu kimse yönetemez.
2. **Üretim ortamı değişkenleri doğrulanmadı.** Yerelde dolu; Vercel Production'da ikisinin dolu olduğunu **buradan göremem.** Biri eksikse üretimde `/admin` kimseye açılmaz. Önerilen kontrol: üretimde `ops:runtime-readiness` ve kendi hesabınızla `/admin` açılışı.
3. **Geliştirme modu açık kapı:** Yerelde `npm run dev` ile bu `.env.local` kullanılırsa (aynı barındırılan veritabanı), onaylı e-posta tek başına admin ve **sıfır harçlı bağış yazma** (laboratuvar bağışı) açıktır (`isZeroFeeAcademyGrantOpen` = üretim dışı). Bu veritabanı canlıysa, yerel geliştirme canlı veriyi etkileyebilir. Lab/canlı ayrımını teyit edin.
4. **Yerel ayarda bir uyarı:** `DIRECT_URL` "doğrudan bağlantı" olması gerekirken havuz (`pooler`) adresine işaret ediyor (`ops:runtime-readiness`: `direct-fail`). Yani bu makineden `npm run ops:migrate` zaten çalışmaz (Bölüm 3.1'deki migrasyon sorununa ek olarak).
5. **Sınav oturumu sırrı** bu makinede tanımsız (`examSitting=unconfigured`). Üretimde de yoksa sınav 503 verir. Teyit edin.

---

## 5. ADIM 4 — ATIL, GEREKSİZ VE ÇİFT KAYNAKLI DOSYALAR

### 5.1 Geçici / atıl dosyalar

| Yer | Boyut | Durum |
|-----|-------|-------|
| `.bak/.orig/.old/.rej/.swp/.log` türü kalıntı | — | **Bulunmadı.** |
| `.tmp/` | 3 küçük `.txt` | Fırın "bitti" işaretleri; git dışı; sorunsuz. |
| `media-bake/` | **1,53 GB, 523 dosya** | Git dışı (doğru). **Sadece bu bilgisayarda.** Ses ana kayıtları (WAV). `OPS_RUNBOOK.md` saha dışı yedek şart koşuyor; yedek yoksa kayıp = ücretli yeniden fırın. |
| `archived/` | 139 MB, 268 dosya (git'te) | Tasarım gereği donmuş tarih. Derlemeye girmiyor. |
| `generated/` | 3,4 MB | Üretilmiş, git dışı. |
| `public/` | **927,8 MB** (hata eşiği 950) | Ses 872 MB · ısınma videoları 19 MB · görseller 35 MB. Ses klasörleri: OFF-101 223 MB, OFF-201 169 MB, EC-102 204 MB, PR-105 98 MB, SM-103 93 MB, BOT-104 87 MB. |
| `01_office_ai-4.mp3` (11,3 MB) | | Sınav yolunda olmayan, emekli ders; yayın klasöründe duruyor. |
| `docs/` | 2 rapor (+ bu) | `TEDAVI_RAPORU_260920.md` dosya adı 20 Eylül diyor ama içerik 30 Eylül işleri; isim yanıltıcı. |

### 5.2 Hiçbir yerden çağrılmayan modüller

Basit bir bağlantı taramasıyla bulduklarım (yanlış alarm olasılığı var; silmeden önce elle teyit gerekir):

- **Dondurulmuş Freelancer arayüzü, kimse kullanmıyor (7):** `components/freelancer/{direct-job-offer-modal, direct-offer-inbox, squad-create-button, squad-panel, squad-teaser, standalone-squad-modal, usta-expertise-list}.tsx`.
- **Diğer:** `components/shell/frozen-room-gone-page.tsx`, `lib/freelancer/released-proofs.ts`, `lib/kernel/env.ts`.
- **Yalnız testlerin kullandığı (üretimde karşılığı yok):** `lib/academy/{article-spoken-diff, catalog-favorites, config, issued-certificates, lesson-description, lesson-listen, syntax-highlight, web-speech}.ts`, `lib/academy/curricula/{phase2-drafts, phase2-exam-readiness}.ts`, `lib/freelancer/standalone-squad-store.ts`, `lib/kernel/{ai/paid-command, http/memory-idempotency-store, rooms.ssot}.ts`.
- **Kendi başına duran tek seferlik betikler:** 34 betik ne `package.json`'da ne başka dosyada anılıyor (çoğu tek kursa özel fırın/mühür betiği: `bake-sm-103-…`, `bake-sm103-nano-slides`, `seal-pr105-player-clock` vb.).
- **410 saplamaları:** API haritasında hâlâ 60 kapı (11'i "yayından kalktı" cevabı veren saplama) — 30 Eylül'den beri sayı değişmedi.

(30 Eylül'de listelenen 4 yetim dosya ve `ecommerce_ai` yönlendirme klasörü temizlenmiş.)

### 5.3 "Tek Doğru Kaynak" ilkesine aykırı / çelişen yapılar

| # | Yapı | Sorun | Risk |
|---|------|-------|------|
| S-1 | **Eğitim listesi ~66 dosyada.** `05_prompt_practice` adı kod, test, betik, migrasyon, paket dosyalarında 66 dosyada geçiyor (`01_office_ai_ileri` için 74). Başlıca evler: `exam-path.ts`, `course-slugs.ts` (paket), `pilot-sku.ts` (5 ayrı liste), `instructors.ts` (3 ayrı harita), `lesson-veo.ts` (ısınma listeleri), `catalog-seed.ts`, `retired-storefront.ts`, `seo.ts`, SQL dosyaları, 3–4 betik. | Yeni eğitim eklemek "her yere elle yazmak" demek; birini unutmak sessiz hata üretir (bugün bunun örneği: migrasyon listesi). | YÜKSEK (süreç riski) |
| S-2 | **Mobil uygulama eğitim listesi** elle kopya (yalnız 2 eğitim). | Sapmış durumda (F-2). | ORTA |
| S-3 | **Müfredat klasör adları tutarsız:** `office_ai`, `office_ai_2`, `02_ecommerce_ai`, `sm-103`, `bot-104`, `pr-105`; ayrıca `social_media_ai`, `chatbot_nocode`, `prompt_practice` adında **1 dosyalık yönlendirme klasörleri** — 30 Eylül'de `ecommerce_ai` için temizlenen aynı hatanın üç yeni kopyası. Betik adları da tutarsız (`bake-sm-103-…` / `bake-sm103-…`). | Dört adlandırma kalıbı; yeni geleni şaşırtır. | ORTA |
| S-4 | **Migrasyon listesi 3 yerde** (dosya, `EXPECTED_SQL`, test beklentisi). | Bugünkü tıkanma (bulgu 1). | YÜKSEK |
| S-5 | **Aynı fiyat 3 yerde:** migrasyon SQL'i, koddaki tohum, veritabanı satırı. Doğru olan (A1) DB'dir; ama bugün hepsi "tohum" ve panelden hiç ayarlanmamış. | Gerçek kaynak ile görünen kaynak ayrışabilir. | DÜŞÜK-ORTA |
| S-6 | **Kod ile belgede iki ayrı "ses haritası":** `AKADEMI_URETIM_ANAYASASI.md` (model kimlikleri) ↔ `model-roles.ts` bugün **uyumlu**; anlatıcı adları ise yalnız kodda. | Belge geride. | DÜŞÜK |
| S-7 | **Mühür manifestosu** (`production-seal-manifest.ts`, 159 satır) üretilmiş bir dosya olarak depoda duruyor ve her medya değişiminde yeniden üretiliyor. | Her fırında gürültülü fark; eski kalırsa yanlış rapor riski. | DÜŞÜK |
| S-8 | **Ücretsiz ders sabiti 2 yerde** (F-5). | Küçük. | DÜŞÜK |

Doğru kurulmuş örnek: para birimi ve katalog kimlikleri `@yetkin/kernel` paketinde **tek evde**; web de mobil de ordan okuyor (mobilin eğitim listesi hariç).

---

## 6. SAĞLIK ÖLÇÜMLERİ (bugün çalıştırıldı)

| Kontrol | Sonuç |
|---------|-------|
| Tip denetimi (`tsc --noEmit`) | Temiz (çıkış kodu 0) |
| `verify:academy-curriculum` | OK — 6 eğitim, 36 ders, hepsi ≥ 600 kelime |
| `verify:api-auth` | OK — 60 kapı |
| `verify:boundaries` | OK |
| `verify:public-size` | **UYARI** — 927,8 MB (uyarı 850, hata 950) |
| `ops:runtime-readiness` | Uyarılı (çıkış 0): doğrudan bağlantı adresi hatalı, sınav sırrı yok, IP izin listesi yok |
| `npm test` | **1193 / 1196 geçti.** Kırmızı: (a) `tests/kernel/edge-guard.test.ts:112` — SM-103'ü hâlâ "kapalı" sanan eski test; (b) `tests/kernel/ops-migrate-logic.test.ts` — beklenen 13 SQL, diskte 14 (yeni migrasyon listeye girmemiş); (c) `live-broadcast-shutdown.test.ts` 5 sn zaman aşımı — **tek başına çalıştırınca 4/4 geçti**, yük kaynaklı. |
| CI iş akışı (`.github/workflows/ci.yml`) | `lint`, `verify:prebuild`, `typecheck`, `test` çalıştırıyor → (a) ve (b) yüzünden bugünkü hâliyle kırmızı olur. |

---

## 7. ADIM 5 — STRATEJİK DEĞERLENDİRME (BENİM GÖRÜŞÜM)

### 7.1 SEN OLSAYDIN NE YAPARDIN? — İlk müdahale

**İlk müdahalem "yayın hattını açmak" olurdu; yeni özellik ya da yeni mimari değil.** Gerekçe: Elinizde bitmiş, medyası mühürlü, üç ürün var (SM-103, BOT-104, PR-105). Bunlar bugün hiçbir gelir getirmiyor; çünkü sistemin kendi kilitleri onları kapalı tutuyor. Bu kilitlerin hepsi küçük işler:

1. **Yedekle (30 dakika):** 318 değişikliği mantıklı parçalara bölerek kaydedin (içerik, medya, kod, belge ayrı). Bu makinede `git` çalışmıyor; önce o düzelmeli. `media-bake/` (1,5 GB, tek kopya) için saha dışı bir kopya.
2. **Migrasyon listesini düzelt (30 dakika):** Yeni SQL dosyasını `EXPECTED_SQL`'e ve testine ekleyin. Bu makineden uygulama için `DIRECT_URL`'in doğrudan adresi şart (şu an havuza işaret ediyor).
3. **İki kırmızı testi düzelt:** `edge-guard` testini "SM-103 ilk ders açık" olarak güncelleyin; SM/BOT/PR için `freemium-contract` testine satır ekleyin.
4. **Bütçe frenini serbest bırak:** `01_office_ai-4.mp3` (11 MB) gibi emekli dosyaları çıkarmak yalnız küçük nefes; asıl çözüm 7.3 Faz 3. Ama **bir sonraki eğitimden önce** çözülmeli.
5. **Fiyat/süre kararı (sizde):** SM/BOT/PR fiyatları ve ~35 dakikalık süre pazara uygun mu? Karar sizin; migrasyon yalnız "tohum" koyuyor, panelden değiştirilebilir.
6. **Sonra "yayınla".**

### 7.2 PLATFORM KURGUSU — "Amiral Gemi + Sürü Dron" doğru tasarlanmış mı?

**Kısa cevap:** Evet, ama **bu isimle değil.** Doğru ad: *modüler monolit + ince sözleşme paketi + tek mobil istemci.* Bu, bu ölçekte (1 yönetici, 6 eğitim, bir mobil uygulama) doğru seçim. Ayrı mikro uygulamalar şu an yük olurdu.

**İyi yapılmış damarlar:**
- Çekirdek ↔ dikey odalar arasında sert duvar (kod denetimi ile zorlanıyor; bugün yeşil).
- Tek giriş kapısı, tek yetki kararı, tek erişim karar fonksiyonu (artık).
- Para: tek defter, tam sayı kuruş, fiyat veritabanında.
- Fail-closed kültürü: "bağlı değilse dürüstçe söyle" (A5), mühür diskte olmadan satış yok.
- Mobil + web aynı `/api/v1` sözleşmesini ve aynı paketi konuşuyor.

**Tıkalı / eksik damarlar (önem sırasıyla):**
1. **Yayın damarı:** eğitim yayınlamak = SQL yazmak + 3 yerde liste güncellemek + dağıtmak. Panelden yayınlama yok.
2. **Medya damarı:** medya kod deposunda ve Vercel paketinde; 950 MB tavanda. Bu mimarinin en büyük **ölçek** engeli.
3. **Kayıt damarı:** "bir eğitim = ~66 dosya." Tek bir kurs kayıt dosyası (kod, ad, anlatıcı, ders listesi, ısınma eşlemesi, kapı) olsa gerisi türetilir.
4. **Mobil damar:** mobil eğitim listesi elle, 2 eğitimde kalmış; ücretsiz önizleme yok.
5. **Yönetim damarı:** tek yönetici, panelde yalnız fiyat ve gösterge; kullanıcı/iade/yayın yok; yönetici eylem izi yok.
6. **Ortam damarı:** lab ve canlı veritabanı ayrımı kanıtlanamıyor; yerel `.env.local` hosted veritabanına bağlı.
7. **Test/CI damarı:** testler yeni gerçekliğe (SM/BOT/PR açık) yetişmemiş.

"Sürü Dron" için: gerçek bir ayrı uygulama sınırı bugün yok ve olması da gerekmiyor. Freelancer odası kapalı (410), kodu derleme ağacında duruyor (7 yetim bileşen). Yeni "dron" fikrine geçmeden, yukarıdaki yedi damar tıkalıyken sürüyü büyütmek işi zorlaştırır.

### 7.3 MASTER PLAN (önerim)

**Faz 0 — Güvene al ve kilitleri aç (1–2 gün)**
1. 318 dosyayı commit'leyin (parçalayarak). `media-bake/` yedeği saha dışı.
2. Migrasyon kilidi düzeltmesi, 2 kırmızı testin düzeltilmesi, CI yeşil.
3. Canlı/lab veritabanı ayrımını teyit edin. Üretimde `ops:runtime-readiness` ve `/admin` kontrolü.
4. EC-102 dua cümlesi için karar (bırak / yeniden fırınla).

**Faz 1 — Üç eğitimi satışa aç (hafta 1)**
1. Migrasyonu uygula → DB'de SM/BOT/PR yayında ve fiyat aktif.
2. Canlı duman testi: oturumsuz ders 1 (ses dahil), ders 2 kilitli, PayTR ile satın alma, 365 gün lisans, sertifika doğrulama.
3. İlk gerçek müşteriler. **Bu veritabanı canlıysa şu an sıfır müşteri var;** teknik mükemmeliyetten çok ilk 10 ödeme öğretici olacaktır.
4. Fiyat/süre dengesini gerçek veriyle sınayın.

**Faz 2 — Hattı sadeleştir (hafta 2–4)**
1. **Tek kurs kayıt defteri:** eğitim başına tek kayıt; `pilot-sku`, `instructors`, `lesson-veo`, mobil liste ve seed bundan türesin. Hedef: yeni eğitim = 1 kayıt + içerik.
2. Migrasyon listesi otomatik türetme. Yayın/kapama için yönetici panelinde anahtar (ücretsiz önizleme anayasadaki gibi kodda kalır; yalnız acil "kapat" eklenebilir).
3. Klasör/betik adlandırmasında tek kalıp (`NN_slug`), 3 yönlendirme klasörünün ve yetim dosyaların onaylı temizliği.
4. Testlere "her eğitimde ders 1 açık, ders 2 kapalı" tek döngülü sözleşme (tabloya yeni kurs eklenince otomatik kapsansın).
5. Belge onarımı (bölüm 2.3).

**Faz 3 — Medyayı depodan çıkar (ay 1–2)**
1. Mühürlü ses/video/görsel dosyalarını nesne depolamaya (Supabase Storage veya benzeri) taşımak; mevcut kısa ömürlü imzalı adres sistemi bu yöne zaten hazır.
2. Mühür kapısını "depoda dosya var + bayt/özet uyumlu" şekline taşımak. **`AKADEMI_URETIM_ANAYASASI.md` metnine dokunmadan** (kapıdaki fiziksel dosya şartı korunur, yalnız fiziksel yer değişir); bu CEO onayı gerektirir.
3. Hız sınırı için Redis'in canlıda zorunlu hâle gelmesi.
4. `public/` bütçe uyarısı CI'da erken (850 MB'de zaten uyarıyor).

**Faz 4 — Mobil ve yönetim (ay 2–3)**
1. Mobil eğitim listesini API'den okutmak; ücretsiz önizleme.
2. İkinci yönetici / yedek hesap, yönetici eylem izi, basit satın alma ve iade görünümü.
3. Güvenlik turu: RLS ve yetki testlerinin CI'da zorunlu koşması.

**Faz 5 — Büyüme (çeyrek)**
1. Yeni eğitimler (06+) yalnız Faz 2–3 bittikten sonra.
2. Kurumsal (B2B) keşif: önce bir pilot müşteri (Manifesto Motor 2).
3. Freelancer yalnız lisanslı Split + `ANAYASA.md` B5 koşullarıyla (A2 değişmez).

### 7.4 BİR SONRAKİ AŞAMA — tam olarak ne yapmalıyız?

**Aşama 2 / Paket 1 — "Yayın hattını aç" (önerim, sizin onayınızla):**

1. **(Siz)** Bu veritabanı canlı mı, lab mı? Bir cümle yeter.
2. **(Siz)** `git`'i bu bilgisayarda çalışır hâle getirin (PATH) ya da hangi araçla commit yaptığınızı söyleyin.
3. **(Ben)** 318 değişikliği mantıklı commit'lere bölerim.
4. **(Ben)** `EXPECTED_SQL` + test düzeltmesi, `edge-guard` testi, SM/BOT/PR sözleşme testi, CI yeşil.
5. **(Siz)** `DIRECT_URL`'i doğrudan bağlantı adresiyle düzeltip migrasyonu çalıştırın (ya da bana yetki verin); sonra canlı duman testi.
6. **(Siz)** Karar: EC-102 duası, SM/BOT/PR fiyat ve süre, 6 görselli OFF-201 için ek görsel istenip istenmediği.

Bu paket bittiğinde üç yeni ürün satışta, CI yeşil, her şey yedekli olur. Ondan sonra Faz 2'deki "tek kurs kayıt defteri"ne geçilir; **yeni eğitim yapmadan önce.**

---

## 8. EK — Karar bekleyen sorular (CEO için)

| # | Soru | Neden önemli |
|---|------|--------------|
| 1 | `.env.local`'in bağlı olduğu Supabase projesi canlı mı? | Yerel geliştirme canlı veriyi etkileyebilir; müşteri sayısı yorumu buna bağlı. |
| 2 | SM-103 / BOT-104 / PR-105 fiyatları (₺890 / ₺1.290 / ₺1.290) ve ~35 dk süre uygun mu? | Migrasyon bunları "tohum" olarak koyar; A1 gereği fiyat Super Admin'in. |
| 3 | EC-102'deki "Tezgâhın bereketli olsun" seslerini yeniden fırınlayalım mı? | Ücretli TTS; kalan 4 ders. |
| 4 | Medyanın nesne depolamaya taşınması onaylanıyor mu (Faz 3)? | Mühür kapısının uygulama biçimini değiştirir. |
| 5 | Yayın/kapama için panel anahtarı ve acil "ders kapat" mandalı onaylanıyor mu? | Anayasa B4'ün ruhuna dokunur; yalnız kapatma yönünde. |
| 6 | İkinci yönetici / yedek hesap açılsın mı? | Tek hesap = tek arıza noktası. |

---

*Bu rapor yalnız tespit ve önerir. Hiçbir uygulama değişikliği yapılmamıştır.*
