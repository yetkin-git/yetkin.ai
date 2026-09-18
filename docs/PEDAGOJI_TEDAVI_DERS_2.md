# PEDAGOJİ TEDAVİSİ — Ders 2 (KVKK & Maskeleme)

| Alan | Değer |
|------|--------|
| Tarih | 17 Eylül 2026 |
| Ders | `01_office_ai-k1` — Kişisel Veriler ve Maskeleme (2. ders) |
| Hazırlayan | Cursor Ajanı (Grok) |
| Uygulayıcı | Super Admin |
| Onay | CEO — anlatım dili reformu |
| İlke | Slogan yok. **Sebep → Eylem → Sonuç.** Gözde sahadan konuşur. |

---

## Yönetici özeti

Ders 2 brifing tebliği gibi duruyordu: kural söyleniyor, **neden** anlatılmıyordu. Öğrenci videoyu durdurup sloganı çözmek zorunda kalıyordu.

Tedavi: konuşma metni, compact makale ve cue JSON, Gözde’nin saha diliyle yeniden yazıldı. Üç satır örneği artık özlü söz değil; bin kişilik gerçek listenin neden gerekmediğinin nedensel anlatımı.

**Kod SSOT (bu sprint):**

- `lib/academy/spoken-scripts/01_office_ai-k1.md`
- `lib/academy/curricula/office_ai/section_k1.ts` (1248 kelime)
- `lib/academy/lesson-cues/01_office_ai-k1.json`

**Kalan kapı:** mühürlü MP3 + `lib/academy/lesson-audio-timings/01_office_ai-k1.json` hâlâ eski slogan kasetini taşır. Canlı karaoke `--dry-run` → insan onayı → `--seal` bekler. Timings/MP3 uydurulmadı.

**Doğrulama:** `npx vitest run tests/academy/office-ai-lesson-k1.test.ts` — 4/4 yeşil.

---

## Eski Metin (Slogan) ↔ Yeni Metin (Vatandaş Dili)

