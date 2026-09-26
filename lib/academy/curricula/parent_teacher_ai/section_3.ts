import type { Section } from "../types";

/**
 * Öğretmen ve veli (18+) Ders 3 — tam ders metni taslağı.
 * Vitrin, ses ve sınav yolu yok. Çocuk hesabı açılmaz.
 */
export const parentTeacherAiSection3: Section = {
  sectionNumber: 3,
  lessonKey: "parent_teacher_ai-3",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Uydurma Cevap: Kaynak Sor",
  targetDurationMinutes: 10,
  estimatedWordCount: 1304,
  pedagogicalObjective:
    "Yetişkin öğretmen ve veliye, modelin eklediği tarih ve alıntıyı açık olan sayfaya sormasını göstermek. Modelin yazdığı kaynak satırı kaynak değildir. Sayfada olmayan cümle postere ve tahtaya yazılmaz. Çocuğun adı, okulu ve notu isteme girmez.",
  contentMarkdown: `
Selamlar, ben Gözde. Bu ders öğretmen ve veli içindir. Sen yetişkinsin. Geçen derste çalışma iskeletini dört parçayla yazdın. Bu dersin sonunda modelin eklediği tarihi ve alıntıyı kitaptaki sayfaya soracaksın. Sayfada olmayan cümleyi postere yazmayacaksın. Çocuğun adını bu isteme yazmayacaksın.

Saat 20:05. Yarın proje günü. Çocuğun elinde matematik kitabı duruyor. Sayfa 18 açık. Sayfada yalnız şu cümle var. «İki basamaklı sayıları alt alta yazıp toplarsın.» Sayfada tarih yok. Sayfada birinin sözü yok. Sayfa numarasını sen görüyorsun. Numara 18'dir.

Telefonunda sohbet kutusu açık. Ekranın altında bir yazı satırı durur. Gönder düğmesine basınca o satır, modelin olduğu yere gider.

Elinde şöyle bir satır duruyor. Bu satır ders için uydurulmuştur. «Ayşe Demir, 5-B, Çınar İlkokulu. Sayfa 18'i proje metnine çevir. Bir tarih ve ünlü bir söz ekle. Kaynağı da yaz.»

Parmağın gönderin üzerinde duruyor. Bu satırı gönderme.

Neden? Ad, sınıf ve okul birlikte durunca satır tek bir çocuğu işaret eder. «Bir tarih ve ünlü bir söz ekle» dersen model, sayfa 18'de olmayan bir tarih ve bir söz üretir. Cümle akıcı durur. Örneğin 7 Ocak 2011 diye bir tarih yazabilir. Sayfa 84 diye bir kaynak satırı da yazabilir. İkisi de açık olan sayfada yoktur. Modelin kaynak satırı kitap değildir.

Çocuk bu paragrafı postere geçirirse öğretmen sayfa 18'i açar. Tarihi ve sözü bulamaz. Kitapta olmayan cümle, çocuğun kâğıdında kalır.

Eylem şudur. Parmağını gönderden çekersin. Gerçek adı, sınıfı ve okulu kutunun dışında bırakırsın. İsteme yalnız sayfa 18'deki cümleyi yazarsın. Cevapta tarih, söz veya yeni sayfa görürsen kitabı açarsın. Cümle o sayfada yoksa o satırı silersin. Sonuç şudur. Poster, senin sayfa 18'de gördüğün cümleyi taşır. Tarihi ve sözü taşımaz. Çocuğun kaydı evdeki sohbette kopya bırakmaz.

Veriyi yazmadan önce üç soru vardır. Sırayı bozma.

Birinci soru okul politikasıdır. Okulun onayladığı araç hangisi? Okul bir panel yazmışsa proje notu orada kalır. Okulun yazılı kuralı varsa o kural okulda durur. Onaylı araç yoksa çocuğun dosyasını kişisel sohbet hesabına taşıma. Kitap sayfasının fotoğrafını da kişisel sohbete yapıştırma. Fotoğrafta ad varsa o ad da gider.

İkinci soru veri sınıfıdır. Çocuğun adı, okulu, sınıfı, notu, fotoğrafı, adresi ve sağlık notu kişisel veridir. Bunlar açık hâliyle kutuya girmez. Sayfa 18'deki cümle, kimliği çıkarılmış bir örnektir. «Ayşe Demir, 5-B, Çınar İlkokulu» bir kayıttır. Kayıt kutuda durmaz.

Üçüncü soru aktarım yoludur. Onaylı araçta sırayla bakarsın. Önce yerleşik panel vardır. Panel yoksa okulun izin verdiği dosya yüklemeyi kullanırsın. İkisi de yoksa son çare, kimliği çıkarılmış kısa örnektir. Gerçek öğrenci satırı bu kısa örneğin içine gizlenmez. Örnek, sayfadaki cümleyi gösterir. Kitabın tamamının yerini tutmaz.

## DÖRT PARÇA

İskeleti şimdi dört parçayla yaz. Rol, işin sahibidir. Görev, tek iştir. Biçim, çıktının şeklidir. Kısıt, modelin taşmayacağı çizgidir.

İstemi şöyle yaz.

Rol: evde çalışan bir veli. Görev: verdiğim cümleyi, çocuğun kendi eliyle yazacağı iki satırlık bir proje iskeletine çevir. Biçim: iki kısa satır. Birinci satır, kutuya yazdığım cümleyle aynı olsun. İkinci satır, çocuğun kendi kâğıdında yapacağı iş olsun. Kısıt: tarih yazma. Alıntı yazma. Yeni sayfa numarası yazma. Madde numarası yazma. Kaynak satırı yazma. Öğrenci adı, okul adı, sınıf ve not yazma. Bitmiş proje paragrafını yazma. Cümle: İki basamaklı sayıları alt alta yazıp toplarsın.

Rolü başa koyarsın. Görev tek başına «proje yaz» diye kalırsa model tarihi ve sözü kendisi ekler. Bu işin sahibi velidir. Çocuğun adını role yazma.

Görev tek kalır. «İskelet kur, söz ekle, kaynağı uydur, öğretmene mesaj yaz» dört iştir. Dört iş tek kutuda birbirine bulaşır. Bu istemde tek görev vardır. Görev, iki satırlık iskelet kurmaktır. Kaynak satırını sen yazarsın. Çünkü kitabı sen tutuyorsun. Öğretmene giden mesaj ayrı istemdir.

Biçim, şekli söyler. İki kısa satır, çocuğun okuyacağı listedir. «Süslü bir proje olsun» dersen model yeni cümle seçer. Biçimi sen yazarsın.

Kısıt, sayfada olmayan cümleyi kutunun dışında tutma kuralıdır. Tarih yok. Söz yok. Yeni sayfa yok. Madde yok. Modelin «Kaynak:» satırı yok. Ad yok. Okul yok. Bitmiş paragraf yok.

## YANLIŞ VE DOĞRU

Yanlış işi ekranda gör. Kişisel telefonundaki sohbete şunu yapıştırırsın. «Kızım Ayşe Demir, 5-B, Çınar İlkokulu. Sayfa 18'deki cümleyi proje metnine çevir. Bir tarih ve ünlü bir söz ekle. Kaynağı da yaz.» Ad, sınıf ve okul evden çıkar. Model akıcı bir paragraf yazar. Paragrafın içinde 7 Ocak 2011 durabilir. «Toplama, düşüncenin ilk adımıdır» diye bir söz durabilir. «Kaynak: program, sayfa 84, madde 9.9.9» diye bir satır durabilir. Çocuk o paragrafı postere geçirirse öğretmen sayfa 18'de bu satırları bulamaz. Düzgün cümle, gönderilmiş adı kutudan çıkarmaz. Sohbeti ekrandan silmen, gönderilmiş satırı geri çağırmaz.

Doğru işi de ekranda gör. Gerçek adı, sınıfı ve okulu kâğıtta bırakırsın. Kitabı yanında tutarsın. Sohbete şunu yazarsın. «Rol: evde çalışan bir veli. Görev: verdiğim cümleyi, çocuğun kendi eliyle yazacağı iki satırlık bir proje iskeletine çevir. Biçim: iki kısa satır. Birinci satır, kutuya yazdığım cümleyle aynı olsun. İkinci satır, çocuğun kendi kâğıdında yapacağı iş olsun. Kısıt: tarih yazma. Alıntı yazma. Yeni sayfa numarası yazma. Madde numarası yazma. Kaynak satırı yazma. Öğrenci adı, okul adı, sınıf ve not yazma. Cümle: İki basamaklı sayıları alt alta yazıp toplarsın.»

Model iki satır verir. Birinci satır: İki basamaklı sayıları alt alta yazıp toplarsın. İkinci satır: iki basamaklı iki sayı seç ve toplamı kendi kâğıdına yaz. Satırda tarih yoktur. Söz yoktur. Sayfa 84 yoktur. Madde numarası yoktur. Ad yoktur. Sen iki satırı okursun. Sonra kitabı açarsın. Birinci satır sayfa 18'de duruyorsa o cümle kalır. Durmuyorsa silersin. Kaynak satırını modele yazdırmazsın. Kaynak satırını sen yazarsın. «Kaynak: elimdeki matematik kitabı, sayfa 18.» Bu satır posterde durur. Bu satırı sohbet kutusuna geri yapıştırmazsın.

Kaynağı şöyle sorarsın. Cevapta bir tarih görürsen sayfa 18'e bakarsın. «Bu tarih burada yazıyor mu?» Yazıyorsa kalır. Yazmıyorsa silersin. Bir söz görürsen aynı sayfaya bakarsın. Söz yoksa silersin. Model «sayfa 84» derse o sayfayı sohbetin içinde aramazsın. Sayfa 84 elinde değilse o satırı silersin. Elindeyse o sayfayı açarsın. Cümle yoksa yine silersin. Modelin kaynak satırı, senin gördüğün sayfanın yerini tutmaz.

Cevapta tarih veya söz belirdiyse kısıtı daraltırsın. Aynı görevi bir kez daha istersin. İskeleti çocuğa ancak o satırlar silindikten sonra okursun. Çocuk cümleyi kendi eliyle yazar. Toplamı kendi kâğıdında yapar.

Öğretmen masasında aynı soru durur. Saat 08:20. Tahtaya bir cümle yazmak istiyorsun. Sınıf listesini yapıştırmazsın. Kitap sayfasının fotoğrafını yapıştırmazsın. Fotoğrafta öğrenci adı varsa o fotoğraf kişisel sohbete gitmez. Role sınıf öğretmeni yazarsın. Göreve şunu yazarsın. Verdiğim cümleyi iki kısa satıra çevir. Biçime iki satır yazarsın. Kısıta şunu yazarsın. Tarih, alıntı, yeni sayfa ve madde yazma. Öğrenci adı yazma. Cevabı şöyle okursun. Birinci satır kitaptaki cümledir. İkinci satır: öğrenci iki sayı seçer ve toplamı kendi defterine yazar. Tarih belirdiyse kitabı açarsın. Cümle sayfada yoksa tahtaya yazmazsın. Model dersi senin yerine anlatmaz. Sözü senin yerine tahtaya yazdırmazsın.

Hesabı açan e-posta yetişkinindir. Çocuğun adına veya okul postasıyla hesap açılmaz.

## CEBİNE KOY

Üç adımı cebine koy.

1. Yazmadan önce okulun onayladığı araca bak. Onaylı araç yoksa çocuk dosyasını ve kitap fotoğrafını kişisel sohbete taşıma.
2. Addan, okul adından, sınıftan ve nottan boş bir cümle yaz. Cümleyi açık olan sayfadan sen seç.
3. Gelen satırı o sayfayla karşılaştır. Tarih, söz veya yeni sayfa numarası sayfada yoksa o satırı sil. Kaynak satırını sayfaya baktıktan sonra sen yaz.

## SIRA SENDE

Bugün sohbet kutusunu aç. Gerçek çocuk adı yazma. Okul adı yazma. Not yazma. Elindeki kitaptan tek bir cümle seç. Sayfada olmayan tarih isteme. Şunu gönder. «Rol: evde çalışan bir veli. Görev: verdiğim cümleyi, çocuğun kendi eliyle yazacağı iki satırlık bir proje iskeletine çevir. Biçim: iki kısa satır. Birinci satır, kutuya yazdığım cümleyle aynı olsun. İkinci satır, çocuğun kendi kâğıdında yapacağı iş olsun. Kısıt: tarih yazma. Alıntı yazma. Yeni sayfa numarası yazma. Madde numarası yazma. Kaynak satırı yazma. Öğrenci adı, okul adı, sınıf ve not yazma.» Cümlenin yerine, sayfada gördüğün cümleyi yaz.

Cevabı oku. Bir tarih, bir söz veya senin yazmadığın bir sayfa belirdiyse kitabı aç. Cümle o sayfada yoksa o satırı sil. İskeleti çocuğa ancak ondan sonra oku. Çocuk cümleyi kendisi yazsın. Kaynak satırını sen, baktığın sayfanın numarasıyla yaz. Bu alıştırmanın notu yok. Amaç, akıcı cümlenin sayfada durup durmadığını kendi gözünle görmendir.

Sıradaki derste yapıştırılmayacak veriyi ayıracaksın. Ad, fotoğraf, not ve adres o derstedir. Bu derste sınır durur. Sayfada olmayan tarih postere yazılmaz.
`,
};
