# Otomatik geçiş, ders ilerleme ve PayTR SMS — tespit raporu

| Alan | Değer |
|------|--------|
| Tarih | 5 Ekim 2026 |
| Sayfa | Akademi oynatıcı `/academy/{eğitim}/oyna` ve PayTR ödeme penceresi |
| Belirti | Otomatik Geçiş açıkken saat `12:22 / 12:22` olunca sıradaki ders açılmıyor. Oynatma listesinde ders bitmiş görünmüyor. PayTR penceresinde SMS kodu `●●●●●●` olarak maskeleniyor. |
| Bu tur | Yalnız tespit. Kod değişmedi. |

## Kısa hüküm

Üç belirti üç ayrı yerde durur.

Otomatik geçiş anahtarı ses dosyasının bitiş olayında okunmaz. Anahtar, bitiş üst kata çıktıktan sonra okunur. Saat iki tarafı da `12:22` yazınca ders bitmiş sayılmaz. Üst kata çıkış, ses etiketinin `ended` olayına ve mühürlü süre kapısına bağlıdır. Bu kapı geçilmezse sıradaki dersin anahtarı hiç seçilmez. Adres çubuğu da değişmez. Oynatıcı dersi `setActiveKey` ile değiştirir. `router.push` bu akışta yoktur.

Liste işareti aynı kapıya bağlıdır. Ders, veritabanına yalnız bu bitişten sonra giden kayıt çağrısıyla yazılır. Çağrı gitmezse listede «Ders tamam» yazısı da çıkmaz. Listenin kendisinde tik ve ilerleme çubuğu yoktur. Tamamlanan kart, seçili değilse küçük gri bir noktadır.

SMS rakamları bizim formumuzda değildir. Ödeme penceresi `https://www.paytr.com/odeme/guvenli/{token}` adresindeki çerçevedir. Çerçeve başka sitededir. Sepet ve token gövdesinde SMS kutusunu açık metin yapan bir alan yoktur.

## 1. Saat dolunca neden sonraki derse geçilmiyor?

### Anahtar nerede okunur?

Anahtar oynatma listesinin başındadır. Yazı «Otomatik Geçiş» dir. Tercih `academy_autoplay_enabled` anahtarıyla tarayıcı deposunda durur. İlk ziyarette varsayılan açıktır.

Ses bileşeni `components/academy/lesson-media-player.tsx` bu anahtarı okumaz. Ses bitince `notifyEnded` her zaman üst kata ders anahtarını verir. Anahtarın açık ya da kapalı olması bu çağrıyı kesmez.

Üst kat `components/academy/curriculum-player.tsx` içindeki `onMediaEnded` dir. Orada `shouldAutoAdvanceAfterListenEnded` anahtarı okur. Anahtar kapalıysa kayıt denemesi yine yapılır, sonraki derse zıplama yapılmaz. Anahtar açıksa zıplama, kaydın başarılı cevabından sonra `autoAdvanceNextLesson` ile gelir.

### `12:22 / 12:22` dersin bittiği an değildir

Saat `formatAcademyCinemaClock` ile saniyenin küsuratını atar. `742,1` ile `742,9` ikisi de `12:22` yazar. Eşit görünen saat, dosyanın bittiği anlamına gelmez.

Kod bunu ayrıca yazmıştır. `hasAcademyLessonPlaybackReachedEnd` eşit saati «bitti» sayar. Oynatıcı bu fonksiyonu çağırmaz. Bitiş kapısı `academyLessonAudioEndedIsComplete` dir. Kapı yalnız `HTMLAudioElement.ended` ile açılır. Dosyanın o anki yeri, mühürlü sürenin en fazla 1,5 saniye gerisinde olmalıdır. Daha gerideyse bitiş reddedilir.

Sağdaki süre de dosyanın çıplak boyu değildir. `academyPlayerOutroTailSec` her derse en az 2,5 saniye nefes ekler. Ofis derslerinde bu kuyruk 4,5 saniyeye çıkar. Nefes dolmadan `notifyEnded` çağrılmaz.