| # | Punchcard | Eski Metin (Slogan / Brifing) | Yeni Metin (Vatandaş Dili — sebep → eylem → sonuç) |
|---|-----------|-------------------------------|-----------------------------------------------------|
| 1 | GİRİŞ KÖPRÜSÜ | «Temiz tablo, yüklenir tablo demek değildir.» | «O tabloyu temizlemiş olman, onu yapay zekâya yükleyebileceğin anlamına gelmez. Neden? Çünkü hücreler düzgün dizilmiş olsa bile satırların içinde hâlâ gerçek insanların adı, telefonu, IBAN’ı ve maaşı duruyor olabilir.» |
| 2 | HOŞ GELDİN | «Bugün kural nettir. Yapay zekâya her dosya gitmez.» | «Bugün birlikte şu soruyu çözeceğiz: yapay zekâya her dosya neden gitmez? Çünkü sohbet kutusuna yazdığın metin, o ekranı kapatınca yok olmaz.» |
| 3 | HOŞ GELDİN | «Kişisel veri, şirket sırrı ve açık kimlik sohbetin işi değildir.» | Aynı sınır durur; ardından kazanç eklenir: «maskelemek zorunludur; böylece hem işini yaptırırsın hem de insanı açıkta bırakmazsın.» |
| 4 | HOŞ GELDİN | «Sohbet kutusu arşiv değildir. Silmek, yüklemiş olmanı geri almaz.» | «Saha tuzağı şudur: model hızlı cevap versin diye ham tabloyu atarsın. Peki neden bu refleks tehlikelidir? Çünkü sohbet kutusu senin arşivin değildir. Sil düğmesine basmak, o satırları bir kez yüklemiş olmanı geri almaz; model o kimlikleri görmüştür.» |
| 5 | YASAK LİSTE | «Yüklenmez listesi nettir. … ham hali gitmez.» | «Neden bir liste tutuyoruz? Çünkü ofiste her dosya aynı sınıfta değildir; bazı satırlar bir insanın kimliğini tek bakışta ele verir.» Kapı «yalnız aktarım yoludur; içeri giren ham satır hâlâ ham satırdır. Bu yüzden ham hali gitmez.» |
| 6 | YASAK LİSTE | «Şirket sırrı kişisel veri değildir ama aynı güvenlik sınıfından geçmez. … Kişiye bağlı satır gitmez.» | Sırın kişisel veri olmadığı söylenir, **neden aynı sınıftan geçmediği** açılır: rakipten ve piyasadan sakladığın bilgidir. Kamu cümlesi kişi adı yoksa durur; gerçek listede önce maskele — «hem kamu bilgisini kullanırsın hem de gerçek insanı sohbetin dışına alırsın.» |
| 7 | MASKELE | «Maskelemek silmek değildir. … Silmek yetmez. Değiştirmek zorunludur.» | «Peki neden silmek yetmez? Çünkü satırı tamamen silersen yapay zekâ tablonun mantığını da kaybeder. … Silmek yetmez, çünkü silinen satır mantığı da götürür. Değiştirmek zorunludur, çünkü takma değer hem korur hem öğretir.» |
| 8 | MASKELE | «Görüldüğü gibi günlük dil, net sınır.» | «Gördüğün gibi komut günlük dille yazılıyor; sınır da komutun içinde duruyor: ad yok, telefon yok.» |
| 9 | MASKELE | **«Üç satır yeter. Otuz satırlık müşteri dökümü üçüncü kapı değildir. Bu örnek ezber slogan değil, masada tekrarlanan eldir.»** | **«Peki neden üç satır yeter de otuz satırlık müşteri dökümü yetmez? Yapay zekâya tablonun mantığını kavratmak için bin kişilik müşteri listesinin tamamını yüklemene gerek yok. Sadece sütun başlıklarını ve mantığı gösterecek üç tane örnek, sahte satır yüklersen, yapay zekâ mantığı anlar. Böylece hem bin kişinin gerçek ad, soyad ve IBAN verisini riske atmamış olursun, hem de aynı özeti alırsın. Otuz satırlık müşteri dökümü üçüncü kapı değildir; çünkü fazla gerçek satır modeli daha zeki yapmaz, yalnızca daha fazla insanı açıkta bırakır.»** |
| 10 | MASKELE | «İkisi ayrı reflekstir. Temiz tablo, yüklenir tablo demek değildir.» | F2 hijyeni ile maske ayrılır: «biri tablonun okunmasını düzeltir, diğeri insanın sohbete girmesini engeller. … Hijyen, yükleme izni değildir.» |
| 11 | ÜÇÜNCÜ KAPI | «Üç Kapı kuralı durur. … Atlanmış kapıdır.» | «Bu kural güvenlik sınıfı değildir; veriyi yapay zekâya nasıl vereceğini sıralar. … Neden? Çünkü kapı yalnızca yoldur; içeri giren satır hâlâ aynı satırdır. … Bunlar atlanmış kapıdır: birinci ve ikinci kapıyı denemeden, maske de koymadan ham kimliği dışarı taşımaktır.» |
| 12 | ÜÇÜNCÜ KAPI | **«Birinci ve ikinci kapı duruyorsa üçüncü kapıyı açma. Durmuyorsa üç satır yeter. Otuz satırlık müşteri dökümü yetmez.»** | **«Peki birinci ve ikinci kapı duruyorsa neden üçüncü kapıyı açmayalım? Çünkü şirketinin kendi şeridi veya ataş yolu varken, ham listeyi dış sohbete taşımana gerek yoktur. Durmuyorsa, yani lisans yoksa ve ataş da uygun değilse, o zaman üçüncü kapıyı açarsın; ama yine bütün listeyi değil. … üç satır yeter: sütun başlıkları ve üç örnek, sahte satır. Otuz satırlık müşteri dökümü yetmez, çünkü model fazladan yirmi yedi gerçek isimle daha iyi özet yazmaz; sen ise yirmi yedi kişiyi daha riske atmış olursun.»** |
| 13 | FARK ORTADA | «Sol taraf hızlı görünür, şirketi ve insanı açıkta bırakır. Sağ taraf yavaş görünür, kapıyı doğru kullanır.» | Hız/yavaşlık **neden** ile bağlanır: kopyala-yapıştır bir saniye sürer ama kimliği açıkta bırakır; sağ taraf yavaş görünür çünkü önce takma değer yazarsın. «Peki neden sağ tarafı seçiyoruz? Çünkü kapıyı doğru kullanırsın ve aynı özeti, kimliği ifşa etmeden alırsın.» |
| 14 | FARK ORTADA | «Fark araç değildir. Fark, neyin içeri girdiğidir. … Model değişmez; senin listen değişir. … Yanlış yapıştırma, sohbet kutusunu arşiv sanmaktır.» | «Fark, hangi aracı açtığında değil, o araca neyin girdiğindedir. … Hangi sohbeti kullanırsan kullan, içeri giren ham ad hâlâ ham addır. Listen değişir; modelin adı değişmez. Yanlış yapıştırma şudur: sohbet kutusunu kendi arşivin sanırsın. Sil düğmesi, yüklemiş olmanı geri almaz.» |
| 15 | CEBİNE KOY | Üç kural emir cümlesi (neden yok). | Her adımın arkasına sebep: (1) bir kez giren satır silmekle geri gelmez. (2) model sütun mantığını görür, gerçek kimliği görmez. (3) ekran görüntüsü, maske koymadan ham tabloyu dışarı taşır. |
| 16 | SIRA SENDE | «Kendi gözünle maskenin hızını gör.» | «üç sahte satırın, bin gerçek satır kadar iş gördüğünü masada fark edeceksin.» |
| 17 | SIRA SENDE | «Ham veriyi sohbete bırakmak öğretilen yol değildir. … Baraj yetmiştir ama kapı kapanış dersinden sonra açılır.» | «öğrettiğimiz yol önce maske, sonra sorudur. … yarınki raporda gerçek isim aramazsın, özeti istersin. Sınav henüz kapalıdır; bu derste alışkanlığı oturtman yeterli. Sertifika barajı kursun sonunda durur; o kapı kapanış dersinden sonra açılır.» |
| 18 | El kitabı | «Maskeli üç satır yeter. Yurt dışı model, sohbeti senin çöp kutusundan silmez.» | «Lisans, sohbet kutusuna giren satırın sınıfını değiştirmez. … maskeli üç satır yeter; bin kişilik gerçek liste gerekmez. Yurt dışı model, sohbeti senin çöp kutusundan silmez; silmek, yüklemiş olmanı geri almaz.» |
| 19 | El kitabı | «Bunlar «iç kullanım» diye sohbete girmez.» | Aynı yasak durur; neden eklenir: «İç kullanım, kişisel veriyi kamuya açmaz.» |
| 20 | El kitabı | «İkinci tuzak: bu dersi sona bırakıp önce ataş alışkanlığı kazanmak.» | Tuzak açılır: «aksi halde ataş refleksi ham kimliği de götürür.» |

