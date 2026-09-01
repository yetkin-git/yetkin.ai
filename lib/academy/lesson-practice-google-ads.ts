/**
 * Google Ads Masterclass (GADS-MC) — bütçe laboratuvarı.
 * Fail-closed kapı; dönüşümsüz harcama, geniş eşleme, karışık ağ, kırık etiket yok.
 */

import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";

function pack(
  params: ReadonlyArray<readonly [string, string]>,
  steps: readonly string[],
  language: string,
  source: string,
): AcademyLessonPractice {
  return {
    params: params.map(([label, value]) => ({ label, value })),
    steps,
    code: { language, source: source.trim() },
  };
}

export const GOOGLE_ADS_MASTERCLASS_PRACTICE: Record<string, AcademyLessonPractice> = {
  "google-ads-masterclass-1": pack(
    [
      ["dönüşüm", "eylem adı"],
      ["fatura", "açık"],
      ["kat", "hesap > kampanya"],
      ["yasak", "dönüşümsüz harcama"],
    ],
    [
      "kampanyaAc ile dönüşüm + fatura yaz.",
      "Boş dönüşümde throw yaz.",
      "Fatura kapalıyken hesap durur.",
    ],
    "ts",
    `function kampanyaAc(girdi) {
  if (!String(girdi.donusumEylemi).trim()) throw new Error("dönüşüm yok; harcama durur");
  if (!girdi.fatura) throw new Error("fatura yok; hesap durur");
  return "acik";
}
if (kampanyaAc({ donusumEylemi: "satin_alma", fatura: true }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "google-ads-masterclass-2": pack(
    [
      ["eşleme", "tam / sıralı / geniş"],
      ["dönüşüm30", "30"],
      ["negatif", "liste"],
      ["yasak", "dönüşümsüz geniş"],
    ],
    [
      "eslemeAc ile tam eşlemeyi yaz.",
      "Geniş + 0 dönüşümde throw yaz.",
      "Negatifsiz geniş durur.",
    ],
    "ts",
    `function eslemeAc(esleme, donusum30, negatif) {
  if (esleme === "genis") {
    if (donusum30 < 30) throw new Error("dönüşüm yok; geniş durur");
    if (!negatif) throw new Error("negatif yok; geniş durur");
  }
  return esleme;
}
if (eslemeAc("tam", 0, false) !== "tam") throw new Error("sözleşme kırıldı");`,
  ),
  "google-ads-masterclass-3": pack(
    [
      ["ağ", "arama | görüntülü"],
      ["dönüşüm", "hazır"],
      ["karışık", "yasak"],
      ["yasak", "bakışı satış saymak"],
    ],
    [
      "agAc ile arama kampanyasını yaz.",
      "Karışık ağda throw yaz.",
      "Dönüşümsüz görüntülü durur.",
    ],
    "ts",
    `function agAc(ag, donusum, karisik) {
  if (!donusum) throw new Error("dönüşüm yok; kampanya durur");
  if (karisik) throw new Error("ağ karışır; işlem durur");
  return ag;
}
if (agAc("arama", true, false) !== "arama") throw new Error("sözleşme kırıldı");`,
  ),
  "google-ads-masterclass-4": pack(
    [
      ["GTM", "yayın"],
      ["tetik", "teşekkür"],
      ["sipariş", "id"],
      ["yasak", "ana sayfa tetik"],
    ],
    [
      "etiketDogrula ile GTM + teşekkür + id yaz.",
      "Boş sipariş id’de throw yaz.",
      "Teşekkür yokken dönüşüm uydurma.",
    ],
    "ts",
    `function etiketDogrula(girdi) {
  if (!girdi.gtm) throw new Error("GTM yok; etiket durur");
  if (!girdi.tesekkur) throw new Error("teşekkür yok; dönüşüm uydurulmaz");
  if (!String(girdi.siparisId).trim()) throw new Error("sipariş id yok; çift sayım durur");
  return "hazir";
}
if (etiketDogrula({ gtm: true, tesekkur: true, siparisId: "S-41" }) !== "hazir") throw new Error("sözleşme kırıldı");`,
  ),
  "google-ads-masterclass-5": pack(
    [
      ["QS", "5+"],
      ["başlık", "anahtar"],
      ["dönüşüm", "hazır"],
      ["yasak", "QS 5 altı ölçek"],
    ],
    [
      "kaliteAc ile QS 7 yaz.",
      "QS 3 iken throw yaz.",
      "Boş başlıkta reklam durur.",
    ],
    "ts",
    `function kaliteAc(girdi) {
  if (!String(girdi.baslik).trim()) throw new Error("başlık yok; reklam durur");
  if (!girdi.donusum) throw new Error("dönüşüm yok; ölçek durur");
  if (girdi.qs < 5) throw new Error("kalite düşük; bütçe artmaz");
  return girdi.qs;
}
if (kaliteAc({ qs: 7, donusum: true, baslik: "klima servisi" }) !== 7) throw new Error("sözleşme kırıldı");`,
  ),
  "google-ads-masterclass-6": pack(
    [
      ["ölçü", "dönüşüm + GTM"],
      ["eşleme", "tam / sıralı"],
      ["ağ", "ayrı"],
      ["yasak", "karışık ağ / QS 5 altı"],
    ],
    [
      "kampanyaTeslim dört kapıyı aç.",
      "Geniş + 0 dönüşümde throw yaz.",
      "qs 3 iken throw yaz.",
    ],
    "ts",
    `function kampanyaTeslim(girdi) {
  if (!girdi.donusum || !girdi.etiket) throw new Error("ölçü yok; harcama durur");
  if (girdi.esleme === "genis" && girdi.donusum30 < 30) throw new Error("geniş durur");
  if (girdi.karisikAg) throw new Error("ağ karışır");
  if (girdi.qs < 5) throw new Error("kalite düşük");
  return "hazir";
}
if (kampanyaTeslim({ donusum: true, etiket: true, esleme: "tam", donusum30: 0, karisikAg: false, qs: 7 }) !== "hazir") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
};
