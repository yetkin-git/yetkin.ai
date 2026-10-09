import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Ondalık gösterimi okuma ve karşılaştırma. */
export const JUNIOR_MAT_14_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-14",
  title: "Ondalık gösterimi okumak",
  teaser:
    "Ondalık gösterim, kesri virgülle yazar. Virgülün sağı onda bir, yüzde bir ve binde bir basamağıdır. Kavramsal Anlayış, 0,5 ile yarımı aynı miktar diye görmendir. İfade Gücü, 0,4 ile 0,35'ten hangisinin büyük olduğunu basamakla söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde ne var, birlikte keşfedelim. Hiç bir cetvelle ölçüm yaparken tam sayının yanında kalan küçük çizgileri fark ettin mi? İşte o tam olmayan kısımları virgül kullanarak gösteririz. Bugün seninle ondalık gösterimleri okumayı ve bu sayıları birbiriyle güvenle karşılaştırmayı öğreneceğiz.",
  concept:
    "Ondalık gösterimde virgülün sol tarafı tam kısım, sağ tarafı ise kesir kısmıdır. Virgülden sonraki ilk basamak onda birler, ikinci basamak yüzde birler, üçüncü basamak ise binde birler basamağıdır. Örneğin 0,5 sayısı 5 tane onda bir demektir ve bu tam olarak yarıma eşittir. Şurası aklında kalsın tamam mı: İki ondalık sayıyı karşılaştırırken önce tam kısımlarına bakarsın. Tam kısımlar eşitse sırasıyla onda birler ve yüzde birler basamaklarını incelersin.",
  example:
    "3,25 sayısını okuyalım: Tam kısmı 3'tür; onda birler basamağında 2, yüzde birler basamağında 5 vardır. Yani bu sayı 3 tam ve yüzde 25 demektir; 0,25 çeyrek olduğu için 3 tam bir çeyrek diye de düşünebilirsin. Şimdi 0,4 ile 0,35 sayılarını karşılaştıralım. İkisinin de tam kısmı 0'dır. Onda birler basamağına baktığımızda 4 sayısı 3'ten büyük olduğu için 0,4 sayısı 0,35'ten büyüktür. 0,40 ile 0,4 tamamen aynı değerdir; sona eklenen sıfırlar değeri değiştirmez.",
  hint: "gold",
  warning:
    "Altın İpucu! Virgülden sonra daha çok rakam bulunan sayıyı hemen daha büyük sanmak yaygın bir yanılgıdır. 0,35 sayısı daha uzun görünse de 0,4 ondan büyüktür! Çünkü 0,4 demek 4 tane onda bir demektir; 0,35 ise 3 tane onda bir ve 5 tane yüzde bir demektir. Onda birler basamağı büyük olan her zaman kazanır.",
  life:
    "Bunu market etiketinde de kullanırsın. 12,50 lira, 12 lira 50 kuruştur. 12,5 lira da aynı tutardır. 9,80 lira ile 10,10 lirayı karşılaştırırken önce tam kısma bakarsın. 10, 9'dan büyüktür. Virgülden sonrasına hiç bakmadan büyük olan 10,10 liradır.",
  recap: [
    "Virgülün solu tam, sağı kesir kısmıdır. İlk sağ basamak onda birdir.",
    "0,5 yarım, 0,25 dörtte birdir. Sona yazılan 0 miktarı değiştirmez.",
    "0,4, 0,35'ten büyüktür. Uzun yazılmış olmak büyük olmak demek değildir.",
  ],
  conceptSeal: "Ondalık gösterim, kesrin virgülle yazılmış hâlidir.",
  voiceSeal: "Basamak adını söyleyip hangi sayının büyük olduğunu gerekçelendirirsin.",
  outcomes: [
    "Onda bir, virgülden sonraki ilk basamaktır.",
    "0,5 ile bir bölü 2 aynı miktardır.",
    "Karşılaştırma tam kısımdan başlar.",
  ],
  scene: "decimal",
  parentNote:
    "Çocuğunuz 0,5'in yarım, 0,25'in dörtte bir olduğunu anlatır. 0,4, 0,35'ten büyüktür. Evde 12,50 lira ile 12,5 liranın aynı tutar olduğunu konuşmak yeter.",

};

export const JUNIOR_MAT_14 = juniorLessonFromScenario(JUNIOR_MAT_14_SCENARIO);
