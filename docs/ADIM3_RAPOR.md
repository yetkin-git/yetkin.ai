# Adım 3 Raporu — Kariyer, Kurumsal, Hakkımızda/İletişim, Rehber/Sözlük & Navigasyon

**Tarih:** 19 Kasım 2026  
**Kapsam:** `lib/copy/sen-voice/career.ts`, `lib/copy/seo.ts`, `lib/copy/sem-keywords.ts`, `lib/copy/guides.ts`, `lib/copy/glossary.ts`, `lib/copy/sen-voice/public.ts`, `app/(public)/kurumsal/page.tsx`, `app/(public)/hakkimizda/page.tsx`, `app/(public)/iletisim/page.tsx`, `app/(public)/rehber/**`, `app/(public)/sozluk/**`, `components/academy/office-ai-guide-preview.tsx`, `lib/dronlar/kayit.ts`, `lib/kernel/modules.ts` + bağımlı yüzey testleri.  
**Doğrulama:** `npx tsc --noEmit` geçti; ilgili 11 Vitest dosyası → 90/90 test geçti.

---

## Yönetici özeti

Kariyer/YetkinCV satış dili SHA-256 / mühür / Proof-of-Work jargonundan çıkarıldı; somut fayda cümlelerine çekildi. Kurumsal H1 İK faydasına döndü. Hakkımızda ve İletişim hero’ları tarih etiketi yerine insan hikâyesi / güven metni taşıyor. Rehber ve sözlük, kapalı Akademi kurs satışından koparılarak AI Tezgâh hunisine bağlandı. Oturumlu sidebar etiketleri sade ticari dile çekildi; Junior kapısı bozulmadı, `/young` ve kapalı `/academy` standart menüde yok.

---

## 1. Kariyer / YetkinCV & Vize

### 1.1 `lib/copy/sen-voice/career.ts`

| Alan | Eski | Yeni |
|---|---|---|
| `title` / `publicRoom.title` | YetkinCV — Test Edilmiş & Mühürlü Kariyer Merkezi | Yetkinliğini Gerçek Testle Kanıtla, Fark Yarat. |
| `description` | SHA-256 mühürlü, taklit edilemez… | Uygulamalı vaka testini çöz… doğrulama bağı herkese açıktır. |
| `proofEmpty` | mühürlü / SHA-256… | YetkinCV puanın yok… doğrulama bağın burada görünür. |
| `gateway.title` | Proof-of-Work ve İşveren Kapısı | İşveren Kapısı |
| `publicRoom.stepsLead` | kriptografik imza / sicil bütünlük kaydı | Paylaşılabilir bağ ve QR… |
| `publicRoom.steps[2]` | SHA-256 doğrulama kodu… | Doğrulama kodu ve /vize bağı… |
| `scope.benefitResume` | Liyakat Mühürlü Özgeçmiş Bağlantısı | Paylaşılabilir Özgeçmiş Bağlantısı |
| `scope.held` | Sınav mühürlü | Sınav tamam |
| `publicPage.title` | Liyakat mühürlü özgeçmiş kartı | Doğrulanabilir yetkinlik kartı |
| `badge.cvCta` / `cvTitle` | CV'ne Mühür Ekle / mühürlü bağ | CV'ne Doğrulama Bağı Ekle / doğrulama bağını ekle |
| `hashLabel` / `hashNote` | (korundu, doğrulama UI) | Teknik alt bilgi; satış metni değil |

### 1.2 `lib/copy/seo.ts` + `lib/copy/sem-keywords.ts`

| Alan | Eski | Yeni |
|---|---|---|
| `PAGE_SEO.career.title` | YetkinCV — Test Edilmiş & Mühürlü… | YetkinCV — Yetkinliğini Gerçek Testle Kanıtla |
| `PAGE_SEO.career.description` | SHA-256 mühürlü YetkinCV puanı… | doğrulanabilir yetkinlik puanı… |
| `PAGE_SEO.publicTalent.description` | mühürler, yapay zeka sertifikası… | doğrulanabilir yetkinlik puanı… |
| `YETKINCV_FAQ` skor/doğrulama | SHA-256 kodu satış cevabında | SHA-256 satış FAQ’dan çıkarıldı |

`PAGE_SEO.academyVerify` (doğrulama yüzeyi) bilerek dokunulmadı — kriptografik özet burada kalır.

---

## 2. Kurumsal H1

### 2.1 `app/(public)/kurumsal/page.tsx`

| Alan | Eski | Yeni |
|---|---|---|
| `PageHeader` title | Eleme ve işletim merkezi | Doğru Adayı Günler Değil, Dakikalar İçinde Seçin. |

---

## 3. Hakkımızda & İletişim

### 3.1 `app/(public)/hakkimizda/page.tsx`

| Alan | Eski | Yeni |
|---|---|---|
| Hero description | `LEGAL_UPDATED_LABEL` (yalnız yürürlük tarihi) | KOBİ / e-ticaret / profesyonel operasyon yükünü azaltma hikâyesi |
| CTA | yok | **AI Tezgâhını Ücretsiz Dene** → `/tezgah` (hero + alt düğme grubu) |

### 3.2 `app/(public)/iletisim/page.tsx`

| Alan | Eski | Yeni |
|---|---|---|
| Hero description | `LEGAL_UPDATED_LABEL` | 1 iş günü içinde dönüş vaadiyle karşılama metni |
| Destek kartı | genel kanal listesi | Aynı SLA vurgusu eklendi |

### 3.3 `lib/copy/seo.ts`

