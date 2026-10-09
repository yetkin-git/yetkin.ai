import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Türkçe. Neden-sonuç, amaç-sonuç ve koşul-sonuç. */
export const JUNIOR_TURKCE_6_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_turkce-6",
  title: "Neden-sonuç, amaç-sonuç ve koşul-sonuç cümleleri",
  teaser:
    "Neden-sonuç bir sebebi söyler. Amaç-sonuç bir hedefi söyler. Koşul-sonuç henüz olmamış bir şartı söyler. Kavramsal Anlayış, üç bağı ayırır. İfade Gücü, için sözünün sebep mi amaç mı olduğunu söylemektir.",
  welcome:
    "Merhaba güzel arkadaşım, hiç yoğun kar yağdığı için okulların tatil edildiğini duydun mu? Orada gerçekleşmiş kesin bir sebep vardır. Sınavı kazanmak için erkenden çalışmaya başlamak ise geleceğe yönelik bir hedeftir. Bugün seninle neden-sonuç, amaç-sonuç ve koşul-sonuç cümlelerini tek tek inceleyeceğiz. Olayların arkasındaki sebepleri ve hedefleri ayırt etmek düşüncelerini çok daha berrak kılacak.",
  concept:
    "Neden-sonuç cümlelerinde gerçekleşmiş bir durumun gerekçesi anlatılır; çünkü, bu nedenle, dığından gibi ek ve bağlaçlar sıkça kullanılır. Yağmur yağdığı için ıslandık cümlesinde ıslanmanın sebebi yağmurun yağmış olmasıdır. Amaç-sonuç cümlelerinde ise henüz gerçekleşip gerçekleşmediği bilinmeyen bir hedefe ulaşmak istenir; amacıyla, gayesiyle ve mek için kalıpları ipucudur. Sağlıklı olmak için spor yapıyor cümlesinde spor yapmanın bir hedefi vardır. Koşul-sonuç cümlelerinde ise bir olayın gerçekleşmesi başka bir şarta bağlanır; se, sa ekleri koşulu kurar. Düzenli çalışırsan hedefine ulaşırsın. Şurası aklında kalsın tamam mı: İçin sözcüğü her zaman amaç bildirmez; dığı için biçimindeyse sebep, mek için biçimindeyse hedef anlatır.",
  example:
    "Örneklerimizi birlikte tartalım. Hasta olduğu için okula gelemedi cümlesinde hastalık gerçekleşmiş bir sebeptir; bu neden-sonuçtur. Kardeşini görmek için yola çıktı cümlesinde yola çıkmanın henüz gerçekleşmemiş bir hedefi vardır; bu amaç-sonuçtur. Güneş açarsa bahçede top oynarız cümlesinde top oynamak güneşin açması şartına bağlıdır; bu koşul-sonuçtur. Kar yağdığı için yollar kapandı cümlesi de bir nedendir; amacı değil, olan bir durumu açıklar.",
  hint: "gold",
  warning:
    "İçin sözcüğünü gördüğün anda aceleyle amaç-sonuç kararı vermemeyi aklında tutabilirsin. İçin sözcüğü yerine amacıyla koyduğunda cümle anlamlı oluyorsa amaç-sonuçtur; amacıyla sözü uymuyor ve sebebiyle anlamına geliyorsa neden-sonuçtur. Bu küçük pratik yöntem sana her zaman rehberlik eder.",
  life:
    "Bir arkadaşına servise yetişmek için koştum dersen amacını söylersin. Alarm çalmadığı için geç kaldım dersen sebebini açıklarsın. Yarın gelirsen birlikte ödev yaparız dersen bir koşul öne sürersin. Cümlelerindeki bu bağlar iletişimini çok daha anlaşılır kılar.",
  recap: [
    "Neden-sonuç cümlesi gerçekleşmiş bir sebebi bildirir.",
    "Amaç-sonuç cümlesi ulaşılmak istenen bir hedefi anlatır.",
    "Koşul-sonuç cümlesinde eylem bir şarta bağlanır.",
  ],
  conceptSeal: "Neden sebeptir. Amaç hedeftir. Koşul, henüz olmamış şarttır.",
  voiceSeal: "Bir cümlenin neden, amaç veya koşul bildirdiğini için sözüne aldanmadan söylersin.",
  outcomes: [
    "Neden-sonuç cümlesi sebep bildirir.",
    "Amaç-sonuç cümlesi hedef bildirir.",
    "Koşul-sonuç cümlesi şarta bağlıdır.",
  ],
  scene: "meaning",
  parentNote:
    "Çocuğunuz bu derste neden-sonuç, amaç-sonuç ve koşul-sonuç ilişkilerini ayırt eder. İçin sözcüğünün yerine amacıyla getirerek test etme yöntemini evde birlikte deneyebilirsiniz.",

};

export const JUNIOR_TURKCE_6 = juniorLessonFromScenario(JUNIOR_TURKCE_6_SCENARIO);
