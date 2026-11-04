# Tedavi Raporu 11 — Akademi yönlendirme ve açık vitrin

Tarih: 2026-11-01
Kapsam: Ana sayfa ve Akademi üst çubuğu düğmeleri; `/academy` vitrininde ileri eğitimlerin gizlenmesi.

Kök adres `localhost:3000/` 200 döner. Gövde «Ücretsiz Dersi İzle» bağını demo oynatıcıya, «Eğitimleri İncele» bağını `/academy` adresine basar. `/academy` aynı oturumda altı yayın kartını açar. E-ticaret kartının sayfası `/academy/02_ecommerce_ai` adresidir; o sayfadaki ücretsiz ders `/academy/02_ecommerce_ai/oyna` adresine gider.

---

## Özet

| Soru | Cevap |
|---|---|
| Ücretsiz ders nereye gider? | `/academy/01_office_ai/oyna`. Bu yalnız demo dersidir. |
| Eğitimleri incele nereye gider? | `/academy`. Oynatıcıya gitmez. |
| İleri dersler nerede? | Aynı vitrinde, «İleri Düzey Modüller» ızgarasında. Kapı yok. |
| Kart tıklanınca? | O eğitimin kendi sayfası: `/academy/{slug}`. Satın alınmış kart oynatıcıya gider. |
| Ücretsiz ders düğmesi kartta? | O eğitimin kendi oynatıcısı: `/academy/{slug}/oyna`. |
| `/academy/ileri`? | Eski bağlantı için süzülmüş liste durur. Ana vitrin artık oraya hapsetmez. |

---

## ADIM 1 — Ana sayfa ve üst çubuk

Kamu ana sayfa `app/(public)/page.tsx` yolundadır. Kök adres bu sayfadır.

| Düğme | Bağ |
|---|---|
| Ücretsiz Dersi İzle | `/academy/01_office_ai/oyna` |
| Eğitimleri İncele | `/academy` |
| Sinema şeridindeki Eğitimleri İncele | `/academy` |
| İş sonucu kartı | `/academy` |

Akademi kataloğunun üst çubuğu (`data-academy-catalog-header`) aynı çifti basar. Eski «Eğitime Başla» düğmesi yalnız 101 nolu eğitimin kasasına gidiyordu; o düğme kalktı. Satın alma her kartın kendi eğitiminde durur.

---

## ADIM 2 — Açık vitrin

Tek kahraman kapısı kalktı. `/academy` artık temel kartı ve beş ileri kartı aynı sayfada basar:

| Kart | Sayfa | Ücretsiz ders |
|---|---|---|
| Ofiste Yapay Zekâ | `/academy/01_office_ai` | `/academy/01_office_ai/oyna` |
| E-Ticaret ve Pazaryeri | `/academy/02_ecommerce_ai` | `/academy/02_ecommerce_ai/oyna` |
| Sosyal Medya | `/academy/03_social_media_ai` | `/academy/03_social_media_ai/oyna` |
| Prompt Mühendisliği | `/academy/05_prompt_practice` | `/academy/05_prompt_practice/oyna` |
| Kodsuz Chatbot | `/academy/04_chatbot_nocode` | `/academy/04_chatbot_nocode/oyna` |
| İleri Ofis | `/academy/01_office_ai_ileri` | `/academy/01_office_ai_ileri/oyna` |

Kartlar cam yüzeydir (`rail-glass`). Gövde tıklaması o eğitimin sayfasına gider. Satın alma düğmesi o eğitimin kendi kasasına gider; misafirde giriş kapısı aynı eğitimin `#satin-al` hedefini taşır. «Ayrı rafta gör» kapısı ve `/academy/ileri` zorunlu yolu kalkmıştır.

`/academy/ileri` sayfası silinmedi. Eski adres temel kartı basmadan ileri kartları listeler. Yeni yol ana vitrindir.

---

## ADIM 3 — Kapılar

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | temiz (çıkış 0) |
| `npx vitest run` | 1971 geçti, 10 kaldı. On test akademi süre mührü (`01_office_ai` timings). Bu görevden önce de kırıktı. Vitrin rafı, ana sayfa CTA ve soft-404 geçti. |
| `verify:boundaries` | OK |
| Canlı vitrin | Altı kart açık. Kapı yok. E-ticaret sayfası kendi eğitimini açtı. |

Yönlendirme kapısı olarak soft-404 (`/academy/ileri` hâlâ statik adres) ve ana sayfa CTA yüzeyi aynı koşuda geçti.
