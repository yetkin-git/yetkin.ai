import type { Section } from "../types";

export const section2: Section = {
  sectionNumber: 3,
  lessonKey: "01_office_ai-2",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Yönetim Özetine Dönüştürme",
  targetDurationMinutes: 8.6,
  estimatedWordCount: 1175,
  pedagogicalObjective:
    "Temiz tablodan üç maddelik yönetim özeti ve karar cümlesi çıkarma akışını göstermek. Neden üç madde? Çünkü yönetici on sayfayı okumaz. Sayıları hücreden kilitle; uydurma yüzde yasaktır.",
  contentMarkdown: `
İlk dersimizde masandaki o karmaşık Excel tablonu ele almış, düzensiz tabloyu A1 kuralıyla temizleme refleksi kazanmıştın. Hatırlarsan, birleşmiş hücreleri tek tek çözüp veri türlerini tek tip hale getirerek işe başlamıştık. Her şeyin başı, sol üst köşedeki o kritik A1 hücresi ile başlayan düzenli bir başlık satırı kurmaktı. İkinci derste ise o temiz tabloyu yüklemeden önce KVKK kuralını kilitledik: ham isim, telefon ve IBAN sohbete gitmez. Şimdi o temel kuralı kaptın, tablon tertemiz ve maskeli temiz tablo olarak önünde duruyor. Bu dersin sonunda üç maddelik yönetim özetini tek başına yapacaksın. Hâlâ rapora geçmiyoruz: temiz ve maskeli tablo, tek başına yöneticinin sorusunu cevaplamaz. Şimdi bu zeminin üstünde ham satırları konuşan bir yönetim özetine çevireceğiz.

Selamlar, ben Gözde. yetkin.ai akademisinin bu üçüncü dersinde seninle birlikte tablonun içinden ne yapılacağını çıkaracağız. Geçen derste maske refleksini kilitleyip tabloları toparladık; peki şimdi ne olacak? Masanın üstünde duran yüzlerce satırlık veri tablosu tek başına kimseye bir şey anlatmaz. Yöneticinin senden beklediği şey satır satır döküm değil, ne yapılması gerektiğidir. Peki neden üç maddelik yönetim özeti isteriz de on sayfalık dökümü istemeyiz? Çünkü yöneticinin yirmi dakikası vardır; yüzlerce satırı okuyup ana fikri ayıklamaya vakti yoktur. Bugün o satırları üç maddeye ve bir karar cümlesine indirmeyi öğreneceksin.

Yöneticin bu ayın performansını özetleyen net bir metin istiyor ve toplantıya yirmi dakika kalmış. Sayfalar dolusu rakamı elle tek tek inceleyip anlamlı bir metin yazmak için zamanın yok. Temiz tablonu doğru istemle vereceksin. Böylece hem yirmi dakikaya sığarsın hem de yöneticin satır avına düşmez (yüzlerce satırda tek tek arama yapmaz).

## UZUN RAPOR

Geleneksel ofis alışkanlıklarında en büyük hata, tablodaki her veriyi eksiksiz kopyalayıp upuzun bir metne dönüştürmektir. Saatlerce uğraşıp hazırladığın o sayfalarca metin genellikle okunmaz, hatta yöneticinin masasında göz ucuyla bile taranmadan kenara itilir. Uzun rapor bir başarı sayılmaz. Yoğun bir iş gününde kimsenin yüzlerce satırı okuyup içinden ana fikri ayıklamaya vakti yoktur. Sayfa sayısı bilgi taşımaz; üç net madde taşır. Bu yüzden on sayfalık dökümü istemek, toplantıyı kazandırmaz; kaybettirir.

Düşünsene, ekranda kaydırdıkça bitmeyen bir ham veri tablosu duruyor. Hangi ürünün kâr getirdiğini, hangi bölgenin geride kaldığını görmek için satırları tek tek toplamak zorunda kalıyorsun. Geleneksel yöntemle bir rapor yazmaya kalktığında, her detayı anlatma telaşıyla konunun özünü tamamen kaybedersin. Yönetim masasında senden beklenen, tablonun fotoğrafı değil; o tablonun ne yapılması gerektiğini söylemesidir. Amacımız seni bu yorucu döngüden çıkarmak: satır satır anlatmak yerine, üç maddeyle karar aldırmak.

## ÖZET İSTE

Şimdi mantığı oturtalım. Temizlenmiş tablomuzu yapay zekâya emanet etme vakti. Ancak burada alelade bir özetleme istemi vermek işe yaramaz. Neden? Çünkü her şeyi özetle dersen model dolgu üretir; üç madde yerine boş laf yazar. Yapay zekâdan doğrudan bir yönetim özeti talep edeceğiz ve kısıtı çok net koyacağız: tam üç madde ve ardından gelen tek bir karar cümlesi. Copilot varsa düğmeden okut; yoksa Excel tablosunu ataşla yükle. Kişisel veri varsa önce maskele. Kalabalık sütunları geride bırak; özet için beş sütun yeter. Bu çerçeveyi net verdiğinde model gereksiz detaya girmeden sonuca odaklanır.

İstemini kurarken modele rolünü baştan yazmalısın. Peki yapay zekâ uydurmasın diye sayıları nasıl kilitleriz? Sayıyı tahmin ettirmezsin; hücreden aldırırsın. Modele şunu yazabilirsin: Bu temiz tablodan toplamı ve yönü çıkar. Tam üç maddelik yönetim özetini ve tek karar cümlesini yaz. Sayıları tablodaki hücrelerden al. Uydurma yüzde ekleme. Gördüğün gibi istem günlük dille yazılıyor; model hem biçimi hem sayı kilidini net duyuyor. Hazırladığımız bu istemle sistemin nasıl odaklandığını birazdan ekranda göreceğiz.

## KARAR NOTU

Sol tarafta ÖNCE etiketli 10 sayfalık döküm dururken, sağ tarafta SONRA etiketli 3 maddelik yönetim özeti parlıyor. Yapay zekâ, ham satırları sadece özetlemekle kalmadı; doğrudan ne yapılacağını söyleyen bir karar cümlesi üretti. Bize sadece ne olduğunu değil, bundan sonra ne yapmamız gerektiğini de gösterdi. Peki neden karar cümlesi gözlem cümlesinden ayrı durur? Çünkü gözlem tabloyu anlatır; karar cümlesi onay, arama veya yön ister. Sayfalarca tablonun içinde kaybolmak yerine, üç maddeyle rotayı görürsün.

Üretilen bu karar cümlesi, sıradan bir metinden farklıdır. İçinde bahaneler, gereksiz dolgu kelimeleri ya da kafa karıştıran yüzdeler yığını barındırmaz. Neden? Çünkü her sayı kaynak hücreyle kilitlenmiştir; model akıcı diye yüzde uyduramaz. Her cümle paraya, aksayan işe ve hemen aranacak kişiye işaret eder. Yöneticin bu notu okuduğunda ikinci bir soru sormaz; çünkü ihtiyaç duyduğu cevabı ilk bakışta masasında bulur. Fark şudur: Biçim üç madde, sayı hücreden, karar tek cümledir.

## FARK ORTADA

Ekrana dikkatli bak. Peki neden fark bu kadar belirgin? Çünkü sol tarafta okuması saatler süren 10 sayfa dolusu ham veri tablosu var; sağ tarafta ise yapay zekânın çıkardığı, işe yarayan net 3 madde yer alıyor. Sol taraf her satırı taşır, karar yoktur. Sağ taraf üç madde ve bir karar cümlesi taşır, toplantı yürür. Hangi tarafın yöneticiye zaman kazandıracağını tahmin etmek zor değil. Bu iki ekran arasındaki fark, eski çalışma tarzınla yeni üretkenliğin arasındaki farktır.

Eski yöntemde o 10 sayfa içindeki tek bir tutarsızlığı yakalamak için satır satır okurdun. Şimdi ise sadece 3 madde okuyarak tablonun bütününü görüyorsun. Zamanını verileri toparlamaya değil, o verilerin işaret ettiği ne yapılacağını tartışmaya ayırıyorsun. Bu dönüşüm seni yalnızca hızlı çalışan biri yapmaz. Çünkü tablonun bütününü üç maddede görürsün; toplantıda satır avına düşmezsin.

## CEBİNE KOY

Şimdi bu derste öğrendiğin yaklaşımı iş hayatında her gün kullanabileceğin üç somut adıma dökelim ve cebine koyalım. 1. İlk olarak tablodaki toplam hacmi ve yönü modelden net bir şekilde iste. Çünkü yönetici önce büyüklüğü ve yönü duymak ister. 2. İkinci adımda ortalamadan çok sapan noktaları ve işi aksatacak riskleri tespit etmesini sor. Sayıları hücreden aldır; uydurma yüzde yasaktır. 3. Son adımda ise tüm bu bulguları tek karar cümlesine çevir: ne yapılacağını yaz. Çünkü gözlem yetmez; karar cümlesi olmadan toplantı yürümez. Bu üç adımlı reçeteyi her uyguladığında, en karmaşık tablolardan bile berrak bir yönetim özeti çıkarırsın.

## SIRA SENDE

Artık teoriyi geride bıraktık ve sahneye sen çıkıyorsun. Kendi bilgisayarını aç, günlük işlerinde kullandığın gerçek bir Excel tablosunu önüne al. Kişi adı, IBAN veya müşteri sırrı varsa önce maskele; ham tabloyu sohbete yükleme. İlk derste öğrendiğin gibi başlıklarını düzenleyip yapısını kontrol et. Ardından biraz önce çalıştığımız istem yapısını kullanarak kendi tablon için o üç maddelik yönetim özetini ve karar cümlesini üret. Çıkan her sayıyı kaynak hücreyle karşılaştır. Uydurma yüzde görürsen metni masaya koyma.

Tablodan özet çıkarma işini kaptın. Ancak yöneticiler bu özeti yalnızca okumak istemez; çoğunlukla bunu slaytta görmek isterler. Grafik bu derste yok; grafikleri Excel Formül dersinde (yakında) kuracağız. Şimdi metni slayta çeviriyoruz. 4. ders kapsamında, bugün ürettiğimiz bu metin özetini düzenli bir slayt taslağına dönüştüreceğiz. Bir sonraki derste metinden slayta geçiyoruz.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
Copilot yoksa temiz Excel tablosunu sohbet yapay zekâsına (ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb.) ataşla. Google Sheets bu derste yoktur; tabloyu Excel olarak indirip aynı istemi oraya yaz. Üç madde + karar cümlesi kuralı araç değişince bozulmaz. Sayı kilidi de bozulmaz: hücreden al, uydurma yüzde ekleme.

### Kenar durum / dikkat edilecek hata
Özet akıcı diye doğru değildir. Model yüzdeyi satırdan değil, tahminden üretebilir. Karar cümlesini kaynak hücreyle karşılaştır. Grafik bu derste yok; grafikleri Excel Formül dersinde (yakında) kuracağız. Slayt sonraki derstedir.

### Yapılmaması gereken tuzak
On sayfalık dökümü olduğu gibi yöneticiye iletmek. Özet istemek de tuzak olabilir: her şeyi özetle dersen, model dolgu üretir. Alıcı, amaç, biçim, kısıt yaz: üç madde, tek karar cümlesi, uydurma sayı yok.
`,
};
