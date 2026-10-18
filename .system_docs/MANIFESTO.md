# MANİFESTO — yetkin.ai

**Ürün, Gelir ve Güven Odaklı Mühendislik Manifestosu**

| Alan | Değer |
|------|--------|
| Tarih | 17 Ekim 2026 |
| Statü | Vizyon ve Strateji Belgesi. Anayasa'nın ruhunu, iş modelini ve büyüme hedeflerini açıklar. Mimari paragraf Anayasa B1’dedir; bu belge pazar, vizyon ve gelir modelinde kalır. |
| Yer | `/.system_docs/MANIFESTO.md` |
| Çelişki | Bir cümle Anayasa ile çatışırsa `.system_docs/ANAYASA.md` bağlayıcıdır. |
| Durum | Yaşayan kesit `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts` içindedir. |

---

# BÖLÜM 1 — BİZ KİMİZ, NE YAPIYORUZ?

## 1.1 Tek Cümle

**Kullanıcıya:**
> Öğrendiğini mühürle. Mührün kapıyı açsın. İşin güvende olsun.

**Mühendise ve Yatırımcıya:**
> yetkin.ai; öğrenme, doğrulanabilir yetkinlik (verifiable credentials) ve güvenli iş teslimini tek deftere bağlayan modern bir dijital yetenek ve iş platformudur.

**Gün 0 vitrin cümlesi:**
> Yetkinliğini kanıtlayan yapay zekâ eğitimleri. Sınavı geç; mühür kamu vize kartında dursun. Kariyer belgesi dipnot değil kanıt URL’sidir. Freelancer emaneti ayrı fazdır; nakit Akademi’dedir.

## 1.2 Pazar Fırsatı

Yapay zeka araçlarının yaygınlaşmasıyla **"ben bu işi biliyorum" demenin maliyeti sıfıra indi.** Nitelikli uzman görünmez oldu; işveren güvenini kaybetti.

yetkin.ai bu kırılma noktasında değer üretir:
> **İddianın bedava olduğu bir dünyada, kanıtlanmış yetkinlik en değerli varlıktır.**

Platformdaki her sertifika, sunucu tarafında SHA-256 içerik özetiyle sicile bağlanan bir belgedir. Mühür, kursun izlendiğini ve teori-senaryo testinin geçildiğini kanıtlar; sunucu üzerinde canlı dosya doğrulaması kapsamaz.

## 1.3 Hedef Kitlemiz

**Birincil kitle: B2C Öğrenen / Kart Sahibi.** Kartla dijital eğitim, sınav ve sertifika satın alan yetişkin. Amiral SKU’da bu kitle önce ofiste çalışanıdır.

1. **Ofis işçisi (birincil):** Beyaz yaka ofis çalışanı, muhasebe ve finans, KOBİ ve kamu personeli. Kod yazmaz; Excel, e-posta, Word ve slaytla işini yetiştirir.
2. **Yetkinliğini kanıtlamak isteyen öğrenenler (birincil halka, ofis dışı):** Kariyer değiştirenler, uzaktan çalışan profesyoneller.
3. **Yazılımcı / geliştirici (ikincil katman):** Alaylı yazılımcılar ve teknik üreticiler; amiral ofis SKU’sunun ilk alıcısı değildir. Prompt ve ajan müfredatı bu kitleye ayrı pakette gider.
4. **Riski sıfırlamak isteyen işverenler (Faz 2 alıcısı):** Kalitesiz teslimat riskini almak istemeyen KOBİ’ler. Havuz ve lisanslı Split olmadan bu kitleye satış veya nakit iddiası basılmaz.
5. **Veli (Junior B2C):** Çocuğunun 6. sınıf pilot dersini yıllık paketle açan veli. Hesap veliye aittir. Çocuk profili veli rızasıyla açılır. Bu kitle Akademi kart sahibinin yerine geçmez. Kapı Anayasa B6 ve `lib/kernel/security/junior-gate.ts` içindedir.

## 1.4 Marka ve Tasarım Duruşu

