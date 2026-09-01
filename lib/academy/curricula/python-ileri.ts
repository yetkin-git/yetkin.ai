/**
 * Python İleri Seviye — Mimari, asenkron programlama ve performans.
 * PEDAGOJI.md: 5 perde, DialogueTurn[], Maya %95 / Koray %96 (tecrübeli partner), Fail-Closed.
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

export const PYTHON_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "python-ileri-1",
    order: 1,
    title: "Üst Düzey Fonksiyonlar ve Decorator (Bezetici) Mimarisi",
    dialogue: {
      warmup: [
        koray(
          "PTT gişesinde her koliye gümrük damgası basılır. Damga kolinin içini değiştirmez; kapıyı sarar. Decorator (bezetici) o damga mı?",
        ),
        maya(
          "O. Fonksiyon işi yapar; bezetici onu sarar: log, süre, yetki, Fail-closed (Hata Anında Kapalı) kapısı. İç tarif aynı kalır, sözleşme dışarıda durur. Damgayı her koliye elle basarsan yarın bir gişe unutulur.",
        ),
      ],
      problem: [
        koray("Her rotaya `if adet <= 0` kopyalarsak bellek ve CPU nerede sızar?"),
        maya(
          "Kopya çoğalır, kapı sapar. Biri eksi adeti geçirir; öbürü sessiz 0 basar. Büyük sistemde darboğaz tarif değil, dağınık kapıdır. Fail-closed tek bezeticide durur: bozuk argüman içeri girmez.",
        ),
      ],
      development: [
        koray("Tek damga. Eksi adet içeri girmesin."),
        maya(
          "`functools.wraps` adı ve imzayı korur. Bezetici `adet <= 0` ise ValueError basar; iç fonksiyon çağrılmaz.",
          {
            language: "py",
            source: `from functools import wraps


def pozitif_gerekir(fn):
    @wraps(fn)
    def sarmal(adet, *args, **kwargs):
        if adet <= 0:
            raise ValueError("adet pozitif olmalı; işlem durur")
        return fn(adet, *args, **kwargs)

    return sarmal


@pozitif_gerekir
def etiket(adet: int) -> str:
    return f"{adet} etiket"


assert etiket(3) == "3 etiket"
assert etiket.__name__ == "etiket"
try:
    etiket(0)
except ValueError as hata:
    assert "pozitif" in str(hata)`,
          },
        ),
        koray("Parametreli damga sıra nasıl durur?"),
        maya(
          "Önce fabrika, sonra bezetici, sonra iş. `@kayit(\"gişe\")` önce çağrılır, dekoratör döner, sonra `def` sarılır.",
          {
            language: "py",
            source: `from functools import wraps


def kayit(kaynak: str):
    def bezet(fn):
        @wraps(fn)
        def sarmal(*args, **kwargs):
            sonuc = fn(*args, **kwargs)
            return {"kaynak": kaynak, "sonuc": sonuc}

        return sarmal

    return bezet


@kayit("gişe")
def ok() -> str:
    return "tamam"


assert ok() == {"kaynak": "gişe", "sonuc": "tamam"}`,
          },
        ),
      ],
      conclusion: [
        koray("Kapı tek yerde. Üreteç mi sıradaki darboğaz?"),
        maya(
          "Bezetici sözleşmeyi sarar; iş fonksiyonu sade kalır. Bir sonraki bölümde seni üreteçler (generators) ve bellek dostu veri akışları bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "python-ileri-2",
    order: 2,
    title: "Üreteçler (Generators) ve Bellek Dostu Veri Akışları",
    dialogue: {
      warmup: [
        koray(
          "Gişe fiş makinesi kuyruğa tek fiş verir. Depoyu kamyona boşaltırsan tezgâh çöker. Iterator (yineleyici) fiş, üreteç (generator) o makine mi?",
        ),
        maya(
          "Liste bütün kolileri belleğe yığar. `yield` her adımda bir fiş verir; rastgele erişim belleği (RAM) şişmez. Büyük günlük dosyasında `readlines()` sızıntıdır. Fail-closed kapısı bozuk kayıtta akışı keser; yarım liste uydurmaz.",
        ),
      ],
      problem: [
        koray("`list(milyon_kayit)` neden bellek sızdırır?"),
        maya(
          "Tek seferde hepsi yaşar. Gişe kuyruğu durur, merkeze işlem birimi (CPU) çöp toplamaya gömülür. Iterator protokolü `__iter__` / `__next__`; `StopIteration` dürüst biter. `id` yoksa yield yok.",
        ),
      ],
      development: [
        koray("Fiş makinesini yaz. `id` yoksa akış dursun."),
        maya(
          "`yield` bir kayıt verir, fonksiyonu dondurur. `list(...)` ancak sen istersen yığar. Laboratuvarda üç kayıt yeter; üretimde dosya satırı aynı kapıdan geçer.",
          {
            language: "py",
            source: `def fis_akisi(kayitlar):
    for kayit in kayitlar:
        if not isinstance(kayit, dict) or "id" not in kayit:
            raise ValueError("id yok; akış durur")
        yield kayit["id"]


def topla_lazy(kayitlar) -> int:
    toplam = 0
    for kimlik in fis_akisi(kayitlar):
        toplam += kimlik
    return toplam


assert topla_lazy([{"id": 1}, {"id": 2}]) == 3
assert list(fis_akisi([{"id": 7}])) == [7]
try:
    list(fis_akisi([{"id": 1}, {}]))
except ValueError as hata:
    assert "id" in str(hata)`,
          },
        ),
        koray("`next` iki kez; üçüncü ne basar?"),
        maya(
          "Üreteç tükenince `StopIteration` dürüst biter. `for` onu yutar. Elle `next` çağırıyorsan tükenişi yakala; sessiz `None` basma.",
          {
            language: "py",
            source: `g = (n for n in (1, 2) if n > 0)
assert next(g) == 1
assert next(g) == 2
try:
    next(g)
except StopIteration:
    pass`,
          },
        ),
      ],
      conclusion: [
        koray("Bellek fiş fiş. Asenkron gişe mi sırada?"),
        maya(
          "Üreteç akışı taşır, liste yığmaz. Bir sonraki bölümde seni asyncio ve async/await mantığı bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "python-ileri-3",
    order: 3,
    title: "Asenkron Programlama: asyncio ve async/await Mantığı",
    dialogue: {
      warmup: [
        koray(
          "Tek gişeci üç kuyruğa bakar: biri fotokopi beklerken öbürüne damga basar. asyncio olay döngüsü o gişeci mi?",
        ),
        maya(
          "O. `async def` korutin tarifidir; `await` giriş-çıkış (I/O) beklerken gişeyi boşaltır. `time.sleep` gişeyi kapatır; `asyncio.sleep` öbür kuyruğa geçer. Fail-closed: durum 200 değilse kayıt durur, gather orta değer basmaz.",
        ),
      ],
      problem: [
        koray("`time.sleep` async içinde CPU’yu neden kilitler?"),
        maya(
          "Olay döngüsü tek iş parçacığındadır. Senkron uyku bütün gişeyi dondurur; bekleyen korutinler açılmaz. Bellek sızıntısı da burada: iptal edilmeyen görev kuyrukta yaşar. `Task`’i iptal et, istisnayı yutma.",
        ),
      ],
      development: [
        koray("Üç gişe birden; 500 durdurulsun."),
        maya(
          "`asyncio.gather` hepsini birlikte bekler. Biri ValueError basarsa hepsi durur; yarım liste dönmez. `asyncio.run` laboratuvar kapısıdır.",
          {
            language: "py",
            source: `import asyncio


async def cek(durum: int, govde: dict) -> dict:
    await asyncio.sleep(0)
    if durum != 200:
        raise ValueError(f"durum {durum}; kayıt durur")
    if "id" not in govde:
        raise ValueError("id yok; kayıt durur")
    return govde


async def topla():
    return await asyncio.gather(
        cek(200, {"id": 1}),
        cek(200, {"id": 2}),
    )


sonuc = asyncio.run(topla())
assert [k["id"] for k in sonuc] == [1, 2]
try:
    asyncio.run(cek(500, {"ok": True}))
except ValueError as hata:
    assert "500" in str(hata)`,
          },
        ),
      ],
      conclusion: [
        koray("Gişe beklerken boş durmaz. İş parçacığı mı, süreç mi?"),
        maya(
          "await I/O bekler; CPU işini sıraya koymaz. Bir sonraki bölümde seni iş parçacığı ve süreç yönetimi bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "python-ileri-4",
    order: 4,
    title: "Çoklu İş Parçacığı ve Süreç Yönetimi (Threading vs Multiprocessing)",
    dialogue: {
      warmup: [
        koray(
          "Tek fırın tezgâhında iki çırak aynı merdaneyi paylaşır. Ayrı fırın ayrı tezgâh. Thread merdane, process ayrı fırın mı?",
        ),
        maya(
          "Küresel Yorumlayıcı Kilidi (GIL) aynı yorumlayıcıda CPU işini sıraya koyar: thread I/O’da gişeyi boşaltır, CPU’da birbirini bekler. Ayrı süreç ayrı yorumlayıcıdır; bellek paylaşılmaz. Fail-closed: paylaşılan sayacı korumasız artırma; yarış durumu sessiz sızıntıdır.",
        ),
      ],
      problem: [
        koray("CPU-yoğun işi thread havuzuna atarsak darboğaz nerede?"),
        maya(
          "GIL. Çıraklar aynı merdaneyi kaptırır; süre kısalmaz, bağlam maliyeti artar. I/O-yoğun işte thread doğru seçimdir. CPU-yoğun işte `multiprocessing` ayrı fırın açar. Paylaşılan listeye korumasız `append` bellek ve doğruluk sızdırır.",
        ),
      ],
      development: [
        koray("Sayaç koruması. Sonra CPU/I/O seçimini yaz."),
        maya(
          "`threading.Lock` kritik bölümü tek çıraka verir. Süreç seçimi sözleşmedir: I/O → thread, CPU → process. Laboratuvar assert ile sabitler; üretimde havuz boyutu üst sınırdır.",
          {
            language: "py",
            source: `from threading import Lock


class Sayac:
    def __init__(self):
        self._n = 0
        self._manda = Lock()

    def artir(self) -> int:
        with self._manda:
            self._n += 1
            return self._n


s = Sayac()
assert s.artir() == 1
assert s.artir() == 2

IO_UYGUN = "thread"
CPU_UYGUN = "process"


def cpu_mu(is_turu: str) -> str:
    if is_turu not in ("bekle", "carpma"):
        raise ValueError("iş türü yok; seçim durur")
    return CPU_UYGUN if is_turu == "carpma" else IO_UYGUN


assert IO_UYGUN != CPU_UYGUN
assert cpu_mu("carpma") == CPU_UYGUN
assert cpu_mu("bekle") == IO_UYGUN
try:
    cpu_mu("bilinmez")
except ValueError as hata:
    assert "tür" in str(hata)`,
          },
        ),
      ],
      conclusion: [
        koray("I/O thread, CPU process. Kalıbın kalıbı mı sırada?"),
        maya(
          "GIL CPU’yu sıraya koyar; süreç ayrı fırındır. Bir sonraki bölümde seni metaclass ve ileri nesne modeli bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "python-ileri-5",
    order: 5,
    title: "Metaclass'lar ve İleri Düzey Nesne Modeli",
    dialogue: {
      warmup: [
        koray(
          "Matbaa klişesi kalıbı basar; kalıp somunu basar. Metaclass klişe, class kalıp, instance somun mu?",
        ),
        maya(
          "O. `type` varsayılan klişedir. Kendi klişen sınıf doğmadan sözleşmeyi tarar: zorunlu metot yoksa sınıf açılmaz. Fail-closed burada sınıf kapısında durur; bozuk kalıp sahaya inmez. Bellek sızıntısı: klişede paylaşılan liste, orta dersteki sınıf değişkeni gibi bütün kalıpları kirletir.",
        ),
      ],
      problem: [
        koray("Kayıt sınıfı `dogrula` taşımazsa saha nerede patlar?"),
        maya(
          "Örnek açılır, `dogrula` AttributeError ile gece patlar. Klişe `__new__` içinde `dogrula` yoksa TypeError basar; sınıf hiç doğmaz. Bu, dekoratörden daha erken kapıdır.",
        ),
      ],
      development: [
        koray("Klişeyi yaz. `dogrula` yoksa kalıp açılmasın."),
        maya(
          "`type.__new__` sınıf nesnesini üretir. Biz önce sözlüğü tararız. `Kayit` açılır; `Bozuk` açılmaz.",
          {
            language: "py",
            source: `class KapaliMeta(type):
    def __new__(mcs, name, bases, ns):
        if name != "KapaliMeta" and "dogrula" not in ns:
            raise TypeError("dogrula yok; sınıf açılmaz")
        return super().__new__(mcs, name, bases, ns)


class Kayit(metaclass=KapaliMeta):
    def dogrula(self, veri):
        if not isinstance(veri, dict) or "id" not in veri:
            raise ValueError("id yok; kayıt durur")
        return veri


k = Kayit()
assert k.dogrula({"id": 7})["id"] == 7
try:
    class Bozuk(metaclass=KapaliMeta):
        pass
except TypeError as hata:
    assert "dogrula" in str(hata)`,
          },
        ),
      ],
      conclusion: [
        koray("Kalıp doğmadan kapı. Mini proje bu halkaları birleştirir mi?"),
        maya(
          "Metaclass sınıf sözleşmesini mühürler. Bir sonraki bölümde seni asenkron veri toplama ve yüksek performanslı işleme motoru bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "python-ileri-6",
    order: 6,
    title: "Mini Proje: Asenkron Veri Toplama ve Yüksek Performanslı İşleme Motoru",
    dialogue: {
      warmup: [
        koray(
          "Üç kargo gişesinden fiş aynı anda toplanır, teker teker tartılır, bozuk damga tartıya inmez. Motor bu sıra mı?",
        ),
        maya(
          "O. `asyncio.gather` gişeleri birlikte bekler. Üreteç tartıda belleği şişirmez. Bezetici veya açık kapı durum 200 ve `id` ister. Fail-closed: bir gişe 500 ise motor durur; yarım rapor diske inmez.",
        ),
      ],
      problem: [
        koray("Hepsini listeye yığıp sonra `for` ile işlersek darboğaz nerede durur?"),
        maya(
          "RAM şişer, I/O sıraya girer, CPU çöp toplar. Dürüst motor: çek (async) → doğrula → yield ile işle. `return_exceptions=True` ile yutmak ihanettir; hata yukarı fırlar.",
        ),
      ],
      development: [
        koray("Motoru bas. 500 ve eksik id dursun; iki sağlam fiş 10 ve 20 olsun."),
        maya(
          "Sahte gişe ağa çıkmaz. Sözleşme üretim `aiohttp` ile aynıdır: durum, şema, akış. `isle_akim` üreteçtir; `list` ancak kapanışta istenir.",
          {
            language: "py",
            source: `import asyncio


async def cek_sube(sube: dict) -> dict:
    await asyncio.sleep(0)
    if sube.get("durum") != 200:
        raise ValueError("durum dürüst değil; motor durur")
    if "id" not in sube:
        raise ValueError("id yok; motor durur")
    return sube


def isle_akim(kayitlar):
    for kayit in kayitlar:
        yield kayit["id"] * 10


async def motor(subeler: list) -> list:
    ham = await asyncio.gather(*(cek_sube(sube) for sube in subeler))
    return list(isle_akim(ham))


sonuc = asyncio.run(
    motor(
        [
            {"durum": 200, "id": 1},
            {"durum": 200, "id": 2},
        ]
    )
)
assert sonuc == [10, 20]
try:
    asyncio.run(motor([{"durum": 500, "id": 1}]))
except ValueError as hata:
    assert "durum" in str(hata)
try:
    asyncio.run(motor([{"durum": 200}]))
except ValueError as hata:
    assert "id" in str(hata)`,
          },
        ),
      ],
      conclusion: [
        koray("Çek, doğrula, akıt. İleri kapanış bu mu?"),
        maya(
          "Gişeler birlikte bekler, akış bellek dostudur, bozuk damga tartıya inmez. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
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
