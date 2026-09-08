# MANİFESTO — yetkin.ai

**Ürün, Gelir ve Güven Odaklı Mühendislik Manifestosu**

| Alan | Değer |
|------|--------|
| Tarih | 17 Ağustos 2026 |
| Statü | Vizyon ve Strateji Belgesi. Anayasa'nın ruhunu, iş modelini ve büyüme hedeflerini açıklar. |
| Son Reform | **8 Eylül 2026 (Tedavi 01):** Motor 1 (Akademi) gün 0 kahramanı. Vitrin 5 compact SKU. Stüdyo sayıları vizyondan ayrıldı (`docs/OPS_STUDYO_SAYILARI.md`). Kural 2: **5 Garantili Kapı** (vize şartlı, 403) + **Standart Pazaryeri** (vizesiz OPEN). Motor 3 Split kapalı (503). Motor 2 Faz 2+. |
| Yer | `/.system_docs/MANIFESTO.md` |
| Çelişki | Bir cümle Anayasa ile çatışırsa `.system_docs/ANAYASA.md` bağlayıcıdır. |

---

# BÖLÜM 1 — BİZ KİMİZ, NE YAPIYORUZ?

## 1.1 Tek Cümle

**Kullanıcıya:**
> Öğrendiğini mühürle. Mührün kapıyı açsın. İşin güvende olsun.

**Mühendise ve Yatırımcıya:**
> yetkin.ai; öğrenme, doğrulanabilir yetkinlik (verifiable credentials) ve güvenli iş teslimini tek deftere bağlayan modern bir dijital yetenek ve iş platformudur.

**Gün 0 vitrin cümlesi (Faz 1):**
> Yetkinliğini kanıtlayan yapay zekâ eğitimleri. Kariyer belgesi ve freelancer emaneti dipnottur; nakit yalnız Akademi’dedir.

## 1.2 Pazar Fırsatı: Neden "Kanıt ve Güven" Satıyoruz?

Yapay zeka araçlarının yaygınlaşmasıyla birlikte, **"ben bu işi biliyorum" demenin maliyeti sıfıra indi.**

Bugün herhangi biri birkaç prompt ile göz alıcı bir özgeçmiş, cilalı bir portfolyo veya kusursuz görünen bir kod parçası üretebilmektedir. Ancak bu durum iki büyük pazar tıkanıklığı yaratmıştır:

1. **Nitelikli Uzman Görünmez Oldu:** Gerçekten emek veren, konuya hakim uzmanlar; yapay zeka çıktılarıyla şişirilmiş profillerin arasında kaybolmaktadır.
2. **İşveren Güvenini Kaybetti:** Küçük işletmeler ve şirketler, ilan sitelerinden aldıkları vasıfsız veya yapay zeka kopyası teslimatlardan bıkmış durumdadır.

yetkin.ai tam bu kırılma noktasında değer üretir:
> **İddianın bedava olduğu bir dünyada, kanıtlanmış yetkinlik en değerli varlıktır.**

Biz sadece kurs veya ilan listesi sunmuyoruz; **üretimin ve bilginin doğrulanabilirliğini** satıyoruz. Platformdaki her sertifika, sunucu tarafında değerlendirilen ve SHA-256 ile kriptografik olarak mühürlenen bir iş kanıtıdır.

## 1.3 Hedef Kitlemiz

1. **Yetkinliğini Kanıtlamak İsteyen Uzmanlar:** Alaylı yazılımcılar, kariyer değiştirenler, uzaktan çalışan profesyoneller ve referansa ihtiyaç duyan yetenekler. Onlar için sertifika bir kağıt parçası değil, iş kapılarını açan doğrulanabilir bir pasaporttur.
2. **Riski Sıfırlamak İsteyen İşverenler:** Kalitesiz teslimat riskini almak istemeyen, işi gerçekten ehline vermek ve emanet güvencesiyle çalışmak isteyen KOBİ'ler ve girişimler.

## 1.4 Marka ve Tasarım Duruşu

