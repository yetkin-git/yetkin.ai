# FAZ 3 — Medya Depolama ve Alan Tasarrufu (Tespit)

| Alan | Değer |
| --- | --- |
| Tarih | 4 Ekim 2026 |
| Kime | CEO |
| Aşama | Faz 3, 1. adım: yalnız tespit ve mimari plan |
| Dil | Yalın Türkçe |
| Ölçü | `scripts/verify-public-size.ts` ile aynı yürüyüş. Birim 1024×1024. Ondalık tek hane. |

Bu belgede kod değişmedi. Medya dosyası silinmedi, taşınmadı, yeniden adlandırılmadı. Aşağıdaki sayılar bu makinedeki `public/` klasörünün bugünkü halidir.

---

## 1. Kısa hüküm

Vercel paketini şişiren şey ses dosyalarıdır. `public/` bugün **916,4 MB**. Bunun **860,8 MB**’ı konuşma ve fon müziği. Isınma videoları **19,2 MB**, sinema görselleri **35,4 MB**. Uyarı eşiği 850 MB, derlemeyi durduran tavan 950 MB. Tavana **33,6 MB** kalmış durumda. Yeni bir eğitimin sesi bu tavana sığmaz.

Görseller `public/media/academy/cinema/` altında değil. Canlı yol `public/academy/cinema/`.

Eski `lesson-audios` kovası bu iş için uygun değil. O kova herkese açık okuma veriyor ve dosya tavanı 20 MB. Canlı konuşma dosyalarının **19 tanesi 20 MB’ın üstünde**. En büyüğü 38,4 MB. Ücretli ders, herkese açık kovada durmamalı.

Önerilen sıra: önce sesi özel bir kovaya kopyala, dinlemeyi doğrula, dosyayı yerinde tut. Doğrulama bitmeden `public/` içinden silme. Ses çıkınca klasör yaklaşık **55,6 MB**’ye iner ve hem uyarı hem tavan altına düşer. Video ve görsel aynı turda çıkarsa klasör yaklaşık **1,0 MB** kalır.

---

## 2. Bugün ölçülen harita

| Küme | Dosya | Boyut | Nerede |
| --- | --- | --- | --- |
| `public/` tamamı | 298 | **916,4 MB** | Derleme ölçüsünün tamamı |
| Ses (konuşma + yatak) | 77 | **860,8 MB** | `public/media/academy/audio/` |
| Isınma videosu | 7 | **19,2 MB** | `public/media/academy/micro/` |
| Sinema görseli | 207 | **35,4 MB** | `public/academy/cinema/` |
| Excel ders karesi | 1 | 0,8 MB | `public/media/01_office_ai_01_frame_01.png` |
| Fırın ana kaydı (WAV) | 524 | 1.532,7 MB | `media-bake/` — git ve Vercel dışı, bu 916 MB’ye girmez |

`public/media/academy/diagrams/` bu makinede yok. `public/media/academy/cinema/` de yok. Şema klasörü diye anılan yığın bugünkü yayında durmuyor.

Excel karesi atıl değil. Ofis dersinin ekranı bu dosyayı okuyor (`lib/academy/excel-workspace.ts`).

### 2.1 Ses — kurs kurs

Sınav yolundaki 38 dersin hepsinde hem konuşma (`.mp3`) hem fon yatağı (`.bed.mp3`) duruyor. Eksik çift yok.

| Eğitim | Konuşma | Fon yatağı | Dosya | Toplam |
| --- | --- | --- | --- | --- |
| OFF-101 `01_office_ai` | 192,6 MB (9 dosya) | 18,9 MB (8 dosya) | 17 | 211,4 MB |
| OFF-201 `01_office_ai_ileri` | 156,5 MB | 12,4 MB | 12 | 168,9 MB |
| EC-102 `02_ecommerce_ai` | 191,0 MB | 12,5 MB | 12 | 203,5 MB |
| SM-103 `03_social_media_ai` | 80,3 MB | 12,2 MB | 12 | 92,5 MB |
| BOT-104 `04_chatbot_nocode` | 74,3 MB | 12,2 MB | 12 | 86,5 MB |
| PR-105 `05_prompt_practice` | 85,4 MB | 12,6 MB | 12 | 98,0 MB |
| **Toplam** | | | **77** | **860,8 MB** |

