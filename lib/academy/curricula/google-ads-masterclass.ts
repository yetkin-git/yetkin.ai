/**
 * Google Ads ve Arama Motoru Pazarlaması Masterclass (GADS-MC) — mühürlü müfredat.
 * PEDAGOJI.md: tekil Masterclass, 4 perde, tek eğitmen, Fail-Closed.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — dönüşümsüz harcama yok; tCPA 30 / tROAS 50.
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

export const GOOGLE_ADS_MASTERCLASS_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "google-ads-masterclass-1",
    order: 1,
    title: "Google Ads Mantığı ve Hesap Kurulum Mimarisi",
    intro: "Hoş geldiniz. Bu bölümde Google Ads Mantığı ve Hesap Kurulum Mimarisi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen pazarda yanlış caddeye tabela astın mı. Geçen bakıyor, kasa susuyor. Tabela parası yine gidiyor. Kapı neresi. Tabela Google Ads hesabıdır. Kampanya, reklam grubu, reklam o tabelanın katıdır. Fail-closed (Hata Anında Kapalı): dönüşüm eylemi yoksa harcama açılmaz; fatura yoksa hesap durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekran yeşil, tıklama yağıyor. Kasa boş. Bütçe yine doğru mu. Yanlış. Dönüşüm eylemi yokken tıklama ciro değildir. Smart Bidding (Akıllı Teklif) o yalanı büyütür. Fail-closed: dönüşüm adı boşsa kampanya durur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Hesap kapısını yaz. Dönüşümsüz bütçeyi bir kez kır. Hesap > kampanya > grup > reklam. Dönüşüm eylemi hesapta durur, kampanyadan önce. Fatura ve zaman dilimi boşsa tabela asılmaz. Tıklama sayacı kasa değildir. Dönüşüm yokken «tıklama gelsin» diye bütçe açarsak. Tabela boş caddeye bakar. Fail-closed dönüşüm yoksa harcama durur. Sonraki bölümde seni eşleme türü bekliyor.",
    summary: "Bu dersle Google Ads Mantığı ve Hesap Kurulum Mimarisi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Hesap katı, dönüşüm önce, fatura durmadan tabela yok. Sonraki adım. Tabela durunca kelime kapısına geçeriz. Bir sonraki bölümde seni geniş, sıralı ve tam eşleme bekliyor.",
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
    code: {
      language: "ts",
      source: "function kampanyaAc(girdi: { donusumEylemi: string; fatura: boolean }): \"acik\" {\n  if (!girdi.donusumEylemi.trim()) throw new Error(\"dönüşüm yok; harcama durur\");\n  if (!girdi.fatura) throw new Error(\"fatura yok; hesap durur\");\n  return \"acik\";\n}\nif (kampanyaAc({ donusumEylemi: \"satin_alma\", fatura: true }) !== \"acik\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "google-ads-masterclass-2",
    order: 2,
    title: "Anahtar Kelime Stratejileri ve Eşleme Türleri (Geniş, Sıralı, Tam)",
    intro: "Hoş geldiniz. Bu bölümde Anahtar Kelime Stratejileri ve Eşleme Türleri (Geniş, Sıralı, Tam) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Tezgâhta «ayakkabı» tabelası var. Gelen «uçak bileti» soruyor. Sen her soruya cevap mı veriyorsun. Geniş eşleme o açık tabeladır. Sıralı eşleme anlamı içerir. Tam eşleme niyeti kilitler. Fail-closed: dönüşüm yokken geniş eşleme Smart Bidding’siz açılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Geniş eşleme, dönüşüm sıfır, bütçe Max Clicks. Ekran yeşil. Ne patlar. İlgisiz sorgu tıklamayı yer. Fail-closed: son 30 günde 30 dönüşüm yokken tCPA açılmaz; tROAS 50 ister. Geniş eşleme negatif listesiz durur. Boş anahtar da durur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Eşleme kapısını yaz. Dönüşümsüz geniş eşlemeyi kır. Tam eşleme yakın varyantı alır, yabancı niyeti almaz. Sıralı eşleme anlamı taşır; kelime sırası tek kanıt değildir. Geniş eşleme negatif ve 30 dönüşüm ister; tROAS ayrıca 50 ister. «tam» deyip her sorguyu yakın sayarsak. Yabancı niyet tam eşleme değildir. Fail-closed niyet sapınca anahtar durur. Sonraki bölümde seni arama ve görüntülü ağ bekliyor.",
    summary: "Bu dersle Anahtar Kelime Stratejileri ve Eşleme Türleri (Geniş, Sıralı, Tam) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Geniş dönüşüm ister, sıralı anlam, tam niyet. Sonraki adım ağ mı. Kelime durunca ağ kapısına geçeriz. Bir sonraki bölümde seni Arama Ağı ve Görüntülü Reklam bekliyor.",
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
    code: {
      language: "ts",
      source: "type Esleme = \"genis\" | \"sirali\" | \"tam\";\nfunction eslemeAc(esleme: Esleme, donusum30: number, negatif: boolean): Esleme {\n  if (esleme === \"genis\") {\n    if (donusum30 < 30) throw new Error(\"dönüşüm yok; geniş durur\");\n    if (!negatif) throw new Error(\"negatif yok; geniş durur\");\n  }\n  return esleme;\n}\nif (eslemeAc(\"tam\", 0, false) !== \"tam\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "google-ads-masterclass-3",
    order: 3,
    title: "Arama Ağı ve Görüntülü Reklam Kampanyası Oluşturma",
    intro: "Hoş geldiniz. Bu bölümde Arama Ağı ve Görüntülü Reklam Kampanyası Oluşturma konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Cadde tabelası sorana cevap verir. Duvar ilanı her geçene bakar. Sen ikisini aynı kasaya mı yazıyorsun. Arama Ağı soru, Görüntülü Ağı bakıştır. İkisi ayrı kampanyadır. Fail-closed: dönüşüm yoksa ikisi de açılmaz; bakışı satış sanmak yalandır.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Tek kampanyada arama + görüntülü, hedef «satış». Tıklama var, kasa yok. Ne kırılır. Ağ karışır, niyet kaybolur. Görüntülü gösterim satış sayılmaz. Fail-closed: ağ tipi boşsa kampanya durur. Dönüşüm eylemi yoksa bütçe durur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Ağ kapısını yaz. Karışık ağı ve dönüşümsüz bakışı kır. Arama niyet kampanyasıdır. Görüntülü ayrı bütçe ve sıklık ister. Aynı reklam grubunda iki ağ yok. Dönüşüm yokken görüntülüyü «satış» diye boyama. Görüntülü bakışı ciro diye raporlarsak. Bakış kasa değildir. Fail-closed dönüşüm yoksa görüntülü satış basmaz. Sonraki bölümde seni GTM bağı bekliyor.",
    summary: "Bu dersle Arama Ağı ve Görüntülü Reklam Kampanyası Oluşturma becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Ayrı ağ, ayrı bütçe, dönüşüm önce. Sonraki adım etiket mi. Ağ durunca ölçü kapısına ineriz. Bir sonraki bölümde seni dönüşüm takibi ve Google Etiket Yöneticisi bekliyor.",
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
    code: {
      language: "ts",
      source: "type Ag = \"arama\" | \"goruntulu\";\nfunction agAc(ag: Ag, donusum: boolean, karisik: boolean): Ag {\n  if (!donusum) throw new Error(\"dönüşüm yok; kampanya durur\");\n  if (karisik) throw new Error(\"ağ karışır; işlem durur\");\n  return ag;\n}\nif (agAc(\"arama\", true, false) !== \"arama\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "google-ads-masterclass-4",
    order: 4,
    title: "Dönüşüm Takibi (Conversion Tracking) ve Google Tag Manager Bağlantısı",
    intro: "Hoş geldiniz. Bu bölümde Dönüşüm Takibi (Conversion Tracking) ve Google Tag Manager Bağlantısı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kasa fişi yokken tezgâh «bugün 40 satış» diyor. Sen o sayıyı müdüre uzatır mısın. Uzamazsın. Dönüşüm Takibi o fiştir. Google Etiket Yöneticisi (GTM) fişi teşekkür sayfasına bağlar. Fail-closed: GTM yok, teşekkür yok veya sipariş id yoksa etiket durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Etiket ana sayfada patlıyor, sipariş id yok. Smart Bidding yeşil. Ne yalan. Her sayfa yükü satış sayılır. Çift sayım bütçeyi şişirir. Fail-closed: teşekkür + sipariş id durmadan dönüşüm uydurulmaz. tCPA o yalanı öğrenir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Etiket kapısını yaz. Ana sayfa tetik ve boş sipariş id’yi kır. GTM kapsayıcı yayınlanır. Tetik teşekkür URL’sidir, ana sayfa değil. purchase olayında transaction_id durur. Yoksa Fail-closed etiket basılmaz. Etiket kırıkken bütçeyi ikiye katlarsak. Yalan öğrenilir. Fail-closed etiket durmadan Smart Bidding açılmaz. Sonraki bölümde seni reklam metni ve kalite puanı bekliyor.",
    summary: "Bu dersle Dönüşüm Takibi (Conversion Tracking) ve Google Tag Manager Bağlantısı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. GTM, teşekkür, sipariş id. Sonraki adım metin mi. Fiş durunca tabela yazısına geçeriz. Bir sonraki bölümde seni reklam metni ve Kalite Puanı bekliyor.",
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
    code: {
      language: "ts",
      source: "function etiketDogrula(girdi: { gtm: boolean; tesekkur: boolean; siparisId: string }): \"hazir\" {\n  if (!girdi.gtm) throw new Error(\"GTM yok; etiket durur\");\n  if (!girdi.tesekkur) throw new Error(\"teşekkür yok; dönüşüm uydurulmaz\");\n  if (!girdi.siparisId.trim()) throw new Error(\"sipariş id yok; çift sayım durur\");\n  return \"hazir\";\n}\nif (etiketDogrula({ gtm: true, tesekkur: true, siparisId: \"S-41\" }) !== \"hazir\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "google-ads-masterclass-5",
    order: 5,
    title: "Reklam Metni Yazımı ve Kalite Puanı (Quality Score) Optimizasyonu",
    intro: "Hoş geldiniz. Bu bölümde Reklam Metni Yazımı ve Kalite Puanı (Quality Score) Optimizasyonu konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Tabelada «en iyi» yazıyor, vitrinde başka ürün. Gelen kızıyor. Sen o tabelayı büyütür müsün. Kalite Puanı (Quality Score) o uyumdur: beklenen tıklama, reklam ilgisi, açılış. Fail-closed: puan 5 altı veya dönüşüm yokken bütçe artmaz. Boş başlık da durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. QS 3, dönüşüm yok, bütçe iki kat. Ekran yine yeşil. Ne kırılır. Düşük puan tıklamayı pahalılar. Metin anahtarla uymazsa ilgi düşer. Fail-closed: QS < 5 iken ölçek durur. Dönüşüm yokken metin «satış» iddiası taşımaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Puan kapısını yaz. Düşük QS ve boş başlığı kır. Duyarlı Arama Ağı Reklamı (RSA) başlık ve açıklama pini ister. Pin yoksa Google karıştırır; anahtar başlıkta durmalı. Açılış vaadi reklamla aynıdır. «en iyi» deyip anahtarı başlıktan düşürürsek. İlgi kırılır. Fail-closed boş veya ilgisiz başlık durur. Sonraki bölümde seni mini kampanya teslimi bekliyor.",
    summary: "Bu dersle Reklam Metni Yazımı ve Kalite Puanı (Quality Score) Optimizasyonu becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Başlık, açılış, QS 5+, dönüşüm. Sonraki adım proje mi. Puan durunca sahaya ineriz. Bir sonraki bölümde seni yüksek dönüşümlü kampanya kurma bekliyor.",
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
    code: {
      language: "ts",
      source: "function kaliteAc(girdi: { qs: number; donusum: boolean; baslik: string }): number {\n  if (!girdi.baslik.trim()) throw new Error(\"başlık yok; reklam durur\");\n  if (!girdi.donusum) throw new Error(\"dönüşüm yok; ölçek durur\");\n  if (girdi.qs < 5) throw new Error(\"kalite düşük; bütçe artmaz\");\n  return girdi.qs;\n}\nif (kaliteAc({ qs: 7, donusum: true, baslik: \"klima servisi\" }) !== 7) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "google-ads-masterclass-6",
    order: 6,
    title: "Mini Proje: Gerçek Bir Hizmet/Ürün İçin Yüksek Dönüşümlü Google Ads Kampanyası Kurma",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Gerçek Bir Hizmet/Ürün İçin Yüksek Dönüşümlü Google Ads Kampanyası Kurma konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Hizmet tabelası duruyor: klima servisi. Sen müdüre hangi kampanyayı uzatırsın — dönüşümsüz tıklama mı. Dört kapı durmadan uzatmazsın. Dönüşüm/GTM, eşleme, ağ ayrımı, kalite. Fail-closed bir kapı açıkken teslim basılmaz. Bu iskelet canlı Ads hesabı iddiası taşımaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekranda grafik parlıyor, etiket kırık. İş bitmiş mi sayılıyor. Parıltı yalandır. Dönüşüm yok, geniş eşleme, karışık ağ, QS 3 — biri duruyorsa mühür vurulmaz. Kampanya kaynakla aynı defterdir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek fonksiyon: dönüşüm, etiket, eşleme, QS. Biri kırıkken dur. `kampanyaTeslim` dört kapıyı sırayla sorar. GTM/teşekkür yoksa durur. Geniş eşleme 30 dönüşümsüz durur. Karışık ağ durur. QS < 5 durur. Hepsi durunca «hazir» basılır. Bu iskelet canlı Google Ads hesabına bağlı mı. Sınavda ne ölçülür. Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: ölçü, eşleme, ağ, kalite.",
    summary: "Bu dersle Mini Proje: Gerçek Bir Hizmet/Ürün İçin Yüksek Dönüşümlü Google Ads Kampanyası Kurma becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Masterclass kapanış bu mu: hesap, eşleme, ağ, GTM, QS, teslim, sınava gir. Bu. Tekil Masterclass halkası kapanır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
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
    code: {
      language: "ts",
      source: "function kampanyaTeslim(girdi: {\n  donusum: boolean;\n  etiket: boolean;\n  esleme: \"genis\" | \"sirali\" | \"tam\";\n  donusum30: number;\n  karisikAg: boolean;\n  qs: number;\n}): \"hazir\" {\n  if (!girdi.donusum || !girdi.etiket) throw new Error(\"ölçü yok; harcama durur\");\n  if (girdi.esleme === \"genis\" && girdi.donusum30 < 30) throw new Error(\"geniş durur\");\n  if (girdi.karisikAg) throw new Error(\"ağ karışır\");\n  if (girdi.qs < 5) throw new Error(\"kalite düşük\");\n  return \"hazir\";\n}\nif (\n  kampanyaTeslim({\n    donusum: true,\n    etiket: true,\n    esleme: \"tam\",\n    donusum30: 0,\n    karisikAg: false,\n    qs: 7,\n  }) !== \"hazir\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
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
