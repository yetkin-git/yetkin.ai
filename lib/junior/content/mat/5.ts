import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Çarpan, kat ve bölünebilme kuralları. */
export const JUNIOR_MAT_5_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-5",
  title: "Çarpanlar, katlar ve bölünebilme",
  teaser:
    "Çarpan, bir sayıyı kalansız bölen sayıdır. Kat, o sayının çarpımla büyüyen hâlidir. Kavramsal Anlayış, 2, 5, 10, 3 ve 9 kurallarını sayının sonundan ya da rakam toplamından okumandır. İfade Gücü, 24'ün bir çarpanını ve bir katını ayrı söylemektir.",
  welcome:
    "Merhaba! Matematik dünyasına hoş geldin, bugün sayılar arasındaki gizli kuralları keşfedeceğiz. Hiç bir kutudaki bilyeleri ikişer ikişer dizdiğinde açıkta kalan bilye olup olmadığına baktın mı? Kalan yoksa o sayı ikiye tam bölünüyor demektir. Bugün seninle çarpanı, katı ve bölünebilme kurallarını eğlenceli bir dille tanıyacağız.",
  concept:
    "Bir doğal sayının çarpanı, onu kalansız bölen doğal sayıdır. Kat ise o sayının 1, 2, 3 gibi sayılarla çarpılmış katlarıdır. Örneğin 6'nın çarpanları 1, 2, 3 ve 6'dır; katları ise 6, 12, 18 diye sonsuza uzanır. Şurası aklında kalsın tamam mı: Son rakamı 0 veya 5 olan sayılar 5'e tam bölünür. Son rakamı çift olanlar 2'ye, sonu 0 olanlar ise 10'a da bölünür. Rakamları toplamı 3'ün katıysa sayı 3'e, 9'un katıysa 9'a kalansız bölünür.",
  example:
    "24 sayısını ele alalım. Son rakamı 4'tür ve çifttir, bu yüzden 24 sayısı 2'ye bölünür: 2 çarpı 12, 24 eder. Rakamlarını toplayalım: 2 artı 4, 6 eder. 6 sayısı 3'e tam bölündüğü için 24 de 3'e tam bölünür: 3 çarpı 8, 24 eder. 24'ün çarpanları 1, 2, 3, 4, 6, 8, 12 ve 24'tür. 24'ün bir katı 48'dir çünkü 24 çarpı 2, 48 eder. 15'in son rakamı 5 olduğu için 5'e bölünür ama tek sayı olduğu için 2'ye bölünmez. 30 ise hem 2'ye, hem 5'e, hem de 10'a tam bölünür.",
  hint: "gold",
  warning:
    "Son rakama bakmak 2, 5 ve 10 ile bölünebilmede harika bir pratikliktir. Fakat 3 ve 9 için son rakam yetmez, mutlaka rakamların toplamına bakmalısın. Örneğin 15 sayısı 5'e tam bölünür ama 2'ye bölünmez. Çarpan ile katı da birbiriyle karıştırma. 3 sayısı 12'nin çarpanıdır; 12 sayısı ise 3'ün katıdır.",
  life:
    "Bunu sıra olurken de kullanırsın. 24 kişiyi ikişerli dizince kimse açıkta kalmaz. Üçerli dizince de kalmaz. Beşerli dizince 4 kişi artar çünkü 24, 5'e bölünmez. Bahçedeki 10'luk sıralar ise sonu 0 olan sayılarda tam biter.",
  recap: [
    "Çarpan, sayıyı kalansız böler. Kat, sayının çarpımla elde edilen büyüğüdür.",
    "2, 5 ve 10 için son rakama bakılır. 3 ve 9 için rakamlar toplanır.",
    "24, 2'ye ve 3'e bölünür. 15, 5'e bölünür ama 2'ye bölünmez.",
  ],
  conceptSeal: "Bölünebilme kuralı, bölmeyi yapmadan kalan olup olmayacağını söyler.",
  voiceSeal: "Bir çarpanı ve bir katı ayrı cümleyle adlandırırsın.",
  outcomes: [
    "Çarpan kalansız böler. Kat, çarpımla bulunur.",
    "2, 5 ve 10 kuralları son rakama bakar.",
    "3 ve 9 kuralları rakam toplamına bakar.",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz 24'ün 2 ve 3 ile kalansız bölündüğünü, 15'in 5'e bölünüp 2'ye bölünmediğini anlatır. Çarpan ile katı yer değiştirmeyin. 3, 12'nin çarpanıdır.",

};

export const JUNIOR_MAT_5 = juniorLessonFromScenario(JUNIOR_MAT_5_SCENARIO);
