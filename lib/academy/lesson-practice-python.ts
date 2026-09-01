/**
 * Python dikeyi kod laboratuvarları — Temel / Orta / İleri.
 * Öğretmen-öğrenci odaklı, çalışan örnek + adım listesi.
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

export const PYTHON_PATHWAY_PRACTICE: Record<string, AcademyLessonPractice> = {
  "python-temel-1": pack(
    [
      ["etiket", "değişken adı"],
      ["tip", "str / int / float / list / dict"],
      ["kontrol", "type(deger)"],
      ["yasak", "metin tutarı çarpmak"],
    ],
    [
      "musteri_adi, adet, birim_fiyat, sepet, stok kutularını aç.",
      "type() ile beş cinsi doğrula.",
      "kurus_carp(\"250,00\", 2) ile 50000 bekle.",
    ],
    "py",
    `musteri_adi = "Ayşe"
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
  ),
  "python-temel-2": pack(
    [
      ["karşılaştırma", "==  /  >="],
      ["atama", "= (karıştırma)"],
      ["dal", "if / elif / else"],
      ["baraj", "70"],
    ],
    [
      "not_ort değişkenini 68 ve 72 ile dene.",
      "if not_ort >= 70: «geçti» yazdır.",
      "else dalında «tekrar» yazdır.",
    ],
    "py",
    `not_ort = 72
if not_ort >= 70:
    print("geçti")
else:
    print("tekrar")`,
  ),
  "python-temel-3": pack(
    [
      ["for", "range ile bilinen tur"],
      ["while", "koşul doğruysa sür"],
      ["break", "erken çıkış"],
      ["toplam", "akkümülatör"],
    ],
    [
      "1’den 5’e range(1, 6) kur.",
      "toplam += i ile biriktir.",
      "Sonucu print et.",
    ],
    "py",
    `toplam = 0
for i in range(1, 6):
    toplam += i
print(toplam)  # 15`,
  ),
  "python-temel-4": pack(
    [
      ["tanım", "def ad(...):"],
      ["dönüş", "return"],
      ["yerel", "fonksiyon içi değişken"],
      ["kuruş", "int(round(lira * 100))"],
    ],
    [
      "lira_to_kurus fonksiyonunu yaz.",
      "18.45 ile çağırıp 1845 bekle.",
      "return olmadan None geldiğini gör.",
    ],
    "py",
    `def lira_to_kurus(lira: float) -> int:
    return int(round(lira * 100))

assert lira_to_kurus(18.45) == 1845`,
  ),
  "python-temel-5": pack(
    [
      ["liste", "[a, b, c]"],
      ["indeks", "0 tabanlı"],
      ["son", "sepet[-1]"],
      ["yokluk", ".get"],
    ],
    [
      "sepet = [\"elma\", \"armut\", \"ayva\"] yaz.",
      "sepet[-1] ile son elemanı oku.",
      "stok.get(\"armut\", 0) ile yokluğu sıfır kabul et.",
    ],
    "py",
    `sepet = ["elma", "armut", "ayva"]
assert sepet[0] == "elma"
assert sepet[-1] == "ayva"
stok = {"elma": 4}
assert stok.get("armut", 0) == 0`,
  ),
  "python-temel-6": pack(
    [
      ["girdi", "input() → str"],
      ["doğrulama", "try / except ValueError"],
      ["boş", "reddeder"],
      ["fail-closed", "Hata Anında Kapalı"],
    ],
    [
      "oku_adet(\"3\") ile 3 bekle.",
      "oku_adet(\"üç\") ValueError bassın.",
      "Boş girdi reddedilsin.",
    ],
    "py",
    `def oku_adet(ham):
    temiz = ham.strip()
    return int(temiz)

print(oku_adet("3"))`,
  ),
  "python-orta-1": pack(
    [
      ["kalıp", "class"],
      ["örnek", "__init__ / self"],
      ["yasak", "sınıf listesi paylaşmak"],
      ["kapı", "adet > 0"],
    ],
    [
      "Siparis kalıbını yaz; iki ayrı örnek aç.",
      "adet <= 0 iken ValueError bekle.",
      "Sınıf gövdesine liste koyma.",
    ],
    "py",
    `class Siparis:
    def __init__(self, kalem, adet):
        if adet <= 0:
            raise ValueError("adet pozitif olmalı")
        self.kalem = kalem
        self.adet = adet

bir = Siparis("ekmek", 2)
iki = Siparis("ekmek", 5)
assert bir.adet == 2
assert iki is not bir`,
  ),
  "python-orta-2": pack(
    [
      ["miras", "super().__init__"],
      ["kapsül", "_adet + property"],
      ["kapı", "StokHatasi"],
      ["yasak", "eksi stok yazmak"],
    ],
    [
      "Stok tabanını ve SatisStogu alt sınıfını yaz.",
      "sat(2) sonrası adet 2 kalsın.",
      "Yetersiz stokta StokHatasi bekle.",
    ],
    "py",
    `class StokHatasi(Exception):
    pass

class Stok:
    def __init__(self, adet):
        self._adet = adet

    @property
    def adet(self):
        return self._adet

    def dus(self, n):
        if n > self._adet:
            raise StokHatasi("stok yetmez")
        self._adet -= n
        return self._adet

class SatisStogu(Stok):
    def sat(self, n):
        return self.dus(n)

raf = SatisStogu(4)
assert raf.sat(2) == 2`,
  ),
  "python-orta-3": pack(
    [
      ["aç", "json.loads"],
      ["bas", "dumps ensure_ascii=False"],
      ["yaz", "Path.write_text utf-8"],
      ["atomik", "tmp → replace"],
    ],
    [
      "Sözlüğü json.dumps ile mühürle.",
      "Bozuk metinde JSONDecodeError bekle.",
      "adet yoksa yazımı durdur.",
    ],
    "py",
    `import json

def muhurle(veri):
    if "adet" not in veri:
        raise ValueError("adet yok")
    return json.dumps(veri, ensure_ascii=False, sort_keys=True)

assert '"adet": 3' in muhurle({"adet": 3, "kalem": "ekmek"})`,
  ),
  "python-orta-4": pack(
    [
      ["damga", "KayitHatasi.kod"],
      ["zincir", "raise ... from exc"],
      ["yasak", "bare except"],
      ["sınır", "adet > 0"],
    ],
    [
      "oku_adet(\"4\") ile 4 bekle.",
      "oku_adet(\"üç\") kod=tip bassın.",
      "Boş girdide kod=bos bassın.",
    ],
    "py",
    `class KayitHatasi(Exception):
    def __init__(self, kod, mesaj):
        super().__init__(mesaj)
        self.kod = kod

def oku_adet(ham):
    temiz = ham.strip()
    if not temiz:
        raise KayitHatasi("bos", "boş girdi")
    try:
        return int(temiz)
    except ValueError as exc:
        raise KayitHatasi("tip", "tamsayı değil") from exc

assert oku_adet("4") == 4`,
  ),
  "python-orta-5": pack(
    [
      ["çağrı", "requests.get + timeout"],
      ["damga", "status_code == 200"],
      ["gövde", "dict zorunlu"],
      ["yasak", "500’ü yeşil saymak"],
    ],
    [
      "oku_json 200 sözlüğü açsın.",
      "500’de ValueError bekle.",
      "Liste gövdeyi reddet.",
    ],
    "py",
    `def oku_json(yanit):
    if yanit.status_code != 200:
        raise ValueError("durum durur")
    veri = yanit.json()
    if not isinstance(veri, dict):
        raise ValueError("gövde sözlük değil")
    return veri

class SahteYanit:
    def __init__(self, status_code, govde):
        self.status_code = status_code
        self._govde = govde
    def json(self):
        return self._govde

assert oku_json(SahteYanit(200, {"id": 1}))["id"] == 1`,
  ),
  "python-orta-6": pack(
    [
      ["çek", "durum 200"],
      ["şema", "zorunlu id"],
      ["mühür", "json.dumps"],
      ["yasak", "eksik alan yazmak"],
    ],
    [
      "id’li 200 yanıtını mühürle.",
      "id yoksa ValueError bekle.",
      "404’te dosya yazma.",
    ],
    "py",
    `import json

def cek_ve_muhurle(yanit, zorunlu=("id",)):
    if yanit.status_code != 200:
        raise ValueError("istek durur")
    veri = yanit.json()
    for alan in zorunlu:
        if alan not in veri:
            raise ValueError(alan + " yok")
    return json.dumps(veri, ensure_ascii=False, indent=2)

class SahteYanit:
    def __init__(self, status_code, govde):
        self.status_code = status_code
        self._govde = govde
    def json(self):
        return self._govde

metin = cek_ve_muhurle(SahteYanit(200, {"id": 7, "adet": 3}))
assert '"id": 7' in metin`,
  ),
  "python-ileri-1": pack(
    [
      ["bezetici", "@wraps"],
      ["kapı", "adet > 0"],
      ["fabrika", "parametreli damga"],
      ["yasak", "eksi adet içeri"],
    ],
    [
      "pozitif_gerekir bezeticisini yaz.",
      "etiket(3) ile '3 etiket' bekle.",
      "etiket(0) ValueError bassın.",
    ],
    "py",
    `from functools import wraps

def pozitif_gerekir(fn):
    @wraps(fn)
    def sarmal(adet, *args, **kwargs):
        if adet <= 0:
            raise ValueError("adet pozitif olmalı; işlem durur")
        return fn(adet, *args, **kwargs)
    return sarmal

@pozitif_gerekir
def etiket(adet):
    return f"{adet} etiket"

assert etiket(3) == "3 etiket"
assert etiket.__name__ == "etiket"`,
  ),
  "python-ileri-2": pack(
    [
      ["yield", "fiş fiş"],
      ["yığın", "liste yasak"],
      ["kapı", "id zorunlu"],
      ["bitiş", "StopIteration"],
    ],
    [
      "fis_akisi ile id akıt.",
      "topla_lazy iki kayıtta 3 bekle.",
      "id yoksa ValueError bekle.",
    ],
    "py",
    `def fis_akisi(kayitlar):
    for kayit in kayitlar:
        if "id" not in kayit:
            raise ValueError("id yok; akış durur")
        yield kayit["id"]

def topla_lazy(kayitlar):
    toplam = 0
    for kimlik in fis_akisi(kayitlar):
        toplam += kimlik
    return toplam

assert topla_lazy([{"id": 1}, {"id": 2}]) == 3`,
  ),
  "python-ileri-3": pack(
    [
      ["async def", "korutin"],
      ["await", "giriş-çıkış bekler"],
      ["gather", "birlikte"],
      ["yasak", "time.sleep"],
    ],
    [
      "cek 200 ve id kabul etsin.",
      "gather iki kaydı birleştir.",
      "500 ValueError bassın.",
    ],
    "py",
    `import asyncio

async def cek(durum, govde):
    await asyncio.sleep(0)
    if durum != 200:
        raise ValueError("durum " + str(durum) + "; kayıt durur")
    if "id" not in govde:
        raise ValueError("id yok; kayıt durur")
    return govde

async def topla():
    return await asyncio.gather(cek(200, {"id": 1}), cek(200, {"id": 2}))

sonuc = asyncio.run(topla())
assert [k["id"] for k in sonuc] == [1, 2]`,
  ),
  "python-ileri-4": pack(
    [
      ["GIL", "CPU sırası"],
      ["thread", "I/O bekler"],
      ["process", "ayrı fırın"],
      ["manda", "Lock"],
    ],
    [
      "Sayac.artir iki kez 1 ve 2 versin.",
      "cpu_mu('carpma') process dönsün.",
      "bilinmez tür ValueError bassın.",
    ],
    "py",
    `from threading import Lock

class Sayac:
    def __init__(self):
        self._n = 0
        self._manda = Lock()
    def artir(self):
        with self._manda:
            self._n += 1
            return self._n

s = Sayac()
assert s.artir() == 1
assert s.artir() == 2`,
  ),
  "python-ileri-5": pack(
    [
      ["klişe", "metaclass"],
      ["type", "varsayılan"],
      ["kapı", "dogrula zorunlu"],
      ["yasak", "boş kalıp"],
    ],
    [
      "KapaliMeta dogrula istesin.",
      "Kayit örneği id kabul etsin.",
      "Bozuk sınıf TypeError bassın.",
    ],
    "py",
    `class KapaliMeta(type):
    def __new__(mcs, name, bases, ns):
        if name != "KapaliMeta" and "dogrula" not in ns:
            raise TypeError("dogrula yok; sınıf açılmaz")
        return super().__new__(mcs, name, bases, ns)

class Kayit(metaclass=KapaliMeta):
    def dogrula(self, veri):
        if "id" not in veri:
            raise ValueError("id yok")
        return veri

k = Kayit()
assert k.dogrula({"id": 7})["id"] == 7`,
  ),
  "python-ileri-6": pack(
    [
      ["çek", "gather"],
      ["doğrula", "durum 200 + id"],
      ["akıt", "üreteç"],
      ["yasak", "yarım rapor"],
    ],
    [
      "İki sağlam gişede [10, 20] bekle.",
      "500 motoru dursun.",
      "id yoksa mühür yok.",
    ],
    "py",
    `import asyncio

async def cek_sube(sube):
    await asyncio.sleep(0)
    if sube.get("durum") != 200:
        raise ValueError("durum dürüst değil; motor durur")
    if "id" not in sube:
        raise ValueError("id yok; motor durur")
    return sube

def isle_akim(kayitlar):
    for kayit in kayitlar:
        yield kayit["id"] * 10

async def motor(subeler):
    ham = await asyncio.gather(*(cek_sube(sube) for sube in subeler))
    return list(isle_akim(ham))

sonuc = asyncio.run(motor([{"durum": 200, "id": 1}, {"durum": 200, "id": 2}]))
assert sonuc == [10, 20]`,
  ),
};
