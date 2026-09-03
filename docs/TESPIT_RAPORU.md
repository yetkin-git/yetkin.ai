# yetkin.ai — TEKNİK LİDER TESPİT, DURUM VE STRATEJİ RAPORU

**Tarih:** 3 Eylül 2026  
**Rol:** Proje Teknik Lideri / Baş Sistem Mimarı  
**Hedef Dosya:** `/docs/TESPIT_RAPORU.md`  
**Kapsam:** Platform Hazırlık Kontrolü, Ödeme & Hukuk İncelemesi, Kılavuz Dokümanların Sorgulanması ve Stratejik Yol Haritası  

---

## 1. YÖNETİCİ ÖZETİ (EXECUTIVE SUMMARY)

Bu rapor, `yetkin.ai` platformunun mevcut kod tabanı, test suite'i, operasyonel belgeleri (`.system_docs`) ve canlı yayın/ödeme hazırlık seviyesinin kapsamlı bir teknik denetimidir (technical audit). 

Teknik Lider gözüyle yapılan tarafsız incelemenin temel bulguları şunlardır:

1. **Çekirdek Sistem ve Temel Testler Sağlam:** Birim testlerin ezici çoğunluğu (377 test) ve güvenlik ön kontrolleri (`verify:prebuild` — sırlar, `amountMinor`, RLS izolasyonu, IDOR kontrolleri, OpenAPI v1 sözleşmesi) başarıyla geçmektedir. Tek defter (`LedgerEntry` + `Wallet`) prensibi finansal tutarlılığı garanti altına almaktadır.
2. **Kritik Darboğaz 1 — Freelancer Nakit Halkası Kapalı:** Anayasa'nın S43 ("Ödeme kuruluşu değiliz") maddesi uyarınca iç çekim rotaları haklı olarak kapatılmıştır; ancak iş kabulünde (`/api/freelancer/jobs/[id]/accept`) kullanılan `paytrMarketplaceSplitPort` gün 0 seviyesinde **kalıcı olarak `not_configured`** dönmektedir. Dolayısıyla canlı ortamda hiçbir Freelancer sözleşmesi kabul edilemez ve emanet fonlanamaz (fail-closed HTTP 503).
3. **Kritik Darboğaz 2 — Akademi Ödemesi Kod Olarak Hazır, İdari Olarak Beklemede:** PayTR Merchant iFrame entegrasyonu, HMAC-SHA256 bildirim doğrulaması, bakiye yükleme ve sipariş durum makinesi kusursuz şekilde kurulmuştur. Ancak canlı PayTR mağaza paneli onayı, canlı anahtarlar ve panelde Bildirim URL tanımlaması yapılmadan nakit akışı dönmemektedir.
4. **Yasal Uyum ve Bakım Modu Riskleri:** Yasal sayfalar `/legal` altında derli toplu ve şirket künyesi (Yapınet Ltd. Şti.) ile mühürlüdür. Ancak `RegisterForm` üzerinde KVKK / Kullanım Şartları onay kutusu eksiktir. Bakım modu (`SITE_MAINTENANCE_FREEZE`) aktif edildiğinde PayTR webhook'ları dahil tüm sistemi 503'e düşürmekte ve geliştirici/admin için hiçbir bypass mekanizması sunmamaktadır.
5. **Aşırı Mühendislik (Over-Engineering) ve Dokümantasyon Yükü:** Kılavuz dokümanlar (`ANAYASA.md`, `MANIFESTO.md`, `PEDAGOJI.md`) ideolojik ve felsefi olarak çok zengin olmakla birlikte, kod tabanını "kural polisliği" yapan kırılgan string/grep testleriyle boğmuştur. Projede yalnızca 13 adet WAV ses dosyası bulunmasına rağmen, tüm platform sanki 20 kursun seslendirmesi tamamlanmış gibi kurgulanmış ve test kırılmalarına yol açmıştır.

---

## 2. ADIM 1: YAYIN VE ÖDEME HAZIRLIK KONTROLÜ

### 2.1. Platform Modülleri: Aktif Modüller Sorunsuz Çalışıyor mu?

Sistem Anayasa A7 maddesi gereğince **4 çalışan oda** (`dashboard`, `academy`, `career`, `freelancer`) ve **4 çekirdek sığınak** (`/profil`, `/cuzdan`, `/pasaport`, `/admin`) üzerine kurulmuştur. Donmuş 8 oda (`archived/app/` altındaki Studio, DevLabs, Kurumsal, Hibe, Arena, Pazaryeri/Yetkinİlan, Junior, Social/YetkinX) HTTP 410 Gone ile başarıyla izole edilmiştir.

