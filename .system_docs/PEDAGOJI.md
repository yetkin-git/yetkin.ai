# PEDAGOJI.md — Eğitim ve anlatım ilkeleri

Bu belge platformun **canlı** eğitim felsefesini, Aşama 1 (makale) yayın standardını ve Aşama 2–3 üretim disiplinini tanımlar.

- **Aşama 1 (B):** Yayın makalesi. Compact markdown + sekme + sunucu sınavı.
- **Aşama 2–3 (E):** Sinematik katman — sesli anlatım, zaman damgalı kayan metin, görsel. İnsan `--seal` onayı olmadan harici TTS veya video bake yok.
- **Stüdyo sayıları** (dilim, duraklama, model id, ses yuvası, sahne bütçesi): `docs/OPS_STUDYO_SAYILARI.md`. Bu dosyaya kopyalanmaz.

Çelişkide `.system_docs/ANAYASA.md` bağlayıcıdır. Canlı model kimliği `lib/kernel/ai/model-roles.ts` SSOT’tur.

---

# A. Eğitim felsefesi

## 1. Somut ve uygulamalı anlatım ("Garsonu göster")

Soyut tanım yığılmaz. Bilginin masada nasıl çalıştığı gösterilir.

* **Çalışan örnek:** «Ajan otonom bir döngüdür» demek yerine sipariş, araç, bellek ve teslim adımı yazılı durur.
* **Konunun doğası:** Ofis/Excel, e-ticaret, sosyal içerik, chatbot ve prompt — her SKU kendi iş dilini kullanır. Tek şablon her alana zorla dayatılmaz.
* **SEN dili:** Anlatıcı öğrenciye «sen» diye hitap eder. Dolgu («Şey…», «Eeee…») ve bürokratik dolambaç yok.

## 2. Konunun hakkı

Sabit ders adedi, maktu dakika veya kelime tavanı **yayın makalesini kesmez** (Anayasa B4). Bir kurs kaç bölüm isterse o kadar yazar; ingest ve vitrin o gerçeği taşır.

**Kanon vs yayın:** Kimlik sicili 13 odaklı eğitim başlığı tutar (`ACADEMY_COURSE_TITLES`). **Canlı vitrin** ingest edilmiş 5 compact SKU’dur: `01_office_ai`, `02_ecommerce_ai`, `03_social_media_ai`, `04_chatbot_nocode`, `05_prompt_practice`. 06–13 onaylı ingest bekleyen taslaktır; vitrin cümlesi 13 satmaz.

Eski Temel/Orta/İleri Python–AI Agent–Fullstack ve Excel/Canva/Ads masterclass müfredatı silinmiştir. Belge onları yaşatmaz.

---

# B. Canlı standart — Aşama 1 (Makale / Compact Markdown)

**Yayın formatı budur.** Vatandaş için standart deneyim Aşama 1 makale okumasıdır. Karaoke/Teleprompter yalnız mühürlü derslerde cue + `currentTime` ile opsiyoneldir.

1. Ders gövdesi `docs/curriculum/` altında `.md` yazılır; `scripts/ingest-course-sections.ts` `lib/academy/curricula/<klasör>/` üretir.
2. Oynatıcı tek kabuk: `CurriculumPlayer` + `AcademyMarkdownRenderer` + `LessonStudyTabs`. Mühürlü derste aynı kabuğun alt katmanı göz + medya + cue overlay’dir.
3. Soğuk şablon başlıkları (`TANIŞMA`, `GİRİŞ`, `BÖLÜM N`) ekranda kırpılır; asıl ders H2/H3 ve gövde ile başlar.
4. Compact derste etkileşimli lab zorunlu değildir; okuma mührü yeter.
5. **Ses vaadi mühürle dardır.** Vitrin 5 kurs satar. Vatandaş karaoke yalnız `ACADEMY_MEDIA_SEALED_AUDIO` sicilindeki derslerde açılır. Amiral SKU (`01_office_ai`) Aşama 2–3 prodüksiyon kuyruğu 3–6. dersler için açıktır; WAV mühürlenmeden teleprompter basılmaz. `generateSpeech` / `listen` kapıları **410**. İzlemede canlı TTS yoktur. Kelime-saati yayın senkronu değildir.

Amiral SKU (`01_office_ai`) Aşama 2–3’e çıkarılacak ilk üründür. Diğer compact kurslar Aşama 1’de kalabilir; geçiş zorunlu değildir.

