# 01_office_ai — Tespit ve Değerlendirme Raporu

| Alan | Değer |
|------|--------|
| Tarih | 21 Eylül 2026 |
| Hedef | `https://yetkin.ai/academy/01_office_ai` |
| Kapsam | İnceleme. Kod ve müfredat metni bu turda değiştirilmedi. |
| Canlı commit | `d329eb6` (20 Eylül 2026, SEO + mühürlü ses yayını). Vitrin bu ağaçla örtüşüyor. |
| Çalışma kopyası | Commit edilmemiş vitrin sadeleştirmesi var. Ders gövdeleri canlıya çok yakın; başlık ve antre cümleleri ayrışıyor. |

İki yüzey ayrı okunur. Vatandaşın bugün gördüğü sayfa canlıdır. Ders gövdesi ödeme duvarının arkasındadır; gövde hükmü `lib/academy/curricula/office_ai/` altındaki çalışma kopyasıdır. Canlı ile çalışma kopyası arasındaki antre farkı Bölüm 0’dadır.

---

## 0. Canlı vitrin ile çalışma kopyası

21 Eylül 2026 akşamı açılan antre şunları basıyor:

- Fiyat: **₺890**, KDV dahil. Satın alma tek başına sertifika basmıyor. Baraj 70, 9 ders bitmeden sınav kapalı.
- Süre satırı: **9 ders · 83 dk**.
- Rozet: `TEMEL SEVİYE · OFF-101` ve `SESLİ ANLATIM + KARAOKE + SINAV + MÜHÜRLÜ SERTİFİKA`.
- Alt başlık: «Office AI eğitimi… Excel Gemini kullanımı…».
- 1. ders özeti: «Excel Gemini kullanımı: A1 hijyeniyle…».
- 3. ders başlığı: «Rapor Otomasyonu: Tablodan Yönetim Özetine».
- Gruplama: Modül 1 (4 ders), Modül 2 (4 ders), Modül 3 (tek ders, 7 dk).
- Hazırlık şeridi antrede görünür: «Yapay Zekâyla Tanışma», 8 dk, 9 ders sayısına girmez.
- Kardeş dört ürün bu sayfada yok; amiral tek başına duruyor. Katalogda «Çok Yakında» vaadi kodda duruyor.

Çalışma kopyası antre cümlesini «Excel’de temiz veri ve Copilot/ataş, Gmail’de yerleşik Gemini…» diye düzeltmiş, «Rapor Otomasyonu» başlığını düşürmüş, «A1 hijyeni» teaser’ını çıkarmış. Bu metin **yayında değil**.

Yayında kalan ve çalışma kopyasında da duran stüdyo kelimesi: hero rozetindeki **Karaoke** (`lib/copy/sen-voice/academy.ts`, `heroAudioBadge`). Pedagoji bu kelimeyi öğrenci yüzeyinden çıkarmayı ister; vitrin hâlâ basıyor.

---

## 1. Veri yapısı ve bağlı yüzey

MDX yok. Kurs bir içerik yönetim panelinden okunmuyor. Tek gövde TypeScript modülü; ses, zaman ve sınav JSON; vitrin fiyatı veritabanı kataloğunda.

| Katman | Yer | İş |
|--------|-----|----|
| Antre sayfası | `app/academy/[slug]/page.tsx` | Satın alma, çıktı listesi, ders iskeleti, SSS, JSON-LD |
| Oynatıcı | `app/academy/[slug]/oyna/page.tsx`, `components/academy/curriculum-player.tsx` | Mühürlü ses + sahne + karaoke şeridi |
| Müfredat gövdesi | `lib/academy/curricula/office_ai/section_*.ts`, `prep.ts` | Tam ders metni (compact makale) |
| Konuşma metni | `lib/academy/spoken-scripts/01_office_ai-*.md` | TTS’e giden cümle; makaleyle büyük ölçüde aynı |
| Sahne zamanı | `lib/academy/lesson-cues/`, `lib/academy/lesson-audio-timings/` | Cue ve karaoke saati |
| Mini sınav JSON | `lib/academy/lesson-exams/01_office_ai-*.json` | Ders içi 3 soru; kurs havuzuna gömülmez |
| Kurs sınavı | `lib/academy/exam-pools.ts` | 42 soruluk havuz; oturumda 10 soru, 30 dk, baraj 70 |
| Sıra | `lib/academy/curricula/lesson-index.ts` | Vatandaş numarası 1–9 |
| Üretim bandı | `lib/academy/production-standard.ts` | Ders 7–12 dk, kurs 45–90 dk |
| Araç eşlemesi | `lib/academy/ai-desk.ts` | Outlook→Copilot, Gmail→Gemini, Excel çift yol, Word ataş |
| Eğilim kutusu | `lib/academy/model-tendency-card.ts` | Son gözden geçirme 20 Eylül 2026 |
| Vitrin dili | `lib/copy/seo.ts`, `lib/copy/sem-keywords.ts`, `lib/academy/catalog-summaries.ts` | Arama başlığı ayrı, H1 ayrı |
| Katalog tohumu | `supabase/migrations/20260814090000_academy_course_seed.sql` | Kurs satırı, birim `course:01_office_ai` |
| Ses | `public/media/academy/audio/01_office_ai/*.mp3` | İzlemede canlı TTS yok |
| Dron | `apps/rail-is/src/screens/AcademyPlayerScreen.tsx` | Metin + punchcard. Ses ve Excel/Gmail sahnesi web’de |
| API | `/api/v1` hop: `academy-curriculum`, `academy-exam`, satın alma, kilit | Zarf `{ ok, error, requestId, apiVersion, data }` |
| Çekirdek | `@yetkin/kernel` | Para, katalog kimliği, hop. Müfredat gövdesini taşımaz |
| İleri taslak | `planned.ts` + `off-102.ts` (kart kodu `OFF-201`) | Takvim, formül/grafik, PDF. Sınav yoluna girmez |

