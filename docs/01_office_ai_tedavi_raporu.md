# 01_office_ai — Tedavi Raporu, Aşama 1

| Alan | Değer |
|------|--------|
| Tarih | 21 Eylül 2026 |
| Dayanak | Onaylı `docs/01_office_ai_tespit_raporu.md` |
| Kapsam | Vitrin, SEO, antre ve ders okuma metni. |
| Dokunulmayan | Mühürlü MP3, mühürlü cue/zaman JSON’u, sınav havuzu, mini sınav JSON, API. |

Vatandaşın okuduğu makale ve antre sadeleşti. Mühürlü dokuz dersin sesi eski cümleyi söylemeyi sürdürür. Karaoke şeridi o sese kilitlidir. Yeniden kayıt bu turda yok.

---

## 1. Yapılan değişiklikler

### Vitrin ve SEO

| Eski | Yeni |
|------|------|
| Hero rozeti `Sesli Anlatım + Karaoke + …` | `Sesli Anlatım + Sınav + Mühürlü Sertifika` |
| Excel Gemini | Excel Copilot ve Ataş Yöntemi |
| A1 hijyeni | A1 Düzeni ve Temiz Veri |
| Rapor Otomasyonu | Yönetim Özetine Dönüştürme |

Çalışma kopyasında bekleyen sade antre cümlesi bu üç ada oturtuldu. Meta açıklama 180 karakter tavanının içinde. H1 ve arama başlığı (`Ofiste ChatGPT`) duruyor: arama niyeti ile öğretim sırası ayrı kalsın. Mühür cümlesi (9 ders + 10 soru / 70, sunucuda dosya kontrolü yok) antrede duruyor.

1. ders başlığı: **A1 Düzeni ve Temiz Veri: Düzensiz Excel → Düzenli Tablo**.  
3. ders başlığı: **Yönetim Özetine Dönüştürme**.

### Ders okuma metni (1–8)

Ürün uyarısı («Sınav, 9. ders bitince açılır. Baraj 70 puandır.» ve «Sınav henüz kapalıdır») 1–8. derslerin gövdesinden ve el kitabından çıktı. Aynı bilgi antrede ve 9. ders kapanışında duruyor. Sonraki ders köprüsü duruyor: 2. derste buluşma, rapor kapısı, 4. ders kapsamında, hata avı, e-posta ritüeli, Gmail, ataşla Word.

| Ders | Temizlik |
|------|----------|
| Hazırlık | İstem parçası «Format» → «Biçim». Köprü «Tablonu Konuştur» → «A1 Düzeni ve Temiz Veri». |
| 1 | Kahve yudumu, «tablonun konuşması», «Harika bir iş çıkardın», sınav kapanışı. |
| 2 | VERBİS / aydınlatma / yurt dışı aktarım paragrafı. Maske örneği (Müşteri A, MASKELİ_IBAN) duruyor. |
| 3 | Soğuk ter, kahve üstüne kahve, «Harika bir iş», «Format» → «Biçim», sınav kapanışı. |
| 4 | Yüzde seksen, algoritma, kâbus, kopya eklenti bloğu, sınav kapanışı. |
| 5 | Aynı eklenti bloğu, sınav kapısı cümlesi. 12.500 hesabı duruyor. |
| 6 | Yalnız sınav kapanışı. Ritüel (etiket, taslak, onay, arşiv) duruyor. |
| 7 | Sınav kapanışı. Aksiyon tablosu ve «hiçbir taslağı gönderme» duruyor. |
| 8 | Sınav kapanışı ve el kitabındaki «sekiz ders bitti, sınava gir» tuzağı. «Öğretmen sen, belge siz» duruyor. |
| 9 | Sınav cümleleri duruyor. Bu turda gövde yeniden yazılmadı. |

2. ders el kitabı, istenen cümleye indi:

> Ham ad, telefon, IBAN, kimlik, maaş sohbete yüklenmez. Ayrıntı şirketinin kuralıdır. Bu ders hukuki danışmanlık değildir.

4. ve 5. ders el kitabındaki «Kurumsal BT ve Eklenti (Add-in / Extension)» bloğu silindi. Aynı dürüstlük antre SSS’te duruyor. Hitap o blokta «siz» idi; blok gidince ders «sen»de kaldı.

### Bilerek bırakılanlar

- **Mühürlü konuşma metni** (`lib/academy/spoken-scripts/01_office_ai-1.md` … `-6`, `-k1`, `-g1`, `-w1`). Ses ve karaoke bu metne kilitli. Süs ve sınav cümlesi seste duruyor; okuma metninden çıktı.
- **AI DEDEKTİF** ara başlığı. Rozet ve slayt bu ada kilitli. Başlığı yalnız makalede değiştirmek sahne ile metni ayırır. Kayıt turuna kaldı.
- Sınav barajı, havuz, mini sınav, API, fiyat, mühür tanımı.