Aktif modüllerin detaylı inceleme sonuçları:

| Modül / Sığınak | Rota / Konum | Durum | Teknik Tespit & Darboğazlar |
|---|---|---|---|
| **Dashboard** | `/dashboard` | **ÇALIŞIYOR (Stabil)** | Salt-okuma hub kabuğu. `loadDashboardPulse`, `loadIdentityBoard` ve cüzdan şeridini birleştirir. Bakiye değiştirmez, veri yoksa vatandaş dilinde dürüstçe "yüklenemedi" der. |
| **Akademi** | `/academy`, `/academy/[slug]`, `/academy/[slug]/oyna`, `/academy/dogrula/[hash]` | **KISMİ ÇALIŞIYOR (İçerik Eksik)** | Müfredat görüntüleme, satın alma, ders tamamlama ve sunucu taraflı sınav motoru (≥%70 barajı) sorunsuzdur. Sertifika SHA-256 ile kamuya açık doğrulanabilir.<br>**Sorun 1:** Vitrindeki 20 SKU'dan yalnızca 3 tanesinin bir kısım dersinde gerçek ses vardır (`public/media/academy/audio/` altında sadece 13 WAV dosyası mevcut). Diğer kurslarda ses yoktur.<br>**Sorun 2:** `app/academy/[slug]/page.tsx` içinde `@/lib/kernel/db` importu yapılmış ve bu durum `verify:boundaries` mimari katman testini kırmaktadır. |
| **Kariyer** | `/career`, `/pasaport` | **ÇALIŞIYOR (Stabil)** | Sertifikalardan üretilen `career_visa_stamps` ve portföy öğeleri listelenir. Vize kapısı (`visa-gate.ts`) sertifikasız teklifleri HTTP 403 ile engeller. |
| **Freelancer** | `/freelancer`, `/freelancer/jobs/[id]`, `/freelancer/new` | **TİCARİ BLOKE (HTTP 503)** | İlan oluşturma, teklif verme, mesajlaşma ve IDOR korumaları çalışmaktadır.<br>**Kritik Engel:** İş kabulünde (`/api/freelancer/jobs/[id]/accept`), lisanslı split portu (`paytrMarketplaceSplitPort.beginHold`) çağrılmakta ve bu port kalıcı olarak `{ ok: false, reason: "not_configured" }` dönmektedir. Sonuç olarak iş kabul edilemez, emanet kilitlenemez ve usta kazancı dağıtılamaz. |
| **Cüzdan** | `/cuzdan` | **ÇALIŞIYOR (Hazır)** | Canlı bakiye, ledger hareketleri, tek defter CTE sorgusu ve PayTR iFrame yükleme formu hazırdır. Float para veya sahte CREDIT yazımı yoktur. |
| **Profil** | `/profil` | **ÇALIŞIYOR (Eksikleri Var)** | Görünen ad (`PATCH /api/profile`) ve fatura bilgileri (`PUT /api/profile/billing`) güncellenebilmektedir. Avatar veya hesap silme özelliği yoktur. |
| **Admin** | `/admin`, `/admin/curriculum-revisions` | **ÇALIŞIYOR (Ortam Değişkenine Bağımlı)** | Katalog fiyatlarını ve müfredat revizyonlarını yönetir. Yalnızca `SUPER_ADMIN_USER_ID` veya `CANONICAL_SUPER_ADMIN_EMAIL` ile korunur. |

### 2.2. Kullanıcı Profilleri: Profil Oluşturma, Düzenleme ve Rol Yetkileri Eksiksiz mi?

1. **Profil Oluşturma (Registration):**
   - Kayıt akışı Supabase Auth üzerinden çalışır (`RegisterForm`).
   - Kayıt anında `handle_new_user` SQL trigger'ı ile Prisma `users` tablosuna otomatik senkronizasyon yapılır.
   - Güvenli şifre üretici ve 18 yaş kontrolü mevcuttur.
2. **Profil Düzenleme:**
   - İsim değiştirme (`PATCH /api/profile` -> `displayName`) doğrulanmış oturum gerektirir ve XSS/karakter sınırına tabidir.
   - Fatura bilgileri (`PUT /api/profile/billing`), Bireysel ve Kurumsal olarak TCKN/VKN, vergi dairesi, adres ve cep telefonu doğrulamasıyla `user_billing_info` tablosuna yazılır. PayTR'nin talep ettiği müşteri telefon ve adres bilgileri bu tablodan beslenir.
