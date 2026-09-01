/**
 * AI Agent Orta Seviye — Çoklu ajan ve RAG mimarisi (AI-102).
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

export const AI_AGENT_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "ai-agent-orta-1",
    order: 1,
    title: "RAG (Retrieval-Augmented Generation) Mimarisi ve Embeddings Mantığı",
    intro: "Hoş geldiniz. Bu bölümde RAG (Retrieval-Augmented Generation) Mimarisi ve Embeddings Mantığı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Artırılmış Geri Çapraz Sorgulama (RAG) önce kanıt parçasını getirir, sonra cümle basar. Modele seksen sayfayı bir solukta yığmak bu sırayı bozar. Gömme (embedding) parçanın sayıya çevrilmiş halidir; benzerlik o uzayda ölçülür, ezberde değil. Siz bu derste getir-sonra-üret kapısını çiziyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Tek ajanın bağlam penceresi (context window) dolunca eski klasör düşer, model yine ağız açar. Kaynak yokken «muhtemelen 18 palet» basmak halüsinasyondur. Fail-closed (Hata Anında Kapalı) burada durur: getiri boşsa üretim yoktur. Pencere tavanı arşiv değildir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere kelime örtüşmesi kanıt kapısını bir kez kırar, sonra dürüst getiriyi basar. Bu küme kesişimi gerçek gömme modeli değildir; kapıyı gösterir. Eşik altı «Mars» uydurmaz. `getir` boşsa `uret` elini uzatmaz. RAG üç kapıdır: böl, göm, getir; sonra üret. Sonraki bölümde sizi vektör veritabanı (VectorDB) sorgusu bekliyor.",
    summary: "Bu dersle RAG (Retrieval-Augmented Generation) Mimarisi ve Embeddings Mantığı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kanıt raftan çıkar, cümle raftan sonra gelir. Bir sonraki bölümde sizi vektör veritabanı ile doküman sorgulama bekliyor: koleksiyon yoksa sorgu durur.",
    quiz: [
      mcq(
        "q_ago1_1",
        "Artırılmış Geri Çapraz Sorgulama (RAG) önce ne yapar?",
        ["Pencereye 80 sayfa yığar", "Kanıt parçasını getirir, sonra üretir", "Eğitim kesitini günceller", "Boşken orta palet basar"],
        1,
      ),
      mcq(
        "q_ago1_2",
        "Getiri boşken Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Muhtemel stok uydurur", "Üretimi durdurur; kaynak yok der", "Önceki sohbeti kanıt sanır", "Eşiği sessiz sıfırlar"],
        1,
      ),
      mcq(
        "q_ago1_3",
        "Bu dersteki kelime örtüşmesi gerçek gömme midir?",
        ["Evet, aynı fizik", "Hayır; kapıyı gösterir, sahte model iddiası yoktur", "Evet, cosine zorunlu", "Yalnız GPU’da"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "BELGE = [\n    \"Ankara depo: 18 palet un.\",\n    \"Istanbul depo: 14 palet un.\",\n]\n\n\ndef gom(metin):\n    harf = []\n    for ch in metin.lower():\n        harf.append(ch if ch.isalnum() else \" \")\n    return set(\"\".join(harf).split())\n\n\ndef benzerlik(a, b):\n    if not a or not b:\n        return 0.0\n    return len(a & b) / len(a | b)\n\n\nESIK = 0.15\n\n\ndef getir(soru):\n    vektor = gom(soru)\n    aday = []\n    for parca in BELGE:\n        skor = benzerlik(vektor, gom(parca))\n        if skor >= ESIK:\n            aday.append((skor, parca))\n    aday.sort(reverse=True)\n    if not aday:\n        raise ValueError(\"kaynak yok; islem durur\")\n    return aday[0][1]\n\n\ndef uret(soru):\n    kanit = getir(soru)\n    return \"Kanit: \" + kanit\n\n\nassert \"18 palet\" in uret(\"Ankara un stok\")\ntry:\n    uret(\"Mars kolonisi\")\nexcept ValueError as hata:\n    assert \"durur\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-2",
    order: 2,
    title: "Vektör Veritabanları (VectorDB) ile Doküman Sorgulama",
    intro: "Hoş geldiniz. Bu bölümde Vektör Veritabanları (VectorDB) ile Doküman Sorgulama konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Bellekteki Python listesi her sorguda baştan gezer. Vektör veritabanı (VectorDB) parçayı bir kez gömer, sorguyu komşu vektörle tartar. Koleksiyon yoksa kutu boştur; boş kutudan cilt uydurmazsınız. Siz bu derste ekle-sor-eşik kapısını mühürlüyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Boş koleksiyona sorgu atınca sürücü «0 sonuç» yerine genel bilgiyle doldurur. Fail-closed (Hata Anında Kapalı) burada durur: `query` boş liste dönerse üretim yoktur. top-k bir dilekçedir; eşik yoksa gürültü kanıt sanılır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere koleksiyon basılır, boş sorgu kırılır, eşiğin altı düşer. `Koleksiyon` sözlüktür; canlı Chroma değildir. `ekle` boş metni reddeder. `sor` eşiğin altında durur. top-k = 1 yine boşsa kapı kapanır. Canlı sürücü yarın aynı kapıyı kullanır: 0 sonuç «bilmiyorum»dur, genel bilgi doldurma hakkı değildir.",
    summary: "Bu dersle Vektör Veritabanları (VectorDB) ile Doküman Sorgulama becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kutu boşsa susar, eşik altı düşer. Sorgu raftan çıkar, kanıt yoksa cümle yoktur. Bir sonraki bölümde sizi çoklu ajan tasarımı bekliyor: kütüphaneci getirir, yazar yalnız o kanıta bakar.",
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
    code: {
      language: "py",
      source: "class Koleksiyon:\n    def __init__(self):\n        self.parcalar = []\n\n    def ekle(self, metin):\n        temiz = metin.strip()\n        if not temiz:\n            raise ValueError(\"bos parca; islem durur\")\n        self.parcalar.append(temiz)\n\n    def sor(self, soru, esik=0.2):\n        if not soru.strip():\n            raise ValueError(\"bos soru; islem durur\")\n        if not self.parcalar:\n            raise ValueError(\"koleksiyon bos; islem durur\")\n        hedef = set(\"\".join(ch if ch.isalnum() else \" \" for ch in soru.lower()).split())\n        aday = []\n        for parca in self.parcalar:\n            kume = set(\"\".join(ch if ch.isalnum() else \" \" for ch in parca.lower()).split())\n            if not kume:\n                continue\n            skor = len(hedef & kume) / len(hedef | kume)\n            if skor >= esik:\n                aday.append((skor, parca))\n        aday.sort(reverse=True)\n        if not aday:\n            raise ValueError(\"esik alti; islem durur\")\n        return aday[0][1]\n\n\nraf = Koleksiyon()\ntry:\n    raf.sor(\"Ankara un\")\nexcept ValueError as hata:\n    assert \"koleksiyon\" in str(hata)\nraf.ekle(\"Ankara depo: 18 palet un.\")\nassert \"18 palet\" in raf.sor(\"Ankara un\")\ntry:\n    raf.sor(\"Mars kolonisi\")\nexcept ValueError as hata:\n    assert \"esik\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-3",
    order: 3,
    title: "Çoklu Ajan (Multi-Agent) Tasarım Desenleri: Araştırmacı + Yazar Ajan İşbirliği",
    intro: "Hoş geldiniz. Bu bölümde Çoklu Ajan (Multi-Agent) Tasarım Desenleri: Araştırmacı + Yazar Ajan İşbirliği konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Çoklu ajan (multi-agent) iki rolü ayırır. Araştırmacı getiri üretir; yazar yalnız teslim sözleşmesindeki kanıta bakar. Tek ajan hem arar hem rapor yazarsa karışınca hangisinin uydurduğunu göremezsiniz. Siz bu derste pas sözleşmesini mühürlüyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Araştırmacı boş dönünce yazar yine paragraf basarsa pas kaçmış, rapor yine doğmuştur. Fail-closed (Hata Anında Kapalı) el sıkışında durur: `kanit` yoksa yazar çalışmaz. «Benzer konuda genel cümle» teslim değildir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere iki ajan aynı betikte paslaşır, boş kanıt bir kez kırılır. `arastir` koleksiyondan getirir. `yaz` kanıt boşsa durur. Rol kaydı raftadır; bilinmeyen ad düşer. LangChain ismi şart değildir; sözleşme durur. Yazarın raftında `yaz` vardır, `arastir` yoktur. Rol dışı ad Fail-closed durur.",
    summary: "Bu dersle Çoklu Ajan (Multi-Agent) Tasarım Desenleri: Araştırmacı + Yazar Ajan İşbirliği becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Pas: getir, sonra yaz. Boş elde rapor yoktur. Bir sonraki bölümde sizi durum ve bellek yönetimi bekliyor: pas defteri kaybolursa ikinci ajan körlemesine yazmaz.",
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
    code: {
      language: "py",
      source: "RAF = {\"ankara\": \"Ankara depo: 18 palet un.\"}\n\n\ndef arastir(konu):\n    if konu not in RAF:\n        raise ValueError(\"kanit yok; islem durur\")\n    return RAF[konu]\n\n\ndef yaz(kanit):\n    if not isinstance(kanit, str) or not kanit.strip():\n        raise ValueError(\"bos teslim; islem durur\")\n    return \"Rapor: \" + kanit\n\n\ndef ekip(konu):\n    kanit = arastir(konu)\n    return yaz(kanit)\n\n\nassert \"18 palet\" in ekip(\"ankara\")\ntry:\n    ekip(\"mars\")\nexcept ValueError as hata:\n    assert \"kanit\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-4",
    order: 4,
    title: "Ajanlar Arası Durum (State) ve Bellek Yönetimi",
    intro: "Hoş geldiniz. Bu bölümde Ajanlar Arası Durum (State) ve Bellek Yönetimi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Ajanlar arası durum (state) ortak defterdir. Kısa bellek bu turun defteridir; uzun bellek raftaki kanıttır. Her ajan kendi cebinde ayrı not tutarsa öbürü kör kalır. Anahtar yoksa defter boştur; boş defterden stok uydurmazsınız.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Yazar `kanit` anahtarını silince araştırmacı «vardı sanırım» derse durum yalan söylemiş olur. Fail-closed (Hata Anında Kapalı) `get` ile durur: anahtar yoksa işlem yoktur. Sessiz varsayılan boş metin rapor hakkı doğurmaz. Pencere dolunca eski tur düşer; düşen turu durum sanmak ikinci yalandır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere ortak defter basılır, eksik anahtar kırılır. `Durum` sözlüktür. `oku` eksikte durur. `yaz` boş değeri reddeder. Araştırmacı `kanit` basar, yazar yalnız o anahtarı okur. Bu derste tek yazar kuralı durur: `kanit` yalnız araştırmacı yazar. Son yazan ezmesi yoktur.",
    summary: "Bu dersle Ajanlar Arası Durum (State) ve Bellek Yönetimi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Defter ortak, eksik anahtar susar. Durum sözleşmesi pası taşır. Bir sonraki bölümde sizi onay mekanizması bekliyor: rapor dışarı çıkmadan insan damgası gerekir.",
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
    code: {
      language: "py",
      source: "class Durum:\n    def __init__(self):\n        self.defter = {}\n\n    def yaz(self, anahtar, deger):\n        if not anahtar or not isinstance(deger, str) or not deger.strip():\n            raise ValueError(\"bos durum; islem durur\")\n        self.defter[anahtar] = deger\n\n    def oku(self, anahtar):\n        if anahtar not in self.defter:\n            raise ValueError(\"anahtar yok; islem durur\")\n        return self.defter[anahtar]\n\n\ndefter = Durum()\ntry:\n    defter.oku(\"kanit\")\nexcept ValueError as hata:\n    assert \"anahtar\" in str(hata)\ndefter.yaz(\"kanit\", \"Ankara depo: 18 palet un.\")\nassert \"18 palet\" in defter.oku(\"kanit\")",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-5",
    order: 5,
    title: "İnsan Müdahalesi (Human-in-the-Loop) ve Ajan Onay Mekanizmaları",
    intro: "Hoş geldiniz. Bu bölümde İnsan Müdahalesi (Human-in-the-Loop) ve Ajan Onay Mekanizmaları konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. İnsan müdahalesi (Human-in-the-Loop) riskli aracın kaşesidir. Ajan «raporu müşteriye gönder» deyince onay yoksa fiş kesilmez. Riskli araç `beklemede` durur; `onay` yoksa gönderim yoktur. Otonomi «onay yokken bas» demek değildir.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Zaman aşımı olunca ajan «muhtemelen onaylandı» derse sahte yeşil doğar. Fail-closed (Hata Anında Kapalı) zaman dolunca durur: onay yoksa araç çağrılmaz. Sessiz varsayılan `True` iade fişidir. Kayıtsız kaşe yok hükmündedir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere bekleme kutusu basılır, red ve onay ayrı kırılır. `istek` riskli işi `beklemede` yazar. `karar` yalnız `onay` veya `red` kabul eder. Onay yokken `gonder` durur. Kaşe kayıt olmadan yok sayılır. Mini projede bu kapı durur.",
    summary: "Bu dersle İnsan Müdahalesi (Human-in-the-Loop) ve Ajan Onay Mekanizmaları becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Riskli iş beklemede kalır. Red durur, sessiz True yoktur. İnsan kapısı araçtan önce durur. Bir sonraki bölümde sizi kendi dokümanlarınızla konuşan ekip bekliyor: getiri, yazar, defter ve kaşe aynı betikte.",
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
    code: {
      language: "py",
      source: "RISKLI = {\"gonder\"}\n\n\ndef istek(arac, govde, onay=None):\n    if arac not in RISKLI:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    if not govde.strip():\n        raise ValueError(\"bos govde; islem durur\")\n    if onay is None:\n        return {\"durum\": \"beklemede\", \"govde\": govde}\n    if onay not in (\"onay\", \"red\"):\n        raise ValueError(\"gecersiz karar; islem durur\")\n    if onay == \"red\":\n        raise ValueError(\"red; islem durur\")\n    return {\"durum\": \"gonderildi\", \"govde\": govde}\n\n\nkutu = istek(\"gonder\", \"Rapor: 18 palet\")\nassert kutu[\"durum\"] == \"beklemede\"\nassert istek(\"gonder\", \"Rapor: 18 palet\", onay=\"onay\")[\"durum\"] == \"gonderildi\"\ntry:\n    istek(\"gonder\", \"Rapor: 18 palet\", onay=\"red\")\nexcept ValueError as hata:\n    assert \"red\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-orta-6",
    order: 6,
    title: "Mini Proje: Kendi Dokümanlarınla Konuşan ve Rapor Üreten Çift Ajanlı Ekip",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Kendi Dokümanlarınla Konuşan ve Rapor Üreten Çift Ajanlı Ekip konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Doküman sözlüğü, getiri eşiği, ortak durum ve insan kapısı tek `calistir` içinde durur. Ağ yoktur: sahte «canlı arşiv» iddiası taşımaz. Siz kendi parçalarınızı `ekle` ile basarsınız.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Boş klasör, boş konu, onaysız gönderim ve bozuk kanıt ayrı kapılardır. Çökmek isimsiz olmaz; ValueError isimlidir. Orta rapor yoktur. `calistir` konu ister, getiri basar, yazar okur, gönderim kaşe ister.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere ekleme, sorgu, pas ve kaşesiz kırılma aynı ekip gövdesinde durur. Bu Orta kapanıştır. `arastir` eşik altını keser. `yaz` defterden okur. `gonder` onaysız durur. Ekip canlı modele bağlı değildir; kapılar sahte ağ olmadan görünür. Canlı model yarın aynı eşik ve kaşeyi doldurur; siz bugün gişeyi mühürlediniz. Sınavda sizi baraj 70 bekler; belge yalnız o kapıdan basılır.",
    summary: "Bu dersle Mini Proje: Kendi Dokümanlarınla Konuşan ve Rapor Üreten Çift Ajanlı Ekip becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Orta kapanış: getir, yaz, defter, kaşe. Kanıt raftan, rapor defterden, gönderim kaşeden geçer. Sınavda sizi baraj 70 bekler; belge yalnız o kapıdan basılır.",
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
    code: {
      language: "py",
      source: "RAF = []\nDEFTER = {}\n\n\ndef ekle(metin):\n    temiz = metin.strip()\n    if not temiz:\n        raise ValueError(\"bos parca; islem durur\")\n    RAF.append(temiz)\n    return len(RAF)\n\n\ndef arastir(soru):\n    hedef = set(\"\".join(ch if ch.isalnum() else \" \" for ch in soru.lower()).split())\n    aday = []\n    for parca in RAF:\n        kume = set(\"\".join(ch if ch.isalnum() else \" \" for ch in parca.lower()).split())\n        if not kume:\n            continue\n        skor = len(hedef & kume) / len(hedef | kume)\n        if skor >= 0.15:\n            aday.append((skor, parca))\n    aday.sort(reverse=True)\n    if not aday:\n        raise ValueError(\"kaynak yok; islem durur\")\n    DEFTER[\"kanit\"] = aday[0][1]\n    return DEFTER[\"kanit\"]\n\n\ndef yaz():\n    if \"kanit\" not in DEFTER:\n        raise ValueError(\"anahtar yok; islem durur\")\n    DEFTER[\"rapor\"] = \"Rapor: \" + DEFTER[\"kanit\"]\n    return DEFTER[\"rapor\"]\n\n\ndef gonder(onay):\n    if onay != \"onay\":\n        raise ValueError(\"kaşe yok; islem durur\")\n    if \"rapor\" not in DEFTER:\n        raise ValueError(\"rapor yok; islem durur\")\n    return DEFTER[\"rapor\"]\n\n\ndef calistir(soru, onay=None):\n    arastir(soru)\n    yaz()\n    if onay is None:\n        return {\"durum\": \"beklemede\", \"rapor\": DEFTER[\"rapor\"]}\n    return gonder(onay)\n\n\nassert ekle(\"Ankara depo: 18 palet un.\") == 1\nkutu = calistir(\"Ankara un\")\nassert kutu[\"durum\"] == \"beklemede\"\nassert \"18 palet\" in calistir(\"Ankara un\", onay=\"onay\")\ntry:\n    calistir(\"Mars kolonisi\")\nexcept ValueError as hata:\n    assert \"kaynak\" in str(hata)",
    },
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
