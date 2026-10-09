import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Büyük harf ve sayıların yazımı. */
export const JUNIOR_TURKCE_17_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-17",
  title: "Büyük harfler ve sayıların yazımı",
  teaser:
    "Cümle büyük harfle başlar. Özel adlar büyük yazılır. Ay ve gün adları cümle ortasında küçük kalır. Küçük sayılar yazıyla, tarih saat ve para rakamla yazılır. Kavramsal Anlayış, bu ayrımı kurar. İfade Gücü, bir yazıda harfi ve sayıyı doğru seçmektir.",
  welcome:
    "Hoş geldin! Hazırsan bugün kelimelerin ve cümlelerin renkli dünyasına adım atıyoruz, çünkü yazılarımızın intizamını ve saygınlığını sağlayan yazım kurallarının dünyasına giriyoruz. Hiç bir metinde kendi adını büyük harfle yazmanın sana verdiği o özel değeri hissettin mi? Cümlelerin başı, özel adlar ve sayıların yazımı dilimizin nezaket kurallarıdır. Bugün seninle büyük harflerin nerelerde parıldadığını ve sayıların nasıl doğru yazıldığını adım adım keşfedeceğiz.",
  concept:
    "Her cümle mutlaka büyük harfle başlar. Kişi ad ve soyadları, şehir, ülke, dağ, nehir, dil ve kurum adları özel addır ve her zaman büyük harfle yazılır; Ayşe, Türkiye, Ankara, Türkçe ve Türk Dil Kurumu böyledir. Ancak kurum ve özel adların arasında geçen ve, ile, ya da gibi bağlaçlar küçük harfle kalır; Leyla ile Mecnun örneğinde ile küçüktür. Belirli bir tarih bildirmeyen ay ve gün adları cümle ortasında küçük harfle yazılır; okullar eylülde açılır cümlesinde eylül küçüktür. Fakat tam bir tarih varsa, örneğin on beş eylül iki bin yirmi altı dendiğinde Eylül büyük yazılır. Metin içindeki küçük sayılar genellikle yazıyla yazılır: üç elma, beş gün. Tarih, saat ve parasal tutarlar ise rakamla yazılır. Şurası aklında kalsın tamam mı: Özel isimler daima büyük kalır; belirli bir tarihe bağlı olmayan gün ve ay adları ise cümle ortasında küçük yazılır.",
  example:
    "Örneklerimizi birlikte inceleyelim. Ahmet ile Zeynep Ankara'ya gitti cümlesinde Ahmet, Zeynep ve Ankara özel addır, büyük yazılır; aradaki ile bağlacı küçük kalır. Sağlık Bakanlığı bir kurumdur, iki sözcük de büyük yazılır. Sınavımız on iki ekim pazartesi günü yapılacak dediğimizde belirli bir tarih olduğu için Ekim ve Pazartesi büyük yazılır. Fakat dersimiz pazartesi günleri olur dediğimizde pazartesi küçük kalır. Bahçeden beş elma topladım yazıyla durur; tren saat on dört otuzda kalkacak rakamla yazılır.",
  hint: "gold",
  warning:
    "Her ay ve gün adını gördüğünde hemen büyük harfle yazma telaşına kapılmamayı aklında tutabilirsin. Önünde ya da arkasında kesin bir gün sayısı varsa, yani belirli bir tarihi işaret ediyorsa büyük yazılır; yoksa genel ifadelerde ay ve gün adları küçük kalır. Sayılarda ise birden fazla kelimeden oluşan sayıların yazıyla yazılırken ayrı yazıldığını da hatırla: yirmi beş gibi.",
  life:
    "Defterine tarih atarken günü ve ayı doğru yazmak ödevini pırıl pırıl gösterir. Arkadaşına mektup yazarken adını büyük harfle başlatmak ona duyduğun saygıyı yansıtır. Markette üç kilo elma yazarken yazıyla, fişteki tutarı okurken rakamla karşılaşırsın. Kurallara uymak yazına güven katar.",
  recap: [
    "Cümleler ve özel adlar daima büyük harfle başlar.",
    "Belirli bir tarih bildiren ay ve gün adları büyük, genel olanlar küçük yazılır.",
    "Metin içindeki sayılar yazıyla; tarih, saat ve parasal tutarlar rakamla yazılır.",
  ],
  conceptSeal: "Özel ad büyük kalır. Ay ve gün adı cümle ortasında küçük kalır.",
  voiceSeal: "Bir cümlede büyük harfi ve sayının yazıyla mı rakamla mı duracağını söylersin.",
  outcomes: [
    "Cümle ve özel ad büyük harfle başlar.",
    "Ay ve gün adları cümle ortasında küçüktür.",
    "Tarih, saat ve para rakamla yazılır.",
  ],
  scene: "book",
  parentNote:
    "Çocuğunuz bu derste büyük harflerin kullanım alanlarını ve sayıların yazım kurallarını öğrenir. Belirli tarih içeren gün/ay adları ile genel kullanımların farkını pekiştirebilirsiniz.",

};

export const JUNIOR_TURKCE_17 = juniorLessonFromScenario(JUNIOR_TURKCE_17_SCENARIO);