3. **Rol Yetkileri ve Erişim Denetimi Eksikleri (Kritik Bulgular):**
   - **Veritabanında RBAC (Role-Based Access Control) Yoktur:** Prisma `User` tablosunda `role` kolonu bulunmamaktadır. Sistemde "Öğrenci", "Eğitmen", "İşveren", "Moderatör", "Operatör" gibi roller ayrıştırılmamıştır.
   - **Tekil Admin Bağımlılığı:** Super Admin yetkisi yalnızca `.env` dosyasındaki `SUPER_ADMIN_USER_ID` UUID'si veya `CANONICAL_SUPER_ADMIN_EMAIL` eşitliği ile kontrol edilmektedir (`lib/kernel/auth/super-admin.ts`). Eğer bu ortam değişkenleri girilmezse veya yanlış yazılırsa sistemde **hiçbir admin bulunamaz**.
   - **Eksik Kullanıcı Hakları (KVKK / GDPR):**
     - Kullanıcı hesabı silme (Right to be Forgotten) arayüzü veya API'si yoktur.
     - E-posta adresi değiştirme işlevi mevcut değildir.
     - Profil fotoğrafı (avatar) yükleme altyapısı bulunmamaktadır.

### 2.3. Yasal Sayfalar: Mesafeli Satış, Gizlilik Politikası, KVKK vb. Zorunlu Sayfalar Tamam mı?

Platformun yasal altyapısı `app/(public)/legal` ve `lib/copy/legal-launch.ts` altında merkezi olarak toplanmıştır:

1. **Mevcut ve Eksiksiz Olanlar:**
   - **Şirket Künyesi (SSOT):** `Yapınet Gayrimenkul ve E-Ticaret Limited Şirketi`, VKN: 9370683361 (Akhisar V.D.), MERSİS: 937068336100017, Adres, İletişim E-postası ve WhatsApp hattı tüm yasal sayfalarda ve `/iletisim` rotasında tutarlıdır.
   - `/legal/gizlilik`: 6698 sayılı KVKK Aydınlatma Metni ve Gizlilik Politikası.
   - `/legal/cerez`: Çerez Politikası (Üçüncü taraf takip çerezi kullanılmadığı beyanı).
   - `/legal/iade`: İptal ve İade Koşulları (6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca dijital içeriklerde anında ifa istisnası ve genel 14 gün iade kuralları).
   - `/legal/mesafeli-satis`: Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi.
   - `/legal/kullanim`: Platform Kullanım Koşulları ve Sorumluluk Sınırları.
   - **Ödeme Anında Onay:** Cüzdan yükleme formunda (`WalletTopUpForm`), Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu'nun onaylandığına dair versiyonlu (`CHECKOUT_LEGAL_CONSENT_VERSION`) zorunlu onay kutuları bulunmaktadır.
2. **Kritik Yasal Eksikler:**
   - **Kayıt Formunda KVKK & Sözleşme Onay Boşluğu:** `components/auth/register-form.tsx` incelendiğinde, kayıt ekranında yalnızca `18 yaşından büyüğüm` onay kutusunun bulunduğu görülmüştür. Kullanıcı hesap oluştururken Kullanım Koşulları ve KVKK Aydınlatma Metni'ni gördüğünü ve onayladığını belirten bir onay kutusu ve link bulunmamaktadır. Bu durum KVKK ve E-Ticaret mevzuatı açısından doğrudan uyumsuzluk teşkil eder.
   - **ETBİS (Elektronik Ticaret Bilgi Sistemi) Eksikliği:** Ticaret Bakanlığı ETBİS kaydı ve karekodu sitede yer almamaktadır.
   - **İYS (İleti Yönetim Sistemi):** Ticari elektronik ileti gönderimi için açık rıza ve İYS entegrasyonu mevcut değildir (gerçi e-posta pazarlaması yapılmadığı beyan edilmektedir).

### 2.4. Bakım Modu & PayTR Entegrasyonu: Canlı Ortama Geçiş İçin Hazır mı?