* **Yalın ve Sakin Arayüz (Quiet Luxury):** Güven bağırmaz. Gereksiz görsel karmaşadan uzak, sistem fontları ve temiz bileşenlerle hızlı yüklenen, kullanıcıyı yormayan sade bir deneyim sunuyoruz. Bu bir dogma değil, güven inşa eden bir ürün tercihidir.
* **Doğrudan İletişim (SEN Aksı):** Platform kullanıcıyla açık, net ve doğrudan ("sen") konuşur. Bürokratik veya ağdalı bir dil yerine samimi, profesyonel bir rehberlik dili benimsenir.

---

# BÖLÜM 2 — DEĞİŞMEZ TEMEL İLKELER VE ÜRÜN GERÇEKLERİ

## Kural 1 — Odaklanılan 4 Ana Deneyim Alanı

Platform odağını dağıtmamak adına 4 ana fonksiyonel alanda derinleşir:
* **Dashboard (`/dashboard`):** Kullanıcının durumunu ve sonraki aksiyonunu gösteren kumanda paneli.
* **Akademi (`/academy`):** Gelir motoru olan, piyasa odaklı eğitimler ve mühürlü sertifika sınavları.
* **Kariyer (`/career`):** Doğrulanmış yetkinlik vizeleri ve portfolyo vitrini.
* **Freelancer (`/freelancer`):** Güvenli iş listeleri, teklif ve sözleşme süreçleri.

*Ürün Gerçeği:* Bu dört odak projenin ana omurgasıdır. Faz 1’de **eşit olgunluk iddiası yoktur**: nakit ve kahraman Akademi’dedir. Kurumsal pilot, bildirim, yardım gibi meşru modüller "katı kural polisliği" ile engellenemez; monolit içinde temiz durur.

## Kural 2 — Vize Kapısı ve Büyüme Dengesi (Kod ile Aynı)

* **Vizyonun özü:** Nitelikli ilana teklif, ilgili compact SKU belgesine (Kariyer vizesi) bağlıdır. Bu, alıcıyı kalitesiz teklif yağmurundan korur.
* **Çift katman, tek gerçek** (`FREELANCER_GUARANTEED_NEED_IDS` + `FREELANCER_MARKETPLACE_NEED_IDS`):
  - **5 Garantili Kapı (Bölüm A, vize şartlı):** Ofis, e-ticaret, sosyal içerik, chatbot, prompt — her kapı yayın compact SKU’suna kilitlidir. Teklif **403** (`LISTING_ACCESS_VISA_DENIED` / kapsam dışı). Esnek rozet vaadi yoktur — kapı serttir.
  - **Standart Pazaryeri (Bölüm B, vizesiz OPEN):** Yazılım/web, grafik, dijital pazarlama, çeviri, diğer — vize istenmez; arka plan Açık Deneme mantığıdır (`isOpenTrialNeed`). Büyüme ve vizesiz işveren denemesi bu katmandadır.
  - **Açık Deneme (`acik-deneme`):** Aynı OPEN bayrağı; formda ayrı kapı olarak durur.
* İhtiyaç başlıkları yayın 5 SKU ile dürüsttür. Full-stack / sızma testi / UI-UX meslek tabelası formda yoktur.

## Kural 3 — Tek Defter ve S43 (Finansal ve Yasal Güvenlik)

* **Ödeme Kuruluşu Değiliz:** Platform lisanssız olarak üçüncü şahısların parasını kendi havuzunda tutamaz veya banka çekim rotası (`/api/wallet/withdraw`) sunamaz.
* **Harcama ve Tahsilat:**
  - Akademi tahsilatları doğrudan lisanslı ödeme kuruluşu (PayTR Sanal POS) üzerinden şirkete gelir olarak akar.
  - Freelancer iş bedelleri lisanslı kuruluşun Pazaryeri Split altyapısında emanet statüsünde durur ve iş bitiminde doğrudan ustanın IBAN'ına aktarılır.
* **Geçiş dönemi:** Pazaryeri Split bağlı değilken kabul **503 fail-closed**’dır (Anayasa A2). Ana sayfa Motor 3’ü gün 0 nakit gibi satmaz. Harici fatura ürün içi yeşil boyanmaz (A5).

## Kural 4 — Dürüst Yüzey ve Yapıcı Kullanıcı Deneyimi

