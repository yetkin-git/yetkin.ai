import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. İletken ve yalıtkan maddeler. */
export const JUNIOR_FEN_19_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-19",
  title: "İletken ve yalıtkan maddeler",
  teaser:
    "İletken, elektrik akımının geçtiği maddedir. Yalıtkan geçirmez. Kavramsal Anlayış, saf su ile tuzlu suyu ayırır. İfade Gücü, lambanın neden yandığını maddenin cinsinden söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde merak uyandıran ne var, çünkü evimizdeki lambaları yakan, telefonlarımızı şarj eden elektriğin güvenli yolculuğunu inceleyeceğiz. Şarj kablosunun dışındaki yumuşak plastik kaplamayı ve prize takılan ucundaki parlak metali hiç inceledin mi? Kabloyu dışından tuttuğunda güvendesindir; çünkü elektrik ancak belirli yollardan akar. Bugün seninle elektriği geçiren iletken maddeleri ve elektriği durduran yalıtkan maddeleri keşfedeceğiz.",
  concept:
    "Elektrik enerjisinin üzerinden kolayca akıp geçmesine izin veren maddelere elektriksel iletken maddeler denir. Bakır, alüminyum, demir, gümüş ve altın gibi metaller mükemmel iletkendir. Kurşun kalem ucumuzdaki grafit ve tuzlu su da elektriği iletir. Hatta vücudumuzun büyük kısmı su ve minerallerden oluştuğu için insan vücudu da iyi bir iletkendir. Elektrik akımının geçişine izin vermeyen veya geçişi engelleyen maddelere ise elektriksel yalıtkan maddeler denir. Plastik, cam, porselen, kauçuk, tahta ve saf su yalıtkan maddelere örnektir. Basit bir elektrik devresinde iletken tel akımı lambaya taşır ve lamba yanar; araya bir yalıtkan girdiğinde ise devre açılır ve lamba söner. Şurası aklında kalsın tamam mı: Saf su yalıtkanken, içine tuz karıştırılmış tuzlu su ya da musluk suyu iletken hale gelir.",
  example:
    "Küçük bir pil, minik bir ampul ve iki adet bağlantı kablosuyla basit bir devre kuralım. Kabloların açıkta kalan iki ucunun arasına demir bir çivi koyalım. Ampul parlak şekilde yanar; çünkü demir güçlü bir iletkendir. Şimdi çiviyi çıkarıp yerine plastik bir silgi koyalım. Ampul anında söner; çünkü plastik bir yalıtkandır ve akımın yolunu keser. Kurşun kalemimizin grafit ucunu devreye bağladığımızda ampulün yandığını görmek harika bir sürprizdir! Bir bardağa saf su koyup kablo uçlarını daldırırsak lamba yanmaz; ancak o suya bir çay kaşığı tuz atıp karıştırdığımızda ampulün parıldadığını görürüz; çünkü tuzlu su artık bir iletkendir. Elektrik kablolarının dışının plastikle kaplanması da elimizi bu akımdan korumak içindir.",
  hint: "gold",
  warning:
    "Suyun her zaman güvenli bir yalıtkan olduğunu düşünmek risklidir; saf su akımı iletmezken çeşme suyu ve tuzlu su elektriği kolayca iletir. Bu yüzden elektrikli aletlere asla ıslak elle dokunmamalı ve prizleri güvenle kullanmalıyız.",
  life:
    "Bunu banyoda saç kuruturken ya da ıslak ellerle ışık düğmesine basarken her zaman hatırla. Vücudumuz ve ıslak zeminler iletken olduğu için banyoda asla saç kurutma makinesi kullanılmamalıdır. Prizlerin içine asla metal toka, tel ya da parmak sokulmamalıdır. Elektrik tamiri yapan ustaların tornavida saplarının kalın plastikten olması da onları elektrik çarpmasından koruyan bir yalıtkandır.",
  recap: [
    "Metaller, grafit ve tuzlu su elektrik akımını ileten maddelerdir.",
    "Plastik, cam, kauçuk, porselen ve saf su elektriksel yalıtkandır.",
    "İnsan vücudu iletkendir; ıslak elle elektrikli aletlere ve prizlere dokunulmaz.",
  ],
  conceptSeal: "İletken akıma yol verir. Yalıtkan bu yolu keser.",
  voiceSeal: "Lambanın neden yandığını maddenin cinsinden söylersin.",
  outcomes: [
    "Metaller elektrik akımını iletir.",
    "Plastik, cam ve lastik yalıtkandır.",
    "Tuzlu su iletkendir, saf su yalıtkan sayılır.",
  ],
  scene: "circuit",
  parentNote:
    "Çocuğunuz metal ve tuzlu suyu iletken, plastik ve saf suyu yalıtkan diye ayırır. İnsan vücudunun iletken olduğu ve ıslak elle prize dokunulmaması evde de net olmalıdır.",

};

export const JUNIOR_FEN_19 = juniorLessonFromScenario(JUNIOR_FEN_19_SCENARIO);
