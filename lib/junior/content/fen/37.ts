import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Fen Bilimleri. Biyoçeşitlilik ve tehditler. FB.6.7.1 ve FB.6.7.2.
 * Film `resolveJuniorPlayback` grafiğidir. Tür sayıları parametredir.
 * `BodyScene` bu dersi çizmez.
 */
export const JUNIOR_FEN_37_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-37",
  title: "Biyoçeşitlilik ve tehditler",
  teaser:
    "Biyoçeşitlilik, bir bölgedeki canlı çeşitliliğidir. Biyoçeşitliliğe yönelik tehditler yaşam alanını ve türleri azaltır. Kavramsal Anlayış, çeşitliliği tek türle karıştırmaz. İfade Gücü, bir tehdidi ve bir koruma yolunu söylemektir.",
  welcome:
    "Merhaba sevgili çocuklar! Ormanda kuş, böcek, mantar ve ağaç bir arada yaşar. Parkta yalnız tek bir çim türü varsa çeşitlilik azalmıştır. Biyoçeşitlilik, canlıların ve yaşadıkları ortamın zenginliğidir. Bu zenginliğe yönelik tehditleri araştırınca koruma cümlesi de kurulur. Bir orman fotoğrafını gözlemlemek, tür sayısının neden önemli olduğunu gösterir.",
  concept:
    "Biyoçeşitlilik, belirli bir alandaki tür çeşitliliği ve bu türlerin birbirleriyle kurduğu ilişkidir. Farklı bitkiler farklı hayvanlara yuva ve besin olur. Biyoçeşitliliğe yönelik tehditler arasında ormanın kesilmesi, suyun kirletilmesi, aşırı avlanma ve yangın sayılabilir. Bir tür azalınca ona bağlı başka türler de zorlanır. Koruma, yaşam alanını bütün bırakmak, atığı suya vermemek ve av kurallarına uymakla başlar. Tartışma, suçlu aramak değil hangi davranışın tehdidi azalttığını seçmektir. Pratik kural: Çeşitlilik ilişki demektir; bir halka kopunca komşu halka da etkilenir.",
  example:
    "Bir orman modelinde 12 kuş türü ve 30 bitki türü vardır. Ağaçların yarısı kesilirse yuva olan dal azalır ve kuş türlerinden 4'ü bölgeyi terk eder. Dereye bırakılan atık, sudaki böceği azaltır; böceği yiyen balık da besinsiz kalır. Bu iki örnek biyoçeşitliliğe yönelik tehdittir. Aynı dereyi temiz tutan köy, tür sayısını korur. Araştırmada önce türü sayar, sonra tehdidin adını yazarsın.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Biyoçeşitliliği yalnız büyük hayvan sanmak tuzaktır; böcek ve bitki de bu zenginliğin parçasıdır. Tehdidi yalnız uzak ülkelerde aramak da eksiktir. Parktaki çöp de yerel bir tehdit olabilir. Biyoçeşitlilik ve tehditler konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu okul bahçesindeki canlıları sayarak kullanırsın. Dere kenarına çöp bırakmamak bir koruma cümlesidir. Belgeselde yanan orman, tehdidin somut görüntüsüdür. Ailenle hangi davranışın tür sayısını koruduğunu tartışmak dersi eve taşır.",
  recap: [
    "Biyoçeşitlilik, bir bölgedeki canlı çeşitliliği ve ilişkisidir.",
    "Biyoçeşitliliğe yönelik tehditler yaşam alanını ve türleri azaltır.",
    "Koruma, alanı bütün bırakmak ve kirliliği azaltmakla başlar.",
  ],
  conceptSeal: "Biyoçeşitlilik ilişki zenginliğidir ve tehditler bu ilişkiyi koparır.",
  voiceSeal: "Bir tehdidi ve ona karşı bir davranışı söylersin.",
  outcomes: [
    "Biyoçeşitlilik tür çeşitliliğidir.",
    "Biyoçeşitliliğe yönelik tehditler türleri azaltır.",
    "Koruma yaşam alanını gözetir.",
  ],
  scene: "body",
  parentNote:
    "Çocuğunuz biyoçeşitliliği tür çeşitliliği diye tanımlar. Orman kesimi ve su kirliliğini tehdit olarak sayar. Bir koruma davranışı söylemesi beklenir.",
};

export const JUNIOR_FEN_37 = juniorLessonFromScenario(JUNIOR_FEN_37_SCENARIO);
