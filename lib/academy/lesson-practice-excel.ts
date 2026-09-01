/**
 * Excel Masterclass (EXC-MC) — formül laboratuvarı.
 * Fail-closed kapı; boş ortalama, yaklaşık VLOOKUP, kimlik SUM, imzasız makro yok.
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

export const EXCEL_MASTERCLASS_PRACTICE: Record<string, AcademyLessonPractice> = {
  "excel-masterclass-1": pack(
    [
      ["hücre", "adres / değer / biçim"],
      ["tartı", "SUM / AVERAGE / COUNT"],
      ["n", "0 ise dur"],
      ["yasak", "boş aralıkta sıfır kâr"],
    ],
    [
      "excelSay ile n’i yaz.",
      "n=0 iken excelOrtalama throw bekler.",
      "Metin ve boşluğun COUNT’a girmediğini doğrula.",
    ],
    "ts",
    `function excelSay(degerler) {
  return degerler.filter((v) => typeof v === "number" && Number.isFinite(v)).length;
}
function excelOrtalama(degerler) {
  const n = excelSay(degerler);
  if (n === 0) throw new Error("n yok; ortalama durur");
  const toplam = degerler.reduce((s, v) => (typeof v === "number" ? s + v : s), 0);
  return toplam / n;
}
if (excelOrtalama([10, 20, "", null]) !== 15) throw new Error("sözleşme kırıldı");`,
  ),
  "excel-masterclass-2": pack(
    [
      ["anahtar", "A-12"],
      ["eşleşme", "tam"],
      ["XLOOKUP", "iki yön"],
      ["yasak", "yaklaşık SKU / boş anahtar"],
    ],
    [
      "caprazAra ile A-12 fiyatını yaz.",
      "Boş anahtarda throw yaz.",
      "Kayıp SKU’da fiyat uydurma.",
    ],
    "ts",
    `function caprazAra(anahtar, kodlar, fiyatlar) {
  const k = String(anahtar).trim();
  if (!k) throw new Error("anahtar yok; arama durur");
  const i = kodlar.findIndex((c) => c === k);
  if (i < 0) throw new Error("tam eşleşme yok; fiyat uydurulmaz");
  return fiyatlar[i];
}
if (caprazAra("A-12", ["A-12", "B-09"], [40, 90]) !== 40) throw new Error("sözleşme kırıldı");`,
  ),
  "excel-masterclass-3": pack(
    [
      ["kimlik", "FaturaNo"],
      ["özet", "SAY"],
      ["tutar", "SUM"],
      ["yasak", "kimlik TOPLA"],
    ],
    [
      "faturaKimligiToplanmaz ile SAY yaz.",
      "Boş kaynakta pivotDeger throw yaz.",
      "Dilimleyici kaynak sütununu doğrula.",
    ],
    "ts",
    `function faturaKimligiToplanmaz(etiket) {
  if (!String(etiket).trim()) throw new Error("alan yok; özet durur");
  if (/no|id|kod/i.test(etiket)) return "say";
  return "topla";
}
function pivotDeger(alan, degerler) {
  if (degerler.length === 0) throw new Error("kaynak yok; özet durur");
  return alan === "say" ? degerler.length : degerler.reduce((s, v) => s + v, 0);
}
if (pivotDeger(faturaKimligiToplanmaz("FaturaNo"), [101, 102]) !== 2) throw new Error("sözleşme kırıldı");`,
  ),
  "excel-masterclass-4": pack(
    [
      ["anahtar", "fatura+satır"],
      ["N/A", "kayıt düşer"],
      ["ayırıcı", "yazılı"],
      ["yasak", "N/A = 0"],
    ],
    [
      "yinelenenDus ile F-1 tek kalsın.",
      "Boş anahtarda throw yaz.",
      "tutarOku «N/A» için throw yaz.",
    ],
    "ts",
    `function yinelenenDus(anahtarlar) {
  const seen = new Set();
  const out = [];
  for (const raw of anahtarlar) {
    const k = String(raw).trim();
    if (!k) throw new Error("anahtar yok; silme durur");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}
if (yinelenenDus(["F-1", "F-1", "F-2"]).join(",") !== "F-1,F-2") throw new Error("sözleşme kırıldı");`,
  ),
  "excel-masterclass-5": pack(
    [
      ["taslak", "Copilot cümlesi"],
      ["eşleşme", "tam / FALSE"],
      ["VBA", "imza"],
      ["yasak", "PII / imzasız makro"],
    ],
    [
      "formulKabul ile =XLOOKUP yaz.",
      "Yaklaşık VLOOKUP throw yaz.",
      "imzasız makroCalistir throw yaz.",
    ],
    "ts",
    `function formulKabul(metin) {
  const t = String(metin).trim();
  if (!t.startsWith("=")) throw new Error("formül yok; yapıştırma durur");
  if (/VLOOKUP\\s*\\(/i.test(t) && !/,\\s*FALSE\\s*\\)\\s*$/i.test(t) && !/,\\s*0\\s*\\)\\s*$/i.test(t)) {
    throw new Error("yaklaşık eşleşme; işlem durur");
  }
  return t;
}
function makroCalistir(imzali) {
  if (!imzali) throw new Error("imza yok; makro durur");
  return "calisir";
}
if (!formulKabul("=XLOOKUP(A2,kod,fiyat)").startsWith("=")) throw new Error("sözleşme kırıldı");`,
  ),
  "excel-masterclass-6": pack(
    [
      ["temizlik", "anahtar + tutar"],
      ["arama", "XLOOKUP tam"],
      ["özet", "dürüst alan"],
      ["yasak", "eski önbellek / kimlik SUM"],
    ],
    [
      "dashboard dört kapıyı aç.",
      "N/A tutarda throw yaz.",
      "yenilendi false iken throw yaz.",
    ],
    "ts",
    `function dashboard(girdi) {
  if (girdi.anahtarlar.some((k) => !String(k).trim())) throw new Error("anahtar yok; işlem durur");
  if (girdi.tutarlar.some((t) => t === "N/A" || t === "")) throw new Error("tutar yok; kayıt düşer");
  if (/no|id|kod/i.test(girdi.alanEtiket) && girdi.alan === "topla") throw new Error("kimlik toplanmaz");
  if (!girdi.yenilendi) throw new Error("önbellek eski; özet durur");
  return "hazir";
}
if (dashboard({ anahtarlar: ["F-1", "F-2"], tutarlar: [40, 90], alanEtiket: "Ciro", alan: "topla", yenilendi: true }) !== "hazir") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
};
