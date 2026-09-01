/**
 * Python İleri Seviye — Mimari, asenkron programlama ve performans.
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

export const PYTHON_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "python-ileri-1",
    order: 1,
    title: "Üst Düzey Fonksiyonlar ve Decorator (Bezetici) Mimarisi",
    intro: "Hoş geldiniz. Bu bölümde Üst Düzey Fonksiyonlar ve Decorator (Bezetici) Mimarisi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. PTT gişesinde her koliye gümrük damgası basılır. Damga kolinin içini değiştirmez; kapıyı sarar. Decorator (bezetici) o damga mı. Fonksiyon işi yapar; bezetici onu sarar: log, süre, yetki, Fail-closed (Hata Anında Kapalı) kapısı. İç tarif aynı kalır, sözleşme dışarıda durur. Damgayı her koliye elle basarsan yarın bir gişe unutulur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Her rotaya `if adet <= 0` kopyalarsak bellek ve CPU nerede sızar. Kopya çoğalır, kapı sapar. Biri eksi adeti geçirir; öbürü sessiz 0 basar. Büyük sistemde darboğaz tarif değil, dağınık kapıdır. Fail-closed tek bezeticide durur: bozuk argüman içeri girmez.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek damga. Eksi adet içeri girmesin. `functools.wraps` adı ve imzayı korur. Bezetici `adet <= 0` ise ValueError basar; iç fonksiyon çağrılmaz. Parametreli damga sıra nasıl durur. Önce fabrika, sonra bezetici, sonra iş. `@kayit(\"gişe\")` önce çağrılır, dekoratör döner, sonra `def` sarılır.",
    summary: "Bu dersle Üst Düzey Fonksiyonlar ve Decorator (Bezetici) Mimarisi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kapı tek yerde. Üreteç mi sıradaki darboğaz. Bezetici sözleşmeyi sarar; iş fonksiyonu sade kalır. Bir sonraki bölümde seni üreteçler (generators) ve bellek dostu veri akışları bekliyor.",
    quiz: [
      mcq(
        "q_pyi1_1",
        "Decorator (bezetici) neyi değiştirmeden neyi sarar?",
        ["Sınıf adını", "İç fonksiyonun işini; kapı ve gözlemi dışarıda tutar", "Modül yolunu", "GIL’i kaldırır"],
        1,
      ),
      mcq(
        "q_pyi1_2",
        "Fail-closed (Hata Anında Kapalı) bezeticisi adet ≤ 0 iken ne yapar?",
        ["0 uydurur", "İç fonksiyonu çağırmaz; ValueError basar", "None döner", "print yeter"],
        1,
      ),
      mcq(
        "q_pyi1_3",
        "`functools.wraps` neden durur?",
        ["Hız", "Sarılan fonksiyonun adı ve imzası kaybolmasın", "GIL açılır", "async zorunlu"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "from functools import wraps\n\n\ndef pozitif_gerekir(fn):\n    @wraps(fn)\n    def sarmal(adet, *args, **kwargs):\n        if adet <= 0:\n            raise ValueError(\"adet pozitif olmalı; işlem durur\")\n        return fn(adet, *args, **kwargs)\n\n    return sarmal\n\n\n@pozitif_gerekir\ndef etiket(adet: int) -> str:\n    return f\"{adet} etiket\"\n\n\nassert etiket(3) == \"3 etiket\"\nassert etiket.__name__ == \"etiket\"\ntry:\n    etiket(0)\nexcept ValueError as hata:\n    assert \"pozitif\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-ileri-2",
    order: 2,
    title: "Üreteçler (Generators) ve Bellek Dostu Veri Akışları",
    intro: "Hoş geldiniz. Bu bölümde Üreteçler (Generators) ve Bellek Dostu Veri Akışları konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Gişe fiş makinesi kuyruğa tek fiş verir. Depoyu kamyona boşaltırsan tezgâh çöker. Iterator (yineleyici) fiş, üreteç (generator) o makine mi. Liste bütün kolileri belleğe yığar. `yield` her adımda bir fiş verir; rastgele erişim belleği (RAM) şişmez. Büyük günlük dosyasında `readlines()` sızıntıdır. Fail-closed kapısı bozuk kayıtta akışı keser; yarım liste uydurmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. `list(milyon_kayit)` neden bellek sızdırır. Tek seferde hepsi yaşar. Gişe kuyruğu durur, merkeze işlem birimi (CPU) çöp toplamaya gömülür. Iterator protokolü `__iter__` / `__next__`; `StopIteration` dürüst biter. `id` yoksa yield yok.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Fiş makinesini yaz. `id` yoksa akış dursun. `yield` bir kayıt verir, fonksiyonu dondurur. `list(...)` ancak sen istersen yığar. Laboratuvarda üç kayıt yeter; üretimde dosya satırı aynı kapıdan geçer. `next` iki kez; üçüncü ne basar. Üreteç tükenince `StopIteration` dürüst biter. `for` onu yutar. Elle `next` çağırıyorsan tükenişi yakala; sessiz `None` basma.",
    summary: "Bu dersle Üreteçler (Generators) ve Bellek Dostu Veri Akışları becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Bellek fiş fiş. Asenkron gişe mi sırada. Üreteç akışı taşır, liste yığmaz. Bir sonraki bölümde seni asyncio ve async/await mantığı bekliyor.",
    quiz: [
      mcq(
        "q_pyi2_1",
        "`yield` ile `return [hepsi]` farkı nedir?",
        ["Yoktur", "yield bellek dostu akış; liste hepsini birden taşır", "yield daha yavaş zorunlu", "return yasak"],
        1,
      ),
      mcq(
        "q_pyi2_2",
        "Bozuk kayıtta Fail-closed (Hata Anında Kapalı) üreteç ne yapar?",
        ["Atlar", "ValueError; akış durur", "None yield eder", "boş liste"],
        1,
      ),
      mcq(
        "q_pyi2_3",
        "Üreteç tükenince dürüst damga hangisidir?",
        ["None sonsuz", "StopIteration; for yutar", "0", "MemoryError zorunlu"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "def fis_akisi(kayitlar):\n    for kayit in kayitlar:\n        if not isinstance(kayit, dict) or \"id\" not in kayit:\n            raise ValueError(\"id yok; akış durur\")\n        yield kayit[\"id\"]\n\n\ndef topla_lazy(kayitlar) -> int:\n    toplam = 0\n    for kimlik in fis_akisi(kayitlar):\n        toplam += kimlik\n    return toplam\n\n\nassert topla_lazy([{\"id\": 1}, {\"id\": 2}]) == 3\nassert list(fis_akisi([{\"id\": 7}])) == [7]\ntry:\n    list(fis_akisi([{\"id\": 1}, {}]))\nexcept ValueError as hata:\n    assert \"id\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-ileri-3",
    order: 3,
    title: "Asenkron Programlama: asyncio ve async/await Mantığı",
    intro: "Hoş geldiniz. Bu bölümde Asenkron Programlama: asyncio ve async/await Mantığı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Tek gişeci üç kuyruğa bakar: biri fotokopi beklerken öbürüne damga basar. asyncio olay döngüsü o gişeci mi. `async def` korutin tarifidir; `await` giriş-çıkış (I/O) beklerken gişeyi boşaltır. `time.sleep` gişeyi kapatır; `asyncio.sleep` öbür kuyruğa geçer. Fail-closed: durum 200 değilse kayıt durur, gather orta değer basmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. `time.sleep` async içinde CPU’yu neden kilitler. Olay döngüsü tek iş parçacığındadır. Senkron uyku bütün gişeyi dondurur; bekleyen korutinler açılmaz. Bellek sızıntısı da burada: iptal edilmeyen görev kuyrukta yaşar. `Task`’i iptal et, istisnayı yutma.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Üç gişe birden; 500 durdurulsun. `asyncio.gather` hepsini birlikte bekler. Biri ValueError basarsa hepsi durur; yarım liste dönmez. `asyncio.run` laboratuvar kapısıdır.",
    summary: "Bu dersle Asenkron Programlama: asyncio ve async/await Mantığı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Gişe beklerken boş durmaz. İş parçacığı mı, süreç mi. await I/O bekler; CPU işini sıraya koymaz. Bir sonraki bölümde seni iş parçacığı ve süreç yönetimi bekliyor.",
    quiz: [
      mcq(
        "q_pyi3_1",
        "`await` neyi beklerken gişeyi boşaltır?",
        ["Yalnız CPU", "Giriş-çıkış (I/O) tamamlanmasını", "GIL’i siler", "Liste zorunlu"],
        1,
      ),
      mcq(
        "q_pyi3_2",
        "`time.sleep` async içinde neden yasaktır?",
        ["Yavaş import", "Olay döngüsünü dondurur; öbür korutin açılmaz", "SyntaxError", "yield ister"],
        1,
      ),
      mcq(
        "q_pyi3_3",
        "`asyncio.gather` bir kol ValueError basınca ne olur?",
        ["Öbürleri sessiz biter", "İstisna yükselir; yarım sonuç Fail-closed durur", "None listesi", "retry sonsuz"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "import asyncio\n\n\nasync def cek(durum: int, govde: dict) -> dict:\n    await asyncio.sleep(0)\n    if durum != 200:\n        raise ValueError(f\"durum {durum}; kayıt durur\")\n    if \"id\" not in govde:\n        raise ValueError(\"id yok; kayıt durur\")\n    return govde\n\n\nasync def topla():\n    return await asyncio.gather(\n        cek(200, {\"id\": 1}),\n        cek(200, {\"id\": 2}),\n    )\n\n\nsonuc = asyncio.run(topla())\nassert [k[\"id\"] for k in sonuc] == [1, 2]\ntry:\n    asyncio.run(cek(500, {\"ok\": True}))\nexcept ValueError as hata:\n    assert \"500\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-ileri-4",
    order: 4,
    title: "Çoklu İş Parçacığı ve Süreç Yönetimi (Threading vs Multiprocessing)",
    intro: "Hoş geldiniz. Bu bölümde Çoklu İş Parçacığı ve Süreç Yönetimi (Threading vs Multiprocessing) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Tek fırın tezgâhında iki çırak aynı merdaneyi paylaşır. Ayrı fırın ayrı tezgâh. Thread merdane, process ayrı fırın mı. Küresel Yorumlayıcı Kilidi (GIL) aynı yorumlayıcıda CPU işini sıraya koyar: thread I/O’da gişeyi boşaltır, CPU’da birbirini bekler. Ayrı süreç ayrı yorumlayıcıdır; bellek paylaşılmaz. Fail-closed: paylaşılan sayacı korumasız artırma; yarış durumu sessiz sızıntıdır.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. CPU-yoğun işi thread havuzuna atarsak darboğaz nerede. GIL. Çıraklar aynı merdaneyi kaptırır; süre kısalmaz, bağlam maliyeti artar. I/O-yoğun işte thread doğru seçimdir. CPU-yoğun işte `multiprocessing` ayrı fırın açar. Paylaşılan listeye korumasız `append` bellek ve doğruluk sızdırır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Sayaç koruması. Sonra CPU/I/O seçimini yaz. `threading.Lock` kritik bölümü tek çıraka verir. Süreç seçimi sözleşmedir: I/O → thread, CPU → process. Laboratuvar assert ile sabitler; üretimde havuz boyutu üst sınırdır.",
    summary: "Bu dersle Çoklu İş Parçacığı ve Süreç Yönetimi (Threading vs Multiprocessing) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. I/O thread, CPU process. Kalıbın kalıbı mı sırada. GIL CPU’yu sıraya koyar; süreç ayrı fırındır. Bir sonraki bölümde seni metaclass ve ileri nesne modeli bekliyor.",
    quiz: [
      mcq(
        "q_pyi4_1",
        "Küresel Yorumlayıcı Kilidi (GIL) thread’de CPU işini neden sıraya koyar?",
        ["Silinmiştir", "Tek yorumlayıcı; aynı anda bir bytecode", "Process yasak", "async zorunlu"],
        1,
      ),
      mcq(
        "q_pyi4_2",
        "CPU-yoğun iş için dürüst seçim hangisidir?",
        ["Daha fazla thread", "Ayrı süreç (multiprocessing)", "time.sleep", "global liste"],
        1,
      ),
      mcq(
        "q_pyi4_3",
        "Paylaşılan sayacı korumasız artırmanın riski nedir?",
        ["Hızlanır", "Yarış durumu; değer yalan söyler", "GIL kalkar", "async bozulur"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "from threading import Lock\n\n\nclass Sayac:\n    def __init__(self):\n        self._n = 0\n        self._manda = Lock()\n\n    def artir(self) -> int:\n        with self._manda:\n            self._n += 1\n            return self._n\n\n\ns = Sayac()\nassert s.artir() == 1\nassert s.artir() == 2\n\nIO_UYGUN = \"thread\"\nCPU_UYGUN = \"process\"\n\n\ndef cpu_mu(is_turu: str) -> str:\n    if is_turu not in (\"bekle\", \"carpma\"):\n        raise ValueError(\"iş türü yok; seçim durur\")\n    return CPU_UYGUN if is_turu == \"carpma\" else IO_UYGUN\n\n\nassert IO_UYGUN != CPU_UYGUN\nassert cpu_mu(\"carpma\") == CPU_UYGUN\nassert cpu_mu(\"bekle\") == IO_UYGUN\ntry:\n    cpu_mu(\"bilinmez\")\nexcept ValueError as hata:\n    assert \"tür\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-ileri-5",
    order: 5,
    title: "Metaclass'lar ve İleri Düzey Nesne Modeli",
    intro: "Hoş geldiniz. Bu bölümde Metaclass'lar ve İleri Düzey Nesne Modeli konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Matbaa klişesi kalıbı basar; kalıp somunu basar. Metaclass klişe, class kalıp, instance somun mu. `type` varsayılan klişedir. Kendi klişen sınıf doğmadan sözleşmeyi tarar: zorunlu metot yoksa sınıf açılmaz. Fail-closed burada sınıf kapısında durur; bozuk kalıp sahaya inmez. Bellek sızıntısı: klişede paylaşılan liste, orta dersteki sınıf değişkeni gibi bütün kalıpları kirletir.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Kayıt sınıfı `dogrula` taşımazsa saha nerede patlar. Örnek açılır, `dogrula` AttributeError ile gece patlar. Klişe `__new__` içinde `dogrula` yoksa TypeError basar; sınıf hiç doğmaz. Bu, dekoratörden daha erken kapıdır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Klişeyi yaz. `dogrula` yoksa kalıp açılmasın. `type.__new__` sınıf nesnesini üretir. Biz önce sözlüğü tararız. `Kayit` açılır; `Bozuk` açılmaz.",
    summary: "Bu dersle Metaclass'lar ve İleri Düzey Nesne Modeli becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kalıp doğmadan kapı. Mini proje bu halkaları birleştirir mi. Metaclass sınıf sözleşmesini mühürler. Bir sonraki bölümde seni asenkron veri toplama ve yüksek performanslı işleme motoru bekliyor.",
    quiz: [
      mcq(
        "q_pyi5_1",
        "Metaclass neyi üretir?",
        ["Yalnız instance", "Sınıf nesnesini; class’ın sınıfıdır", "Modülü", "GIL’i"],
        1,
      ),
      mcq(
        "q_pyi5_2",
        "Fail-closed metaclass `dogrula` yokken ne yapar?",
        ["Sınıfı yine açar", "TypeError; sınıf doğmaz", "None kalıp", "instance uyarır"],
        1,
      ),
      mcq(
        "q_pyi5_3",
        "Varsayılan klişe hangisidir?",
        ["object yalnız", "type", "super", "asyncio"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "class KapaliMeta(type):\n    def __new__(mcs, name, bases, ns):\n        if name != \"KapaliMeta\" and \"dogrula\" not in ns:\n            raise TypeError(\"dogrula yok; sınıf açılmaz\")\n        return super().__new__(mcs, name, bases, ns)\n\n\nclass Kayit(metaclass=KapaliMeta):\n    def dogrula(self, veri):\n        if not isinstance(veri, dict) or \"id\" not in veri:\n            raise ValueError(\"id yok; kayıt durur\")\n        return veri\n\n\nk = Kayit()\nassert k.dogrula({\"id\": 7})[\"id\"] == 7\ntry:\n    class Bozuk(metaclass=KapaliMeta):\n        pass\nexcept TypeError as hata:\n    assert \"dogrula\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "python-ileri-6",
    order: 6,
    title: "Mini Proje: Asenkron Veri Toplama ve Yüksek Performanslı İşleme Motoru",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Asenkron Veri Toplama ve Yüksek Performanslı İşleme Motoru konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Üç kargo gişesinden fiş aynı anda toplanır, teker teker tartılır, bozuk damga tartıya inmez. Motor bu sıra mı. `asyncio.gather` gişeleri birlikte bekler. Üreteç tartıda belleği şişirmez. Bezetici veya açık kapı durum 200 ve `id` ister. Fail-closed: bir gişe 500 ise motor durur; yarım rapor diske inmez.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Hepsini listeye yığıp sonra `for` ile işlersek darboğaz nerede durur. RAM şişer, I/O sıraya girer, CPU çöp toplar. Dürüst motor: çek (async) → doğrula → yield ile işle. `return_exceptions=True` ile yutmak ihanettir; hata yukarı fırlar.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Motoru bas. 500 ve eksik id dursun; iki sağlam fiş 10 ve 20 olsun. Sahte gişe ağa çıkmaz. Sözleşme üretim `aiohttp` ile aynıdır: durum, şema, akış. `isle_akim` üreteçtir; `list` ancak kapanışta istenir.",
    summary: "Bu dersle Mini Proje: Asenkron Veri Toplama ve Yüksek Performanslı İşleme Motoru becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Çek, doğrula, akıt. İleri kapanış bu mu. Gişeler birlikte bekler, akış bellek dostudur, bozuk damga tartıya inmez. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
    quiz: [
      mcq(
        "q_pyi6_1",
        "Mini motorun dürüst sırası hangisidir?",
        ["listele → uyu → yaz", "async çek → doğrula → üreteçle işle", "thread CPU → glob", "eval → dump"],
        1,
      ),
      mcq(
        "q_pyi6_2",
        "Bir gişe 500 iken gather Fail-closed ne yapar?",
        ["Öbürlerini mühürler", "İstisna; yarım rapor yok", "id=0", "retry sonsuz"],
        1,
      ),
      mcq(
        "q_pyi6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "gather bitince"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "import asyncio\n\n\nasync def cek_sube(sube: dict) -> dict:\n    await asyncio.sleep(0)\n    if sube.get(\"durum\") != 200:\n        raise ValueError(\"durum dürüst değil; motor durur\")\n    if \"id\" not in sube:\n        raise ValueError(\"id yok; motor durur\")\n    return sube\n\n\ndef isle_akim(kayitlar):\n    for kayit in kayitlar:\n        yield kayit[\"id\"] * 10\n\n\nasync def motor(subeler: list) -> list:\n    ham = await asyncio.gather(*(cek_sube(sube) for sube in subeler))\n    return list(isle_akim(ham))\n\n\nsonuc = asyncio.run(\n    motor(\n        [\n            {\"durum\": 200, \"id\": 1},\n            {\"durum\": 200, \"id\": 2},\n        ]\n    )\n)\nassert sonuc == [10, 20]\ntry:\n    asyncio.run(motor([{\"durum\": 500, \"id\": 1}]))\nexcept ValueError as hata:\n    assert \"durum\" in str(hata)\ntry:\n    asyncio.run(motor([{\"durum\": 200}]))\nexcept ValueError as hata:\n    assert \"id\" in str(hata)",
    },
  }),
] as const;

const PYTHON_ILERI_LESSON_QUIZZES: AcademyExamQuestion[] = PYTHON_ILERI_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları. */
export const PYTHON_ILERI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...PYTHON_ILERI_LESSON_QUIZZES,
  mcq("q_pyi_p1", "`@wraps` neyi korur?", ["GIL", "Sarılan fonksiyonun kimliği", "process", "RAM tavanı"], 1),
  mcq("q_pyi_p2", "Üst düzey fonksiyon ne alır?", ["Yalnız int", "Fonksiyon; fonksiyon döndürebilir", "Yalnız class", "GIL"], 1),
  mcq("q_pyi_p3", "`yield from` ne taşır?", ["class", "Başka üretecin akışını", "HTTP", "Lock zorunlu"], 1),
  mcq("q_pyi_p4", "`async def` ne üretir?", ["bytes", "Korutin nesnesi; await ile koşar", "thread", "process"], 1),
  mcq("q_pyi_p5", "`asyncio.run` ne işe yarar?", ["Import", "Olay döngüsünü açıp korutini bitirir", "GIL siler", "thread açar"], 1),
  mcq("q_pyi_p6", "I/O-yoğun işte thread neden uygun olabilir?", ["GIL yok", "Beklerken başka iş yürür", "CPU paralel zorunlu", "yield yasak"], 1),
  mcq("q_pyi_p7", "Process belleği paylaşır mı?", ["Evet her zaman", "Hayır; ayrı adres alanı, veri açıkça geçilir", "GIL paylaşır", "async paylaşır"], 1),
  mcq("q_pyi_p8", "`type(Kayit)` varsayılanı nedir?", ["Kayit", "type", "object yalnız", "super"], 1),
  mcq("q_pyi_p9", "Dekoratör fabrikası neden iki katmanlıdır?", ["Süs", "Parametre alıp gerçek bezeticiyi döndürmek", "GIL", "yield"], 1),
  mcq("q_pyi_p10", "`return_exceptions=True` Fail-closed için riski nedir?", ["Hız", "Hataları yutar; yarım sonuç yeşil görünür", "GIL kalkar", "id zorunlu"], 1),
  mcq("q_pyi_p11", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_pyi_p12", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_pyi_p13", "`StopIteration` for döngüsünde ne olur?", ["Çöker", "Döngü dürüst biter", "None sonsuz", "GIL"], 1),
  mcq("q_pyi_p14", "CPU-yoğun işi asyncio ile çözmek neden yetmez?", ["await yasak", "await I/O bekler; CPU işi gişeyi doldurur", "gather siler", "process yasak"], 1),
];
