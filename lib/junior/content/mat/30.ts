import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Matematik. İki paralel doğru ve bir kesenin açıları.
 * Film `resolveJuniorPlayback` grafiğidir. 70° ve 110° parametredir.
 * `AnglesScene` bu dersi çizmez.
 */
export const JUNIOR_MAT_30_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-30",
  title: "İki paralel doğru ve bir kesenin açıları",
  teaser: "Paralel doğrular hiç kesişmez. Kavramsal Anlayış, kesenin oluşturduğu yöndeş ve iç ters açıların eşitliğidir. İfade Gücü, bir açının eşini doğru çiftiyle göstermektir.",
  welcome: "Merhaba sevgili çocuklar! Bugün iki paralel doğruyu bir kesenin nasıl kestiğini ölçeceğiz. Okul defterindeki iki çizgi koşu şeridi gibi yan yana gider. Kesen, ikisini birden geçer.",
  concept: "Paralel doğrular aynı düzlemde kesişmeden gider. Bir kesen ikisini kesince yöndeş açılar eşit olur. İç ters açılar da eşittir. Modelde bir açıyı ölçünce eş açının derecesi aynıdır. 70 derecelik yöndeş açı da 70 derecedir.",
  example: "İki paralel doğru ve bir kesen çizelim. Soldaki iç açı 70 derece olsun. Yöndeş olan sağdaki açı da 70 derecedir. İç ters açı da 70 derecedir. Bütünler komşu ise 180 eksi 70, 110 derece eder. Eşit olanlar ters yönde duran iç çift ve aynı yöndeki yöndeş çifttir.",
  hint: "trap",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Komşu bütünler açıyı eş açı sanma. 70 derecenin yanındaki açı 70 değil 110 derecedir. Paralellik bozulursa bu eşitlik de bozulur. Doğrular kesişiyorsa model değişir.",
  life: "Bunu okul bahçesindeki iki kaldırım çizgisinde görürsün. Kutunun kapağını çapraz bir çubuk keserse eşit açılar aynı derecede durur. Çizgiler birbirine yaklaşırsa artık paralel değildir.",
  recap: [
    "Paralel doğrular kesişmez.",
    "Yöndeş açılar ve iç ters açılar eşittir.",
    "Komşu bütünler açı 180 dereceyi tamamlar.",
  ],
  conceptSeal: "Paralel doğrularda kesen, eşit açı çiftleri üretir.",
  voiceSeal: "70 derecelik açının yöndeş eşinin de 70 derece olduğunu dersin.",
  outcomes: [
    "Paralel doğrular kesişmez.",
    "Yöndeş ve iç ters açılar eşittir.",
    "Bütünler komşu 180 dereceyi tamamlar.",
    "İki paralel doğru ve bir kesenin açıları kuralı bu derste yeni bir istisna açmaz.",
    "30 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "angles",
  parentNote: "Çocuğunuz 70 derecelik yöndeş açının eşini 70 diye gösterir. Yanındaki bütünler açıyı 110 diye ayırır. Paraleli kesişen doğru sanmaz.",
};

export const JUNIOR_MAT_30 = juniorLessonFromScenario(JUNIOR_MAT_30_SCENARIO);