---

## Anlatım enstrümanları (Gözde sahası)

Aforizma yerine şu köprüler basıldı:

- «Şimdi mantığı oturtalım.»
- «Peki neden böyle yapıyoruz? / Peki neden …?»
- «Saha tuzağı şudur…»
- «Böylece hem … hem de …» (kazanç cümlesi)

Punchcard sırası değişmedi: GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · YASAK LİSTE · MASKELE · ÜÇÜNCÜ KAPI · FARK ORTADA · CEBİNE KOY · SIRA SENDE. Konuşma metni 14 paragraf; cue JSON 8 rozet, `[1, 2, 2, 2, 2, 2, 1, 2]` paragraf haritası.

Ekran terimi **KVKK**, seste **Kavekaka** (mevcut fonetik kilit).

---

## Bilinçli olarak duran cümleler

Bunlar slogan değil, ölçülebilir kural veya istemdir; tedavi onları açıklayarak korudu:

- İstem: `Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge…`
- Takma değerler: `Müşteri A`, `MASKELİ_IBAN`, `MASKELİ_TELEFON`, `MASKELİ_MAAŞ`
- «Birinci kapı yerleşik paneldir»
- «Sınav bu derste açılmaz» / «Sıradaki kapı rapordur»

---

## Test

```
npx vitest run tests/academy/office-ai-lesson-k1.test.ts
```

4/4 geçti. Yan testler (word-count-sync, tts-breath-chunks, sealed-duration-band) de yeşil.
