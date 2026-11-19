# Adım 2 Raporu — Fiyatlandırma, Kurumsal, Dashboard & SEO Ticari Tutarlılık

**Tarih:** 19 Kasım 2026  
**Kapsam:** `app/(public)/fiyatlandirma/page.tsx`, `app/(public)/kurumsal/page.tsx`, `lib/pricing/public-vitrine.ts`, `lib/copy/sen-voice/dashboard.ts`, `lib/copy/sem-keywords.ts`, `app/layout.tsx` (keywords tüketimi) + bağımlı yüzey testleri.  
**Doğrulama:** `npx tsc --noEmit` geçti; `citizen-surface` + `seo-surface` → 38/38 test geçti.

---

## Yönetici özeti

Kanıtsız «En Çok Tercih Edilen» rozetleri dürüst etiketlerle değiştirildi. Müşteriye sızan SKU/kod ve soğuk ödeme jargonu B2B insan diline çekildi. YetkinCV fiyat CTA’sı `/career`’e alındı. Dashboard kamu panelindeki hayalet «Akademi → /tezgah» kartı YetkinHibe ile değişti. Kök SEM anahtar kelimeleri kapalı Akademi niyetinden aktif ürün niyetine kaydırıldı.

---

## 1. Sosyal kanıt rozetleri

### 1.1 `app/(public)/fiyatlandirma/page.tsx`

| Alan | Eski | Yeni |
|---|---|---|
| E-Ticaret İşletme Lisansı rozeti | En Çok Tercih Edilen | KOBİ'ler İçin Önerilen |
| E-Ticaret CTA | E-Ticaret Kokpitini Aç & Lisansla → | E-Ticaret Paketini Aç → |
| YetkinCV CTA | YetkinCV testine git | YetkinCV'yi İncele |

### 1.2 `app/(public)/kurumsal/page.tsx`

| Alan | Eski | Yeni |
|---|---|---|
| Ajans paketi rozeti | En Çok Tercih Edilen | Kurumsal Ekipler İçin |

---

## 2. Jargon / SKU temizliği

### 2.1 Kurumsal paket maddeleri

| Kart | Eski | Yeni |
|---|---|---|
| Ajans | Katalog birimi commerce:agency. | Ajans ekibi için ortak işletim paneli. |
| Ajans | Pazaryeri split kapalıdır; ciro platformda bölünmez. | Ciro platformda bölünmez; tahsilat size özel teklifle yürür. |
| Ekip rozeti | Şirket çalışanları için toplu eğitim. | Şirket çalışanları için toplu yetkinlik ölçümü. |
| Ekip rozeti | Katalog birimi academy:team-seat. | Ekip koltukları teklifle açılır. |

### 2.2 Teklif paneli (`TipPanel`)

| Eski | Yeni |
|---|---|
| Kayıt satış ekibine gider. Tahsilat bu formda başlamaz. | Başvurunuz satış ekibine düşer; bu formda kart çekilmez. |
| PayTR kasası bu paketlerde bağlı değildir. Kayıt ön taleptir; karttan çekilmez. | Şirketinize özel kurulum ve teklif için ön başvurunuzu bırakın, ekibimiz aynı gün dönüş yapsın. |
| ISO denetçisi ve Şirket Beyni ön taleptir. İlan elemesi bu sayfadaki kokpittedir. | İlan açma ve aday eleme bu sayfadaki panelden yürür; özel kurulumlar teklifle planlanır. |

### 2.3 `lib/pricing/public-vitrine.ts`

| Alan | Eski | Yeni |
|---|---|---|
| YetkinCV `href` | `/kurumsal` | `/career` |
| YetkinCV özet | SHA-256 / PayTR kasası jargonu | Uygulamalı vaka testi ile paylaşılabilir puan… |
| YetkinCV maddeler | SHA-256, /vize bağı | Doğrulanabilir puan kodu, herkese açık doğrulama bağlantısı |
| E-Ticaret özet | …yönetim kokpiti | …yönetim paneli |
| Kurumsal özet | PayTR kasası yoktur… | …şirketinize özel teklif. Tutar ön başvurudan sonra netleşir. |
| Kurumsal maddeler | `academy/team-seat:…`, `commerce/agency:…`, `kurumsal/job-screening-pack:…` | Ekip rozeti / Ajans lisansı / İlan ve aday eleme — ön başvuru |

