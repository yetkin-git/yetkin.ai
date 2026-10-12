import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Sosyal Bilgiler. Türk dünyasıyla kültürel iş birliği. SB.6.2.3. */
export const JUNIOR_SOSYAL_22_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_sosyal-22",
  title: "Türk dünyasıyla kültürel iş birliği",
  teaser:
    "Türk dünyası, ortak dil ailesi ve ortak kültür izi taşıyan ülkelerin adıdır. Kültürel iş birliği, bu izi birlikte yaşatmaktır. Kavramsal Anlayış, ortak geleneği tek ülkenin malı sanmaktan ayırır. İfade Gücü, bir geleneğin iki ülkede nasıl durduğunu söylemektir.",
  welcome:
    "Merhaba sevgili çocuklar! Haritada birbirinden uzak iki ülke, baharda aynı günü kutlayabilir. Nevruz sofrası, ortak masal ve benzer sözcükler sınırın iki yanında da durur. Türk dünyasıyla kültürel iş birliğini bir küre üzerinde araştıracağız.",
  concept:
    "Türk dünyası, tarih boyunca aynı dil ailesinden beslenen toplulukların yurdudur. Kültürel iş birliği, bir ülkenin ötekinin bayramını, yemeğini ya da masalını birlikte tanımasıdır. Ortak gelenek tek bir şehrin malı değildir; iki ülkede de yaşayan bir izdir. Araştırma, bir geleneğin adını ve gününü iki yerde karşılaştırmaktır. Tartışma ise «bu yalnız bize ait» demeden önce kanıta bakmaktır. Pratik kural: Önce haritada iki ülke seç, sonra bir geleneği araştır, en sonda ortak olanı söyle.",
  example:
    "Sınıf, haritada iki ülke seçer ve Nevruz gününü araştırır. Bir ülkede buğday yeşertilir, ötekinde ateşin etrafında dönülür; ikisinde de baharın gelişi kutlanır. Öğrenciler bulduklarını sırayla okur ve tartışır: hangi parça ortak, hangi parça yere göredir. Ortak parça kültürel iş birliğinin konusu olur. Farklı parça ise iş birliğini bozmaz; zenginleştirir.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Ortak geleneği tek ülkenin icadı sanmak tuzaktır. İş birliği, ötekinin farkını silmek de değildir. Araştırmadan «hepsi aynı» demek de eksik kalır. Türk dünyasıyla kültürel iş birliğinde kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu evde bir kitap açarak da yapabilirsin. Arkadaşın başka bir şehirden bir masal getirince haritaya bakıp aynı masalın izini sorarsın. Okulda bir ülke günü düzenlenince yemeği ve oyunu birlikte konuşursunuz. Araştırdığın gelenek, kürede iki noktayı birbirine bağlar.",
  recap: [
    "Türk dünyası, ortak dil ve kültür izi taşıyan yurtların adıdır.",
    "Kültürel iş birliği, bir geleneği iki yerde birlikte tanımaktır.",
    "Araştırma ortak parçayı, tartışma farkı ayırır.",
  ],
  conceptSeal: "Kültürel iş birliği, ortak geleneği iki yerde birlikte tanımaktır.",
  voiceSeal: "Bir geleneğin iki ülkede ortak olan parçasını söylersin.",
  outcomes: [
    "Türk dünyasında ortak kültür izleri vardır.",
    "İş birliği, bir geleneği birlikte tanımaktır.",
    "Fark, ortak parçayı silmez.",
  ],
  scene: "globe",
  parentNote:
    "Çocuğunuz Türk dünyasını ortak dil ve gelenek iziyle tanımlar. Nevruz gibi bir geleneği iki ülkede araştırıp ortak parçayı ayırması beklenir.",
};

export const JUNIOR_SOSYAL_22 = juniorLessonFromScenario(JUNIOR_SOSYAL_22_SCENARIO);