#### A. Bakım Modu (`SITE_MAINTENANCE_FREEZE`) İncelemesi:
- **Konum & Mekanizma:** `proxy.ts` üzerinde Next.js Edge katmanında `isSiteMaintenanceActive` fonksiyonu ile çalışmaktadır. `SITE_MAINTENANCE_FREEZE=true` veya `1` olduğunda gelen istekler yakalanır ve HTML veya JSON olarak HTTP 503 Service Unavailable basılır.
- **İstisnalar:** `/legal`, `/iletisim`, `robots.txt`, `sitemap.xml`, `/api/health*` yolları bakım modundan muaftır.
- **Kritik Güvenlik ve Mimari Zaafiyetler:**
  1. **Admin / Test Bypass Mekanizması Yoktur:** Bakım modu açıldığında, geliştirici ekibin veya Super Admin'in sisteme erişebileceği bir gizli cookie, header veya IP istisnası bulunmamaktadır. Admin paneli (`/admin`) dahi 503 verir.
  2. **PayTR Webhook'u Engellenir:** `/api/payments/webhooks/paytr` adresi bakım muafiyet listesinde (`isPublicCompliancePath`) **yer almamaktadır**! Bakım modu açıkken PayTR'den gelen ödeme bildirimleri 503 alarak reddedilir.
  3. **Yalnızca Env ile Yönetilir:** Canlıda bakım moduna geçmek veya çıkmak için Vercel üzerinde ortam değişkenini değiştirip yeni bir deployment/restart tetiklemek zorunludur; panelden dinamik açılamaz.

#### B. PayTR Entegrasyonu Canlıya Geçiş Hazırlığı:
- **Merchant Port (Akademi / Cüzdan Yükleme — PayTR iFrame API):**
  - **Mühendislik Kalitesi: %95 Hazır.**
    - `lib/kernel/payments/paytr/checkout.ts`: Sepet kodlama (Base64), token alma isteği, HMAC-SHA256 hesaplama ve iFrame URL oluşturma standartlara tam uygundur.
    - `assertPaytrProductionSafety`: Üretimde `PAYTR_SANDBOX` veya `PAYTR_ALLOW_MOCK_CHECKOUT` varsa sistemi bilinçli olarak durdurur (throw), sahte ödemeyi engeller.
    - `assertPaytrLiveUserIp`: Canlı modda loopback/private IP'leri engeller, gerçek müşteri IP'sini zorunlu kılar.
    - `app/api/(kernel)/payments/webhooks/paytr/route.ts`: HMAC hash doğrulamasını yapar, mükerrer istekleri engeller (idempotency), `PaymentOrder` tablosunu `CLEARED` durumuna çeker ve `Wallet`'a tek bir `CREDIT` satırı yazar.
  - **Canlıya Geçiş İçin Eksikler (İdari / Konfigürasyon):**
    - PayTR Mağaza Başvurusunun onaylanması.
    - Canlı `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` değerlerinin Vercel ortamına girilmesi.
    - `PAYTR_SANDBOX` değişkeninin canlı ortamda tamamen silinmesi/boş bırakılması.
    - PayTR Üye İşyeri Paneli'nde Bildirim URL (Callback URL) alanına `https://yetkin.ai/api/payments/webhooks/paytr` adresinin tanımlanması.
- **Marketplace Split Port (Freelancer — PayTR Pazaryeri API):**
  - **Mühendislik Seviyesi: %0 (Tamamen Kapalı / Stub).**
  - `lib/kernel/payments/marketplace-split.ts` dosyasında `paytrMarketplaceSplitPort.beginHold` fonksiyonu kalıcı olarak `{ ok: false, reason: "not_configured" }` dönmektedir.
  - PayTR Pazaryeri alt satıcı (sub-merchant) oluşturma, satıcı IBAN kaydı ve hakediş dağıtım (split transfer) servisleri **kodlanmamıştır**.
  - **Sonuç:** Freelancer modülünde hiçbir işin kabul edilmesi ve ödemesinin dağıtılması mevcut kodla mümkün değildir.

---

## 3. ADIM 2: KILAVUZ DOKÜMANLARIN (ANAYASA, MANIFESTO, PEDAGOJI) SORGULANMASI

Platform dokümantasyonu (`.system_docs/ANAYASA.md`, `.system_docs/MANIFESTO.md`, `.system_docs/PEDAGOJI.md`), projeye benzersiz bir kimlik ve sıkı güvenlik sınırları kazandırmıştır. Ancak Teknik Lider perspektifinden bakıldığında, bu dokümanların bir kısmı **güncelliğini yitirmiş, gereksiz katılık yaratan ve ekibin geliştirme hızını kilitleyen dogmalara** dönüşmüştür.

### 3.1. ANAYASA.md Kritiği: Kurallar Bizi Kısıtlıyor mu?

