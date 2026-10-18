import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, ENG.6.5 Universe, 25–28. hafta. Gök cisimleri ve there is. */
export const JUNIOR_ING_MAIN_6_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-6",
  title: "Universe: gökyüzü ve there is",
  teaser:
    "Universe temasında Güneş, Ay ve gezegenler there is ve there are ile söylenir. The Sun is a star, Güneş bir yıldızdır demektir. Kavramsal Anlayış, tekil ile çoğulu ayırır. İfade Gücü, gökyüzündeki bir cismi bir cümlede tanıtmandır.",
  welcome:
    "Merhaba sevgili çocuklar! Gece gökyüzüne bakınca yıldızlar, bazen de Ay karşına çıkar. Gündüz ise Güneş her şeyi aydınlatır. Bu cisimler Universe konusunun ilk sözcükleridir. Bugün Güneş, Ay, yıldız ve gezegeni İngilizce tanıyacak, there is ve there are ile sayılarını söyleyeceğiz. Gökyüzünü gözlemlemek, tek olanla çok olanı ayırmana yardım eder.",
  concept:
    "Universe içinde Sun Güneş, Moon Ay, star yıldız ve planet gezegen demektir. The Sun is a star cümlesi Güneş'in bir yıldız olduğunu söyler. The Moon is a satellite cümlesi Ay'ın bir uydu olduğunu söyler. Tek bir şeyden söz ederken There is gelir: There is a bright star. Birden çok şey için There are gelir: There are eight planets. Soru Is there a moon? ve Are there stars? diye kurulur. Pratik kural: There is tekili, there are çoğulu taşır.",
  example:
    "Pencereden gece gökyüzüne bakalım. There is a full moon tonight, bu gece dolunay var demektir. There are many stars in the sky, gökyüzünde birçok yıldız var demektir. Güneş'i tanıtırken The Sun is the star at the centre of our system dersin. Arkadaşın What is the Moon? diye sorarsa The Moon is Earth's satellite diye cevap verirsin. Sekiz gezegeni saymak için There are eight planets around the Sun cümlesi yeter.",
  hint: "gold",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Çoğul sözcükle there is demek sayıyı bozar; stars için there are gerekir. Güneş'i bir planet sanmak da yanlıştır; Güneş bir star olarak durur. Ay'ı gezegen listesine eklemek aynı tuzaktır. Universe konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu akşam pencereden deneyebilirsin. Gördüğün Ay için There is the Moon de. Yıldızlar çoksa There are stars diye fısılda. Okulda bir gezegen posteri varsa There are planets on the poster dersin. Sabah Güneş'i görünce The Sun is a star cümlesini hatırla. Gelecekte uzaya gitmeyi düşünmek ayrı bir derstir; bugün cisimlerin adını sağlam kur.",
  recap: [
    "Universe konusunda Sun bir yıldız, Moon bir uydudur.",
    "There is tekil, there are çoğul varlık söyler.",
    "There are eight planets cümlesi sekiz gezegeni anlatır.",
  ],
  conceptSeal: "Gök cismi there is ya da there are ile ve doğru adıyla kurulur.",
  voiceSeal: "Gökyüzünde gördüğün bir cismi bir İngilizce cümleyle tanıtırısın.",
  outcomes: [
    "Sun, Moon, star ve planet gökyüzü sözcükleridir.",
    "There is tekili, there are çoğulu söyler.",
    "Güneş yıldızdır, gezegen değildir.",
  ],
  scene: "universe",
  parentNote:
    "Çocuğunuz Güneş'in yıldız, Ay'ın uydu olduğunu İngilizce söyler. There is ile there are ayrımını kurar. Akşam pencereden bir cümle yeter.",
};

export const JUNIOR_ING_MAIN_6 = juniorLessonFromScenario(JUNIOR_ING_MAIN_6_SCENARIO);
