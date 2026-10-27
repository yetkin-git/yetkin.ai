/**
 * Pedagojik keşif katmanı (Görev Paketi #02, ADIM 2.2).
 *
 * "Dinle → tekrarla" hattına, kural söylenmeden önce öğrencinin örüntüyü
 * kendisinin fark etmesini isteyen mikro-etkileşimler ekler.
 * Her kart: önce bir sayı verilir, öğrenci tahmin eder, sonra yönlendirici
 * ipucu açılır. Cevap sunucuda puanlanmaz; bu katman merak ve genelleme
 * içindir (Maarif süreç bileşeni: varsayım kur → örüntüyü genelle).
 * Mühürlü ses metni değişmez; keşif, filmden önce/sonra okunan sessiz karttır.
 */

export type JuniorDiscoveryPrompt = {
  id: string;
  /** Ölçtüğü bölünebilme kuralı. */
  rule: "2" | "3" | "4" | "5" | "6" | "9" | "10";
  /** Öğrenciye sorulan keşif sorusu (kural adı verilmez). */
  prompt: string;
  /** Tahminden sonra açılan yönlendirici ipucu. */
  hint: string;
  /** İpucu sonrası genelleme cümlesi (öğrencinin kendi cümlesiyle karşılaştırması için). */
  reveal: string;
};

export const MAT5_DISCOVERY_PROMPTS: readonly JuniorDiscoveryPrompt[] = [
  {
    id: "kesif-2",
    rule: "2",
    prompt: "14, 27, 348 ve 51 sayılarına bak. Hangileri ikişerli gruplara hiç artmadan ayrılır? Ortak noktaları ne olabilir?",
    hint: "Sayıların en son rakamına bak. Çift olanlar hangileri?",
    reveal: "Son rakamı çift (0, 2, 4, 6, 8) olan sayılar 2'ye kalansız bölünür. Kuralı son rakam söyler.",
  },
  {
    id: "kesif-3",
    rule: "3",
    prompt: "123 ve 124'ü düşün. Biri 3'e tam bölünür, biri bölünmez. Rakamlarını toplayıp farkı bulabilir misin?",
    hint: "1+2+3 ile 1+2+4'ü karşılaştır. Hangisi 3'ün katı?",
    reveal: "Rakamları toplamı 3'ün katı olan sayılar 3'e kalansız bölünür.",
  },
  {
    id: "kesif-4",
    rule: "4",
    prompt: "116'yı 4'e bölmek için sayının tamamına bakmak zorunda mısın? 100'ün 4'e bölündüğünü bilmek işini nasıl kısaltır?",
    hint: "116 = 100 + 16 diye ayır. Karar hangi parçada?",
    reveal: "100, 4'e tam bölündüğü için karar son iki basamaktadır; son iki basamak 4'e bölünürse sayı da bölünür.",
  },
  {
    id: "kesif-5-10",
    rule: "5",
    prompt: "245 ve 240 sayılarının son rakamları ne söylüyor? İkisi de 5'e bölünür mü, 10'a bölünen hangisi?",
    hint: "Biri 5 ile, biri 0 ile bitiyor. 10 için son rakam ne olmalı?",
    reveal: "Sonu 0 veya 5 olanlar 5'e, sonu yalnız 0 olanlar 10'a kalansız bölünür.",
  },
  {
    id: "kesif-9",
    rule: "9",
    prompt: "729'un rakamlarını topla. Bulduğun sayı sana 3 kuralını hatırlatıyor mu; farkı ne olabilir?",
    hint: "7+2+9 = 18. Bu kez toplamın hangi sayının katı olması gerekir?",
    reveal: "Rakamları toplamı 9'un katı olan sayılar 9'a kalansız bölünür.",
  },
  {
    id: "kesif-6",
    rule: "6",
    prompt: "24 hem çift hem de rakam toplamı 6. 15 ise 3'e bölünür ama tek sayıdır. İkisinden hangisi 6'ya bölünür, neden?",
    hint: "6'ya bölünmek için iki kapıdan birden geçmek gerekir. Kapılar hangileri?",
    reveal: "6 kuralı çifte koşuldur: sayı hem 2'ye hem 3'e aynı anda bölünmelidir.",
  },
  {
    id: "kesif-10",
    rule: "10",
    prompt: "30 sayısı sence kaç kuralı birden sağlar? Önce tahmin et, sonra son rakam ve rakam toplamıyla tek tek denetle.",
    hint: "Son rakam 0; rakam toplamı 3. 2, 5, 10, 3 ve 6'yı sırayla dene.",
    reveal: "30; 2, 3, 5, 6 ve 10'un beşine de bölünür. Kuralları birleştirmek dedektifin en güçlü hamlesidir.",
  },
] as const;

export function discoveryPromptsForLesson(lessonKey: string): readonly JuniorDiscoveryPrompt[] {
  return lessonKey === "jr_06_mat-1" ? MAT5_DISCOVERY_PROMPTS : [];
}