| Anayasa Maddesi | Beyan Edilen Amaç | Fiili Sonuç ve Yarattığı Kısıt | Teknik Lider Değerlendirmesi |
|---|---|---|---|
| **A1. Tek defter, tek birim (`amountMinor`)** | Float para hatalarını ve çoklu bakiye kaosunu önlemek. | **Çok Başarılı.** Finansal bütünlüğü koruyor, hiçbir matematiksel kuruş sapmasına izin vermiyor. | **KORUNMALI.** Bu kural tavizsiz devam etmelidir. |
| **A2. Ödeme kuruluşu değiliz (S43)** | Lisanssız para tutma (6493 sayılı Kanun) suçundan kaçınmak. İç çekim (`/api/wallet/withdraw`) açmamak. | **Aşırı Kısıtlama.** Bu madde, Pazaryeri Split API'si bağlanana kadar Freelancer modülünü tamamen felç etmiştir. Sistem "emanet para tutamayız" korkusuyla 503 duvarı örmüş, ancak alternatif bir geçiş modeli (örn. doğrudan işveren-freelancer harici faturalaşması veya pilot emanet sözleşmesi) sunmamıştır. | **REFAKTÖR EDİLMELİ.** PayTR Pazaryeri entegre edilene kadar Freelancer modülü sahte bir "çalışan oda" olarak sunulmamalı, açıkça "Kapalı Pilot" statüsüne alınmalıdır. |
| **A3. Sır ve Kimlik (`service_role` yasağı)** | Supabase servis anahtarının sızmasını ve istemcide kullanılmasını engellemek. | **Kısmen Kısıtlayıcı.** Servis anahtarının istemciye sızmaması kuralı doğrudur. Ancak sunucu tarafında dahi `service_role` ile Supabase Admin Auth API'sinin kullanılmasının yasaklanması, backend'de kullanıcı silme, e-posta doğrulama gibi temel admin operasyonlarını imkansız hale getirmiştir. | **GÜNCELLENMELİ.** `service_role` anahtarı istemcide kesinlikle yasak kalmalı; ancak güvenli sunucu tarafı izole cron/admin servislerinde kontrollü kullanılabilmelidir. |
| **A7. Asil Sicil (4 Oda + 4 Sığınak)** | Kapsam şişmesini (scope creep) önlemek, müze kodlarını engellemek. | **Tasarım Olarak Doğru, Bürokratik Olarak Katı.** 4 oda sınırı odağı korumuş; ancak bildirim merkezi, destek sistemi gibi meşru platform bileşenlerinin dahi "5. oda açılamaz" diye dışlanmasına yol açmıştır. | **ESNETİLMELİ.** Odalar mikro-servis gibi değil, monolit içi işlevsel alanlar olarak değerlendirilmelidir. |
| **A8. Kernel Sınırı ve Grep Yasakları** | Katmanlar arası bağımlılıkları korumak. | **Gereksiz Karmaşıklık.** Kod tabanında `verify:boundaries`, `verify:atomic-seals` gibi onlarca grep betiği çalışmaktadır. Örneğin `app/academy/[slug]/page.tsx` sırf `@/lib/kernel/db` import ettiği için testler kırmızıya dönmektedir. Grep kuralları mimarinin kendisi haline gelmiş ve geliştiriciyi yavaşlatmıştır. | **SADELEŞTİRİLMELİ.** Katman denetimleri regex/grep ile değil, ESLint kuralları ve TypeScript sınırlarıyla yönetilmelidir. |

### 3.2. MANIFESTO.md Kritiği: Gerçekler ve Felsefi İllüzyonlar

1. **"Hayırlı Zorbalık" (Vize Kapısı) Pazar Paradoksu:**
   - Manifestodaki *"Eğitim alıp sınavı geçmeyen kimse teklif veremez. Vizesiz teklif HTTP 403 ile reddedilir"* kuralı, kağıt üzerinde "kalite filtresi" olarak parlamaktadır.
   - **Piyasa Gerçeği:** Henüz platformda iş ilanı veren organik işveren yokken, bir uzmana "Önce git ₺250-₺500 verip sınavı geç, sonra işe başvurursun" demek, platformu baştan ölü doğurur. İki taraflı pazaryerlerinde arz tarafı (freelancer), talep (işveren) görmediği bir platformda sertifika için para ödemez. Vize kapısı erken aşamada bir avantaj değil, kullanıcı edinimini engelleyen bir bariyerdir.
