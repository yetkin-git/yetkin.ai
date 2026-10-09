import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Paydası aynı kesirlerde toplama ve çıkarma. */
export const JUNIOR_MAT_11_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-11",
  title: "Payda aynıyken toplama",
  teaser:
    "Paydalar aynıysa paylar toplanır. Payda yerinde kalır. Kavramsal Anlayış, dilimin boyunun değişmediğini söyler. İfade Gücü, paydayı neden yerinde bıraktığını anlatmandır.",
  welcome:
    "Merhaba güzel arkadaşım, hiç aynı boyda kesilmiş pasta dilimlerini bir araya getirip kaç dilim olduğunu saydın mı? Dilimlerin boyutu değişmez; sadece elindeki dilim adedi artar. Bugün seninle paydası eşit olan kesirleri toplamayı ve çıkarmayı öğreneceğiz.",
  concept:
    "İki kesrin paydası eşitse, sadece paylar toplanır veya çıkarılır; payda ise aynen yerinde kalır. Çünkü payda dilimin büyüklüğünü, pay ise kaç dilim aldığını gösterir. Dilimin boyu değişmediği için paydayı toplamak kesinlikle yanlıştır. Şurası aklında kalsın tamam mı: İşlem sadece üstteki payların arasında gerçekleşir; alttaki paydalar işlemden etkilenmeden yerinde durur.",
  example:
    "Dörtte bir ile dörtte iki kesirlerini toplayalım. Paylar 1 ve 2'dir. 1 artı 2, 3 eder; payda ise 4 olarak sabit kalır. Yani sonuç dörtte üçtür. Dörtte üçten dörtte biri çıkarırsan; 3 eksi 1, 2 eder ve sonuç dörtte iki kalır. Şimdi sekiz dilime ayrılmış bir pizza düşün: İki dilim yedin, ardından bir dilim daha aldın. Yediğin toplam miktar sekizde üç dilimdir. Dilimin boyu değişmedi, sadece yediğin dilim sayısı arttı; payda 8 olarak kaldı.",
  hint: "trap",
  warning:
    "Paydaları da kendi arasında toplamak bu konunun en büyük tuzağıdır. Bir bölü 4 artı iki bölü 4 işlemi asla üç bölü 8 etmez! Payda yerinde korunur, sonuç dörtte üçtür. Paydalar eşit olduğu sürece alttaki sayıya hiç dokunmadan sadece üstteki payları topla.",
  life:
    "Aynı boyuttaki dilimlerden iki tane yersen dilimin boyu değişmez, saydığın dilim artar. Aynı bardak ölçeğiyle bir ölçek ve iki ölçek su koyarsan üç ölçek olur. Ölçek kabı aynı kaldığı için payda da aynı kalır. Yarım bardak ile çeyrek bardağı bu derste doğrudan toplamazsın. Onların paydası farklıdır.",
  recap: [
    "Paydalar aynıysa yalnız paylar toplanır veya çıkarılır.",
    "Payda, dilimin boyudur ve işlem sırasında yerinde kalır.",
    "Bir bölü dört artı iki bölü dört, dörtte üç eder. Üç bölü sekiz bu işlemin sonucu değildir.",
  ],
  conceptSeal: "Payda, dilimin boyudur.",
  voiceSeal: "Paydayı neden yerinde bıraktığını söylersin.",
  outcomes: [
    "Aynı paydada paylar toplanır.",
    "Aynı paydada paylar çıkarılır.",
    "Payda toplama ve çıkarma sırasında değişmez.",
  ],
  scene: "fraction-sum",
  parentNote:
    "Çocuğunuz paydası aynı kesirlerde yalnız payların işleme girdiğini anlatır. Evde dörtte bir artı dörtte ikiyi dörtte üç diye yazmak yeter. Paydayı toplayıp üç bölü sekiz yazmayın.",

};

export const JUNIOR_MAT_11 = juniorLessonFromScenario(JUNIOR_MAT_11_SCENARIO);
