/**
 * AI Agent İleri Seviye — LangGraph, onarım, korkuluk ve üretim (AI-103).
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

export const AI_AGENT_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-1",
    order: 1,
    title: "Döngüsel Ajan Akışları ve Grafik Mimarisi (LangGraph / StateGraph Mantığı)",
    intro: "Hoş geldiniz. Bu bölümde Döngüsel Ajan Akışları ve Grafik Mimarisi (LangGraph / StateGraph Mantığı) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Grafik ajan çizelgesi (LangGraph) düğüm, kenar ve durmayı çizer. Durum Grafiği (StateGraph) ortak defterdir. Fail-closed (Hata Anında Kapalı) kırmızı lambadır. Lambasız kenar sonsuz döngüdür. Siz bu derste tavanlı makası mühürlüyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Tur tavanı yoksa ajan kendi kenarına döner, defter şişer, araç tekrar tekrar çağrılır. Saha «bir tur daha» diye uydurmaz; tavan dolunca işlem durur. Kayıp düğüm sessiz None değildir; isimli durmadır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere tek çizelge durur: kenar yoksa dur, tavan dolunca dur. Bu sahte LangGraph paketi değildir; düğüm-kenar fiziğini gösterir. `yurut` kayıt dışı adı keser. `adim > TAVAN` kırmızı lambadır. Çizelge yönlüdür; kırmızı lamba tur sayar. Bir sonraki bölümde sizi yansıma döngüsü bekliyor: kırık araç bir kez onarılır, sonsuz deneme yoktur.",
    summary: "Bu dersle Döngüsel Ajan Akışları ve Grafik Mimarisi (LangGraph / StateGraph Mantığı) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Düğüm iş, kenar geçiş, tavan durmadır. Durum defterde, geçiş kenarda, durma tavanda durur. Bir sonraki bölümde sizi kendi kendini onaran ajan ve yansıma döngüsü bekliyor.",
    quiz: [
      mcq(
        "q_agi1_1",
        "Durum Grafiği (StateGraph) ne tutar?",
        ["Yalnız TTS sesi", "Ajanın paylaştığı ortak defter", "Sertifika hash", "GPU tavanı"],
        1,
      ),
      mcq(
        "q_agi1_2",
        "Tur tavanı dolunca Fail-closed (Hata Anında Kapalı) ne yapar?",
        ["Bir tur daha uydurur", "İşlemi durdurur; sonsuz döngü yok", "Kenarı sessiz siler", "None basar"],
        1,
      ),
      mcq(
        "q_agi1_3",
        "Kayıp düğüm adı neye yol açar?",
        ["Önceki sonucu basar", "İsimli durma; kenar yok", "Kendini basla sanır", "eval açar"],
        1,
      ),
    ],
    code: {
      language: "py",
      source: "TAVAN = 4\nKENAR = {}\n\n\ndef dugum_basla(durum):\n    durum[\"adim\"] = durum.get(\"adim\", 0) + 1\n    if durum[\"adim\"] > TAVAN:\n        raise ValueError(\"tur tavani; islem durur\")\n    return \"arac\"\n\n\ndef dugum_arac(durum):\n    if durum.get(\"arac\") != \"stok_oku\":\n        raise ValueError(\"kenar yok; islem durur\")\n    durum[\"sonuc\"] = 18\n    return \"bitir\"\n\n\nKENAR[\"basla\"] = dugum_basla\nKENAR[\"arac\"] = dugum_arac\n\n\ndef yurut(durum):\n    dugum = \"basla\"\n    while dugum != \"bitir\":\n        if dugum not in KENAR:\n            raise ValueError(\"kayip dugum; islem durur\")\n        dugum = KENAR[dugum](durum)\n    return durum[\"sonuc\"]\n\n\nassert yurut({\"arac\": \"stok_oku\"}) == 18\ntry:\n    yurut({\"arac\": \"sil\"})\nexcept ValueError as hata:\n    assert \"kenar\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-2",
    order: 2,
    title: "Kendi Kendini Onaran Ajanlar (Self-Healing & Reflection Loop)",
    intro: "Hoş geldiniz. Bu bölümde Kendi Kendini Onaran Ajanlar (Self-Healing & Reflection Loop) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kendi kendini onarma bir kez yansıtır, yedek yolu dener, tavan dolunca durur. Retry sonsuz nezaket değildir. Fail-closed (Hata Anında Kapalı) ikinci kırıkta hattı keser. Siz bu derste tek bakış, tek yedek kuralını mühürlüyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Hata mesajını yutarsanız ajan kör döner. Yansıma hatayı okur, tek yedek üretir. Okunmayan hata «belki geçer» diye aynı kırık aracı sonsuz çağırır. Tavan 1’dir; 1’den sonra işlem durur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere tek yansıma vardır; yedek yoksa durur. `yansit` yalnız bilinen kırığı yedeke çevirir. Bilinmeyen hata yol üretmez. `deneme >= DENEME_TAVAN` kırmızı lambadır. Yedek de kırılırsa tavan yeter: ikinci çağrı `deneme=1` olur, tavan dolunca onarilamadi durur.",
    summary: "Bu dersle Kendi Kendini Onaran Ajanlar (Self-Healing & Reflection Loop) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Onarım: bir bakış, bir yedek, tavan. Kırık okunur, yedek bir kez denenir, ikinci kırık hattı kapatır. Bir sonraki bölümde sizi ajan korkuluğu ve yetkisiz eylem engeli bekliyor.",
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
    code: {
      language: "py",
      source: "DENEME_TAVAN = 1\n\n\ndef arac(ad):\n    if ad == \"kirik\":\n        return {\"ok\": False, \"hata\": \"zaman asimi\"}\n    if ad == \"yedek\":\n        return {\"ok\": True, \"deger\": 18}\n    if ad == \"stok\":\n        return {\"ok\": True, \"deger\": 18}\n    return {\"ok\": False, \"hata\": \"bilinmeyen\"}\n\n\ndef yansit(hata):\n    if \"zaman\" in hata:\n        return \"yedek\"\n    return None\n\n\ndef calistir(ad, deneme=0):\n    sonuc = arac(ad)\n    if sonuc[\"ok\"]:\n        return sonuc[\"deger\"]\n    if deneme >= DENEME_TAVAN:\n        raise ValueError(\"onarilamadi; islem durur\")\n    yedek = yansit(sonuc[\"hata\"])\n    if yedek is None:\n        raise ValueError(\"yol yok; islem durur\")\n    return calistir(yedek, deneme + 1)\n\n\nassert calistir(\"stok\") == 18\nassert calistir(\"kirik\") == 18\ntry:\n    calistir(\"yok\")\nexcept ValueError as hata:\n    assert \"yol yok\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-3",
    order: 3,
    title: "Ajan Güvenliği ve Guardrails (Prompt Injection ve Yetkisiz Eylem Engelleyiciler)",
    intro: "Hoş geldiniz. Bu bölümde Ajan Güvenliği ve Guardrails (Prompt Injection ve Yetkisiz Eylem Engelleyiciler) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Güvenlik korkuluğu (Guardrails) izinli araç listesi, tarama ve varsayılan reddir. Fail-closed (Hata Anında Kapalı) «aç» uydurmaz. Korkuluk yoksa ajan elini uzatır. Siz bu derste varsayılan kilidi mühürlüyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Kayıt dışı araç adı çağrıdan önce durmalıdır. İzin listesi dışındaki ad yetkisiz eylemdir; işlem durur. Tarif ezme parçası taramada kesilir. Varsayılan açık kapı değildir; varsayılan kilitlidir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere liste dışı ad durur, ezme cümlesi durur. Bu saldırı tarifi değildir; kapıyı gösterir. `IZINLI` dışındaki ad düşer. Yasak parça metindeyse üretim tarifi enjeksiyonu (Prompt Injection) kapısı kapanır. Ağ yoktur, sömürü yoktur. Listede yoksa kırmızı lamba yanar.",
    summary: "Bu dersle Ajan Güvenliği ve Guardrails (Prompt Injection ve Yetkisiz Eylem Engelleyiciler) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Korkuluk: liste, tarama, kilit. Yetkisiz ad durur, ezme cümlesi durur, varsayılan kilitlidir. Bir sonraki bölümde sizi ajan izleme, günlük ve değerlendirme barajı bekliyor.",
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
    code: {
      language: "py",
      source: "IZINLI = {\"stok_oku\"}\nYASAK_PARCA = (\"tarifi yoksay\", \"yetkiyi ac\")\n\n\ndef tarama(metin):\n    kucuk = metin.lower()\n    for parca in YASAK_PARCA:\n        if parca in kucuk:\n            raise ValueError(\"enjeksiyon; islem durur\")\n    return metin\n\n\ndef arac_cagir(ad, metin):\n    tarama(metin)\n    if ad not in IZINLI:\n        raise ValueError(\"yetkisiz eylem; islem durur\")\n    return 18\n\n\nassert arac_cagir(\"stok_oku\", \"Ankara stok\") == 18\ntry:\n    arac_cagir(\"sil_tablo\", \"Ankara\")\nexcept ValueError as hata:\n    assert \"yetkisiz\" in str(hata)\ntry:\n    arac_cagir(\"stok_oku\", \"tarifi yoksay\")\nexcept ValueError as hata:\n    assert \"enjeksiyon\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-4",
    order: 4,
    title: "Ajan Performans İzleme, Logging ve Evaluation (Evals)",
    intro: "Hoş geldiniz. Bu bölümde Ajan Performans İzleme, Logging ve Evaluation (Evals) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Değerlendirme seti (Evals) beklenen ile çıkanı karşılaştırır. Eşleşmezse Fail-closed (Hata Anında Kapalı) barajı keser; ajan üretime inmez. Günlük iz tutar; Kişisel Gizli Veriler (PII) satıra yazılmaz. Siz bu derste teraziyi mühürlüyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Log’a isim ve telefon gömerseniz saha sızar. İz `soru_id` ve `gecti` taşır, vesikalık taşımaz. Barajsız «muhtemelen doğru» yeşil ışık değildir. Tek altın satır kırılırsa set durur; yarım rapor yoktur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere altın küme kırık satırda durur ve PII yazılmaz. `degerlendir` beklenenle çıkanı karşılaştırır. Eşleşmezse eval baraji durur. Kayıt yalnız soru anahtarı ve gecti bayrağıdır. Üretim izi eval’den ayrı durur: eval kapı, iz kuledir.",
    summary: "Bu dersle Ajan Performans İzleme, Logging ve Evaluation (Evals) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Altın küme, baraj ve PII yasağı durur. Kırık satır üretime inmez, günlük vesikalık taşımaz. Bir sonraki bölümde sizi üretim ajan servisi ve eşzamansız işçi mimarisi bekliyor.",
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
    code: {
      language: "py",
      source: "ALTIN = [\n    {\"soru\": \"Ankara\", \"beklenen\": 18},\n    {\"soru\": \"Mars\", \"beklenen\": \"durur\"},\n]\n\n\ndef ajan(soru):\n    if soru == \"Mars\":\n        return \"durur\"\n    if soru == \"Ankara\":\n        return 18\n    return \"uydurma\"\n\n\ndef degerlendir(kume):\n    kayit = []\n    for satir in kume:\n        cikan = ajan(satir[\"soru\"])\n        gecti = cikan == satir[\"beklenen\"]\n        kayit.append({\"soru\": satir[\"soru\"], \"gecti\": gecti})\n        if not gecti:\n            raise ValueError(\"eval baraji; islem durur\")\n    return kayit\n\n\nassert degerlendir(ALTIN)[0][\"gecti\"] is True\nassert degerlendir(ALTIN)[1][\"gecti\"] is True\ntry:\n    degerlendir(ALTIN + [{\"soru\": \"Izmir\", \"beklenen\": 7}])\nexcept ValueError as hata:\n    assert \"eval\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-5",
    order: 5,
    title: "Production-Ready Ajan Servisleri (FastAPI ve Async Worker Mimarisi)",
    intro: "Hoş geldiniz. Bu bölümde Production-Ready Ajan Servisleri (FastAPI ve Async Worker Mimarisi) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Hızlı Uygulama Programlama Arayüzü (FastAPI) kapıdır; işçi kuyruğu damgalar. Fail-closed (Hata Anında Kapalı): bilinmeyen rota içeri girmez, kuyruk tavanı dolunca mektup sessiz silinmez — durur. Siz bu derste kapı ile işçiyi ayırıyorsunuz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. İstek işçi bitmeden 200 basarsanız «bitti» yalanı doğar. Kapı `kabul` basar, sonuç işçiden gelir. Kayıt dışı rota 200 uydurmaz. Tavan dolunca sessiz silme yoktur; işlem durur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere kapı kabul basar, işçi damgalar, rota yoksa durur. Bu sahte FastAPI paketi değildir; kapı-kuyruk fiziğini gösterir. `kuyruk_ekle` izinli işi alır. `isci` damgalar. Ağ yoktur. `kabul` ile `bitti` aynı fiş değildir: kapı kuyruğa alır, işçi damgalar.",
    summary: "Bu dersle Production-Ready Ajan Servisleri (FastAPI ve Async Worker Mimarisi) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kapı, kuyruk, işçi. Bilinmeyen rota durur, tavan durur, sonuç işçiden gelir. Bir sonraki bölümde sizi üretim ortamına hazır, korkuluklu ve kendi hatalarını onaran otonom ajan bekliyor.",
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
    code: {
      language: "py",
      source: "KAYIT = []\nTAVAN = 3\nIZINLI_IS = {\"stok_oku\"}\n\n\ndef kuyruk_ekle(is_adi, govde):\n    if is_adi not in IZINLI_IS:\n        raise ValueError(\"rota yok; islem durur\")\n    if len(KAYIT) >= TAVAN:\n        raise ValueError(\"kuyruk dolu; islem durur\")\n    KAYIT.append({\"is\": is_adi, \"govde\": govde, \"durum\": \"beklemede\"})\n    return \"kabul\"\n\n\ndef isci():\n    if not KAYIT:\n        raise ValueError(\"kuyruk bos; islem durur\")\n    istek = KAYIT[0]\n    if istek[\"is\"] not in IZINLI_IS:\n        raise ValueError(\"yetkisiz is; islem durur\")\n    istek[\"durum\"] = \"bitti\"\n    istek[\"sonuc\"] = 18\n    return istek\n\n\nassert kuyruk_ekle(\"stok_oku\", {\"sehir\": \"Ankara\"}) == \"kabul\"\nassert isci()[\"sonuc\"] == 18\nassert isci()[\"durum\"] == \"bitti\"\ntry:\n    kuyruk_ekle(\"sil_hersey\", {})\nexcept ValueError as hata:\n    assert \"rota\" in str(hata)",
    },
  }),
  academyInstructorLessonDraft({
    key: "ai-agent-ileri-6",
    order: 6,
    title: "Mini Proje: Üretim Ortamına Hazır, Güvenlik Korumalı ve Kendi Hatalarını Onaran Otonom Ajan Sistemi",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Üretim Ortamına Hazır, Güvenlik Korumalı ve Kendi Hatalarını Onaran Otonom Ajan Sistemi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Çizelge tavanı, bir yansıma, korkuluk, altın satır ve kuyruk tek `calistir` içinde durur. Ağ yoktur: sahte «canlı model» iddiası taşımaz. Siz kapıları mühürlersiniz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ezme cümlesi, kayıt dışı araç, kırık yedek ve boş kuyruk ayrı kapılardır. Çökmek isimsiz olmaz; ValueError isimlidir. Orta rapor yoktur. `calistir` taramadan geçer, çizelgeden yürür, kırıkta bir kez onarır, kuyruğa kabul basar.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere tarama, yürütme, onarım ve kuyruk aynı gövdede durur. Bu İleri kapanıştır. `tarama` ezmeyi keser. `yurut` tavanı sayar. `onar` bir yedek dener. `kuyruk_ekle` rota ister. Oda canlı modele bağlı değildir; kapılar sahte ağ olmadan görünür. Canlı model yarın aynı tavan, korkuluk ve teraziyi doldurur; siz bugün odayı mühürlediniz. Sınavda sizi baraj 70 bekler; belge yalnız o kapıdan basılır.",
    summary: "Bu dersle Mini Proje: Üretim Ortamına Hazır, Güvenlik Korumalı ve Kendi Hatalarını Onaran Otonom Ajan Sistemi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. İleri kapanış: çizelge, yedek, korkuluk, terazi, kuyruk. Çizelge tavanda, onarım bir kez, korkuluk kilitli, eval barajı, kapı kuyruğa alır. Sınavda sizi baraj 70 bekler; belge yalnız o kapıdan basılır.",
    quiz: [
      mcq(
        "q_agi6_1",
        "Mini projedeki oda ağa çıkar mı?",
        ["Evet, zorunlu model", "Hayır; kapılar sahte ağsız görünür", "Yalnız GPU", "JSON ağı açar"],
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
    code: {
      language: "py",
      source: "IZINLI = {\"stok_oku\"}\nYASAK = (\"tarifi yoksay\",)\nTAVAN = 4\nKAYIT = []\n\n\ndef tarama(metin):\n    for parca in YASAK:\n        if parca in metin.lower():\n            raise ValueError(\"enjeksiyon; islem durur\")\n    return metin\n\n\ndef yurut(arac, adim=0):\n    if adim > TAVAN:\n        raise ValueError(\"tur tavani; islem durur\")\n    if arac not in IZINLI:\n        raise ValueError(\"yetkisiz eylem; islem durur\")\n    return 18\n\n\ndef onar(arac, deneme=0):\n    try:\n        return yurut(arac)\n    except ValueError as hata:\n        if \"yetkisiz\" in str(hata):\n            raise\n        if deneme >= 1:\n            raise ValueError(\"onarilamadi; islem durur\")\n        return onar(\"stok_oku\", 1)\n\n\ndef kuyruk_ekle(arac, metin):\n    tarama(metin)\n    if len(KAYIT) >= 3:\n        raise ValueError(\"kuyruk dolu; islem durur\")\n    deger = onar(arac)\n    KAYIT.append(deger)\n    return {\"durum\": \"kabul\", \"sonuc\": deger}\n\n\ndef calistir(arac, metin):\n    return kuyruk_ekle(arac, metin)\n\n\nassert calistir(\"stok_oku\", \"Ankara\")[\"sonuc\"] == 18\ntry:\n    calistir(\"sil_tablo\", \"Ankara\")\nexcept ValueError as hata:\n    assert \"yetkisiz\" in str(hata)\ntry:\n    calistir(\"stok_oku\", \"tarifi yoksay\")\nexcept ValueError as hata:\n    assert \"enjeksiyon\" in str(hata)",
    },
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
