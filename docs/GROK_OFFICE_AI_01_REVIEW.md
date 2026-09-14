# GROK 4.6 — Tarafsız İnceleme: `01_office_ai-1` Altın Şablon

> **Denetçi:** Grok 4.6 (Cursor; reji ve ürün başkanı varsayımıyla dış göz)
> **Tarih:** 14 Eylül 2026
> **Kapsam:** `http://localhost:3000/academy/01_office_ai/oyna` → 1. ders (`01_office_ai-1` / «Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo»)
> **Mühür:** `docs/curriculum/01_office_ai_01_cue.json` → `durationSec: 557.2`, `seal: 5bdbb870f062`, TTS `gemini-3.1-flash-tts-preview` / Callirrhoe
> **Yöntem:** Senaryo, cue, parça saati, görsel sahne kodu, Veo kaseti, Lyria ducking matematiği ve vatandaş vitrini çapraz okundu. Canlı `/oyna` bu oturumda **giriş + satın alma kapısına** takıldı (`requirePageSession` → `/login?next=…`); bu yüzden Callirrhoe kaseti hoparlörden uçtan uca dinlenmedi. İnceleme, kayıtlı vatandaşın gördüğü **aynı bileşen ağacına** (`LessonCinemaEyeLayer` + `LessonExcelWorkspace` + `LessonKaraokeStrip` + `LessonMediaPlayer`) + kamu plakalarına + Veo son karesine dayanır. Ses süresi, 192 kbps varsayımıyla `13.374.189` bayt → **~557.26 sn** — mühürle örtüşür.

---

## 0. HÜKÜM (önce karar)

**Ders 1 olarak yayınlık omurga: evet. 29 dersin Altın Şablonu olarak mühür: hayır. TAMAM demiyorum.**

Bu paket bir vatandaş dersinin *iskeletini* doğru kuruyor: tek refleks (A1), SEN dili, punchcard disiplini, 2.0 sn giriş nefesi, canlı Excel kromu, Beat 3’te gerçek Önce/Sonra. Aynı paket, kopyalanacak bir *anayasa* olarak henüz tehlikeli: görsel ritim doktrini ile kaset ritmi çelişiyor, Command sahnesi sonucu erken spoiler’lıyor, TTS vatandaş dilini jargonla şişiriyor, «3–5 sn nefes» kâğıtta var kasetta yok.

| Boyut | Not | Skor |
|---|---|---|
| Pedagojik omurga (A1 refleksi, SEN, 4-beat) | Akılda kalır, ofise taşınır | 8.5 / 10 |
| Sürükleyicilik (vatandaş 9 dk) | Güçlü açılış, uzun statik orta | 6.5 / 10 |
| Ses–göz örtüşmesi («Garsonu Göster») | Split anında yüksek; Command’da düşük | 6.0 / 10 |
| Mühür / kaset tutarlılığı (557.2) | Cue, timings, oynatıcı, Dron saatleri kilitli | 9.0 / 10 |
| Altın Şablon olarak kopyalanabilirlik | Doktrin çelişkileri 29’a çoğalır | 5.0 / 10 |
| **Toplam (ders)** | | **7.1 / 10** |
| **Toplam (şablon)** | | **5.4 / 10** |

---

## 1. GENEL DEĞERLENDİRME

Soru: *%80 canlı Excel, 2.0 sn intro nefesi, dikey split-screen, kayan karaoke — vatandaş için ne kadar sürükleyici ve öğretici?*

### 1.1 Sürükleyicilik — «iyi bir televizyon dersi, zayıf bir usta-çırak masası»

Vatandaşın ilk 10 saniyesi sinema gibi kurulmuş. 0–2 sn yalnız Lyria + logo; punchcard yok; Gözde 2.0’de giriyor. Bu, YouTube eğitimlerinin «hemen konuşmaya başla» telaşına kıyasla olgun bir nefes. Cue-01 Veo 3.1 B-roll (8 sn, ~5 Mbps, ofis alacakaranlığı + dizüstü Excel) mood olarak işe yarıyor: «masandaki yığın» hissi var.

