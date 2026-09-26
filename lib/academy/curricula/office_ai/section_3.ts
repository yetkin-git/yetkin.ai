import type { Section } from "../types";

export const section3: Section = {
  sectionNumber: 4,
  lessonKey: "01_office_ai-3",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Metinden Slayta: Sunum Hazırlama",
  targetDurationMinutes: 9,
  estimatedWordCount: 1188,
  pedagogicalObjective:
      "Metinden slayt başına tek fikir, görsel yönlendirme ve taslak aktarma akışını göstermek. Slayttaki genel toplam veya karar sayısı kaynak Excel hücresiyle aynı değilse slayt yayınlanmaz. Yapay zekâ yönlendirmesi: rol ver, taslak iste, görseli parantezde tarif et. Neden düz metin yığını doldurulmaz? Çünkü dinleyici okur, seni dinlemez.",
  contentMarkdown: `
Geçtiğimiz derste devasa tabloları ve dağınık ham verileri dakikalar içinde derleyip toparlamıştık. Sayfalarca süren karmaşık bir veri yığınından net bir rapor çıkarma işini ve üst yönetimin doğrudan karar almasını sağlayan o kritik yönetim özeti refleksini kazandın. Üç madde ve net bir karar cümlesi ile toplantıda kararsızlığı nasıl hızla ortadan kaldırabileceğimizi gördük. Bu dersin sonunda slayt başına tek fikir kuralını tek başına yapacaksın. Hâlâ slayta geçmiyoruz: yönetim özeti masada kalsa bile toplantı slaytsız yürümez; o üç madde, doğru bir görsel yönlendirmeyle aktarılmadıkça hak ettiği etkiyi yaratamaz. Şimdi elimizdeki o güçlü analizi ekibe ve yöneticilere sunma aşamasına geçiyoruz.

Selamlar, ben Gözde. yetkin.ai akademisinin bu dördüncü dersinde seninle birlikte metni slayta çevirmenin yolunu kuracağız. Geçen derste üç maddelik yönetim özetini kilitledik; peki şimdi ne olacak? Özet cebinde durur ama toplantı slayt ister. Hepimiz o toplantı öncesi saatlerce boş sayfaya bakıp durduk. Elinde harika fikirler, eksiksiz veriler var ama onları boş bir slayta dökmek korkutucu gelir. Peki neden sunum hazırlamak bu kadar zaman yer? Çünkü çoğu kişi önce şablonu süsler; mesajı sona bırakır. Bugün o sırayı çevireceğiz: önce tek fikir, sonra slayt taslağı.

Tasarımı önce bitirmeyiz. Slaytın süsünü sen çizmek zorunda değilsin. Sen mesajı seçersin: her slaytta tek fikir. Metni slayta çevirirken iş bölümü değişir. Sen akışı ve tek mesajı seçersin. Yapay zekâ taslağı yazar.

## ŞABLON KAOSU

Düşünsene, yarın sabah erken saatte yönetim kuruluna sunumun var. Şirket arşivinde onlarca eski sunumu açıp uygun bir slayt düzeni arıyorsun. İnternetten indirdiğin havalı bir şablon ise elindeki içeriğe hiç uymuyor; metinler kutulardan taşıyor, grafikler karmakarışık görünüyor. İşte biz buna ofiste şablon kaosu diyoruz. Şablon avı saatleri yer: süs içeriğin önüne geçer; anlatmak istediğin dağılır. Saatlerce font seçmekle ya da şekilleri milimetrik hizalamakla uğraşmak yerine, sistemli bir içerik kurgusu oluşturmaya odaklanırsın.

Hepimizin yaptığı en büyük hata, sayfaları süslemenin sunumu kaliteli kılacağını düşünmektir. Oysa kalabalık şekiller, ilgisiz ikonlar ve göz yoran renkler dinleyicinin dikkatini dağıtmaktan başka bir işe yaramaz. Peki neden slayta düz metin yığını doldurulmaz? Çünkü insan zihni karmaşadan hızla uzaklaşır; dinleyici okumaya başlar, seni dinlemeyi bırakır. Eğer bir slayt ilk üç saniyede ne anlatmak istediğini hissettiremiyorsa, o sunum amacına ulaşamamış demektir. Bu yüzden önceliğimiz süsleme değil, ana mesaj olur.

## SLAYT İSTE

Şimdi mantığı oturtalım. Peki yapay zekâdan slayt taslağı nasıl alınır? İşe, elimizdeki ham metni modele verip net bir rol biçerek başlıyoruz. Yapay zekâya bir sunum tasarımcısı olduğunu yazmalı ve her sayfada tek fikir barındıran bir slayt taslağı oluşturmasını iste. Peki tek fikir kuralı nedir? Her slayt yalnızca bir vurucu mesaj taşır; on madde taşımaz. PowerPoint Copilot lisansın varsa bu birinci kapıdır: istemi şeritteki panele yazarsın. Yoksa ikinci kapı PowerPoint sunusunu sohbete ataşlamaktır. Gamma veya Marp istersen kullanabilirsin; ana yol değildir. Kod yazdırmazsın. İsteminde başlıkları, vurucu mesajı ve ekranda yer alacak maddeleri net kısıtlarla ayırmasını belirtmelisin.

İstemine mutlaka görsel yönlendirme eklemesini de şart koşmalısın. Neden? Çünkü yapay zekâ yalnız metin yazarsa taslak yine duvar olur. Yani model yalnızca cümle basmamalı; her bir sayfanın sağ köşesinde nasıl bir grafik veya resim bulunması gerektiğini parantez içinde tarif eder. Eğer PowerPoint Copilot yoksa metin dosyasını ataşla yükle; model sana slayt başlıklarını ve konuşmacı notlarını hazırlar. VBA makrosu bu derste yoktur. Bu aşamada yazdığın istem ne kadar net yazılmış olursa, elde edeceğin slayt taslağı da o kadar net olur.

## HİYERARŞİ

Şimdi ekrana gelen karşılaştırmaya dikkatle bakmanı istiyorum. Sol tarafta ofislerde sıkça gördüğümüz o klasik durum var: Önce, yani düz metin yığını. Paragraflar kopyalanıp doğrudan sayfaya yapıştırılmış, hiçbir vurgu yok ve okumak bile insanı yoruyor. Sağ tarafta ise yapay zekânın ürettiği sonuç duruyor: Sonra, yani görsel hiyerarşi (gözün bakma sırası) ile kurulu slayt. Yapay zekâ sayfayı tek bir güçlü başlık, üç net odak ve dinleyicinin gözünü yormayan mantıklı bir sırayla kurmuş. Peki neden sol taraf yorar da sağ taraf tutar? Çünkü tek fikir slaytta yerini gösterir; yığın ise her şeyi aynı anda bağırır.

Sağ taraftaki bakma sırası, yöneticinin önce nereye bakacağını gösterir. Ana sayı ve ana metin büyük durur, destek cümleleri daha küçük durur. Soldaki düz metin kalabalığında dinleyici slaytı okumaya çalışırken konuşmacıyı dinlemeyi bırakır. Sağdaki kurguda slayt senin cümleni örtmez. Mesaj üç saniyede okunur. Sen konuşmaya devam edersin.

## FARK ORTADA

Ekrana dikkatli bak. Peki neden fark bu kadar belirgin? Çünkü soldaki düz metin yaklaşımında saatlerce çalışıp yorulsan bile ortaya çıkan sonuç dağınık hissettirir. Sağdaki yapay zekâ modelinde ise doğru bir bakma sırası oluşturulduğu için mesaj doğrudan hedefine ulaşır. Sol taraf her cümleyi taşır, bakış noktası yoktur. Sağ taraf tek başlık ve üç odak taşır, toplantı yürür. Yapay zekâ sana yalnızca bir süs sunmuyor; metnini sadeleştiriyor, sıraya koyuyor ve yöneticinin aklına en hızlı şekilde akmasını sağlıyor. Üstelik bu dönüşümü dakikalarca uğraşarak değil, doğru yönlendirilmiş tek bir istemle elde ediyorsun.

Bu yaklaşımı bir kez kaptığında, sunum hazırlamak artık iş gününü bölen uzun bir iş olmaktan çıkar. Metnini ekrana koyduğunda yapay zekâ sana hazır bir taslak sunduğu için, sen enerjini tamamen sunumun provasına ve anlatım tonuna saklayabilirsin. Hangi veriyi vurgulayacağını, nerede duraklayacağını ve dinleyiciden ne talep edeceğini düşünmek için vaktin kalır. Slayt senin yerine konuşmaz. Provayı ve anlatım tonunu sen yaparsın.

## CEBİNE KOY

Şimdi bu derste öğrendiğin yaklaşımı iş hayatında her gün kullanabileceğin üç somut adıma dökelim ve cebine koyalım. 1. Slayt başına tek fikir ver; sayfayı karmaşık bilgiyle boğmak yerine her slaytı yalnızca tek bir vurucu mesaja odakla. Çünkü dinleyici on madde okursa seni dinlemez. 2. Görsel yönlendirmeyi yaz; yapay zekâya sadece sunum metinlerini değil, ekranda hangi veri grafiklerinin veya simgelerin yer alacağını parantez içinde tarif ettir. Çünkü yön yoksa taslak yine metin duvarı basar. 3. Taslağı aktar; Copilot şeridinden veya PowerPoint sunusu ataşından gelen düzenli çıktıyı slayt başına tek fikir kalarak PowerPoint’e taşı. Çünkü aktarırken madde şişerse sıra bozulur. Bu üç adımı her projede uyguladığında sunum hazırlamak zahmetli bir iş olmaktan çıkar.

## SIRA SENDE

Şimdi bu bilgileri sahada bizzat test etme sırası sende. Senden istediğim görev net: Geçen derste hazırladığın o yönetim özetini veya iş yerinde üzerinde çalıştığın herhangi bir ham metni al. Kişi adı, IBAN veya şirket sırrı varsa önce maskele; ham metni sohbete yükleme. Yapay zekâya sunum tasarımcısı rolünü ver ve metnini beş slaytlık düzenli bir sunum taslağına dönüştürmesini iste. Her slaytta tek bir mesaj olmasına dikkat et ve görsel önerilerini mutlaka yaz. Çıkan slaytta on madde görürsen metni masaya koyma; tek fikre indir.

Sunum taslağını hazırladıktan sonra hiç durmadan bir sonraki adıma geçeceğiz. 5. derste akıcı slaytın arkasındaki uydurma sayıyı yakalayacağız: İstisnalar ve Hata Avı. E-Posta Akışı ondan sonra tek derste gelir: Gmail, Outlook ve aksiyon listesi. Slayta yazdığın genel toplam veya karar sayısı, kaynak Excel hücresiyle %100 aynı değilse o slaytı yayınlama.

## El kitabı (sesin sığdırmadığı)

### Lisans yoksa ne yapılır?
PowerPoint Copilot yoksa PowerPoint sunusunu sohbete ataşla; model başlık ve konuşmacı notunu dosyanın üstünden çıkarır. Gamma veya Marp istersen kullanabilirsin; ana yol değildir. VBA bu derste yoktur. Tek fikir kuralı araç değişince bozulmaz: slayt başına bir mesaj, görsel yönlendirme parantezde.

### Kenar durum / dikkat edilecek hata
Şirket şablonu (renk, logo, dipnot) modelde yoktur. Taslağı aktarırken slayt başına tek fikir kalsın; kurumsal temayı sen kilitle. Konuşmacı notunu slayt gövdesine yapıştırma. Neden? Çünkü gövdeye yapıştırılan not, düz metin yığınını geri getirir.

### Yapılmaması gereken tuzak
On maddelik slayt. Dinleyici okur, seni dinlemez. İkinci tuzak: rapordaki uydurma sayıyı slayta taşımak. Bir sonraki derste o sayıyı avlayacağız; slaytı ondan önce kilitleme.
`,
};