* **Yalın ve Sakin Arayüz (Quiet Luxury):** Güven bağırmaz. Bu bir dogma değil, güven inşa eden bir ürün tercihidir.
* **Doğrudan İletişim (SEN Aksı):** Varsayılan B2C sesimiz SEN’dir. Dron başına locale edilebilir; B2B yüzeyinde resmî hitap seçilebilir.
* **Stüdyo sözü vatandaş yüzeyine çıkmaz.** `punchcard`, `bake` ve `kaset` üretim kılavuzunda kalır. Vatandaş sesli dersi, sahnedeki kısa rozeti ve hazırlanan kaydı görür.

---

# BÖLÜM 2 — DEĞİŞMEZ TEMEL İLKELER

## Kural 1 — Odaklanılan deneyim

Faz 1 kamu vitrini kilidi **Anayasa B2**’dedir; Manifesto o kilidi ikinci kez yazmaz.

### Kilit
**Faz 1 çalışan vitrin 3 odadır** (Panel, Akademi, Kariyer); **4. oda (Freelancer) kilitli motordur.** Yetkin Junior bu üç vitrinin dördüncü odası değildir; müstakil odadır ve kapısı Anayasa B6’dadır. Young kayıt defterinde kapalıdır. Yeni oda, B2 checklist’i ve CEO + Super Admin çifti olmadan açılmaz.

### Kayıt kuralı
**Oda tavanı esnektir** cümlesi Faz 2 checklist’idir, Faz 1 kilidini gevşetmez: yeni oda/dron = kayıt + sözleşme + bayrak. Kamu kanıt URL’si (`/vize`) yeni oda açmaz.

### Dron durumu
Mimari ad Anayasa B1’dedir. Bu belge o paragrafı ikinci kez yazmaz. Model ve rol kimliği bu belgede durmaz; çalışma zamanı tek evi `lib/kernel/ai/model-roles.ts` dosyasıdır.

### Kesit kuralı
Haftalık kesit `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts` içindedir.

## Kural 2 — Vize Kapısı

Nitelikli ilana teklif, ilgili belgelenmiş yetkinliğe (Kariyer vizesi) bağlıdır. Bu, alıcıyı kalitesiz teklif yağmurundan korur. Kapının tek evi koddur: `lib/career/visa-gate.ts` ve `lib/freelancer/job-visa-lock.ts`. Bu kural vizyon sicilidir; kilitli yüzeyde canlı kapı diye okunmaz.

## Kural 3 — Tek Defter ve S43

Platform lisanssız olarak üçüncü şahısların parasını kendi havuzunda tutamaz veya banka çekim rotası sunamaz. Akademi tahsilatı lisanslı üye işyeri kanalıdır. Freelancer bedelleri yalnız lisanslı Split bağlıysa emanette durur ve ustanın IBAN’ına kuruluş tarafından akar.

## Kural 4 — Dürüst Yüzey

Sahte bakiye, uydurma onay veya hayali veri gösterilemez. Entegrasyon hazır değilse durum dürüstçe açıklanır.

---

# BÖLÜM 3 — GELİR MOTORLARI

```
       [ GELİR MOTORLARI ]
              │
  ┌───────────┼───────────┬───────────┐
  ▼           ▼           ▼           ▼
MOTOR 1     MOTOR 2     MOTOR 3     MOTOR 4
Akademi     Kurumsal    Pazaryeri   Junior
Satışları   Yetkinlik   İşlemleri   Veli paketi
(B2C)       (B2B keşif) (Komisyon)  (B2C veli)
```

### Motor 1: B2C Akademi (Gün 0 kahramanı)
Piyasada talep gören yapay zeka ve dijital beceri eğitimlerinin doğrudan satışı. Lisanslı sanal POS ile tahsilat.

### Motor 2: B2B Kurumsal Yetkinlik (keşif)
Şirketlerin adaylarını test etmesi için kurumsal sınav ve mühür paketleri. **Keşif fazı:** müşteri profili ve bir pilot aranır. Arşivdeki kurumsal oda kamu vitrini değildir; manifesto bu motoru gelir haritasında keşif olarak tutar.