Hazırlık şeridi (`01_office_ai-0`) sınav yoluna ve 83 dakikaya girmez. Uydu üç ders (`-10`, `-11`, `-12`) mühürsüz taslaktır.

Mühürlü ses süreleri (saniye, yuvarlanmış, `lib/academy/lesson-audio.ts`):

| Vatandaş sırası | Anahtar | Saniye | Dakika |
|-----------------|---------|--------|--------|
| 1 | `01_office_ai-1` | 663 | 11,1 |
| 2 | `01_office_ai-k1` | 669 | 11,2 |
| 3 | `01_office_ai-2` | 553 | 9,2 |
| 4 | `01_office_ai-3` | 576 | 9,6 |
| 5 | `01_office_ai-5` | 564 | 9,4 |
| 6 | `01_office_ai-4` | 494 | 8,2 |
| 7 | `01_office_ai-g1` | 450 | 7,5 |
| 8 | `01_office_ai-w1` | 608 | 10,1 |
| 9 | `01_office_ai-6` | 445 | 7,4 |
| **Toplam** | | **5022** | **83,7** |

Bandın içindedir (ders 7–12 dk, kurs 45–90 dk). Kurs tavanına 6 dakika kalmıştır. 1. ve 2. ders 11 dakikayı geçmiş, 7. ve 9. ders tabana yapışmıştır.

---

## 2. Müfredat, ders ders

Sıra `lesson-index.ts` ile kilitli. Dosya adı sıra değildir: `section_5` vatandaş 5, `section_4` vatandaş 6’dır.

### Hazırlık — Yapay Zekâyla Tanışma (`01_office_ai-0`, ~8 dk)

Sınav dersi değil. Hesap açma, ücretsiz/ücretli farkı, sohbet kutusu, ilk istem (rol, görev, biçim, kısıt), belgenin dilinde yazma. Ham kişisel veri yasağını haber verir, kuralı 2. derse bırakır. Bu şerit, 1. derse gelen kişinin «istem nedir» sorusunu karşılar. Antrede dürüstçe «9 dersin sayısını değiştirmez» yazar.

### 1 — Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo (`01_office_ai-1`, 11 dk)

İş: dağınık Excel’i A1’den düzenli tabloya çevirmek. Neden A1: model tabloyu sol üstten okur. Birleşik hücre, boş satır, tutar/tarih tek tip, F2 ile gizli kesme işareti, orijinali silmeden yan sayfada temiz kopya. Kapı: Copilot varsa şerit, yoksa ataş. Örnek tablo kimliksiz. Maskeleme 2. derse ertelenir. ChatGPT / Claude / Gemini / şirket paneli eğilimi «yatkındır» diliyle; kart Eylül 2026 damgalı, makalede güncellenebilir, ses donuktur.

### 2 — KVKK, Şirket Sırları ve Maskeleme (`01_office_ai-k1`, 11 dk)

İş: ham ad, telefon, IBAN, T.C. Kimlik No, maaş, hasta/öğrenci kaydı ve şirket sırrı sohbete gitmez. Maske silmek değildir: Ayşe Kaya → Müşteri A, IBAN → MASKELİ_IBAN. Üç sahte satır yeter. Üçüncü kapı yalnız maskeli kısa özettir. Silmek yüklemeyi geri almaz.

