# Terzi usulü video promptları — Faz 33

SUPER_ADMIN,

14 sözsüz kaset için genel kuyruk metni kopyalanmadı. Her dosya, `packages/junior-content/topics/` içindeki senaryo cümlesi ile `components/junior/player/` sahne kodunun o adımdaki etiketinden yazıldı. Oynatıcı adımı 1 tabanlıdır; sahne beat’i adım eksi birdir. Video, o beat’te vektörün üstüne biner (`JuniorScenePlate`).

Gemini’ye yapıştırılacak blok her dosyada «Aşağıdaki blok Gemini arayüzüne yapıştırılır.» satırının altındadır. Süre 8 saniye, çerçeve 16:9, söz ve müzik yok. Etiketler ders metnindeki Türkçe ile yazılır. Yaş notu ve «10-12» resme boyanmaz.

Doğrulama: `public/media/junior/scenes/` altında 14 `*.prompt.txt` duruyor. Eksik yok.

| Sıra | Video adı | Prompt dosyası | Adım | Kaynak |
|---|---|---|---|---|
| 1 | `jr_06_fen-1_sahne6_saturn_halka` | `public/media/junior/scenes/jr_06_fen-1/step-6.prompt.txt` | 6 | örnek |
| 2 | `jr_06_fen-2_sahne3_gunes_tutulmasi` | `public/media/junior/scenes/jr_06_fen-2/step-3.prompt.txt` | 3 | kavram, gündüz yarısı |
| 3 | `jr_06_fen-2_sahne6_ay_tutulmasi` | `public/media/junior/scenes/jr_06_fen-2/step-6.prompt.txt` | 6 | örnek, gece yarısı |
| 4 | `jr_06_fen-3_sahne2_kas_kemik` | `public/media/junior/scenes/jr_06_fen-3/step-2.prompt.txt` | 2 | günlük kullanım |
| 5 | `jr_06_fen-4_sahne3_sindirim_yolu` | `public/media/junior/scenes/jr_06_fen-4/step-3.prompt.txt` | 3 | kavram |
| 6 | `jr_06_fen-5_sahne5_iki_dolasim` | `public/media/junior/scenes/jr_06_fen-5/step-5.prompt.txt` | 5 | çizim köprüsü + kavram |
| 7 | `jr_06_fen-7_sahne4_alveol_alyuvar` | `public/media/junior/scenes/jr_06_fen-7/step-4.prompt.txt` | 4 | özet 2 |
| 8 | `jr_06_fen-8_sahne5_bobrek_suzgec` | `public/media/junior/scenes/jr_06_fen-8/step-5.prompt.txt` | 5 | çizim köprüsü + özet 2 |
| 9 | `jr_06_fen-11_sahne4_kati_sivi_gaz` | `public/media/junior/scenes/jr_06_fen-11/step-4.prompt.txt` | 4 | özet 2 |
| 10 | `jr_06_fen-14_sahne3_boslukta_ses_yok` | `public/media/junior/scenes/jr_06_fen-14/step-3.prompt.txt` | 3 | kavram |
| 11 | `jr_06_fen-16_sahne6_refleks_hormon` | `public/media/junior/scenes/jr_06_fen-16/step-6.prompt.txt` | 6 | örnek |
| 12 | `jr_06_fen-9_sahne6_bileske_ok` | `public/media/junior/scenes/jr_06_fen-9/step-6.prompt.txt` | 6 | örnek |
| 13 | `jr_06_fen-10_sahne5_sabit_surat` | `public/media/junior/scenes/jr_06_fen-10/step-5.prompt.txt` | 5 | çizim köprüsü + 120/40/3 |
| 14 | `jr_06_mat-24_sahne5_prizma_hacim` | `public/media/junior/scenes/jr_06_mat-24/step-5.prompt.txt` | 5 | çizim köprüsü + 4×3×2 |

Adım 5’in söylenen cümlesi «Hadi şimdi ekrandaki çizime birlikte bakalım!»dır. O dört kaset (fen-5, fen-8, fen-10, mat-24) köprüyü değil, o beat’te ekranda duran çizimin ders adlarını taşır.

## Genel prompttan ayrılan yerler

Bunlar `docs/IC_MEDYA_ABC_ANALIZI.md` bölüm 5’teki ortak metinle çelişen, bu turda ders cümlesine çekilen noktalardır.

