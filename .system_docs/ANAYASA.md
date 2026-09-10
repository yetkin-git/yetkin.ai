# ANAYASA — yetkin.ai

İnsan SSOT (Tek Gerçek Kaynak). Ürün kodu bu dosyayı doğrudan import etmez.

Bu belge iki katmandan oluşur:
- **A Katmanı (Sert Kırmızı Çizgiler):** Yasal, finansal ve temel güvenlik zorunluluklarıdır. Değişmez ve taviz verilemez.
- **B Katmanı (Esnek Ops ve Mühendislik Notları):** Mimari, operasyonel ve ürün rehberliğidir. Geliştirme hızını kesmeyen, ekip ve AI ajanının hareket alanını genişleten, gerektiğinde güncellenebilen yaşayan ilkelerdir. Greple kural polisliği yapılmaz.

| Alan | Değer |
|------|--------|
| Tarih | 16 Ağustos 2026 |
| Son Reform | **Eylül 2026 (Teknik Lider & Kurucu İrade Reformu):** Katı grep yasakları, kelime avı yapan test dogmaları ve aşırı kısıtlayıcı katman duvarları B Katmanı'na çekilerek esnetildi. Geliştirici ve AI ajanın hareket alanı açıldı; A Katmanı yalnızca temel yasal (S43), finansal (`amountMinor`), güvenlik (RLS/IDOR/Sır) ve kanıt (sunucu puanlı mühür) çizgilerine odaklandı. **9 Eylül 2026 (Faz 1 işletme resmi):** B2 kamu vitrini 3 oda; A2 Freelancer tahsilatı zaman kipi Faz 2. A1–A5 gevşetilmedi. |
| Kamu markası / domain | `yetkin.ai` |
| Kalıcı belgeler | `/.system_docs` |
| Ops | `.system_docs/OPS_RUNBOOK.md` |
| Vizyon | `.system_docs/MANIFESTO.md` |
| Günlük rapor | `/docs` — build fixture değildir |

---

# BÖLÜM A — SERT KIRMIZI ÇİZGİLER (DEĞİŞMEZLER)

Bu bölüm doğrudan yasal yaptırım, finansal kayıp ve kritik veri güvenliği risklerini önleyen sınırları tanımlar. PR ile "kolaylaştırmak" veya geçici kısayollar adına gevşetilemez.

## A1. Tek Defter, Tek Birim (`amountMinor`) ve Finansal SSOT

* **Para Birimi Tamsayıdır:** Tüm şema ve tiplerde tutarlar **`amountMinor`** (kuruş cinsinden pozitif tamsayı) ve `currencyCode` olarak tutulur. Float (ondalıklı) para kullanımı kesinlikle yasaktır.
* **Tek Finansal SSOT:** Sistemdeki tek bakiye kaynağı `Wallet` satırı ve append-only (yalnızca eklemeli) çalışan `LedgerEntry` defteridir. `User` modelinde bakiye kolonu bulunamaz. Çift bakiye, kontrolsüz holding havuzları ve defter dışı nakit yazıcılar yasaktır.
* **Emanet İkinci Bakiye Değildir:** `EscrowHold` tablosu bağımsız bir sanal para havuzu değildir; lisanslı ödeme sağlayıcısı (PSP) nezdindeki işlem referansı (`referenceKey` / `pspPaymentId`) ile eşleşir. `Wallet`, platform içi merchant işlem bakiyesidir.
* **Fiyat Dinamiktir:** Satış fiyatları kod içerisine gömülü sabitler olamaz; Super Admin yönetimindeki dinamik katalog fiyatı SSOT'tur.

## A2. Ödeme Kuruluşu Değiliz (S43 ve 6493 Sayılı Kanun Uyumu)

* **Lisanssız Para Tutma ve Çekim Yasağı:** yetkin.ai bir banka veya lisanslı ödeme kuruluşu değildir. Platform içinden harici banka hesaplarına doğrudan para transferi veya çekim rotası (`/api/wallet/withdraw`) açılamaz. GİB, e-arşiv ve banka çekim paneli kurgulanamaz.
* **Tahsilat ve Hakediş Dağıtımı:**
  - Akademi eğitim ve sınav harçları lisanslı ödeme kuruluşu (PayTR Merchant Port) aracılığıyla tahsil edilir.
  - **Faz 2; lisanslı Split bağlıysa uygulanır:** Freelancer iş bedelleri lisanslı kuruluşun Pazaryeri Split altyapısında emanet ve bloke statüsünde tutulur; iş tesliminde ustanın net hakedişi doğrudan ödeme kuruluşu tarafından ustanın IBAN'ına aktarılır. Usta net hakedişi platform içi Rail cüzdanına CREDIT olarak yazılamaz.
