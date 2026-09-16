# 01_office_ai-w1 — Doygun ders iskeleti (Faz 2 bake)

| Alan | Değer |
|------|--------|
| Canlı anahtar | `01_office_ai-w1` (8. ders) |
| Hedef süre | **9.2 dk** konuşma (pedagoji bandı 7–12) |
| Canlı mühür | **521.44 sn (~8.7 dk)** — Faz 2 `--seal` tamam |
| Punchcard | 8 rozet; 2. senaryo dilekçe + rapor |
| Sinema | Word ataş masası; üç kart: sözleşme / dilekçe / rapor |
| Yöntem | `doc-upload-gemini` (2. Kapı) |
| Kaynak | PEDAGOJI.md §E.9–E.10; tespit §1.4 W1; vitrin «dilekçe / rapor» vaadi |

Bu belge bake senaryosudur. Faz 2 `--seal` tamam: canlı kaset **521.44 sn**.

---

## Pedagojik vaat (tek cümle)

Uzun Word işini **ataşla** çöz: sözleşme risk listesi, dilekçe taslağı, rapor düzeni. Sayfa sayfa kopya zahmetli yoldur. Yapay zekâ imzalamaz; unvan, tarih, sayı, hitap insandadır.

## Üç Kapı bu derste

1. **Yerleşik:** Word Copilot (lisans varsa) şeritten okur.
2. **Ataş (asıl pratik):** `docx` dosyası Gemini / Copilot sohbetine yüklenir. Seste `docx`, ekranda `.docx`.
3. **Son çare:** Tek paragraf, maskeli kısa yapıştırma. 30 sayfayı parça parça taşımak 3. kapı değildir.

---

## 4-beat + köprü (hedef dakika)

| Beat | Rozet | Hedef | Ne öğretilir |
|------|--------|-------|----------------|
| Köprü | GİRİŞ KÖPRÜSÜ | 0.5 | Sayfa 4 ve 11 kopuk kopyalanırsa ceza oranı kaçar. |
| 1 | HOŞ GELDİN | 1.0 | Üç iş: sözleşme, dilekçe, rapor. Hepsi aynı kapı: ataş. |
| 2 | ATAŞ YÜKLE | 2.4 | Sözleşme promptu. Cezai şart, fesih, gizlilik kartları (spoiler yok). |
| 3 | DİLEKÇE | 2.0 | Resmî dilekçe: hitap, konu, talep, ek. Model taslak yazar; tarih/sayı/unvan insan. |
| 3b | RAPOR | 1.6 | Dağınık not → başlık, özet, üç madde, sonraki adım. Ders 2 köprüsü. |
| Cebine koy | CEBİNE KOY | 0.8 | Ataşla, üç işi ayrı istemle sor, imzayı kendin at. |
| 4 | SIRA SENDE | 0.9 | Kendi docx’ini yükle. Müfredat biter; sınav köprüsü; baraj 70. |

Toplam ~9.2 dk.

---

## Konuşma iskeleti (SEN, Gözde)

**GİRİŞ KÖPRÜSÜ.** Uzun sözleşmeyi sayfa sayfa kopyalamak zahmetli yoldur. Bir cümle sayfa dörtte, diğeri on birde kalır. Bağlam kopar. Bugün dosyayı olduğu gibi yüklüyorsun.

**HOŞ GELDİN.** Selamlar, ben Gözde. Word dersine hoş geldin. Bugün üç iş: tedarik sözleşmesi, resmî dilekçe, kısa rapor. Yöntem doğrudan dosya yüklemedir. Dosyayı ataşla. Spesifik bir paragrafı soracaksan onu istemine eklersin.

**ATAŞ YÜKLE.** Önünde Kaya Gıda tedarik sözleşmesi durur. Cezai şart, fesih ve gizlilik üç ayrı yerde gizlenir. Asıl kapı ataştır. Word Copilot varsa şeritten okut. Yoksa Gemini sohbetine docx yüklersin.

İstem:

```
Yüklediğim sözleşme dosyasını baştan sona incele.
Şirketimiz aleyhine olabilecek cezai şart, fesih ve gizlilik maddelerini liste halinde özetle.
Sayfa numarası yaz. Uydurma madde ekleme.
```

Zahmetli yol: sayfa dördü kopyala, sayfa on biri kopyala. Model yarım cümle görür. Ceza oranını kaçırır.

**DİLEKÇE.** İkinci iş. Kaymakamlığa süre uzatım dilekçesi. Ataşla boş şablon veya kendi taslağın. İstem: hitap, konu satırı, üç cümlelik gerekçe, açık talep, ek listesi. Yapay zekâ taslak yazar. Tarih, sayı, unvan, imza senin. Kanun maddesi uydurursa silersin; bu derste resmi kaynağı sen kilitlersin.

**RAPOR.** Üçüncü iş. Dağınık saha notundan bir sayfalık durum raporu: başlık, üç madde, bir sonraki adım. Ders 2’deki yönetici özeti burada Word’e iner. Gözlem ile karar notunu karıştırma.

**CEBİNE KOY.** Bir: dosyayı ataşla. İki: sözleşme, dilekçe veya raporu ayrı istemle sor. Üç: tarih, sayı, imza insanda kalır.

**SIRA SENDE.** Kendi docx sözleşmeni veya dilekçe taslağını yükle. Üç maddeyi çıkar. Tüm dosyayı sayfa sayfa kopyalama. Bu 8. derstir. Sınav henüz kapalıdır. Kapanış dersi Haftalık Sistem’dir; o 9. ders bitince sınav kapısı açılır. Baraj 70.

---

## Sinema / punchcard notu

- Layout `word` kalır. Comparison’da üç kart: CEZAİ ŞART / DİLEKÇE HİTAP / RAPOR MADDESİ.
- Prompt terminali SSOT üç istem sırayla (sözleşme → dilekçe → rapor); Command’da yalnız aktif istem, spoiler yok.
- Mini sınav: ataş vs parça kopya; dilekçede insan denetimi; sınav köprüsü tüm dersler bitince.
- Dilekçe ve KVKK maskeleme **bu iskeletle öğretilir**; kurs havuzuna dilekçe sorusu ancak bake sonrası döner.

## Bake kapısı

Kelime ~1300–1450. Cue 8. Eski 156 sn kaset düşer. G1 doygun kasetle aynı fırın sırası: senaryo → dry-run → cue → seal.
