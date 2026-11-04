# İçerik kalite raporu

| Alan | Değer |
|---|---|
| Tarih | 4 Kasım 2026 |
| Muhatap | SUPER_ADMIN |
| Betik | `npm run verify:content-quality` |
| Kaynak | `packages/junior-content/topics`, `quiz`, `calendar`, `meb/2026-2027` |
| Yazılı ders | 111 |
| Boş kab | 13 |
| Mantık bulgusu | 0 |
| Benzetme kalıntısı | 0 |
| Yüzeysel anlatım (Katman 1) | 1 |

## SUPER_ADMIN özeti

111 yazılı senaryo tarandı. Üslü ifadede kat veya kule yığması toplama algısı kuran benzetmeler, eski oyuncak kalıntıları, klişe koç kalıpları ve mükerrer cümleler aşağıdadır.

Çizgi yardımcı kaynak fasikülüdür ve sınav ayarıdır. MEB kazanım kodu korunur; anlatım ders kitabı tanımında bırakılmaz. Katman 1 tanım ve günlük örnektir. Katman 2 ana omurgadır: pratik kural, tuzak uyarısı, zengin örnek ve yazılı soru tipi. Katman 3, omurga kapandıktan sonra yeni nesil muhakeme sorusudur. Yalnız Katman 1'de kalan ders Katman 2 ve Katman 3'e çıkarılır.

Katman 1 tavanı: 1. Kısmi omurga: 102. Katman 2: 8. Katman 3: 0.

MEB ölçüsü 2026-2027 Maarif kazanım dosyasıdır. Ders kitabı sayfa metni pakette yoktur; sayfa alıntısı üretilmez. Her konuda üç aşama aranır: Kavram (`concept`), Uygulama (`example` ve `life`), Beceri Temelli (`quiz` düzeyi `skill`). Saatli `tymm` ders, bu üçü tamsa kazanımı taşır. Boş kab ve 0 saatlik uydu kazanımı kapatmaz.

| Ders | Yazılı | Katman 1 | Kısmi omurga | Katman 2 | Katman 3 |
|---|---:|---:|---:|---:|---:|
| Matematik | 26 | 1 | 22 | 3 | 0 |
| Fen bilimleri | 27 | 0 | 26 | 1 | 0 |
| Türkçe | 20 | 0 | 17 | 3 | 0 |
| İngilizce | 14 | 0 | 14 | 0 | 0 |
| Sosyal bilgiler | 24 | 0 | 23 | 1 | 0 |

| Ders | Yazılı | Üç aşama | Seviye altı | Uydu | Çıktı dışı |
|---|---:|---:|---:|---:|---:|
| Matematik | 26 | 0 | 26 | 0 | 0 |
| Fen bilimleri | 27 | 12 | 15 | 0 | 0 |
| Türkçe | 20 | 0 | 20 | 0 | 0 |
| İngilizce | 14 | 5 | 9 | 0 | 0 |
| Sosyal bilgiler | 24 | 8 | 12 | 4 | 0 |

## 1. Kavramsal ve matematiksel çelişkiler

Bu taramada kurala uyan mantık çelişkisi çıkmadı.

## 2. Eski benzetme kalıntıları

Lego, Playmobil, Minecraft veya Roblox kalıntısı çıkmadı.

## 3. Klişe koç cümleleri

| Kalıp | Ders | Örnek anahtarlar |
|---|---:|---|
| Kavramsal Anlayış / İfade Gücü damgası | 108 | jr_06_mat-4, jr_06_mat-5, jr_06_mat-6, jr_06_mat-7, jr_06_mat-8, jr_06_mat-9, jr_06_mat-10, jr_06_mat-11 ve 100 ders daha |

## 4. Mükerrer açılışlar ve cümleler

Açılış, `welcome` alanının ilk sekiz sözcüğüdür. Dört ve daha fazla derste aynıysa listelenir.

| Açılış | Ders |
|---|---:|
| Ortak açılış yok | 0 |

Aynı cümle en az üç derste geçiyorsa aşağıdadır. Liste yirmi grupta kesilir.

- 110 ders: şimdi sevgili arkadaşım işte tam bu noktada dikkat etmen gereken kilit nokta
  Anahtarlar: jr_06_mat-2, jr_06_mat-3, jr_06_mat-4, jr_06_mat-5, jr_06_mat-6, jr_06_mat-7, jr_06_mat-8, jr_06_mat-9 ve 102 ders daha

- 13 ders: okul defterindeki adım bahçedeki ölçümle aynı kuralı taşır
  Anahtarlar: jr_06_mat-5, jr_06_mat-6, jr_06_mat-12, jr_06_mat-13, jr_06_mat-14, jr_06_mat-15, jr_06_mat-16, jr_06_mat-17 ve 5 ders daha

## 5. MEB kazanım derinliği

Kazanım satırı, yalnız saati sıfırdan büyük `tymm` anlatımdan kapanır. Üç aşama tam değilse eksik içerik aynı satırdadır.

Açık kazanım: 64 / 104.

