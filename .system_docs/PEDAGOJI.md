# PEDAGOJI.md — Eğitim ve anlatım ilkeleri

Bu belge platformun **canlı** eğitim felsefesini, Aşama 1 (makale) yayın standardını ve Aşama 2–3 üretim disiplinini tanımlar.

- **Aşama 1 (B):** Yayın makalesi. Compact markdown + sekme + sunucu sınavı.
- **Aşama 2–3 (E+F):** Sinematik katman — tam metin, zaman senkronlu kayan yazı, görsel/şema, sinematik medya. Üretim matematiği §F. İnsan `--seal` onayı olmadan harici TTS veya video bake yok.
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

Sabit ders adedi, maktu dakika veya kelime tavanı **yayın makalesini kesmez** (Anayasa B4). Compact gövde konunun hakkını taşır; ingest ve vitrin o gerçeği basar.

**Mühürlü yapay zekâ eğitimi** (Aşama 2–3 konuşma metni + bake) §F üretim ve doygunluk standardına kilitlenir: 45–90 dk kurs, 6–8 ders, ders başı 7–12 dk, dört adımlı ders içi akış. Bu bant makale satırını budamaz; fırınlanacak konuşma metnini ve sahne listesini bağlar.

**Kanon vs yayın:** Kimlik sicili 13 odaklı eğitim başlığı tutar (`ACADEMY_COURSE_TITLES`). **Canlı vitrin** ingest edilmiş 5 compact SKU’dur: `01_office_ai`, `02_ecommerce_ai`, `03_social_media_ai`, `04_chatbot_nocode`, `05_prompt_practice`. 06–13 onaylı ingest bekleyen taslaktır; vitrin cümlesi 13 satmaz.

Eski silinmiş Python–AI Agent–Fullstack ve Excel/Canva/Ads masterclass müfredatı yaşatılmaz. Çok teknik konularda **isteğe bağlı** Temel / Orta / İleri bağımsız paket ayrımı §F.3’tedir; her SKU’ya zorunlu basamak değildir.

**Junior oda ≠ başlangıç seviyesi.** `/junior` odası 18 yaş altı / veli doğrulamalı çocuk ürünüdür. Üretim kilitlidir (`JUNIOR_PRODUCTION_LOCKED`); disk `archived/app/junior`, kenar **HTTP 410**. Veli onayı, çocuk KVKK’sı ve reşit olmayan tahsilat ister; PayTR B2C + 18+ yasal gövde ile çelişir — açılmaz. Başlangıç seviyesi eğitim ihtiyacı ayrı oda değil, Akademi içi **Temel Paketler** ile karşılanır (§F.3). Vitrindeki Katman 1 (`01_office_ai`) kitlesel temel hattır.

---

# B. Canlı standart — Aşama 1 (Makale / Compact Markdown)

**Yayın formatı budur.** Vatandaş için standart deneyim Aşama 1 makale okumasıdır. Karaoke/Teleprompter yalnız mühürlü derslerde cue + `currentTime` ile opsiyoneldir.

1. Ders gövdesi `docs/curriculum/` altında `.md` yazılır; `scripts/ingest-course-sections.ts` `lib/academy/curricula/<klasör>/` üretir.
2. Oynatıcı tek kabuk: `CurriculumPlayer` + `AcademyMarkdownRenderer` + `LessonStudyTabs`. Mühürlü derste aynı kabuğun alt katmanı göz + medya + cue overlay’dir.
3. Soğuk şablon başlıkları (`TANIŞMA`, `GİRİŞ`, `BÖLÜM N`) ekranda kırpılır; asıl ders H2/H3 ve gövde ile başlar.
4. Compact derste etkileşimli lab zorunlu değildir; okuma mührü yeter.
5. **Ses vaadi mühürle dardır.** Vitrin 5 kurs satar. Vatandaş karaoke yalnız `ACADEMY_MEDIA_SEALED_AUDIO` sicilindeki derslerde açılır. Amiral SKU (`01_office_ai`) 6/6 mühürlüdür; WAV mühürlenmeden teleprompter basılmaz. `generateSpeech` / `listen` kapıları **410**. İzlemede canlı TTS yoktur. Kelime-saati yayın senkronu değildir.

