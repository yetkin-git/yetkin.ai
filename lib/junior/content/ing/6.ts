import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 3 Downtown. Karşılaştırma. */
export const JUNIOR_ING_MAIN_6_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-6",
  title: "Bigger ve cheaper ile karşılaştırma",
  teaser:
    "Kısa sıfat karşılaştırmada er alır. Big, bigger olur. Cheap, cheaper olur. Than, kıyaslananı bağlar. Kavramsal Anlayış, kısa sıfat ile uzun sıfatı ayırır. İfade Gücü, iki dükkânı bir cümlede kıyaslamandır.",
  welcome:
    "Merhaba güzel arkadaşım, çarşıda veya bir alışveriş merkezinde yan yana duran iki dükkânı hayal et. Biri diğerinden daha büyük, öbürü ise belki çok daha uygun fiyatlı! Hayatın içinde her an iki nesneyi, iki yeri veya iki kıyafeti birbiriyle kıyaslarız. Bugün seninle İngilizcede karşılaştırma yapmayı, yani 'comparative' kalıplarını keşfedeceğiz. Kısa kelimelere eklenen küçük bir sesle 'bigger' veya 'cheaper' demeyi, kıyasladığımız şeyleri ise sihirli 'than' köprüsüyle birbirine bağlamayı öğreneceğiz.",
  concept:
    "İngilizcede tek heceli veya kısa sıfatları birbiriyle kıyaslarken sıfatın sonuna '-er' eki getiririz. Örneğin büyük anlamına gelen 'big' sözcüğü 'bigger', ucuz anlamına gelen 'cheap' sözcüğü ise 'cheaper' olur. Benzer şekilde 'small' daha küçük anlamında 'smaller', 'tall' daha uzun anlamında 'taller' halini alır. Tek ünlü ve tek ünsüz harfle biten kısa sıfatlarda sondaki ünsüz harf ikizleşir; tıpkı 'big' kelimesinin 'bigger', 'hot' kelimesinin 'hotter' oluşu gibi. Ancak 'expensive' gibi uzun ve gösterişli sıfatların sonuna '-er' eklenmez; onun yerine sıfatın önüne zarif bir 'more' sözcüğü gelir ve 'more expensive', yani daha pahalı deriz. Şurası aklında kalsın tamam mı: Kıyaslama yaparken iki varlığın arasına mutlaka -den veya -dan anlamına gelen 'than' sözcüğünü yerleştiririz.",
  example:
    "Vitrinlerdeki iki çantayı birlikte inceleyelim: 'The blue bag is bigger than the red bag', yani mavi çanta kırmızı olandan daha büyüktür. Şimdi de fiyatlarına bakalım: 'The red bag is cheaper than the blue bag', yani kırmızı çanta mavi olandan daha ucuzdur. Masadaki iki kitaptan biri çok değerliyse 'This book is more expensive than that one' diyebilirsin. İngilizcede bazı özel sıfatlar da vardır: Örneğin 'good' yani iyi sözcüğü kıyaslamada tamamen değişir ve 'better', yani daha iyi olur. Tıpkı 'This pencil is better than that pencil' dediğimiz gibi!",
  hint: "trap",
  warning:
    "Kısa sıfatlarda '-er' takısı varken önüne bir de fazladan 'more' eklememeye özen göster; örneğin 'more bigger' demek yerine sadece 'bigger than' demek cümleni çok daha akıcı ve doğru yapar. Uzun sıfatlarda ise 'expensiver' gibi eklemeler yapmak yerine 'more expensive than' kalıbını tercih edebilirsin. Ayrıca iki varlığı kıyaslarken aradaki 'than' köprüsünü kurmayı her zaman hatırla; çünkü 'than' sözcüğü karşılaştırmanın en sadık pusulasıdır.",
  life:
    "Kırtasiyeye gittiğinde iki defteri yan yana koyup 'This notebook is bigger than that notebook' de. Kardeşinin boyu ile kendi boyunu kıyaslarken 'I am taller than my brother' diyerek gülümse. Okul bahçesindeki iki ağaca bakıp 'The oak tree is older' cümlesini kur. Bir eşyayı satın almadan önce de 'This one is cheaper' diyerek tercihini İngilizceyle seslendir.",
  recap: [
    "Kısa sıfatlar karşılaştırmada er alır; big bigger, cheap cheaper olur.",
    "Uzun sıfatların önüne more gelir; more expensive kalıbı böyle kurulur.",
    "Kıyaslanan iki varlığın arasına than köprüsü yerleştirilir.",
  ],
  conceptSeal: "Kısa sıfat er alır. Uzun sıfat more alır. Than kıyaslar.",
  voiceSeal: "İki dükkânı bigger ve cheaper ile bir cümlede söylersin.",
  outcomes: [
    "Kısa sıfat karşılaştırmada er alır.",
    "Than kıyaslananı bağlar.",
    "Uzun sıfatın önüne more gelir.",
  ],
  scene: "skyline",
  parentNote:
    "Çocuğunuz kısa sıfata er, uzun sıfata more getirir. Bigger than ve cheaper than sırasını evde iki eşyayla deneyebilirsiniz.",

};

export const JUNIOR_ING_MAIN_6 = juniorLessonFromScenario(JUNIOR_ING_MAIN_6_SCENARIO);
