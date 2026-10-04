import type { Section } from "../types";
import { bot104Section } from "./spoken-body";

/**
 * BOT-104 ders 2.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Mert.

Soru defterin masanın üstünde duruyor. Beş grup, beş tek cümlelik cevap, bir de devir listesi. Tolga'nın defterinde botun yalnızca üç sabit işin fiyatını söylediğini, kalan fiyat sorularının ise devir listesine girdiğini biliyorsun. İşte o karar bugün işimize yarayacak. Şimdi o defteri botun yürüyebileceği yollara çevireceğiz. Yani bir karar ağacı çizeceğiz.

## Önce kâğıt, sonra araç

Voiceflow'u ya da Botpress'i açmadan önce kâğıda dön. Ben bu sırayı ilk günden beri değiştirmiyorum. Çünkü ekranda kutu sürüklemek insana çalışıyormuş hissi veriyor, oysa asıl iş mantığı kurmak. Mantık kâğıtta kurulur, araç yalnızca onu taşır.

Kâğıdın ortasına bir kutu çiz ve içine «Karşılama» yaz. Bu, botun müşteriyle ilk konuştuğu yer. Karşılamadan üç ok çıkacak, çünkü ilk menüde üç seçenek yeter. Tolga için bunlar şöyle: bir, çalışma saatleri ve adres. İki, tamir ve fiyat. Üç, randevu. Defterdeki diğer gruplar bu üç kutunun içine yerleşiyor. Siparişim geldi mi sorusu tamir kutusunun içinde bir alt adım oluyor.

## Üç kural

Karar ağacını kurarken üç kuralı yanında taşı.

Birinci kural, bir adımda bir soru. Bot «adınız nedir, hangi gün gelmek istersiniz ve bisikletinizde ne sorun var» diye tek mesajda üç şey sorarsa müşteri birini cevaplar, ikisini atlar. Her soru ayrı bir kutu olsun.

İkinci kural, mümkün olan her yerde düğme kullan. Müşteri yazmak zorunda kaldığında yazım hatası yapar, kelimeyi farklı söyler, konuyu dağıtır. Düğmeye bastığında ise bot ne dediğini kesin olarak bilir. Serbest yazıyı yalnızca düğmenin işe yaramadığı yerde aç, örneğin müşterinin adını alırken.

Üçüncü kural, her dal kapanmalı. Bir dalın sonu ya «sorun cevaplandı», ya «randevu talebi alındı», ya da «insana devredildi» olacak. Dalın ortasında kapı kapanıp müşteri boşluğa kalıyorsa, ağaçta hata var demektir. Ben kâğıdın üzerinde her okun ucunu parmağımla takip ediyorum. Bir yerde takılırsam orayı yeniden çiziyorum.

## Karşılama ne söylemeli

Karşılama mesajı kısa olmalı ve üç iş yapmalı. Kim konuştuğunu söylemeli, ne yapabildiğini söylemeli, insana nasıl ulaşılacağını göstermeli.

Tolga'nınki şöyle: «Merhaba, ben Tolga Bisiklet'in sanal asistanıyım. Çalışma saatlerini, tamir bilgisini ve randevu talebini ben alabilirim. Bir insanla konuşmak istersen, istediğin an insan yazman yeter.» Altında üç düğme duruyor. Bu mesajda yapay zekâ olduğunu saklamıyoruz. Müşteri botla konuştuğunu bilirse, beklentisini ona göre ayarlıyor. Beşinci derste bu konuya yeniden döneceğiz.

## Randevu dalı

Randevu dalı en dikkatli çizmen gereken yer, çünkü burada ilk defa müşteriden bilgi alıyorsun.

Sırayla gidelim. İlk kutu, adı sorar. İkinci kutu, günü sorar ve düğmeler sunar: bugün, yarın, bu hafta içinde başka bir gün. Üçüncü kutu, sorunu sorar ve düğmeler sunar: lastik, fren, vites, başka bir şey. Dördüncü kutu, özet gösterir: «Adın Zeynep, yarın, lastik için. Doğru mu?» Altında iki düğme: evet, değiştir. Doğru derse son kutuya geçilir.

Burada bir dürüstlük noktası var. Bu ilk sürümde bot randevuyu kesinleştirmiyor. Takvimi bilmeyen bir bot «yarın saat on için yerinizi ayırdım» derse bir sözü Tolga yerine veriyor demektir. Bunun yerine şunu söyleyecek: «Talebini aldım, Tolga en geç yarın sabah dönüş yapacak.» Kesinleştirme insanın elinde kalıyor. Takvim bağlantısını ileride eklemek mümkün ama önce kapıyı kapalı tutarak başlıyoruz.

## Aracı açma zamanı

Kâğıdın hazırsa Voiceflow'a geç. Yeni bir proje aç, karşılama kutusunu koy, altına üç düğme ekle, her düğmeye bir yol bağla. Kâğıttaki her kutunun karşılığı ekranda bir blok olacak. Botpress'te de aynı şeyi yaparsın. Blokların adı değişir, mantık değişmez. Bu yüzden araç seçimine takılma. Hangisini rahat kullanıyorsan onunla başla.

Tek bir şeye dikkat et. Her bloğun içindeki metni, defterdeki cevabın kelimesi kelimesine aynısı olarak yaz. Bot yeni cümle uydurmasın. Defteri yazarken verdiğin kararlar buraya taşınıyor.

## Kâğıt üstünde üç deneme

Kurduktan sonra hemen canlıya almıyoruz. Önce üç hayalî müşteriyle dene. Birincisi aceleci, ilk düğmeye basıp çıkıyor. İkincisi yazım hatalı, «randvu» yazıyor. Üçüncüsü konu dışı, bisiklet yerine kargo soruyor. Üçünün de ağaçtan boşluğa düşmeden bir yere ulaşıp ulaşmadığına bak. Düşenler olacak. Düşen yeri bir sonraki derse not al.

## Toparlayalım

Bugün defterini bir karar ağacına çevirdin. Bir adımda bir soru, mümkün olan her yerde düğme, her dalın kapanışı. Karşılama mesajını ve randevu dalını kurdun, kesinleştirmeyi insana bıraktın. Bu yapı sağlam durursa gerisini bunun üstüne ekleyebiliriz.

Bir sonraki derste bu akışı gerçek hatlara bağlayacağız. Önce web sohbet kutusunu, sonra WhatsApp'ı bağlayıp kendi telefonundan ilk mesajı yazacağız.

Zihnine sağlık. Bir sonraki derste görüşmek üzere, kendine iyi bak.
`;

export const section2: Section = bot104Section({
  sectionNumber: 2,
  lessonKey: "04_chatbot_nocode-2",
  title: "Karşılama, Soru ve Randevu",
  pedagogicalObjective:
    "Öğrenci soru defterini kâğıt üzerinde bir karar ağacına çevirir. Bir adımda bir soru, düğme öncelikli giriş ve her dalın kapanışı kurallarını uygular. Karşılama mesajını ve randevu talebi dalını kurar.",
  spokenScript,
});