### 3 — Tablodan Yönetim Özetine (`01_office_ai-2`, 9 dk)

Canlı başlık hâlâ «Rapor Otomasyonu» önekini taşır. İş: temiz ve maskeli tablodan tam üç madde ve bir karar cümlesi. Sayı hücreden; uydurma yüzde yok. Grafik bu derste yok.

### 4 — Metinden Slayta (`01_office_ai-3`, 10 dk)

İş: slayt başına tek fikir, görsel yönlendirme parantezde, taslağı PowerPoint’e aktarma. Copilot varsa şerit, yoksa sunuyu ataş. VBA, Gamma, Marp ana yol değil. Şirket şablonu (renk, logo) modelde yok; onu sen kilitle.

### 5 — İstisnalar ve Hata Avı (`01_office_ai-5`, 9 dk)

İş: akıcı metin doğru aritmetik değildir. Dil modeli sonraki kelimeyi tahmin eder; hesap makinesi değildir. Somut sapma: Yıldız Tekstil’de 9.100 + 3.400 = 12.500 olmalı, tabloda 21.500 durur; şişen genel toplam 59.450, kilitli toplam 50.450. Çapraz kontrol TOPLA ile. Kaynak evrak yoksa sayı masaya çıkmaz.

### 6 — E-Posta Akışı: Gelen Kutusu Sıfırlama (`01_office_ai-4`, 8 dk)

İş: etiket (acil / aksiyon / arşivlik) → taslak → insan onayı → arşiv. Model nezaket üretir, taahhüt üretemez. Panelin nasıl açılacağı bilerek sonraki derse bırakılmış. 142 okunmamış yığın ile sıfır kutu karşılaştırması var.

### 7 — Gmail + Gemini ve Aksiyon Listesi (`01_office_ai-g1`, 8 dk)

İş: kutuyu yerinde oku. Gmail’de Gemini paneli, Outlook’ta Copilot. Çıktı tablosu: Gönderen, İş, Son tarih, Taslak notu. Kapsam son 24 saat. Kaya Gıda 54.650 TL, bugün kapat. İleti gövdesini dış sohbete yapıştırmak atlanmış kapı. Lisans yoksa rozet «canlı kutu okunmaz» der.

### 8 — Word: Sözleşme, Dilekçe, Rapor (`01_office_ai-w1`, 10 dk)

İş: dosyayı ataş ile yükle; sayfa sayfa kopyalama. Üç iş, üç istem. Sözleşmede cezai şart, fesih, gizlilik ve sayfa numarası. Dilekçede hitap, konu, gerekçe, talep, ek; unvan, tarih, sayı ve imza sende. Raporda gözlem ile karar notu ayrı. Öğretmen sana sen der; kâğıda siz yazılır. Sınav bu derste açılmaz; kapanış 9. derstir.

### 9 — Haftalık Sistem: 30 Dakika (`01_office_ai-6`, 7 dk)

İş: her Cuma 10 dk Excel + 10 dk slayt + 10 dk kutu. Takvim bloğu silinmez. Bu ders bitince sınav kapısı açılır. Baraj 70. Satın alma kart basmaz.

### Uydu taslak (OFF-201, yayında değil)

1. Takvim ve toplantı (Outlook, Teams, Meet).
2. Excel formül ve grafik (XLOOKUP, özet tablo, grafik).
3. PDF (tarama, birleştirme, karşılaştırma).

Kart kodu `OFF-201`. Dosya adı `off-102.ts` tarihîdir; `OFF-102` e-ticaret `EC-102` ile çakıştığı için üretimde kullanılmaz. Ön koşul: 9/9 + baraj 70.

### Sınav ve mühür

Kurs havuzu 42 soru. Oturum 10 soru çeker, 30 dakika, baraj 70. Puan sunucuda. Sertifika `userId · courseId · attemptId · score · issuedAt · curriculumSeal` yüküyle kilitlenir; kamu doğrulama `/academy/dogrula/[hash]`. Mühür tanımı (çalışma kopyası metni): 9 dersin izlenmesi ve baraj. Sunucu, öğrencinin Excel veya Word dosyasını kontrol etmez. Bu cümle Manifesto 1.2 ile uyumludur.

---

## 3. Anlatım dili

Gövdenin omurgası vatandaş diline yakındır. Cümleler kısa, hitap sen, neden sorusu çoğu kuralın arkasında duruyor. A1, üç sahte satır, 12.500’e karşı 21.500, Kaya Gıda tahsilatı, dilekçede siz — bunlar slogan değil, masadaki iş.