Amiral SKU (`01_office_ai`) Aşama 2–3’e çıkarılacak ilk üründür. Diğer compact kurslar Aşama 1’de kalabilir; geçiş zorunlu değildir.

---

# C. Kanıt zinciri

Mühürlü derste kanıt zinciri §F.1 dört adımlı doygunluk akışıdır. Compact makalede aynı pedagoji sırası gövdede durur; süre bandı makaleyi kesmez.

1. Isınma / iş problemi.
2. Birinci senaryo / temel yöntem.
3. İkinci senaryo / istisna veya kritik durum.
4. Özet ve saha görevi.
5. Kurs sonu sınav: baraj **70**, **sunucu puan**. Sertifika satın alınmaz.

---

# D. Aşama 2 ve Aşama 3 — geçiş disiplini

Geçmiş felaket (UI + TTS + DOM’u aynı anda çözmek, hayalet `.chunks`) tekrarlanmaz. Üretim sırası **metin → konuşma metni → mühürlü ses → cue → görsel**’dir; tersine değil.

* **Aşama 2 (taslak):** Yalnız yerel/mock ses ve taslak cue. Eski chunk fiziken silinir. Vatandaş yüzeyine taslak WAV basılmaz.
* **Aşama 3 (mühür):** İnsan `--seal` / `--mode=production` onayı olmadan harici TTS veya video bake yok.

Süre/kelime bütçesi **ses mühürlü** derse aittir; compact makale gövdesini kesmez (Anayasa B4). Mühürlü üretim matematiği §F’dedir; stüdyo bake sayıları (dilim, RPM, sahne bütçesi) OPS defterindedir.

---

# E. Görsel, Ses ve Video Üretim SOP (Aşama 2 & 3)

Satın alınan Akademi ürününün *hedef* deneyimi: **tam metin + sesli anlatım + zaman senkronlu kayan yazı + görsel/şema + sinematik medya.** Gün 0 gerçeği Aşama 1 makaledir; sinema sonradan gelir. Mühürlü derste dört katman da fırınlanır (§F.2).

İzleme anında harici üretici API **çağrılmaz**. Bütün medya Aşama 3’te dondurulur; oynatıcı yalnız kamu dosyası ve cue listesini okur.

## E.1 Seslendirme

* **Model kimliği Pedagoji’de durmaz.** `VOICE_TTS` ve yedek `lib/kernel/ai/model-roles.ts` içindedir. Kadın/erkek yuva seçimi §F.3; slug ses mührü ezer.
* **Anlatım dili:** SEN aksı. Doğal, akıcı. Dolgu ve harf harf heceleme yok. Nefes, dilimler arası duraklamadır; dolgu duraksaması değildir. Süre OPS’tedir.
* **Konuşma metni ≠ makale gövdesi.** Kod çiti, tablo hamlığı ve soğuk şablon başlıkları seslendirilmez. Makale «Tam Ders Metni»nde kalır.
* **Cue ≠ ses metni.** Altyazı/cue dosyasında orijinal terimler (`F2`, `+90`, `Alt+F11`) korunur. Ses metninde fonetik okunuş (`Ef iki`, `artı doksan`, `Alt Ef on bir`) yer alır.
* **Model skip preventer:** Paragraf başındaki kısa emir/teknik cümle fırınlanmadan önce bağlaçlı akışa çevrilir. Örn. cue «F2'ye bas» kalır; ses «Şimdi F2 tuşuna basıyorsun» (fonetik: «Şimdi Ef iki tuşuna basıyorsun»).
* **Nefes kuralı:** Metin tek blokta gönderilmez; 12–15 doğal nefes bloğuna paketlenir, ders başı istek **10–12** bandındadır. Cümle geçişine duraklama konur. Cue ve timings gerçek bake süresine kilitlenir. Kota, RPM ve kapı OPS’tedir (§19).
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

## E.5 TTS üretim SOP — sıfır re-bake (EC-102, SM-103…)

