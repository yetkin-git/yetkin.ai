import { describe, expect, it } from "vitest";
import {
  academyLabLanguageLabel,
  pickAcademyLabSource,
  runAcademyLabSource,
  transpileAcademyPythonSubset,
} from "@/archived/lib/academy-studio/lesson-code-lab-run";

const LAB_SOURCES = {
  py1: `musteri_adi = "Ayşe"
adet = 3
birim_fiyat = 12.5
sepet = ["ekmek", "süt", "yumurta"]
stok = {"ekmek": 4, "süt": 2}
print(musteri_adi)
print(adet)

def kurus_carp(ham, kat):
    lira = float(ham.replace(",", "."))
    return int(round(lira * 100 * kat))

print(kurus_carp("250,00", 2))`,
  py2: `not_ort = 72
if not_ort >= 70:
    print("geçti")
else:
    print("tekrar")`,
  py3: `toplam = 0
for i in range(1, 6):
    toplam += i
print(toplam)  # 15`,
  py6: `def oku_adet(ham):
    temiz = ham.strip()
    return int(temiz)

print(oku_adet("3"))`,
  pyOrta1: `import pandas as pd
df = pd.DataFrame({"adet": [1, 2]})`,
  agt1: `STOK = {"Ankara": 18, "Istanbul": 14}

def sohbet_kutusu(soru):
    return "Sanirim hava güzel."

def ajan_oku(sehir):
    if sehir == "Mars":
        return "sehir yok; islem durur"
    return STOK[sehir]

print(sohbet_kutusu("Ankara"))
print(ajan_oku("Ankara"))
print(ajan_oku("Mars"))`,
  ago1: `soru = "Ankara un"
if soru == "Mars kolonisi":
    print("kaynak yok; islem durur")
else:
    print("Kanit: Ankara depo: 18 palet un.")
soru = "Mars kolonisi"
if soru == "Mars kolonisi":
    print("kaynak yok; islem durur")`,
  agi1: `arac = "stok_oku"
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
  agi3: `ad = "stok_oku"
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
};

describe("akademi kod laboratuvarı", () => {
  it("python-temel değişken, dal ve döngüyü çalıştırır", () => {
    const kutular = runAcademyLabSource("py", LAB_SOURCES.py1);
    expect(kutular.ok).toBe(true);
    expect(kutular.kind).toBe("ran");
    expect(kutular.stdout).toContain("Ayşe");
    expect(kutular.stdout).toContain("50000");

    const dal = runAcademyLabSource("py", LAB_SOURCES.py2);
    expect(dal.ok).toBe(true);
    expect(dal.stdout).toContain("geçti");

    const toplam = runAcademyLabSource("py", LAB_SOURCES.py3);
    expect(toplam.ok).toBe(true);
    expect(toplam.stdout).toContain("15");
  });

  it("input() girdi kuyruğunu okur; pandas önizlemedir", () => {
    const adet = runAcademyLabSource("py", LAB_SOURCES.py6);
    expect(adet.ok).toBe(true);
    expect(adet.stdout).toContain("3");

    const pandas = runAcademyLabSource("py", LAB_SOURCES.pyOrta1);
    expect(pandas.ok).toBe(true);
    expect(pandas.kind).toBe("preview");
  });

  it("json doğrular; kod bloğunu dersten seçer", () => {
    const json = runAcademyLabSource("json", '{ "ok": true }');
    expect(json.ok).toBe(true);
    expect(json.kind).toBe("json");
    expect(json.stdout).toContain('"ok": true');
    expect(academyLabLanguageLabel("py")).toBe("python");
    const picked = pickAcademyLabSource({
      blocks: [{ kind: "code", language: "py", source: 'print("x")' }],
    });
    expect(picked?.source).toContain("print");
    expect(transpileAcademyPythonSubset('print("Merhaba")')).toContain("print(");
  });

  it("ai-agent-temel laboratuvarı sohbet ve durma kapısını çalıştırır", () => {
    const ajan = runAcademyLabSource("py", LAB_SOURCES.agt1);
    expect(ajan.ok).toBe(true);
    expect(ajan.kind).toBe("ran");
    expect(ajan.stdout).toContain("Sanirim hava güzel.");
    expect(ajan.stdout).toContain("18");
    expect(ajan.stdout).toContain("islem durur");
  });

  it("ai-agent-orta laboratuvarı boş getiri kapısını çalıştırır", () => {
    const rag = runAcademyLabSource("py", LAB_SOURCES.ago1);
    expect(rag.ok).toBe(true);
    expect(rag.kind).toBe("ran");
    expect(rag.stdout).toContain("18 palet");
    expect(rag.stdout).toContain("islem durur");
  });

  it("ai-agent-ileri laboratuvarı kenar ve korkuluk kapısını çalıştırır", () => {
    const grafik = runAcademyLabSource("py", LAB_SOURCES.agi1);
    expect(grafik.ok).toBe(true);
    expect(grafik.kind).toBe("ran");
    expect(grafik.stdout).toContain("18");
    expect(grafik.stdout).toContain("islem durur");
    const korkuluk = runAcademyLabSource("py", LAB_SOURCES.agi3);
    expect(korkuluk.ok).toBe(true);
    expect(korkuluk.stdout).toContain("yetkisiz eylem");
    expect(korkuluk.stdout).toContain("enjeksiyon");
  });
});
