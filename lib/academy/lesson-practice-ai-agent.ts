/**
 * AI Agent Temel + Orta + İleri — kod laboratuvarı.
 * Tarayıcı alt kümesi: import / raise / class yok; print + def + if.
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

export const AI_AGENT_TEMEL_PRACTICE: Record<string, AcademyLessonPractice> = {
  "ai-agent-temel-1": pack(
    [
      ["sohbet", "yalnız metin"],
      ["ajan", "araç + durma"],
      ["stok", "Ankara 18"],
      ["yasak", "derece uydurmak"],
    ],
    [
      "sohbet_kutusu ile cümle bas.",
      "ajan_oku(\"Ankara\") ile 18 yazdır.",
      "ajan_oku(\"Mars\") dalında durur yazdır.",
    ],
    "py",
    `STOK = {"Ankara": 18, "Istanbul": 14}

def sohbet_kutusu(soru):
    return "Sanirim hava güzel."

def ajan_oku(sehir):
    if sehir == "Mars":
        return "sehir yok; islem durur"
    return STOK[sehir]

print(sohbet_kutusu("Ankara"))
print(ajan_oku("Ankara"))
print(ajan_oku("Mars"))`,
  ),
  "ai-agent-temel-2": pack(
    [
      ["roman", "yazılım yemez"],
      ["kutu", "durum"],
      ["acil", "SMS gider"],
      ["yasak", "serbest metin"],
    ],
    [
      "durum kutusunu oku.",
      "acil veya normal değilse durur yazdır.",
      "Kutu doluysa durum yazdır.",
    ],
    "py",
    `durum = "acil"
if durum != "acil" and durum != "normal":
    print("durum yok; islem durur")
else:
    print(durum)`,
  ),
  "ai-agent-temel-3": pack(
    [
      ["raf", "ARACLAR sözlüğü"],
      ["hava", "hava_durumu"],
      ["not", "not_yaz"],
      ["yasak", "bilinmeyen ad"],
    ],
    [
      "ARACLAR kaydını aç.",
      "hava_durumu Ankara yazdır.",
      "sil_her_seyi dalında durur yazdır.",
    ],
    "py",
    `STOK = {"Ankara": "18 derece"}
ad = "hava_durumu"
if ad == "sil_her_seyi":
    print("bilinmeyen arac; islem durur")
else:
    print(STOK["Ankara"])
ad = "sil_her_seyi"
if ad == "sil_her_seyi":
    print("bilinmeyen arac; islem durur")`,
  ),
  "ai-agent-temel-4": pack(
    [
      ["kısa", "son N tur"],
      ["uzun", "kelime örtüşmesi"],
      ["eşik", "0.2"],
      ["yasak", "sahte gömme"],
    ],
    [
      "Son 2 turu yazdır.",
      "toplantı kaydını getir.",
      "Eşik altı dalında kaynak yok yazdır.",
    ],
    "py",
    `gecmis = ["merhaba", "ankara stok", "not: toplantı"]
print(gecmis[1])
print(gecmis[2])
kayit = "not: toplantı 14:00"
print(kayit)
esik_alti = "mars kolonisi"
if esik_alti == kayit:
    print(kayit)
else:
    print("kaynak yok; uydurma yok")`,
  ),
  "ai-agent-temel-5": pack(
    [
      ["düşünce", "boşsa dur"],
      ["eylem", "hava veya bitir"],
      ["gözlem", "araç çıktısı"],
      ["tavan", "3 tur"],
    ],
    [
      "Düşünce doluysa hava aracını çağır.",
      "bitir ile yanıt bas.",
      "tur_no > tavan ise durur yazdır.",
    ],
    "py",
    `tavan = 3
tur_no = 1
dusunce = "stok lazim"
eylem = "hava_durumu"
if not dusunce:
    print("dusunce bos; islem durur")
elif tur_no > tavan:
    print("tavan doldu; islem durur")
elif eylem == "bitir":
    print("yanit")
else:
    print("18 derece")
tur_no = 4
if tur_no > tavan:
    print("tavan doldu; islem durur")`,
  ),
  "ai-agent-temel-6": pack(
    [
      ["şema", "niyet + arguman"],
      ["hava", "Ankara stok"],
      ["not", "toplantı"],
      ["yasak", "bilinmeyen niyet"],
    ],
    [
      "niyet hava_durumu ise stok yazdır.",
      "niyet not_yaz ise kayit yazdır.",
      "niyet sil ise durur yazdır.",
    ],
    "py",
    `STOK = {"Ankara": "parcali bulutlu, 18"}
niyet = "hava_durumu"
arguman = "Ankara"
if niyet == "hava_durumu":
    print(STOK[arguman])
elif niyet == "not_yaz":
    print("kayit=1")
else:
    print("bilinmeyen arac; islem durur")
niyet = "sil"
if niyet == "hava_durumu":
    print(STOK[arguman])
else:
    print("bilinmeyen arac; islem durur")`,
  ),
};

export const AI_AGENT_ORTA_PRACTICE: Record<string, AcademyLessonPractice> = {
  "ai-agent-orta-1": pack(
    [
      ["akış", "getir → üret"],
      ["eşik", "0.15"],
      ["kanıt", "Ankara 18 palet"],
      ["yasak", "boş getiri uydurmak"],
    ],
    [
      "Ankara sorusuna 18 palet yazdır.",
      "Mars dalında durur yazdır.",
      "Üretimden önce getiriyi kontrol et.",
    ],
    "py",
    `soru = "Ankara un"
if soru == "Mars kolonisi":
    print("kaynak yok; islem durur")
else:
    print("Kanit: Ankara depo: 18 palet un.")
soru = "Mars kolonisi"
if soru == "Mars kolonisi":
    print("kaynak yok; islem durur")`,
  ),
  "ai-agent-orta-2": pack(
    [
      ["kutu", "koleksiyon"],
      ["ekle", "parça metni"],
      ["sor", "eşik 0.2"],
      ["yasak", "boş kutu doldurmak"],
    ],
    [
      "Boş koleksiyonda durur yazdır.",
      "Ankara parçasını ekle, sor.",
      "Eşik altı Mars dalında durur yazdır.",
    ],
    "py",
    `parcalar = []
if len(parcalar) == 0:
    print("koleksiyon bos; islem durur")
parcalar.append("Ankara depo: 18 palet un.")
print(parcalar[0])
soru = "Mars kolonisi"
if soru == "Mars kolonisi":
    print("esik alti; islem durur")`,
  ),
  "ai-agent-orta-3": pack(
    [
      ["araştırmacı", "kanıt getirir"],
      ["yazar", "yalnız kanıta bakar"],
      ["pas", "ekip(konu)"],
      ["yasak", "boş elle rapor"],
    ],
    [
      "ankara konusunda kanıt yazdır.",
      "Rapor satırını kanıttan bas.",
      "mars dalında durur yazdır.",
    ],
    "py",
    `konu = "ankara"
if konu == "mars":
    print("kanit yok; islem durur")
else:
    kanit = "Ankara depo: 18 palet un."
    print(kanit)
    print("Rapor: " + kanit)
konu = "mars"
if konu == "mars":
    print("kanit yok; islem durur")`,
  ),
  "ai-agent-orta-4": pack(
    [
      ["defter", "ortak durum"],
      ["yaz", "kanit anahtarı"],
      ["oku", "eksikte dur"],
      ["yasak", "boş anahtar uydurmak"],
    ],
    [
      "Eksik anahtarda durur yazdır.",
      "kanit değerini yaz, oku.",
      "Boş değeri reddet.",
    ],
    "py",
    `defter = {}
if "kanit" not in defter:
    print("anahtar yok; islem durur")
defter["kanit"] = "Ankara depo: 18 palet un."
print(defter["kanit"])`,
  ),
  "ai-agent-orta-5": pack(
    [
      ["risk", "gonder"],
      ["kutu", "beklemede"],
      ["kaşe", "onay / red"],
      ["yasak", "sessiz True"],
    ],
    [
      "Onaysız istekte beklemede yazdır.",
      "onay ile gonderildi yazdır.",
      "red dalında durur yazdır.",
    ],
    "py",
    `onay = None
if onay is None:
    print("beklemede")
elif onay == "red":
    print("red; islem durur")
else:
    print("gonderildi")
onay = "onay"
if onay == "onay":
    print("gonderildi")
onay = "red"
if onay == "red":
    print("red; islem durur")`,
  ),
  "ai-agent-orta-6": pack(
    [
      ["raf", "doküman listesi"],
      ["pas", "arastir → yaz"],
      ["kaşe", "onay"],
      ["yasak", "Mars uydurması"],
    ],
    [
      "Ankara parçasını ekle, rapor bas.",
      "Onaysız dalında beklemede yazdır.",
      "Mars dalında durur yazdır.",
    ],
    "py",
    `raf = ["Ankara depo: 18 palet un."]
soru = "Ankara un"
onay = None
if soru == "Mars kolonisi":
    print("kaynak yok; islem durur")
elif onay is None:
    print("beklemede")
    print("Rapor: " + raf[0])
else:
    print(raf[0])
soru = "Mars kolonisi"
if soru == "Mars kolonisi":
    print("kaynak yok; islem durur")`,
  ),
};

export const AI_AGENT_ILERI_PRACTICE: Record<string, AcademyLessonPractice> = {
  "ai-agent-ileri-1": pack(
    [
      ["çizelge", "düğüm → kenar"],
      ["tavan", "4 tur"],
      ["araç", "stok_oku"],
      ["yasak", "kayıp kenar"],
    ],
    [
      "stok_oku ile 18 yazdır.",
      "sil dalında durur yazdır.",
      "Tur tavanını say.",
    ],
    "py",
    `arac = "stok_oku"
adim = 1
if adim > 4:
    print("tur tavani; islem durur")
elif arac != "stok_oku":
    print("kenar yok; islem durur")
else:
    print(18)
arac = "sil"
if arac != "stok_oku":
    print("kenar yok; islem durur")`,
  ),
  "ai-agent-ileri-2": pack(
    [
      ["yansıma", "bir yedek"],
      ["kırık", "zaman asimi"],
      ["yedek", "18"],
      ["yasak", "sonsuz retry"],
    ],
    [
      "stok dalında 18 yazdır.",
      "kirik dalında yedek 18 yazdır.",
      "bilinmeyen hatada durur yazdır.",
    ],
    "py",
    `ad = "stok"
if ad == "stok":
    print(18)
ad = "kirik"
if ad == "kirik":
    print(18)
ad = "yok"
if ad == "yok":
    print("yol yok; islem durur")`,
  ),
  "ai-agent-ileri-3": pack(
    [
      ["liste", "stok_oku"],
      ["tarama", "tarifi yoksay"],
      ["varsayılan", "kilit"],
      ["yasak", "yetkisiz eylem"],
    ],
    [
      "stok_oku ile 18 yazdır.",
      "sil_tablo dalında durur yazdır.",
      "Ezme cümlesinde durur yazdır.",
    ],
    "py",
    `ad = "stok_oku"
metin = "Ankara stok"
if metin == "tarifi yoksay":
    print("enjeksiyon; islem durur")
elif ad != "stok_oku":
    print("yetkisiz eylem; islem durur")
else:
    print(18)
ad = "sil_tablo"
if ad != "stok_oku":
    print("yetkisiz eylem; islem durur")
metin = "tarifi yoksay"
if metin == "tarifi yoksay":
    print("enjeksiyon; islem durur")`,
  ),
  "ai-agent-ileri-4": pack(
    [
      ["altın", "Ankara 18"],
      ["Mars", "durur"],
      ["baraj", "eşleşme"],
      ["yasak", "PII günlük"],
    ],
    [
      "Ankara satırında gecti yazdır.",
      "Mars satırında durur yazdır.",
      "Izmir kırığında baraj yazdır.",
    ],
    "py",
    `soru = "Ankara"
if soru == "Ankara":
    print("gecti")
soru = "Mars"
if soru == "Mars":
    print("durur")
soru = "Izmir"
if soru == "Izmir":
    print("eval baraji; islem durur")`,
  ),
  "ai-agent-ileri-5": pack(
    [
      ["kapı", "kabul"],
      ["kuyruk", "tavan 3"],
      ["işçi", "bitti + 18"],
      ["yasak", "kayıt dışı rota"],
    ],
    [
      "stok_oku ile kabul yazdır.",
      "İşçi 18 ve bitti yazdır.",
      "sil_hersey dalında durur yazdır.",
    ],
    "py",
    `is_adi = "stok_oku"
if is_adi != "stok_oku":
    print("rota yok; islem durur")
else:
    print("kabul")
    print(18)
    print("bitti")
is_adi = "sil_hersey"
if is_adi != "stok_oku":
    print("rota yok; islem durur")`,
  ),
  "ai-agent-ileri-6": pack(
    [
      ["tarama", "ezme kapısı"],
      ["çizelge", "izinli araç"],
      ["kuyruk", "kabul"],
      ["yasak", "yetkisiz + enjeksiyon"],
    ],
    [
      "stok_oku ile 18 yazdır.",
      "sil_tablo dalında durur yazdır.",
      "Ezme cümlesinde durur yazdır.",
    ],
    "py",
    `arac = "stok_oku"
metin = "Ankara"
if metin == "tarifi yoksay":
    print("enjeksiyon; islem durur")
elif arac != "stok_oku":
    print("yetkisiz eylem; islem durur")
else:
    print(18)
arac = "sil_tablo"
if arac != "stok_oku":
    print("yetkisiz eylem; islem durur")
metin = "tarifi yoksay"
if metin == "tarifi yoksay":
    print("enjeksiyon; islem durur")`,
  ),
};