| Kod | Kazanım | Saat | Kavram | Uygulama | Beceri | Taşıyan | Eksik |
|---|---|---:|---|---|---|---|---|
| MAT.6.1.1 | Çarpan ve kat | 5 | tam | tam | yüzeysel | jr_06_mat-1 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.1.2 | 2, 3, 4, 5, 6, 9 ve 10 ile bölünebilme | 5 | tam | tam | yüzeysel | jr_06_mat-1 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.1.3 | Asal sayı ve asal çarpan | 2 | tam | tam | yüzeysel | jr_06_mat-2 | Beceri sorusu tanıma sorusu. Yeni nesil soru bir bağlam, ikinci bir koşul ve çeldirici tuzak taşır. |
| MAT.6.1.4 | Ortak kat ve ortak bölen | 3 | tam | tam | yüzeysel | jr_06_mat-3 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.1.5 | Ondalık gösterimin basamak değeri | 5 | tam | tam | yüzeysel | jr_06_mat-4 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.1.6 | Kesir ile bölme, sonlu ve devirli ondalık | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-5 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.1.7 | Kesir, ondalık ve yüzde ile dört işlem | 8 | tam | tam | yüzeysel | jr_06_mat-7, jr_06_mat-8, jr_06_mat-9, jr_06_mat-10 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.1.8 | Standart uzunluk ölçü birimleri | 5 | tam | tam | yüzeysel | jr_06_mat-6 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.2.1 | Bilinmeyen nicelik ve cebirsel ifade | 5 | tam | tam | yüzeysel | jr_06_mat-11 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.2.2 | Sayı ve şekil örüntüsü | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-12 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.2.3 | Cebirsel ifadede algoritma | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-13 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.3.1 | İki paralel doğru ve bir kesenin açıları | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-14 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.3.2 | İki kesenin oluşturduğu dörtgenler | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-15 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.3.3 | Köşegenleri birbirini ortalayan dörtgenler | 5 | tam | tam | yüzeysel | jr_06_mat-16 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.3.4 | Üçgen ve dörtgenlerin açı problemleri | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-17 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.4.1 | Uzunluk ve alan ölçü birimleri | 5 | tam | tam | yüzeysel | jr_06_mat-18 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.4.2 | Paralelkenar ve üçgenin alan bağıntısı | 5 | tam | tam | yüzeysel | jr_06_mat-19 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.4.3 | Alanla modellenen gerçek yaşam problemi | 10 | tam | tam | yüzeysel | jr_06_mat-18, jr_06_mat-19 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Alanla modellenen gerçek yaşam problemi. |
| MAT.6.4.4 | Çember uzunluğu ile çap | 5 | tam | tam | yüzeysel | jr_06_mat-20 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.4.5 | Çember uzunluğu problemleri | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-21 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu, uygulama sorusunun aynı sayısal sonucunu kısa hikâyeye sarmış. İkinci koşul veya veri yorumu eklenmeli. |
| MAT.6.4.6 | Merkez açı ve gördüğü yay | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-22 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.5.1 | Kategorik veya kesikli veriyle araştırma | 8 | tam | tam | yüzeysel | jr_06_mat-23, jr_06_mat-24 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.5.2 | Başkasının istatistiksel yorumunu tartışma | 5 | tam | tam | yüzeysel | jr_06_mat-25 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| MAT.6.6.1 | Gözleme dayalı olasılık | 5 | tam | yüzeysel | yüzeysel | jr_06_mat-26 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.1.1 | Gezegenler | 3 | tam | yüzeysel | yüzeysel | jr_06_fen-1 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.1.2 | Gezegen modeli | 3 | tam | yüzeysel | yüzeysel | jr_06_fen-1 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.1.3 | Güneş ve Ay tutulması | 3 | tam | yüzeysel | yüzeysel | jr_06_fen-2 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.1.4 | Tutulma modeli | 3 | tam | yüzeysel | yüzeysel | jr_06_fen-2 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.2.1 | Bileşke kuvvet | 5 | tam | tam | yüzeysel | jr_06_fen-9 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.2.2 | Alınan yol ve yer değiştirme | 5 | tam | tam | tam | jr_06_fen-21 | — |
| FB.6.2.3 | Sabit sürat | 4 | tam | tam | yüzeysel | jr_06_fen-10 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.3.1 | Üreme | 3 | tam | tam | tam | jr_06_fen-22 | — |
| FB.6.3.2 | Büyüme | 3 | tam | tam | tam | jr_06_fen-23 | — |
| FB.6.3.3 | Çimlenme | 3 | tam | tam | tam | jr_06_fen-24 | — |
| FB.6.3.4 | İnsan üreme organları | 2 | tam | tam | yüzeysel | jr_06_fen-25 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.3.5 | Canlılarda üreme ve büyüme | 2 | tam | tam | tam | jr_06_fen-26 | — |
| FB.6.3.6 | Sinir sistemi | 2 | tam | yüzeysel | yüzeysel | jr_06_fen-16 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.3.7 | İç salgı | 3 | tam | tam | yüzeysel | jr_06_fen-27 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.3.8 | Ergenlik | 2 | tam | tam | tam | jr_06_fen-28 | — |
| FB.6.3.9 | Sistem sağlığı | 2 | tam | tam | yüzeysel | jr_06_fen-18 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.4.1 | Yansıma | 4 | tam | tam | tam | jr_06_fen-29 | — |
| FB.6.4.2 | Normal | 3 | tam | tam | tam | jr_06_fen-29 | — |
| FB.6.4.3 | Ayna çeşitleri | 3 | tam | tam | tam | jr_06_fen-30 | — |
| FB.6.4.4 | Soğurulma | 3 | tam | tam | tam | jr_06_fen-31 | — |
| FB.6.4.5 | Beyaz ışık | 3 | tam | tam | tam | jr_06_fen-31 | — |
| FB.6.4.6 | Renk | 3 | tam | tam | yüzeysel | jr_06_fen-32 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.4.7 | Güneş enerjisi | 3 | tam | tam | yüzeysel | jr_06_fen-32 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.5.1 | Genleşme | 6 | tam | tam | yüzeysel | jr_06_fen-33 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.5.2 | Erime, donma ve kaynama | 6 | tam | tam | yüzeysel | jr_06_fen-34 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.5.3 | Yoğunluk | 5 | tam | tam | yüzeysel | jr_06_fen-12 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.5.4 | Tümdengelim | 5 | tam | tam | yüzeysel | jr_06_fen-35 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.5.5 | Buzun yoğunluğu | 5 | tam | tam | yüzeysel | jr_06_fen-35 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.5.6 | Madde modeli | 5 | tam | tam | yüzeysel | jr_06_fen-12 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.6.1 | İletken ve yalıtkan | 6 | tam | yüzeysel | yüzeysel | jr_06_fen-19 | Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.6.2 | Ampul parlaklığının değişkenleri | 6 | tam | tam | tam | jr_06_fen-36 | — |
| FB.6.6.3 | Direnç | 6 | tam | tam | yüzeysel | jr_06_fen-20 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| FB.6.7.1 | Biyoçeşitlilik | 5 | tam | tam | tam | jr_06_fen-37 | — |
| FB.6.7.2 | Biyoçeşitliliğe yönelik tehditler | 5 | tam | tam | tam | jr_06_fen-37 | — |
| FB.6.7.3 | Yakıt | 4 | tam | tam | tam | jr_06_fen-38 | — |
| FB.6.7.4 | Çevre problemi | 4 | tam | tam | tam | jr_06_fen-38 | — |
| T.6.1 | Dilimizin Zenginliği | 34 | tam | tam | tam | jr_06_turkce-1, jr_06_turkce-2, jr_06_turkce-3, jr_06_turkce-4, jr_06_turkce-13, jr_06_turkce-21 | — |
| T.6.2 | Bağımsızlık Yolu | 34 | tam | tam | tam | jr_06_turkce-8, jr_06_turkce-9, jr_06_turkce-10, jr_06_turkce-12, jr_06_turkce-22 | Kazanım terimleri anlatımda yok: Bağımsızlık Yolu. |
| T.6.3 | Farklı Dünyalar | 34 | tam | tam | yüzeysel | jr_06_turkce-5, jr_06_turkce-7, jr_06_turkce-11, jr_06_turkce-23 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| T.6.4 | İletişim ve Sosyal İlişkiler | 34 | tam | tam | yüzeysel | jr_06_turkce-6, jr_06_turkce-14, jr_06_turkce-15, jr_06_turkce-16, jr_06_turkce-24 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| T.6.5 | Bilim ve Teknoloji | 34 | tam | tam | yüzeysel | jr_06_turkce-17, jr_06_turkce-18, jr_06_turkce-25 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Bilim ve Teknoloji. |
| T.6.6 | Lider Ruhlar | 34 | tam | tam | yüzeysel | jr_06_turkce-19, jr_06_turkce-20, jr_06_turkce-26 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Lider Ruhlar. Süreç bileşeni açık (T.6.6). Deney, model, ölçme veya tartışma adımı yok. |
| T.6.1.O | Okuma ve söz varlığı | 0 | tam | tam | tam | jr_06_turkce-1, jr_06_turkce-2, jr_06_turkce-3, jr_06_turkce-4, jr_06_turkce-13 | — |
| T.6.2.O | Okuma ve söz varlığı | 0 | tam | tam | tam | jr_06_turkce-8, jr_06_turkce-9, jr_06_turkce-10, jr_06_turkce-12 | — |
| T.6.3.O | Okuma ve söz varlığı | 0 | tam | tam | yüzeysel | jr_06_turkce-5, jr_06_turkce-7, jr_06_turkce-11 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| T.6.4.C | Cümle ve ek | 0 | tam | tam | yüzeysel | jr_06_turkce-6, jr_06_turkce-14, jr_06_turkce-15, jr_06_turkce-16 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| T.6.5.Y | Yazım ve noktalama | 0 | tam | tam | yüzeysel | jr_06_turkce-17, jr_06_turkce-18 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| T.6.6.Y | Yazım ve noktalama | 0 | tam | tam | yüzeysel | jr_06_turkce-19, jr_06_turkce-20 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| ENG.6.1 | Classroom Life | 15 | tam | tam | tam | jr_06_ing_main-20, jr_06_ing_main-21 | Süreç bileşeni açık (ENG.6.1). Deney, model, ölçme veya tartışma adımı yok. |
| ENG.6.2 | Family Life | 15 | tam | tam | tam | jr_06_ing_main-2, jr_06_ing_main-4, jr_06_ing_main-22 | — |
| ENG.6.3 | Life in Nature and Global Problems | 15 | tam | tam | tam | jr_06_ing_main-7, jr_06_ing_main-17, jr_06_ing_main-23 | Kazanım terimleri anlatımda yok: Life in Nature and Global Problems. Süreç bileşeni açık (ENG.6.3). Deney, model, ölçme veya tartışma adımı yok. |
| ENG.6.4 | Life in the Neighbourhood and City | 15 | tam | tam | tam | jr_06_ing_main-5, jr_06_ing_main-16, jr_06_ing_main-24 | Kazanım terimleri anlatımda yok: Life in the Neighbourhood and City. Süreç bileşeni açık (ENG.6.4). Deney, model, ölçme veya tartışma adımı yok. |
| ENG.6.5 | Life in the Universe and Future | 14 | tam | tam | tam | jr_06_ing_main-6, jr_06_ing_main-9, jr_06_ing_main-25 | — |
| ENG.6.6 | Life in the World and Culture | 14 | tam | tam | tam | jr_06_ing_main-10, jr_06_ing_main-11, jr_06_ing_main-26 | — |
| ENG.6.7 | Personal Life | 14 | tam | tam | yüzeysel | jr_06_ing_main-1, jr_06_ing_main-3, jr_06_ing_main-8, jr_06_ing_main-27 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Personal Life. Süreç bileşeni açık (ENG.6.7). Deney, model, ölçme veya tartışma adımı yok. |
| ENG.6.1.G1 | Classroom Life dil bilgisi | 0 | tam | tam | tam | jr_06_ing_main-20 | — |
| ENG.6.2.G1 | Family Life dil bilgisi | 0 | tam | tam | tam | jr_06_ing_main-2, jr_06_ing_main-4 | — |
| ENG.6.3.G1 | Life in Nature and Global Problems dil bilgisi | 0 | tam | tam | tam | jr_06_ing_main-7, jr_06_ing_main-17 | Kazanım terimleri anlatımda yok: Life in Nature and Global Problems dil bilgisi. |
| ENG.6.4.G1 | Life in the Neighbourhood and City dil bilgisi | 0 | tam | tam | tam | jr_06_ing_main-5, jr_06_ing_main-16 | Kazanım terimleri anlatımda yok: Life in the Neighbourhood and City dil bilgisi. |
| ENG.6.5.G1 | Life in the Universe and Future dil bilgisi | 0 | tam | tam | tam | jr_06_ing_main-6, jr_06_ing_main-9 | — |
| ENG.6.6.G1 | Life in the World and Culture dil bilgisi | 0 | tam | tam | tam | jr_06_ing_main-10, jr_06_ing_main-11 | — |
| ENG.6.7.G1 | Personal Life dil bilgisi | 0 | tam | tam | yüzeysel | jr_06_ing_main-1, jr_06_ing_main-3, jr_06_ing_main-8 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Personal Life dil bilgisi. |
| SB.6.1.1 | Grup ve rolün zamanla değişmesi | 6 | tam | tam | yüzeysel | jr_06_sosyal-1 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.1.2 | Kültürel bağ ve millî değer | 5 | tam | tam | yüzeysel | jr_06_sosyal-1 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.1.3 | Toplumsal sorunu müzakere | 5 | tam | tam | tam | jr_06_sosyal-21 | — |
| SB.6.2.1 | Ülke, kıta ve okyanus konumu | 6 | tam | tam | tam | jr_06_sosyal-9 | — |
| SB.6.2.2 | Doğal ve beşerî çevre ilişkisi | 6 | tam | tam | yüzeysel | jr_06_sosyal-10, jr_06_sosyal-11 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.2.3 | Türk dünyasıyla kültürel iş birliği | 6 | tam | tam | tam | jr_06_sosyal-22 | — |
| SB.6.3.1 | Türkistan'daki ilk Türk devletlerinin katkısı | 6 | tam | tam | yüzeysel | jr_06_sosyal-5 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.3.2 | VII–XIII. yüzyıl İslam medeniyetinin ortak mirası | 6 | tam | tam | tam | jr_06_sosyal-23 | — |
| SB.6.3.3 | İslamiyet'in kabulüyle sosyal ve kültürel değişim | 5 | tam | tam | yüzeysel | jr_06_sosyal-7 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.3.4 | XI–XIII. yüzyıl, Anadolu'nun Türkleşmesi ve İslamlaşması | 5 | tam | tam | yüzeysel | jr_06_sosyal-7 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.4.1 | Yönetimin karar alma süreci | 6 | tam | tam | yüzeysel | jr_06_sosyal-16, jr_06_sosyal-18 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.4.2 | Temel hak ve sorumluluk | 6 | tam | tam | yüzeysel | jr_06_sosyal-4, jr_06_sosyal-17 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.4.3 | Dijitalleşmenin vatandaşlık haklarına etkisi | 6 | tam | tam | tam | jr_06_sosyal-24 | — |
| SB.6.5.1 | Kaynaklar ve ekonomik faaliyet | 6 | tam | tam | yüzeysel | jr_06_sosyal-12 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.5.2 | Ekonomik faaliyet ve meslek | 6 | tam | tam | yüzeysel | jr_06_sosyal-15 | Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. |
| SB.6.5.3 | Yatırım ve pazarlama proje önerisi | 6 | tam | tam | tam | jr_06_sosyal-25 | — |
| SB.6.6.1 | Ulaşım ve iletişimin kültürel etkileşimi | 6 | tam | tam | tam | jr_06_sosyal-8, jr_06_sosyal-20 | — |
| SB.6.6.2 | Telif ve patent | 5 | tam | tam | tam | jr_06_sosyal-26 | — |

