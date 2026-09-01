/**
 * Google Ads ve Arama Motoru Pazarlaması Masterclass (GADS-MC) — mühürlü müfredat.
 * PEDAGOJI.md: tekil Masterclass, 4 perde, tek eğitmen, Fail-Closed.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — dönüşümsüz harcama yok; tCPA 30 / tROAS 50.
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

const tarik = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("tarik", text, code);
const gozde = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("gozde", text, code);

export const GOOGLE_ADS_MASTERCLASS_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "google-ads-masterclass-1",
    order: 1,
    title: "Google Ads Mantığı ve Hesap Kurulum Mimarisi",
    dialogue: {
      warmup: [
        tarik(
          "Sen pazarda yanlış caddeye tabela astın mı? Geçen bakıyor, kasa susuyor. Tabela parası yine gidiyor. Kapı neresi?",
        ),
        gozde(
          "Tabela Google Ads hesabıdır. Kampanya, reklam grubu, reklam o tabelanın katıdır. Fail-closed (Hata Anında Kapalı): dönüşüm eylemi yoksa harcama açılmaz; fatura yoksa hesap durur.",
        ),
      ],
      problem: [
        tarik("Ekran yeşil, tıklama yağıyor. Kasa boş. Bütçe yine doğru mu?"),
        gozde(
          "Yanlış. Dönüşüm eylemi yokken tıklama ciro değildir. Smart Bidding (Akıllı Teklif) o yalanı büyütür. Fail-closed: dönüşüm adı boşsa kampanya durur.",
        ),
      ],
      development: [
        tarik("Hesap kapısını yaz. Dönüşümsüz bütçeyi bir kez kır."),
        gozde(
          "Hesap > kampanya > grup > reklam. Dönüşüm eylemi hesapta durur, kampanyadan önce. Fatura ve zaman dilimi boşsa tabela asılmaz. Tıklama sayacı kasa değildir.",
          {
            language: "ts",
            source: `function kampanyaAc(girdi: { donusumEylemi: string; fatura: boolean }): "acik" {
  if (!girdi.donusumEylemi.trim()) throw new Error("dönüşüm yok; harcama durur");
  if (!girdi.fatura) throw new Error("fatura yok; hesap durur");
  return "acik";
}
if (kampanyaAc({ donusumEylemi: "satin_alma", fatura: true }) !== "acik") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Dönüşüm yokken «tıklama gelsin» diye bütçe açarsak?"),
        gozde(
          "Tabela boş caddeye bakar. Fail-closed dönüşüm yoksa harcama durur. Sonraki bölümde seni eşleme türü bekliyor.",
        ),
      ],
      conclusion: [
        tarik("Hesap katı, dönüşüm önce, fatura durmadan tabela yok. Sonraki adım?"),
        gozde(
          "Tabela durunca kelime kapısına geçeriz. Bir sonraki bölümde seni geniş, sıralı ve tam eşleme bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_gads1_1",
        "Google Ads hesabında kampanya açılmadan önce ne durur?",
        ["Renkli logo", "Dönüşüm eylemi ve fatura; yoksa harcama açılmaz", "Yalnız tıklama hedefi", "Görüntülü ağ"],
        1,
      ),
      mcq(
        "q_gads1_2",
        "Fail-closed dönüşüm eylemi boşken ne yapar?",
        ["Tıklama yeter sayılır", "İşlemi durdurur; bütçe uydurulmaz", "Smart Bidding açar", "Display’e düşer"],
        1,
      ),
      mcq(
        "q_gads1_3",
        "Hesap mimarisinde doğru kat sırası nedir?",
        ["Reklam > hesap > grup", "Hesap > kampanya > reklam grubu > reklam", "Yalnız anahtar kelime", "Yalnız fatura"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "google-ads-masterclass-2",
    order: 2,
    title: "Anahtar Kelime Stratejileri ve Eşleme Türleri (Geniş, Sıralı, Tam)",
    dialogue: {
      warmup: [
        tarik(
          "Tezgâhta «ayakkabı» tabelası var. Gelen «uçak bileti» soruyor. Sen her soruya cevap mı veriyorsun?",
        ),
        gozde(
          "Geniş eşleme o açık tabeladır. Sıralı eşleme anlamı içerir. Tam eşleme niyeti kilitler. Fail-closed: dönüşüm yokken geniş eşleme Smart Bidding’siz açılmaz.",
        ),
      ],
      problem: [
        tarik("Geniş eşleme, dönüşüm sıfır, bütçe Max Clicks. Ekran yeşil. Ne patlar?"),
        gozde(
          "İlgisiz sorgu tıklamayı yer. Fail-closed: son 30 günde 30 dönüşüm yokken tCPA açılmaz; tROAS 50 ister. Geniş eşleme negatif listesiz durur. Boş anahtar da durur.",
        ),
      ],
      development: [
        tarik("Eşleme kapısını yaz. Dönüşümsüz geniş eşlemeyi kır."),
        gozde(
          "Tam eşleme yakın varyantı alır, yabancı niyeti almaz. Sıralı eşleme anlamı taşır; kelime sırası tek kanıt değildir. Geniş eşleme negatif ve 30 dönüşüm ister; tROAS ayrıca 50 ister.",
          {
            language: "ts",
            source: `type Esleme = "genis" | "sirali" | "tam";
function eslemeAc(esleme: Esleme, donusum30: number, negatif: boolean): Esleme {
  if (esleme === "genis") {
    if (donusum30 < 30) throw new Error("dönüşüm yok; geniş durur");
    if (!negatif) throw new Error("negatif yok; geniş durur");
  }
  return esleme;
}
if (eslemeAc("tam", 0, false) !== "tam") throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("«tam» deyip her sorguyu yakın sayarsak?"),
        gozde(
          "Yabancı niyet tam eşleme değildir. Fail-closed niyet sapınca anahtar durur. Sonraki bölümde seni arama ve görüntülü ağ bekliyor.",
        ),
      ],
      conclusion: [
        tarik("Geniş dönüşüm ister, sıralı anlam, tam niyet. Sonraki adım ağ mı?"),
        gozde(
          "Kelime durunca ağ kapısına geçeriz. Bir sonraki bölümde seni Arama Ağı ve Görüntülü Reklam bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_gads2_1",
        "Geniş eşleme dönüşüm hacmi yokken Fail-closed ne yapar?",
        ["Max Clicks yeter", "Açılmaz; 30 dönüşüm ve negatif ister", "Tam eşlemeye düşer", "Display düzeltir"],
        1,
      ),
      mcq(
        "q_gads2_2",
        "Sıralı eşleme (phrase) neyi ister?",
        ["Harf harf aynı sıra", "Sorgunun anahtar anlamını içermesini", "Yalnız geniş", "Yalnız Display"],
        1,
      ),
      mcq(
        "q_gads2_3",
        "Tam eşleme yabancı niyeti alır mı?",
        ["Evet, her yakın kelime", "Hayır; niyet sapınca anahtar durur", "Negatif yeter", "QS düzeltir"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "google-ads-masterclass-3",
    order: 3,
    title: "Arama Ağı ve Görüntülü Reklam Kampanyası Oluşturma",
    dialogue: {
      warmup: [
        tarik(
          "Cadde tabelası sorana cevap verir. Duvar ilanı her geçene bakar. Sen ikisini aynı kasaya mı yazıyorsun?",
        ),
        gozde(
          "Arama Ağı soru, Görüntülü Ağı bakıştır. İkisi ayrı kampanyadır. Fail-closed: dönüşüm yoksa ikisi de açılmaz; bakışı satış sanmak yalandır.",
        ),
      ],
      problem: [
        tarik("Tek kampanyada arama + görüntülü, hedef «satış». Tıklama var, kasa yok. Ne kırılır?"),
        gozde(
          "Ağ karışır, niyet kaybolur. Görüntülü gösterim satış sayılmaz. Fail-closed: ağ tipi boşsa kampanya durur. Dönüşüm eylemi yoksa bütçe durur.",
        ),
      ],
      development: [
        tarik("Ağ kapısını yaz. Karışık ağı ve dönüşümsüz bakışı kır."),
        gozde(
          "Arama niyet kampanyasıdır. Görüntülü ayrı bütçe ve sıklık ister. Aynı reklam grubunda iki ağ yok. Dönüşüm yokken görüntülüyü «satış» diye boyama.",
          {
            language: "ts",
            source: `type Ag = "arama" | "goruntulu";
function agAc(ag: Ag, donusum: boolean, karisik: boolean): Ag {
  if (!donusum) throw new Error("dönüşüm yok; kampanya durur");
  if (karisik) throw new Error("ağ karışır; işlem durur");
  return ag;
}
if (agAc("arama", true, false) !== "arama") throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("Görüntülü bakışı ciro diye raporlarsak?"),
        gozde(
          "Bakış kasa değildir. Fail-closed dönüşüm yoksa görüntülü satış basmaz. Sonraki bölümde seni GTM bağı bekliyor.",
        ),
      ],
      conclusion: [
        tarik("Ayrı ağ, ayrı bütçe, dönüşüm önce. Sonraki adım etiket mi?"),
        gozde(
          "Ağ durunca ölçü kapısına ineriz. Bir sonraki bölümde seni dönüşüm takibi ve Google Etiket Yöneticisi bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_gads3_1",
        "Arama Ağı ile Görüntülü Ağı aynı kampanyada?",
        ["Evet, hız için", "Yasaktır; ağ karışır, niyet kaybolur", "QS düzeltir", "Broad yeter"],
        1,
      ),
      mcq(
        "q_gads3_2",
        "Fail-closed dönüşüm yokken görüntülü satış raporu?",
        ["Gösterim cirodur", "Basılmaz; bakış kasa değildir", "tROAS açılır", "Tam eşleme yeter"],
        1,
      ),
      mcq(
        "q_gads3_3",
        "Arama kampanyası neyi satın alır?",
        ["Her bakışı", "Niyetli sorguyu; tabela sorana cevap verir", "Yalnız video", "Yalnız e-posta"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "google-ads-masterclass-4",
    order: 4,
    title: "Dönüşüm Takibi (Conversion Tracking) ve Google Tag Manager Bağlantısı",
    dialogue: {
      warmup: [
        tarik(
          "Kasa fişi yokken tezgâh «bugün 40 satış» diyor. Sen o sayıyı müdüre uzatır mısın?",
        ),
        gozde(
          "Uzamazsın. Dönüşüm Takibi o fiştir. Google Etiket Yöneticisi (GTM) fişi teşekkür sayfasına bağlar. Fail-closed: GTM yok, teşekkür yok veya sipariş id yoksa etiket durur.",
        ),
      ],
      problem: [
        tarik("Etiket ana sayfada patlıyor, sipariş id yok. Smart Bidding yeşil. Ne yalan?"),
        gozde(
          "Her sayfa yükü satış sayılır. Çift sayım bütçeyi şişirir. Fail-closed: teşekkür + sipariş id durmadan dönüşüm uydurulmaz. tCPA o yalanı öğrenir.",
        ),
      ],
      development: [
        tarik("Etiket kapısını yaz. Ana sayfa tetik ve boş sipariş id’yi kır."),
        gozde(
          "GTM kapsayıcı yayınlanır. Tetik teşekkür URL’sidir, ana sayfa değil. purchase olayında transaction_id durur. Yoksa Fail-closed etiket basılmaz.",
          {
            language: "ts",
            source: `function etiketDogrula(girdi: { gtm: boolean; tesekkur: boolean; siparisId: string }): "hazir" {
  if (!girdi.gtm) throw new Error("GTM yok; etiket durur");
  if (!girdi.tesekkur) throw new Error("teşekkür yok; dönüşüm uydurulmaz");
  if (!girdi.siparisId.trim()) throw new Error("sipariş id yok; çift sayım durur");
  return "hazir";
}
if (etiketDogrula({ gtm: true, tesekkur: true, siparisId: "S-41" }) !== "hazir") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Etiket kırıkken bütçeyi ikiye katlarsak?"),
        gozde(
          "Yalan öğrenilir. Fail-closed etiket durmadan Smart Bidding açılmaz. Sonraki bölümde seni reklam metni ve kalite puanı bekliyor.",
        ),
      ],
      conclusion: [
        tarik("GTM, teşekkür, sipariş id. Sonraki adım metin mi?"),
        gozde(
          "Fiş durunca tabela yazısına geçeriz. Bir sonraki bölümde seni reklam metni ve Kalite Puanı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_gads4_1",
        "Dönüşüm etiketi nerede patlar?",
        ["Her sayfada", "Teşekkür sayfasında; sipariş id ile", "Yalnız ana sayfada", "Display’de"],
        1,
      ),
      mcq(
        "q_gads4_2",
        "Fail-closed sipariş id boşken ne yapar?",
        ["Yine satış basar", "Etiketi durdurur; çift sayım açılmaz", "tROAS düzeltir", "GTM gizler"],
        1,
      ),
      mcq(
        "q_gads4_3",
        "Etiket kırıkken Smart Bidding?",
        ["Hızlı öğrenir", "Yasak; yalanı öğrenir, harcama durur", "Max Clicks yeter", "QS yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "google-ads-masterclass-5",
    order: 5,
    title: "Reklam Metni Yazımı ve Kalite Puanı (Quality Score) Optimizasyonu",
    dialogue: {
      warmup: [
        tarik(
          "Tabelada «en iyi» yazıyor, vitrinde başka ürün. Gelen kızıyor. Sen o tabelayı büyütür müsün?",
        ),
        gozde(
          "Kalite Puanı (Quality Score) o uyumdur: beklenen tıklama, reklam ilgisi, açılış. Fail-closed: puan 5 altı veya dönüşüm yokken bütçe artmaz. Boş başlık da durur.",
        ),
      ],
      problem: [
        tarik("QS 3, dönüşüm yok, bütçe iki kat. Ekran yine yeşil. Ne kırılır?"),
        gozde(
          "Düşük puan tıklamayı pahalılar. Metin anahtarla uymazsa ilgi düşer. Fail-closed: QS < 5 iken ölçek durur. Dönüşüm yokken metin «satış» iddiası taşımaz.",
        ),
      ],
      development: [
        tarik("Puan kapısını yaz. Düşük QS ve boş başlığı kır."),
        gozde(
          "Duyarlı Arama Ağı Reklamı (RSA) başlık ve açıklama pini ister. Pin yoksa Google karıştırır; anahtar başlıkta durmalı. Açılış vaadi reklamla aynıdır.",
          {
            language: "ts",
            source: `function kaliteAc(girdi: { qs: number; donusum: boolean; baslik: string }): number {
  if (!girdi.baslik.trim()) throw new Error("başlık yok; reklam durur");
  if (!girdi.donusum) throw new Error("dönüşüm yok; ölçek durur");
  if (girdi.qs < 5) throw new Error("kalite düşük; bütçe artmaz");
  return girdi.qs;
}
if (kaliteAc({ qs: 7, donusum: true, baslik: "klima servisi" }) !== 7) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("«en iyi» deyip anahtarı başlıktan düşürürsek?"),
        gozde(
          "İlgi kırılır. Fail-closed boş veya ilgisiz başlık durur. Sonraki bölümde seni mini kampanya teslimi bekliyor.",
        ),
      ],
      conclusion: [
        tarik("Başlık, açılış, QS 5+, dönüşüm. Sonraki adım proje mi?"),
        gozde(
          "Puan durunca sahaya ineriz. Bir sonraki bölümde seni yüksek dönüşümlü kampanya kurma bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_gads5_1",
        "Kalite Puanı üçlüsü nedir?",
        ["Renk, logo, fiyat", "Beklenen tıklama, reklam ilgisi, açılış sayfası", "Yalnız CPC", "Yalnız Display"],
        1,
      ),
      mcq(
        "q_gads5_2",
        "Fail-closed QS 5 altındayken bütçe?",
        ["İki kat açılır", "Artmaz; ölçek durur", "tROAS gizler", "Broad düzeltir"],
        1,
      ),
      mcq(
        "q_gads5_3",
        "RSA başlığında anahtar yoksa?",
        ["Google düzeltir", "İlgi düşer; Fail-closed boş başlık durur", "QS 10 basılır", "GTM yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "google-ads-masterclass-6",
    order: 6,
    title: "Mini Proje: Gerçek Bir Hizmet/Ürün İçin Yüksek Dönüşümlü Google Ads Kampanyası Kurma",
    dialogue: {
      warmup: [
        tarik(
          "Hizmet tabelası duruyor: klima servisi. Sen müdüre hangi kampanyayı uzatırsın — dönüşümsüz tıklama mı?",
        ),
        gozde(
          "Dört kapı durmadan uzatmazsın. Dönüşüm/GTM, eşleme, ağ ayrımı, kalite. Fail-closed bir kapı açıkken teslim basılmaz. Bu iskelet canlı Ads hesabı iddiası taşımaz.",
        ),
      ],
      problem: [
        tarik("Ekranda grafik parlıyor, etiket kırık. İş bitmiş mi sayılıyor?"),
        gozde(
          "Parıltı yalandır. Dönüşüm yok, geniş eşleme, karışık ağ, QS 3 — biri duruyorsa mühür vurulmaz. Kampanya kaynakla aynı defterdir.",
        ),
      ],
      development: [
        tarik("Tek fonksiyon: dönüşüm, etiket, eşleme, QS. Biri kırıkken dur."),
        gozde(
          "`kampanyaTeslim` dört kapıyı sırayla sorar. GTM/teşekkür yoksa durur. Geniş eşleme 30 dönüşümsüz durur. Karışık ağ durur. QS < 5 durur. Hepsi durunca «hazir» basılır.",
          {
            language: "ts",
            source: `function kampanyaTeslim(girdi: {
  donusum: boolean;
  etiket: boolean;
  esleme: "genis" | "sirali" | "tam";
  donusum30: number;
  karisikAg: boolean;
  qs: number;
}): "hazir" {
  if (!girdi.donusum || !girdi.etiket) throw new Error("ölçü yok; harcama durur");
  if (girdi.esleme === "genis" && girdi.donusum30 < 30) throw new Error("geniş durur");
  if (girdi.karisikAg) throw new Error("ağ karışır");
  if (girdi.qs < 5) throw new Error("kalite düşük");
  return "hazir";
}
if (
  kampanyaTeslim({
    donusum: true,
    etiket: true,
    esleme: "tam",
    donusum30: 0,
    karisikAg: false,
    qs: 7,
  }) !== "hazir"
) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Bu iskelet canlı Google Ads hesabına bağlı mı? Sınavda ne ölçülür?"),
        gozde(
          "Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: ölçü, eşleme, ağ, kalite.",
        ),
      ],
      conclusion: [
        tarik("Masterclass kapanış bu mu: hesap, eşleme, ağ, GTM, QS, teslim, sınava gir?"),
        gozde(
          "Bu. Tekil Masterclass halkası kapanır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_gads6_1",
        "Mini projedeki kampanya canlı Ads hesabı mıdır?",
        ["Evet, zorunlu hesap", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız Display", "Canlı fatura"],
        1,
      ),
      mcq(
        "q_gads6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "Tıklama yeter"],
        1,
      ),
      mcq(
        "q_gads6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Tabela açılınca"],
        1,
      ),
    ],
  }),
] as const;

const GOOGLE_ADS_MASTERCLASS_LESSON_QUIZZES: AcademyExamQuestion[] = GOOGLE_ADS_MASTERCLASS_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const GOOGLE_ADS_MASTERCLASS_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...GOOGLE_ADS_MASTERCLASS_LESSON_QUIZZES,
  mcq("q_gads_p1", "Tabela bu derste nedir?", ["Renk", "Google Ads hesabı ve kampanya katı", "Yalnız logo", "Display"], 1),
  mcq("q_gads_p2", "Tıklama ciro mudur?", ["Evet", "Hayır; dönüşüm yoksa harcama durur", "QS yeter", "Broad yeter"], 1),
  mcq("q_gads_p3", "Smart Bidding dönüşümsüz?", ["Hızlı öğrenir", "Yasak; yalanı öğrenir", "Max Clicks gizler", "PMax zorunlu"], 1),
  mcq("q_gads_p4", "Geniş eşleme 30 dönüşümsüz?", ["Açılır", "Fail-closed durur", "Tam’a düşer", "Display düzeltir"], 1),
  mcq("q_gads_p5", "Sıralı eşleme ne içerir?", ["Yalnız harf sırası", "Anahtar anlamını", "Her sorguyu", "Görüntülüyü"], 1),
  mcq("q_gads_p6", "Arama ve görüntülü aynı kampanya?", ["Evet", "Hayır; ağ karışır", "QS birleştirir", "GTM birleştirir"], 1),
  mcq("q_gads_p7", "Görüntülü bakış satış mıdır?", ["Evet", "Hayır; bakış kasa değildir", "tROAS basar", "Broad basar"], 1),
  mcq("q_gads_p8", "GTM tetik nerede?", ["Ana sayfa", "Teşekkür + sipariş id", "Her tıklama", "Display"], 1),
  mcq("q_gads_p9", "Sipariş id boşken etiket?", ["Yine basılır", "Durur; çift sayım açılmaz", "tCPA düzeltir", "QS düzeltir"], 1),
  mcq("q_gads_p10", "Kalite Puanı 5 altı ölçek?", ["İki kat bütçe", "Durur", "RSA gizler", "Fatura yeter"], 1),
  mcq("q_gads_p11", "RSA başlığında anahtar?", ["İsteğe bağlı", "İlgi için durur; boş başlık durur", "Google uydurur", "GTM yazar"], 1),
  mcq("q_gads_p12", "Mini proje teslimi ne zaman basılır?", ["Bir kapı yetince", "Dört kapı durunca", "Satın alınca", "Grafik yeşilince"], 1),
  mcq("q_gads_p13", "Bu iskelet canlı hesap mıdır?", ["Evet", "Hayır; kapı sözleşmesi", "Yalnız API", "MCC zorunlu"], 1),
  mcq("q_gads_p14", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
];