Buna rağmen fiyakalı ve jenerik katman duruyor. Sesli metin ile makale aynı cümleleri taşıdığı için karaoke de bunları okur.

**Her derste tekrar eden kalıp.** «Selamlar, ben Gözde» + «bu dersin sonunda tek başına yapacaksın» + «CEBİNE KOY» üç adım + «SIRA SENDE» + «Sınav, 9. ders bitince açılır. Baraj 70 puandır.» 1–8. derslerde kapı cümlesi iş öğretmez; 7–11 dakikanın bir dilimini yer. 9. derste yeri vardır.

**İş bitmeden övgü.** 1. ve 3. derste «Harika bir iş çıkardın» öğrenci daha masaya oturmadan gelir.

**Edebi süs.** 1. ders: «Sen kahvenden bir yudum alırken… pürüzsüz bir veri tabanına dönüşür.» 3. ders: «soğuk ter damlasını çok iyi biliyorum.» 4. ders: «kâbus gibi bir görev.» Pedagoji aforizma ve ajans cümlesini yasaklar. Bunlar o sınıfa yakındır.

**Uydurma oran.** 4. ders: «vaktimizin neredeyse yüzde seksenini tasarım detaylarına kurban ediyoruz.» Kaynak yok. Aynı ders «tasarım yükünü algoritmaya verirsin» der. Algoritma, ofis işçisinin ihtiyacı olan kelime değildir.

**Stüdyo ve ürün kelimesi dersin içinde.** Hazırlık ve 9. ders «mühür», «vize kartı», «baraj» diye konuşur. Bu kelimeler antrede bir kez yeter. Karaoke dersinin içine girince öğretmen değil, ürün konuşur. El kitabı başlığı çalışma kopyasında «kaset»ten «ses»e çekilmiş; iyi. Rozet hâlâ Karaoke diyor.

**Büyük harfle Format.** Hazırlık ve 3. ders el kitabı «rol, görev, Format, kısıt» yazar. Format istem parçasının adıdır; cümlede yabancı kuyruk gibi durur. «Biçim» yeter.

**İngilizce ve siz kaçağı.** 4. ve 5. ders el kitabında aynı blok iki kez yapışık: «Kurumsal BT ve Eklenti (Add-in / Extension)», Claude Opus, «%100 çalışan». Hitap siz. Öğretmen sen kuralını deler. Aynı bilgi antre SSS’te daha sade duruyor; ders gövdesinde kopya şişkinliktir.

**Başlık sloganı.** «Tablonu Konuştur» işi anlatmaz, afiş gibi durur. Canlıdaki «Rapor Otomasyonu» ve «A1 hijyeni» daha ağır: Excel’de Gemini diye bir yerleşik kapı öğretilmiyor (öğretilen kapı Copilot veya ataş). «Hijyen» vatandaş karşılığı olmadan basılmış. «AI DEDEKTİF» ara başlığı (5. ders) işi süsler; altındaki 12.500 hesabı zaten yeter.

**İyi duran yerler, korunsun.** 2. dersin yasak listesi ve üç satır örneği. 5. dersin tek tablosu. 7. dersin dört sütunlu aksiyon listesi ve «hiçbir taslağı gönderme». 8. dersin üç iş / üç istem ayrımı ve «öğretmen sen, belge siz». 7. dersteki lisanssız rozet (canlı kutu okunmaz) dürüst yüzeydir.

---

## 4. Güncellik, yanlış ve eksik

**Güncel olan.** Eylül 2026 eğilim kartı bugünün tarihine yakın ve «sabit karakter değildir» diyor. Copilot’un lisans istediği, masaüstü Outlook’un gelen kutusunu lisanssız okuyamadığı, Gmail’de Gemini panelinin birinci kapı olduğu 2026 ofisiyle uyumlu. Ücretsiz hesabın yavaşlayabileceği hazırlıkta söyleniyor.

**Sertleştirilmiş hukuk.** 2. ders el kitabı: lisans ve veri işleme sözleşmesi yetmez; aydınlatma, açık rıza ve VERBİS kurulmadan ham kimlik hiçbir panele girmez; KVKK yurt dışına çıkarmayı yasaklar. Davranış doğrudur: ham kimlik gitmesin. Hukuk cümlesi ofis işçisine fazla ve kısmen katı. 2024 KVKK değişikliğinden sonra yurt dışına aktarım «hiç yok» değildir; uygun güvence, standart sözleşme ve benzeri yollar vardır. VERBİS her çalışanın kuracağı sicil değildir; veri sorumlusunun işidir. Çalışma kopyasındaki SSS «bu hukuki danışmanlık değildir» diyor. Ders el kitabı hâlâ danışman gibi konuşuyor. Maske refleksi kalsın; sicil anlatımı kısalsın.

