Sıfırdan kurguladığımız, yapay zeka fırınlarını doğru rollerle hizalayan **Bütünleşik Eğitim Üretim Mimarısı Raporu**:

---

### 1. Temel Felsefe ve Eğitim Mantığı

* **İnsani ve Sıcak Yaklaşım:** Eğitime robotik bir komut listesiyle değil, insani bir açılışla (giriş ısınması, eğitmen tanıtımı, kahve/mesai sohbeti) başlanır; ders yine insani bir veda ve tebrikle biter.
* **4-Beat Reji Yapısı:**
1. *Warm-up (Isınma & Giriş)*
2. *Command (Somut Excel Adımı / A1 Hücresi)*
3. *Comparison (Önce / Sonra Sindirme)*
4. *Task (Sıra Sende Görevi & Veda)*


* **Visual-Audio Senkronizasyonu:** Kulakta ne duyuluyorsa (örneğin A1 hücresi), göz ekranda %80 oranında birebir o somut Excel hamlesini ve hücreyi görür.
* **Bilişsel Yük Yönetimi:** Ekranda uzun metin blokları gösterilmez; sadece max 3 kelimelik dinamik **Punchcard rozetleri** parlar.

---

### 2. Modüler Yapay Zekâ Görev Dağılımı (Fabrika Düzeni)

Cursor'ın kendi iç dil modeliyle metin veya görsel uydurması tamamen engellenmiş; her iş uzman Google AI Studio API servisine devredilmiştir:

| Üretim Katmanı | Görevli Servis | Sorumluluk / İşlevi |
| --- | --- | --- |
| **Senaryo & Metin** | **Gemini 3.8 Flash** | 4-beat reji kuralına ve insani tona uygun ders senaryosunu noktası virgülüne kaleme alır. |
| **Seslendirme (TTS)** | **Gemini 3.1 Flash TTS** | Yazılan senaryoyu Gözde (Callirrhoe) karakter sesiyle seslendirir ve mühürler. |
| **Görsel & Video** | **Nano Banana / Veo 3.1** | Dersin cue noktalarına özel gerçekçi arayüz ve sinematik görsel katmanları üretir. |
| **Ducking Müzik** | **Lyria 3.5** | Konuşmanın arkasına ritmik, ses başlayınca kısılan dip müziği basar. |
| **Orkestra / Montaj** | **Cursor (IDE / Agent)** | Metin/görsel uydurmaz; sadece API çıktısını `docs/curriculum/` ve `public/media/` altına dizer, Next.js oynatıcıda senkronize eder. |

---

### 3. Oynatıcı (Citizen Player) Deneyimi

* **Arka Plan:** Sentetik SVG slaytlar yerine DOM/CSS ile çizilmiş veya API'den çekilmiş gerçek Excel çalışma alanı.
* **Ses & Ritim:** Gözde'nin sesi ön planda, Lyria 3.5 müziği kısılarak arkada.
* **Ön Katman:** Ekranda sadece ilgili saniyede beliren punchcard rozetleri (`HOŞ GELDİN` $\rightarrow$ `A1 HÜCRESİ` $\rightarrow$ `TEMİZLE ŞİMDİ` $\rightarrow$ `FARK ORTADA` $\rightarrow$ `SIRA SENDE`).





Eğitim yapısındaki taban süre ve bölüm standartları şu şekildedir:

Bölüm Başına Taban Süre: En az 5 dakika (ideal anlatım ve uygulama sindirme süresi: 5–9 dakika).

Modül/SKU Başına Bölüm Sayısı: En az 6 bölüm (tüm müfredatın tam sertifikasyon barajına ulaşması için gereken minimum ders sayısı).