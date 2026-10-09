import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 9 Saving the Planet. Çevre ve geri dönüşüm. */
export const JUNIOR_ING_MAIN_17_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-17",
  title: "Çevreyi korumak ve recycling",
  teaser:
    "Recycle geri dönüştürmektir. Işıkları kapatmak ve suyu korumak çevreyi korur. Kavramsal Anlayış, atığı doğru kutuya bağlar. İfade Gücü, evde yapabileceğin bir koruma işini İngilizce söylemandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün İngilizcenin ve eğlenceli kelimelerin dünyasına adım atıyoruz, çünkü üzerinde yaşadığımız güzel mavi gezegenimizi korumak için el ele veriyoruz! Her gün kullandığımız kâğıtlar, cam şişeler ve plastik kaplar rastgele çöpe atıldığında doğaya zarar verebilir; ancak onları geri dönüşüm kutularına bıraktığımızda doğa yeniden nefes alır. İşte bugün seninle çevreyi korumayı, geri dönüşüm yapmayı ve İngilizcede gezegenimize sahip çıkacak güzel eylemleri öğreneceğiz. 'Recycle', 'save water' ve 'turn off the lights' gibi bilinçli ifadelerle dünyaya sevgiyle sesleneceğiz.",
  concept:
    "Doğamızı korumak için attığımız her adımın İngilizcede harika bir karşılığı vardır. Geri dönüştürmek anlamına gelen kelimemiz 'recycle'dır: 'We recycle paper' kâğıdı geri dönüştürürüz, 'We recycle glass' camı geri dönüştürürüz, 'We recycle plastic' plastiği geri dönüştürürüz demektir. Enerjiyi ve kaynakları korumak için 'Turn off the lights' yani odadan çıkarken ışıkları kapat, 'Turn off the tap' yani diş fırçalarken musluğu kapat deriz. 'Save water' suyu koru, 'Plant trees' ise doğaya yeni fidanlar ve ağaçlar dik anlamına gelir. Şurası aklında kalsın tamam mı: Doğayı korumanın ilk kuralı atıkları yere atmamaktır; 'Don't throw rubbish on the ground' diyerek çevremizi tertemiz tutarız.",
  example:
    "Okul bahçesindeki üç renkli geri dönüşüm kutusuna birlikte bakalım: 'The blue bin is for paper, the yellow bin is for plastic, and the green bin is for glass.' Evde yapabileceğimiz güzel alışkanlıkları sıralayalım: 'I always turn off the lights when I leave my room.' Lavaboda ellerimizi yıkarken 'I turn off the tap to save water' deriz. Defterlerimizi kullanırken 'I use both sides of the paper' diyerek ağaçları koruruz. Bahçede fidan dikerken 'We plant trees for a greener future' cümlesini kurarız. Yerde bir çöp gördüğümüzde ise 'I pick up the rubbish and throw it into the bin' diyerek örnek bir davranış sergileriz.",
  hint: "gold",
  warning:
    "Geri dönüşümün her atığı aynı kutuya rastgele atmak değil, atıkları türlerine göre doğru kutularla buluşturmak olduğunu hatırla. Örneğin kâğıdı mavi kutuya, camı yeşil kutuya atmak gerçek bir 'recycling' çalışmasıdır. 'Save water' derken musluğu kapatmayı, 'save energy' derken boşa yanan ışıkları söndürmeyi her zaman aklında tutabilirsin; çünkü küçük ve özenli alışkanlıklar dünyamızı güzelleştirir.",
  life:
    "Odadan çıkarken hemen düğmeye dokun ve içinden 'I turn off the lights to save energy' de. Dişlerini fırçalarken suyu boşa akıtma ve musluğu kapatıp 'I save water' de. Okulda meyve suyunun kutusunu veya plastik şişeni sarı kutuya atarken 'We recycle plastic' cümlesini kur. Arkadaşın kâğıdın tek yüzünü kullanıp atacakken ona şefkatle 'You can use both sides of the paper' diyerek çevre dostu bir rehber ol.",
  recap: [
    "Recycle; kâğıt, cam ve plastiği ayrıştırarak yeniden kazanmaktır.",
    "Turn off the lights ve save water gezegenimizi koruyan temel eylemlerdir.",
    "Don't throw rubbish on the ground uyarısıyla çevremizi temiz tutarız.",
  ],
  conceptSeal: "Geri dönüşüm, atığı cinsine göre ayırmaktır.",
  voiceSeal: "Evde yapacağın bir koruma işini İngilizce söylersin.",
  outcomes: [
    "Recycle geri dönüştürmek demektir.",
    "Işıkları ve musluğu kapatmak çevreyi korur.",
    "Çöp yere değil, kutuya gider.",
  ],
  scene: "recycle",
  parentNote:
    "Çocuğunuz kâğıt, cam ve plastiği recycle ile ayırır. Işıkları ve musluğu kapatmayı turn off ile söyler. Evde bir kutuyu birlikte adlandırabilirsiniz.",

};

export const JUNIOR_ING_MAIN_17 = juniorLessonFromScenario(JUNIOR_ING_MAIN_17_SCENARIO);