## 6. Yazılı derslerin hizası

Hiza: **Üç aşama** saatli Maarif dersidir ve üç ölçü tamdır. **Seviye altı** saatli derstir, bir aşama eksiktir. **Uydu** çıktı kodu taşır, saati 0'dır. **Çıktı dışı** `legacy-2018` bandındadır.

| Ders | Başlık | Bant | Saat | Çıktı | Kavram | Uygulama | Beceri | Hiza |
|---|---|---|---:|---|---|---|---|---|
| jr_06_mat-1 | Çarpanlar, Katlar ve Bölünebilme | tymm | 10 | MAT.6.1.1, MAT.6.1.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-2 | Asal sayılar ve asal çarpanlar | tymm | 2 | MAT.6.1.3 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-3 | Ortak bölen ve ortak kat | tymm | 3 | MAT.6.1.4 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-4 | Ondalık gösterimi okumak | tymm | 5 | MAT.6.1.5 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-5 | Kesir ile bölme, sonlu ve devirli ondalık | tymm | 5 | MAT.6.1.6 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-6 | Standart uzunluk ölçü birimleri | tymm | 5 | MAT.6.1.8 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-7 | Payda aynıyken toplama | tymm | 2 | MAT.6.1.7 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-8 | Paydayı eşitleyerek toplama | tymm | 2 | MAT.6.1.7 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-9 | Kesirlerde çarpma ve bölme | tymm | 2 | MAT.6.1.7 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-10 | Ondalık sayılarla işlem | tymm | 2 | MAT.6.1.7 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-11 | Cebirsel ifadeler | tymm | 5 | MAT.6.2.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-12 | Sayı ve şekil örüntüsü | tymm | 5 | MAT.6.2.2 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-13 | Cebirsel ifadede algoritma | tymm | 5 | MAT.6.2.3 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-14 | İki paralel doğru ve bir kesenin açıları | tymm | 5 | MAT.6.3.1 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-15 | İki kesenin oluşturduğu dörtgenler | tymm | 5 | MAT.6.3.2 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-16 | Köşegenleri birbirini ortalayan dörtgenler | tymm | 5 | MAT.6.3.3 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-17 | Üçgen ve dörtgenlerin açı problemleri | tymm | 5 | MAT.6.3.4 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-18 | Alan ölçü birimleri ve arazi | tymm | 5 | MAT.6.4.1, MAT.6.4.3 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-19 | Paralelkenar ve üçgenin alanı | tymm | 5 | MAT.6.4.2, MAT.6.4.3 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-20 | Çember uzunluğu ile çap | tymm | 5 | MAT.6.4.4 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-21 | Çember uzunluğu problemleri | tymm | 5 | MAT.6.4.5 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-22 | Merkez açı ve gördüğü yay | tymm | 5 | MAT.6.4.6 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_mat-23 | Veri toplama ve değerlendirme | tymm | 4 | MAT.6.5.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-24 | Veri analizi | tymm | 4 | MAT.6.5.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-25 | Başkasının istatistiksel yorumunu tartışma | tymm | 5 | MAT.6.5.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_mat-26 | Gözleme dayalı olasılık | tymm | 5 | MAT.6.6.1 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_fen-1 | Güneş sistemindeki gezegenler | tymm | 6 | FB.6.1.1, FB.6.1.2 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_fen-2 | Güneş ve Ay tutulması | tymm | 6 | FB.6.1.3, FB.6.1.4 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_fen-9 | Bileşke kuvvet | tymm | 5 | FB.6.2.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-10 | Sabit süratli hareket | tymm | 4 | FB.6.2.3 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-12 | Yoğunluk | tymm | 10 | FB.6.5.3, FB.6.5.6 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-16 | Denetleyici ve düzenleyici sistemler | tymm | 2 | FB.6.3.6 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_fen-18 | Sistemlerin sağlığı | tymm | 2 | FB.6.3.9 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-19 | İletken ve yalıtkan maddeler | tymm | 6 | FB.6.6.1 | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_fen-20 | Elektriksel direnç | tymm | 6 | FB.6.6.3 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-21 | Alınan yol ve yer değiştirme | tymm | 5 | FB.6.2.2 | tam | tam | tam | Üç aşama |
| jr_06_fen-22 | Üreme | tymm | 3 | FB.6.3.1 | tam | tam | tam | Üç aşama |
| jr_06_fen-23 | Büyüme | tymm | 3 | FB.6.3.2 | tam | tam | tam | Üç aşama |
| jr_06_fen-24 | Çimlenme | tymm | 3 | FB.6.3.3 | tam | tam | tam | Üç aşama |
| jr_06_fen-25 | İnsan üreme organları | tymm | 2 | FB.6.3.4 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-26 | Canlılarda üreme ve büyüme | tymm | 2 | FB.6.3.5 | tam | tam | tam | Üç aşama |
| jr_06_fen-27 | İç salgı | tymm | 3 | FB.6.3.7 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-28 | Ergenlik | tymm | 2 | FB.6.3.8 | tam | tam | tam | Üç aşama |
| jr_06_fen-29 | Yansıma ve normal | tymm | 7 | FB.6.4.1, FB.6.4.2 | tam | tam | tam | Üç aşama |
| jr_06_fen-30 | Ayna çeşitleri | tymm | 3 | FB.6.4.3 | tam | tam | tam | Üç aşama |
| jr_06_fen-31 | Soğurulma ve beyaz ışık | tymm | 6 | FB.6.4.4, FB.6.4.5 | tam | tam | tam | Üç aşama |
| jr_06_fen-32 | Renk ve güneş enerjisi | tymm | 6 | FB.6.4.6, FB.6.4.7 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-33 | Genleşme | tymm | 6 | FB.6.5.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-34 | Erime, donma ve kaynama | tymm | 6 | FB.6.5.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-35 | Tümdengelim ve buzun yoğunluğu | tymm | 10 | FB.6.5.4, FB.6.5.5 | tam | tam | yüzeysel | Seviye altı |
| jr_06_fen-36 | Ampul parlaklığının değişkenleri | tymm | 6 | FB.6.6.2 | tam | tam | tam | Üç aşama |
| jr_06_fen-37 | Biyoçeşitlilik ve tehditler | tymm | 10 | FB.6.7.1, FB.6.7.2 | tam | tam | tam | Üç aşama |
| jr_06_fen-38 | Yakıt ve çevre problemi | tymm | 8 | FB.6.7.3, FB.6.7.4 | tam | tam | tam | Üç aşama |
| jr_06_turkce-1 | Gerçek, mecaz ve terim anlam | tymm | 7 | T.6.1, T.6.1.O | tam | tam | tam | Seviye altı |
| jr_06_turkce-2 | Eş anlam, zıt anlam ve yakın anlamlı sözcükler | tymm | 7 | T.6.1, T.6.1.O | tam | tam | tam | Seviye altı |
| jr_06_turkce-3 | Sözcükte çok anlamlılık ve söz varlığı | tymm | 7 | T.6.1, T.6.1.O | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-4 | Söz sanatları | tymm | 7 | T.6.1, T.6.1.O | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-5 | Öznel ve nesnel anlatımlı cümleler | tymm | 12 | T.6.3, T.6.3.O | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-6 | Neden-sonuç, amaç-sonuç ve koşul-sonuç cümleleri | tymm | 9 | T.6.4, T.6.4.C | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-7 | Cümlede örtülü anlam ve cümle yorumlama | tymm | 11 | T.6.3, T.6.3.O | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-8 | Paragrafta ana fikir ve konu | tymm | 9 | T.6.2, T.6.2.O | tam | tam | tam | Seviye altı |
| jr_06_turkce-9 | Paragrafta yardımcı fikirler | tymm | 9 | T.6.2, T.6.2.O | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-10 | Paragrafın yapısı | tymm | 8 | T.6.2, T.6.2.O | tam | tam | tam | Seviye altı |
| jr_06_turkce-11 | Anlatım biçimleri ve düşünceyi geliştirme yolları | tymm | 11 | T.6.3, T.6.3.O | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-12 | Metin türleri | tymm | 8 | T.6.2, T.6.2.O | tam | tam | tam | Seviye altı |
| jr_06_turkce-13 | Deyimler ve atasözleri | tymm | 6 | T.6.1, T.6.1.O | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-14 | İsim ve fiil kökü | tymm | 9 | T.6.4, T.6.4.C | tam | yüzeysel | yüzeysel | Seviye altı |
| jr_06_turkce-15 | Yapım ekleri ve sözcük türetme | tymm | 8 | T.6.4, T.6.4.C | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-16 | İsim çekim ekleri | tymm | 8 | T.6.4, T.6.4.C | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-17 | Büyük harfler ve sayıların yazımı | tymm | 17 | T.6.5, T.6.5.Y | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-18 | de, da, ki ve mi'nin yazımı | tymm | 17 | T.6.5, T.6.5.Y | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-19 | Nokta, virgül, noktalı virgül ve iki nokta | tymm | 17 | T.6.6, T.6.6.Y | tam | tam | yüzeysel | Seviye altı |
| jr_06_turkce-20 | Üç nokta, soru, ünlem, kesme ve tırnak | tymm | 17 | T.6.6, T.6.6.Y | tam | tam | yüzeysel | Seviye altı |
| jr_06_ing_main-1 | Daily routines ve saati söylemek | tymm | 5 | ENG.6.7, ENG.6.7.G1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_ing_main-2 | Family Life: ailem ve have got | tymm | 8 | ENG.6.2, ENG.6.2.G1 | tam | tam | tam | Üç aşama |
| jr_06_ing_main-3 | Yiyecek, içecek ve likes, dislikes | tymm | 5 | ENG.6.7, ENG.6.7.G1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_ing_main-4 | Family Life: evde rutin işler | tymm | 7 | ENG.6.2, ENG.6.2.G1 | tam | tam | tam | Üç aşama |
| jr_06_ing_main-5 | Şehirde şu an ne oluyor | tymm | 8 | ENG.6.4, ENG.6.4.G1 | tam | tam | tam | Seviye altı |
| jr_06_ing_main-6 | Universe: gökyüzü ve there is | tymm | 7 | ENG.6.5, ENG.6.5.G1 | tam | tam | tam | Üç aşama |
| jr_06_ing_main-7 | Sunny, rainy ve cold | tymm | 8 | ENG.6.3, ENG.6.3.G1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_ing_main-8 | Happy, anxious ve scared | tymm | 4 | ENG.6.7, ENG.6.7.G1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_ing_main-9 | Universe: gelecekte will | tymm | 7 | ENG.6.5, ENG.6.5.G1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_ing_main-10 | World and Culture: ülke ve milliyet | tymm | 7 | ENG.6.6, ENG.6.6.G1 | tam | tam | tam | Üç aşama |
| jr_06_ing_main-11 | World and Culture: kutlama ve yemek | tymm | 7 | ENG.6.6, ENG.6.6.G1 | tam | tam | tam | Üç aşama |
| jr_06_ing_main-16 | In, on, under, behind ve next to | tymm | 7 | ENG.6.4, ENG.6.4.G1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_ing_main-17 | Çevreyi korumak ve recycling | tymm | 7 | ENG.6.3, ENG.6.3.G1 | tam | tam | tam | Seviye altı |
| jr_06_ing_main-20 | Hak, sorumluluk ve sınıf kuralı | tymm | 15 | ENG.6.1, ENG.6.1.G1 | tam | tam | tam | Seviye altı |
| jr_06_sosyal-1 | Değerlerimiz ve toplumdaki roller | tymm | 11 | SB.6.1.1, SB.6.1.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-2 | Toplumsal uyum ve yardımlaşma | tymm | 0 | SB.6.1.1 | tam | tam | yüzeysel | Uydu |
| jr_06_sosyal-3 | Önyargıları kırıyoruz | tymm | 0 | SB.6.1.1 | tam | tam | tam | Uydu |
| jr_06_sosyal-4 | Hak, sorumluluk ve özgürlük | tymm | 3 | SB.6.4.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-5 | İlk Türk devletleri ve Orta Asya Türk kültürü | tymm | 6 | SB.6.3.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-6 | İslamiyet'in doğuşu ve yayılışı | tymm | 0 | SB.6.3.2 | tam | tam | yüzeysel | Uydu |
| jr_06_sosyal-7 | Türklerin İslamiyet'i kabulü ve ilk Türk-İslam devletleri | tymm | 10 | SB.6.3.3, SB.6.3.4 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-8 | İpek Yolu ve kültürel etkileşim | tymm | 3 | SB.6.6.1 | tam | tam | tam | Üç aşama |
| jr_06_sosyal-9 | Mutlak konum ve göreceli konum | tymm | 6 | SB.6.2.1 | tam | tam | tam | Üç aşama |
| jr_06_sosyal-10 | Türkiye'nin coğrafi konumu ve iklim çeşitliliği | tymm | 3 | SB.6.2.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-11 | Türkiye'nin yeryüzü şekilleri ve bitki örtüsü | tymm | 3 | SB.6.2.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-12 | Ülkemizin kaynakları ve ekonomik faaliyetler | tymm | 6 | SB.6.5.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-13 | Doğal kaynaklarımız ve sürdürülebilirlik | tymm | 0 | SB.6.5.1 | tam | tam | tam | Uydu |
| jr_06_sosyal-15 | Nitelikli insan gücü ve meslek seçimi | tymm | 6 | SB.6.5.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-16 | Demokrasinin gelişimi ve yönetim biçimleri | tymm | 3 | SB.6.4.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-17 | Haklarımızın güvencesi: anayasa ve demokrasi | tymm | 3 | SB.6.4.2 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-18 | Devletin organları | tymm | 3 | SB.6.4.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-20 | Ülkeler arası ticaret ve kültürel etkileşim | tymm | 3 | SB.6.6.1 | tam | tam | yüzeysel | Seviye altı |
| jr_06_sosyal-21 | Toplumsal sorunu müzakere | tymm | 5 | SB.6.1.3 | tam | tam | tam | Üç aşama |
| jr_06_sosyal-22 | Türk dünyasıyla kültürel iş birliği | tymm | 6 | SB.6.2.3 | tam | tam | tam | Üç aşama |
| jr_06_sosyal-23 | İslam medeniyetinin ortak mirası | tymm | 6 | SB.6.3.2 | tam | tam | tam | Üç aşama |
| jr_06_sosyal-24 | Dijitalleşme ve vatandaşlık | tymm | 6 | SB.6.4.3 | tam | tam | tam | Üç aşama |
| jr_06_sosyal-25 | Yatırım ve pazarlama proje önerisi | tymm | 6 | SB.6.5.3 | tam | tam | tam | Üç aşama |
| jr_06_sosyal-26 | Telif ve patent | tymm | 5 | SB.6.6.2 | tam | tam | tam | Üç aşama |