Eşit saat çoğu zaman nefes zamanlayıcısının solu sağa çekmesinden sonra görünür. Zamanlayıcı süreyi sağdaki sayıya yazar, ardından `sealIfEnded` çalışır. Mühür kapısı burada yine `ended` ve 1,5 saniye kuralını sorar. Kapı kapanırsa üst kata haber gitmez. Saat `12:22 / 12:22` de kalır. Anahtar açık olsa da sıradaki ders seçilmez.

### Erken bitiş bir kez denenir, sonra susar

Ses `ended` dediğinde yer mühürden 1,5 saniyeden fazla gerideyse oynatıcı bir kez 0,2 saniye ileri sarıp yeniden oynatır. Sarma hedefi mühürlü süre değildir. `reported + 0,2` ile mühürden küçük olan seçilir. Açık geride bu 0,2 saniyedir.

İkinci `ended` de gerideyse fonksiyon döner. Nefes zamanlayıcısı bu koldan kurulmaz. Üst kata haber gitmez.

Ayrı bir saat döngüsü `ended` görünce zamanlayıcıyı yine kurabilir. Zamanlayıcı saati eşitler. `sealIfEnded` mühür kapısını geçemezse haber yine gitmez. Ekranda dolu saat kalır.

Hard-mix derslerde mühürlü süreye 4 saniye giriş eklenir (`ACADEMY_BED_INTRO_SEC`). Dosya bu 4 saniyeyi taşımazsa bitişteki yer, mühürden 1,5 saniyeden fazla geride kalır. Kapı bu derslerde kapanır.

### Haber çıksa bile adres değişmez

`onMediaEnded` haber gelince birkaç kapıdan geçer. Oynatma bu derste başlamamışsa döner. Ders duvarın arkasındaysa döner. Kayıt sürüyorsa ve ders henüz tamam değilse döner ve bir daha denenmez. Ses tarafı aynı bitişi ikinci kez yollamaz.

İlk tamamlanmamış derste fonksiyon `completeLesson` çağırır ve kendisi sonraki derse gitmez. Gitme, kayıt cevabı başarılıysa ve sıradaki ders sayfada `open` ise yapılır.

Kayıt gövdesi yalnız `{ lessonKey }` dir. Sunucu iş kanıtını kendisi doldurur. Compact derste okuma mührü yeter. Uygulama dersinde tohum varsa kanonik cevap yeter. İkisi de yoksa sunucu «İş kanıtı olmadan ders kapanmaz.» der. İstemci bunu başarısız sayar. `setActiveKey` çalışmaz.

Başarılı cevapta bile istemci, cevaptaki güncel ders listesini okumaz. Sayfada duran eski `open` bayrağına bakar. Bayrak kapalıysa zıplama atlanır. Harçlı ve süresi dolmamış satın almada katalog baştan açıktır (`academyPlayerCatalogFullyOpen`). Gerçek müşteri kaydında sıradaki ders bu yüzden kapalı gelmez. Kapı, haberin hiç çıkmaması ya da kayıt cevabının başarısız olmasıdır.

Sonraki ders seçilince yapılan iş `selectLesson` içindeki `setActiveKey` dir. Sayfa aynı `/oyna` adresinde kalır. `router.push` yoktur. Ardından `router.refresh()` sunucu verisini yeniler. Yenileme, kaçırılmış zıplamayı kendiliğinden yapmaz.

Beş saniyelik geri sayım sabiti `ACADEMY_LESSON_AUTO_ADVANCE_MS` tanımlıdır. Oynatıcı onu kullanmaz. «Sıradaki derse geçiyoruz…» cümlesi de ekrana basılmaz.

## 2. Liste neden dersi bitmiş göstermiyor?

### Kayıt nereye yazılıyor?

Yazı, ses bitişinin üst kata ulaşmasından sonra `POST /api/academy/courses/{kurs}/curriculum` ile gider. Sunucu `completeAcademyLesson` ile satın alma satırına ders tamamını yazar. Cevap başarılıysa tarayıcı `completedKeys` kümesine ders anahtarını ekler.

Bitiş haberi çıkmazsa bu çağrı da çıkmaz. Veritabanında satır oluşmaz. Küme de büyümez.

Kayıt hata verirse küme yine büyümez. Ekranda «Ders tamamlanamadı.» kalabilir. Otomatik geçiş de bu hatada durur. İki belirti aynı çağrıya bağlıdır.

