import type { Section } from "../types";
import { bot104Section } from "./spoken-body";

/**
 * BOT-104 ders 3.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Mert.

Tolga'nın karar ağacı ekranda hazır duruyor. Karşılama, üç düğme, randevu dalı. Ama şu an bu ağaç yalnızca bir test penceresinde yaşıyor, müşteri ona hiçbir yerden ulaşamıyor. Bugün ağaca iki kapı açacağız: biri web sitesine, öteki WhatsApp'a.

## Önce kolay kapı

Web sohbet kutusu iki hattın kolay olanı. Voiceflow da Botpress da sana bir kod parçası veriyor. Sen o parçayı yazmıyorsun, yalnızca kopyalıyorsun. Sitenin ayarlarında özel kod ekleme ya da altbilgi alanı gibi bir yer var. Parçayı oraya yapıştırıyorsun, kaydediyorsun, sayfayı yeniliyorsun. Sağ altta küçük bir sohbet balonu çıkıyorsa iş tamam.

Burada bir sınama yap. Balonu aç, karşılama mesajı geliyor mu bak. Üç düğmeye sırayla bas. Her biri doğru dala gidiyor mu kontrol et. Telefonundan da dene, çünkü masaüstünde güzel duran bir kutu telefonda ekranı kaplayabiliyor. Sorun çıkarsa araçların kendi önizleme düğmesine dön, orada hatayı genelde bulursun.

## WhatsApp için sıra

WhatsApp bağlantısı biraz daha uzun bir yol. Ama sırayı bilirsen karışmaz. Ekranlar zamanla değişir, çünkü bu platformlar arayüzlerini sık yeniliyor. Sıra ise değişmez: önce hesap, sonra numara, sonra bağlantı, en sonda deneme.

Hesap kısmı şu. WhatsApp'ın işletmelere açtığı hat, Meta üzerinden çalışıyor. Bu yüzden bir Meta işletme hesabın olması gerekiyor. İşletme adın, sitesi ya da sayfası, iletişim bilgilerin orada doğrulanıyor. Bunu kendi adına yaptıran işletme sahibi ile birlikte yapmanı öneririm. Hesabı sen açarsan işi bitirince devretmek zorlaşabilir. Beşinci derste bu konuya yeniden döneceğiz.

Numara kısmında dikkat edeceğin bir şey var. Bota bağlayacağın numara, aynı anda sıradan WhatsApp uygulamasında kayıtlı olmamalı. Kayıtlıysa önce o uygulamadan çıkarılması gerekiyor. Tolga için ayrı bir hat aldık, böylece kişisel numarasını bozmadık. Sen de mümkünse ayrı bir hatla ilerle. Tolga'nın eski numarası yıllardır müşterilerde kayıtlı. O numarayı bota taşımak istersen, eski sohbetlerine ne olacağını geçişten önce platformun yardım sayfasından öğren.

Bağlantı kısmında Voiceflow ya da Botpress'in WhatsApp bölümüne girip hesabını bağlıyorsun. Bu sırada Meta'nın hesabınla giriş yapmanı istemesi normal. Numarayı doğruluyorsun, platform sana bir bağlantı onayı veriyor.

## Önce Meta'nın test numarasıyla dene

Gerçek numaraya geçmeden önce, Meta'nın ya da platformun sunduğu bir deneme numarası varsa onunla başla. Kendi telefonundan o numaraya yaz ve karar ağacının ilk mesajı gelsin. Düğmelere bas, her dalı yürü. Bu aşamada bir şey bozulursa müşterin görmez. Gerçek numaraya geçtiğinde aynı denemeyi bir kez daha tekrar et. Ben bu iki turu atlamıyorum. Atladığım gün, bir hatayı müşteriden öğrendim.

## Yirmi dört saatlik pencere

WhatsApp'ın botu doğrudan etkileyen bir kuralı var ve ağacı çizerken bunu hesaba katmak gerekiyor. Müşteri sana yazdığı anda yirmi dört saatlik bir pencere açılıyor. Bu pencere içinde istediğin gibi cevap verebilirsin. Pencere kapandıktan sonra ise müşteriye kendi başına mesaj atmak istersen, önceden onaylanmış bir şablon mesaj kullanman gerekiyor. Şablonları Meta onaylıyor, onay biraz zaman alıyor ve her mesaj türünün ücreti farklı olabiliyor. Kurulumdan önce güncel tarifeyi Meta'nın kendi sayfasından kontrol et. Rakamları ben burada söylemeyeceğim, çünkü değişiyorlar.

Bu kural ağacının tasarımına şöyle yansıyor. Randevu talebi gibi akışlar pencere içinde biter. Bot talebi alır, Tolga aynı gün içinde cevap yazar. Tolga cevaplamazsa ve pencere kapanırsa, ertesi gün müşteriye yazabilmek için şablon gerekir. Bu yüzden devir kuralına bir süre ekliyoruz: Tolga'ya düşen her talep, pencere kapanmadan önce görülmelidir. Telefonuna gelen bildirimi açık tut, akşam saatinde bir kez kontrol et.

## İlk mesajı kendin yaz

Her şey bağlandığında, kendi telefonundan botun numarasına yaz. Merhaba yaz, karşılama gelsin. Üç düğmeye bas, randevu dalını sonuna kadar yürü. Gerçekten talep düşüyor mu, Tolga'nın ekranında görüyor musun, bunu kontrol et. Bir mesaj gelmezse sorun üç yerden birindedir: numara bağlantısı, akış yayını ya da bildirim ayarı. Sırayla kontrol et.

## Toparlayalım

Bugün ağaca iki kapı açtın. Web sohbet kutusunu bir kod parçasını yapıştırarak ekledin. WhatsApp'ı hesap, numara, bağlantı sırasıyla kurdun, önce deneme numarasıyla, sonra gerçek hatla sınadın. Yirmi dört saatlik pencerenin akışı nasıl etkilediğini de gördün. Artık bot gerçek bir müşterinin yazabileceği yerde duruyor.

Bir sonraki derste botun en zayıf noktasına bakacağız: yanlış anlama. Müşteri botun anlamadığı bir şey yazdığında ne olacağını önceden tasarlayacağız.

Zihnine sağlık. Bir sonraki derste görüşmek üzere, kendine iyi bak.
`;

export const section3: Section = bot104Section({
  sectionNumber: 3,
  lessonKey: "04_chatbot_nocode-3",
  title: "WhatsApp Bağlantısı",
  pedagogicalObjective:
    "Öğrenci karar ağacını web sohbet kutusuna ve WhatsApp hattına bağlar. Hesap, numara, bağlantı ve deneme sırasını izler, yirmi dört saatlik pencere kuralını akış tasarımına yansıtır.",
  spokenScript,
});
