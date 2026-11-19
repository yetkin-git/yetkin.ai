# Adım 4 Raporu — Self-Servis UX & Form Deneyimi

**Tarih:** 19 Kasım 2026  
**Kapsam:** Self-servis dil temizliği (`kurumsal`, `fiyatlandirma`, `public-vitrine` ve bağımlı bileşenler) + hibe/tezgâh formlarında sade placeholder, canlı akıllı tik, boş select varsayılanı, canlı birincil buton ve boş gönderim koruması.  
**Doğrulama:** `npx tsc --noEmit` geçti; ilgili Vitest paketleri geçti (aşağıda).

---

## Yönetici özeti

Çağrı merkezi / «ekibimiz sizi arasın» dili kaldırıldı; müşteriye kendi başına kurulum ve talep bırakma yolu gösterildi. Ana sayfa hibe widget’ı, `/hibe` ve `/tezgah` formlarında örnek senaryo placeholder’ları silindi; sektör/il ön seçimleri boşaltıldı; plaka/NACE kodları arayüz etiketlerinden çıkarıldı. İş fikri alanına canlı yeşil tik + yönlendirme notu eklendi; boş gönderimde tarayıcı native hatası yerine sade Türkçe uyarı basılıyor.

---

## 1. Self-servis dil temizliği

### 1.1 `app/(public)/kurumsal/page.tsx`

| Alan | Eski | Yeni |
|---|---|---|
| Kart CTA | Teklif al | Talebinizi bırakın |
| Form kartı | Teklif al / Kayıt | Kurumsal talep / Self-servis |
| Tip paneli başlığı | Teklifte ne olur | Self-serviste ne olur |
| Madde 1 | Başvurunuz satış ekibine düşer… | Talebinizi bırakın, kurumsal paneliniz tanımlansın… |
| Madde 2 | …ekibimiz aynı gün dönüş yapsın. | Hesabınızı şimdi oluşturun, kurulumunuzu dakikalar içinde kendiniz tamamlayın. |
| Madde 3 | …özel kurulumlar teklifle planlanır. | …özel paketler talep formundan tanımlanır. |

### 1.2 `components/kurumsal/offer-form.tsx`

| Alan | Eski | Yeni |
|---|---|---|
| Not etiketi | Not | Talebiniz |
| Not placeholder | *(yok)* | Talebinizi buraya yazınız... |
| Başarı mesajı | Teklif kaydı alındı. Ekip e-posta adresinden döner. | Talebiniz alındı. Kurumsal paneliniz tanımlanınca e-posta ile bilgilendirilirsiniz. |
| Gönder butonu | Teklif al | Talebinizi bırakın |

### 1.3 `components/kurumsal/roadmap-cards.tsx`

Faz 2 / Faz 3 kartlarındaki «ön talep … teklif kaydına düşer» ve «Teklif formuna geç» ifadeleri self-servis talep diline çekildi.

### 1.4 `lib/pricing/public-vitrine.ts` + `showcase-price.ts` + `fiyatlandirma`

| Alan | Eski | Yeni |
|---|---|---|
| `PUBLIC_PREORDER_LABEL` | Ön Talep / Kurumsal Başvuru | Kurumsal Tanımlama |
| Kurumsal özet | …Tutar ön başvurudan sonra netleşir. | …Talebinizi bırakın, kurumsal paneliniz tanımlansın. |
| Kurumsal maddeler | …— ön başvuru | …— self-servis talep / paneli kendiniz açın |
| Fiyat hero | …ön taleptir; karttan çekilmez. | …talebinizi bırakın; paneli kendiniz tanımlayın. |
| Planned CTA | Ön talep bırak | Talebinizi bırakın |

---

## 2. Form UX — sade placeholder & canlı akıllı tik

### 2.1 Ortak eşik (`lib/yetkinhibe/idea-detail.ts`)

- `idle`: boş / yalnız boşluk  
- `short`: yazılmış ama eşik altı  
- `ready`: boşluklar hariç ≥ 20 karakter **ve** ≥ 3 kelime  

Hazır durumda kutunun sağ üstünde yeşil ✓, altında: `✓ İş fikriniz analiz için hazır.`  
Kısa yazımda: `Daha doğru sonuç için ne yapacağınızı birkaç kelimeyle daha açın.`

### 2.2 `components/hibe/grant-eligibility-widget.tsx` (ana sayfa)

