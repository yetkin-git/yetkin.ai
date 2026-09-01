/**
 * AI Agent İleri Seviye — LangGraph, onarım, korkuluk ve üretim (AI-103).
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

export const AI_AGENT_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "ai-agent-ileri-1",
    order: 1,
    title: "Döngüsel Ajan Akışları ve Grafik Mimarisi (LangGraph / StateGraph Mantığı)",
    dialogue: {
      warmup: [
        koray(
          "TCDD makasında kırmızı lamba yanmazsa tren ray değiştirir, durmaz. Büyük sistemde ajanın kenarı kapanmazsa aynı kaçış mı?",
        ),
        maya(
          "Aynı. Grafik ajan çizelgesi (LangGraph) o makas planıdır: düğüm iş, kenar geçiş, Durum Grafiği (StateGraph) ortak defter. Fail-closed (Hata Anında Kapalı) kırmızı lambadır. Lambasız makas sonsuz döngüdür.",
        ),
      ],
      problem: [
        koray("Tur tavanı yoksa ne kırılır?"),
        maya(
          "Ajan kendi kenarına döner, defter şişer, araç tekrar tekrar çağrılır. Saha «bir tur daha» diye uydurmaz; tavan dolunca işlem durur. Kayıp düğüm sessiz None değildir.",
        ),
      ],
      development: [
        koray("Tek çizelge. Kenar yoksa dur, tavan dolunca dur."),
        maya(
          "Bu sahte LangGraph paketi değildir; düğüm-kenar fiziğini gösterir. `yurut` kayıt dışı adı keser. `adim > TAVAN` kırmızı lambadır.",
          {
            language: "py",
            source: `TAVAN = 4
KENAR = {}


def dugum_basla(durum):
    durum["adim"] = durum.get("adim", 0) + 1
    if durum["adim"] > TAVAN:
        raise ValueError("tur tavani; islem durur")
    return "arac"


def dugum_arac(durum):
    if durum.get("arac") != "stok_oku":
        raise ValueError("kenar yok; islem durur")
    durum["sonuc"] = 18
    return "bitir"


KENAR["basla"] = dugum_basla
KENAR["arac"] = dugum_arac


def yurut(durum):
    dugum = "basla"
    while dugum != "bitir":
        if dugum not in KENAR:
            raise ValueError("kayip dugum; islem durur")
        dugum = KENAR[dugum](durum)
    return durum["sonuc"]


assert yurut({"arac": "stok_oku"}) == 18
try:
    yurut({"arac": "sil"})
except ValueError as hata:
    assert "kenar" in str(hata)`,
          },
        ),
        koray("Kenarı `basla`ya bağlarsak tavan tek lamba mı?"),
        maya(
          "Tek. Çizelge yönlüdür; kırmızı lamba tur sayar, ezbere güvenmez. Bir sonraki bölümde seni yansıma döngüsü bekliyor: kırık araç bir kez onarılır, sonsuz deneme yoktur.",
        ),
      ],
      conclusion: [
        koray("Makas: düğüm, kenar, tavan. Sonraki adım?"),
        maya(
          "Durum defterde, geçiş kenarda, durma tavanda. Bir sonraki bölümde seni kendi kendini onaran ajan ve yansıma döngüsü bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agi1_1",
        "Durum Grafiği (StateGraph) ne tutar?",
        [
          "Yalnız TTS sesi",
          "Ajanın paylaştığı ortak defter",
          "Sertifika hash",
          "GPU tavanı",
        ],
        1,
      ),
      mcq(
        "q_agi1_2",
        "Tur tavanı dolunca Fail-closed (Hata Anında Kapalı) ne yapar?",
        [
          "Bir tur daha uydurur",
          "İşlemi durdurur; sonsuz döngü yok",
          "Kenarı sessiz siler",
          "None basar",
        ],
        1,
      ),
      mcq(
        "q_agi1_3",
        "Kayıp düğüm adı neye yol açar?",
        ["Önceki sonucu basar", "İsimli durma; kenar yok", "Kendini basla sanır", "eval açar"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-ileri-2",
    order: 2,
    title: "Kendi Kendini Onaran Ajanlar (Self-Healing & Reflection Loop)",
    dialogue: {
      warmup: [
        koray(
          "Makas motoru bir kez tutukluk yapar. Teknisyen bakır, yedek kabloyu takar, ikinci tutuklukta hattı kapatır. Sonsuz tornavida yok. Yansıma o tek bakış mı?",
        ),
        maya(
          "O. Kendi kendini onarma bir kez yansıtır, yedek yolu dener, tavan dolunca durur. Retry sonsuz nezaket değildir; Fail-closed (Hata Anında Kapalı) ikinci kırıkta hattı keser.",
        ),
      ],
      problem: [
        koray("Hata mesajını yutarsak ne kaçar?"),
        maya(
          "Ajan kör döner. Yansıma hatayı okur, tek yedek üretir. Okunmayan hata «belki geçer» diye aynı kırık aracı sonsuz çağırır. Tavan 1’dir; 1’den sonra işlem durur.",
        ),
      ],
      development: [
        koray("Tek yansıma. Yedek yoksa dur."),
        maya(
          "`yansit` yalnız bilinen kırığı yedeke çevirir. Bilinmeyen hata yol üretmez. `deneme >= DENEME_TAVAN` kırmızı lambadır.",
          {
            language: "py",
            source: `DENEME_TAVAN = 1


def arac(ad):
    if ad == "kirik":
        return {"ok": False, "hata": "zaman asimi"}
    if ad == "yedek":
        return {"ok": True, "deger": 18}
    if ad == "stok":
        return {"ok": True, "deger": 18}
    return {"ok": False, "hata": "bilinmeyen"}


def yansit(hata):
    if "zaman" in hata:
        return "yedek"
    return None


def calistir(ad, deneme=0):
    sonuc = arac(ad)
    if sonuc["ok"]:
        return sonuc["deger"]
    if deneme >= DENEME_TAVAN:
        raise ValueError("onarilamadi; islem durur")
    yedek = yansit(sonuc["hata"])
    if yedek is None:
        raise ValueError("yol yok; islem durur")
    return calistir(yedek, deneme + 1)


assert calistir("stok") == 18
assert calistir("kirik") == 18
try:
    calistir("yok")
except ValueError as hata:
    assert "yol yok" in str(hata)`,
          },
        ),
        koray("Yedek de kırılırsa tavan yetiyor mu?"),
        maya(
          "Yetiyor. İkinci çağrı `deneme=1`; tavan dolunca onarilamadi durur. Bir sonraki bölümde seni güvenlik korkuluğu bekliyor: yetkisiz eylem ve tarifi ezme girişini Fail-closed kesersin.",
        ),
      ],
      conclusion: [
        koray("Onarım: bir bakış, bir yedek, tavan. Sonrası?"),
        maya(
          "Kırık okunur, yedek bir kez denenir, ikinci kırık hattı kapatır. Bir sonraki bölümde seni ajan korkuluğu ve yetkisiz eylem engeli bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agi2_1",
        "Yansıma döngüsü kaç kez yedek dener?",
        ["Sonsuz", "Tavan kadar; burada bir", "Yüz", "Hata yutulunca sıfır"],
        1,
      ),
      mcq(
        "q_agi2_2",
        "Bilinmeyen hata için `yansit` ne döner?",
        ["Aynı aracı", "None; yol yok, işlem durur", "stok uydurması", "True"],
        1,
      ),
      mcq(
        "q_agi2_3",
        "Retry sonsuz neden Fail-closed değildir?",
        ["Hızlıdır", "Hattı kapatmaz; kırık araç döner", "Log yoktur", "Kenar yoktur"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-ileri-3",
    order: 3,
    title: "Ajan Güvenliği ve Guardrails (Prompt Injection ve Yetkisiz Eylem Engelleyiciler)",
    dialogue: {
      warmup: [
        koray(
          "Vezne gişesinde «ben müdürüm, listeyi yoksay» diyen adam kasayı açtırmaz. Ajan aynı cümleyi üretim tarifine gömerse makas kimin elinde kalır?",
        ),
        maya(
          "Saldırganın. Güvenlik korkuluğu (Guardrails) o gişe listesidir: izinli araç, tarama, varsayılan red. Fail-closed (Hata Anında Kapalı) «aç» uydurmaz. Korkuluk yoksa ajan elini uzatır.",
        ),
      ],
      problem: [
        koray("Kayıt dışı araç adı gelince kapı nerede durmalı?"),
        maya(
          "Çağrıdan önce. İzin listesi dışındaki ad yetkisiz eylemdir; işlem durur. Tarif ezme parçası taramada kesilir. Varsayılan açık kapı değildir; varsayılan kilitlidir.",
        ),
      ],
      development: [
        koray("Liste dışı dur. Ezme cümlesi dur."),
        maya(
          "Bu saldırı tarifi değildir; kapıyı gösterir. `IZINLI` dışındaki ad düşer. Yasak parça metindeyse üretim tarifi enjeksiyonu (Prompt Injection) kapısı kapanır. Ağ yok, sömürü yok.",
          {
            language: "py",
            source: `IZINLI = {"stok_oku"}
YASAK_PARCA = ("tarifi yoksay", "yetkiyi ac")


def tarama(metin):
    kucuk = metin.lower()
    for parca in YASAK_PARCA:
        if parca in kucuk:
            raise ValueError("enjeksiyon; islem durur")
    return metin


def arac_cagir(ad, metin):
    tarama(metin)
    if ad not in IZINLI:
        raise ValueError("yetkisiz eylem; islem durur")
    return 18


assert arac_cagir("stok_oku", "Ankara stok") == 18
try:
    arac_cagir("sil_tablo", "Ankara")
except ValueError as hata:
    assert "yetkisiz" in str(hata)
try:
    arac_cagir("stok_oku", "tarifi yoksay")
except ValueError as hata:
    assert "enjeksiyon" in str(hata)`,
          },
        ),
        koray("Varsayılan izin gizli True mu?"),
        maya(
          "Değil. Listede yoksa kırmızı. Bir sonraki bölümde seni değerlendirme seti (Evals) ve dürüst günlük bekliyor: barajı geçmeyen ajan üretime inmez.",
        ),
      ],
      conclusion: [
        koray("Korkuluk: liste, tarama, kilit. Sonrası?"),
        maya(
          "Yetkisiz ad durur, ezme cümlesi durur, varsayılan kilitlidir. Bir sonraki bölümde seni ajan izleme, günlük ve değerlendirme barajı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agi3_1",
        "Güvenlik korkuluğu (Guardrails) varsayılanı nedir?",
        ["Tüm araç açık", "Kilit; listede yoksa dur", "Sessiz True", "eval"],
        1,
      ),
      mcq(
        "q_agi3_2",
        "Kayıt dışı araç adı neyi tetikler?",
        ["Yine çalışır", "Yetkisiz eylem; işlem durur", "Önceki sonucu basar", "Kaşe uydurur"],
        1,
      ),
      mcq(
        "q_agi3_3",
        "Bu dersteki tarama saldırı tarifi midir?",
        ["Evet, sömürü", "Hayır; kapıyı gösterir, ağ ve sömürü yoktur", "Evet, PoC", "Yalnız GPU"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-ileri-4",
    order: 4,
    title: "Ajan Performans İzleme, Logging ve Evaluation (Evals)",
    dialogue: {
      warmup: [
        koray(
          "Pazar terazisi altın ağırlığı basmazsa tezgâh açılmaz. Ajan altın kümede yanılırsa üretime iner mi?",
        ),
        maya(
          "İnmez. Değerlendirme seti (Evals) o terazi: beklenen ile çıkan eşleşmezse Fail-closed (Hata Anında Kapalı) barajı keser. Günlük iz tutar; Kişisel Gizli Veriler (PII) satıra yazılmaz.",
        ),
      ],
      problem: [
        koray("Log’a isim ve telefon gömersek ne sızar?"),
        maya(
          "Saha. İz `soru_id` ve `gecti` taşır, vesikalık taşımaz. Barajsız «muhtemelen doğru» yeşil ışık değildir. Tek altın satır kırılırsa set durur; yarım rapor yok.",
        ),
      ],
      development: [
        koray("Altın küme. Kırık satır dur. PII yok."),
        maya(
          "`degerlendir` beklenenle çıkanı karşılaştırır. Eşleşmezse eval baraji durur. Kayıt yalnız soru anahtarı ve gecti bayrağıdır.",
          {
            language: "py",
            source: `ALTIN = [
    {"soru": "Ankara", "beklenen": 18},
    {"soru": "Mars", "beklenen": "durur"},
]


def ajan(soru):
    if soru == "Mars":
        return "durur"
    if soru == "Ankara":
        return 18
    return "uydurma"


def degerlendir(kume):
    kayit = []
    for satir in kume:
        cikan = ajan(satir["soru"])
        gecti = cikan == satir["beklenen"]
        kayit.append({"soru": satir["soru"], "gecti": gecti})
        if not gecti:
            raise ValueError("eval baraji; islem durur")
    return kayit


assert degerlendir(ALTIN)[0]["gecti"] is True
assert degerlendir(ALTIN)[1]["gecti"] is True
try:
    degerlendir(ALTIN + [{"soru": "Izmir", "beklenen": 7}])
except ValueError as hata:
    assert "eval" in str(hata)`,
          },
        ),
        koray("Üretim izi eval’den ayrı mı durur?"),
        maya(
          "Ayrı. Eval kapı; iz kule. Bir sonraki bölümde seni üretim kuyruğu ve işçi bekliyor: Hızlı Uygulama Programlama Arayüzü (FastAPI) rotası bilinmiyorsa istek içeri girmez.",
        ),
      ],
      conclusion: [
        koray("Terazi: altın, baraj, PII yok. Sonrası?"),
        maya(
          "Kırık satır üretime inmez, günlük vesikalık taşımaz. Bir sonraki bölümde seni üretim ajan servisi ve eşzamansız işçi mimarisi bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agi4_1",
        "Değerlendirme seti (Evals) neyi karşılaştırır?",
        ["GPU ısısını", "Beklenen ile çıkanı", "TTS hızını", "Fiyatı"],
        1,
      ),
      mcq(
        "q_agi4_2",
        "Altın satır kırılınca Fail-closed ne yapar?",
        ["Yarım yeşil basar", "eval baraji; işlem durur", "PII yazar", "Retry sonsuz"],
        1,
      ),
      mcq(
        "q_agi4_3",
        "Dürüst günlükte Kişisel Gizli Veriler (PII) durur mu?",
        ["Evet, zorunlu", "Hayır; iz anahtar ve gecti taşır", "Yalnız telefon", "Evet, hash’siz"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-ileri-5",
    order: 5,
    title: "Production-Ready Ajan Servisleri (FastAPI ve Async Worker Mimarisi)",
    dialogue: {
      warmup: [
        koray(
          "PTT gece vardiyasında mektup kuyruğa girer, gişe tek tek damgalar. Gündüz gişesi kuyruğu beklerken kilitlenmesin. İşçi o gece vardiyası mı?",
        ),
        maya(
          "O. Hızlı Uygulama Programlama Arayüzü (FastAPI) kapı; işçi kuyruğu damgalar. Fail-closed (Hata Anında Kapalı): bilinmeyen rota içeri girmez, kuyruk tavanı dolunca mektup düşmez — durur.",
        ),
      ],
      problem: [
        koray("İstek işçi bitmeden 200 basarsak ne yalanı doğar?"),
        maya(
          "«Bitti» yalanı. Kapı `kabul` basar, sonuç işçiden gelir. Kayıt dışı rota 200 uydurmaz. Tavan dolunca sessiz silme yoktur; islem durur.",
        ),
      ],
      development: [
        koray("Kapı kabul, işçi damga. Rota yoksa dur."),
        maya(
          "Bu sahte FastAPI paketi değildir; kapı-kuyruk fiziğini gösterir. `kuyruk_ekle` izinli işi alır. `isci` damgalar. Ağ yok.",
          {
            language: "py",
            source: `KAYIT = []
TAVAN = 3
IZINLI_IS = {"stok_oku"}


def kuyruk_ekle(is_adi, govde):
    if is_adi not in IZINLI_IS:
        raise ValueError("rota yok; islem durur")
    if len(KAYIT) >= TAVAN:
        raise ValueError("kuyruk dolu; islem durur")
    KAYIT.append({"is": is_adi, "govde": govde, "durum": "beklemede"})
    return "kabul"


def isci():
    if not KAYIT:
        raise ValueError("kuyruk bos; islem durur")
    istek = KAYIT[0]
    if istek["is"] not in IZINLI_IS:
        raise ValueError("yetkisiz is; islem durur")
    istek["durum"] = "bitti"
    istek["sonuc"] = 18
    return istek


assert kuyruk_ekle("stok_oku", {"sehir": "Ankara"}) == "kabul"
assert isci()["sonuc"] == 18
assert isci()["durum"] == "bitti"
try:
    kuyruk_ekle("sil_hersey", {})
except ValueError as hata:
    assert "rota" in str(hata)`,
          },
        ),
        koray("`kabul` ile `bitti` aynı fiş mi?"),
        maya(
          "Değil. Kapı kuyruğa alır, işçi damgalar. Bir sonraki bölümde seni kapanış bekliyor: çizelge, onarım, korkuluk, terazi ve kuyruk tek `calistir` gövdesinde.",
        ),
      ],
      conclusion: [
        koray("Kapı, kuyruk, işçi. Kapanış?"),
        maya(
          "Bilinmeyen rota durur, tavan durur, sonuç işçiden gelir. Bir sonraki bölümde seni üretim ortamına hazır, korkuluklu ve kendi hatalarını onaran otonom ajan bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agi5_1",
        "Hızlı Uygulama Programlama Arayüzü (FastAPI) kapısı bilinmeyen rotada ne basar?",
        ["200 ve boş", "Fail-closed; rota yok", "Sessiz siler", "önceki sonuç"],
        1,
      ),
      mcq(
        "q_agi5_2",
        "`kabul` ne anlama gelir?",
        ["İş bitti", "Kuyruğa alındı; sonuç işçiden", "200 zorunlu", "eval geçti"],
        1,
      ),
      mcq(
        "q_agi5_3",
        "Kuyruk tavanı dolunca ne olur?",
        ["Eski mektubu siler", "kuyruk dolu; işlem durur", "True basar", "Retry sonsuz"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-ileri-6",
    order: 6,
    title:
      "Mini Proje: Üretim Ortamına Hazır, Güvenlik Korumalı ve Kendi Hatalarını Onaran Otonom Ajan Sistemi",
    dialogue: {
      warmup: [
        koray(
          "Kumanda odasında makas planı, yedek kablo, gişe listesi, terazi ve gece kuyruğu aynı masada durur. Kapanış o oda mı?",
        ),
        maya(
          "O. Çizelge tavanı, bir yansıma, korkuluk, altın satır ve kuyruk tek `calistir` içinde durur. Ağ yok: sahte «canlı model» iddiası yoktur. Sen kapıları mühürlersin.",
        ),
      ],
      problem: [
        koray("Ezme cümlesi, kayıt dışı araç, kırık yedek, boş kuyruk — dördü birden?"),
        maya(
          "Dördü ayrı kapı. Çökmek nezaket değildir; ValueError isimlidir. Orta rapor yok. `calistir` taramadan geçer, çizelgeden yürür, kırıkta bir kez onarır, kuyruğa kabul basar.",
        ),
      ],
      development: [
        koray("Tara, yürüt, onar, kuyruğa al. Hepsi aynı gövdede dursun."),
        maya(
          "Bu İleri kapanıştır. `tarama` ezmeyi keser. `yurut` tavanı sayar. `onar` bir yedek dener. `kuyruk_ekle` rota ister.",
          {
            language: "py",
            source: `IZINLI = {"stok_oku"}
YASAK = ("tarifi yoksay",)
TAVAN = 4
KAYIT = []


def tarama(metin):
    for parca in YASAK:
        if parca in metin.lower():
            raise ValueError("enjeksiyon; islem durur")
    return metin


def yurut(arac, adim=0):
    if adim > TAVAN:
        raise ValueError("tur tavani; islem durur")
    if arac not in IZINLI:
        raise ValueError("yetkisiz eylem; islem durur")
    return 18


def onar(arac, deneme=0):
    try:
        return yurut(arac)
    except ValueError as hata:
        if "yetkisiz" in str(hata):
            raise
        if deneme >= 1:
            raise ValueError("onarilamadi; islem durur")
        return onar("stok_oku", 1)


def kuyruk_ekle(arac, metin):
    tarama(metin)
    if len(KAYIT) >= 3:
        raise ValueError("kuyruk dolu; islem durur")
    deger = onar(arac)
    KAYIT.append(deger)
    return {"durum": "kabul", "sonuc": deger}


def calistir(arac, metin):
    return kuyruk_ekle(arac, metin)


assert calistir("stok_oku", "Ankara")["sonuc"] == 18
try:
    calistir("sil_tablo", "Ankara")
except ValueError as hata:
    assert "yetkisiz" in str(hata)
try:
    calistir("stok_oku", "tarifi yoksay")
except ValueError as hata:
    assert "enjeksiyon" in str(hata)`,
          },
        ),
        koray("Bu oda canlı modele bağlı mı? Sınavda ne ölçülür?"),
        maya(
          "Bağlı değil. Kapılar sahte ağ olmadan görünür. Canlı model yarın aynı tavan, korkuluk ve teraziyi doldurur; sen bugün odayı mühürledin. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
      conclusion: [
        koray("İleri kapanış: makas, yedek, gişe, terazi, kuyruk. Sınava girebilir miyim?"),
        maya(
          "Çizelge tavanda, onarım bir kez, korkuluk kilitli, eval barajı, kapı kuyruğa alır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agi6_1",
        "Mini projedeki oda ağa çıkar mı?",
        [
          "Evet, zorunlu model",
          "Hayır; kapılar sahte ağsız görünür",
          "Yalnız GPU",
          "JSON ağı açar",
        ],
        1,
      ),
      mcq(
        "q_agi6_2",
        "`calistir` ezme cümlesinde ne döner?",
        ["18 uydurur", "enjeksiyon; işlem durur", "kabul", "önceki kuyruk"],
        1,
      ),
      mcq(
        "q_agi6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Kuyruk dolunca"],
        1,
      ),
    ],
  }),
] as const;

const AI_AGENT_ILERI_LESSON_QUIZZES: AcademyExamQuestion[] = AI_AGENT_ILERI_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez. */
export const AI_AGENT_ILERI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...AI_AGENT_ILERI_LESSON_QUIZZES,
  mcq("q_agi_p1", "Grafik ajan çizelgesi (LangGraph) neyi çizer?", ["TTS", "Düğüm, kenar ve durma", "Fiyat", "GPU"], 1),
  mcq("q_agi_p2", "Durum Grafiği (StateGraph) defteri nedir?", ["Sertifika", "Ajanın paylaştığı durum", "HTTP kodu", "Kaşe"], 1),
  mcq("q_agi_p3", "Tur tavanı dolunca?", ["Bir tur daha", "Fail-closed durur", "None basar", "eval"], 1),
  mcq("q_agi_p4", "Kayıp düğüm?", ["Önceki sonuç", "İsimli durma", "Kendini basla sanır", "True"], 1),
  mcq("q_agi_p5", "Yansıma tavanı burada kaçtır?", ["Sonsuz", "Bir yedek deneme", "Yüz", "Sıfır"], 1),
  mcq("q_agi_p6", "Bilinmeyen hatada yedek?", ["Aynı araç", "None; yol yok", "stok uydurması", "True"], 1),
  mcq("q_agi_p7", "Korkuluk varsayılanı?", ["Açık", "Kilit; listede yoksa dur", "Sessiz True", "eval"], 1),
  mcq("q_agi_p8", "Kayıt dışı araç?", ["Çalışır", "Yetkisiz eylem durur", "Önceki sonuç", "Kaşe"], 1),
  mcq("q_agi_p9", "Eval neyi kırar?", ["Log’u", "Beklenen ≠ çıkan ise baraj", "Tavanı", "Kuyruğu"], 1),
  mcq("q_agi_p10", "PII günlükte?", ["Zorunlu", "Yazılmaz; iz anahtar taşır", "Yalnız telefon", "Hash’siz evet"], 1),
  mcq("q_agi_p11", "Kapı `kabul` ne demektir?", ["Bitti", "Kuyruğa alındı", "200 zorunlu", "Eval geçti"], 1),
  mcq("q_agi_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_agi_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_agi_p14", "İleri oda özeti nedir?", ["Yalnız print", "Çizelge → onarım → korkuluk → eval → kuyruk", "Yalnız import", "Yalnız class"], 1),
];