* **Gerçek Bilgi İlkesi:** Sahte bakiye, uydurma onay veya hayali veriler gösterilemez. Ekranda görünen her finansal hareket gerçek bir defter kaydıdır.
* **Kullanıcı Dostu İletişim:** Bir entegrasyon henüz hazır olmadığında kullanıcıyı soğuk bir hata sayfası yerine; durumu dürüstçe açıklayan ve alternatif iletişim kanalları sunan yapıcı mesajlar karşılar.

---

# BÖLÜM 3 — NASIL HIZLI GELİR ELDE EDECEĞİZ? (GELİR MOTORLARI)

Bu belge yalnızca "neyi yapamayacağımızın" değil, **"şirketin nasıl hızla para kazanacağının"** yol haritasıdır.

```
       [ GELİR MOTORLARI ]
              │
  ┌───────────┼───────────┐
  ▼           ▼           ▼
MOTOR 1     MOTOR 2     MOTOR 3
Akademi     Kurumsal    Pazaryeri
Satışları   Yetkinlik   İşlemleri
(B2C)       (B2B)       (Komisyon)
```

### Motor 1: B2C Akademi Eğitim ve Sınav Satışları (Hemen / Gün 0)
* **Model:** Piyasada yüksek talep gören yapay zeka, yazılım ve dijital beceri eğitimlerinin doğrudan satışı.
* **Avantajı:** Yasal split veya karmaşık pazaryeri onaylarına ihtiyaç duymadan, standart PayTR Sanal POS ile ilk günden kredi kartıyla tahsilat yapılır.
* **Fiyatlandırma:** Dinamik ve erişilebilir fiyatlarla doğrudan nakit akışı üretilir.

### Motor 2: B2B Kurumsal Yetkinlik (Faz 2+)
* **Model:** Şirketlerin adaylarını test etmesi için kurumsal sınav ve mühür paketleri.
* **Gün 0:** Yok. Donmuş `kurumsal` odası 410. Akademi B2C oturmadan B2B odası açılmaz.

### Motor 3: Freelancer aracılık komisyonu (Faz 2 — Split sonrası)
* **Model:** Güvenli teslimat üzerinden platform komisyonu.
* **Bugün:** İlan ve teklif açık; emanet nakit akışı **Şimdilik Devre Dışı / Yakında**. `MARKETPLACE_SPLIT_LIVE = false`. Kabul 503.

---

# BÖLÜM 4 — MEVCUT DURUM VE FAZ GEÇİŞLERİ

1. **Mimari ve güvenlik (hazır):**
   - Modüler monolit, `amountMinor`, RLS/IDOR, SHA-256 mühür.
   - Canlı oynatıcı Aşama 1 compact makaledir. Yayın SKU: `01_office_ai` … `05_prompt_practice`.
   - Ses mührü, bake ve model id **stüdyo defterindedir** (`docs/OPS_STUDYO_SAYILARI.md`). Vizyon belgesi her bake’te güncellenmez. İzlemede canlı TTS yoktur.

2. **Faz 1: Gelir (şimdi):**
   - PayTR Merchant iFrame ile cüzdan yükleme + Akademi DEBIT.
   - 5 compact SKU satışı. Freelancer nakit vaadi yok.

3. **Faz 2: Ölçek ve pazaryeri:**
   - PayTR Pazaryeri Split. `MARKETPLACE_SPLIT_LIVE` tek bayrak.
   - Kurumsal B2B ancak bundan sonra.

---

# BÖLÜM 5 — İCRACI MİMAR VE TEKNİK LİDER KILAVUZU

Bir geliştirme veya mimari karar alınırken sorulacak temel soru şudur:
> **"Bu karar platformun güvenliğini korurken, kullanıcı kazanımını ve gelir üretimini hızlandırıyor mu?"**

* Cevap evet ise: En yalın, test edilebilir ve güvenli şekilde hayata geçirilir.
* Cevap gereksiz bürokrasi, kural polisliği veya aşırı mühendislik ise: Ayıklanır ve sadeleştirilir.

Güvenlik, yasal uyum ve finansal doğruluk tavizsiz korunur; ancak büyümenin, kullanıcı deneyiminin ve yazılım geliştirme hızının önüne gereksiz dogmalar konulamaz.