2. **Aşırı Ağır İdeolojik Dil:**
   - Dokümanda geçen *"Lonca", "Mühürlü Emek", "Vatandaş", "Sığınak", "Garson ve Şef"* gibi kavramlar manifesto düzeyinde hoş bir anlatı kursa da, dokümanı okuyan mühendisler için standart endüstri terimlerini (LMS, Escrow, Payment Gateway, RBAC, Webhook) gölgelemektedir.
3. **"Tek İnsan Halkayı Döndürsün" İllüzyonu:**
   - Manifesto, tek bir gerçek insanın sisteme para yatırıp kurs almasını, sınavı geçip iş almasını ve parasını almasını tek başarı kriteri koymuştur. Ancak Freelancer kabulü kodda 503'e kilitli olduğu için, bu tek insanın halkayı döndürmesi matematiksel ve mimari olarak imkansızdır.

### 3.3. PEDAGOJI.md Kritiği: Kağıt Üstündeki Standart ile Diskteki Gerçeklik

1. **WAV ve Ses Mührü İllüzyonu:**
   - Dokümanda 7 Altın Kural sayılmış; Gemini TTS `Erinome` sesiyle tüm derslerin seslendirilmesi gerektiği emredilmiştir.
   - **Diskteki Acı Gerçek:** Vitrinde 20 adet eğitim SKU'su tanımlıdır; fakat diskte **yalnızca 13 adet WAV dosyası** bulunmaktadır (sadece `ai-agent-temel` 6, `orta` 3, `ileri` 4).
   - Python Temel/Orta/İleri, Fullstack, Siber Güvenlik, Canva, E-ticaret gibi vitrindeki diğer 17 kursun **tek bir saniyelik dahi ses kaydı yoktur**. Doküman sanki tüm dersler sesliymiş gibi konuşmakta, bu durum testlerde de sahte beklentilere yol açmaktadır.
2. **Gemini TTS Boru Hattının Kırılganlığı:**
   - Gemini TTS önizleme modeli (`gemini-3.1-flash-tts-preview`) ile otomatik ses üretim testleri incelendiğinde, Google API'sinin sürekli `429 RESOURCE_EXHAUSTED` kotasına girdiği ve CI ortamlarında çökmelere yol açtığı tespit edilmiştir.
3. **Tek Tip Pedagoji Dayatması:**
   - "Şiir okuma garsonu göster" ve her derste kod çiti / araç çağırma sahnesi kurgusu, Yazılım ve AI Agent kursları için harika bir yaklaşımdır. Fakat E-ticaret, Sosyal Medya ve Tasarım gibi beceri kurslarına aynı şablonu dayatmak pedagojik olarak verimsizdir.

---

## 4. ADIM 3: TAVSİYE VE STRATEJİ (SEN OLSAYDIN NE YAPARDIN?)

### Soru 1: "Sen olsaydın mevcut mimaride ve kod yapısında ilk olarak neyi değiştirirdin / ne yapardın?"

**Teknik Lider Olarak İlk 5 Müdahalem:**

1. **Freelancer Modülünün İkiyüzlülüğünü Bitirirdim:**
   - `paytrMarketplaceSplitPort` bağlı değilken Freelancer modülünü "Canlı ve Çalışıyor" gibi sunmayı derhal durdururdum. İş kabul butonunun 503 vermesi kullanıcıda sistemin bozuk olduğu algısını yaratır. PayTR Pazaryeri sözleşmesi tamamlanana kadar iş kabul butonuna *"Pazaryeri emanet altyapımız entegrasyon aşamasındadır — Pilot teklifler için destek@yetkin.ai ile iletişime geçiniz"* uyarısı koyardım.
2. **Kırık Testleri ve Katman Sızıntısını Temizlerdim:**
   - `app/academy/[slug]/page.tsx` içindeki doğrudan `@/lib/kernel/db` importunu kaldırıp `lib/academy/load` içerisine taşıyarak `verify:boundaries` testini yeşile çekerdim.
   - `tests/kernel/wallet-top-up-fail-closed-surface.test.ts`, `tests/ui/ux-friction-surface.test.ts`, `tests/academy/course-seed-surface.test.ts` ve `tests/academy/lesson-media-surface.test.ts` dosyalarındaki yapay string kontrolü kırılmalarını düzeltirdim.
3. **Kayıt Formuna Yasal Onay Kutularını Eklerdim:**
   - `RegisterForm` içerisine Kullanım Koşulları ve KVKK Aydınlatma Metni linklerini ve zorunlu onay checkbox'ını ekleyerek hukuki açığı kapatırdım.