## 7. Eksik içerik noktaları

Üç aşamayı kapatmayan yazılı dersler. Aynı cümledeki eksik, o dersin bir sonraki yazarlık işidir.

### Matematik

- **jr_06_mat-1** Çarpanlar, Katlar ve Bölünebilme — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-2** Asal sayılar ve asal çarpanlar — Seviye altı. Beceri sorusu tanıma sorusu. Yeni nesil soru bir bağlam, ikinci bir koşul ve çeldirici tuzak taşır.
- **jr_06_mat-3** Ortak bölen ve ortak kat — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-4** Ondalık gösterimi okumak — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-5** Kesir ile bölme, sonlu ve devirli ondalık — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-6** Standart uzunluk ölçü birimleri — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-7** Payda aynıyken toplama — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-8** Paydayı eşitleyerek toplama — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-9** Kesirlerde çarpma ve bölme — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-10** Ondalık sayılarla işlem — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-11** Cebirsel ifadeler — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-12** Sayı ve şekil örüntüsü — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-13** Cebirsel ifadede algoritma — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-14** İki paralel doğru ve bir kesenin açıları — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-15** İki kesenin oluşturduğu dörtgenler — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-16** Köşegenleri birbirini ortalayan dörtgenler — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-17** Üçgen ve dörtgenlerin açı problemleri — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-18** Alan ölçü birimleri ve arazi — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Alanla modellenen gerçek yaşam problemi.
- **jr_06_mat-19** Paralelkenar ve üçgenin alanı — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Alanla modellenen gerçek yaşam problemi.
- **jr_06_mat-20** Çember uzunluğu ile çap — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-21** Çember uzunluğu problemleri — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu, uygulama sorusunun aynı sayısal sonucunu kısa hikâyeye sarmış. İkinci koşul veya veri yorumu eklenmeli.
- **jr_06_mat-22** Merkez açı ve gördüğü yay — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-23** Veri toplama ve değerlendirme — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-24** Veri analizi — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Kategorik veya kesikli veriyle araştırma.
- **jr_06_mat-25** Başkasının istatistiksel yorumunu tartışma — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_mat-26** Gözleme dayalı olasılık — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.

