import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, ENG.6.2 Family Life, 9–11. hafta. Aile rutini. */
export const JUNIOR_ING_MAIN_4_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-4",
  title: "Family Life: evde rutin işler",
  teaser:
    "Family Life temasında ev işleri simple present ile söylenir. I help my mother anneme yardım ederim demektir. Kavramsal Anlayış, her gün olan işi şu andan ayırır. İfade Gücü, evdeki bir rutini sıklık zarfıyla anlatmandır.",
  welcome:
    "Merhaba çocuklar, hepiniz hoş geldiniz! Sabah mutfakta kahvaltı hazırlanır, akşam sofrada tabaklar toplanır, hafta sonu salonda birlikte film izlenir. Bu işler bir kez olup bitmez; ailede tekrar eden rutinlerdir. Bugün bu rutinleri İngilizce simple present ile anlatacağız. Evin bir akşamını gözlemlemek, kimin hangi işi yaptığını netleştirir.",
  concept:
    "Family Life içinde her gün ya da sık sık olan iş simple present ile kurulur. I help, she helps, they watch kalıpları bu zamanın örnekleridir. He ve she ile fiile çoğunlukla s eklenir: cook fiili she cooks olur. Sıklık zarfları always her zaman, usually genellikle, sometimes bazen ve never hiçbir zaman anlamındadır. Zarflar özne ile fiil arasına yerleşir: She usually cooks dinner. Şu anda olan iş ise am, is, are ve ing ister; her akşam olan iş bu kalıba girmez. Pratik kural: Alışkanlık yalın fiille, tam şu an ing ile söylenir.",
  example:
    "Ece her akşam sofrayı kurar: I always set the table. Annesi yemeği genellikle pişirir: She usually cooks dinner. Babası bazen bulaşık yıkar: He sometimes washes the dishes. Kardeşi hiç çöp çıkarmıyorsa He never takes out the rubbish dersin. Arkadaşın What do you do at home? diye sorarsa I help my family and I sometimes water the plants diye cevap verirsin. Look, she is cooking now cümlesi ise alışkanlığı değil, tam o anı anlatır.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. She cook dinner demek fiil ekini düşürür; she cooks dinner doğru durur. Always sözcüğünü cümlenin en sonuna atmak da sırayı bozar; usually ve always fiilden önce gelir. Her akşam olan işe ing eklemek onu şu an oluyormuş gibi gösterir. Family Life konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evde akşam yemeğinden önce deneyebilirsin. Kendi işini I set the table diye fısılda. Mutfakta annen yemek pişiriyorsa hem alışkanlığı hem anı ayır: She usually cooks, and she is cooking now. Okulda arkadaşınla ev işlerini karşılaştır. Bahçedeki bitkiyi sulamak da bir aile işi olabilir: I sometimes water the flowers.",
  recap: [
    "Evdeki tekrar eden iş simple present ile söylenir.",
    "He ve she ile fiile genellikle s gelir; she cooks buna örnektir.",
    "Always, usually, sometimes ve never sıklığı söyler ve fiilden önce durur.",
  ],
  conceptSeal: "Aile rutini simple present ve bir sıklık zarfıyla kurulur.",
  voiceSeal: "Evdeki bir işi kim yapıyor, ne sıklıkla, diye anlatırsın.",
  outcomes: [
    "Aile rutinleri simple present ile anlatılır.",
    "He ve she fiile s ister.",
    "Sıklık zarfı fiilden önce gelir.",
  ],
  scene: "clock",
  parentNote:
    "Çocuğunuz ev işlerini simple present ile anlatır. She cooks ile I help ayrımını kurar. Akşam sofrada bir rutini bu kalıpla söyletmek pekiştirir.",
};

export const JUNIOR_ING_MAIN_4 = juniorLessonFromScenario(JUNIOR_ING_MAIN_4_SCENARIO);