4. **Bakım Moduna Acil Müdahale Ederdim:**
   - `proxy.ts` / `site-maintenance.ts` içinde:
     - PayTR webhook rotasını (`/api/payments/webhooks/paytr`) bakım muafiyetine (`isPublicCompliancePath`) eklerdim.
     - Yönetici IP'si veya özel bir bypass cookie/secret'ı (`x-yetkin-maintenance-bypass`) ekleyerek bakım modundayken yetkililerin siteyi inceleyebilmesini sağlardım.
5. **Grep Tabanlı "Kural Polisliğini" Azaltırdım:**
   - Kod tabanındaki kelime avı yapan (örn. bir metinde "Belgeni" yerine "Sertifikanı" yazıldı diye CI patlatan) surface testlerini temizler, yerine gerçek API ve kullanıcı senaryolarını test eden E2E testlerine yatırım yapardım.

---

### Soru 2: "Platform kurgusu (Core + Micro-Apps) mevcut haliyle doğru kurgulanmış mı, mimari borç (technical debt) var mı?"

#### A. Kurgu Doğru mu?
**EVET, kurgu stratejik olarak doğrudur; ancak ismi yanıltıcıdır.**
- Platform iddia edildiği gibi mikroservislerden veya dağıtık mikro-uygulamalardan oluşan bir "Sürü Dron Ekosistemi" değildir.
- **Fiili Durum:** Tek bir Next.js 16 projesi, tek bir Prisma şeması ve tek bir PostgreSQL veritabanından oluşan **Modüler bir Monolit (Modular Monolith)**tir.
- Ve bu durum projenin mevcut aşaması için **en doğru mimari karardır**. Henüz geliri olmayan, tek bir çekirdek ekiple yönetilen bir girişimde mikroservis mimarisine gitmek intihar olurdu. Monolit yapı sayesinde ACID transaction'lar, tek defter garantisi ve tip güvenliği korunabilmiştir.

#### B. Mevcut Mimari Borçlar (Technical Debt):

1. **Monolit İçinde "Sahte Dağıtık Sistem" Bürokrasisi:**
   - Proje tek bir repository olmasına rağmen, modüller arasında aşırı katı sınırlar konulmuştur. Bir modül diğerinin ufak bir yardımcı fonksiyonunu import edememekte, bu yüzden aynı kodlar ya da veri tipleri farklı yerlerde tekrar yazılmaktadır.
2. **Aşırı Altyapı Yatırımı vs. İçerik Yokluğu (Orantısızlık):**
   - Sisteme bakıldığında; token bucket rate limiter'lar, Inngest arka plan işçileri, circuit breaker'lar, SHA-256 medya mühürleri, 420 ms kelime saati çalarlar gibi yüzlerce saatlik karmaşık altyapı inşa edilmiştir.
   - Ancak veritabanında satılacak sadece 1 adet seslendirilmiş eğitim vardır. Platform "harika bir fabrika kurmuş ama fabrikada üretilecek hammaddeyi getirmeyi unutmuştur". En büyük mimari borç, ürünün asıl değeri olan **içerik üretiminin kod mimarisinin gerisinde kalmasıdır**.
3. **Veritabanı Çift Başlılığı (Supabase Auth vs. Prisma Postgres):**
   - Kullanıcı oturumları Supabase Auth'ta, platform verileri Prisma Postgres'te tutulmaktadır. Aralarındaki senkronizasyon bir SQL trigger'ına (`handle_new_user`) emanettir. Trigger başarısız olduğunda veya Supabase migration'ı geciktiğinde, kullanıcı oturum açsa bile Prisma tarafında kullanıcı kaydı oluşmamakta ve sistem 500 hataları vermektedir.
4. **Veritabanında Rol Yokluğu:**
   - Roller veri modelinde yer almadığı için ileride kurumsal müşteriler, eğitmen paneli veya müşteri temsilcisi gibi roller eklenmek istendiğinde ciddi bir veri tabanı migrasyonu ve yetki katmanı refaktörü gerekecektir.

---

### Soru 3: "Bir sonraki aşamada ne yapılması gerektiğini düşünüyorsun?" (Stratejik Yol Haritası)

Platformun önündeki en büyük tuzak, yeni özellikler (yeni odalar, mobil dron, yapay zeka ajanları) yazmaya devam etmektir. Bir sonraki aşama **tamamen sadeleşme, odaklanma ve ilk gerçek geliri elde etme** aşaması olmalıdır.

