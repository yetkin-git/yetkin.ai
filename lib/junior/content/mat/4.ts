import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Doğal sayılarla problem çözme. */
export const JUNIOR_MAT_4_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-4",
  title: "Doğal sayı problemleri",
  teaser:
    "Problem, sayının bir hikâyesidir. Önce sorulanı bulursun, sonra işlemi seçersin. Kavramsal Anlayış, artmayı toplamadan, katlamayı çarpmadan ayırmandır. İfade Gücü, sonucu cümleyle ve birimle söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde ne var, birlikte keşfedelim. Hiç bir otobüste boş koltukları sayıp yeni binen yolcuları ekledin mi? Matematik problemi aslında sayılardan örülü küçük bir yaşam hikâyesidir. Hikâyenin içindeki ipuçlarını yakalayıp doğru işlemi seçtiğinde hiçbir problem seni zorlayamaz.",
  concept:
    "Doğal sayı probleminde, önce ne sorulduğunu tek bir duru cümleyle söylersin. Artma ve ekleme durumları toplama işlemi ister. Azalma ve harcama durumları çıkarma işlemi ister. Eşit pay ve katlama durumları çarpma işlemi ister. Eşit paylaştırma ise bölme işlemi ister. Şurası aklında kalsın tamam mı: Bulduğun sonucu yalnız kuru bir sayı olarak bırakma. Sorunun senden istediği birimi de sayının yanına mutlaka ekle.",
  example:
    "Bir sınıfta 18 öğrenci vardır. Sınıfa 6 öğrenci daha katılırsa yeni mevcut ne olur? Burada sorulan, yeni öğrenci sayısıdır. 18 artı 6, 24 eder; yani sonuç 24 öğrencidir. Aynı sınıftan 5 öğrenci ayrılırsa 24 eksi 5, 19 öğrenci kalır. Şimdi de 4 sıra ve her sırada 7 kitap olduğunu düşünelim. Toplam kitap sayısı 4 çarpı 7, yani 28 kitaptır. Bu 28 kitabı 4 öğrenci eşit paylaşırsa, her biri 28 bölü 4, yani 7 kitap alır. Gördüğün gibi 4 sıra 7 kitap, 4 artı 7 demek değildir.",
  hint: "trap",
  warning:
    "Sorudaki her sayıyı görür görmez hemen toplamaya kalkışmak çok yaygın bir tuzaktır. Örneğin 4 sıra ve her sırada 7 kitap varken, 4 ile 7'yi toplayıp 11 kitap diyemeyiz. Sıra sayısı ile bir sıradaki kitap sayısını çarpmamız gerekir. İşleme başlamadan önce sorunun senden ne istediğini bir kez daha sakince oku.",
  life:
    "Bunu mutfak alışverişinde de kullanırsın. 12 yumurta vardı. 5 tanesini kahvaltıda kullandın. Kalan 12 eksi 5, yani 7 yumurtadır. Yarın her biri 6 yumurtalık iki kutu alırsan 2 çarpı 6, 12 yumurta daha gelir. Elindeki 7 ile yeni 12'yi toplarsan 19 yumurta olur.",
  recap: [
    "Problemde önce sorulan iş seçilir. Artma toplama, azalma çıkarma ister.",
    "Eşit gruplar çarpma ister. Eşit paylaşım bölme ister.",
    "4 çarpı 7, 28 eder. 4 artı 7, bu sorunun sonucu değildir.",
  ],
  conceptSeal: "Doğal sayı problemi, doğru işlemi hikâyedeki işe bağlar.",
  voiceSeal: "Ne sorulduğunu, hangi işlemi seçtiğini ve birimi söylersin.",
  outcomes: [
    "Artma toplama, azalma çıkarma ile çözülür.",
    "Eşit gruplar çarpılır, eşit paylaşım bölünür.",
    "Sonuç, sorunun birimiyle söylenir.",
  ],
  scene: "number-ops",
  parentNote:
    "Çocuğunuz problemde önce sorulanı söyler, sonra işlemi seçer. Evde 18 artı 6 öğrenciyi 24, 4 sıra 7 kitabı 28 diye çözmek yeter. 4 artı 7 bu sorunun yanıtı değildir.",

};

export const JUNIOR_MAT_4 = juniorLessonFromScenario(JUNIOR_MAT_4_SCENARIO);
