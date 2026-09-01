/**
 * Python Orta Seviye — Nesne Yönelimli Programlama ve Veri İşleme.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyFiveActLessonDraft,
  dialogueTurn,
  type AcademyLessonDraft,
} from "@/lib/academy/curricula/types";

function mcq(
  id: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return { id, prompt, choices: [...choices], correctIndex };
}

const koray = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("koray", text, code);
const maya = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("maya", text, code);

export const PYTHON_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "python-orta-1",
    order: 1,
    title: "Nesne Yönelimli Programlama: class ve instance mantığı",
    dialogue: {
      warmup: [
        koray(
          "Fırında pide kalıbı bir tane durur. Her pide ayrı çıkar: biri susamlı, biri sade. Kalıbı paylaşınca ikinci pide birinciyi ezmesin diye ayrı tepsi istersin. Sınıf (class) o kalıp mı, örnek (instance) her pide mi?",
        ),
        maya(
          "O fırın kalıbı tariftir; örnek o tarifin sahadaki somunudur. `Siparis(\"ekmek\", 2)` ile `Siparis(\"ekmek\", 5)` aynı kalıptan çıkar, ayrı tepside durur. Kalıbın cebine liste koyarsan her pide aynı tepsiden yer — sahada sessiz sızıntı budur.",
        ),
      ],
      problem: [
        koray(
          "Biz dict’i her fonksiyona gezdirdik. Yarın kim `adet`’i eksi yaptı, iz yok. Sınıf değişkenine liste bağlamak neden veri kaybettirir?",
        ),
        maya(
          "Sınıf gövdesindeki `kalemler = []` tek çekmecedir; bütün örnekler o çekmeceyi paylaşır. Birinin `append`’i öbürünün fişini kirletir. Fail-closed (Hata Anında Kapalı) burada durur: örnek durumu `__init__` içinde doğar, kalıpta yaşamaz. Adet sıfır veya eksi ise örnek açılmaz.",
        ),
      ],
      development: [
        koray("Paylaşılan listeyi bir kez kır. Sonra dürüst `Siparis` kalıbını bas."),
        maya(
          "Önce sızıntıyı gör. `a.kalemler` ve `b.kalemler` aynı listedir. Sonra her örnek kendi `adet`’ini `__init__`’te alır.",
          {
            language: "py",
            source: `class YanlisSepet:
    kalemler = []


a = YanlisSepet()
b = YanlisSepet()
a.kalemler.append("ekmek")
assert b.kalemler == ["ekmek"]  # sızıntı
assert a.kalemler is b.kalemler`,
          },
        ),
        koray("Kalıbı düzelt. İki sipariş birbirini ezmesin; eksi adet kapıyı kapatsın."),
        maya(
          "`self` o tepsinin kendisidir. `bir is iki` False durur: aynı kalıp, ayrı somun.",
          {
            language: "py",
            source: `class Siparis:
    def __init__(self, kalem: str, adet: int):
        if adet <= 0:
            raise ValueError("adet pozitif olmalı; işlem durur")
        self.kalem = kalem
        self.adet = adet


bir = Siparis("ekmek", 2)
iki = Siparis("ekmek", 5)
assert bir.adet == 2
assert iki.adet == 5
assert bir is not iki
assert type(bir) is Siparis
try:
    Siparis("süt", 0)
except ValueError as hata:
    assert "pozitif" in str(hata)`,
          },
        ),
      ],
      conclusion: [
        koray("Kalıp ortak, tepsi ayrı. Dict gezdirmek iz bırakmaz, doğru mu?"),
        maya(
          "Sınıf tarifi, örnek sahadaki kaydı tutar. Durumu kalıba gömme. Bir sonraki bölümde seni miras alma ve kapsülleme bekliyor: kim neyi görür, kim neyi değiştiremez.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_pyo1_1",
        "Sınıf gövdesindeki `kalemler = []` neden tehlikelidir?",
        ["Hızlanır", "Tüm örnekler aynı listeyi paylaşır; sızıntı doğar", "SyntaxError zorunlu", "Yalnız str ile patlar"],
        1,
      ),
      mcq(
        "q_pyo1_2",
        "`Siparis(\"ekmek\", 2)` ve `Siparis(\"ekmek\", 5)` ilişkisi nedir?",
        ["Aynı nesnedir", "Aynı sınıftan ayrı örneklerdir", "İkincisi birincisini siler", "class yasaktır"],
        1,
      ),
      mcq(
        "q_pyo1_3",
        "Fail-closed (Hata Anında Kapalı) adet ≤ 0 iken ne yapar?",
        ["0 kabul eder", "Örneği açmaz; ValueError basar", "None döner", "Sınıf değişkenine yazar"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-orta-2",
    order: 2,
    title: "Miras alma ve kapsülleme: sınırlı erişim",
    dialogue: {
      warmup: [
        koray(
          "Bakkal tezgâhı oğula geçer; kasa şifresi çekmecede kalır. Miras (inheritance) tezgâh mı, kapsülleme (encapsulation) kasa kilidi mi?",
        ),
        maya(
          "Tezgâh `super().__init__` ile gelir. Kasa `_adet` ile kapalı durur: dışarıdan `raf._adet = -9` yazmak mümkün görünür, sözleşme yasaktır. Dürüst kapı `property` ve `dus` metodudur. Sözleşme yoksa stok eksiye iner, fiş yalan söyler.",
        ),
      ],
      problem: [
        koray("Alt sınıf tabanın alanını ezerse veya `adet`’i herkese açarsak saha nerede patlar?"),
        maya(
          "İki yerde. Biri: alt sınıf `__init__`’i unutup tabanı boş bırakır. Öbürü: `self.adet -= n` herkesin elinde; eksi stok sessizce basılır. Fail-closed kapısı `StokHatasi` fırlatır, orta değer uydurmaz.",
        ),
      ],
      development: [
        koray("Taban stok, alt sınıf satış. Kapsül kırılsın, hata isimli dursun."),
        maya(
          "`_adet` içeridedir. `sat` yalnız `dus` çağırır. Yetersiz stokta işlem durur; kalan 2’de kalır.",
          {
            language: "py",
            source: `class StokHatasi(Exception):
    pass


class Stok:
    def __init__(self, adet: int):
        if adet < 0:
            raise StokHatasi("negatif stok yok")
        self._adet = adet

    @property
    def adet(self) -> int:
        return self._adet

    def dus(self, n: int) -> int:
        if n > self._adet:
            raise StokHatasi("stok yetmez; işlem durur")
        self._adet -= n
        return self._adet


class SatisStogu(Stok):
    def sat(self, n: int) -> int:
        return self.dus(n)


raf = SatisStogu(4)
assert raf.sat(2) == 2
try:
    raf.sat(9)
except StokHatasi as hata:
    assert "yetmez" in str(hata)
assert raf.adet == 2`,
          },
        ),
      ],
      conclusion: [
        koray("Miras tezgâhı taşır, kapsül kasayı kilitler. Doğru mu?"),
        maya(
          "Alt sınıf tabanın işini tekrar yazmadan genişletir. Alan dışarı açık değilse eksi stok yazılmaz. Bir sonraki bölümde seni dosya ve JavaScript Nesne Gösterimi (JSON) bekliyor: kaydı diske dürüst basma.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_pyo2_1",
        "`super().__init__` ne işe yarar?",
        ["Dosya açar", "Taban sınıfın kurucusunu çağırır", "Kapsülü kırar", "except yutar"],
        1,
      ),
      mcq(
        "q_pyo2_2",
        "`_adet` ve `@property` dürüst sözleşmesi nedir?",
        ["Herkes eksi yazabilir", "Okuma kapıdan; yazma metodla, sınır ihlali durur", "private Python’da zorunludur", "global gerekir"],
        1,
      ),
      mcq(
        "q_pyo2_3",
        "Stok yetmezken Fail-closed (Hata Anında Kapalı) ne basar?",
        ["adet=0 uydurur", "İsimli istisna; kalan değişmez", "None", "print yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-orta-3",
    order: 3,
    title: "Dosya işleme ve JSON veri yönetimi",
    dialogue: {
      warmup: [
        koray(
          "Noter senedini yarım mühürleyip çekmeceye atmak yasaktır. JavaScript Nesne Gösterimi (JSON) o senet mi, `write_text` mühür mü?",
        ),
        maya(
          "JSON metin sözleşmesidir: anahtar-değer, liste, sayı. `json.loads` senedi açar, `json.dumps` mührü basar. `ensure_ascii=False` Türkçe harfi kaçırmaz. Çekmece `pathlib.Path`’tir. Yarım JSON’u diske basmak, boş kâğıda noter damgası vurmak gibidir.",
        ),
      ],
      problem: [
        koray("Açık dosyayı unutmak veya bozuk JSON’u yutmak sahada ne kırar?"),
        maya(
          "`open` + `close` unutulursa kilit kalır. `Path.write_text(..., encoding=\"utf-8\")` kapağı kendisi kapatır. `json.loads(\"{\")` `JSONDecodeError` basar; yutarsan yarın çöp kaydı üretim sanılır. Fail-closed: parse edilmezse yazılmaz. Atomik yol: geçici dosyaya yaz, sonra `replace`.",
        ),
      ],
      development: [
        koray("Sözlüğü mühürle, bozuk metni reddet. Disk yokken sözleşmeyi kanıtla."),
        maya(
          "`adet` yoksa yazım durur. `sort_keys=True` aynı kaydı her seferinde aynı metne basar — mühür karşılaştırılır.",
          {
            language: "py",
            source: `import json


def muhurle(veri: dict) -> str:
    if "adet" not in veri:
        raise ValueError("adet yok; yazım durur")
    return json.dumps(veri, ensure_ascii=False, sort_keys=True)


assert '"adet": 3' in muhurle({"adet": 3, "kalem": "ekmek"})
veri = json.loads('{"adet": 3, "para_birimi": "TRY"}')
assert veri["adet"] == 3
try:
    json.loads("{")
except json.JSONDecodeError:
    bozuk = True
else:
    bozuk = False
assert bozuk is True`,
          },
        ),
        koray("Disk tarafında kapağı kim kapatır? Üstüne yazma riski nerde durur?"),
        maya(
          "`Path.write_text` kapağı kapatır. Üretimde geçici yola yazıp `replace` edersin; yarım senet hedefi kirletmez.",
          {
            language: "py",
            source: `from pathlib import Path

# üretim:
# hedef = Path("stok.json")
# tmp = hedef.with_suffix(".tmp")
# tmp.write_text(muhurle(veri), encoding="utf-8")
# tmp.replace(hedef)

assert Path("stok.json").suffix == ".json"`,
          },
        ),
      ],
      conclusion: [
        koray("Parse edilmezse mühür vurulmaz. Sonraki adım hataları isimlendirmek mi?"),
        maya(
          "JSON sözleşmesi dürüstse disk yalan söylemez. Bir sonraki bölümde seni try/except ve özel istisnalar bekliyor: hatayı yutma, adı koy.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_pyo3_1",
        "`json.loads(\"{\")` dürüst sonuç nedir?",
        ["Boş dict", "JSONDecodeError; yazım durur", "None", "0"],
        1,
      ),
      mcq(
        "q_pyo3_2",
        "Türkçe karakteri JSON’da kaçırmamanın yolu hangisidir?",
        ["ascii=True", "json.dumps(..., ensure_ascii=False)", "latin-1 zorunlu", "eval"],
        1,
      ),
      mcq(
        "q_pyo3_3",
        "Yarım dosyanın hedefi kirletmemesi için dürüst yol hangisidir?",
        ["Doğrudan üzerine yaz", "Geçici dosyaya yaz, sonra replace", "print yeter", "sleep"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-orta-4",
    order: 4,
    title: "Hata yönetimi: try/except ve özel istisnalar",
    dialogue: {
      warmup: [
        koray(
          "Gişede «üç bilet» denince kepenk inmez; fişe «tamsayı değil» yazılır. `except Exception` her şeyi yutmak, gişeyi sağır etmek midir?",
        ),
        maya(
          "O. `bare except` veya geniş `Exception` KeyboardInterrupt’u da yutar; makine durmaz, sen durursun. Özel istisna (`KayitHatasi`) fişin damgasıdır: kod ve cümle ayrı durur. `raise ... from exc` zinciri koparmaz.",
        ),
      ],
      problem: [
        koray("Biz `except:` yazıp `pass` koyduk. Log’da iz yok, kasa yanlış kesti. Nerde kırılır?"),
        maya(
          "İki yerde. Biri: gerçek bug gizlenir. Öbürü: boş girdi sıfır kabul edilir. Fail-closed kapısı tipi ve sınırı ayırır: boş, tip, sınır — üç damga. Çökmek nezaket değildir; isimsiz yutmak ihanettir.",
        ),
      ],
      development: [
        koray("Üç damgayı yaz. `üç` ve boş girdi ayrı kod bassın."),
        maya(
          "`int` patlayınca `from exc` ile neden durur. `hata.kod` çağıran tarafa sözleşme verir.",
          {
            language: "py",
            source: `class KayitHatasi(Exception):
    def __init__(self, kod: str, mesaj: str):
        super().__init__(mesaj)
        self.kod = kod


def oku_adet(ham: str) -> int:
    temiz = ham.strip()
    if not temiz:
        raise KayitHatasi("bos", "boş girdi; işlem durur")
    try:
        adet = int(temiz)
    except ValueError as exc:
        raise KayitHatasi("tip", "tamsayı değil; işlem durur") from exc
    if adet <= 0:
        raise KayitHatasi("sinir", "adet pozitif olmalı")
    return adet


assert oku_adet("4") == 4
try:
    oku_adet("üç")
except KayitHatasi as hata:
    assert hata.kod == "tip"
try:
    oku_adet("  ")
except KayitHatasi as hata:
    assert hata.kod == "bos"`,
          },
        ),
      ],
      conclusion: [
        koray("Yutmak yok, damga var. Ağ kapısında da aynı disiplin mi durur?"),
        maya(
          "try dar tutulur, except isimli durur, zincir kopmaz. Bir sonraki bölümde seni Hipermetin Aktarım Protokolü (HTTP) ve requests bekliyor: 200 olmayan yanıtı yeşil sayma.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_pyo4_1",
        "`except:` veya geniş Exception yutmanın riski nedir?",
        ["Hız", "Gerçek hatayı gizler; KeyboardInterrupt da yutulabilir", "Tip güvenliği", "JSON hızlanır"],
        1,
      ),
      mcq(
        "q_pyo4_2",
        "`raise KayitHatasi(...) from exc` ne korur?",
        ["Dosya kilidi", "Neden zincirini; kök ValueError kaybolmaz", "HTTP kodu", "class değişkeni"],
        1,
      ),
      mcq(
        "q_pyo4_3",
        "`oku_adet(\"üç\")` dürüst damga hangisidir?",
        ["kod=bos", "kod=tip ve işlem durur", "0 döner", "None"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-orta-5",
    order: 5,
    title: "HTTP istekleri ve API entegrasyonu (requests)",
    dialogue: {
      warmup: [
        koray(
          "PTT gişesinde mektup gitti diye teslim olmaz. Damga 200’dür, 404 adres yoktur, 500 gişe yanmıştır. Hipermetin Aktarım Protokolü (HTTP) bu damga mı?",
        ),
        maya(
          "Bu. `requests.get(url, timeout=8)` mektubu yollar. `timeout` yoksa kuyruk sonsuz bekler. Uygulama Programlama Arayüzü (API) karşı tarafın sözleşmesidir. `yanit.ok` True iken gövde yine çöp olabilir; Fail-closed önce durumu, sonra tipi okur.",
        ),
      ],
      problem: [
        koray("500 gövdede `{\"ok\": true}` basınca biz yeşil tik yaktık. Veri kaybı nerde?"),
        maya(
          "Durum kodu yalanı örtmez. 200 değilse kayıt durur; gövdeye bakılmaz. `yanit.json()` liste gelirse sözlük bekleyen kod KeyError yer. Şema yoksa `id` eksik kaydı mühürlersin. Ağ hatası `requests.RequestException`’dır; yutma.",
        ),
      ],
      development: [
        koray("Sahte yanıtla kapıyı yaz. 500 durdurulsun, 200 sözlük açılsın."),
        maya(
          "`requests` üretim çağrısıdır. Laboratuvarda aynı kapıyı sahte yanıtla deneriz; ağ yok, sözleşme aynıdır.",
          {
            language: "py",
            source: `def oku_json(yanit) -> dict:
    if yanit.status_code != 200:
        raise ValueError(f"durum {yanit.status_code}; kayıt durur")
    veri = yanit.json()
    if not isinstance(veri, dict):
        raise ValueError("gövde sözlük değil; kayıt durur")
    return veri


class SahteYanit:
    def __init__(self, status_code: int, govde):
        self.status_code = status_code
        self._govde = govde

    def json(self):
        return self._govde


assert oku_json(SahteYanit(200, {"id": 1}))["id"] == 1
try:
    oku_json(SahteYanit(500, {"ok": True}))
except ValueError as hata:
    assert "500" in str(hata)
try:
    oku_json(SahteYanit(200, [1, 2]))
except ValueError as hata:
    assert "sözlük" in str(hata)`,
          },
        ),
        koray("Üretim satırı nasıl durur? Timeout ve import nerde?"),
        maya(
          "`requests` üçüncü parti kütüphanedir; sanal ortamda kurulur. Çağrı tek kapıdan geçer: get, timeout, oku_json.",
          {
            language: "py",
            source: `# üretim (ağ gerekir):
# import requests
# def cek(url: str) -> dict:
#     yanit = requests.get(url, timeout=8)
#     return oku_json(yanit)

TIMEOUT_SN = 8
assert TIMEOUT_SN == 8`,
          },
        ),
      ],
      conclusion: [
        koray("Damga 200 değilse çekmeceye senet girmez. Kapanışta bunu JSON’a mühürleyecek miyiz?"),
        maya(
          "HTTP durumu sözleşme, gövde ikinci kapıdır. Bir sonraki bölümde seni mini proje bekliyor: Temsili Durum Transferi (REST) yanıtını doğrulayıp JSON dosyasına basma.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_pyo5_1",
        "HTTP 500 gövdede ok:true ise dürüst yol hangisidir?",
        ["Yeşil tik", "Durum 200 değil; kayıt durur", "json() yeter", "timeout kapat"],
        1,
      ),
      mcq(
        "q_pyo5_2",
        "`requests.get` çağrısında timeout neden durur?",
        ["Süs", "Sonsuz kuyruk olmasın diye üst sınır", "JSON şeması", "class zorunlu"],
        1,
      ),
      mcq(
        "q_pyo5_3",
        "200 ile gelen liste, sözlük bekleyen kapıda ne olur?",
        ["Sessiz kabul", "Tip reddi; Fail-closed durur", "İlk eleman alınır", "str’e çevrilir"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-orta-6",
    order: 6,
    title: "Mini proje: REST API'den JSON dosyasına mühür",
    dialogue: {
      warmup: [
        koray(
          "Resmî gazete kupürünü arşiv çekmecesine koyarsın. Kupürde sayı yoksa mühür vurulmaz. Temsili Durum Transferi (REST) yanıtı kupür, JSON dosyası çekmece mi?",
        ),
        maya(
          "O. Akış tek cümledir: çek → durum oku → şema doğrula → mühürle. Ortada `id` yoksa dosya yazılmaz. Fail-closed kapısı yarım arşivi üretmez. `indent=2` insan okur; üretim hash’i `sort_keys` ile sabitlenir.",
        ),
      ],
      problem: [
        koray("Ağ 200 döndü diye `Path.write_text` çalıştırırsak hangi kayıt kaybolur?"),
        maya(
          "Eksik `id`. Liste gövde. 200 olup içi boş sözlük. Bunlar çekmeceye girerse yarın kimse fark etmez. Doğrulama yazımdan önce durur. İstisna yukarı fırlar; çağıran taraf dosyayı açmaz.",
        ),
      ],
      development: [
        koray("Tek fonksiyon: sahte 200’ü mühürle, `id` yoksa dur."),
        maya(
          "Aynı kapı üretime `requests.get` ile bağlanır. Laboratuvar ağa çıkmaz; sözleşme assert ile sabitlenir.",
          {
            language: "py",
            source: `import json


def cek_ve_muhurle(yanit, zorunlu=("id",)) -> str:
    if yanit.status_code != 200:
        raise ValueError("istek durur; dosya yazılmaz")
    veri = yanit.json()
    if not isinstance(veri, dict):
        raise ValueError("gövde sözlük değil")
    for alan in zorunlu:
        if alan not in veri:
            raise ValueError(f"{alan} yok; mühür durur")
    return json.dumps(veri, ensure_ascii=False, indent=2)


class SahteYanit:
    def __init__(self, status_code: int, govde):
        self.status_code = status_code
        self._govde = govde

    def json(self):
        return self._govde


metin = cek_ve_muhurle(SahteYanit(200, {"id": 7, "adet": 3}))
assert '"id": 7' in metin
try:
    cek_ve_muhurle(SahteYanit(200, {"adet": 3}))
except ValueError as hata:
    assert "id" in str(hata)
try:
    cek_ve_muhurle(SahteYanit(404, {"id": 7}))
except ValueError as hata:
    assert "durur" in str(hata)`,
          },
        ),
      ],
      conclusion: [
        koray("Orta kapanış bu mu: sınıf, kapsül, JSON, isimli hata, HTTP damgası, mühür?"),
        maya(
          "Çekilir, doğrulanır, mühürlenir. Eksik alan diske inmez. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_pyo6_1",
        "REST 200 ama gövdede `id` yoksa ne olur?",
        ["Dosya yine yazılır", "Mühür durur; ValueError", "id=0 uydurulur", "timeout artar"],
        1,
      ),
      mcq(
        "q_pyo6_2",
        "Mini projenin dürüst sırası hangisidir?",
        ["yaz → çek → doğrula", "çek → durum → şema → mühürle", "print → sleep → yaz", "eval → dosya"],
        1,
      ),
      mcq(
        "q_pyo6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "JSON indirince"],
        1,
      ),
    ],
  }),
] as const;

const PYTHON_ORTA_LESSON_QUIZZES: AcademyExamQuestion[] = PYTHON_ORTA_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları. */
export const PYTHON_ORTA_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...PYTHON_ORTA_LESSON_QUIZZES,
  mcq("q_pyo_p1", "`self` nedir?", ["Sınıf adı", "Örneğin kendisi", "Modül", "except"], 1),
  mcq("q_pyo_p2", "`__init__` ne zaman çalışır?", ["Import’ta", "Örnek oluşunca", "del ile", "JSON parse’ta"], 1),
  mcq("q_pyo_p3", "Sınıf değişkeni ile örnek niteliği farkı nedir?", ["Yoktur", "Biri paylaşılır, öbürü tepsiye aittir", "İkisi de private", "Yalnız listede"], 1),
  mcq("q_pyo_p4", "Kapsülleme neden vardır?", ["Hız", "Dışarıdan sınır ihlalini sözleşmeyle kesmek", "JSON zorunlu", "HTTP 200"], 1),
  mcq("q_pyo_p5", "`json.dumps` ne üretir?", ["bytes zorunlu", "JSON metni", "Path", "class"], 1),
  mcq("q_pyo_p6", "`pathlib.Path.write_text` encoding varsayılanı riski nedir?", ["Yok", "Platforma göre sapabilir; utf-8 yazılır", "JSON bozulmaz", "timeout"], 1),
  mcq("q_pyo_p7", "Özel istisna class Exception’dan neden türer?", ["Süs", "İsimli yakalama ve kod alanı için", "daha hızlı", "HTTP kodu"], 1),
  mcq("q_pyo_p8", "`requests` standart kütüphane midir?", ["Evet", "Hayır; üçüncü parti, ortama kurulur", "Yalnız Windows", "json ile aynı"], 1),
  mcq("q_pyo_p9", "HTTP 404 dürüst okuma nedir?", ["Gizli 200", "Kaynak yok; kayıt durur", "ok:true", "retry sonsuz"], 1),
  mcq("q_pyo_p10", "Atomik yazım neden gerekir?", ["Hız", "Yarım JSON hedefi kirletmesin", "except yutmak", "class değişkeni"], 1),
  mcq("q_pyo_p11", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_pyo_p12", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_pyo_p13", "Miras alma ne taşır?", ["Yalnız isim", "Tabanın davranışı; alt sınıf genişletir", "JSON şema", "timeout"], 1),
  mcq("q_pyo_p14", "Gövde liste, kapı sözlük bekliyorsa?", ["İlk eleman", "Tip reddi; mühür yok", "str join", "200 yeter"], 1),
];
