import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Giriş, gelişme, sonuç ve akışı bozan cümle. */
export const JUNIOR_TURKCE_10_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-10",
  title: "Paragrafın yapısı",
  teaser:
    "Giriş konuyu tanıtır. Gelişme açıklar ve örnekler. Sonuç toparlar. Akışı bozan cümle konuya bağlanmaz. Kavramsal Anlayış, üç bölümü ve yabancı cümleyi ayırır. İfade Gücü, bozan cümleyi göstermektir.",
  welcome:
    "Merhaba! Türkçe dünyasına hoş geldin, bugün kelimelerin ve cümlelerin bir araya gelerek nasıl kusursuz bir mimari oluşturduğunu göreceğiz. Hiç güzel bir kompozisyonun başının konuyu tanıttığını, ortasının örneklerle zenginleştiğini ve sonunun etkileyici bir karara bağlandığını hissettin mi? İşte bu düzen paragrafın yapısıdır. Bugün seninle giriş, gelişme ve sonuç bölümlerini ve araya sızıp akışı bozan yabancı cümleleri tespit etmeyi öğreneceğiz.",
  concept:
    "Bir paragraf üç ana yapı taşından oluşur. Giriş bölümü, konuyu okuyucunun önüne koyan, genellikle tek cümlelik merak uyandırıcı başlangıçtır; kendinden önce bir cümle varmış hissi vermez. Bu yüzden, çünkü gibi bağlaçlarla giriş cümlesi başlamaz. Gelişme bölümü, konunun açıklandığı, örneklerin, benzetmelerin ve ayrıntıların sıralandığı en geniş gövdedir. Sonuç bölümü ise söyleneni toparlayan, ana fikri özetleyen ve genellikle özetle, bu nedenle, sonuç olarak gibi ifadelerle bağlanan final cümlesidir. Akışı bozan cümle ise bu uyumlu zincirin arasına karışmış, konudan ve ana fikirden kopuk yabancı bir cümledir. Şurası aklında kalsın tamam mı: Akışı bozan cümleyi cımbızla çekip çıkardığında paragrafın ritmi ve mantığı anında yerine oturur.",
  example:
    "Birlikte bir paragrafı inceleyelim. Kitaplar bize bilmediğimiz dünyaların kapılarını aralar; bu harika bir giriş cümlesidir. Sayfalar arasında gezinirken tarihin derinliklerini veya evrenin sırlarını keşfederiz; bu gelişme cümlesidir. Dün akşam oynanan futbol maçı berabere bitti; bu cümle bir anda ortaya çıkmıştır ve kitap konusuyla hiçbir bağı yoktur. İşte bu akışı bozan cümledir. Sonuç olarak kitap okumak zihnimizi büyüten en değerli yolculuktur; bu da toparlayıcı sonuç cümlesidir. Yabancı cümleyi çıkardığımızda metin pürüzsüzce akar.",
  hint: "trap",
  warning:
    "Giriş cümlesinin kendinden önceki bir cümleye bağlı gibi durmamasına dikkat etmelisin. Örneğin bu nedenle ormanları korumalıyız cümlesi bir paragrafın ilk cümlesi olamaz; çünkü bu nedenle sözü öncesinde bir açıklama olduğunu gösterir. Akışı bozan cümlenin ise tamamen yanlış bir bilgi değil, sadece o paragrafın konusuna ait olmayan bir bilgi olduğunu unutmamalısın.",
  life:
    "Günlüğüne bugün okulda çok heyecanlı bir deney yaptık diye başlarsın; bu giriştir. Deneyin aşamalarını ve renkli sıvıları anlatırsın; bu gelişmedir. Bilim insanı olmayı şimdiden çok istiyorum dersin; bu sonuçtur. Araya akşam yediğin yemeği eklersen anlatımın akışı bölünür; onu ayrı bir paragrafa yazarsın.",
  recap: [
    "Giriş konuyu tanıtır, gelişme örnekler verir, sonuç toparlar.",
    "Giriş cümlesi kendinden önce bir cümle varmış gibi bağlaçla başlamaz.",
    "Akışı bozan cümle çıkarıldığında paragrafın anlam bütünlüğü düzelir.",
  ],
  conceptSeal: "Paragraf giriş, gelişme ve sonuçtan kurulur. Yabancı cümle akışı bozar.",
  voiceSeal: "Bir paragrafta üç bölümü adlandırırsın ve akışı bozan cümleyi gösterirsin.",
  outcomes: [
    "Giriş konuyu tanıtır, gelişme açıklar, sonuç toparlar.",
    "Akışı bozan cümle konuyla bağdaşmaz.",
    "Bozan cümle çıkınca paragrafın akışı düzelir.",
  ],
  scene: "book",
  parentNote:
    "Çocuğunuz bu derste paragrafın giriş, gelişme ve sonuç bölümlerini kavrar. Metin içinde konuyla ilgisiz duran akışı bozan cümleyi tespit etmeyi öğrenir.",

};

export const JUNIOR_TURKCE_10 = juniorLessonFromScenario(JUNIOR_TURKCE_10_SCENARIO);
