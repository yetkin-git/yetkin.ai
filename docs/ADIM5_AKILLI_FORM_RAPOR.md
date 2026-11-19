# Adım 5 Raporu — Akıllı Form Denetçisi (Smart Field Validator & Coach)

**Tarih:** 19 Kasım 2026  
**Kapsam:** Ortak `SmartTextarea`, `/api/ai/form-coach` (Gemini `LITE_STREAM` → `gemini-3.5-flash-lite`), hibrit istemci/API koçluğu ve ana form entegrasyonları.  
**Doğrulama:** `npx tsc --noEmit` geçti; `form-coach` + `tezgah/surface` → 15/15; `verify:api-auth` → 131 route (`/api/ai/form-coach: public`).

---

## Yönetici özeti

Platformdaki çok satırlı kullanıcı girdilerine ortak, yeniden kullanılabilir bir **Akıllı Form Denetçisi** eklendi. Her tuş vuruşunda API çağrılmaz: önce ücretsiz istemci eşiği, sonra blur / 2 sn debounce ile düşük maliyetli `gemini-3.5-flash-lite` koçluğu çalışır. Ana Hibe, Tezgâh, Kurumsal, E-Ticaret ve Kariyer formları bu bileşene taşındı; kafa karıştırıcı `Örn:` placeholder’ları sade yönlendirmelerle değiştirildi.

---

## 1. Mimari

### 1.1 Hibrit akış

| Aşama | Tetikleyici | Maliyet | Davranış |
|---|---|---|---|
| 1 — İstemci eşiği | Yazarken (`onChange`) | 0 API | ≥20 karakter + ≥3 kelime → yeşil ✓; aksi halde yumuşak yönlendirme |
| 2 — AI koç | `onBlur` veya 2 sn debounce | LITE_STREAM | ≥30 karakter, metin değişmişse `/api/ai/form-coach` |

### 1.2 Yeni / güncellenen dosyalar

| Dosya | Rol |
|---|---|
| `components/ui/smart-textarea.tsx` | Ortak UI: eşiği + koç ipucu + debounce |
| `lib/kernel/ai/form-coach-client.ts` | İstemci sabitleri / bağlam tipleri (`server-only` yok) |
| `lib/kernel/ai/form-coach.ts` | Sunucu: Zod şema, sistem promptu, `invokeLlm(LITE_STREAM)` |
| `app/api/ai/form-coach/route.ts` | Public rota; oturum veya `guest:<ip>` |
| `lib/kernel/security/http-rate-limit.ts` | `formCoachIp` / `formCoachUser` + LLM kenar yolu |
| `lib/kernel/security/route-auth-map.ts` | `/api/ai/form-coach` → `public` (verify:api-auth) |
| `tests/kernel/form-coach.test.ts` | Rol, kota, fail-safe, mühür testleri |

### 1.3 Model ve bütçe mühürleri

- Rol: `LITE_STREAM` → `gemini-3.5-flash-lite` (`lib/kernel/ai/model-roles.ts`)
- Girdi tavanı: **500 karakter**
- Çıktı tavanı: **120 token**
- Sistem promptu kısa; sağlayıcı adı sızdırmaz
- Billing: `AI_TOKEN_SOURCES.SUPPORT`, `recordUsage: false`
- Rate limit: IP 30 / 10 dk (`formCoachIp`), kullanıcı/guest 20 / 10 dk (`formCoachUser`)
- Kenar LLM listesine `/api/ai/form-coach` eklendi

---

## 2. Entegre edilen yüzeyler

| Yüzey | Dosya | `context` |
|---|---|---|
| Ana sayfa Hibe Widget | `components/hibe/grant-eligibility-widget.tsx` | `hibe` |
| `/hibe` proje masası | `components/hibe/project-desk.tsx` | `hibe` |
| Hibe detay sihirbazı | `components/tezgah/grant-detail-wizard.tsx` | `hibe` |
| `/tezgah` üretim alanları | `components/tezgah/workbench.tsx` | `hibe` / `ecommerce` / `tezgah` |
| `/kurumsal` talep | `components/kurumsal/offer-form.tsx` | `kurumsal` |
| E-Ticaret kart stüdyosu | `components/commerce/product-card-studio.tsx` | `ecommerce` |
| Ürün oluştur / düzenle | `product-create-form.tsx`, `product-editor.tsx` | `ecommerce` |
| YetkinCV özeti | `components/career/yetkincv-station.tsx` | `career` |
| Kariyer stüdyosu deneyim | `components/career/ai-career-studio.tsx` | `career` |

Admin konsolları, Junior tell, sohbet composer’ları ve fatura adres alanı bu adımın dışında bırakıldı (ürün formu değil / sohbet yüzeyi).

---

## 3. Placeholder sadeleştirmesi

| Konum | Eski | Yeni |
|---|---|---|
| Tezgâh e-ticaret kategori | `Örn: Anne ve bebek (veya boş bırakın…)` | `Kategoriyi yazınız (veya boş bırakın)...` |
| Tezgâh tetkik marka | `Örn: Karaoğlu Fırın…` | `İşletme veya marka adını yazınız...` |
| Tezgâh SaaS özellik | `Örn: Ürün sayfasına desi…` | `İstediğiniz özelliği buraya yazınız...` |
| E-ticaret özellik / teklif alanları | örnek cümleler | `…buraya yazınız...` tarzı yönlendirme |
| Product card kategori | `Örn: Anne ve bebek` | `Kategoriyi yazınız...` |
| YetkinCV / kariyer | uzun örnek | `Metninizi / Deneyiminizi buraya yazınız...` |

Kaynak: `lib/tezgah/catalog.ts` + ilgili bileşenler. `tests/tezgah/surface.test.ts` yeni metinlere kilitlendi.

---

## 4. API sözleşmesi

`POST /api/ai/form-coach` (`auth: public`)

```json
{
  "text": "en az 30, en fazla 500 karakter",
  "context": "hibe | tezgah | kurumsal | ecommerce | career | general"
}
```

Başarı zarfı (`jsonOk`):

```json
{
  "ok": true,
  "data": {
    "tip": "💡 … veya ✓ Harika, tüm kritik detaylar mevcut…",
    "remaining": 19,
    "limit": 20
  }
}
```

Misafir yanıtında ek olarak `guest: true` döner.

---

## 5. Doğrulama

```bash
npm run verify:api-auth
npx tsc --noEmit
npx vitest run tests/kernel/form-coach.test.ts tests/tezgah/surface.test.ts
```

Beklenen: tip temiz; form-coach + tezgâh yüzey testleri yeşil; route haritasında `/api/ai/form-coach: public`.