Sonra ritim kırılıyor. Veo `punch` 8 sn; kod kartı cue-01 bitene kadar (~41. sn) **donmuş son karede** tutuyor. PEDAGOJI «8 sn Veo, sonra canlı Excel» diyor; kaset «8 sn Veo + ~30 sn hayali Excel freeze» basıyor. Freeze karesindeki tablo da dersin `Tahsilat_Mart_2026` öyküsü değil — Veo’nun uydurduğu İngilizce/bozuk krom. Warm-up anlatısı «dijital ofis asistanı» kurarken göz, dersin masasına ait olmayan bir sahneye bakıyor.

Cue-02’den itibaren sahne gerçekten Excel: şerit, `fx`, isim kutusu, A1 çerçevesi. «Soyut kart yok» iddiası burada tutuluyor. Sürükleyicilik burada **masaya oturtuyor**; fakat masa 70–109 saniye aynı karede kalıyor. Karaoke şeridi ve sağ üst rozet hareket ediyor, ızgara etmiyor. Vatandaş «anlatılıyor» hissi alır, «yapılıyor» hissi almaz.

### 1.2 Öğreticilik — A1 refleksi güçlü, aktarım yarım

Öğrenme hedefi tek ve doğrudur: düzensiz tabloyu yapay zekâya vermeden önce A1’i sütun adı yap, birleşikleri çöz, türleri tek tip söyle. Bu, ofis çalışanının pazartesi sabahı kullanacağı bir refleks. Üç kural `CEBİNE KOY`’da hem kulakta hem (canlı DOM’da) yeşil checklist olarak duruyor — pekiştirme durağının işitsel + görsel çifti doğru.

Zayıf yer aktarım. «SIRA SENDE» ödevi ekran dışına atıyor («masaüstündeki en düzensiz tabloyu seç»). Oynatıcının içinde tek satır pratik yok. Split-screen farkı *gösteriyor*; vatandaş farkı *kendisi üretmiyor*. Bilişsel aktarım araştırması net: izlenen kontrast, yapılan kontrasttan daha zayıf kalır.

### 1.3 %80 canlı Excel iddiası — oran tutuluyor, içerik tutulmuyor

`data-academy-waiter-ratio="80"` bir CSS hesabı değil; doktrin damgası. Pratikte Excel masası sahneyi neredeyse dolduruyor (`inset: 3.15rem 0.7rem 3.55rem`), sinema çerçevesi %28 opaklıkta fon. Konuşma penceresinin ~%92’si (cue-02…08, ~515 sn / 557 sn) canlı ızgarada. **Oran olarak %80 iddiası cömert bile değil — sahne daha agresif «garsonu göster». Sorun oran değil, *hangi Excel’in* gösterildiği.**

| Cue | Süre | Vatandaşın gördüğü | Anlatının istediği | Örtüşme |
|---|---|---|---|---|
| 01 GİRİŞ KÖPRÜSÜ | 2.00–41.32 (39.3 sn) | 8 sn Veo + ~30 sn donmuş uydurma Excel | Refleksi hatırla | Düşük |
| 02 HOŞ GELDİN | 41.72–125.08 (**83.4 sn**) | Boş `Kitap1.xlsx` + AI masası | Karmaşık tablo + dört kapı | Orta |
| 03 DÜZENSIZ TABLO | 125.48–195.24 (69.8 sn) | Birleşik afiş, boş satır, üç dilli tarih | Ham veri / dağınık yapı | **Yüksek** |
| 04 A1 HÜCRESİ | 195.64–266.52 (70.9 sn) | **Zaten temiz** tablo, kocaman A1=`Tarih` | A1’i *düzelt* | **Spoiler** |
| 05 TEMİZLE ŞİMDİ | 266.92–375.88 (**109.0 sn**) | Temiz ızgara + Copilot paneli | Temizleme + üç aktarım yolu | Yarım |
| 06 FARK ORTADA | 376.28–446.60 (70.3 sn) | Dikey split: ÖNCE / SONRA | «Ekrandaki bölünmüş görüntü» | **Yüksek** |
| 07 CEBİNE KOY | 447.00–486.20 (39.2 sn) | Temiz tablo + 3 adım overlay | Üç altın kural | Yüksek |
| 08 SIRA SENDE | 486.60–557.20 (70.6 sn) | Aynı temiz tablo (zoom A1) | Saha görevi | Düşük / tekrar |