| Konu | Değişiklik |
|---|---|
| Placeholder | `Soğuk zincir…` → `İş fikrinizi buraya yazınız...` (`placeholder:text-slate-400`) |
| Initial state | `idea`, `sectorCode`, `provinceCode` → `""` |
| Select ilk seçenek | `Sektör seçiniz...` / `İl seçiniz...` |
| İl etiketi | `34 İstanbul` → `İstanbul` |
| Buton | Her zaman tıklanabilir, yüksek kontrastlı safir birincil; `disabled` yalnız `pending` |
| Boş gönderim | `noValidate` + form altı: `Lütfen iş fikrinizi yazın, sektör ve il seçin.` |
| HTML `required` / `minLength` | Kaldırıldı (native tarayıcı balonu yok) |

### 2.3 `/hibe` — `project-desk.tsx` + `os-cockpit.tsx`

- İl / NACE varsayılanı seed yoksa `""`; placeholder seçenekler eklendi.  
- İl listesinde yalnız şehir adı.  
- Proje textarea: aynı placeholder + canlı tik.  
- «Taslak dosyayı üret» canlı buton; eksik brifte aynı sade uyarı.

### 2.4 `/tezgah` — `lib/tezgah/catalog.ts` + `workbench.tsx` + `grant-detail-wizard.tsx`

- Grant alan placeholder’ları örnek senaryolardan yönlendirme metnine çekildi.  
- İl seçenek etiketleri yalnız `name`.  
- `project` alanında canlı tik feedback’i.  
- Grant masasında boş gönderimde aynı sade uyarı; buton alan hazır olmasa da tıklanabilir (kota / pending hariç).

---

## 3. Etiket temizliği (kaynak)

`lib/yetkinhibe/grant-brief-axes.ts`:

- NACE `label`: `01 Tarım` → `Tarım` (id `01` aynı kaldı).  
- `grantProvinceLabel`: `34 İstanbul` → `İstanbul`.

Bu değişiklik katalog, widget, hibe kokpiti ve tezgâh select’lerine tek kaynaktan yansır.

---

## 4. Doğrulama

```bash
npx tsc --noEmit                          # geçti
npx vitest run \
  tests/yetkinhibe-core/idea-detail.test.ts \
  tests/tezgah/surface.test.ts \
  tests/ui/home-offer-surface.test.ts \
  tests/yetkinhibe-core/master-plan.test.ts \
  tests/yetkinhibe-core/match-grant-programs-for-brief.test.ts \
  tests/tezgah/grant-engine.test.ts \
  tests/ui/public-home-cta-surface.test.ts \
  tests/copy/seo-surface.test.ts
# → 8 dosya / 75+ test geçti
npm run verify:api-auth -- --check        # rota haritası (bu turda API auth değişmedi)
```

Yeni test: `tests/yetkinhibe-core/idea-detail.test.ts` (idle / short / ready eşikleri).

Mevcut yüzey testlerinde kırılan assert olmadı; katalog field adları ve NACE id’leri değişmedi.

---

## 5. Dokunulan dosyalar

| Dosya | Rol |
|---|---|
| `app/(public)/kurumsal/page.tsx` | Self-servis tip paneli + CTA |
| `app/(public)/fiyatlandirma/page.tsx` | Hero + planned CTA |
| `lib/pricing/public-vitrine.ts` | Kurumsal vitrin maddeleri |
| `lib/pricing/showcase-price.ts` | `PUBLIC_PREORDER_LABEL` |
| `components/kurumsal/offer-form.tsx` | Form metinleri |
| `components/kurumsal/roadmap-cards.tsx` | Faz 2/3 self-servis |
| `lib/yetkinhibe/grant-brief-axes.ts` | Temiz etiketler |
| `lib/yetkinhibe/idea-detail.ts` | **Yeni** eşik yardımcısı |
| `components/hibe/grant-eligibility-widget.tsx` | Ana widget UX |
| `components/hibe/project-desk.tsx` | /hibe proje formu |
| `components/hibe/os-cockpit.tsx` | /hibe analiz select’leri |
| `lib/tezgah/catalog.ts` | Grant placeholder + il etiketi |
| `components/tezgah/workbench.tsx` | Canlı tik + boş uyarı |
| `components/tezgah/grant-detail-wizard.tsx` | Detay placeholder temizliği |
| `tests/yetkinhibe-core/idea-detail.test.ts` | **Yeni** birim test |
| `docs/ADIM4_SELFSERVE_UX_RAPOR.md` | Bu rapor |

---

## 6. Bilinçli sınırlar

- Kurumsal paketler hâlâ katalogda `planned` (PayTR satırı yok); self-servis dil talep formuna yönlendirir, sahte checkout uydurmaz (A5).  
- Analiz GET formunda işletme türü / yatırım odağı gibi alanların işlevsel varsayılanları korundu; kullanıcı talebi sektör ve il ön seçimine odaklandı.  
- E-ticaret kategori «Örn: …» placeholder’ları bu turun kapsamı dışında bırakıldı (hibe/iş fikri aksı).
