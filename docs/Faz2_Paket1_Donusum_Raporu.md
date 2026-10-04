# FAZ 2 — Paket 1 Dönüşüm Raporu

Tarih: 4 Ekim 2026  
Durum: Kimlik kartı pakete eklendi. Eski listeler aynı isimle kartı okuyor.  
İlke: Canlı sayfa, API ve test cevabı aynı kaldı.

---

## 1. Ne yapıldı

Kurs kimliği tek karta alındı. Kart `packages/kernel/src/catalog-ids/course-registry.ts` dosyasındadır. Akademi motoru, dosya sistemi ve veritabanı bu dosyaya girmez.

Kartta 14 eğitim durur.

| Küme | Adet | Kim |
| --- | --- | --- |
| Kanon | 13 | `01_office_ai` … `13_ai_governance` |
| Kanon dışı canlı | 1 | `01_office_ai_ileri` (OFF-201) |
| Canlı vitrin | 6 | Amiral, ileri ofis, e-ticaret, sosyal medya, chatbot, prompt |
| Hazırlık kabuğu | 8 | `06_` … `13_`. Vitrin sırası yok. Ders yolu boş. |
| Mobil liste | 2 | Yalnız `01_office_ai` ve `01_office_ai_ileri` |
| Pasaport kapısı | 5 | OFF-101, EC-102, SM-103, BOT-104, PR-105 |

Görev metnindeki «6 canlı + 1 ileri + 6 hazırlık = 13» sayımı, onaylı tasarım ve canlı kodla örtüşmez. Canlı vitrin zaten ileri ofisi içerir. Hazırlık kabuğu sekizdir (`06`’dan `13`’e). Kanon on üçtür. İleri ofis o on üçün dışındadır. Kart, tasarım belgesindeki ve bugünkü dosyalardaki sayılara eşitlendi. İki kanon eğitim düşürülmedi.

Her kartta şu alanlar durur: `slug`, `code`, `title`, `level`, `layer`, `canon`, `priceSeedMinor`, `voice`, `lessonKeys`, `warmup`, `coverPath`, `summary`, `seo`, `vitrineOrder`, `nativeListed`, `passportListed`, `seedRanks`.

Satır kimliği, katalog birimi, fiyat satırı ve sınav kimliği kartta ikinci kez yazılmaz. Slug’dan üretilir: `ac_<slug>`, `course:<slug>`, `cat_academy_course_<slug>`, `exam_<slug>`.

Eski fonksiyon ve sabit adları durur. Çağıran dosyalar yer değiştirmedi. Gövde kartı okur.

---

## 2. Güncellenen dosyalar

| Dosya | Ne değişti |
| --- | --- |
| `packages/kernel/src/catalog-ids/course-registry.ts` | Yeni kart. 14 eğitim. |
| `packages/kernel/src/catalog-ids/index.ts` | Kart paketten dışarı açıldı. |
| `packages/kernel/src/catalog-ids/course-slugs.ts` | Kanon slug, unvan, katman ve ileri ofis unvanı karttan türer. |
| `lib/kernel/catalog-ids/exam-path.ts` | Sınav yolu, dersi olan kartların `lessonKeys` alanıdır. Boş kabuk tabloya girmez. |
| `lib/academy/pilot-sku.ts` | Vitrin sırası, kardeş liste, satış adayı, mühürlü slug ve kapak yolu karttan türer. |
| `lib/academy/instructors.ts` | Ağız haritası karttaki `voice` alanından türer. Tempo ve sunucu cümlesi yerinde kaldı. |
| `lib/academy/lesson-veo.ts` | Isınma kaseti ve bağlı dersler karttaki `warmup` alanından okunur. |
| `lib/academy/course-level.ts` | Kanon seviye etiketi karttan türer. |
| `lib/academy/catalog-pricing.ts` | 13 tohum fiyat ve OFF-201 lansman tohumu karttan türer. |
| `lib/academy/catalog-summaries.ts` | Vitrin özeti karttan türer. |
| `lib/academy/catalog-seed.ts` | Tohum kimliği ve sıra puanı karttan türer. |
| `lib/academy/catalog-filter.ts` | Eğitim kodu ve raf sırası karttan türer. |
| `lib/academy/course-cover.ts` | Kapak yolu kartla kilitlendi. |
| `apps/rail-is/src/ui/course-slugs.ts` | Mobil sıra `nativeListed` açık kartlardır. |

Eski `office-ai` kod takma adı `catalog-filter.ts` içinde durur. O bir kurs kartı değildir. OFF-101’e düşer.

---

## 3. Bilerek yerinde bırakılanlar

Bu paket dış cevabı değiştirmez. Şunlar sonraki paketin işidir.

- Yayın anahtarı. `ACADEMY_EC102_PUBLIC_RELEASE_OPEN` ve kardeş bayraklar durur. Hepsi bugün açıktır. Veritabanı `is_published` düğmesi bu pakette yok.
- Arama metası dosyası `lib/copy/seo.ts`. Aynı cümleler karta da yazıldı. Sayfa hâlâ `seo.ts` dosyasını okur. İki metin eşit durur. Bağ, sonraki pakettedir.
- İlan kapısı `need-based-mapping.ts`. Beş pasaport kodu kartta `passportListed` olarak durur. Kapı dosyası henüz kartı okumaz. OFF-201 pasaportta kapalı kaldı.
- Diskteki ısınma dosya adları `baked-micro-videos.ts` içinde durur. Kart yolu söyler. Dosyayı üretmez.
- Yeniden fırın konuşma yolları `pilot-sku.ts` içinde durur. Onlar içerik adresidir, kimlik listesi değildir.
- Mühür kapısı, model haritası ve canlı fiyat satırı yerinde kaldı.

İleri ofisin seviye etiketi kartta «İleri»dir. Vatandaşın gördüğü seviye fonksiyonu bugünkü gibi yalnız kanon haritayı okur. İleri ofis bu haritada olmadığı için fonksiyon yine boş döner. Vitrin cümlesi değişmedi.

Mobil listeye dört kardeş eklenmedi. Ürün kararı değişmedi.

---

## 4. Doğrulama

| Kapı | Sonuç |
| --- | --- |
| `npx tsc --noEmit -p tsconfig.json` | Geçti |
| `npx tsc --noEmit -p apps/rail-is/tsconfig.json` | Geçti |
| `npm run verify:boundaries` | Geçti |
| `npm run verify:academy-curriculum` | Geçti. Yazılmış eğitimler en az 6 ders. Ders başı en az 600 kelime. UTF-8 sağlam. |
| `npm test` | 244 dosya, 1196 test, hepsi geçti |

İlk tam koşuda 1195 test geçti. Biri zaman aşımına düştü: `tests/kernel/live-broadcast-shutdown.test.ts`. Bu test PayTR kapatma kilidini okur. Kurs kartına değmez. Yalnız başına 1,6 saniyede geçti. Ardından tam paket yeniden koşuldu: 1196 / 1196 geçti.

Ek yüzey mühürleri de geçti: vize kapısı, katalog tohumu, ileri ofis fiyatı, müfredat indeksi ve arama metası yüzeyi.

---

## 5. Hüküm

Paket 1 sarıcıdır. Yeni bir eğitim eklemek için kimlik listelerine ayrı satır yazılmaz. Kartta bir obje yeter. Ders metni, sınav cümlesi, ses dosyası, ısınma kaseti ve kapak dosyası yine kendi yerinde durur.

Yayın düğmesi ve SQL sıra kilidi bu pakette açılmadı. Onlar ayrı sürümde gider.
