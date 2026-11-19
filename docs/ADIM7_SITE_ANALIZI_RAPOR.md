# Adım 7 Raporu — Web Site Analizi (Hydrogen + Yönetici Karnesi)

**Tarih:** 20 Kasım 2026  
**Kapsam:** Marka dili (`Tetkik` → `Web Site Analizi`), form sadeleştirme, Gemini 4 Hydrogen yapılandırılmış JSON karnesi, görsel yönetici dashboard UI.  
**URL / API:** `/tetkik` ve `/api/tezgah/tetkik/*` geriye dönük uyumluluk için korundu.

---

## Yönetici özeti

Web Sitesi Tetkik yüzeyi ürün dilinde **Web Site Analizi** oldu. Form yalnız site adresi ister; marka `<title>` veya alan adından otomatik tespit edilir. Anlatım katmanı **gemini-4-hydrogen** ile yapılandırılmış JSON üretir; skor hâlâ kodda kilitlidir. Sonuç ekranı düz metin yerine dairesel skor, kategori çubukları, öncelik rozetli bulgular ve eski→yeni metin önerileri gösteren yönetici karnesidir.

---

## 1. Marka dili ve SEO

| Yüzey | Eski | Yeni |
|---|---|---|
| Tezgâh sekmesi / katalog | Web Sitesi Tetkik | Web Site Analizi |
| CTA | Tetkiki Üret | Analizi Başlat |
| Katalog blurb | Ana sayfanın ilk HTML’inden… | SEO / ikna / dönüşüm analizi + hazır çözümler |
| Ana sayfa bench | Web Sitesi Tetkik | Web Site Analizi |
| `/tetkik` SEO title | Web sitesi tetkiki — … | Web Site Analizi — SEO, ikna ve dönüşüm karnesi |
| Kabuk sloganı | Eğitim ve kariyer | Yapay zeka iş araçları |
| Sözlük / rehber etiketleri | tetkik et / Tetkiki başlat | analiz et / Analizi başlat |

Dokunulmayanlar: rota id `tetkik`, API path’leri, `tool: "tetkik"` payload anahtarı.

---

## 2. Form temizliği

- `lib/tezgah/catalog.ts`: `businessName` alanı kaldırıldı; yalnız `url` / **Site adresi**.
- Workbench generate payload’ı artık marka göndermez.
- Marka tespiti (`detectBrand`): isteğe bağlı legacy `businessName` → sayfa `<title>` → hostname.
- Public `/tetkik` formu: canlı birincil buton (**Analizi Başlat**), sade açıklama metni.
- Tezgâh submit butonu safir gradient / yüksek kontrast; pasif soluk görünüm kaldırıldı.

---

## 3. Hydrogen entegrasyonu

| Parça | Değer |
|---|---|
| Model sabiti | `GEMINI_HYDROGEN_MODEL` / `TETKIK_MODEL_ID` = `gemini-4-hydrogen` |
| Rol | `DEEP_RESEARCH` (derin analiz) |
| Gateway | `resolveModel`: açık `model` verilirse rol varsayılanını ezer; `roleKey` billing’de kalır |
| Çıktı | `responseJson: true` |
| Token tavanı | `TETKIK_MAX_OUTPUT_TOKENS = 2400` |
| Skor otoritesi | Deterministik `scoreTetkik`; JSON `overallScore` kod skoruna kilitlenir |

Yeni parse katmanı: `lib/tezgah/tetkik/analysis.ts`  
Şema alanları: `detectedBrand`, `overallScore`, `summary`, `categories` (seo / copywriting / conversion / trust), `findings` (≥4), `copyRewrites` (2).

Trafik adedi / fiyat / yanlış genel skor iddiaları bulgu satırlarında elenir; anlatım `guardTetkikNarrative` ile süzülür.

---

## 4. Görsel yönetici karnesi UI

Dosya: `components/tezgah/tetkik-report.tsx`

1. **Üst:** Tespit edilen marka + dairesel genel skor (yeşil ≥70 / amber ≥40 / kırmızı &lt;40).
2. **Orta:** 4 kategori progress bar grid.
3. **Alt:** Kritik / Geliştirilmeli / Güçlü rozetli bulgu + çözüm kartları.
4. **En alt:** Mevcut durum → önerilen yeni metin kutuları.
5. **Fallback:** `analysis` yoksa eski düz metin / madde listesi (`data-tetkik-legacy`).

Revizyon paketi, Dijital Dükkan ve Mini SaaS handoff’ları korundu; handoff metinleri “Analizden taşındı” olarak güncellendi.

---

## 5. Dokunulan dosyalar (özet)

**Çekirdek:** `lib/tezgah/tetkik/{engine,prompts,types,analysis}.ts`, `lib/kernel/ai/{model-roles,llm-gateway}.ts`  
**Ürün yüzeyi:** `lib/tezgah/catalog.ts`, `components/tezgah/{workbench,tetkik-report,public-tetkik-form}.tsx`, `app/(public)/tetkik/**`  
**Kopya / SEO:** `lib/copy/{brand,seo,sen-voice/public,glossary,guides}.ts`, `lib/career/coach-contract.ts`  
**Test:** `tests/tezgah/{tetkik-engine,surface}.test.ts`, `tests/ui/home-bench-surface.test.ts`

---

## 6. Doğrulama

```bash
npx tsc --noEmit
npx vitest run tests/tezgah/tetkik-engine.test.ts tests/tezgah/surface.test.ts tests/ui/home-bench-surface.test.ts
npm run verify:api-auth -- --check
```

Beklenen: tip kontrolü temiz; ilgili yüzey / motor testleri yeşil; auth haritası sapmasız (`/api/tezgah/tetkik/generate` ve `publish` public kalır).
