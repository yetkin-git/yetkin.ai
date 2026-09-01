/**
 * AI Agent Temel Seviye — otonom ajan müfredatı.
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

export const AI_AGENT_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "ai-agent-temel-1",
    order: 1,
    title: "AI Agent Nedir? LLM vs. Otonom Ajan Mantığı",
    intro: "Hoş geldiniz. Bu bölümde AI Agent Nedir? LLM vs. Otonom Ajan Mantığı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Büyük Dil Modeli (LLM) metin üretir; bilet iptal etmez, stok yazmaz, kargo basmaz. Elinde klavye olan ajan ise modeli bir döngünün içine oturtur: düşünür, izinli aracı çağırır, sonucu okur, gerekirse ikinci işi yapar. Sen bu derste cümle ile iş bitirme arasındaki sınırı çiziyorsun.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Modelin eğitim kesiti dündür; bugünün stoku, takviminiz ve kasa bakiyeniz orada yoktur. Kapı kapalıyken ağız açık kalırsa halüsinasyon (uydurma) başlar. Fail-closed (Hata Anında Kapalı) kuralı nettir: araç yoksa işlem durur, orta değer basılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere sohbet kutusu aynı soruya cümle basar, ajan ise önce araç adını seçer. Araç yoksa durur; «muhtemelen 18 derece» diye uydurma yazmaz. Döngü şudur: gözlem al, karar ver, araç çalıştır, yeni gözlemle devam et. Tek cümle ajan değildir. Sonraki derslerde tarif, araç kaydı ve hafıza bu döngüyü doldurur.",
    summary: "Bu dersle AI Agent Nedir? LLM vs. Otonom Ajan Mantığı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Ajan dış dünyaya kapı ister; kapı yoksa susar. Bir sonraki bölümde sizi üretim tarifi ve yapılandırılmış çıktı bekliyor.",
    quiz: [
      mcq(
        "q_agt1_1",
        "Büyük Dil Modeli (LLM) ile otonom ajan farkı nedir?",
        ["Aynıdır; ikisi de yalnız metin üretir", "LLM metin üretir; ajan araç çağırıp iş bitirebilir", "Ajan eğitim kesitini günceller", "LLM her zaman güncel stok okur"],
        1,
      ),
      mcq(
        "q_agt1_2",
        "Araç yokken Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Muhtemel derece uydurur", "İşlemi durdurur; orta değer basmaz", "Önceki sohbeti stok sanır", "Sessizce 0 basar"],
        1,
      ),
      mcq(
        "q_agt1_3",
        "Halüsinasyon (uydurma) neden doğar?",
        ["Model her zaman veritabanına bakıyor", "Dış dünya kapalıyken model yine cümle basar", "Araç çağrısı zorunludur", "JSON şeması uydurmayı keser her zaman"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "STOK = {\"Ankara\": 18, \"İstanbul\": 14}\n\n\ndef sohbet_kutusu(soru):\n    return \"Sanırım hava güzel.\"\n\n\ndef ajan_oku(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\nassert sohbet_kutusu(\"Ankara kaç derece?\") == \"Sanırım hava güzel.\"\nassert ajan_oku(\"Ankara\") == 18\ntry:\n    ajan_oku(\"Mars\")\nexcept ValueError as hata:\n    assert \"durur\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-2",
    order: 2,
    title: "Prompt Mühendisliği ve Yapılandırılmış Çıktı (JSON Output)",
    intro: "Hoş geldiniz. Bu bölümde Prompt Mühendisliği ve Yapılandırılmış Çıktı (JSON Output) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Modele «güzel JSON yaz» demek kapı açmaz; «JSON gibi yaz» dilekçedir. JavaScript Nesne Gösterimi (JSON) parse edilir, zorunlu alan yoksa iş durur. Siz tarifi katmanlarsınız: sistem yasağı, kullanıcı işi ve biçim şeması ayrı durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Tek paragrafa yasak, iş ve şema yığılınca model yasağı iş sanır veya işi süs cümlesine gömer. Tırnak kaçınca parse kırılır. «Neredeyse JSON» geçerli nesne değildir. Fail-closed (Hata Anında Kapalı) burada durur: json.loads kırılırsa sonraki araç çağrılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere geçersiz metin ve eksik alan bir kez kırılır, sonra dürüst şema basılır. `niyet` veya `sehir` yoksa ajan elini uzatmaz. Sistem katmanı meslek ve yasaktır; kullanıcı katmanı işi taşır; biçim yalnız şemadır. Üçü tek bağırış olursa kapı kayar. Şema geçmeden araç adı konuşulmaz.",
    summary: "Bu dersle Prompt Mühendisliği ve Yapılandırılmış Çıktı (JSON Output) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Tarif katmanlıdır, şema kapıdır; parse edilen nesne ajanın elindeki fiştir. Bir sonraki bölümde sizi araç kullanımı bekliyor: fişteki ad gerçek fonksiyonu çağırır, bilinmeyen ad durur.",
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
        ["Tek paragraf yeter", "Sistem yasağı, kullanıcı işi, biçim şeması ayrı durur", "Yalnız few-shot", "Yalnız araç adı"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "import json\n\nZORUNLU = (\"niyet\", \"sehir\")\n\n\ndef oku_cikti(ham):\n    try:\n        veri = json.loads(ham)\n    except json.JSONDecodeError as exc:\n        raise ValueError(\"json degil; islem durur\") from exc\n    if not isinstance(veri, dict):\n        raise ValueError(\"nesne degil; islem durur\")\n    for alan in ZORUNLU:\n        if alan not in veri:\n            raise ValueError(\"alan eksik; islem durur\")\n    return veri\n\n\ntry:\n    oku_cikti(\"hava güzel\")\nexcept ValueError as hata:\n    assert \"json\" in str(hata)\ntry:\n    oku_cikti('{\"niyet\": \"hava\"}')\nexcept ValueError as hata:\n    assert \"alan\" in str(hata)\nassert oku_cikti('{\"niyet\": \"hava\", \"sehir\": \"Ankara\"}')[\"sehir\"] == \"Ankara\"",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-3",
    order: 3,
    title: "Araç Kullanımı (Tool Calling / Function Calling) Mantığı",
    intro: "Hoş geldiniz. Bu bölümde Araç Kullanımı (Tool Calling / Function Calling) Mantığı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Tool calling / function calling (araç çağrısı) modelin eline fonksiyon adı ve argüman verir. Rafta duran şey araç kaydıdır. Siz rafta olmayan adı çalıştırmazsınız. Fail-closed (Hata Anında Kapalı): bilinmeyen araç durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Model «sil_her_seyi» diye uydurursa açık rafta o ad yoksa çağrı düşer. İsim benzerliği yetmez. Argüman tipi de kapıdır: şehir yerine boş metin, not yerine sır kabul edilmez. Uygulama Programlama Arayüzü (API) anahtarı tarife girmez; araç gövdesine de yapışmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere hava ve not iki ayrı araçtır; bilinmeyen ad bir kez kırılır. Sözlük raftır. `ARACLAR.get` yokluğu None basmaz; siz açıkça durursunuz. Çağrı sonucu gözlemdir, nihai cevap değildir. Üretimde çoğu kapı ayrı kanal verir: ad ve JSON argüman. Siz yine parse eder, rafta yoksa durursunuz. Serbest cümle içinden isim kazımak kapıyı bozar.",
    summary: "Bu dersle Araç Kullanımı (Tool Calling / Function Calling) Mantığı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Rafta yoksa el uzamaz. Araç anın işidir; hafıza dünün işini taşır. Bir sonraki bölümde sizi kısa pencere ve uzun süreli depo bekliyor: bağlam dolunca eski cümle kayar, uydurma özet kapı değildir.",
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
    code: {
      language: "py",
      source: "STOK = {\"Ankara\": \"18 derece\"}\nNOTLAR = []\n\n\ndef hava_durumu(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\ndef not_yaz(metin):\n    temiz = metin.strip()\n    if not temiz:\n        raise ValueError(\"bos not; islem durur\")\n    NOTLAR.append(temiz)\n    return len(NOTLAR)\n\n\nARACLAR = {\"hava_durumu\": hava_durumu, \"not_yaz\": not_yaz}\n\n\ndef arac_cagir(ad, arguman):\n    fn = ARACLAR.get(ad)\n    if fn is None:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    return fn(arguman)\n\n\nassert arac_cagir(\"hava_durumu\", \"Ankara\") == \"18 derece\"\nassert arac_cagir(\"not_yaz\", \"toplantı 14:00\") == 1\ntry:\n    arac_cagir(\"sil_her_seyi\", \"\")\nexcept ValueError as hata:\n    assert \"bilinmeyen\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-4",
    order: 4,
    title: "Hafıza Mimarisi: Kısa ve Uzun Süreli Hafıza (Context Window & Vector Storage)",
    intro: "Hoş geldiniz. Bu bölümde Hafıza Mimarisi: Kısa ve Uzun Süreli Hafıza (Context Window & Vector Storage) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Bağlam penceresi (context window) tavanıdır: dolunca eski tur düşer. Uzun süreli hafıza ayrı raftır; diske veya vektör depoya yazarsınız. Pencerenin «hatırlıyor» sanılması, düşen turu hâlâ içeride saymaktır. Siz bu derste kısa pencere ile uzun rafı ayırıyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Pencere dolunca sessiz özet uydurmak kaynaksız iddiadır. Fail-closed (Hata Anında Kapalı): tavan dolunca işi bölersiniz veya dışarı yazarsınız. Vektör depo (vector storage) gömülü sayılarla mesafe ölçer. Bu derste sahte gömme iddiası yoktur; kelime örtüşmesi aynı kapıyı gösterir: eşik altı kayıt yoksa üretim durur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere kısa pencere listeyle kesilir, uzun rafta eşiğin altında uydurma basılmaz. Kısa hafıza son N turdur. Uzun raf `getir` ile soruya en yakın kaydı döner. Skor eşiğin altındaysa «belgede yok» dersiniz. Gerçek vektör veri tabanı bu kelime örtüşmesi değildir; orada gömme modeli sayıları üretir. Siz aynı fail-closed kapısını öğreniyorsunuz: getiri boşsa üretim durur.",
    summary: "Bu dersle Hafıza Mimarisi: Kısa ve Uzun Süreli Hafıza (Context Window & Vector Storage) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Pencere kısa, raf uzun, eşik kapıdır. Hafıza gözlemi besler. Bir sonraki bölümde sizi ReAct (Akıl Yürüt ve Eyleme Geç) deseni bekliyor: düşün, araç seç, gözlemi oku, gerekirse dur.",
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
    code: {
      language: "py",
      source: "def kisa_pencere(turlar, tavan):\n    if tavan <= 0:\n        raise ValueError(\"tavan pozitif olmali; islem durur\")\n    return turlar[-tavan:]\n\n\ndef benzerlik(soru, kayit):\n    a = set(soru.lower().split())\n    b = set(kayit.lower().split())\n    if not a or not b:\n        return 0.0\n    return len(a & b) / len(a | b)\n\n\ndef getir(soru, depo, esik):\n    if not depo:\n        raise ValueError(\"depo bos; uydurma yok\")\n    en = max(depo, key=lambda kayit: benzerlik(soru, kayit))\n    if benzerlik(soru, en) < esik:\n        raise ValueError(\"kaynak yok; uydurma yok\")\n    return en\n\n\ngecmis = [\"merhaba\", \"ankara stok\", \"not: toplantı\"]\nassert kisa_pencere(gecmis, 2) == [\"ankara stok\", \"not: toplantı\"]\nassert getir(\"toplantı saati\", [\"not: toplantı 14:00\", \"hava 18\"], 0.2) == \"not: toplantı 14:00\"\ntry:\n    getir(\"mars kolonisi\", [\"not: toplantı 14:00\"], 0.8)\nexcept ValueError as hata:\n    assert \"kaynak yok\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-5",
    order: 5,
    title: "Karar Verme Döngüleri: ReAct (Reason + Act) Deseni",
    intro: "Hoş geldiniz. Bu bölümde Karar Verme Döngüleri: ReAct (Reason + Act) Deseni konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. ReAct (Akıl Yürüt ve Eyleme Geç) yazılı bir ritimdir: Thought (düşünce), Action (eylem), Observation (gözlem). Düşünce boşsa eylem yoktur. Eylem rafta yoksa durur. Gözlem gelmeden ikinci eylem yasaktır. Siz bu derste turu saymayı öğreniyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Model «bitirdim» deyip araç çağırmazsa veya sonsuz araç isterse ikisi de kazadır. Tur tavanı yazılıdır. Fail-closed (Hata Anında Kapalı): tavan dolunca yeni araç yoktur, dürüst «bitiremedim» durur. Düşünce yokken eylem kör savuruştur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere bir tur düşünce, araç çağrısı ve gözlem okumasından oluşur; tavan aşılınca durur. `react_tur` düşünce boşsa girmez. `bitir` nihai yanıttır. Tavan 3 ise dördüncü eylem düşer. Gözlem araçtan gelir; siz onu doğrularsınız. Şehir yoksa araç zaten durur. Döngü «yok»u cümleye çevirir, stok uydurmaz. ReAct sihir değildir.",
    summary: "Bu dersle Karar Verme Döngüleri: ReAct (Reason + Act) Deseni becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Düşün, eyle, gözle, tavanı say. Bir sonraki bölümde sizi hava durumu ve not alma araçlarını kullanan basit bir Python ajanı bekliyor. Sınav kapısı o laboratuvarın ardından açılır.",
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
    code: {
      language: "py",
      source: "STOK = {\"Ankara\": \"18 derece\"}\n\n\ndef hava_durumu(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\nARACLAR = {\"hava_durumu\": hava_durumu}\n\n\ndef react_tur(dusunce, eylem, arguman, tur_no, tavan):\n    if not dusunce.strip():\n        raise ValueError(\"dusunce bos; islem durur\")\n    if tur_no > tavan:\n        raise ValueError(\"tavan doldu; islem durur\")\n    if eylem == \"bitir\":\n        return {\"tur\": \"yanit\", \"metin\": arguman}\n    fn = ARACLAR.get(eylem)\n    if fn is None:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    gozlem = fn(arguman)\n    return {\"tur\": \"gozlem\", \"metin\": gozlem}\n\n\nbir = react_tur(\"stok lazim\", \"hava_durumu\", \"Ankara\", 1, 3)\nassert bir[\"tur\"] == \"gozlem\"\nassert \"18\" in bir[\"metin\"]\niki = react_tur(\"cevap hazır\", \"bitir\", \"Ankara 18 derece\", 2, 3)\nassert iki[\"tur\"] == \"yanit\"\ntry:\n    react_tur(\"yine dene\", \"hava_durumu\", \"Ankara\", 4, 3)\nexcept ValueError as hata:\n    assert \"tavan\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-temel-6",
    order: 6,
    title: "Mini Proje: Hava Durumu ve Not Alma Araçlarını Kullanan Basit Bir Python AI Agent",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Hava Durumu ve Not Alma Araçlarını Kullanan Basit Bir Python AI Agent konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. İki işi bir ağızla uydurmazsınız: önce stoka bakarsınız, sonra deftere yazarsınız. Şema parse, araç kaydı, ReAct tavanı ve hafıza eşiği tek betikte durur. Ağ çağrısı yoktur: stok sözlüktür, not listedir. Sahte servis «canlı hava» iddiası taşımaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Boş şehir, boş not, bilinmeyen araç ve bozuk JSON ayrı kapılardır. Çökmek isimsiz olmaz; ValueError isimlidir. Orta değer yoktur. Siz `calistir` ile kullanıcı cümlesini şemaya basar, tur tur ilerlersiniz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere hava okuma, not yazma ve bilinmeyen ad aynı ajan gövdesinde durur. `ajan_adim` şemayı ister. `niyet` hava veya nottur; rafta yoksa durur. Bu Temel kapanıştır. Ajan canlı modele bağlı değildir; kapılar sahte ağ olmadan görünür. Canlı model yarın aynı şemayı doldurur; siz bugün kapıyı mühürlediniz. Sınavda sizi baraj 70 bekler; belge yalnız o kapıdan basılır.",
    summary: "Bu dersle Mini Proje: Hava Durumu ve Not Alma Araçlarını Kullanan Basit Bir Python AI Agent becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Temel kapanış: şema, araç, tavan, susma. Girdi şemadan geçer, araç raftan çıkar, hata kapıyı kapatır. Sınavda sizi baraj 70 bekler; belge yalnız o kapıdan basılır.",
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
    code: {
      language: "py",
      source: "import json\n\nSTOK = {\"Ankara\": \"parcali bulutlu, 18\", \"İstanbul\": \"yagmurlu, 14\"}\nNOTLAR = []\nARACLAR = {}\n\n\ndef hava_durumu(sehir):\n    if sehir not in STOK:\n        raise ValueError(\"sehir yok; islem durur\")\n    return STOK[sehir]\n\n\ndef not_yaz(metin):\n    temiz = metin.strip()\n    if not temiz:\n        raise ValueError(\"bos not; islem durur\")\n    NOTLAR.append(temiz)\n    return f\"kayit={len(NOTLAR)}\"\n\n\nARACLAR[\"hava_durumu\"] = hava_durumu\nARACLAR[\"not_yaz\"] = not_yaz\n\n\ndef ajan_adim(ham):\n    try:\n        veri = json.loads(ham)\n    except json.JSONDecodeError as exc:\n        raise ValueError(\"json degil; islem durur\") from exc\n    niyet = veri.get(\"niyet\")\n    if niyet not in ARACLAR:\n        raise ValueError(\"bilinmeyen arac; islem durur\")\n    arguman = veri.get(\"arguman\")\n    if not isinstance(arguman, str) or not arguman.strip():\n        raise ValueError(\"arguman yok; islem durur\")\n    return ARACLAR[niyet](arguman)\n\n\nassert ajan_adim('{\"niyet\": \"hava_durumu\", \"arguman\": \"Ankara\"}') == \"parcali bulutlu, 18\"\nassert \"kayit=1\" in ajan_adim('{\"niyet\": \"not_yaz\", \"arguman\": \"toplantı 14:00\"}')\ntry:\n    ajan_adim('{\"niyet\": \"sil\", \"arguman\": \"x\"}')\nexcept ValueError as hata:\n    assert \"bilinmeyen\" in str(hata)",
    },
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
