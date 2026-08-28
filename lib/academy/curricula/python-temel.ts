import { academyGrowthLessons } from "@/lib/academy/curricula/growth-draft";
import { academyLessonDraft } from "@/lib/academy/curricula/types";

export const PYTHON_TEMEL_LESSONS = [
  academyLessonDraft(
    "python-temel-1",
    1,
    "Kurulum ve ilk program: print ile merhaba dünya",
    `Bakkal defterinin ilk satırını açmak gibi durur bu an: kalem elde, sayfa boş, insan «ya yanlış yazarsam» diye duraksar. O duraksama tembellik değil; kapının eşiğidir. Bugün eşiği tek satırla geçiyoruz. Ekrana bir cümle yazdıracağız. O cümle sihir değil; senin yazdığın tarifi makinenin yüksek sesle geri okuması.

Python yorumlayıcısı (interpreter, yani satır satır okuyan program) kaynak dosyayı yukarıdan aşağı tarar. print bir fonksiyon çağrısıdır: parantezin içindeki değeri standart çıktıya, yani senin gördüğün o siyah-beyaz panele yazar.

İki kapı durur. Biri etkileşimli kabuk: satır yazarsın, cevap hemen düşer; tezgahta tartıyı denemek gibidir. Öbürü dosya: tarifi kaydedersin, sonra çalıştırırsın; defteri kapatıp ertesi gün aynı sayfadan okumak gibidir. İlk program her iki kapıda da aynı sözleşmeyi ister: tırnak, parantez, çağrı. Kabukta «çalıştı» demek, dosyada da çalışacağı anlamına gelmez; kaydetmeden kapanan tezgâh, sabah boş durur.

Kurulum bu sözleşmenin kapısını açmaktır. Yorumlayıcı yoksa satır okunmaz. Düzenleyici (editör) yoksa tarifi düzgün yazamazsın. İkisi ayrı iştir: biri okur, öbürü yazar. Okuyan yoksa vitrin camı karanlık kalır; yazan yoksa cam parlasa da içeride tarif durmaz. Bu derste tek işimiz o camın arkasındaki ilk cümleyi dürüst basmaktır.

İlk çıktı bir fiştir. Fişte ne yazdıysan odur; «ben öyle demek istemedim» makineyi bağışlatmaz. Büyük bir uygulama beklemeyiz. Tek satır yeter: çağrı durur, metin durur, satır düşer. O satır gelince ortamın açık olduğunu görürsün. Gelmezse kapı henüz açılmamıştır — suç tarifte veya kapıdadır, kaderde değil. Bu fişi bir kez okuyunca sonraki derslerde kutunun üstüne isim yazmaya hazırsın.`,
    `Tırnak içindeki metin string’dir — metin dizisi; sayı değil, etiket değil, düpedüz harf dizisi.

Buraya dikkat... print yazmak büyü değildir. Çağrı gelir, parantez açılır, değer verilir, çıktı düşer. Bu zinciri görmeden «çalıştı» demek, kasa fişini okumadan «ödedim» demek gibidir.

Bunu günlük hayattan bir örnekle ele alırsak... çarşıdaki tezgahtar «hoş geldiniz» yazısını vitrine asar. Yazdığı neyse görünen odur. Tırnağı unutursan vitrin boş kalmaz; cam kırılır: sözdizimi hatası gelir.

Kırılma anı tam olarak bu adımda yaşanıyor. Kursiyer print Hello yazar, tırnak ve parantez durmaz. Yorumlayıcı «bunu nasıl okuyayım?» diye durur. Doğru satır net durur: print("Merhaba, Yetkin").

Vaka: kursiyer print Hello yazar, tırnak ve parantez unutur. Sözdizimi hatası gelir. Doğru satır: print("Merhaba, Yetkin").`,
    `İlk programın çalışınca ortamın hazır olduğunu görürsün; çıktı senin kontrol panelin olur. O panel susmuyorsa sen duyulmuşsundur.

Bir sonraki bölümde seni değişkenler ve tipler bekliyor: isim vermeden değeri nasıl tutarsın, kutunun üstüne ne yazarsın.`,
  ),
  academyLessonDraft(
    "python-temel-2",
    2,
    "Değişkenler, tipler ve dürüst isimlendirme",
    `Market rafında etiketsiz bir kavanoz gördün mü? Elin uzanır, sonra durur. İçinde recel mi, turşu mu, tuz mu — bilmeden karıştırmazsın. Program da öyle: değişken adı kavanozun etiketi, tip ise içeriğin cinsidir. x diye bir kutu açmak, markette «şey» yazmak gibidir; yarın sen de unutursun.

int tamsayıdır, float ondalıktır, str metindir, bool doğru ya da yanlıştır. type() ile kutuyu açmadan cinsini sorarsın. İsimler anlamlı durur: adet, fiyat_kurus, musteri_adi.`,
    `Kısa olduğu için x seçmek, sonra fişi bozar.

Buraya dikkat... «250,00» metin iken sayı sanmak fişi ikiye katlar. Tip netleşmeden ortalama alma; çarpma yapma; «iki katı» diye birleştirme üretme.

Başka bir deyişle... değişken, değeri unutturmayan bir etiket sözleşmesidir. Sözleşme bozulunca sessizce yanlış sonuç çıkar; gürültü kopmaz.

Saha tecrübesiyle söyleyeyim: Buradaki küçük bir detay tüm sonucu değiştirir. tutar = "250,00" iken tutar * 2 sayı üretmez; '250,00250,00' diye metni yapıştırır. Gözün «500» bekler, eline çöp gelir.

Vaka: tutar = "250,00" iken tutar * 2 birleştirme üretir. int’e çevirmeden çarpım yapılmaz.`,
    `Tip ve isim netleşince sonraki işlemler güvenli yürür. Kutunun üstü dürüstse mutfak karışmaz.

Bir sonraki bölümde seni kontrol akışı bekliyor: if ve else ile karar nasıl yazılır, ışık ne zaman yanar.`,
  ),
  academyLessonDraft(
    "python-temel-3",
    3,
    "Kontrol akışı: if, elif, else ile karar",
    `Otobüs şoförü her durakta aynı hareketi yapmaz. Zil çaldıysa durur, çalmadıysa geçer. Program da bir cümle kurar: «şu doğruysa şunu yap, değilse öbürünü.» if bloğu yalnızca koşul doğruysa çalışır. Yanlışsa o kapı kapalı kalır; inat etmez.

Karşılaştırma operatörleri (==, !=, <, >, <=, >=) bool üretir — doğru ya da yanlış. Birden fazla dal için elif zinciri durur; else kalan durumları yakalar.`,
    `Girinti (indentation) blok sınırıdır; Python’da süslü parantez yok, boşluk konuşur.

Buraya dikkat... = atama, == karşılaştırmadır. Karışınca sessiz hata doğar: kapıyı kilitlemek isterken anahtarı duvara çakarsın.

Bunu günlük hayattan bir örnekle ele alırsak... «bakiye yeterliyse öde, değilse uyar» cümlesi birebir if/else’tir. Gişede görevli bakiyeye bakmadan «geç» demez.

Kırılma anı tam olarak bu adımda yaşanıyor. not_ort = 68 iken «geçti» yazdıran kod 70 barajını kaçırır. Koşul not_ort >= 70 olmalı; 68 «tekrar» dalına düşer.

Vaka: not_ort = 68 iken «geçti» yazdıran kod 70 barajını kaçırır. Koşul not_ort >= 70 olmalı.`,
    `Koşullu dallanma, programın «ne zaman ne yapacağını» okunur kılar. Işık yazılıysa kavga bitmez.

Bir sonraki bölümde seni döngüler bekliyor: tekrarlayan işi bir kez yazıp çok kez koşturma.`,
  ),
  academyLessonDraft(
    "python-temel-4",
    4,
    "Döngüler: for ve while ile tekrar",
    `Çay ocağında aynı bardağı yüz kez elde yıkamak mümkün. Kimse övünmez. Makineye «yüz kez yıka» dersen tarif bir yerde durur, iş yüz kez olur. for bilinen bir koleksiyonu gezer; while koşul doğru kaldıkça sürer. Farkı şudur: birinde liste hazırdır, öbüründe «daha bitmedi» cümlesi durur.

range(n) 0’dan n-1’e kadar üretir. break döngüyü erken bitirir; continue o turu atlar. Sonsuz while’dan kaçınmak için sayaç veya koşul net tutulur.`,
    `while True yazıp çıkış unutmak, çay ocağının musluğunu açık bırakmaktır.

Buraya dikkat... while True yazıp çıkış koşulu unutmak editörü dondurur. Makine durmaz; sen durursun.

Başka bir deyişle... döngü, «tekrar»ı kod tekrarına çevirmeden halletmektir. Aynı satırı kopyalayıp alt alta dizmek tarif değildir; kopya defteridir.

İşte işin düğümlendiği, kritik nokta tam da burası. 1’den 5’e kadar toplam isteniyor. for i in range(1, 6) ile toplam += i doğru kalıptır. range(5) 0..4 üretir; 5’i kaçırırsan toplam 10 kalır, 15 değil.

Vaka: 1’den 5’e kadar toplam isteniyor; for i in range(1, 6) ile toplam += i doğru kalıptır.`,
    `Döngü oturunca listeleri ve toplu işlemleri rahat okursun. Tekrar korkusu düşer.

Bir sonraki bölümde seni fonksiyonlar bekliyor: işi adlandırıp yeniden kullanma, tarifi bir kez yazma.`,
  ),
  academyLessonDraft(
    "python-temel-5",
    5,
    "Fonksiyonlar: parametre, dönüş ve yeniden kullanım",
    `Esnafın «standart poşet»i vardır: kilo gelir, poşet çıkar, tarife bakılmaz her seferinde. def ortalama(sayilar) de odur. Çağıran taraf içindeki tartıyı bilmek zorunda kalmaz. Her seferinde aynı formülü kopyalamak, poşeti her müşteri için yeniden dikmek gibidir.

def ile tanım, return ile sonuç döner. Parametre varsayılan değer alabilir. Fonksiyon içi değişken yereldir; dışarı sızdırmaz. Docstring kısa amaç yazar — «bu tartı ne işe yarar» cümlesi.`,
    `Buraya dikkat... return olmadan fonksiyon None döner; «sonucu yazdırdım» ile «sonucu verdim» aynı değildir. Tezgâhta bağırmak, tartı fişi kesmek değildir.

Bunu günlük hayattan bir örnekle ele alırsak... mutfakta ölçü kabı: girdiyi alıp standart çıktı üretir. Unu göz kararı dökmezsin; kap konuşur.

Saha tecrübesiyle söyleyeyim: Buradaki küçük bir detay tüm sonucu değiştirir. Fiyatları kuruşa çeviren fonksiyon float lira basıyorsa kasa kuruş bekler, ondalık gelir. int(round(lira * 100)) ile tamsayı kuruş döner.

Vaka: fiyatları kuruşa çeviren fonksiyon float lira basıyor. int(round(lira * 100)) ile tamsayı kuruş döner.`,
    `Fonksiyon, okunur ve test edilebilir adımların temel birimidir. İsmi olan iş, tekrar yazılmaz.

Bir sonraki bölümde seni küçük proje bekliyor: girdi alan, hesaplayan, sonuç yazan etkileşimli betik.`,
  ),
  academyLessonDraft(
    "python-temel-6",
    6,
    "Mini proje: etkileşimli hesap ve girdi doğrulama",
    `Gişede «kaç bilet?» diye sorarsın. Biri «üç» der. Kızmazsın; «sayı olarak söyler misiniz?» dersin. Program da öyle. Öğrendiklerini tek parçada birleştiriyoruz: kullanıcıdan metin al, tipe çevir, hata olursa kibarca uyar, doğruysa sonucu yazdır. Çökmek nezaket değildir.

input() her zaman str döner — metin dizisi. try/except ile ValueError yakalanır; boş girdi reddedilir. Program bitince özet satırı basılır. Bu Temel seviyenin kapanış laboratuvarıdır: girdi, doğrula, hesapla, yazdır.`,
    `Buraya dikkat... kullanıcıya kızmak yerine net mesaj ver: «Lütfen tamsayı gir.» Makine küfretmez; cümle kurar.

Başka bir deyişle... etkileşim, makineyi insan diline çevirmektir. İnsan «üç» deyince int("üç") patlar; except o patlamayı yutar, döngü yeniden sorar.

Şimdi bu kısmı bir kez daha farklı bir örnekle oturtalım... «kaç adet?» sorusuna «üç» yazılınca çökmemeli. except ile yeniden sorulmalı. Çökmek, gişenin kepenk indirmesidir; müşteri kapıda kalır.

Vaka: «kaç adet?» sorusuna «üç» yazılınca çökmemeli; except ile yeniden sorulmalı.`,
    `Girdi → doğrula → hesapla → yazdır döngüsü Temel kapanışın özetidir. İleri halkada koleksiyon, dosya ve tablo bekliyor.

Bir sonraki bölümde seni listeler ve sözlükler bekliyor: sırayı ve anahtarı nasıl tutarsın.`,
  ),
  ...academyGrowthLessons([
    {
      key: "python-temel-7",
      order: 7,
      title: "Listeler: sıra, indeks ve dilimleme disiplini",
      intro: `Pazar tezgâhında sebzeler sırayla durur: birinci patates, ikinci soğan. Liste (list) odur — sırası olan kutu dizisi. Köşeli parantez açarsın, elemanları virgülle koyarsın. İndeks sıfırdan başlar; «birinci» dediğin şey kodda sıfırıncı raftır. Bu kafa karışıklığı utanç değil, tezgâh kuralıdır.

len ile uzunluk, append ile sona ekleme, for ile tur. Dilimleme (slicing) rafın bir dilimini koparır; asıl tezgâh yerinde kalır. İsim dürüst durur: sepet, notlar, satirlar.`,
      trap: `Sepet[1] «birinci eleman» sanılır. Değildir; ikinci raftır. Kursiyer sepet[len(sepet)] yazar, IndexError gelir. Sınır, uzunluk eksi birdir.`,
      analogy: `otobüs durakları: ilk durak sıfırıncı levhadır. «üçüncü durakta ineceğim» dersen indeks iki durur. Levha kayınca yanlış mahallede inersin.`,
      vaka: `kursiyer sepet[len(sepet)] ile son elemanı okur, IndexError gelir. Doğru satır sepet[-1] veya sepet[len(sepet) - 1].`,
      conclusion: `Liste, sırayı unutmayan tezgâhtır. İndeks dürüst durur; dilim kopya niyetini yazar.

Bir sonraki bölümde seni sözlükler bekliyor: anahtarla değeri nasıl bağlarsın.`,
    },
    {
      key: "python-temel-8",
      order: 8,
      title: "Sözlükler: anahtar, değer ve dürüst etiket",
      intro: `Dolap rafında kavanozun üstünde etiket vardır: recel, turşu, tuz. Sözlük (dict) odur — anahtar etikettir, değer içerik. Süslü parantez, iki nokta üst üste. «üçüncü kavanoz» diye saymak yerine «recel» dersin; sıra değişse de etiket durur.

.get ile yokluğu kibarca sorarsın; köşeli parantez yok anahtarda KeyError basar. Anahtar hash’lenebilir durur: metin, tamsayı. Liste anahtar olmaz. İsimler: stok, musteri, kayit.`,
      trap: `stok["elma"] yokken çökmek, rafta etiket arayıp tezgâhı devirmektir. .get("elma", 0) yokluğu sıfır kabul eder; ya da anahtarı önce in ile sorarsın.`,
      analogy: `nüfus cüzdanı: isim anahtar, adres değer. Sıra numarasıyla vatandaşı aramazsın; isimle ararsın. Yanlış isim boş döner, mahalle karışmaz.`,
      vaka: `kursiyer stok["armut"] okur, anahtar yok, KeyError gelir. stok.get("armut", 0) veya "armut" in stok ile yokluk dürüst kalır.`,
      conclusion: `Sözlük, etiketi sıradan ayırır. Yokluğu çökmeden sorarsın.

Bir sonraki bölümde seni dosya yolları bekliyor: pathlib ile okuma ve yazma.`,
    },
    {
      key: "python-temel-9",
      order: 9,
      title: "Dosya yolları: pathlib, okuma ve atomik yazım",
      intro: `Faturayı orijinal klasörden silip fotokopiyi aynı isimle bırakmak yarın izi kaybettirir. pathlib.Path yol nesnesidir; işletim sisteminin eğik çizgisini sen ezbere yazmazsın. Kaynak klasör ayrı, çıktı klasör ayrı durur. glob ile «bütün virgülle ayrılmış değerler» listelenir.

open ile metin okunur, encoding dürüst yazılır. Yazarken geçici dosya, sonra rename: atomik teslim. index=False ile Pandas yazımı boş indeks basmaz. Kimlik sütunu rapora girmez.`,
      trap: `Aynı yola üzerine yazmak, faturanın üstüne karalamaktır. Kursiyer open(hedef, "w") ile kaynağı ezer. Geçici yol + replace, asıl dosyayı son anda değiştirir.`,
      analogy: `noter mührü: taslak kâğıda yazılır, imza bitince asıl dosyaya konur. Taslağı asıl sandığında mühür kaybolur.`,
      vaka: `kursiyer girdi.csv üzerine işlenmiş tabloyu yazar, kaynak silinir. pathlib ile girdi/ ve cikti/ ayrılır; yazım geçici→rename olur.`,
      conclusion: `Yol nesnesi, kaynağı ve teslimi ayırır. Atomik yazım, yarın aynı yemeği pişirmenin tarifidir.

Bir sonraki bölümde seni Pandas tablo sözleşmesi bekliyor: cins yazılı değilse ortalama yalandır.`,
    },
    {
      key: "python-temel-10",
      order: 10,
      title: "Pandas tablo sözleşmesi: dtypes ve kuruş tamsayı",
      intro: `Pazarda tartısız tezgâha «üç kilo» deyip para uzatmazsın. DataFrame satır-sütun sözleşmesidir. pd.read_csv okur, dtypes cinsleri gösterir. Tutar sütunu int64 kuruş durur; «250,00» metni ortalama üretmez, birleştirilmiş saçmalık üretir.

info() teşhis basar. Kimlik sütunu rapora düşmez; drop ile çıkar. İsimler: amount_kurus, status, hafta. Float lira ortalama tuzağı burada da durur: kuruş tamsayı, yuvarlama ayrı adım.`,
      trap: `df["tutar"].mean() metin sütunda sessizce yanlış veya hata basar. Cins yazılı değilse ortalama yalandır. astype("int64") öncesi boşluk ve virgül temizlenir.`,
      analogy: `manav tartısı: kilo yazılmadan fiyat konuşulmaz. Cins yoksa «ortalama» vitrin mankenidir.`,
      vaka: `kursiyer amount_kurus’u object bırakıp mean basar. dtypes kontrolü int64 ister; metin satır temizlenmeden ortalama yayımlanmaz.`,
      conclusion: `Tablo, yazılı cinsle konuşur. Teşhis, rapordan önce gelir.

Bir sonraki bölümde seni parametreli Yapılandırılmış Sorgu Dili bekliyor: değer ayrı, cümle ayrı.`,
    },
    {
      key: "python-temel-11",
      order: 11,
      title: "Parametreli SQL köprüsü: değer ayrı, cümle ayrı",
      intro: `Kapıdaki görevliye kimliğini bağırarak söylemek yerine fiş uzatırsın. Yapılandırılmış Sorgu Dili (SQL) cümlesi tariftir; kullanıcı kimliği malzemedir. f-string ile sorgu birleştirmek, tarife yabancı el yazısı karıştırmaktır. sqlite3 veya SQLAlchemy bağlantısında parametre yer tutucusu durur: soru işareti veya isimli bağ.

pd.read_sql DataFrame döner. Bağlantı with ile kapanır. Kullanıcı girdisi cümleye yapışmaz; params tuple gider. Bu köprü, dosya laboratuvarını depo kapısına taşır.`,
      trap: `f"SELECT * FROM orders WHERE user_id = {user_id}" enjeksiyon kapısı açar. Kursiyer «çalıştı» deyince teslim sanır. Parametre bağlanmadan yeşil tik basılmaz.`,
      analogy: `noter fişi: metin kalıp, kimlik kutusu ayrı. Kutuya yazılan cümleyi değiştirmez; sadece boşluğu doldurur.`,
      vaka: `kursiyer kullanıcı kimliğini f-string ile sorguya yapıştırır. pd.read_sql(..., params=(user_id,)) ile değer ayrı durur; birleştirmeli cümle reddedilir.`,
      conclusion: `Sorgu cümlesi tariftir, değer parametredir. Köprü dürüstse tablo kirlenmez.

Bir sonraki bölümde seni kapanış laboratuvarı bekliyor: oku, doğrula, yaz, sınava hazırlan.`,
    },
    {
      key: "python-temel-12",
      order: 12,
      title: "Kapanış laboratuvarı: girdi, tablo ve yenilenebilir özet",
      intro: `Yarın aynı yemeği yapmak için tarif defteri gerekir; ekran görüntüsü yetmez. Bu bölüm Temel ve İleri halkayı tek betikte toplar: girdi al, doğrula, liste veya sözlükte tut, dosyadan oku, Pandas ile cins kontrol et, özet yaz. main() kapısı, yeniden koşmayan raporun ölüm ilanıdır.

İş kanıtı burada da durur: kuruş tamsayı, kimlik raporda yok, parametreli sorgu. Çökmek nezaket değildir; except ile insan cümlesi basılır. Bu kapanış, sınav kapısının eşiğidir.`,
      trap: `Ekran görüntüsünü teslim saymak, faturayı fotoğraflayıp defteri yakmaktır. Betik yarın aynı girdiyle aynı özeti basmazsa laboratuvar bitmemiştir.`,
      analogy: `esnaf defteri: akşam kasa, sabah aynı kalemle açılır. Defter yoksa «dün sattım» sözdür, kanıt değil.`,
      vaka: `kursiyer PNG yapıştırıp «bitti» der. oku→doğrula→özet→yaz betiği yok. Yeniden koşan main ve yazılı payda olmadan teslim kabul edilmez.`,
      conclusion: `On iki bölüm tek cümlede: girdi doğrulanır, koleksiyon tutulur, tablo cinsle konuşur, sorgu parametrelidir.

Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.`,
    },
  ]),
] as const;