### Fen bilimleri

- **jr_06_fen-1** Güneş sistemindeki gezegenler — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-2** Güneş ve Ay tutulması — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-9** Bileşke kuvvet — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-10** Sabit süratli hareket — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-12** Yoğunluk — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-16** Denetleyici ve düzenleyici sistemler — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-18** Sistemlerin sağlığı — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-19** İletken ve yalıtkan maddeler — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-20** Elektriksel direnç — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-25** İnsan üreme organları — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-27** İç salgı — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-32** Renk ve güneş enerjisi — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-33** Genleşme — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-34** Erime, donma ve kaynama — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_fen-35** Tümdengelim ve buzun yoğunluğu — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.

### Türkçe

- **jr_06_turkce-1** Gerçek, mecaz ve terim anlam — Seviye altı. Süreç bileşeni açık (T.6.1). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Okuma ve söz varlığı.
- **jr_06_turkce-2** Eş anlam, zıt anlam ve yakın anlamlı sözcükler — Seviye altı. Kazanım terimleri anlatımda yok: Dilimizin Zenginliği. Süreç bileşeni açık (T.6.1). Deney, model, ölçme veya tartışma adımı yok.
- **jr_06_turkce-3** Sözcükte çok anlamlılık ve söz varlığı — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Dilimizin Zenginliği. Süreç bileşeni açık (T.6.1). Deney, model, ölçme veya tartışma adımı yok.
- **jr_06_turkce-4** Söz sanatları — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Süreç bileşeni açık (T.6.1). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Okuma ve söz varlığı.
- **jr_06_turkce-5** Öznel ve nesnel anlatımlı cümleler — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Farklı Dünyalar. Kazanım terimleri anlatımda yok: Okuma ve söz varlığı.
- **jr_06_turkce-6** Neden-sonuç, amaç-sonuç ve koşul-sonuç cümleleri — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: İletişim ve Sosyal İlişkiler. Süreç bileşeni açık (T.6.4). Deney, model, ölçme veya tartışma adımı yok.
- **jr_06_turkce-7** Cümlede örtülü anlam ve cümle yorumlama — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Farklı Dünyalar. Süreç bileşeni açık (T.6.3). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Okuma ve söz varlığı.
- **jr_06_turkce-8** Paragrafta ana fikir ve konu — Seviye altı. Kazanım terimleri anlatımda yok: Bağımsızlık Yolu. Süreç bileşeni açık (T.6.2). Deney, model, ölçme veya tartışma adımı yok.
- **jr_06_turkce-9** Paragrafta yardımcı fikirler — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Bağımsızlık Yolu. Süreç bileşeni açık (T.6.2). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Okuma ve söz varlığı.
- **jr_06_turkce-10** Paragrafın yapısı — Seviye altı. Kazanım terimleri anlatımda yok: Bağımsızlık Yolu.
- **jr_06_turkce-11** Anlatım biçimleri ve düşünceyi geliştirme yolları — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_turkce-12** Metin türleri — Seviye altı. Kazanım terimleri anlatımda yok: Bağımsızlık Yolu. Süreç bileşeni açık (T.6.2). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Okuma ve söz varlığı.
- **jr_06_turkce-13** Deyimler ve atasözleri — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Dilimizin Zenginliği. Kazanım terimleri anlatımda yok: Okuma ve söz varlığı.
- **jr_06_turkce-14** İsim ve fiil kökü — Seviye altı. Uygulama yüzeysel. En az iki çözülmüş durum ve somut bir günlük iş eklenmeli. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Süreç bileşeni açık (T.6.4). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Cümle ve ek.
- **jr_06_turkce-15** Yapım ekleri ve sözcük türetme — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: İletişim ve Sosyal İlişkiler.
- **jr_06_turkce-16** İsim çekim ekleri — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: İletişim ve Sosyal İlişkiler. Süreç bileşeni açık (T.6.4). Deney, model, ölçme veya tartışma adımı yok.
- **jr_06_turkce-17** Büyük harfler ve sayıların yazımı — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Bilim ve Teknoloji. Süreç bileşeni açık (T.6.5). Deney, model, ölçme veya tartışma adımı yok.
- **jr_06_turkce-18** de, da, ki ve mi'nin yazımı — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Bilim ve Teknoloji.
- **jr_06_turkce-19** Nokta, virgül, noktalı virgül ve iki nokta — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Lider Ruhlar. Süreç bileşeni açık (T.6.6). Deney, model, ölçme veya tartışma adımı yok.
- **jr_06_turkce-20** Üç nokta, soru, ünlem, kesme ve tırnak — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Lider Ruhlar. Süreç bileşeni açık (T.6.6). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Yazım ve noktalama.