Beat 3 (Comparison) doygunluk hedefi `production-standard.ts` içinde **3.5 dk**; kaset **~1.2 dk**. Warm-up (hedef 1.5 dk) **~3.2 dk**. Altın Şablon’un 4-beat matematiği tersine şişmiş: boğaz temizliği uzun, asıl kontrast kısa.

### 1.4 2.0 sn intro nefesi — onay

Zincir üç katmanda kilitli:

- `ACADEMY_INTRO_GENERIC_SEC = 2`; `academyLessonIntroIsActive` yalnız `0 ≤ t < 2`
- İlk cue/parça `start: 2`; `t < 2` iken punchcard `null`
- Ducking: `t=0.5` → 0.46 (jenerik), `t=2` eşik, `t=8` → 0.12 (konuşma dibi)

Bu, «jenerik çekilir, hoca girer» hissi için doğru. **Vatandaş yüzü zayıf:** intro başlığı `01_OFFICE_AI` — SKU kodu, insan cümlesi değil. 2 saniyede «Ofiste Yapay Zekâ» veya ders adı daha çok işe yarar.

### 1.5 Dikey split-screen — pedagojinin en net anı

Canlı sahne `grid-template-columns: 1fr 1fr` (dikey ayırıcı; yan yana iki Excel). Sol turuncu `ÖNCE (DÜZENLEMESİZ)` = cue-03 birleşik afiş + boş satır + `12 450` / `8.200 TL` / `Mart-12`. Sağ yeşil-neon `SONRA (AI İLE)` = tek tip tarih, `12.450,00`, `Toplam 54.650,00`, A1 ışıldar. Anlatı («sol tarafta… sağ tarafta…») sahneyle birebir. **Fark hissedilir. Bu beat, şablonun korunması gereken çekirdeği.**

İki çekince:

1. Split, Command beat’inde temizlik *zaten gösterildikten sonra* geliyor. Sürpriz yok; teyit var. Öğrenme psikolojisinde teyit, keşiften zayıf.
2. Kamu JPG `01_office_ai-1-cue-6.jpg` split değil; tek «sonra» tablosu. Vatandaş DOM’u görür, plaka yalan söyler. Bake plakaları canlı sahnenin SSOT’si değil — bunu şablon sözleşmesine yazmazsanız 29 derste plaka/DOM ayrışması çoğalır.

Mobil: iki ızgara yan yana kalıyor; etiket `0.5rem`. 390 px’te «fark» okunur olmaktan çıkar. Altın şablon mobil yığına (`grid-template-rows`) geçmeli.

### 1.6 Kayan karaoke şeridi — erişilebilir, senkronu yaklaşık

Şerit görselin *altında* (teleprompter ızgaranın üstüne binmiyor; `captions={false}`). Cue metni ekranda `ChatGPT` / `A1` / `F2` olarak duruyor; TTS fonetiği (`Çetcipiti`, `A bir`, `Ef iki`) kulağa gidiyor. Bu ayrım doğru: vatandaş terimi *görsün*, model *okuyabilsin*.

Kelime vurgusu ise **harf-ağırlıklı paylaşım**; gerçek konuşma hizası değil (`lesson-cues` yorumu bunu açık söylüyor). 40–50 sn’lik paragraflar cümleye bölünüyor, yine de uzun Türkçe cümlede vurgu kayar. Karaoke «şarkı sözü gibi kilitli» değil, «tahmini alt yazı». 29 derse bunu altın kural diye basarsanız, vatandaş «yazı hoparlörden geri» hissi alır.

---

## 2. «SEN OLSAYDIN NE YAPARDIN?»

Reji ve platformun başında olsam, öğrenme kalitesi / motivasyon / aktarım için şunları **ders 1’e basmadan önce** değiştirirdim. Bunlar süs değil; şablonun DNA’sı.

### 2.1 Görseli anlatının *arkasından* değil *önünden* yürüt

Command beat (cue-04/05) **dağınık tabloda** kalsın. A1 zoom, birleşik afişi hâlâ gösterirken yapsın: vatandaş « sorunun kalbi burası» desin. Temiz tablo yalnız Beat 3 sağ panele ve Beat 4’e ait. Bugünkü kaset, sihri bitmiş pastayı 3 dakika gösterip sonra «farkı gör» diyor.