**Tüketici sohbetin silme seçenekleri yok.** «Silmek geri almaz» doğru bir ihtiyat. Geçici sohbet ve eğitilmeme anahtarı hiç yok. Yokluğu, «hiçbir ayar ham kimliği temizlemez» iddiasını eksik bırakır. İddiayı büyütmek yerine «ayar olsa bile ham listeyi yükleme» demek yeter.

**Eksik olan ofis işleri, çekirdeğin sözünü tuttuğu işler değil.** Grafik, özet tablo, XLOOKUP, PDF, toplantı notu ve takvim taslakta ve «yakında» diye işaretli. 3. ders grafiği açıkça erteliyor. Bu dürüst. Çekirdeğin sözü şudur: dağınık tablo, maske, üç maddelik özet, tek fikirli slayt, uydurma sayıyı yakalama, kutu ritüeli, yerleşik posta paneli, uzun Word. Bu söz büyük ölçüde tutulmuş.

**Eksik olan pratik nesne.** Saha görevi «kendi dosyanı aç» der. Dağınık tablosu olmayan kişi 1. dersi bitiremez. İndirilebilir, kimliksiz örnek kitap (düzensiz sayfa + üç sahte satır) müfredatta yok. Sahne simülasyonu izletir; öğrencinin elinde dosya bırakmaz.

**Sayı ailesi dağınık.** 5. ders 50.450 / 59.450 öğretir. 7. ders ve slayt klibi 54.650 TL tahsilat ve «%15 açık vade» kullanır. İkisi ayrı vaka olabilir; anlatım bunu bağ kurmadan geçiyor. Öğrenci tek şirketin tek tablosu sanırsa %15’i 5. derste kilitlediği toplamla çarpıştırır.

**Mühür, dosya doğrulamaz.** Manifesto bunu dürüstçe yazmış. Vitrin «Ofis Verimliliği» sertifikası vaat ediyor. Kart, izleme artı çoktan seçmeli barajdır. İşveren bunu «Excel’i açıp yaptı» sanabilir. Antredeki kısa mühür cümlesi (çalışma kopyası) bu boşluğu kapatmaya başlamış; canlı sayfa hâlâ «sertifika ve yetkinlik» der, dosya kontrolünün olmadığını hero’da söylemez. SSS çalışma kopyasında söyler.

---

## 5. Akış

Omurga mantıklı: önce tabloyu okunur yap, sonra kimliği koru, sonra özet, slayt, sayı kilidi, kutu, yerleşik panel, uzun belge, haftalık tekrar.

Kopukluklar:

1. **Slayt, sayı kilidinden önce.** 4. ders slayt üretir, kapanışta «sayıyı kilitlemeden yayınlama» der, kilidi 5. derse bırakır. Yönetici slayttaki toplamı karar sanır; bu risk slayt dersinin içinde 60 saniyelik bir kilit olmalı, sonraki dersin konusu olarak ertelenmemeli. 5. dersin derinliği (12.500 hesabı) yerinde kalsın.

2. **6. ders paneli bilerek gizler.** «Yerleşik paneli ezberleme» 8 dakika sürer. Pedagoji «garsonu göster» der: kulakta işlem, gözde aynı işlem. Ritüel dersi gözde kapıyı saklayarak 7. dersi haklı çıkarır. İki posta dersi vatandaşa tekrar gibi gelir. Ritüel (etiket, taslak, onay, arşiv) 7. dersin ilk iki dakikasına inerse 6. dersin ayrı kaseti boşalır.

3. **1. ders ataşı, 2. ders maskeyi öğretir.** Erken uyarı var («gerçek müşteri satırını henüz yükleme»). Yine de ilk kazanılan refleks yüklemektir. Sıra bilinçli ve Pedagoji D ile uyumlu. Risk, uyarıyı atlayan kişidedir. Hazırlık şeridi yasağı haber verir; sınav yoluna girmediği için atlanabilir.

4. **9. ders «dokuz alışkanlık» der, takvimde üç blok vardır.** Word, hata avı ve maske Cuma penceresinin süresine yazılmamış; maske bir cümlelik hatırlatmadır. Kapanış, 10+10+10’u tekrar eder. Fark sahnesi kısa ve önceki paragrafların kopyasıdır. En kısa ders (7,4 dk) en çok iddia eden derstir. Bant tabanı doldurulmuş, iş bitmemiş.

