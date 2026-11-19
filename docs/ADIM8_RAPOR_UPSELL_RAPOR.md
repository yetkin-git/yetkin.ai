# Adım 8 Raporu — Rapor Sonu Upsell / Handoff Metinleri (CRO)

**Tarih:** 20 Kasım 2026  
**Kapsam:** Web Site Analizi sonuç ekranındaki sonraki adım (upsell/handoff) başlık, açıklama ve buton metinlerinin self-servis satış diline çevrilmesi; Tezgâh handoff bilgilendirme notunun sıcaklaştırılması.  
**Dokunulmayanlar:** `onRebuild` / `onCodePack` rotaları, `data-tetkik-*` işaretçileri, revizyon paketi kopyalama davranışı, form/API payload’ları.

---

## Yönetici özeti

Rapor altındaki üç handoff bloğu teknik ürün dilinden (“Revizyon paketi”, “Dijital Dükkan”, “Mini SaaS”) çıkarıldı; müşterinin kendi başına eyleme geçmesini teşvik eden CRO metinleriyle değiştirildi. Tezgâh sekmesine geçişte görünen “Analizden taşındı” sistem notu yönlendirici bir cümleyle değiştirildi.

---

## 1. Rapor sonu aksiyon alanı (`tetkik-report.tsx`)

| Öğe | Eski | Yeni |
|---|---|---|
| Bölüm başlığı | *(yok)* | Raporu Eyleme Dönüştürün (Kendi Başınıza Hemen Uygulayın) |
| Seçenek 1 başlık | Mevcut Siteyi Düzenle (Revizyon Paketi) | Hazır Düzeltme & SEO Uygulama Paketi |
| Seçenek 1 açıklama | Kalan maddelere göre yapıştırmaya hazır metin… | Bu rapordaki tüm eksikleri gideren hazır yeni başlıkları, SEO meta etiketlerini ve sitenize/yazılımcınıza doğrudan uygulatabileceğiniz adım adım düzeltme reçetesini tek tıkla üretin. |
| Seçenek 1 buton | Revizyon paketini kopyala | Hazır Düzeltme Paketini Üret |
| Seçenek 2 başlık | Sıfırdan Yeniden İnşa Et | Sıfırdan Satış Odaklı Yeni Vitrin Kur |
| Seçenek 2 açıklama | İşletme adı ve ölçülen sayfa bilgisi Sektörel Dijital Dükkan formuna taşınır… | Mevcut sitenizi düzeltmekle uğraşmak istemiyorsanız, tüm eksikleri giderilmiş ve müşteriyi doğrudan satışa yönlendiren yeni tek sayfalık vitrininizi 1 dakikada otomatik oluşturun. |
| Seçenek 2 buton | Sıfırdan Yeniden İnşa Et (Dijital Dükkan) | Yeni Vitrinimi Otomatik Kur |
| Seçenek 3 başlık | *(yalnız buton)* | Sitenize Özel Hesaplayıcı veya Form Ekle |
| Seçenek 3 açıklama | *(yok)* | Ziyaretçilerinizi müşteriye dönüştürmek için sitenize gömebileceğiniz akıllı teklif veya hesaplama aracını hazırlayın. |
| Seçenek 3 buton | Eksikler İçin Kod Paketi Üret (Mini SaaS Tezgâhı) | Özel Aracı Oluştur |

Seçenek 3 artık yalnız buton değil; başlık + açıklama + CTA içeren kart.

---

## 2. Handoff bilgilendirme (`workbench.tsx`)

| Yüzey | Eski | Yeni |
|---|---|---|
| Dükkan handoff (`data-tetkik-handoff`) | Analizden taşındı. İşletme adı forma yazıldı. … Sektör, yer, WhatsApp ve hizmetleri tamamlayıp dükkanı üretin. | Web Site Analizi bulgularınız otomatik aktarıldı; şimdi hazır çözümünüzü üretebilirsiniz. (+ isteğe bağlı sayfa başlığı / adres) |
| Mini SaaS handoff (`data-tetkik-codepack-handoff`) | Analizden taşındı. Tespit edilen eksikler açıklamaya yazıldı. Bileşeni seçip kod paketini üretin. | Web Site Analizi bulgularınız otomatik aktarıldı; şimdi hazır çözümünüzü üretebilirsiniz. (+ isteğe bağlı adres) |

---

## 3. Doğrulama

```bash
npx tsc --noEmit                         # geçti
npx vitest run tests/tezgah/surface.test.ts  # 10/10 geçti
```

`tests/tezgah/surface.test.ts` yeni metinlere ve handoff cümlesine göre güncellendi; `"Analizden taşındı"` artık yüzeyde yok.

---

## 4. Dokunulan dosyalar

- `components/tezgah/tetkik-report.tsx`
- `components/tezgah/workbench.tsx`
- `tests/tezgah/surface.test.ts`
- `docs/ADIM8_RAPOR_UPSELL_RAPOR.md`
