import type { Section } from "../types";
import { bot104Section } from "./spoken-body";

/**
 * BOT-104 ders 6.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Mert.

Tolga'nın klasörü masada duruyor: akış haritası, güncel defter, devir kâğıdı, kendi adına açılmış hesaplar. Her şey teslime hazır. Ama bir bot, ilk gerçek müşteri yazana kadar hâlâ bir varsayım. Bugün o varsayımı sınayacağız. Botu açacağız, ilk hafta ne olduğunu izleyeceğiz ve elimizdeki sayılardan bir sonraki adımı çıkaracağız.

## Önce on sahte konuşma

Canlıya çıkmadan, yakın çevrenden kişilerle on deneme konuşması yap. Tolga'nın kardeşine, bir komşuya, iki arkadaşına botun numarasını verdik ve onlardan şunu istedik: gerçek bir müşteri gibi yaz, ama her biri bir şeyi bozsun.

Biri acele eden olsun, tek kelimeyle yazsın. Biri yazım hatası yapsın. Biri konu dışına çıksın, bisiklet yerine kargo sorsun. Biri öfkeli yazsın. Biri fiyat listesinde olmayan bir iş sorsun. Biri bota insan istediğini söylesin. Biri gece yarısı yazsın. Biri düğme yerine uzun bir paragraf yazsın. Biri aynı soruyu üç kez sorsun. Biri hiç cevap vermeden ortada kalsın.

Sonunda elinde on konuşma kaydı oluyor. Her birini oku ve bot yerinde mi davrandı, devir gerektiğinde devretti mi, uydurma bir şey söyledi mi, bunları işaretle. Bu aşamada çıkan hatalar, canlıda çıkacak hataların ucuz hali.

## Sessiz açılış

Hatayı düzelttikten sonra botu bir yerde, tek bir yerde aç. Tolga için bu yer, web sitesindeki sohbet kutusuydu. WhatsApp numarasını tüm dünyaya birden duyurmak yerine, önce müşteri kartına ve sosyal medya profilinin bir köşesine koyduk.

Neden böyle? Çünkü ilk hafta, bot hakkında sürpriz yaşayacaksın. Sürprizin küçük bir kitleye çıkması, sürprizin hepsini görmeni sağlıyor. Mesaj akışı az olduğu için her konuşmayı okuyabiliyorsun. Okuyabildiğin sürece, hatayı düzeltmek kolay.

## İlk hafta ne sayacaksın

İlk hafta her akşam on dakikanı ayır ve gelen konuşmaları üç yığına ayır.

Birinci yığın, botun kendi başına çözdüğü konuşmalar. Müşteri bir şey sordu, cevap aldı, teşekkür etti ya da sessizce çıktı.

İkinci yığın, insana devredilen konuşmalar. Devir doğru yerde mi oldu? Devir notunun üç satırı yeterli miydi? Tolga cevabı verirken müşteriye aynı şeyi yeniden sormak zorunda kaldı mı?

Üçüncü yığın, kaçan konuşmalar. Müşteri bir şey sordu, bot cevap veremedi ve müşteri bir daha yazmadı. Asıl öğrenme burada. Bu yığındaki her konuşma, defterinde eksik bir soru ya da ağaçta kapanmamış bir dal gösteriyor.

Bu üç yığın için tek bir tablo yeter: kaç konuşma çözüldü, kaç konuşma devredildi, kaç konuşma kaçtı. Üç sayıyı bir kâğıdın kenarına yaz. Oranlara takılma. Hafta sonunda sayının ne söylediğinden çok, kaçan konuşmaların ne söylediğine bak.

## Haftada bir değişiklik

En sık yapılan hata, ilk haftanın sonunda on şeyi birden değiştirmek. On şeyi birden değiştirirsen, ikinci hafta sonunda hangisinin işe yaradığını bilemezsin.

Ben bunu şöyle yapıyorum: kaçan konuşmalara bakıp en sık tekrarlanan tek bir soruyu seçiyorum. Defterine yeni bir grup olarak ekliyorum ve ağaca bir dal çiziyorum. Tek bir değişiklik, bir hafta. Sonraki hafta aynı sayımı tekrar yapıyorum ve kaçan konuşmaların azalıp azalmadığına bakıyorum.

Tolga'nın ilk haftasında kaçan konuşmaların çoğu aynı soruydu: «Yedek parça getirseniz takar mısınız?» Defterde böyle bir grup yoktu. Ağaçta da. Bir cümlelik cevap yazdık ve devir dalına bir not ekledik: parçayı görmeden fiyat verilmiyor. İkinci hafta aynı soru bir kez daha geldi ama bu kez kaçmadı.

## Ne zaman insan, ne zaman bot

Bir noktada kendine şu soruyu soracaksın: bu bot gerçekten işe yarıyor mu? Cevabı sayıdan değil, işletme sahibinden al. Tolga'ya haftanın sonunda sor: sabah telefonu açtığında bekleyen mesaj sayısı azaldı mı? Müşteri aynı gün cevap alıyor mu? Cevaplar evet ise bot yerini bulmuş demektir. Hayır ise sorun botta değil, belki devir kuralında ya da bakım ritminde.

## Serinin kısa haritası

Bu altı derste şu yolu yürüdük. Önce müşterinin ne sorduğuna baktık ve beş gruplu bir soru defteri yazdık. O defteri bir karar ağacına çevirdik. Ağacı web sohbet kutusuna ve WhatsApp hattına bağladık. Botun anlamadığı yerlerde ne olacağını tasarladık. İşi sahibine teslim edecek bir klasör hazırladık. Bugün de ilk denemeyi yaptık.

Bu zincirin her halkası bir öncekine yaslanıyor. Defter eksikse ağaç eksik oluyor, ağaç eksikse bot anlamıyor, bot anlamıyorsa devir çalışmıyor. Bir şey ters giderse, geri dönüp zincirin başına bak.

## Toparlayalım

Bugün botu gerçek bir müşteriye açmadan önce on denemeyle sınadın. Sessiz bir açılış yaptın, ilk hafta üç yığını saydın ve haftada tek değişiklik kuralını öğrendin. Artık elinde, bir işletmeye kurup teslim edebileceğin ve zamanla iyileştirebileceğin bir yapı var.

Zihnine sağlık. Serinin sonuna geldik, bundan sonrası senin masanda, kendine iyi bak.
`;

export const section6: Section = bot104Section({
  sectionNumber: 6,
  lessonKey: "04_chatbot_nocode-6",
  title: "İlk Deneme",
  pedagogicalObjective:
    "Öğrenci botu on denemeyle sınar, sessiz bir açılış yapar, ilk haftada çözülen, devredilen ve kaçan konuşmaları sayar ve haftada tek değişiklik kuralıyla botu iyileştirir.",
  spokenScript,
});
