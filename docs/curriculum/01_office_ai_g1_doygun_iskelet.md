# 01_office_ai-g1 — Doygun ders iskeleti (Faz 2 bake)

| Alan | Değer |
|------|--------|
| Canlı anahtar | `01_office_ai-g1` (7. ders) |
| Hedef süre | **9.0 dk** konuşma (pedagoji bandı 7–12) |
| Canlı mühür | **523.6 sn (~8.7 dk)** — Faz 2 `--seal` tamam |
| Punchcard | 8 rozet (aynı iskelet; içerik doyar) |
| Sinema | Çift hat: sol Gmail Gemini, sağ Outlook Copilot |
| Yöntem | `gmail-gemini` + Outlook 1. Kapı / 3. Kapı dürüstlüğü |
| Kaynak | PEDAGOJI.md §E.7–E.10 Üç Kapı; tespit raporu §1.4 G1 |

Bu belge bake senaryosudur. Faz 2 `--seal` tamam: canlı kaset **523.6 sn**.

---

## Pedagojik vaat (tek cümle)

Aynı e-posta rutinini **iki kapıdan** göster: Gmail’de Gemini paneli, Outlook’ta Copilot (lisans varsa). Çıktı bir **aksiyon listesidir** (kim, ne, ne zaman). Mail gövdesini dış sohbete hamal gibi taşımak varsayılan yol değildir.

## Üç Kapı bu derste

1. **Yerleşik:** Gmail Gemini; Outlook Copilot.
2. **Ataş:** Zincir PDF / eml gerekirse (kısa dipnot; asıl pratik paneldir).
3. **Son çare:** Maskeli 4–6 satırlık kısa yapıştırma. Bütün gelen kutusu + ekran görüntüsü zinciri 3. kapı değildir.

Harf harf yazma yok. İstem panele yazılır veya ekrandaki istem aynı panele taşınır.

---

## 4-beat + köprü (hedef dakika)

| Beat | Rozet | Hedef | Ne öğretilir |
|------|--------|-------|----------------|
| Köprü | GİRİŞ KÖPRÜSÜ | 0.6 | Dün Outlook sineması (ders 4) vardı; bugün aynı rutin Gmail’de ve Outlook’ta yan yana. |
| 1 | HOŞ GELDİN | 1.2 | Sabah 142 mail. Ödeme, onay, aksiyon, bülten aynı yığın. |
| 2 | ÇİFT HAT | 2.2 | Sol Gmail Gemini, sağ Outlook Copilot. Lisans yoksa sağ panel dürüst rozet: «Copilot yoksa canlı kutu okunmaz». |
| 2b | GEMİNİ AÇ | 1.5 | Prompt terminali: 24 saat süz + aksiyon tablosu. İstem yazılır. |
| 3 | FARK ORTADA | 1.8 | Sol: kutu kopuk (Kontrol C / dış sohbet). Sağ: kutu yerinde, etiket + taslak. |
| Cebine koy | CEBİNE KOY | 0.8 | Üç adım: paneli aç, aksiyon listesi iste, insan onayından önce gönderme. |
| 4 | SIRA SENDE | 0.9 | Kendi kutunu süz. Üç satırlık aksiyon tablosu çıkar. |

Toplam ~9.0 dk.

---

## Konuşma iskeleti (SEN, Gözde)

**GİRİŞ KÖPRÜSÜ.** Gelen kutusunu dışarı taşımak eskiden tek yol gibi dururdu. Bugün aynı işi iki yerleşik kapıdan yapıyoruz: Gmail’de Gemini, Outlook’ta Copilot.

**HOŞ GELDİN.** Selamlar, ben Gözde. E-posta dersinin doygun ayağına hoş geldin. Ders 4 etiket, taslak, insan onayı, arşivi öğretti. Bugün o rutini Gmail ve Outlook’ta yan yana basıyoruz. Çıktın bir aksiyon listesi: kim, ne, ne zaman.

**ÇİFT HAT.** Ekranı ikiye böl. Solda Gmail. Sağdaki Gemini panelini aç. İstemi oraya yaz. Sağda Outlook. Copilot lisansın varsa şeritten okut. Yoksa sağda dürüst rozet yanar: canlı kutu okunmaz. Gmail’e geç veya 3. kapıya in: maskeli kısa özet, bütün kutuyu değil.

**GEMİNİ AÇ.** Prompt terminalindeki komut tam olarak bu:

```
@Gmail Gelen kutumdaki son 24 saat içinde gelen e-postaları tara.
Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu.
Rutin dekont ve bültenleri Arşivlik yaz.
Hiçbir taslağı gönderme.
```

Aynı cümleyi Outlook Copilot’a da verebilirsin; kutu değişir, rutin değişmez. İstemi panele yazarsın veya ekrandaki istemi aynı panele taşırsın. Maili dış sohbete kopyalamazsın.

**FARK ORTADA.** Sol: kopyalanmış mailler, Kontrol C, dış sohbet. Etiket Gmail’de oluşmaz. Sağ: kutu yerinde. Ödeme ayrı, aksiyon ayrı, arşivlik ayrı. Sen hamal değilsin.

**CEBİNE KOY.** Bir: yerleşik paneli aç. İki: aksiyon tablosu iste. Üç: insan onayı olmadan gönderme. Copilot yoksa Gmail’e geç; son çare maskeli kısa yapıştırma.

**SIRA SENDE.** Kendi kutunu aç. Son 24 saati süz. Üç satırlık aksiyon listesi çıkar. Sonra Word tarafında sözleşmeyi, dilekçeyi ve raporu ataşla göreceğiz.

---

## Sinema / punchcard notu

- Layout: `gmail` solda kalır; sağa Outlook şeridi **split** (yeni `visualMode` veya mevcut compare). Faz 2’de `outlook-workspace` ile `gmail-workspace` aynı cue’da yan yana.
- Spoiler yasağı: Command’da temiz aksiyon tablosu yok; Comparison sağ panelde açılır.
- Seste `Ctrl+C` → `Kontrol C`. Ekran `Ctrl+C` kalabilir.
- Mini sınav: yerleşik panel, aksiyon listesi sütunları, insan onayı. Harf harf yok.

## Bake kapısı

Senaryo kelime ~1250–1400. Cue 8. Timings nefes dilimi. `--dry-run` yeşil, insan onayı, sonra `--seal`. Eski 173 sn kaset düşer.