Mikro-reji (her 8–12 sn, PEDAGOJI’nin 5–8 sn’sine yakın):

1. Birleşik afiş (A1:F1) — kırmızı nabız
2. A1 isim kutusu zoom — afiş hâlâ duruyor
3. Afiş çözülür, satır 1 gerçek başlık olur
4. Boş satır silinir (satır kayması)
5. `Tutar` sütunu tek tipe döner
6. Split wipe

Bu, «izleme»yi «işlem görme»ye çevirir. 29 dersin sözleşmesi bu olmalı: **her cümle bir hücre hareketi**.

### 2.2 Karşılaştırmayı uzat, ısınmayı kısalt

Warm-up’ı ~90 sn’ye çek (Veo 8 sn + *hemen* canlı boş kitap, freeze yok). Comparison’ı 2.5–3.5 dk yap: önce split, sonra sağ panede üç kuralı tek tek yak. Doygunluk tablosu (`1.5 / 3.5 / 3.5 / 1.5`) kâğıtta duruyor; kaset onu tersine şişirmiş. Şablon, dakika bütçesini testle kilitlemeli.

### 2.3 «Nefes»i ya gerçekten kes ya iddiayı sil

Bugün iki anayasa çatışıyor:

- `PEDAGOJI.md`: konuşma aralarında **3–5 sn** nefes; Lyria yükselir.
- `tts-breath-chunks.ts`: **3–5 sn mikro dilim YASAK**; parçalar arası **0.3–0.5 sn** sessizlik. Kaset `pauseSec: 0.4`.

Ducking matematiği 3–5 sn’lik boşlukta 0.12→0.46 yükselsin diye yazılmış; boşluk 0.4 sn. Müzik aralarda «nefes alamaz». Yükseliş yalnızca 0–2 sn jenerikte, `CEBİNE KOY`’un tamamında (konuşmanın üstünde 0.46) ve kapanış 3 sn’sinde çalışıyor.

**Kararım:** Beat sınırlarında 1.8–2.2 sn gerçek sessizlik (öğrenci yutsun). Paragraf içinde 0.4 sn kalsın. `CEBİNE KOY` dip kazancı **0.28** — kuralı müzik değil Gözde taşısın. Doktrini kasetle eşitlemeden 29 ders basmayın.

### 2.4 Saha görevini oynatıcının *içine* al

60–90 sn’lik «sen dene» durağını kasetin içine göm:

- 6 satırlık dağınık tabloyu kopyala (tek düğme)
- Yapıştırma alanı + «üç cümlelik hazır istem»
- Vatandaşın çıktısı ile sağ panel yan yana

Sınav, izlenen F2 efsanesini değil, az önce yapılan işi sorsun. Motivasyon «tebrikler, izledin» değil «bak, senin tablon konuştu».

### 2.5 Tek kapıda *yap*, dört kapıda *söyleme*

ChatGPT / Claude / Gemini / API dörtlüsü iki kez slogan olarak geçiyor. Vatandaş hangisine gideceğini hâlâ bilmez. L1’de **bir** yol göster (kopyala-yapıştır + yalın istem), diğer kapıları bir cümleyle «aynı talimat» diye kapat. Derin kapı farkını 2–5. bölüme bırak. «Özel Uygulama Programlama Arayüzü (API)» diye *okutmak*, sıfır jargon yeminini bozar.

### 2.6 Karaoke’yi ya hizala ya sadeleştir

Kelime vurgusu tahmini olduğu sürece aktif kelimeyi yakmasın; cümle şeridi yeter. Ya da bake’de cümle sonu timestamp’i gerçek sessizlikten ölçülsün. Yanlış yanan karaokeden iyisi, yanmayan karaoke.

### 2.7 Intro ve vitrin vatandaşça konuşsun

- Intro: `01_OFFICE_AI` değil, «Ofiste Yapay Zekâ» / ders adı.
- Vitrin özeti bugün «Excel formül sihirbazlığı» diyor; ders 1 formül öğretmiyor, A1 eşiği öğretiyor. Amiral kart vaadi ile kaset vaadi ayrışmasın.

### 2.8 «Temiz tablo»ya Toplam satırı koyma

