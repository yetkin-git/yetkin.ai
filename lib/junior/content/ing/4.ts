import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 2 Yummy Breakfast. Rica ve some, any. */
export const JUNIOR_ING_MAIN_4_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-4",
  title: "Rica etmek ve some, any",
  teaser:
    "Rica, Can I have some bread, please diye kurulur. Some olumlu cümlededir. Any soru ve olumsuzdadır. Kavramsal Anlayış, bu iki sözü cümlenin türüne göre seçer. İfade Gücü, sofrada kibar bir istek kurmandır.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün İngilizcede önümüzde nasıl bir yolculuk var, çünkü sofrada kibar bir dil kullanmanın ve miktarları doğru ifade etmenin inceliklerini öğreneceğiz. Masada ekmek sepeti senden biraz uzakta kaldığında uzanmak yerine nazikçe istemek harika bir davranıştır. Bugün seninle 'Can I have some bread, please?' diyerek kibarca rica etmeyi keşfedeceğiz. Cümlemizin sonundaki sihirli 'please' sözcüğü her kapıyı açar. Masadaki yiyeceklerin miktarını anlatırken de 'some' ve 'any' sözcüklerini dostça yanımıza alacağız.",
  concept:
    "'Can I have some bread, please?' cümlesi 'Biraz ekmek alabilir miyim lütfen?' anlamına gelen çok kibar bir ricadır. Aynı şekilde susadığında 'Can I have some water, please?' diyerek su isteyebilirsin. Masada bulunan şeyleri anlatırken olumlu cümlelerde 'some', yani biraz veya birkaç anlamına gelen sözcüğü kullanırız: 'There is some milk' masada biraz süt olduğunu, 'There are some olives' ise birkaç zeytin olduğunu söyler. Ancak soru sorarken ve bir şeyin olmadığını söylerken 'any' sözcüğüne başvururuz: 'Is there any cheese?' hiç peynir var mı demektir; 'There isn't any honey' ise hiç bal kalmadığını belirtir. Şurası aklında kalsın tamam mı: Olumlu cümlelerde 'some', soru ve olumsuz cümlelerde ise 'any' kalıbını güvenle seçebilirsin.",
  example:
    "Sofraya birlikte göz atalım. Masada biraz süt var: 'There is some milk.' Bal tükenmiş: 'There isn't any honey.' Arkadaşına peynir olup olmadığını soralım: 'Is there any cheese?' Eğer varsa 'Yes, there is', kalmamışsa 'No, there isn't' cevabını alırsın. Ekmek isterken her zaman 'Can I have some bread, please?' diyerek ricada bulunursun. Misafire çay ikram etmek istediğinde ise 'Would you like some tea?' dersin. Karşı taraf da gülümseyerek 'Yes, please' ya da kibarca 'No, thank you' der. Zeytin gibi sayılabilenlerde 'There are some olives', süt gibi sayılamayanlarda ise 'There is some milk' kalıbı kullanılır.",
  hint: "trap",
  warning:
    "Olumsuz cümlelerde ve sorularda 'some' yerine 'any' kullanmaya dikkat edebilirsin. Örneğin 'There isn't any milk' ve 'Do you have any bread?' demek cümleni kusursuz hale getirir. Birinden bir şey rica ederken de cümlenin sonuna o tatlı 'please' kelimesini eklemeyi hatırla; çünkü 'Can I have some water, please?' demek hem çok kibar hem de pırıl pırıl bir İngilizce örneğidir.",
  life:
    "Akşam ailenle sofraya oturduğunda sürahiye doğru bakıp 'Can I have some water, please?' diyerek su iste. Masada ekmek bittiyse 'There isn't any bread' diyerek durumu fark et. Peynir tabağını gösterip 'There is some cheese' cümlesini kur. Biri sana fazladan bir şey ikram ettiğinde nazikçe 'No, thank you' veya 'Yes, please' diyerek nezaketini İngilizceyle taçlandır.",
  recap: [
    "Rica, Can I have some bread, please diye kibarca kurulur.",
    "Some olumlu cümlededir; any soru ve olumsuz cümlelerde yer alır.",
    "Olumsuzda any kullanılır; there isn't any milk doğru biçimdir.",
  ],
  conceptSeal: "Some olumlu cümlededir. Any soru ve olumsuzdadır.",
  voiceSeal: "Sofrada kibar bir istek kurar ve some ile any seçersin.",
  outcomes: [
    "Can I have some, please bir ricadır.",
    "Some olumlu cümlede kullanılır.",
    "Any soru ve olumsuz cümlede kullanılır.",
  ],
  scene: "tray",
  parentNote:
    "Çocuğunuz ricayı Can I have some bread, please ile kurar. Some olumlu cümlede, any soru ve olumsuzda durur. Sofrada su isterken bu kalıbı kullanabilirsiniz.",

};

export const JUNIOR_ING_MAIN_4 = juniorLessonFromScenario(JUNIOR_ING_MAIN_4_SCENARIO);
