/**
 * Python Temel Seviye — ilk gerçek mühürlü müfredat.
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

export const PYTHON_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "python-temel-1",
    order: 1,
    title: "Değişkenler, veri tipleri ve dürüst etiket",
    dialogue: {
      warmup: [
        koray(
          "Sen kargo şubesinde etiketsiz kutu gördün mü? Elin uzanır, durur. İçinde cam mı, çivi mi, yastık mı — bilmeden istifleyemezsin.",
        ),
        maya(
          "O duraksama tembellik değil. Kutunun üstündeki etiket içeriğin cinsini söyler. Programda değişken adı o etiket, veri tipi de içeriğin cinsi. Yanlış etiket yapıştırırsan kamyon yine gider; varışta kutu patlar.",
        ),
      ],
      problem: [
        koray(
          "Saha tarafında bu nasıl patlıyor? Bellek mi şişiyor, yoksa sessiz yanlış mı basılıyor?",
        ),
        maya(
          "İkisi de, gürültü kopmadan. `\"250,00\"` metnini tutar sanıp ikiyle çarparsan 500 çıkmaz; `'250,00250,00'` diye yapışır. Gözün 500 bekler, eline çöp gelir. Float lira ile kuruş gezdirirsen bellek her zaman şişmez; fiş sessizce yalan söyler. Fail-closed (Hata Anında Kapalı) burada durur: cins net değilse işlem durur, uydurulmaz.",
        ),
      ],
      development: [
        koray(
          "Peki sen bu kutuları Python’da nasıl açıyorsun? str, int, float, list, dict — hangisi neyin etiketi?",
        ),
        maya(
          "Python dinamik tiplidir: kutuyu açarken cinsi yazmazsın, değerin kendisi cinsi taşır. `type()` ile kapağı açmadan sorarsın. str metindir, int tamsayıdır, float ondalıktır, list sıradır, dict anahtar-değer rafıdır. İsim dürüst durur: `x` yarın seni de unutturur.",
          {
            language: "py",
            source: `musteri_adi = "Ayşe"
adet = 3
birim_fiyat = 12.5
sepet = ["ekmek", "süt", "yumurta"]
stok = {"ekmek": 4, "süt": 2}

assert type(musteri_adi) is str
assert type(adet) is int
assert type(birim_fiyat) is float
assert type(sepet) is list
assert type(stok) is dict
assert sepet[0] == "ekmek"
assert stok.get("peynir", 0) == 0`,
          },
        ),
        koray(
          "O `'250,00' * 2` satırını bir kez daha göster. Ben hâlâ 500 bekliyorum.",
        ),
        maya(
          "Bekleme. Metin çarpımı tekrardır, hesap değildir. Fail-closed kapısı virgülü noktaya çevirir, sayıya basar, kuruş tamsayı döner. Çevrilemezse durur — orta değer uydurulmaz.",
          {
            language: "py",
            source: `etiketsiz = "250,00"
print(etiketsiz * 2)  # 250,00250,00


def kurus_carp(ham: str, kat: int) -> int:
    try:
        lira = float(ham.replace(",", "."))
    except ValueError as exc:
        raise ValueError("tutar sayı değil; işlem durur") from exc
    return int(round(lira * 100 * kat))


assert kurus_carp("250,00", 2) == 50_000`,
          },
        ),
      ],
      conclusion: [
        koray(
          "Kafamda oturdu: etiket yoksa kamyona yükleme. Sonraki adımda ne duruyor?",
        ),
        maya(
          "Tip ve isim netleşince işlem güvenli yürür. Kutunun üstü dürüstse mutfak karışmaz. Bir sonraki bölümde seni kontrol akışı bekliyor: if ve else ile karar nasıl yazılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_py1_1",
        "`tutar = \"250,00\"` iken `tutar * 2` ne üretir?",
        ["500", "Birleştirilmiş metin: '250,00250,00'", "TypeError her zaman", "250"],
        1,
      ),
      mcq(
        "q_py1_2",
        "Fail-closed (Hata Anında Kapalı) tutar çevrilemezse ne yapar?",
        ["0 kabul eder", "İşlemi durdurur; orta değer uydurmaz", "float tahmini basar", "Metni iki kez yazar"],
        1,
      ),
      mcq(
        "q_py1_3",
        "Eksik sözlük anahtarında dürüst yol hangisidir?",
        ["stok[\"armut\"]", "stok.get(\"armut\", 0) veya \"armut\" in stok", "eval", "print şifre"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-temel-2",
    order: 2,
    title: "Kontrol akışı: if, elif, else ile karar",
    dialogue: {
      warmup: [
        koray(
          "Otobüs şoförü her durakta aynı hareketi yapmaz. Zil çaldıysa durur, çalmadıysa geçer. Program da öyle mi?",
        ),
        maya(
          "Aynen. if bloğu yalnız koşul doğruysa çalışır. Yanlışsa o kapı kapalı kalır; inat etmez. elif zinciri ek kapıdır, else kalanı yakalar.",
        ),
      ],
      problem: [
        koray(
          "Saha tarafında `=` ile `==` karışınca ne kırılır?",
        ),
        maya(
          "`=` atama, `==` karşılaştırmadır. Karışınca sessiz hata doğar: kapıyı kilitlemek isterken anahtarı duvara çakarsın. Girinti (indentation) blok sınırıdır; Python’da süslü parantez yok, boşluk konuşur. 70 barajını `>` yazarsan 70 kalanın dışına düşer.",
        ),
      ],
      development: [
        koray("68 alan bir notu 70 barajından geçirme. Doğru satır nedir?"),
        maya(
          "Koşul `not_ort >= 70` durur. 68 tekrar dalına düşer. Karşılaştırma bool üretir — True veya False.",
          {
            language: "py",
            source: `not_ort = 68
if not_ort >= 70:
    karar = "geçti"
elif not_ort >= 50:
    karar = "bütünleme"
else:
    karar = "tekrar"
assert karar == "bütünleme"

not_ort = 72
if not_ort >= 70:
    karar = "geçti"
else:
    karar = "tekrar"
assert karar == "geçti"`,
          },
        ),
      ],
      conclusion: [
        koray("Işık yazılıysa kavga bitmez, doğru mu?"),
        maya(
          "Koşullu dallanma, programın ne zaman ne yapacağını okunur kılar. Bir sonraki bölümde seni döngüler bekliyor: tekrarlayan işi bir kez yazıp çok kez koşturma.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_py2_1",
        "`=` ile `==` farkı nedir?",
        ["Aynıdır", "= atama, == karşılaştırma", "İkisi de karşılaştırma", "İkisi de atama"],
        1,
      ),
      mcq(
        "q_py2_2",
        "`not_ort = 68` iken baraj 70 ise doğru dal hangisidir?",
        ["geçti", "tekrar veya bütünleme; 68 >= 70 yanlıştır", "elif yasak", "else çalışmaz"],
        1,
      ),
      mcq(
        "q_py2_3",
        "Python’da if bloğunun sınırını ne belirler?",
        ["Virgül", "Girinti (indentation)", "Noktalı virgül", "Büyük harf"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-temel-3",
    order: 3,
    title: "Döngüler: for ve while ile tekrar",
    dialogue: {
      warmup: [
        koray(
          "Çay ocağında aynı bardağı yüz kez elde yıkamak mümkün. Kimse övünmez. Makineye «yüz kez yıka» dersen tarif bir yerde durur, iş yüz kez olur — bu mu döngü?",
        ),
        maya(
          "Bu. for bilinen bir koleksiyonu gezer; while koşul doğru kaldıkça sürer. Birinde liste hazırdır, öbüründe «daha bitmedi» cümlesi durur.",
        ),
      ],
      problem: [
        koray("`while True` yazıp çıkışı unutmak neye benzer?"),
        maya(
          "Musluğu açık bırakmaya. Makine durmaz; sen durursun. `range(5)` 0..4 üretir; 1’den 5’e toplam istiyorsan `range(1, 6)` durur. 5’i kaçırırsan toplam 10 kalır, 15 değil.",
        ),
      ],
      development: [
        koray("1’den 5’e kadar toplamı bir kez yaz, beş kez koştur."),
        maya(
          "`toplam += i` akkümülatördür. break döngüyü erken bitirir; continue o turu atlar.",
          {
            language: "py",
            source: `toplam = 0
for i in range(1, 6):
    toplam += i
assert toplam == 15

sayac = 3
while sayac > 0:
    sayac -= 1
assert sayac == 0`,
          },
        ),
      ],
      conclusion: [
        koray("Tekrar korkusu düşünce listeler rahat okunur, değil mi?"),
        maya(
          "Döngü oturunca toplu işlem korkmaz. Bir sonraki bölümde seni fonksiyonlar bekliyor: işi adlandırıp yeniden kullanma.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_py3_1",
        "`range(1, 6)` hangi sayıları üretir?",
        ["1..6", "1, 2, 3, 4, 5", "0..5", "0..6"],
        1,
      ),
      mcq(
        "q_py3_2",
        "`while True` riski nedir?",
        ["Yavaşlık", "Çıkış yoksa sonsuz döngü", "Tip hatası", "Import hatası"],
        1,
      ),
      mcq(
        "q_py3_3",
        "`break` ne yapar?",
        ["Fonksiyon siler", "Döngüyü erken bitirir", "Dosya kapatır", "Tip değiştirir"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-temel-4",
    order: 4,
    title: "Fonksiyonlar: parametre, dönüş ve yeniden kullanım",
    dialogue: {
      warmup: [
        koray(
          "Esnafın standart poşeti vardır: kilo gelir, poşet çıkar, tarife her seferinde bakılmaz. `def ortalama(sayilar)` de o mu?",
        ),
        maya(
          "O. Çağıran taraf içindeki tartıyı bilmek zorunda kalmaz. Her seferinde aynı formülü kopyalamak, poşeti her müşteri için yeniden dikmek gibidir.",
        ),
      ],
      problem: [
        koray("`return` olmadan fonksiyon ne basar? Ben «yazdırdım» deyince iş bitti sanıyorum."),
        maya(
          "`return` yoksa `None` döner. Tezgâhta bağırmak, tartı fişi kesmek değildir. `print` senin gözün içindir; `return` çağıran tarafın elinedir. Fiyatı float lira basıp kasa kuruş beklerse fiş bozulur.",
        ),
      ],
      development: [
        koray("18,45 lirayı kuruş tamsayıya çevir. Yuvarlama nerde durur?"),
        maya(
          "`int(round(lira * 100))` dürüst kalıptır. Fonksiyon içi değişken yereldir; dışarı sızdırmaz.",
          {
            language: "py",
            source: `def lira_to_kurus(lira: float) -> int:
    return int(round(lira * 100))

assert lira_to_kurus(18.45) == 1845
assert lira_to_kurus(12.5) == 1250

def yazdir_sadece(lira: float) -> None:
    print(int(round(lira * 100)))

assert yazdir_sadece(1.0) is None`,
          },
        ),
      ],
      conclusion: [
        koray("İsmi olan iş tekrar yazılmaz, doğru mu?"),
        maya(
          "Fonksiyon, okunur ve test edilebilir adımların temel birimidir. Bir sonraki bölümde seni listeler ve sözlükler bekliyor: sırayı ve anahtarı nasıl tutarsın.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_py4_1",
        "`return` olmadan fonksiyon ne döner?",
        ["0", "None", "Boş string", "Hata zorunlu"],
        1,
      ),
      mcq(
        "q_py4_2",
        "Kuruş dönüşümü için doğru yaklaşım hangisidir?",
        ["float basmak", "int(round(lira * 100))", "str çarpmak", "hex"],
        1,
      ),
      mcq(
        "q_py4_3",
        "`def` ne başlatır?",
        ["Sınıf", "Fonksiyon tanımı", "Modül", "Paket"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-temel-5",
    order: 5,
    title: "Listeler ve sözlükler: sıra, anahtar ve sınır",
    dialogue: {
      warmup: [
        koray(
          "Pazar tezgâhında sebzeler sırayla durur; dolapta kavanozun üstünde etiket vardır. Liste ile sözlük bu iki raf mı?",
        ),
        maya(
          "Liste sıradır — indeks sıfırdan başlar. Sözlük etikettir — anahtarla değeri bağlarsın. «Birinci» dediğin şey kodda sıfırıncı raftır. Bu kafa karışıklığı utanç değil, tezgâh kuralıdır.",
        ),
      ],
      problem: [
        koray("`sepet[len(sepet)]` ile son elemanı okumak neden patlar?"),
        maya(
          "Sınır, uzunluk eksi birdir. `sepet[-1]` son raftır. Sözlükte `stok[\"armut\"]` yokken KeyError basar; `.get(\"armut\", 0)` yokluğu sıfır kabul eder. Çökmek nezaket değildir.",
        ),
      ],
      development: [
        koray("Üç meyve ve bir stok rafı yaz. Son elemanı ve eksik anahtarı dürüst oku."),
        maya(
          "İndeks sıfırdan. Anahtar hash’lenebilir durur: metin, tamsayı. Liste anahtar olmaz.",
          {
            language: "py",
            source: `sepet = ["elma", "armut", "ayva"]
assert sepet[0] == "elma"
assert sepet[-1] == "ayva"
assert len(sepet) == 3
# sepet[len(sepet)]  → IndexError

stok = {"elma": 4}
assert stok.get("armut", 0) == 0
assert "elma" in stok
# stok["armut"]  → KeyError`,
          },
        ),
      ],
      conclusion: [
        koray("Sıra ve etiket ayrı dürüstlük, doğru mu?"),
        maya(
          "Liste sırayı unutmaz; sözlük etiketi sıradan ayırır. Yokluğu çökmeden sorarsın. Bir sonraki bölümde seni kapanış laboratuvarı bekliyor: girdi al, doğrula, hesapla, yazdır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_py5_1",
        "Liste indeksi nereden başlar?",
        ["1", "0", "len", "-2 zorunlu"],
        1,
      ),
      mcq(
        "q_py5_2",
        "Son elemanı okumanın dürüst yolu hangisidir?",
        ["sepet[len(sepet)]", "sepet[-1] veya sepet[len(sepet) - 1]", "sepet[1]", "eval"],
        1,
      ),
      mcq(
        "q_py5_3",
        "Eksik sözlük anahtarında çökmeden okuma hangisidir?",
        ["Köşeli parantez", ".get veya in", "print şifre", "del zorunlu"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "python-temel-6",
    order: 6,
    title: "Mini proje: girdi doğrulama ve Fail-Closed kapanış",
    dialogue: {
      warmup: [
        koray(
          "Gişede «kaç bilet?» diye sorarsın. Biri «üç» der. Kızmazsın; «sayı olarak söyler misiniz?» dersin. Program da öyle mi durur?",
        ),
        maya(
          "Öyle. `input()` her zaman str döner — metin dizisi. int(\"üç\") patlar. Fail-closed (Hata Anında Kapalı) o patlamayı yutar, döngü yeniden sorar. Çökmek, gişenin kepenk indirmesidir.",
        ),
      ],
      problem: [
        koray("Boş girdi veya «üç» yazılınca ne kırılır?"),
        maya(
          "strip sonrası boşluk reddedilir. ValueError yakalanır; kullanıcıya kızılmaz, net cümle basılır: «Lütfen tamsayı gir.» Makine küfretmez; cümle kurar.",
        ),
      ],
      development: [
        koray("Kaç adet diye sor, doğrula, geçersizse yeniden sor, geçerliyse yazdır."),
        maya(
          "Girdi → doğrula → hesapla → yazdır. Bu Temel kapanışın özetidir. `main` kapısı, yarın aynı yemeği pişirmenin tarifidir.",
          {
            language: "py",
            source: `def oku_adet(ham: str) -> int:
    temiz = ham.strip()
    if not temiz:
        raise ValueError("boş girdi")
    try:
        return int(temiz)
    except ValueError as exc:
        raise ValueError("tamsayı değil") from exc


assert oku_adet("3") == 3
try:
    oku_adet("üç")
except ValueError as hata:
    assert "tamsayı" in str(hata)`,
          },
        ),
      ],
      conclusion: [
        koray("Temel kapanış bu mu: doğrula, hesapla, yazdır, sınava gir?"),
        maya(
          "Girdi doğrulanır, tip dürüst durur, hata kapıyı kapatır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_py6_1",
        "`input()` ne döner?",
        ["Her zaman int", "Her zaman str", "bool", "None"],
        1,
      ),
      mcq(
        "q_py6_2",
        "`int(\"üç\")` patlayınca dürüst yol hangisidir?",
        ["Programı kapat", "try/except ValueError ile yeniden sor", "0 kabul et", "eval"],
        1,
      ),
      mcq(
        "q_py6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "PDF indirince"],
        1,
      ),
    ],
  }),
] as const;

const PYTHON_TEMEL_LESSON_QUIZZES: AcademyExamQuestion[] = PYTHON_TEMEL_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const PYTHON_TEMEL_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...PYTHON_TEMEL_LESSON_QUIZZES,
  mcq("q_py_p1", "type() ne işe yarar?", ["Dosya açar", "Değerin tipini gösterir", "Döngü kırar", "Modül yükler"], 1),
  mcq("q_py_p2", "bool hangi ikilidir?", ["1 ve 2", "True / False", "yes / no", "on / off string"], 1),
  mcq("q_py_p3", "Anlamlı değişken adı neden iyidir?", ["Zorunlu sözdizimi", "Okunur sözleşme", "Daha hızlı CPU", "Garbage collector"], 1),
  mcq("q_py_p4", "continue ne yapar?", ["Programı bitirir", "O turu atlar", "Dosya siler", "Import"], 1),
  mcq("q_py_p5", "Yerel değişken dışarı sızar mı?", ["Evet her zaman", "Hayır; fonksiyon kapsamındadır", "Evet global olur", "Yalnız return ile aynı"], 1),
  mcq("q_py_p6", "elif ne işe yarar?", ["Import", "Ek koşul dalı", "Döngü", "Sınıf"], 1),
  mcq("q_py_p7", "Karşılaştırma sonucu tipi nedir?", ["str", "bool", "list", "dict"], 1),
  mcq("q_py_p8", "Boş girdi nasıl ele alınır?", ["Yoksay", "strip sonrası reddet / yeniden sor", "0 kabul et", "None bas"], 1),
  mcq("q_py_p9", "int('72') başarılı mı?", ["Hayır", "Evet", "Yalnız float", "Yalnız hex"], 1),
  mcq("q_py_p10", "list anahtar olarak dict’te durur mu?", ["Evet her zaman", "Hayır; liste hash’lenemez", "Yalnız boş liste", "Yalnız str ile karışık"], 1),
  mcq("q_py_p11", "float lira ortalama tuzağı nedir?", ["Hızlanır", "Yaklaşık / yuvarlama hatası", "Daha doğru", "Tip gerekmez"], 1),
  mcq("q_py_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_py_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız satın alma"], 1),
  mcq("q_py_p14", "Etkileşimli betik özeti nedir?", ["Yalnız print", "Girdi→doğrula→hesapla→yazdır", "Yalnız import", "Yalnız class"], 1),
];