OFF-101 konuşma satırının içinde hazırlık şeridi de var: `01_office_ai-0.mp3`, **5,9 MB**. Bu dosya sınav yolunun 8 dersinden biri değil. Yine de yayında. Ücretsiz «Başlamadan Önce» şeridinin sesi bu. Bayrak açık (`ACADEMY_PREP_STRIP_AUDIO_SEALED`). Silinmez.

Fon yataklarının tamamı yaklaşık **80,8 MB**. OFF-101 ve OFF-201’de yatak, konuşmanın içine karışmış durumda; oynatıcı o derslerde ikinci sesi açmıyor. Mühür yine de yatak dosyasının durmasını istiyor. Taşımada yatak da konuşmayla birlikte gider.

20 MB üstü konuşma dosyası **19 adet**. Hepsi OFF-101 (8 ders), OFF-201 (ders 2–6) ve EC-102 (6 ders). SM-103, BOT-104 ve PR-105 konuşmaları 20 MB altında. En büyük dosya `02_ecommerce_ai-6.mp3` (**38,4 MB**).

### 2.2 Isınma videoları

Yedi dosyanın yedisi de karttaki ısınma kaseti. Fazla veya eski kaset yok.

| Dosya | Boyut |
| --- | --- |
| `01_office_ai-1-warmup.mp4` | 4,6 MB |
| `03_social_media_ai-warmup.mp4` | 3,0 MB |
| `02_ecommerce_ai-ops-warmup.mp4` | 2,7 MB |
| `04_chatbot_nocode-warmup.mp4` | 2,6 MB |
| `02_ecommerce_ai-listing-warmup.mp4` | 2,5 MB |
| `05_prompt_practice-warmup.mp4` | 2,5 MB |
| `01_office_ai_ileri-warmup.mp4` | 1,1 MB |

### 2.3 Sinema görselleri

`public/academy/cinema/` içinde 200 JPG (35,3 MB), 3 AVIF ve 3 WebP (birlikte yaklaşık 0,2 MB) ve bir `.gitkeep` var. Mühür, her ders için ilk kareyi (`{ders}-cue-1.jpg`) arar. Oynatıcı ders boyunca diğer kareleri de kullanır. Kapak plakası `01_office_ai-1-eye` bu klasördedir.

### 2.4 Sınav yolunda olmayan, yayında duranlar

| Dosya | Boyut | Hüküm |
| --- | --- | --- |
| `01_office_ai-0.mp3` | 5,9 MB | Hazırlık şeridi. Ücretsiz dinlenir. Yayında kalır. |
| `01_office_ai-4-cue-1.jpg` … `cue-8.jpg` | yaklaşık 0,8 MB | Ders 4 sınav yolunda yok. Konuşma dosyası daha önce silindi (11,3 MB). Sekiz görsel ve sinema kataloğundaki ders 4 metni duruyor. Bütçeyi değiştirmez. Bu fazda silinmez. |
| `01_office_ai-4.mp3` | — | Diskte yok. Emekli ses zaten çıkmış. |

Başka yetim MP3, yetim MP4 veya sınav yolu eksiği yok. `media-bake/` içindeki WAV’lar yedek ana kayıttır. Kovaya yüklenmez. O klasör bu bilgisayara özeldir; makine giderse ücretli yeniden fırın gerekir. Bu tespit o yedeği kopyalamaz.

---

## 3. Bugün dinleme ve mühür nasıl çalışıyor

Ücretli dersin sesi tarayıcıya düz dosya olarak açılmıyor.

1. Satın alma kapısı `GET /api/academy/courses/[id]/audio-grant` satın almayı sorar.
2. Adres üretici (`withAcademyAudioGrant`, `lib/academy/lesson-audio-grant.ts`) aynı site yoluna 4 saatlik imza ekler: `/media/academy/audio/{eğitim}/{ders}.mp3?g=...`
3. Kenar (`proxy.ts`) imzasız isteğe 403, iptal kasetine 404 döner.
4. Ücretsiz vitrin (`loadAcademyFreePreviewAudioGrants`) aynı imzayı üretir. İmza yalnız satış hunisinin ilk dersine yazılır. Ders 2 ve sonrası bu haritaya girmez.
5. Hazırlık şeridi (`01_office_ai-0`) ayrı bayrakla açılır. O da aynı ses klasöründedir.