* **Dürüst Durum (Fail-Closed):** Ödeme sağlayıcısı veya split portu bağlı değilse sahte onay verilmez; sistem dürüstçe ilgili işlemin henüz bağlanmadığını (`not_configured` / 503) bildirir.

## A3. Güvenlik, Kimlik ve İzolasyon (RLS, IDOR, Sır Koruması)

* **Servis Anahtarı İstemciye Sızamaz:** `SUPABASE_SERVICE_ROLE_KEY` / `service_role` anahtarı istemci tarafı (browser/frontend JS) koduna, açık `.env` değişkenlerine veya kullanıcıya açık yüzeylere asla sızdırılamaz. İstemci katmanı yalnızca doğrulanmış JWT oturumu ile konuşur.
* **Sunucu Tarafı Güvenli Erişim:** Sunucu tarafındaki veri erişimleri Prisma Postgres rolü ile yetkilendirilir. Arka plan görevleri ve izole sunucu işlemleri güvenli ortamda yürütülür.
* **RLS ve IDOR Koruması:** Tüm kullanıcı kaynaklarında Satır Düzeyinde Güvenlik (RLS) ve IDOR (Insecure Direct Object Reference) kontrolleri zorunludur. Hiçbir kullanıcı başka bir kullanıcının cüzdanına, teklifine, sözleşmesine veya sınav oturumuna izinsiz erişemez.
* **Idempotency:** Kritik mali yazma ve ödeme tamamlama işlemlerinde mükerrer işlem riskine karşı `Idempotency-Key` kullanımı esastır.

## A4. Kanıt Satın Alınamaz (Sunucu Değerlendirmeli Mühür)

* **Sunucu Tarafı Puanlama:** Sınav puanları ve başarı kriterleri asla tarayıcıda/istemcide hesaplanamaz. Puanlama ve değerlendirme sunucu tarafında yetkili motor tarafından icra edilir.
* **Kriptografik Mühür:** Akademi sertifikası ve başarı kanıtı para ödenerek satın alınamaz (baraj ≥70 puandır). Mühür yükü kriptografik olarak kilitlenir: `userId · courseId · attemptId · score · issuedAt · curriculumSeal`. Bu yük içerisine ödeme miktarı, vanity bilgileri veya sıralama dahil edilmez.
* **Açık Doğrulama:** Sertifika `/academy/dogrula/[hash]` adresinden kamuya açık, oturum gerektirmeksizin doğrulanabilir.

## A5. Dürüst Kapalı Yüzey (Sahte Bakiye ve Veri Yasağı)

* **Gerçek Neyse O:** Bağlı olmayan bir API, eksik bir ortam değişkeni veya yapılandırılmamış bir ödeme kanalı için kullanıcıya hayali başarı mesajı veya sahte onay gösterilemez. Kullanıcıya açık ve dürüstçe "henüz bağlanmadı / yüklenemedi" bilgisi verilir.
* **Sahte Finansal Veri Yasaktır:** Gerçek karşılığı olmayan sahte bakiye veya uydurma CREDIT satırı açılamaz.

---

# BÖLÜM B — OPS, ÜRÜN VE MİMARİ NOTLARI (ESNEK KATMAN)

Bu bölümdeki maddeler kırmızı çizgi değildir; operasyonel, mimari ve ürün geliştirme rehberliğidir. Ekibin ve AI ajanın geliştirme hızını kilitleyen, kelime avı yapan veya aşırı bürokratik katman kontrolleri bu katmanda esnetilmiştir.

## B1. Pragmatik Modüler Monolit ve Mimari Serbestlik

* **Grep Polisliğinin Sonu:** Katman denetimleri regex/grep ile kelime veya ithalat avı yaparak geliştiriciyi kilitleyemez. Kodun modülerliği ESLint kuralları, TypeScript tip sistemi ve sağlıklı yazılım prensipleriyle korunur.
* **Katmanlar Arası Sağlıklı İletişim:** Web sayfaları (Next.js React Server Components), servis katmanları (`lib/<modul>`) ve API rotaları pragmatik ihtiyaçlar doğrultusunda birbirini çağırabilir. Yapay dosya/klasör sınırları inovasyonun önüne geçemez.
* **Dış Sözleşme Standartlığı:** Mobil istemciler ve harici dronlar için `/api/v1` rotaları standart JSON zarfı `{ ok, error, requestId, apiVersion, data }` ile konuşur. Web arayüzü (Amiral) ise Next.js'in modern RSC veri yükleme (`load`) kabiliyetlerini serbestçe kullanır.