Hazırlık şeridi mühürsüz. Orada konuşma metni, cue ve zaman planının metni makaleyle hizalandı (`Format` → `Biçim`, köprü başlığı). MP3 üretilmedi. Süre sayısı değişmedi.

---

## 2. Temizlenen dosyalar

**Vitrin ve SEO**

- `lib/copy/sen-voice/academy.ts`
- `lib/copy/seo.ts`
- `lib/copy/json-ld.ts`
- `lib/copy/sem-keywords.ts`
- `lib/academy/catalog-summaries.ts`
- `lib/academy/purchase-path.ts`
- `components/academy/office-ai-guide-preview.tsx`

**Ders gövdesi**

- `lib/academy/curricula/office_ai/prep.ts`
- `lib/academy/curricula/office_ai/section_1.ts`
- `lib/academy/curricula/office_ai/section_k1.ts`
- `lib/academy/curricula/office_ai/section_2.ts`
- `lib/academy/curricula/office_ai/section_3.ts`
- `lib/academy/curricula/office_ai/section_4.ts`
- `lib/academy/curricula/office_ai/section_5.ts`
- `lib/academy/curricula/office_ai/section_g1.ts`
- `lib/academy/curricula/office_ai/section_w1.ts`
- `lib/academy/curricula/office_ai/planned.ts`
- `lib/academy/curricula/office_ai/section_6.ts` — yalnız kelime sayacı (1061). Sınav cümleleri duruyor.
- `lib/academy/cinema-cue-catalog.ts` — 1. ve 3. ders başlığı.

**Hazırlık şeridi (mühürsüz metin hizası)**

- `lib/academy/spoken-scripts/01_office_ai-0.md`
- `lib/academy/lesson-cues/01_office_ai-0.json`
- `lib/academy/lesson-audio-timings/01_office_ai-0.json`

**Başlık tutarlılığı (yeniden fırın çalıştırılmadı)**

- `scripts/ops-reset-academy-ingest-skeleton.ts`
- `scripts/bake-office-ai-01-sealed-pack.ts`
- `scripts/bake-office-ai-02-sealed-pack.ts`

**Kilit testleri** (eski slogan ve ürün uyarısını artık beklemeyenler): `tests/copy/seo-surface.test.ts`, `tests/academy/exam-sentence-standard.test.ts`, `tests/academy/office-ai-bridge-lock.test.ts`, `tests/academy/office-ai-lesson-2.test.ts`, `tests/academy/office-ai-lesson-5.test.ts`, `tests/academy/office-ai-lesson-k1.test.ts`, `tests/academy/prep-strip-audio.test.ts`, `tests/academy/citizen-surface.test.ts`, `tests/academy/storefront-vitrine.test.ts`, `tests/academy/enrolment-cta.test.ts`.

Bu dosyaları kapsayan Vitest turu geçti.

---

## 3. Sen olsaydın ne yapardın?

6. dersi kısa köprü olarak tutmazdım. 7. dersle birleştirirdim. Köprü, paneli hâlâ gizler. Vatandaş iki kez kutu görür: birinde ritüel, birinde kapı. Pedagoji kapıyı göstermeyi ister. Etiket, taslak, insan onayı ve arşiv, 7. dersin ilk iki dakikasıdır. Gmail Gemini ve Outlook Copilot aynı derste, aynı masada durur.

Bu turda dosyaları birleştirmedim. Birleştirme ders sayısını, sınav kapısını ve «9 ders» mühür cümlesini oynatır. O, metin silmek değil, müfredat kararıdır.

**Yeniden kayıttan önceki doğru hamle**

1. Bu okuma metni otursun. Mühürlü dokuz kaseti şimdi yeniden üretme. Eski süs hâlâ seste. Onu şimdi kaydetmek, temizlenen makaleyi tekrar kirletir.
2. 6+7 birleşik konuşma metnini kâğıtta yaz. 6. dersin ayrı kasetini bu metinle kapat. Karar yazılmadan fırın açılmasın.
3. Ancak ondan sonra 7. dersi bir kez kaydet. 6. dersi ayrı kaydetmek, tekrarı MP3’e mühürler.
4. Boşalan süreyi iki işe ayır, yine kayıttan önce, senaryoda: 4. dersin içine tek cümlelik sayı kilidi (slayttaki toplam kaynak hücreyle aynı değilse slaytı bırak) ve 9. derse bir Word / hata satırı. «Dokuz alışkanlık» iddiası, takvimde üç blok varken, bu yazımda düşer.

Kayıt sırası buna göre 4, 7 (içine 6 girmiş) ve 9 olur. 1, 2, 3, 5 ve 8. derslerin sesi, makaleden çıkan süs kadar eskidir; onlar da aynı turda, birleşik senaryo kilitlendikten sonra yenilenir. Önce 6. dersi tek başına yenilemek en pahalı yanlış olur.