Video ve görsel bu kapıdan geçmez. `/media/academy/micro/*.mp4` ve `/academy/cinema/*` bugün herkese açık statik dosyadır. Önbellek başlığı uzun ve değişmez damgalıdır.

Mühür kapısı beş katmanı ister: metin, ses, ısınma MP4, ilk sinema JPG, fon yatağı. Üretimde bu kontrol canlı diske bakmaz. `lib/academy/production-seal-manifest.ts` içindeki hazır listeye bakar. Canlı disk bakışı, kenar paketini 250 MB tavanının üstüne çıkarıyordu. Geliştirme ve test ise dosyanın durduğuna ve boyutunun sıfırdan büyük olduğuna bakar (`production-seal-disk.ts`).

Eski depo sözleşmesi (`supabase/storage/lesson-audios.sql`) ayrı bir hikâye. O kova herkese açık, tavanı 20 MB, yolu `lessons/` ve `demo/`. Yayın vaadi değil. Studio dönemi kapalı. Yeni yayın kovası o dosyayı genişleterek kurulmaz.

---

## 4. Bulut depo tasarımı

### 4.1 İki kova

| Kova | Kim okur | Ne konur | Tavan |
| --- | --- | --- | --- |
| `academy-sealed` (özel) | Yalnız sunucunun ürettiği kısa ömürlü adres | Konuşma MP3, fon yatağı | Dosya başına 50 MB (38,4 MB sığsın) |
| `academy-public` (açık, ikinci tur) | Herkes, uzun önbellek | Isınma MP4, sinema JPG/WebP/AVIF, Excel karesi | Aynı 50 MB yeter |

Ses özel kovada kalır. Tarayıcıya `service_role` anahtarı gitmez. Anahtar yalnız sunucu ve senkron betiğindedir. Ürün kodundaki «tarayıcıda service_role yok» kuralı durur.

Bölge, Vercel bölgesi `fra1` (Frankfurt) ile aynı seçilir. İlk baytın yakın kalması için.

### 4.2 İmza üretici bulutu nasıl okur

Oynatıcının gördüğü adres değişir. Satın alma kararı değişmez.

- Yerel okuma (`ACADEMY_MEDIA_READ=local`): bugünkü yol. `/media/academy/audio/...?g=...` Kenar imzası durur.
- Depo okuma (`ACADEMY_MEDIA_READ=storage`): `audio-grant` ve ücretsiz önizleme, satın alma veya önizleme hakkını doğruladıktan sonra özel kovanın imzalı adresini döner. Süre yine **4 saat** (`ACADEMY_AUDIO_GRANT_TTL_SEC`).
- Adres mutlak olur. Tarayıcı dosyayı doğrudan deponun dağıtım ağından çeker. Ses baytı Vercel fonksiyonunun içinden geçmez. 38 MB’lık dosyayı fonksiyon gövdesinden akıtmak hem yavaş hem pahalıdır.
- İlerletme (sarma) için depo `Range` isteğini açık tutar. Bugünkü `Accept-Ranges: bytes` başlığının karşılığı budur.
- `?v=` damgası nesne yoluna yazılır (`.../{ders}/v{damga}.mp3`). Eski karışım tarayıcıda takılı kalmaz.
- Üretimde imza üretilemezse cevap 503 kalır. Eksik dosyanın yerine başka bir dersin sesi konmaz. Bu, anayasadaki sıfır yedek kuralının medya hali: eksik katman sessizce doldurulmaz.
- Eski site yolu (`/media/academy/audio/`) dosya durduğu sürece kenar imzasıyla çalışmaya devam eder. Yeni oturumlar depo adresini alır. Eski sekmedeki 4 saatlik link, dosya silinene kadar bozulmaz.

Ücretsiz dinleyen kişi giriş yapmadan ders 1’i (ve OFF-101’de hazırlık şeridini) dinler. Sayfa sunucuda çizildiği için imzalı adres her açılışta taze üretilir. Anonim kişiye kova anahtarı verilmez.

