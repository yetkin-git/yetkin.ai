import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Maddenin tanecikli yapısı. */
export const JUNIOR_FEN_11_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-11",
  title: "Maddenin tanecikli yapısı",
  teaser:
    "Madde gözle görülmeyen taneciklerden oluşur. Katıda sıkı durur, sıvıda kayar, gazda dağılır. Kavramsal Anlayış, üç hali tanecik dizilişiyle ayırır. İfade Gücü, görünmeyenin yok olmadığını söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç elindeki bir buz parçasının eriyip suya, sonra da kaynayıp buhara dönüşerek gözden kaybolduğunu gördün mü? Aslında su hiçbir yere kaybolmaz; sadece onu oluşturan minik tanecikler birbirinden uzaklaşır. Bugün seninle maddenin görünmeyen mikroskobik dünyasına inecek; katı, sıvı ve gaz hallerinin ardındaki tanecik dansını birlikte keşfedeceğiz.",
  concept:
    "Çevremizde gördüğümüz bütün maddeler, gözle görülemeyecek kadar küçük taneciklerden meydana gelir. Bu tanecikler sürekli hareket halindedir. Katı maddelerde tanecikler birbirine çok yakındır, düzenlidir ve sadece bulundukları yerde titreşim hareketi yapar; bu yüzden katıların belirli bir şekli ve belirli bir hacmi vardır. Sıvılarda tanecikler birbirine yakındır ancak birbiri üzerinden kayarak öteleme hareketi de yapar; bu sayede sıvının belirli bir hacmi varken, şekli içine konulduğu kaba uyar. Gazlarda ise tanecikler arasındaki boşluk çok fazladır ve tanecikler her yöne bağımsızca hareket eder; gazların belirli bir şekli ve hacmi yoktur, bulundukları kabı tamamen doldururlar. Şurası aklında kalsın tamam mı: Bir madde ısıtıldığında sıcaklığı artar ve taneciklerinin hareket hızı da artar. En sert katıda bile tanecikler asla durmaz, sürekli titreşir.",
  example:
    "Buzluktan çıkardığın bir buz küpünü düşünelim. Katı halde olduğu için kalıbın şeklini korur ve tanecikleri dip dibe titreşir. Buz eridiğinde sıvı suya dönüşür. Tanecikler birbirinin üzerinden tatlı tatlı kaymaya başlar; su bardağa döküldüğünde bardağın şeklini alır ama hacmi değişmez. Suyu ocakta kaynattığında ise su buharlaşarak gaz haline geçer. Tanecikler büyük bir enerjiyle birbirinden uzaklaşır ve mutfağa yayılır. Çaydanlıktan çıkan buharı gördüğünde, buharın havada dağılan su tanecikleri olduğunu hemen anlarsın. Sıcak bir çorba soğurken taneciklerin hareketi yavaşlar; ama tanecikler hiçbir zaman tamamen durmaz.",
  hint: "gold",
  warning:
    "Gözümüzle göremediğimiz minik taneciklerin yok olduğunu sakın düşünme; soluduğumuz hava bile trilyonlarca tanecikten oluşur. Hareketsiz gibi duran katı maddelerin tanecikleri bile kendi yerlerinde sürekli titreşir.",
  life:
    "Bunu odana sıkılan bir oda kokusunda ya da annen parfüm sıktığında hemen fark edebilirsin. Şişeden çıkan koku tanecikleri gaz halinde olduğu için odanın en uzak köşesine kadar hızla yayılır ve burnuna ulaşır. Kokuyu havada görememen, o taneciklerin orada olmadığı anlamına gelmez. Sıcak yaz günlerinde dondurmanın eriyip akması da taneciklerin hızlanıp serbestçe kaymaya başlamasının tatlı bir örneğidir.",
  recap: [
    "Bütün maddeler taneciklerden oluşur ve bu tanecikler sürekli hareket eder.",
    "Katının şekli ve hacmi bellidir; sıvının hacmi belli, şekli kabına uyar.",
    "Gazlar kabı tamamen doldurur; sıcaklık arttıkça taneciklerin hareketi hızlanır.",
  ],
  conceptSeal: "Maddenin hali, taneciklerin dizilişi ve hareketiyle anlaşılır.",
  voiceSeal: "Katı, sıvı ve gazı taneciklerin yakınlığıyla ayırırsın.",
  outcomes: [
    "Maddeler taneciklerden oluşur.",
    "Katı, sıvı ve gazda tanecik dizilişi farklıdır.",
    "Sıcaklık artınca taneciklerin hareketi hızlanır.",
  ],
  scene: "particles",
  parentNote:
    "Çocuğunuz katı, sıvı ve gazı tanecik dizilişiyle ayırır. Buzun erimesi ve çay buğusu evdeki örnektir. Görünmemenin yok olmak olmadığı da bu konuda durur.",

};

export const JUNIOR_FEN_11 = juniorLessonFromScenario(JUNIOR_FEN_11_SCENARIO);