5. **Modül rafları iş değil, dörtlü paket.** Canlıda Modül 3 tek ders. Çalışma kopyasındaki isimli gruplar (Tablo ve güvenlik, Karar ve slayt, Kutu ve belge, Haftalık sistem) daha doğru; yayında değil. Grup adı müfredatı iyileştirmez, antreyi iyileştirir.

6. **Teknik anahtar vatandaşa kapalı, iyi.** `k1`, `g1`, `w1` antrede Ders 2, 7, 8 diye duruyor. Bu kilit tutulmuş.

---

## 6. Doküman uyumu

Çelişkide Anayasa A katmanı bağlayıcıdır. Bu eğitim A katmanını delmiyor.

| Madde | Hüküm | Eğitimde karşılığı |
|-------|--------|-------------------|
| A1 | Fiyat kodda sabit değil, katalogda | Antre ₺890; tutar minor birim sözleşmesine bağlı. Ders metnine fiyat gömülü değil. |
| A2 | Akademi tahsilatı lisanslı üye işyeri | Antre PayTR + 3D Secure diyor. Çekim rotası yok. |
| A4 | Mühür satın alınamaz, baraj, sunucu puanı | 9 ders + 10 soru / 70. Hero bunu tekrarlıyor. |
| A5 | Sahte yeşil yok | Kardeş SKU «hazırlanıyor». Lisanssız Outlook rozeti yalan yazmıyor. Mühür dosya kontrolü iddiası çalışma kopyasında düşmüş. |
| B1 | Önce v1 hop, dron zarfı | Satın alma, müfredat, sınav hop’ta. |
| B2 | Faz 1: Panel, Akademi, Kariyer | Amiral Akademi’de. 18 yaş altı ürün yok. |
| B4 | Süre bandı müfredatı budayamaz | Cümle 21 Eylül 2026 reformuyla Anayasa’ya girmiş. Kod bandı duruyor. Aşağıda tezat. |
| Manifesto 1.3 | Birincil kitle ofis işçisi | Hedef kitle listesi bunu yazıyor. SEO başlığı hâlâ «Ofiste ChatGPT» — arama niyeti, öğretim sırası değil. Öğretim sırası Copilot/ataş ve Gmail Gemini. Başlık ile ders çatışır. |
| Manifesto 1.2 | Mühür izleme + testtir, canlı dosya doğrulamaz | Çalışma kopyası SSS’i bunu söyler. Canlı hero söylemez. |
| Pedagoji A | Neden zinciri, sen dili, slogan yasağı, stüdyo kelimesi yasağı | Neden zinciri güçlü. Slogan ve Karaoke rozeti zayıf. |
| Pedagoji B | 4 vuruş, fırın bake, izlemede üretici API yok | Ders iskeleti 4 vuruşa oturmuş. Ses mühürlü MP3. |
| Pedagoji D | Üç kapı, amiral yayında, kardeşler yakında | Kapı sırası derslerde tutarlı. |
| Pedagoji E | Soyut AI masası yok, 16:9, spoiler yasağı | Web sahnesi Excel, Gmail, PowerPoint, Word masası. Dron bu masayı taşımaz. |

### Dokümanlar eğitimi kısıtlıyor mu?

A katmanı kısıtlamasın. Mührün satılamaması, puanın sunucuda olması, sahte onayın yasak olması amiral eğitimin güvenidir. Esnetilmez.

B katmanı ve Pedagoji, sesi ve süreyi kısıtlıyor. Kısıtın bir kısmı eğitimi ayakta tutuyor: sen dili, neden sorusu, gerçek kapı, lisans yoksa dürüst rozet, slogan yasağı. Bu kurallar gevşetilirse eğitim ajans metnine döner.

Kısıtın diğer kısmı doldurma üretiyor:

- Her derse aynı kapanış (sınav kapısı, baraj, harika iş) 7–12 dk bandını yer. 6. ve 9. dersler bu yüzden ince.
- «Punchcard en fazla üç kelime» ile «karaoke altyazısı tam cümle» aynı belgede yan yana. Uygulama altyazıyı 36 kelimeye kadar açıyor (`ACADEMY_KARAOKE_CAPTION_MAX_WORDS`). Belge, sahneyi hem boş hem yazılı istiyor. Montajcı ikisini birden tatmin edemez.
- Üç Kapı D, E.2, E.8, E.9 ve E.10’da beş kez yazılmış. Ders de her kapıyı her derste yeniden anlatıyor. İlke bir yerde durup derslerde davranışa insin.
- «9 ders kota değildir» (Pedagoji D.1) ile `ACADEMY_AI_COURSE_DURATION_MAX_MINUTES = 90` ve `LESSON_COUNT_MAX = 12` aynı anda duruyor. Grafik, PDF ve toplantı çekirdeğe değil uyduya konmuş. Gerekçe konunun hakkı olabilir; sonuç, bandın müfredatı böldüğüdür. 21 Eylül cümlesi («süre bandı müfredatı budayamaz») kod sabitini henüz değiştirmemiş.

