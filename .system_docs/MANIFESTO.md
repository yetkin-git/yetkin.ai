# MANİFESTO — yetkin.ai

**Ürün, Gelir ve Güven Odaklı Mühendislik Manifestosu**

| Alan | Değer |
|------|--------|
| Tarih | 17 Ağustos 2026 |
| Statü | Vizyon ve Strateji Belgesi. Anayasa'nın ruhunu, iş modelini ve büyüme hedeflerini açıklar. |
| Son Reform | **20 Eylül 2026 (TEDAVİ-01):** Kural 1 dört alt maddeye bölündü. Faz 1 kilidi Anayasa B2’ye bağlandı (DRY). |
| Yer | `/.system_docs/MANIFESTO.md` |
| Çelişki | Bir cümle Anayasa ile çatışırsa `.system_docs/ANAYASA.md` bağlayıcıdır. |
| Durum | Yaşayan kesit `docs/ops/DURUM.md` içindedir; `docs/DURUM.md` uyumluluk aynasıdır. |

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

Platformdaki her sertifika, sunucu tarafında değerlendirilen ve SHA-256 ile kriptografik olarak mühürlenen bir iş kanıtıdır.

## 1.3 Hedef Kitlemiz

**Birincil kitle: B2C Öğrenen / Kart Sahibi.** Kartla dijital eğitim, sınav ve sertifika satın alan yetişkin.

1. **Yetkinliğini Kanıtlamak İsteyen Öğrenenler (birincil):** Alaylı yazılımcılar, kariyer değiştirenler, uzaktan çalışan profesyoneller.
2. **Riski Sıfırlamak İsteyen İşverenler (Faz 2 alıcısı):** Kalitesiz teslimat riskini almak istemeyen KOBİ’ler. Havuz ve lisanslı Split olmadan bu kitleye satış veya nakit iddiası basılmaz.

## 1.4 Marka ve Tasarım Duruşu

* **Yalın ve Sakin Arayüz (Quiet Luxury):** Güven bağırmaz. Bu bir dogma değil, güven inşa eden bir ürün tercihidir.
* **Doğrudan İletişim (SEN Aksı):** Varsayılan B2C sesimiz SEN’dir. Dron başına locale edilebilir; B2B yüzeyinde resmî hitap seçilebilir.

---

# BÖLÜM 2 — DEĞİŞMEZ TEMEL İLKELER

## Kural 1 — Odaklanılan deneyim

Faz 1 kamu vitrini kilidi **Anayasa B2**’dedir; Manifesto o kilidi ikinci kez yazmaz.

### Kilit
**Faz 1 çalışan vitrin 3 odadır** (Panel, Akademi, Kariyer); **4. oda (Freelancer) kilitli motordur.** Omurga hedefinin parçasıdır, eşit canlılık iddiası yoktur. **Faz 1’de yeni oda açılmaz** (CEO + Super Admin çift imza olmadan).

### Kayıt kuralı
**Oda tavanı esnektir** cümlesi Faz 2 checklist’idir, Faz 1 kilidini gevşetmez: yeni oda/dron = kayıt + sözleşme + bayrak. Kamu kanıt URL’si (`/vize`) yeni oda açmaz.

### Dron durumu
Dron native istemcidir. T3 Akademi halkası (oynatıcı, sınav, mühür, kasa) bağlıdır; Tezgâh / Freelancer yüzeyi izole durur (`publishFrozenUntilFaz1Close: false`, `tezgahStoreIsolated: true`). Bağlıdır ama web-parite değildir: sınav, mühür ve kasa tamdır, Excel/Gmail simülasyonu web’dedir. Shared Kernel `@yetkin/kernel` **mevcut ince sözleşmedir** (para, katalog kimliği, v1 hop, JSON zarf); Prisma/Supabase taşımaz. Dronlar bu paketi ve `/api/v1` hop’unu tüketir.

### Kesit kuralı
Haftalık kesit `docs/ops/DURUM.md` içindedir.

## Kural 2 — Vize Kapısı

Nitelikli ilana teklif, ilgili belgelenmiş yetkinliğe (Kariyer vizesi) bağlıdır. Bu, alıcıyı kalitesiz teklif yağmurundan korur. Kapı ayrıntısı ve teknik şartname `docs/specs/freelancer-vize-kapisi.md` içindedir. Bu kural vizyon sicilidir; kilitli yüzeyde canlı kapı diye okunmaz.

## Kural 3 — Tek Defter ve S43

Platform lisanssız olarak üçüncü şahısların parasını kendi havuzunda tutamaz veya banka çekim rotası sunamaz. Akademi tahsilatı lisanslı üye işyeri kanalıdır. Freelancer bedelleri yalnız lisanslı Split bağlıysa emanette durur ve ustanın IBAN’ına kuruluş tarafından akar.

## Kural 4 — Dürüst Yüzey

Sahte bakiye, uydurma onay veya hayali veri gösterilemez. Entegrasyon hazır değilse durum dürüstçe açıklanır.

---

# BÖLÜM 3 — GELİR MOTORLARI

```
       [ GELİR MOTORLARI ]
              │
  ┌───────────┼───────────┐
  ▼           ▼           ▼
MOTOR 1     MOTOR 2     MOTOR 3
Akademi     Kurumsal    Pazaryeri
Satışları   Yetkinlik   İşlemleri
(B2C)       (B2B keşif) (Komisyon)
```

### Motor 1: B2C Akademi (Gün 0 kahramanı)
Piyasada talep gören yapay zeka ve dijital beceri eğitimlerinin doğrudan satışı. Lisanslı sanal POS ile tahsilat.

### Motor 2: B2B Kurumsal Yetkinlik (keşif)
Şirketlerin adaylarını test etmesi için kurumsal sınav ve mühür paketleri. **Keşif fazı:** müşteri profili ve bir pilot aranır. Arşivdeki kurumsal oda kamu vitrini değildir; manifesto bu motoru gelir haritasında keşif olarak tutar.

### Motor 3: Freelancer aracılık (Split sonrası)
Güvenli teslimat üzerinden platform komisyonu. Kamu yüzeyi kilitliyken nakit vaadi basılmaz. Motor ve şema silinmez.

---

# BÖLÜM 4 — YOL HARİTASI İLKESİ

1. **Mimari:** Modüler monolit + mevcut `@yetkin/kernel` ince paketi + API-First dron sözleşmesi. Canlı oynatıcı compact makaledir; mühürlü derste karaoke overlay açılır. İzlemede canlı TTS yoktur.
2. **Gelir şimdi:** Merchant iFrame ile cüzdan yükleme + Akademi DEBIT. Kanıt dışarı `/vize` ile çıkar.
3. **Ölçek sonra:** Split sözleşmesi, freelancer hop geri yazımı, dron kapalı testi. Kurumsal B2B ancak keşif + pilot sonrası.

Operasyonel hop sayısı, SKU listesi ve env bayrakları bu belgede durmaz; `docs/ops/DURUM.md` haftalık gerçektir.

---

# BÖLÜM 5 — İCRACI KILAVUZ

> **"Bu karar platformun güvenliğini korurken, kullanıcı kazanımını ve gelir üretimini hızlandırıyor mu?"**

Cevap evet ise en yalın, test edilebilir ve güvenli şekilde hayata geçirilir. Cevap gereksiz bürokrasi ise ayıklanır. Güvenlik, yasal uyum ve finansal doğruluk tavizsiz korunur.