### Motor 3: Freelancer aracılık (Split sonrası)
Güvenli teslimat üzerinden platform komisyonu. Kamu yüzeyi kilitliyken nakit vaadi basılmaz. Motor ve şema silinmez.

### Motor 4: Junior B2C veli paketi
Velinin, çocuğu için aldığı yıllık okul paketi. Alıcı velidir; dersi çocuk kullanır. Tahsilat Akademi ile aynı lisanslı üye işyeri kanalındadır; ayrı cüzdan ve sahte bakiye yoktur. Kasa `isJuniorCheckoutLocked` ile kapalıyken satış vaadi basılmaz. Fiyatın tek satırı katalogdadır (`cat_junior_yearly`). Seçmeli kart mühürlenmeden paket vaadine girmez. Ayrıntı Anayasa B6 ve Pedagoji Ek-J’dedir. Bu madde o kapıyı ikinci kez yazmaz.

---

# BÖLÜM 4 — YOL HARİTASI İLKESİ

1. **Mimari:** Anayasa B1. Bu belge mimariyi ikinci kez yazmaz. Yayın hedefi ve satış yüzeyi Anayasa B4’tedir. `punchcard`, `bake` ve `kaset` vatandaş cümlesine girmez. TTS bütçe tavanı vardır. Kurs tavanı `ACADEMY_MATCH_WHISTLE_MAX`, ders istek bandı `ACADEMY_TTS_LESSON_REQUEST_MIN` ve `ACADEMY_TTS_LESSON_REQUEST_MAX` adlarıyla durur. Süre için üst dakika dayatması yoktur. Sayıların evi `lib/academy/production-standard.ts` ve `lib/academy/tts-breath-chunks.ts` içindedir. Kilidi `tests/academy/production-standard.test.ts` dir. Model kimliği `lib/kernel/ai/model-roles.ts` içindedir. Bu madde o sayıları tekrarlamaz.
2. **Gelir şimdi:** Merchant iFrame ile cüzdan yükleme + Akademi DEBIT. Kanıt dışarı `/vize` ile çıkar.
3. **Ölçek sonra:** Split sözleşmesi, freelancer hop geri yazımı, dron kapalı testi. Kurumsal B2B ancak keşif + pilot sonrası.

Operasyonel hop sayısı, SKU listesi ve env bayrakları bu belgede durmaz; haftalık gerçek `lib/academy/pilot-sku.ts` ve `lib/academy/curricula/lesson-index.ts` içindedir.

---

# BÖLÜM 5 — İCRACI KILAVUZ

> **"Bu karar platformun güvenliğini korurken, kullanıcı kazanımını ve gelir üretimini hızlandırıyor mu?"**

Cevap evet ise en yalın, test edilebilir ve güvenli şekilde hayata geçirilir. Cevap gereksiz bürokrasi ise ayıklanır. Güvenlik, yasal uyum ve finansal doğruluk tavizsiz korunur.

---

# Ek-J: Junior Pedagojisi ve Veli Modeli

Junior, Akademi’nin iç kanalı değildir. Kendi odasıdır. Kapı ve erişim Anayasa B6 ve `lib/kernel/security/junior-gate.ts` (`canEnterJunior`) içindedir. Bu ek o kapıyı yazmaz.

Alıcı velidir. Kullanan öğrencidir. Hesap veliye aittir. Çocuk profili veli rızasıyla açılır. Değerlendirme üslubu yaş grubuna göre değişir. Öğretme ayrıntısı Pedagoji Ek-J’dedir.

**Dinle ve Anlat:** Çocuk dersi dinler, sonra kendi sözüyle anlatır. Anlatış seslidir. Mikrofon yoksa yazarak anlatır. Bu anlatış öğretir. Mühür ve iş vizesi üretmez. Web oynatıcısının tek kapısı Pedagoji Ek-J «Oynatıcı» maddesindedir. Bu ek o motoru ikinci kez yazmaz.

**Çocuk güvenliği:** Sahte bakiye, harçlık ve kredi yoktur. Oyun puanı para değildir. Çocuğun sesi saklanmaz. Çocuk başkasıyla yazışamaz. Reklam ve paralı ödül yoktur. Ayrıntı Pedagoji Ek-J’dedir.
