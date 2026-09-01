/**
 * LinkedIn Masterclass (LNK-MC) — B2B kartvizit laboratuvarı.
 * Fail-closed kapı; slogan All-Star, ICP’siz liste, kopya InMail yok.
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

export const LINKEDIN_MASTERCLASS_PRACTICE: Record<string, AcademyLessonPractice> = {
  "linkedin-masterclass-1": pack(
    [
      ["fotoğraf", "yüz net"],
      ["başlık", "rol + vaat"],
      ["özet", "kanıt"],
      ["yasak", "guru slogan"],
    ],
    [
      "profilAc ile fotoğraf + başlık yaz.",
      "Slogan başlıkta throw yaz.",
      "Kanıtsız All-Star basma.",
    ],
    "ts",
    `function profilAc(girdi) {
  if (!girdi.foto) throw new Error("fotoğraf yok; profil durur");
  const b = String(girdi.baslik).trim();
  if (b.length < 12 || /guru|ninja/i.test(b)) throw new Error("başlık slogan; profil durur");
  if (!girdi.ozetKanit) throw new Error("kanıt yok; All-Star basılmaz");
  return "allstar";
}
if (profilAc({ foto: true, baslik: "B2B satış: ICP net, pipeline dürüst", ozetKanit: true }) !== "allstar") throw new Error("sözleşme kırıldı");`,
  ),
  "linkedin-masterclass-2": pack(
    [
      ["kanca", "ilk satır"],
      ["kanıt", "saha"],
      ["hashtag", "≤ 3"],
      ["yasak", "beğeni avı"],
    ],
    [
      "gonderiAc ile kanca + kanıt yaz.",
      "Tuzak true iken throw yaz.",
      "30 etiketi durdur.",
    ],
    "ts",
    `function gonderiAc(girdi) {
  if (!String(girdi.kanca).trim() || String(girdi.kanca).trim().length < 8) throw new Error("kanca yok; gönderi durur");
  if (!girdi.kanit) throw new Error("kanıt yok; gönderi durur");
  if (!Number.isInteger(girdi.hashtag) || girdi.hashtag > 3) throw new Error("etiket yığını; gönderi durur");
  if (girdi.tuzak) throw new Error("beğeni avı; gönderi durur");
  return "yayin";
}
if (gonderiAc({ kanca: "Pipeline durdu çünkü ICP yoktu.", kanit: true, hashtag: 2, tuzak: false }) !== "yayin") throw new Error("sözleşme kırıldı");`,
  ),
  "linkedin-masterclass-3": pack(
    [
      ["unvan", "ICP"],
      ["sektör", "süzgeç"],
      ["ölçek", "yazılı"],
      ["yasak", "yığın hedef"],
    ],
    [
      "icpKaydet ile dört süzgeci yaz.",
      "Boş unvanda throw yaz.",
      "«herkes» listesini durdur.",
    ],
    "ts",
    `function icpKaydet(girdi) {
  if (!String(girdi.unvan).trim() || !String(girdi.sektor).trim()) throw new Error("ICP yok; liste durur");
  if (!String(girdi.olcek).trim() || !String(girdi.cografi).trim()) throw new Error("ölçek/coğrafya yok; liste durur");
  if (/herkes|tüm cto/i.test(String(girdi.unvan) + " " + String(girdi.sektor))) throw new Error("yığın hedef; liste durur");
  return "liste";
}
if (icpKaydet({ unvan: "satınalma müdürü", sektor: "üretici", olcek: "50-200", cografi: "TR" }) !== "liste") throw new Error("sözleşme kırıldı");`,
  ),
  "linkedin-masterclass-4": pack(
    [
      ["bağlam", "özgün"],
      ["soru", "tek"],
      ["ICP", "önce"],
      ["yasak", "kopya duvar"],
    ],
    [
      "mesajAc ile bağlam + ICP yaz.",
      "Kopya duvarda throw yaz.",
      "İlk cümle teklifi durdur.",
    ],
    "ts",
    `function mesajAc(girdi) {
  if (!girdi.icp) throw new Error("ICP yok; InMail durur");
  if (girdi.kopyaDuvar) throw new Error("kopya duvar; mesaj durur");
  if (girdi.ilkTeklif) throw new Error("ilk cümle satış; mesaj durur");
  if (!girdi.ozgunBaglam) throw new Error("bağlam yok; mesaj durur");
  return "gonder";
}
if (mesajAc({ ozgunBaglam: true, ilkTeklif: false, kopyaDuvar: false, icp: true }) !== "gonder") throw new Error("sözleşme kırıldı");`,
  ),
  "linkedin-masterclass-5": pack(
    [
      ["niş", "tek cümle"],
      ["kanıt", "vaka"],
      ["konu", "1"],
      ["yasak", "kanıtsız unvan"],
    ],
    [
      "konumAc ile niş + kanıt yaz.",
      "Kanıt false iken throw yaz.",
      "Üç nişi durdur.",
    ],
    "ts",
    `function konumAc(girdi) {
  if (!String(girdi.nis).trim() || String(girdi.nis).trim().length < 12) throw new Error("niş yok; marka durur");
  if (!girdi.kanit) throw new Error("kanıt yok; unvan basılmaz");
  if (!Number.isInteger(girdi.konuSayisi) || girdi.konuSayisi !== 1) throw new Error("karışık niş; marka durur");
  return "konum";
}
if (konumAc({ nis: "üretici satınalmaya dürüst pipeline", kanit: true, konuSayisi: 1 }) !== "konum") throw new Error("sözleşme kırıldı");`,
  ),
  "linkedin-masterclass-6": pack(
    [
      ["profil", "fotoğraf"],
      ["içerik", "kanca"],
      ["ICP", "süzgeç"],
      ["yasak", "kopya duvar"],
    ],
    [
      "pipeline ile dört kapıyı yaz.",
      "Biri boşken throw yaz.",
      "Hepsi durunca hazir bas.",
    ],
    "ts",
    `function pipeline(girdi) {
  if (!girdi.foto) throw new Error("fotoğraf yok; profil durur");
  if (!String(girdi.kanca).trim()) throw new Error("kanca yok; gönderi durur");
  if (!girdi.icp) throw new Error("ICP yok; liste durur");
  if (girdi.kopyaDuvar) throw new Error("kopya duvar; mesaj durur");
  return "hazir";
}
if (pipeline({ foto: true, kanca: "ICP yoksa InMail yanar.", icp: true, kopyaDuvar: false }) !== "hazir") throw new Error("sözleşme kırıldı");`,
  ),
};