### Belgede güncellenmesi gereken tezat

1. **B4 cümlesi ile `production-standard.ts` tavanı.** Ya band üretim konforudur ve testi kırmaz, ya da tavandır ve Anayasa’daki cümle geri alınır. İkisi birden durursa bir sonraki ders ya banda sığdırmak için şişer ya da «konunun hakkı» diye banda sığmaz. Öneri: tavan testi gece raporuna insin; derleme kapısı olmasın (Anayasa B3’ün ruhu da bu). Alt bant (dikkat ve TTS) tavsiye kalsın, dersi kesmek için kullanılmasın.

2. **Pedagoji A.2 ile vitrin rozeti.** «Karaoke, kaset, compact öğrenci yüzeyine girmez.» `heroAudioBadge` hâlâ Karaoke diyor. Belge ile kod aynı haftada reform edilmiş, rozet unutulmuş. Belgeyi esnetmek gerekmez; rozet «Sesli anlatım»a iner.

3. **Manifesto 1.3 ile SEO title.** Birincil kitle ofis işçisi. Title «Excel Yapay Zekâ Eğitimi: Ofiste ChatGPT + Sertifika». ChatGPT arama kelimesidir; öğretim birinci kapı değildir. Title kalabilir, H1 ve ilk ekran cümlesi ChatGPT ile açılmamalı. Canlı ilk ekran hâlâ «Excel Gemini» diyor; bu daha ağır bir tezat, çünkü böyle bir kapı yok.

4. **Pedagoji «stüdyo dili girmez» ile ders içi «vize kartı / mühür».** Ürün dürüstlüğü antre ve 9. ders kapanışında kalsın. 1–8. derslerden çıksın. Belgeye tek cümle yeter: mühür kelimesi antrede ve kapanış dersinde birer kez durur.

5. **Üç Kapı tekrarı.** Pedagoji kısalmalı: tanım bir maddede, araç eşlemesi `ai-desk.ts`’te. Belge beş kez aynı kapıyı yazdıkça her ders de beş kez anlatıyor.

A katmanında esnetilecek satır yok.

---

## 7. Sen olsaydın

Amiral gemi, daha çok ders değildir. Amiral gemi, ofisteki bir kişinin ilk hafta tek başına uyguladığı kısa iştir. Çekirdek konu doğru seçilmiş. Değişecek olan süs, tekrar ve iki posta dersinin ayrımıdır.

**Çıkarırdım**

- Her dersin sonundaki sınav/baraj paragrafı. Bir kez antrede, bir kez 9. derste.
- «Harika bir iş çıkardın», kahve yudumu, soğuk ter, yüzde seksen, algoritma, «Tablonu Konuştur», «Rapor Otomasyonu», «A1 hijyeni», «Excel Gemini».
- 4. ve 5. dersteki kopya eklenti bloğu. Antre SSS’te kalsın.
- 6. dersi ayrı 8 dakikalık kaset olmaktan. Ritüel, 7. dersin açılışına insin. Boşalan süreyi 5. dersin sayı kilidini 4. dersin içine taşımak ve 9. derse bir Word/hata satırı eklemek için kullanırdım.
- 9. dersteki «dokuz alışkanlık» iddiası, takvimde üç blok varken. Söylenen iş söylensin: Cuma’da tablo, slayt, kutu.

**Tutar, uzatmazdım**

- A1, maske, üç madde, tek fikir, 12.500 hesabı, aksiyon tablosu, ataşla Word, lisanssız dürüst rozet.
- Eğilim kartının makalede yaşayıp seste donması. Doğru ayrım.
- Grafik, PDF, toplantıyı OFF-201’de bırakmak. 84 dakikalık ilk pakete üçünü eklemek bandı da dikkati de aşar. «Yakında» dürüst kalsın. Çekirdek sınav yoluna sokmak için önce alıcı gerekir.

**Eklerdim**

