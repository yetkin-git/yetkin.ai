import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Cebirsel ifadede algoritma. */
export const JUNIOR_MAT_29_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-29",
  title: "Cebirsel ifadede algoritma",
  teaser: "Algoritma, adımları belli bir işlemdir. Kavramsal Anlayış, bilinmeyene önce işlem sırasını uygulamaktır. İfade Gücü, 2x artı 6 ifadesini x yerine 4 koyarak sonuçlandırmaktır.",
  welcome: "Merhaba sevgili çocuklar! Bugün bir cebirsel ifadeyi adım adım işleyeceğiz. Okul tarifindeki sıra, yemeği rastgele karıştırmamaktır. Cebirde de önce hangi işlem varsa o sıra durur.",
  concept: "Algoritma, aynı tür ifadede hep aynı sırayla yapılan adımdır. Önce parantez ve çarpma, sonra toplama gelir. Bilinmeyenin yerine sayı konunca model sayıya döner. 2x artı 6 ifadesinde x yerine 4 koyarsan önce 2 çarpı 4, sonra 6 eklenir.",
  example: "x yerine 4 koyalım. 2 çarpı 4, 8 eder. 8 artı 6, 14 eder. x yerine 5 koyunca 2 çarpı 5, 10 eder. 10 artı 6, 16 eder. Aynı algoritma iki farklı sayı için iki sonuç verir. İfade değişmez, girdi değişir.",
  hint: "gold",
  warning: "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. 2x artı 6 ifadesinde 2 ile 6'yı önce toplamak algoritmayı bozar. Çarpma, toplamadan önce gelir. x yerine sayı koymadan 2x'i 2 artı x sanma.",
  life: "Bunu okul bahçesindeki bilet sırasında görürsün. Kutudan her çocuğa 2 kalem ve bir de 6 çıkartma verilirse adım hep aynıdır. Çocuk sayısı değişir, kural değişmez.",
  recap: [
    "Algoritma, ifadenin sabit işlem sırasıdır.",
    "Önce çarpma, sonra toplama yapılır.",
    "Bilinmeyenin yerine sayı konunca sonuç çıkar.",
  ],
  conceptSeal: "Aynı ifade, aynı adım sırasıyla işlenir. Değişen şey girdidir.",
  voiceSeal: "x yerine 4 koyunca 2x artı 6 ifadesinin 14 ettiğini adım adım dersin.",
  outcomes: [
    "Algoritma işlem sırasıdır.",
    "Çarpma toplamadan önce gelir.",
    "Bilinmeyen yerine konan sayı sonucu değiştirir.",
    "Cebirsel ifadede algoritma kuralı bu derste yeni bir istisna açmaz.",
    "29 numaralı örnek, ikinci bir kurala dönüşmez.",
    "Okul defterindeki adım, bahçedeki ölçümle aynı kuralı taşır.",
  ],
  scene: "algebra",
  parentNote: "Çocuğunuz 2x artı 6 için x yerine 4 koyup 14 bulur. Önce 2 ile 6'yı toplamaz. x'i 2 artı x diye açmaz.",
};

export const JUNIOR_MAT_29 = juniorLessonFromScenario(JUNIOR_MAT_29_SCENARIO);