Fiyat vitrini zaten dört aktif ürün + ücretsiz başlangıç + kurumsal ön başvuruya odaklıydı; kapalı Akademi kurs kartı eklenmedi / geri getirilmedi.

---

## 3. Dashboard hayalet kartı

### 3.1 `lib/copy/sen-voice/dashboard.ts` — `publicPanel`

| Alan | Eski | Yeni |
|---|---|---|
| `lead` | eğitim, sınav ve Doğrulanmış Freelancer Rozeti… | YetkinHibe, YetkinCV ve Doğrulanmış Freelancer Rozeti… |
| Feature[0] | Akademi → `/tezgah` («Tezgâhı aç») | YetkinHibe → `/hibe` («Hibeyi aç») |
| Feature[1] | Kariyer Kartı | YetkinCV («YetkinCV'yi İncele») |
| Feature[2] | Sertifika doğrulama (64 karakterlik özet…) | Sertifika doğrulama (sadeleştirildi) |
| Özet[0–1] | Eğitim Akademi kataloğundadır / Sınav barajı 70… | Hibe dosyası YetkinHibe’de… / YetkinCV puanı vaka testinden… |

Girişli `pulse.academy*` ve cüzdan Akademi tahsilatı metinleri bu adımda bilinçli olarak dokunulmadı (kapalı oda / tahsilat defteri hâlâ o anahtarları okuyor).

---

## 4. Global SEO keywords

### 4.1 `lib/copy/sem-keywords.ts`

**`SEM_LANDING_KEYWORDS` (kök `app/layout.tsx` keywords):**

| Eski (özet) | Yeni |
|---|---|
| yapay zeka eğitimi, yapay zeka sertifikası, kariyer vizesi, prompt eğitimi, online kurs + Excel/Office AI kuyruğu | yapay zeka iş araçları, kobi yapay zeka, e-ticaret yönetim paneli, kosgeb hibe bulucu, yapay zeka belge oluşturucu, aday değerlendirme testi |

**Ayrılan SSOT:** Kapalı Akademi `01_office_ai` niyetleri `OFFICE_AI_SEM_KEYWORDS` olarak ayrı export edildi; kurs FAQ/antre Ads kalite puanı kırılmasın diye kök layout’a basılmıyor.

---

## 5. Güncellenen testler

- `tests/copy/seo-surface.test.ts` — kök SEM listesi + `OFFICE_AI_SEM_KEYWORDS` ayrımı
- `tests/dashboard/citizen-surface.test.ts` — kamu panelinde Akademi/`/tezgah` yok; YetkinHibe + YetkinCV

---

## 6. Bilinçli olarak dokunulmayanlar

| Alan | Neden |
|---|---|
| `PAGE_SEO.academy` / `ACADEMY_LANDING_FAQ` | Kapalı Akademi yüzeyi kendi meta/FAQ’ını taşır |
| `OFFICE_AI_COURSE_FAQ` / kurs antre SEO | Kurs Ads SSOT; `OFFICE_AI_SEM_KEYWORDS` ile ayrıldı |
| Dashboard `pulse.academy*` / wallet Akademi cümleleri | Girişli nabız ve cüzdan defteri hâlâ Akademi tahsilatına bağlı |
| Fiyat sayfası H1 / dürüstlük notu | Bu turda CTA + rozet + vitrin yönü öncelikliydi |

---

## 7. Doğrulama komutları

```bash
npx tsc --noEmit
npx vitest run tests/dashboard/citizen-surface.test.ts tests/copy/seo-surface.test.ts
```

**Sonuç:** tip kontrolü temiz; 38/38 ilgili birim testi geçti.