1. **fen-1, adım 6.** Örnek sekizi sayar, Jüpiter’i en büyük, Satürn’ü halkalı, Ay’ı uydu, Plüton’u cüce gezegen sayar. Sahne alt yazısı «Satürn vurgulanır.» Güneş’e «yıldız» etiketi bu adımda yok. «Ay uydu, sıraya yazılmaz» beat 7 yazısıdır; bu kaset «Ay uydudur» ve «Plüton cüce gezegendir» der.
2. **fen-2, adım 3.** Kavram, Ay’ın yeni ay evresinde ve Güneş ile Dünya arasında olduğunu söyler. Çıplak göz kartı bu adımda yoktur; sahne onu beat 7’de açar.
3. **fen-2, adım 6.** Örnek üç top kurar: büyük sarı Güneş, orta mavi Dünya, minik gri Ay. Kapanış «Her yeni ayda ya da her dolunayda tutulma gerçekleşmez.» Dolunay bu cümlede durur.
4. **fen-3, adım 2.** Günlük cümle çanta, omurga ve dinlenen eklemdir. Beat 1 kas elipsini, «Kas çeker»i ve kıkırdağı çizmez. Pazı kasılması örnek adımıdır (adım 6); bu kasete alınmadı.
5. **fen-4, adım 3.** Kavram yolu ağız, mide, ince bağırsaktır. Fiziksel ve kimyasal ayrılır. Safra enzim değildir. Elma, yemek borusu ve kalın bağırsak bu adımda yoktur.
6. **fen-5, adım 5.** Dört odacık, küçük dolaşım (sağ karıncıktan akciğer atardamarı, oksijence fakir, sol kulakçık) ve büyük dolaşım (sol karıncıktan aort, sağ kulakçık). Alyuvar, akyuvar ve pulcuk örnek adımındadır.
7. **fen-7, adım 4.** Söylenen cümle şudur: «Soluk alınca diyafram kasılır ve göğüs genişler. Soluk verince diyafram gevşer.» Sahne «Diyafram kasılır» ve «Hava yolu açık» yazar. Alveol ve alyuvar bu cümlede yoktur; «Alveollerde gaz değişimi» beat 5 yazısıdır. Katalog adı durur, görüntü diyaframa uyar.
8. **fen-8, adım 5.** Yol «üreter borusu», «idrar kesesi», «üretra kanalı». Beat 4 notu «Ter ayrı yoldur». Deri, akciğer ve kalın bağırsak sönük yardımcıdır.
9. **fen-11, adım 4.** Özet cümlesi yalnız katı ve sıvıyı karşılaştırır: katının şekli ve hacmi bellidir; sıvının hacmi belli, şekli kabına uyar. Gaz ve «Görmemek yok demek değildir» bu adımda yoktur.
10. **fen-14, adım 3.** Kavram sırası katı en hızlı, sıvı daha yavaş, gaz en yavaş, sonra uzay boşluğudur. Alt yazı «Titreşim madde ister.» Işık «saniyede üç yüz bin kilometre». Cetvel ve meteor örnek adımındadır.
11. **fen-16, adım 6.** Sıcak nesne sobadır. Refleks omuriliktedir; beyin sonra yanar. Hipofiz büyüme hormonunu yavaş verir. Böbrek üstü bezleri adrenalin salgılar. Çaydanlık karşılama cümlesindedir.
12. **fen-9, adım 6.** Dört durum da örnekte durur: 5 ve 3 newton sağa → 8 newton sağa; 7 sağa ve 4 sola → 3 newton sağa; 6 ve 6 → bileşke 0, kutu kıpırdamaz; 8 sağa ve 2 sola → 6 newton sağa, kutu sağa hızlanır, dengelenmemiş. Birim sözcüğü newtondur.
13. **fen-10, adım 5.** İşlem 120 metre, 40 saniye, 3 metre bölü saniye. Eksenler «yol» ve «zaman». Başlık «Yol zamanla artar». Sürat-zaman yatay doğrusu beat 5’tedir; bu kasete girmez. Yol ile zaman çarpılmaz.
14. **mat-24, adım 5.** Ekran formülü «V = 4 × 3 × 2 = 24 cm³». En 4 cm, boy 3 cm, yükseklik 2 cm. 4 çarpı 3, 12 santimetrekarelik taban alanıdır. Hacim 24 santimetreküptür. Kenarı 3 cm olan küp bu ekranda yoktur.

## Bu turda yapılmayan iş

Video üretilmedi. Gemini arayüzüne yapıştırma ve `step-N.mp4` kaydı sizin onayınızı bekler. `.system_docs/AKADEMI_URETIM_ANAYASASI.md` model satırına dokunulmadı.