### İngilizce

- **jr_06_ing_main-1** Daily routines ve saati söylemek — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Personal Life. Süreç bileşeni açık (ENG.6.7). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Personal Life dil bilgisi.
- **jr_06_ing_main-3** Yiyecek, içecek ve likes, dislikes — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Personal Life. Süreç bileşeni açık (ENG.6.7). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Personal Life dil bilgisi.
- **jr_06_ing_main-5** Şehirde şu an ne oluyor — Seviye altı. Kazanım terimleri anlatımda yok: Life in the Neighbourhood and City. Süreç bileşeni açık (ENG.6.4). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Life in the Neighbourhood and City dil bilgisi.
- **jr_06_ing_main-7** Sunny, rainy ve cold — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Life in Nature and Global Problems. Süreç bileşeni açık (ENG.6.3). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Life in Nature and Global Problems dil bilgisi.
- **jr_06_ing_main-8** Happy, anxious ve scared — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Personal Life. Süreç bileşeni açık (ENG.6.7). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Personal Life dil bilgisi.
- **jr_06_ing_main-9** Universe: gelecekte will — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_ing_main-16** In, on, under, behind ve next to — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Life in the Neighbourhood and City. Süreç bileşeni açık (ENG.6.4). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Life in the Neighbourhood and City dil bilgisi.
- **jr_06_ing_main-17** Çevreyi korumak ve recycling — Seviye altı. Kazanım terimleri anlatımda yok: Life in Nature and Global Problems. Süreç bileşeni açık (ENG.6.3). Deney, model, ölçme veya tartışma adımı yok. Kazanım terimleri anlatımda yok: Life in Nature and Global Problems dil bilgisi.
- **jr_06_ing_main-20** Hak, sorumluluk ve sınıf kuralı — Seviye altı. Süreç bileşeni açık (ENG.6.1). Deney, model, ölçme veya tartışma adımı yok.

