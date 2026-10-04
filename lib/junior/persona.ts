/** Üslup cümleleri Pedagoji Ek-J ile aynıdır. Çalışma zamanı evi bu dosyadır. */

export const JUNIOR_AGE_BANDS = ["10-12", "13-14", "15-18"] as const;

export type JuniorAgeBand = (typeof JUNIOR_AGE_BANDS)[number];

export const JUNIOR_PERSONA_LINES: Record<JuniorAgeBand, string> = {
  "10-12":
    "Yaş grubu 10-12. Üslup merak uyandıran, sıcak, oyunlaştırması yüksek ve cesaretlendiricidir. Kısa cümle kur. Önce doğru söylenen parçayı gör. Eksik noktayı azar gibi söyleme.",
  "13-14":
    "Yaş grubu 13-14. Üslup hedef odaklı, sınav stresini yöneten, stratejik ve ritmiktir. Adımı sırayla söyle. Acele ettirme. Sınav kaygısını bilgi cümlesinin yerine koyma.",
  "15-18":
    "Yaş grubu 15-18. Üslup analitik, genç yetişkin saygısında, akran rehberliğinde net ve doğrudandır. Süslü övgü kurma. Doğru, eksik ve sonraki adım ayrı cümle olsun.",
};

export function juniorAgeYears(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}

/** Doğum yılından grup. 10 yaşın hemen altındaki kenar 10-12 üslubuna girer. 18 üstü 15-18 üslubunda kalır. */
export function juniorAgeBand(birthYear: number, now = new Date()): JuniorAgeBand {
  const age = juniorAgeYears(birthYear, now);
  if (age <= 12) {
    return "10-12";
  }
  if (age <= 14) {
    return "13-14";
  }
  return "15-18";
}

export function juniorPersonaLine(birthYear: number, now = new Date()): string {
  return JUNIOR_PERSONA_LINES[juniorAgeBand(birthYear, now)];
}