Video ve görsel ilk turda yerinde kalır. Onlar 54,6 MB. Aynı site yolundan, bugünkü önbellekle gelmeye devam ederler. İkinci turda açık kovaya alınırlarsa oynatıcı yolu aynı kalır; yalnız dosyanın durduğu yer değişir. Kapak görseli (`01_office_ai-1-eye`) ana sayfanın ilk boyanan görseli olduğu için ikinci tur, ses turu oturmadan açılmaz.

### 4.3 Mühür kapısı diske değil varlığa bakar

Beş katmanın adı değişmez. Metin repo’da kalır; o katman küçüktür ve kodla birlikte gelir. Ses, video, görsel ve müzik için kontrol şuna döner:

1. Fırın makinesi dosyayı yerelde üretir. Boyut sıfırsa mühür basılmaz. Bu bugünkü geliştirme kontrolüdür.
2. Senkron betiği aynı yolu kovaya koyar. Uzak nesnenin bayt sayısı, yereldeki sayıyla aynı değilse betik hata verir ve durur.
3. Manifesto (`production-seal-manifest.ts`) yalnız «var» demez. Üretim betiği her yolun bayt sayısını da yazar. Elle düzenlenmez; bugün de böyledir.
4. Canlı satış kapısı her sayfa açılışında depoya soru sormaz. Hazır manifestoyu okur. Depo bir anlık yanıt vermezse vitrin kendiliğinden kapanmaz. Ayrı bir operasyon kontrolü, manifesto baytı ile kova baytını karşılaştırır ve uyuşmazlıkta haber verir.
5. Kenar fonksiyonu medya baytını izine almaz. Bu ayrım bugün de var: canlı disk bakışı paketi 250 MB tavanının üstüne çıkarıyordu.

`AKADEMI_URETIM_ANAYASASI.md` bu fazda değişmedi. O belgenin 4. bölümü hâlâ «beş katman diskte fiziksel durur» der. Model tablosuna dokunulmaz. Kapı kodu depoya geçtiği gün, aynı belgedeki o cümle Süper Admin onayıyla «depoda duran nesne, boyutu sıfırdan büyük ve manifesto ile aynı» diye güncellenir. Cümle güncellenmeden satış kapısı yalnız buluta emanet edilmez. İki metin ayrı düşerse düzelen taraf kod olur; bu yüzden cümle ve kod aynı teslimde gider.

### 4.4 Yerel geliştirme ve canlı yayın

| Ortam | Ses | Video ve görsel | Bozulursa |
| --- | --- | --- | --- |
| `npm run dev` | Varsayılan `local`. Dosya `public/` altından gelir. Depo şart değil. | Aynı site yolu | Geliştirici `storage` bayrağını bilerek açarsa kovayı dener |
| Vercel üretim | Bayrak `storage` olunca imzalı adres | İlk turda Vercel statik dosya, Frankfurt önbelleği | İmza yoksa 503. Eski yol, dosya duruyorsa kenar imzasıyla sürer |
| Test | Yerel dosya ve manifesto | Yerel dosya | Mevcut mühür testleri yerelde yeşil kalır |

Dağıtım ağı deponun kendi ağıdır. Üstüne ikinci bir vekil konmaz. Vercel, ses baytının taşıyıcısı olmaktan çıkar; adresi üreten kapı olarak kalır.

---

## 5. Sıfır risk taşıma

### 5.1 Betik

Tek kullanımlık betik: `scripts/ops-sync-media-to-storage.ts`. Bu fazda yazılmadı.

Kurallar:

- Varsayılan koşu kuru sayım. Yükleme için açık `--apply` gerekir.
- Kovadaki fazla nesneyi silmez. Yereldeki dosyayı silmez.
- Yüklemeden önce boyut ve özet aynıysa dosyayı atlar.
- `media-bake/` altındaki WAV’ları reddeder.
- `lesson-audios` kovasına yazmayı reddeder.
- Sınav yolu, hazırlık şeridi (`01_office_ai-0.mp3`), yedi ısınma kaseti ve sinema klasörünü liste olarak okur. Elle dosya adı yazılmaz.
- Anahtar ortam değişkeninden okunur. Depoya, git’e ve tarayıcı paketine girmez.

### 5.2 `public/` düşünce ölçü ne olur