#### FAZ 1: İlk Gerçek Gelir & Akademi Odaklı Canlı Yayın (1-2 Hafta)
- **Hedef:** Yalnızca Akademi modülü üzerinden gerçek bir kullanıcının gerçek kredi kartıyla ₺100 yatırıp kurs satın alması ve sertifika almasını sağlamak.
- **Eylemler:**
  1. PayTR canlı mağaza başvurusunu tamamlamak, mağaza onayını almak.
  2. Canlı anahtarları Vercel'e girmek, test modunu kapatmak ve bildirim URL'sini PayTR paneline kaydetmek.
  3. `RegisterForm`'a KVKK ve Sözleşme onay kutusunu eklemek.
  4. Freelancer modülünü "Geliştirme / Pilot Aşamasında" olarak etiketleyip 503 butonlarını gizlemek veya pilot başvuru formuna bağlamak.
  5. `app/academy/[slug]/page.tsx`'deki boundaries sızıntısını ve 4 kırık surface testini düzeltmek.
  6. Canlıda gerçek bir kredi kartıyla uçtan uca ödeme yapıp `Wallet` -> `DEBIT` -> Kurs Tamamlama -> Sınav -> Mühürlü Sertifika döngüsünü mühürlemek.

#### FAZ 2: İçerik Zenginleştirme & Pazarlama (2-4 Hafta)
- **Hedef:** Vitrindeki hayalet kursları gerçek ürünlere dönüştürmek.
- **Eylemler:**
  1. Yalnızca en çok satma potansiyeli olan 2-3 eğitime odaklanmak (örn. "AI Agent Geliştirme", "Python ile Veri Analizi").
  2. Bu eğitimlerin seslendirmelerini ve pratik kod örneklerini eksiksiz tamamlamak.
  3. Seslendirmesi olmayan diğer kursları vitrinde "Çok Yakında" statüsüne almak; vatandaşa olmayan sesin oynatıcısını göstermemek.
  4. ETBİS kaydını tamamlamak ve karekodunu yasal footer'a eklemek.

#### FAZ 3: Lisanslı Pazaryeri Sözleşmesi ve Freelancer Entegrasyonu (1-2 Ay)
- **Hedef:** Freelancer modülünün nakit halkasını yasal olarak açmak.
- **Eylemler:**
  1. PayTR veya iyzico ile resmi "Pazaryeri (Marketplace)" sözleşmesi imzalamak.
  2. Alt satıcı (sub-merchant) onay API'sini entegre etmek.
  3. `paytrMarketplaceSplitPort` içerisindeki `not_configured` stub'ını gerçek PayTR split API çağrılarıyla değiştirmek.
  4. Freelancer emanet kilidi ve hak ediş serbest bırakma (release) akışını canlı split ödemesiyle test etmek.

#### FAZ 4: Mimari Yalınlaştırma (Bahar Temizliği)
- **Hedef:** Geliştirme hızını artırmak ve aşırı mühendislik yükünü hafifletmek.
- **Eylemler:**
  1. Yüzeydeki kırılgan grep testlerini (`*surface.test.ts`) ayıklamak.
  2. Dokümantasyondaki felsefi terminolojiyi net mühendislik tanımlarıyla dengelemek.
  3. `User` tablosuna hafif bir `role` enum'ı (`USER`, `INSTRUCTOR`, `ADMIN`) ekleyerek tekil `.env` admin bağımlılığını kaldırmak.

---

## 5. SONUÇ VE MÜHÜR

`yetkin.ai` projesi; güvenlik hassasiyeti, veri bütünlüğü disiplini (`amountMinor`, tek defter mimarisi) ve kriptografik sertifikasyon vizyonuyla olağanüstü sağlam bir omurgaya sahiptir. 

Ancak bugün karşılaşılan en büyük problem teknik eksiklikler değil, **vizyonun ürünü aşırı karmaşık kurallarla kilitlemiş olmasıdır.** 

Platformun hayatta kalması ve başarıya ulaşması; kod yazmayı bir süreliğine durdurup, PayTR Merchant kapısını açarak **Akademi üzerinden o "tek gerçek insanın" parasını kasaya almasına** bağlıdır.

*Bu rapor, yetkin.ai kod tabanının 3 Eylül 2026 tarihindeki anlık durumuna istinaden Teknik Lider sıfatıyla hazırlanmış ve `/docs/TESPIT_RAPORU.md` altına işlenmiştir.*