---

# C. Kanıt zinciri

1. Giriş ve bağlam.
2. İş problemi / senaryo.
3. Uygulama (tablo, prompt, adım; yazılımda çalışan örnek).
4. Özet ve saha görevi.
5. Kurs sonu sınav: baraj **70**, **sunucu puan**. Sertifika satın alınmaz.

---

# D. Aşama 2 ve Aşama 3 — geçiş disiplini

Geçmiş felaket (UI + TTS + DOM’u aynı anda çözmek, hayalet `.chunks`) tekrarlanmaz. Üretim sırası **metin → konuşma metni → mühürlü ses → cue → görsel**’dir; tersine değil.

* **Aşama 2 (taslak):** Yalnız yerel/mock ses ve taslak cue. Eski chunk fiziken silinir. Vatandaş yüzeyine taslak WAV basılmaz.
* **Aşama 3 (mühür):** İnsan `--seal` / `--mode=production` onayı olmadan harici TTS veya video bake yok.

Süre/kelime bütçesi **ses mühürlü** derse aittir; compact makale gövdesini kesmez (Anayasa B4). Sayılar OPS defterindedir.

---

# E. Görsel, Ses ve Video Üretim SOP (Aşama 2 & 3)

Satın alınan Akademi ürününün *hedef* deneyimi: **sesli anlatım + ekranda senkron kayan metin + görsel destek.** Gün 0 gerçeği Aşama 1 makaledir; sinema sonradan gelir.

İzleme anında harici üretici API **çağrılmaz**. Bütün medya Aşama 3’te dondurulur; oynatıcı yalnız kamu dosyası ve cue listesini okur.

## E.1 Seslendirme

* **Model kimliği Pedagoji’de durmaz.** `VOICE_TTS` ve yedek `lib/kernel/ai/model-roles.ts` içindedir.
* **Anlatım dili:** SEN aksı. Doğal, akıcı. Dolgu ve harf harf heceleme yok. Nefes, dilimler arası duraklamadır; dolgu duraksaması değildir. Süre OPS’tedir.
* **Konuşma metni ≠ makale gövdesi.** Kod çiti, tablo hamlığı ve soğuk şablon başlıkları seslendirilmez. Makale «Tam Ders Metni»nde kalır.
* **Nefes kuralı:** Metin tek blokta gönderilmez; noktalama parçalarına bölünür, araya duraklama konur. Cue ve timings gerçek bake süresine kilitlenir. Fonksiyon adları OPS’tedir.
* **Vatandaş kapısı:** `generateSpeech` / `listen` **410**. Bake yalnız onaylı operatör script’idir.

## E.2 Ekranda Kayan Metin & Senkronizasyon

* Oynatıcı **yalnız mühürlü derste** ses çalarken zaman damgalı kayan metin sunar. Mühürsüz derste teleprompter basılmaz.
* Saat kaynağı HTMLMediaElement `currentTime`’dır — kelime-saati tahmini yayın senkronu değildir.
* Taslak cue vatandaş yüzeyine girmez.
* Compact `diagrams: []` / `microVideos: []` durur — Compact şema yuvası sinema sahnesi değildir.
* Teleprompter tiyatrosu (çoklu anlatıcı, hayalet `.chunks`) geri gelmez. Tek eğitmen, tek iz.

## E.3 Görsel ve video

* Kısa sinematik sahne ve illüstrasyon bake’i operatör script’i + `--seal` ile yapılır; izleme üreticiyi vurmaz.
* Canlı gateway’de `VIDEO_GEN` fail-closed durur (`generateVideo?: never`).
* Placeholder test-pattern vatandaşa basılmaz.
* Birim bütçe ve sahne listesi onaylı batch’tedir; bu belgeye fiyat gömülmez.

## E.4 Bütçe & Maliyet Kalkanı

* TTS ve video jenerasyonu **strictly `--seal`** ve onaylı batch script’leri üzerinden yürür.
* İzlemede canlı/anlık API çağrısı **yoktur.** Kota, 429 ve gizli fatura vatandaş oturumuna sızmaz.
* `--dry-run` varsayılan keşif yoludur. `--seal` / `--confirm-gemini-spend` / `--mode=production` insan onayından sonra harici çağrı açılır.
* Compact makale kelime tavanı maliyet kalkanı değildir. Kalkan, mühürlenecek **konuşma metni + sahne listesi** üzerinedir.
