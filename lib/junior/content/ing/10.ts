import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 5 At the Fair. Fuar etkinliğinde duygu. */
export const JUNIOR_ING_MAIN_10_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-10",
  title: "Fuarda duyguyu söylemek",
  teaser:
    "Fuar etkinliğindeki duygu I am excited about ve I am scared of ile söylenir. Kavramsal Anlayış, heyecanı korkudan ayırır. İfade Gücü, bir oyuncak karşısındaki halini İngilizce kurmandır.",
  welcome:
    "Merhaba! İngilizce dünyasına hoş geldin, lunaparkın ve fuar alanının heyecan dolu köşelerinde gezintimize devam ediyoruz! Dev gibi dönen hız treninin kuyruğunda bekleyen çocuklara bir bak: Kimi yerinde duramıyor ve sabırsızlıkla sıranın gelmesini bekliyor, kimi ise rayların yüksekliğine bakıp biraz çekinerek geri adım atıyor. İkisi de aynı trene bakıyor ama kalplerinde bambaşka hisler çarpıyor. Bugün seninle lunapark oyuncaklarına karşı hissettiğin duyguları 'I am excited about' ve 'I am scared of' kalıplarıyla doğru edatları kullanarak İngilizce ifade etmeyi öğreneceğiz.",
  concept:
    "Bir fuar oyuncağına karşı duyduğumuz heyecanı anlatırken 'excited' sözcüğünden sonra 'about' edatını getiririz. 'I am excited about the roller coaster' dediğinde, hız trenine bineceğin için büyük bir heyecan duyduğunu söylersin. Ancak bir oyuncak sana biraz fazla ürkütücü geliyorsa 'scared' kelimesinden sonra 'of' edatını kullanırız: 'I am scared of the ghost train' hayalet treninden korktuğunu berrakça ifade eder. Atlı karıncada huzur buluyorsan 'I feel happy on the carousel' dersin. Şurası aklında kalsın tamam mı: 'Exciting' oyuncağın heyecan verici özelliğidir; 'excited' ise senin içindeki o kıpır kıpır heyecandır.",
  example:
    "Fuar alanında farklı duraklara uğrayalım: 'The roller coaster looks exciting, and I am excited about it!' Hayalet treninin karanlık kapısına geldiğinde 'I am scared of the ghost train, so I don't want to get on' diyerek dürüstçe hissini paylaşabilirsin. Arkadaşın sana dönüp 'How do you feel about the bumper cars?' diye sorduğunda 'I am excited about them, they are so much fun!' cevabını verirsin. Kazanılan bir ödül karşısında ise 'I am happy about the prize' diyerek sevincini katlarsın. Doğru edatlarla duygular tam yerine oturur.",
  hint: "trap",
  warning:
    "Edatları kullanırken 'excited' için 'about', 'scared' için ise 'of' seçmeyi hatırla; yani 'excited of' veya 'scared about' demek yerine 'I am excited about the ride' ve 'I am scared of heights' demek kulağa çok daha doğal ve pürüzsüz gelir. Kendinden bahsederken 'I am exciting' dememeye özen göster; çünkü heyecan veren şey 'exciting', o heyecanla kalbi atan sen ise 'excited' olursun!",
  life:
    "Fuarda veya oyun parkında bir oyuncağın önünde durduğunda kendi kendine hissini fısılda: 'I am excited about this ride!' Eğer bir şeyden hoşlanmadıysan hiç çekinmeden 'I am scared of that high tower' diyerek hissini ifade et. Arkadaşın korktuğunda ona şefkatle destek ol ve 'You don't have to ride it' de. Günün sonunda ailene 'I was excited about the fair today' diyerek harika bir özet geç.",
  recap: [
    "I am excited about, sabırsızlıkla beklenen heyecanlı etkinliği söyler.",
    "I am scared of, ürkütücü gelen ve çekinilen etkinliği anlatır.",
    "Oyuncağın kendisi exciting, o heyecanı yaşayan kişi ise excited olur.",
  ],
  conceptSeal: "Heyecan about, korku of ile oyuncağa bağlanır.",
  voiceSeal: "Bir fuar etkinliği karşısındaki halini bir cümlede söylersin.",
  outcomes: [
    "Excited about heyecanı bağlar.",
    "Scared of korkuyu bağlar.",
    "Exciting şeyindir. Excited kişinin halidir.",
  ],
  scene: "fair",
  parentNote:
    "Çocuğunuz fuar duygusunu I am excited about ve I am scared of ile kurar. Exciting şeyin özelliği, excited kişinin halidir. Bir etkinlikten önce bu cümleyi kurdurabilirsiniz.",

};

export const JUNIOR_ING_MAIN_10 = juniorLessonFromScenario(JUNIOR_ING_MAIN_10_SCENARIO);
