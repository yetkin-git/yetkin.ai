# MEB Müfredat ve İçerik Ayrımı Raporu

| Alan | Değer |
|---|---|
| Tarih | 9 Ekim 2026 |
| Muhatap | SUPER_ADMIN |
| Karar | Her hafta bir konu zorunlu değildir. Tamlık ölçütü MEB yıllık planı ve öğrenme çıktısıdır. Bir çıktı birkaç hafta sürebilir. Çıktılar kapandıysa yıl tamamdır |
| Kapsam | `jr_06_mat`, `jr_06_fen`, `jr_06_turkce`, `jr_06_ing_main`, `jr_06_sosyal` — 105 konu (25 + 20 + 20 + 20 + 20) |
| Mod | Analiz ve mimari plan. İçerik silinmedi. Şema, katalog ve `lib/junior/week.ts` değiştirilmedi |
| Program | 2026-2027 ders yılında 6. sınıf Türkiye Yüzyılı Maarif Modeli programındadır. Kaynak: [tymm.meb.gov.tr taslak çerçeve planları](https://tymm.meb.gov.tr/taslak-cerceve-planlari) |

**Kanıt etiketleri:** `[KOD]` depodaki dosya. `[MEB]` resmi program veya resmi yıllık plan. `[ANALİZ]` başlık ve örnek gövde üzerinden kurulan eşleşme; senaryoda kazanım kodu alanı yoktur. `[DOĞRULANMADI]` bu turda satır satır okunmayan gövde veya indirilmeyen çerçeve plan saati.

---

## 0. SUPER_ADMIN notu

105 konu, dizi sırasıyla okul haftasına kilitlenmiş bir 2018 konu listesidir. 2026-2027 6. sınıfının yürürlükteki programı bu liste değildir. Maarif modelinde ünite adı temadır, kazanımın adı öğrenme çıktısıdır, süre ders saatidir.

Bugün (9 Ekim 2026) okul haftası 4'tür. Açılış `lib/junior/week.ts` içinde 14 Eylül 2026 Pazartesi olarak yazılıdır. `juniorThisWeekLessonIndex` her derste 4. dosyayı «bu hafta» yapar: doğal sayı problemleri, sindirim sistemi, söz sanatları, rica ve some/any, hak-sorumluluk. Bu beş başlık, o haftanın MEB çıktısı olduğu için seçilmemiştir. İndeks 3'e denk geldikleri için seçilmiştir. `[KOD]`

Hiçbir Maarif çıktısı, süreç bileşenleri (deney, model, müzakere, öz yansıtma) bakımından tamam sayılmadı. Aşağıdaki «Çekirdek» yalnız kavram cümlesinin mevcut konuda durduğunu söyler. Yıl, çekirdek cümle birikince değil, çıktı kodu planlanan saatiyle kapandığında biter.

Bu turda önerilen yazarlık: **50 yeni konu kabı**. Tavan, eksik çıktı başına bir konu sayılırsa **59**. İkisi de hafta sayısı değildir. 105 dosya yerinde durur. 2018'de kalıp 6. sınıf Maarif listesinde olmayan konular kapsama yazılmaz; silinmez, `legacy-2018` bandına etiketlenir.

---

## 1. Kodun bugünkü zaman modeli

`JuniorLessonScenario` (`lib/junior/scenario.ts`) alanları: `key`, `title`, `teaser`, `welcome`, `concept`, `example`, `warning`, `hint`, `life`, `recap`, `conceptSeal`, `voiceSeal`, `echoPrompt`, `outcomes`, `scene`, `parentNote`. `outcomes` çocuğa söylenen üç-dört cümledir. MEB kodu, tema, ders saati ve hafta aralığı yoktur. `[KOD]`

Katalog her dersin `index.ts` dizisini okur (`JUNIOR_MAT_LESSONS` ve kardeşleri). Raf kartında `thisWeek`, hafta numarasını konu sayısına sıkıştırır:

```40:45:lib/junior/week.ts
export function juniorThisWeekLessonIndex(lessonCount: number, now = new Date()): number | null {
  const week = juniorSchoolWeek(now);
  if (week === null || lessonCount <= 0) {
    return null;
  }
  return Math.min(week - 1, lessonCount - 1);
}
```

Dizi bitince rozet son konuda kalır. Ara tatil, sınav haftası ve okul temelli planlama haftası yoktur. Matematikte 25 konu, fende 20 konu, aynı pazartesi açılışından farklı «bu hafta» üretmez; üretir ama MEB saatine göre değil, dosya sayısına göre. `[KOD]`

Quiz kardeş ağaçtadır: `lib/junior/quiz/{ders}/N.ts`, `lessonKey` ile senaryoya bağlıdır. Ses anahtarı ve mühür aynı `key` değerini okur (`lib/junior/production-seal.ts`). İçerik taşınırken bu üçü birlikte gider.

---

## 2. Eşleme kuralı

| Durum | Anlamı |
|---|---|
| Çekirdek | Çıktının kavramı bir konuda duruyor. Süreç bileşenleri tamam sayılmaz |
| Kısmi | Komşu kavram var. Çıktının işlem kümesi, araştırma döngüsü veya tema çerçevesi eksik |
| Eksik | 105 konuda bu çıktının kavramı yok |
| 2018 kalıntısı | Konu duruyor. 2026-2027 6. sınıf çıktı listesinde karşılığı yok. Kapsama yazılmaz |

Resmi fen metni Eylül 2026 programındadır (`fen-bilimleri-dersi_20260902`, kapak: Türkiye Yüzyılı Maarif Modeli 2026). Kodlar düzdür: `FB.6.1.1`. İkincil ders sitelerindeki `FB.6.1.1.1` biçimi 2024 katmanıdır. Bu rapor 2026 düz kodunu kullanır. `[MEB]`

Kuvvet ünitesinde süre tablosu 3 çıktı sayar. Metin dökümünde başlık olarak `FB.6.2.1` durur; `FB.6.2.3` öğretim yaşantısı notu olarak geçer. `FB.6.2.2` başlık satırı bu dökümde ayrı düşmedi. Ünite çerçevesi bileşke kuvvet, sürat-hız ve alınan yol-yer değiştirmedir. `[MEB]` `[DOĞRULANMADI]` 2.2'nin tam fiil cümlesi.

---

## 3. Matematik — `jr_06_mat` (25 konu, 24 çıktı)

Kaynak: [Ortaokul Matematik 6. sınıf](https://tymm.meb.gov.tr/ogretim-programlari/ortaokul-matematik-dersi/7) tema listesi ve öğrenme çıktısı metni (MAT.6.1.1–MAT.6.6.1). Okul yıllık planı haftalık 5 saat ve 38 haftalık çerçeve kullanır; `MAT.6.1.1` 5 saat, `MAT.6.1.2` 5 saat, `MAT.6.1.3` 2 saat, `MAT.6.1.4` 3 saattir. `[MEB]`

| Kod | Çıktı | Durum | Mevcut konu |
|---|---|---|---|
| MAT.6.1.1 | Çarpan ve kat | Kısmi | `jr_06_mat-5` |
| MAT.6.1.2 | 2, 3, 4, 5, 6, 9 ve 10 ile bölünebilme | Kısmi | `jr_06_mat-5` (gövde örneği 2, 3, 5, 10) |
| MAT.6.1.3 | Asal sayı ve asal çarpan | Çekirdek | `jr_06_mat-6` |
| MAT.6.1.4 | Ortak kat ve ortak bölen | Çekirdek | `jr_06_mat-7` |
| MAT.6.1.5 | Ondalık gösterimin basamak değeri | Çekirdek | `jr_06_mat-14` |
| MAT.6.1.6 | Kesir ile bölme, sonlu ve devirli ondalık | Eksik | — |
| MAT.6.1.7 | Standart uzunluk ölçü birimleri | Eksik | `jr_06_mat-25` sıvı ölçer |
| MAT.6.1.8 | Kesir, ondalık ve yüzde ile dört işlem | Kısmi | `jr_06_mat-11`, `12`, `13`, `15`. Yüzde yok |
| MAT.6.2.1 | Bilinmeyen nicelik ve cebirsel ifade | Kısmi | `jr_06_mat-17` |
| MAT.6.2.2 | Sayı ve şekil örüntüsü | Eksik | — |
| MAT.6.2.3 | Cebirsel ifadede algoritma | Eksik | — |
| MAT.6.3.1 | İki paralel doğru ve bir kesenin açıları | Eksik | `jr_06_mat-20` komşu, tümler, bütünler, ters açıdır |
| MAT.6.3.2 | İki kesenin oluşturduğu dörtgenler | Eksik | — |
| MAT.6.3.3 | Köşegenleri birbirini ortalayan dörtgenler | Eksik | — |
| MAT.6.3.4 | Üçgen ve dörtgenlerin açı problemleri | Eksik | — |
| MAT.6.4.1 | Uzunluk ve alan ölçü birimleri | Çekirdek | `jr_06_mat-22` |
| MAT.6.4.2 | Paralelkenar ve üçgenin alan bağıntısı | Çekirdek | `jr_06_mat-21` |
| MAT.6.4.3 | Alanla modellenen gerçek yaşam problemi | Kısmi | `jr_06_mat-21`, `jr_06_mat-22` |
| MAT.6.4.4 | Çember uzunluğu ile çap | Eksik | `jr_06_mat-23` merkez, yarıçap ve çapı anlatır. Çevre bağıntısı yoktur |
| MAT.6.4.5 | Çember uzunluğu problemleri | Eksik | — |
| MAT.6.4.6 | Merkez açı ve gördüğü yay | Eksik | — |
| MAT.6.5.1 | Kategorik veya kesikli veriyle araştırma | Kısmi | `jr_06_mat-18`, `jr_06_mat-19` |
| MAT.6.5.2 | Başkasının istatistiksel yorumunu tartışma | Eksik | — |
| MAT.6.6.1 | Gözleme dayalı olasılık | Eksik | — |

Özet: Çekirdek 5, kısmi 6, eksik 13. Süreç bileşeni tamam olan çıktı 0.

2018 kalıntısı, kapsama yazılmayan 12 konu: üslü ifade (`mat-1`), işlem önceliği (`mat-2`), ortak çarpan ve dağılma (`mat-3`), doğal sayı problemleri (`mat-4`), kümeler (`mat-8`), tam sayılar ve mutlak değer (`mat-9`), kesir karşılaştırma (`mat-10`), oran (`mat-16`), komşu-tümler-bütünler-ters açı (`mat-20`), çember sözlüğü (`mat-23`), prizma ve hacim (`mat-24`), sıvı ölçme (`mat-25`).

Tema saati çıktıya yayılır. `MAT.6.1.3` iki saatlik bir iştir; ayrı bir hafta zorlamaz. `MAT.6.5.1` yıllık planda birden çok haftaya bölünür. Takvim bu saat sütunundan gelir.

---

## 4. Fen bilimleri — `jr_06_fen` (20 konu, 36 çıktı)

Süre tablosu, 2026 fen programı. Ders saati 144. Okul temelli planlama 6 saattir. `[MEB]`

| Ünite | Saat | Çıktı | Durum |
|---|---:|---:|---|
| 1. Güneş sistemi ve tutulmalar | 12 | 4 | Çekirdek: `FB.6.1.1` gezegenler (`fen-1`), `FB.6.1.3` tutulma (`fen-2`). Eksik: `FB.6.1.2` ve `FB.6.1.4` bilimsel model |
| 2. Kuvvetin etkisinde hareket | 14 | 3 | Çekirdek: `FB.6.2.1` bileşke kuvvet (`fen-9`). Kısmi: sabit sürat (`fen-10`). Eksik: alınan yol ve yer değiştirme çerçevesi |
| 3. Canlılarda sistemler | 22 | 9 | Kısmi: `FB.6.3.6` sinir (`fen-16`), `FB.6.3.9` sistem sağlığına komşu (`fen-18`). Eksik: `FB.6.3.1`–`FB.6.3.5` üreme, büyüme, çimlenme, insan üreme organları; `FB.6.3.7` iç salgı; `FB.6.3.8` ergenlik |
| 4. Işığın yansıması ve renkler | 22 | 7 | Eksik: `FB.6.4.1`–`FB.6.4.7`. Yansıma, normal, ayna çeşitleri, soğurulma, beyaz ışık, renk, güneş enerjisi. Depoda ses ünitesi var (`fen-14`, `fen-15`); ışık ünitesi yok |
| 5. Maddenin ayırt edici özellikleri | 32 | 6 | Kısmi: `FB.6.5.3` yoğunluk (`fen-12`). Eksik: `FB.6.5.1` genleşme, `FB.6.5.2` erime-donma-kaynama, `FB.6.5.4` tümdengelim, `FB.6.5.5` buzun yoğunluğu, `FB.6.5.6` model. `fen-13` ısı iletimi ve yalıtımdır |
| 6. Elektriğin iletimi ve direnç | 18 | 3 | Kısmi: `FB.6.6.1` iletken-yalıtkan (`fen-19`), `FB.6.6.3` direnç (`fen-20`). Eksik: `FB.6.6.2` ampul parlaklığının değişkenleri |
| 7. Sürdürülebilir yaşam ve etkileşim | 18 | 4 | Eksik: `FB.6.7.1`–`FB.6.7.4`. Biyoçeşitlilik, tehditler, yakıt, çevre problemi |
| Okul temelli planlama | 6 | — | Takvimde boş ders haftası olarak durur. Konu indeksi ilerlemez |

Özet: Çekirdek 3, kısmi 6, eksik 27.

2018 kalıntısı: destek ve hareket (`fen-3`), sindirim (`fen-4`), dolaşım (`fen-5`), kan grupları (`fen-6`), solunum (`fen-7`), boşaltım (`fen-8`), tanecikli yapı (`fen-11`), madde ve ısı iletimi (`fen-13`), sesin yayılması (`fen-14`), sesin maddeyle etkileşimi (`fen-15`), duyu organları (`fen-17`). Bu 11 konu 36 çıktının kapanışına yazılmaz.

Ünite 3, Maarif'te destek-sindirim-dolaşım-solunum-boşaltım dizisi değildir. Üreme, büyüme ve denetleyicidir. Mevcut 20 konunun gövdesi bu yüzden saat tablosunun yüzde 15'lik canlılar ünitesini ve yüzde 15'lik ışık ünitesini boş bırakır.

---

## 5. Sosyal bilgiler — `jr_06_sosyal` (20 konu, 18 çıktı)

Altı öğrenme alanı ve çıktı kodları `tymm.meb.gov.tr` ünite sayfalarından okundu (`SB.6.1`–`SB.6.6`). Saat dağılımı ikincil derlemedir: 16 + 18 + 22 + 18 + 18 + 11 = 103. Çerçeve plan PDF'si bu turda yeniden ölçülmedi. `[MEB]` `[DOĞRULANMADI]` saat sütunu.

| Kod | Çıktı | Durum | Mevcut konu |
|---|---|---|---|
| SB.6.1.1 | Grup ve rolün zamanla değişmesi | Kısmi | `sosyal-1` |
| SB.6.1.2 | Kültürel bağ ve millî değer | Kısmi | `sosyal-1` |
| SB.6.1.3 | Toplumsal sorunu müzakere | Eksik | `sosyal-3` önyargı anlatır |
| SB.6.2.1 | Ülke, kıta ve okyanus konumu | Çekirdek | `sosyal-9` |
| SB.6.2.2 | Doğal ve beşerî çevre ilişkisi | Kısmi | `sosyal-10`, `sosyal-11` |
| SB.6.2.3 | Türk dünyasıyla kültürel iş birliği | Eksik | — |
| SB.6.3.1 | Türkistan'daki ilk Türk devletlerinin katkısı | Kısmi | `sosyal-5` |
| SB.6.3.2 | VII–XIII. yüzyıl İslam medeniyetinin ortak mirası | Eksik | `sosyal-6` doğuş ve yayılıştır |
| SB.6.3.3 | İslamiyet'in kabulüyle sosyal ve kültürel değişim | Kısmi | `sosyal-7` |
| SB.6.3.4 | XI–XIII. yüzyıl, Anadolu'nun Türkleşmesi ve İslamlaşması | Kısmi | `sosyal-7`. Malazgirt gövdesi bu turda satır satır aranmadı |
| SB.6.4.1 | Yönetimin karar alma süreci | Kısmi | `sosyal-16`, `sosyal-18` |
| SB.6.4.2 | Temel hak ve sorumluluk | Kısmi | `sosyal-4`, `sosyal-17` |
| SB.6.4.3 | Dijitalleşmenin vatandaşlık haklarına etkisi | Eksik | — |
| SB.6.5.1 | Kaynaklar ve ekonomik faaliyet | Çekirdek | `sosyal-12` |
| SB.6.5.2 | Ekonomik faaliyet ve meslek | Kısmi | `sosyal-15` |
| SB.6.5.3 | Yatırım ve pazarlama proje önerisi | Eksik | — |
| SB.6.6.1 | Ulaşım ve iletişimin kültürel etkileşimi | Kısmi | `sosyal-8`, `sosyal-20` |
| SB.6.6.2 | Telif ve patent | Eksik | — |

Özet: Çekirdek 2, kısmi 10, eksik 6.

2018 kalıntısı olarak kapsama yazılmayan başlıklar: vergiler (`sosyal-14`), komşular ve uluslararası ilişkiler (`sosyal-19`). İpek Yolu (`sosyal-8`) `SB.6.6.1` için kısmi malzeme olarak kalır. «Bilim, Teknoloji ve Toplum» adlı 2018 öğrenme alanı, Maarif'te «Teknoloji ve Sosyal Bilimler»dir ve telif-patent çıktısı yenidir.

---

## 6. Türkçe — `jr_06_turkce` (20 konu, 6 tema)

Tema sırası, 6. sınıf program indeksi: Dilimizin Zenginliği, Bağımsızlık Yolu, Farklı Dünyalar, İletişim ve Sosyal İlişkiler, Bilim ve Teknoloji, Lider Ruhlar. `[MEB]` Altıncı tema indekste kısmen görünür; 2026-2027 çerçeve plan başlığı altı temayı da sayar. `[DOĞRULANMADI]` Lider Ruhlar sayfasının saat sütunu.

Türkçe çıktısı ünite konusu değildir. Dört beceri yıl boyu temanın içinde tekrarlar: `T.D.6` dinleme/izleme, `T.O.6` okuma, `T.K.6` konuşma, `T.Y.6` yazma. Dil bilgisi ayrı bir takvim şeridi olarak 20 haftaya dizilmez. Yazım ve noktalama `T.Y.6.21` altında temanın yazma işine yapışır.

Mevcut 20 konu bu beceri uydularıdır:

| Küme | Konular | Yapıştığı beceri |
|---|---|---|
| Söz varlığı | `turkce-1` … `turkce-4`, `turkce-13` | `T.O.6.5`, `T.D.6.4`, `T.D.6.18`, `T.K.6.22` |
| Cümle ve paragraf | `turkce-5` … `turkce-12` | `T.O.6.6`, `T.O.6.8`, `T.D.6.17` |
| Kök ve ek | `turkce-14` … `turkce-16` | dil bilgisi uygulama çıktıları |
| Yazım ve noktalama | `turkce-17` … `turkce-20` | `T.Y.6.21` |

Altı temanın hiçbiri Çekirdek değildir. Bağımsızlık Yolu, Farklı Dünyalar, Bilim ve Teknoloji ve Lider Ruhlar için metin gövdesi yoktur. Dinleme stratejisi, konuşma süreci ve yazma süreci ayrı konu olarak yoktur. 20 konu silinmez. Tema kabının içine beceri uydusu olarak bağlanır. Takvim konusu tema olur.

---

## 7. İngilizce — `jr_06_ing_main` (20 konu, 7 tema)

6. sınıf indeksindeki temalar: Classroom Life, Family Life, Life in Nature and Global Problems, Life in the Neighbourhood and City, Life in the Universe and Future, Life in the World and Culture, Personal Life. `[MEB]` Çıktı kodu `ENG.6.{tema}.L1|R1|S1|W1|P1|V1|G1` biçimindedir. Dil bilgisi temanın hedef yapısıdır, yılın 20. haftası değildir.

Ayrı bir School Life sayfası (`unite/752`) duruyor. Güncel 6. sınıf indeksinde bu başlık yok. Personal Life veya Classroom Life içine alındığı bu turda doğrulanmadı. `[DOĞRULANMADI]`

Mevcut 20 konu, 2018 ünite sırasının dil bilgisi kesitleridir: routines, simple present, food, some/any, present continuous, comparison, weather, emotions, fair, occupations, past be, past simple, holidays, books, prepositions, recycling, should, voting, class rules. Sözcük olarak Personal Life, Neighbourhood, Nature ve Classroom Life ile komşudur. Yedi temanın hiçbiri dört beceriyle kapanmış değildir. Family Life, Universe and Future, World and Culture (ülke, milliyet, dil, dünya mutfağı) eksik tema gövdesidir.

20 dosya yeni 7 temanın arkasına 21–40. hafta olarak eklenmez. Dil bilgisi cümlesi, denk gelen temanın `G1` çıktısına etiket alır. Eşleşmeyen kesit `legacy-2018` bandında kalır.

---

## 8. Branş özeti

| Branş | Konu | Maarif birimi | Çekirdek | Kısmi | Eksik | 2018 kalıntısı |
|---|---:|---|---:|---:|---:|---:|
| Matematik | 25 | 24 çıktı | 5 | 6 | 13 | 12 |
| Fen | 20 | 36 çıktı | 3 | 6 | 27 | 11 |
| Sosyal | 20 | 18 çıktı | 2 | 10 | 6 | 2 başlık kapsama dışı |
| Türkçe | 20 | 6 tema | 0 tema | beceri uydusu | 6 tema gövdesi | 20 konu takvim şeridi olmaktan çıkar |
| İngilizce | 20 | 7 tema | 0 tema | sözcük komşuluğu | 7 tema gövdesi | 20 konu `G1` etiketi veya arşiv |
| Toplam | 105 | — | — | — | — | silinmedi |

Kapsama oranı, çıktı sayısına çekirdek bölününce matematik yüzde 21, fen yüzde 8, sosyal yüzde 11 olur. Bu oran yılın bittiğini söylemez. Kısmi satır da açıktır. Süreç bileşeni tamam olan satır yoktur.

---

## 9. Şema: sınıf, branş, ünite, çıktı, konu, hafta

Hafta, dosya numarası olmaktan çıkar. Bir çıktının birden çok konusu olabilir. Bir konu birden çok hafta aynı kartta kalabilir. Bir haftada, saat sığıyorsa, iki kısa çıktı yan yana durabilir.

```ts
type JuniorCourseSlug =
  | "jr_06_mat"
  | "jr_06_fen"
  | "jr_06_turkce"
  | "jr_06_ing_main"
  | "jr_06_sosyal";

type MebOutcome = {
  schoolYear: "2026-2027";
  grade: 6;
  course: JuniorCourseSlug;
  themeCode: string;       // MAT.6.1
  themeTitle: string;
  outcomeCode: string;     // MAT.6.1.3
  outcomeTitle: string;
  hours: number;           // yıllık plandaki ders saati
};

type TopicCalendar = {
  lessonKey: string;       // jr_06_mat-6, mevcut anahtar korunur
  outcomeCodes: readonly string[];
  band: "tymm" | "legacy-2018";
  startWeek: number;       // 14 Eylül 2026 = 1. hafta
  endWeek: number;         // aynı konu birden çok hafta
  hours: number;
};

type SchoolWeek = {
  week: number;
  kind: "teach" | "exam" | "break" | "okul-temelli";
};
```

Doğrulama kuralları:

- `tymm` konusun her `outcomeCode` değeri o yılın `MebOutcome` listesinde vardır.
- `legacy-2018` konusunun çıktı kodu yoktur ve raf «bu hafta» rozetini MEB penceresinden alamaz.
- Aynı ders ve aynı haftada `teach` dışı bir haftaya konu bindirilmez.
- Bir dersin `tymm` konularının saat toplamı, o dersin program saatini aşınca şema reddeder.
- Çıktı, kendine bağlı `tymm` konularının saatleri `hours` değerine ulaşınca kapanır.
- Ders, listedeki her çıktı kapanınca tamamdır. Son dosya indeksine gelmek tamamlamak değildir.
- `lessonKey` değişmez. Ses manifesti, quiz ve mühür bu anahtarla durur.

Örnek bağ: `jr_06_mat-6` → `MAT.6.1.3` → 2 saat → 3. haftanın bir parçası, tek başına 3. haftanın tamamı değil. `MAT.6.1.4` aynı haftanın kalan 3 saatine `jr_06_mat-7` ile oturur. Bugünkü motor ikisini 6. ve 7. haftaya iter.

---

## 10. İçeriğin koddan ayrılması

### 10.1 Neden paket, neden hemen veritabanı değil

Monorepo zaten `packages/*` çalışma alanıdır. `@yetkin/kernel` içerik taşımaz ve Junior import etmez. İçerik paketi `@yetkin/junior-content` olur. Kernel'a konulmaz.

İlk evde kayıt JSON'dur. Senaryo düz metindir. MDX, tema metni ve öğretmen notu için ikinci katmandır. Çalışma zamanı ikisini de Zod ile okur.

Veritabanı aynı kapıdan ikinci adaptördür. Mühür, quiz dağılımı ve ses karması bugün dosya anahtarına bağlıdır. İçeriği önce tabloya taşımak, satışı açmadan mühür zincirini koparır. Editör ekranı ve onaysız yayın gerekince tablo eklenir. O zamana kadar paket sürümü CI'dan geçer.

### 10.2 Kapı

Uygulama klasörü tanımaz. Şu kapıyı tanır:

```ts
interface JuniorContentSource {
  course(slug: JuniorCourseSlug): {
    outcomes: readonly MebOutcome[];
    topics: readonly TopicCalendar[];
    weeks: readonly SchoolWeek[];
  };
  scenario(lessonKey: string): JuniorLessonScenario;
  quiz(lessonKey: string): JuniorQuizFile;
}
```

`lib/junior/catalog.ts` diziyi `import` etmek yerine bu kapıdan okur. `scenario.ts` senaryoyu oynatıcı metnine çevirmeye devam eder. `production-seal.ts` aynı alanları ölçer. Quiz üreticisi `lib/junior/quiz/{ders}/N.ts` yazmayı bırakır. Hedef `packages/junior-content/quiz/` olur. Mevcut yazıcı `scripts/junior-quiz-archive-write.ts` bu turda çalıştırılmadı ve bu planda da çalıştırılmaz.

### 10.3 Paket ağacı

```
packages/junior-content/
  schema/topic.ts          Zod: senaryo + takvim + çıktı kodu
  schema/meb-outcome.ts
  meb/2026-2027/mat.json   resmi çıktı ve saat
  meb/2026-2027/fen.json
  meb/2026-2027/sosyal.json
  meb/2026-2027/turkce.json
  meb/2026-2027/ing.json
  topics/jr_06_mat-6.json  mevcut senaryonun birebir karşılığı
  quiz/jr_06_mat-6.json
  calendar/jr_06_mat.json
```

JSON, bugünkü TypeScript nesnesinin alan adlarını taşır. Yeni pedagojik alan uydurulmaz.

### 10.4 CI

Yeni betik `verify:junior-content`. `verify:prebuild` zincirine, kapı yeşil olduktan sonra girer.

1. Bütün JSON dosyaları Zod şemasından geçer.
2. `lessonKey` tektir ve `jr_06_{ders}-{n}` biçimindedir.
3. Quiz anahtarı konu anahtarıyla aynıdır.
4. `tymm` bandı en az bir geçerli çıktı kodu taşır.
5. Anlatım süresi bugünkü mühür bandının içindedir. Süre fonksiyonu `lib/junior` içinde kalır. Paket süreyi kendisi hesaplamaz.
6. Kapsama raporu eksik çıktıyı listeler. İlk sürümde bu liste bilgi verir, derlemeyi kırmaz. SUPER_ADMIN kapıyı kapatınca eksik çıktı derlemeyi kırar.
7. Ses manifesti anahtarı JSON'da durmayan bir dersi taşıyorsa betik düşer.

Yayın: paket sürümü artar, uygulama o sürümü okur. İçerik düzeltmesi uygulama mantığı değişmeden çıkar. Canlı R2 ve veritabanı bu planın parçası değildir.

### 10.5 Motorun refactor sırası

1. `JuniorContentSource` tipi `lib/junior/ports.ts` yanına yazılır. Üretim kaynağı hâlâ `lib/junior/content` dizisidir. Davranış değişmez.
2. Dışa aktarma betiği her senaryoyu JSON'a basar. Eşitlik testi, JSON'dan okunan nesne ile TypeScript nesnesini karşılaştırır.
3. Katalog ve mühür kapıdan okur. `index.ts` varil dosyaları kapının bir adaptörü olarak kalır.
4. Yazarlar JSON'u düzenler. TypeScript dosyası elle düzenlenmez. Silinmesi ayrı ve açık bir karardır. Bu rapor o kararı vermez.
5. `legacy-2018` bandı rafda «müfredat dışı arşiv» etiketiyle durur. Ücretsiz ilk ders bugün `jr_06_mat-1` üslü ifadedir ve 2018 kalıntısıdır. Ücretsiz kapının hangi çıktıya taşınacağı ürün kararıdır. Kod bu raporda değişmedi.

Quiz, kapak ve ısınma anahtarları `lessonKey` ile kaldığı sürece medya yolu bozulmaz.

---

## 11. Sen olsaydın

### 11.1 Üste kaç konu eklenir?

Eksik çıktıyı kapatmak için, 105'in üstüne **50 konu kabı**. Bu sayı hafta değildir. Bir kap, MEB saati uzunsa birkaç hafta sürer.

| Branş | Yeni kap | Gerekçe |
|---|---:|---|
| Matematik | 13 | 13 eksik çıktı. 6 kısmi konu yerinde derinleşir, yeni dosya açılmaz |
| Fen | 18 | 27 eksik çıktı, bölüm kabında toplanır: üreme 5, iç salgı ve ergenlik 2, ışık 4, genleşme ve hâl değişimi 3, ampul değişkeni 1, biyoçeşitlilik ve çevre 2, yer değiştirme 1. Model ikizleri (`FB.6.1.2`, `FB.6.1.4`, `FB.6.5.6`) ayrı hafta istemez |
| Sosyal | 6 | Türk dünyası, İslam medeniyetinin mirası, dijital vatandaşlık, yatırım projesi, telif, toplumsal sorun müzakeresi |
| Türkçe | 6 | Altı tema gövdesi. Mevcut 20 konu bu gövdelere beceri uydusu olarak bağlanır |
| İngilizce | 7 | Yedi tema gövdesi. Mevcut 20 konu `G1` etiketi alır veya `legacy-2018` kalır |
| Toplam | 50 | — |

Tavan 59'dur: fen bölüm kabı açılıp 27 eksik çıktının her biri ayrı konu yapılırsa 18 yerine 27 yazılır. Maarif saati uzun olan çıktı zaten birkaç hafta sürdüğü için bölüm kabı yeter. 50, «her eksik cümle için bir dosya» yığını değildir.

50 kap eklenince depoda 155 konu dosyası durur. Bunların yaklaşık 25'i (12 matematik, 11 fen, 2 sosyal başlık) 2026-2027 kapanış hesabına girmez. Tamlık 155'e ulaşmak değildir. Tamlık, 24 + 36 + 18 çıktı ile 6 + 7 tema gövdesinin saatini doldurmaktır.

### 11.2 En sorunsuz geçiş

Tek yönlü ihracat, sonra okuma kapısı, en sonda yazarlığın JSON'a geçmesi. TypeScript dosyasını ilk günde silmek, ses anahtarını, quiz bağını ve mühür testini aynı anda koparır.

Sıra:

1. Şemayı ve `MebOutcome` listesini yaz. İçerik metnini taşıma.
2. Mevcut 105 senaryoyu betikle JSON'a bas. Eşitlik testi yeşil olmadan katalogu JSON'a alma.
3. Katalogu kapıdan okut. Varil `index.ts` adaptör olarak kalsın.
4. Takvim dosyasını MEB saatinden doldur. `juniorThisWeekLessonIndex` çağrısını bu dosyaya çevir.
5. Yeni 50 kabı doğrudan JSON olarak yaz. Eski 105'e dokunma.
6. TypeScript kaynak dosyasını kaldırmak, eşitlik testi bir sürüm boyunca yeşil kaldıktan sonra ayrı karar olur.

Veritabanı bu sıranın 6. adımından sonradır. İlk dört adım dağıtımdan bağımsız değildir. Bağımsızlık, 5. adımdan sonra paket sürümünün uygulama sürümünden ayrı çıkmasıyla başlar.

### 11.3 `lib/junior/week.ts` için düzenleme

Okul açılış tarihi kalır. İstanbul gün hesabı kalır. Değişen, haftanın konu indeksine çevrilmesidir.

1. `juniorSchoolWeek` aynı kalır. 14 Eylül 2026, 1. haftadır.
2. `SchoolWeek.kind` eklenir. Sınav, ara tatil ve okul temelli planlama haftası konu ilerletmez. Hafta numarası yine artar. MEB çerçeve planındaki hafta numarası ile aynı sayı durur.
3. `juniorThisWeekLessonIndex(lessonCount)` kalkar. Yerine `juniorActiveLessonKeys(slug, now)` gelir. Dönüş, `startWeek <= hafta <= endWeek` olan konu anahtarlarıdır. Bir haftada birden çok anahtar olabilir. Bir anahtar birden çok hafta dönebilir.
4. `catalog.ts` içindeki `thisWeek: weekIndex === index` satırı, anahtarın bu kümeye üyeliğine döner.
5. `Math.min(week - 1, lessonCount - 1)` sıkıştırması kalkar. Müfredat penceresi bitince rozet son konuda yapışık kalmaz. Raf, kapanmış çıktı sayısını gösterir.
6. Ders tamamlandı bayrağı, o dersin `MebOutcome` listesindeki her kodun saatinin dolmasıdır.
7. `tests/kernel/junior-lesson-chain.test.ts` bugün `thisWeek` değerini dizi indeksinden bekler. Test, takvim dosyasındaki hafta aralığına geçer.
8. Raf önbellek anahtarı okul haftası olarak kalabilir. Anahtar, takvim dosyasının sürümünü de içermelidir. Aynı haftada plan değişirse önbellek eski rozeti tutmasın.

`juniorShelfWeekHeading` bugün `4. Hafta: Doğal sayı problemleri` üretir. Yeni başlık, o haftanın çıktı adıdır: saat payı iki çıktıya bölünmüşse kart iki başlık taşır. Başlık uydurulmaz. `MebOutcome.outcomeTitle` basılır.

---

## 12. Bilinçli sınır

- Eşleme, kodda kayıtlı bir kazanım alanından okunmadı. Başlık ve örnek gövdeden kuruldu. `[ANALİZ]`
- Fen `FB.6.2.2` fiil cümlesi, 2026 PDF dökümünde ayrı başlık olarak düşmedi. Ünite 3 çıktılıdır. `[DOĞRULANMADI]`
- Sosyal saat sütunu ve Türkçe Lider Ruhlar saat sütunu çerçeve plan PDF'sinden yeniden ölçülmedi. `[DOĞRULANMADI]`
- İngilizce School Life sayfasının indeksten neden düştüğü doğrulanmadı. `[DOĞRULANMADI]`
- 50 kap yazılmadı. 105 dosya silinmedi. `week.ts` ve katalog değiştirilmedi.
- Seçmeli dersler (`jr_06_ing`, `jr_06_alm`, `jr_06_fra`, `jr_06_siyer`, `jr_06_kod`, `jr_06_arp`) bu haritanın dışındadır.
