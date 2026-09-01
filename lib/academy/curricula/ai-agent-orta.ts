/**
 * AI Agent Orta Seviye — Çoklu ajan ve RAG mimarisi (AI-102).
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

export const AI_AGENT_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "ai-agent-orta-1",
    order: 1,
    title: "RAG (Retrieval-Augmented Generation) Mimarisi ve Embeddings Mantığı",
    dialogue: {
      warmup: [
        koray(
          "Arşivde 80 klasör durur. Avukat hepsini ezberlemez; memur doğru dosyayı çıkarır, avukat o kâğıda bakarak konuşur. Modele 80 sayfayı bir solukta yığmak o memuru kovmak mı?",
        ),
        maya(
          "Kovmak. Artırılmış Geri Çapraz Sorgulama (RAG) o memurdur: önce kanıt parçasını getirir, sonra cümle basar. Gömme (embedding) klasör etiketinin sayıya çevrilmiş halidir; benzerlik o rafta ölçülür, ezberde değil.",
        ),
      ],
      problem: [
        koray("Tek ajanın bağlam penceresi (context window) dolunca saha nasıl yalan söylüyor?"),
        maya(
          "Eski klasör düşer, model yine ağız açar. Kaynak yokken «muhtemelen 18 palet» basmak halüsinasyondur. Fail-closed (Hata Anında Kapalı) burada durur: getiri boşsa üretim yok. Pencere tavanı arşiv değildir.",
        ),
      ],
      development: [
        koray("Kelime örtüşmesiyle kanıt kapısını bir kez kır. Sonra dürüst getiriyi bas."),
        maya(
          "Bu küme kesişimi gerçek gömme modeli değildir; kapıyı gösterir. Eşik altı «Mars» uydurmaz. `getir` boşsa `uret` elini uzatmaz.",
          {
            language: "py",
            source: `BELGE = [
    "Ankara depo: 18 palet un.",
    "Istanbul depo: 14 palet un.",
]


def gom(metin):
    harf = []
    for ch in metin.lower():
        harf.append(ch if ch.isalnum() else " ")
    return set("".join(harf).split())


def benzerlik(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


ESIK = 0.15


def getir(soru):
    vektor = gom(soru)
    aday = []
    for parca in BELGE:
        skor = benzerlik(vektor, gom(parca))
        if skor >= ESIK:
            aday.append((skor, parca))
    aday.sort(reverse=True)
    if not aday:
        raise ValueError("kaynak yok; islem durur")
    return aday[0][1]


def uret(soru):
    kanit = getir(soru)
    return "Kanit: " + kanit


assert "18 palet" in uret("Ankara un stok")
try:
    uret("Mars kolonisi")
except ValueError as hata:
    assert "durur" in str(hata)`,
          },
        ),
        koray("Yani üretim tarifi «önce getir, sonra yaz». Getiri yoksa avukat susar mı?"),
        maya(
          "Susar. RAG üç kapıdır: böl, göm, getir; sonra üret. Sen bu derste o sırayı çiziyorsun; sonraki bölümde seni vektör veritabanı (VectorDB) sorgusu bekliyor.",
        ),
      ],
      conclusion: [
        koray("Kafamda oturdu: pencere arşiv değil, getiri kapı. Sonraki adımda ne duruyor?"),
        maya(
          "Kanıt raftan çıkar, cümle raftan sonra gelir. Bir sonraki bölümde seni vektör veritabanı ile doküman sorgulama bekliyor: koleksiyon yoksa sorgu durur.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_ago1_1",
        "Artırılmış Geri Çapraz Sorgulama (RAG) önce ne yapar?",
        [
          "Pencereye 80 sayfa yığar",
          "Kanıt parçasını getirir, sonra üretir",
          "Eğitim kesitini günceller",
          "Boşken orta palet basar",
        ],
        1,
      ),
      mcq(
        "q_ago1_2",
        "Getiri boşken Fail-closed (Hata Anında Kapalı) ne yapar?",
        [
          "Muhtemel stok uydurur",
          "Üretimi durdurur; kaynak yok der",
          "Önceki sohbeti kanıt sanır",
          "Eşiği sessiz sıfırlar",
        ],
        1,
      ),
      mcq(
        "q_ago1_3",
        "Bu dersteki kelime örtüşmesi gerçek gömme midir?",
        [
          "Evet, aynı fizik",
          "Hayır; kapıyı gösterir, sahte model iddiası yoktur",
          "Evet, cosine zorunlu",
          "Yalnız GPU’da",
        ],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-orta-2",
    order: 2,
    title: "Vektör Veritabanları (VectorDB) ile Doküman Sorgulama",
    dialogue: {
      warmup: [
        koray(
          "Kütüphanede fiş kutusu durur. Kitabı satır satır okumazsın; fişteki etiketle raftan üç cilt çekersin. Bellekteki Python listesi o fiş kutusu mudur, yoksa her sorguda 80 sayfayı baştan mı gezersin?",
        ),
        maya(
          "Liste her seferinde gezilir. Vektör veritabanı (VectorDB) fiş kutusudur: parçayı bir kez gömer, sorguyu komşu vektörle tartar. Koleksiyon yoksa kutu boştur; boş kutudan cilt uydurmazsın.",
        ),
      ],
      problem: [
        koray("Boş koleksiyona sorgu atınca saha nasıl yeşil tik basıyor?"),
        maya(
          "Sürücü «0 sonuç» yerine genel bilgiyle doldurur. Fail-closed (Hata Anında Kapalı) burada durur: `query` boş liste dönerse üretim yok. top-k bir dilekçedir; eşik yoksa gürültü kanıt sanılır.",
        ),
      ],
      development: [
        koray("Koleksiyonu bas, boş sorguyu kır, eşiğin altını düşür."),
        maya(
          "`Koleksiyon` sözlüktür; canlı Chroma değildir. `ekle` boş metni reddeder. `sor` eşiğin altında durur. top-k = 1 yine boşsa kapı kapanır.",
          {
            language: "py",
            source: `class Koleksiyon:
    def __init__(self):
        self.parcalar = []

    def ekle(self, metin):
        temiz = metin.strip()
        if not temiz:
            raise ValueError("bos parca; islem durur")
        self.parcalar.append(temiz)

    def sor(self, soru, esik=0.2):
        if not soru.strip():
            raise ValueError("bos soru; islem durur")
        if not self.parcalar:
            raise ValueError("koleksiyon bos; islem durur")
        hedef = set("".join(ch if ch.isalnum() else " " for ch in soru.lower()).split())
        aday = []
        for parca in self.parcalar:
            kume = set("".join(ch if ch.isalnum() else " " for ch in parca.lower()).split())
            if not kume:
                continue
            skor = len(hedef & kume) / len(hedef | kume)
            if skor >= esik:
                aday.append((skor, parca))
        aday.sort(reverse=True)
        if not aday:
            raise ValueError("esik alti; islem durur")
        return aday[0][1]


raf = Koleksiyon()
try:
    raf.sor("Ankara un")
except ValueError as hata:
    assert "koleksiyon" in str(hata)
raf.ekle("Ankara depo: 18 palet un.")
assert "18 palet" in raf.sor("Ankara un")
try:
    raf.sor("Mars kolonisi")
except ValueError as hata:
    assert "esik" in str(hata)`,
          },
        ),
        koray("Canlı sürücü yarın aynı kapıyı mı kullanır? top-k sessiz 0 dönerse?"),
        maya(
          "Aynı kapı. 0 sonuç «bilmiyorum»dur, Wikipedia doldurma hakkı değildir. Bir sonraki bölümde seni araştırmacı ve yazar ajanın paslaşması bekliyor.",
        ),
      ],
      conclusion: [
        koray("Kutu boşsa sus, eşik altı düşer. Sonraki derste eline ne geçiyor?"),
        maya(
          "Sorgu raftan çıkar, kanıt yoksa cümle yok. Bir sonraki bölümde seni çoklu ajan tasarımı bekliyor: kütüphaneci getirir, yazar yalnız o kâğıda bakar.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_ago2_1",
        "Boş koleksiyonda dürüst yol hangisidir?",
        ["Genel bilgi basar", "Fail-closed; sorgu durur", "top-k=10 uydurur", "Pencereyi şişirir"],
        1,
      ),
      mcq(
        "q_ago2_2",
        "top-k neyi garanti etmez?",
        ["Hız", "Eşik üstü kanıt; sayı dolu diye kaynak doğmaz", "JSON şema", "TTS"],
        1,
      ),
      mcq(
        "q_ago2_3",
        "Bu dersteki Koleksiyon sınıfı canlı Chroma mıdır?",
        ["Evet", "Hayır; kapıyı gösterir, sahte sürücü iddiası yoktur", "Evet, GPU zorunlu", "Yalnız REST"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-orta-3",
    order: 3,
    title: "Çoklu Ajan (Multi-Agent) Tasarım Desenleri: Araştırmacı + Yazar Ajan İşbirliği",
    dialogue: {
      warmup: [
        koray(
          "Şirkette her işi yapan tek eleman hem rafı karıştırır hem raporu uydurur. Kütüphaneci klasörü çıkarır, rapor yazan yalnız o kâğıda bakar. İki uzman paslaşması tek ağızdan daha mı dürüst?",
        ),
        maya(
          "Daha dürüst. Çoklu ajan (multi-agent) o iki uzmandır. Araştırmacı getiri üretir; yazar yalnız teslim sözleşmesindeki kanıta bakar. Tek ajan hem arar hem şiir yazar; karışınca sen hangisinin yalan söylediğini göremezsin.",
        ),
      ],
      problem: [
        koray("Araştırmacı boş el sıkınca yazar yine paragraf basarsa saha nasıl patlar?"),
        maya(
          "Pas kaçtı, rapor yine doğdu. Fail-closed (Hata Anında Kapalı) el sıkışında durur: `kanit` yoksa yazar çalışmaz. «Benzer konuda genel cümle» teslim değildir.",
        ),
      ],
      development: [
        koray("İki ajanı aynı betikte paslaştır. Boş kanıtı bir kez kır."),
        maya(
          "`arastir` koleksiyondan getirir. `yaz` kanıt boşsa durur. Rol kaydı raftadır; bilinmeyen ad düşer. LangChain ismi şart değildir; sözleşme durur.",
          {
            language: "py",
            source: `RAF = {"ankara": "Ankara depo: 18 palet un."}


def arastir(konu):
    if konu not in RAF:
        raise ValueError("kanit yok; islem durur")
    return RAF[konu]


def yaz(kanit):
    if not isinstance(kanit, str) or not kanit.strip():
        raise ValueError("bos teslim; islem durur")
    return "Rapor: " + kanit


def ekip(konu):
    kanit = arastir(konu)
    return yaz(kanit)


assert "18 palet" in ekip("ankara")
try:
    ekip("mars")
except ValueError as hata:
    assert "kanit" in str(hata)`,
          },
        ),
        koray("Yazar araştırmacının aracını çalabilir mi? Rol kaydı ne keser?"),
        maya(
          "Çalamaz. Yazarın raftında `yaz` vardır, `arastir` yoktur. Rol dışı ad Fail-closed durur. Bir sonraki bölümde seni ajanlar arası durum (state) bekliyor.",
        ),
      ],
      conclusion: [
        koray("Pas: getir → yaz. Boş elde rapor yok. Sonraki kapı ne?"),
        maya(
          "İki rol, bir teslim. Bir sonraki bölümde seni durum ve bellek yönetimi bekliyor: pas defteri kaybolursa ikinci ajan körlemesine yazmaz.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_ago3_1",
        "Araştırmacı boş dönünce yazar ne yapar?",
        ["Genel paragraf basar", "Fail-closed; teslim durur", "Önceki raporu kopyalar", "top-k artırır"],
        1,
      ),
      mcq(
        "q_ago3_2",
        "Çoklu ajan neden tek ağızdan ayrılır?",
        ["Hız", "Getiri ile rapor karışmasın; rol sözleşmesi ayrı dursun", "GPU zorunlu", "JSON hızlanır"],
        1,
      ),
      mcq(
        "q_ago3_3",
        "Yazar `arastir` çağırırsa dürüst yol hangisidir?",
        ["İzin ver", "Rol dışı ad; işlem durur", "Sessizce None", "eval"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-orta-4",
    order: 4,
    title: "Ajanlar Arası Durum (State) ve Bellek Yönetimi",
    dialogue: {
      warmup: [
        koray(
          "Vardiya defteri masada durur. Gececi «18 palet» yazar; sabahcı o satırı okumadan rapor basarsa depo yalan söyler. Ajanlar arası durum (state) o defter mi, yoksa her ajan kendi cebinde ayrı not mu tutar?",
        ),
        maya(
          "O defter ortak durumdur. Kısa bellek bu turun defteridir; uzun bellek raftaki kanıttır. Cebine gizleyen ajan öbürünü kör bırakır. Anahtar yoksa defter boştur; boş defterden stok uydurmazsın.",
        ),
      ],
      problem: [
        koray("Yazar `kanit` anahtarını silince araştırmacı «vardı sanırım» derse?"),
        maya(
          "Durum yalan söyledi. Fail-closed (Hata Anında Kapalı) `get` ile durur: anahtar yoksa işlem yok. Sessiz varsayılan `\"\"` rapor hakkı doğurmaz. Pencere dolunca eski tur düşer; düşen turu durum sanmak ikinci yalandır.",
        ),
      ],
      development: [
        koray("Ortak defteri bas. Eksik anahtarı kır. Üzerine yazmayı gösterme, birleştir."),
        maya(
          "`Durum` sözlüktür. `oku` eksikte durur. `yaz` boş değeri reddeder. Araştırmacı `kanit` basar, yazar yalnız o anahtarı okur.",
          {
            language: "py",
            source: `class Durum:
    def __init__(self):
        self.defter = {}

    def yaz(self, anahtar, deger):
        if not anahtar or not isinstance(deger, str) or not deger.strip():
            raise ValueError("bos durum; islem durur")
        self.defter[anahtar] = deger

    def oku(self, anahtar):
        if anahtar not in self.defter:
            raise ValueError("anahtar yok; islem durur")
        return self.defter[anahtar]


defter = Durum()
try:
    defter.oku("kanit")
except ValueError as hata:
    assert "anahtar" in str(hata)
defter.yaz("kanit", "Ankara depo: 18 palet un.")
assert "18 palet" in defter.oku("kanit")`,
          },
        ),
        koray("İki ajan aynı anahtara yarışırsa? Birleştirme yoksa son yazan ezer mi?"),
        maya(
          "Ezer. Bu derste tek yazar kuralı durur: `kanit` yalnız araştırmacı yazar. Bir sonraki bölümde seni insan müdahalesi (Human-in-the-Loop) bekliyor: riskli anahtar insansız basılmaz.",
        ),
      ],
      conclusion: [
        koray("Defter ortak, eksik anahtar susar. Sonraki kapı?"),
        maya(
          "Durum sözleşmesi pası taşır. Bir sonraki bölümde seni onay mekanizması bekliyor: rapor dışarı çıkmadan insan damgası gerekir.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_ago4_1",
        "Ortak durumda eksik anahtarda dürüst yol hangisidir?",
        ["Boş string uydurur", "Fail-closed; işlem durur", "Önceki turu yapıştırır", "None basar"],
        1,
      ),
      mcq(
        "q_ago4_2",
        "Kısa bellek ile uzun bellek farkı nedir?",
        ["Yoktur", "Kısa bu turun defteri; uzun raftaki kanıt", "İkisi de GPU", "Kısa JSON’dur"],
        1,
      ),
      mcq(
        "q_ago4_3",
        "`kanit` anahtarını kim yazar?",
        ["Yazar ajan", "Yalnız araştırmacı; tek yazar kuralı", "Her ikisi yarışır", "Kullanıcı şiiri"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-orta-5",
    order: 5,
    title: "İnsan Müdahalesi (Human-in-the-Loop) ve Ajan Onay Mekanizmaları",
    dialogue: {
      warmup: [
        koray(
          "Kasadaki eleman iadeyi tek başına basmaz; müdür kaşe vurur. Ajan «raporu müşteriye gönder» deyince aynı kaşe yoksa fiş kesilir mi?",
        ),
        maya(
          "Kesilmez. İnsan müdahalesi (Human-in-the-Loop) o kaşedir. Riskli araç `beklemede` durur; `onay` yoksa gönderim yok. Otonomi «müdür uyurken bas» demek değildir.",
        ),
      ],
      problem: [
        koray("Zaman aşımı olunca ajan «muhtemelen onaylandı» derse kasa nasıl yanar?"),
        maya(
          "Sahte yeşil. Fail-closed (Hata Anında Kapalı) zaman dolunca durur: onay yoksa araç çağrılmaz. Sessiz varsayılan `True` iade fişidir. Log’suz kaşe de yok hükmündedir.",
        ),
      ],
      development: [
        koray("Bekleme kutusunu bas. Reddi ve onayı ayrı kır."),
        maya(
          "`istek` riskli işi `beklemede` yazar. `karar` yalnız `onay` veya `red` kabul eder. Onay yokken `gonder` durur.",
          {
            language: "py",
            source: `RISKLI = {"gonder"}


def istek(arac, govde, onay=None):
    if arac not in RISKLI:
        raise ValueError("bilinmeyen arac; islem durur")
    if not govde.strip():
        raise ValueError("bos govde; islem durur")
    if onay is None:
        return {"durum": "beklemede", "govde": govde}
    if onay not in ("onay", "red"):
        raise ValueError("gecersiz karar; islem durur")
    if onay == "red":
        raise ValueError("red; islem durur")
    return {"durum": "gonderildi", "govde": govde}


kutu = istek("gonder", "Rapor: 18 palet")
assert kutu["durum"] == "beklemede"
assert istek("gonder", "Rapor: 18 palet", onay="onay")["durum"] == "gonderildi"
try:
    istek("gonder", "Rapor: 18 palet", onay="red")
except ValueError as hata:
    assert "red" in str(hata)`,
          },
        ),
        koray("Onay log’a düşmezse yarın kim kaşeyi inkâr eder? Mini projede bu kapı durur mu?"),
        maya(
          "Durur. Kaşe kayıt olmadan yok sayılır. Bir sonraki bölümde seni çift ajanlı kapanış bekliyor: doküman, pas, durum, insan damgası tek betikte.",
        ),
      ],
      conclusion: [
        koray("Riskli iş beklemede. Red durur, sessiz True yok. Kapanış?"),
        maya(
          "İnsan kapısı araçtan önce durur. Bir sonraki bölümde seni kendi dokümanlarınla konuşan ekip bekliyor: getiri, yazar, defter ve kaşe aynı gişede.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_ago5_1",
        "Riskli araç onaysız çağrılır mı?",
        ["Evet, otonomi budur", "Hayır; durum beklemede kalır", "Zaman dolunca True", "JSON yeter"],
        1,
      ),
      mcq(
        "q_ago5_2",
        "Zaman aşımında Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Onay uydurur", "İşlemi durdurur; araç çağrılmaz", "Önceki kaşeyi kopyalar", "top-k artırır"],
        1,
      ),
      mcq(
        "q_ago5_3",
        "`red` kararında dürüst yol hangisidir?",
        ["Yine gönderir", "ValueError; işlem durur", "beklemede sonsuz", "None basar"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-orta-6",
    order: 6,
    title: "Mini Proje: Kendi Dokümanlarınla Konuşan ve Rapor Üreten Çift Ajanlı Ekip",
    dialogue: {
      warmup: [
        koray(
          "Masada üç klasör, bir defter, bir müdür kaşesi durur. Kütüphaneci getirir, yazar raporu basar, müdür göndermeden önce bakar. Bu kapanış o gişe mi?",
        ),
        maya(
          "O. Doküman sözlük, getiri eşik, ortak durum, insan kapısı tek `calistir` içinde durur. Ağ yok: sahte «canlı arşiv» iddiası yoktur. Sen kendi parçalarını `ekle` ile basarsın.",
        ),
      ],
      problem: [
        koray("Boş klasör, boş konu, onaysız gönderim, bozuk kanıt — dördü birden gelirse?"),
        maya(
          "Dördü de ayrı kapı. Çökmek nezaket değildir; ValueError isimlidir. Orta rapor yok. `calistir` konu ister, getiri basar, yazar okur, gönderim kaşe ister.",
        ),
      ],
      development: [
        koray("Ekle, sor, paslaştır, kaşesiz kır. Hepsi aynı ekip gövdesinde dursun."),
        maya(
          "Bu Orta kapanıştır. `arastir` eşik altını keser. `yaz` defterden okur. `gonder` onaysız durur.",
          {
            language: "py",
            source: `RAF = []
DEFTER = {}


def ekle(metin):
    temiz = metin.strip()
    if not temiz:
        raise ValueError("bos parca; islem durur")
    RAF.append(temiz)
    return len(RAF)


def arastir(soru):
    hedef = set("".join(ch if ch.isalnum() else " " for ch in soru.lower()).split())
    aday = []
    for parca in RAF:
        kume = set("".join(ch if ch.isalnum() else " " for ch in parca.lower()).split())
        if not kume:
            continue
        skor = len(hedef & kume) / len(hedef | kume)
        if skor >= 0.15:
            aday.append((skor, parca))
    aday.sort(reverse=True)
    if not aday:
        raise ValueError("kaynak yok; islem durur")
    DEFTER["kanit"] = aday[0][1]
    return DEFTER["kanit"]


def yaz():
    if "kanit" not in DEFTER:
        raise ValueError("anahtar yok; islem durur")
    DEFTER["rapor"] = "Rapor: " + DEFTER["kanit"]
    return DEFTER["rapor"]


def gonder(onay):
    if onay != "onay":
        raise ValueError("kaşe yok; islem durur")
    if "rapor" not in DEFTER:
        raise ValueError("rapor yok; islem durur")
    return DEFTER["rapor"]


def calistir(soru, onay=None):
    arastir(soru)
    yaz()
    if onay is None:
        return {"durum": "beklemede", "rapor": DEFTER["rapor"]}
    return gonder(onay)


assert ekle("Ankara depo: 18 palet un.") == 1
kutu = calistir("Ankara un")
assert kutu["durum"] == "beklemede"
assert "18 palet" in calistir("Ankara un", onay="onay")
try:
    calistir("Mars kolonisi")
except ValueError as hata:
    assert "kaynak" in str(hata)`,
          },
        ),
        koray("Bu ekip canlı modele bağlı mı? Sınavda ne ölçülür?"),
        maya(
          "Bağlı değil. Kapılar sahte ağ olmadan görünür. Canlı model yarın aynı eşik ve kaşeyi doldurur; sen bugün gişeyi mühürledin. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
      conclusion: [
        koray("Orta kapanış: getir, yaz, defter, kaşe. Sınava girebilir miyim?"),
        maya(
          "Kanıt raftan, rapor defterden, gönderim kaşeden geçer. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_ago6_1",
        "Mini projedeki raf ağa çıkar mı?",
        ["Evet, zorunlu", "Hayır; liste sözlüktür, sahte canlı iddiası yoktur", "Yalnız PDF’de", "JSON ağı açar"],
        1,
      ),
      mcq(
        "q_ago6_2",
        "Onay `None` iken `calistir` ne döner?",
        ["Gönderildi", "beklemede kutu; kaşe yok", "Mars uydurması", "Boş rapor"],
        1,
      ),
      mcq(
        "q_ago6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Ajan bir tur atınca"],
        1,
      ),
    ],
  }),
] as const;

const AI_AGENT_ORTA_LESSON_QUIZZES: AcademyExamQuestion[] = AI_AGENT_ORTA_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez. */
export const AI_AGENT_ORTA_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...AI_AGENT_ORTA_LESSON_QUIZZES,
  mcq("q_ago_p1", "RAG sırası hangisidir?", ["Üret → getir", "Böl / göm / getir, sonra üret", "Yalnız pencere", "TTS"], 1),
  mcq("q_ago_p2", "Gömme (embedding) neyi sayıya çevirir?", ["Sertifika", "Parça metninin konumunu benzerlik uzayında", "HTTP kodu", "Kaşe"], 1),
  mcq("q_ago_p3", "Boş VectorDB sorgusu?", ["Wikipedia doldurur", "Fail-closed durur", "top-k=100", "None vektör"], 1),
  mcq("q_ago_p4", "top-k dolu diye kanıt doğar mı?", ["Evet", "Hayır; eşik yoksa gürültü düşer", "Evet JSON’da", "Yalnız k=1"], 1),
  mcq("q_ago_p5", "Araştırmacı ajan ne üretir?", ["Nihai müşteri mektubu", "Kanıt / getiri", "Kaşe", "TTS"], 1),
  mcq("q_ago_p6", "Yazar ajan kanıtsız?", ["Şiir basar", "Teslim durur", "Önceki rapor", "eval"], 1),
  mcq("q_ago_p7", "Ortak durum nedir?", ["GPU belleği", "Ajanların paylaştığı defter", "Sertifika hash", "Pencere tavanı"], 1),
  mcq("q_ago_p8", "Eksik `kanit` anahtarı?", ["Boş string", "Fail-closed; okuma durur", "None rapor", "top-k"], 1),
  mcq("q_ago_p9", "Human-in-the-Loop ne keser?", ["Getiriyi", "Riskli aracı onaysız çalışmayı", "JSON parse", "Gömme"], 1),
  mcq("q_ago_p10", "Onay zaman aşımı?", ["True uydurur", "İşlem durur; araç yok", "Önceki kaşe", "retry sonsuz"], 1),
  mcq("q_ago_p11", "Canlı model olmadan Orta öğretilir mi?", ["Hayır", "Evet; kapılar sahte ağsız görünür", "Yalnız GPU", "Yalnız TTS"], 1),
  mcq("q_ago_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_ago_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_ago_p14", "Çift ajan özeti nedir?", ["Yalnız print", "Getir → durum → yaz → kaşe", "Yalnız import", "Yalnız class"], 1),
];