Ölçü, dosya diskten çıkınca düşer. `.vercelignore` satırı tek başına bu sayıyı düşürmez. `verify:public-size` klasörü yürür, Vercel’in yok saydığı dosyayı da sayar.

| Ne çıkarsa | Çıkan | Kalan `public/` | 850 uyarı | 950 tavan |
| --- | --- | --- | --- | --- |
| Bugün | — | **916,4 MB** | üstünde | 33,6 MB pay |
| Yalnız ses | 860,8 MB | **55,6 MB** | altında | altında |
| Ses + video + sinema | 915,4 MB | **1,0 MB** | altında | altında |

1,0 MB’nin içinde favicon, küçük statik dosyalar ve 0,8 MB’lik Excel karesi durur. Excel karesi de açık kovaya gidince kalan yaklaşık **0,3 MB** olur.

Bu 1 MB, Vercel’deki bütün sunucu paketinin 1 MB olacağı anlamına gelmez. 916,4 MB yalnız `public/` klasörüdür. Sunucu fonksiyonunun izi medyayı zaten dışarıda bırakıyor (`next.config.ts` içindeki `public/media` ve `public/academy/cinema` hariç tutmaları). Daralan şey statik yük ve derlemeyi durduran ölçü.

Ses çıktıktan sonra yeni bir eğitimin 90–200 MB’ı `public/` içine konursa tavan yine dolar. Yeni eğitimin medyası da aynı kovaya gider. `public/` bir daha medya deposu olmaz.

### 5.3 Canlı dinleyici için sıra

Dosya silmek son adımdır.

1. Özel kova açılır. Tavan 50 MB. Herkese açık okuma kapalıdır. Eski `lesson-audios` kovasına dokunulmaz.
2. Betik kuru sayım yapar. Liste, 77 ses dosyası ve (ikinci turda) video ile görselle birebir okunur.
3. `--apply` kopyalar. Yerel dosya durur. Canlı site hâlâ bugünkü adresi çalar.
4. Bayrak bir önizleme ortamında `storage` yapılır. Şunlar elle dinlenir: anonim ders 1, OFF-101 hazırlık şeridi, satın alınmış bir ders 2, imzasız eski adresin 403 vermesi, sarma (dosyanın ortasından devam).
5. Üretim bayrağı açılır. Yeni oturum depo adresini alır. Eski 4 saatlik link, dosya durduğu için çalışır. Birkaç gün ikisi birden durur.
6. Operasyon kontrolü, manifesto baydı ile kova baydını karşılaştırır. Uyuşmazlık varsa silme adımı açılmaz.
7. Ancak ondan sonra ses dosyaları `public/` ve git kaydından çıkar. `verify:public-size` yeniden ölçülür. Beklenen: yaklaşık 55,6 MB (video ve görsel duruyorsa) veya yaklaşık 1,0 MB (onlar da çıktıysa).
8. Video ve görsel ikinci turda, aynı kopyala–doğrula–sonra sil sırasıyla çıkar. Kapak görseli ana sayfada ayrıca kontrol edilir.

Hazırlık şeridi ve ders 1, silme gününden önce depo adresiyle anonim dinlenmiş olmalıdır. O iki kapı ücretsiz dinleyicinin tamamıdır.

Geri dönüş: bayrak `local` olur. Dosya hâlâ `public/` altındaysa site eski yola döner. Dosya silindikten sonra geri dönüş, kovadaki kopyadan yeniden koymaktır. Bu yüzden silme, bayrak en az birkaç gün `storage` iken ve dinleme sorunsuzken yapılır.

### 5.4 Bilerek yapılmayanlar

- `01_office_ai-0.mp3` silinmez.
- Ders 4 görselleri bu fazda silinmez. Kazanç yaklaşık 0,8 MB.
- `media-bake/` kovaya gitmez ve silinmez.
- Anayasa model tablosu değişmez.
- Bu belgeden sonra gelen uygulama turu, ayrı bir onaydır.

---

## 6. Sonraki onay

Uygulama turu açılırsa ilk iş özel kova ve kuru sayım betiğidir. Canlı bayrak ve `public/` temizliği o betiğin sayımı bu belgedeki 77 ses dosyasıyla birebir olduktan sonra gelir.