### Sosyal bilgiler

- **jr_06_sosyal-1** Değerlerimiz ve toplumdaki roller — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-2** Toplumsal uyum ve yardımlaşma — Uydu. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Tema saati 0. Bu dosya kazanımı kapatmaz. Üç aşama yine de tamamlanmalı.
- **jr_06_sosyal-3** Önyargıları kırıyoruz — Uydu. Tema saati 0. Bu dosya kazanımı kapatmaz. Üç aşama yine de tamamlanmalı.
- **jr_06_sosyal-4** Hak, sorumluluk ve özgürlük — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-5** İlk Türk devletleri ve Orta Asya Türk kültürü — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-6** İslamiyet'in doğuşu ve yayılışı — Uydu. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Tema saati 0. Bu dosya kazanımı kapatmaz. Üç aşama yine de tamamlanmalı.
- **jr_06_sosyal-7** Türklerin İslamiyet'i kabulü ve ilk Türk-İslam devletleri — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-10** Türkiye'nin coğrafi konumu ve iklim çeşitliliği — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-11** Türkiye'nin yeryüzü şekilleri ve bitki örtüsü — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı. Kazanım terimleri anlatımda yok: Doğal ve beşerî çevre ilişkisi.
- **jr_06_sosyal-12** Ülkemizin kaynakları ve ekonomik faaliyetler — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-13** Doğal kaynaklarımız ve sürdürülebilirlik — Uydu. Tema saati 0. Bu dosya kazanımı kapatmaz. Üç aşama yine de tamamlanmalı.
- **jr_06_sosyal-15** Nitelikli insan gücü ve meslek seçimi — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-16** Demokrasinin gelişimi ve yönetim biçimleri — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-17** Haklarımızın güvencesi: anayasa ve demokrasi — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-18** Devletin organları — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.
- **jr_06_sosyal-20** Ülkeler arası ticaret ve kültürel etkileşim — Seviye altı. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.

## 8. Yüzeysel anlatım uyarısı

Bu dersler Katman 1 tavanındadır. Tanım veya günlük örnek vardır; yardımcı kaynak omurgası açılmamıştır. Pratik kural, tuzak, zengin örnek ve yazılı soru tipinden en fazla biri duruyorsa ders burada kalır.

Katman 1 tavanı: 1 ders. Hepsi Katman 2 ve Katman 3'e çıkarılacak.

### Matematik

- **jr_06_mat-20** Çember uzunluğu ile çap. Pratik kural yok. Yazılıda kullanılacak işlem veya ayırt etme kuralı yazılacak. Tuzak uyarısı yok. Sınıf içi yanlışın adı warning alanında duracak. Soru tipi dar. Concept ve apply kısa tanıma çifti. Yazılı tipi en az iki şekil (hesap, karşılaştırma, olumsuz veya bağlam) ve biri çok koşullu olacak. Beceri sorusu bağlam ve iki adımlı çözüm taşımıyor. Günlük durum, veri veya metin içinden kurulmalı.

### Fen bilimleri

Bu derste Katman 1 tavanı yok.

### Türkçe

Bu derste Katman 1 tavanı yok.

### İngilizce

Bu derste Katman 1 tavanı yok.

### Sosyal bilgiler

Bu derste Katman 1 tavanı yok.

## 9. Katman 2 ve Katman 3'e çıkarılacak dersler

Katman 2 dört direk ister: pratik kural, tuzak uyarısı, zengin örnek, yazılı soru tipi. Dördü birden tam değilse omurga kısmi sayılır ve ders çizgiye çıkmaz. Katman 3 ancak omurga tamken kapanır.

Yükseltilecek yazılı ders: 111 / 111.