Gelecek kurs fırınlaması bu üç kapıya kilitlenir. Sayılar ve CLI OPS §19’dadır; kod SSOT `lib/academy/tts-breath-chunks.ts` + `lib/academy/spoken-scripts/skip-preventer.ts`.

1. **Model skip preventer (fonetik ve cue ayrımı).** Paragraf başı kısa emir/teknik cümle bağlaçlı akışa çevrilir. Cue orijinal terimi korur; ses fonetik okur. Re-bake sebebi olan sessiz atlama kapatılır.
2. **Kota ve parçalama (request shaping).** Ders metni en fazla 12–15 doğal nefes bloğunda birleşir; ders başı istek **10–12** bandındadır. İstekler arası **6.5 saniye** RPM kalkanı zorunludur. 3–5 sn mikro dilim yasaktır.
3. **Sıfır hata checklist (bake öncesi kapı).** Metin önce `--dry-run` ile taranır. İnsan `--seal` **ve** `--confirm-gemini-spend` onayı olmadan harici API çağrısı açılmaz.

---

# F. Yapay zekâ eğitimi — üretim ve doygunluk standardı (SUPER ADMIN kilit)

Kod SSOT: `lib/academy/production-standard.ts`. Compact makale bu bantla kesilmez.

## F.1 Süre ve modül matematiği

| Ölçüt | Bant |
|-------|------|
| Toplam kurs süresi | **45–90 dakika** (yapay zekâ doygunluk süresi) |
| Ders adedi | **6–8** modül / bölüm |
| Ders başı süre | **7–12 dakika** |

## F.1.1 Ders içi doygunluk akışı (her mühürlü ders zorunlu)

Dört adım, tek eğitmen, SEN dili. Toplam hedef ~10 dk; 7–12 dk bandının içine oturur.

| Sıra | Adım | Süre | İçerik |
|------|------|------|--------|
| 1 | Isınma / İş Problemi | ~1.5 dk | Gerçek iş hayatı karşılığı, risk ve problem |
| 2 | Birinci Senaryo / Temel Yöntem | ~3.5 dk | İlk istem/kod ve çözüm |
| 3 | İkinci Senaryo / İstisna veya Kritik Durum | ~3.5 dk | Veri bozukluğu, edge-case, kritik müdahale |
| 4 | Özet & Saha Görevi | ~1.5 dk | Cebine koyacakların ve sınav öncesi mikro görev |

Eski dört perde anahtarları (`intro` / `problem` / `application` / `summary`) bu dört adıma eşlenir. Soğuk şablon başlığı vatandaşa basılmaz.

## F.2 Çoklu modalite — zengin içerik mimarisi

Tüm mühürlü eğitimler dört katmanı birlikte taşır:

1. **Tam metin** — compact makale / Tam Ders Metni.
2. **Zaman senkronlu kayan yazı (cue)** — bake timings + `currentTime`.
3. **Görsel / şema** — `lesson-visual-stage` kartları; izlemede üretici yok.
4. **Sinematik video / medya** — önceden fırınlanmış kamu dosyası.

İzleme anında harici API **yoktur.** Medya Aşama 3’te pre-bake edilir; oynatıcı statik path okur.

## F.3 Çoklu seviye ve cinsiyet bazlı ses

* **3 seviye (isteğe bağlı):** Çok teknik konularda müfredat **Temel**, **Orta** ve **İleri** olmak üzere 3 bağımsız satılabilir pakete ayrılabilir. Her SKU’ya zorunlu basamak değildir (Anayasa B4). Bu paketler Akademi içidir; `/junior` odası değildir.
* **Ses seçimi:** Eğitim konusunun tonu ve ruhuna göre fırınlama aşamasında **kadın veya erkek** TTS ses modeli seçilir (`VoiceConfig.gender` = `female` \| `male`). Model kimliği Pedagoji’de durmaz; varsayılan yuva `lib/kernel/ai/tts-voices.ts` içindedir. Slug ses mührü (`ACADEMY_INSTRUCTOR_VOICE_BY_SLUG`) seçimi ezer.
