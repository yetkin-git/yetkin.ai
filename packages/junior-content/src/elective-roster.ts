/**
 * Seçmeli quiz yazar dosyası. Çekirdek `JUNIOR_SEALED_ROSTER` listesine girmez.
 * JSON, `export:junior-content` ile `lib/junior/quiz/elective/<ders>/<n>.ts` dosyasından basılır.
 */
export const JUNIOR_ELECTIVE_QUIZ_ROSTER = [
  { dir: "ing", prefix: "jr_06_ing", numbers: [1, 2] },
  { dir: "alm", prefix: "jr_06_alm", numbers: [1, 2] },
  { dir: "fra", prefix: "jr_06_fra", numbers: [1, 2] },
  { dir: "siyer", prefix: "jr_06_siyer", numbers: [1, 2] },
  { dir: "kod", prefix: "jr_06_kod", numbers: [1, 2] },
  { dir: "arp", prefix: "jr_06_arp", numbers: [1, 2] },
] as const;