- Kimliksiz, indirilebilir bir örnek Excel. 1. ders «kendi dosyan yoksa bunu aç» desin.
- 4. dersin içine tek cümlelik sayı kilidi: slayta yazdığın toplam, kaynak hücreyle aynı değilse slaytı bırak.
- 2. ders el kitabında hukuku kısaltmak: «Ham ad, telefon, IBAN, kimlik, maaş gitmez. Ayrıntı şirketinin kuralı ve hukukçunun işidir. Bu ders danışmanlık değildir.»
- 5. ve 7. dersin sayılarını tek vakada birleştirmek ya da «bu başka bir günün tahsilatı» diye ayırmak.
- Hazırlık şeridini satın almadan da dinletmek. İstemin ne olduğu duvarın önünde kalsın. Gövde duvarda kalsın.

**Dokunmazdım**

- Baraj 70, sunucu puanı, satın almanın mühür basmaması, kardeş ürünlerde hayali oynatıcı olmaması.
- Gözde sesi, sen hitabı, belge siz.
- Web’deki 16:9 masa (Excel, Gmail, slayt, Word).

---

## 8. Platform kurgusu bu sunum için doğru mu?

Paylaşılmış çekirdek ve API-önce omurga, **satın alma, ilerleme, sınav ve mühür** için doğru kurulmuş. Dron bu dördünü `/api/v1` üzerinden alabiliyor. Excel sahnesini, Gmail panelini ve mühürlü sesi drona taşımak bu eğitimi iyileştirmez. Pedagoji 16:9 tuval ve «ekranı ezme» der. Dikey istemci bu sinemayı küçültür. Manifesto da bunu yazmış: dron bağlıdır, web ile aynı oynatıcı değildir; sınav ve mühür tamdır, Excel/Gmail simülasyonu web’dedir.

Dron ekranı bunu dürüstçe söylüyor: «Ders metni burada okunur. Native TTS hop’u yoktur; ses web karaoke’dedir.» Cümle doğru, kelime (karaoke, hop) vatandaş dili değil.

İki mimari kusur var:

1. **İçerik dron ikiliğine gömülü.** `apps/rail-is/src/ui/academy-punchcards.ts` cue ve zaman JSON’unu derleme anında `lib/academy/` altından içeri alır. Web müfredatı kodda güncellenip dron derlemesi yenilenmezse rozetler ayrışır. Tek kaynak API yanıtı olmalı; ikili kopya olmamalı. Çekirdek paketin müfredat taşıması gerekmez. Hop’un ders gövdesini ve rozetleri vermesi gerekir.

2. **«İzlendi» iddiası ile tamamlama düğmesi.** Mühür, derslerin izlendiğini söyler. Dron tamamlama düğmesi ses saati olmadan dersi kapatabilir. Web’de saat var. Aynı mühür iki istemcide aynı izleme kanıtına dayanmıyorsa A5 zayıflar. Dron ya sesi açar ya da «bu ders web’de dinlenir, burada yalnız sınav» diye kapıyı ayrı yazar. Şimdiki metin ipucu veriyor, düğme yine de tamamlatıyor.

Sonuç: kurgu, amiral sinema web’de kalacaksa doğrudur. Kurgu, «dron da aynı dersi öğretir» iddiasına çekilirse yanlıştır. İddia ikincisi olmasın.

---

## 9. Sonraki adım

Sıradaki tur fırın değildir. Sıradaki tur metin ve vitrin temizliğidir. Yeniden ses, yalnız cümlesi değişen dersler için, metin oturduktan sonra.

1. Canlı antreyi çalışma kopyasındaki sade cümleyle yayınla: Excel Gemini, A1 hijyeni, Rapor Otomasyonu, Office AI düşsün. Hero rozetinden Karaoke düşsün. Bu, ders gövdesinden bağımsız ve vatandaşın bugün gördüğü yüzdür.
2. Konuşma metninden Bölüm 7’deki süs ve tekrar çıksın. 6. ders 7. derse katılsın mı, ayrı kısa köprü mü kalsın, bu turda karar verilsin. Karar verilmeden ses yeniden kaydedilmesin.
3. 2. ders el kitabındaki VERBİS paragrafı kısalsın. Maske örneği aynı kalsın.
4. Kimliksiz örnek dosya kararı verilsin (ekle veya «dosyan yoksa sahneyi izle, kendi dosyan olunca uygula» diye görevi dürüstleştir).
5. Dron tamamla düğmesi, web’de dinlenmemiş dersi mühür yoluna yazmasın. Ayrı iş; müfredat metninden sonra.
6. OFF-201, grafik ve PDF bu turda açılmasın.

A katmanına, fiyat modeline ve sınav barajına dokunulmaz.