| Alan | Eski | Yeni |
|---|---|---|
| `PAGE_SEO.about` | AI işletim platformu / Yapınet jargonu | günlük iş yükünü azaltan AI araçları |
| `PAGE_SEO.contact` | KVKK/ödeme kanal listesi | 1 iş günü dönüş + kanallar |
| `PAGE_SEO.sozluk` | mühür/vize/sınav bağlantısı | KOSGEB, tezgâh, YetkinCV, AI Tezgâh örnekleri |

---

## 4. Rehber / Sözlük → aktif ürün hunisi

### 4.1 `lib/copy/guides.ts`

- Yeni sabitler: `GUIDE_TEZGAH_CTA_LABEL`, `GUIDE_TEZGAH_CTA_HREF` (`/tezgah`)
- Tüm rehberlerde Akademi sınavı / kurs satışı adımları ve FAQ cevapları Tezgâh pratiğine çekildi
- Excel rehberi: «İlk ofis dersi ücretsizdir» / «Ofis sınavını geç» kaldırıldı

### 4.2 Sayfa CTA’ları

| Dosya | Değişiklik |
|---|---|
| `app/(public)/rehber/[slug]/page.tsx` | İkinci düğme → Tezgâh CTA (success) |
| `app/(public)/sozluk/[terim]/page.tsx` | İkinci düğme → Tezgâh CTA (success) |
| `app/(public)/sozluk/page.tsx` | «ilgili sınav» → «AI Tezgâh örneği» |
| `lib/copy/seo.ts` `GUIDE_FAQ` | Kayıt/kurs/sertifika satışından Tezgâh denemesine |
| `lib/copy/sen-voice/public.ts` `guide` | CTA: AI Tezgâhını Ücretsiz Dene; adımlar Tezgâh odaklı |
| `components/academy/office-ai-guide-preview.tsx` | Satın alma / `/academy/dogrula` CTA → Tezgâh CTA |

### 4.3 `lib/copy/glossary.ts`

Akademi sınavı satan örnek cümleler YetkinCV / Tezgâh diline çekildi (`vize-muhru`, `liyakat`, `baraj`, çırak notu).

---

## 5. Navigasyon & hayalet link

### 5.1 `lib/dronlar/kayit.ts`

| Oda | Eski label / blurb | Yeni |
|---|---|---|
| dashboard | Genel Bakış / Komuta merkezi | **Ana Panel** / Özet ve ilerleme |
| career | Kariyer / YetkinCV & Kariyer Merkezi | **YetkinCV** / Test ve doğrulanabilir puan |
| yetkinhibe | YetkinHibe / Hibe analiz ve proje işletim sistemi | **Hibe Bulucu** / Uygun destek ve proje dosyası |
| tezgah | AI Tezgâh (korundu) | — |

- `/academy`: `kapali: true`, sidebar `ordered` listesinde yok  
- `/young`: `kapali: true`, sidebar’da yok  
- `/junior`: yalnız `showJunior` true iken görünür (yetkili hesap kapısı bozulmadı)

### 5.2 `lib/kernel/modules.ts`

| Alan | Eski | Yeni |
|---|---|---|
| `COMMERCE_NAV.blurb` | Stok, kanal ve sipariş kokpiti | Stok, kanal ve sipariş |

Breadcrumb kök etiketi (`BREADCRUMB_HOME_LABEL = "Genel Bakış"`) bilinçli bırakıldı; sidebar ile ayrı SSOT.

---

## 6. Güncellenen testler

- `tests/copy/sen-axis-surface.test.ts`
- `tests/copy/seo-surface.test.ts` — kariyer satışında SHA-256 yok; `hashLabel` doğrulama UI’da kalır
- `tests/career/action-plan.test.ts`, `proof-portfolio-surface.test.ts`
- `tests/dashboard/citizen-surface.test.ts`, `cockpit-surface.test.ts`
- `tests/commerce/cockpit-surface.test.ts`
- `tests/kernel/constitution-surfaces.test.ts`, `edge-guard.test.ts`
- `tests/ui/breadcrumb-surface.test.ts` — `/career` → YetkinCV
- `tests/e2e/faz1-nav.spec.ts` — yeni H1

---

## 7. Bilinçli olarak dokunulmayanlar

| Alan | Neden |
|---|---|
| `PAGE_SEO.academyVerify` + Akademi verify SEN | Doğrulama yüzeyi; SHA-256 teknik detay burada kalır |
| `LEGAL_ABOUT_*` / yasal gövde | Hukuki kimlik metni; hero ayrı pazarlama katmanı |
| Junior oda kapısı / `showJunior` | Yetkili 2 hesap erişimi korunur |
| Dashboard `pulse.academy*` | Girişli nabız hâlâ Akademi tahsilatına bağlı (Adım 2 notu) |

---

## 8. Doğrulama komutları

```bash
npx tsc --noEmit
npx vitest run tests/copy/sen-axis-surface.test.ts tests/career/action-plan.test.ts tests/career/proof-portfolio-surface.test.ts tests/dashboard/citizen-surface.test.ts tests/dashboard/cockpit-surface.test.ts tests/commerce/cockpit-surface.test.ts tests/kernel/constitution-surfaces.test.ts tests/kernel/edge-guard.test.ts tests/ui/breadcrumb-surface.test.ts tests/career/talent-directory.test.ts tests/copy/seo-surface.test.ts
```

**Sonuç:** tip kontrolü temiz; 90/90 ilgili birim testi geçti.