Sağ paneldeki `Toplam` satırı, az önce öğretilen kuralı çiğner: `Tarih` sütununa «Toplam» yazmak, yapay zekânın tekrar şaşıracağı karışık türdür. Altın örnek dikdörtgen olsun; toplam ayrı özet kutusunda dursun. Aksi halde 29 ders «temiz» diye bozulmuş tablo basar.

---

## 3. TESPİTLER

Şiddet: **P0** şablon mühürünü bloklar · **P1** öğrenme/vaat kalitesini düşürür · **P2** miksaj/üretim borcu · **P3** mikro.

### P0 — şablonu 29’a kopyalamadan çöz

1. **Doktrin–kaset çelişkisi (nefes).** PEDAGOJI 3–5 sn nefes + görsel odak 5–8 sn; TTS 0.4 sn ara + cue başına 70–109 sn statik ızgara. Altın Şablon, çelişkili anayasayı çoğaltır.
2. **Command spoiler.** cue-04/05 temiz tabloyu Beat 3’ten önce basıyor. «Fark» sahnesi teyit olur, keşif olmaz. Şablonun görsel sözleşmesi (`lesson-beat-visual.ts` Beat 2 = yöntem *uygulanırken*) ihlal ediliyor.
3. **TTS vatandaş dilini şişiriyor.** Parça metni `Uygulama Programlama Arayüzü (API)` ve `bir Özet Tablo (Pivot) tabloya` okutuyor. İkincisi dilbilgisi olarak «tablo tabloya». Karaoke `API` / `pivot tabloya` gösteriyor — kulak ile göz ayrışıyor. Sıfır jargon yemini kasetta tutulmuyor.

### P1 — ders kalitesi

4. **Veo hold.** 8 sn B-roll iyi; 10–41 sn donmuş uydurma Excel, «statik plaka yok» iddiasını fiilen geri alıyor.
5. **Saha görevi ekran dışında.** Aktarım ödev; pratik yok. Mini sınav 3 soru / baraj 70 ⇒ **3/3 zorunlu** (2/3 = %66.7). L1 için kaygı üretir. F2 apostrof tek cümlede geçiyor, sahnede hiç görünmüyor; ölçülen davranış gösterilmiyor.
6. **Rozet yazımı: `DÜZENSIZ`.** Türkçe büyük harf `DÜZENSİZ`. Sorunun adı, 8 rozetten biri, Dron’da da aynı. Altın şablonun vitrin kelimesi yazım hatası taşıyamaz.
7. **«Temiz» örnek kirli.** Toplam satırı + cue-08 katalog maddesi «50 satır seç» (ses «birkaç satır»). Ölü slayt alanı / çelişen talimat.
8. **Vitrin vaadi.** Kurs özeti formül sihirbazlığı + KVKK; ders 1 A1 eşiği. Amiral SKU’nun ilk izlenimi kasetle örtüşmüyor. Kurs sayfasında Next hydration «1 Issue» rozeti de altın vitrini zedeliyor.

### P2 — üretim / miksaj

9. **`CEBİNE KOY` ducking 0.46.** Konuşma dibi 0.12’nin 3.8 katı. En önemli 39 sn’de müzik kuralı ezer. Pekiştirme durağını «duy, ezberle» diye tasarladıysanız kazanç ters.
10. **`A1 eşiğini` fonetikte yok.** «A1 hücresi» → «A bir hücresi»; çıplak `A1 eşiğini` kasetta olduğu gibi kalmış. Callirrhoe’nin `A1`’i nasıl okuduğu kasta bağlı — şablon sözlüğüne eklenmeli.
11. **Cinema JPG bake geride.** cue-03 plakasında birleşik hücre hâlâ `A1:F1 birleşik afiş — tablo değil.` (meta not). Canlı DOM `formulaBar` (`Mart 2026 Tahsilat Dökümü`) basıyor. cue-06/07 plakaları split/checklist taşımıyor. Ya plakayı yeniden mühürleyin ya «vatandaş DOM’dur, JPG bake artığıdır» diye sözleşmeye yazın.
12. **Bake SOP bayat.** `scripts/bake-office-ai-01-sealed-pack.ts` hâlâ «Tam 14 paragraf» diyor; kaset **15** paragraf / 15 parça. 10–12 istek hedef bandının üstünde; mühür kotayı eziyor.

