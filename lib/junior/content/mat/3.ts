import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Ortak çarpan ve dağılma özelliği. */
export const JUNIOR_MAT_3_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-3",
  title: "Ortak çarpan ve dağılma",
  teaser:
    "Dağılma, bir çarpımı toplama üzerine yayar. Ortak çarpan parantezine alma ise bu işin tersidir. Kavramsal Anlayış, iki yazımın aynı sayıyı söylediğini görmendir. İfade Gücü, 6 çarpı 8 ile 6 çarpı 5 artı 6 çarpı 3'ün eşit olduğunu anlatmandır.",
  welcome:
    "Selamlar! Bugün seninle çok keyifli bir konuyu keşfedeceğiz, çünkü sayılarla pratik oyunlar oynayacağız. Hiç bir kutudaki bilyeleri iki gözlü bir tepsiye paylaştırdın mı? Kutunun tamamını birden saymak ile gözleri ayrı ayrı saymak aynı sonucu verir. Dağılma özelliği ve ortak çarpan sayesinde büyük işlemleri zihninde kolayca parçalayabileceksin.",
  concept:
    "Dağılma özelliği, bir sayının parantez içindeki toplamla çarpımını iki ayrı çarpıma böler. 6 çarpı, parantez içinde 5 artı 3 demek; 6 çarpı 5 artı 6 çarpı 3 demektir. Ortak çarpan parantezine almak ise bu işlemin geri dönüşüdür. Her iki çarpımda da 6 varsa, 6 sayısı parantezin önüne çıkar. Şurası aklında kalsın tamam mı: Parantezin önündeki sayı, içerideki her bir sayıyla tek tek çarpılır; yalnız ilkiyle çarpılmaz.",
  example:
    "6 çarpı 5, 30 eder. 6 çarpı 3, 18 eder. 30 artı 18 ise 48 eder. Parantezli hâli 6 çarpı 8'dir, çünkü 5 artı 3, 8 eder; 6 çarpı 8 de 48 eder. Gördüğün gibi iki yol da aynı doğru kapıya çıkar. Şimdi 12 artı 18 toplamına bakalım. İki sayıda da 6 çarpanı vardır. 12, 6 çarpı 2'dir; 18 ise 6 çarpı 3'tür. Ortak çarpan 6 olur. 6 parantezinde 2 artı 3 yazdığında, parantez içi 5 eder ve 6 çarpı 5, 30 sonucunu verir.",
  hint: "gold",
  warning:
    "Ortak çarpanı fark ettiğin an parantezin önüne almak işini inanılmaz kolaylaştırır. Örneğin 4 çarpı 7 artı 4 çarpı 2 ifadesinde, ortak olan 4'ü parantez dışına çıkarırsan içeride 7 artı 2 kalır. İçeride yalnız 7'yi bırakırsan 2 dışarıda kalır ve işlem eksik olur. İki çarpımın da aynı ortak çarpanı taşıdığını bir kez kontrol et.",
  life:
    "Bunu piknik sepetinde de kullanırsın. 5 kişilik iki tabak ve 5 kişilik üç bardak, 5 çarpı 2 artı 5 çarpı 3'tür. Ortak çarpan 5'tir. 5 çarpı 5, 25 parça eder. Sepeti bir kez saymak ile tabak ve bardağı ayrı saymak aynı sonuçtur.",
  recap: [
    "Dağılma, çarpımı toplama üzerine yayar. Ortak çarpan, yayılmış çarpımları geri toplar.",
    "Parantezin önündeki sayı, içindeki her sayıya ayrı ayrı çarpılır.",
    "6 çarpı 8 ile 6 çarpı 5 artı 6 çarpı 3 aynı sayıdır. Sonuç 48'dir.",
  ],
  conceptSeal: "Dağılma ve ortak çarpan, aynı çarpımın iki yazılışıdır.",
  voiceSeal: "İki yolu da hesaplayıp sonuçların eşit kaldığını söylersin.",
  outcomes: [
    "Çarpma, toplama üzerine dağılır.",
    "Ortak çarpan parantezin önüne alınır.",
    "İki yazımın sonucu aynıdır.",
  ],
  scene: "distribute",
  parentNote:
    "Çocuğunuz 6 çarpı 8 ile 6 çarpı 5 artı 6 çarpı 3'ün ikisinin de 48 ettiğini anlatır. Evde 12 artı 18'i 6 ortak çarpanıyla 6 çarpı 5 diye yazmak yeter.",

};

export const JUNIOR_MAT_3 = juniorLessonFromScenario(JUNIOR_MAT_3_SCENARIO);
