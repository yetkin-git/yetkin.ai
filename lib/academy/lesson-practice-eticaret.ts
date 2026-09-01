/**
 * E-Ticaret Masterclass (ETIC-MC) — pazar yeri laboratuvarı.
 * Fail-closed kapı; belgesiz mağaza, stoksuz satış, fişsiz teslim yok.
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

export const ETICARET_MASTERCLASS_PRACTICE: Record<string, AcademyLessonPractice> = {
  "eticaret-masterclass-1": pack(
    [
      ["tezgâh", "pazar yeri vitrini"],
      ["vergi", "zorunlu"],
      ["stok", "> 0"],
      ["yasak", "stoksuz satış"],
    ],
    [
      "tezgahAc ile vergi + kargo + stok yaz.",
      "Stok 0 iken throw yaz.",
      "Komisyonsuz kâr basma.",
    ],
    "ts",
    `function tezgahAc(girdi) {
  if (!String(girdi.vergiNo).trim()) throw new Error("vergi yok; tezgâh durur");
  if (!girdi.kargoSozlesme) throw new Error("kargo yok; tezgâh durur");
  if (!Number.isInteger(girdi.stok) || girdi.stok <= 0) throw new Error("stok yok; ilan durur");
  return "acik";
}
if (tezgahAc({ vergiNo: "1234567890", kargoSozlesme: true, stok: 8 }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "eticaret-masterclass-2": pack(
    [
      ["vergi", "unvan"],
      ["IBAN", "TR + 24"],
      ["kargo", "sözleşme"],
      ["yasak", "sözlü kurye"],
    ],
    [
      "magazaAc ile dörtlüyü yaz.",
      "Boş IBAN’da throw yaz.",
      "Kargosuz kaydı durdur.",
    ],
    "ts",
    `function magazaAc(girdi) {
  if (!String(girdi.vergiNo).trim() || !String(girdi.unvan).trim()) throw new Error("vergi/unvan yok; mağaza durur");
  if (!/^TR[0-9]{24}$/u.test(String(girdi.iban).replace(/\\s/gu, ""))) throw new Error("IBAN yok; ödeme durur");
  if (!girdi.kargoSozlesme) throw new Error("kargo yok; mağaza durur");
  return "acik";
}
if (magazaAc({ vergiNo: "1234567890", unvan: "Tezgah Ltd", iban: "TR110006400000111111111111", kargoSozlesme: true }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "eticaret-masterclass-3": pack(
    [
      ["başlık", "marka + nitelik"],
      ["barkod", "GTIN"],
      ["görsel", "sahip"],
      ["yasak", "çalıntı fotoğraf"],
    ],
    [
      "ilanAc ile başlık ve barkod yaz.",
      "Boş GTIN’de throw yaz.",
      "Çalıntı görselde ilan durur.",
    ],
    "ts",
    `function ilanAc(girdi) {
  const baslik = String(girdi.baslik).trim();
  if (baslik.length < 12 || baslik.length > 80) throw new Error("başlık yok; ilan durur");
  if (!/^\\d{8,14}$/u.test(String(girdi.barkod).trim())) throw new Error("barkod yok; ilan durur");
  if (!String(girdi.kategori).trim()) throw new Error("kategori yok; ilan durur");
  if (!girdi.gorselSahip) throw new Error("görsel çalıntı; ilan durur");
  return "acik";
}
if (ilanAc({ baslik: "Marka Pamuk Tişört M Beyaz", barkod: "8690123456789", kategori: "giyim", gorselSahip: true }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "eticaret-masterclass-4": pack(
    [
      ["merkez", "tek defter"],
      ["rezerv", "düşer"],
      ["taban", "maliyet + komisyon"],
      ["yasak", "oversell"],
    ],
    [
      "stokSat ile kalanı yaz.",
      "Rezerv doluyken throw yaz.",
      "Taban altı fiyatı durdur.",
    ],
    "ts",
    `function stokSat(girdi) {
  if (!Number.isInteger(girdi.merkez) || girdi.merkez < 0) throw new Error("stok yok; satış durur");
  const kalan = girdi.merkez - girdi.rezerv;
  if (kalan <= 0) throw new Error("rezerv dolu; oversell yok");
  if (!Number.isInteger(girdi.fiyatKurus) || girdi.fiyatKurus < girdi.tabanKurus) throw new Error("fiyat taban altında; ilan durur");
  return kalan - 1;
}
if (stokSat({ merkez: 3, rezerv: 0, fiyatKurus: 19900, tabanKurus: 12000 }) !== 2) throw new Error("sözleşme kırıldı");`,
  ),
  "eticaret-masterclass-5": pack(
    [
      ["takip", "zorunlu"],
      ["SLA", "24 saat"],
      ["iade", "ürün önce"],
      ["yasak", "fişsiz teslim"],
    ],
    [
      "teslimBas ile takip yaz.",
      "Boş fişte throw yaz.",
      "Ürünsüz para iadesini durdur.",
    ],
    "ts",
    `function teslimBas(girdi) {
  if (!String(girdi.takipNo).trim()) throw new Error("takip yok; teslim durur");
  if (girdi.mesajSaat > 24) throw new Error("SLA aşıldı; puan durur");
  if (girdi.iadeKayit && !girdi.iadeUrun) throw new Error("ürün yok; para iadesi durur");
  return "ok";
}
if (teslimBas({ takipNo: "TR1234567890", mesajSaat: 4, iadeKayit: false, iadeUrun: false }) !== "ok") throw new Error("sözleşme kırıldı");`,
  ),
  "eticaret-masterclass-6": pack(
    [
      ["mağaza", "vergi"],
      ["liste", "barkod"],
      ["stok", "> 0"],
      ["yasak", "fişsiz teslim"],
    ],
    [
      "vitrin ile dört kapıyı yaz.",
      "Biri boşken throw yaz.",
      "Hepsi durunca hazir bas.",
    ],
    "ts",
    `function vitrin(girdi) {
  if (!String(girdi.vergiNo).trim()) throw new Error("vergi yok; mağaza durur");
  if (!/^\\d{8,14}$/u.test(String(girdi.barkod).trim())) throw new Error("barkod yok; ilan durur");
  if (!Number.isInteger(girdi.stok) || girdi.stok <= 0) throw new Error("stok yok; satış durur");
  if (!String(girdi.takipNo).trim()) throw new Error("takip yok; teslim durur");
  return "hazir";
}
if (vitrin({ vergiNo: "1234567890", barkod: "8690123456789", stok: 8, takipNo: "TR1" }) !== "hazir") throw new Error("sözleşme kırıldı");`,
  ),
};
