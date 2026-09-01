/**
 * Canva Masterclass (CNV-MC) — marka kalıbı laboratuvarı.
 * Fail-closed kapı; kitsiz şablon, PII’li Magic, RGB baskı yok.
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

export const CANVA_MASTERCLASS_PRACTICE: Record<string, AcademyLessonPractice> = {
  "canva-masterclass-1": pack(
    [
      ["logo", "korumalı alan"],
      ["hex", "#RRGGBB"],
      ["tipo", "iki aile"],
      ["yasak", "boş palet"],
    ],
    [
      "kitAc ile logo + hex yaz.",
      "Boş hex’te throw yaz.",
      "Üçüncü süs fontunu basma.",
    ],
    "ts",
    `function kitAc(girdi) {
  if (!girdi.logo) throw new Error("logo yok; kalıp durur");
  if (!/^#[0-9A-Fa-f]{6}$/u.test(String(girdi.hex).trim())) throw new Error("hex yok; renk uydurulmaz");
  if (!String(girdi.baslikFont).trim() || !String(girdi.govdeFont).trim()) throw new Error("tipo yok; kalıp durur");
  return "acik";
}
if (kitAc({ logo: true, hex: "#1A365D", baslikFont: "Inter", govdeFont: "Source Serif" }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "canva-masterclass-2": pack(
    [
      ["post", "1:1"],
      ["reels", "9:16"],
      ["CTA", "1"],
      ["yasak", "üç çağrı"],
    ],
    [
      "kareAc ile boy + kit yaz.",
      "Yanlış boyda throw yaz.",
      "CTA 1 değilse durdur.",
    ],
    "ts",
    `function kareAc(girdi) {
  const dogru = girdi.is === "post" ? "1:1" : "9:16";
  if (girdi.boy !== dogru) throw new Error("boy yanlış; teslim durur");
  if (!girdi.kit) throw new Error("kalıp yok; kare durur");
  if (!Number.isInteger(girdi.cta) || girdi.cta !== 1) throw new Error("CTA tek durur");
  return "acik";
}
if (kareAc({ is: "reels", boy: "9:16", cta: 1, kit: true }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "canva-masterclass-3": pack(
    [
      ["ızgara", "nefes"],
      ["punto", "11+"],
      ["bleed", "3 mm"],
      ["yasak", "taşan metin"],
    ],
    [
      "kagitAc ile punto + pay yaz.",
      "Tasmada throw yaz.",
      "Bleed 3 mm altını durdur.",
    ],
    "ts",
    `function kagitAc(girdi) {
  if (girdi.tasma) throw new Error("metin taşar; teslim durur");
  if (!Number.isFinite(girdi.punto) || girdi.punto < 11) throw new Error("punto küçük; okunmaz");
  if (!Number.isFinite(girdi.bleedMm) || girdi.bleedMm < 3) throw new Error("pay yok; baskı durur");
  return "acik";
}
if (kagitAc({ tasma: false, punto: 12, bleedMm: 3 }) !== "acik") throw new Error("sözleşme kırıldı");`,
  ),
  "canva-masterclass-4": pack(
    [
      ["Magic", "taslak"],
      ["lisans", "net"],
      ["PII", "yasak"],
      ["yasak", "ham ses"],
    ],
    [
      "magicOnay ile lisans + kit yaz.",
      "PII true iken throw yaz.",
      "Ham metni ses sayma.",
    ],
    "ts",
    `function magicOnay(girdi) {
  if (girdi.pii) throw new Error("PII tarife girmez; üretim durur");
  if (girdi.lisans !== "net") throw new Error("lisans yok; görsel durur");
  if (girdi.hamMetin) throw new Error("ham Magic ses değildir");
  if (!girdi.kit) throw new Error("kalıp yok; taslak durur");
  return "taslak";
}
if (magicOnay({ pii: false, lisans: "net", hamMetin: false, kit: true }) !== "taslak") throw new Error("sözleşme kırıldı");`,
  ),
  "canva-masterclass-5": pack(
    [
      ["web", "sRGB"],
      ["baskı", "CMYK"],
      ["dpi", "300"],
      ["yasak", "RGB matbaa"],
    ],
    [
      "teslimAc ile profil yaz.",
      "Baskıda sRGB throw yaz.",
      "72 dpi’yi durdur.",
    ],
    "ts",
    `function teslimAc(girdi) {
  if (girdi.is === "baski") {
    if (girdi.profil !== "CMYK") throw new Error("RGB baskı durur");
    if (girdi.dpi < 300) throw new Error("dpi düşük; baskı durur");
    if (girdi.bleedMm < 3) throw new Error("pay yok; baskı durur");
  }
  if (girdi.is === "web" && girdi.profil !== "sRGB") throw new Error("web sRGB ister");
  return "ok";
}
if (teslimAc({ is: "baski", profil: "CMYK", dpi: 300, bleedMm: 3 }) !== "ok") throw new Error("sözleşme kırıldı");`,
  ),
  "canva-masterclass-6": pack(
    [
      ["kit", "hex"],
      ["format", "boy"],
      ["AI", "lisans"],
      ["yasak", "RGB baskı"],
    ],
    [
      "paket ile dört kapıyı yaz.",
      "Biri boşken throw yaz.",
      "Hepsi durunca hazir bas.",
    ],
    "ts",
    `function paket(girdi) {
  if (!/^#[0-9A-Fa-f]{6}$/u.test(String(girdi.hex).trim())) throw new Error("hex yok; kalıp durur");
  if (!girdi.boyDogru) throw new Error("boy yanlış; kare durur");
  if (girdi.lisans !== "net") throw new Error("lisans yok; görsel durur");
  if (girdi.baski && girdi.profil !== "CMYK") throw new Error("RGB baskı durur");
  return "hazir";
}
if (paket({ hex: "#1A365D", boyDogru: true, lisans: "net", baski: true, profil: "CMYK" }) !== "hazir") throw new Error("sözleşme kırıldı");`,
  ),
};
