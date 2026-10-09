import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Boşaltım sistemi. */
export const JUNIOR_FEN_8_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-8",
  title: "Boşaltım sistemi",
  teaser:
    "Böbrekler kanı süzer ve idrar oluşur. Deri, akciğer ve kalın bağırsak da boşaltıma katılır. Kavramsal Anlayış, asıl organı yardımcı organlardan ayırır. İfade Gücü, idrarın yolunu sırayla söylemektir.",
  welcome:
    "Selamlar! Bugün seninle doğanın ve bilimin çok keyifli bir sırrını keşfedeceğiz, çünkü vücudumuzun iç temizliğini yapan sessiz kahramanları yakından tanıyacağız. Gün boyunca su içtikten ya da sulu meyveler yedikten sonra tuvalet ihtiyacı duyduğunu fark etmişsindir. Vücudumuz kanda biriken zararlı maddeleri ve fazla suyu kusursuz bir arıtma tesisi gibi süzer. Bugün seninle bu temizliğin kalbi olan böbreklerimizi ve boşaltım sistemini öğreneceğiz.",
  concept:
    "Boşaltım, vücudumuzda oluşan zararlı atıkların ve fazla suyun dışarı atılması sürecidir. Asıl boşaltım organımız belimizin iki yanında fasulye tanesi biçiminde duran böbreklerdir. Böbrekler kanı milyonlarca minik süzgeciyle süzer. Yararlı maddeleri ve gereken suyu kana geri verirken, üre ve fazla tuzdan oluşan süzüntüyü idrara dönüştürür. İdrar, üreter yani idrar borusu ile idrar kesesine taşınır ve depolanır. Uygun anda üretra, yani idrar kanalı ile dışarı atılır. Derimiz terle, akciğerimiz karbondioksitle, kalın bağırsağımız ise sindirim posasıyla bu temizliğe destek olur. Şurası aklında kalsın tamam mı: Ter bir boşaltım ürünüdür ama idrarın aynısı değildir; kanı asıl süzen organ böbrektir.",
  example:
    "Mutfaktaki süzgeçli bir su arıtma sürahisi düşün. Böbreklerimiz de tıpkı o filtre gibi çalışır. Kan böbrek atardamarıyla gelir, böbreğin süzme birimlerinde arıtılır. Su, mineral ve şekerin vücuda lazım olan kısmı geri emilir. Kalan fazla tuz, su ve zararlı üre idrarı oluşturur. İki böbrekten inen incecik üreter boruları idrarı esnek idrar kesesine iletir. Kese dolunca sinirler beyne haber verir ve tuvalete gidersin. Sıcakta koştuğunda derinden ter damlar; bu ter su ve tuz atarak seni serinletir ama kanı böbrek gibi temizlemez. Sindirim atığı olan dışkı da besin posasıdır; idrar ile dışkıyı birbirine karıştırmamak gerekir.",
  hint: "trap",
  warning:
    "Vücudumuz ter yoluyla su ve bir miktar tuz atar ama kanı süzen ana boşaltım merkezimiz böbreklerimizdir. Ayrıca sindirim atığı olan katı dışkı ile kanın süzülmesiyle oluşan idrarı birbirine karıştırmadan, ikisinin farklı sistemlere ait olduğunu güvenle hatırlayabilirsin.",
  life:
    "Bunu sağlıklı bir gün geçirirken su şişene bakarak hemen uygulayabilirsin. Böbreklerinin kanı rahatça süzebilmesi için gün boyunca yeterli miktarda su içmelisin. İdrar rengin çok koyu sarıysa vücudun sana daha çok su içmen gerektiğini fısıldıyor demektir. Bel bölgende uzun süren bir ağrı hissedersen bunu hemen ailene söylemeli ve bol su içmeyi alışkanlık haline getirmelisin.",
  recap: [
    "Böbrekler kanı süzer ve idrar bu süzmeyle oluşur.",
    "İdrar; üreter borusu, idrar kesesi ve üretra kanalından ilerler.",
    "Deri, akciğer ve kalın bağırsak yardımcı organlardır; asıl süzme merkezi böbreklerdir.",
  ],
  conceptSeal: "Boşaltım, fazla ve zararlı maddelerin vücuttan uzaklaştırılmasıdır.",
  voiceSeal: "Böbreğin süzdüğünü ve idrarın yolunu sırayla söylersin.",
  outcomes: [
    "Böbrekler kanı süzer ve idrar oluşturur.",
    "İdrar kesesi idrarı bir süre depolar.",
    "Deri, akciğer ve kalın bağırsak boşaltıma yardımcı olur.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz böbreği asıl boşaltım organı olarak anlatır. Ter, karbondioksit ve dışkının yardımcı yollar olduğunu ayırır. Su içmek ve ağrıyı yetişkine söylemek evdeki karşılığıdır.",

};

export const JUNIOR_FEN_8 = juniorLessonFromScenario(JUNIOR_FEN_8_SCENARIO);
