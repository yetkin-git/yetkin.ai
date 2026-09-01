/**
 * AI Agent Temel Seviye — otonom ajan müfredatı.
 * PEDAGOJI.md: 5 perde, DialogueTurn[], Maya %95 / Koray %100, Fail-Closed.
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

export const AI_AGENT_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "ai-agent-temel-1",
    order: 1,
    title: "AI Agent Nedir? LLM vs. Otonom Ajan Mantığı",
    dialogue: {
      warmup: [
        koray(
          "Sen çağrı merkezinde yalnız konuşan bir temsilci gördün mü? Güzel cümle kurar, fiş kesmez, kargo yazmaz. Elinde klavye olan asistan ise bileti iptal eder, adresi düzeltir. O ikisi aynı meslek mi?",
        ),
        maya(
          "Değil. Büyük Dil Modeli (LLM) o konuşan temsilcidir: metin üretir, elini masadan kaldırmaz. Otonom ajan (AI Agent) klavyeyi alır. Düşünür, araç çağırır, sonucu okur, gerekirse ikinci işi yapar. Sen cümle dinlemezsin; işin bittiğini görürsün.",
        ),
      ],
      problem: [
        koray("Saha tarafında düz sohbet kutusu neden yalan söylüyor? Dışarı bakamıyor mu?"),
        maya(
          "Bakamıyor. Modelin eğitim kesiti dündür; bugünün stoku, senin takvimin, kasa bakiyen yok. Bilmeyince uydurur. Halüsinasyon (uydurma) burada başlar: dış dünya kapalı, ağız açık. Fail-closed (Hata Anında Kapalı) durur: araç yoksa «bilmiyorum» dersin, stok uydurmazsın.",
        ),
      ],
      development: [
        koray("Aynı soruyu iki kutuya sor. Biri yalnız konuşsun, öbürü aracı çağırsın."),
        maya(
          "Sohbet kutusu cümle basar. Ajan ise önce araç adını seçer. Araç yoksa durur; «muhtemelen 18 derece» diye orta değer basmaz.",
          {
            language: "py",
            source: `STOK = {"Ankara": 18, "İstanbul": 14}


def sohbet_kutusu(soru):
    return "Sanırım hava güzel."


def ajan_oku(sehir):
    if sehir not in STOK:
        raise ValueError("sehir yok; islem durur")
    return STOK[sehir]


assert sohbet_kutusu("Ankara kaç derece?") == "Sanırım hava güzel."
assert ajan_oku("Ankara") == 18
try:
    ajan_oku("Mars")
except ValueError as hata:
    assert "durur" in str(hata)`,
          },
        ),
        koray("Yani ajan, modeli bir döngünün içine oturtuyor. Döngü yoksa elinde yine ağız mı kalıyor?"),
        maya(
          "Kalıyor. Döngü: gözlem al, karar ver, araç çalıştır, yeni gözlemle devam et. Tek cümle ajan değildir. Sen bu derste o sınırı çiziyorsun; sonraki derslerde tarif, araç ve hafıza o döngüyü doldurur.",
        ),
      ],
      conclusion: [
        koray("Kafamda oturdu: konuşmak iş bitirmek değil. Sonraki adımda ne duruyor?"),
        maya(
          "Ajan, dış dünyaya kapı ister. Kapı yoksa susar. Bir sonraki bölümde seni üretim tarifi ve yapılandırılmış çıktı bekliyor: modelin serbest şiiri JavaScript Nesne Gösterimi (JSON) kapısından geçmezse işlem durur.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agt1_1",
        "Büyük Dil Modeli (LLM) ile otonom ajan farkı nedir?",
        [
          "Aynıdır; ikisi de yalnız metin üretir",
          "LLM metin üretir; ajan araç çağırıp iş bitirebilir",
          "Ajan eğitim kesitini günceller",
          "LLM her zaman güncel stok okur",
        ],
        1,
      ),
      mcq(
        "q_agt1_2",
        "Araç yokken Fail-closed (Hata Anında Kapalı) ne yapar?",
        [
          "Muhtemel derece uydurur",
          "İşlemi durdurur; orta değer basmaz",
          "Önceki sohbeti stok sanır",
          "Sessizce 0 basar",
        ],
        1,
      ),
      mcq(
        "q_agt1_3",
        "Halüsinasyon (uydurma) neden doğar?",
        [
          "Model her zaman veritabanına bakıyor",
          "Dış dünya kapalıyken model yine cümle basar",
          "Araç çağrısı zorunludur",
          "JSON şeması uydurmayı keser her zaman",
        ],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-temel-2",
    order: 2,
    title: "Prompt Mühendisliği ve Yapılandırılmış Çıktı (JSON Output)",
    dialogue: {
      warmup: [
        koray(
          "Kasada fiş serbest şiir olmaz. Tezgâh «üç ekmek, iki süt» diye bağırır; kasiyer kalıba basar. Modele «güzel JSON yaz» demek o kalıbı açar mı?",
        ),
        maya(
          "Açmaz. «JSON gibi yaz» dilekçedir. JavaScript Nesne Gösterimi (JSON) kapısı parse edilir, zorunlu alan yoksa iş durur. Sen tarifi katmanlarsın: sistem yasağı, kullanıcı işi, biçim şeması ayrı durur.",
        ),
      ],
      problem: [
        koray("Tek paragrafa yasak, iş ve şema yığılınca saha nasıl patlıyor?"),
        maya(
          "Model yasağı iş sanır veya işi süs cümlesine gömer. Tırnak kaçınca parse patlar. «Neredeyse JSON» fiş değildir. Fail-closed (Hata Anında Kapalı) burada durur: json.loads kırılırsa sonraki araç çağrılmaz.",
        ),
      ],
      development: [
        koray("Geçersiz metni ve eksik alanı bir kez kır. Sonra dürüst şemayı bas."),
        maya(
          "Önce çöp. Sonra zorunlu alan. `niyet` veya `sehir` yoksa ajan elini uzatmaz.",
          {
            language: "py",
            source: `import json

ZORUNLU = ("niyet", "sehir")


def oku_cikti(ham):
    try:
        veri = json.loads(ham)
    except json.JSONDecodeError as exc:
        raise ValueError("json degil; islem durur") from exc
    if not isinstance(veri, dict):
        raise ValueError("nesne degil; islem durur")
    for alan in ZORUNLU:
        if alan not in veri:
            raise ValueError("alan eksik; islem durur")
    return veri


try:
    oku_cikti("hava güzel")
except ValueError as hata:
    assert "json" in str(hata)
try:
    oku_cikti('{"niyet": "hava"}')
except ValueError as hata:
    assert "alan" in str(hata)
assert oku_cikti('{"niyet": "hava", "sehir": "Ankara"}')["sehir"] == "Ankara"`,
          },
        ),
        koray("Sistem katmanına «uydurma, sır yapıştırma» yazıyorum. Kullanıcı katmanı iş mi kalıyor?"),
        maya(
          "Evet. Sistem meslek ve yasaktır. Kullanıcı «Ankara hava» der. Biçim yalnız şemadır. Üçü tek bağırış olursa kapı kayar. Şema geçmeden araç adı konuşulmaz.",
        ),
      ],
      conclusion: [
        koray("Tarif katmanlı, şema kapı. Sonraki derste eline ne geçiyor?"),
        maya(
          "Parse edilen nesne, ajanın elindeki fiştir. Bir sonraki bölümde seni araç kullanımı bekliyor: o fişteki ad, gerçek fonksiyonu çağırır; bilinmeyen ad durur.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agt2_1",
        "«JSON gibi yaz» şema kapısı mıdır?",
        ["Evet", "Hayır; parse ve zorunlu alan gerekir", "Yeterli dilekçedir", "Yalnız sistem katmanı yeter"],
        1,
      ),
      mcq(
        "q_agt2_2",
        "json.loads kırılınca Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Yarı JSON kabul eder", "İşlemi durdurur; araç çağrılmaz", "Boş dict uydurur", "Metni yine araçlara verir"],
        1,
      ),
      mcq(
        "q_agt2_3",
        "Üretim tarifi katmanları hangisidir?",
        [
          "Tek paragraf yeter",
          "Sistem yasağı, kullanıcı işi, biçim şeması ayrı durur",
          "Yalnız few-shot",
          "Yalnız araç adı",
        ],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-temel-3",
    order: 3,
    title: "Araç Kullanımı (Tool Calling / Function Calling) Mantığı",
    dialogue: {
      warmup: [
        koray(
          "Mutfakta aşçı «tuzluk» diye bağırır. Çırak raftan tuzu alır, «lamba» diye bağırırsa rafta lamba yoktur. Programda o rafta ne duruyor?",
        ),
        maya(
          "Araç kaydı. Tool calling / function calling (araç çağrısı) modelin eline fonksiyon adı ve argüman verir. Sen rafta olmayan adı çalıştırmazsın. Fail-closed (Hata Anında Kapalı): bilinmeyen araç durur.",
        ),
      ],
      problem: [
        koray("Model «sil_her_seyi» diye uydurursa ne kırılır?"),
        maya(
          "Açık rafta o ad yoksa çağrı düşer. İsim benzerliği yetmez. Argüman tipi de kapıdır: şehir yerine boş metin, not yerine sır. Uygulama Programlama Arayüzü (API) anahtarı tarife girmez; araç gövdesine de yapışmaz.",
        ),
      ],
      development: [
        koray("İki araç yaz: hava ve not. Bilinmeyen adı bir kez kır."),
        maya(
          "Sözlük raftır. `ARACLAR.get` yokluğu None basmaz; sen açıkça durursun. Çağrı sonucu gözlemdir, nihai cevap değil.",
          {
            language: "py",
            source: `STOK = {"Ankara": "18 derece"}
NOTLAR = []


def hava_durumu(sehir):
    if sehir not in STOK:
        raise ValueError("sehir yok; islem durur")
    return STOK[sehir]


def not_yaz(metin):
    temiz = metin.strip()
    if not temiz:
        raise ValueError("bos not; islem durur")
    NOTLAR.append(temiz)
    return len(NOTLAR)


ARACLAR = {"hava_durumu": hava_durumu, "not_yaz": not_yaz}


def arac_cagir(ad, arguman):
    fn = ARACLAR.get(ad)
    if fn is None:
        raise ValueError("bilinmeyen arac; islem durur")
    return fn(arguman)


assert arac_cagir("hava_durumu", "Ankara") == "18 derece"
assert arac_cagir("not_yaz", "toplantı 14:00") == 1
try:
    arac_cagir("sil_her_seyi", "")
except ValueError as hata:
    assert "bilinmeyen" in str(hata)`,
          },
        ),
        koray("Model araç adını metin olarak mı basıyor, yoksa ayrı bir kanal mı?"),
        maya(
          "Üretimde çoğu kapı ayrı kanal verir: ad + JSON argüman. Sen yine parse eder, rafta yoksa durursun. Serbest cümle içinden isim kazımak, tezgâhta fısıltı avlamaktır; kapı bozulur.",
        ),
      ],
      conclusion: [
        koray("Rafta yoksa el uzamaz. Hafıza bu rafa nasıl karışıyor?"),
        maya(
          "Araç, anın işidir. Hafıza, dünün işini taşır. Bir sonraki bölümde seni kısa pencere ve uzun süreli depo bekliyor: bağlam dolunca eski cümle kayar; uydurma özet kapı değildir.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agt3_1",
        "Bilinmeyen araç adında dürüst yol hangisidir?",
        ["Benzer isim çalıştır", "Fail-closed durur; çağrı düşer", "Sessizce None döner", "eval ile dene"],
        1,
      ),
      mcq(
        "q_agt3_2",
        "Araç sonucu nedir?",
        ["Nihai kullanıcı cevabı", "Gözlem; döngü bunu okuyup devam eder", "Sistem yasağı", "Şema kendisi"],
        1,
      ),
      mcq(
        "q_agt3_3",
        "Uygulama Programlama Arayüzü anahtarı nereye girmez?",
        ["Yalnız log’a", "Tarife ve araç argümanına yapışmaz", "Şema alanına serbestçe", "Not aracına gizlice"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-temel-4",
    order: 4,
    title: "Hafıza Mimarisi: Kısa ve Uzun Süreli Hafıza (Context Window & Vector Storage)",
    dialogue: {
      warmup: [
        koray(
          "Otobüste koltuk dolunca ayakta kalan iner sanılmaz, inmek zorunda kalır. Sohbet uzayınca model eski cümleyi gerçekten hatırlıyor mu?",
        ),
        maya(
          "Hayır. Bağlam penceresi (context window) o koltuk sayısıdır. Dolunca eski tur düşer. Uzun süreli hafıza ayrı raftır: diske veya vektör depoya yazarsın. Pencere «hatırlıyor» sanmak, inen yolcuyu hâlâ koltukta saymaktır.",
        ),
      ],
      problem: [
        koray("Pencere dolunca sessiz özet uydurmak neden yalan?"),
        maya(
          "Özet, kaynaksız iddiadır. Fail-closed (Hata Anında Kapalı): tavan dolunca işi bölersin veya dışarı yazarsın. Vektör depo (vector storage) gerçekte gömülü sayılarla mesafe ölçer. Bu derste sahte gömme uydurmayız; kelime örtüşmesiyle aynı kapıyı gösteririz: eşik altı kayıt yoksa sus.",
        ),
      ],
      development: [
        koray("Kısa pencereyi listeyle kes. Uzun rafta eşiğin altında uydurma basma."),
        maya(
          "Kısa hafıza son N turdur. Uzun raf `getir` ile soruya en yakın kaydı döner. Skor eşiğin altındaysa «belgede yok» dersin; Wikipedia üslubu yasaktır.",
          {
            language: "py",
            source: `def kisa_pencere(turlar, tavan):
    if tavan <= 0:
        raise ValueError("tavan pozitif olmali; islem durur")
    return turlar[-tavan:]


def benzerlik(soru, kayit):
    a = set(soru.lower().split())
    b = set(kayit.lower().split())
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def getir(soru, depo, esik):
    if not depo:
        raise ValueError("depo bos; uydurma yok")
    en = max(depo, key=lambda kayit: benzerlik(soru, kayit))
    if benzerlik(soru, en) < esik:
        raise ValueError("kaynak yok; uydurma yok")
    return en


gecmis = ["merhaba", "ankara stok", "not: toplantı"]
assert kisa_pencere(gecmis, 2) == ["ankara stok", "not: toplantı"]
assert getir("toplantı saati", ["not: toplantı 14:00", "hava 18"], 0.2) == "not: toplantı 14:00"
try:
    getir("mars kolonisi", ["not: toplantı 14:00"], 0.8)
except ValueError as hata:
    assert "kaynak yok" in str(hata)`,
          },
        ),
        koray("Gerçek vektör veri tabanı bu kelime örtüşmesi midir?"),
        maya(
          "Değildir. Orada gömme modeli sayıları üretir, mesafe ölçülür. Sen aynı fail-closed kapısını öğreniyorsun: getiri boşsa üretim durur. Sahte gömme listesi «ben vektörüm» diye yalan söylemez.",
        ),
      ],
      conclusion: [
        koray("Pencere kısa, raf uzun, eşik kapı. Karar döngüsü nereye oturuyor?"),
        maya(
          "Hafıza gözlemi besler. Bir sonraki bölümde seni ReAct (Akıl Yürüt ve Eyleme Geç) deseni bekliyor: düşün, araç seç, gözlemi oku, gerekirse dur.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agt4_1",
        "Bağlam penceresi dolunca eski tur ne olur?",
        ["Model sonsuza hatırlar", "Düşer; pencere tavanıdır", "Sessiz özet zorunludur", "Vektör depo otomatik dolar"],
        1,
      ),
      mcq(
        "q_agt4_2",
        "Getiri eşiğin altındayken dürüst yol hangisidir?",
        ["Genel bilgiyle doldur", "Üretim durur; uydurma yok", "Önceki cevabı kopyala", "Pencereyi ikiye katla"],
        1,
      ),
      mcq(
        "q_agt4_3",
        "Bu dersteki kelime örtüşmesi gerçek vektör depo mudur?",
        ["Evet, aynı fizik", "Hayır; kapıyı gösterir, sahte gömme iddiası yoktur", "Evet, cosine zorunlu", "Yalnız GPU’da"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-temel-5",
    order: 5,
    title: "Karar Verme Döngüleri: ReAct (Reason + Act) Deseni",
    dialogue: {
      warmup: [
        koray(
          "Tamirci önce bakır, sonra tornavidayı alır, vidayı çevirir, yine bakar. «Düşünmeden tornavida savurmak» evi deler. Ajan da öyle mi tur atıyor?",
        ),
        maya(
          "ReAct (Akıl Yürüt ve Eyleme Geç) tam o ritimdir: Thought (düşünce), Action (eylem), Observation (gözlem). Düşünce boşsa tornavida savrulmaz. Eylem rafta yoksa durur. Gözlem gelmeden ikinci eylem yasaktır.",
        ),
      ],
      problem: [
        koray("Model «bitirdim» deyip araç çağırmazsa, ya da sonsuz araç isterse?"),
        maya(
          "İkisi de saha kazası. Tur tavanı yazılıdır. Fail-closed (Hata Anında Kapalı): tavan dolunca yeni araç yok, dürüst «bitiremedim» durur. Düşünce yokken eylem, kör savuruştur.",
        ),
      ],
      development: [
        koray("Bir tur yaz: düşün, araç çağır, gözlemi oku. Tavanı aşınca dur."),
        maya(
          "`react_tur` düşünce boşsa girmez. `bitir` nihai yanıttır. Tavan 3: dördüncü eylem düşer.",
          {
            language: "py",
            source: `STOK = {"Ankara": "18 derece"}


def hava_durumu(sehir):
    if sehir not in STOK:
        raise ValueError("sehir yok; islem durur")
    return STOK[sehir]


ARACLAR = {"hava_durumu": hava_durumu}


def react_tur(dusunce, eylem, arguman, tur_no, tavan):
    if not dusunce.strip():
        raise ValueError("dusunce bos; islem durur")
    if tur_no > tavan:
        raise ValueError("tavan doldu; islem durur")
    if eylem == "bitir":
        return {"tur": "yanit", "metin": arguman}
    fn = ARACLAR.get(eylem)
    if fn is None:
        raise ValueError("bilinmeyen arac; islem durur")
    gozlem = fn(arguman)
    return {"tur": "gozlem", "metin": gozlem}


bir = react_tur("stok lazim", "hava_durumu", "Ankara", 1, 3)
assert bir["tur"] == "gozlem"
assert "18" in bir["metin"]
iki = react_tur("cevap hazır", "bitir", "Ankara 18 derece", 2, 3)
assert iki["tur"] == "yanit"
try:
    react_tur("yine dene", "hava_durumu", "Ankara", 4, 3)
except ValueError as hata:
    assert "tavan" in str(hata)`,
          },
        ),
        koray("Gözlem yalan söylerse döngü ne yapar?"),
        maya(
          "Gözlem araçtan gelir; sen onu doğrularsın. Şehir yoksa araç zaten durur. Döngü «yok»u cümleye çevirir, stok uydurmaz. ReAct sihir değil, yazılı ritimdir.",
        ),
      ],
      conclusion: [
        koray("Düşün, eyle, gözle, tavanı say. Mini projede ikisi birden mi duruyor?"),
        maya(
          "Evet. Bir sonraki bölümde seni hava durumu ve not alma araçlarını kullanan basit bir Python ajanı bekliyor. Sınav kapısı o laboratuvarın ardından açılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agt5_1",
        "ReAct turunun sırası hangisidir?",
        ["Eylem → düşünce", "Düşünce → eylem → gözlem", "Gözlem → şema → sır", "Yalnız bitir"],
        1,
      ),
      mcq(
        "q_agt5_2",
        "Tur tavanı dolunca Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Bir araç daha dener", "Yeni araç çağırmaz; dürüst durur", "Önceki gözlemi cevap sanır", "Tavanı sessiz artırır"],
        1,
      ),
      mcq(
        "q_agt5_3",
        "Düşünce boşken eylem?",
        ["Serbesttir", "Yasaktır; kör savuruş durur", "Tavanı sıfırlar", "JSON’u atlar"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "ai-agent-temel-6",
    order: 6,
    title: "Mini Proje: Hava Durumu ve Not Alma Araçlarını Kullanan Basit Bir Python AI Agent",
    dialogue: {
      warmup: [
        koray(
          "Gişede biri «Ankara hava, sonra toplantıyı not et» der. Sen iki işi bir ağızla uydurmazsın; önce stoka bakarsın, sonra deftere yazarsın. Bu kapanış o gişe mi?",
        ),
        maya(
          "O. Şema parse, araç raftan, ReAct tavanı, hafıza eşiği tek betikte durur. Ağ çağrısı yok: stok sözlüktür, not liste. Sahte servis «canlı hava» diye yalan söylemez.",
        ),
      ],
      problem: [
        koray("Boş şehir, boş not, bilinmeyen araç, bozuk JSON — dördü birden gelirse?"),
        maya(
          "Dördü de ayrı kapı. Çökmek nezaket değildir; ValueError isimlidir. Orta değer yok. Sen `calistir` ile bir kullanıcı cümlesini şemaya basar, tur tur ilerlersin.",
        ),
      ],
      development: [
        koray("Hava oku, not yaz, bilinmeyeni kır. Hepsi aynı ajan gövdesinde dursun."),
        maya(
          "`ajan_adim` şemayı ister. `niyet` hava veya not. Rafta yoksa durur. Bu Temel kapanıştır.",
          {
            language: "py",
            source: `import json

STOK = {"Ankara": "parcali bulutlu, 18", "İstanbul": "yagmurlu, 14"}
NOTLAR = []
ARACLAR = {}


def hava_durumu(sehir):
    if sehir not in STOK:
        raise ValueError("sehir yok; islem durur")
    return STOK[sehir]


def not_yaz(metin):
    temiz = metin.strip()
    if not temiz:
        raise ValueError("bos not; islem durur")
    NOTLAR.append(temiz)
    return f"kayit={len(NOTLAR)}"


ARACLAR["hava_durumu"] = hava_durumu
ARACLAR["not_yaz"] = not_yaz


def ajan_adim(ham):
    try:
        veri = json.loads(ham)
    except json.JSONDecodeError as exc:
        raise ValueError("json degil; islem durur") from exc
    niyet = veri.get("niyet")
    if niyet not in ARACLAR:
        raise ValueError("bilinmeyen arac; islem durur")
    arguman = veri.get("arguman")
    if not isinstance(arguman, str) or not arguman.strip():
        raise ValueError("arguman yok; islem durur")
    return ARACLAR[niyet](arguman)


assert ajan_adim('{"niyet": "hava_durumu", "arguman": "Ankara"}') == "parcali bulutlu, 18"
assert "kayit=1" in ajan_adim('{"niyet": "not_yaz", "arguman": "toplantı 14:00"}')
try:
    ajan_adim('{"niyet": "sil", "arguman": "x"}')
except ValueError as hata:
    assert "bilinmeyen" in str(hata)`,
          },
        ),
        koray("Bu ajan canlı modele bağlı mı? Sınavda ne ölçülür?"),
        maya(
          "Bağlı değil. Kapılar sahte ağ olmadan görünür. Canlı model yarın aynı şemayı doldurur; sen bugün kapıyı mühürledin. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
      conclusion: [
        koray("Temel kapanış: şema, araç, tavan, susma. Sınava girebilir miyim?"),
        maya(
          "Girdi şemadan geçer, araç raftan çıkar, hata kapıyı kapatır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_agt6_1",
        "Mini projedeki hava aracı ağa çıkar mı?",
        ["Evet, zorunlu", "Hayır; stok sözlüktür, sahte canlı iddiası yoktur", "Yalnız İstanbul’da", "JSON ağı açar"],
        1,
      ),
      mcq(
        "q_agt6_2",
        "`niyet` rafta yoksa ne olur?",
        ["Benzer araç çalışır", "ValueError; işlem durur", "Notlara yazar", "Sohbet cümlesi basar"],
        1,
      ),
      mcq(
        "q_agt6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Ajan bir tur atınca"],
        1,
      ),
    ],
  }),
] as const;

const AI_AGENT_TEMEL_LESSON_QUIZZES: AcademyExamQuestion[] = AI_AGENT_TEMEL_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları. */
export const AI_AGENT_TEMEL_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...AI_AGENT_TEMEL_LESSON_QUIZZES,
  mcq("q_agt_p1", "Otonom ajan neyi bitirir?", ["Yalnız şiir", "Araçla iş; düz sohbet yetmez", "Eğitim kesitini", "Pencere tavanını"], 1),
  mcq("q_agt_p2", "Halüsinasyon nedir?", ["Araç sonucu", "Kaynaksız uydurma cümle", "JSON şeması", "Tur tavanı"], 1),
  mcq("q_agt_p3", "Zorunlu alan eksik JSON’da?", ["Kabul", "Parse sonrası durur", "Varsayılan şehir", "None niyet"], 1),
  mcq("q_agt_p4", "Sistem katmanı ne taşır?", ["Kullanıcı işi", "Meslek ve yasak", "Yalnız JSON", "Vektör skor"], 1),
  mcq("q_agt_p5", "Araç kaydı ne işe yarar?", ["TTS", "İzinli fonksiyon adını tutar", "Pencereyi açar", "Barajı düşürür"], 1),
  mcq("q_agt_p6", "Gözlem kimden gelir?", ["Kullanıcı şiiri", "Araç çıktısı", "Sertifika", "TTS"], 1),
  mcq("q_agt_p7", "Kısa hafıza nedir?", ["Diskteki vektör", "Penceredeki son turlar", "GPU belleği", "Sertifika hash"], 1),
  mcq("q_agt_p8", "Uzun hafıza eşiği neden durur?", ["Hız", "Zayıf eşleşmede uydurmayı kesmek", "JSON hızlanır", "TTS"], 1),
  mcq("q_agt_p9", "ReAct «bitir» ne üretir?", ["Yeni araç", "Nihai yanıt turu", "Pencere sıfır", "Silme"], 1),
  mcq("q_agt_p10", "Boş not aracında?", ["Boş kayıt", "Fail-closed; işlem durur", "None not", "Hava basar"], 1),
  mcq("q_agt_p11", "Canlı model olmadan ajan öğretilir mi?", ["Hayır", "Evet; kapılar sahte ağsız görünür", "Yalnız GPU", "Yalnız TTS"], 1),
  mcq("q_agt_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_agt_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_agt_p14", "Ajan döngüsü özeti nedir?", ["Yalnız print", "Şema → araç → gözlem → tavan", "Yalnız import", "Yalnız class"], 1),
];
