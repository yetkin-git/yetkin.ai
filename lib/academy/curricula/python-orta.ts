/**
 * Python Orta Seviye — Nesne Yönelimli Programlama ve Veri İşleme.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyInstructorLessonDraft,
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

export const PYTHON_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "python-orta-1",
    order: 1,
    title: "Nesne Yönelimli Programlama: class ve instance mantığı",
    intro: "Hoş geldiniz. Bu bölümde Nesne Yönelimli Programlama: class ve instance mantığı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Fırında pide kalıbı bir tane durur. Her pide ayrı çıkar: biri susamlı, biri sade. Kalıbı paylaşınca ikinci pide birinciyi ezmesin diye ayrı tepsi istersin. Sınıf (class) o kalıp mı, örnek (instance) her pide mi. fırın kalıbı tariftir; örnek o tarifin sahadaki somunudur. `Siparis(\"ekmek\", 2)` ile `Siparis(\"ekmek\", 5)` aynı kalıptan çıkar, ayrı tepside durur. Kalıbın cebine liste koyarsan her pide aynı tepsiden yer — sahada sessiz sızıntı budur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Biz dict’i her fonksiyona gezdirdik. Yarın kim `adet`’i eksi yaptı, iz yok. Sınıf değişkenine liste bağlamak neden veri kaybettirir. Sınıf gövdesindeki `kalemler = []` tek çekmecedir; bütün örnekler o çekmeceyi paylaşır. Birinin `append`’i öbürünün fişini kirletir. Fail-closed (Hata Anında Kapalı) burada durur: örnek durumu `__init__` içinde doğar, kalıpta yaşamaz. Adet sıfır veya eksi ise örnek açılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Paylaşılan listeyi bir kez kır. Sonra dürüst `Siparis` kalıbını bas. Önce sızıntıyı gör. `a.kalemler` ve `b.kalemler` aynı listedir. Sonra her örnek kendi `adet`’ini `__init__`’te alır. Kalıbı düzelt. İki sipariş birbirini ezmesin; eksi adet kapıyı kapatsın. `self` o tepsinin kendisidir. `bir is iki` False durur: aynı kalıp, ayrı somun.",
    summary: "Bu dersle Nesne Yönelimli Programlama: class ve instance mantığı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kalıp ortak, tepsi ayrı. Dict gezdirmek iz bırakmaz, doğru mu. Sınıf tarifi, örnek sahadaki kaydı tutar. Durumu kalıba gömme. Bir sonraki bölümde seni miras alma ve kapsülleme bekliyor: kim neyi görür, kim neyi değiştiremez.",
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
    code: {
      language: "py",
      source: "class YanlisSepet:\n    kalemler = []\n\n\na = YanlisSepet()\nb = YanlisSepet()\na.kalemler.append(\"ekmek\")\nassert b.kalemler == [\"ekmek\"]  # sızıntı\nassert a.kalemler is b.kalemler",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-orta-2",
    order: 2,
    title: "Miras alma ve kapsülleme: sınırlı erişim",
    intro: "Hoş geldiniz. Bu bölümde Miras alma ve kapsülleme: sınırlı erişim konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Bakkal tezgâhı oğula geçer; kasa şifresi çekmecede kalır. Miras (inheritance) tezgâh mı, kapsülleme (encapsulation) kasa kilidi mi. Tezgâh `super().__init__` ile gelir. Kasa `_adet` ile kapalı durur: dışarıdan `raf._adet = -9` yazmak mümkün görünür, sözleşme yasaktır. Dürüst kapı `property` ve `dus` metodudur. Sözleşme yoksa stok eksiye iner, fiş yalan söyler.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Alt sınıf tabanın alanını ezerse veya `adet`’i herkese açarsak saha nerede patlar. İki yerde. Biri: alt sınıf `__init__`’i unutup tabanı boş bırakır. Öbürü: `self.adet -= n` herkesin elinde; eksi stok sessizce basılır. Fail-closed kapısı `StokHatasi` fırlatır, orta değer uydurmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Taban stok, alt sınıf satış. Kapsül kırılsın, hata isimli dursun. `_adet` içeridedir. `sat` yalnız `dus` çağırır. Yetersiz stokta işlem durur; kalan 2’de kalır.",
    summary: "Bu dersle Miras alma ve kapsülleme: sınırlı erişim becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Miras tezgâhı taşır, kapsül kasayı kilitler. Doğru mu. Alt sınıf tabanın işini tekrar yazmadan genişletir. Alan dışarı açık değilse eksi stok yazılmaz. Bir sonraki bölümde seni dosya ve JavaScript Nesne Gösterimi (JSON) bekliyor: kaydı diske dürüst basma.",
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
    code: {
      language: "py",
      source: "class StokHatasi(Exception):\n    pass\n\n\nclass Stok:\n    def __init__(self, adet: int):\n        if adet < 0:\n            raise StokHatasi(\"negatif stok yok\")\n        self._adet = adet\n\n    @property\n    def adet(self) -> int:\n        return self._adet\n\n    def dus(self, n: int) -> int:\n        if n > self._adet:\n            raise StokHatasi(\"stok yetmez; işlem durur\")\n        self._adet -= n\n        return self._adet\n\n\nclass SatisStogu(Stok):\n    def sat(self, n: int) -> int:\n        return self.dus(n)\n\n\nraf = SatisStogu(4)\nassert raf.sat(2) == 2\ntry:\n    raf.sat(9)\nexcept StokHatasi as hata:\n    assert \"yetmez\" in str(hata)\nassert raf.adet == 2",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-orta-3",
    order: 3,
    title: "Dosya işleme ve JSON veri yönetimi",
    intro: "Hoş geldiniz. Bu bölümde Dosya işleme ve JSON veri yönetimi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Noter senedini yarım mühürleyip çekmeceye atmak yasaktır. JavaScript Nesne Gösterimi (JSON) o senet mi, `write_text` mühür mü. JSON metin sözleşmesidir: anahtar-değer, liste, sayı. `json.loads` senedi açar, `json.dumps` mührü basar. `ensure_ascii=False` Türkçe harfi kaçırmaz. Çekmece `pathlib.Path`’tir. Yarım JSON’u diske basmak, boş kâğıda noter damgası vurmak gibidir.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Açık dosyayı unutmak veya bozuk JSON’u yutmak sahada ne kırar. `open` + `close` unutulursa kilit kalır. `Path.write_text(..., encoding=\"utf-8\")` kapağı kendisi kapatır. `json.loads(\"{\")` `JSONDecodeError` basar; yutarsan yarın çöp kaydı üretim sanılır. Fail-closed: parse edilmezse yazılmaz. Atomik yol: geçici dosyaya yaz, sonra `replace`.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Sözlüğü mühürle, bozuk metni reddet. Disk yokken sözleşmeyi kanıtla. `adet` yoksa yazım durur. `sort_keys=True` aynı kaydı her seferinde aynı metne basar — mühür karşılaştırılır. Disk tarafında kapağı kim kapatır. Üstüne yazma riski nerde durur. `Path.write_text` kapağı kapatır. Üretimde geçici yola yazıp `replace` edersin; yarım senet hedefi kirletmez.",
    summary: "Bu dersle Dosya işleme ve JSON veri yönetimi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Parse edilmezse mühür vurulmaz. Sonraki adım hataları isimlendirmek mi. JSON sözleşmesi dürüstse disk yalan söylemez. Bir sonraki bölümde seni try/except ve özel istisnalar bekliyor: hatayı yutma, adı koy.",
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
    code: {
      language: "py",
      source: "import json\n\n\ndef muhurle(veri: dict) -> str:\n    if \"adet\" not in veri:\n        raise ValueError(\"adet yok; yazım durur\")\n    return json.dumps(veri, ensure_ascii=False, sort_keys=True)\n\n\nassert '\"adet\": 3' in muhurle({\"adet\": 3, \"kalem\": \"ekmek\"})\nveri = json.loads('{\"adet\": 3, \"para_birimi\": \"TRY\"}')\nassert veri[\"adet\"] == 3\ntry:\n    json.loads(\"{\")\nexcept json.JSONDecodeError:\n    bozuk = True\nelse:\n    bozuk = False\nassert bozuk is True",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-orta-4",
    order: 4,
    title: "Hata yönetimi: try/except ve özel istisnalar",
    intro: "Hoş geldiniz. Bu bölümde Hata yönetimi: try/except ve özel istisnalar konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Gişede «üç bilet» denince kepenk inmez; fişe «tamsayı değil» yazılır. `except Exception` her şeyi yutmak, gişeyi sağır etmek midir. `bare except` veya geniş `Exception` KeyboardInterrupt’u da yutar; makine durmaz, sen durursun. Özel istisna (`KayitHatasi`) fişin damgasıdır: kod ve cümle ayrı durur. `raise... from exc` zinciri koparmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Biz `except:` yazıp `pass` koyduk. Log’da iz yok, kasa yanlış kesti. Nerde kırılır. İki yerde. Biri: gerçek bug gizlenir. Öbürü: boş girdi sıfır kabul edilir. Fail-closed kapısı tipi ve sınırı ayırır: boş, tip, sınır — üç damga. Çökmek nezaket değildir; isimsiz yutmak ihanettir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Üç damgayı yaz. `üç` ve boş girdi ayrı kod bassın. `int` patlayınca `from exc` ile neden durur. `hata.kod` çağıran tarafa sözleşme verir.",
    summary: "Bu dersle Hata yönetimi: try/except ve özel istisnalar becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Yutmak yok, damga var. Ağ kapısında da aynı disiplin mi durur. try dar tutulur, except isimli durur, zincir kopmaz. Bir sonraki bölümde seni Hipermetin Aktarım Protokolü (HTTP) ve requests bekliyor: 200 olmayan yanıtı yeşil sayma.",
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
    code: {
      language: "py",
      source: "class KayitHatasi(Exception):\n    def __init__(self, kod: str, mesaj: str):\n        super().__init__(mesaj)\n        self.kod = kod\n\n\ndef oku_adet(ham: str) -> int:\n    temiz = ham.strip()\n    if not temiz:\n        raise KayitHatasi(\"bos\", \"boş girdi; işlem durur\")\n    try:\n        adet = int(temiz)\n    except ValueError as exc:\n        raise KayitHatasi(\"tip\", \"tamsayı değil; işlem durur\") from exc\n    if adet <= 0:\n        raise KayitHatasi(\"sinir\", \"adet pozitif olmalı\")\n    return adet\n\n\nassert oku_adet(\"4\") == 4\ntry:\n    oku_adet(\"üç\")\nexcept KayitHatasi as hata:\n    assert hata.kod == \"tip\"\ntry:\n    oku_adet(\"  \")\nexcept KayitHatasi as hata:\n    assert hata.kod == \"bos\"",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-orta-5",
    order: 5,
    title: "HTTP istekleri ve API entegrasyonu (requests)",
    intro: "Hoş geldiniz. Bu bölümde HTTP istekleri ve API entegrasyonu (requests) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. PTT gişesinde mektup gitti diye teslim olmaz. Damga 200’dür, 404 adres yoktur, 500 gişe yanmıştır. Hipermetin Aktarım Protokolü (HTTP) bu damga mı. Bu. `requests.get(url, timeout=8)` mektubu yollar. `timeout` yoksa kuyruk sonsuz bekler. Uygulama Programlama Arayüzü (API) karşı tarafın sözleşmesidir. `yanit.ok` True iken gövde yine çöp olabilir; Fail-closed önce durumu, sonra tipi okur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. 500 gövdede `{\"ok\": true}` basınca biz yeşil tik yaktık. Veri kaybı nerde. Durum kodu yalanı örtmez. 200 değilse kayıt durur; gövdeye bakılmaz. `yanit.json()` liste gelirse sözlük bekleyen kod KeyError yer. Şema yoksa `id` eksik kaydı mühürlersin. Ağ hatası `requests.RequestException`’dır; yutma.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Sahte yanıtla kapıyı yaz. 500 durdurulsun, 200 sözlük açılsın. `requests` üretim çağrısıdır. Laboratuvarda aynı kapıyı sahte yanıtla deneriz; ağ yok, sözleşme aynıdır. Üretim satırı nasıl durur. Timeout ve import nerde. `requests` üçüncü parti kütüphanedir; sanal ortamda kurulur. Çağrı tek kapıdan geçer: get, timeout, oku_json.",
    summary: "Bu dersle HTTP istekleri ve API entegrasyonu (requests) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Damga 200 değilse çekmeceye senet girmez. Kapanışta bunu JSON’a mühürleyecek miyiz. HTTP durumu sözleşme, gövde ikinci kapıdır. Bir sonraki bölümde seni mini proje bekliyor: Temsili Durum Transferi (REST) yanıtını doğrulayıp JSON dosyasına basma.",
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
    code: {
      language: "py",
      source: "def oku_json(yanit) -> dict:\n    if yanit.status_code != 200:\n        raise ValueError(f\"durum {yanit.status_code}; kayıt durur\")\n    veri = yanit.json()\n    if not isinstance(veri, dict):\n        raise ValueError(\"gövde sözlük değil; kayıt durur\")\n    return veri\n\n\nclass SahteYanit:\n    def __init__(self, status_code: int, govde):\n        self.status_code = status_code\n        self._govde = govde\n\n    def json(self):\n        return self._govde\n\n\nassert oku_json(SahteYanit(200, {\"id\": 1}))[\"id\"] == 1\ntry:\n    oku_json(SahteYanit(500, {\"ok\": True}))\nexcept ValueError as hata:\n    assert \"500\" in str(hata)\ntry:\n    oku_json(SahteYanit(200, [1, 2]))\nexcept ValueError as hata:\n    assert \"sözlük\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-orta-6",
    order: 6,
    title: "Mini proje: REST API'den JSON dosyasına mühür",
    intro: "Hoş geldiniz. Bu bölümde Mini proje: REST API'den JSON dosyasına mühür konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Resmî gazete kupürünü arşiv çekmecesine koyarsın. Kupürde sayı yoksa mühür vurulmaz. Temsili Durum Transferi (REST) yanıtı kupür, JSON dosyası çekmece mi. Akış tek cümledir: çek → durum oku → şema doğrula → mühürle. Ortada `id` yoksa dosya yazılmaz. Fail-closed kapısı yarım arşivi üretmez. `indent=2` insan okur; üretim hash’i `sort_keys` ile sabitlenir.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ağ 200 döndü diye `Path.write_text` çalıştırırsak hangi kayıt kaybolur. Eksik `id`. Liste gövde. 200 olup içi boş sözlük. Bunlar çekmeceye girerse yarın kimse fark etmez. Doğrulama yazımdan önce durur. İstisna yukarı fırlar; çağıran taraf dosyayı açmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek fonksiyon: sahte 200’ü mühürle, `id` yoksa dur. Aynı kapı üretime `requests.get` ile bağlanır. Laboratuvar ağa çıkmaz; sözleşme assert ile sabitlenir.",
    summary: "Bu dersle Mini proje: REST API'den JSON dosyasına mühür becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Orta kapanış bu mu: sınıf, kapsül, JSON, isimli hata, HTTP damgası, mühür. Çekilir, doğrulanır, mühürlenir. Eksik alan diske inmez. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
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
    code: {
      language: "py",
      source: "import json\n\n\ndef cek_ve_muhurle(yanit, zorunlu=(\"id\",)) -> str:\n    if yanit.status_code != 200:\n        raise ValueError(\"istek durur; dosya yazılmaz\")\n    veri = yanit.json()\n    if not isinstance(veri, dict):\n        raise ValueError(\"gövde sözlük değil\")\n    for alan in zorunlu:\n        if alan not in veri:\n            raise ValueError(f\"{alan} yok; mühür durur\")\n    return json.dumps(veri, ensure_ascii=False, indent=2)\n\n\nclass SahteYanit:\n    def __init__(self, status_code: int, govde):\n        self.status_code = status_code\n        self._govde = govde\n\n    def json(self):\n        return self._govde\n\n\nmetin = cek_ve_muhurle(SahteYanit(200, {\"id\": 7, \"adet\": 3}))\nassert '\"id\": 7' in metin\ntry:\n    cek_ve_muhurle(SahteYanit(200, {\"adet\": 3}))\nexcept ValueError as hata:\n    assert \"id\" in str(hata)\ntry:\n    cek_ve_muhurle(SahteYanit(404, {\"id\": 7}))\nexcept ValueError as hata:\n    assert \"durur\" in str(hata)",
    },
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