| Ders | Başlık | Tavan | Katman 1 | Katman 2 | Katman 3 | Eksik |
|---|---|---|---|---|---|---|
| jr_06_mat-1 | Çarpanlar, Katlar ve Bölünebilme | Katman 2 kısmi | tam | yüzeysel | yüzeysel | tuzak; soru tipi; Katman 3 |
| jr_06_mat-2 | Asal sayılar ve asal çarpanlar | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-3 | Ortak bölen ve ortak kat | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-4 | Ondalık gösterimi okumak | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-5 | Kesir ile bölme, sonlu ve devirli ondalık | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-6 | Standart uzunluk ölçü birimleri | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-7 | Payda aynıyken toplama | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-8 | Paydayı eşitleyerek toplama | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-9 | Kesirlerde çarpma ve bölme | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-10 | Ondalık sayılarla işlem | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-11 | Cebirsel ifadeler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-12 | Sayı ve şekil örüntüsü | Katman 2 kısmi | tam | yüzeysel | yüzeysel | zengin örnek; soru tipi; Katman 3 |
| jr_06_mat-13 | Cebirsel ifadede algoritma | Katman 2 kısmi | tam | yüzeysel | yüzeysel | zengin örnek; soru tipi; Katman 3 |
| jr_06_mat-14 | İki paralel doğru ve bir kesenin açıları | Katman 2 kısmi | tam | yüzeysel | yüzeysel | pratik kural; soru tipi; Katman 3 |
| jr_06_mat-15 | İki kesenin oluşturduğu dörtgenler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | zengin örnek; soru tipi; Katman 3 |
| jr_06_mat-16 | Köşegenleri birbirini ortalayan dörtgenler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-17 | Üçgen ve dörtgenlerin açı problemleri | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-18 | Alan ölçü birimleri ve arazi | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_mat-19 | Paralelkenar ve üçgenin alanı | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_mat-20 | Çember uzunluğu ile çap | Katman 1 | tam | yok | yüzeysel | pratik kural; tuzak; soru tipi; Katman 3 |
| jr_06_mat-21 | Çember uzunluğu problemleri | Katman 2 kısmi | tam | yüzeysel | yüzeysel | tuzak; soru tipi; Katman 3 |
| jr_06_mat-22 | Merkez açı ve gördüğü yay | Katman 2 kısmi | tam | yüzeysel | yüzeysel | pratik kural; soru tipi; Katman 3 |
| jr_06_mat-23 | Veri toplama ve değerlendirme | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-24 | Veri analizi | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_mat-25 | Başkasının istatistiksel yorumunu tartışma | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_mat-26 | Gözleme dayalı olasılık | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-1 | Güneş sistemindeki gezegenler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-2 | Güneş ve Ay tutulması | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-9 | Bileşke kuvvet | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-10 | Sabit süratli hareket | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-12 | Yoğunluk | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_fen-16 | Denetleyici ve düzenleyici sistemler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-18 | Sistemlerin sağlığı | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-19 | İletken ve yalıtkan maddeler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-20 | Elektriksel direnç | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-21 | Alınan yol ve yer değiştirme | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-22 | Üreme | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-23 | Büyüme | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-24 | Çimlenme | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-25 | İnsan üreme organları | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-26 | Canlılarda üreme ve büyüme | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-27 | İç salgı | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-28 | Ergenlik | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-29 | Yansıma ve normal | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-30 | Ayna çeşitleri | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-31 | Soğurulma ve beyaz ışık | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-32 | Renk ve güneş enerjisi | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-33 | Genleşme | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-34 | Erime, donma ve kaynama | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-35 | Tümdengelim ve buzun yoğunluğu | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_fen-36 | Ampul parlaklığının değişkenleri | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-37 | Biyoçeşitlilik ve tehditler | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_fen-38 | Yakıt ve çevre problemi | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_turkce-1 | Gerçek, mecaz ve terim anlam | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_turkce-2 | Eş anlam, zıt anlam ve yakın anlamlı sözcükler | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_turkce-3 | Sözcükte çok anlamlılık ve söz varlığı | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-4 | Söz sanatları | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-5 | Öznel ve nesnel anlatımlı cümleler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-6 | Neden-sonuç, amaç-sonuç ve koşul-sonuç cümleleri | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_turkce-7 | Cümlede örtülü anlam ve cümle yorumlama | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-8 | Paragrafta ana fikir ve konu | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_turkce-9 | Paragrafta yardımcı fikirler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-10 | Paragrafın yapısı | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_turkce-11 | Anlatım biçimleri ve düşünceyi geliştirme yolları | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-12 | Metin türleri | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_turkce-13 | Deyimler ve atasözleri | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-14 | İsim ve fiil kökü | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_turkce-15 | Yapım ekleri ve sözcük türetme | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-16 | İsim çekim ekleri | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_turkce-17 | Büyük harfler ve sayıların yazımı | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-18 | de, da, ki ve mi'nin yazımı | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-19 | Nokta, virgül, noktalı virgül ve iki nokta | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_turkce-20 | Üç nokta, soru, ünlem, kesme ve tırnak | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_ing_main-1 | Daily routines ve saati söylemek | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_ing_main-2 | Family Life: ailem ve have got | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_ing_main-3 | Yiyecek, içecek ve likes, dislikes | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_ing_main-4 | Family Life: evde rutin işler | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_ing_main-5 | Şehirde şu an ne oluyor | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_ing_main-6 | Universe: gökyüzü ve there is | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_ing_main-7 | Sunny, rainy ve cold | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_ing_main-8 | Happy, anxious ve scared | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_ing_main-9 | Universe: gelecekte will | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_ing_main-10 | World and Culture: ülke ve milliyet | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_ing_main-11 | World and Culture: kutlama ve yemek | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_ing_main-16 | In, on, under, behind ve next to | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_ing_main-17 | Çevreyi korumak ve recycling | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_ing_main-20 | Hak, sorumluluk ve sınıf kuralı | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-1 | Değerlerimiz ve toplumdaki roller | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-2 | Toplumsal uyum ve yardımlaşma | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-3 | Önyargıları kırıyoruz | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-4 | Hak, sorumluluk ve özgürlük | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-5 | İlk Türk devletleri ve Orta Asya Türk kültürü | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-6 | İslamiyet'in doğuşu ve yayılışı | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-7 | Türklerin İslamiyet'i kabulü ve ilk Türk-İslam devletleri | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-8 | İpek Yolu ve kültürel etkileşim | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-9 | Mutlak konum ve göreceli konum | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-10 | Türkiye'nin coğrafi konumu ve iklim çeşitliliği | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-11 | Türkiye'nin yeryüzü şekilleri ve bitki örtüsü | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-12 | Ülkemizin kaynakları ve ekonomik faaliyetler | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-13 | Doğal kaynaklarımız ve sürdürülebilirlik | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-15 | Nitelikli insan gücü ve meslek seçimi | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-16 | Demokrasinin gelişimi ve yönetim biçimleri | Katman 2 | tam | tam | yüzeysel | Katman 3 |
| jr_06_sosyal-17 | Haklarımızın güvencesi: anayasa ve demokrasi | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-18 | Devletin organları | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-20 | Ülkeler arası ticaret ve kültürel etkileşim | Katman 2 kısmi | tam | yüzeysel | yüzeysel | soru tipi; Katman 3 |
| jr_06_sosyal-21 | Toplumsal sorunu müzakere | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-22 | Türk dünyasıyla kültürel iş birliği | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-23 | İslam medeniyetinin ortak mirası | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-24 | Dijitalleşme ve vatandaşlık | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-25 | Yatırım ve pazarlama proje önerisi | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |
| jr_06_sosyal-26 | Telif ve patent | Katman 2 kısmi | tam | yüzeysel | tam | soru tipi; omurga açıkken Katman 3 sayılmaz |

## Ölçü

Mantık kuralları şunlardır: üslü ifadede Lego, tuğla veya sayılı kat/kule; üst üste ekleme; kavramda paydaları toplama; işlem sırasında toplamayı çarpmadan önce sayma; kümede aynı elemanı iki kez yazma. Kâğıt katlama tekrarlı ikiye bölme olduğu için üslü ifadede doğru model sayılır ve işaretlenmez.

Yüzeysel anlatım, Katman 1 tavanıdır. Katman 2 tam sayılması için dört direk birden gerekir. Yazılı soru tipi, concept ve apply kısa «nedir / hangisi» çiftiyse kapalı kalır; en az iki şekil ve biri çok koşullu soru aranır. Katman 3, doksan karakterden kısa bir «hangisi» tanıması veya uygulama sorusunun aynı sayısını kısa hikâyeye saran beceri sorusuyla kapanmaz.

Betik `verify:prebuild` zincirinde değildir. `--strict` mantık veya benzetme bulgusunda çıkış kodunu 1 yapar. Katman eksiği rapora yazılır, çıkış kodunu değiştirmez. Rapor her çalıştırmada bu dosyanın üzerine yazılır.
