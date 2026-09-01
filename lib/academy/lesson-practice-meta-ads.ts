/**
 * Meta Ads Masterclass (META-MC) — bütçe laboratuvarı.
 * Fail-closed kapı; pikselsiz harcama, beğeni Lookalike, event_id’siz CAPI, kör ROAS yok.
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

export const META_ADS_MASTERCLASS_PRACTICE: Record<string, AcademyLessonPractice> = {
  "meta-ads-masterclass-1": pack(
    [
      ["sayfa", "bağlı"],
      ["piksel", "hazır"],
      ["fatura", "açık"],
      ["yasak", "pikselsiz harcama"],
    ],
    [
      "vitrinAc ile sayfa + piksel + fatura yaz.",
      "Piksel kapalıyken throw yaz.",
      "Sayfa yokken hesap durur.",
    ],
    "ts",
    `function vitrinAc(girdi) {
  if (!girdi.sayfa) throw new Error("sayfa yok; hesap durur");
  if (!girdi.piksel) throw new Error("piksel yok; harcama durur");
  if (!girdi.fatura) throw new Error("fatura yok; hesap durur");
  return "acik";
}
if (vitrinAc({ sayfa: true, piksel: true, fatura: true }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "meta-ads-masterclass-2": pack(
    [
      ["kaynak", "purchase"],
      ["n", "100+"],
      ["piksel", "hazır"],
      ["yasak", "beğeni Lookalike"],
    ],
    [
      "kitleAc ile purchase kaynağını yaz.",
      "Beğeni kaynağında throw yaz.",
      "Piksel yokken kitle durur.",
    ],
    "ts",
    `function kitleAc(girdi) {
  if (!girdi.piksel) throw new Error("piksel yok; kitle durur");
  if (girdi.kaynak !== "purchase") throw new Error("kaynak zayıf; benzer durur");
  if (girdi.n < 100) throw new Error("kaynak dar; benzer durur");
  return "benzer";
}
if (kitleAc({ piksel: true, kaynak: "purchase", n: 400 }) !== "benzer") throw new Error("sözleşme kırıldı");`,
  ),
  "meta-ads-masterclass-3": pack(
    [
      ["format", "reels | görsel | atlıkarınca"],
      ["adet", "1–5"],
      ["piksel", "purchase"],
      ["yasak", "beğeni kazanan"],
    ],
    [
      "kreatifTest ile Reels yaz.",
      "Piksel yokken throw yaz.",
      "Adet 0 iken test durur.",
    ],
    "ts",
    `function kreatifTest(girdi) {
  if (!girdi.piksel) throw new Error("piksel yok; test durur");
  if (girdi.adet < 1 || girdi.adet > 5) throw new Error("yüz sayısı; test durur");
  return girdi.format;
}
if (kreatifTest({ piksel: true, adet: 3, format: "reels" }) !== "reels") throw new Error("sözleşme kırıldı");`,
  ),
  "meta-ads-masterclass-4": pack(
    [
      ["piksel", "tarayıcı"],
      ["CAPI", "sunucu"],
      ["event_id", "dedup"],
      ["yasak", "değersiz ROAS"],
    ],
    [
      "olcuDogrula ile piksel + CAPI + id yaz.",
      "Boş event_id’de throw yaz.",
      "Değer 0 iken ROAS durur.",
    ],
    "ts",
    `function olcuDogrula(girdi) {
  if (!girdi.piksel || !girdi.capi) throw new Error("piksel/CAPI yok; harcama durur");
  if (!String(girdi.eventId).trim()) throw new Error("event_id yok; çift sayım durur");
  if (!(girdi.deger > 0)) throw new Error("değer yok; ROAS uydurulmaz");
  return "hazir";
}
if (olcuDogrula({ piksel: true, capi: true, eventId: "e-9", deger: 990 }) !== "hazir") throw new Error("sözleşme kırıldı");`,
  ),
  "meta-ads-masterclass-5": pack(
    [
      ["CBO", "kampanya cüzdanı"],
      ["ABO", "set kasası"],
      ["öğrenme", "%20 tavan"],
      ["yasak", "değersiz ROAS / %50 artış"],
    ],
    [
      "butceAc ile CBO yaz.",
      "Öğrenmede %50 artışta throw yaz.",
      "Değer 0 iken ROAS durur.",
    ],
    "ts",
    `function butceAc(girdi) {
  if (!girdi.piksel || !(girdi.deger > 0)) throw new Error("ROAS uydurulmaz");
  if (girdi.ogrenme && girdi.artisYuzde > 20) throw new Error("öğrenme kırılır; ölçek durur");
  return girdi.ogrenme ? "abo" : "cbo";
}
if (butceAc({ piksel: true, deger: 990, ogrenme: false, artisYuzde: 10 }) !== "cbo") throw new Error("sözleşme kırıldı");`,
  ),
  "meta-ads-masterclass-6": pack(
    [
      ["ölçü", "piksel + CAPI"],
      ["kaynak", "purchase"],
      ["öğrenme", "%20"],
      ["yasak", "beğeni kaynağı / kör ROAS"],
    ],
    [
      "huniTeslim dört kapıyı aç.",
      "Beğeni kaynağında throw yaz.",
      "event_id boşken throw yaz.",
    ],
    "ts",
    `function huniTeslim(girdi) {
  if (!girdi.piksel || !girdi.capi || !String(girdi.eventId).trim()) throw new Error("ölçü yok; harcama durur");
  if (girdi.kaynak !== "purchase") throw new Error("kaynak zayıf");
  if (girdi.ogrenme && girdi.artisYuzde > 20) throw new Error("öğrenme kırılır");
  if (!(girdi.deger > 0)) throw new Error("ROAS uydurulmaz");
  return "hazir";
}
if (huniTeslim({ piksel: true, capi: true, eventId: "e-1", kaynak: "purchase", ogrenme: false, artisYuzde: 0, deger: 990 }) !== "hazir") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
};
