import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Köşegenleri birbirini ortalayan dörtgenler. */
export const JUNIOR_MAT_32_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-32",
  title: "Köşegenleri birbirini ortalayan dörtgenler",
  teaser: "Köşegen, karşı köşeleri birleştirir. Kavramsal Anlayış, köşegenler birbirini ortalıyorsa dörtgenin paralelkenar olduğudur. İfade Gücü, orta noktayı iki eşit parçayla göstermektir.",
  welcome: "Merhaba sevgili çocuklar! Bugün dörtgenin köşegenlerinin birbirini nasıl böldüğünü ölçeceğiz. Okul sırasının köşesinden karşı köşeye çizilen çizgi bir köşegendir. Orta nokta, bu çizgiyi iki eşit parçaya böler.",
  concept: "Köşegen, dörtgenin karşı köşelerini birleştiren doğru parçasıdır. İki köşegen birbirini ortalıyorsa her biri diğerinin orta noktasında kesişir. Bu model paralelkenara aittir. Kesişim, her köşegeni iki eşit uzunluğa böler. Cetvelle ölçünce parçalar aynı çıkar.",
  example: "Bir paralelkenarın köşegenleri 10 santimetre ve 6 santimetre olsun. Kesişim, 10 santimetrelik köşegeni 5 ve 5 diye böler. 6 santimetrelik köşegeni 3 ve 3 diye böler. Parçalar eşitse köşegenler birbirini ortalıyordur. Parçalar 4 ve 6 gibi dengesizse bu kural bozulmuştur.",
  hint: "gold",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Köşegenlerin eşit olması, birbirini ortalaması demek değildir. 10 ve 10 olan iki köşegen yine de birini 2, diğerini 8 bölebilir. Orta nokta, eşit parça ister. Yalnızca uzunluk eşitliğine bakma.",
  life: "Bunu okul bahçesindeki uçurtma çerçevesinde görürsün. Kutunun kapağında köşeden köşeye iki lastik gerilirse orta düğüm parçaları eşitler. Düğüm ortaya gelmiyorsa dörtgen bu kuralı taşımaz.",
  recap: [
    "Köşegen karşı köşeleri birleştirir.",
    "Birbirini ortalamak, her parçanın eşit olmasıdır.",
    "Bu özellik paralelkenar modelindedir.",
  ],
  conceptSeal: "Köşegenler birbirini ortalıyorsa kesişim her birini iki eşit parçaya böler.",
  voiceSeal: "10 santimetrelik köşegenin 5 ve 5 diye bölündüğünü dersin.",
  outcomes: [
    "Köşegen karşı köşeyi birleştirir.",
    "Ortalamak iki eşit parça demektir.",
    "Paralelkenarda köşegenler birbirini ortalar.",
    "Köşegenleri birbirini ortalayan dörtgenler kuralı bu derste yeni bir istisna açmaz.",
    "32 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "angles",
  parentNote: "Çocuğunuz 10 santimetrelik köşegeni 5 ve 5 diye böler. Eşit uzunluktaki köşegenleri, birbirini ortalıyor sanmaz. Düğümün ortaya gelmesini ister.",
};

export const JUNIOR_MAT_32 = juniorLessonFromScenario(JUNIOR_MAT_32_SCENARIO);