### P3 — mikro

13. Intro SKU kodu (`01_OFFICE_AI`).
14. Karaoke kelime-saati yaklaşık.
15. Split mobil yığılmıyor.
16. `/oyna` giriş duvarı — inceleme oturumunda kayıtlı görünen krom ile `requirePageSession` çelişkisi (kurs sayfasında hesap menüsü + «giriş yap» yan yana). Altın SKU’nun ilk kapısı bulanık.

### Korunacak mühürler (bunları bozmayın)

- 0–2 sn jenerik; `t<2` punchcard yok.
- Sekiz rozet, en fazla 3 kelime; sahneye paragraf teleprompter binmiyor.
- Vatandaş metninde `kirli` yok (`Düzensiz` / `ham veri` / `dağınık yapı`).
- 557.2 sn cue ↔ timings ↔ `ACADEMY_SEALED_AUDIO_DURATION_SEC=557` ↔ Dron punchcard saatleri.
- Canlı Excel kromu (şerit, fx, A1, sekmeler) soyut kartın yerini almış.
- Beat 3 etiketleri ve renk dili (turuncu hata / yeşil-mavi güven).
- `CEBİNE KOY` checklist overlay (canlı DOM).
- Üç aktarım yolu (`Kopyala-yapıştır` / `Ataş yükle` / `Copilot okur`) + AI masası.
- Karaoke’de ekran terimi, kulakta fonetik — yön doğru (içerik taşması hariç).
- Gelecek ders köprüsü; «görüşmek üzere» yok.
- İzlemede generate yok (Veo/Lyria bake).

---

## 4. ZAMAN ÇİZELGESİ (güncel mühür)

```
0.00        Lyria jenerik, logo, 01_OFFICE_AI, punchcard yok, duck 0.46
2.00        Gözde / cue-01 GİRİŞ KÖPRÜSÜ — Veo punch başlar
10.00       Veo hold (donmuş kare) ~41.32’ye kadar
41.32–41.72 0.4 sn ara
41.72       cue-02 HOŞ GELDİN — boş Excel + AI masası (83 sn)
125.48      cue-03 DÜZENSIZ TABLO — ham ızgara
195.64      cue-04 A1 HÜCRESİ — temiz ızgara (spoiler)
266.92      cue-05 TEMİZLE ŞİMDİ — 109 sn, en uzun cue
376.28      cue-06 FARK ORTADA — split
447.00      cue-07 CEBİNE KOY — duck 0.46, checklist
486.60      cue-08 SIRA SENDE — kapanış köprüsü; son 3 sn duck yükselir
557.20      konuşma biter; logo + 3 özet etiket; 2.5 sn fade-out
559.70      bed 0
```

---

## 5. FİNAL ONAY

**Bu ders, sonraki 29 ders için Altın Şablon olmaya hazır değil.**

Hazır olan: A1 refleksi, SEN dili, punchcard disiplini, intro nefesi, canlı Excel kromu, split’in *fikri*, bake’de generate yasağı, mühür saatinin kendi içinde tutması.

Hazır olmayan: görsel ritim, Command sahnesinin dürüstlüğü, nefes doktrini, TTS’in vatandaş ağzı, saha görevinin ekran içi aktarımı, «temiz» örneğin gerçekten düzenli olması, vitrin vaadi.

**Karar:** Ders 1’i *ürün* olarak sınırlı borçla yayında tutabilirsiniz. Ders 1’i *kalıp* olarak mühürleyip 29’a basmayın.

**TAMAM demiyorum.**

Önce dört iş — sonra şablon:

1. Command ızgarasını dağınık tut; temiz tabloyu yalnız split ve kapanışa bırak.
2. Veo’dan sonra freeze yok; 8. sn’de canlı masaya kes.
3. Beat sınırında gerçek ~2 sn nefes; `CEBİNE KOY` duck ≤ 0.28; TTS’den API açılımı ve «Pivot tabloya» ikilemesini çıkar.
4. 60 sn ekran içi dene + `DÜZENSİZ` yazımı + Toplam satırını temiz örnekten çıkar.

Bu dördü kaset ve teste kilitlenmeden «Altın Şablon» damgası, 29 derse aynı kusuru endüstriyel ölçekte basar.