Sayfa yenilenince küme, sunucudan gelen `lessons[].completed` ile baştan kurulur. Yerel ekleme, sunucu listesinde yoksa silinir. Başarılı kayıtta yenileme işareti geri getirmelidir. Çağrı hiç gitmediyse yenilemede de işaret yoktur.

### Oynatma listesinde tik ve çubuk yok

Liste `OYNATMA LİSTESİ` başlığının altındaki kartlardır. Kartta tik bileşeni yoktur. Karta özel ilerleme çubuğu yoktur. `AcademyProgressBar` kurs özetindedir. Oynatıcı listesine bağlı değildir.

Kartın işareti 6 piksellik bir noktadır.

- Kart seçiliyse nokta mavidir. Ders tamam olsa da mavi kalır.
- Kart seçili değilse ve tamamsa nokta gridir.
- İkisi de değilse nokta boştur.

Tamam yazısı alt satırdadır: «Ders tamam» (`alreadyDone`). Bu yazı, kümede anahtar varsa gelir.

Otomatik geçiş olmayınca biten ders seçili kalır. Nokta mavi durur. Kayıt da yazılmadıysa «Ders tamam» satırı gelmez. Kullanıcının aradığı tik ve çubuk bu listede hiç çizilmez. Görünen durum bu yüzden yerinde kalır.

Alttaki düğme de aynı kümeden beslenir. Ders tamam değilken yazı «Dersi Tamamladım» olarak durur.

## 3. PayTR SMS kodu neden nokta nokta?

SMS kutusu bizim sayfamızda değildir. Kasa, PayTR çerçevesini basar. Kaynak `components/kernel/paytr-checkout-iframe.tsx`. Adres `https://www.paytr.com/odeme/guvenli/{token}` dir. Çerçeve `www.paytr.com` kökenindedir. Bizim CSS ve `type="text"` ayarımız o kutuya girmez.

Token isteği `lib/kernel/payments/paytr/checkout.ts` içindedir. Gövde şunları taşır: mağaza no, IP, sipariş no, e-posta, tutar, sepet, taksit kapalı, para birimi, dönüş adresleri, ad, adres, telefon, süre sınırı, test ve hata bayrakları.

Bu gövdede SMS kutusu, rakam görünürlüğü ya da `type="text"` alanı yoktur. `non3d` tip tanımında durur. İstek gövdesine yazılmaz. Test de `non_3d` alanının boş olduğunu kilitler. Bu alan 3D sayfasını kapatmak içindir. Rakamı görünür yapmak için değildir. iFrame satışında gönderilmiyor.

3D SMS sayfası kartı veren bankanın sayfasıdır. PayTR çerçevesinin içinde ya da üstünde açılır. Nokta maskesi o sayfanın kendi kutusudur. Mağaza parametresiyle açılıp kapanmaz.

Kendi fatura formumuzdaki telefon alanı `type="tel"` dir. O alan SMS kodu değildir. Numarayı açık yazar.

## Ne düzelmeli?

Üç iş ayrıdır.

1. Saat iki tarafı da dolduğunda, mühür kapısı üst kata haberi vermelidir. 1,5 saniye geride kalan bitiş tek 0,2 saniyelik denemeyle susmamalıdır. Nefes payı saati eşitledikten sonra haber yine gitmelidir. Anahtar bu haberden sonra okunur. Açıksa sıradaki ders `setActiveKey` ile açılır. Başarılı kayıt cevabındaki açık ders listesi, sayfadaki eski `open` bayrağının önüne geçmelidir.

2. Aynı haber, tamam kaydını yazmalıdır. Liste, seçili kartta da bitmiş hali göstermelidir. Bugün seçili kartın noktası mavi kalır. Tik ve çubuk listede yoktur. İşaret, kayıttan sonra seçili kartta da okunur olmalıdır.

3. SMS maskesi için token gövdesine eklenecek bir görünürlük anahtarı yoktur. Çerçeve içindeki banka kutusu bizim kodla `type="text"` olmaz. `non_3d` göndermek kodu göstermez. 3D adımını kaldırmaya yarar. Bu turda o kapı kapalıdır.
