import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Paydaları farklı kesirlerde toplama ve çıkarma. */
export const JUNIOR_MAT_12_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-12",
  title: "Paydayı eşitleyerek toplama",
  teaser:
    "Paydalar farklıysa önce dilimler aynı boya getirilir. Sonra paylar toplanır. Kavramsal Anlayış, denk kesrin aynı miktarı yeni dilimle söylemesidir. İfade Gücü, yarım ile dörtte birin toplamını dörtte üç diye kurmandır.",
  welcome:
    "Hoş geldin! Hazırsan bugün zihnimizi harika bir matematik yolculuğuna çıkarıyoruz, çünkü farklı boydaki dilimleri birbiriyle uyumlu hâle getireceğiz. Hiç yarım ekmek ile çeyrek ekmeği aynı tabakta birleştirmeyi denedin mi? Dilimler aynı boyutta değilse, önce onları aynı ölçüye getiririz. Bugün seninle paydaları farklı kesirlerle işlem yapmayı çözeceğiz.",
  concept:
    "Paydalar farklıysa paylar hemen toplanmaz veya çıkarılmaz. Önce ortak bir payda seçilir. Bu ortak payda, iki paydanın da buluştuğu bir kattır. Payda kaç kat genişletildiyse pay da aynı sayıyla çarpılır; buna denk kesir elde etme denir. Şurası aklında kalsın tamam mı: Denk kesir oluşturmak miktarı değiştirmez; sadece dilimin boyunu ve sayısını aynı oranda yeniler.",
  example:
    "Bir bölü 2 ile bir bölü 4'ü toplayalım. Paydalar 2 ve 4'tür. 4 sayısı 2'nin katı olduğu için ortak payda 4 seçilir. Bir bölü 2 kesrini 2 ile genişletirsek iki bölü 4 elde ederiz. Artık iki bölü 4 ile bir bölü 4'ü toplayabiliriz: 2 artı 1, 3 eder ve payda 4 kalır; sonuç dörtte üçtür. Çıkarmada da aynı kural geçerlidir: Üç bölü 4 eksi bir bölü 2 işleminde, bir bölü 2'yi iki bölü 4 yaparız; 3 eksi 2'den sonuç dörtte bir kalır. Yarım ile çeyrek ekmek, tam üç çeyrek ekmek eder.",
  hint: "gold",
  warning:
    "Altın İpucu! Paydalar farklıyken hem payları hem paydaları doğrudan toplamak çok büyük bir tuzaktır. Bir bölü 2 artı bir bölü 4 işlemi kesinlikle iki bölü 6 yapmaz! Önce yarımı genişletip iki bölü 4 yaparsın, sonra rahatça toplarsın. Ortak paydayı bulunca her iki kesri de o paydaya denk hâle getir.",
  life:
    "Bunu tarif defterinde de kullanırsın. Yarım su bardağı ve çeyrek su bardağı un, üç çeyrek bardak un eder. Bardakların boyu farklı görünse de çeyrek ölçüye çevirince sayarsın. Yarım, iki çeyrektir. İki çeyrek artı bir çeyrek, üç çeyrektir.",
  recap: [
    "Paydalar farklıysa önce denk kesirle paydalar eşitlenir.",
    "Payda kaç kat büyüdüyse pay da o kadar kat büyür. Miktar değişmez.",
    "Bir bölü 2 artı bir bölü 4, dörtte üç eder. İki bölü 6 bu işlemin sonucu değildir.",
  ],
  conceptSeal: "Denk kesir, aynı miktarın yeni dilimle söylenmesidir.",
  voiceSeal: "Önce hangi paydayı seçtiğini, sonra payları nasıl topladığını söylersin.",
  outcomes: [
    "Farklı paydada önce paydalar eşitlenir.",
    "Denk kesirde pay ve payda aynı sayıyla çarpılır.",
    "Yarım artı dörtte bir, dörtte üç eder.",
  ],
  scene: "fraction-sum",
  parentNote:
    "Çocuğunuz farklı paydada önce denk kesir kurar. Evde yarım ile dörtte biri dörtte üç diye toplamak yeter. İki bölü 6 yazmayın.",

};

export const JUNIOR_MAT_12 = juniorLessonFromScenario(JUNIOR_MAT_12_SCENARIO);