## B2. Odaklar ve Dinamik Modül Alanı

* **Faz 1 kamu vitrini (işletme resmi):** Panel (`dashboard`) + Akademi (`academy`) + Kariyer (`career`). Freelancer motoru sicilde durur (`lib/freelancer`, Prisma şema, emanet kaydı); kamu yüzeyi **410 Gone** döner. 4. oda nakit iddiası taşımaz; PayTR incelemesinde vitrin değildir. Silinmez, açılmaz.
* **Ana Odaklar (omurga hedefi):** Platformun çekirdek kullanıcı deneyimi `dashboard`, `academy`, `career` ve `freelancer` alanlarında yoğunlaşır. Çekirdek sığınaklar (`/profil`, `/cuzdan`, `/pasaport`, `/admin`) destekleyici alanlardır. Dört oda eşit canlılık iddiası değildir: Faz 1 çalışan vitrin 3 odadır; Freelancer kilitli motordur (Faz 2).
* **Genişleme Alanı:** Bildirim sistemleri, yardım masası, analitik panelleri veya kurumsal pilot ekranları gibi meşru ürün ihtiyaçları "katı oda sınırı" dogmasına takılmaksızın monolit içerisinde temiz modüller olarak kurgulanabilir.
* **Arşiv ve Müze:** Arşivlenmiş eski kodlar (`yetkin_muze/`, `archived/`) ana akışı kirletmediği sürece cezalandırıcı kurallarla değil, standart git ve paket disipliniyle yönetilir.

## B3. Geliştirici Dostu Test ve CI Politikası

* **Ön Derleme Kapısı (`verify:prebuild`):** Bu kapı yalnızca A Katmanı'ndaki hayati güvenlik ve finansal unsurları denetler (sır taraması, tamsayı para, RLS durumu, IDOR testleri ve temel API sözleşmesi).
* **Esnek Grep ve Stil Taramaları:** Belirli Türkçe kelimeleri, metin kalıplarını veya stil tercihlerini denetleyen taramalar (`verify:atomic-seals`, `verify:sen-axis` vb.) derlemeyi kıran mutlak engeller değildir; isteğe bağlı kalite veya nightly raporlama araçlarıdır.
* **Geliştirici ve AI Ajan Özgürlüğü:** Mühendisler ve otonom ajanlar iş mantığını kurarken yapay test kırılmalarından endişe etmeden, doğrudan katma değer üreten kod yazma esnekliğine sahiptir.

## B4. Müfredat, Pedagoji ve Dinamik Fiyatlandırma

* **Konunun Hakkı İlkesi:** Compact yayın makalesi kelime tavanı veya sabit ders adediyle kesilmez. Mühürlü yapay zekâ eğitiminin üretim matematiği `PEDAGOJI.md` §F’dedir (45–90 dk, 6–8 ders, ders başı 7–12 dk, dört adımlı doygunluk). Zorunlu 3 seviye basamağı yoktur; çok teknik konularda Temel / Orta / İleri bağımsız paket olarak ayrılabilir.
* **Piyasa Odaklı Fiyat:** Fiyatlar piyasa dinamiklerine göre Super Admin kataloğunda belirlenir. Kod içerisine maktu fiyat bantları gömülmez. Tohum tutarı soğuk vitrin / ops soft default’tur; canlı kilit `PriceCatalogEntry`’dir.
* **Çoklu Modalite:** Mühürlü eğitimler tam metin, zaman senkronlu cue, görsel/şema ve sinematik medya ile fırınlanır; izlemede harici API yoktur. Canlı gün 0 oynatıcı mühürsüz derste **makale (compact markdown)** modundadır. Compact makale müfredatını süre bandı boğmaz.

## B5. Harici Entegrasyonlar ve Pilot İş Modelleri

* **Pazaryeri Geçiş Dönemi:** Faz 1 kamu nakit kanalı PayTR Merchant (Akademi iFrame)’tır. Pazaryeri Split bağlı değilse freelancer nakit kabul edilmez; işlem A2 fail-closed ile `not_configured` / 503 döner. Split ayrı faz, ayrı sözleşmedir; Merchant onayı Split izni değildir. Ticari teklifler, kurumsal pilotlar ve işbirlikleri haricen yönetilir: platform dışı sözleşme ve fatura ile yürütülür, deftere nakit yazılmaz, sahte "tamamen hazır" iddiası basılmaz.
* **Altyapı Servisleri:** Redis, Inngest, e-posta sağlayıcıları gibi üçüncü taraf servisler operasyonel ihtiyaçlara göre devreye alınır; konfigürasyon eksikliğinde sistem zarifçe (graceful degradation) çalışmasını sürdürür.
